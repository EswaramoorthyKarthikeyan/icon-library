import { IconAiMetadata, IconData } from "../../types";
import { AIProviderAdapter } from "./types";

export class LocalProviderAdapter implements AIProviderAdapter {
    id = "local";
    private baseUrl: string;

    constructor(url: string = "http://localhost:11434/api/generate") {
        this.baseUrl = url;
    }

    async generateContent({ model, systemPrompt, userPrompt }: any): Promise<any> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model,
                    prompt: `${systemPrompt ? systemPrompt + "\n" : ""}${userPrompt}`,
                    stream: false,
                    format: "json"
                })
            });

            if (!response.ok) throw new Error("Local LLM request failed");

            const data = await response.json();
            return data.response;
        } catch (e) {
            throw new Error("Could not connect to local LLM. Ensure Ollama/LocalAI is running.");
        }
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string): Promise<string[]> {
        const iconContext = icons.slice(0, 100).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "matchedIds": ["id1", ...] } matching "${query}" from: ${JSON.stringify(iconContext)}`,
        });
        const data = JSON.parse(text);
        return data.matchedIds || [];
    }

    async generateMetadata(icon: IconData, model: string): Promise<IconAiMetadata> {
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "tags": ["tag1", ...], "description": "..." } for icon "${icon.name}"`,
        });
        return JSON.parse(text);
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string): Promise<string[]> {
        const librarySlice = allIcons.slice(0, 50).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "relatedIds": ["id1", ...] } related to "${icon.name}" from: ${JSON.stringify(librarySlice)}`,
        });
        const data = JSON.parse(text);
        return data.relatedIds || [];
    }

    async synthesizeIcons(category: string, model: string): Promise<IconData[]> {
        const text = await this.generateContent({
            model,
            userPrompt: `Return JSON: { "newIcons": [{ "name": "...", "svgPath": "..." }, ...] } for category "${category}"`,
        });
        const data = JSON.parse(text);
        return (data.newIcons || []).map((icon: any, idx: number) => ({
            id: `local-${category.toLowerCase()}-${Date.now()}-${idx}`,
            name: icon.name,
            category: category,
            svgPath: icon.svgPath,
            isSynthesized: true
        }));
    }
}
