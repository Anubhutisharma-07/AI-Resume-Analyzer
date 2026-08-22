import React from 'react';
import { AtsAnalyticsAuditLog } from './types';

interface AtsAuditTimelineProps {
  logs: AtsAnalyticsAuditLog[];
}

export const AtsAnalyticsAuditTimeline: React.FC<AtsAuditTimelineProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">ATS Analytics Calculation Audit Logs</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.logId} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between font-bold text-slate-200 mb-1">
              <span>{log.eventType}</span>
              <span className="font-mono text-slate-400">{log.timestamp}</span>
            </div>
            <p className="text-slate-300">{log.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
