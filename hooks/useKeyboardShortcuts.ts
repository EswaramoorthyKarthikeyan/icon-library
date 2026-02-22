
import { useEffect } from 'react';

export interface ShortcutDefinition {
    key: string;
    label: string;
    description?: string;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action?: () => void;
}

export const APP_SHORTCUTS = {
    SEARCH: { key: 'k', meta: true, label: 'Search', description: 'Focus search input' },
    UNDO: { key: 'z', meta: true, label: 'Undo', description: 'Undo last change' },
    REDO: { key: 'z', meta: true, shift: true, label: 'Redo', description: 'Redo last change' },
    COPY: { key: 'c', meta: true, label: 'Copy', description: 'Copy SVG to clipboard' },
    EXPORT: { key: 'e', meta: true, label: 'Export', description: 'Export selection' },
    SELECT_ALL: { key: 'a', meta: true, label: 'Select All', description: 'Select filtered icons' },
    DESELECT: { key: 'd', meta: true, label: 'Deselect', description: 'Clear selection' },
    ESCAPE: { key: 'Escape', label: 'Close', description: 'Close modal or clear selection' },
    HELP: { key: '?', label: 'Help', description: 'Toggle shortcut legend' },
    SEARCH_ALT: { key: '/', label: 'Search', description: 'Focus search input' },
};

export const useKeyboardShortcuts = (shortcuts: ShortcutDefinition[], dependencies: any[] = []) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const metaRequested = isMac ? event.metaKey : event.ctrlKey;

            const activeElement = document.activeElement;
            const isTyping = 
                activeElement instanceof HTMLInputElement || 
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement instanceof HTMLElement && activeElement.isContentEditable);

            // Special case for '?' and '/' which should work if not typing
            // Escape works always
            
            const pressedKey = event.key.toLowerCase();

            for (const s of shortcuts) {
                const modifierMatch = !!s.meta === metaRequested && 
                                     !!s.shift === event.shiftKey && 
                                     !!s.alt === event.altKey;
                
                const keyMatch = s.key.toLowerCase() === pressedKey;

                if (modifierMatch && keyMatch) {
                    // Global actions like Escape should always work
                    if (s.key === 'Escape') {
                        s.action?.();
                        return;
                    }

                    // Others only trigger if not typing
                    if (!isTyping) {
                        event.preventDefault();
                        s.action?.();
                        return;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, ...dependencies]);
};
