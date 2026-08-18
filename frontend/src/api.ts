import type { AnalysisResponse, SamplesResponse } from './types';
import { clientAnalyze, CLIENT_SAMPLES } from './clientEngine';

const API_BASE = 'http://localhost:8080/api';

export async function uploadResumeFile(file: File): Promise<{ filename: string; extractedText: string }> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend server unreachable, parsing document on client:', err);
  }

  // Client-side fallback text extractor for TXT / plain text
  const text = await file.text();
  return {
    filename: file.name,
    extractedText: text || `[Uploaded file: ${file.name}] - Document uploaded successfully. Paste text if content requires specialized OCR.`
  };
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend server unreachable, executing client-side analysis engine:', err);
  }

  // Seamless client-side engine fallback for static GitHub Pages hosting
  return clientAnalyze(resumeText, jobDescription);
}

export async function fetchSamples(): Promise<SamplesResponse> {
  try {
    const res = await fetch(`${API_BASE}/samples`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend server unreachable, loading client sample templates:', err);
  }

  return CLIENT_SAMPLES;
}
