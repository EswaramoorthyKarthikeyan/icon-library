
import React, { useState } from 'react';
import { X, Columns, Layers, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IconData, ViewportSize, Weighting } from '../types';
import { getStrokeWidth } from '../utils/svg';

interface ComparisonToolProps {
    iconA: IconData;
    iconB: IconData;
    viewportSize: ViewportSize;
    weighting: Weighting;
    customFillColor: string;
    onClose: () => void;
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({
    iconA,
    iconB,
    viewportSize,
    weighting,
    customFillColor,
    onClose
}) => {
    const [mode, setMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);

    const sw = getStrokeWidth(weighting);
    const iconSize = viewportSize === 32 ? 128 : viewportSize === 16 ? 64 : 96;

    const renderIcon = (icon: IconData, color: string = 'currentColor', opacity: number = 1) => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={color === 'none' ? 'currentColor' : color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={iconSize}
            height={iconSize}
            style={{ opacity }}
        >
            <path d={icon.svgPath} />
        </svg>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-background border border-primary/20 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.3)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/10">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight">Icon Comparison</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Analyzing differences and variants</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted/20 p-1 rounded-xl mr-4">
                            <Button 
                                variant={mode === 'side-by-side' ? 'default' : 'ghost'} 
                                size="sm" 
                                className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2"
                                onClick={() => setMode('side-by-side')}
                            >
                                <Columns className="h-3 w-3" />
                                Side
                            </Button>
                            <Button 
                                variant={mode === 'overlay' ? 'default' : 'ghost'} 
                                size="sm" 
                                className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2"
                                onClick={() => setMode('overlay')}
                            >
                                <Layers className="h-3 w-3" />
                                Overlay
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-12 flex flex-col">
                    {mode === 'side-by-side' ? (
                        <div className="grid grid-cols-2 gap-12 flex-1">
                            {/* Icon A */}
                            <div className="flex flex-col items-center gap-8">
                                <div className="aspect-square w-full max-w-[300px] bg-muted/10 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                        <svg width="100%" height="100%">
                                            <pattern id="comparison-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                            </pattern>
                                            <rect width="100%" height="100%" fill="url(#comparison-grid)" />
                                        </svg>
                                    </div>
                                    {renderIcon(iconA, customFillColor)}
                                    <Badge variant="outline" className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold">A</Badge>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm font-bold truncate max-w-[200px]">{iconA.name}</h3>
                                    <p className="text-[10px] opacity-40 uppercase truncate max-w-[150px]">{iconA.category}</p>
                                </div>
                            </div>

                            {/* Icon B */}
                            <div className="flex flex-col items-center gap-8">
                                <div className="aspect-square w-full max-w-[300px] bg-muted/10 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                        <svg width="100%" height="100%">
                                            <rect width="100%" height="100%" fill="url(#comparison-grid)" />
                                        </svg>
                                    </div>
                                    {renderIcon(iconB, customFillColor)}
                                    <Badge variant="outline" className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold">B</Badge>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm font-bold truncate max-w-[200px]">{iconB.name}</h3>
                                    <p className="text-[10px] opacity-40 uppercase truncate max-w-[150px]">{iconB.category}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-12 flex-1">
                            <div className="aspect-square w-full max-w-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-primary/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                    <svg width="100%" height="100%">
                                        <rect width="100%" height="100%" fill="url(#comparison-grid)" />
                                    </svg>
                                </div>
                                
                                {/* Overlay Comparison */}
                                <div className="relative">
                                    {/* Icon A (Base - Blue) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {renderIcon(iconA, '#3b82f6', 1 - overlayOpacity)}
                                    </div>
                                    {/* Icon B (Top - Primary) */}
                                    <div className="relative flex items-center justify-center">
                                        {renderIcon(iconB, '#f43f5e', overlayOpacity)}
                                    </div>
                                </div>

                                <div className="absolute top-6 left-6 flex gap-2">
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px]">Icon A</Badge>
                                    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px]">Icon B</Badge>
                                </div>
                            </div>

                            <div className="w-full max-w-sm space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Comparison Balance</span>
                                    <span>{Math.round(overlayOpacity * 100)}% Icon B</span>
                                </div>
                                <Slider 
                                    value={[overlayOpacity]} 
                                    min={0} 
                                    max={1} 
                                    step={0.01} 
                                    onValueChange={(vals) => setOverlayOpacity(vals[0])} 
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Metadata Diff Table */}
                <div className="p-6 bg-muted/10 border-t border-primary/10">
                    <div className="grid grid-cols-3 gap-8 text-[11px]">
                        <div className="font-bold uppercase tracking-widest opacity-40">Attribute</div>
                        <div className="font-bold opacity-60">Icon A</div>
                        <div className="font-bold opacity-60">Icon B</div>
                        
                        <Separator className="col-span-3 opacity-20" />
                        
                        <div className="opacity-40 uppercase tracking-wider">Path Tokens</div>
                        <div className={iconA.svgPath === iconB.svgPath ? 'text-foreground' : 'text-blue-500'}>
                            {(iconA.svgPath.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length} Points
                        </div>
                        <div className={iconA.svgPath === iconB.svgPath ? 'text-foreground' : 'text-rose-500'}>
                            {(iconB.svgPath.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length} Points
                        </div>

                        <div className="opacity-40 uppercase tracking-wider">Category</div>
                        <div className={iconA.category === iconB.category ? 'text-foreground' : 'text-blue-500'}>
                            {iconA.category}
                        </div>
                        <div className={iconA.category === iconB.category ? 'text-foreground' : 'text-rose-500'}>
                            {iconB.category}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default ComparisonTool;
