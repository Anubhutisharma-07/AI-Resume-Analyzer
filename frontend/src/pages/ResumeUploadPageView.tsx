import React from 'react';
import { ResumeDropzone } from '../components/upload/ResumeDropzone';

export const ResumeUploadPageView: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
            <ResumeDropzone />
        </div>
    );
};

export default ResumeUploadPageView;
