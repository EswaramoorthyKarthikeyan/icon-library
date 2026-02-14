
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
export type TabType = 'grid' | 'list';

export interface Collection {
  id: string;
  name: string;
  iconIds: string[];
  createdAt: number;
}

export interface AppSettings {
  showGrid: boolean;
  gridOpacity: number;
  uiDensity: 'compact' | 'standard';
  autoExportFolders: boolean;
  primaryFont: string;
  monoFont: string;
  semanticSearchEnabled: boolean;
}

export interface AppState {
  selectedIconId: string | null;
  viewportSize: ViewportSize;
  weighting: Weighting;
  searchQuery: string;
  collections: Collection[];
}
