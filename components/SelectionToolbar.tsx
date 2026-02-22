
import React from 'react';
import { 
  X, 
  Download, 
  Plus, 
  CheckSquare, 
  RefreshCw,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onInvertSelection: () => void;
  onSelectAll: () => void;
  onExport: (format: 'svg' | 'jsx' | 'json') => void;
  onAddToCollection: () => void;
  onCompare?: () => void;
  className?: string;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onInvertSelection,
  onSelectAll,
  onExport,
  onAddToCollection,
  onCompare,
  className
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300",
      className
    )}>
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Selection Count & Clear */}
        <div className="flex items-center gap-3 pr-2 border-r border-muted-foreground/20">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selectedCount}
          </div>
          <span className="hidden xs:inline text-xs font-bold uppercase tracking-wider text-foreground">Selected</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            onClick={onClearSelection}
            aria-label="Clear selection"
            title="Clear Selection"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Selection Ops */}
        <div className="flex items-center gap-1 px-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest gap-2"
            onClick={onSelectAll}
            aria-label="Select all icons"
          >
            <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">All</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest gap-2"
            onClick={onInvertSelection}
            aria-label="Invert selection"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Invert</span>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pl-2">
          <Button 
            variant="default" 
            size="sm" 
            className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
            onClick={onAddToCollection}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Collect</span>
          </Button>

          {selectedCount === 2 && onCompare && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2 border-primary/20 hover:bg-primary/5"
              onClick={onCompare}
              aria-label="Compare selected icons"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Compare</span>
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1 bg-background/95 backdrop-blur-lg border-primary/10">
              <div className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest opacity-40">Format Options</div>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => onExport('svg')} 
                  className="w-full text-left px-2 py-1.5 hover:bg-accent rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  SVG Archive
                </button>
                <button 
                  onClick={() => onExport('jsx')} 
                  className="w-full text-left px-2 py-1.5 hover:bg-accent rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  React Component
                </button>
                <button 
                  onClick={() => onExport('json')} 
                  className="w-full text-left px-2 py-1.5 hover:bg-accent rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  JSON Payload
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default SelectionToolbar;
