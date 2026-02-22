import React, { useState, useMemo } from 'react';
import { IconData, ViewportSize, Weighting, IconTransform, IconAiMetadata } from '../types';
import { getStrokeWidth, getTransformStyle, resolveIconState } from '../utils/svg';
import { Copy, Download, Eye, Zap, Info, Loader2, MousePointer2, Fingerprint, Ban } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import VariantSwitcher from './VariantSwitcher';

interface InspectorProps {
  icon: IconData | null;
  viewportSize: ViewportSize;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
  relatedIcons: string[];
  aiMetadata: IconAiMetadata | null;
  isGeneratingMetadata: boolean;
  allIcons: IconData[];
  settings: { aiEnabled: boolean };
  onCopySpec: () => void;
  onPreview: (id: string) => void;
  onExport: (icon: IconData, format: 'svg' | 'png' | 'jsx' | 'json') => void;
  onAddToRecent: (id: string) => void;
}

const Inspector: React.FC<InspectorProps> = ({
  icon, viewportSize, weighting, transform, customFillColor,
  relatedIcons, aiMetadata, isGeneratingMetadata, allIcons,
  settings, onCopySpec, onPreview, onExport, onAddToRecent,
}) => {
  const [testState, setTestState] = useState<'hover' | 'active' | 'disabled' | null>(null);

  if (!icon) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center opacity-30 select-none">
        <Eye className="h-12 w-12" />
        <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em]">
          Select an asset to inspect
        </span>
      </div>
    );
  }

  const resolvedIcon = resolveIconState(icon, testState || undefined);
  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);

  // Path Rendering Logic (Multicolor support)
  const paths = resolvedIcon.paths || [{ d: resolvedIcon.svgPath }];
  const globalStroke = (!customFillColor || customFillColor === 'currentColor') ? 'currentColor' : customFillColor;

  return (
    <div className="flex h-full flex-col items-center gap-6 text-center">
      {/* Icon Preview */}
      <div className={`relative flex aspect-square flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/10 bg-muted/20 shadow-inner overflow-hidden transition-all duration-300 ${testState === 'disabled' ? 'opacity-40 grayscale' : ''}`}>
        {/* Blueprint Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%">
            <pattern id="inspector-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#inspector-grid)" />
          </svg>
        </div>

        <div style={transformStyle} className="relative z-10 transition-all duration-500 ease-out">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={viewportSize === 32 ? '128' : viewportSize === 16 ? '64' : '96'}
            height={viewportSize === 32 ? '128' : viewportSize === 16 ? '64' : '96'}
            className="drop-shadow-sm"
            role="img"
            aria-label={`Preview of ${icon.name}`}
          >
            {paths.map((p, i) => (
              <path 
                key={i} 
                d={p.d} 
                stroke={p.color || globalStroke} 
                strokeOpacity={p.opacity ?? 1}
                className={p.className}
              />
            ))}
          </svg>
        </div>
        
        {/* Testing State Overlays */}
        {testState && (
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                Testing: {testState}
            </div>
        )}

        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
          <span className="opacity-40 font-mono">Size_</span>
          <span className="text-primary">{viewportSize}px</span>
        </div>
      </div>

      {/* State Testing Controls */}
      <div className="flex gap-1 bg-muted/20 p-1 rounded-xl w-full max-w-xs mx-auto">
          {(['hover', 'active', 'disabled'] as const).map(state => (
              <Button
                  key={state}
                  variant={testState === state ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTestState(testState === state ? null : state)}
                  aria-label={`Test ${state} state`}
                  aria-pressed={testState === state}
                  className="flex-1 h-7 text-[9px] font-bold uppercase tracking-widest gap-1"
              >
                  {state === 'hover' && <MousePointer2 className="h-3 w-3" aria-hidden="true" />}
                  {state === 'active' && <Fingerprint className="h-3 w-3" aria-hidden="true" />}
                  {state === 'disabled' && <Ban className="h-3 w-3" aria-hidden="true" />}
                  {state}
              </Button>
          ))}
      </div>

      {/* Metadata */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{icon.name}</h2>
            {icon.variantType && (
                <Badge variant="outline" className="text-[8px] h-4 py-0 font-bold uppercase tracking-tighter opacity-70">
                    {icon.variantType}
                </Badge>
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
            {icon.category} / {icon.id}
          </span>
        </div>

        {icon.isSynthesized && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-[9px] font-bold uppercase">
              AI Synthesized
            </Badge>
          </div>
        )}

        {settings.aiEnabled && (
          <div className="mt-3">
            {isGeneratingMetadata ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px]">Analyzing context...</span>
              </div>
            ) : aiMetadata ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap justify-center gap-1">
                  {aiMetadata.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[9px]">{tag}</Badge>
                  ))}
                  </div>

                <div className="border-l-2 border-primary/20 pl-3">
                    <p className="text-[10px] leading-relaxed text-muted-foreground">{aiMetadata.description}</p>
                    
                </div>
              </div>
            ) : null}
          </div>
        )}

        {!settings.aiEnabled && (
          <div className="mt-3 w-full border-t pt-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Technical_Specs</p>
            <div className="mx-auto grid max-w-auto grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
              <span className="text-left uppercase text-primary">ViewBox</span>
              <span className="text-right">0 0 24 24</span>
              <span className="text-left uppercase text-primary">Stroke</span>
              <span className="text-right">Rounded / {sw}px</span>
              <span className="text-left uppercase text-primary">Nodes</span>
              <span className="text-right">{((icon.paths ? icon.paths.map(p => p.d).join('') : icon.svgPath).match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length} Points</span>
            </div>
          </div>
        )}
      </div>

      {/* Variants Switcher */}
      <VariantSwitcher 
        currentIcon={icon} 
        allIcons={allIcons} 
        onSelectVariant={onPreview} 
        customFillColor={customFillColor}
        sw={sw}
      />

      {/* Related Icons */}
      <div className="mt-2 w-full">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">
          {settings.aiEnabled ? 'Related_Concepts' : 'Category_Peers'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <TooltipProvider>
            {(settings.aiEnabled && relatedIcons.length > 0 ? relatedIcons :
              allIcons.filter(i => i.category === icon.category && i.id !== icon.id).slice(0, 5).map(i => i.id)
            ).map((relId) => {
              const rel = allIcons.find((i) => i.id === relId);
              if (!rel) return null;
              return (
                <Tooltip key={relId}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onPreview(relId);
                        onAddToRecent(relId);
                      }}
                      aria-label={`Inspect related icon: ${rel.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/20 transition-all hover:scale-105 hover:bg-muted hover:border hover:border-primary"
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
                        aria-hidden="true"
                      >
                         {(rel.paths || [{ d: rel.svgPath }]).map((p, i) => (
                           <path key={i} d={p.d} stroke={p.color || globalStroke} strokeOpacity={p.opacity ?? 1} />
                         ))}
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{rel.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          className="w-full text-[10px] font-bold uppercase tracking-[0.1em]"
          onClick={onCopySpec}
        >
          <Copy className="mr-2 h-3 w-3" />
          Copy Full Spec
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="text-[10px] font-bold uppercase tracking-[0.1em]"
            onClick={() => {
              onExport(icon, 'svg');
              onAddToRecent(icon.id);
            }}
          >
            <Download className="mr-2 h-3 w-3" />
            SVG
          </Button>
          <Button
            className="text-[10px] font-bold uppercase tracking-[0.1em]"
            onClick={() => {
              onExport(icon, 'png');
              onAddToRecent(icon.id);
            }}
          >
            <Download className="mr-2 h-3 w-3" />
            PNG
          </Button>
          <Button
            variant="secondary"
            className="text-[10px] font-bold uppercase tracking-[0.1em]"
            onClick={() => {
              onExport(icon, 'jsx');
              onAddToRecent(icon.id);
            }}
          >
            <Download className="mr-2 h-3 w-3" />
            React
          </Button>
          <Button
            variant="secondary"
            className="text-[10px] font-bold uppercase tracking-[0.1em]"
            onClick={() => {
              onExport(icon, 'json');
              onAddToRecent(icon.id);
            }}
          >
            <Download className="mr-2 h-3 w-3" />
            JSON
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Inspector);
