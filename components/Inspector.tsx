
import React from 'react';
import { IconData, ViewportSize, Weighting, IconAiMetadata, IconTransform } from '../types.ts';

interface InspectorProps {
  icon: IconData | null;
  allIcons: IconData[];
  viewportSize: ViewportSize;
  weighting: Weighting;
  setWeighting: (weight: Weighting) => void;
  isOpen: boolean;
  onToggle: () => void;
  customFillColor: string;
  setCustomFillColor: (color: string) => void;
  aiEnabled: boolean;
  aiMetadata?: IconAiMetadata | null;
  isGeneratingMetadata?: boolean;
  relatedIconIds?: string[];
  onSelectIcon: (id: string) => void;
  onCopySpec: () => void;
  onExportSingle: (icon: IconData) => void;
  transform: IconTransform;
}

const FILL_PRESETS = [
  { name: 'None', value: 'none' },
  { name: 'Accent', value: 'var(--system-accent)' },
  { name: 'Opaque', value: 'currentColor' },
];

const Inspector: React.FC<InspectorProps> = ({ 
  icon, allIcons, viewportSize, weighting, setWeighting, isOpen, onToggle, customFillColor, setCustomFillColor, aiEnabled, aiMetadata, isGeneratingMetadata, relatedIconIds, onSelectIcon, onCopySpec, onExportSingle, transform
}) => {
  const relatedIcons = allIcons.filter(i => relatedIconIds?.includes(i.id));

  const transformStyle = {
    transform: `rotate(${transform.rotate}deg) scale(${transform.scale}) ${transform.flipH ? 'scaleX(-1)' : ''} ${transform.flipV ? 'scaleY(-1)' : ''}`
  };

  const sw = weighting === 'bold' ? 3 : weighting === 'medium' ? 2 : 1.5;

  if (!icon && isOpen) return (
    <aside className="w-80 md:w-96 bg-white dark:bg-[#0a0a0a] border-l border-black/10 h-full p-8 text-center flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-dashed border-black/10 rounded-full animate-pulse"></div>
      <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">Awaiting_Selection</span>
    </aside>
  );

  return (
    <aside className={`relative h-full bg-white dark:bg-[#0a0a0a] border-l border-black/10 transition-all z-[80] shrink-0 overflow-y-auto custom-scrollbar ${isOpen ? 'w-80 md:w-96' : 'w-0 opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col h-full p-6 space-y-8 min-w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Inspector_v5.2</span>
          </div>
          <button onClick={onToggle} className="p-1 opacity-40 hover:opacity-100 hover:text-red-500 transition-all" aria-label="Close inspector">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Large Preview */}
        <div className="aspect-square bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
          <svg 
            style={{ width: '40%', height: '40%', ...transformStyle }} 
            className="text-accent transition-all duration-500 group-hover:scale-110 drop-shadow-xl" 
            fill={customFillColor} 
            stroke="currentColor" 
            strokeWidth={sw} 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon?.svgPath} />
          </svg>
          <div className="absolute bottom-4 right-4 flex gap-1">
             <span className="text-[8px] font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded opacity-40 uppercase">SVG_Path_Valid</span>
          </div>
        </div>

        {/* Identity & Metadata */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-[20px] font-black uppercase font-mono tracking-tighter leading-none">{icon?.name}</h3>
            <span className="text-[9px] font-mono opacity-30">ID: {icon?.id}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] bg-accent/10 px-2 py-0.5 rounded text-accent font-black uppercase border border-accent/20">#{icon?.category}</span>
            <button onClick={onCopySpec} className="text-[9px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded font-black uppercase border border-black/10 hover:border-accent hover:bg-accent/5 transition-all">Copy_Manifest</button>
            <button onClick={() => icon && onExportSingle(icon)} className="text-[9px] bg-accent text-white dark:text-black px-2 py-0.5 rounded font-black uppercase shadow-sm hover:scale-[1.02] active:scale-95 transition-all">Export_SVG</button>
          </div>
        </div>

        {/* Visual Overrides */}
        <div className="space-y-4 p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 rounded-xl">
           <div className="space-y-3">
              <label className="text-[9px] font-black opacity-40 uppercase tracking-widest">Fill_Style</label>
              <div className="flex flex-wrap gap-1.5">
                {FILL_PRESETS.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => setCustomFillColor(p.value)}
                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded border transition-all ${customFillColor === p.value ? 'bg-accent border-accent text-white dark:text-black shadow-sm' : 'border-black/10 dark:border-white/10 opacity-50 hover:opacity-100'}`}
                  >
                    {p.name}
                  </button>
                ))}
                <div className="relative flex items-center h-full ml-auto">
                   <input 
                    type="color" 
                    value={customFillColor.startsWith('#') ? customFillColor : '#000000'} 
                    onChange={(e) => setCustomFillColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                    title="Custom Color Fill"
                  />
                </div>
              </div>
           </div>
        </div>

        {/* AI Insights Section */}
        {aiEnabled && (
          <div className="p-4 bg-accent/[0.03] border border-accent/10 rounded-xl space-y-3 transition-colors">
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-accent uppercase tracking-widest">AI_Insights</span>
               {isGeneratingMetadata && <div className="w-1 h-1 bg-accent rounded-full animate-ping"></div>}
            </div>
            
            {isGeneratingMetadata ? (
              <div className="space-y-2">
                <div className="h-1.5 bg-accent/10 animate-pulse rounded w-full"></div>
                <div className="h-1.5 bg-accent/10 animate-pulse rounded w-4/5"></div>
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed font-medium opacity-80 italic">"{aiMetadata?.description || 'Synchronizing with visual intelligence core...'}"</p>
            )}
            
            {aiMetadata?.tags && aiMetadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {aiMetadata.tags.map(tag => (
                  <span key={tag} className="text-[7px] font-black uppercase tracking-tighter bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded opacity-60">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Assets Section */}
        {aiEnabled && relatedIcons.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Related_Assets</span>
              <span className="text-[8px] font-mono opacity-20">SEMANTIC_MATCH</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {relatedIcons.map(ri => (
                <button 
                  key={ri.id} 
                  onClick={() => onSelectIcon(ri.id)} 
                  className="aspect-square bg-black/[0.03] dark:bg-white/[0.03] rounded-lg flex items-center justify-center border border-black/5 dark:border-white/5 hover:border-accent hover:bg-accent/5 transition-all group/rel shadow-sm active:scale-95"
                  title={ri.name}
                >
                  <svg 
                    className="w-6 h-6 opacity-30 group-hover/rel:opacity-100 group-hover/rel:text-accent group-hover/rel:scale-110 transition-all duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={1.5} 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={ri.svgPath} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Technical Registry */}
        <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/10 space-y-2 text-[10px] font-mono opacity-20 uppercase">
          <div className="flex justify-between"><span>Status</span><span className="text-green-500">Verified_0x55</span></div>
          <div className="flex justify-between"><span>Grid_Unit</span><span>24x24_VEC</span></div>
          <div className="flex justify-between"><span>Weight_Mode</span><span>{weighting.toUpperCase()}</span></div>
        </div>
      </div>
    </aside>
  );
};

export default Inspector;
