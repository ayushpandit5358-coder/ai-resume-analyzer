import type { AnalysisResponse, SkillMatchDetail, AtsCheckItem, RecommendationItem, ScoreExplainability, SectionImprovement } from './types';

const SKILL_TAXONOMY: Record<string, string> = {
  "java": "Languages", "python": "Languages", "javascript": "Languages", "typescript": "Languages", "c++": "Languages", "sql": "Languages", "html": "Languages", "css": "Languages",
  "spring boot": "Frameworks", "react": "Frameworks", "angular": "Frameworks", "vue": "Frameworks", "node.js": "Frameworks", "nodejs": "Frameworks", "express": "Frameworks", "django": "Frameworks", "fastapi": "Frameworks", "next.js": "Frameworks", "tailwind css": "Frameworks",
  "mysql": "Databases", "postgresql": "Databases", "mongodb": "Databases", "redis": "Databases", "oracle": "Databases", "sqlite": "Databases",
  "aws": "Cloud & DevOps", "docker": "Cloud & DevOps", "kubernetes": "Cloud & DevOps", "jenkins": "Cloud & DevOps", "git": "Cloud & DevOps", "ci/cd": "Cloud & DevOps",
  "rest api": "Tools & Concepts", "graphql": "Tools & Concepts", "microservices": "Tools & Concepts", "kafka": "Tools & Concepts", "system design": "Tools & Concepts", "jira": "Tools & Concepts", "unit testing": "Tools & Concepts",
  "machine learning": "AI & Data Science", "deep learning": "AI & Data Science", "tensorflow": "AI & Data Science", "pytorch": "AI & Data Science", "pandas": "AI & Data Science", "scikit-learn": "AI & Data Science"
};

const SYNONYMS: Record<string, string[]> = {
  "rest api": ["restful api", "restful web services", "api design"],
  "spring boot": ["spring framework", "spring mvc"],
  "kubernetes": ["k8s", "container orchestration"],
  "aws": ["amazon web services", "cloud"],
  "machine learning": ["ml", "predictive modeling"],
  "postgresql": ["postgres", "relational database"],
  "mysql": ["relational database", "sql database"],
  "docker": ["containerization", "containers"]
};

