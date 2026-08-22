import { LighthouseReportSuite, LighthouseFilterQuery, LighthouseAuditTimelineLog } from './types';

export class LighthouseAnalyticsEngine {
  private static mockReports: LighthouseReportSuite[] = [
    {
      reportId: 'LH-9001',
      targetPageUrl: '/landing',
      overallScore: 98,
      performanceScore: 96,
      accessibilityScore: 100,
      bestPracticesScore: 98,
      seoScore: 100,
      pwaScore: 95,
      evaluatedAt: '2026-08-22 06:18:00',
      auditMetrics: [
        {
          metricId: 'LH-M1',
          title: 'Image Alt Tags & ARIA Labels',
          type: 'ACCESSIBILITY',
          score: 100,
          weight: 0.3,
          status: 'PASSED',
          recommendation: 'All <img> and interactive SVG elements contain accessible labels.',
          documentationUrl: 'https://web.dev/aria-labels',
        },
        {
          metricId: 'LH-M2',
          title: 'First Contentful Paint (FCP)',
          type: 'PERFORMANCE',
          score: 96,
          weight: 0.4,
          status: 'PASSED',
          recommendation: 'FCP is 0.8s (Target: < 1.8s).',
          documentationUrl: 'https://web.dev/fcp/',
        },
        {
          metricId: 'LH-M3',
          title: 'Structured OpenGraph & SEO Meta Tags',
          type: 'SEO',
          score: 100,
          weight: 0.3,
          status: 'PASSED',
          recommendation: 'Complete meta title, description, and Twitter card headers.',
          documentationUrl: 'https://web.dev/seo-meta/',
        },
      ],
    },
    {
      reportId: 'LH-9002',
      targetPageUrl: '/benchmarking-dashboard',
      overallScore: 94,
      performanceScore: 92,
      accessibilityScore: 98,
      bestPracticesScore: 95,
      seoScore: 96,
      pwaScore: 90,
      evaluatedAt: '2026-08-22 06:19:30',
      auditMetrics: [
        {
          metricId: 'LH-M4',
          title: 'Color Contrast Ratio',
          type: 'ACCESSIBILITY',
          score: 98,
          weight: 0.3,
          status: 'PASSED',
          recommendation: 'High contrast ratio meets WCAG AAA standards.',
          documentationUrl: 'https://web.dev/color-contrast/',
        },
      ],
    },
  ];

  private static mockAuditLogs: LighthouseAuditTimelineLog[] = [
    {
      logId: 'LH-LOG-101',
      timestamp: '2026-08-22 06:18:22',
      eventType: 'LIGHTHOUSE_CI_VERIFIED',
      details: 'Automated Lighthouse CI runner evaluated pull request against 90+ threshold.',
      performer: 'GitHub Actions (Lighthouse CI)',
      impactScoreGain: 5,
    },
    {
      logId: 'LH-LOG-102',
      timestamp: '2026-08-22 06:19:00',
      eventType: 'ACCESSIBILITY_FIX_APPLIED',
      details: 'Injected missing ARIA attributes and alt descriptions across landing components.',
      performer: 'Lighthouse Auto-Fixer',
      impactScoreGain: 8,
    },
  ];

  public static getReports(filters: LighthouseFilterQuery): LighthouseReportSuite[] {
    return this.mockReports.filter((item) => {
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesUrl = item.targetPageUrl.toLowerCase().includes(q);
        const matchesId = item.reportId.toLowerCase().includes(q);
        if (!matchesUrl && !matchesId) return false;
      }
      return true;
    });
  }

  public static getAuditLogs(): LighthouseAuditTimelineLog[] {
    return [...this.mockAuditLogs];
  }
}
