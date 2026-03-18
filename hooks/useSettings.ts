import { useState, useEffect, useCallback, useMemo } from "react";
import type {
    AppSettings,
    AppTheme,
    Collection,
    IconTransform,
    ViewportSize,
    Weighting,
    VisualState,
} from "../types";
import { useHistory } from "./useHistory";

const DEFAULT_SETTINGS: AppSettings = {
    showGrid: true,
    gridOpacity: 0.08,
    uiDensity: "standard",
    autoExportFolders: true,
    primaryFont: "Inter",
    monoFont: "JetBrains Mono",
    semanticSearchEnabled: false,
    aiEnabled: true,
    namingValidationEnabled: false,
    hasSeenAiPrompt: false,
    activeProvider: "google",
    providers: {
        google: {
            id: "google",
            apiKey: "",
            enabled: true,
            status: "missing",
            primaryModel: "gemini-1.5-flash",
            advancedModel: "gemini-1.5-pro",
        },
        openai: {
            id: "openai",
            apiKey: "",
            enabled: false,
            status: "missing",
            primaryModel: "gpt-4o-mini",
            advancedModel: "gpt-4o",
        },
        anthropic: {
            id: "anthropic",
            apiKey: "",
            enabled: false,
            status: "missing",
            primaryModel: "claude-3-haiku-20240307",
            advancedModel: "claude-3-5-sonnet-20240620",
        },
        local: {
            id: "local",
            apiKey: "none",
            enabled: false,
            status: "missing",
            primaryModel: "llama3",
            advancedModel: "llama3",
        },
    },
};

const DEFAULT_TRANSFORM: IconTransform = {
    rotate: 0,
    scale: 1,
    flipH: false,
    flipV: false,
};

/**
 * Manages application settings, theme, visual preferences,
 * and collection persistence via localStorage.
 */
export const useSettings = () => {
    // Initial visual state
    const initialVisualState: VisualState = useMemo(() => ({
        viewportSize: 24,
        weighting: "regular",
        theme: (localStorage.getItem("core_ui_theme") as AppTheme) || "system",
        accentColor: "",
        customFillColor: "none",
        transform: DEFAULT_TRANSFORM,
    }), []);

    // History-managed visual state
    const { 
        state: vs, 
        push: pushHistory, 
        undo, 
        redo, 
        canUndo, 
        canRedo 
    } = useHistory<VisualState>(initialVisualState);

    // Compatibility setters that push to history
    const setViewportSize = useCallback((size: ViewportSize) => {
        pushHistory({ ...vs, viewportSize: size });
    }, [vs, pushHistory]);

    const setWeighting = useCallback((w: Weighting) => {
        pushHistory({ ...vs, weighting: w });
    }, [vs, pushHistory]);

    const setTheme = useCallback((t: AppTheme) => {
        pushHistory({ ...vs, theme: t });
    }, [vs, pushHistory]);

    const setAccentColor = useCallback((color: string) => {
        pushHistory({ ...vs, accentColor: color });
    }, [vs, pushHistory]);

    const setCustomFillColor = useCallback((color: string) => {
        pushHistory({ ...vs, customFillColor: color });
    }, [vs, pushHistory]);

    const setTransform = useCallback((t: IconTransform) => {
        pushHistory({ ...vs, transform: t });
    }, [vs, pushHistory]);

    // Save theme to localStorage
    useEffect(() => {
        localStorage.setItem("core_ui_theme", vs.theme);
    }, [vs.theme]);

    // App settings (persisted in localStorage)
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem("core_ui_settings");
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse saved settings:", e);
            }
        }
        return DEFAULT_SETTINGS;
    });

    // Collections (persisted in localStorage)
    const [collections, setCollections] = useState<Collection[]>([]);

    const handleUpdateSettings = useCallback(
        (newSettings: Partial<AppSettings>) => {
            setSettings((prev) => {
                const updated = { ...prev, ...newSettings };
                localStorage.setItem("core_ui_settings", JSON.stringify(updated));
                return updated;
            });
        },
        [],
    );

    // Load collections from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("core_ui_collections");
        if (saved) {
            try {
                setCollections(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved collections:", e);
            }
        }
    }, []);

    // Persist collections to localStorage on change
    useEffect(() => {
        localStorage.setItem(
            "core_ui_collections",
            JSON.stringify(collections),
        );
    }, [collections]);

    // Apply theme and accent color to the DOM
    useEffect(() => {
        const applyTheme = (targetTheme: AppTheme) => {
            let actualTheme: "dark" | "light" = "dark";

            if (targetTheme === "system") {
                actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
                actualTheme = targetTheme as "dark" | "light";
            }

            // Set Primary Color / Accent
            const defaultBlue = actualTheme === "dark" ? "#60a5fa" : "#2563eb";
            const primaryHex = vs.accentColor || defaultBlue;

            // Helper to convert hex to HSL for shadcn variables
            const hexToHsl = (hex: string) => {
                let r = 0, g = 0, b = 0;
                if (hex.length === 4) {
                    r = parseInt(hex[1] + hex[1], 16);
                    g = parseInt(hex[2] + hex[2], 16);
                    b = parseInt(hex[3] + hex[3], 16);
                } else if (hex.length === 7) {
                    r = parseInt(hex.substring(1, 3), 16);
                    g = parseInt(hex.substring(3, 5), 16);
                    b = parseInt(hex.substring(5, 7), 16);
                }
                r /= 255; g /= 255; b /= 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h = 0, s, l = (max + min) / 2;
                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
            };

            const hslValue = hexToHsl(primaryHex);
            document.documentElement.style.setProperty("--primary", hslValue);
            document.documentElement.style.setProperty("--ring", hslValue);
            document.documentElement.style.setProperty("--system-accent", primaryHex);

            if (actualTheme === "dark") {
                document.documentElement.classList.add("dark");
                document.documentElement.classList.remove("light");
            } else {
                document.documentElement.classList.remove("dark");
                document.documentElement.classList.add("light");
            }
        };

        applyTheme(vs.theme);

        // Listen for system theme changes if in system mode
        if (vs.theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("system");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
        // Return empty cleanup function for non-system themes
        return () => {};
    }, [vs.theme, vs.accentColor]);

    return {
        // Visual preferences
        viewportSize: vs.viewportSize,
        setViewportSize,
        weighting: vs.weighting,
        setWeighting,
        theme: vs.theme,
        setTheme,
        accentColor: vs.accentColor,
        setAccentColor,
        customFillColor: vs.customFillColor,
        setCustomFillColor,
        transform: vs.transform,
        setTransform,

        // History
        undo,
        redo,
        canUndo,
        canRedo,

        // App settings
        settings,
        handleUpdateSettings,

        // Collections
        collections,
        setCollections,
    };
};
