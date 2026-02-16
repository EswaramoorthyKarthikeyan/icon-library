
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import IconGrid from './components/IconGrid.tsx';
import Inspector from './components/Inspector.tsx';
import Footer from './components/Footer.tsx';
import Playground from './components/Playground.tsx';
import Generator from './components/Generator.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { ICON_LIBRARY } from './constants.tsx';
import { ViewportSize, Weighting, TabType, IconData, AppSettings, Collection, IconAiMetadata, IconTransform } from './types.ts';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import JSZip from 'jszip';

// Exponential backoff helper for robust API handling
const withBackoff = async <T,>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('500');
      if (isRetryable && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  return await fn();
};

const App: React.FC = () => {
  const getInitialTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 7 && hour < 19) ? 'light' : 'dark';
  };

  // UI State
  const [viewportSize, setViewportSize] = useState<ViewportSize>(24);
  const [weighting, setWeighting] = useState<Weighting>('regular');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme());
  const [accentColor, setAccentColor] = useState<string>('');
  const [customFillColor, setCustomFillColor] = useState<string>('none');
  
  // Transformation State
  const [transform, setTransform] = useState<IconTransform>({
    rotate: 0,
    scale: 1,
    flipH: false,
    flipV: false
  });

  // AI State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  const [aiMetadataCache, setAiMetadataCache] = useState<Record<string, IconAiMetadata>>({});
  const [relatedIconsCache, setRelatedIconsCache] = useState<Record<string, string[]>>({});
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [synthesizedIcons, setSynthesizedIcons] = useState<Record<string, IconData[]>>({});
  const [synthesizingCategory, setSynthesizingCategory] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Selection & Collections State
  const [activeIconId, setActiveIconId] = useState<string | null>('nav-grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['nav-grid']));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Modal / Overlay States
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    showGrid: true,
    gridOpacity: 0.08,
    uiDensity: 'standard',
    autoExportFolders: true,
    primaryFont: 'Inter',
    monoFont: 'JetBrains Mono',
    semanticSearchEnabled: false,
    aiEnabled: true,
    namingValidationEnabled: false,
  });

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    if (!settings.aiEnabled) {
      if (activeTab === 'generator') setActiveTab('grid');
      setAiSearchResults(null);
      setAiMetadataCache({});
      setRelatedIconsCache({});
      setSynthesizedIcons({});
      setApiError(null);
    }
  }, [settings.aiEnabled, activeTab]);

  useEffect(() => {
    const saved = localStorage.getItem('core_ui_collections');
    if (saved) {
      try { setCollections(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('core_ui_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
    document.documentElement.style.setProperty('--system-accent', accentColor || defaultColor);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme, accentColor]);

  const allIcons = useMemo(() => {
    const core = Object.values(ICON_LIBRARY).flat();
    const synth = Object.values(synthesizedIcons).flat();
    return [...core, ...synth];
  }, [synthesizedIcons]);

  const activeIcon = useMemo(() => allIcons.find(i => i.id === activeIconId) || null, [activeIconId, allIcons]);

  // AI Semantic Search Effect
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (!settings.aiEnabled || !settings.semanticSearchEnabled || !searchQuery.trim() || searchQuery.length < 3) {
        setAiSearchResults(null);
        return;
      }

      setIsAiSearching(true);
      try {
        const result = await withBackoff(async () => {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const iconContext = allIcons.map(i => ({ id: i.id, name: i.name, category: i.category }));
          return await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Given a design system icon library and a user query, return an array of icon IDs that semantically match the user's intent. 
            User query: "${searchQuery}"
            Available Icons: ${JSON.stringify(iconContext.slice(0, 300))}`, // Pruned context for speed
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  matchedIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['matchedIds']
              }
            }
          });
        });

        const data = JSON.parse(result.text || '{"matchedIds": []}');
        setAiSearchResults(data.matchedIds);
        setApiError(null);
      } catch (e: any) {
        if (e?.message?.includes('429')) {
          setApiError("Rate limit exceeded. Check your Gemini API quota.");
        }
        console.error("Semantic search failed", e);
      } finally {
        setIsAiSearching(false);
      }
    };

    const timeout = setTimeout(performSemanticSearch, 800);
    return () => clearTimeout(timeout);
  }, [searchQuery, settings.semanticSearchEnabled, settings.aiEnabled, allIcons]);

  // AI Related Assets Logic
  useEffect(() => {
    const fetchRelated = async () => {
      if (!settings.aiEnabled || !activeIconId || relatedIconsCache[activeIconId]) return;
      const currentActive = allIcons.find(i => i.id === activeIconId);
      if (!currentActive) return;

      try {
        const result = await withBackoff(async () => {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          return await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 4 icon IDs from this library that are visually or conceptually related to "${currentActive.name}".
            Library: ${JSON.stringify(allIcons.slice(0, 100).map(i => ({ id: i.id, name: i.name })))}
            Return only the array of IDs.`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  relatedIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['relatedIds']
              }
            }
          });
        });
        const data = JSON.parse(result.text || '{"relatedIds": []}');
        setRelatedIconsCache(prev => ({ ...prev, [activeIconId]: data.relatedIds }));
        setApiError(null);
      } catch (e: any) { 
        if (e?.message?.includes('429')) setApiError("Rate limit reached.");
        console.error(e); 
      }
    };
    fetchRelated();
  }, [activeIconId, relatedIconsCache, settings.aiEnabled, allIcons]);

  // AI Metadata Effect
  useEffect(() => {
    const generateAiMetadata = async () => {
      if (!settings.aiEnabled || !activeIconId || aiMetadataCache[activeIconId] || isGeneratingMetadata) return;
      const currentActive = allIcons.find(i => i.id === activeIconId);
      if (!currentActive) return;
      setIsGeneratingMetadata(true);
      try {
        const result = await withBackoff(async () => {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          return await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Provide professional UI design insights for the icon "${currentActive.name}". Generate 4-6 semantic tags and a 1-sentence usage description.`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                },
                required: ['tags', 'description']
              }
            }
          });
        });
        const data = JSON.parse(result.text || '{"tags": [], "description": "No context available."}');
        setAiMetadataCache(prev => ({ ...prev, [activeIconId]: data }));
        setApiError(null);
      } catch (e: any) { 
        if (e?.message?.includes('429')) setApiError("AI Quota exceeded. Using local defaults.");
        console.error(e); 
      }
      finally { setIsGeneratingMetadata(false); }
    };
    generateAiMetadata();
  }, [activeIconId, aiMetadataCache, isGeneratingMetadata, settings.aiEnabled, allIcons]);

  const handleSynthesizeCategory = async (category: string) => {
    if (!settings.aiEnabled || synthesizingCategory) return;
    setSynthesizingCategory(category);
    try {
      const result = await withBackoff(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await ai.models.generateContent({
          model: 'gemini-3-pro-preview', 
          contents: `Generate 10 new, unique, professional vector icon concepts for the design system category "${category}". 
          Return a JSON object with a 'newIcons' array. Each icon should have a 'name' (lowercase) and a 'svgPath' (string for <path d="...">) suitable for a 24x24 viewBox.
          Focus on clean, simple geometric shapes typical of professional icons.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                newIcons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      svgPath: { type: Type.STRING }
                    },
                    required: ['name', 'svgPath']
                  }
                }
              },
              required: ['newIcons']
            }
          }
        });
      });
      
      const data = JSON.parse(result.text || '{"newIcons": []}');
      const newIconEntries: IconData[] = data.newIcons.map((icon: any, idx: number) => ({
        id: `gen-${category.toLowerCase()}-${Date.now()}-${idx}`,
        name: icon.name,
        category: category,
        svgPath: icon.svgPath,
        isSynthesized: true 
      }));

      setSynthesizedIcons(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newIconEntries]
      }));
      setApiError(null);
    } catch (e: any) {
      if (e?.message?.includes('429')) setApiError("Synthesis failed: Quota exhausted.");
      console.error("Synthesis failed", e);
    } finally {
      setSynthesizingCategory(null);
    }
  };

  const filteredIconsList = useMemo(() => {
    if (settings.aiEnabled && settings.semanticSearchEnabled && aiSearchResults !== null && searchQuery.trim()) {
      return allIcons.filter(icon => aiSearchResults.includes(icon.id));
    }
    let result = allIcons;
    if (activeCollectionId) {
      const col = collections.find(c => c.id === activeCollectionId);
      if (col) result = result.filter(icon => col.iconIds.includes(icon.id));
    } else if (selectedCategory) {
      result = allIcons.filter(icon => icon.category === selectedCategory);
    }
    if (searchQuery.trim() && (!settings.aiEnabled || !settings.semanticSearchEnabled)) {
      const q = searchQuery.toLowerCase();
      result = result.filter(icon => icon.name.toLowerCase().includes(q) || icon.id.toLowerCase().includes(q));
    }
    return result;
  }, [allIcons, searchQuery, selectedCategory, activeCollectionId, collections, settings.semanticSearchEnabled, aiSearchResults, settings.aiEnabled]);

  const categoriesToRender = useMemo(() => {
    const groups: Record<string, IconData[]> = {};
    const catsToProcess = (activeCollectionId || searchQuery.trim() || selectedCategory) 
      ? Array.from(new Set(filteredIconsList.map(i => i.category)))
      : Object.keys(ICON_LIBRARY);

    catsToProcess.forEach(cat => {
      const icons = filteredIconsList.filter(icon => icon.category === cat);
      if (icons.length > 0) groups[cat] = icons;
    });

    return groups;
  }, [filteredIconsList, searchQuery, selectedCategory, activeCollectionId]);

  const handleCopySpec = () => {
    if (!activeIcon) return;
    const meta = aiMetadataCache[activeIcon.id];
    const spec = `### ASSET SPECIFICATION: ${activeIcon.name.toUpperCase()}\n\n` +
      `- **UID:** ${activeIcon.id}\n` +
      `- **Category:** ${activeIcon.category}\n` +
      (settings.aiEnabled ? `- **Tags:** ${meta?.tags.join(', ') || 'N/A'}\n` : '') +
      (settings.aiEnabled ? `- **Usage:** ${meta?.description || 'N/A'}\n\n` : '\n') +
      `**Batch Transformations Applied:**\n` +
      `- Rotation: ${transform.rotate}°\n` +
      `- Scale: ${transform.scale}x\n` +
      `- Mirroring: ${transform.flipH ? 'Horizontal' : 'None'}, ${transform.flipV ? 'Vertical' : 'None'}\n\n` +
      `**SVG Path Data:**\n\`\`\`\n${activeIcon.svgPath}\n\`\`\``;
    
    navigator.clipboard.writeText(spec);
    alert("Full specification copied to clipboard in Markdown format.");
  };

  const handleExportSingle = (icon: IconData) => {
    const sw = weighting === 'bold' ? 3 : weighting === 'medium' ? 2 : 1.5;
    const transformStr = `rotate(${transform.rotate} 12 12) scale(${transform.scale}) ${transform.flipH ? 'translate(24 0) scale(-1 1)' : ''} ${transform.flipV ? 'translate(0 24) scale(1 -1)' : ''}`;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${customFillColor}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <g transform="${transformStr}"><path d="${icon.svgPath}" /></g>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const itemsToExport = selectedIds.size > 0 
      ? allIcons.filter(icon => selectedIds.has(icon.id))
      : allIcons;
    const zip = new JSZip();
    const sw = weighting === 'bold' ? 3 : weighting === 'medium' ? 2 : 1.5;
    
    itemsToExport.forEach(icon => {
      const transformStr = `rotate(${transform.rotate} 12 12) scale(${transform.scale}) ${transform.flipH ? 'translate(24 0) scale(-1 1)' : ''} ${transform.flipV ? 'translate(0 24) scale(1 -1)' : ''}`;
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${customFillColor}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <g transform="${transformStr}"><path d="${icon.svgPath}" /></g>
</svg>`;
      zip.file(`${settings.autoExportFolders ? icon.category + '/' : ''}${icon.name}.svg`, svgContent);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core_ui_export_${itemsToExport.length}_assets.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-screen bg-[#f1f3f6] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-[#e0e0e0] overflow-hidden transition-colors duration-300 ${settings.uiDensity === 'compact' ? 'density-compact' : ''}`}>
      <Sidebar 
        viewportSize={viewportSize} setViewportSize={setViewportSize}
        weighting={weighting} setWeighting={setWeighting}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory} setSelectedCategory={(c) => { setSelectedCategory(c); setActiveCollectionId(null); }}
        collections={collections} activeCollectionId={activeCollectionId}
        setActiveCollectionId={(id) => { setActiveCollectionId(id); setSelectedCategory(null); }}
        onDeleteCollection={(id) => setCollections(prev => prev.filter(c => c.id !== id))}
        accentColor={accentColor} setAccentColor={setAccentColor}
        selectedCount={selectedIds.size} onExport={handleExport}
        aiEnabled={settings.aiEnabled}
        semanticSearchEnabled={settings.semanticSearchEnabled} setSemanticSearchEnabled={(v) => handleUpdateSettings({ semanticSearchEnabled: v })}
        isAiSearching={isAiSearching}
        transform={transform} setTransform={setTransform}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <Header 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          matchCount={filteredIconsList.length} totalCount={allIcons.length}
          isSearching={searchQuery.trim() !== ''} selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onSelectAllFiltered={() => setSelectedIds(new Set(filteredIconsList.map(i => i.id)))}
          onCreateCollection={() => {
            const name = prompt("Name:");
            if (name) setCollections(prev => [...prev, { id: `c-${Date.now()}`, name, iconIds: Array.from(selectedIds), createdAt: Date.now() }]);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          aiEnabled={settings.aiEnabled}
        />

        {apiError && (
          <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-2 px-8 flex justify-between items-center z-[100] animate-in slide-in-from-top-full duration-300">
            <span>Alert: {apiError}</span>
            <div className="flex gap-4">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Check Quota</a>
              <button onClick={() => setApiError(null)}>Dismiss</button>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden w-full relative">
          <main className="flex-1 overflow-y-auto blueprint-grid relative" style={{ backgroundImage: settings.showGrid ? undefined : 'none', '--grid-opacity': settings.gridOpacity } as any}>
            <div className={`w-full max-w-[1400px] mx-auto ${settings.uiDensity === 'compact' ? 'p-6' : 'p-10'}`}>
              {activeTab === 'grid' && (
                Object.entries(categoriesToRender).map(([cat, icons], idx) => (
                  <IconGrid 
                    key={cat} title={cat} index={(idx+1).toString().padStart(2, '0')}
                    items={icons} itemCount={icons.length.toString()}
                    activeId={activeIconId} selectedIds={selectedIds}
                    onPreview={setActiveIconId} onToggle={(id) => setSelectedIds(prev => {
                      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
                    })}
                    weighting={weighting} viewportSize={viewportSize}
                    aiMatchedIds={(settings.aiEnabled && settings.semanticSearchEnabled) ? aiSearchResults : null}
                    transform={transform}
                    aiEnabled={settings.aiEnabled}
                    isSynthesizing={synthesizingCategory === cat}
                    onSynthesize={() => handleSynthesizeCategory(cat)}
                    namingValidationEnabled={settings.namingValidationEnabled}
                  />
                ))
              )}

              {activeTab === 'playground' && <Playground icon={activeIcon} transform={transform} weighting={weighting} />}
              {activeTab === 'generator' && settings.aiEnabled && <Generator />}
            </div>
          </main>

          <Inspector 
            icon={activeIcon} 
            allIcons={allIcons}
            viewportSize={viewportSize} 
            weighting={weighting} setWeighting={setWeighting}
            isOpen={isInspectorOpen} onToggle={() => setIsInspectorOpen(!isInspectorOpen)}
            customFillColor={customFillColor} setCustomFillColor={setCustomFillColor}
            aiEnabled={settings.aiEnabled}
            aiMetadata={activeIconId ? aiMetadataCache[activeIconId] : null}
            isGeneratingMetadata={isGeneratingMetadata}
            relatedIconIds={activeIconId ? relatedIconsCache[activeIconId] : []}
            onSelectIcon={setActiveIconId}
            onCopySpec={handleCopySpec}
            onExportSingle={handleExportSingle}
            transform={transform}
          />
        </div>
        <Footer theme={theme} setTheme={setTheme} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} updateSettings={handleUpdateSettings}
        onReset={() => { localStorage.clear(); window.location.reload(); }}
      />
    </div>
  );
};

export default App;
