
import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { TabType, AIProviderId, AIProviderConfig, FilterCriteria, SearchStats, IconData } from './types';

// Custom hooks
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';
import { useIconLibrary } from './hooks/useIconLibrary';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useAccessibility } from './hooks/useAccessibility';
import { useAutoSave, useRecoveryCheck, getCustomIcons, saveCustomIcon, deleteCustomIcon } from './hooks/useAutoSave';
import { useAdvancedSearch, applyFilters as applyAdvancedFilters, calculateFilterStats } from './hooks/useAdvancedSearch';

// Mobile detection hook
const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return isMobile;
};

const useIsTablet = () => {
	const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);

	useEffect(() => {
		const handleResize = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return isTablet;
};

// Eagerly loaded components
import Header from './components/Header.tsx';
import Sidebar from './components/Sidebar.tsx';
import Footer from './components/Footer.tsx';
import IconGrid from './components/IconGrid.tsx';
import Inspector from './components/Inspector.tsx';
import SelectionToolbar from './components/SelectionToolbar.tsx';
import ComparisonTool from './components/ComparisonTool.tsx';
import AnimationPreview from './components/AnimationPreview.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import AiKeyPrompt from './components/AiKeyPrompt.tsx';
import FilterPanel from './components/FilterPanel.tsx';
import ShortcutLegend from './components/ShortcutLegend.tsx';
import StyleGuide from './components/StyleGuide.tsx';

import { validateProviderKey } from './hooks/ai-providers/factory';

// Shadcn components
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Loader2 } from "lucide-react";

// Lazy-loaded heavy tabs
const Generator = React.lazy(() => import('./components/Generator.tsx'));
const Playground = React.lazy(() => import('./components/Playground.tsx'));

/** Loading fallback for Suspense boundaries */
const TabLoader: React.FC = () => (
	<div className="flex h-full items-center justify-center gap-3">
		<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
		<span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Loading_Module...</span>
	</div>
);

