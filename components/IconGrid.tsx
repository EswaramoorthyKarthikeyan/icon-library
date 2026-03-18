
import React from 'react';
import type { IconData, ViewportSize, Weighting, IconTransform, IconAiMetadata, ViewMode } from '../types';
import { getStrokeWidth, getTransformStyle } from '../utils/svg';
import { useArrowNavigation } from '../hooks/useArrowNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconGridProps {
  category: string;
  icons: IconData[];
  viewportSize: ViewportSize;
  weighting: Weighting;
  transform: IconTransform;
  activeIconId: string | null;
  selectedIds: Set<string>;
  settings: { gridOpacity: number; showGrid: boolean; aiEnabled: boolean };
  aiMetadataCache: Record<string, IconAiMetadata>;
  customFillColor: string;
  annotatedIconIds?: Set<string>;
  viewMode: ViewMode;
  onPreview: (id: string | null) => void;
  onToggle: (id: string) => void;
  onAddToRecent: (id: string) => void;
  lastSelectedId?: string | null;
  setLastSelectedId?: (id: string | null) => void;
}

const IconGrid: React.FC<IconGridProps> = ({
  category, icons, viewportSize, weighting, transform, activeIconId, selectedIds,
  settings, aiMetadataCache: _aiMetadataCache, customFillColor, annotatedIconIds = new Set(), viewMode, onPreview, onToggle, onAddToRecent,
  lastSelectedId, setLastSelectedId,
}) => {
  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);

  // Responsive grid sizing - smaller on mobile
  const gridMinSize = viewportSize === 32 ? '60px' : viewportSize === 16 ? '40px' : '52px';
  const mobileGridMinSize = viewportSize === 32 ? '50px' : viewportSize === 16 ? '32px' : '40px';

  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate approximate columns for arrow navigation
  const [cols, setCols] = React.useState(0);
  
  React.useEffect(() => {
    if (!containerRef.current || viewMode !== 'grid') {
        setCols(1);
        return;
    }
    
    const updateCols = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const itemWidth = window.innerWidth < 768 ? parseInt(mobileGridMinSize) : parseInt(gridMinSize);
      const gap = window.innerWidth < 768 ? 4 : 8; // approx from gap-1/gap-2
      const calculated = Math.floor((width + gap) / (itemWidth + gap));
      setCols(calculated || 1);
    };

    updateCols();
    const observer = new ResizeObserver(updateCols);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, viewMode, mobileGridMinSize, gridMinSize]);

  useArrowNavigation(containerRef, {
    selectors: 'button[aria-label^="Select "]',
    enabled: true,
    cols: viewMode === 'grid' ? cols : 1
  });

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4 flex items-center justify-between border-b pb-1.5 sm:pb-2 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              const allInCatSelected = icons.every(i => selectedIds.has(i.id));
              icons.forEach(i => {
                if (allInCatSelected) {
                  if (selectedIds.has(i.id)) onToggle(i.id);
                } else {
                  if (!selectedIds.has(i.id)) onToggle(i.id);
                }
              });
            }}
            aria-label={`Select all icons in ${category}`}
            aria-pressed={icons.every(i => selectedIds.has(i.id))}
            className={cn(
              "flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded border transition-colors flex-shrink-0",
              icons.every(i => selectedIds.has(i.id))
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {icons.every(i => selectedIds.has(i.id)) && <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>}
          </button>
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary flex-shrink-0">
            {category}
          </span>
          <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-primary/40 to-transparent flex-shrink-0" />
          <span className="font-mono text-[8px] sm:text-[10px] opacity-30 flex-shrink-0">{icons.length}</span>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-1 sm:gap-2",
          viewMode === 'grid'
            ? ""
            : "grid-cols-1"
        )}
        ref={containerRef}
        style={viewMode === 'grid' ? { gridTemplateColumns: `repeat(auto-fill, minmax(${window.innerWidth < 768 ? mobileGridMinSize : gridMinSize}, 1fr))` } : {}}
      >
        <TooltipProvider>
          {icons.map(icon => {
            const isActive = icon.id === activeIconId;
            const isSelected = selectedIds.has(icon.id);
            const hasNote = annotatedIconIds.has(icon.id);
            // const meta = settings.aiEnabled ? aiMetadataCache[icon.id] : null;

            return (
              <Tooltip key={icon.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      onPreview(icon.id);
                      
                      // Shift+click for range selection
                      if (e.shiftKey && lastSelectedId && setLastSelectedId) {
                        const iconIds = icons.map(i => i.id);
                        const startIdx = iconIds.indexOf(lastSelectedId);
                        const endIdx = iconIds.indexOf(icon.id);
                        
                        if (startIdx !== -1 && endIdx !== -1) {
                          const [min, max] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                          for (let i = min; i <= max; i++) {
                            const id = iconIds[i];
                            if (!selectedIds.has(id)) {
                              onToggle(id);
                            }
                          }
                        }
                      } else if (e.shiftKey && selectedIds.has(icon.id)) {
                        // Clicking selected icon with shift clears selection from lastSelectedId
                        const iconIds = icons.map(i => i.id);
                        const startIdx = iconIds.indexOf(lastSelectedId || icon.id);
                        const endIdx = iconIds.indexOf(icon.id);
                        
                        if (startIdx !== -1 && endIdx !== -1) {
                          const [min, max] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                          for (let i = min; i <= max; i++) {
                            const id = iconIds[i];
                            if (selectedIds.has(id)) {
                              onToggle(id);
                            }
                          }
                        }
                      } else {
                        onToggle(icon.id);
                      }
                      
                      onAddToRecent(icon.id);
                      setLastSelectedId?.(icon.id);
                    }}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${icon.name}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative flex items-center rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      viewMode === 'grid' ? "aspect-square justify-center" : "h-10 sm:h-12 px-2 sm:px-4 gap-2 sm:gap-4",
                      isActive
                        ? "z-10 scale-[1.02] border-primary bg-accent shadow-md"
                        : isSelected
                          ? "border-primary/50 bg-secondary"
                          : "border-border bg-card hover:z-10 hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "relative flex items-center justify-center",
                      viewMode === 'grid' ? "" : "h-6 w-6 sm:h-8 sm:w-8 shrink-0"
                    )}>
                      {settings.showGrid && viewMode === 'grid' && (
                        <div className="absolute inset-0 overflow-hidden opacity-[var(--grid-opacity)]" style={{ '--grid-opacity': settings.gridOpacity } as any}>
                          <svg width="100%" height="100%" className="text-primary/20">
                            <pattern id={`grid-${icon.id}`} width="50%" height="50%" patternUnits="userSpaceOnUse">
                              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                            </pattern>
                            <rect width="100%" height="100%" fill={`url(#grid-${icon.id})`} />
                          </svg>
                        </div>
                      )}

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width={viewportSize === 32 ? '32' : viewportSize === 16 ? '16' : '24'}
                        height={viewportSize === 32 ? '32' : viewportSize === 16 ? '16' : '24'}
                        style={{ ...transformStyle, transition: 'transform 0.3s ease' }}
                        className="transition-all"
                        role="img"
                        aria-hidden="true"
                      >
                         {(icon.paths || [{ d: icon.svgPath }]).map((p, i) => (
                           <path 
                            key={i} 
                            d={p.d} 
                            stroke={p.color || (customFillColor === 'none' ? 'currentColor' : (customFillColor === 'currentColor' ? 'currentColor' : customFillColor))} 
                            strokeOpacity={p.opacity ?? 1} 
                           />
                         ))}
                      </svg>
                    </div>

                    {viewMode === 'list' && (
                      <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                        <span className="truncate font-mono text-[11px] font-bold uppercase tracking-tight">{icon.name}</span>
                        <span className="truncate text-[9px] opacity-40 uppercase tracking-widest">{icon.category}</span>
                      </div>
                    )}

                    {viewMode === 'list' && isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}

                    {viewMode === 'grid' && isSelected && (
                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}

                    {hasNote && (
                      <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm" title="Has design notes" />
                    )}

                    {icon.isSynthesized && (
                      <div className={cn(
                        "rounded-full bg-purple-500",
                        viewMode === 'grid' ? "absolute bottom-1 right-1 h-1 w-1" : "h-1.5 w-1.5"
                      )} />
                    )}
                  </button>
                </TooltipTrigger>
                {viewMode === 'grid' && (
                  <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-wider">
                    {icon.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default React.memo(IconGrid);
