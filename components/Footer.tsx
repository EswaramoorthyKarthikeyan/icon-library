
import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const Footer: React.FC<FooterProps> = ({ theme, setTheme }) => {
  return (
    <footer className="h-10 border-t border-black/10 dark:border-white/5 px-8 flex items-center justify-between bg-white dark:bg-[#0a0a0a] z-[50] transition-colors duration-300" aria-label="Application footer">
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-mono text-black/40 dark:text-white/20 uppercase tracking-[0.2em]">
          Core_UI_Explorer v4.0.2
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span id="theme-toggle-label" className="text-[9px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest transition-colors">
            Appearance
          </span>
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-0.5 border border-black/10 dark:border-white/10 transition-all" role="group" aria-labelledby="theme-toggle-label">
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1 px-2.5 rounded-full transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent ${theme === 'dark' ? 'bg-black text-white shadow-sm' : 'opacity-40 hover:opacity-70'}`}
              aria-pressed={theme === 'dark'}
              title="Dark Mode"
            >
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              <span className="text-[8px] font-black uppercase">Dark</span>
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`p-1 px-2.5 rounded-full transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'opacity-40 hover:opacity-70'}`}
              aria-pressed={theme === 'light'}
              title="Light Mode"
            >
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
              <span className="text-[8px] font-black uppercase">Light</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
