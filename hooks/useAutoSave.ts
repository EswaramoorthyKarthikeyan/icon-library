import { useEffect, useCallback, useState, useRef } from 'react';
import type { IconData } from '../types';

/**
 * Auto-save hook with draft recovery
 * Automatically saves application state to IndexedDB at intervals
 * Allows recovery of unsaved work on browser crash or refresh
 */

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  key?: string;
  maxBackups?: number;
}

interface SavedDraft {
  id: string;
  timestamp: number;
  data: Record<string, unknown>;
  label?: string;
}

interface RecoveryData {
  drafts: SavedDraft[];
  lastSave: number;
  recoveryAvailable: boolean;
}

const DB_NAME = 'icon-library-db';
const STORE_NAME = 'drafts';
const CUSTOM_ICONS_STORE = 'custom_icons';
const ANNOTATIONS_STORE = 'annotations';

/**
 * Initialize IndexedDB for storing drafts
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3); // Incremented version to 3

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('IndexedDB upgrade needed:', event.oldVersion, '->', event.newVersion);
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('Creating store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CUSTOM_ICONS_STORE)) {
        console.log('Creating store:', CUSTOM_ICONS_STORE);
        db.createObjectStore(CUSTOM_ICONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ANNOTATIONS_STORE)) {
        console.log('Creating store:', ANNOTATIONS_STORE);
        db.createObjectStore(ANNOTATIONS_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save data to IndexedDB
 */
async function saveDraftToDB(draft: SavedDraft): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.put(draft);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Failed to save draft to IndexedDB:', error);
  }
}

/**
 * Retrieve all drafts from IndexedDB
 */
async function getAllDraftsFromDB(): Promise<SavedDraft[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to retrieve drafts from IndexedDB:', error);
    return [];
  }
}

/**
 * Get latest draft from IndexedDB
 */
async function getLatestDraftFromDB(): Promise<SavedDraft | null> {
  try {
    const drafts = await getAllDraftsFromDB();
    if (drafts.length === 0) return null;
    return drafts.sort((a, b) => b.timestamp - a.timestamp)[0];
  } catch (error) {
    console.error('Failed to get latest draft:', error);
    return null;
  }
}

/**
 * Clear old drafts, keeping only maxBackups
 */
async function cleanupOldDrafts(maxBackups: number = 10): Promise<void> {
  try {
    const db = await initDB();
    const drafts = await getAllDraftsFromDB();

    if (drafts.length > maxBackups) {
      const sorted = drafts.sort((a, b) => b.timestamp - a.timestamp);
      const toDelete = sorted.slice(maxBackups);

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      toDelete.forEach(draft => {
        store.delete(draft.id);
      });
    }
  } catch (error) {
    console.error('Failed to cleanup old drafts:', error);
  }
}

/**
 * Delete a specific draft
 */
export async function deleteDraft(id: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to delete draft:', error);
  }
}

/**
 * Main auto-save hook
 */
export function useAutoSave(
  data: Record<string, unknown>,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    key = 'auto-save',
    maxBackups = 10
  } = options;

  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const latestDraft = await getLatestDraftFromDB();
        if (latestDraft) {
          const timeSinceSave = Date.now() - latestDraft.timestamp;
          // If saved less than 1 hour ago, recovery is available
          if (timeSinceSave < 3600000) {
            setRecoveryData({
              drafts: await getAllDraftsFromDB(),
              lastSave: latestDraft.timestamp,
              recoveryAvailable: true
            });
          }
        }
      } catch (error) {
        console.error('Error checking for recovery data:', error);
      }
    };

    checkRecovery();
  }, []);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!enabled || !data) return;

    setIsSaving(true);
    try {
      const draft: SavedDraft = {
        id: `${key}-${Date.now()}`,
        timestamp: Date.now(),
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        label: `Auto-saved at ${new Date().toLocaleTimeString()}`
      };

      await saveDraftToDB(draft);
      await cleanupOldDrafts(maxBackups);
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, enabled, key, maxBackups]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    // Perform initial save
    performAutoSave();

    // Set up interval for subsequent saves
    autoSaveTimerRef.current = setInterval(performAutoSave, interval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, interval, performAutoSave]);

  // Manual save trigger
  const manualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  // Recovery function
  const recoverDraft = useCallback(async (draftId: string) => {
    const drafts = await getAllDraftsFromDB();
    const draft = drafts.find(d => d.id === draftId);
    return draft || null;
  }, []);

  // Clear all recovery data
  const clearRecoveryData = useCallback(async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          setRecoveryData(null);
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to clear recovery data:', error);
    }
  }, []);

  return {
    recoveryData,
    lastSaveTime,
    isSaving,
    manualSave,
    recoverDraft,
    clearRecoveryData,
    hasRecovery: recoveryData?.recoveryAvailable ?? false
  };
}

