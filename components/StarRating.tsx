import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  size = 16,
  readOnly = false,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      const newRating = rating === index + 1 ? 0 : index + 1;
      onChange(newRating);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = displayRating > index;
        const halfFilled = displayRating > index + 0.5 && displayRating < index + 1;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            disabled={readOnly}
            className={cn(
              "transition-all duration-150",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            aria-label={`Rate ${index + 1} stars`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors duration-150",
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : halfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
