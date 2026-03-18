import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { IconAiMetadata, IconData } from "../../types";
import type { AIProviderAdapter } from "./types";

export class GoogleProviderAdapter implements AIProviderAdapter {
    id = "google";
    private genAi: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAi = new GoogleGenerativeAI(apiKey);
    }

    async generateContent({ model, systemPrompt, userPrompt, responseSchema, signal }: {
        model: string;
        systemPrompt?: string;
        userPrompt: string;
        responseSchema?: any;
        signal?: AbortSignal;
    }): Promise<any> {
        const generativeModel = this.genAi.getGenerativeModel({
            model,
            systemInstruction: systemPrompt,
        });

        // Check if aborted before starting
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const abortHandler = () => {
            throw new DOMException('Aborted', 'AbortError');
        };
        
        if (signal) {
            signal.addEventListener('abort', abortHandler);
        }

        try {
            const result = await generativeModel.generateContent({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: responseSchema ? {
                    responseMimeType: "application/json",
                    responseSchema
                } : undefined
            });

            // Check if aborted after the request
            if (signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            const response = await result.response;
            return response.text();
        } finally {
            if (signal) {
                signal.removeEventListener('abort', abortHandler);
            }
        }
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const iconContext = icons.slice(0, 300).map(i => ({ id: i.id, name: i.name, category: i.category }));
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                matchedIds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["matchedIds"]
        };

        const text = await this.generateContent({
            model,
            userPrompt: `Given a design system icon library and a user query, return an array of icon IDs that semantically match the user's intent.
            User query: "${query}"
            Available Icons: ${JSON.stringify(iconContext)}`,
            responseSchema: schema,
            signal: options?.signal
        });

        try {
            const data = JSON.parse(text);
            return data.matchedIds || [];
        } catch {
            console.error("Failed to parse semantic search response from Google Gemini");
            return [];
        }
    }

    async generateMetadata(icon: IconData, model: string, options?: { signal?: AbortSignal }): Promise<IconAiMetadata> {
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                description: { type: SchemaType.STRING }
            },
            required: ["tags", "description"]
        };

        const text = await this.generateContent({
            model,
            userPrompt: `Provide professional UI design insights for the icon "${icon.name}". Generate 4-6 semantic tags and a 1-sentence usage description.`,
            responseSchema: schema,
            signal: options?.signal
        });

        try {
            return JSON.parse(text);
        } catch {
            console.error("Failed to parse metadata response from Google Gemini");
            return { tags: [], description: "No description available" };
        }
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string, options?: { signal?: AbortSignal }): Promise<string[]> {
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                relatedIds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["relatedIds"]
        };

        const librarySlice = allIcons.slice(0, 100).map(i => ({ id: i.id, name: i.name }));
        const text = await this.generateContent({
            model,
            userPrompt: `Suggest 4 icon IDs from this library that are visually or conceptually related to "${icon.name}".
            Library: ${JSON.stringify(librarySlice)}
            Return only the array of IDs.`,
            responseSchema: schema,
            signal: options?.signal
        });

        try {
            const data = JSON.parse(text);
            return data.relatedIds || [];
        } catch {
            console.error("Failed to parse related icons response from Google Gemini");
            return [];
        }
    }

    async synthesizeIcons(category: string, model: string): Promise<IconData[]> {
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                newIcons: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            name: { type: SchemaType.STRING },
                            svgPath: { type: SchemaType.STRING }
                        },
                        required: ["name", "svgPath"]
                    }
                }
            },
            required: ["newIcons"]
        };

        const text = await this.generateContent({
            model,
            userPrompt: `Generate 10 new, unique, professional vector icon concepts for the design system category "${category}".
            Return a JSON object with a 'newIcons' array. Each icon should have a 'name' (lowercase) and a 'svgPath' (string for <path d="...">) suitable for a 24x24 viewBox.
            Focus on clean, simple geometric shapes typical of professional icons.`,
            responseSchema: schema
        });

        try {
            const data = JSON.parse(text);
            return (data.newIcons || []).map((icon: any, idx: number) => ({
                id: `gen-${category.toLowerCase()}-${Date.now()}-${idx}`,
                name: icon.name,
                category,
                svgPath: icon.svgPath,
                isSynthesized: true
            }));
        } catch {
            console.error("Failed to parse synthesized icons from Google Gemini");
            return [];
        }
    }
}
