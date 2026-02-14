
import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const Footer: React.FC<FooterProps> = ({ theme, setTheme }) => {
  return (
    <footer className="h-12 border-t border-black/15 dark:border-white/10 px-8 flex items-center justify-between bg-white dark:bg-[#0a0a0a] z-[50] transition-colors duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest transition-colors">View</span>
          <span className="text-[10px] font-mono font-black text-black/80 dark:text-white/80 transition-colors px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded">GRID_30PX</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest transition-colors">Scale</span>
          <span className="text-[10px] font-mono font-black text-black/80 dark:text-white/80 transition-colors px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded">100%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest transition-colors">Build</span>
          <span className="text-[10px] font-mono font-black text-black/80 dark:text-white/80 transition-colors">V4.0.2_PROD</span>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4 border-r border-black/10 dark:border-white/10 pr-10 transition-colors">
          <span className="text-[10px] font-black text-black/50 dark:text-white/30 uppercase tracking-[0.2em] transition-colors">System Environment</span>
          <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-full p-1 border border-black/10 dark:border-white/10 transition-all shadow-inner">
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 px-3 rounded-full transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-black text-white shadow-lg scale-105' : 'opacity-40 hover:opacity-70'}`}
              title="Dark Mode"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              {theme === 'dark' && <span className="text-[8px] font-black uppercase">Dark</span>}
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 px-3 rounded-full transition-all flex items-center gap-2 ${theme === 'light' ? 'bg-white text-black shadow-lg scale-105' : 'opacity-40 hover:opacity-70'}`}
              title="Light Mode"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
              {theme === 'light' && <span className="text-[8px] font-black uppercase">Light</span>}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <span className="text-[10px] font-black text-black/60 dark:text-white/40 uppercase tracking-[0.25em] transition-colors group-hover:text-green-600">Sync Active</span>
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
