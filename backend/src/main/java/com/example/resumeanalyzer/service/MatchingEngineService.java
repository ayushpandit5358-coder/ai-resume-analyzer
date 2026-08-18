package com.example.resumeanalyzer.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class MatchingEngineService {

    private final SkillTaxonomyService skillTaxonomyService;

    public MatchingEngineService(SkillTaxonomyService skillTaxonomyService) {
        this.skillTaxonomyService = skillTaxonomyService;
    }

    public AnalysisResult analyze(String resumeText, String jobDescription, Map<String, String> parsedSections) {
        String normResume = normalizeText(resumeText);
        String normJd = normalizeText(jobDescription);

        // 1. Skill Extraction
        Set<String> jdSkills = extractSkillsFromText(normJd);
        if (jdSkills.isEmpty()) {
            // Fallback default skills if JD is generic
            jdSkills = extractSkillsFromText("java spring boot mysql rest api git docker aws");
        }

        List<SkillMatchDetail> matchedSkills = new ArrayList<>();
        List<SkillMatchDetail> missingSkills = new ArrayList<>();

        for (String skill : jdSkills) {
            String category = skillTaxonomyService.getCategory(skill);
            if (skillTaxonomyService.isRelated(skill, normResume)) {
                boolean isExact = normResume.contains(skill);
                matchedSkills.add(new SkillMatchDetail(capitalize(skill), category, isExact ? "Exact Match" : "Related Match", true));
            } else {
                missingSkills.add(new SkillMatchDetail(capitalize(skill), category, "Missing from Resume", false));
            }
        }

        // 2. Keyword Extraction
        Set<String> jdTokens = tokenize(normJd);
        Set<String> resumeTokens = tokenize(normResume);
        Set<String> stopWords = getStopWords();

        List<String> highValueJdKeywords = jdTokens.stream()
                .filter(w -> w.length() > 3 && !stopWords.contains(w))
                .sorted((a, b) -> Integer.compare(b.length(), a.length()))
                .distinct()
                .limit(15)
                .collect(Collectors.toList());

        List<String> matchedKeywords = highValueJdKeywords.stream()
                .filter(resumeTokens::contains)
                .collect(Collectors.toList());

        List<String> missingKeywords = highValueJdKeywords.stream()
                .filter(w -> !resumeTokens.contains(w))
                .collect(Collectors.toList());

        // 3. Score Computations
        double skillScore = jdSkills.isEmpty() ? 100.0 : ((double) matchedSkills.size() / jdSkills.size()) * 100.0;
        double keywordScore = highValueJdKeywords.isEmpty() ? 100.0 : ((double) matchedKeywords.size() / highValueJdKeywords.size()) * 100.0;
        
        AtsEvaluation atsEval = evaluateAts(resumeText, normResume);
        double experienceScore = evaluateExperience(normResume, normJd);
        double projectScore = evaluateProjects(normResume, parsedSections);
        double qualityScore = evaluateQuality(normResume);

        // Weighted Scoring (PDR Section 13 Model)
        // Skill (30%), Keyword (20%), Experience (15%), Project (10%), ATS (15%), Quality (10%)
        double rawOverall = (skillScore * 0.30)
                + (keywordScore * 0.20)
                + (experienceScore * 0.15)
                + (projectScore * 0.10)
                + (atsEval.score() * 0.15)
                + (qualityScore * 0.10);

        int overallScore = (int) Math.round(Math.min(100, Math.max(0, rawOverall)));

        // 4. Generate Recommendations & Priority
        List<RecommendationItem> recommendations = generateRecommendations(
                matchedSkills, missingSkills, missingKeywords, atsEval, experienceScore, projectScore, qualityScore, normResume
        );

        // 5. Explainability Breakdown ("Why this score?")
        ScoreExplainability explainability = generateExplainability(
                overallScore, matchedSkills, missingSkills, matchedKeywords, missingKeywords, atsEval, qualityScore
        );

        // 6. Section Improvement Suggestions
        List<SectionImprovement> improvements = generateSectionImprovements(normResume);

        return new AnalysisResult(
                overallScore,
                getScoreCategory(overallScore),
                (int) Math.round(atsEval.score()),
                (int) Math.round(skillScore),
                (int) Math.round(keywordScore),
                (int) Math.round(experienceScore),
                (int) Math.round(projectScore),
                (int) Math.round(qualityScore),
                matchedSkills,
                missingSkills,
                highValueJdKeywords,
                matchedKeywords,
                missingKeywords,
                atsEval.checks(),
                recommendations,
                explainability,
                improvements
        );
    }

    private Set<String> extractSkillsFromText(String text) {
        Set<String> found = new HashSet<>();
        for (String skill : skillTaxonomyService.getAllKnownSkills()) {
            if (text.contains(skill)) {
                found.add(skill);
            }
        }
        return found;
    }

    private AtsEvaluation evaluateAts(String rawText, String normText) {
        List<AtsCheckItem> checks = new ArrayList<>();
        int score = 0;

        // Header check
        boolean hasHeaders = normText.contains("education") || normText.contains("experience") || normText.contains("skills");
        if (hasHeaders) {
            score += 25;
            checks.add(new AtsCheckItem("Standard Section Headings", "PASSED", "Found recognized standard headers (Skills, Experience, Education)."));
        } else {
            checks.add(new AtsCheckItem("Standard Section Headings", "WARNING", "Missing clear standard headings like Experience, Skills, Education."));
        }

        // Contact Info Check
        boolean hasEmail = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(rawText).find();
        boolean hasPhone = Pattern.compile("(\\+?\\d{1,3}[- .]?)?\\(?\\d{3}\\)?[- .]?\\d{3}[- .]?\\d{4}").matcher(rawText).find();
        if (hasEmail || hasPhone) {
            score += 25;
            checks.add(new AtsCheckItem("Contact Details", "PASSED", "Contains valid email/phone contact information."));
        } else {
            checks.add(new AtsCheckItem("Contact Details", "WARNING", "Missing clear contact details (email or phone number)."));
        }

        // Action Verbs
        Pattern actionVerbPattern = Pattern.compile("(developed|built|architected|designed|implemented|optimized|reduced|increased|led|managed)");
        Matcher verbMatcher = actionVerbPattern.matcher(normText);
        int verbCount = 0;
        while (verbMatcher.find()) verbCount++;

        if (verbCount >= 3) {
            score += 25;
            checks.add(new AtsCheckItem("Action Verb Usage", "PASSED", "Uses strong action-oriented verbs (" + verbCount + " detected)."));
        } else {
            checks.add(new AtsCheckItem("Action Verb Usage", "WARNING", "Limited strong action verbs. Use verbs like 'Developed', 'Optimized', 'Architected'."));
        }

        // Quantifiable Metrics Check
        boolean hasNumbers = Pattern.compile("\\d+%|\\d+x|\\$\\d+|reduced by|increased by|improved by").matcher(normText).find();
        if (hasNumbers) {
            score += 25;
            checks.add(new AtsCheckItem("Measurable Achievements", "PASSED", "Includes quantifiable outcomes (% improvement, scale, numbers)."));
        } else {
            checks.add(new AtsCheckItem("Measurable Achievements", "WARNING", "Lacks quantifiable metrics. Add numbers like '% reduction', 'ms response time', or 'scale'."));
        }

        return new AtsEvaluation(score, checks);
    }

    private double evaluateExperience(String normResume, String normJd) {
        double score = 40.0;
        if (normResume.contains("developer") || normResume.contains("engineer") || normResume.contains("architect")) {
            score += 20.0;
        }
        if (normResume.contains("years") || normResume.contains("experience") || normResume.contains("lead")) {
            score += 20.0;
        }
        if (normResume.contains("senior") || normResume.contains("full stack") || normResume.contains("backend") || normResume.contains("frontend")) {
            score += 20.0;
        }
        return Math.min(100.0, score);
    }

    private double evaluateProjects(String normResume, Map<String, String> parsedSections) {
        double score = 30.0;
        String projSection = parsedSections.getOrDefault("projects", normResume);
        if (projSection.contains("project") || projSection.contains("developed") || projSection.contains("github")) {
            score += 30.0;
        }
        if (projSection.contains("api") || projSection.contains("database") || projSection.contains("cloud") || projSection.contains("react")) {
            score += 20.0;
        }
        if (projSection.contains("reduced") || projSection.contains("improved") || projSection.contains("deployed")) {
            score += 20.0;
        }
        return Math.min(100.0, score);
    }

    private double evaluateQuality(String normResume) {
        double score = 40.0;
        if (normResume.length() > 300) score += 20.0;
        if (normResume.contains("education") || normResume.contains("bachelor") || normResume.contains("master") || normResume.contains("degree")) score += 20.0;
        if (normResume.contains("linkedin") || normResume.contains("github") || normResume.contains("portfolio")) score += 20.0;
        return Math.min(100.0, score);
    }

    private List<RecommendationItem> generateRecommendations(
            List<SkillMatchDetail> matched, List<SkillMatchDetail> missing, List<String> missingKeywords,
            AtsEvaluation ats, double expScore, double projScore, double qualityScore, String normResume
    ) {
        List<RecommendationItem> recs = new ArrayList<>();

        if (!missing.isEmpty()) {
            String topMissing = missing.stream().limit(3).map(SkillMatchDetail::name).collect(Collectors.joining(", "));
            recs.add(new RecommendationItem(
                    "HIGH",
                    "Skills Gap",
                    "Add missing job-specific skills if you have relevant experience: " + topMissing + "."
            ));
        }

        if (!missingKeywords.isEmpty()) {
            String topKw = missingKeywords.stream().limit(4).collect(Collectors.joining(", "));
            recs.add(new RecommendationItem(
                    "HIGH",
                    "Keyword Matching",
                    "Incorporate key Job Description terms into work descriptions: " + topKw + "."
            ));
        }

        if (!normResume.contains("%") && !normResume.contains("improved") && !normResume.contains("reduced")) {
            recs.add(new RecommendationItem(
                    "HIGH",
                    "Measurable Impact",
                    "Transform generic duty descriptions into impact statements with metrics (e.g. 'Reduced latency by 35% using Redis caching')."
            ));
        }

        if (projScore < 70) {
            recs.add(new RecommendationItem(
                    "MEDIUM",
                    "Project Complexity",
                    "Highlight technical stack, architecture decisions, and individual contributions in project summaries."
            ));
        }

        if (ats.score() < 80) {
            recs.add(new RecommendationItem(
                    "MEDIUM",
                    "ATS Optimization",
                    "Use standardized section titles (Skills, Experience, Education) and ensure clear contact formatting."
            ));
        }

        recs.add(new RecommendationItem(
                "LOW",
                "Formatting & Links",
                "Ensure professional links (LinkedIn, GitHub, Portfolio) are explicitly present at the top of your resume."
        ));

        return recs;
    }

    private ScoreExplainability generateExplainability(
            int overall, List<SkillMatchDetail> matched, List<SkillMatchDetail> missing,
            List<String> matchedKw, List<String> missingKw, AtsEvaluation ats, double quality
    ) {
        List<String> pros = new ArrayList<>();
        List<String> cons = new ArrayList<>();

        if (!matched.isEmpty()) {
            pros.add("Matched key technical skills: " + matched.stream().limit(4).map(SkillMatchDetail::name).collect(Collectors.joining(", ")));
        }
        if (!matchedKw.isEmpty()) {
            pros.add("Demonstrated domain terms from Job Description (" + matchedKw.size() + " key terms matched)");
        }
        if (ats.score() >= 75) {
            pros.add("Strong ATS structural compliance and recognizable section formatting");
        }

        if (!missing.isEmpty()) {
            cons.add("Missing required target skills: " + missing.stream().limit(4).map(SkillMatchDetail::name).collect(Collectors.joining(", ")));
        }
        if (!missingKw.isEmpty()) {
            cons.add("Key JD phrases absent from resume bullet points");
        }
        if (quality < 70) {
            cons.add("Bullet points lack quantifiable metric benchmarks (% improvement, response times, scale)");
        }

        String narrative = "Your resume scored " + overall + "/100 (" + getScoreCategory(overall) + "). " +
                (overall >= 80 ? "It presents high alignment with the target role." : "It demonstrates foundational relevance but requires keyword alignment and measurable impact statements.");

        return new ScoreExplainability(narrative, pros, cons);
    }

    private List<SectionImprovement> generateSectionImprovements(String normResume) {
        List<SectionImprovement> list = new ArrayList<>();

        list.add(new SectionImprovement(
                "Project Description",
                "Worked on backend website development using Java and Spring Boot.",
                "Architected and developed a high-throughput Spring Boot REST API service backed by MySQL, supporting 10k+ daily active requests with 99.9% uptime."
        ));

        list.add(new SectionImprovement(
                "Experience Impact",
                "Responsible for fixing bugs and writing database queries.",
                "Optimized complex relational SQL queries and database indexes, reducing API endpoint response times by 35% and resolving critical production bugs."
        ));

        return list;
    }

    private String getScoreCategory(int score) {
        if (score >= 90) return "Excellent Match";
        if (score >= 80) return "Strong Match";
        if (score >= 70) return "Good Match";
        if (score >= 60) return "Moderate Match";
        if (score >= 50) return "Weak Match";
        return "Poor Match";
    }

    private String normalizeText(String text) {
        if (text == null) return "";
        return text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\s\\-\\.\\+\\#]", " ").replaceAll("\\s+", " ").trim();
    }

    private Set<String> tokenize(String text) {
        Set<String> set = new HashSet<>();
        for (String s : text.split("\\s+")) {
            if (!s.isBlank()) set.add(s);
        }
        return set;
    }

    private Set<String> getStopWords() {
        return new HashSet<>(Arrays.asList("with", "that", "this", "from", "have", "were", "will", "your", "their", "about", "which", "would", "there", "their", "about"));
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        String[] parts = text.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }

    public record SkillMatchDetail(String name, String category, String matchType, boolean matched) {}
    public record AtsCheckItem(String title, String status, String detail) {}
    public record AtsEvaluation(double score, List<AtsCheckItem> checks) {}
    public record RecommendationItem(String priority, String category, String detail) {}
    public record ScoreExplainability(String summaryNarrative, List<String> pros, List<String> cons) {}
    public record SectionImprovement(String section, String currentText, String suggestedRewrite) {}

    public record AnalysisResult(
            int overallScore,
            String scoreTier,
            int atsScore,
            int skillScore,
            int keywordScore,
            int experienceScore,
            int projectScore,
            int qualityScore,
            List<SkillMatchDetail> matchedSkills,
            List<SkillMatchDetail> missingSkills,
            List<String> highValueKeywords,
            List<String> matchedKeywords,
            List<String> missingKeywords,
            List<AtsCheckItem> atsChecks,
            List<RecommendationItem> recommendations,
            ScoreExplainability explainability,
            List<SectionImprovement> sectionImprovements
    ) {}
}
