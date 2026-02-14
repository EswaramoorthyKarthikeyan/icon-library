
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultImage(null);
    setLogs([]);
    addLog("Initializing Neural Engine...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      addLog("Fetching visual context...");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A professional, minimalist vector icon reference: ${prompt}. Solid black lines on a clean white background. Centered, isolated, high contrast.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      addLog("Decoding pixel data...");
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setResultImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          addLog("Generation complete. Asset ready.");
        }
      }
    } catch (e) {
      addLog("ERROR: API_FAILURE. Check billing status.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-500">
      <div className="border-b border-black/10 pb-4">
        <h2 className="text-[24px] font-black uppercase tracking-tight">AI_Reference_Generator</h2>
        <p className="text-[11px] font-mono opacity-40 uppercase">Generate visual references for missing manifest assets</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block">Descriptor_Input</label>
            <textarea 
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'A futuristic biometric palm scanner'..."
              className="w-full h-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-4 text-[13px] font-mono focus:border-accent outline-none resize-none"
            />
          </div>

          <button 
            onClick={handleGenerate} disabled={isGenerating}
            className={`w-full py-4 rounded font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl ${isGenerating ? 'bg-black/10 opacity-50 cursor-not-allowed' : 'bg-accent text-white dark:text-black hover:scale-[1.02]'}`}
          >
            {isGenerating ? "Synthesizing..." : "Generate_Reference"}
          </button>

          <div className="p-4 bg-black/90 dark:bg-black rounded border border-white/10 font-mono text-[10px] text-green-500 space-y-1 min-h-[120px]">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
            {!isGenerating && logs.length === 0 && <div className="opacity-30">_Ready_for_input...</div>}
            {isGenerating && <div className="animate-pulse">_Neural_link_active...</div>}
          </div>
        </div>

        <div className="w-full md:w-[400px] aspect-square bg-black/[0.03] dark:bg-white/[0.03] border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
           {resultImage ? (
             <img src={resultImage} alt="AI Generated Reference" className="w-full h-full object-contain animate-in zoom-in-95 duration-700" />
           ) : (
             <div className="text-center p-10 space-y-4 opacity-20">
               <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting_Synthesis</p>
             </div>
           )}
           {isGenerating && (
             <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
               <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
