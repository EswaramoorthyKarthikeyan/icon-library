import { describe, it, expect } from 'vitest';
import type { IconData, IconCategory, ViewportSize, Weighting, IconTransform, AIProviderId } from '../../types';

describe('types', () => {
  describe('IconData', () => {
    it('accepts valid icon data', () => {
      const icon: IconData = {
        id: 'test-icon',
        name: 'test-icon',
        category: 'Navigation',
        svgPath: 'M12 12',
      };
      
      expect(icon.id).toBe('test-icon');
      expect(icon.name).toBe('test-icon');
      expect(icon.category).toBe('Navigation');
      expect(icon.svgPath).toBe('M12 12');
    });

    it('accepts icon with optional fields', () => {
      const icon: IconData = {
        id: 'test-icon',
        name: 'test-icon',
        category: 'Navigation',
        svgPath: 'M12 12',
        variant: 'outline',
        tags: ['home', 'house'],
        weight: 'regular',
      };
      
      expect(icon.variant).toBe('outline');
      expect(icon.tags).toContain('home');
      expect(icon.weight).toBe('regular');
    });

    it('accepts multi-path icons', () => {
      const icon: IconData = {
        id: 'test-icon',
        name: 'test-icon',
        category: 'Navigation',
        svgPath: 'M12 12',
        paths: [
          { d: 'M12 12', color: '#ff0000' },
          { d: 'M24 24', color: '#00ff00' },
        ],
      };
      
      expect(icon.paths).toHaveLength(2);
      expect(icon.paths![0].color).toBe('#ff0000');
    });
  });

  describe('IconCategory', () => {
    it('accepts valid categories', () => {
      const validCategories: IconCategory[] = [
        'Navigation', 'Actions', 'Communication', 'Devices', 'Editor',
        'Files', 'Social', 'Status', 'Places', 'Transportation', 'Weather', 'Miscellaneous'
      ];
      
      validCategories.forEach(cat => {
        expect(typeof cat).toBe('string');
      });
    });
  });

  describe('ViewportSize', () => {
    it('accepts valid viewport sizes', () => {
      const validSizes: ViewportSize[] = [16, 24, 32];
      
      validSizes.forEach(size => {
        expect([16, 24, 32]).toContain(size);
      });
    });
  });

  describe('Weighting', () => {
    it('accepts valid weighting values', () => {
      const validWeightings: Weighting[] = ['regular', 'medium', 'bold'];
      
      validWeightings.forEach(w => {
        expect(['regular', 'medium', 'bold']).toContain(w);
      });
    });
  });

  describe('IconTransform', () => {
    it('accepts valid transform', () => {
      const transform: IconTransform = {
        rotate: 90,
        scale: 2,
        flipH: true,
        flipV: false,
      };
      
      expect(transform.rotate).toBe(90);
      expect(transform.scale).toBe(2);
      expect(transform.flipH).toBe(true);
      expect(transform.flipV).toBe(false);
    });

    it('has default values', () => {
      const transform: IconTransform = {
        rotate: 0,
        scale: 1,
        flipH: false,
        flipV: false,
      };
      
      expect(transform.rotate).toBe(0);
      expect(transform.scale).toBe(1);
    });
  });

  describe('AIProviderId', () => {
    it('accepts valid provider IDs', () => {
      const validProviders: AIProviderId[] = ['google', 'openai', 'anthropic', 'local'];
      
      validProviders.forEach(p => {
        expect(['google', 'openai', 'anthropic', 'local']).toContain(p);
      });
    });
  });
});
