import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateApiKey, createAIClient, isRateLimitError, isAuthError, withBackoff } from '../../utils/api';

describe('api utilities', () => {
  describe('validateApiKey', () => {
    it('returns false for empty key', () => {
      expect(validateApiKey('')).toBe(false);
    });

    it('returns false for short keys', () => {
      expect(validateApiKey('abc')).toBe(false);
      expect(validateApiKey('sk-')).toBe(false);
    });

    it('returns true for valid Google API key format', () => {
      // Google API keys match pattern AIzaSy + 33 alphanumeric = 39 chars total
      expect(validateApiKey('AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456')).toBe(true);
    });

    it('returns false for invalid Google API key format', () => {
      expect(validateApiKey('sk-abc123')).toBe(false);
      expect(validateApiKey('invalid')).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('returns true for 429 error message', () => {
      const error = new Error('Request failed with status 429');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('returns true for RESOURCE_EXHAUSTED error', () => {
      const error = new Error('RESOURCE_EXHAUSTED: Quota exceeded');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new Error('Some other error');
      expect(isRateLimitError(error)).toBe(false);
    });

    it('returns false for non-error inputs', () => {
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError('string')).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('returns true for 401 error message', () => {
      const error = new Error('Request failed with status 401');
      expect(isAuthError(error)).toBe(true);
    });

    it('returns true for API_KEY_INVALID error', () => {
      const error = new Error('API_KEY_INVALID: The provided API key is invalid');
      expect(isAuthError(error)).toBe(true);
    });

    it('returns true for 403 error message', () => {
      const error = new Error('Request failed with status 403');
      expect(isAuthError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new Error('Some other error');
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('withBackoff', () => {
    it('succeeds on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on rate limit error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Request failed with status 429'))
        .mockResolvedValueOnce('success');
      
      const result = await withBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on RESOURCE_EXHAUSTED error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('RESOURCE_EXHAUSTED'))
        .mockResolvedValueOnce('success');
      
      const result = await withBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Request failed with status 429'));
      
      await expect(withBackoff(fn)).rejects.toThrow('Request failed with status 429');
    });

    it('does not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Some other error'));
      
      await expect(withBackoff(fn)).rejects.toThrow('Some other error');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAIClient', () => {
    it('creates client with valid key', () => {
      const client = createAIClient('test-key');
      expect(client).toBeDefined();
    });
  });
});
