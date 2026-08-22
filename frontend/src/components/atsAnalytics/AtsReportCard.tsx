import React from 'react';
import { AtsCandidateAnalyticsReport } from './types';

interface AtsCardProps {
  report: AtsCandidateAnalyticsReport;
  onSelect: (report: AtsCandidateAnalyticsReport) => void;
}

export const AtsReportCard: React.FC<AtsCardProps> = ({ report, onSelect }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {report.reportId}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Pass Probability: {report.passProbabilityPercent}%
          </span>
        </div>

        <h3 className="text-xl font-black text-white mb-1">{report.candidateName}</h3>
        <p className="text-xs text-slate-400 mb-4">{report.targetRoleTitle}</p>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 mb-5 flex justify-between items-center">
          <span className="text-xs text-slate-400">Overall Score</span>
          <span className="text-2xl font-black text-blue-400">{report.overallAtsScore} / 100</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(report)}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <span>View Full ATS Analytics Breakdown</span>
      </button>
    </div>
  );
};
