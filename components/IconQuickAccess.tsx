import React from 'react';
import { Star, Clock } from 'lucide-react';
import IconSvg from './IconSvg';
import type { IconData, Weighting, IconTransform } from '../types';

interface IconQuickAccessProps {
  iconIds: string[];
  allIcons: IconData[];
  onPreview: (id: string) => void;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
  type: 'favorites' | 'recent';
}

export const IconQuickAccess: React.FC<IconQuickAccessProps> = ({
  iconIds,
  allIcons,
  onPreview,
  weighting,
  transform,
  customFillColor,
  type,
}) => {
  const icons = iconIds
    .map((id) => allIcons.find((icon) => icon.id === id))
    .filter((icon): icon is IconData => icon !== undefined)
    .slice(0, 8);

  if (icons.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-muted-foreground/10 bg-background/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        {type === 'favorites' ? (
          <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
        ) : (
          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">
          {type === 'favorites' ? 'Favorites' : 'Recently Used'}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {icons.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onPreview(icon.id)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-muted-foreground/10 bg-background transition-all hover:border-primary/30 hover:bg-accent hover:scale-105"
            title={icon.name}
            aria-label={`Preview ${icon.name}`}
          >
            <IconSvg
              icon={icon}
              viewportSize={20}
              weighting={weighting}
              transform={transform}
              customFillColor={customFillColor}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
