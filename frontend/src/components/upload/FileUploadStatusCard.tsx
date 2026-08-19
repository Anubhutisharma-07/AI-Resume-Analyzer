import React from 'react';
import { FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { UploadedFileSummary } from '../../services/resumeUploadEngine';

interface FileUploadStatusCardProps {
    fileData: UploadedFileSummary;
    onRemove: () => void;
}

export const FileUploadStatusCard: React.FC<FileUploadStatusCardProps> = ({ fileData, onRemove }) => {
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-100 truncate max-w-[200px]">{fileData.fileName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{fileData.formattedSize}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {fileData.status === 'completed' && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                    )}

                    {fileData.status === 'uploading' && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Uploading {fileData.uploadProgressPercent}%
                        </span>
                    )}

                    <button
                        onClick={onRemove}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-200 rounded-full"
                    style={{ width: `${fileData.uploadProgressPercent}%` }}
                />
            </div>

            {fileData.errorMessage && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-semibold pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fileData.errorMessage}</span>
                </div>
            )}
        </div>
    );
};
