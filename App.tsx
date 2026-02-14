
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import IconGrid from './components/IconGrid.tsx';
import Inspector from './components/Inspector.tsx';
import Footer from './components/Footer.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { ICON_LIBRARY } from './constants.tsx';
import { ViewportSize, Weighting, TabType, IconData, AppSettings, Collection, IconAiMetadata } from './types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import JSZip from 'jszip';

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
  
  // AI State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  const [aiMetadataCache, setAiMetadataCache] = useState<Record<string, IconAiMetadata>>({});
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

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
  });

  // Effects: Initialize Collections from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('core_ui_collections');
    if (saved) {
      try {
        setCollections(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load collections", e);
      }
    }
  }, []);

  // Effects: Save Collections to LocalStorage
  useEffect(() => {
    localStorage.setItem('core_ui_collections', JSON.stringify(collections));
  }, [collections]);

  // Effects: Accent & Theme
  useEffect(() => {
    const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
    const finalAccent = accentColor || defaultColor;
    document.documentElement.style.setProperty('--system-accent', finalAccent);
  }, [theme, accentColor]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Effects: Typography
  useEffect(() => {
    const fontsToLoad = [settings.primaryFont, settings.monoFont];
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontsToLoad.map(f => f.replace(/\s+/g, '+')).join('&family=')}:wght@400;500;600;700;800;900&display=swap`;
    
    let link = document.getElementById('google-fonts-link') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'google-fonts-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = fontUrl;

    document.documentElement.style.setProperty('--font-primary', `'${settings.primaryFont}', sans-serif`);
    document.documentElement.style.setProperty('--font-mono', `'${settings.monoFont}', monospace`);
  }, [settings.primaryFont, settings.monoFont]);

  // Semantic Search Effect
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (!settings.semanticSearchEnabled || !searchQuery.trim() || searchQuery.length < 3) {
        setAiSearchResults(null);
        return;
      }

      setIsAiSearching(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const allIcons = Object.values(ICON_LIBRARY).flat();
        const iconContext = allIcons.map(i => ({ id: i.id, name: i.name, category: i.category }));

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Given a design system icon library and a user query, return an array of icon IDs that semantically match the user's intent. 
          User query: "${searchQuery}"
          Available Icons: ${JSON.stringify(iconContext)}`,
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

        const data = JSON.parse(response.text || '{"matchedIds": []}');
        setAiSearchResults(data.matchedIds);
      } catch (e) {
        console.error("Semantic search failed", e);
      } finally {
        setIsAiSearching(false);
      }
    };

    const timeout = setTimeout(performSemanticSearch, 600);
    return () => clearTimeout(timeout);
  }, [searchQuery, settings.semanticSearchEnabled]);

  // AI Insights Effect
  useEffect(() => {
    const generateAiMetadata = async () => {
      if (!activeIconId || aiMetadataCache[activeIconId] || isGeneratingMetadata) return;

      const activeIcon = Object.values(ICON_LIBRARY).flat().find(i => i.id === activeIconId);
      if (!activeIcon) return;

      setIsGeneratingMetadata(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate professional UI design insights for the following icon:
          Name: ${activeIcon.name}
          Category: ${activeIcon.category}
          
          Provide a list of 4-6 semantic tags and a 1-sentence usage description.`,
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

        const data = JSON.parse(response.text || '{"tags": [], "description": "No data available."}');
        setAiMetadataCache(prev => ({ ...prev, [activeIconId]: data }));
      } catch (e) {
        console.error("AI Metadata generation failed", e);
      } finally {
        setIsGeneratingMetadata(false);
      }
    };

    generateAiMetadata();
  }, [activeIconId, aiMetadataCache]);

  // Calculations
  const allIcons = useMemo(() => Object.values(ICON_LIBRARY).flat(), []);

  const activeIcon = useMemo(() => {
    return allIcons.find(i => i.id === activeIconId) || null;
  }, [activeIconId, allIcons]);

  const filteredIconsList = useMemo(() => {
    // If AI results are available and we are in semantic mode, prioritize them
    if (settings.semanticSearchEnabled && aiSearchResults !== null && searchQuery.trim()) {
      return allIcons.filter(icon => aiSearchResults.includes(icon.id));
    }

    let result = allIcons;
    
    // Filter by collection first if active
    if (activeCollectionId) {
      const collection = collections.find(c => c.id === activeCollectionId);
      if (collection) {
        result = result.filter(icon => collection.iconIds.includes(icon.id));
      }
    } else if (selectedCategory) {
      result = ICON_LIBRARY[selectedCategory] || [];
    }

    // Then filter by standard keyword search
    if (searchQuery.trim() && !settings.semanticSearchEnabled) {
      const q = searchQuery.toLowerCase();
      result = result.filter(icon => 
        icon.name.toLowerCase().includes(q) ||
        icon.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allIcons, searchQuery, selectedCategory, activeCollectionId, collections, settings.semanticSearchEnabled, aiSearchResults]);

  const categoriesToRender = useMemo(() => {
    if (activeCollectionId || searchQuery.trim() || selectedCategory) {
      const groups: Record<string, IconData[]> = {};
      filteredIconsList.forEach(icon => {
        if (!groups[icon.category]) groups[icon.category] = [];
        groups[icon.category].push(icon);
      });
      return groups;
    }
    return ICON_LIBRARY;
  }, [filteredIconsList, searchQuery, selectedCategory, activeCollectionId]);

  const isSearching = searchQuery.trim() !== '';

  // Handlers
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateCollection = () => {
    if (selectedIds.size === 0) return;
    const name = prompt("Enter a name for this collection:");
    if (!name) return;

    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name: name,
      iconIds: Array.from(selectedIds),
      createdAt: Date.now()
    };

    setCollections(prev => [...prev, newCollection]);
    setSelectedIds(new Set());
    alert(`Collection "${name}" created with ${newCollection.iconIds.length} assets.`);
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm("Permanently remove this collection? Assets will remain in the library.")) {
      setCollections(prev => prev.filter(c => c.id !== id));
      if (activeCollectionId === id) setActiveCollectionId(null);
    }
  };

  const handleSetActiveIcon = (id: string) => {
    setActiveIconId(id);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredIconsList.map(icon => icon.id);
    setSelectedIds(new Set(ids));
  };

  const handleExport = async () => {
    const itemsToExport = selectedIds.size > 0 
      ? allIcons.filter(icon => selectedIds.has(icon.id))
      : allIcons;
      
    const zip = new JSZip();
    const strokeWidthMap = { regular: 1.5, medium: 2, bold: 3 };
    const currentStroke = strokeWidthMap[weighting];

    itemsToExport.forEach(icon => {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${customFillColor}" stroke="currentColor" stroke-width="${currentStroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${icon.svgPath}" />
</svg>`;
      const path = settings.autoExportFolders ? `${icon.category}/${icon.name}.svg` : `${icon.name}.svg`;
      zip.file(path, svgContent);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core_ui_export_${itemsToExport.length}_assets.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleResetApp = () => {
    if (confirm("Reset all system data, collections, and preferences?")) {
      localStorage.removeItem('core_ui_collections');
      setCollections([]);
      setSettings({
        showGrid: true,
        gridOpacity: 0.08,
        uiDensity: 'standard',
        autoExportFolders: true,
        primaryFont: 'Inter',
        monoFont: 'JetBrains Mono',
        semanticSearchEnabled: false,
      });
      setSelectedIds(new Set());
      setActiveIconId(null);
      setAccentColor('');
      setSearchQuery('');
      setIsSettingsOpen(false);
    }
  };

  const EmptySearchState = () => (
    <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in-95 duration-500" role="alert">
      <div className="relative mb-8">
        <svg className="w-20 h-20 text-black/10 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-[14px] font-black uppercase tracking-[0.4em] mb-3 text-black/80 dark:text-white/80">Null Result Set</h3>
      <p className="text-[11px] font-mono text-black/40 dark:text-white/30 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
        {settings.semanticSearchEnabled ? "Semantic AI could not map your query to any known assets." : `No assets in the system registry match the identifier: "${searchQuery}"`}
      </p>
      <button 
        onClick={() => { setSearchQuery(''); setSelectedCategory(null); setActiveCollectionId(null); setAiSearchResults(null); }}
        className="mt-10 group relative px-8 py-3 overflow-hidden rounded-md border border-black/20 dark:border-white/20 hover:border-accent transition-colors focus:ring-2 focus:ring-accent"
      >
        <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Reset Explorer State</span>
      </button>
    </div>
  );

  return (
    <div className={`flex h-screen bg-[#f1f3f6] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-[#e0e0e0] overflow-hidden transition-colors duration-300 ${settings.uiDensity === 'compact' ? 'density-compact' : ''}`}>
      {/* LHS Sidebar */}
      <Sidebar 
        viewportSize={viewportSize} 
        setViewportSize={setViewportSize}
        weighting={weighting}
        setWeighting={setWeighting}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => { setSelectedCategory(cat); setActiveCollectionId(null); }}
        collections={collections}
        activeCollectionId={activeCollectionId}
        setActiveCollectionId={(id) => { setActiveCollectionId(id); setSelectedCategory(null); }}
        onDeleteCollection={handleDeleteCollection}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        selectedCount={selectedIds.size}
        onExport={handleExport}
        semanticSearchEnabled={settings.semanticSearchEnabled}
        setSemanticSearchEnabled={(val) => handleUpdateSettings({ semanticSearchEnabled: val })}
        isAiSearching={isAiSearching}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative" role="main">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          matchCount={filteredIconsList.length}
          totalCount={allIcons.length}
          isSearching={isSearching}
          selectedCount={selectedIds.size}
          onClearSelection={handleClearSelection}
          onSelectAllFiltered={handleSelectAllFiltered}
          onCreateCollection={handleCreateCollection}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden w-full relative">
          <main 
            className="flex-1 overflow-y-auto blueprint-grid relative transition-all duration-300 min-w-0"
            style={{ 
              backgroundImage: settings.showGrid ? undefined : 'none',
              '--grid-opacity': settings.gridOpacity
            } as any}
          >
            <div className={`w-full max-w-[1400px] mx-auto ${settings.uiDensity === 'compact' ? 'p-6' : 'p-10'}`}>
              
              {activeTab === 'grid' && (
                <div id="panel-grid" role="tabpanel" aria-labelledby="tab-grid" className="w-full">
                  {(isSearching || activeCollectionId || selectedCategory) && filteredIconsList.length > 0 && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-black dark:text-white">
                          {activeCollectionId ? `Viewing Collection: ${collections.find(c => c.id === activeCollectionId)?.name}` : 'Filtered Results'} — {filteredIconsList.length} assets
                        </h2>
                        {settings.semanticSearchEnabled && isSearching && (
                          <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black animate-pulse">SEMANTIC_AI_ACTIVE</span>
                        )}
                      </div>
                      <button 
                        onClick={() => { setActiveCollectionId(null); setSelectedCategory(null); setSearchQuery(''); setAiSearchResults(null); }}
                        className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                      >
                        Clear Filters ×
                      </button>
                    </div>
                  )}

                  {filteredIconsList.length > 0 ? (
                    Object.entries(categoriesToRender).map(([category, icons], idx) => (
                      <IconGrid 
                        key={category}
                        title={category}
                        index={(idx + 1).toString().padStart(2, '0')}
                        items={icons}
                        itemCount={`${icons.length}_ITEMS`}
                        activeId={activeIconId}
                        selectedIds={selectedIds}
                        onPreview={handleSetActiveIcon}
                        onToggle={handleToggleSelection}
                        weighting={weighting}
                        viewportSize={viewportSize}
                        aiMatchedIds={settings.semanticSearchEnabled ? aiSearchResults : null}
                      />
                    ))
                  ) : (
                    isAiSearching ? (
                      <div className="flex flex-col items-center justify-center py-40">
                         <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Analyzing_Library_Context</p>
                      </div>
                    ) : (
                      <EmptySearchState />
                    )
                  )}
                </div>
              )}

              {activeTab === 'list' && (
                <div id="panel-list" role="tabpanel" aria-labelledby="tab-list" className="w-full">
                  {filteredIconsList.length > 0 ? (
                    <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-lg overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/10 dark:border-white/10">
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Symbol</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Identifier</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredIconsList.map((icon) => (
                              <tr 
                                key={icon.id} 
                                onClick={() => handleSetActiveIcon(icon.id)}
                                className={`border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${activeIconId === icon.id ? 'ring-1 ring-inset ring-accent/30 bg-accent/5' : ''}`}
                              >
                                <td className="px-6 py-4 flex items-center gap-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleSelection(icon.id); }}
                                    className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors shrink-0 ${selectedIds.has(icon.id) ? 'bg-accent border-accent' : 'border-black/20 dark:border-white/20'}`}
                                  >
                                    {selectedIds.has(icon.id) && <svg className="w-3 h-3 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                  </button>
                                  <svg className="w-5 h-5 text-black/80 dark:text-white/80 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path d={icon.svgPath} />
                                  </svg>
                                </td>
                                <td className="px-6 py-4 font-mono text-[12px] whitespace-nowrap">{icon.id}</td>
                                <td className="px-6 py-4 text-[11px] font-bold text-black/60 dark:text-white/40 uppercase tracking-wider whitespace-nowrap">{icon.category}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <EmptySearchState />
                  )}
                </div>
              )}
            </div>
          </main>

          {/* RHS Inspector Sidebar */}
          <Inspector 
            icon={activeIcon} 
            viewportSize={viewportSize} 
            weighting={weighting}
            setWeighting={setWeighting}
            isOpen={isInspectorOpen}
            onToggle={() => setIsInspectorOpen(!isInspectorOpen)}
            customFillColor={customFillColor}
            setCustomFillColor={setCustomFillColor}
            aiMetadata={activeIconId ? aiMetadataCache[activeIconId] : null}
            isGeneratingMetadata={isGeneratingMetadata}
          />
        </div>

        <Footer theme={theme} setTheme={setTheme} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={handleUpdateSettings}
        onReset={handleResetApp}
      />
    </div>
  );
};

export default App;
