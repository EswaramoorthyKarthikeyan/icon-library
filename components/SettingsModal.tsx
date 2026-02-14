
import React from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  onReset: () => void;
}

const PRIMARY_FONTS = [
  { name: 'Inter', family: 'Inter' },
  { name: 'Roboto', family: 'Roboto' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Space Grotesk', family: 'Space Grotesk' },
  { name: 'Outfit', family: 'Outfit' },
];

const MONO_FONTS = [
  { name: 'JetBrains Mono', family: 'JetBrains Mono' },
  { name: 'Fira Code', family: 'Fira Code' },
  { name: 'Space Mono', family: 'Space Mono' },
  { name: 'IBM Plex Mono', family: 'IBM Plex Mono' },
  { name: 'Source Code Pro', family: 'Source Code Pro' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, updateSettings, onReset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111111] border-2 border-black/20 dark:border-white/20 rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-accent animate-pulse rounded-sm" aria-hidden="true" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-black dark:text-white transition-colors">
              System_Preferences
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors group"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5 text-black/40 dark:text-white/20 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Section: AI Intelligence Layer */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <span className="opacity-40">01</span> Intelligence_Layer
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[12px] font-bold text-black dark:text-white">Enable AI Features</p>
                  <p className="text-[10px] text-black/40 dark:text-white/30 font-mono">Toggle Generator, Semantic Search & Insights</p>
                </div>
                <button 
                  onClick={() => updateSettings({ aiEnabled: !settings.aiEnabled })}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.aiEnabled ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.aiEnabled ? 'left-7 bg-white dark:bg-black' : 'left-1 bg-black/40 dark:bg-white/40'}`} />
                </button>
              </div>

              {settings.aiEnabled && (
                <div className="flex items-center justify-between group animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <p className="text-[12px] font-bold text-black dark:text-white">Persistent Semantic Cache</p>
                    <p className="text-[10px] text-black/40 dark:text-white/30 font-mono">Store AI generated metadata in local registry</p>
                  </div>
                  <div className="text-[10px] font-black uppercase opacity-20">Auto_Active</div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Interface */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <span className="opacity-40">02</span> Interface_Visuals
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[12px] font-bold text-black dark:text-white">Blueprint Grid Visibility</p>
                  <p className="text-[10px] text-black/40 dark:text-white/30 font-mono">Toggle background geometric guide lines</p>
                </div>
                <button 
                  onClick={() => updateSettings({ showGrid: !settings.showGrid })}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.showGrid ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.showGrid ? 'left-7 bg-white dark:bg-black' : 'left-1 bg-black/40 dark:bg-white/40'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-[12px] font-bold text-black dark:text-white">Grid Line Opacity</p>
                  <span className="text-[10px] font-mono text-accent">{Math.round(settings.gridOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.2" 
                  step="0.01" 
                  value={settings.gridOpacity}
                  onChange={(e) => updateSettings({ gridOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-accent bg-black/5 dark:bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Section: Typography */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <span className="opacity-40">03</span> Typography_Config
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-[12px] font-bold text-black dark:text-white">Primary Font Family</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_FONTS.map((font) => (
                    <button
                      key={font.family}
                      onClick={() => updateSettings({ primaryFont: font.family })}
                      className={`px-3 py-2 text-[10px] text-left transition-all rounded-md border ${settings.primaryFont === font.family ? 'bg-accent/10 border-accent text-accent font-black' : 'bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/40 hover:border-black/20 dark:hover:border-white/20'}`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[12px] font-bold text-black dark:text-white">Monospace Font Family</p>
                <div className="grid grid-cols-2 gap-2">
                  {MONO_FONTS.map((font) => (
                    <button
                      key={font.family}
                      onClick={() => updateSettings({ monoFont: font.family })}
                      className={`px-3 py-2 text-[10px] text-left transition-all rounded-md border ${settings.monoFont === font.family ? 'bg-accent/10 border-accent text-accent font-black' : 'bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/40 hover:border-black/20 dark:hover:border-white/20'}`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Behavior */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <span className="opacity-40">04</span> System_Behavior
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[12px] font-bold text-black dark:text-white">Auto Folder Export</p>
                  <p className="text-[10px] text-black/40 dark:text-white/30 font-mono">Automatically sort SVGs into category folders in ZIP</p>
                </div>
                <button 
                  onClick={() => updateSettings({ autoExportFolders: !settings.autoExportFolders })}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.autoExportFolders ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.autoExportFolders ? 'left-7 bg-white dark:bg-black' : 'left-1 bg-black/40 dark:bg-white/40'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[12px] font-bold text-black dark:text-white">UI Scale Density</p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                  {(['compact', 'standard'] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => updateSettings({ uiDensity: density })}
                      className={`py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${settings.uiDensity === density ? 'bg-white dark:bg-black text-accent shadow-sm' : 'text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white'}`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Danger Zone */}
          <section className="pt-6 border-t border-black/10 dark:border-white/10 space-y-4">
            <p className="text-[10px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">Danger_Zone</p>
            <button 
              onClick={onReset}
              className="w-full py-3 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-sm"
            >
              Reset All Application State
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/10 dark:border-white/10 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-accent text-white dark:text-black text-[11px] font-black uppercase tracking-[0.15em] rounded-md shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
