
import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { TabType, AIProviderId, AIProviderConfig } from './types';

// Custom hooks
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';
import { useIconLibrary } from './hooks/useIconLibrary';

// Eagerly loaded components
import Header from './components/Header.tsx';
import Sidebar from './components/Sidebar.tsx';
import Footer from './components/Footer.tsx';
import IconGrid from './components/IconGrid.tsx';
import Inspector from './components/Inspector.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import AiKeyPrompt from './components/AiKeyPrompt.tsx';
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

	// ─── Collection Management ────────────────────────────────
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
	const handleSelectAllFiltered = useCallback(() => {
		const filteredIds = library.filteredIconsList.map(i => i.id);
		const allSelected = filteredIds.every(id => library.selectedIds.has(id));

		if (allSelected) {
			library.setSelectedIds(prev => {
				const next = new Set(prev);
				filteredIds.forEach(id => next.delete(id));
				return next;
			});
		} else {
			library.setSelectedIds(prev => {
				const next = new Set(prev);
				filteredIds.forEach(id => next.add(id));
				return next;
			});
		}
	}, [library]);

	const isAllFilteredSelected = useMemo(() => {
		if (library.filteredIconsList.length === 0) return false;
		return library.filteredIconsList.every(i => library.selectedIds.has(i.id));
	}, [library.filteredIconsList, library.selectedIds]);

	const handleClearSelection = useCallback(() => {
		library.setSelectedIds(new Set());
	}, [library]);

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
					onClearSelection={handleClearSelection}
					onSelectAllFiltered={handleSelectAllFiltered}
					onCreateCollection={handleCreateCollection}
					onOpenSettings={() => setShowSettings(true)}
					aiEnabled={isAiAvailable}
					isAllFilteredSelected={isAllFilteredSelected}
					viewMode={library.viewMode}
					setViewMode={library.setViewMode}
				/>

				<div className="flex flex-1 overflow-hidden">
					<ResizablePanelGroup orientation="horizontal">
						<ResizablePanel defaultSize="20" minSize="15" maxSize="30" className="border-r bg-muted/20">
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
							/>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel defaultSize="60" minSize="30">
							<div className="h-full overflow-y-auto bg-muted/10 p-6">
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
									{activeTab === 'generator' && (
										<Suspense fallback={<TabLoader />}>
											<Generator />
										</Suspense>
									)}
								</ErrorBoundary>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel defaultSize="20" minSize="15" maxSize="30" className="border-l bg-background">
							<div className="h-full overflow-y-auto p-4">
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
					</ResizablePanelGroup>
				</div>

				<Footer theme={theme} setTheme={setTheme} />

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
			</div>
		</ErrorBoundary>
	);
};

export default App;
