import React, { memo } from 'react';
import type { IconData, Weighting, IconTransform } from '../types';
import { getStrokeWidth, getTransformStyle, resolveFillColor } from '../utils/svg';

interface IconSvgProps {
  icon: IconData;
  viewportSize?: number;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Shared SVG icon renderer component.
 * Handles stroke width, transforms, colors, and multi-path icons.
 * Memoized to prevent unnecessary re-renders.
 */
const IconSvg: React.FC<IconSvgProps> = memo(({
  icon,
  viewportSize = 24,
  weighting,
  transform,
  customFillColor,
  className,
  style,
  role = 'img',
  'aria-hidden': ariaHidden = true,
}) => {
  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);
  
  // Resolve global stroke color
  const globalStroke = customFillColor === 'none' || customFillColor === 'currentColor'
    ? 'currentColor'
    : customFillColor;

  // Get paths array with fallback for legacy svgPath
  const paths = icon.paths || [{ d: icon.svgPath, color: undefined, opacity: undefined, className: undefined }];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={viewportSize}
      height={viewportSize}
      style={{ ...transformStyle, ...style }}
      className={className}
      role={role}
      aria-hidden={ariaHidden}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={resolveFillColor(p.color, globalStroke)}
          strokeOpacity={p.opacity ?? 1}
          className={p.className}
        />
      ))}
    </svg>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization optimization
  return (
    prevProps.icon.id === nextProps.icon.id &&
    prevProps.icon.svgPath === nextProps.icon.svgPath &&
    prevProps.icon.paths === nextProps.icon.paths &&
    prevProps.viewportSize === nextProps.viewportSize &&
    prevProps.weighting === nextProps.weighting &&
    prevProps.transform.rotate === nextProps.transform.rotate &&
    prevProps.transform.scale === nextProps.transform.scale &&
    prevProps.transform.flipH === nextProps.transform.flipH &&
    prevProps.transform.flipV === nextProps.transform.flipV &&
    prevProps.customFillColor === nextProps.customFillColor &&
    prevProps.className === nextProps.className
  );
});

IconSvg.displayName = 'IconSvg';

export default IconSvg;
