import { useState, useCallback, useMemo } from 'react';

/**
 * useHistory Hook
 * Provides undo/redo functionality for a generic state object.
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
   */
  const push = useCallback((newState: T) => {
    // If state is identical to present, do nothing
    if (JSON.stringify(newState) === JSON.stringify(present)) return;

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
