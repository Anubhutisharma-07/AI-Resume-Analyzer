import React from 'react';
import { CandidateSkillGapOptimizer } from '../components/skills/CandidateSkillGapOptimizer';

export const SkillGapPageView: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
            <CandidateSkillGapOptimizer />
        </div>
    );
};

export default SkillGapPageView;