/**
 * Hook to check for crash recovery on app start
 */
export function useRecoveryCheck() {
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryDrafts, setRecoveryDrafts] = useState<SavedDraft[]>([]);

  useEffect(() => {
    const checkForCrash = async () => {
      // Check if app was terminated unexpectedly
      const wasTerminated = sessionStorage.getItem('app-active') === 'true';
      if (!wasTerminated) {
        sessionStorage.setItem('app-active', 'true');
      }

      // If app was active but now reloading, check for recovery
      if (wasTerminated) {
        const drafts = await getAllDraftsFromDB();
        const recentDrafts = drafts.filter(d => 
          Date.now() - d.timestamp < 3600000 // Less than 1 hour old
        );

        if (recentDrafts.length > 0) {
          setRecoveryDrafts(recentDrafts);
          setShowRecoveryDialog(true);
        }
      }
    };

    checkForCrash();

    // Clean up session marker on normal navigation away
    return () => {
      sessionStorage.removeItem('app-active');
    };
  }, []);

  return {
    showRecoveryDialog,
    setShowRecoveryDialog,
    recoveryDrafts
  };
}

/**
 * Export draft as JSON file
 */
export function exportDraftAsJSON(draft: SavedDraft, filename?: string) {
  const data = JSON.stringify(draft, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `draft-${draft.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import draft from JSON file
 */
export async function importDraftFromJSON(file: File): Promise<SavedDraft | null> {
  try {
    const text = await file.text();
    const draft: SavedDraft = JSON.parse(text);

    // Validate draft structure
    if (draft.id && draft.timestamp && draft.data) {
      await saveDraftToDB(draft);
      return draft;
    }
  } catch (error) {
    console.error('Failed to import draft:', error);
  }
  return null;
}

/**
 * Save a custom icon to IndexedDB
 */
export async function saveCustomIcon(icon: IconData): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([CUSTOM_ICONS_STORE], 'readwrite');
    const store = transaction.objectStore(CUSTOM_ICONS_STORE);
    await new Promise((resolve, reject) => {
      const request = store.put(icon);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Failed to save custom icon:', error);
  }
}

/**
 * Get all custom icons from IndexedDB
 */
export async function getCustomIcons(): Promise<any[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([CUSTOM_ICONS_STORE], 'readonly');
    const store = transaction.objectStore(CUSTOM_ICONS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to get custom icons:', error);
    return [];
  }
}

/**
 * Delete a custom icon from IndexedDB
 */
export async function deleteCustomIcon(id: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([CUSTOM_ICONS_STORE], 'readwrite');
    const store = transaction.objectStore(CUSTOM_ICONS_STORE);
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(undefined);
    });
  } catch (error) {
    console.error('Failed to delete custom icon:', error);
  }
}

// --- Annotations Store Exporters ---

export interface IconAnnotation {
  id: string; // The Icon ID
  text: string;
  updatedAt: number;
}

export async function getAnnotations(): Promise<IconAnnotation[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([ANNOTATIONS_STORE], 'readonly');
    const store = transaction.objectStore(ANNOTATIONS_STORE);
    return new Promise((resolve, reject) => {
       const request = store.getAll();
       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to get annotations:', error);
    return [];
  }
}

export async function saveAnnotation(id: string, text: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([ANNOTATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(ANNOTATIONS_STORE);
    
    if (!text.trim()) {
       // Delete if empty
       await new Promise((resolve, reject) => {
           const request = store.delete(id);
           request.onerror = () => reject(request.error);
           request.onsuccess = () => resolve(request.result);
       });
       return;
    }

    const annotation: IconAnnotation = { id, text, updatedAt: Date.now() };
    await new Promise((resolve, reject) => {
      const request = store.put(annotation);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Failed to save annotation:', error);
  }
}
