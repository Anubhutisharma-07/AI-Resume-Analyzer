import React, { useState } from 'react';
import { AtsCandidateAnalyticsReport } from './types';
import { AtsScoringAnalyticsEngine } from './AtsScoringAnalyticsEngine';
import { AtsReportCard } from './AtsReportCard';
import { AtsAnalyticsAuditTimeline } from './AtsAnalyticsAuditTimeline';

export const EnterpriseAtsScoringAnalyticsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<AtsCandidateAnalyticsReport | null>(null);
  const reports = AtsScoringAnalyticsEngine.getReports({});
  const auditLogs = AtsScoringAnalyticsEngine.getAuditLogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Enterprise ATS Scoring & Analytics Suite</h1>
        <p className="text-xs text-slate-400 mt-1">Deep keyword match matrix, formatting compliance, and pass probability analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <AtsReportCard key={report.reportId} report={report} onSelect={(r) => setSelectedReport(r)} />
        ))}
      </div>

      {selectedReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{selectedReport.candidateName} Category Breakdown</h2>
          {selectedReport.categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-blue-400">
                <span>{cat.categoryName}</span>
                <span>{cat.score} / 100</span>
              </div>
              <p className="text-slate-300">{cat.recommendations[0]}</p>
            </div>
          ))}
        </div>
      )}

      <AtsAnalyticsAuditTimeline logs={auditLogs} />
    </div>
  );
};
