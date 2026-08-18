package com.example.resumeanalyzer.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
public class SkillTaxonomyService {

    private final Map<String, String> categoryMap = new HashMap<>();
    private final Map<String, List<String>> synonymMap = new HashMap<>();
    private final Set<String> allSkills = new HashSet<>();

    public SkillTaxonomyService() {
        initTaxonomy();
    }

    private void initTaxonomy() {
        // Programming Languages
        addSkillCategory("Languages", Arrays.asList(
                "java", "python", "javascript", "typescript", "c++", "c#", "go", "golang", "ruby", "rust", "php", "swift", "kotlin", "sql", "html", "css"
        ));

        // Frameworks & Libraries
        addSkillCategory("Frameworks", Arrays.asList(
                "spring boot", "spring framework", "react", "react.js", "angular", "vue", "vue.js", "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi", "next.js", "tailwind css", "bootstrap", "hibernate"
        ));

        // Databases & Storage
        addSkillCategory("Databases", Arrays.asList(
                "mysql", "postgresql", "postgres", "mongodb", "redis", "oracle", "sql server", "dynamodb", "elasticsearch", "cassandra", "firebase"
        ));

        // Cloud & Infrastructure
        addSkillCategory("Cloud & DevOps", Arrays.asList(
                "aws", "amazon web services", "azure", "google cloud", "gcp", "docker", "kubernetes", "k8s", "terraform", "jenkins", "github actions", "ci/cd", "linux", "bash", "nginx"
        ));

        // Tools & Concepts
        addSkillCategory("Tools & Concepts", Arrays.asList(
                "git", "github", "gitlab", "rest api", "restful api", "rest", "graphql", "microservices", "kafka", "rabbitmq", "system design", "agile", "scrum", "jira", "unit testing", "junit", "mockito"
        ));

        // Data Science & AI
        addSkillCategory("AI & Data Science", Arrays.asList(
                "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "opencv", "nlp", "natural language processing", "data analysis", "tableau", "power bi"
        ));

        // Soft Skills
        addSkillCategory("Soft Skills", Arrays.asList(
                "communication", "leadership", "problem solving", "teamwork", "collaboration", "critical thinking", "time management", "adaptability"
        ));

        // Synonyms mapping
        addSynonyms("rest api", Arrays.asList("restful api", "restful web services", "rest api development", "api design"));
        addSynonyms("spring boot", Arrays.asList("spring framework", "spring mvc", "spring data"));
        addSynonyms("kubernetes", Arrays.asList("k8s", "container orchestration"));
        addSynonyms("aws", Arrays.asList("amazon web services", "aws cloud"));
        addSynonyms("machine learning", Arrays.asList("ml", "predictive modeling", "statistical modeling"));
        addSynonyms("postgresql", Arrays.asList("postgres", "relational database"));
        addSynonyms("mysql", Arrays.asList("relational database", "sql database"));
        addSynonyms("docker", Arrays.asList("containerization", "docker containers"));
        addSynonyms("git", Arrays.asList("version control", "github", "gitlab"));
    }

    private void addSkillCategory(String category, List<String> skills) {
        for (String skill : skills) {
            String normalized = skill.toLowerCase().trim();
            allSkills.add(normalized);
            categoryMap.put(normalized, category);
        }
    }

    private void addSynonyms(String primary, List<String> synonyms) {
        String normPrimary = primary.toLowerCase().trim();
        synonymMap.put(normPrimary, synonyms.stream().map(s -> s.toLowerCase().trim()).toList());
    }

    public Set<String> getAllKnownSkills() {
        return allSkills;
    }

    public String getCategory(String skill) {
        return categoryMap.getOrDefault(skill.toLowerCase().trim(), "General");
    }

    public List<String> getSynonyms(String skill) {
        return synonymMap.getOrDefault(skill.toLowerCase().trim(), List.of());
    }

    public boolean isRelated(String targetSkill, String text) {
        String normTarget = targetSkill.toLowerCase().trim();
        if (text.contains(normTarget)) {
            return true;
        }
        List<String> synonyms = getSynonyms(normTarget);
        for (String syn : synonyms) {
            if (text.contains(syn)) {
                return true;
            }
        }
        return false;
    }
}
