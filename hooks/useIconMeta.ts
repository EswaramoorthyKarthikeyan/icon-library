import { useState, useEffect, useCallback } from 'react';
import type { IconMeta } from './useAutoSave';
import {
  getIconMeta,
  toggleFavorite as toggleFavoriteDb,
  setRating as setRatingDb,
  markAsRecentlyUsed as markAsRecentlyUsedDb,
  getFavoriteIds,
  getRecentlyUsedIds,
} from './useAutoSave';

/**
 * Hook to manage icon metadata (favorites, ratings, recently used)
 */
export function useIconMeta(iconId: string | null) {
  const [meta, setMeta] = useState<IconMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!iconId) {
      setMeta(null);
      return;
    }

    setIsLoading(true);
    getIconMeta(iconId).then((m) => {
      setMeta(m);
      setIsLoading(false);
    });
  }, [iconId]);

  const toggleFavorite = useCallback(async () => {
    if (!iconId) return;
    const newFavorite = await toggleFavoriteDb(iconId);
    setMeta((prev) => prev ? { ...prev, isFavorite: newFavorite } : null);
  }, [iconId]);

  const setRating = useCallback(async (rating: number) => {
    if (!iconId) return;
    await setRatingDb(iconId, rating);
    setMeta((prev) => prev ? { ...prev, rating } : null);
  }, [iconId]);

  const markAsRecentlyUsed = useCallback(async () => {
    if (!iconId) return;
    await markAsRecentlyUsedDb(iconId);
  }, [iconId]);

  return {
    meta,
    isLoading,
    isFavorite: meta?.isFavorite ?? false,
    rating: meta?.rating ?? 0,
    toggleFavorite,
    setRating,
    markAsRecentlyUsed,
  };
}

/**
 * Hook to get all favorites
 */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const ids = await getFavoriteIds();
    setFavoriteIds(ids);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { favoriteIds, isLoading, refresh };
}

/**
 * Hook to get recently used icons
 */
export function useRecentlyUsed(limit: number = 20) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const ids = await getRecentlyUsedIds(limit);
    setRecentIds(ids);
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { recentIds, isLoading, refresh };
}
