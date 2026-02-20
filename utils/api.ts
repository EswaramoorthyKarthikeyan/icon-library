import { GoogleGenerativeAI } from "@google/generative-ai";
/**
 * Creates a configured GoogleGenerativeAI client instance.
 * Centralizes API key access to a single location.
 */

export const createAIClient = (apiKey: string): GoogleGenerativeAI => {
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Basic validation for Gemini API key format.
 */
export const validateApiKey = (key: string): boolean => {
    return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(key);
};

/**
 * Retries an async function with exponential backoff.
 * Handles transient API errors (429/rate-limit, 500/server errors).
 */
export const withBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries = 3,
): Promise<T> => {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            const isRetryable =
                message.includes("429") ||
                message.includes("RESOURCE_EXHAUSTED") ||
                message.includes("500");
            if (isRetryable && i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            throw error;
        }
    }
    // Fallback — should not be reached due to the throw above
    return await fn();
};

/**
 * Checks if an API error is a rate-limit (429) error.
 */
export const isRateLimitError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
};

/**
 * Checks if an API error is an authentication (401/403) error.
 */
export const isAuthError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("401") || message.includes("API_KEY_INVALID") || message.includes("403");
};
