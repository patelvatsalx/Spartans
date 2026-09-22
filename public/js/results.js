/**
 * LessonCraft AI - Results Renderer & Export Handlers
 * Dynamically renders Lesson Plan, Worksheet, Quiz, and Answer Key.
 * Handles Google Docs export, Google Forms export, Print, and Local Storage saving.
 */

const Results = (function() {
  let currentLessonData = null;

  function init() {
    // Action bar buttons
    document.getElementById('actionEditBtn')?.addEventListener('click', () => UI.showView('createView'));
    document.getElementById('actionNewBtn')?.addEventListener('click', () => UI.showView('createView'));
    document.getElementById('actionSaveBtn')?.addEventListener('click', saveCurrentLesson);
    document.getElementById('actionPrintBtn')?.addEventListener('click', () => window.print());
    document.getElementById('printWorksheetBtn')?.addEventListener('click', () => window.print());
    document.getElementById('printAnswerKeyBtn')?.addEventListener('click', () => window.print());

    // Google API export buttons
    document.getElementById('actionDocsBtn')?.addEventListener('click', exportToGoogleDocs);
    document.getElementById('actionFormsBtn')?.addEventListener('click', exportToGoogleForms);
    document.getElementById('quizExportFormBtn')?.addEventListener('click', exportToGoogleForms);
  }

  /**
   * Primary entrypoint to render structured lesson response into tabs
   * @param {Object} data Structured lesson payload from Gemini backend
   */
  function renderLessonResults(data) {
    if (!data) return;
    currentLessonData = data;

    const lesson = data.lesson || {};

    // 1. Update Results Header
    const titleEl = document.getElementById('resTitleText');
    if (titleEl) titleEl.textContent = lesson.title || `${lesson.topic} (${lesson.grade})`;

    const subBadge = document.getElementById('resSubjectBadge');
    if (subBadge) subBadge.textContent = lesson.subject || 'Subject';

    const grBadge = document.getElementById('resGradeBadge');
    if (grBadge) grBadge.textContent = lesson.grade || 'Grade';

    const durBadge = document.getElementById('resDurationBadge');
    if (durBadge) durBadge.textContent = lesson.duration || 'Duration';

    const diffBadge = document.getElementById('resDiffBadge');
    if (diffBadge) diffBadge.textContent = lesson.difficulty || 'Intermediate';

    // 2. Render Tab 1: Lesson Plan
    renderLessonPlanTab(data);

    // 3. Render Tab 2: Worksheet
    renderWorksheetTab(data);

    // 4. Render Tab 3: Quiz
    renderQuizTab(data);

    // 5. Render Tab 4: Answer Key
    renderAnswerKeyTab(data);
  }

  /**
   * Renders Tab 1: Lesson Plan
   */
  function renderLessonPlanTab(data) {
    const container = document.getElementById('lessonPlanContainer');
    if (!container) return;

    const lesson = data.lesson || {};
    const objectives = data.learningObjectives || [];
    const materials = data.materials || [];
    const timeline = data.timeline || [];
    const activities = data.activities || [];
    const assessment = data.assessment || 'Formative assessment through observation.';

    let html = `
      <!-- Learning Objectives -->
      <div class="plan-section-title">🎯 Learning Objectives</div>
      <div class="objectives-grid">
        ${objectives.map(obj => `
          <div class="objective-item">
            <span class="objective-check">✓</span>
            <span>${escapeHTML(obj)}</span>
          </div>
        `).join('')}
      </div>

      <!-- Required Materials -->
      <div class="plan-section-title">📦 Required Classroom Materials</div>
      <div class="materials-list">
        ${materials.map(mat => `
          <div class="material-chip">
            <span>📌</span>
            <span>${escapeHTML(mat)}</span>
          </div>
        `).join('')}
      </div>

      <!-- Vertical Lesson Timeline -->
      <div class="plan-section-title">⏱️ Lesson Timeline & Structure</div>
      <div class="timeline-container">
        ${timeline.map(item => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-meta">
                <span class="timeline-title">${escapeHTML(item.activity)}</span>
                <span class="timeline-time">${escapeHTML(item.time || item.duration)}</span>
              </div>
              <p class="timeline-desc">${escapeHTML(item.description)}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Teaching & Student Activities -->
      <div class="plan-section-title">👥 Classroom Activity Details</div>
      <div class="activities-grid">
        ${activities.map((act, idx) => `
          <div class="activity-card">
            <div class="activity-card-header">
              <span>Activity ${idx + 1}: ${escapeHTML(act.title)}</span>
              <span class="badge badge-primary">${escapeHTML(act.duration)}</span>
            </div>
            <div class="activity-card-body">
              <div class="activity-column">
                <div class="activity-column-title col-teacher">👨‍🏫 Teacher Action</div>
                <div class="activity-text">${escapeHTML(act.teacherAction)}</div>
              </div>
              <div class="activity-column">
                <div class="activity-column-title col-student">🎓 Student Action</div>
                <div class="activity-text">${escapeHTML(act.studentAction)}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Assessment Strategy -->
      <div class="plan-section-title">📊 Formative Assessment Strategy</div>
      <div style="background-color: var(--color-brand-light); border: 1px solid var(--color-brand-border); padding: 1.25rem; border-radius: var(--radius-lg); font-size: 0.95rem; color: var(--color-neutral-800); line-height: 1.6;">
        ${escapeHTML(assessment)}
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Renders Tab 2: Printable Student Worksheet
   */
  function renderWorksheetTab(data) {
    const container = document.getElementById('worksheetContainer');
    if (!container) return;

    const worksheet = data.worksheet || {};
    const lesson = data.lesson || {};
    const questions = worksheet.questions || [];

    let html = `
      <div class="worksheet-header">
        <div class="worksheet-meta-line">
          <span>Subject: ${escapeHTML(lesson.subject || '')}</span>
          <span>Student Name: ___________________________</span>
        </div>
        <div class="worksheet-meta-line">
          <span>Grade: ${escapeHTML(lesson.grade || '')}</span>
          <span>Date: ________________________</span>
        </div>
        <h1 class="worksheet-title">${escapeHTML(worksheet.title || `Worksheet: ${lesson.topic}`)}</h1>
        <p class="worksheet-instructions">Instructions: ${escapeHTML(worksheet.instructions || 'Answer all questions clearly.')}</p>
      </div>

      <div class="worksheet-questions">
        ${questions.map((q, idx) => `
          <div class="ws-question-item">
            <div class="ws-q-number">Question ${idx + 1}. ${escapeHTML(q.questionText || q.question)}</div>
            ${renderQuestionInputType(q)}
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Renders specific question input format for worksheet
   */
  function renderQuestionInputType(q) {
    if (q.type === 'multiple_choice' && Array.isArray(q.options)) {
      return `
        <div class="ws-q-options">
          ${q.options.map(opt => `<div class="ws-option-choice">[  ] ${escapeHTML(opt)}</div>`).join('')}
        </div>
      `;
    }
    if (q.type === 'true_false') {
      return `
        <div class="ws-q-options" style="grid-template-columns: 1fr 1fr;">
          <div class="ws-option-choice">[  ] True</div>
          <div class="ws-option-choice">[  ] False</div>
        </div>
      `;
    }
    // Fill in the blank or short answer
    const lines = q.answerSpace || '____________________________________________________________________________________________________';
    return `<div class="ws-answer-lines">${escapeHTML(lines)}</div>`;
  }

  /**
   * Renders Tab 3: 5-Question Quiz
   */
  function renderQuizTab(data) {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    const quiz = data.quiz || {};
    const questions = quiz.questions || [];

    let html = questions.map((q, idx) => `
      <div class="quiz-card">
        <div class="quiz-question-title">${idx + 1}. ${escapeHTML(q.question || q.questionText)}</div>
        <div class="quiz-options-list">
          ${(q.options || []).map(opt => `
            <div class="quiz-option-item">
              ${escapeHTML(opt)}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Renders Tab 4: Teacher Answer Key
   */
  function renderAnswerKeyTab(data) {
    const container = document.getElementById('answerKeyContainer');
    if (!container) return;

    const quiz = data.quiz || {};
    const questions = quiz.questions || [];

    let html = questions.map((q, idx) => `
      <div class="answer-key-card">
        <div class="ak-question">${idx + 1}. ${escapeHTML(q.question || q.questionText)}</div>
        <div class="ak-correct-badge">
          <span>✓ Correct Answer:</span>
          <strong>${escapeHTML(q.correctAnswer || 'Answer provided in explanation')}</strong>
        </div>
        <div class="ak-explanation">
          <strong>Teacher Explanation:</strong> ${escapeHTML(q.explanation || 'No explanation provided.')}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Exports lesson plan to Google Docs
   */
  async function exportToGoogleDocs() {
    if (!currentLessonData) {
      UI.showToast('error', 'No Lesson Active', 'Please generate or load a lesson first.');
      return;
    }

    UI.showToast('info', 'Creating Google Doc...', 'Processing document export.');

    try {
      const response = await fetch('/api/create-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLessonData)
      });

      const data = await response.json();

      if (data.success && data.documentUrl) {
        UI.showToast('success', 'Google Doc Created! 📄', 'Opening document in a new tab.');
        window.open(data.documentUrl, '_blank');
      } else {
        // Smart fallback: Copy formatted lesson text to clipboard and launch Google Docs template
        copyLessonTextToClipboard();
        UI.showToast('info', 'Opening Google Docs', 'Copied lesson plan to clipboard! Opening blank Google Doc to paste (Ctrl+V).');
        setTimeout(() => {
          window.open('https://docs.google.com/document/create', '_blank');
        }, 800);
      }
    } catch (err) {
      console.error('[Google Docs Export Error]:', err);
      copyLessonTextToClipboard();
      UI.showToast('info', 'Opening Google Docs', 'Copied lesson plan to clipboard! Opening Google Docs (Ctrl+V to paste).');
      window.open('https://docs.google.com/document/create', '_blank');
    }
  }

  /**
   * Exports quiz to Google Forms
   */
  async function exportToGoogleForms() {
    if (!currentLessonData || !currentLessonData.quiz) {
      UI.showToast('error', 'No Quiz Active', 'Please generate a lesson with a quiz first.');
      return;
    }

    UI.showToast('info', 'Creating Google Form...', 'Building quiz export.');

    try {
      const response = await fetch('/api/create-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: currentLessonData.quiz,
          topic: currentLessonData.lesson?.topic
        })
      });

      const data = await response.json();

      if (data.success && data.formUrl) {
        UI.showToast('success', 'Google Form Created! 📝', 'Opening live quiz form in a new tab.');
        window.open(data.formUrl, '_blank');
      } else {
        // Smart fallback: Copy quiz questions to clipboard and launch Google Forms creator
        copyQuizTextToClipboard();
        UI.showToast('info', 'Opening Google Forms', 'Copied 5-question quiz to clipboard! Opening Google Forms editor (Ctrl+V to paste).');
        setTimeout(() => {
          window.open('https://docs.google.com/forms/create', '_blank');
        }, 800);
      }
    } catch (err) {
      console.error('[Google Forms Export Error]:', err);
      copyQuizTextToClipboard();
      UI.showToast('info', 'Opening Google Forms', 'Copied quiz to clipboard! Opening Google Forms.');
      window.open('https://docs.google.com/forms/create', '_blank');
    }
  }

  /**
   * Copies formatted lesson text to user clipboard
   */
  function copyLessonTextToClipboard() {
    if (!currentLessonData) return;
    const lesson = currentLessonData.lesson || {};
    let text = `${lesson.title || 'Lesson Plan'}\nSubject: ${lesson.subject} | Grade: ${lesson.grade} | Duration: ${lesson.duration}\n\n`;
    
    text += `LEARNING OBJECTIVES:\n`;
    (currentLessonData.learningObjectives || []).forEach(o => text += `• ${o}\n`);

    text += `\nREQUIRED MATERIALS:\n`;
    (currentLessonData.materials || []).forEach(m => text += `• ${m}\n`);

    text += `\nTIMELINE:\n`;
    (currentLessonData.timeline || []).forEach(t => text += `[${t.time || t.duration}] ${t.activity}: ${t.description}\n`);

    navigator.clipboard.writeText(text).catch(() => {});
  }

  /**
   * Copies 5-question quiz text to user clipboard
   */
  function copyQuizTextToClipboard() {
    if (!currentLessonData || !currentLessonData.quiz) return;
    const quiz = currentLessonData.quiz || {};
    let text = `${quiz.title || '5-Question Quiz'}\n\n`;

    (quiz.questions || []).forEach((q, i) => {
      text += `${i + 1}. ${q.question || q.questionText}\n`;
      (q.options || []).forEach(o => text += `   ${o}\n`);
      text += `\n`;
    });

    navigator.clipboard.writeText(text).catch(() => {});
  }

  /**
   * Saves current lesson to browser Local Storage
   */
  function saveCurrentLesson() {
    if (!currentLessonData || !currentLessonData.lesson) {
      UI.showToast('error', 'Save Error', 'No active lesson data to save.');
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem('lessoncraft_saved_lessons') || '[]');
      
      const newEntry = {
        id: Date.now(),
        createdAt: new Date().toLocaleDateString(),
        data: currentLessonData
      };

      saved.unshift(newEntry);
      localStorage.setItem('lessoncraft_saved_lessons', JSON.stringify(saved.slice(0, 10)));

      UI.showToast('success', 'Lesson Saved! 💾', 'Lesson stored in your local teacher workspace.');
      
      // Refresh recent lessons list on dashboard
      if (window.App && typeof window.App.loadRecentLessons === 'function') {
        window.App.loadRecentLessons();
      }
    } catch (e) {
      console.error('[Save Error]:', e);
      UI.showToast('error', 'Save Error', 'Could not access localStorage.');
    }
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    init,
    renderLessonResults
  };
})();
