
import React from 'react';
import { IconData } from '../types';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VariantSwitcherProps {
    currentIcon: IconData;
    allIcons: IconData[];
    onSelectVariant: (id: string) => void;
    customFillColor: string;
    sw: number;
}

const VariantSwitcher: React.FC<VariantSwitcherProps> = ({
    currentIcon,
    allIcons,
    onSelectVariant,
    customFillColor,
    sw
}) => {
    const variantIds = currentIcon.variants || [];
    if (variantIds.length === 0) return null;

    const variants = variantIds
        .map(id => allIcons.find(i => i.id === id))
        .filter((v): v is IconData => !!v);

    // Group current and variants and sort by type
    const allVariants = [currentIcon, ...variants].sort((a, b) => {
        const order = { outline: 0, filled: 1, duotone: 2, flat: 3, multicolor: 4 };
        return (order[a.variantType || 'outline'] || 99) - (order[b.variantType || 'outline'] || 99);
    });

    return (
        <div className="flex flex-col items-center gap-3 w-full border-t border-primary/10 pt-4 mt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-40">Available_Variants</p>
            <div className="flex flex-wrap justify-center gap-2">
                <TooltipProvider>
                    {allVariants.map((v) => (
                        <Tooltip key={v.id}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onSelectVariant(v.id)}
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all border ${
                                        v.id === currentIcon.id 
                                            ? 'bg-primary/10 border-primary shadow-sm' 
                                            : 'bg-muted/20 border-transparent hover:border-primary/50 hover:bg-muted/40'
                                    }`}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke={customFillColor === 'none' ? 'currentColor' : (customFillColor === 'currentColor' ? 'currentColor' : customFillColor)}
                                        strokeWidth={sw}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d={v.svgPath} />
                                    </svg>
                                    
                                    {/* Type Indicator */}
                                    <div className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-background border border-primary/20 text-[6px] font-bold uppercase overflow-hidden">
                                        {v.variantType?.charAt(0) || 'O'}
                                    </div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-[10px] font-bold uppercase">{v.variantType || 'outline'}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
};

export default VariantSwitcher;
