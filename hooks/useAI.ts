import { useState, useEffect, useCallback, useMemo } from "react";
import { IconData, IconAiMetadata, AppSettings, TabType } from "../types";
import { withBackoff, isRateLimitError, isAuthError } from "../utils/api";
import { getAIProvider } from "./ai-providers/factory";

interface UseAIParams {
    settings: AppSettings;
    allIcons: IconData[];
    activeIconId: string | null;
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

/**
 * Manages all AI-powered features using a unified adapter interface
 * to support multiple providers (Google, OpenAI, Anthropic, etc.)
 */
export const useAI = ({
    settings,
    allIcons,
    activeIconId,
    activeTab,
    setActiveTab,
}: UseAIParams) => {
    // Current adapter instance
    const aiProvider = useMemo(() => getAIProvider(settings), [settings]);
    const currentConfig = settings.providers[settings.activeProvider];

    // Semantic search
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(
        null,
    );

    // AI metadata
    const [aiMetadataCache, setAiMetadataCache] = useState<
        Record<string, IconAiMetadata>
    >({});
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

    // Related icons
    const [relatedIconsCache, setRelatedIconsCache] = useState<
        Record<string, string[]>
    >({});

    // Synthesis
    const [synthesizedIcons, setSynthesizedIcons] = useState<
        Record<string, IconData[]>
    >({});
    const [synthesizingCategory, setSynthesizingCategory] = useState<
        string | null
    >(null);

    // Error
    const [apiError, setApiError] = useState<string | null>(null);

    // Reset AI state when AI is disabled
    useEffect(() => {
        if (!settings.aiEnabled) {
            if (activeTab === "generator") setActiveTab("grid");
            setAiSearchResults(null);
            setAiMetadataCache({});
            setRelatedIconsCache({});
            setSynthesizedIcons({});
            setApiError(null);
        }
    }, [settings.aiEnabled, activeTab, setActiveTab]);

    const performSemanticSearch = useCallback(
        async (searchQuery: string) => {
            if (
                !settings.aiEnabled ||
                !settings.semanticSearchEnabled ||
                !searchQuery.trim() ||
                searchQuery.length < 3
            ) {
                setAiSearchResults(null);
                return;
            }

            if (!aiProvider) {
                setApiError("Active provider not configured correctly.");
                setAiSearchResults(null);
                setIsAiSearching(false);
                return;
            }

            setIsAiSearching(true);
            try {
                const results = await withBackoff(async () => {
                    return await aiProvider.performSemanticSearch(
                        searchQuery,
                        allIcons,
                        currentConfig.primaryModel
                    );
                });

                setAiSearchResults(results);
                setApiError(null);
            } catch (e: unknown) {
                if (isRateLimitError(e)) {
                    setApiError(
                        "Rate limit exceeded. Check your provider quota.",
                    );
                } else if (isAuthError(e)) {
                    setApiError("Invalid or expired API key. Please check your settings.");
                } else {
                    setApiError("Search failed: " + (e instanceof Error ? e.message : String(e)));
                }
                console.error("Semantic search failed", e);
            } finally {
                setIsAiSearching(false);
            }
        },
        [settings.aiEnabled, settings.semanticSearchEnabled, allIcons, aiProvider, currentConfig]
    );

    // Fetch related icons for the active icon
    useEffect(() => {
        const fetchRelated = async () => {
            if (
                !settings.aiEnabled ||
                !activeIconId ||
                relatedIconsCache[activeIconId] ||
                !aiProvider
            )
                return;

            const currentActive = allIcons.find(
                (i) => i.id === activeIconId,
            );
            if (!currentActive) return;

            try {
                const results = await withBackoff(async () => {
                    return await aiProvider.suggestRelatedIcons(
                        currentActive,
                        allIcons,
                        currentConfig.primaryModel
                    );
                });

                setRelatedIconsCache((prev) => ({
                    ...prev,
                    [activeIconId]: results,
                }));
                setApiError(null);
            } catch (e: unknown) {
                console.error("Related icons fetch failed", e);
            }
        };

        fetchRelated();
    }, [activeIconId, relatedIconsCache, settings.aiEnabled, allIcons, aiProvider, currentConfig]);

    // Generate AI metadata for the active icon
    useEffect(() => {
        const generateAiMetadata = async () => {
            if (
                !settings.aiEnabled ||
                !activeIconId ||
                aiMetadataCache[activeIconId] ||
                isGeneratingMetadata ||
                !aiProvider
            )
                return;

            const currentActive = allIcons.find(
                (i) => i.id === activeIconId,
            );
            if (!currentActive) return;

            setIsGeneratingMetadata(true);
            try {
                const metadata = await withBackoff(async () => {
                    return await aiProvider.generateMetadata(
                        currentActive,
                        currentConfig.primaryModel
                    );
                });

                setAiMetadataCache((prev) => ({
                    ...prev,
                    [activeIconId]: metadata,
                }));
                setApiError(null);
            } catch (e: unknown) {
                console.error("Metadata generation failed", e);
                if (isAuthError(e)) setApiError("Auth failure. Metadata unavailable.");
            } finally {
                setIsGeneratingMetadata(false);
            }
        };

        generateAiMetadata();
    }, [
        activeIconId,
        aiMetadataCache,
        isGeneratingMetadata,
        settings.aiEnabled,
        allIcons,
        aiProvider,
        currentConfig
    ]);

    // Synthesize new icons for a category via AI
    const handleSynthesizeCategory = useCallback(
        async (category: string) => {
            if (!settings.aiEnabled || synthesizingCategory || !aiProvider) return;

            setSynthesizingCategory(category);
            try {
                const newIcons = await withBackoff(async () => {
                    return await aiProvider.synthesizeIcons(
                        category,
                        currentConfig.advancedModel
                    );
                });

                setSynthesizedIcons((prev) => ({
                    ...prev,
                    [category]: [
                        ...(prev[category] || []),
                        ...newIcons,
                    ],
                }));
                setApiError(null);
            } catch (e: unknown) {
                if (isRateLimitError(e)) {
                    setApiError("Synthesis failed: Quota exhausted.");
                } else if (isAuthError(e)) {
                    setApiError("Synthesis failed: Invalid API key.");
                }
                console.error("Synthesis failed", e);
            } finally {
                setSynthesizingCategory(null);
            }
        },
        [settings.aiEnabled, synthesizingCategory, aiProvider, currentConfig],
    );

    return {
        // Semantic search
        isAiSearching,
        aiSearchResults,
        performSemanticSearch,

        // Metadata
        aiMetadataCache,
        isGeneratingMetadata,

        // Related icons
        relatedIconsCache,

        // Synthesis
        synthesizedIcons,
        synthesizingCategory,
        handleSynthesizeCategory,

        // Provider Status
        activeProvider: settings.activeProvider,
        isAiAvailable: !!aiProvider,

        // Errors
        apiError,
        setApiError,
    };
};
