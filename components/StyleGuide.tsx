import React, { useMemo } from 'react';
import { IconData, AppSettings, Weighting } from '../types';
import { getStrokeWidth } from '../utils/svg';
import { Download, Library, Type, Palette } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import JSZip from 'jszip';

interface StyleGuideProps {
  icons: IconData[];
  settings: AppSettings;
  customFillColor: string;
  weighting: Weighting;
}

const StyleGuide: React.FC<StyleGuideProps> = ({ icons, settings, customFillColor, weighting }) => {
  const sw = getStrokeWidth(weighting);
  const globalStroke = (!customFillColor || customFillColor === 'currentColor') ? 'currentColor' : customFillColor;

  const handleExportHTML = async () => {
    // Generate HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Icon Library - Style Guide</title>
    <style>
        :root {
            --primary-font: '${settings.primaryFont}', sans-serif;
            --mono-font: '${settings.monoFont}', monospace;
            --bg-color: #09090b;
            --text-color: #fafafa;
            --muted-color: #a1a1aa;
            --border-color: #27272a;
            --card-bg: #18181b;
        }
        body {
            font-family: var(--primary-font);
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            margin-bottom: 3rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        }
        h1 { font-size: 2.5rem; margin: 0 0 0.5rem 0; }
        p { color: var(--muted-color); margin: 0; }
        section { margin-bottom: 4rem; }
        h2 { font-size: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        .icon-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .icon-preview {
            width: 48px;
            height: 48px;
            margin-bottom: 1rem;
            color: ${globalStroke};
        }
        .icon-name { font-weight: bold; margin-bottom: 0.25rem; }
        .icon-category { font-size: 0.875rem; color: var(--muted-color); text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--mono-font); }
        
        .tokens-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .token-group {
            background: var(--card-bg);
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        .token-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        .token-item:last-child { border-bottom: none; }
        .token-label { font-weight: bold; }
        .token-value { font-family: var(--mono-font); color: var(--muted-color); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Design System Documentation</h1>
            <p>Generated asset library and technical specifications.</p>
        </header>

        <section class="tokens-grid">
            <div class="token-group">
                <h3 style="margin-top: 0">Typography</h3>
                <div class="token-item">
                    <span class="token-label">Primary Font</span>
                    <span class="token-value">${settings.primaryFont}</span>
                </div>
                <div class="token-item">
                    <span class="token-label">Monospace Font</span>
                    <span class="token-value">${settings.monoFont}</span>
                </div>
            </div>
            
            <div class="token-group">
                <h3 style="margin-top: 0">Iconography Rules</h3>
                <div class="token-item">
                    <span class="token-label">Global Stroke Width</span>
                    <span class="token-value">${sw}px (${weighting})</span>
                </div>
                <div class="token-item">
                    <span class="token-label">Base ViewBox</span>
                    <span class="token-value">0 0 24 24</span>
                </div>
                <div class="token-item">
                    <span class="token-label">Line Cap / Join</span>
                    <span class="token-value">Round</span>
                </div>
            </div>
        </section>

        <section>
            <h2>Asset Library (${icons.length} Icons)</h2>
            <div class="grid">
                ${icons.map(icon => `
                <div class="icon-card">
                    <div class="icon-preview">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
                            ${(icon.paths || [{ d: icon.svgPath }]).map(p => `
                                <path d="${p.d}" ${p.color ? `stroke="${p.color}"` : ''} ${p.opacity ? `stroke-opacity="${p.opacity}"` : ''} />
                            `).join('')}
                        </svg>
                    </div>
                    <div class="icon-name">${icon.name}</div>
                    <div class="icon-category">${icon.category}</div>
                </div>
                `).join('')}
            </div>
        </section>
    </div>
</body>
</html>
    `;

    // Download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-system-style-guide.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            Design System Guidelines
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Technical specifications and visual assets for the current library.
          </p>
        </div>
        <Button onClick={handleExportHTML} className="gap-2 shrink-0 shadow-lg shadow-primary/20">
          <Download className="h-4 w-4" />
          Export HTML Guide
        </Button>
      </div>

      {/* Grid of Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Typography Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Type className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Typography</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Primary Font ({settings.primaryFont})</p>
              <p className="text-lg" style={{ fontFamily: settings.primaryFont }}>The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Mono Font ({settings.monoFont})</p>
              <p className="text-sm border-l-2 pl-2 border-primary/30" style={{ fontFamily: settings.monoFont }}>{"<svg viewBox=\"0 0 24 24\">"}</p>
            </div>
          </div>
        </div>

        {/* Iconography Rules */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Palette className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Iconography</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <span className="text-muted-foreground">Stroke Weight</span>
            <span className="font-mono font-bold">{sw}px ({weighting})</span>
            
            <span className="text-muted-foreground">Line Cap/Join</span>
            <span className="font-mono font-bold">Round</span>
            
            <span className="text-muted-foreground">Base ViewBox</span>
            <span className="font-mono font-bold">24x24</span>

            <span className="text-muted-foreground">Default Color</span>
            <span className="font-mono font-bold">{globalStroke}</span>
          </div>
        </div>
        
        {/* Metrics Summary */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Library className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Library Metrics</h3>
          </div>
          <div className="text-4xl font-black mb-2">{icons.length}</div>
          <p className="text-sm text-muted-foreground mb-4">Total active assets in the current filtered view.</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(icons.map(i => i.category))).slice(0, 5).map(cat => (
              <Badge key={cat} variant="secondary" className="text-[9px] uppercase">{cat}</Badge>
            ))}
            {new Set(icons.map(i => i.category)).size > 5 && (
              <Badge variant="outline" className="text-[9px] uppercase">+{new Set(icons.map(i => i.category)).size - 5} More</Badge>
            )}
          </div>
        </div>

      </div>

      {/* Asset Grid Preview */}
      <div className="mt-4">
        <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-muted-foreground">Asset Preview ({icons.length})</h3>
        <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
           {icons.map(icon => (
               <div key={icon.id} className="flex flex-col items-center p-4 border rounded-lg bg-card text-center gap-3">
                   <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="32"
                        height="32"
                      >
                         {(icon.paths || [{ d: icon.svgPath }]).map((p, i) => (
                           <path 
                            key={i} 
                            d={p.d} 
                            stroke={p.color || globalStroke} 
                            strokeOpacity={p.opacity ?? 1} 
                           />
                         ))}
                    </svg>
                    <div className="w-full">
                        <p className="text-xs font-bold truncate" title={icon.name}>{icon.name}</p>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase opacity-70 truncate">{icon.category}</p>
                    </div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default StyleGuide;
