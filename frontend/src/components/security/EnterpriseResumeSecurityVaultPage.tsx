import React, { useState } from 'react';
import type { SecurityPolicyRecord, SecurityVaultFilterQuery } from './types';
import { ResumeSecurityVaultEngine } from './ResumeSecurityVaultEngine';
import { SecurityVaultCard } from './SecurityVaultCard';
import { SecurityAuditTimeline } from './SecurityAuditTimeline';

export const EnterpriseResumeSecurityVaultPage: React.FC = () => {
  const [filters, setFilters] = useState<SecurityVaultFilterQuery>({
    category: 'ALL',
    enforcementLevel: 'ALL',
    search: '',
  });

  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicyRecord | null>(null);
  const policies = ResumeSecurityVaultEngine.getPolicies(filters);
  const auditLogs = ResumeSecurityVaultEngine.getAuditLogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full">
            Zero-Trust Vault System
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Enterprise Security & Compliance Vault</h1>
          <p className="text-xs text-slate-400 mt-1">GDPR, SOC2 Type II, and AES-256 PII Redaction & Data Lifecycle Engine</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Search Policy</label>
          <input
            type="text"
            placeholder="Search title or policy ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            <option value="DATA_PRIVACY">Data Privacy</option>
            <option value="ENCRYPTION">Encryption</option>
            <option value="RETENTION">Retention & Purge</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Enforcement Level</label>
          <select
            value={filters.enforcementLevel}
            onChange={(e) => setFilters({ ...filters, enforcementLevel: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <SecurityVaultCard key={policy.policyId} policy={policy} onSelect={(p) => setSelectedPolicy(p)} />
        ))}
      </div>

      {/* Selected Policy Detail Drawer */}
      {selectedPolicy && (
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white">{selectedPolicy.title} ({selectedPolicy.policyId})</h3>
            <button onClick={() => setSelectedPolicy(null)} className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-300 font-bold">
              Close
            </button>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Protected Candidate Fields</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPolicy.protectedFields.map((f, i) => (
                <span key={i} className="text-xs bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-red-400 font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Timeline */}
      <SecurityAuditTimeline logs={auditLogs} />
    </div>
  );
};
