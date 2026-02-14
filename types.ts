
export interface IconData {
  id: string;
  name: string;
  category: string;
  svgPath: string;
  isSelected?: boolean;
}

export interface IconAiMetadata {
  tags: string[];
  description: string;
}

export type ViewportSize = 16 | 24 | 32;
export type Weighting = 'regular' | 'medium' | 'bold';
export type TabType = 'grid' | 'list' | 'playground' | 'generator';

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

export interface AppSettings {
  showGrid: boolean;
  gridOpacity: number;
  uiDensity: 'compact' | 'standard';
  autoExportFolders: boolean;
  primaryFont: string;
  monoFont: string;
  semanticSearchEnabled: boolean;
  aiEnabled: boolean;
}

export interface AppState {
  selectedIconId: string | null;
  viewportSize: ViewportSize;
  weighting: Weighting;
  searchQuery: string;
  collections: Collection[];
}
