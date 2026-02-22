
export interface MultiPath {
  d: string;
  color?: string; // Specific hex color or 'currentColor'
  opacity?: number;
  className?: string; // Optional tailwind classes for the specific path
}

export interface IconStateStyles {
  hover?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
  active?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
  disabled?: Partial<Omit<IconData, 'id' | 'name' | 'variants'>>;
}

export interface IconData {
  id: string;
  name: string;
  category: string;
  svgPath: string; // Legacy fallback
  paths?: MultiPath[]; // Multicolor icons
  variants?: string[]; // IDs of related icons
  variantType?: 'outline' | 'filled' | 'duotone' | 'flat' | 'multicolor';
  states?: IconStateStyles;
  svg?: string;
  isSelected?: boolean;
  isSynthesized?: boolean;
}

export interface IconAiMetadata {
  tags: string[];
  description: string;
}

export type ViewportSize = 16 | 24 | 32;
export type Weighting = 'regular' | 'medium' | 'bold';
export type TabType = 'grid' | 'list' | 'playground' | 'generator' | 'inspector' | 'animation' | 'style-guide';
export type ViewMode = 'grid' | 'list';
export type AppTheme = 'dark' | 'light' | 'system';

export interface Collection {
  id: string;
  name: string;
  iconIds: string[];
  createdAt: number;
}

export interface IconTransform {
  rotate: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
}

export type AIProviderId = 'google' | 'openai' | 'anthropic' | 'local';

export type AIStatus = 'connected' | 'invalid' | 'missing' | 'rate-limited';

export interface AIProviderConfig {
  id: AIProviderId;
  apiKey: string;
  enabled: boolean;
  status: AIStatus;
  primaryModel: string;
  advancedModel: string;
}


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

export type ExportFormat = 'svg' | 'png' | 'jsx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // for PNG export (1, 2, 4)
  includeBackground?: boolean;
}

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
  /** Added for FilterPanel compatibility if needed */
  favorites?: boolean;
  dateRange?: { start: string; end: string };
}

export interface SearchStats {
  totalMatches: number;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
  synthesisBreakdown: {
    builtin: number;
    aiGenerated: number;
  };
}
export interface VisualState {
  viewportSize: ViewportSize;
  weighting: Weighting;
  theme: AppTheme;
  accentColor: string;
  customFillColor: string;
  transform: IconTransform;
}
