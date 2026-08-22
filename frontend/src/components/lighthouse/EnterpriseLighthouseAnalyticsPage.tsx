import React, { useState } from 'react';
import { LighthouseReportSuite } from './types';
import { LighthouseAnalyticsEngine } from './LighthouseAnalyticsEngine';
import { LighthouseReportCard } from './LighthouseReportCard';
import { LighthouseAuditTimeline } from './LighthouseAuditTimeline';

export const EnterpriseLighthouseAnalyticsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<LighthouseReportSuite | null>(null);
  const reports = LighthouseAnalyticsEngine.getReports({});
  const auditLogs = LighthouseAnalyticsEngine.getAuditLogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Enterprise Lighthouse CI & Accessibility Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time web performance, WCAG AAA accessibility, and SEO audit suite.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <LighthouseReportCard key={report.reportId} report={report} onSelect={(r) => setSelectedReport(r)} />
        ))}
      </div>

      {selectedReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Lighthouse Metrics for {selectedReport.targetPageUrl}</h2>
          {selectedReport.auditMetrics.map((m, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-emerald-400">
                <span>{m.title} [{m.type}]</span>
                <span>Score: {m.score}/100</span>
              </div>
              <p className="text-slate-300">{m.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      <LighthouseAuditTimeline logs={auditLogs} />
    </div>
  );
};
