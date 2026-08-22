import type { SecurityPolicyRecord, SecurityVaultFilterQuery, SecurityAuditLog } from './types';

export class ResumeSecurityVaultEngine {
  private static initialPolicies: SecurityPolicyRecord[] = [
    {
      policyId: 'SEC-POL-9001',
      title: 'PII Redaction & Candidate Anonymization',
      category: 'DATA_PRIVACY',
      enforcementLevel: 'CRITICAL',
      complianceFramework: 'GDPR / CCPA',
      status: 'ACTIVE',
      encryptionAlgorithm: 'AES-256-GCM',
      lastAuditedAt: '2026-08-22 06:10:00',
      protectedFields: ['Phone Number', 'Home Address', 'Social Security / National ID', 'Email Address'],
    },
    {
      policyId: 'SEC-POL-9002',
      title: 'Zero-Knowledge Resume Encryption at Rest',
      category: 'ENCRYPTION',
      enforcementLevel: 'CRITICAL',
      complianceFramework: 'SOC2 Type II',
      status: 'ACTIVE',
      encryptionAlgorithm: 'ChaCha20-Poly1305',
      lastAuditedAt: '2026-08-22 06:12:30',
      protectedFields: ['Full Resume Raw Text', 'Parsed Structural Embeddings', 'Candidate Work History'],
    },
    {
      policyId: 'SEC-POL-9003',
      title: 'Automated Retention & Auto-Purge Protocol',
      category: 'RETENTION',
      enforcementLevel: 'HIGH',
      complianceFramework: 'ISO 27001',
      status: 'PENDING_REVIEW',
      encryptionAlgorithm: 'N/A (Lifecycle Purge)',
      lastAuditedAt: '2026-08-21 14:20:00',
      protectedFields: ['Cached PDF Renders', 'Temporary OCR Text Extracted'],
    },
  ];

  private static initialAuditLogs: SecurityAuditLog[] = [
    {
      logId: 'SEC-LOG-501',
      timestamp: '2026-08-22 06:10:05',
      action: 'PII_REDACTION_ENFORCED',
      details: 'Redacted candidate contact details before dispatching raw text to LLM evaluation service.',
      performer: 'Security Interceptor v3.1',
      severity: 'LOW',
    },
    {
      logId: 'SEC-LOG-502',
      timestamp: '2026-08-22 06:12:40',
      action: 'VAULT_KEY_ROTATED',
      details: 'Automated rotation of KMS encryption keys completed across 3 database clusters.',
      performer: 'KMS Key Manager',
      severity: 'MEDIUM',
    },
  ];

  public static getPolicies(filters: SecurityVaultFilterQuery): SecurityPolicyRecord[] {
    return this.initialPolicies.filter((item) => {
      if (filters.category && filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }
      if (filters.enforcementLevel && filters.enforcementLevel !== 'ALL' && item.enforcementLevel !== filters.enforcementLevel) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesId = item.policyId.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId) return false;
      }
      return true;
    });
  }

  public static getAuditLogs(): SecurityAuditLog[] {
    return [...this.initialAuditLogs];
  }
}
