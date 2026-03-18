import { describe, it, expect } from 'vitest';
import {
  getStrokeWidth,
  getTransformStyle,
  resolveFillColor,
  buildSvgContent,
  buildJsxContent,
  sanitizeComponentName,
  createMultiPathFallback,
} from '../utils/svg';
import { Weighting, IconTransform, IconData } from '../types';

describe('svg utilities', () => {
  describe('getStrokeWidth', () => {
    it('returns correct stroke width for regular weighting', () => {
      expect(getStrokeWidth('regular' as Weighting)).toBe(1.5);
    });

    it('returns correct stroke width for medium weighting', () => {
      expect(getStrokeWidth('medium' as Weighting)).toBe(2);
    });

    it('returns correct stroke width for bold weighting', () => {
      expect(getStrokeWidth('bold' as Weighting)).toBe(3);
    });
  });

  describe('getTransformStyle', () => {
    it('returns correct transform for default transform', () => {
      const transform: IconTransform = {
        rotate: 0,
        scale: 1,
        flipH: false,
        flipV: false,
      };
      const style = getTransformStyle(transform);
      expect(style.transform).toBe('rotate(0deg) scale(1)   ');
    });

    it('returns correct transform with rotation', () => {
      const transform: IconTransform = {
        rotate: 90,
        scale: 1,
        flipH: false,
        flipV: false,
      };
      const style = getTransformStyle(transform);
      expect(style.transform).toContain('rotate(90deg)');
    });

    it('returns correct transform with horizontal flip', () => {
      const transform: IconTransform = {
        rotate: 0,
        scale: 1,
        flipH: true,
        flipV: false,
      };
      const style = getTransformStyle(transform);
      expect(style.transform).toContain('scaleX(-1)');
    });

    it('returns correct transform with vertical flip', () => {
      const transform: IconTransform = {
        rotate: 0,
        scale: 1,
        flipH: false,
        flipV: true,
      };
      const style = getTransformStyle(transform);
      expect(style.transform).toContain('scaleY(-1)');
    });
  });

  describe('resolveFillColor', () => {
    it('uses path color when provided', () => {
      expect(resolveFillColor('#ff0000', 'currentColor')).toBe('#ff0000');
    });

    it('falls back to global color when path color is undefined', () => {
      expect(resolveFillColor(undefined, 'currentColor')).toBe('currentColor');
    });

    it('falls back to global color when path color is null', () => {
      expect(resolveFillColor(null as unknown as undefined, '#00ff00')).toBe('#00ff00');
    });

    it('uses path color even when it is an empty string (edge case)', () => {
      // Empty string should NOT fall back (this is intentional for flexibility)
      expect(resolveFillColor('', '#00ff00')).toBe('');
    });
  });

  describe('sanitizeComponentName', () => {
    it('converts kebab-case to PascalCase', () => {
      expect(sanitizeComponentName('home-icon')).toBe('HomeIcon');
    });

    it('converts snake_case to PascalCase', () => {
      expect(sanitizeComponentName('home_icon')).toBe('HomeIcon');
    });

    it('handles mixed case', () => {
      expect(sanitizeComponentName('Home-Icon_Test')).toBe('HomeIconTest');
    });

    it('handles numbers', () => {
      expect(sanitizeComponentName('icon-123')).toBe('Icon123');
    });

    it('handles empty string', () => {
      expect(sanitizeComponentName('')).toBe('Icon');
    });

    it('removes special characters', () => {
      expect(sanitizeComponentName('icon@#$%')).toBe('Icon');
    });
  });

  describe('createMultiPathFallback', () => {
    it('creates a complete MultiPath object', () => {
      const fallback = createMultiPathFallback('M12 12');
      expect(fallback.d).toBe('M12 12');
      expect(fallback.color).toBeUndefined();
      expect(fallback.opacity).toBeUndefined();
      expect(fallback.className).toBeUndefined();
    });
  });

  describe('buildSvgContent', () => {
    const mockIcon: IconData = {
      id: 'test-icon',
      name: 'test-icon',
      category: 'Test',
      svgPath: 'M12 12',
    };

    const mockTransform: IconTransform = {
      rotate: 0,
      scale: 1,
      flipH: false,
      flipV: false,
    };

    it('builds valid SVG content', () => {
      const svg = buildSvgContent(mockIcon, mockTransform, 'regular' as Weighting, 'currentColor');
      expect(svg).toContain('<svg');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('M12 12');
    });

    it('includes correct stroke width', () => {
      const svgRegular = buildSvgContent(mockIcon, mockTransform, 'regular' as Weighting, 'currentColor');
      const svgBold = buildSvgContent(mockIcon, mockTransform, 'bold' as Weighting, 'currentColor');
      
      expect(svgRegular).toContain('stroke-width="1.5"');
      expect(svgBold).toContain('stroke-width="3"');
    });

    it('escapes special characters in path data', () => {
      const iconWithQuotes: IconData = {
        ...mockIcon,
        svgPath: 'M12 12"test',
      };
      const svg = buildSvgContent(iconWithQuotes, mockTransform, 'regular' as Weighting, 'currentColor');
      expect(svg).toContain('&quot;');
    });
  });

  describe('buildJsxContent', () => {
    const mockIcon: IconData = {
      id: 'test-icon',
      name: 'test-icon',
      category: 'Test',
      svgPath: 'M12 12',
    };

    it('builds valid JSX component', () => {
      const jsx = buildJsxContent(mockIcon, 'regular' as Weighting);
      expect(jsx).toContain('import * as React from "react"');
      expect(jsx).toContain('export const TestIcon');
      expect(jsx).toContain('strokeWidth={1.5}');
    });

    it('sanitizes component names', () => {
      const iconWithSpecialChars: IconData = {
        ...mockIcon,
        name: 'test@icon',
      };
      const jsx = buildJsxContent(iconWithSpecialChars, 'regular' as Weighting);
      expect(jsx).toContain('export const TestIcon');
    });
  });
});
