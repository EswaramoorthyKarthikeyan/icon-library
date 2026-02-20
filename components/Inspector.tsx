
import React from 'react';
import { IconData, ViewportSize, Weighting, IconTransform, IconAiMetadata } from '../types';
import { getStrokeWidth, getTransformStyle } from '../utils/svg';
import { Copy, Download, Eye, Zap, Info, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Icon Preview */}
      <div className="relative flex aspect-square flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/10 bg-muted/20 shadow-inner overflow-hidden">
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
            fill={customFillColor === 'currentColor' || customFillColor === 'none' ? 'none' : customFillColor}
            stroke={customFillColor === 'none' ? 'currentColor' : (customFillColor === 'currentColor' ? 'currentColor' : customFillColor)}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={viewportSize === 32 ? '128' : viewportSize === 16 ? '64' : '96'}
            height={viewportSize === 32 ? '128' : viewportSize === 16 ? '64' : '96'}
            className="drop-shadow-sm"
          >
            <path d={icon.svgPath} />
          </svg>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
          <span className="opacity-40 font-mono">Size_</span>
          <span className="text-primary">{viewportSize}px</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="mb-1 text-lg font-bold">{icon.name}</h2>
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
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px]">Analyzing context...</span>
              </div>
            ) : aiMetadata ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
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
          <div className="mt-3 border-t pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Technical_Specs</p>
            <div className="grid grid-cols-2 gap-y-1 font-mono text-[10px]">
              <span className="uppercase text-primary">ViewBox</span>
              <span className="text-right">0 0 24 24</span>
              <span className="uppercase text-primary">Stroke</span>
              <span className="text-right">Rounded / {sw}px</span>
              <span className="uppercase text-primary">Nodes</span>
              <span className="text-right">{(icon.svgPath.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || []).length} Points</span>
            </div>
            <div className="mt-3 flex items-center gap-1 opacity-50">
              <Info className="h-3 w-3" />
              <span className="text-[10px] italic">Enable AI for semantic tags.</span>
            </div>
          </div>
        )}
      </div>

      {/* Related Icons */}
      <div className="mt-2">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">
          {settings.aiEnabled ? 'Related_Concepts' : 'Category_Peers'}
        </p>
        <div className="flex flex-wrap gap-2">
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
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/20 transition-all hover:scale-105 hover:bg-muted hover:border hover:border-primary"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill={customFillColor === 'currentColor' || customFillColor === 'none' ? 'none' : customFillColor}
                        stroke={customFillColor === 'none' ? 'currentColor' : (customFillColor === 'currentColor' ? 'currentColor' : customFillColor)}
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={rel.svgPath} />
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
      <div className="mt-auto flex flex-col gap-2">
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
