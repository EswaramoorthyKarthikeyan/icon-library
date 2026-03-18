
import React from 'react';
import type { AppSettings, AIProviderId } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Zap, Eye, Type, AlertTriangle } from 'lucide-react';

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

const PROVIDER_DATA: Record<AIProviderId, {
  name: string;
  primaryModels: string[];
  advancedModels: string[];
  keyUrl: string;
  keyPlaceholder: string;
}> = {
  google: {
    name: "Google Gemini",
    primaryModels: ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
    advancedModels: ["gemini-1.5-pro", "gemini-2.0-flash"],
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIzaSy..."
  },
  openai: {
    name: "OpenAI",
    primaryModels: ["gpt-4o-mini", "gpt-3.5-turbo"],
    advancedModels: ["gpt-4o", "gpt-4-turbo"],
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-..."
  },
  anthropic: {
    name: "Anthropic",
    primaryModels: ["claude-3-haiku-20240307"],
    advancedModels: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229"],
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-..."
  },
  local: {
    name: "Local (Ollama)",
    primaryModels: ["llama3", "mistral", "phi3"],
    advancedModels: ["llama3", "codellama"],
    keyUrl: "https://ollama.com",
    keyPlaceholder: "none"
  }
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, updateSettings, onReset }) => {
  const updateProviderConfig = (id: AIProviderId, updates: any) => {
    const newProviders = { ...settings.providers };
    newProviders[id] = { ...newProviders[id], ...updates };
    updateSettings({ providers: newProviders });
  };

  const activeId = settings.activeProvider;
  const activeProvider = settings.providers[activeId];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold uppercase tracking-widest text-primary">
            <Settings className="h-5 w-5 shrink-0" />
            System Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-4">
          {/* Intelligence Layer */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Zap className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Intelligence Layer</h3>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base">Master AI Switch</Label>
                <p className="text-xs text-muted-foreground">Global toggle for all AI-powered modules</p>
              </div>
              <Switch
                checked={settings.aiEnabled}
                onCheckedChange={(checked) => updateSettings({ aiEnabled: checked })}
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Active Provider</p>
              <div className="flex gap-2">
                {(Object.keys(PROVIDER_DATA) as AIProviderId[]).map(id => (
                  <Button
                    key={id}
                    variant={activeId === id ? "default" : "outline"}
                    className="flex-1 text-[10px] font-bold uppercase"
                    onClick={() => updateSettings({ activeProvider: id })}
                  >
                    {id}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">{PROVIDER_DATA[activeId].name} Configuration</h4>
                <div className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${activeProvider.apiKey ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {activeProvider.apiKey ? 'Validated' : 'Key Missing'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase">Provider API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={activeProvider.apiKey}
                    onChange={(e) => updateProviderConfig(activeId, { apiKey: e.target.value })}
                    placeholder={PROVIDER_DATA[activeId].keyPlaceholder}
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Manage keys at <a href={PROVIDER_DATA[activeId].keyUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{PROVIDER_DATA[activeId].name} Console</a>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase">Primary Model</Label>
                    <Select
                      value={activeProvider.primaryModel}
                      onValueChange={(val) => updateProviderConfig(activeId, { primaryModel: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_DATA[activeId].primaryModels.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase">Advanced Model</Label>
                    <Select
                      value={activeProvider.advancedModel}
                      onValueChange={(val) => updateProviderConfig(activeId, { advancedModel: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_DATA[activeId].advancedModels.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interface Visuals */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Eye className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Interface Visuals</h3>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base">Blueprint Grid Visibility</Label>
                <p className="text-xs text-muted-foreground">Toggle background geometric guide lines</p>
              </div>
              <Switch
                checked={settings.showGrid}
                onCheckedChange={(checked) => updateSettings({ showGrid: checked })}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label className="font-medium">Grid Line Opacity</Label>
                <span className="font-mono text-xs text-primary">{Math.round(settings.gridOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={settings.gridOpacity}
                onChange={(e) => updateSettings({ gridOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Typography Config</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Primary Font Family</Label>
                <Select
                  value={settings.primaryFont}
                  onValueChange={(val) => updateSettings({ primaryFont: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_FONTS.map(f => <SelectItem key={f.family} value={f.family}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Monospace Font Family</Label>
                <Select
                  value={settings.monoFont}
                  onValueChange={(val) => updateSettings({ monoFont: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONO_FONTS.map(f => <SelectItem key={f.family} value={f.family}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-4 border-t">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-destructive">Danger Zone</p>
            <Button
              variant="destructive"
              className="w-full text-[10px] font-bold uppercase tracking-[0.1em]"
              onClick={onReset}
            >
              <AlertTriangle className="mr-2 h-3 w-3" />
              Reset All Application State
            </Button>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose} size="lg" className="w-full text-[10px] font-bold uppercase tracking-[0.1em]">
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
