import React, { useState } from 'react';
import { createAIClient, withBackoff, isRateLimitError } from '../utils/api';
import { ICON_LIBRARY } from '../constants.tsx';
import { Button } from "@/components/ui/button";
// using regular textarea below
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw, LayoutGrid } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-6), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const generateImage = async (query: string): Promise<string | null> => {
    return await withBackoff(async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.");
      }
      const ai = createAIClient(apiKey);
      const model = ai.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `A professional, minimalist vector icon reference: ${query}. Solid black lines on a clean white background. Centered, isolated, high contrast, design system style.`
          }]
        }]
      });

      const part = result.response.candidates?.[0].content.parts.find((p: any) => p.inlineData);
      if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return null;
    }, 2);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultImage(null);
    setQuotaError(false);
    setLogs([]);
    addLog("Initializing Neural Engine...");

    try {
      addLog("Fetching visual context...");
      const result = await generateImage(prompt);
      if (result) {
        setResultImage(result);
        addLog("Single asset synthesis complete.");
      }
    } catch (e: unknown) {
      if (isRateLimitError(e)) {
        setQuotaError(true);
        addLog("CRITICAL: Rate limit exceeded (429).");
      } else {
        addLog("ERROR: API_FAILURE. Check connection.");
      }
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    const categories = Object.keys(ICON_LIBRARY);
    setIsBatchGenerating(true);
    setBatchResults({});
    setQuotaError(false);
    setLogs([]);
    addLog(`Initiating Suite Synthesis for ${categories.length} categories...`);

    for (const cat of categories) {
      setCurrentCategory(cat);
      addLog(`Synthesizing concept for category: ${cat.toUpperCase()}...`);
      try {
        const result = await generateImage(`${cat} category representative icon`);
        if (result) {
          setBatchResults(prev => ({ ...prev, [cat]: result }));
          addLog(`SUCCESS: ${cat} concept realized.`);
        }
      } catch (e: unknown) {
        if (isRateLimitError(e)) {
          setQuotaError(true);
          addLog("QUOTA EXHAUSTED: Stopping batch process.");
          break;
        }
        addLog(`FAILED: ${cat} synthesis interrupted.`);
        console.error(e);
      }
    }

    setCurrentCategory(null);
    addLog(quotaError ? "Synthesis halted due to quota limit." : "Full Category Suite synthesis finalized.");
    setIsBatchGenerating(false);
  };

  return (
    <div className="p-8 mx-auto max-w-[1400px]">
      {quotaError && (
        <Alert variant="destructive" className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Gemini API Quota Exceeded (429). Please wait a few minutes.</AlertTitle>
          </div>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sm font-bold underline hover:opacity-80">
            Upgrade Quota
          </a>
        </Alert>
      )}

      <div className="mb-8 flex items-end justify-between border-b pb-6">
        <div>
          <h2 className="mb-1 text-3xl font-black uppercase tracking-tight">AI_Reference_Generator</h2>
          <span className="font-mono text-xs uppercase text-muted-foreground">Generate visual references for missing manifest assets</span>
        </div>
        <Button
          variant="outline"
          onClick={handleBatchGenerate}
          disabled={isBatchGenerating || isGenerating}
          className="h-12 px-6 font-bold uppercase tracking-wider"
        >
          {isBatchGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {isBatchGenerating ? "Suite Synthesis Progress" : "Generate Category Suite"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Focused Generation */}
        <div className="lg:col-span-5">
          <div className="mb-6 rounded-lg border bg-muted/50 p-6">
            <div className="mb-4">
              <label className="mb-2 block text-xs font-bold uppercase opacity-50">Neural Descriptor Input</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'A futuristic biometric palm scanner'..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>

            <Button
              className="mb-4 h-14 w-full text-sm font-bold uppercase tracking-[0.1em]"
              onClick={handleGenerate}
              disabled={isGenerating || isBatchGenerating}
            >
              {isGenerating ? "Synthesizing..." : "Realize Concept"}
            </Button>

            <ScrollArea className="h-[160px] rounded-md border bg-black/5 p-4 dark:bg-white/5">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 flex gap-2 opacity-80">
                  <span className="font-mono text-[10px] text-primary">&gt;</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{log}</span>
                </div>
              ))}
              {!isGenerating && !isBatchGenerating && logs.length === 0 && (
                <span className="font-mono text-[10px] opacity-30">_Ready_for_input...</span>
              )}
              {(isGenerating || isBatchGenerating) && (
                <span className="animate-pulse font-mono text-[10px] text-primary">_Neural_link_active...</span>
              )}
            </ScrollArea>
          </div>

          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/20">
            {resultImage ? (
              <img src={resultImage} alt="AI Generated Reference" className="h-full w-full object-contain" />
            ) : (
              <div className="text-center opacity-20">
                <LayoutGrid className="mx-auto h-16 w-16" />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.4em]">Awaiting Synthesis</p>
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-xs font-bold uppercase text-primary">Decoding Pixels...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Suite */}
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase opacity-50">Category_Concept_Suite</h2>
            {isBatchGenerating && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-primary">Processing: {currentCategory}</span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
            {Object.keys(ICON_LIBRARY).map(cat => (
              <div
                key={cat}
                className={`relative aspect-square overflow-hidden rounded-lg border p-2 transition-all hover:scale-105 ${batchResults[cat] ? 'border-border bg-card shadow-md cursor-pointer' : 'border-border/50 bg-muted/20'}`}
              >
                {batchResults[cat] ? (
                  <button
                    onClick={() => setResultImage(batchResults[cat])}
                    className="h-full w-full border-none bg-transparent p-0"
                  >
                    <img src={batchResults[cat]} alt={cat} className="h-full w-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <span className="text-[10px] font-bold uppercase text-white">{cat}</span>
                    </div>
                  </button>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 opacity-30">
                    <div className={`h-8 w-8 rounded-full border-2 border-primary border-t-transparent ${currentCategory === cat ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-bold uppercase">{cat}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-dashed p-4 text-center">
            <span className="font-mono text-xs uppercase text-muted-foreground">
              Synthesized assets are reference only. Use the &quot;Realize Concept&quot; engine for specific modifications.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
