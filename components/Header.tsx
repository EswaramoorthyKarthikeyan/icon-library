
import React, { useState } from 'react';
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
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  matchCount, 
  totalCount, 
  isSearching,
  selectedCount,
  onClearSelection,
  onSelectAllFiltered,
  onCreateCollection,
  onOpenSettings
}) => {
  const [showManifestDetails, setShowManifestDetails] = useState(false);

  return (
    <header className="h-16 border-b border-black/15 dark:border-white/10 flex items-center justify-between px-8 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 shadow-sm z-50 shrink-0">
      <div className="flex items-center gap-12 h-full">
        {/* Active Manifest Label */}
        <div 
          className="flex flex-col cursor-pointer group relative"
          onClick={() => setShowManifestDetails(!showManifestDetails)}
          role="button"
          aria-haspopup="true"
          aria-expanded={showManifestDetails}
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowManifestDetails(!showManifestDetails)}
        >
          <span className="text-[9px] font-black text-black/40 dark:text-white/20 uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Active Manifest</span>
          <div className="flex items-baseline gap-3">
            <span className="text-[13px] font-black text-black dark:text-white uppercase tracking-wider transition-colors group-hover:underline decoration-accent/30 underline-offset-4">Core_Registry.04</span>
            <span className={`text-[10px] font-mono font-bold transition-colors ${isSearching ? 'text-accent animate-pulse' : 'text-black/40 dark:text-white/20'}`} aria-live="polite">
              [{isSearching ? `${matchCount} MATCHES / ${totalCount} ASSETS` : `${totalCount} ASSETS`}]
            </span>
          </div>
          
          {/* Manifest Details Popover */}
          {showManifestDetails && (
            <div 
              className="absolute top-14 left-0 w-64 bg-white dark:bg-[#111111] border border-black/20 dark:border-white/20 rounded-lg shadow-2xl p-5 z-[100] animate-in fade-in zoom-in-95 duration-200"
              role="dialog"
              aria-labelledby="manifest-signature-title"
            >
              <h4 id="manifest-signature-title" className="text-[10px] font-black uppercase tracking-widest text-accent mb-3">Manifest Signature</h4>
              <div className="space-y-3 font-mono text-[9px]">
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="text-black/40 dark:text-white/30 uppercase">Build UID</span>
                  <span className="text-black dark:text-white">AX-992-04</span>
                </div>
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="text-black/40 dark:text-white/30 uppercase">Checksum</span>
                  <span className="text-black dark:text-white">7f9e8a1c</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-black/40 dark:text-white/30 uppercase">Status</span>
                  <span className="text-green-500 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[2px] h-8 bg-black/10 dark:bg-white/10 transition-colors rounded-full" aria-hidden="true"></div>

        {/* Tabs */}
        <nav className="flex gap-10 h-full" role="tablist" aria-label="Main Explorer Views">
          <button 
            id="tab-grid"
            role="tab"
            aria-selected={activeTab === 'grid'}
            aria-controls="panel-grid"
            onClick={() => setActiveTab('grid')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center h-full border-b-[3px] ${activeTab === 'grid' ? 'text-black dark:text-white border-accent' : 'text-black/40 dark:text-white/40 border-transparent hover:text-black/70 dark:hover:text-white/70'}`}
          >
            Grid Explorer
          </button>
          <button 
            id="tab-list"
            role="tab"
            aria-selected={activeTab === 'list'}
            aria-controls="panel-list"
            onClick={() => setActiveTab('list')}
            className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center h-full border-b-[3px] ${activeTab === 'list' ? 'text-black dark:text-white border-accent' : 'text-black/40 dark:text-white/40 border-transparent hover:text-black/70 dark:hover:text-white/70'}`}
          >
            List Registry
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 pr-4 border-r border-black/10 dark:border-white/10 animate-in fade-in slide-in-from-right-4" role="status" aria-label={`${selectedCount} items selected`}>
             <span className="text-[10px] font-black uppercase tracking-widest text-accent">{selectedCount} Selected</span>
             <button 
                onClick={onClearSelection}
                className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/20 hover:text-red-500 transition-colors px-1"
                aria-label="Clear selection"
             >
               Clear
             </button>
             <button 
                onClick={onSelectAllFiltered}
                className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/20 hover:text-accent transition-colors ml-2 px-1"
                aria-label="Select all matching items"
             >
               All
             </button>
             <button 
                onClick={onCreateCollection}
                className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white dark:hover:text-black transition-all"
                aria-label="Create collection from selection"
             >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
               Save Collection
             </button>
          </div>
        )}
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white transition-all relative group"
          aria-label="System Settings"
        >
          <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-[#0a0a0a]" aria-hidden="true"></div>
        </button>
      </div>
    </header>
  );
};

export default Header;
