# Core UI System Explorer

A sophisticated **AI-powered icon design and management system** for UI developers and designers. Browse, customize, generate, and organize icons with intelligent semantic search and AI synthesis capabilities.

## Features

### 🎨 Icon Library Management
- **200+ pre-built icons** organized by categories:
  - UI Actions (home, search, settings, etc.)
  - Media (play, pause, camera, microphone)
  - Files (documents, folders, archives)
  - Devices (monitor, smartphone, tablet)
  - Communication (mail, chat, send)
- Dual view modes: Grid and List
- **Advanced Search & Filtering**:
  - Multi-criteria filtering (categories, colors, sizes, dates, usage)
  - Saved filters with persistent storage
  - Search history tracking
  - Filter statistics and suggestions
- Create and manage custom icon collections
- Real-time icon preview and inspection
- Keyboard shortcuts (Cmd/Ctrl+K, Cmd/Ctrl+C, etc.)

### 🤖 AI-Powered Features
- **Semantic Search**: Natural language icon discovery powered by AI
- **Icon Generation**: Create custom icons from text descriptions
- **Metadata Generation**: Auto-generate descriptions and tags
- **Batch Generation**: Synthesize entire icon categories
- **Multi-provider support**:
  - Google Gemini
  - OpenAI
  - Anthropic
  - Local fallback

### ⚙️ Advanced Customization
- **Viewport Sizes**: 16px, 24px, 32px
- **Stroke Weights**: Regular, Medium, Bold
- **Transformations**: Rotation, scaling, flip (H/V)
- **Color Control**: Custom colors or currentColor
- **Theme Support**: Dark, Light, System modes
- **Interactive Playground**: Test icons in real UI contexts

### 📦 Export & Collaboration
- ZIP file export with customizable SVG rendering
- Collection management and sharing
- Persistent local storage for preferences
- Settings synchronization

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components (Radix UI + Tailwind)
- **jszip** - Export functionality
- **Lucide React** - Icon set

## Project Structure

```
├── components/          # UI components
│   ├── Generator.tsx   # AI icon generation
│   ├── Playground.tsx  # Interactive preview
│   ├── IconGrid.tsx    # Icon display
│   ├── Inspector.tsx   # Icon details
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
│   ├── useSettings.ts
│   ├── useIconLibrary.ts
│   ├── useAI.ts
│   └── ai-providers/  # AI adapter implementations
├── lib/              # Utilities
├── utils/           # API and SVG helpers
├── types.ts         # TypeScript definitions
└── constants.tsx    # Icon library data
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or pnpm

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up AI provider** (optional but recommended):
   Create or update `.env.local` with your API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
   Or use other providers:
   - `VITE_OPENAI_API_KEY`
   - `VITE_ANTHROPIC_API_KEY`

3. **Run development server**:
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Browsing Icons
- Use the **Grid tab** to view all icons
- Filter by **category** via the sidebar
- Search by name or use **semantic search** (AI-powered)
- Click icons to inspect details

### Customizing Icons
- Adjust **viewport size** (16/24/32px)
- Change **stroke weight** (regular/medium/bold)
- Apply **transformations** (rotate, scale, flip)
- Set **custom colors** or use current color
- Preview in the **Playground** tab

### Generating Icons
- Switch to **Generator tab**
- Enter a text description (e.g., "cloud upload icon")
- AI synthesizes a new icon design
- **Batch generate** entire categories

### Managing Collections
- Select multiple icons
- Click "Create Collection"
- Name and save your custom groups
- Export collections as ZIP

### Theming
- Toggle between **Dark/Light/System** themes
- Customize **accent color**
- Settings persist automatically

## API Integration

The app supports multiple AI providers through a unified adapter interface:

- **Google Gemini** (default)
- **OpenAI** (GPT-4 support)
- **Anthropic** (Claude support)
- **Local** (fallback/demo mode)

Each provider has configurable models for different use cases.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Hooks
- `useSettings()` - App configuration and theme
- `useIconLibrary()` - Icon management and filtering
- `useAI()` - AI provider and semantic search

## Performance

- **Lazy-loaded components**: Generator and Playground load on demand
- **Memoized selectors**: Efficient re-renders
- **Debounced search**: Optimized AI requests
- **Local storage**: Fast preference loading

## Mobile Responsiveness

This app is fully responsive with adaptive layouts for different screen sizes:

### Breakpoints
- **Mobile (< 768px)**: Full-screen tab interface with bottom controls panel
  - Tabs: Explorer, Sandbox, Details (Inspector), AI Generator
  - Inspector accessible as a dedicated tab
- **Tablet (768px - 1024px)**: 2-panel layout (sidebar + content)
  - Tabs: Explorer, Sandbox, Details (Inspector), AI Generator
  - Inspector accessible as a dedicated tab
- **Desktop (≥ 1024px)**: 3-panel layout (sidebar + content + inspector)
  - Inspector shown as permanent right panel
  - All 4 main tabs available

### Mobile Features
- Optimized touch interactions with 44px+ minimum touch targets
- Adjusted font sizes and spacing for small screens
- Collapsible sidebar with essential controls below main content
- Tab-based navigation to reduce UI clutter
- Responsive icon grid that scales appropriately per device
- Adaptive header with icon-only buttons on small screens
- Responsive padding and margins using Tailwind breakpoints (sm:, md:, lg:)

### Responsive Utilities
- `useIsMobile()`: Detects < 768px viewports
- `useIsTablet()`: Detects 768px - 1024px viewports
- Components conditionally render/hide based on screen size
- Resizable panels disabled on mobile (use tab-based layout instead)

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## License

MIT
