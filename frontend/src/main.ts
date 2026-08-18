import './style.css';
import { analyzeResume, fetchSamples, uploadResumeFile } from './api';
import type { AnalysisResponse, SampleJob, SampleResume } from './types';

let sampleJobs: SampleJob[] = [];
let sampleResumes: SampleResume[] = [];

const app = document.querySelector<HTMLDivElement>('#app')!;

function renderApp() {
  app.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <div class="brand-title">AI Resume Analyzer</div>
      </div>
      <div class="header-actions">
        <button id="reset-btn" class="btn btn-secondary">🔄 Reset</button>
      </div>
    </header>

    <main class="container">
      <!-- Input Workbench -->
      <section class="workbench-grid">
        <!-- Resume Upload & Text Input -->
        <div class="glass-card">
          <div class="field-label">
            <span>📄 Step 1: Upload or Paste Resume</span>
            <span id="file-indicator" class="text-muted font-size-sm">PDF / DOCX</span>
          </div>

          <div id="dropzone" class="dropzone">
            <div class="dropzone-icon">📁</div>
            <div class="dropzone-text">
              Drag & Drop your resume (<span>PDF / DOCX</span>) or click to browse
            </div>
            <input type="file" id="file-input" accept=".pdf,.docx,.doc,.txt" style="display:none" />
          </div>

          <div id="file-success" class="file-status hidden">
            <span>✓ File extracted successfully:</span> <strong id="uploaded-filename">document.pdf</strong>
          </div>

          <div style="margin-top: 1rem;">
            <div class="field-label">
              <span>Or Edit Resume Text directly:</span>
            </div>
            <textarea id="resume-text" class="text-input" placeholder="Paste full resume text here..."></textarea>
          </div>

          <div class="sample-pills">
            <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">Try sample resumes:</span>
            <div id="resume-samples-container" class="sample-pills"></div>
          </div>
        </div>

        <!-- Job Description Input -->
        <div class="glass-card">
          <div class="field-label">
            <span>🎯 Step 2: Target Job Description</span>
          </div>

          <textarea id="jd-text" class="text-input" style="height: 280px;" placeholder="Paste target Job Description (responsibilities, required skills, qualifications)..."></textarea>

          <div class="sample-pills" style="margin-top: 1rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">Try sample roles:</span>
            <div id="jd-samples-container" class="sample-pills"></div>
          </div>
        </div>
      </section>

      <!-- Analyze Action Row -->
      <div class="actions-row">
        <button id="analyze-btn" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.9rem 2.5rem;">
          <span id="btn-text">🚀 Analyze Match & Generate Report</span>
          <span id="btn-spinner" class="loading-spinner hidden"></span>
        </button>
      </div>

      <!-- Dashboard Results Container -->
      <section id="results-container" class="results-dashboard hidden" style="margin-top: 3rem;">
        <!-- Score Overview -->
        <div class="glass-card score-overview-card">
          <div class="gauge-container">
            <div id="score-gauge" class="score-circle" style="--score: 0;">
              <span id="overall-score-val" class="score-value">0</span>
            </div>
            <div class="score-sublabel">Match Score / 100</div>
            <div id="tier-badge" class="score-tier-badge tier-good">Good Match</div>
          </div>

          <div>
            <h3 class="section-title">📊 Detailed Subscores Breakdown</h3>
            <div class="subscores-grid">
              <div class="subscore-card">
                <div class="subscore-title">Skill Match (30%)</div>
                <div id="score-skill" class="subscore-val">0%</div>
                <div class="progress-bar-bg"><div id="bar-skill" class="progress-bar-fill" style="width:0%;"></div></div>
              </div>
              <div class="subscore-card">
                <div class="subscore-title">Keyword Match (20%)</div>
                <div id="score-keyword" class="subscore-val">0%</div>
                <div class="progress-bar-bg"><div id="bar-keyword" class="progress-bar-fill" style="width:0%;"></div></div>
              </div>
              <div class="subscore-card">
                <div class="subscore-title">ATS Readiness (15%)</div>
                <div id="score-ats" class="subscore-val">0%</div>
                <div class="progress-bar-bg"><div id="bar-ats" class="progress-bar-fill" style="width:0%;"></div></div>
              </div>
              <div class="subscore-card">
                <div class="subscore-title">Experience Fit (15%)</div>
                <div id="score-experience" class="subscore-val">0%</div>
                <div class="progress-bar-bg"><div id="bar-experience" class="progress-bar-fill" style="width:0%;"></div></div>
              </div>
              <div class="subscore-card">
                <div class="subscore-title">Project Quality (10%)</div>
                <div id="score-project" class="subscore-val">0%</div>
                <div class="progress-bar-bg"><div id="bar-project" class="progress-bar-fill" style="width:0%;"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Why This Score? Explainability Card -->
        <div class="glass-card">
          <h3 class="section-title">💡 Why Did Your Resume Receive This Score?</h3>
          <p id="explain-narrative" style="color: var(--text-muted); margin-bottom: 1rem;"></p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div style="background: rgba(16, 185, 129, 0.08); padding: 1rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
              <h4 style="color: #34d399; font-size: 0.95rem; margin-bottom: 0.5rem;">🟢 Key Scoring Drivers (+ Points)</h4>
              <ul id="explain-pros" style="font-size: 0.88rem; color: #d1d5db; padding-left: 1.2rem;"></ul>
            </div>
            <div style="background: rgba(239, 68, 68, 0.08); padding: 1rem; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <h4 style="color: #f87171; font-size: 0.95rem; margin-bottom: 0.5rem;">🔴 Score Penalizers (- Gaps)</h4>
              <ul id="explain-cons" style="font-size: 0.88rem; color: #d1d5db; padding-left: 1.2rem;"></ul>
            </div>
          </div>
        </div>

        <!-- Skills Matrix -->
        <div class="glass-card">
          <h3 class="section-title">⚡ Skills & Keyword Analysis</h3>
          <div class="skills-grid">
            <div>
              <h4 style="font-size: 0.95rem; color: #34d399;">✓ Matched Skills in Resume</h4>
              <div id="matched-skills-tags" class="tag-cloud"></div>
            </div>
            <div>
              <h4 style="font-size: 0.95rem; color: #f87171;">⚠ Missing / Weak Skills</h4>
              <div id="missing-skills-tags" class="tag-cloud"></div>
            </div>
          </div>
          <div style="margin-top: 1.5rem;">
            <h4 style="font-size: 0.95rem; color: #67e8f9;">⚡ High-Value Job Description Keywords</h4>
            <div id="jd-keywords-tags" class="tag-cloud"></div>
          </div>
        </div>

        <!-- ATS Inspection -->
        <div class="glass-card">
          <h3 class="section-title">🛡️ ATS Compatibility & Formatting Audit</h3>
          <div id="ats-checklist" class="ats-list"></div>
        </div>

        <!-- Recommendations Feed -->
        <div class="glass-card">
          <h3 class="section-title">🎯 Actionable AI Improvement Recommendations</h3>
          <div id="recommendations-container" class="recommendations-feed"></div>
        </div>

        <!-- Section Improvement Workbench -->
        <div class="glass-card">
          <h3 class="section-title">✨ Resume Bullet Point Rewriter</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
            Here is how you can elevate weak, passive descriptions into high-impact bullet points with quantifiable results without fabricating experience:
          </p>
          <div id="improvements-container"></div>
        </div>
      </section>
    </main>
  `;

  attachEventListeners();
  loadSampleTemplates();
}

function attachEventListeners() {
  const dropzone = document.querySelector<HTMLDivElement>('#dropzone')!;
  const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
  const resumeTextarea = document.querySelector<HTMLTextAreaElement>('#resume-text')!;
  const jdTextarea = document.querySelector<HTMLTextAreaElement>('#jd-text')!;
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')!;
  const resetBtn = document.querySelector<HTMLButtonElement>('#reset-btn')!;

  // File Dropzone handlers
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('active');
  });

  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('active'));

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('active');
    if (e.dataTransfer?.files.length) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async () => {
    if (fileInput.files?.length) {
      await handleFileUpload(fileInput.files[0]);
    }
  });

  analyzeBtn.addEventListener('click', async () => {
    const resumeText = resumeTextarea.value.trim();
    const jdText = jdTextarea.value.trim();

    if (!resumeText) {
      alert('Please upload a resume or paste resume text first.');
      return;
    }
    if (!jdText) {
      alert('Please paste a target Job Description.');
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeResume(resumeText, jdText);
      renderDashboardResults(data);
    } catch (err: any) {
      alert(err.message || 'Error analyzing resume');
    } finally {
      setLoading(false);
    }
  });

  resetBtn.addEventListener('click', () => {
    resumeTextarea.value = '';
    jdTextarea.value = '';
    document.querySelector('#results-container')?.classList.add('hidden');
    document.querySelector('#file-success')?.classList.add('hidden');
  });
}

async function handleFileUpload(file: File) {
  try {
    const res = await uploadResumeFile(file);
    const resumeTextarea = document.querySelector<HTMLTextAreaElement>('#resume-text')!;
    resumeTextarea.value = res.extractedText;

    const fileSuccess = document.querySelector<HTMLDivElement>('#file-success')!;
    const filenameLabel = document.querySelector<HTMLElement>('#uploaded-filename')!;
    filenameLabel.textContent = res.filename;
    fileSuccess.classList.remove('hidden');
  } catch (err: any) {
    alert(err.message || 'Failed to parse resume file');
  }
}

async function loadSampleTemplates() {
  try {
    const data = await fetchSamples();
    sampleJobs = data.jobDescriptions;
    sampleResumes = data.resumes;

    const jdContainer = document.querySelector('#jd-samples-container');
    const resumeContainer = document.querySelector('#resume-samples-container');

    if (jdContainer) {
      jdContainer.innerHTML = sampleJobs.map((j, idx) => `
        <button class="btn-pill" data-type="job" data-idx="${idx}">${j.title}</button>
      `).join('');
    }

    if (resumeContainer) {
      resumeContainer.innerHTML = sampleResumes.map((r, idx) => `
        <button class="btn-pill" data-type="resume" data-idx="${idx}">${r.title}</button>
      `).join('');
    }

    // Attach click events to pills
    document.querySelectorAll('.btn-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute('data-type');
        const idx = parseInt(target.getAttribute('data-idx') || '0');

        if (type === 'job') {
          const jdTextarea = document.querySelector<HTMLTextAreaElement>('#jd-text')!;
          jdTextarea.value = sampleJobs[idx].description;
        } else if (type === 'resume') {
          const resumeTextarea = document.querySelector<HTMLTextAreaElement>('#resume-text')!;
          resumeTextarea.value = sampleResumes[idx].text;
        }
      });
    });

  } catch (err) {
    console.warn('Could not load samples from backend', err);
  }
}

function setLoading(loading: boolean) {
  const btnText = document.querySelector('#btn-text')!;
  const btnSpinner = document.querySelector('#btn-spinner')!;
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')!;

  if (loading) {
    btnText.textContent = 'Analyzing Resume & JD...';
    btnSpinner.classList.remove('hidden');
    analyzeBtn.disabled = true;
  } else {
    btnText.textContent = '🚀 Analyze Match & Generate Report';
    btnSpinner.classList.add('hidden');
    analyzeBtn.disabled = false;
  }
}

function renderDashboardResults(data: AnalysisResponse) {
  const resultsContainer = document.querySelector('#results-container')!;
  resultsContainer.classList.remove('hidden');

  // Gauge & Overall
  const scoreVal = document.querySelector('#overall-score-val')!;
  const scoreGauge = document.querySelector<HTMLElement>('#score-gauge')!;
  const tierBadge = document.querySelector('#tier-badge')!;

  scoreVal.textContent = data.overallScore.toString();
  scoreGauge.style.setProperty('--score', data.overallScore.toString());
  tierBadge.textContent = data.scoreTier;
  tierBadge.className = `score-tier-badge tier-${data.scoreTier.toLowerCase().split(' ')[0]}`;

  // Subscores
  setSubscore('#score-skill', '#bar-skill', data.skillScore);
  setSubscore('#score-keyword', '#bar-keyword', data.keywordScore);
  setSubscore('#score-ats', '#bar-ats', data.atsScore);
  setSubscore('#score-experience', '#bar-experience', data.experienceScore);
  setSubscore('#score-project', '#bar-project', data.projectScore);

  // Explainability
  document.querySelector('#explain-narrative')!.textContent = data.explainability.summaryNarrative;
  document.querySelector('#explain-pros')!.innerHTML = data.explainability.pros.map(p => `<li>${p}</li>`).join('');
  document.querySelector('#explain-cons')!.innerHTML = data.explainability.cons.map(c => `<li>${c}</li>`).join('');

  // Skills Matrix
  const matchedContainer = document.querySelector('#matched-skills-tags')!;
  matchedContainer.innerHTML = data.matchedSkills.length > 0
    ? data.matchedSkills.map(s => `<span class="tag tag-matched">✓ ${s.name} (${s.category})</span>`).join('')
    : '<span style="color:var(--text-muted); font-size:0.85rem;">No direct skills matched.</span>';

  const missingContainer = document.querySelector('#missing-skills-tags')!;
  missingContainer.innerHTML = data.missingSkills.length > 0
    ? data.missingSkills.map(s => `<span class="tag tag-missing">⚠ ${s.name} (${s.category})</span>`).join('')
    : '<span style="color:#34d399; font-size:0.85rem;">No critical skills missing!</span>';

  const keywordsContainer = document.querySelector('#jd-keywords-tags')!;
  keywordsContainer.innerHTML = data.highValueKeywords.map(k => {
    const isMatched = data.matchedKeywords.includes(k);
    return `<span class="tag ${isMatched ? 'tag-matched' : 'tag-keyword'}">${isMatched ? '✓' : '⚡'} ${k}</span>`;
  }).join('');

  // ATS Checklist
  const atsContainer = document.querySelector('#ats-checklist')!;
  atsContainer.innerHTML = data.atsChecks.map(item => `
    <div class="ats-item">
      <span class="status-badge status-${item.status}">${item.status}</span>
      <div class="ats-content">
        <h4>${item.title}</h4>
        <p>${item.detail}</p>
      </div>
    </div>
  `).join('');

  // Recommendations
  const recsContainer = document.querySelector('#recommendations-container')!;
  recsContainer.innerHTML = data.recommendations.map(r => `
    <div class="rec-card priority-${r.priority}">
      <span class="priority-tag priority-${r.priority}">${r.priority} PRIORITY</span>
      <div class="rec-details">
        <h4>${r.category}</h4>
        <p>${r.detail}</p>
      </div>
    </div>
  `).join('');

  // Section Improvements
  const improvementsContainer = document.querySelector('#improvements-container')!;
  improvementsContainer.innerHTML = data.sectionImprovements.map(imp => `
    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.95rem; color: #a5b4fc; margin-bottom: 0.5rem;">${imp.section}</h4>
      <div class="improvement-grid">
        <div class="improve-box improve-before">
          <div class="improve-label">❌ Current / Weak Description</div>
          "${imp.currentText}"
        </div>
        <div class="improve-box improve-after">
          <div class="improve-label">✓ AI Suggested High-Impact Rewrite</div>
          "${imp.suggestedRewrite}"
        </div>
      </div>
    </div>
  `).join('');

  // Scroll to results smoothly
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function setSubscore(valSelector: string, barSelector: string, score: number) {
  const valEl = document.querySelector(valSelector);
  const barEl = document.querySelector<HTMLElement>(barSelector);
  if (valEl) valEl.textContent = `${score}%`;
  if (barEl) barEl.style.width = `${score}%`;
}

renderApp();
