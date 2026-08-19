import React, { useState } from 'react';
import { 
    Target, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    Filter, 
    PieChart 
} from 'lucide-react';
import { 
    SAMPLE_SKILL_GAP_REPORT, 
    SkillGapAnalysisReport, 
    calculateSkillMatchStats 
} from '../../services/skillGapEngine';
import { SkillMatchCard } from './SkillMatchCard';

export const CandidateSkillGapOptimizer: React.FC = () => {
    const [report, setReport] = useState<SkillGapAnalysisReport>(SAMPLE_SKILL_GAP_REPORT);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const stats = calculateSkillMatchStats(report);

    const filteredSkills = report.skills.filter(s => {
        if (filterCategory === 'all') return true;
        return s.matchStatus === filterCategory;
    });

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Target className="w-4 h-4" /> ATS Skill Proximity Optimizer
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">{report.targetJobTitle}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Overall Match Score</span>
                            <span className="text-3xl font-black text-emerald-400">{stats.calculatedScore}%</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            type="button"
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            All ({report.skills.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('exact_match')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterCategory === 'exact_match' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Exact ({report.exactMatchCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('partial_match')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterCategory === 'partial_match' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Partial ({report.partialMatchCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('missing')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterCategory === 'missing' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Missing ({report.missingCount})
                        </button>
                    </div>

                    <span className="text-xs text-slate-400">
                        Partial match credit boosts ATS rank by <strong className="text-amber-400">+18%</strong>
                    </span>
                </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
                {filteredSkills.map((item, idx) => (
                    <SkillMatchCard key={idx} item={item} />
                ))}
            </div>
        </div>
    );
};
