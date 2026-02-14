
import React from 'react';
import { ViewportSize, Weighting } from '../types.ts';
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
  accentColor: string;
  setAccentColor: (color: string) => void;
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
  accentColor,
  setAccentColor
}) => {
  const isSearching = searchQuery.trim() !== '';

  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-[#0a0a0a] border-r border-black/15 dark:border-white/10 h-screen flex flex-col p-6 overflow-y-auto transition-colors duration-300 shadow-xl z-[60]">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-accent shadow-[0_0_8px_var(--system-accent)]"></div>
          <h1 className="text-black dark:text-white font-black text-[11px] tracking-[0.2em] uppercase transition-colors">Core UI System</h1>
        </div>
        <span className="text-[9px] font-mono text-black/50 dark:text-white/30 tracking-wider">DS_EXPLORER_V4.0.2</span>
      </div>

      <div className="mb-8">
        <label className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block flex justify-between items-center">
          Global Search
          {isSearching && <span className="text-[9px] text-accent font-black animate-pulse">ACTIVE</span>}
        </label>
        <div className="relative group">
          <svg className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${isSearching ? 'text-accent' : 'text-black/40 dark:text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search all assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-black/[0.05] dark:bg-white/[0.03] border rounded-md py-2.5 pl-9 pr-8 text-[12px] font-mono text-black dark:text-white focus:outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/10 ${isSearching ? 'border-accent/60 bg-accent/[0.05]' : 'border-black/20 dark:border-white/10 focus:border-accent shadow-sm'}`}
          />
          {isSearching && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5 p-1 text-black/40 dark:text-white/20 hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`mb-8 transition-all duration-300 ${isSearching ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        <label className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block">
          Library Sets
        </label>
        <div className="space-y-1.5">
          <div 
            onClick={() => !isSearching && setSelectedCategory(null)}
            className={`border rounded-md p-2.5 flex items-center justify-between group cursor-pointer transition-all ${selectedCategory === null ? 'bg-black/[0.1] dark:bg-white/[0.08] border-black/30 dark:border-white/20 shadow-sm' : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.05]'}`}
          >
            <div className="flex items-center gap-3">
              <svg className={`w-4 h-4 ${selectedCategory === null ? 'text-accent' : 'text-black/60 dark:text-white/60'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
              <span className={`text-[12px] font-bold transition-colors ${selectedCategory === null ? 'text-black dark:text-white' : 'text-black/70 dark:text-white/80'}`}>All Assets</span>
            </div>
            {selectedCategory === null && <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_5px_var(--system-accent)]"></div>}
          </div>
          
          <div className="pl-6 space-y-3 py-3 border-l-2 border-black/10 dark:border-white/5 ml-2.5">
            {Object.entries(ICON_LIBRARY).map(([category, icons]) => (
              <button 
                key={category} 
                onClick={() => !isSearching && setSelectedCategory(category)}
                disabled={isSearching}
                className={`block text-left w-full text-[11px] uppercase tracking-wider transition-colors hover:text-accent font-semibold ${selectedCategory === category ? 'text-accent font-black' : 'text-black/50 dark:text-white/40'}`}
              >
                {category} <span className="text-[9px] opacity-60 ml-1 font-mono">[{icons.length}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-4 block">System Contrast</label>
        <div className="flex flex-wrap gap-2.5">
          {CONTRAST_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.value)}
              className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${accentColor === color.value ? 'border-accent scale-125 shadow-md z-10' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-110'}`}
              style={{ backgroundColor: color.value || (accentColor === '' ? 'var(--system-accent)' : 'transparent') }}
              title={color.name}
            >
              {!color.value && <div className="w-full h-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[18px] leading-none font-bold">×</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-3 block">Viewport Size</label>
        <div className="flex gap-1 bg-black/[0.08] dark:bg-white/[0.05] p-1 border border-black/20 dark:border-white/10 rounded-md shadow-inner">
          {[16, 24, 32].map((size) => (
            <button
              key={size}
              onClick={() => setViewportSize(size as ViewportSize)}
              className={`flex-1 py-2 text-[11px] font-mono transition-all rounded-sm ${viewportSize === size ? 'bg-accent text-white dark:text-black font-black shadow-md scale-[1.02]' : 'text-black/60 dark:text-white/30 hover:text-black dark:hover:text-white'}`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[10px] font-bold text-black/60 dark:text-white/40 uppercase tracking-[0.15em] mb-4 block">Weighting</label>
        <div className="space-y-4">
          {(['regular', 'medium', 'bold'] as Weighting[]).map((w) => (
            <label key={w} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="weight" 
                  checked={weighting === w} 
                  onChange={() => setWeighting(w)}
                  className="appearance-none w-4 h-4 border-2 border-black/30 dark:border-white/20 rounded-full checked:border-accent transition-all bg-white dark:bg-black"
                />
                {weighting === w && <div className="absolute w-2 h-2 bg-accent rounded-full shadow-[0_0_4px_var(--system-accent)]"></div>}
              </div>
              <span className={`text-[11px] font-bold capitalize transition-colors ${weighting === w ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40 group-hover:text-black dark:group-hover:text-white'}`}>
                {w} <span className="font-mono text-[9px] opacity-60 ml-1">({w === 'regular' ? '1.5px' : w === 'medium' ? '2.0px' : '3.0px'})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-black/20 dark:border-white/10">
        <button className="w-full bg-accent text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-md hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Assets
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
