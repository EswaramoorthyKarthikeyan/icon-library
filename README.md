# Core UI System Explorer

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)

A sophisticated **AI-powered icon design and management system** for UI developers and designers. Browse, customize, generate, and organize icons with intelligent semantic search, animation preview, and AI synthesis capabilities.

## Features

### Icon Library Management

- **200+ pre-built icons** organized into 12 comprehensive categories:
  - **UI Actions** - home, search, settings, menu, filter, sort, and interactive controls
  - **Media** - play, pause, camera, microphone, film, music, and audio controls
  - **Files** - document, folder, archive, clipboard, save, download, and upload
  - **Devices** - monitor, smartphone, tablet, laptop, printer, and hardware
  - **Communication** - mail, chat, phone, video call, notification, and messaging
  - **Navigation** - compass, map, globe, sidebar, layout, and wayfinding
  - **Alerts** - warning, error, success, info, notification, and status indicators
  - **Commerce** - shopping cart, payment, receipt, wallet, delivery, and e-commerce
  - **Weather** - sun, moon, cloud, rain, snow, wind, and atmospheric conditions
  - **Social** - heart, share, bookmark, trophy, emoji, and social interactions
  - **Editing** - pencil, eraser, type, alignment, charts, and creative tools
  - **Arrows** - directional, chevrons, navigation, and movement indicators
- Dual view modes: **Grid** and **List**
- **Advanced Search & Filtering**:
  - Multi-criteria filtering (categories, colors, sizes, dates, usage)
  - Saved filters with persistent local storage
  - Search history tracking
  - Filter statistics and suggestions
- Create and manage **custom icon collections**
- Real-time icon preview and inspection
- **Keyboard shortcuts** for power users

### AI-Powered Features

- **Semantic Search**: Natural language icon discovery powered by AI
- **Icon Generation**: Create custom icons from text descriptions
- **Metadata Generation**: Auto-generate descriptions, tags, and related icons
- **Batch Generation**: Synthesize entire icon categories
- **Multi-provider support**:
  - Google Gemini (default)
  - OpenAI (GPT-4 support)
  - Anthropic (Claude support)
  - Local fallback (demo mode)

### Advanced Customization

- **Viewport Sizes**: 16px, 24px, 32px
- **Stroke Weights**: Regular, Medium, Bold
- **Transformations**: Rotation, scaling, flip (H/V)
- **Color Control**: Custom colors or currentColor
- **Theme Support**: Dark, Light, System modes
- **Interactive Playground**: Test icons in real UI contexts
- **Animation Preview**: Preview icons with CSS animations

### Professional Tools

- **Comparison Tool**: Side-by-side icon comparison for design decisions
- **Style Guide Generator**: Export design guidelines and specifications
- **SVG Import**: Import custom SVG icons into your library
- **Annotation System**: Add notes and metadata to icons
- **Selection Toolbar**: Batch operations on selected icons
- **Shortcut Legend**: Quick reference for all keyboard shortcuts

### Data Management

- **Auto-save & Recovery**: Automatic session backup with crash recovery
- **Undo/Redo**: Full history support for settings changes
- **Persistent Preferences**: Settings sync across sessions
- **Collection Export**: Export collections as ZIP with customizable SVG rendering

## Tech Stack

| Category | Technology |
|----------|------------|
| **UI Framework** | React 18 |
| **Language** | TypeScript 5.8 |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui (Radix UI + Tailwind) |
| **Animation** | Framer Motion 12 |
| **Layout** | react-resizable-panels |
| **Icons** | Lucide React |
| **Export** | jszip |
| **AI Integration** | @google/generative-ai |
| **Routing** | react-router-dom |

## Project Structure

```
icon-library/
├── components/                 # React UI components
│   ├── ui/                     # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   └── ...
│   ├── AiKeyPrompt.tsx        # AI provider setup modal
│   ├── AnimationPreview.tsx   # Icon animation tester
│   ├── ComparisonTool.tsx     # Side-by-side comparison
│   ├── ErrorBoundary.tsx      # Error handling wrapper
│   ├── FilterPanel.tsx        # Advanced search filters
│   ├── Footer.tsx             # App footer with theme toggle
│   ├── Generator.tsx          # AI icon generation (lazy)
│   ├── Header.tsx             # App header with tabs
│   ├── IconAnnotations.tsx     # Icon note/metadata system
│   ├── IconGrid.tsx           # Icon display grid/list
│   ├── ImportZone.tsx         # SVG import dropzone
│   ├── Inspector.tsx          # Icon detail panel
│   ├── LandingPage.tsx        # Welcome/onboarding page
│   ├── Playground.tsx         # Interactive preview (lazy)
│   ├── SelectionToolbar.tsx   # Batch selection actions
│   ├── SettingsModal.tsx      # App settings configuration
│   ├── ShortcutLegend.tsx      # Keyboard shortcuts reference
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── StyleGuide.tsx          # Design spec exporter
│   └── VariantSwitcher.tsx     # Icon variant selector
├── hooks/                      # Custom React hooks
│   ├── ai-providers/          # AI adapter implementations
│   │   ├── factory.ts         # Provider factory
│   │   ├── google.ts          # Google Gemini adapter
│   │   ├── openai.ts          # OpenAI adapter
│   │   ├── anthropic.ts       # Anthropic adapter
│   │   └── local.ts           # Local fallback adapter
│   ├── useAI.ts               # AI functionality hook
│   ├── useAccessibility.ts    # Accessibility settings
│   ├── useAdvancedSearch.ts   # Advanced filtering logic
│   ├── useAnimations.ts       # Animation utilities
│   ├── useArrowNavigation.ts  # Keyboard navigation
│   ├── useAutoSave.ts         # Auto-save & recovery
│   ├── useHistory.ts          # Undo/redo history
│   ├── useIconLibrary.ts      # Icon management
│   ├── useKeyboardShortcuts.ts # Keyboard shortcuts
│   └── useSettings.ts         # App settings
├── lib/                        # Utility functions
├── utils/                      # API and SVG helpers
├── constants.tsx              # Icon library data (200+ icons)
├── types.ts                   # TypeScript type definitions
├── App.tsx                    # Main application component
└── index.tsx                  # Entry point
```

