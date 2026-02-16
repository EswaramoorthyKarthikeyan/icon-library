
import React from 'react';
import { ViewportSize, Weighting, Collection, IconTransform } from '../types.ts';
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
  aiEnabled: boolean;
  semanticSearchEnabled: boolean;
  setSemanticSearchEnabled: (val: boolean) => void;
  isAiSearching: boolean;
  transform: IconTransform;
  setTransform: (t: IconTransform) => void;
}

const ACCENT_PRESETS = [
  { name: 'Classic', color: '' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Cyber', color: '#10b981' },
  { name: 'Solar', color: '#f59e0b' },
  { name: 'Crimson', color: '#ef4444' },
  { name: 'Violet', color: '#8b5cf6' },
];

const Sidebar: React.FC<SidebarProps> = ({
  viewportSize, setViewportSize, weighting, setWeighting, searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory, collections, activeCollectionId, setActiveCollectionId,
  onDeleteCollection, accentColor, setAccentColor, selectedCount, onExport,
  aiEnabled, semanticSearchEnabled, setSemanticSearchEnabled, isAiSearching, transform, setTransform
}) => {
  return (
    <aside 
      className="w-72 flex-shrink-0 bg-white dark:bg-[#0a0a0a] border-r border-black/15 dark:border-white/10 h-screen flex flex-col p-6 overflow-y-auto transition-colors z-[60] custom-scrollbar"
      aria-label="Application Sidebar"
    >
      {/* Branding */}
      <div className="mb-8" aria-hidden="true">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-accent shadow-[0_0_8px_var(--system-accent)] transition-all duration-300"></div>
          <h1 className="text-black dark:text-white font-black text-[11px] tracking-[0.2em] uppercase">Core UI System</h1>
        </div>
        <span className="text-[9px] font-mono opacity-30 tracking-wider">DS_EXPLORER_V5.0.0</span>
      </div>

      {/* Global Search & AI Toggle */}
      <section className="mb-6" aria-labelledby="search-section-label">
        <div className="flex justify-between items-center mb-2">
          <label id="search-section-label" htmlFor="global-search-input" className="text-[10px] font-black opacity-40 uppercase tracking-widest">Global Search</label>
          {aiEnabled && (
            <button 
              onClick={() => setSemanticSearchEnabled(!semanticSearchEnabled)} 
              aria-pressed={semanticSearchEnabled}
              aria-busy={isAiSearching}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${semanticSearchEnabled ? 'bg-accent/10 border-accent text-accent' : 'bg-black/5 dark:bg-white/5 border-transparent opacity-40'}`}
              aria-label="Toggle AI semantic search"
            >
              <span className="text-[8px] font-black uppercase">AI_Search</span>
              {isAiSearching && <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" aria-hidden="true"></div>}
            </button>
          )}
        </div>
        <input 
          id="global-search-input"
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={aiEnabled && semanticSearchEnabled ? "Concept search..." : "Search ID..."}
          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-3 py-2 text-[12px] font-mono focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        />
      </section>

      {/* System Theme / Accent Options */}
      <section className="mb-8 space-y-3" aria-labelledby="accent-section-label">
        <label id="accent-section-label" className="text-[10px] font-black opacity-40 uppercase tracking-widest">System_Accent</label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="System accent color selection">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setAccentColor(preset.color)}
              aria-pressed={accentColor === preset.color}
              className={`w-6 h-6 rounded-full border-2 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${accentColor === preset.color ? 'border-accent scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: preset.color || (document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000') }}
              title={preset.name}
              aria-label={`Set accent color to ${preset.name}`}
            />
          ))}
          <div className="relative">
            <input 
              id="custom-color-picker"
              type="color" 
              value={accentColor || '#000000'} 
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-6 h-6 rounded-full overflow-hidden border-0 cursor-pointer p-0 bg-transparent focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Choose custom accent color"
            />
          </div>
        </div>
      </section>

      {/* Primary Config: Scale & Weight */}
      <section className="mb-8 space-y-6" aria-label="Appearance configurations">
        <div className="space-y-3">
          <label id="scale-label" className="text-[10px] font-black opacity-40 uppercase tracking-widest">System_Scale</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5" role="group" aria-labelledby="scale-label">
            {([16, 24, 32] as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setViewportSize(size)}
                aria-pressed={viewportSize === size}
                className={`py-1.5 text-[10px] font-black rounded transition-all focus-visible:ring-2 focus-visible:ring-accent ${viewportSize === size ? 'bg-white dark:bg-black text-accent shadow-sm' : 'opacity-40 hover:opacity-100'}`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label id="weight-label" className="text-[10px] font-black opacity-40 uppercase tracking-widest">Stroke_Weight</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5" role="group" aria-labelledby="weight-label">
            {(['regular', 'medium', 'bold'] as Weighting[]).map((w) => (
              <button
                key={w}
                onClick={() => setWeighting(w)}
                aria-pressed={weighting === w}
                className={`py-1.5 text-[9px] font-black uppercase rounded transition-all focus-visible:ring-2 focus-visible:ring-accent ${weighting === w ? 'bg-white dark:bg-black text-accent shadow-sm' : 'opacity-40 hover:opacity-100'}`}
              >
                {w.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Batch Transformation Engine */}
      <section className="mb-8 p-4 bg-accent/[0.03] border border-accent/10 rounded-xl space-y-4 transition-colors" aria-labelledby="transform-label">
        <h2 id="transform-label" className="text-[10px] font-black text-accent uppercase tracking-widest">Batch_Transform</h2>
        
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-black opacity-40 uppercase">
             <label htmlFor="rotate-slider">Rotate</label>
             <span aria-hidden="true">{transform.rotate}°</span>
           </div>
           <input 
             id="rotate-slider"
             type="range" 
             min="0" 
             max="270" 
             step="90" 
             value={transform.rotate} 
             onChange={(e) => setTransform({...transform, rotate: parseInt(e.target.value)})} 
             className="w-full accent-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-lg" 
             aria-valuetext={`${transform.rotate} degrees`}
           />
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-black opacity-40 uppercase">
             <label htmlFor="scale-slider">Scale</label>
             <span aria-hidden="true">{Math.round(transform.scale * 100)}%</span>
           </div>
           <input 
             id="scale-slider"
             type="range" 
             min="0.5" 
             max="1.5" 
             step="0.1" 
             value={transform.scale} 
             onChange={(e) => setTransform({...transform, scale: parseFloat(e.target.value)})} 
             className="w-full accent-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-lg" 
             aria-valuetext={`${Math.round(transform.scale * 100)} percent`}
           />
        </div>

        <div className="flex gap-2" role="group" aria-label="Mirroring controls">
          <button 
            onClick={() => setTransform({...transform, flipH: !transform.flipH})} 
            aria-pressed={transform.flipH}
            className={`flex-1 py-1.5 border rounded text-[8px] font-black uppercase transition-all focus-visible:ring-2 focus-visible:ring-accent ${transform.flipH ? 'bg-accent text-white dark:text-black border-accent' : 'border-black/10 dark:border-white/10 opacity-60'}`}
          >
            Flip_H
          </button>
          <button 
            onClick={() => setTransform({...transform, flipV: !transform.flipV})} 
            aria-pressed={transform.flipV}
            className={`flex-1 py-1.5 border rounded text-[8px] font-black uppercase transition-all focus-visible:ring-2 focus-visible:ring-accent ${transform.flipV ? 'bg-accent text-white dark:text-black border-accent' : 'border-black/10 dark:border-white/10 opacity-60'}`}
          >
            Flip_V
          </button>
        </div>
      </section>

      {/* Library Navigation */}
      <nav className="space-y-1 mb-8" aria-labelledby="manifest-label">
        <h2 id="manifest-label" className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-3">Library_Manifest</h2>
        <button 
          onClick={() => { setSelectedCategory(null); setActiveCollectionId(null); }} 
          className={`w-full text-left px-3 py-2 rounded text-[12px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-accent ${!selectedCategory && !activeCollectionId ? 'bg-black/10 dark:bg-white/10 text-accent' : 'opacity-60 hover:opacity-100'}`}
          aria-current={!selectedCategory && !activeCollectionId ? 'page' : undefined}
        >
          All_Registry
        </button>
        {Object.keys(ICON_LIBRARY).map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)} 
            className={`w-full text-left px-3 py-2 rounded text-[11px] uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-accent ${selectedCategory === cat ? 'bg-accent/5 text-accent font-black' : 'opacity-40 hover:opacity-100'}`}
            aria-current={selectedCategory === cat ? 'location' : undefined}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Bulk Action Footer */}
      <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/10">
        <button 
          onClick={onExport} 
          disabled={selectedCount === 0}
          className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex flex-col items-center gap-1 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${selectedCount > 0 ? 'bg-accent text-white dark:text-black' : 'bg-black/10 opacity-30 cursor-not-allowed'}`}
          aria-label={`Export ${selectedCount} selected assets as ZIP`}
        >
          <span>Export_Assets</span>
          <span className="text-[8px] opacity-70" aria-hidden="true">[{selectedCount}_Selected]</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
