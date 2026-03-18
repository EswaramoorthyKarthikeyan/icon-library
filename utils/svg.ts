import type React from "react";
import type { Weighting, IconTransform, IconData, MultiPath } from "../types";

/**
 * Maps a stroke weighting name to its numeric SVG stroke-width value.
 */
export const getStrokeWidth = (weighting: Weighting): number => {
    switch (weighting) {
        case "bold":
            return 3;
        case "medium":
            return 2;
        default:
            return 1.5;
    }
};

/**
 * Generates inline CSS transform style from an IconTransform object.
 * Memoize this function's output in components to avoid recreating on every render.
 */
export const getTransformStyle = (
    transform: IconTransform
): React.CSSProperties => {
    return {
        transform: `rotate(${transform.rotate}deg) scale(${transform.scale}) ${transform.flipH ? "scaleX(-1)" : ""} ${transform.flipV ? "scaleY(-1)" : ""}`,
        transformOrigin: 'center',
    };
};

/**
 * Generates an SVG transform attribute string for exports.
 */
export const getSvgTransformAttr = (transform: IconTransform): string => {
    const parts: string[] = [];
    if (transform.rotate) parts.push(`rotate(${transform.rotate} 12 12)`);
    if (transform.scale !== 1) parts.push(`scale(${transform.scale})`);
    if (transform.flipH) parts.push(`translate(24 0) scale(-1 1)`);
    if (transform.flipV) parts.push(`translate(0 24) scale(1 -1)`);
    return parts.join(" ");
};

/**
 * Resolves icon data based on current state (hover, active, disabled).
 */
export const resolveIconState = (icon: IconData, state?: 'hover' | 'active' | 'disabled'): IconData => {
    if (!state || !icon.states || !icon.states[state]) return icon;
    return { ...icon, ...icon.states[state] };
};

/**
 * Sanitizes a string to be used as a valid JavaScript/React component name.
 * Only allows alphanumeric characters and capitalizes the first letter.
 */
export const sanitizeComponentName = (name: string): string => {
    return name
        .split(/[-_]+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^([a-z])/, (_, c) => c.toUpperCase()) || 'Icon';
};

/**
 * Creates a complete MultiPath fallback object with all required fields.
 */
export const createMultiPathFallback = (svgPath: string): MultiPath => ({
    d: svgPath,
    color: undefined,
    opacity: undefined,
    className: undefined
});

/**
 * Resolves the fill/stroke color, using nullish coalescing to handle empty strings.
 */
export const resolveFillColor = (pathColor: string | undefined, globalColor: string): string => {
    // Use nullish coalescing to only fall back for null/undefined, not empty strings
    return pathColor ?? globalColor;
};

/**
 * Builds a complete SVG string for an icon, suitable for file export.
 */
export const buildSvgContent = (
    icon: IconData,
    transform: IconTransform,
    weighting: Weighting,
    customFillColor: string,
    state?: 'hover' | 'active' | 'disabled'
): string => {
    const resolvedIcon = resolveIconState(icon, state);
    const sw = getStrokeWidth(weighting);
    const transformAttr = getSvgTransformAttr(transform);
    
    const globalStroke = (!customFillColor || customFillColor === 'currentColor') 
        ? 'currentColor' 
        : customFillColor;

    const paths = resolvedIcon.paths 
        ? resolvedIcon.paths.map(p => ({
            d: p.d,
            color: p.color,
            opacity: p.opacity,
            className: p.className
        }))
        : [createMultiPathFallback(resolvedIcon.svgPath)];
    
    const pathElements = paths.map(p => {
        const stroke = resolveFillColor(p.color, globalStroke);
        const opacity = p.opacity ?? 1;
        const escapedPath = p.d.replace(/"/g, '&quot;');
        return `<path d="${escapedPath}" stroke="${stroke}" stroke-opacity="${opacity}" />`;
    }).join('\n  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <g ${transformAttr ? `transform="${transformAttr}"` : ''}>
    ${pathElements}
  </g>
</svg>`;
};

/**
 * Builds a React Component (JSX/TSX) string.
 * Component names are sanitized to prevent code injection.
 */
export const buildJsxContent = (
    icon: IconData,
    weighting: Weighting,
): string => {
    const sw = getStrokeWidth(weighting);
    // Sanitize the component name to prevent injection attacks
    const componentName = sanitizeComponentName(icon.name) + 'Icon';

    const paths = icon.paths 
        ? icon.paths.map(p => ({
            d: p.d,
            color: p.color,
            opacity: p.opacity
        }))
        : [createMultiPathFallback(icon.svgPath)];
    
    const jsxPaths = paths.map(p => {
        // Handle static vs dynamic colors
        const color = p.color 
            ? `"${p.color.replace(/"/g, '&quot;')}"` 
            : 'stroke ?? "currentColor"';
        const opacity = p.opacity !== undefined ? ` strokeOpacity={${p.opacity}}` : '';
        const escapedPath = p.d.replace(/"/g, '&quot;');
        return `<path d="${escapedPath}" stroke={${color}}${opacity} />`;
    }).join('\n    ');

    return `import * as React from "react"

export const ${componentName} = ({ stroke, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={${sw}}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    ${jsxPaths}
  </svg>
)
`;
};

