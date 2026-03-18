import React from 'react';
import type { IconData, Weighting, IconTransform } from '../types';
import IconSvg from './IconSvg';

interface SizePreviewProps {
  icon: IconData;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
}

const SIZES = [16, 24, 32, 48, 64, 128];

export const SizePreview: React.FC<SizePreviewProps> = ({
  icon,
  weighting,
  transform,
  customFillColor,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-3 rounded-lg bg-muted/20">
      {SIZES.map((size) => (
        <div
          key={size}
          className="flex flex-col items-center gap-1"
          title={`${size}x${size}`}
        >
          <div className="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/20 p-2">
            <IconSvg
              icon={icon}
              viewportSize={size}
              weighting={weighting}
              transform={transform}
              customFillColor={customFillColor}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {size}
          </span>
        </div>
      ))}
    </div>
  );
};