export function clientAnalyze(resumeText: string, jobDescription: string): AnalysisResponse {
  const normResume = normalize(resumeText);
  const normJd = normalize(jobDescription);

  // Extract skills from JD
  const jdSkills = new Set<string>();
  Object.keys(SKILL_TAXONOMY).forEach(skill => {
    if (normJd.includes(skill)) jdSkills.add(skill);
  });

  if (jdSkills.size === 0) {
    ["java", "spring boot", "mysql", "rest api", "git", "docker"].forEach(s => jdSkills.add(s));
  }

  const matchedSkills: SkillMatchDetail[] = [];
  const missingSkills: SkillMatchDetail[] = [];

  jdSkills.forEach(skill => {
    const category = SKILL_TAXONOMY[skill] || "General";
    if (isSkillPresent(skill, normResume)) {
      const exact = normResume.includes(skill);
      matchedSkills.push({ name: capitalize(skill), category, matchType: exact ? "Exact Match" : "Related Match", matched: true });
    } else {
      missingSkills.push({ name: capitalize(skill), category, matchType: "Missing from Resume", matched: false });
    }
  });

  // Keywords
  const stopWords = new Set(["with", "that", "this", "from", "have", "were", "will", "your", "their", "about", "which", "would"]);
  const jdTokens = normJd.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const resumeTokens = new Set(normResume.split(/\s+/));

  const highValueKeywords = Array.from(new Set(jdTokens)).sort((a, b) => b.length - a.length).slice(0, 15);
  const matchedKeywords = highValueKeywords.filter(k => resumeTokens.has(k));
  const missingKeywords = highValueKeywords.filter(k => !resumeTokens.has(k));

  // Scores
  const skillScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, jdSkills.size)) * 100));
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / Math.max(1, highValueKeywords.length)) * 100));
  const atsEval = evaluateAtsClient(resumeText, normResume);
  const expScore = evaluateExpClient(normResume);
  const projScore = evaluateProjClient(normResume);
  const qualityScore = evaluateQualityClient(normResume);

  const rawScore = (skillScore * 0.30) + (keywordScore * 0.20) + (expScore * 0.15) + (projScore * 0.10) + (atsEval.score * 0.15) + (qualityScore * 0.10);
  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const tier = getTier(overallScore);

  const recommendations: RecommendationItem[] = [];
  if (missingSkills.length > 0) {
    recommendations.push({
      priority: "HIGH",
      category: "Skills Gap",
      detail: "Add missing job-specific skills if you have relevant experience: " + missingSkills.slice(0, 3).map(s => s.name).join(", ") + "."
    });
  }
  if (missingKeywords.length > 0) {
    recommendations.push({
      priority: "HIGH",
      category: "Keyword Matching",
      detail: "Incorporate key Job Description terms into work descriptions: " + missingKeywords.slice(0, 4).join(", ") + "."
    });
  }
  if (!normResume.includes("%") && !normResume.includes("improved") && !normResume.includes("reduced")) {
    recommendations.push({
      priority: "HIGH",
      category: "Measurable Impact",
      detail: "Transform generic duty descriptions into impact statements with metrics (e.g. 'Reduced latency by 35% using Redis caching')."
    });
  }
  recommendations.push({
    priority: "MEDIUM",
    category: "ATS Optimization",
    detail: "Ensure standard section titles (Skills, Experience, Education) and clear contact details formatting."
  });

  const pros: string[] = [];
  const cons: string[] = [];
  if (matchedSkills.length > 0) pros.push("Matched core technical skills: " + matchedSkills.slice(0, 4).map(s => s.name).join(", "));
  if (matchedKeywords.length > 0) pros.push("Contains domain terms from Job Description (" + matchedKeywords.length + " terms matched)");
  if (atsEval.score >= 75) pros.push("Strong ATS formatting and section header detection");

  if (missingSkills.length > 0) cons.push("Missing required skills: " + missingSkills.slice(0, 4).map(s => s.name).join(", "));
  if (missingKeywords.length > 0) cons.push("Key JD terms missing from bullet points");

  const explainability: ScoreExplainability = {
    summaryNarrative: `Your resume scored ${overallScore}/100 (${tier}). ` + (overallScore >= 80 ? "It demonstrates high alignment with the target position." : "Focus on keyword alignment and quantifiable metrics to improve score."),
    pros,
    cons
  };

  const sectionImprovements: SectionImprovement[] = [
    {
      section: "Project Description",
      currentText: "Worked on website development using Java and Spring Boot.",
      suggestedRewrite: "Architected and developed a high-throughput Spring Boot REST API service backed by MySQL, supporting 10k+ daily active requests with 99.9% uptime."
    },
    {
      section: "Experience Impact",
      currentText: "Responsible for fixing bugs and writing database queries.",
      suggestedRewrite: "Optimized complex relational SQL queries and database indexes, reducing API endpoint response times by 35% and resolving critical production bugs."
    }
  ];

  return {
    overallScore,
    scoreTier: tier,
    atsScore: Math.round(atsEval.score),
    skillScore,
    keywordScore,
    experienceScore: expScore,
    projectScore: projScore,
    qualityScore,
    matchedSkills,
    missingSkills,
    highValueKeywords,
    matchedKeywords,
    missingKeywords,
    atsChecks: atsEval.checks,
    recommendations,
    explainability,
    sectionImprovements
  };
}

function normalize(text: string): string {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s\-\.\+\#]/g, " ").replace(/\s+/g, " ").trim();
}

function isSkillPresent(skill: string, text: string): boolean {
  if (text.includes(skill)) return true;
  const syns = SYNONYMS[skill] || [];
  return syns.some(s => text.includes(s));
}

function evaluateAtsClient(raw: string, norm: string) {
  const checks: AtsCheckItem[] = [];
  let score = 0;

  if (norm.includes("experience") || norm.includes("education") || norm.includes("skills")) {
    score += 25;
    checks.push({ title: "Standard Section Headings", status: "PASSED", detail: "Found recognized standard headers (Skills, Experience, Education)." });
  } else {
    checks.push({ title: "Standard Section Headings", status: "WARNING", detail: "Missing clear standard headings like Experience, Skills, Education." });
  }

  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(raw) || /(\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}/.test(raw)) {
    score += 25;
    checks.push({ title: "Contact Details", status: "PASSED", detail: "Contains valid email or phone contact information." });
  } else {
    checks.push({ title: "Contact Details", status: "WARNING", detail: "Missing clear contact details (email or phone number)." });
  }

  const verbs = (norm.match(/(developed|built|architected|designed|implemented|optimized|reduced|increased|led|managed)/g) || []).length;
  if (verbs >= 3) {
    score += 25;
    checks.push({ title: "Action Verb Usage", status: "PASSED", detail: `Uses strong action verbs (${verbs} detected).` });
  } else {
    checks.push({ title: "Action Verb Usage", status: "WARNING", detail: "Limited strong action verbs. Use verbs like 'Developed', 'Optimized', 'Architected'." });
  }

  if (/\d+%|\d+x|\$\d+|reduced by|increased by|improved by/.test(norm)) {
    score += 25;
    checks.push({ title: "Measurable Achievements", status: "PASSED", detail: "Includes quantifiable outcomes (% improvement, scale, numbers)." });
  } else {
    checks.push({ title: "Measurable Achievements", status: "WARNING", detail: "Lacks quantifiable metrics. Add numbers like '% reduction', 'ms response time'." });
  }

  return { score, checks };
}

