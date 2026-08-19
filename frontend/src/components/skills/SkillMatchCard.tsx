import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Lightbulb } from 'lucide-react';
import { SkillMatchItem } from '../../services/skillGapEngine';

interface SkillMatchCardProps {
    item: SkillMatchItem;
}

export const SkillMatchCard: React.FC<SkillMatchCardProps> = ({ item }) => {
    const statusConfig = {
        exact_match: {
            badge: "Exact Match",
            badgeStyle: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            icon: CheckCircle2,
            barColor: "#10b981"
        },
        partial_match: {
            badge: `${item.proximityScorePercent}% Partial Credit`,
            badgeStyle: "bg-amber-500/10 border-amber-500/30 text-amber-400",
            icon: AlertTriangle,
            barColor: "#f59e0b"
        },
        missing: {
            badge: "Missing Keyword",
            badgeStyle: "bg-rose-500/10 border-rose-500/30 text-rose-400",
            icon: XCircle,
            barColor: "#f43f5e"
        }
    }[item.matchStatus];

    const Icon = statusConfig.icon;

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 flex-shrink-0" style={{ color: statusConfig.barColor }} />
                    <h3 className="text-sm font-bold text-slate-100">{item.skillName}</h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Weight: {item.atsKeywordWeight}pts</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeStyle}`}>
                        {statusConfig.badge}
                    </span>
                </div>
            </div>

            {/* Proximity Meter */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>ATS Semantic Proximity:</span>
                    <span style={{ color: statusConfig.barColor }} className="font-bold">{item.proximityScorePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ width: `${item.proximityScorePercent}%`, backgroundColor: statusConfig.barColor }}
                    />
                </div>
            </div>

            {/* Candidate Existing Skill vs Suggestion */}
            {item.matchedCandidateSkill && (
                <p className="text-xs text-slate-300 font-medium">
                    <span className="text-slate-500">Your Resume Mention:</span> "{item.matchedCandidateSkill}"
                </p>
            )}

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{item.suggestionNote}</span>
            </div>
        </div>
    );
};
