
import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ShortcutLegendProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutLegend: React.FC<ShortcutLegendProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Cmd+K', action: 'Focus Search' },
        { key: 'Cmd+Z', action: 'Undo Operation' },
        { key: 'Cmd+Shift+Z', action: 'Redo Operation' },
        { key: 'Cmd+A', action: 'Select All Filtered' },
        { key: 'Cmd+C', action: 'Copy Icon Spec' },
        { key: 'Cmd+D', action: 'Clear Selection' },
        { key: 'Escape', action: 'Close / Deselect' },
        { key: '?', action: 'Toggle this help' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Keyboard className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">System_Shortcuts</h3>
                            <p className="text-[10px] opacity-40 uppercase font-mono">Power User controls</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary/10">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-3">
                        {shortcuts.map((s, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                                    {s.action}
                                </span>
                                <div className="flex items-center gap-1">
                                    {s.key.split('+').map((part, idx) => (
                                        <React.Fragment key={idx}>
                                            <kbd className="flex h-6 min-w-[24px] items-center justify-center rounded border border-primary/20 bg-muted/50 px-1.5 font-mono text-[10px] font-bold text-primary shadow-sm">
                                                {part === 'Cmd' ? <Command className="h-2.5 w-2.5" /> : part}
                                            </kbd>
                                            {idx < s.key.split('+').length - 1 && <span className="text-[10px] opacity-30">+</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-primary/10 px-6 py-4 bg-muted/20 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 italic">
                        &quot;Precision through speed&quot;
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutLegend;
