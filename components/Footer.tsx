import React from 'react';
import { AppTheme } from '../types';
import { Monitor, Moon, Sun } from 'lucide-react';

interface FooterProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const Footer: React.FC<FooterProps> = ({ theme, setTheme }) => {
  return (
    <div className="flex h-12 items-center justify-between border-t bg-background px-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground/40">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
            Registry_Connected
          </span>
        </div>
        <div className="h-3 w-px bg-muted" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/30">
          Explorer v5.0.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-8 items-center rounded-lg border bg-muted/30 p-1">
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as AppTheme)}
              className={`flex h-full items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-tight transition-all ${theme === t.id
                ? 'bg-background text-primary shadow-sm ring-1 ring-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
            >
              <t.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Footer);
