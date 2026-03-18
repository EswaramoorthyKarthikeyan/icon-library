import type { IconAiMetadata, IconData } from "../../types";
import type { AIProviderAdapter } from "./types";

export class LocalProviderAdapter implements AIProviderAdapter {
    id = "local";
    private baseUrl: string;

    constructor(url: string = "http://localhost:11434/api/generate") {
        this.baseUrl = url;
    }

    async generateContent({ model, systemPrompt, userPrompt, signal }: {
        model: string;
        systemPrompt?: string;
        userPrompt: string;
        responseSchema?: any;
        signal?: AbortSignal;
    }): Promise<any> {
        // Check if aborted before starting
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model,
                    prompt: `${systemPrompt ? systemPrompt + "\n" : ""}${userPrompt}`,
                    stream: false,
                    format: "json"
                }),
                signal
            });

            if (!response.ok) throw new Error("Local LLM request failed");

            const data = await response.json();
            return data.response;
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') throw e;
            throw new Error("Could not connect to local LLM. Ensure Ollama/LocalAI is running.");
        }
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const iconContext = icons.slice(0, 100).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "matchedIds": ["id1", ...] } matching "${query}" from: ${JSON.stringify(iconContext)}`,
            signal: options?.signal
        });
        try {
            const data = JSON.parse(text);
            return data.matchedIds || [];
        } catch {
            console.error("Failed to parse semantic search response from local provider");
            return [];
        }
    }

    async generateMetadata(icon: IconData, model: string, options?: { signal?: AbortSignal }): Promise<IconAiMetadata> {
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "tags": ["tag1", ...], "description": "..." } for icon "${icon.name}"`,
            signal: options?.signal
        });
        try {
            return JSON.parse(text);
        } catch {
            console.error("Failed to parse metadata response from local provider");
            return { tags: [], description: "No description available" };
        }
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const librarySlice = allIcons.slice(0, 50).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "relatedIds": ["id1", ...] } related to "${icon.name}" from: ${JSON.stringify(librarySlice)}`,
            signal: options?.signal
        });
        try {
            const data = JSON.parse(text);
            return data.relatedIds || [];
        } catch {
            console.error("Failed to parse related icons response from local provider");
            return [];
        }
    }

    async synthesizeIcons(category: string, model: string): Promise<IconData[]> {
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "newIcons": [{ "name": "...", "svgPath": "..." }, ...] } for category "${category}"`,
        });
        try {
            const data = JSON.parse(text);
            return (data.newIcons || []).map((icon: any, idx: number) => ({
                id: `local-${category.toLowerCase()}-${Date.now()}-${idx}`,
                name: icon.name,
                category,
                svgPath: icon.svgPath,
                isSynthesized: true
            }));
        } catch {
            console.error("Failed to parse synthesized icons from local provider");
            return [];
        }
    }
}
