# Keyboard Shortcuts Guide

## Overview
The Icon Library app now supports keyboard shortcuts for power users to work more efficiently.

## Available Shortcuts

### Navigation & Selection
| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + K** | Focus search input and select all text |
| **Cmd/Ctrl + A** | Select/Deselect all filtered icons |
| **Cmd/Ctrl + D** | Deselect all icons |
| **Escape** | Clear selection and close modals |

### Actions
| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + C** | Copy selected icon SVG to clipboard |
| **Cmd/Ctrl + E** | Export selected icons (triggers export) |
| **Cmd/Ctrl + Z** | Undo *(planned for Phase 2)* |
| **Cmd/Ctrl + Shift + Z** | Redo *(planned for Phase 2)* |

## Implementation Details

### Platform Support
- **macOS**: Uses `Cmd` key (⌘)
- **Windows/Linux**: Uses `Ctrl` key
- All shortcuts work across both platforms seamlessly

### Technical Architecture
The implementation uses a custom `useKeyboardShortcuts` hook that:
- Intercepts keyboard events at the application level
- Prevents default browser behavior when appropriate
- Handles modifier key combinations (Cmd, Ctrl, Shift, Alt)
- Works across all app states and screens

### Code Location
- **Hook**: [`hooks/useKeyboardShortcuts.ts`](../hooks/useKeyboardShortcuts.ts)
- **Integration**: [`App.tsx`](../App.tsx) (lines 218-265)
- **Search Input Ref**: Passed through `Sidebar` component

## User Experience Improvements

1. **Power User Efficiency**: Common actions now have keyboard equivalents
2. **Discoverability**: Tooltips will be added in Phase 2 to show shortcuts
3. **Cross-Platform**: Works consistently on Mac, Windows, and Linux
4. **Non-Intrusive**: Shortcuts don't interfere with text input in search field

## Future Enhancements (Phase 2)

- [ ] Add visual indicators showing keyboard shortcuts in UI
- [ ] Display shortcut hints in tooltips on hover
- [ ] Add customizable key bindings
- [ ] Show keyboard shortcuts help modal (Cmd/Ctrl + ?)
- [ ] Integrate with Undo/Redo system
- [ ] Add more shortcuts as features develop

## Testing Checklist

- [x] Search focus works (Cmd/Ctrl + K)
- [x] Copy SVG works (Cmd/Ctrl + C)
- [x] Select all works (Cmd/Ctrl + A)
- [x] Deselect all works (Cmd/Ctrl + D)
- [x] Export trigger works (Cmd/Ctrl + E)
- [x] Escape closes modals
- [x] Works on Mac with Cmd
- [x] Works on Windows/Linux with Ctrl
- [x] Build passes without errors

## Known Limitations

- Undo/Redo shortcuts are defined but will function when history system is implemented
- Some shortcuts may not work while typing in text inputs (by design to allow normal text editing)
- Custom keybinding support not yet available
