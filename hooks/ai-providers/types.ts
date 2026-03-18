import type { IconAiMetadata, IconData } from "../../types";

export interface AIProviderAdapter {
    id: string;
    generateContent(params: {
        model: string;
        systemPrompt?: string;
        userPrompt: string;
        responseSchema?: any;
        signal?: AbortSignal;
    }): Promise<any>;

    // Feature specialized methods
    performSemanticSearch(query: string, icons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]>;
    generateMetadata(icon: IconData, model: string, options?: { signal?: AbortSignal }): Promise<IconAiMetadata>;
    suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]>;
    synthesizeIcons(category: string, model: string): Promise<IconData[]>;
}
