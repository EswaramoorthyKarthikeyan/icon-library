
import React from 'react';
import type { TabType, ViewMode } from '../types';
import { Settings, Trash, Check, Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  matchCount: number;
  totalCount: number;
  isSearching: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  isAllFilteredSelected: boolean;
  onCreateCollection: () => void;
  onOpenSettings: () => void;
  aiEnabled: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isMobile?: boolean;
  isSaving?: boolean;
  lastSaveTime?: number;
}

const Header: React.FC<HeaderProps> = ({
  activeTab, setActiveTab, matchCount, totalCount, isSearching: _isSearching, selectedCount, onClearSelection, onSelectAllFiltered, isAllFilteredSelected, onCreateCollection, onOpenSettings, aiEnabled, viewMode, setViewMode, isMobile = false, isSaving = false, lastSaveTime: _lastSaveTime
}) => {
  const tabs: { id: TabType, label: string }[] = [
    { id: 'grid', label: 'Explorer' },
    { id: 'playground', label: 'Sandbox' },
    { id: 'style-guide', label: 'Style Guide' },
    { id: 'animation', label: isMobile ? 'Animate' : 'Animation' },
    ...(isMobile ? [{ id: 'inspector' as TabType, label: 'Details' }] : []),
    ...(aiEnabled ? [{ id: 'generator' as TabType, label: isMobile ? 'AI Gen' : 'AI Generator' }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 flex h-12 sm:h-16 items-center justify-between border-b bg-background/80 px-2 sm:px-4 backdrop-blur-md gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-6 min-w-0">
        <div className="flex flex-col gap-0 flex-shrink-0">
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Registry</span>
          <span className="font-mono text-[9px] sm:text-sm font-bold uppercase truncate">
            {isMobile ? `[${matchCount}/${totalCount}]` : `Core_Registry.05 [${matchCount}/${totalCount}]`}
          </span>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-1 text-[8px] opacity-40 flex-shrink-0">
            <div className={`h-1.5 w-1.5 rounded-full transition-all ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">
              {isSaving ? 'Saving...' : 'Saved'}
            </span>
          </div>
        )}
      </div>

      <nav className="flex justify-center" role="navigation" aria-label="Main navigation">
        <div className="flex gap-1 sm:gap-2 rounded-lg bg-muted/50 p-0.5 sm:p-1" role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-label={t.label}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-md px-2 sm:px-3 py-1 text-[8px] sm:text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                }`}
            >
              {isMobile && t.label.length > 8 ? t.label.substring(0, 5) + '.' : t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        {selectedCount > 0 && (
          <div className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'border-0 pr-0' : 'border-r pr-3'}`} role="toolbar" aria-label="Selection actions">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection} 
              aria-label={`Clear selection (${selectedCount} items selected)`}
              className={`h-7 sm:h-8 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-2 ${isMobile ? 'p-1' : ''}`}
            >
              <Trash className="mr-0 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              {!isMobile && 'Clear'}
            </Button>
            {!isMobile && (
              <Button
                variant={isAllFilteredSelected ? "secondary" : "ghost"}
                size="sm"
                aria-label={isAllFilteredSelected ? "Deselect all matching icons" : "Select all matching icons"}
                onClick={onSelectAllFiltered}
                className={`h-8 text-[10px] font-bold uppercase tracking-wider ${isAllFilteredSelected ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
              >
                {isAllFilteredSelected ? (
                  <>
                    <Trash className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    Deselect Match
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    Select Match
                  </>
                )}
              </Button>
            )}
            {!isMobile && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onCreateCollection} 
                aria-label={`Create collection from selected icons (${selectedCount} items)`}
                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-md"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Save Set
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[9px]">{selectedCount}</span>
              </Button>
            )}
          </div>
        )}

        {activeTab === 'grid' && !isMobile && (
          <div className="flex items-center rounded-lg border bg-muted/30 p-1 mr-2" role="toolbar" aria-label="View mode">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`h-7 w-7 ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="h-7 sm:h-9 w-7 sm:w-9 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        </Button>
      </div>
    </header>
  );
};

export default React.memo(Header);
