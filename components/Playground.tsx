
import React from 'react';
import { IconData, IconTransform, Weighting } from '../types.ts';

interface PlaygroundProps {
  icon: IconData | null;
  transform: IconTransform;
  weighting: Weighting;
}

const Playground: React.FC<PlaygroundProps> = ({ icon, transform, weighting }) => {
  if (!icon) return (
    <div className="flex items-center justify-center h-full text-center p-20 opacity-30">
      <p className="text-[12px] font-black uppercase tracking-widest font-mono">Select_An_Asset_To_Preview_In_Sandbox</p>
    </div>
  );

  const sw = weighting === 'bold' ? 3 : weighting === 'medium' ? 2 : 1.5;
  const transformStyle = {
    transform: `rotate(${transform.rotate}deg) scale(${transform.scale}) ${transform.flipH ? 'scaleX(-1)' : ''} ${transform.flipV ? 'scaleY(-1)' : ''}`
  };

  const Icon = () => (
    <svg style={{ width: '100%', height: '100%', ...transformStyle }} fill="none" stroke="currentColor" strokeWidth={sw} viewBox="0 0 24 24" className="transition-transform duration-300">
      <path strokeLinecap="round" strokeLinejoin="round" d={icon.svgPath} />
    </svg>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-black/10 pb-4">
        <h2 className="text-[24px] font-black uppercase tracking-tight">Interactive_Sandbox</h2>
        <p className="text-[11px] font-mono opacity-40 uppercase">Testing active asset: {icon.name} in standard UI patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black opacity-30 uppercase tracking-widest">Button_Patterns</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="flex items-center gap-2 bg-accent text-white dark:text-black px-5 py-2.5 rounded font-black text-[12px] uppercase shadow-lg hover:scale-[1.05] transition-all">
              <div className="w-4 h-4"><Icon /></div> Primary_Action
            </button>
            <button className="flex items-center gap-2 border border-black/20 dark:border-white/20 px-5 py-2.5 rounded font-bold text-[12px] uppercase hover:bg-black/5 transition-all">
              Secondary <div className="w-4 h-4 opacity-60"><Icon /></div>
            </button>
            <button className="p-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-accent hover:text-white transition-all">
              <div className="w-5 h-5"><Icon /></div>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black opacity-30 uppercase tracking-widest">Input_States</h3>
          <div className="relative group max-w-sm">
            <div className="absolute left-3 top-3 w-4 h-4 opacity-30 group-focus-within:opacity-100 transition-opacity"><Icon /></div>
            <input type="text" placeholder="Search parameters..." className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-[12px] font-mono focus:border-accent outline-none" />
          </div>
        </section>

        <section className="space-y-4 col-span-1 md:col-span-2">
          <h3 className="text-[10px] font-black opacity-30 uppercase tracking-widest">Alert_System</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-400">
              <div className="w-5 h-5"><Icon /></div>
              <span className="text-[12px] font-bold uppercase tracking-wide">Validation: Success protocol initiated. Registry updated.</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700 dark:text-red-400">
              <div className="w-5 h-5"><Icon /></div>
              <span className="text-[12px] font-bold uppercase tracking-wide">Security: Unexpected manifest collision detected.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Playground;
