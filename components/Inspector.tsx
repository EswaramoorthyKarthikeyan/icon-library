
import React, { useState, useMemo } from 'react';
import { IconData, ViewportSize, Weighting, IconAiMetadata } from '../types.ts';

interface InspectorProps {
  icon: IconData | null;
  viewportSize: ViewportSize;
  weighting: Weighting;
  setWeighting: (weight: Weighting) => void;
  isOpen: boolean;
  onToggle: () => void;
  customFillColor: string;
  setCustomFillColor: (color: string) => void;
  aiMetadata?: IconAiMetadata | null;
  isGeneratingMetadata?: boolean;
}

type ExportFormat = 'react' | 'vue' | 'tailwind' | 'svg';

const PRESET_FILL_COLORS = [
  { name: 'None', value: 'none' },
  { name: 'Accent', value: 'currentColor' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
];

const Inspector: React.FC<InspectorProps> = ({ 
  icon, 
  viewportSize, 
  weighting,
  setWeighting,
  isOpen, 
  onToggle,
  customFillColor,
  setCustomFillColor,
  aiMetadata,
  isGeneratingMetadata
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('react');

  const getStrokeWidth = () => {
    switch(weighting) {
      case 'medium': return 2;
      case 'bold': return 3;
      default: return 1.5;
    }
  };

  const capitalize = (s: string) => s.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

  const generatedCode = useMemo(() => {
    if (!icon) return '';
    const sw = getStrokeWidth();
    const componentName = `Icon${capitalize(icon.name)}`;

    switch (exportFormat) {
      case 'react':
        return `export const ${componentName} = ({ size = ${viewportSize}, strokeWidth = ${sw}, color = "currentColor", ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="${customFillColor === 'none' ? 'none' : customFillColor}" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="${icon.svgPath}" />
  </svg>
);`;
      case 'vue':
        return `<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="${customFillColor === 'none' ? 'none' : customFillColor}" 
    stroke="currentColor" 
    :stroke-width="strokeWidth" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <path d="${icon.svgPath}" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: ${viewportSize} },
  strokeWidth: { type: Number, default: ${sw} }
})
</script>`;
      case 'tailwind':
        return `<svg 
  class="w-${viewportSize / 4} h-${viewportSize / 4} text-current" 
  fill="${customFillColor === 'none' ? 'none' : customFillColor}" 
  stroke="currentColor" 
  stroke-width="${sw}" 
  viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg"
>
  <path stroke-linecap="round" stroke-linejoin="round" d="${icon.svgPath}" />
</svg>`;
      case 'svg':
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportSize}" height="${viewportSize}" viewBox="0 0 24 24" fill="${customFillColor}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${icon.svgPath}" />
</svg>`;
    }
  }, [exportFormat, icon, viewportSize, weighting, customFillColor]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!icon && isOpen) {
    return (
        <aside className="w-80 md:w-96 shrink-0 bg-white dark:bg-[#0a0a0a] border-l border-black/15 dark:border-white/10 h-full flex flex-col items-center justify-center p-12 text-center animate-in slide-in-from-right duration-500 overflow-hidden">
            <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-black/20 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/20">Empty_Selection</p>
            <p className="text-[10px] font-mono mt-2 text-black/30 dark:text-white/10 max-w-[180px]">Select an asset from the system grid to inspect metadata.</p>
        </aside>
    );
  }

  return (
    <aside 
      className={`
        relative h-full bg-white dark:bg-[#0a0a0a] border-l border-black/15 dark:border-white/10
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-[80] shrink-0
        ${isOpen ? 'w-80 md:w-96' : 'w-0 border-l-0 opacity-0 pointer-events-none'}
      `}
      aria-label="Asset Inspector Sidebar"
    >
      <div className="flex flex-col h-full w-80 md:w-96 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--system-accent)]" aria-hidden="true"></div>
             <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.2em] whitespace-nowrap">Inspector_Panel</span>
          </div>
          <button 
            onClick={onToggle}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all text-black/40 dark:text-white/20 hover:text-accent"
            aria-label="Close inspector"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-7 space-y-8">
            
            {/* Section: Preview */}
            <div className="space-y-6">
              <div className="w-full aspect-square bg-black/[0.03] dark:bg-white/[0.03] border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center rounded-xl relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none blueprint-grid" aria-hidden="true"></div>
                 <svg 
                    style={{ width: '40%', height: '40%' }}
                    className="text-accent drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" 
                    fill={customFillColor} 
                    stroke="currentColor" 
                    strokeWidth={getStrokeWidth()} 
                    viewBox="0 0 24 24"
                 >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon?.svgPath} />
                </svg>
              </div>
              
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[9px] bg-accent/10 px-2 py-0.5 rounded text-accent font-black uppercase tracking-widest whitespace-nowrap">{icon?.category}</span>
                  <span className="text-[9px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-black/40 dark:text-white/20 font-mono whitespace-nowrap">UID: {icon?.id}</span>
                </div>
                <h3 className="text-[18px] font-black text-black dark:text-white font-mono tracking-tight uppercase truncate" title={icon?.name}>{icon?.name}</h3>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black text-accent uppercase tracking-[0.15em] block whitespace-nowrap">AI_Semantic_Insights</label>
                 {isGeneratingMetadata && <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>}
              </div>
              
              <div className="bg-accent/[0.03] dark:bg-white/[0.01] border border-accent/10 rounded-lg p-4 space-y-4">
                 {isGeneratingMetadata ? (
                   <div className="space-y-3">
                     <div className="h-3 w-3/4 bg-black/5 dark:bg-white/5 animate-pulse rounded"></div>
                     <div className="flex gap-2">
                        <div className="h-4 w-12 bg-black/5 dark:bg-white/5 animate-pulse rounded-full"></div>
                        <div className="h-4 w-16 bg-black/5 dark:bg-white/5 animate-pulse rounded-full"></div>
                     </div>
                   </div>
                 ) : aiMetadata ? (
                   <>
                     <p className="text-[11px] text-black/70 dark:text-white/60 leading-relaxed font-medium italic">
                        "{aiMetadata.description}"
                     </p>
                     <div className="flex flex-wrap gap-1.5">
                        {aiMetadata.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-black/5 dark:border-white/10 text-black/40 dark:text-white/30">
                            #{tag.replace(/\s+/g, '_')}
                          </span>
                        ))}
                     </div>
                   </>
                 ) : (
                   <p className="text-[9px] font-mono text-black/30 dark:text-white/20 uppercase tracking-widest">Awaiting context generation...</p>
                 )}
              </div>
            </div>

            {/* Section: Controls */}
            <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/30 dark:text-white/20 uppercase tracking-[0.15em] block whitespace-nowrap">Stroke_Weight</label>
                  <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-md border border-black/5 dark:border-white/5">
                    {(['regular', 'medium', 'bold'] as Weighting[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeighting(w)}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded ${weighting === w ? 'bg-accent text-white dark:text-black shadow-sm' : 'text-black/40 dark:text-white/20 hover:text-black dark:hover:text-white'}`}
                      >
                        {w.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/30 dark:text-white/20 uppercase tracking-[0.15em] block whitespace-nowrap">Fill_Mode</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FILL_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setCustomFillColor(color.value)}
                        className={`w-5 h-5 rounded border transition-all relative overflow-hidden shrink-0 ${customFillColor === color.value ? 'border-accent ring-1 ring-accent ring-offset-1 dark:ring-offset-black' : 'border-black/10 dark:border-white/10 hover:border-black/30'}`}
                        style={{ backgroundColor: color.value === 'none' || color.value === 'currentColor' ? 'transparent' : color.value }}
                      >
                        {color.value === 'none' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45"></div></div>}
                        {color.value === 'currentColor' && <div className="absolute inset-0 bg-accent opacity-60"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Code Generation */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-[10px] font-black text-black/30 dark:text-white/20 uppercase tracking-[0.15em] block">Module_Export</label>
                <div className="flex flex-wrap gap-2">
                  {(['react', 'vue', 'tailwind', 'svg'] as ExportFormat[]).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${exportFormat === format ? 'text-accent bg-accent/10 underline decoration-2 underline-offset-4' : 'text-black/30 dark:text-white/20 hover:text-black'}`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0c0c0c] rounded-xl p-5 border border-white/5 group relative overflow-hidden transition-all shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">{exportFormat}_output</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                  </div>
                </div>
                <div className="overflow-auto max-h-[240px] custom-scrollbar scroll-smooth">
                  <pre className="text-[10px] font-mono text-white/60 whitespace-pre leading-relaxed select-all">
                    {generatedCode}
                  </pre>
                </div>
                
                <button 
                  onClick={copyCode}
                  className="absolute bottom-3 right-3 p-2 bg-white/5 hover:bg-accent hover:text-white dark:hover:text-black rounded-lg transition-all text-white/30 backdrop-blur-md z-10"
                  aria-label="Copy code"
                >
                  {isCopied ? (
                      <svg className="w-4 h-4 animate-in zoom-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Meta */}
        <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/10 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between opacity-30 text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
              <span>Last_Sync</span>
              <span>02:44:01_UTC</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Inspector;
