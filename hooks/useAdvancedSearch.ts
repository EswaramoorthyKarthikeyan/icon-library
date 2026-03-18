import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FilterCriteria, SearchStats } from '../types';

/**
 * Advanced search and filtering system for the icon library
 * Provides multi-criteria filtering with saved searches
 */

export interface SearchFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: number;
  usage: number; // How many times this filter was used
}

const SAVED_FILTERS_KEY = 'icon-library-saved-filters';
const SEARCH_HISTORY_KEY = 'icon-library-search-history';
const MAX_SEARCH_HISTORY = 20;

/**
 * Apply filters to icon list
 */
export function applyFilters(
  icons: any[],
  criteria: FilterCriteria
): any[] {
  return icons.filter(icon => {
    // Text search
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      const matchesText = icon.id.toLowerCase().includes(query) ||
        icon.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
        icon.category.toLowerCase().includes(query);
      if (!matchesText) return false;
    }

    // Category filter
    if (criteria.categories && criteria.categories.length > 0) {
      if (!criteria.categories.includes(icon.category)) return false;
    }

    // Size filter
    if (criteria.sizes && criteria.sizes.length > 0) {
      const iconSize = icon.viewBox?.split(' ')[2] || icon.size || 24;
      if (!criteria.sizes.includes(iconSize)) return false;
    }

    // Color filter (check against fill colors)
    if (criteria.colors && criteria.colors.length > 0) {
      const iconHasColor = icon.colors?.some((color: string) =>
        criteria.colors?.includes(color)
      ) || false;
      if (!iconHasColor) return false;
    }

    // Date filters
    if (criteria.createdAfter && icon.createdAt) {
      if (icon.createdAt < criteria.createdAfter) return false;
    }
    if (criteria.createdBefore && icon.createdAt) {
      if (icon.createdAt > criteria.createdBefore) return false;
    }

    // Usage count filter
    if (criteria.usageCountMin !== undefined && icon.usageCount) {
      if (icon.usageCount < criteria.usageCountMin) return false;
    }
    if (criteria.usageCountMax !== undefined && icon.usageCount) {
      if (icon.usageCount > criteria.usageCountMax) return false;
    }

    // Synthesis status filter
    if (criteria.synthesisStatus && criteria.synthesisStatus !== 'all') {
      const isAiGenerated = icon.synthesisMetadata?.provider ? true : false;
      const matches = criteria.synthesisStatus === 'ai-generated'
        ? isAiGenerated
        : !isAiGenerated;
      if (!matches) return false;
    }

    // Favorite filter
    if (criteria.favorite !== undefined) {
      if (icon.isFavorite !== criteria.favorite) return false;
    }

    // Recently used filter (used in last 7 days)
    if (criteria.recentlyUsed) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (!icon.lastUsedAt || icon.lastUsedAt < sevenDaysAgo) return false;
    }

    return true;
  });
}

/**
 * Calculate filter statistics
 */
export function calculateFilterStats(
  icons: any[],
  filteredIcons: any[]
): SearchStats {
  const categoryCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};
  let aiGenerated = 0;
  let builtin = 0;

  filteredIcons.forEach(icon => {
    // Category counts
    categoryCounts[icon.category] = (categoryCounts[icon.category] || 0) + 1;

    // Color counts
    icon.colors?.forEach((color: string) => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    // Synthesis breakdown
    if (icon.synthesisMetadata?.provider) {
      aiGenerated++;
    } else {
      builtin++;
    }
  });

  return {
    totalMatches: filteredIcons.length,
    categoryCounts,
    colorCounts,
    synthesisBreakdown: { builtin, aiGenerated }
  };
}

/**
 * Main advanced search hook
 */
