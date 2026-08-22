import React from 'react';
import type { ResumeVersionRecord } from './types';

interface VersionCardProps {
  version: ResumeVersionRecord;
  onSelect: (version: ResumeVersionRecord) => void;
}

export const VersionCard: React.FC<VersionCardProps> = ({ version, onSelect }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition flex flex-col justify-between space-y-4 shadow-xl">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-blue-400">
            {version.versionNumber}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ATS Score: {version.atsScore}/100
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{version.label}</h3>
        <p className="text-xs text-slate-400 font-mono">Created by: {version.author}</p>
        <p className="text-xs text-slate-400 font-mono mt-1">Committed: {version.createdAt}</p>
      </div>

      <button
        onClick={() => onSelect(version)}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg"
      >
        Inspect Section Diffs & Revisions
      </button>
    </div>
  );
};