function evaluateExpClient(norm: string): number {
  let s = 40;
  if (norm.includes("developer") || norm.includes("engineer")) s += 20;
  if (norm.includes("years") || norm.includes("experience")) s += 20;
  if (norm.includes("senior") || norm.includes("backend") || norm.includes("frontend")) s += 20;
  return Math.min(100, s);
}

function evaluateProjClient(norm: string): number {
  let s = 30;
  if (norm.includes("project") || norm.includes("developed") || norm.includes("github")) s += 30;
  if (norm.includes("api") || norm.includes("database") || norm.includes("cloud")) s += 20;
  if (norm.includes("reduced") || norm.includes("improved")) s += 20;
  return Math.min(100, s);
}

function evaluateQualityClient(norm: string): number {
  let s = 40;
  if (norm.length > 300) s += 20;
  if (norm.includes("education") || norm.includes("degree")) s += 20;
  if (norm.includes("linkedin") || norm.includes("github")) s += 20;
  return Math.min(100, s);
}

function getTier(score: number): string {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 60) return "Moderate Match";
  if (score >= 50) return "Weak Match";
  return "Poor Match";
}

function capitalize(s: string): string {
  return s.split(" ").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : "").join(" ");
}

export const CLIENT_SAMPLES = {
  jobDescriptions: [
    {
      title: "Senior Backend Engineer (Java / Spring Boot)",
      company: "TechCorp Inc.",
      description: "We are seeking a Senior Backend Engineer to develop high-performance REST APIs and microservices. Required skills: Java, Spring Boot, MySQL, REST API, Microservices, Docker, Git. Preferred: AWS, Redis, Kubernetes, Unit Testing. Minimum 2+ years backend experience."
    },
    {
      title: "Frontend React Engineer",
      company: "WebCraft Studios",
      description: "Looking for a skilled Frontend Engineer proficient in React, TypeScript, HTML, CSS, Next.js, and Tailwind CSS. Experience building responsive web interfaces, optimizing page performance, and integrating REST APIs is required."
    },
    {
      title: "Full Stack Developer",
      company: "CloudScale Systems",
      description: "Full Stack Developer needed to build modern web applications. Requirements: React, Node.js, TypeScript, PostgreSQL, REST API, Docker, CI/CD, AWS. Strong problem-solving and clean code practices required."
    },
    {
      title: "Data Scientist / ML Engineer",
      company: "Insight Analytics",
      description: "Seeking a Data Scientist to build predictive models. Required: Python, Machine Learning, Scikit-learn, TensorFlow, SQL, Data Analysis, Pandas. Experience with Docker and Cloud deployment preferred."
    }
  ],
  resumes: [
    {
      title: "Alex Morgan - Backend Resume",
      text: "Alex Morgan\nEmail: alex.morgan@example.com | Phone: (555) 019-2831 | Location: San Francisco, CA\nLinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan\n\nSUMMARY\nPassionate Backend Developer with 3+ years of experience constructing scalable Spring Boot REST APIs and database infrastructure.\n\nSKILLS\nJava, Spring Boot, MySQL, PostgreSQL, REST API, Git, Docker, Unit Testing, Microservices\n\nEXPERIENCE\nBackend Developer | DevSolutions Inc (2022 - Present)\n- Developed microservices in Java and Spring Boot reducing API latency by 30%.\n- Designed relational database schemas in MySQL supporting over 50k active daily users.\n\nPROJECTS\nE-Commerce Microservices Platform\n- Architected Spring Boot backend service with RESTful APIs, JWT authentication, and MySQL persistence."
    },
    {
      title: "Jordan Lee - Entry Level Resume",
      text: "Jordan Lee\nEmail: jordan.lee@example.com | Phone: (555) 987-6543\n\nEDUCATION\nB.S. in Computer Science - State University (2024)\n\nSKILLS\nJava, HTML, CSS, JavaScript, SQL\n\nPROJECTS\nStudent Management System\n- Built simple web interface with HTML/CSS and Java backend to track student attendance."
    }
  ]
};
