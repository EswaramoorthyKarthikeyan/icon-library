import { AppSettings, AIProviderId } from "../../types";
import { AnthropicProviderAdapter } from "./anthropic-adapter";
import { GoogleProviderAdapter } from "./google-adapter";
import { OpenAIProviderAdapter } from "./openai-adapter";
import { LocalProviderAdapter } from "./local-adapter";
import { AIProviderAdapter } from "./types";

export const getAIProvider = (settings: AppSettings): AIProviderAdapter | null => {
    const activeId = settings.activeProvider;
    const config = settings.providers[activeId];

    if (!config || !config.enabled || !config.apiKey) return null;

    switch (activeId) {
        case "google":
            return new GoogleProviderAdapter(config.apiKey);
        case "openai":
            return new OpenAIProviderAdapter(config.apiKey);
        case "anthropic":
            return new AnthropicProviderAdapter(config.apiKey);
        case "local":
            return new LocalProviderAdapter();
        default:
            return null;
    }
};

export const validateProviderKey = (provider: AIProviderId, key: string): boolean => {
    if (!key || key.trim() === "") return false;

    switch (provider) {
        case "google":
            return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(key);
        case "openai":
            return /^sk-[A-Za-z0-9]{32,}$/.test(key);
        case "anthropic":
            return /^sk-ant-[A-Za-z0-9-]{32,}$/.test(key);
        case "local":
            return true;
        default:
            return false;
    }
};
