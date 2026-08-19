import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import { 
    UploadedFileSummary, 
    validateResumeFile, 
    formatFileSize 
} from '../../services/resumeUploadEngine';
import { FileUploadStatusCard } from './FileUploadStatusCard';

export const ResumeDropzone: React.FC = () => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [activeFile, setActiveFile] = useState<UploadedFileSummary | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileProcess = (file: File) => {
        setValidationError(null);
        const validation = validateResumeFile({ name: file.name, size: file.size });

        if (!validation.isValid) {
            setValidationError(validation.error || "File validation failed.");
            return;
        }

        const ext = (file.name.split('.').pop()?.toLowerCase() || 'pdf') as 'pdf' | 'docx' | 'txt';

        const newFileSummary: UploadedFileSummary = {
            fileName: file.name,
            fileSizeBytes: file.size,
            formattedSize: formatFileSize(file.size),
            fileExtension: ext,
            uploadProgressPercent: 0,
            status: 'uploading'
        };

        setActiveFile(newFileSummary);

        // Simulate Smooth Upload Progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 25;
            if (progress >= 100) {
                clearInterval(interval);
                setActiveFile({
                    ...newFileSummary,
                    uploadProgressPercent: 100,
                    status: 'completed'
                });
            } else {
                setActiveFile(prev => prev ? { ...prev, uploadProgressPercent: progress } : null);
            }
        }, 300);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
                    <UploadCloud className="w-4 h-4" /> Instant ATS Resume Parser
                </div>
                <h2 className="text-2xl font-black text-slate-100">Upload Your Resume</h2>
                <p className="text-xs text-slate-400">Supports PDF, DOCX, or TXT formats (Max size 10MB).</p>
            </div>

            {/* Drag and Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 relative ${
                    isDragging
                        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-sm font-bold text-slate-200">
                    Drag and drop your resume file here, or <span className="text-indigo-400 underline">browse files</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">High-speed OCR & keyword parsing activated automatically.</p>
            </div>

            {validationError && (
                <div className="bg-rose-950/80 border border-rose-500/40 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <span>{validationError}</span>
                </div>
            )}

            {activeFile && (
                <FileUploadStatusCard
                    fileData={activeFile}
                    onRemove={() => setActiveFile(null)}
                />
            )}

            {activeFile?.status === 'completed' && (
                <button
                    type="button"
                    onClick={() => alert("Redirecting to AI Resume Score & ATS Keyword Analysis...")}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <span>Analyze Uploaded Resume Now</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
