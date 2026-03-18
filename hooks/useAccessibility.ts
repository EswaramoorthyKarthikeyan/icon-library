import { useEffect } from 'react';

/**
 * Custom hook to handle common accessibility patterns
 * Provides keyboard navigation, focus management, and ARIA utilities
 */

interface AccessibilityOptions {
  enableFocusOutline?: boolean;
  enableSkipLinks?: boolean;
}

/**
 * Apply accessibility improvements to the entire application
 */
export function useAccessibility(options: AccessibilityOptions = {}) {
  const { enableFocusOutline = true, enableSkipLinks = true } = options;

  useEffect(() => {
    if (!enableFocusOutline) return;

    // Add visible focus styles for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
      /* Visible focus indicator for keyboard navigation */
      *:focus-visible {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: more) {
        *:focus-visible {
          outline-width: 3px !important;
        }
      }
      
      /* Respect prefers-reduced-motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Ensure text selection is visible */
      ::selection {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [enableFocusOutline]);

  useEffect(() => {
    if (!enableSkipLinks) return;

    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, [enableSkipLinks]);
}

/**
 * Helper to create accessible button labels
 */
export function createAriaLabel(action: string, context?: string): string {
  return context ? `${action}, ${context}` : action;
}

/**
 * Helper to announce messages to screen readers
 */
export function announceToScreenReader(message: string, polite: boolean = true) {
  const div = document.createElement('div');
  div.setAttribute('role', 'status');
  div.setAttribute('aria-live', polite ? 'polite' : 'assertive');
  div.setAttribute('aria-atomic', 'true');
  div.style.position = 'absolute';
  div.style.left = '-10000px';
  div.textContent = message;

  document.body.appendChild(div);

  setTimeout(() => {
    document.body.removeChild(div);
  }, 1000);
}

/**
 * Check color contrast ratio (WCAG)
 * Returns whether the contrast meets WCAG AA standard
 */
export function checkContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const getLuminance = (color: string) => {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(val =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Ensure keyboard focusable elements are properly ordered
 */
export function ensureTabOrder(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((el) => {
    if (!el.getAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });
}

/**
 * Trap focus within a modal dialog
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = ref.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable || focusable.length === 0) return;

      const firstFocusable = focusable[0] as HTMLElement;
      const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);
    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
}
