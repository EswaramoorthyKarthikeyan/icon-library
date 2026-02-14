
import React, { useMemo } from 'react';
import { ViewportSize, Weighting, Collection } from '../types.ts';
import { ICON_LIBRARY } from '../constants.tsx';

interface SidebarProps {
  viewportSize: ViewportSize;
  setViewportSize: (size: ViewportSize) => void;
  weighting: Weighting;
  setWeighting: (weight: Weighting) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  collections: Collection[];
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  onDeleteCollection: (id: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  selectedCount: number;
  onExport: () => void;
  semanticSearchEnabled: boolean;
  setSemanticSearchEnabled: (val: boolean) => void;
  isAiSearching: boolean;
}

const CONTRAST_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Cyber Blue', value: '#2563eb' },
  { name: 'Neon Green', value: '#16a34a' },
  { name: 'Hot Pink', value: '#db2777' },
  { name: 'Gold', value: '#ca8a04' },
  { name: 'Crimson', value: '#dc2626' },
  { name: 'Purple', value: '#7c3aed' },
];

const Sidebar: React.FC<SidebarProps> = ({
  viewportSize,
  setViewportSize,
  weighting,
  setWeighting,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  collections,
  activeCollectionId,
  setActiveCollectionId,
  onDeleteCollection,
  accentColor,
  setAccentColor,
  selectedCount,
  onExport,
  semanticSearchEnabled,
  setSemanticSearchEnabled,
  isAiSearching
}) => {
  const isSearching = searchQuery.trim() !== '';

  const totalMatches = useMemo(() => {
    return Object.values(ICON_LIBRARY).flat().filter(icon => 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  }, [searchQuery]);

  const categoryMatches = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(ICON_LIBRARY).forEach(([category, icons]) => {
      counts[category] = icons.filter(icon => 
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
    });
    return counts;
  }, [searchQuery]);

  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-[#0a0a0a] border-r border-black/15 dark:border-white/10 h-screen flex flex-col p-6 overflow-y-auto transition-colors duration-300 shadow-xl z-[60]" aria-label="Library Controls">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-accent shadow-[0_0_8px_var(--system-accent)]" aria-hidden="true"></div>
          <h1 className="text-black dark:text-white font-black text-[11px] tracking-[0.2em] uppercase transition-colors">Core UI System</h1>
        </div>
        <span className="text-[9px] font-mono text-black/50 dark:text-white/30 tracking-wider">DS_EXPLORER_V4.0.2</span>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label htmlFor="global-search" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] block">
            Global Search
          </label>
          <button 
            onClick={() => setSemanticSearchEnabled(!semanticSearchEnabled)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${semanticSearchEnabled ? 'bg-accent/10 border-accent text-accent' : 'bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/20 hover:text-black dark:hover:text-white'}`}
            title="Toggle Semantic AI Search"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${semanticSearchEnabled ? 'bg-accent animate-pulse' : 'bg-current opacity-30'}`}></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Semantic_AI</span>
          </button>
        </div>
        <div className="relative group">
          {isAiSearching ? (
             <div className="absolute left-3 top-3 w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${isSearching ? 'text-accent' : 'text-black/40 dark:text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <input 
            id="global-search"
            type="text" 
            placeholder={semanticSearchEnabled ? "Search concepts (e.g. 'home control')..." : "Search all assets..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-black/[0.05] dark:bg-white/[0.03] border rounded-md py-2.5 pl-9 pr-8 text-[12px] font-mono text-black dark:text-white focus:outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/10 ${isSearching ? 'border-accent/60 bg-accent/[0.05]' : 'border-black/20 dark:border-white/10 focus:border-accent shadow-sm'}`}
          />
          {isSearching && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5 p-1 text-black/40 dark:text-white/20 hover:text-accent transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`mb-8 transition-all duration-300`} role="group" aria-labelledby="library-sets-label">
        <h2 id="library-sets-label" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block">
          Library Sets
        </h2>
        <div className="space-y-1.5">
          <button 
            onClick={() => { setSelectedCategory(null); setActiveCollectionId(null); }}
            className={`w-full text-left border rounded-md p-2.5 flex items-center justify-between group cursor-pointer transition-all ${selectedCategory === null && activeCollectionId === null ? 'bg-black/[0.1] dark:bg-white/[0.08] border-black/30 dark:border-white/20 shadow-sm' : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.05]'}`}
            aria-pressed={selectedCategory === null && activeCollectionId === null}
          >
            <div className="flex items-center gap-3">
              <svg className={`w-4 h-4 ${selectedCategory === null && activeCollectionId === null ? 'text-accent' : 'text-black/60 dark:text-white/60'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
              <span className={`text-[12px] font-bold transition-colors ${selectedCategory === null && activeCollectionId === null ? 'text-black dark:text-white' : 'text-black/70 dark:text-white/80'}`}>All Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold ${isSearching && totalMatches > 0 ? 'text-accent' : 'text-black/40 dark:text-white/30'}`}>
                {isSearching ? `${totalMatches}` : Object.values(ICON_LIBRARY).flat().length}
              </span>
            </div>
          </button>
          
          <div className="pl-6 space-y-3 py-3 border-l-2 border-black/10 dark:border-white/5 ml-2.5" role="list">
            {Object.entries(ICON_LIBRARY).map(([category, icons]) => (
              <button 
                key={category} 
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center justify-between w-full text-[11px] uppercase tracking-wider transition-colors hover:text-accent font-semibold ${selectedCategory === category ? 'text-accent font-black' : 'text-black/50 dark:text-white/40'} ${isSearching && categoryMatches[category] === 0 ? 'opacity-20' : ''}`}
                aria-pressed={selectedCategory === category}
                role="listitem"
              >
                <span>{category}</span>
                <span className={`text-[9px] font-mono transition-colors ${isSearching && categoryMatches[category] > 0 ? 'text-accent font-black' : 'opacity-60'}`}>
                  {isSearching ? `[${categoryMatches[category]}]` : `[${icons.length}]`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8" role="group" aria-labelledby="collections-label">
        <h2 id="collections-label" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block flex items-center justify-between">
          User Collections
          {collections.length > 0 && <span className="text-[8px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">{collections.length}</span>}
        </h2>
        {collections.length === 0 ? (
          <div className="p-4 border border-dashed border-black/10 dark:border-white/10 rounded-lg text-center bg-black/[0.02] dark:bg-white/[0.01]">
            <p className="text-[9px] font-mono text-black/30 dark:text-white/20 uppercase tracking-widest leading-relaxed">No custom workspaces defined.</p>
          </div>
        ) : (
          <div className="space-y-1.5" role="list">
            {collections.map((col) => (
              <div key={col.id} className="group relative flex items-center">
                <button 
                  onClick={() => setActiveCollectionId(col.id)}
                  className={`flex-1 text-left border rounded-md p-2.5 pr-8 flex items-center justify-between transition-all ${activeCollectionId === col.id ? 'bg-accent/10 border-accent/30 shadow-sm' : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.05]'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <svg className={`w-4 h-4 shrink-0 ${activeCollectionId === col.id ? 'text-accent' : 'text-black/40 dark:text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <span className={`text-[12px] font-bold truncate ${activeCollectionId === col.id ? 'text-accent' : 'text-black/70 dark:text-white/80'}`}>{col.name}</span>
                  </div>
                  <span className="text-[9px] font-mono opacity-40">[{col.iconIds.length}]</span>
                </button>
                <button 
                  onClick={() => onDeleteCollection(col.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  aria-label={`Delete ${col.name}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8" role="group" aria-labelledby="system-contrast-label">
        <label id="system-contrast-label" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-4 block">System Contrast</label>
        <div className="flex flex-wrap gap-2.5">
          {CONTRAST_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.value)}
              className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${accentColor === color.value ? 'border-accent scale-125 shadow-md z-10' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-110'}`}
              style={{ backgroundColor: color.value || (accentColor === '' ? 'var(--system-accent)' : 'transparent') }}
              aria-label={`Set accent color to ${color.name}`}
              aria-pressed={accentColor === color.value}
            >
              {!color.value && <div className="w-full h-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[18px] leading-none font-bold" aria-hidden="true">×</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8" role="group" aria-labelledby="viewport-size-label">
        <label id="viewport-size-label" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block">Viewport Size</label>
        <div className="flex gap-1 bg-black/[0.08] dark:bg-white/[0.05] p-1 border border-black/20 dark:border-white/10 rounded-md shadow-inner">
          {[16, 24, 32].map((size) => (
            <button
              key={size}
              onClick={() => setViewportSize(size as ViewportSize)}
              className={`flex-1 py-2 text-[11px] font-mono transition-all rounded-sm ${viewportSize === size ? 'bg-accent text-white dark:text-black font-black shadow-md scale-[1.02]' : 'text-black/60 dark:text-white/30 hover:text-black dark:hover:text-white'}`}
              aria-pressed={viewportSize === size}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8" role="radiogroup" aria-labelledby="weighting-label">
        <label id="weighting-label" className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-4 block">Weighting</label>
        <div className="space-y-4">
          {(['regular', 'medium', 'bold'] as Weighting[]).map((w) => (
            <label key={w} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="weight" 
                  checked={weighting === w} 
                  onChange={() => setWeighting(w)}
                  className="appearance-none w-4 h-4 border-2 border-black/30 dark:border-white/20 rounded-full checked:border-accent transition-all bg-white dark:bg-black focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-black"
                />
                {weighting === w && <div className="absolute w-2 h-2 bg-accent rounded-full shadow-[0_0_4px_var(--system-accent)]" aria-hidden="true"></div>}
              </div>
              <span className={`text-[11px] font-bold capitalize transition-colors ${weighting === w ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40 group-hover:text-black dark:group-hover:text-white'}`}>
                {w} <span className="font-mono text-[9px] opacity-60 ml-1" aria-hidden="true">({w === 'regular' ? '1.5px' : w === 'medium' ? '2.0px' : '3.0px'})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-black/20 dark:border-white/10">
        <button 
          onClick={onExport}
          className="w-full bg-accent text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-md hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {selectedCount > 0 ? `Export ${selectedCount} Assets` : 'Export All Assets'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
