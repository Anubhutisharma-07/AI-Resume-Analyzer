import type { ResumeVersionRecord, VersionFilterQuery, VersionAuditTimelineLog } from './types';

export class ResumeVersioningEngine {
  private static mockVersions: ResumeVersionRecord[] = [
    {
      versionId: 'VER-1001',
      versionNumber: 'v1.0.0',
      label: 'Initial Master Baseline',
      atsScore: 72,
      createdAt: '2026-08-20 10:00:00',
      author: 'Alexander Wright',
      sectionDiffs: [
        {
          sectionName: 'Summary Statement',
          originalText: 'Experienced software engineer with knowledge of web development.',
          revisedText: 'Senior Full-Stack Architect with 8+ years specializing in distributed React/Node microservices and high-throughput cloud infrastructure.',
          changeType: 'MODIFIED',
        },
      ],
    },
    {
      versionId: 'VER-1002',
      versionNumber: 'v1.1.0',
      label: 'FinTech Target Tailored',
      atsScore: 89,
      createdAt: '2026-08-22 04:15:00',
      author: 'AI Tailor Engine',
      sectionDiffs: [
        {
          sectionName: 'Technical Skills & Keywords',
          originalText: 'JavaScript, HTML, CSS, React, SQL',
          revisedText: 'TypeScript, React 18, Node.js, Kafka, PostgreSQL, Docker, Kubernetes, AWS (S3, Lambda, EC2), PCI-DSS Compliance',
          changeType: 'ADDED',
        },
      ],
    },
  ];

  private static mockLogs: VersionAuditTimelineLog[] = [
    {
      logId: 'VER-LOG-01',
      timestamp: '2026-08-22 04:15:05',
      action: 'VERSION_COMMITTED',
      details: 'Committed v1.1.0 tailored version for FinTech Senior Architect role.',
      performer: 'AI Tailor Engine',
      scoreDelta: '+17 pts gain',
    },
  ];

  public static getVersions(filters: VersionFilterQuery): ResumeVersionRecord[] {
    return this.mockVersions.filter((v) => {
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesLabel = v.label.toLowerCase().includes(q);
        const matchesVer = v.versionNumber.toLowerCase().includes(q);
        if (!matchesLabel && !matchesVer) return false;
      }
      return true;
    });
  }

  public static getAuditLogs(): VersionAuditTimelineLog[] {
    return [...this.mockLogs];
  }
}