## Getting Started

### Prerequisites

- Node.js v16+ and npm/pnpm
- (Optional) API keys for AI features:
  - Google Gemini API key
  - OpenAI API key
  - Anthropic API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd icon-library

# Install dependencies
npm install
# or
pnpm install
```

### Configuration

Create or update `.env.local` with your API keys:

```env
# AI Provider Keys (at least one required for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:5173`

## Usage Guide

### Browsing Icons

1. Navigate to the **Explorer** tab (default view)
2. Use the sidebar to filter by **category**
3. Search by name, tags, or use **semantic search** (AI-powered)
4. Click an icon to preview and inspect details

### Managing Icons

- **Select icons**: Click to select, Shift+click for range, Cmd/Ctrl+click for multi-select
- **Create collections**: Select icons and click "Create Collection" in the toolbar
- **Export**: Select icons and click "Export" to download as ZIP
- **Import**: Drag and drop SVG files onto the import zone

### Customizing Icons

1. Adjust **viewport size** (16/24/32px)
2. Change **stroke weight** (regular/medium/bold)
3. Apply **transformations** (rotate, scale, flip)
4. Set **custom colors** or use currentColor
5. Preview in the **Playground** tab
6. Test animations in the **Animation** tab

### AI Features

1. Configure API keys in Settings
2. Enable semantic search for natural language queries
3. Use the **AI Generator** tab for custom icon generation
4. Click icons to generate AI metadata and related suggestions

### Comparison Tool

1. Select exactly 2 icons
2. Click "Compare" in the selection toolbar
3. View side-by-side with synchronized controls

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Focus search |
| `Cmd/Ctrl + C` | Copy icon specification |
| `Cmd/Ctrl + A` | Select all filtered |
| `Cmd/Ctrl + D` | Deselect all |
| `Cmd/Ctrl + E` | Export selected |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `?` | Toggle shortcuts help |
| `Escape` | Close/deselect |

## API Reference

### Settings Interface

```typescript
interface AppSettings {
  showGrid: boolean;
  gridOpacity: number;
  uiDensity: 'compact' | 'standard';
  autoExportFolders: boolean;
  primaryFont: string;
  monoFont: string;
  semanticSearchEnabled: boolean;
  aiEnabled: boolean;
  namingValidationEnabled: boolean;
  hasSeenAiPrompt: boolean;
  activeProvider: 'google' | 'openai' | 'anthropic' | 'local';
  providers: Record<AIProviderId, AIProviderConfig>;
}
```

### Icon Data Structure

```typescript
interface IconData {
  id: string;
  name: string;
  category: string;
  svgPath: string;
  paths?: MultiPath[];        // For multicolor icons
  variants?: string[];        // Related icon IDs
  variantType?: 'outline' | 'filled' | 'duotone' | 'flat' | 'multicolor';
  states?: IconStateStyles;   // Hover/active/disabled states
  svg?: string;               // Full SVG string
  isSelected?: boolean;
  isSynthesized?: boolean;
}
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useSettings()` | App configuration and theme |
| `useIconLibrary()` | Icon management and filtering |
| `useAI()` | AI provider and semantic search |
| `useAdvancedSearch()` | Filter logic and statistics |
| `useAutoSave()` | Session persistence and recovery |
| `useHistory()` | Undo/redo state management |

## Performance

- **Lazy-loaded components**: Generator and Playground load on demand
- **Memoized selectors**: Efficient re-renders with useMemo
- **Debounced search**: 1000ms debounce on semantic search requests
- **Local storage**: Fast preference loading with auto-save (30s intervals)
- **Virtualized lists**: Optimized rendering for large icon sets

## Responsive Design

The application adapts to different screen sizes:

| Breakpoint | Layout |
|------------|--------|
| **Mobile** (< 768px) | Full-screen tabs with bottom controls panel |
| **Tablet** (768px - 1024px) | 2-panel layout (sidebar + content) |
| **Desktop** (≥ 1024px) | 3-panel layout (sidebar + content + inspector) |

### Mobile Features

- Touch-optimized controls (44px+ touch targets)
- Responsive icon grid scaling
- Collapsible sidebar
- Tab-based navigation
- Adaptive header with icon-only buttons

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure linting passes (`npm run lint`)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Lucide](https://lucide.dev/) for the icon design system
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
