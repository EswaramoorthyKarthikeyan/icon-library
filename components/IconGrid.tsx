
import React from 'react';
import { IconData, ViewportSize } from '../types';

interface IconGridProps {
  title: string;
  index: string;
  items: IconData[];
  itemCount: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  weighting: string;
  viewportSize: ViewportSize;
}

const IconGrid: React.FC<IconGridProps> = ({
  title,
  index,
  items,
  itemCount,
  selectedId,
  onSelect,
  weighting,
  viewportSize
}) => {
  const getStrokeWidth = () => {
    switch(weighting) {
      case 'medium': return 2;
      case 'bold': return 3;
      default: return 1.5;
    }
  };

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between border-b-2 border-black/15 dark:border-white/10 pb-4 mb-8 transition-colors duration-300">
        <h2 className="text-[13px] font-black text-black dark:text-white uppercase tracking-[0.3em] flex items-center gap-4 transition-colors">
          <span className="text-black/40 dark:text-white/30 font-mono text-[11px] transition-colors">{index}</span>
          {title}
        </h2>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 text-black/70 dark:text-white/50 uppercase tracking-tighter rounded-sm shadow-sm">
            Native_{viewportSize}px
          </span>
          <span className="text-[10px] font-mono text-black/50 dark:text-white/30 uppercase tracking-widest transition-colors font-bold">SET_{index} // {itemCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 border-l border-t border-black/15 dark:border-white/10 transition-colors bg-white/30 dark:bg-transparent backdrop-blur-sm rounded-sm overflow-hidden shadow-sm">
        {items.map((icon) => (
          <div
            key={icon.id}
            onClick={() => onSelect(icon.id)}
            className={`
              relative aspect-square flex flex-col items-center justify-center border-r border-b border-black/15 dark:border-white/10 cursor-pointer group transition-all duration-200
              ${selectedId === icon.id ? 'bg-accent/15 scale-[1.02] z-10 shadow-xl' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'}
            `}
          >
            {/* Selection Dot */}
            {icon.isSelected && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full transition-colors shadow-[0_0_8px_var(--system-accent)]"></div>
            )}

            {/* Icon Container with Fixed native sizing based on ViewportSize */}
            <div className="flex items-center justify-center mb-5" style={{ width: '56px', height: '56px' }}>
              <svg 
                style={{ width: `${viewportSize}px`, height: `${viewportSize}px` }}
                className={`transition-all group-hover:scale-125 ${selectedId === icon.id ? 'text-accent drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]' : 'text-black/70 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'}`} 
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
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${selectedId === icon.id ? 'text-accent opacity-100' : 'text-black/50 dark:text-white/30 group-hover:text-black/80 dark:group-hover:text-white/60'}`}>
              {icon.name}
            </span>

            {/* Selection Active Border */}
            {selectedId === icon.id && (
              <div className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-accent shadow-[inset_0_0_20px_rgba(var(--system-accent),0.1)]"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default IconGrid;
