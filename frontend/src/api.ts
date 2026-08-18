import type { AnalysisResponse, SamplesResponse } from './types';

const API_BASE = 'http://localhost:8080/api';

export async function uploadResumeFile(file: File): Promise<{ filename: string; extractedText: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Failed to upload document');
  }

  return res.json();
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  if (!res.ok) {
    throw new Error('Failed to compute resume analysis');
  }

  return res.json();
}

export async function fetchSamples(): Promise<SamplesResponse> {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) {
    throw new Error('Failed to load sample templates');
  }
  return res.json();
}
