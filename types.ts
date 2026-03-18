
/**
 * MultiPath interface for multicolor icons with individual path styling
 */
export interface MultiPath {
  d: string;
  color?: string; // Specific hex color or 'currentColor'
  opacity?: number;
  className?: string; // Optional tailwind classes for the specific path
}

/**
 * Icon state styles for hover, active, and disabled states
 */
export interface IconStateStyles {
  hover?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
  active?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
  disabled?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
}

/**
 * Icon data structure with metadata and styling options
 */
export interface IconData {
  id: string;
  name: string;
  category: string;
  svgPath: string; // Legacy fallback for single-path icons
  paths?: MultiPath[]; // Multicolor icons with individual path colors
  variants?: string[]; // IDs of related icons
  variantType?: 'outline' | 'filled' | 'duotone' | 'flat' | 'multicolor';
  states?: IconStateStyles;
  svg?: string; // Full SVG string for custom icons
  tags?: string[]; // Searchable tags for semantic search
  isSelected?: boolean;
  isSynthesized?: boolean;
}

/**
 * AI-generated metadata for icons including tags and descriptions
 */
export interface IconAiMetadata {
  tags: string[];
  description: string;
}

/**
 * Icon category names matching constants.tsx ICON_LIBRARY keys
 */
export type IconCategory = 
  | 'UI_Actions' 
  | 'Media' 
  | 'Files' 
  | 'Devices' 
  | 'Communication' 
  | 'Navigation' 
  | 'Alerts' 
  | 'Commerce' 
  | 'Weather' 
  | 'Social' 
  | 'Editing' 
  | 'Arrows';

/**
 * Viewport sizes in pixels
 */
export type ViewportSize = 16 | 24 | 32;

/**
 * Stroke weight options
 */
export type Weighting = 'regular' | 'medium' | 'bold';

/**
 * Tab types in the application
 */
export type TabType = 'grid' | 'list' | 'playground' | 'generator' | 'inspector' | 'animation' | 'style-guide';

/**
 * View mode for icon display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Application theme options
 */
export type AppTheme = 'dark' | 'light' | 'system';

/**
 * Icon collection for grouping related icons
 */
export interface Collection {
  id: string;
  name: string;
  iconIds: string[];
  createdAt: number;
}

/**
 * Icon transformation options
 * @property rotate - Rotation in degrees (0-360)
 * @property scale - Scale factor (positive values only)
 * @property flipH - Horizontal flip
 * @property flipV - Vertical flip
 */
export interface IconTransform {
  rotate: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
}

/**
 * AI provider identifiers
 */
export type AIProviderId = 'google' | 'openai' | 'anthropic' | 'local';

/**
 * AI provider connection status
 */
export type AIStatus = 'connected' | 'invalid' | 'missing' | 'rate-limited';

/**
 * Available models for each AI provider
 */
export type GoogleGeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash' | 'gemini-pro';
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
export type AnthropicModel = 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229' | 'claude-3-haiku-20240307';
export type LocalModel = string; // Ollama model names vary

/**
 * AI provider configuration
 */
export interface AIProviderConfig {
  id: AIProviderId;
  apiKey: string;
  enabled: boolean;
  status: AIStatus;
  primaryModel: string;
  advancedModel: string;
}

/**
 * Application settings and preferences
 */
export interface AppSettings {
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
  activeProvider: AIProviderId;
  providers: Record<AIProviderId, AIProviderConfig>;
}

/**
 * Export format options
 */
export type ExportFormat = 'svg' | 'png' | 'jsx' | 'json';

/**
 * Export configuration options
 */
export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // for PNG export (1, 2, 4)
  includeBackground?: boolean;
}

/**
 * Filter criteria for advanced icon search
 */
export interface FilterCriteria {
  query?: string;
  categories?: string[];
  sizes?: number[];
  colors?: string[];
  createdAfter?: number;
  createdBefore?: number;
  usageCountMin?: number;
  usageCountMax?: number;
  synthesisStatus?: 'all' | 'builtin' | 'ai-generated';
  favorite?: boolean;
  recentlyUsed?: boolean;
  /** @deprecated Use favorite instead */
  favorites?: boolean;
  dateRange?: { start: string; end: string };
}

/**
 * Search statistics for filter results
 */
export interface SearchStats {
  totalMatches: number;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
  synthesisBreakdown: {
    builtin: number;
    aiGenerated: number;
  };
}

/**
 * Visual state snapshot for persistence
 */
export interface VisualState {
  viewportSize: ViewportSize;
  weighting: Weighting;
  theme: AppTheme;
  accentColor: string;
  customFillColor: string;
  transform: IconTransform;
}

/**
 * Annotation data for icon notes
 */
export interface IconAnnotation {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}
