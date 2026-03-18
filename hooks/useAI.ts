import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { IconData, IconAiMetadata, AppSettings, TabType } from "../types";
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
 * 
 * Includes proper race condition handling with AbortController to cancel
 * pending requests when the user rapidly switches between icons.
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

    // Abort controllers for canceling pending requests
    const relatedIconsAbortRef = useRef<AbortController | null>(null);
    const metadataAbortRef = useRef<AbortController | null>(null);
    const searchAbortRef = useRef<AbortController | null>(null);

    // Refs to track which icons have been processed (avoids dependency array issues)
    const fetchedRelatedRef = useRef<Set<string>>(new Set());
    const generatedMetadataRef = useRef<Set<string>>(new Set());

    // Semantic search
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);

    // AI metadata
    const [aiMetadataCache, setAiMetadataCache] = useState<Record<string, IconAiMetadata>>({});
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

    // Related icons
    const [relatedIconsCache, setRelatedIconsCache] = useState<Record<string, string[]>>({});

    // Synthesis
    const [synthesizedIcons, setSynthesizedIcons] = useState<Record<string, IconData[]>>({});
    const [synthesizingCategory, setSynthesizingCategory] = useState<string | null>(null);

    // Error
    const [apiError, setApiError] = useState<string | null>(null);

    // Cleanup abort controllers on unmount
    useEffect(() => {
        return () => {
            relatedIconsAbortRef.current?.abort();
            metadataAbortRef.current?.abort();
            searchAbortRef.current?.abort();
        };
    }, []);

    // Reset AI state when AI is disabled
    useEffect(() => {
        if (!settings.aiEnabled) {
            if (activeTab === "generator") setActiveTab("grid");
            setAiSearchResults(null);
            setAiMetadataCache({});
            setRelatedIconsCache({});
            setSynthesizedIcons({});
            setApiError(null);
            // Reset refs
            fetchedRelatedRef.current.clear();
            generatedMetadataRef.current.clear();
            // Abort pending requests
            relatedIconsAbortRef.current?.abort();
            metadataAbortRef.current?.abort();
            searchAbortRef.current?.abort();
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
                setIsAiSearching(false);
                return;
            }

            if (!aiProvider) {
                setApiError("Active provider not configured correctly.");
                setAiSearchResults(null);
                setIsAiSearching(false);
                return;
            }

            // Cancel any pending search request
            searchAbortRef.current?.abort();
            searchAbortRef.current = new AbortController();

            setIsAiSearching(true);
            try {
                const results = await withBackoff(async () => {
                    return await aiProvider.performSemanticSearch(
                        searchQuery,
                        allIcons,
                        currentConfig.primaryModel,
                        { signal: searchAbortRef.current?.signal }
                    );
                });

                setAiSearchResults(results);
                setApiError(null);
            } catch (e: unknown) {
                // Ignore abort errors
                if (e instanceof DOMException && e.name === 'AbortError') return;
                
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
        // Skip if AI disabled, no active icon, or already fetched
        if (
            !settings.aiEnabled ||
            !activeIconId ||
            fetchedRelatedRef.current.has(activeIconId) ||
            !aiProvider
        )
            return;

        // Find the current icon
        const currentActive = allIcons.find((i) => i.id === activeIconId);
        if (!currentActive) return;

        // Cancel any pending request
        relatedIconsAbortRef.current?.abort();
        relatedIconsAbortRef.current = new AbortController();

        let isStale = false;

        const fetchRelated = async () => {
            try {
                const results = await withBackoff(async () => {
                    return await aiProvider.suggestRelatedIcons(
                        currentActive,
                        allIcons,
                        currentConfig.primaryModel,
                        { signal: relatedIconsAbortRef.current?.signal }
                    );
                });

                // Only update if this is still the active icon
                if (!isStale) {
                    setRelatedIconsCache((prev) => ({
                        ...prev,
                        [activeIconId]: results,
                    }));
                    fetchedRelatedRef.current.add(activeIconId);
                    setApiError(null);
                }
            } catch (e: unknown) {
                // Ignore abort errors
                if (e instanceof DOMException && e.name === 'AbortError') return;
                console.error("Related icons fetch failed", e);
            }
        };

        fetchRelated();

        // Cleanup function to mark as stale
        return () => {
            isStale = true;
        };
    }, [activeIconId, settings.aiEnabled, allIcons, aiProvider, currentConfig]);

    // Generate AI metadata for the active icon
    useEffect(() => {
        // Skip if AI disabled, no active icon, or already generated
        if (
            !settings.aiEnabled ||
            !activeIconId ||
            generatedMetadataRef.current.has(activeIconId) ||
            !aiProvider
        )
            return;

        // Find the current icon
        const currentActive = allIcons.find((i) => i.id === activeIconId);
        if (!currentActive) return;

        // Cancel any pending request
        metadataAbortRef.current?.abort();
        metadataAbortRef.current = new AbortController();

        let isStale = false;

        setIsGeneratingMetadata(true);

        const generateAiMetadata = async () => {
            try {
                const metadata = await withBackoff(async () => {
                    return await aiProvider.generateMetadata(
                        currentActive,
                        currentConfig.primaryModel,
                        { signal: metadataAbortRef.current?.signal }
                    );
                });

                // Only update if this is still the active icon
                if (!isStale) {
                    setAiMetadataCache((prev) => ({
                        ...prev,
                        [activeIconId]: metadata,
                    }));
                    generatedMetadataRef.current.add(activeIconId);
                    setApiError(null);
                }
            } catch (e: unknown) {
                // Ignore abort errors
                if (e instanceof DOMException && e.name === 'AbortError') return;
                
                console.error("Metadata generation failed", e);
                if (isAuthError(e)) {
                    setApiError("Auth failure. Metadata unavailable.");
                }
            } finally {
                if (!isStale) {
                    setIsGeneratingMetadata(false);
                }
            }
        };

        generateAiMetadata();

        // Cleanup function to mark as stale
        return () => {
            isStale = true;
        };
    }, [activeIconId, settings.aiEnabled, allIcons, aiProvider, currentConfig]);

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
