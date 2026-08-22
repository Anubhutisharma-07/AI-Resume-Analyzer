import React from 'react';
import type { SecurityPolicyRecord } from './types';

interface SecurityVaultCardProps {
  policy: SecurityPolicyRecord;
  onSelect: (policy: SecurityPolicyRecord) => void;
}

export const SecurityVaultCard: React.FC<SecurityVaultCardProps> = ({ policy, onSelect }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-6 transition flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            {policy.policyId}
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
            {policy.enforcementLevel}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{policy.title}</h3>
        <p className="text-xs text-slate-400 font-mono">Framework: {policy.complianceFramework}</p>
        <p className="text-xs text-slate-400 font-mono mt-1">Algorithm: {policy.encryptionAlgorithm}</p>
      </div>
      <button
        onClick={() => onSelect(policy)}
        className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-bold text-xs rounded-xl border border-red-500/30 transition"
      >
        View Policy Protocol Details
      </button>
    </div>
  );
};
