/**
 * Resume Upload & Validation Service Engine
 * File format checkers, MIME-type validators, file size threshold guards, and mock upload progress simulators.
 */

export interface UploadedFileSummary {
    fileName: string;
    fileSizeBytes: number;
    formattedSize: string;
    fileExtension: 'pdf' | 'docx' | 'txt';
    uploadProgressPercent: number;
    status: 'uploading' | 'completed' | 'error';
    errorMessage?: string;
}

export const MAX_ALLOWED_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'docx', 'txt'];

export const validateResumeFile = (file: { name: string; size: number }): { isValid: boolean; error?: string } => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
        return {
            isValid: false,
            error: "Unsupported file format. Please upload a PDF, DOCX, or TXT document."
        };
    }

    if (file.size > MAX_ALLOWED_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            error: `File size exceeds max 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
        };
    }

    return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