const App: React.FC = () => {
	// ─── UI State ─────────────────────────────────────────────
	const [activeTab, setActiveTab] = useState<TabType>('grid');
	const [showSettings, setShowSettings] = useState(false);
	const [showShortcuts, setShowShortcuts] = useState(false);
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();

	// ─── Accessibility ────────────────────────────────────────
	useAccessibility({
		enableFocusOutline: true,
		enableSkipLinks: true
	});

	// ─── Settings, Theme, Collections ─────────────────────────
	const {
		viewportSize, setViewportSize,
		weighting, setWeighting,
		theme, setTheme,
		accentColor, setAccentColor,
		customFillColor, setCustomFillColor,
		transform, setTransform,
		settings, handleUpdateSettings,
		collections, setCollections,
		undo, redo, canUndo, canRedo
	} = useSettings();

	// ─── Theme Effect ─────────────────────────────────────────
	// Handled by useSettings hook directly

	// ─── AI Availability ─────────────────────────────────────
	const isAiAvailable = useMemo(() => {
		const activeProvider = settings.providers[settings.activeProvider];
		return settings.aiEnabled && !!activeProvider.apiKey && validateProviderKey(settings.activeProvider, activeProvider.apiKey);
	}, [settings.aiEnabled, settings.activeProvider, settings.providers]);

	const showAiPrompt = useMemo(() => {
		// Check if ANY provider has a key
		const hasAnyKey = (Object.values(settings.providers) as AIProviderConfig[]).some(p => p.apiKey && p.apiKey !== 'none' && p.apiKey.length > 5);
		return !settings.hasSeenAiPrompt && !hasAnyKey;
	}, [settings.hasSeenAiPrompt, settings.providers]);

	// ─── Active Icon ──────────────────────────────────────────
	const [activeIconId, setActiveIconId] = useState<string | null>('nav-grid');

	// ─── AI Features ──────────────────────────────────────────
	const ai = useAI({
		settings,
		allIcons: [], // placeholder, logic handles semantic search separately
		activeIconId,
		activeTab,
		setActiveTab,
	});

	// ─── Custom Icons ─────────────────────────────────────────
	const [customIcons, setCustomIcons] = useState<IconData[]>([]);

	useEffect(() => {
		const loadCustomIcons = async () => {
			const saved = await getCustomIcons();
			setCustomIcons(saved);
		};
		loadCustomIcons();
	}, []);

	const handleSaveCustomIcon = useCallback(async (icon: IconData) => {
		await saveCustomIcon(icon);
		setCustomIcons(prev => [...prev, icon]);
	}, []);

	const handleDeleteCustomIcon = useCallback(async (id: string) => {
		await deleteCustomIcon(id);
		setCustomIcons(prev => prev.filter(i => i.id !== id));
	}, []);

	// ─── Icon Library ─────────────────────────────────────────
	const library = useIconLibrary({
		settings,
		weighting,
		transform,
		customFillColor,
		collections,
		synthesizedIcons: ai.synthesizedIcons,
		aiMetadataCache: ai.aiMetadataCache,
		aiSearchResults: ai.aiSearchResults,
		customIcons
	});

	// Sync activeIconId for AI effects
	useEffect(() => {
		setActiveIconId(library.activeIconId);
	}, [library.activeIconId]);

	// ─── Debounced Semantic Search ────────────────────────────
	useEffect(() => {
		if (!settings.aiEnabled || !settings.semanticSearchEnabled) return;
		const timer = setTimeout(() => {
			ai.performSemanticSearch(library.searchQuery);
			if (library.searchQuery.trim()) {
				library.addToSearchHistory(library.searchQuery);
			}
		}, 1000);
		return () => clearTimeout(timer);
	}, [library.searchQuery, settings.aiEnabled, settings.semanticSearchEnabled, library.addToSearchHistory]);

	// ─── Advanced Search & Filtering ──────────────────────────
	const advancedSearch = useAdvancedSearch(library.allIcons);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [appliedFilters, setAppliedFilters] = useState<FilterCriteria>({});
	const [savedFilters, setSavedFilters] = useState<any[]>(() => {
		const saved = localStorage.getItem('icon-library-saved-filters');
		return saved ? JSON.parse(saved) : [];
	});

	// Apply filters to icon list
	const filteredByAdvancedSearch = useMemo(() => {
		if (Object.keys(appliedFilters).length === 0) return library.filteredIconsList;
		return applyAdvancedFilters(library.filteredIconsList, appliedFilters);
	}, [appliedFilters, library.filteredIconsList]);

	// Group filtered icons by category for display
	const categoriesToDisplayWithFilters = useMemo(() => {
		const grouped: Record<string, any[]> = {};
		filteredByAdvancedSearch.forEach(icon => {
			const cat = icon.category || 'Uncategorized';
			if (!grouped[cat]) grouped[cat] = [];
			grouped[cat].push(icon);
		});
		return grouped;
	}, [filteredByAdvancedSearch]);

	const handleApplyFilters = useCallback((filters: FilterCriteria) => {
		setAppliedFilters(filters);
		setIsFilterOpen(false);
	}, []);

	const handleSaveFilter = useCallback((name: string, filters: FilterCriteria) => {
		const newFilter = {
			id: `filter-${Date.now()}`,
			name,
			filters,
			createdAt: Date.now(),
			usageCount: 0,
		};
		const updated = [...savedFilters, newFilter];
		setSavedFilters(updated);
		localStorage.setItem('icon-library-saved-filters', JSON.stringify(updated));
	}, [savedFilters]);

	const handleLoadFilter = useCallback((filterId: string) => {
		const filter = savedFilters.find(f => f.id === filterId);
		if (filter) {
			setAppliedFilters(filter.filters);
			// Increment usage count
			const updated = savedFilters.map(f =>
				f.id === filterId ? { ...f, usageCount: f.usageCount + 1 } : f
			);
			setSavedFilters(updated);
			localStorage.setItem('icon-library-saved-filters', JSON.stringify(updated));
		}
	}, [savedFilters]);

	const handleDeleteFilter = useCallback((filterId: string) => {
		const updated = savedFilters.filter(f => f.id !== filterId);
		setSavedFilters(updated);
		localStorage.setItem('icon-library-saved-filters', JSON.stringify(updated));
	}, [savedFilters]);

	// Comparison Management ────────────────────────────────
	const [isComparing, setIsComparing] = useState(false);

	const handleOpenCompare = useCallback(() => {
		if (library.selectedIds.size === 2) {
			setIsComparing(true);
		}
	}, [library.selectedIds]);

	const handleCloseCompare = useCallback(() => {
		setIsComparing(false);
	}, []);

	// Collection Management ────────────────────────────────
	const handleCreateCollection = useCallback(() => {
		if (library.selectedIds.size === 0) return;
		const name = prompt('Name this collection:');
		if (!name) return;
		const newCol: any = {
			id: `col-${Date.now()}`,
			name,
			iconIds: Array.from(library.selectedIds),
			createdAt: Date.now(),
		};
		setCollections(prev => [...prev, newCol]);
	}, [library.selectedIds, setCollections]);

	const handleDeleteCollection = useCallback((id: string) => {
		setCollections(prev => prev.filter(c => c.id !== id));
		library.setActiveCollectionId(null);
	}, [setCollections, library]);

	// ─── Bulk Selection ───────────────────────────────────────
	const isAllFilteredSelected = useMemo(() => {
		if (library.filteredIconsList.length === 0) return false;
		return library.filteredIconsList.every(i => library.selectedIds.has(i.id));
	}, [library.filteredIconsList, library.selectedIds]);

	// ─── AI Handlers ──────────────────────────────────────────
	const handleSetSemanticSearch = useCallback((val: boolean) => {
		handleUpdateSettings({ semanticSearchEnabled: val });
	}, [handleUpdateSettings]);

	const handleInitializeAi = useCallback((provider: AIProviderId, key: string) => {
		const newProviders = { ...settings.providers };
		newProviders[provider] = {
			...newProviders[provider],
			apiKey: key,
			enabled: true,
			status: 'connected'
		};
		handleUpdateSettings({
			activeProvider: provider,
			providers: newProviders,
			aiEnabled: true,
			hasSeenAiPrompt: true
		});
	}, [handleUpdateSettings, settings.providers]);

	const handleSkipAiPrompt = useCallback(() => {
		handleUpdateSettings({
			aiEnabled: false,
			hasSeenAiPrompt: true
		});
	}, [handleUpdateSettings]);

	const handleResetApp = useCallback(() => {
		if (confirm('This will clear all collections, selections, and local preferences. Continue?')) {
			localStorage.clear();
			window.location.reload();
		}
	}, []);

	// ─── Keyboard Shortcuts ───────────────────────────────────
	const searchInputRef = React.useRef<HTMLInputElement>(null);

	useKeyboardShortcuts([
		// Cmd/Ctrl + K: Focus search
		{
			...APP_SHORTCUTS.SEARCH,
			action: () => {
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
		},
		{
			...APP_SHORTCUTS.SEARCH_ALT,
			action: () => {
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
		},
		// Cmd/Ctrl + Z: Undo
		{
			...APP_SHORTCUTS.UNDO,
			action: () => {
				if (canUndo) undo();
			}
		},
		// Cmd/Ctrl + Shift + Z: Redo
		{
			...APP_SHORTCUTS.REDO,
			action: () => {
				if (canRedo) redo();
			}
		},
		// Cmd/Ctrl + C: Copy selected icon Specification
		{
			...APP_SHORTCUTS.COPY,
			action: () => {
				library.handleCopySpec();
			}
		},
		// Cmd/Ctrl + A: Select All Filtered
		{
			...APP_SHORTCUTS.SELECT_ALL,
			action: () => library.handleSelectFiltered()
		},
		// Cmd/Ctrl + D: Clear Selection
		{
			...APP_SHORTCUTS.DESELECT,
			action: () => library.handleClearSelection()
		},
		// Cmd/Ctrl + E: Export
		{
			...APP_SHORTCUTS.EXPORT,
			action: () => {
				if (library.selectedIds.size > 0) {
					setActiveTab('grid');
					// Trigger export via the Header component
					const event = new CustomEvent('triggerExport');
					window.dispatchEvent(event);
				}
			}
		},
		// Escape: Close / Deselect
		{
			...APP_SHORTCUTS.ESCAPE,
			action: () => {
				if (showShortcuts) setShowShortcuts(false);
				else if (showSettings) setShowSettings(false);
				else if (isComparing) setIsComparing(false);
				else if (isFilterOpen) setIsFilterOpen(false);
				else library.handleClearSelection();
			}
		},
		// ?: Toggle help
		{
			...APP_SHORTCUTS.HELP,
			action: () => setShowShortcuts(prev => !prev)
		}
	], [library, canUndo, canRedo, showShortcuts, showSettings, isComparing, isFilterOpen]);
	// ─── Auto-Save & Recovery ─────────────────────────────────
	const draftData = useMemo(() => ({
		activeTab,
		showSettings,
		activeIconId,
		selectedIds: Array.from(library.selectedIds),
		searchQuery: library.searchQuery,
		selectedCategory: library.selectedCategory,
		activeCollectionId: library.activeCollectionId,
		viewMode: library.viewMode,
		viewportSize,
		weighting,
		theme,
		accentColor,
		customFillColor,
		transform,
		collections
	}), [activeTab, showSettings, activeIconId, library.selectedIds, library.searchQuery, 
		library.selectedCategory, library.activeCollectionId, library.viewMode,
		viewportSize, weighting, theme, accentColor, customFillColor, transform, collections]);

	const { recoveryData, isSaving, lastSaveTime, hasRecovery, recoverDraft, clearRecoveryData } = useAutoSave(draftData, {
		enabled: true,
		interval: 30000, // Auto-save every 30 seconds
		key: 'icon-library'
	});

	const { showRecoveryDialog, setShowRecoveryDialog, recoveryDrafts } = useRecoveryCheck();

	return (
		<ErrorBoundary>
			<div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300 font-sans selection:bg-accent selection:text-accent-foreground">
				<Header
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					matchCount={library.filteredIconsList.length}
					totalCount={library.allIcons.length}
					isSearching={ai.isAiSearching}
					selectedCount={library.selectedIds.size}
					onClearSelection={library.handleClearSelection}
					onSelectAllFiltered={library.handleSelectFiltered}
					onCreateCollection={handleCreateCollection}
					onOpenSettings={() => setShowSettings(true)}
					aiEnabled={isAiAvailable}
					isAllFilteredSelected={isAllFilteredSelected}
					viewMode={library.viewMode}
					setViewMode={library.setViewMode}
					isMobile={isMobile}
					isSaving={isSaving}
					lastSaveTime={lastSaveTime}
				/>


				{/* Mobile Layout: Full-screen tabs */}
				{isMobile ? (
					<div className="flex flex-1 overflow-hidden flex-col">
						<div id="main-content" className="flex-1 overflow-y-auto bg-muted/10 p-2">
							<ErrorBoundary>
								{activeTab === 'grid' && (
									<div>
										{Object.entries(categoriesToDisplayWithFilters).map(([cat, icons]) => (
											<IconGrid
												key={cat}
												category={cat}
												icons={icons}
												viewportSize={viewportSize}
												weighting={weighting}
												transform={transform}
												activeIconId={library.activeIconId}
												selectedIds={library.selectedIds}
												settings={settings}
												aiMetadataCache={ai.aiMetadataCache}
												customFillColor={customFillColor}
												onPreview={library.setActiveIconId}
												onToggle={library.handleToggleSelection}
												onAddToRecent={library.addToRecent}
												viewMode={library.viewMode}
											/>
										))}
										{Object.keys(categoriesToDisplayWithFilters).length === 0 && (
											<div className="flex h-[300px] flex-col items-center justify-center opacity-20">
												<svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
												<span className="mt-3 text-xs font-bold uppercase tracking-[0.2em]">No_Results</span>
											</div>
										)}
									</div>
								)}
								{activeTab === 'playground' && (
									<Suspense fallback={<TabLoader />}>
										<Playground
											icon={library.activeIcon}
											weighting={weighting}
											transform={transform}
											customFillColor={customFillColor}
										/>
									</Suspense>
								)}
								{activeTab === 'animation' && (
									<div className="h-full w-full overflow-y-auto bg-background p-3 sm:p-4">
										<AnimationPreview
											icon={library.activeIcon}
											viewportSize={viewportSize}
											weighting={weighting}
											transform={transform}
											customFillColor={customFillColor}
										/>
									</div>
								)}
								{activeTab === 'style-guide' && (
									<div className="h-full w-full overflow-y-auto bg-background p-3 sm:p-4">
										<StyleGuide
											icons={library.filteredIconsList}
											settings={settings}
											customFillColor={customFillColor}
											weighting={weighting}
										/>
									</div>
								)}
								{activeTab === 'inspector' && (
									<div className="h-full w-full overflow-y-auto bg-background p-3 sm:p-4">
										<Inspector
											icon={library.activeIcon}
											viewportSize={viewportSize}
											weighting={weighting}
											transform={transform}
											customFillColor={customFillColor}
											relatedIcons={ai.relatedIconsCache[library.activeIconId || ''] || []}
											aiMetadata={ai.aiMetadataCache[library.activeIconId || ''] || null}
											isGeneratingMetadata={ai.isGeneratingMetadata}
											allIcons={library.allIcons}
											settings={settings}
											onCopySpec={library.handleCopySpec}
											onPreview={library.setActiveIconId}
											onExport={library.handleExportSingle}
											onAddToRecent={library.addToRecent}
										/>
									</div>
								)}
								{activeTab === 'generator' && (
									<Suspense fallback={<TabLoader />}>
										<Generator />
									</Suspense>
								)}
							</ErrorBoundary>
						</div>
						<div className="border-t bg-background overflow-y-auto flex-shrink-0 max-h-[45vh]">
							<div className="p-3">
								<p className="text-[9px] font-bold uppercase mb-3 opacity-50 tracking-wider">Controls</p>
								<Sidebar
									searchQuery={library.searchQuery}
									setSearchQuery={library.setSearchQuery}
									viewportSize={viewportSize}
									setViewportSize={setViewportSize}
									weighting={weighting}
									setWeighting={setWeighting}
									transform={transform}
									setTransform={setTransform}
									accentColor={accentColor}
									setAccentColor={setAccentColor}
									collections={collections}
									activeCollectionId={library.activeCollectionId}
									setActiveCollectionId={library.setActiveCollectionId}
									onDeleteCollection={handleDeleteCollection}
									selectedCategory={library.selectedCategory}
									setSelectedCategory={library.setSelectedCategory}
									selectedCount={library.selectedIds.size}
									onExport={library.handleExport}
									aiEnabled={isAiAvailable}
									semanticSearchEnabled={settings.semanticSearchEnabled}
									setSemanticSearchEnabled={handleSetSemanticSearch}
									isAiSearching={ai.isAiSearching}
									recentlyViewedIds={library.recentlyViewedIds}
									allIcons={library.allIcons}
									onPreview={library.setActiveIconId}
									onImportSvg={handleSaveCustomIcon}
									isMobile={true}
									searchInputRef={searchInputRef}
									onOpenFilters={() => setIsFilterOpen(true)}
								/>
							</div>
						</div>
					</div>
				) : (
					/* Tablet & Desktop Layout: Resizable panels */
					<div className="flex flex-1 overflow-hidden">
						<ResizablePanelGroup orientation="horizontal">
							<ResizablePanel defaultSize={isTablet ? "25" : "20"} minSize="15" maxSize="30" className="border-r bg-muted/20">
								<Sidebar
								searchQuery={library.searchQuery}
								setSearchQuery={library.setSearchQuery}
								viewportSize={viewportSize}
								setViewportSize={setViewportSize}
								weighting={weighting}
								setWeighting={setWeighting}
								transform={transform}
								setTransform={setTransform}
								accentColor={accentColor}
								setAccentColor={setAccentColor}
								collections={collections}
								activeCollectionId={library.activeCollectionId}
								setActiveCollectionId={library.setActiveCollectionId}
								onDeleteCollection={handleDeleteCollection}
								selectedCategory={library.selectedCategory}
								setSelectedCategory={library.setSelectedCategory}
								selectedCount={library.selectedIds.size}
								onExport={library.handleExport}
								aiEnabled={isAiAvailable}
								semanticSearchEnabled={settings.semanticSearchEnabled}
								setSemanticSearchEnabled={handleSetSemanticSearch}
								isAiSearching={ai.isAiSearching}
								recentlyViewedIds={library.recentlyViewedIds}
								allIcons={library.allIcons}
								onPreview={library.setActiveIconId}
								onImportSvg={handleSaveCustomIcon}
								isMobile={false}
								searchInputRef={searchInputRef}
								onOpenFilters={() => setIsFilterOpen(true)}
							/>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel defaultSize={isTablet ? "50" : "60"} minSize="30">
							<div id="main-content" className="h-full overflow-y-auto bg-muted/10 p-6">
								<ErrorBoundary>
									{activeTab === 'grid' && (
										<div>
											{Object.entries(library.categoriesToRender).map(([cat, icons]) => (
												<IconGrid
													key={cat}
													category={cat}
													icons={icons}
													viewportSize={viewportSize}
													weighting={weighting}
													transform={transform}
													activeIconId={library.activeIconId}
													selectedIds={library.selectedIds}
													settings={settings}
													aiMetadataCache={ai.aiMetadataCache}
													customFillColor={customFillColor}
													onPreview={library.setActiveIconId}
													onToggle={library.handleToggleSelection}
													onAddToRecent={library.addToRecent}
													viewMode={library.viewMode}
												/>
											))}
											{Object.keys(library.categoriesToRender).length === 0 && (
												<div className="flex h-[400px] flex-col items-center justify-center opacity-20">
													<svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
													<span className="mt-3 text-sm font-bold uppercase tracking-[0.3em]">No_Results</span>
												</div>
											)}
										</div>
									)}
									{activeTab === 'playground' && (
										<Suspense fallback={<TabLoader />}>
											<Playground
												icon={library.activeIcon}
												weighting={weighting}
												transform={transform}
												customFillColor={customFillColor}
											/>
										</Suspense>
									)}
									{activeTab === 'animation' && (
										<div className="h-full w-full overflow-y-auto p-4 sm:p-6">
											<AnimationPreview
												icon={library.activeIcon}
												viewportSize={viewportSize}
												weighting={weighting}
												transform={transform}
												customFillColor={customFillColor}
											/>
										</div>
									)}
									{activeTab === 'generator' && (
										<Suspense fallback={<TabLoader />}>
											<Generator />
										</Suspense>
									)}
									{activeTab === 'style-guide' && (
										<div className="h-full w-full overflow-y-auto p-4 sm:p-6">
											<StyleGuide
												icons={library.filteredIconsList}
												settings={settings}
												customFillColor={customFillColor}
												weighting={weighting}
											/>
										</div>
									)}
									{activeTab === 'inspector' && (
										<div className="h-full w-full overflow-y-auto p-4 sm:p-6">
											<Inspector
												icon={library.activeIcon}
												viewportSize={viewportSize}
												weighting={weighting}
												transform={transform}
												customFillColor={customFillColor}
												relatedIcons={ai.relatedIconsCache[library.activeIconId || ''] || []}
												aiMetadata={ai.aiMetadataCache[library.activeIconId || ''] || null}
												isGeneratingMetadata={ai.isGeneratingMetadata}
												allIcons={library.allIcons}
												settings={settings}
												onCopySpec={library.handleCopySpec}
												onPreview={library.setActiveIconId}
												onExport={library.handleExportSingle}
												onAddToRecent={library.addToRecent}
											/>
										</div>
									)}
								</ErrorBoundary>
							</div>
						</ResizablePanel>

						{!isTablet && (
							<>
								<ResizableHandle withHandle />

								<ResizablePanel defaultSize="20" minSize="15" maxSize="30" className="border-l bg-background hidden lg:flex">
									<div className="h-full overflow-y-auto p-4 w-full">
										<Inspector
											icon={library.activeIcon}
											viewportSize={viewportSize}
											weighting={weighting}
											transform={transform}
											customFillColor={customFillColor}
											relatedIcons={ai.relatedIconsCache[library.activeIconId || ''] || []}
											aiMetadata={ai.aiMetadataCache[library.activeIconId || ''] || null}
											isGeneratingMetadata={ai.isGeneratingMetadata}
											allIcons={library.allIcons}
											settings={settings}
											onCopySpec={library.handleCopySpec}
											onPreview={library.setActiveIconId}
											onExport={library.handleExportSingle}
											onAddToRecent={library.addToRecent}
										/>
									</div>
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</div>
				)}

				<Footer theme={theme} setTheme={setTheme} isMobile={isMobile} />

				<SettingsModal
					isOpen={showSettings}
					onClose={() => setShowSettings(false)}
					settings={settings}
					updateSettings={handleUpdateSettings}
					onReset={handleResetApp}
				/>

				{showAiPrompt && (
					<AiKeyPrompt
						onSave={handleInitializeAi}
						onSkip={handleSkipAiPrompt}
					/>
				)}

				{ai.apiError && (
					<div className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-md bg-destructive px-4 py-2 text-destructive-foreground shadow-lg">
						<span className="text-xs font-bold uppercase tracking-widest">{ai.apiError}</span>
						<button
							onClick={() => ai.setApiError(null)}
							className="opacity-70 hover:opacity-100"
						>
							✕
						</button>
					</div>
				)}

				<FilterPanel
					isOpen={isFilterOpen}
					onClose={() => setIsFilterOpen(false)}
					onApplyFilters={handleApplyFilters}
					savedFilters={savedFilters}
					onSaveFilter={handleSaveFilter}
					onLoadFilter={handleLoadFilter}
					onDeleteFilter={handleDeleteFilter}
					filterStats={calculateFilterStats(library.allIcons, filteredByAdvancedSearch)}
				/>

				{activeTab === 'grid' && (
					<SelectionToolbar 
						selectedCount={library.selectedIds.size}
						onClearSelection={library.handleClearSelection}
						onInvertSelection={library.handleInvertSelection}
						onSelectAll={library.handleSelectFiltered}
						onExport={library.handleExport}
						onAddToCollection={handleCreateCollection}
						onCompare={handleOpenCompare}
					/>
				)}

				{isComparing && library.selectedIds.size === 2 && (
					(() => {
						const [idA, idB] = Array.from(library.selectedIds);
						const iconA = library.allIcons.find(i => i.id === idA);
						const iconB = library.allIcons.find(i => i.id === idB);
						if (iconA && iconB) {
							return (
								<ComparisonTool 
									iconA={iconA}
									iconB={iconB}
									viewportSize={viewportSize}
									weighting={weighting}
									customFillColor={customFillColor}
									onClose={handleCloseCompare}
								/>
							);
						}
						return null;
					})()
				)}

				<ShortcutLegend 
					isOpen={showShortcuts} 
					onClose={() => setShowShortcuts(false)} 
				/>
			</div>
		</ErrorBoundary>
	);
};

export default App;
