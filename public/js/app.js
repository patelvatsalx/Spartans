/**
 * LessonCraft AI - Main Application Entrypoint
 * Bootstraps views, event delegation, recent lessons loading, and backend health check.
 */

window.App = (function() {

  function init() {
    console.log('🚀 LessonCraft AI Initializing...');

    // Initialize UI components & tab listeners
    UI.initTabs();
    CreateForm.init();
    Results.init();

    // Navigation Links
    document.querySelectorAll('.nav-link[data-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        UI.showView(link.dataset.target);
      });
    });

    document.getElementById('navBrandBtn')?.addEventListener('click', () => UI.showView('dashboardView'));
    document.getElementById('heroCreateBtn')?.addEventListener('click', () => UI.showView('createView'));
    document.getElementById('dashboardNewBtn')?.addEventListener('click', () => UI.showView('createView'));
    
    // Demo button triggers Science prefill and navigates to Create view
    document.getElementById('heroDemoBtn')?.addEventListener('click', () => {
      UI.showView('createView');
      CreateForm.prefillScienceDemo();
    });

    document.getElementById('navExamplesBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      UI.showView('dashboardView');
      const rec = document.getElementById('recentLessonsGrid');
      if (rec) rec.scrollIntoView({ behavior: 'smooth' });
    });

    // Populate recent lessons grid
    loadRecentLessons();

    // Check Backend & Gemini API Status
    checkBackendHealth();
  }

  /**
   * Fetches health check from Express backend
   */
  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      
      const badgeText = document.getElementById('geminiStatusText');
      if (badgeText && data.integrations && data.integrations.gemini) {
        if (data.integrations.gemini.configured) {
          badgeText.textContent = 'Gemini 2.5 Live';
        } else {
          badgeText.textContent = 'Gemini Demo Mode';
        }
      }
    } catch (e) {
      console.warn('[Health Check Warning]: Backend API unreachable or running offline.', e);
    }
  }

  /**
   * Loads saved lessons from localStorage or populates initial high-quality hackathon demo lessons
   */
  function loadRecentLessons() {
    const grid = document.getElementById('recentLessonsGrid');
    if (!grid) return;

    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('lessoncraft_saved_lessons') || '[]');
    } catch (e) {
      saved = [];
    }

    // Default high quality demo lessons for instant hackathon demo
    const defaultDemos = [
      {
        id: 'demo-1',
        createdAt: 'Demo',
        data: {
          lesson: {
            title: 'Photosynthesis: How Plants Turn Sunlight into Energy',
            subject: 'Science',
            topic: 'Photosynthesis & Plant Energy',
            grade: 'Grade 8',
            duration: '45 minutes',
            difficulty: 'Intermediate'
          }
        }
      },
      {
        id: 'demo-2',
        createdAt: 'Demo',
        data: {
          lesson: {
            title: 'Introduction to Fractions & Equivalent Parts',
            subject: 'Mathematics',
            topic: 'Fractions & Ratios',
            grade: 'Grade 7',
            duration: '45 minutes',
            difficulty: 'Intermediate'
          }
        }
      },
      {
        id: 'demo-3',
        createdAt: 'Demo',
        data: {
          lesson: {
            title: 'The Ecosystem Balance & Food Web Chains',
            subject: 'Science',
            topic: 'Ecosystems & Energy Flow',
            grade: 'Grade 6',
            duration: '60 minutes',
            difficulty: 'Beginner'
          }
        }
      }
    ];

    const allLessons = [...saved, ...defaultDemos];

    grid.innerHTML = allLessons.map((item, index) => {
      const lesson = item.data?.lesson || {};
      return `
        <div class="lesson-card" data-index="${index}">
          <div>
            <div class="lesson-card-header">
              <span class="lesson-card-subject">${escapeHTML(lesson.subject || 'Subject')}</span>
              <span class="badge badge-primary">${escapeHTML(lesson.grade || 'Grade')}</span>
            </div>
            <h3 class="lesson-card-title">${escapeHTML(lesson.title || lesson.topic)}</h3>
            <div class="lesson-card-meta">
              <span>⏱️ ${escapeHTML(lesson.duration || '45 min')}</span>
              <span>📊 ${escapeHTML(lesson.difficulty || 'Intermediate')}</span>
            </div>
          </div>
          <div class="lesson-card-footer">
            <span style="color: var(--color-brand-primary); font-weight: 700;">Open Lesson →</span>
            <span style="color: var(--color-neutral-400); font-size: 0.8rem;">${item.createdAt || 'Recent'}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to load lesson into Results view
    grid.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        const selected = allLessons[idx];
        if (selected && selected.data) {
          // If demo lesson without full payload, prefill and generate, or render mock payload
          if (selected.id === 'demo-1') {
            UI.showView('createView');
            CreateForm.prefillScienceDemo();
          } else {
            Results.renderLessonResults(selected.data);
            UI.showView('resultsView');
            UI.showToast('info', 'Lesson Loaded', `Opened "${selected.data.lesson?.topic || 'Lesson'}"`);
          }
        }
      });
    });
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    init,
    loadRecentLessons
  };
})();

// Boot app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', window.App.init);
