/**
 * LessonCraft AI - UI Helper Module
 * Controls view switching, toast notifications, tabs, and loading modal animations.
 */

const UI = (function() {
  
  /**
   * Display floating toast notification
   * @param {'success' | 'error' | 'info'} type 
   * @param {string} title 
   * @param {string} message 
   */
  function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Switches active view section
   * @param {string} viewId ('dashboardView' | 'createView' | 'resultsView')
   */
  function showView(viewId) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav link highlighting
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    navLinks.forEach(link => {
      if (link.dataset.target === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Initializes tab switcher
   */
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.tab;
        
        // Remove active from all tabs & buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

        // Activate target
        btn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  }

  let animationInterval = null;

  /**
   * Starts the animated step sequence modal during lesson generation
   */
  function startGenerationAnimation() {
    const modal = document.getElementById('generationModal');
    if (!modal) return;

    modal.classList.add('active');

    const steps = ['step1', 'step2', 'step3', 'step4'];
    steps.forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        el.className = 'step-item';
      }
    });

    let currentStep = 0;
    const activateStep = (idx) => {
      steps.forEach((s, i) => {
        const el = document.getElementById(s);
        if (!el) return;
        if (i < idx) {
          el.className = 'step-item completed';
        } else if (i === idx) {
          el.className = 'step-item active';
        } else {
          el.className = 'step-item';
        }
      });
    };

    activateStep(0);
    currentStep = 1;

    clearInterval(animationInterval);
    animationInterval = setInterval(() => {
      if (currentStep < steps.length) {
        activateStep(currentStep);
        currentStep++;
      } else {
        clearInterval(animationInterval);
      }
    }, 700);
  }

  /**
   * Hides the generation modal smoothly
   */
  function stopGenerationAnimation() {
    clearInterval(animationInterval);
    const modal = document.getElementById('generationModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  return {
    showToast,
    showView,
    initTabs,
    startGenerationAnimation,
    stopGenerationAnimation
  };
})();
