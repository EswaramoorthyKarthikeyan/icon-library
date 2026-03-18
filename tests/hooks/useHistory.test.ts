import { describe, it, expect } from 'vitest';
import { shallowEqual } from '../../hooks/useHistory';
import { Weighting, IconTransform } from '../../types';

describe('useHistory utilities', () => {
  describe('shallowEqual', () => {
    it('returns true for identical references', () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });

    it('returns true for identical primitives', () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual('test', 'test')).toBe(true);
      expect(shallowEqual(true, true)).toBe(true);
    });

    it('returns false for different primitives', () => {
      expect(shallowEqual(1, 2)).toBe(false);
      expect(shallowEqual('a', 'b')).toBe(false);
    });

    it('returns true for equal objects', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('returns false for objects with different keys', () => {
      expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('returns false for objects with different values', () => {
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('returns true for equal arrays', () => {
      expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for arrays with different lengths', () => {
      expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false for arrays with different values', () => {
      expect(shallowEqual([1, 2], [1, 3])).toBe(false);
    });

    it('handles nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      const obj3 = { a: { b: { c: 2 } } };
      
      expect(shallowEqual(obj1, obj2)).toBe(true);
      expect(shallowEqual(obj1, obj3)).toBe(false);
    });

    it('handles null values', () => {
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(null, { a: 1 })).toBe(false);
      expect(shallowEqual({ a: 1 }, null)).toBe(false);
    });

    it('handles mixed object/array comparison', () => {
      expect(shallowEqual({ a: 1 }, [1])).toBe(false);
    });
  });
});

describe('types', () => {
  describe('IconTransform', () => {
    it('has correct structure', () => {
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
  });

  describe('ViewportSize', () => {
    it('accepts valid sizes', () => {
      const validSizes: Weighting[] = ['regular', 'medium', 'bold'];
      expect(validSizes).toContain('regular');
      expect(validSizes).toContain('medium');
      expect(validSizes).toContain('bold');
    });
  });
});
