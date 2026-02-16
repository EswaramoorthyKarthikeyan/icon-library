
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ICON_LIBRARY } from '../constants.tsx';

// Exponential backoff helper
const withBackoff = async <T,>(fn: () => Promise<T>, maxRetries = 2): Promise<T> => {
  let delay = 1500;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      if (isRetryable && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  return await fn();
};

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `A professional, minimalist vector icon reference: ${query}. Solid black lines on a clean white background. Centered, isolated, high contrast, design system style.` 
          }] 
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    });
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
    } catch (e: any) {
      if (e?.message?.includes('429')) {
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
      } catch (e: any) {
        if (e?.message?.includes('429')) {
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
    <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-500 max-w-[1400px] mx-auto">
      {quotaError && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between text-red-500 text-[10px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
             <span>Gemini API Quota Exceeded (429). Please wait a few minutes or upgrade your plan.</span>
           </div>
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:opacity-70 transition-opacity">Upgrade Quota</a>
        </div>
      )}

      <div className="border-b border-black/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black uppercase tracking-tight">AI_Reference_Generator</h2>
          <p className="text-[11px] font-mono opacity-40 uppercase">Generate visual references for missing manifest assets</p>
        </div>
        <button 
          onClick={handleBatchGenerate}
          disabled={isBatchGenerating || isGenerating}
          className={`px-6 py-3 rounded-lg border-2 font-black text-[10px] uppercase tracking-widest transition-all ${isBatchGenerating ? 'bg-accent/10 border-accent text-accent animate-pulse' : 'border-accent text-accent hover:bg-accent hover:text-white dark:hover:text-black shadow-lg shadow-accent/10'}`}
        >
          {isBatchGenerating ? "Suite_Synthesis_In_Progress..." : "Generate_Category_Suite"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left Column: Focused Generation */}
        <div className="xl:col-span-5 space-y-8">
          <div className="p-6 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block">Neural_Descriptor_Input</label>
              <textarea 
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'A futuristic biometric palm scanner'..."
                className="w-full h-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 text-[13px] font-mono focus:border-accent outline-none resize-none transition-all focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <button 
              onClick={handleGenerate} disabled={isGenerating || isBatchGenerating}
              className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl ${isGenerating ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-accent text-white dark:text-black hover:scale-[1.01] active:scale-[0.98]'}`}
            >
              {isGenerating ? "Synthesizing..." : "Realize_Concept"}
            </button>

            <div className="p-4 bg-black/90 dark:bg-black rounded-xl border border-white/10 font-mono text-[10px] text-accent space-y-1 min-h-[140px] custom-scrollbar overflow-y-auto">
              {logs.map((log, i) => <div key={i} className="opacity-80"> <span className="opacity-40">{">"}</span> {log}</div>)}
              {!isGenerating && !isBatchGenerating && logs.length === 0 && <div className="opacity-30">_Ready_for_input...</div>}
              {(isGenerating || isBatchGenerating) && <div className="animate-pulse text-white">_Neural_link_active...</div>}
            </div>
          </div>

          <div className="aspect-square bg-black/[0.03] dark:bg-white/[0.03] border-2 border-dashed border-black/10 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-inner group">
             {resultImage ? (
               <img src={resultImage} alt="AI Generated Reference" className="w-full h-full object-contain animate-in zoom-in-95 duration-700" />
             ) : (
               <div className="text-center p-10 space-y-4 opacity-20">
                 <svg className="w-16 h-16 mx-auto transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                 <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting_Synthesis</p>
               </div>
             )}
             {isGenerating && (
               <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                 <div className="w-14 h-14 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-accent">Decoding_Pixels...</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Category Suite Grid */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-black uppercase tracking-widest opacity-40">Category_Concept_Suite</h3>
            {isBatchGenerating && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-accent uppercase">Processing: {currentCategory}</span>
                <div className="w-2 h-2 bg-accent rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.keys(ICON_LIBRARY).map((cat) => (
              <div 
                key={cat}
                className={`relative aspect-square rounded-2xl border transition-all overflow-hidden group shadow-sm bg-white dark:bg-black/10 ${batchResults[cat] ? 'border-black/5 dark:border-white/10' : 'border-dashed border-black/10 dark:border-white/5'}`}
              >
                {batchResults[cat] ? (
                  <button 
                    onClick={() => setResultImage(batchResults[cat])}
                    className="w-full h-full p-2 group-hover:scale-105 transition-transform duration-500"
                  >
                    <img src={batchResults[cat]} alt={cat} className="w-full h-full object-contain" />
                  </button>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <div className={`w-8 h-8 rounded-full border-2 border-accent/20 ${currentCategory === cat ? 'animate-spin border-t-accent' : ''}`}></div>
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-20">{cat}</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                  <span className="text-[9px] font-black text-white uppercase">{cat}</span>
                  {batchResults[cat] && <span className="text-[8px] font-mono text-accent">READY</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border border-dashed border-black/10 dark:border-white/5 rounded-2xl flex items-center justify-center">
             <p className="text-[10px] font-mono opacity-20 uppercase text-center max-w-xs">
               Synthesized assets are reference only. Use the "Realize Concept" engine for specific modifications.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
