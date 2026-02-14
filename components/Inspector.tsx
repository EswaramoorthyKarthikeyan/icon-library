
import React from 'react';
import { IconData, ViewportSize, Weighting, IconAiMetadata, IconTransform } from '../types.ts';
import { ICON_LIBRARY } from '../constants.tsx';

interface InspectorProps {
  icon: IconData | null;
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
  transform: IconTransform;
}

const Inspector: React.FC<InspectorProps> = ({ 
  icon, viewportSize, weighting, setWeighting, isOpen, onToggle, customFillColor, setCustomFillColor, aiEnabled, aiMetadata, isGeneratingMetadata, relatedIconIds, onSelectIcon, onCopySpec, transform
}) => {
  const allIcons = Object.values(ICON_LIBRARY).flat();
  const relatedIcons = allIcons.filter(i => relatedIconIds?.includes(i.id));

  const transformStyle = {
    transform: `rotate(${transform.rotate}deg) scale(${transform.scale}) ${transform.flipH ? 'scaleX(-1)' : ''} ${transform.flipV ? 'scaleY(-1)' : ''}`
  };

  if (!icon && isOpen) return <aside className="w-80 bg-white dark:bg-[#0a0a0a] border-l border-black/10 h-full p-8 text-center"><span className="text-[10px] font-black opacity-20 uppercase">No_Selection</span></aside>;

  return (
    <aside className={`relative h-full bg-white dark:bg-[#0a0a0a] border-l border-black/10 transition-all z-[80] shrink-0 ${isOpen ? 'w-80 md:w-96' : 'w-0 opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col h-full overflow-hidden p-6 space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Inspector_05</span>
          <button onClick={onToggle} className="opacity-40 hover:text-red-500" aria-label="Close inspector"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="aspect-square bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 rounded-xl flex items-center justify-center relative overflow-hidden">
          <svg style={{ width: '40%', height: '40%', ...transformStyle }} className="text-accent transition-transform duration-300" fill={customFillColor} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon?.svgPath} />
          </svg>
        </div>

        <div className="space-y-4">
          <h3 className="text-[18px] font-black uppercase font-mono truncate">{icon?.name}</h3>
          <div className="flex gap-2">
            <span className="text-[9px] bg-accent/10 px-2 py-0.5 rounded text-accent font-black uppercase">#{icon?.category}</span>
            <button onClick={onCopySpec} className="text-[9px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded font-black uppercase border border-black/10 hover:border-accent">Copy_Manifest</button>
          </div>
        </div>

        {aiEnabled && (
          <div className="p-4 bg-accent/[0.02] border border-accent/10 rounded-lg space-y-2">
            <span className="text-[9px] font-black text-accent uppercase tracking-widest">AI_Insights</span>
            {isGeneratingMetadata ? (
              <div className="h-10 bg-black/5 dark:bg-white/5 animate-pulse rounded"></div>
            ) : (
              <p className="text-[11px] leading-relaxed italic opacity-70">"{aiMetadata?.description || 'Semantic analysis pending...'}"</p>
            )}
            {aiMetadata?.tags && aiMetadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {aiMetadata.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[7px] font-black uppercase tracking-tighter opacity-40">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {aiEnabled && relatedIcons.length > 0 && (
          <div className="space-y-4">
            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Related_Assets</span>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {relatedIcons.map(ri => (
                <button key={ri.id} onClick={() => onSelectIcon(ri.id)} className="w-12 h-12 shrink-0 bg-black/5 dark:bg-white/5 rounded flex items-center justify-center border border-transparent hover:border-accent transition-all group/rel">
                  <svg className="w-6 h-6 opacity-60 group-hover/rel:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d={ri.svgPath} /></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2 text-[10px] font-mono opacity-20 uppercase">
          <div className="flex justify-between"><span>Status</span><span>Verified_AX</span></div>
          <div className="flex justify-between"><span>Registry</span><span>Core.05</span></div>
        </div>
      </div>
    </aside>
  );
};

export default Inspector;
