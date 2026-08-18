export interface SkillMatchDetail {
  name: string;
  category: string;
  matchType: string;
  matched: boolean;
}

export interface AtsCheckItem {
  title: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  detail: string;
}

export interface RecommendationItem {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  detail: string;
}

export interface ScoreExplainability {
  summaryNarrative: string;
  pros: string[];
  cons: string[];
}

export interface SectionImprovement {
  section: string;
  currentText: string;
  suggestedRewrite: string;
}

export interface AnalysisResponse {
  overallScore: number;
  scoreTier: string;
  atsScore: number;
  skillScore: number;
  keywordScore: number;
  experienceScore: number;
  projectScore: number;
  qualityScore: number;
  matchedSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  highValueKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  atsChecks: AtsCheckItem[];
  recommendations: RecommendationItem[];
  explainability: ScoreExplainability;
  sectionImprovements: SectionImprovement[];
}

export interface SampleJob {
  title: string;
  company: string;
  description: string;
}

export interface SampleResume {
  title: string;
  text: string;
}

export interface SamplesResponse {
  jobDescriptions: SampleJob[];
  resumes: SampleResume[];
}
