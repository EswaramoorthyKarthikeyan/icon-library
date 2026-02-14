
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import IconGrid from './components/IconGrid.tsx';
import Inspector from './components/Inspector.tsx';
import Footer from './components/Footer.tsx';
import { ICON_LIBRARY } from './constants.tsx';
import { ViewportSize, Weighting, TabType, IconData } from './types.ts';

const App: React.FC = () => {
  const getInitialTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 7 && hour < 19) ? 'light' : 'dark';
  };

  const [viewportSize, setViewportSize] = useState<ViewportSize>(24);
  const [weighting, setWeighting] = useState<Weighting>('regular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<string | null>('nav-grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme());
  const [accentColor, setAccentColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  
  const [isInspectorMinimized, setIsInspectorMinimized] = useState(false);
  const [isInspectorClosed, setIsInspectorClosed] = useState(false);

  useEffect(() => {
    if (!accentColor) {
      const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
      document.documentElement.style.setProperty('--system-accent', defaultColor);
    } else {
      document.documentElement.style.setProperty('--system-accent', accentColor);
    }
  }, [theme, accentColor]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (selectedIconId) {
      setIsInspectorClosed(false);
      setIsInspectorMinimized(false);
    }
  }, [selectedIconId]);

  const allIcons = useMemo(() => Object.values(ICON_LIBRARY).flat(), []);

  // Centralized filtering logic
  const filteredIconsList = useMemo(() => {
    return allIcons.filter(icon => 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allIcons, searchQuery]);

  const selectedIcon = useMemo(() => {
    return allIcons.find(i => i.id === selectedIconId) || null;
  }, [selectedIconId, allIcons]);

  const categoriesToRender = useMemo(() => {
    if (searchQuery.trim() !== '') {
      return ICON_LIBRARY;
    }
    if (selectedCategory) {
      return { [selectedCategory]: ICON_LIBRARY[selectedCategory] };
    }
    return ICON_LIBRARY;
  }, [selectedCategory, searchQuery]);

  const isSearching = searchQuery.trim() !== '';

  const handleSelectIcon = (id: string) => {
    setSelectedIconId(id);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Shared Empty State Component
  const EmptySearchState = () => (
    <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8">
        <svg className="w-20 h-20 text-black/10 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <svg className="w-8 h-8 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </div>
      </div>
      <h3 className="text-[14px] font-black uppercase tracking-[0.4em] mb-3 text-black/80 dark:text-white/80">
        Null Result Set
      </h3>
      <p className="text-[11px] font-mono text-black/40 dark:text-white/30 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
        No assets in the system registry match the identifier: <span className="text-accent font-bold">"{searchQuery}"</span>
      </p>
      <button 
        onClick={handleClearSearch}
        className="mt-10 group relative px-8 py-3 overflow-hidden rounded-md border border-black/20 dark:border-white/20 hover:border-accent transition-colors"
      >
        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
          Reset Filter Logic
        </span>
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f1f3f6] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-[#e0e0e0] overflow-hidden transition-colors duration-300">
      <Sidebar 
        viewportSize={viewportSize} 
        setViewportSize={setViewportSize}
        weighting={weighting}
        setWeighting={setWeighting}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto blueprint-grid relative">
          <div className="p-12 max-w-[1400px] mx-auto">
            
            {activeTab === 'grid' && (
              <>
                {isSearching && filteredIconsList.length > 0 && (
                  <div className="mb-12 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-black dark:text-white">
                        Global Search Active
                      </h2>
                    </div>
                    <p className="text-[11px] font-mono text-black/60 dark:text-white/60 uppercase tracking-widest">
                      Filtering all assets for: <span className="text-accent font-bold underline decoration-accent/30 underline-offset-4">&quot;{searchQuery}&quot;</span>
                    </p>
                  </div>
                )}

                {filteredIconsList.length > 0 ? (
                  Object.entries(categoriesToRender).map(([category, icons], idx) => {
                    const filteredIcons = icons.filter(icon => 
                      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      icon.id.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredIcons.length === 0) return null;

                    return (
                      <IconGrid 
                        key={category}
                        title={category}
                        index={(idx + 1).toString().padStart(2, '0')}
                        items={filteredIcons}
                        itemCount={`${icons.length}_ITEMS`}
                        selectedId={selectedIconId}
                        onSelect={handleSelectIcon}
                        weighting={weighting}
                        viewportSize={viewportSize}
                      />
                    );
                  })
                ) : (
                  <EmptySearchState />
                )}
              </>
            )}

            {activeTab === 'list' && (
              filteredIconsList.length > 0 ? (
                <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-lg overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/10 dark:border-white/10">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Symbol</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Identifier</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/30">Native Bounds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIconsList.map((icon) => (
                        <tr 
                          key={icon.id} 
                          onClick={() => handleSelectIcon(icon.id)}
                          className={`border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedIconId === icon.id ? 'bg-accent/5' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <svg className="w-5 h-5 text-black/80 dark:text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path d={icon.svgPath} />
                            </svg>
                          </td>
                          <td className="px-6 py-4 font-mono text-[12px] text-black dark:text-white">{icon.id}</td>
                          <td className="px-6 py-4 text-[11px] font-bold text-black/60 dark:text-white/40 uppercase tracking-wider">{icon.category}</td>
                          <td className="px-6 py-4 font-mono text-[11px] text-black/40 dark:text-white/30">24x24 px</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptySearchState />
              )
            )}
          </div>

          {!isInspectorClosed && (
            <Inspector 
              icon={selectedIcon} 
              viewportSize={viewportSize} 
              isMinimized={isInspectorMinimized}
              onToggleMinimize={() => setIsInspectorMinimized(!isInspectorMinimized)}
              onClose={() => setIsInspectorClosed(true)}
            />
          )}
        </main>

        <Footer theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
};

export default App;
