import { AtsCandidateAnalyticsReport, AtsAnalyticsFilterQuery, AtsAnalyticsAuditLog } from './types';

export class AtsScoringAnalyticsEngine {
  private static mockReports: AtsCandidateAnalyticsReport[] = [
    {
      reportId: 'ATS-8001',
      candidateName: 'Samantha Reed',
      targetRoleTitle: 'Senior Cloud Solutions Architect',
      overallAtsScore: 91,
      scoringTier: 'SENIOR',
      passProbabilityPercent: 95,
      categoryBreakdown: [
        {
          categoryName: 'KEYWORD_MATCH',
          score: 88,
          weightPercentage: 35,
          status: 'EXCELLENT',
          recommendations: ['Add explicit Kubernetes ingress controller keywords.'],
        },
        {
          categoryName: 'FORMATTING_PARSING',
          score: 96,
          weightPercentage: 25,
          status: 'EXCELLENT',
          recommendations: ['Font hierarchy and section tags fully compliant.'],
        },
        {
          categoryName: 'QUANTIFIED_IMPACT',
          score: 90,
          weightPercentage: 20,
          status: 'EXCELLENT',
          recommendations: ['Quantified cloud cost optimization metrics included.'],
        },
      ],
      detectedSkillsCount: 24,
      missingCriticalKeywords: ['Terraform Cloud', 'FinOps', 'AWS Transit Gateway'],
      createdAt: '2026-08-21 16:00:00',
      lastEvaluatedAt: '2026-08-22 06:15:00',
    },
    {
      reportId: 'ATS-8002',
      candidateName: 'David Chen',
      targetRoleTitle: 'Staff Backend Software Engineer',
      overallAtsScore: 76,
      scoringTier: 'MID_LEVEL',
      passProbabilityPercent: 78,
      categoryBreakdown: [
        {
          categoryName: 'KEYWORD_MATCH',
          score: 70,
          weightPercentage: 35,
          status: 'NEEDS_IMPROVEMENT',
          recommendations: ['Missing distributed caching (Redis, Memcached) terminology.'],
        },
        {
          categoryName: 'FORMATTING_PARSING',
          score: 92,
          weightPercentage: 25,
          status: 'EXCELLENT',
          recommendations: ['Clean single-column layout.'],
        },
      ],
      detectedSkillsCount: 16,
      missingCriticalKeywords: ['gRPC', 'PostgreSQL Index Tuning', 'Distributed Locking'],
      createdAt: '2026-08-22 02:00:00',
      lastEvaluatedAt: '2026-08-22 06:10:00',
    },
  ];

  private static mockAuditLogs: AtsAnalyticsAuditLog[] = [
    {
      logId: 'ATS-LOG-1',
      timestamp: '2026-08-22 06:15:10',
      eventType: 'SCORE_RECALCULATED',
      details: 'Recalculated ATS keyword match matrix against 2026 enterprise cloud role benchmarks.',
      performer: 'ATS Analytics Service',
    },
  ];

  public static getReports(filters: AtsAnalyticsFilterQuery): AtsCandidateAnalyticsReport[] {
    return this.mockReports.filter((item) => {
      if (filters.scoringTier && filters.scoringTier !== 'All' && item.scoringTier !== filters.scoringTier) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = item.candidateName.toLowerCase().includes(q);
        const matchesRole = item.targetRoleTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesRole) return false;
      }
      return true;
    });
  }

  public static getAuditLogs(): AtsAnalyticsAuditLog[] {
    return [...this.mockAuditLogs];
  }
}
