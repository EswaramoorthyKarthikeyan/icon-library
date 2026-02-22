
import React, { useCallback, useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { IconData } from '../types';
import { validateIconName, ValidationResult } from '../utils/validation';

interface ImportZoneProps {
    onImport: (icon: IconData) => void;
    existingIcons?: IconData[];
    className?: string;
}

const ImportZone: React.FC<ImportZoneProps> = ({ onImport, existingIcons = [], className }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [pendingIcon, setPendingIcon] = useState<{ icon: IconData; validation: ValidationResult } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        if (file.type !== 'image/svg+xml') {
            alert('Please upload a valid SVG file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'image/svg+xml');
            const path = doc.querySelector('path');
            
            if (!path) {
                alert('No path data found in SVG. Only path-based SVGs are supported currently.');
                return;
            }

            const d = path.getAttribute('d');
            if (!d) {
                alert('Empty path data in SVG.');
                return;
            }

            const rawName = file.name.replace('.svg', '');
            const existingNames = existingIcons.map(i => i.name);
            const validation = validateIconName(rawName, existingNames);

            const newIcon: IconData = {
                id: `custom-${Date.now()}`,
                name: rawName,
                category: 'Imported',
                svgPath: d
            };

            if (validation.isValid) {
                onImport(newIcon);
                setPendingIcon(null);
            } else {
                setPendingIcon({ icon: newIcon, validation });
            }
        };
        reader.readAsText(file);
    };

    const handleApplyFix = () => {
        if (pendingIcon?.validation.suggestion) {
            const fixedIcon = { 
                ...pendingIcon.icon, 
                name: pendingIcon.validation.suggestion 
            };
            onImport(fixedIcon);
            setPendingIcon(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [existingIcons]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    if (pendingIcon) {
        return (
            <div className={`p-4 rounded-xl bg-accent/5 lg:bg-accent/10 border border-primary/20 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-destructive">Naming Warning</p>
                        <p className="text-[10px] opacity-60 truncate max-w-[150px]">{pendingIcon.icon.name}</p>
                    </div>
                </div>

                <div className="bg-destructive/5 rounded-md p-2 mb-4">
                    <p className="text-[10px] leading-relaxed font-medium text-destructive/80">
                        {pendingIcon.validation.error}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {pendingIcon.validation.suggestion && (
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full text-[10px] font-bold h-8 uppercase tracking-widest gap-2"
                            onClick={handleApplyFix}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Use: {pendingIcon.validation.suggestion}
                        </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-[10px] font-bold h-8 uppercase tracking-widest text-muted-foreground"
                        onClick={() => setPendingIcon(null)}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
            } ${className}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".svg" 
                onChange={handleFileChange}
            />
            
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-6 w-6 text-primary" />
            </div>
            
            <div className="text-center">
                <p className="text-sm font-medium">Drop SVG here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>

            <Button 
                variant="ghost" 
                size="sm"
                className="absolute inset-0 w-full h-full hover:bg-transparent"
                onClick={() => fileInputRef.current?.click()}
            />
        </div>
    );
};

export default ImportZone;
