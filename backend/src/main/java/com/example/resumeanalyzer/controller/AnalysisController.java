package com.example.resumeanalyzer.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.resumeanalyzer.service.DocumentParserService;
import com.example.resumeanalyzer.service.MatchingEngineService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final DocumentParserService documentParserService;
    private final MatchingEngineService matchingEngineService;

    public AnalysisController(DocumentParserService documentParserService, MatchingEngineService matchingEngineService) {
        this.documentParserService = documentParserService;
        this.matchingEngineService = matchingEngineService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> map = new HashMap<>();
        map.put("status", "UP");
        map.put("service", "AI Resume Analyzer Backend");
        map.put("version", "1.0.0");
        return map;
    }

    @PostMapping("/resumes/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty"));
        }
        try {
            String rawText = documentParserService.extractText(file);
            Map<String, String> sections = documentParserService.extractSections(rawText);

            Map<String, Object> response = new HashMap<>();
            response.put("filename", file.getOriginalFilename());
            response.put("extractedText", rawText);
            response.put("sections", sections);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error parsing file: " + e.getMessage()));
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<MatchingEngineService.AnalysisResult> analyze(@RequestBody AnalysisRequest request) {
        String resumeText = request.resumeText() == null ? "" : request.resumeText();
        String jobDescription = request.jobDescription() == null ? "" : request.jobDescription();

        Map<String, String> sections = documentParserService.extractSections(resumeText);
        MatchingEngineService.AnalysisResult result = matchingEngineService.analyze(resumeText, jobDescription, sections);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/samples")
    public ResponseEntity<Map<String, Object>> getSamples() {
        Map<String, Object> samples = new HashMap<>();

        samples.put("jobDescriptions", Arrays.asList(
                new SampleJob(
                        "Senior Backend Engineer (Java / Spring Boot)",
                        "TechCorp Inc.",
                        "We are seeking a Senior Backend Engineer to develop high-performance REST APIs and microservices. Required skills: Java, Spring Boot, MySQL, REST API, Microservices, Docker, Git. Preferred: AWS, Redis, Kubernetes, Unit Testing. Minimum 2+ years backend experience."
                ),
                new SampleJob(
                        "Frontend React Engineer",
                        "WebCraft Studios",
                        "Looking for a skilled Frontend Engineer proficient in React, TypeScript, HTML, CSS, Next.js, and Tailwind CSS. Experience building responsive web interfaces, optimizing page performance, and integrating REST APIs is required."
                ),
                new SampleJob(
                        "Full Stack Developer",
                        "CloudScale Systems",
                        "Full Stack Developer needed to build modern web applications. Requirements: React, Node.js, TypeScript, PostgreSQL, REST API, Docker, CI/CD, AWS. Strong problem-solving and clean code practices required."
                ),
                new SampleJob(
                        "Data Scientist / ML Engineer",
                        "Insight Analytics",
                        "Seeking a Data Scientist to build predictive models. Required: Python, Machine Learning, Scikit-learn, TensorFlow, SQL, Data Analysis, Pandas. Experience with Docker and Cloud deployment preferred."
                )
        ));

        samples.put("resumes", Arrays.asList(
                new SampleResume(
                        "Alex Morgan - Backend Resume",
                        "Alex Morgan\nEmail: alex.morgan@example.com | Phone: (555) 019-2831 | Location: San Francisco, CA\nLinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan\n\nSUMMARY\nPassionate Backend Developer with 3+ years of experience constructing scalable Spring Boot REST APIs and database infrastructure.\n\nSKILLS\nJava, Spring Boot, MySQL, PostgreSQL, REST API, Git, Docker, Unit Testing, Microservices\n\nEXPERIENCE\nBackend Developer | DevSolutions Inc (2022 - Present)\n- Developed microservices in Java and Spring Boot reducing API latency by 30%.\n- Designed relational database schemas in MySQL supporting over 50k active daily users.\n\nPROJECTS\nE-Commerce Microservices Platform\n- Architected Spring Boot backend service with RESTful APIs, JWT authentication, and MySQL persistence."
                ),
                new SampleResume(
                        "Jordan Lee - Entry Level Resume",
                        "Jordan Lee\nEmail: jordan.lee@example.com | Phone: (555) 987-6543\n\nEDUCATION\nB.S. in Computer Science - State University (2024)\n\nSKILLS\nJava, HTML, CSS, JavaScript, SQL\n\nPROJECTS\nStudent Management System\n- Built simple web interface with HTML/CSS and Java backend to track student attendance."
                )
        ));

        return ResponseEntity.ok(samples);
    }

    public record AnalysisRequest(String resumeText, String jobDescription) {}
    public record SampleJob(String title, String company, String description) {}
    public record SampleResume(String title, String text) {}
}
