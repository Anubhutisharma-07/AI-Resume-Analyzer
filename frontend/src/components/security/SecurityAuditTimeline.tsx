import React from 'react';
import type { SecurityAuditLog } from './types';

interface SecurityAuditTimelineProps {
  logs: SecurityAuditLog[];
}

export const SecurityAuditTimeline: React.FC<SecurityAuditTimelineProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        Zero-Trust Vault Audit Telemetry Log
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
              <span className="text-red-400 font-bold">Severity: {log.severity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