/**
 * Calculate a similarity score between two SVG path strings.
 * Returns a number between 0 (different) and 1 (identical).
 */
export function calculatePathSimilarity(path1: string, path2: string): number {
  // Normalize paths (remove extra spaces, convert to lowercase)
  const normalize = (p: string) => p.toLowerCase().replace(/\s+/g, '').replace(/[^mmlhvcsqta]/g, '');
  const n1 = normalize(path1);
  const n2 = normalize(path2);
  
  // Exact match
  if (n1 === n2) return 1;
  
  // Quick character-level similarity check
  const chars1 = n1.split('');
  const chars2 = n2.split('');
  
  // Calculate overlap ratio
  const shorter = chars1.length < chars2.length ? chars1 : chars2;
  const longer = chars1.length < chars2.length ? chars2 : chars1;
  
  let matches = 0;
  const longerChars = new Set(longer);
  
  shorter.forEach(c => {
    if (longerChars.has(c)) matches++;
  });
  
  return matches / longer.length;
}

/**
 * Find duplicate or similar icons in the icon library.
 * Returns array of icon IDs that are similar to the target icon.
 */
export function findSimilarIcons(
  targetIcon: IconData,
  allIcons: IconData[],
  threshold: number = 0.7
): string[] {
  if (!targetIcon.svgPath && (!targetIcon.paths || targetIcon.paths.length === 0)) {
    return [];
  }
  
  const targetPaths = targetIcon.paths || [{ d: targetIcon.svgPath }];
  const similarities: Array<{ id: string; score: number }> = [];
  
  for (const icon of allIcons) {
    if (icon.id === targetIcon.id) continue;
    
    const iconPaths = icon.paths || [{ d: icon.svgPath }];
    
    // Calculate similarity for each path pair and take average
    let totalScore = 0;
    let pairs = 0;
    
    for (const targetPath of targetPaths) {
      for (const sourcePath of iconPaths) {
        const score = calculatePathSimilarity(targetPath.d, sourcePath.d);
        totalScore += score;
        pairs++;
      }
    }
    
    const avgScore = pairs > 0 ? totalScore / pairs : 0;
    
    if (avgScore >= threshold) {
      similarities.push({ id: icon.id, score: avgScore });
    }
  }
  
  // Sort by similarity (descending)
  similarities.sort((a, b) => b.score - a.score);
  
  return similarities.map(s => s.id);
}

/**
 * Compare two icons and return similarity analysis.
 */
export function compareIcons(icon1: IconData, icon2: IconData) {
  const path1 = icon1.paths || [{ d: icon1.svgPath }];
  const path2 = icon2.paths || [{ d: icon2.svgPath }];
  
  const similarities: Array<{ pathIndex: number; score: number }> = [];
  
  for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
    const score = calculatePathSimilarity(path1[i].d, path2[i].d);
    similarities.push({ pathIndex: i, score });
  }
  
  const avgScore = similarities.reduce((sum, s) => sum + s.score, 0) / similarities.length;
  
  return {
    overallSimilarity: avgScore,
    pathSimilarities: similarities,
    isDuplicate: avgScore > 0.9,
    isSimilar: avgScore > 0.7 && avgScore <= 0.9,
  };
}
