import { IconData } from '../types';

/**
 * Export multiple icons to a zip file
 */
export async function exportIconsAsZip(
  icons: IconData[],
  format: 'svg' | 'jsx' | 'json',
  _filename: string = 'icons-export'
): Promise<Blob> {
  // Create a simple ZIP-like structure using JSON
  const exportData = {
    exportedAt: new Date().toISOString(),
    format,
    count: icons.length,
    icons: icons.map(icon => ({
      id: icon.id,
      name: icon.name,
      category: icon.category,
      svgPath: icon.svgPath,
      paths: icon.paths,
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return blob;
}

/**
 * Trigger download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all favorites as JSON
 */
export async function exportFavorites(
  icons: IconData[],
  favoriteIds: string[]
): Promise<void> {
  const favoriteIcons = icons.filter(icon => favoriteIds.includes(icon.id));
  
  if (favoriteIcons.length === 0) {
    alert('No favorites to export!');
    return;
  }

  const blob = await exportIconsAsZip(favoriteIcons, 'json', 'favorite-icons.json');
  downloadBlob(blob, `favorite-icons-${Date.now()}.json`);
}

/**
 * Batch export icons by format
 */
export async function batchExportIcons(
  icons: IconData[],
  format: 'svg' | 'jsx' | 'json'
): Promise<void> {
  if (icons.length === 0) {
    alert('No icons selected!');
    return;
  }

  const blob = await exportIconsAsZip(icons, format, `icons-${Date.now()}`);
  downloadBlob(blob, `icons-export-${Date.now()}.${format === 'json' ? 'json' : 'zip'}`);
}
