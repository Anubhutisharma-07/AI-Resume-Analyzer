export type ScoringTier = 'EXECUTIVE' | 'SENIOR' | 'MID_LEVEL' | 'ENTRY_LEVEL';

export interface AtsCategoryScore {
  categoryName: 'KEYWORD_MATCH' | 'FORMATTING_PARSING' | 'QUANTIFIED_IMPACT' | 'SECTION_COMPLETON' | 'BREVITY';
  score: number;
  weightPercentage: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  recommendations: string[];
}

export interface AtsCandidateAnalyticsReport {
  reportId: string;
  candidateName: string;
  targetRoleTitle: string;
  overallAtsScore: number;
  scoringTier: ScoringTier;
  passProbabilityPercent: number;
  categoryBreakdown: AtsCategoryScore[];
  detectedSkillsCount: number;
  missingCriticalKeywords: string[];
  createdAt: string;
  lastEvaluatedAt: string;
}

export interface AtsAnalyticsFilterQuery {
  scoringTier?: string;
  search?: string;
}

export interface AtsAnalyticsAuditLog {
  logId: string;
  timestamp: string;
  eventType: 'SCORE_RECALCULATED' | 'KEYWORD_MATRIX_UPDATED' | 'REPORT_EXPORTED';
  details: string;
  performer: string;
}
