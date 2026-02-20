
import React, { useMemo, useState, useEffect } from 'react';
import { IconData, Weighting, IconTransform } from '../types';
import { getStrokeWidth, getTransformStyle } from '../utils/svg';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface PlaygroundProps {
  icon: IconData | null;
  weighting: Weighting;
  transform: IconTransform;
  customFillColor: string;
}

/**
 * Sandbox previewing the active icon in various UI contexts
 * using shadcn/ui components with interactive state.
 */
const Playground: React.FC<PlaygroundProps> = ({ icon, weighting, transform, customFillColor }) => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [metricValue, setMetricValue] = useState(98.4);

  const sw = getStrokeWidth(weighting);
  const transformStyle = getTransformStyle(transform);

  // Simulate live metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricValue(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /** Renders a consistent SVG for the current icon */
  const IconPreview = useMemo(() => {
    if (!icon) return null;
    return (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill={customFillColor === 'currentColor' || customFillColor === 'none' ? 'none' : customFillColor}
        stroke={customFillColor === 'none' ? 'currentColor' : (customFillColor === 'currentColor' ? 'currentColor' : customFillColor)}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={transformStyle}
      >
        <path d={icon.svgPath} />
      </svg>
    );
  }, [icon, customFillColor, sw, transformStyle]);

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length === 0) setStatus('idle');
    else if (val.length > 5) setStatus('success');
    else setStatus('error');
  };

  if (!icon) {
    return (
      <div className="flex h-full items-center justify-center opacity-20 select-none">
        <span className="text-xl font-bold uppercase tracking-[0.3em]">Select_Asset_For_Preview</span>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-12 max-w-6xl mx-auto">
      <div className="border-b pb-6 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em] opacity-30 mb-1">
            Sandbox Environment
          </h2>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            {icon.name}<span className="text-primary">.context</span>
          </h1>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] uppercase border-2 animate-pulse">
          Live_State: Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Navigation Context */}
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Sidebar_Navigation</p>
          <div className="flex flex-col rounded-xl border bg-card p-2 shadow-sm overflow-hidden font-mono">
            {['Dashboard', 'Analytics', 'Settings', 'Team'].map((label) => (
              <div
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${activeNav === label ? 'bg-primary text-primary-foreground translate-x-1' : 'hover:bg-muted/50'
                  }`}
              >
                <div className={activeNav === label ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {IconPreview}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Contexts */}
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Action_States</p>
          <div className="grid grid-cols-1 gap-3">
            <Button
              size="lg"
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full gap-3 font-black uppercase tracking-widest h-14 relative overflow-hidden group"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="group-hover:rotate-12 transition-transform">{IconPreview}</div>
                  Execute Task
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="w-full gap-3 font-black uppercase tracking-widest h-14 border-2">
              {IconPreview}
              Configure Settings
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1 h-12 uppercase font-bold text-[10px]">
                {IconPreview}
                Save
              </Button>
              <Button variant="destructive" className="flex-1 h-12 uppercase font-bold text-[10px]">
                {IconPreview}
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Form Context */}
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Input_Decoration</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Search Terminal</label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${status === 'success' ? 'text-green-500' :
                    status === 'error' ? 'text-destructive' :
                      'text-muted-foreground group-focus-within:text-primary'
                  }`}>
                  {IconPreview}
                </div>
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="QUERY_SYSTEM_ASSETS..."
                  className={`pl-12 h-12 bg-muted/30 border-2 font-mono text-xs focus-visible:ring-offset-0 transition-all ${status === 'success' ? 'border-green-500/50' :
                      status === 'error' ? 'border-destructive/50' :
                        'focus-visible:ring-primary'
                    }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {status === 'success' && <Check className="h-4 w-4 text-green-500 animate-in fade-in zoom-in" />}
                  {status === 'error' && <AlertCircle className="h-4 w-4 text-destructive animate-in fade-in zoom-in" />}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed bg-muted/10 opacity-60 hover:opacity-100 hover:bg-muted/20 transition-all cursor-pointer group">
              <div className="p-2 bg-background rounded border group-hover:border-primary group-hover:scale-110 transition-all">
                {IconPreview}
              </div>
              <span className="text-[10px] font-mono leading-none">Drop asset to upload</span>
            </div>
          </div>
        </div>

        {/* Dashboard Stat */}
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Metric_Display</p>
          <div className="p-6 rounded-2xl border bg-card shadow-lg relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] group-hover:scale-110 transition-transform duration-500 scale-150 rotate-12">
              <svg
                viewBox="0 0 24 24"
                width="120"
                height="120"
                fill="currentColor"
                stroke="none"
              >
                <path d={icon.svgPath} />
              </svg>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20 group-hover:animate-pulse">
                {IconPreview}
              </div>
              <span className="text-xs font-black uppercase tracking-widest opacity-40">System_Health</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black font-mono tracking-tighter tabular-nums">
                {metricValue}<span className="text-primary text-xl ml-1">%</span>
              </div>
              <p className="text-[10px] font-bold uppercase opacity-50">Operational_Status</p>
            </div>
          </div>
        </div>

        {/* Tabs and Badges */}
        <div className="space-y-6 lg:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Utility_Components</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="all" className="flex-1 gap-2 text-[10px] font-black uppercase">
                    {IconPreview}
                    All
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex-1 gap-2 text-[10px] font-black uppercase">
                    {IconPreview}
                    Recent
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1.5 py-1.5 px-3 uppercase font-black text-[9px] tracking-tighter hover:scale-105 transition-transform cursor-default">
                  {IconPreview}
                  Active
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 uppercase font-black text-[9px] tracking-tighter hover:scale-105 transition-transform cursor-default">
                  {IconPreview}
                  Pending
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3 uppercase font-black text-[9px] tracking-tighter border-2 hover:scale-105 transition-transform cursor-default">
                  {IconPreview}
                  Archived
                </Badge>
              </div>
            </div>

            <Alert className="border-2 shadow-sm rounded-xl overflow-hidden group">
              <div className="flex gap-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg h-fit group-hover:scale-110 transition-transform">
                  {IconPreview}
                </div>
                <div>
                  <AlertTitle className="text-xs font-black uppercase tracking-wider mb-1">Attention Required</AlertTitle>
                  <AlertDescription className="text-[10px] font-mono opacity-60 leading-relaxed">
                    CRITICAL_PROCESS_INTERRUPTION: Check terminal logs for detailed icon-system status.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        </div>

        {/* Table Row Mockup */}
        <div className="col-span-full space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">List_Action_Context</p>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 uppercase opacity-40">Name</th>
                  <th className="px-6 py-4 uppercase opacity-40">Status</th>
                  <th className="px-6 py-4 uppercase opacity-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2].map((i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors group/row">
                    <td className="px-6 py-4 font-bold uppercase tracking-tight">Resource_{i}.pkg</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="uppercase font-bold text-[10px]">Active</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary hover:text-white transition-all">
                          {IconPreview}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-40 hover:opacity-100">
                          {IconPreview}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Playground);

