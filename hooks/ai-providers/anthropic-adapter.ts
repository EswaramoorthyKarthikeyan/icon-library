import type { IconAiMetadata, IconData } from "../../types";
import type { AIProviderAdapter } from "./types";

export class AnthropicProviderAdapter implements AIProviderAdapter {
    id = "anthropic";
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
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

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
                "dangerously-allow-browser": "true"
            },
            body: JSON.stringify({
                model,
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    { role: "user", content: userPrompt }
                ]
            }),
            signal
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Anthropic request failed");
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const iconContext = icons.slice(0, 300).map(i => ({ id: i.id, name: i.name, category: i.category }));
        const text = await this.generateContent({
            model,
            userPrompt: `Given a design system icon library and a user query, return an array of icon IDs that semantically match the user's intent.
            User query: "${query}"
            Available Icons: ${JSON.stringify(iconContext)}
            Return ONLY a JSON object: { "matchedIds": ["id1", "id2", ...] }`,
            signal: options?.signal
        });

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
            return data.matchedIds || [];
        } catch {
            console.error("Failed to parse semantic search response from Anthropic");
            return [];
        }
    }

    async generateMetadata(icon: IconData, model: string, options?: { signal?: AbortSignal }): Promise<IconAiMetadata> {
        const text = await this.generateContent({
            model,
            userPrompt: `Provide professional UI design insights for the icon "${icon.name}". Generate 4-6 semantic tags and a 1-sentence usage description.
            Return ONLY a JSON object: { "tags": ["tag1", ...], "description": "..." }`,
            signal: options?.signal
        });

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch {
            console.error("Failed to parse metadata response from Anthropic");
            return { tags: [], description: "No description available" };
        }
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const librarySlice = allIcons.slice(0, 100).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Suggest 4 icon IDs from this library that are visually or conceptually related to "${icon.name}".
            Library: ${JSON.stringify(librarySlice)}
            Return ONLY a JSON object: { "relatedIds": ["id1", ...] }`,
            signal: options?.signal
        });

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
            return data.relatedIds || [];
        } catch {
            console.error("Failed to parse related icons response from Anthropic");
            return [];
        }
    }

    async synthesizeIcons(category: string, model: string): Promise<IconData[]> {
        const text = await this.generateContent({
            model,
            userPrompt: `Generate 10 new, unique, professional vector icon concepts for the design system category "${category}".
            Return a JSON object with a 'newIcons' array. Each icon should have a 'name' (lowercase) and a 'svgPath' (string for <path d="...">) suitable for a 24x24 viewBox.
            Focus on clean, simple geometric shapes typical of professional icons.
            Return ONLY a JSON object: { "newIcons": [{ "name": "...", "svgPath": "..." }, ...] }`,
        });

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
            return (data.newIcons || []).map((icon: any, idx: number) => ({
                id: `gen-${category.toLowerCase()}-${Date.now()}-${idx}`,
                name: icon.name,
                category,
                svgPath: icon.svgPath,
                isSynthesized: true
            }));
        } catch {
            console.error("Failed to parse synthesized icons from Anthropic");
            return [];
        }
    }
}
