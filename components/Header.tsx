
import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  matchCount: number;
  totalCount: number;
  isSearching: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  onCreateCollection: () => void;
  onOpenSettings: () => void;
  aiEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, setActiveTab, matchCount, totalCount, isSearching, selectedCount, onClearSelection, onSelectAllFiltered, onCreateCollection, onOpenSettings, aiEnabled
}) => {
  const tabs: {id: TabType, label: string}[] = [
    { id: 'grid', label: 'Explorer' },
    { id: 'playground', label: 'Sandbox' },
    ...(aiEnabled ? [{ id: 'generator' as TabType, label: 'AI_Gen' }] : [])
  ];

  return (
    <header className="h-16 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-50 shrink-0 sticky top-0">
      <div className="flex items-center gap-12 h-full">
        <div className="flex flex-col">
          <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Registry</span>
          <span className="text-[12px] font-black uppercase font-mono">Core_Registry.05 [{matchCount}/{totalCount}]</span>
        </div>
        <nav className="flex gap-8 h-full">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`h-full border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent opacity-40 hover:opacity-100'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 pr-4 border-r border-black/10 dark:border-white/10">
            <button onClick={onClearSelection} className="px-3 py-1 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all">Clear</button>
            <button onClick={onSelectAllFiltered} className="px-3 py-1 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all">Select_Match</button>
            <button onClick={onCreateCollection} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-black uppercase text-accent hover:bg-accent/20 transition-all">Save_Set</button>
          </div>
        )}
        <button 
          onClick={onOpenSettings} 
          className="p-2.5 bg-black/5 dark:bg-white/5 rounded-full opacity-60 hover:opacity-100 transition-all border border-transparent hover:border-accent" 
          aria-label="Open settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
