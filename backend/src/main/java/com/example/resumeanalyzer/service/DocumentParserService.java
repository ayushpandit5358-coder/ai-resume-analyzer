package com.example.resumeanalyzer.service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentParserService {

    public String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        try {
            if (filename.endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
                try (InputStream is = file.getInputStream();
                     XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else {
                return new String(file.getBytes());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from resume document: " + e.getMessage(), e);
        }
    }

    public Map<String, String> extractSections(String fullText) {
        Map<String, String> sections = new HashMap<>();
        sections.put("fullText", fullText);

        if (fullText == null || fullText.isBlank()) {
            return sections;
        }

        String[] lines = fullText.split("\\r?\\n");
        String currentSection = "summary";
        StringBuilder sb = new StringBuilder();

        Pattern sectionPattern = Pattern.compile("^(education|experience|work experience|projects|skills|technical skills|certifications|contact|summary|objective)", Pattern.CASE_INSENSITIVE);

        for (String line : lines) {
            String trimmed = line.trim();
            Matcher matcher = sectionPattern.matcher(trimmed);
            if (matcher.find()) {
                if (sb.length() > 0) {
                    sections.put(currentSection, sb.toString().trim());
                    sb.setLength(0);
                }
                currentSection = matcher.group(1).toLowerCase().replaceAll("\\s+", "");
            } else {
                sb.append(line).append("\n");
            }
        }
        if (sb.length() > 0) {
            sections.put(currentSection, sb.toString().trim());
        }

        return sections;
    }
}
