import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PencilLine, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getAnnotations, saveAnnotation } from '../hooks/useAutoSave';

interface IconAnnotationsProps {
  iconId: string;
}

const IconAnnotations: React.FC<IconAnnotationsProps> = ({ iconId }) => {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load annotation on mount or when iconId changes
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setHasLoaded(false);
      const annotations = await getAnnotations();
      const current = annotations.find(a => a.id === iconId);
      if (mounted) {
        setText(current ? current.text : '');
        setHasLoaded(true);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [iconId]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await saveAnnotation(iconId, text);
    window.dispatchEvent(new CustomEvent('icon-annotation-updated'));
    setIsSaving(false);
    setIsEditing(false);
  }, [iconId, text]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);


  if (!hasLoaded) {
    return (
      <div className="w-full mt-4 flex items-center justify-center p-4 border border-dashed rounded-lg opacity-50">
        <span className="text-[10px] font-mono uppercase">Loading Notes...</span>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 text-left">
      <div className="flex items-center justify-between mb-2">
         <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50 flex items-center gap-1.5">
           <PencilLine className="h-3 w-3" />
           Design Notes
         </p>
         {!isEditing && text && (
           <Button 
             variant="ghost" 
             size="sm" 
             className="h-5 text-[9px] uppercase px-2"
             onClick={() => setIsEditing(true)}
           >
             Edit
           </Button>
         )}
      </div>

      {isEditing || !text ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            placeholder="Add context, usage guidelines, or warnings for this icon..."
            className="w-full min-h-[100px] bg-muted/30 border rounded-lg p-3 text-sm resize-y focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
          />
          {isSaving && (
            <div aria-live="polite" className="absolute bottom-3 right-3 flex items-center gap-1 text-[9px] uppercase font-bold text-green-500 opacity-80">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="w-full min-h-[60px] bg-muted/20 border border-transparent hover:border-border hover:bg-muted/30 rounded-lg p-3 text-sm cursor-text transition-all group"
        >
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(IconAnnotations);
