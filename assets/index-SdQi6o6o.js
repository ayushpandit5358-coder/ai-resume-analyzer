(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={java:`Languages`,python:`Languages`,javascript:`Languages`,typescript:`Languages`,"c++":`Languages`,sql:`Languages`,html:`Languages`,css:`Languages`,"spring boot":`Frameworks`,react:`Frameworks`,angular:`Frameworks`,vue:`Frameworks`,"node.js":`Frameworks`,nodejs:`Frameworks`,express:`Frameworks`,django:`Frameworks`,fastapi:`Frameworks`,"next.js":`Frameworks`,"tailwind css":`Frameworks`,mysql:`Databases`,postgresql:`Databases`,mongodb:`Databases`,redis:`Databases`,oracle:`Databases`,sqlite:`Databases`,aws:`Cloud & DevOps`,docker:`Cloud & DevOps`,kubernetes:`Cloud & DevOps`,jenkins:`Cloud & DevOps`,git:`Cloud & DevOps`,"ci/cd":`Cloud & DevOps`,"rest api":`Tools & Concepts`,graphql:`Tools & Concepts`,microservices:`Tools & Concepts`,kafka:`Tools & Concepts`,"system design":`Tools & Concepts`,jira:`Tools & Concepts`,"unit testing":`Tools & Concepts`,"machine learning":`AI & Data Science`,"deep learning":`AI & Data Science`,tensorflow:`AI & Data Science`,pytorch:`AI & Data Science`,pandas:`AI & Data Science`,"scikit-learn":`AI & Data Science`},t={"rest api":[`restful api`,`restful web services`,`api design`],"spring boot":[`spring framework`,`spring mvc`],kubernetes:[`k8s`,`container orchestration`],aws:[`amazon web services`,`cloud`],"machine learning":[`ml`,`predictive modeling`],postgresql:[`postgres`,`relational database`],mysql:[`relational database`,`sql database`],docker:[`containerization`,`containers`]};function n(t,n){let d=r(t),f=r(n),p=new Set;Object.keys(e).forEach(e=>{f.includes(e)&&p.add(e)}),p.size===0&&[`java`,`spring boot`,`mysql`,`rest api`,`git`,`docker`].forEach(e=>p.add(e));let m=[],h=[];p.forEach(t=>{let n=e[t]||`General`;if(i(t,d)){let e=d.includes(t);m.push({name:u(t),category:n,matchType:e?`Exact Match`:`Related Match`,matched:!0})}else h.push({name:u(t),category:n,matchType:`Missing from Resume`,matched:!1})});let g=new Set([`with`,`that`,`this`,`from`,`have`,`were`,`will`,`your`,`their`,`about`,`which`,`would`]),_=f.split(/\s+/).filter(e=>e.length>3&&!g.has(e)),v=new Set(d.split(/\s+/)),y=Array.from(new Set(_)).sort((e,t)=>t.length-e.length).slice(0,15),b=y.filter(e=>v.has(e)),x=y.filter(e=>!v.has(e)),S=Math.min(100,Math.round(m.length/Math.max(1,p.size)*100)),C=Math.min(100,Math.round(b.length/Math.max(1,y.length)*100)),w=a(t,d),T=o(d),E=s(d),D=c(d),O=S*.3+C*.2+T*.15+E*.1+w.score*.15+D*.1,k=Math.min(100,Math.max(0,Math.round(O))),A=l(k),j=[];h.length>0&&j.push({priority:`HIGH`,category:`Skills Gap`,detail:`Add missing job-specific skills if you have relevant experience: `+h.slice(0,3).map(e=>e.name).join(`, `)+`.`}),x.length>0&&j.push({priority:`HIGH`,category:`Keyword Matching`,detail:`Incorporate key Job Description terms into work descriptions: `+x.slice(0,4).join(`, `)+`.`}),!d.includes(`%`)&&!d.includes(`improved`)&&!d.includes(`reduced`)&&j.push({priority:`HIGH`,category:`Measurable Impact`,detail:`Transform generic duty descriptions into impact statements with metrics (e.g. 'Reduced latency by 35% using Redis caching').`}),j.push({priority:`MEDIUM`,category:`ATS Optimization`,detail:`Ensure standard section titles (Skills, Experience, Education) and clear contact details formatting.`});let M=[],N=[];m.length>0&&M.push(`Matched core technical skills: `+m.slice(0,4).map(e=>e.name).join(`, `)),b.length>0&&M.push(`Contains domain terms from Job Description (`+b.length+` terms matched)`),w.score>=75&&M.push(`Strong ATS formatting and section header detection`),h.length>0&&N.push(`Missing required skills: `+h.slice(0,4).map(e=>e.name).join(`, `)),x.length>0&&N.push(`Key JD terms missing from bullet points`);let P={summaryNarrative:`Your resume scored ${k}/100 (${A}). `+(k>=80?`It demonstrates high alignment with the target position.`:`Focus on keyword alignment and quantifiable metrics to improve score.`),pros:M,cons:N};return{overallScore:k,scoreTier:A,atsScore:Math.round(w.score),skillScore:S,keywordScore:C,experienceScore:T,projectScore:E,qualityScore:D,matchedSkills:m,missingSkills:h,highValueKeywords:y,matchedKeywords:b,missingKeywords:x,atsChecks:w.checks,recommendations:j,explainability:P,sectionImprovements:[{section:`Project Description`,currentText:`Worked on website development using Java and Spring Boot.`,suggestedRewrite:`Architected and developed a high-throughput Spring Boot REST API service backed by MySQL, supporting 10k+ daily active requests with 99.9% uptime.`},{section:`Experience Impact`,currentText:`Responsible for fixing bugs and writing database queries.`,suggestedRewrite:`Optimized complex relational SQL queries and database indexes, reducing API endpoint response times by 35% and resolving critical production bugs.`}]}}function r(e){return(e||``).toLowerCase().replace(/[^a-z0-9\s\-\.\+\#]/g,` `).replace(/\s+/g,` `).trim()}function i(e,n){return n.includes(e)?!0:(t[e]||[]).some(e=>n.includes(e))}function a(e,t){let n=[],r=0;t.includes(`experience`)||t.includes(`education`)||t.includes(`skills`)?(r+=25,n.push({title:`Standard Section Headings`,status:`PASSED`,detail:`Found recognized standard headers (Skills, Experience, Education).`})):n.push({title:`Standard Section Headings`,status:`WARNING`,detail:`Missing clear standard headings like Experience, Skills, Education.`}),/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(e)||/(\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}/.test(e)?(r+=25,n.push({title:`Contact Details`,status:`PASSED`,detail:`Contains valid email or phone contact information.`})):n.push({title:`Contact Details`,status:`WARNING`,detail:`Missing clear contact details (email or phone number).`});let i=(t.match(/(developed|built|architected|designed|implemented|optimized|reduced|increased|led|managed)/g)||[]).length;return i>=3?(r+=25,n.push({title:`Action Verb Usage`,status:`PASSED`,detail:`Uses strong action verbs (${i} detected).`})):n.push({title:`Action Verb Usage`,status:`WARNING`,detail:`Limited strong action verbs. Use verbs like 'Developed', 'Optimized', 'Architected'.`}),/\d+%|\d+x|\$\d+|reduced by|increased by|improved by/.test(t)?(r+=25,n.push({title:`Measurable Achievements`,status:`PASSED`,detail:`Includes quantifiable outcomes (% improvement, scale, numbers).`})):n.push({title:`Measurable Achievements`,status:`WARNING`,detail:`Lacks quantifiable metrics. Add numbers like '% reduction', 'ms response time'.`}),{score:r,checks:n}}function o(e){let t=40;return(e.includes(`developer`)||e.includes(`engineer`))&&(t+=20),(e.includes(`years`)||e.includes(`experience`))&&(t+=20),(e.includes(`senior`)||e.includes(`backend`)||e.includes(`frontend`))&&(t+=20),Math.min(100,t)}function s(e){let t=30;return(e.includes(`project`)||e.includes(`developed`)||e.includes(`github`))&&(t+=30),(e.includes(`api`)||e.includes(`database`)||e.includes(`cloud`))&&(t+=20),(e.includes(`reduced`)||e.includes(`improved`))&&(t+=20),Math.min(100,t)}function c(e){let t=40;return e.length>300&&(t+=20),(e.includes(`education`)||e.includes(`degree`))&&(t+=20),(e.includes(`linkedin`)||e.includes(`github`))&&(t+=20),Math.min(100,t)}function l(e){return e>=90?`Excellent Match`:e>=80?`Strong Match`:e>=70?`Good Match`:e>=60?`Moderate Match`:e>=50?`Weak Match`:`Poor Match`}function u(e){return e.split(` `).map(e=>e?e.charAt(0).toUpperCase()+e.slice(1):``).join(` `)}var d={jobDescriptions:[{title:`Senior Backend Engineer (Java / Spring Boot)`,company:`TechCorp Inc.`,description:`We are seeking a Senior Backend Engineer to develop high-performance REST APIs and microservices. Required skills: Java, Spring Boot, MySQL, REST API, Microservices, Docker, Git. Preferred: AWS, Redis, Kubernetes, Unit Testing. Minimum 2+ years backend experience.`},{title:`Frontend React Engineer`,company:`WebCraft Studios`,description:`Looking for a skilled Frontend Engineer proficient in React, TypeScript, HTML, CSS, Next.js, and Tailwind CSS. Experience building responsive web interfaces, optimizing page performance, and integrating REST APIs is required.`},{title:`Full Stack Developer`,company:`CloudScale Systems`,description:`Full Stack Developer needed to build modern web applications. Requirements: React, Node.js, TypeScript, PostgreSQL, REST API, Docker, CI/CD, AWS. Strong problem-solving and clean code practices required.`},{title:`Data Scientist / ML Engineer`,company:`Insight Analytics`,description:`Seeking a Data Scientist to build predictive models. Required: Python, Machine Learning, Scikit-learn, TensorFlow, SQL, Data Analysis, Pandas. Experience with Docker and Cloud deployment preferred.`}],resumes:[{title:`Alex Morgan - Backend Resume`,text:`Alex Morgan
Email: alex.morgan@example.com | Phone: (555) 019-2831 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan

SUMMARY
Passionate Backend Developer with 3+ years of experience constructing scalable Spring Boot REST APIs and database infrastructure.

SKILLS
Java, Spring Boot, MySQL, PostgreSQL, REST API, Git, Docker, Unit Testing, Microservices

EXPERIENCE
Backend Developer | DevSolutions Inc (2022 - Present)
- Developed microservices in Java and Spring Boot reducing API latency by 30%.
- Designed relational database schemas in MySQL supporting over 50k active daily users.

PROJECTS
E-Commerce Microservices Platform
- Architected Spring Boot backend service with RESTful APIs, JWT authentication, and MySQL persistence.`},{title:`Jordan Lee - Entry Level Resume`,text:`Jordan Lee
Email: jordan.lee@example.com | Phone: (555) 987-6543

EDUCATION
B.S. in Computer Science - State University (2024)

SKILLS
Java, HTML, CSS, JavaScript, SQL

PROJECTS
Student Management System
- Built simple web interface with HTML/CSS and Java backend to track student attendance.`}]},f=`http://localhost:8080/api`;async function p(e){let t=new FormData;t.append(`file`,e);try{let e=await fetch(`${f}/resumes/upload`,{method:`POST`,body:t});if(e.ok)return await e.json()}catch(e){console.warn(`Backend server unreachable, parsing document on client:`,e)}let n=await e.text();return{filename:e.name,extractedText:n||`[Uploaded file: ${e.name}] - Document uploaded successfully. Paste text if content requires specialized OCR.`}}async function m(e,t){try{let n=await fetch(`${f}/analyze`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({resumeText:e,jobDescription:t})});if(n.ok)return await n.json()}catch(e){console.warn(`Backend server unreachable, executing client-side analysis engine:`,e)}return n(e,t)}async function h(){try{let e=await fetch(`${f}/samples`);if(e.ok)return await e.json()}catch(e){console.warn(`Backend server unreachable, loading client sample templates:`,e)}return d}var g=[],_=[],v=document.querySelector(`#app`);function y(){v.innerHTML=`
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
  `,b(),S()}function b(){let e=document.querySelector(`#dropzone`),t=document.querySelector(`#file-input`),n=document.querySelector(`#resume-text`),r=document.querySelector(`#jd-text`),i=document.querySelector(`#analyze-btn`),a=document.querySelector(`#reset-btn`);e.addEventListener(`click`,()=>t.click()),e.addEventListener(`dragover`,t=>{t.preventDefault(),e.classList.add(`active`)}),e.addEventListener(`dragleave`,()=>e.classList.remove(`active`)),e.addEventListener(`drop`,async t=>{t.preventDefault(),e.classList.remove(`active`),t.dataTransfer?.files.length&&await x(t.dataTransfer.files[0])}),t.addEventListener(`change`,async()=>{t.files?.length&&await x(t.files[0])}),i.addEventListener(`click`,async()=>{let e=n.value.trim(),t=r.value.trim();if(!e){alert(`Please upload a resume or paste resume text first.`);return}if(!t){alert(`Please paste a target Job Description.`);return}C(!0);try{w(await m(e,t))}catch(e){alert(e.message||`Error analyzing resume`)}finally{C(!1)}}),a.addEventListener(`click`,()=>{n.value=``,r.value=``,document.querySelector(`#results-container`)?.classList.add(`hidden`),document.querySelector(`#file-success`)?.classList.add(`hidden`)})}async function x(e){try{let t=await p(e),n=document.querySelector(`#resume-text`);n.value=t.extractedText;let r=document.querySelector(`#file-success`),i=document.querySelector(`#uploaded-filename`);i.textContent=t.filename,r.classList.remove(`hidden`)}catch(e){alert(e.message||`Failed to parse resume file`)}}async function S(){try{let e=await h();g=e.jobDescriptions,_=e.resumes;let t=document.querySelector(`#jd-samples-container`),n=document.querySelector(`#resume-samples-container`);t&&(t.innerHTML=g.map((e,t)=>`
        <button class="btn-pill" data-type="job" data-idx="${t}">${e.title}</button>
      `).join(``)),n&&(n.innerHTML=_.map((e,t)=>`
        <button class="btn-pill" data-type="resume" data-idx="${t}">${e.title}</button>
      `).join(``)),document.querySelectorAll(`.btn-pill`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget,n=t.getAttribute(`data-type`),r=parseInt(t.getAttribute(`data-idx`)||`0`);if(n===`job`){let e=document.querySelector(`#jd-text`);e.value=g[r].description}else if(n===`resume`){let e=document.querySelector(`#resume-text`);e.value=_[r].text}})})}catch(e){console.warn(`Could not load samples from backend`,e)}}function C(e){let t=document.querySelector(`#btn-text`),n=document.querySelector(`#btn-spinner`),r=document.querySelector(`#analyze-btn`);e?(t.textContent=`Analyzing Resume & JD...`,n.classList.remove(`hidden`),r.disabled=!0):(t.textContent=`🚀 Analyze Match & Generate Report`,n.classList.add(`hidden`),r.disabled=!1)}function w(e){let t=document.querySelector(`#results-container`);t.classList.remove(`hidden`);let n=document.querySelector(`#overall-score-val`),r=document.querySelector(`#score-gauge`),i=document.querySelector(`#tier-badge`);n.textContent=e.overallScore.toString(),r.style.setProperty(`--score`,e.overallScore.toString()),i.textContent=e.scoreTier,i.className=`score-tier-badge tier-${e.scoreTier.toLowerCase().split(` `)[0]}`,T(`#score-skill`,`#bar-skill`,e.skillScore),T(`#score-keyword`,`#bar-keyword`,e.keywordScore),T(`#score-ats`,`#bar-ats`,e.atsScore),T(`#score-experience`,`#bar-experience`,e.experienceScore),T(`#score-project`,`#bar-project`,e.projectScore),document.querySelector(`#explain-narrative`).textContent=e.explainability.summaryNarrative,document.querySelector(`#explain-pros`).innerHTML=e.explainability.pros.map(e=>`<li>${e}</li>`).join(``),document.querySelector(`#explain-cons`).innerHTML=e.explainability.cons.map(e=>`<li>${e}</li>`).join(``);let a=document.querySelector(`#matched-skills-tags`);a.innerHTML=e.matchedSkills.length>0?e.matchedSkills.map(e=>`<span class="tag tag-matched">✓ ${e.name} (${e.category})</span>`).join(``):`<span style="color:var(--text-muted); font-size:0.85rem;">No direct skills matched.</span>`;let o=document.querySelector(`#missing-skills-tags`);o.innerHTML=e.missingSkills.length>0?e.missingSkills.map(e=>`<span class="tag tag-missing">⚠ ${e.name} (${e.category})</span>`).join(``):`<span style="color:#34d399; font-size:0.85rem;">No critical skills missing!</span>`;let s=document.querySelector(`#jd-keywords-tags`);s.innerHTML=e.highValueKeywords.map(t=>{let n=e.matchedKeywords.includes(t);return`<span class="tag ${n?`tag-matched`:`tag-keyword`}">${n?`✓`:`⚡`} ${t}</span>`}).join(``);let c=document.querySelector(`#ats-checklist`);c.innerHTML=e.atsChecks.map(e=>`
    <div class="ats-item">
      <span class="status-badge status-${e.status}">${e.status}</span>
      <div class="ats-content">
        <h4>${e.title}</h4>
        <p>${e.detail}</p>
      </div>
    </div>
  `).join(``);let l=document.querySelector(`#recommendations-container`);l.innerHTML=e.recommendations.map(e=>`
    <div class="rec-card priority-${e.priority}">
      <span class="priority-tag priority-${e.priority}">${e.priority} PRIORITY</span>
      <div class="rec-details">
        <h4>${e.category}</h4>
        <p>${e.detail}</p>
      </div>
    </div>
  `).join(``);let u=document.querySelector(`#improvements-container`);u.innerHTML=e.sectionImprovements.map(e=>`
    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.95rem; color: #a5b4fc; margin-bottom: 0.5rem;">${e.section}</h4>
      <div class="improvement-grid">
        <div class="improve-box improve-before">
          <div class="improve-label">❌ Current / Weak Description</div>
          "${e.currentText}"
        </div>
        <div class="improve-box improve-after">
          <div class="improve-label">✓ AI Suggested High-Impact Rewrite</div>
          "${e.suggestedRewrite}"
        </div>
      </div>
    </div>
  `).join(``),t.scrollIntoView({behavior:`smooth`})}function T(e,t,n){let r=document.querySelector(e),i=document.querySelector(t);r&&(r.textContent=`${n}%`),i&&(i.style.width=`${n}%`)}y();