import { useState, useMemo, useCallback, useEffect } from "react";
import type {
    IconData,
    IconAiMetadata,
    Weighting,
    Collection,
    IconTransform,
    AppSettings,
    ViewMode,
} from "../types";
import { ICON_LIBRARY } from "../constants";
import JSZip from "jszip";

interface UseIconLibraryParams {
    settings: AppSettings;
    weighting: Weighting;
    transform: IconTransform;
    customFillColor: string;
    collections: Collection[];
    synthesizedIcons: Record<string, IconData[]>;
    aiMetadataCache: Record<string, IconAiMetadata>;
    aiSearchResults: string[] | null;
    customIcons: IconData[];
}

/**
 * Manages icon library state: all icons, filtering, selection,
 * category navigation, and export operations.
 */
export const useIconLibrary = ({
    settings,
    weighting,
    transform,
    customFillColor,
    collections,
    synthesizedIcons,
    aiMetadataCache,
    aiSearchResults,
    customIcons,
}: UseIconLibraryParams) => {
    // Selection state
    const [activeIconId, setActiveIconId] = useState<string | null>("nav-grid");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(["nav-grid"]),
    );
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
        null,
    );

    // Error and notification state
    const [exportError, setExportError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    // Clear error after timeout
    const clearError = useCallback(() => {
        setExportError(null);
    }, []);

    // Show notification with auto-dismiss
    const showNotification = useCallback((message: string, duration = 3000) => {
        setNotification(message);
        setTimeout(() => setNotification(null), duration);
    }, []);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem("core_ui_view_mode");
        return (saved as ViewMode) || "grid";
    });

    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem("core_ui_search_history");
        return saved ? JSON.parse(saved) : [];
    });

    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem("core_ui_recent_icons");
        return saved ? JSON.parse(saved) : [];
    });

    const addToSearchHistory = useCallback((query: string) => {
        if (!query.trim()) return;
        setSearchHistory(prev => {
            const next = [query, ...prev.filter(q => q !== query)].slice(0, 10);
            localStorage.setItem("core_ui_search_history", JSON.stringify(next));
            return next;
        });
    }, []);

    const addToRecent = useCallback((id: string) => {
        setRecentlyViewedIds(prev => {
            const next = [id, ...prev.filter(i => i !== id)].slice(0, 20);
            localStorage.setItem("core_ui_recent_icons", JSON.stringify(next));
            return next;
        });
    }, []);

    useEffect(() => {
        localStorage.setItem("core_ui_view_mode", viewMode);
    }, [viewMode]);

    // All icons (core library + AI synthesized)
    const allIcons = useMemo(() => {
        const core = Object.values(ICON_LIBRARY).flat();
        const synth = Object.values(synthesizedIcons).flat();
        
        return [...core, ...synth, ...customIcons];
    }, [synthesizedIcons, customIcons, ICON_LIBRARY]);

    // Grouping Logic for Variants
    const groupedIcons = useMemo(() => {
        const groups: Record<string, string[]> = {};
        allIcons.forEach(icon => {
            // Assume variants follow name-type pattern (e.g., home-filled)
            const baseName = icon.name.split('-')[0];
            if (!groups[baseName]) groups[baseName] = [];
            groups[baseName].push(icon.id);
        });

        return groups;
    }, [allIcons]);

    // Currently active (previewed) icon
    const activeIcon = useMemo(
        () => allIcons.find((i) => i.id === activeIconId) || null,
        [activeIconId, allIcons],
    );

    // Filtered icon list based on search, AI results, category, and collection
    const filteredIconsList = useMemo(() => {
        // AI semantic search takes priority when enabled
        if (
            settings.aiEnabled &&
            settings.semanticSearchEnabled &&
            aiSearchResults !== null &&
            searchQuery.trim()
        ) {
            return allIcons.filter((icon) =>
                aiSearchResults.includes(icon.id),
            );
        }

        let result = allIcons;

        // Filter by active collection
        if (activeCollectionId) {
            const col = collections.find((c) => c.id === activeCollectionId);
            if (col) {
                result = result.filter((icon) =>
                    col.iconIds.includes(icon.id),
                );
            }
        } else if (selectedCategory) {
            result = allIcons.filter(
                (icon) => icon.category === selectedCategory,
            );
        }

        // Text search (when semantic search is off)
        if (
            searchQuery.trim() &&
            (!settings.aiEnabled || !settings.semanticSearchEnabled)
        ) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (icon) =>
                    icon.name.toLowerCase().includes(q) ||
                    icon.id.toLowerCase().includes(q),
            );
        }

        return result;
    }, [
        allIcons,
        searchQuery,
        selectedCategory,
        activeCollectionId,
        collections,
        settings.semanticSearchEnabled,
        aiSearchResults,
        settings.aiEnabled,
    ]);

    // Icons grouped by category for grid rendering
    const categoriesToRender = useMemo(() => {
        const groups: Record<string, IconData[]> = {};
        const catsToProcess = Array.from(
            new Set([
                ...Object.keys(ICON_LIBRARY),
                ...filteredIconsList.map((i) => i.category),
            ]),
        );

        catsToProcess.forEach((cat) => {
            const icons = filteredIconsList.filter(
                (icon) => icon.category === cat,
            );
            if (icons.length > 0) groups[cat] = icons;
        });

        return groups;
    }, [filteredIconsList, searchQuery, selectedCategory, activeCollectionId]);

    // Selection operations
    const handleToggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleInvertSelection = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set<string>();
            filteredIconsList.forEach(icon => {
                if (!prev.has(icon.id)) {
                    next.add(icon.id);
                }
            });
            return next;
        });
    }, [filteredIconsList]);

    const handleSelectFiltered = useCallback(() => {
        const next = new Set<string>(filteredIconsList.map(i => i.id));
        setSelectedIds(next);
    }, [filteredIconsList]);

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    // Copy full specification to clipboard
    const handleCopySpec = useCallback(() => {
        if (!activeIcon) return;
        const meta = aiMetadataCache[activeIcon.id];
        const spec =
            `### ASSET SPECIFICATION: ${activeIcon.name.toUpperCase()}\n\n` +
            `- **UID:** ${activeIcon.id}\n` +
            `- **Category:** ${activeIcon.category}\n` +
            (settings.aiEnabled
                ? `- **Tags:** ${meta?.tags.join(", ") || "N/A"}\n`
                : "") +
            (settings.aiEnabled
                ? `- **Usage:** ${meta?.description || "N/A"}\n\n`
                : "\n") +
            `**Batch Transformations Applied:**\n` +
            `- Rotation: ${transform.rotate}°\n` +
            `- Scale: ${transform.scale}x\n` +
            `- Mirroring: ${transform.flipH ? "Horizontal" : "None"}, ${transform.flipV ? "Vertical" : "None"}\n\n` +
            `**SVG Path Data:**\n\`\`\`\n${activeIcon.svgPath}\n\`\`\``;

        navigator.clipboard.writeText(spec);
        showNotification("Specification copied to clipboard");
    }, [activeIcon, aiMetadataCache, settings.aiEnabled, transform]);

    /** Helper to render SVG to PNG and download */
    const downloadAsPng = useCallback((svgContent: string, fileName: string) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        // Set up cleanup on load or error
        const cleanup = () => {
            URL.revokeObjectURL(url);
        };

        img.onload = () => {
            try {
                canvas.width = 512; // High res export
                canvas.height = 512;
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, 512, 512);
                    const pngUrl = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = pngUrl;
                    a.download = `${fileName}.png`;
                    a.click();
                }
            } finally {
                cleanup();
            }
        };

        img.onerror = () => {
            console.error("Failed to load SVG for PNG conversion");
            cleanup();
        };

        img.src = url;
    }, []);

    // Export a single icon in various formats
    const handleExportSingle = useCallback(
        async (icon: IconData, format: 'svg' | 'jsx' | 'json' | 'png' = 'svg') => {
            try {
                const { buildJsxContent, buildSvgContent } = await import("../utils/svg");
                let content: string;
                let fileName: string = icon.name;
                let mimeType: string = "text/plain";

                const svgContent = buildSvgContent(
                    icon,
                    transform,
                    weighting,
                    customFillColor,
                );

                if (format === 'png') {
                    downloadAsPng(svgContent, icon.name);
                    return;
                }

                switch (format) {
                    case 'jsx':
                        content = buildJsxContent(icon, weighting);
                        fileName += ".tsx";
                        break;
                    case 'json':
                        content = JSON.stringify({
                            id: icon.id,
                            name: icon.name,
                            category: icon.category,
                            path: icon.svgPath,
                            weighting,
                            transform
                        }, null, 2);
                        fileName += ".json";
                        mimeType = "application/json";
                        break;
                    default:
                        content = svgContent;
                        fileName += ".svg";
                        mimeType = "image/svg+xml";
                }

                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error("Single export failed:", err);
                setExportError("Failed to export icon. Please try again.");
            }
        },
        [transform, weighting, customFillColor, downloadAsPng],
    );

    // Export selected icons (or all) as a ZIP archive
    const handleExport = useCallback(async (format: 'svg' | 'jsx' | 'json' = 'svg') => {
        try {
            const itemsToExport =
                selectedIds.size > 0
                    ? allIcons.filter((icon) => selectedIds.has(icon.id))
                    : allIcons;

            if (itemsToExport.length === 0) {
                setExportError("No icons selected for export.");
                return;
            }

            // Ensure JSZip is constructor
            const ZipConstructor = typeof JSZip === 'function' ? JSZip : (JSZip as any).default;
            const zip = new ZipConstructor();
            const { buildJsxContent, buildSvgContent } = await import("../utils/svg");

            console.log(`Starting bulk export of ${itemsToExport.length} assets in ${format} format...`);

            itemsToExport.forEach((icon) => {
                let content: string;
                let ext: string;

                switch (format) {
                    case 'jsx':
                        content = buildJsxContent(icon, weighting);
                        ext = ".tsx";
                        break;
                    case 'json':
                        content = JSON.stringify({
                            id: icon.id,
                            name: icon.name,
                            category: icon.category,
                            path: icon.svgPath,
                            weighting,
                            transform
                        }, null, 2);
                        ext = ".json";
                        break;
                    default:
                        content = buildSvgContent(
                            icon,
                            transform,
                            weighting,
                            customFillColor,
                        );
                        ext = ".svg";
                }

                const folder = settings.autoExportFolders ? icon.category + "/" : "";
                zip.file(`${folder}${icon.name}${ext}`, content);
            });

            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `core_ui_export_${itemsToExport.length}_assets_${format}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            console.log("Bulk export completed successfully.");
            showNotification(`Exported ${itemsToExport.length} icons successfully`);
        } catch (err) {
            console.error("Bulk export failed:", err);
            setExportError("Export failed. Please try again.");
        }
    }, [
        selectedIds,
        allIcons,
        transform,
        weighting,
        customFillColor,
        settings.autoExportFolders,
    ]);

    // Category/collection selection helpers
    const handleSelectCategory = useCallback((cat: string | null) => {
        setSelectedCategory(cat);
        setActiveCollectionId(null);
    }, []);

    const handleSelectCollection = useCallback((id: string | null) => {
        setActiveCollectionId(id);
        setSelectedCategory(null);
    }, []);

    return {
        // Search
        searchQuery,
        setSearchQuery,

        // Selection
        activeIconId,
        setActiveIconId,
        activeIcon,
        selectedIds,
        setSelectedIds,
        handleToggleSelection,

        // Category / Collection navigation
        selectedCategory,
        setSelectedCategory: handleSelectCategory,
        activeCollectionId,
        setActiveCollectionId: handleSelectCollection,

        // View Settings
        viewMode,
        setViewMode,
        searchHistory,
        recentlyViewedIds,
        addToSearchHistory,
        addToRecent,

        // Computed data
        allIcons,
        filteredIconsList,
        categoriesToRender,
        groupedIcons,

        // Actions
        handleCopySpec,
        handleExportSingle,
        handleExport,
        handleInvertSelection,
        handleSelectFiltered,
        handleClearSelection,

        // Error handling
        exportError,
        clearError,
        notification,
    };
};
