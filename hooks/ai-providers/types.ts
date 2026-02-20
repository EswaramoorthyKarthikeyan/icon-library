import { IconAiMetadata, IconData } from "../../types";

export interface AIProviderAdapter {
    id: string;
    generateContent(params: {
        model: string;
        systemPrompt?: string;
        userPrompt: string;
        responseSchema?: any;
    }): Promise<any>;

    // Feature specialized methods
    performSemanticSearch(query: string, icons: IconData[], model: string): Promise<string[]>;
    generateMetadata(icon: IconData, model: string): Promise<IconAiMetadata>;
    suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string): Promise<string[]>;
    synthesizeIcons(category: string, model: string): Promise<IconData[]>;
}
