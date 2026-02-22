import React, { useState } from 'react';
import { FilterCriteria, SearchStats } from '../types';
import { X, ChevronDown, Save, Trash2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, filters: FilterCriteria) => void;
  onLoadFilter?: (filterId: string) => void;
  onDeleteFilter?: (filterId: string) => void;
  filterStats?: SearchStats;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterCriteria;
  createdAt: number;
  usageCount: number;
}

const COMMON_CATEGORIES = [
  'UI',
  'Social',
  'Business',
  'Nature',
  'Technology',
  'Health',
  'Travel',
  'Food',
];

const COMMON_COLORS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

const ICON_SIZES = [16, 24, 32, 48, 64];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  filterStats = {
    totalMatches: 0,
    categoryCounts: {},
    colorCounts: {},
    synthesisBreakdown: { builtin: 0, aiGenerated: 0 }
  },
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...(prev.categories || []), category],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors?.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...(prev.colors || []), color],
    }));
  };

  const handleSizeToggle = (size: number) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes?.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...(prev.sizes || []), size],
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (val) => val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : true)
  ).length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close filter panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="filters">Filter Options</TabsTrigger>
            <TabsTrigger value="saved">
              Saved Filters {savedFilters.length > 0 && `(${savedFilters.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6 pt-4">
            {/* Search Query */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                placeholder="Search icons by name..."
                value={filters.query || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    query: e.target.value || undefined,
                  }))
                }
                aria-label="Search icons by name"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {COMMON_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      filters.categories?.includes(category)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                        : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900'
                    }`}
                    aria-pressed={filters.categories?.includes(category) ?? false}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {filterStats.categoryCounts && Object.keys(filterStats.categoryCounts).length > 0 && (
                <p className="text-xs text-gray-500">
                  {filterStats.totalMatches} icons matching filters
                </p>
              )}
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon Sizes</label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {ICON_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`rounded-md border px-2 py-2 text-xs transition-colors ${
                      filters.sizes?.includes(size)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                        : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900'
                    }`}
                    aria-pressed={filters.sizes?.includes(size) ?? false}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Colors</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`h-8 w-8 rounded-md border-2 transition-all ${
                      filters.colors?.includes(color)
                        ? 'border-gray-800 dark:border-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Color ${color}`}
                    aria-pressed={filters.colors?.includes(color) ?? false}
                  />
                ))}
              </div>
            </div>

            {/* Synthesis Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon Type</label>
              <div className="flex gap-2">
                {(['all', 'builtin', 'ai-generated'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        synthesisStatus: prev.synthesisStatus === status ? 'all' : status,
                      }))
                    }
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      filters.synthesisStatus === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                        : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900'
                    }`}
                    aria-pressed={filters.synthesisStatus === status}
                  >
                    {status === 'ai-generated' ? 'AI Generated' : status === 'builtin' ? 'Built-in' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites & Recently Used */}
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    favorites: !prev.favorites,
                  }))
                }
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  filters.favorites
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                    : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900'
                }`}
                aria-pressed={filters.favorites ?? false}
              >
                ⭐ Favorites Only
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    recentlyUsed: !prev.recentlyUsed,
                  }))
                }
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  filters.recentlyUsed
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                    : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900'
                }`}
                aria-pressed={filters.recentlyUsed ?? false}
              >
                🕐 Recently Used
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 border-t pt-4">
              <Button
                onClick={handleApplyFilters}
                className="flex-1"
                variant="default"
              >
                Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              {onSaveFilter && (
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Filter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Filter name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        aria-label="Filter name"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveFilter}
                          disabled={!filterName.trim()}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setShowSaveDialog(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 pt-4">
            {savedFilters.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No saved filters yet. Create and save filters from the Filter Options tab.
              </p>
            ) : (
              <div className="space-y-2">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{filter.name}</p>
                      <p className="text-xs text-gray-500">
                        Used {filter.usageCount} times • Created{' '}
                        {new Date(filter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (onLoadFilter) {
                            onLoadFilter(filter.id);
                            handleApplyFilters();
                          }
                        }}
                        variant="default"
                        size="sm"
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => {
                          if (onDeleteFilter) {
                            onDeleteFilter(filter.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FilterPanel;
