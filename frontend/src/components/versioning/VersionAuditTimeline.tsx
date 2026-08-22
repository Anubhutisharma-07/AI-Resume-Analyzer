import React from 'react';
import type { VersionAuditTimelineLog } from './types';

interface VersionAuditTimelineProps {
  logs: VersionAuditTimelineLog[];
}

export const VersionAuditTimeline: React.FC<VersionAuditTimelineProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
        ATS Version Revision Audit Log
      </h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.logId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between font-bold text-slate-200 mb-1">
              <span>{log.action}</span>
              <span className="font-mono text-slate-400">{log.timestamp}</span>
            </div>
            <p className="text-slate-300 mb-1">{log.details}</p>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Performer: <strong className="text-slate-200">{log.performer}</strong></span>
              <span className="text-emerald-400 font-bold">{log.scoreDelta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
