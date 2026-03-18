import React, { useState } from 'react';
import type { AnimationType } from '../hooks/useAnimations';
import {
  ANIMATION_TYPES,
  generateKeyframes,
  generateCSSAnimation,
  useAnimations
} from '../hooks/useAnimations';
import type { IconData, ViewportSize, Weighting, IconTransform } from '../types';
import { getStrokeWidth, getTransformStyle } from '../utils/svg';
import {
  Play, Pause, RotateCcw, Copy, Download,
  ChevronDown, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnimationPreviewProps {
  icon: IconData | null;
  viewportSize: ViewportSize;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
  onExport?: (css: string, format: 'css' | 'svg') => void;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  icon,
  viewportSize,
  weighting,
  transform,
  customFillColor,
  onExport,
}) => {
  const {
    activeAnimationName,
    activeAnimation,
    updateAnimation,
    resetAnimation,
    exportAsCSS,
    exportAnimationAsCSS,
  } = useAnimations('spin');

  const [isPlaying, setIsPlaying] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!icon) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center opacity-30">
        <Zap className="h-12 w-12 mb-3" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Select an icon to animate
        </span>
      </div>
    );
  }

  const sw = getStrokeWidth(weighting);
  const baseTransformStyle = getTransformStyle(transform);
  const animationCSS = generateKeyframes(activeAnimation.type);
  const animationStyle = generateCSSAnimation(activeAnimation);

  // Generate unique animation name for preview (kept for future use)
  // const previewAnimationName = `preview-${activeAnimation.type}-${Date.now()}`;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Animation Preview Canvas */}
      <style>{`
        ${animationCSS}
        .animation-preview {
          animation: ${animationStyle};
          ${!isPlaying ? 'animation-play-state: paused;' : ''}
        }
      `}</style>

      <div className="relative flex aspect-square flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/10 bg-muted/20 shadow-inner overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%">
            <pattern id="animation-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#animation-grid)" />
          </svg>
        </div>

        {/* Animated Icon */}
        <div className="animation-preview relative z-10">
          <div style={baseTransformStyle}>
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
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isPlaying ? 'default' : 'outline'}
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Play/Pause animation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resetAnimation(activeAnimationName)}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to defaults</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Animation Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Animation Type
        </label>
        <Select value={activeAnimation.type} onValueChange={(type) => {
          updateAnimation(activeAnimationName, { type: type as AnimationType });
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose animation" />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                <span className="capitalize">{type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Duration (ms)
          </label>
          <span className="text-xs font-mono text-primary">{activeAnimation.duration}ms</span>
        </div>
        <Slider
          value={[activeAnimation.duration]}
          onValueChange={([value]) => updateAnimation(activeAnimationName, { duration: value })}
          min={100}
          max={5000}
          step={50}
          className="w-full"
        />
      </div>

      {/* Playback Rate Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Speed
          </label>
          <span className="text-xs font-mono text-primary">{activeAnimation.playbackRate.toFixed(2)}x</span>
        </div>
        <Slider
          value={[activeAnimation.playbackRate]}
          onValueChange={([value]) => updateAnimation(activeAnimationName, { playbackRate: value })}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        Advanced Settings
      </button>

      {showAdvanced && (
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {/* Delay Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Delay (ms)
                </label>
                <span className="text-xs font-mono text-primary">{activeAnimation.delay}ms</span>
              </div>
              <Slider
                value={[activeAnimation.delay]}
                onValueChange={([value]) => updateAnimation(activeAnimationName, { delay: value })}
                min={0}
                max={2000}
                step={50}
                className="w-full"
              />
            </div>

            {/* Direction Control */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Direction
              </label>
              <Select value={activeAnimation.direction} onValueChange={(dir: any) => {
                updateAnimation(activeAnimationName, { direction: dir });
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="reverse">Reverse</SelectItem>
                  <SelectItem value="alternate">Alternate</SelectItem>
                  <SelectItem value="alternate-reverse">Alternate Reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timing Function Control */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Timing Function
              </label>
              <Select value={activeAnimation.timingFunction} onValueChange={(tf: any) => {
                updateAnimation(activeAnimationName, { timingFunction: tf });
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ease">Ease</SelectItem>
                  <SelectItem value="ease-in">Ease In</SelectItem>
                  <SelectItem value="ease-out">Ease Out</SelectItem>
                  <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Iteration Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Repeat
              </label>
              <Select 
                value={String(activeAnimation.iterationCount)} 
                onValueChange={(val) => {
                  updateAnimation(activeAnimationName, { 
                    iterationCount: val === 'infinite' ? 'infinite' : parseInt(val)
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Once</SelectItem>
                  <SelectItem value="2">Twice</SelectItem>
                  <SelectItem value="3">3 times</SelectItem>
                  <SelectItem value="5">5 times</SelectItem>
                  <SelectItem value="infinite">Infinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Export Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const css = exportAnimationAsCSS(activeAnimationName);
                  navigator.clipboard.writeText(css);
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy CSS
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy animation CSS to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const css = exportAsCSS();
                  onExport?.(css, 'css');
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export all animations</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default AnimationPreview;
