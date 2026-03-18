
import React, { useState } from 'react';
import type { AIProviderId } from '../types';
import { validateProviderKey } from '../hooks/ai-providers/factory';
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
import { Zap } from 'lucide-react';

interface AiKeyPromptProps {
    onSave: (provider: AIProviderId, key: string) => void;
    onSkip: () => void;
}

const PROVIDERS: { id: AIProviderId; name: string; url: string; placeholder: string }[] = [
    { id: 'google', name: 'Google Gemini', url: 'https://aistudio.google.com/app/apikey', placeholder: 'AIzaSy...' },
    { id: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys', placeholder: 'sk-...' },
    { id: 'anthropic', name: 'Anthropic', url: 'https://console.anthropic.com/settings/keys', placeholder: 'sk-ant-...' }
];

const AiKeyPrompt: React.FC<AiKeyPromptProps> = ({ onSave, onSkip }) => {
    const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('google');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!key.trim()) {
            setError('Please enter an API key or skip.');
            return;
        }
        if (!validateProviderKey(selectedProvider, key.trim())) {
            setError(`Invalid ${selectedProvider} API key format.`);
            return;
        }
        onSave(selectedProvider, key.trim());
    };

    const currentProviderData = PROVIDERS.find(p => p.id === selectedProvider)!;

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onSkip()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 uppercase tracking-wide">
                        <Zap className="h-5 w-5" />
                        Initialize AI
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary opacity-50 uppercase">01</span>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Choose Provider</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {PROVIDERS.map(p => (
                                <Button
                                    key={p.id}
                                    variant={selectedProvider === p.id ? "default" : "outline"}
                                    onClick={() => { setSelectedProvider(p.id); setError(''); }}
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                >
                                    {p.id}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary opacity-50 uppercase">02</span>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Security Credentials</h3>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase">{currentProviderData.name} API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={key}
                                onChange={(e) => {
                                    setKey(e.target.value);
                                    setError('');
                                }}
                                placeholder={currentProviderData.placeholder}
                                className={`font-mono text-xs ${error ? 'border-destructive' : ''}`}
                            />
                            {error && <p className="text-[10px] text-destructive">{error}</p>}
                            <p className="text-[10px] text-muted-foreground">
                                Credentials are stored locally. Obtain your key at <a href={currentProviderData.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{currentProviderData.name} Console</a>.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button variant="ghost" className="text-[10px] text-muted-foreground uppercase" onClick={onSkip}>
                        Skip Initialization
                    </Button>
                    <Button onClick={handleSave} className="text-[10px] font-bold uppercase tracking-[0.1em]">
                        <Zap className="mr-2 h-4 w-4" />
                        Activate System
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AiKeyPrompt;
