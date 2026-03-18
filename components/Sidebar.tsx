
import React from 'react';
import { SearchIcon, Repeat, Package, Trash, Clock, Filter } from 'lucide-react';
import type { ViewportSize, Weighting, Collection, IconTransform, IconData } from '../types.ts';
import { ICON_LIBRARY } from '../constants.tsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import ImportZone from './ImportZone';

interface SidebarProps {
  viewportSize: ViewportSize;
  setViewportSize: (size: ViewportSize) => void;
  weighting: Weighting;
  setWeighting: (weight: Weighting) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  collections: Collection[];
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  onDeleteCollection: (id: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  selectedCount: number;
  onExport: (format: 'svg' | 'jsx' | 'json') => void;
  aiEnabled: boolean;
  semanticSearchEnabled: boolean;
  setSemanticSearchEnabled: (val: boolean) => void;
  isAiSearching: boolean;
  transform: IconTransform;
  setTransform: (t: IconTransform) => void;
  recentlyViewedIds: string[];
  allIcons: IconData[];
  onPreview: (id: string) => void;
  isMobile?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  onOpenFilters?: () => void;
  onImportSvg?: (icon: IconData) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  viewportSize, setViewportSize, weighting, setWeighting, searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory, collections, activeCollectionId, setActiveCollectionId,
  onDeleteCollection, accentColor, setAccentColor, selectedCount, onExport,
  aiEnabled, semanticSearchEnabled, setSemanticSearchEnabled, isAiSearching, transform, setTransform,
  recentlyViewedIds, allIcons, onPreview, isMobile = false, searchInputRef, onOpenFilters,
  onImportSvg
}) => {
  const [exportFormat, setExportFormat] = React.useState<'svg' | 'jsx' | 'json'>('svg');

  return (
    <div className={`flex ${isMobile ? 'flex-col max-h-full' : 'h-full flex-col'} overflow-hidden bg-muted/20`}>
      <ScrollArea className={`flex-1 ${isMobile ? 'p-2' : 'p-4'}`}>
        {/* Branding */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-primary" />
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-foreground">Core UI System</h2>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">DS_EXPLORER_V5.0.0</p>
        </div>

        {/* Global Search */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Search_Registry</span>
            <div className="flex items-center gap-1">
              {aiEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-5 px-2 text-[8px] font-bold uppercase transition-all ${semanticSearchEnabled ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setSemanticSearchEnabled(!semanticSearchEnabled)}
                  aria-label="Toggle AI semantic search"
                >
                  {isAiSearching ? 'Analysing...' : 'AI Semantic'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-[8px] font-bold uppercase transition-all text-muted-foreground hover:bg-muted/50"
                onClick={() => onOpenFilters?.()}
                aria-label="Advanced filters"
                title="Advanced filters (categories, sizes, colors, etc.)"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" />
          <Input
            ref={searchInputRef}
            placeholder={aiEnabled && semanticSearchEnabled ? "Concept search..." : "Search ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-muted-foreground/20 pl-8 font-mono text-[11px] placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
          />
        </div>


        {/* Appearance Config */}
        <div className="mb-6 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">System_Scale</p>
            <div className="flex w-full rounded-md border border-muted-foreground/10 bg-background/50 p-1">
              {[16, 24, 32].map((size) => (
                <button
                  key={size}
                  onClick={() => setViewportSize(size as ViewportSize)}
                  aria-label={`Set viewport size to ${size} pixels`}
                  aria-pressed={viewportSize === size}
                  className={`flex-1 rounded-[4px] py-1.5 text-[10px] font-bold transition-all ${viewportSize === size
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {size}PX
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">Stroke_Weight</p>
            <div className="flex w-full rounded-md border border-muted-foreground/10 bg-background/50 p-1">
              {(['regular', 'medium', 'bold'] as Weighting[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWeighting(w)}
                  aria-label={`Set stroke weight to ${w}`}
                  aria-pressed={weighting === w}
                  className={`flex-1 rounded-[4px] py-1.5 text-[10px] font-bold uppercase transition-all ${weighting === w
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">Accent_Color</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Default', value: '' },
                { name: 'Indigo', value: '#6366f1' },
                { name: 'Purple', value: '#a855f7' },
                { name: 'Rose', value: '#f43f5e' },
                { name: 'Amber', value: '#fbbf24' },
                { name: 'Emerald', value: '#10b981' },
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => setAccentColor(color.value)}
                  aria-label={`Set accent color to ${color.name}`}
                  aria-pressed={accentColor === color.value}
                  className={`group relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${accentColor === color.value ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                  title={color.name}
                >
                  <div
                    className="h-4 w-4 rounded-full shadow-inner"
                    style={{ backgroundColor: color.value || (document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb') }}
                  />
                  {accentColor === color.value && <div className="absolute inset-0 flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-white shadow-sm" /></div>}
                </button>
              ))}
              <div className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-muted-foreground/10 hover:border-primary/50 transition-colors">
                <input
                  type="color"
                  value={accentColor || '#3b82f6'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  aria-label="Custom accent color"
                  className="absolute inset-0 h-[150%] w-[150%] -translate-x-[25%] -translate-y-[25%] cursor-pointer border-none p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Batch Transform */}
        <div className="mb-6 rounded-lg border border-primary/10 bg-primary/5 p-4 transition-all hover:border-primary/20">
          <div className="mb-4 flex items-center gap-2">
            <Repeat className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Dynamic_Transform</p>
          </div>

          <div className="mb-4 space-y-3">
            <div className="flex justify-between font-mono text-[9px] font-bold uppercase tracking-tight text-primary/60">
              <label>Rotation</label>
              <span>{transform.rotate}°</span>
            </div>
            <Slider
              min={0}
              max={270}
              step={90}
              value={[transform.rotate]}
              onValueChange={(vals) => setTransform({ ...transform, rotate: vals[0] })}
            />
          </div>

          <div className="mb-5 space-y-3">
            <div className="flex justify-between font-mono text-[9px] font-bold uppercase tracking-tight text-primary/60">
              <label>Scaling</label>
              <span>{Math.round(transform.scale * 100)}%</span>
            </div>
            <Slider
              min={0.5}
              max={1.5}
              step={0.1}
              value={[transform.scale]}
              onValueChange={(vals) => setTransform({ ...transform, scale: vals[0] })}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={transform.flipH ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTransform({ ...transform, flipH: !transform.flipH })}
              aria-label="Flip icons horizontally"
              aria-pressed={transform.flipH}
              className={`h-7 flex-1 text-[10px] ${transform.flipH ? 'border-primary' : ''}`}
            >
              Flip H
            </Button>
            <Button
              variant={transform.flipV ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTransform({ ...transform, flipV: !transform.flipV })}
              aria-label="Flip icons vertically"
              aria-pressed={transform.flipV}
              className={`h-7 flex-1 text-[10px] ${transform.flipV ? 'border-primary' : ''}`}
            >
              Flip V
            </Button>
          </div>
        </div>

        {/* Import Zone */}
        {onImportSvg && (
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">Import_Assets</p>
            <ImportZone onImport={onImportSvg} existingIcons={allIcons} />
          </div>
        )}

        {/* Navigation */}
        <div className="mb-6 space-y-1">
          <button
            onClick={() => { setSelectedCategory(null); setActiveCollectionId(null); setSearchQuery(''); }}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${!selectedCategory && !activeCollectionId ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
          >
            <Package className="h-4 w-4" />
            All Registry
          </button>

          <div className="pt-2">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Categories</p>
            {Object.keys(ICON_LIBRARY).map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setActiveCollectionId(null); setSearchQuery(''); }}
                className={`block w-full rounded-md px-3 py-1.5 text-left text-xs uppercase tracking-wide transition-colors ${selectedCategory === cat ? 'bg-accent text-accent-foreground font-semibold border-l-2 border-primary pl-2.5' : 'text-muted-foreground hover:bg-accent/50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {collections.length > 0 && (
            <div className="pt-4">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Collections_Saved</p>
              {collections.map(col => (
                <div key={col.id} className="group flex items-center gap-1 px-1">
                  <button
                    onClick={() => { setActiveCollectionId(col.id); setSelectedCategory(null); setSearchQuery(''); }}
                    className={`flex-1 rounded-md px-2 py-1.5 text-left text-xs uppercase tracking-wide transition-colors ${activeCollectionId === col.id ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary pl-1.5' : 'text-muted-foreground hover:bg-accent/50'
                      }`}
                  >
                    {col.name}
                    <span className="ml-2 opacity-30 font-mono text-[9px]">[{col.iconIds.length}]</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteCollection(col.id); }}
                    className="opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1 transition-opacity text-destructive"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {recentlyViewedIds.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center gap-2 px-2 mb-2">
                <Clock className="h-3 w-3 text-primary/50" />
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Recent_Assets</p>
              </div>
              <div className="space-y-0.5">
                {recentlyViewedIds.map(id => {
                  const icon = allIcons.find(i => i.id === id);
                  if (!icon) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => onPreview(id)}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-[10px] uppercase truncate tracking-wide text-muted-foreground hover:bg-accent/50 transition-colors"
                    >
                      {icon.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Export Footer */}
        <div className="border-t p-4 space-y-3" >
          <div className="grid grid-cols-3 gap-1">
            {(['svg', 'jsx', 'json'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`rounded border py-1 text-[9px] font-bold uppercase transition-all ${exportFormat === format ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
              >
                {format}
              </button>
            ))}
          </div>
          <Button
            className="flex h-auto w-full flex-col items-center gap-1 py-3"
            disabled={selectedCount === 0}
            onClick={() => onExport(exportFormat)}
          >
            <span className="text-xs font-bold uppercase tracking-[0.1em]">Export Suite</span>
            <span className="text-[10px] opacity-70">[{selectedCount} Selected]</span>
          </Button>
        </div >
      </ScrollArea >
    </div>
  );
};

export default React.memo(Sidebar);
