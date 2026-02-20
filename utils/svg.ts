
import React from "react";
import { Weighting, IconTransform } from "../types";

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
 * Used for React viewing.
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
 * Generates an SVG transform attribute string.
 * Used for static SVG file export.
 */
export const getSvgTransformAttr = (transform: IconTransform): string => {
    const parts: string[] = [];
    // Rotate around center (12,12)
    if (transform.rotate) parts.push(`rotate(${transform.rotate} 12 12)`);
    // Scale from center? SVG scale is from top-left (0,0). To scale from center, we need translate-scale-translate.
    // Or just rely on the fact that viewing it usually centers it.
    // Actually, for simplicity in export, let's just use simple scale.
    if (transform.scale !== 1) parts.push(`scale(${transform.scale})`);
    // Flips
    if (transform.flipH) parts.push(`translate(24 0) scale(-1 1)`);
    if (transform.flipV) parts.push(`translate(0 24) scale(1 -1)`);

    return parts.join(" ");
};

/**
 * Builds a complete SVG string for an icon, suitable for file export.
 */
export const buildSvgContent = (
    svgPath: string,
    transform: IconTransform,
    weighting: Weighting,
    customFillColor: string,
): string => {
    const sw = getStrokeWidth(weighting);
    const transformAttr = getSvgTransformAttr(transform);
    // Default to currentColor if customFillColor is empty or 'currentColor', otherwise specific color
    const fill = (!customFillColor || customFillColor === 'currentColor') ? 'none' : customFillColor;
    const stroke = (!customFillColor || customFillColor === 'currentColor') ? 'currentColor' : customFillColor;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${svgPath}" ${transformAttr ? `transform="${transformAttr}"` : ''} />
</svg>`;
};

/**
 * Builds a React Component (JSX/TSX) string.
 */
export const buildJsxContent = (
    iconName: string,
    svgPath: string,
    weighting: Weighting,
): string => {
    const sw = getStrokeWidth(weighting);
    const componentName = iconName
        .split(/[-_]+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Icon';

    return `import * as React from "react"

export const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="${sw}"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="${svgPath}" />
  </svg>
)
`;
};
