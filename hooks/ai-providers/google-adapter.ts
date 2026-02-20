import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { IconAiMetadata, IconData } from "../../types";
import { AIProviderAdapter } from "./types";

export class GoogleProviderAdapter implements AIProviderAdapter {
    id = "google";
    private genAi: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAi = new GoogleGenerativeAI(apiKey);
    }

    async generateContent({ model, systemPrompt, userPrompt, responseSchema }: any): Promise<any> {
        const generativeModel = this.genAi.getGenerativeModel({
            model,
            systemInstruction: systemPrompt,
        });

        const result = await generativeModel.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: responseSchema ? {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            } : undefined
        });

        const response = await result.response;
        return response.text();
    }

    async performSemanticSearch(query: string, icons: IconData[], model: string): Promise<string[]> {
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
            responseSchema: schema
        });

        const data = JSON.parse(text);
        return data.matchedIds || [];
    }

    async generateMetadata(icon: IconData, model: string): Promise<IconAiMetadata> {
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
            responseSchema: schema
        });

        return JSON.parse(text);
    }

    async suggestRelatedIcons(icon: IconData, allIcons: IconData[], model: string): Promise<string[]> {
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
            responseSchema: schema
        });

        const data = JSON.parse(text);
        return data.relatedIds || [];
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
