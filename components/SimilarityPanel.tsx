import React from 'react';
import { AlertTriangle, X, Target } from 'lucide-react';
import type { IconData } from '../types';
import IconSvg from './IconSvg';
import { compareIcons } from '../utils/svg';

interface SimilarityPanelProps {
  icon: IconData;
  allIcons: IconData[];
  onPreview: (id: string) => void;
  onClose: () => void;
  weighting: any;
  transform: any;
  customFillColor: string;
}

export const SimilarityPanel: React.FC<SimilarityPanelProps> = ({
  icon,
  allIcons,
  onPreview,
  onClose,
  weighting,
  transform,
  customFillColor,
}) => {
  // Find potentially similar icons
  const similarIcons = React.useMemo(() => {
    return allIcons
      .filter(i => i.id !== icon.id)
      .map(i => ({
        icon: i,
        comparison: compareIcons(icon, i),
      }))
      .filter(c => c.comparison.overallSimilarity > 0.6)
      .sort((a, b) => b.comparison.overallSimilarity - a.comparison.overallSimilarity)
      .slice(0, 6);
  }, [icon, allIcons]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Similar Icons Found
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {similarIcons.map(({ icon: simIcon, comparison }) => (
          <button
            key={simIcon.id}
            onClick={() => onPreview(simIcon.id)}
            className="group flex flex-col items-center gap-1 p-1 rounded border border-transparent hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all"
            title={`${simIcon.name} (${(comparison.overallSimilarity * 100).toFixed(0)}% similar)`}
          >
            <div className="relative">
              <IconSvg
                icon={simIcon}
                viewportSize={24}
                weighting={weighting}
                transform={transform}
                customFillColor={customFillColor}
              />
              <div className="absolute -bottom-1 -right-1">
                <Target className="h-3 w-3 text-yellow-500/70" />
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground/70 truncate w-full text-center">
              {(comparison.overallSimilarity * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
      
      {similarIcons.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No similar icons found
        </p>
      )}
    </div>
  );
};

export const useSimilarityDetector = (iconId: string | null) => {
  const [showSimilarity, setShowSimilarity] = React.useState(false);

  // Auto-show similarity for custom icons
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (iconId?.startsWith('custom-')) {
      timer = setTimeout(() => setShowSimilarity(true), 1000);
    } else {
      setShowSimilarity(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [iconId]);

  return { showSimilarity, setShowSimilarity };
};
