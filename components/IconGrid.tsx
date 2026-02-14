
import React from 'react';
import { IconData, ViewportSize, IconTransform } from '../types';

interface IconGridProps {
  title: string;
  index: string;
  items: IconData[];
  itemCount: string;
  activeId: string | null;
  selectedIds: Set<string>;
  onPreview: (id: string) => void;
  onToggle: (id: string) => void;
  weighting: string;
  viewportSize: ViewportSize;
  aiMatchedIds?: string[] | null;
  transform: IconTransform;
}

const IconGrid: React.FC<IconGridProps> = ({
  title,
  index,
  items,
  itemCount,
  activeId,
  selectedIds,
  onPreview,
  onToggle,
  weighting,
  viewportSize,
  aiMatchedIds,
  transform
}) => {
  const getStrokeWidth = () => {
    switch(weighting) {
      case 'medium': return 2;
      case 'bold': return 3;
      default: return 1.5;
    }
  };

  // Calculate transform style for icons based on batch transform settings
  const getTransformStyle = () => {
    return {
      transform: `rotate(${transform.rotate}deg) scale(${transform.scale}) ${transform.flipH ? 'scaleX(-1)' : ''} ${transform.flipV ? 'scaleY(-1)' : ''}`
    };
  };

  return (
    <section className="mb-20" role="region" aria-labelledby={`grid-header-${index}`}>
      <div className="flex items-center justify-between border-b-2 border-black/15 dark:border-white/10 pb-4 mb-8 transition-colors duration-300">
        <h2 id={`grid-header-${index}`} className="text-[13px] font-black text-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-4 transition-colors">
          <span className="text-black/40 dark:text-white/30 font-mono text-[11px] transition-colors" aria-hidden="true">{index}</span>
          {title}
        </h2>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 text-black/70 dark:text-white/50 uppercase tracking-tighter rounded-sm shadow-sm" aria-label={`Native size ${viewportSize} pixels`}>
            Native_{viewportSize}px
          </span>
          <span className="text-[10px] font-mono text-black/50 dark:text-white/30 uppercase tracking-widest transition-colors font-bold" aria-label={`${itemCount} total items in this set`}>SET_{index} // {itemCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 border-l border-t border-black/15 dark:border-white/10 transition-colors bg-white/30 dark:bg-transparent backdrop-blur-sm rounded-sm overflow-hidden shadow-sm">
        {items.map((icon) => {
          const isAiMatched = aiMatchedIds?.includes(icon.id);
          return (
            <div
              key={icon.id}
              className={`
                relative aspect-square flex flex-col items-center justify-center border-r border-b border-black/15 dark:border-white/10 cursor-pointer group transition-all duration-200
                ${activeId === icon.id ? 'z-10 bg-accent/[0.03] ring-1 ring-inset ring-accent/30 shadow-inner' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'}
                ${isAiMatched ? 'bg-accent/[0.05]' : ''}
              `}
              onClick={() => onPreview(icon.id)}
              role="button"
              tabIndex={0}
              aria-label={`Preview ${icon.name} icon`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPreview(icon.id)}
            >
              {/* AI Match Glow */}
              {isAiMatched && (
                <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none"></div>
              )}

              {/* Multi-Selection Checkbox Marker - Separate Hit Area */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(icon.id);
                }}
                className={`absolute top-3 left-3 w-4 h-4 border rounded-sm transition-all flex items-center justify-center z-20 ${selectedIds.has(icon.id) ? 'bg-accent border-accent scale-110 shadow-sm' : 'border-black/20 dark:border-white/20 bg-white/50 dark:bg-black/50 opacity-40 group-hover:opacity-100 hover:border-accent'}`}
                aria-label={`Select ${icon.name} for export`}
                aria-pressed={selectedIds.has(icon.id)}
              >
                {selectedIds.has(icon.id) && (
                  <svg className="w-2.5 h-2.5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>

              {/* Active Inspector Marker */}
              {activeId === icon.id && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_var(--system-accent)]" aria-hidden="true"></div>
              )}

              {/* Icon Container */}
              <div className="flex items-center justify-center mb-5" style={{ width: '56px', height: '56px' }} aria-hidden="true">
                <svg 
                  style={{ width: `${viewportSize}px`, height: `${viewportSize}px`, ...getTransformStyle() }}
                  className={`transition-all group-hover:scale-110 ${activeId === icon.id ? 'text-accent drop-shadow-[0_0_2px_rgba(0,0,0,0.1)]' : 'text-black/70 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={getStrokeWidth()}
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  viewBox="0 0 24 24"
                >
                  <path d={icon.svgPath} />
                </svg>
              </div>

              {/* Label */}
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeId === icon.id ? 'text-accent opacity-100' : 'text-black/50 dark:text-white/30 group-hover:text-black/80 dark:group-hover:text-white/60'}`} aria-hidden="true">
                {icon.name}
              </span>
              
              {isAiMatched && (
                <span className="absolute bottom-1 right-2 text-[6px] font-black text-accent uppercase tracking-tighter opacity-60">AI_Matched</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default IconGrid;
