import { IconAiMetadata, IconData } from "../../types";
import { AIProviderAdapter } from "./types";

export class OpenAIProviderAdapter implements AIProviderAdapter {
    id = "openai";
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateContent({ model, systemPrompt, userPrompt, responseSchema }: any): Promise<any> {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                    { role: "user", content: userPrompt }
                ],
                response_format: responseSchema ? { type: "json_object" } : undefined
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "OpenAI request failed");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string): Promise<string[]> {
        const iconContext = icons.slice(0, 300).map(i => ({ id: i.id, name: i.name, category: i.category }));
        const text = await this.generateContent({
            model,
            userPrompt: `Given a design system icon library and a user query, return an array of icon IDs that semantically match the user's intent.
            User query: "${query}"
            Available Icons: ${JSON.stringify(iconContext)}
            Return JSON: { "matchedIds": ["id1", "id2", ...] }`,
            responseSchema: true
        });

        const data = JSON.parse(text);
        return data.matchedIds || [];
    }

    async generateMetadata(icon: IconData, model: string): Promise<IconAiMetadata> {
        const text = await this.generateContent({
            model,
            userPrompt: `Provide professional UI design insights for the icon "${icon.name}". Generate 4-6 semantic tags and a 1-sentence usage description.
            Return JSON: { "tags": ["tag1", ...], "description": "..." }`,
            responseSchema: true
        });

        return JSON.parse(text);
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string): Promise<string[]> {
        const librarySlice = allIcons.slice(0, 100).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Suggest 4 icon IDs from this library that are visually or conceptually related to "${icon.name}".
            Library: ${JSON.stringify(librarySlice)}
            Return JSON: { "relatedIds": ["id1", ...] }`,
            responseSchema: true
        });

        const data = JSON.parse(text);
        return data.relatedIds || [];
    }

    async synthesizeIcons(category: string, model: string): Promise<IconData[]> {
        const text = await this.generateContent({
            model,
            userPrompt: `Generate 10 new, unique, professional vector icon concepts for the design system category "${category}".
            Return a JSON object with a 'newIcons' array. Each icon should have a 'name' (lowercase) and a 'svgPath' (string for <path d="...">) suitable for a 24x24 viewBox.
            Focus on clean, simple geometric shapes typical of professional icons.
            Return JSON: { "newIcons": [{ "name": "...", "svgPath": "..." }, ...] }`,
            responseSchema: true
        });

        const data = JSON.parse(text);
        return (data.newIcons || []).map((icon: any, idx: number) => ({
            id: `gen-${category.toLowerCase()}-${Date.now()}-${idx}`,
            name: icon.name,
            category: category,
            svgPath: icon.svgPath,
            isSynthesized: true
        }));
    }
}
