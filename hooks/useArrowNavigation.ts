import { useEffect, useCallback } from 'react';

interface ArrowNavigationOptions {
  selectors: string;
  onSelect?: (index: number) => void;
  enabled?: boolean;
  cols?: number; // Approximate columns for up/down navigation
}

/**
 * Custom hook for arrow-key navigation within a container
 */
export const useArrowNavigation = (
  containerRef: React.RefObject<HTMLElement | null>,
  options: ArrowNavigationOptions
) => {
  const { selectors, onSelect, enabled = true, cols = 0 } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll(selectors)
      ) as HTMLElement[];
      
      if (items.length === 0) return;

      const activeIndex = items.indexOf(document.activeElement as HTMLElement);
      let nextIndex = activeIndex;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = activeIndex + 1;
          break;
        case 'ArrowLeft':
          nextIndex = activeIndex - 1;
          break;
        case 'ArrowDown':
          nextIndex = cols > 0 ? activeIndex + cols : activeIndex + 1;
          break;
        case 'ArrowUp':
          nextIndex = cols > 0 ? activeIndex - cols : activeIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return; // Ignore other keys
      }

      // Bound checks
      if (nextIndex >= 0 && nextIndex < items.length) {
        event.preventDefault();
        items[nextIndex].focus();
        onSelect?.(nextIndex);
      }
    },
    [enabled, containerRef, selectors, onSelect, cols]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, containerRef]);
};