export function useAdvancedSearch(allIcons: any[]) {
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Load saved filters and history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_FILTERS_KEY);
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved filters:', e);
      }
    }

    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Apply filters to icons
  const filteredIcons = useMemo(() => {
    return applyFilters(allIcons, filterCriteria);
  }, [allIcons, filterCriteria]);

  // Calculate statistics
  const filterStats = useMemo(() => {
    return calculateFilterStats(allIcons, filteredIcons);
  }, [allIcons, filteredIcons]);

  // Update filter criteria
  const updateFilter = useCallback((updates: Partial<FilterCriteria>) => {
    setFilterCriteria(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterCriteria({});
  }, []);

  // Save current filter
  const saveFilter = useCallback((name: string) => {
    if (!name.trim()) return;

    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}`,
      name: name.trim(),
      criteria: filterCriteria,
      createdAt: Date.now(),
      usage: 0
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));

    return newFilter.id;
  }, [filterCriteria, savedFilters]);

  // Load saved filter
  const loadFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilterCriteria(filter.criteria);

      // Update usage count
      const updated = savedFilters.map(f =>
        f.id === filterId
          ? { ...f, usage: f.usage + 1 }
          : f
      );
      setSavedFilters(updated);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));

      return true;
    }
    return false;
  }, [savedFilters]);

  // Delete saved filter
  const deleteFilter = useCallback((filterId: string) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  }, [savedFilters]);

  // Update search history
  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    let updated = [query, ...searchHistory];
    updated = updated.filter((q, i) => updated.indexOf(q) === i); // Remove duplicates
    updated = updated.slice(0, MAX_SEARCH_HISTORY); // Keep only last 20

    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  }, [searchHistory]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // Get filter suggestions based on current icons
  const getFilterSuggestions = useCallback(() => {
    const uniqueCategories = [...new Set(filteredIcons.map(i => i.category))].sort();
    const uniqueColors = [...new Set(filteredIcons.flatMap((i: any) => i.colors || []))].sort();
    const allSizes = [...new Set(filteredIcons.map((i: any) => i.viewBox?.split(' ')[2] || i.size || 24))].sort((a, b) => Number(a) - Number(b));

    return {
      categories: uniqueCategories,
      colors: uniqueColors,
      sizes: allSizes.map(s => Number(s))
    };
  }, [filteredIcons]);

  // Export filter as JSON
  const exportFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      const data = JSON.stringify(filter, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filter-${filter.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [savedFilters]);

  // Import filter from JSON
  const importFilter = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const imported: SearchFilter = JSON.parse(text);

      // Validate structure
      if (imported.criteria && imported.name) {
        imported.id = `filter-${Date.now()}`;
        imported.createdAt = Date.now();
        imported.usage = 0;

        const updated = [...savedFilters, imported];
        setSavedFilters(updated);
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));

        return imported;
      }
    } catch (error) {
      console.error('Failed to import filter:', error);
    }
    return null;
  }, [savedFilters]);

  return {
    // State
    filterCriteria,
    filteredIcons,
    filterStats,
    savedFilters,
    searchHistory,
    showFilterPanel,

    // Actions
    updateFilter,
    clearFilters,
    setShowFilterPanel,
    saveFilter,
    loadFilter,
    deleteFilter,
    addToSearchHistory,
    clearSearchHistory,
    getFilterSuggestions,
    exportFilter,
    importFilter
  };
}

/**
 * Get readable filter description
 */
export function getFilterDescription(criteria: FilterCriteria): string[] {
  const parts: string[] = [];

  if (criteria.query) parts.push(`Search: "${criteria.query}"`);
  if (criteria.categories?.length) parts.push(`Categories: ${criteria.categories.join(', ')}`);
  if (criteria.colors?.length) parts.push(`Colors: ${criteria.colors.length} selected`);
  if (criteria.sizes?.length) parts.push(`Sizes: ${criteria.sizes.join(', ')}px`);
  if (criteria.createdAfter) parts.push(`Created after: ${new Date(criteria.createdAfter).toLocaleDateString()}`);
  if (criteria.createdBefore) parts.push(`Created before: ${new Date(criteria.createdBefore).toLocaleDateString()}`);
  if (criteria.synthesisStatus && criteria.synthesisStatus !== 'all') {
    parts.push(`Type: ${criteria.synthesisStatus === 'ai-generated' ? 'AI Generated' : 'Built-in'}`);
  }
  if (criteria.favorite) parts.push('Favorites only');
  if (criteria.recentlyUsed) parts.push('Recently used');

  return parts.length > 0 ? parts : ['No filters applied'];
}

/**
 * Get most used saved filters
 */
export function getMostUsedFilters(filters: SearchFilter[], limit: number = 5): SearchFilter[] {
  return [...filters]
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit);
}
