
import React from 'react';
import { IconData, ViewportSize } from '../types.ts';

interface InspectorProps {
  icon: IconData | null;
  viewportSize: ViewportSize;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}

const Inspector: React.FC<InspectorProps> = ({ 
  icon, 
  viewportSize, 
  isMinimized, 
  onToggleMinimize, 
  onClose 
}) => {
  if (!icon) return null;

  return (
    <div className={`fixed bottom-12 right-12 bg-white dark:bg-[#111111] border-2 border-black/20 dark:border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] ${isMinimized ? 'h-14 w-64' : 'h-[540px] w-80'}`}>
      <div className="px-6 py-4 border-b border-black/10 dark:border-white/5 flex items-center justify-between bg-black/[0.03] dark:bg-white/[0.02] cursor-default">
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--system-accent)] ${isMinimized ? 'animate-pulse' : ''}`}></div>
           <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-[0.2em] transition-colors">Inspector</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleMinimize}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-all text-black/60 dark:text-white/40 hover:text-accent"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7M19 5l-7 7-7-7" /></svg>
            )}
          </button>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-md transition-all text-black/60 dark:text-white/40 hover:text-red-600"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-7 space-y-7 animate-in fade-in zoom-in-95 duration-400">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-accent/10 border-2 border-accent/20 flex items-center justify-center rounded-lg transition-colors shadow-inner">
              <svg className="w-10 h-10 text-accent transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon.svgPath} />
              </svg>
            </div>
            <div>
              <h3 className="text-[14px] font-black text-black dark:text-white font-mono mb-1.5 transition-colors tracking-tight">{icon.name}_main.svg</h3>
              <div className="flex gap-2">
                <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-black/60 dark:text-white/40 font-mono font-bold uppercase tracking-wide transition-colors">{viewportSize} x {viewportSize} PX</span>
                <span className="text-[10px] bg-accent/10 px-2 py-0.5 rounded text-accent font-mono font-bold uppercase tracking-wide transition-colors">{icon.category}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 bg-black/[0.02] dark:bg-white/[0.01] p-4 rounded-lg border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-center text-[11px] font-mono border-b border-black/10 dark:border-white/10 pb-2.5 transition-colors">
              <span className="text-black/50 dark:text-white/30 font-bold uppercase tracking-wider">Stroke Linecap</span>
              <span className="text-black dark:text-white font-black">round</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono border-b border-black/10 dark:border-white/10 pb-2.5 transition-colors">
              <span className="text-black/50 dark:text-white/30 font-bold uppercase tracking-wider">Stroke Linejoin</span>
              <span className="text-black dark:text-white font-black">round</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-black/50 dark:text-white/30 font-bold uppercase tracking-wider transition-colors">Fill Rule</span>
              <span className="text-black dark:text-white font-black transition-colors">evenodd</span>
            </div>
          </div>

          <div className="bg-black/90 dark:bg-black/60 rounded-lg p-5 border border-white/10 group relative overflow-hidden transition-all shadow-lg hover:ring-2 hover:ring-accent/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">SVG DATA_SOURCE</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
              </div>
            </div>
            <code className="text-[10px] font-mono text-white/80 break-all leading-relaxed line-clamp-4 select-all">
              {`<path d="${icon.svgPath}" stroke-linecap="round" stroke-linejoin="round" />`}
            </code>
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2.5 bg-accent text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-lg transition-all shadow-xl active:scale-[0.98] hover:brightness-110">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
              Copy Path
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspector;
