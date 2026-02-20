
import React from 'react';
import { TabType, ViewMode } from '../types';
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
}

const Header: React.FC<HeaderProps> = ({
  activeTab, setActiveTab, matchCount, totalCount, isSearching, selectedCount, onClearSelection, onSelectAllFiltered, isAllFilteredSelected, onCreateCollection, onOpenSettings, aiEnabled, viewMode, setViewMode
}) => {
  const tabs: { id: TabType, label: string }[] = [
    { id: 'grid', label: 'Explorer' },
    { id: 'playground', label: 'Sandbox' },
    ...(aiEnabled ? [{ id: 'generator' as TabType, label: 'AI Generator' }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Registry</span>
          <span className="font-mono text-sm font-bold uppercase">
            Core_Registry.05 [{matchCount}/{totalCount}]
          </span>
        </div>
      </div>

      <nav className="flex flex-1 justify-center">
        <div className="flex gap-2 rounded-lg bg-muted/50 p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 border-r pr-3">
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 text-[10px] font-bold uppercase tracking-wider">
              <Trash className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              Clear
            </Button>
            <Button
              variant={isAllFilteredSelected ? "secondary" : "ghost"}
              size="sm"
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
            <Button variant="default" size="sm" onClick={onCreateCollection} className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-md">
              <Plus className="h-3.5 w-3.5 shrink-0" />
              Save Set
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[9px]">{selectedCount}</span>
            </Button>
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="flex items-center rounded-lg border bg-muted/30 p-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-7 w-7 ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-9 w-9 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    </header>
  );
};

export default React.memo(Header);
