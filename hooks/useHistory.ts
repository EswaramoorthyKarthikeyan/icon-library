import { useState, useCallback } from 'react';

/**
 * Shallow equality check for two values
 * Handles primitives, objects, and arrays
 */
function shallowEqual<T>(a: T, b: T): boolean {
  // Handle identical references
  if (a === b) return true;

  // Handle null/undefined
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => shallowEqual(item, b[index]));
  }

  // Handle objects
  if (Array.isArray(a) || Array.isArray(b)) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => 
    Object.prototype.hasOwnProperty.call(b, key) && 
    shallowEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  );
}

/**
 * useHistory Hook
 * Provides undo/redo functionality for a generic state object.
 * Uses shallow comparison instead of JSON.stringify for better performance.
 * 
 * @param initialState The initial state to track
 * @param maxDepth Maximum number of history states to keep
 */
export function useHistory<T>(initialState: T, maxDepth = 50) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  /**
   * Undo to the previous state
   */
  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [canUndo, past, present, future]);

  /**
   * Redo to the next state
   */
  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, past, present, future]);

  /**
   * Push a new state onto the history stack
   * Uses shallow comparison for better performance
   */
  const push = useCallback((newState: T) => {
    // If state is identical to present, do nothing
    if (shallowEqual(newState, present)) return;

    setPast([...past, present].slice(-maxDepth));
    setPresent(newState);
    setFuture([]);
  }, [past, present, maxDepth]);

  /**
   * Reset history with a new initial state
   */
  const reset = useCallback((newInitialState: T) => {
    setPast([]);
    setPresent(newInitialState);
    setFuture([]);
  }, []);

  return {
    state: present,
    push,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    past,
    future
  };
}
