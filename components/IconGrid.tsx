
import React from 'react';
import { IconData, ViewportSize, Weighting, IconTransform, IconAiMetadata, ViewMode } from '../types';
import { getStrokeWidth, getTransformStyle } from '../utils/svg';
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
  viewMode: ViewMode;
  onPreview: (id: string | null) => void;
  onToggle: (id: string) => void;
  onAddToRecent: (id: string) => void;
}

const IconGrid: React.FC<IconGridProps> = ({
  category, icons, viewportSize, weighting, transform, activeIconId, selectedIds,
  settings, aiMetadataCache, customFillColor, viewMode, onPreview, onToggle, onAddToRecent
}) => {
  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);

  // Responsive grid sizing handled by Tailwind grid classes or inline style if dynamic
  const gridMinSize = viewportSize === 32 ? '60px' : viewportSize === 16 ? '40px' : '52px';

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-3">
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
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border transition-colors",
              icons.every(i => selectedIds.has(i.id))
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {icons.every(i => selectedIds.has(i.id)) && <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
          </button>
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary">
            {category}
          </span>
          <div className="h-px w-24 bg-gradient-to-r from-primary/40 to-transparent" />
          <span className="font-mono text-[10px] opacity-30">{icons.length} units</span>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-2",
          viewMode === 'grid'
            ? ""
            : "grid-cols-1"
        )}
        style={viewMode === 'grid' ? { gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinSize}, 1fr))` } : {}}
      >
        <TooltipProvider>
          {icons.map(icon => {
            const isActive = icon.id === activeIconId;
            const isSelected = selectedIds.has(icon.id);
            // const meta = settings.aiEnabled ? aiMetadataCache[icon.id] : null;

            return (
              <Tooltip key={icon.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      onPreview(icon.id);
                      onToggle(icon.id);
                      onAddToRecent(icon.id);
                    }}
                    className={cn(
                      "relative flex items-center rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      viewMode === 'grid' ? "aspect-square justify-center" : "h-12 px-4 gap-4",
                      isActive
                        ? "z-10 scale-[1.02] border-primary bg-accent shadow-md"
                        : isSelected
                          ? "border-primary/50 bg-secondary"
                          : "border-border bg-card hover:z-10 hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "relative flex items-center justify-center",
                      viewMode === 'grid' ? "" : "h-8 w-8 shrink-0"
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
                        fill={customFillColor === 'currentColor' ? 'none' : (customFillColor === 'none' ? 'none' : customFillColor)}
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width={viewportSize === 32 ? '32' : viewportSize === 16 ? '16' : '24'}
                        height={viewportSize === 32 ? '32' : viewportSize === 16 ? '16' : '24'}
                        style={{ ...transformStyle, transition: 'transform 0.3s ease' }}
                      >
                        <path d={icon.svgPath} />
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
