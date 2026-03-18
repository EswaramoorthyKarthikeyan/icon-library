import React from 'react';
import type { AppTheme } from '../types';
import { Monitor, Moon, Sun } from 'lucide-react';

interface FooterProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isMobile?: boolean;
}

const Footer: React.FC<FooterProps> = ({ theme, setTheme, isMobile = false }) => {
  return (
    <div className={`flex h-10 sm:h-12 items-center justify-between border-t bg-background px-3 sm:px-6 transition-all duration-300 gap-2 sm:gap-4`}>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground/40 flex-shrink-0">
          <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className={`font-mono text-[7px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] ${isMobile ? 'hidden' : ''}`}>
            Registry_Connected
          </span>
        </div>
        {!isMobile && (
          <>
            <div className="h-2 w-px sm:h-3 bg-muted" />
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/30 hidden sm:inline">
              Explorer v5.0.0
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className={`flex h-7 sm:h-8 items-center rounded-lg border bg-muted/30 p-0.5 sm:p-1`}>
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as AppTheme)}
              className={`flex h-full items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-tight transition-all ${theme === t.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
            >
              <t.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Footer);
