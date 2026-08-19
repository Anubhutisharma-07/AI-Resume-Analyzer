/**
 * Skill Gap Analysis & Partial-Credit Proximity Engine
 * Taxonomy dictionary, semantic proximity scoring matrix, and recommendation generators.
 */

export interface SkillMatchItem {
    skillName: string;
    category: 'cloud' | 'backend' | 'frontend' | 'devops' | 'ai_ml';
    requiredLevel: 'Expert' | 'Intermediate' | 'Basic';
    matchStatus: 'exact_match' | 'partial_match' | 'missing';
    proximityScorePercent: number; // e.g. 75% for Docker vs Kubernetes
    matchedCandidateSkill?: string;
    suggestionNote: string;
    atsKeywordWeight: number;
}

export interface SkillGapAnalysisReport {
    targetJobTitle: string;
    overallAtsScore: number;
    exactMatchCount: number;
    partialMatchCount: number;
    missingCount: number;
    skills: SkillMatchItem[];
}

export const SAMPLE_SKILL_GAP_REPORT: SkillGapAnalysisReport = {
    targetJobTitle: "Senior Full Stack Cloud Engineer",
    overallAtsScore: 78,
    exactMatchCount: 5,
    partialMatchCount: 3,
    missingCount: 2,
    skills: [
        {
            skillName: "Kubernetes Container Orchestration",
            category: "devops",
            requiredLevel: "Expert",
            matchStatus: "partial_match",
            proximityScorePercent: 80,
            matchedCandidateSkill: "Docker Containerization & Compose",
            suggestionNote: "You have strong Docker skills. Mentioning basic Helm charts or Minikube experience can bridge this 80% partial match.",
            atsKeywordWeight: 15
        },
        {
            skillName: "TypeScript / React Next.js",
            category: "frontend",
            requiredLevel: "Expert",
            matchStatus: "exact_match",
            proximityScorePercent: 100,
            matchedCandidateSkill: "TypeScript & React.js",
            suggestionNote: "Exact keyword alignment detected by Workday ATS parser.",
            atsKeywordWeight: 20
        },
        {
            skillName: "PostgreSQL Database Tuning",
            category: "backend",
            requiredLevel: "Intermediate",
            matchStatus: "partial_match",
            proximityScorePercent: 75,
            matchedCandidateSkill: "MySQL Relational Queries",
            suggestionNote: "SQL query optimization is highly transferable. Add indexing or EXPLAIN ANALYZE examples to gain full credit.",
            atsKeywordWeight: 12
        },
        {
            skillName: "AWS Cloud Infrastructure (S3/EC2/Lambda)",
            category: "cloud",
            requiredLevel: "Expert",
            matchStatus: "exact_match",
            proximityScorePercent: 100,
            matchedCandidateSkill: "AWS Solutions Architect Certified",
            suggestionNote: "Strong keyword match across cloud hosting requirements.",
            atsKeywordWeight: 25
        },
        {
            skillName: "GraphQL API Subscriptions",
            category: "backend",
            requiredLevel: "Intermediate",
            matchStatus: "missing",
            proximityScorePercent: 0,
            suggestionNote: "Missing critical keyword. Consider adding REST API to GraphQL migration experience if applicable.",
            atsKeywordWeight: 10
        },
        {
            skillName: "PyTorch Deep Learning",
            category: "ai_ml",
            requiredLevel: "Basic",
            matchStatus: "partial_match",
            proximityScorePercent: 60,
            matchedCandidateSkill: "Scikit-Learn Data Analysis",
            suggestionNote: "Python data science background gives 60% partial credit. Mention LLM fine-tuning or API integrations.",
            atsKeywordWeight: 8
        }
    ]
};

export const calculateSkillMatchStats = (report: SkillGapAnalysisReport) => {
    const totalWeight = report.skills.reduce((sum, s) => sum + s.atsKeywordWeight, 0);
    const earnedWeight = report.skills.reduce((sum, s) => {
        return sum + (s.atsKeywordWeight * (s.proximityScorePercent / 100));
    }, 0);

    const calculatedScore = Math.round((earnedWeight / totalWeight) * 100);
    return { calculatedScore, totalWeight, earnedWeight };
};
