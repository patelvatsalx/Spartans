/**
 * LessonCraft AI - Create View Module
 * Form management, live AI preview updater, demo prefill, and generation API handler.
 */

const CreateForm = (function() {

  function init() {
    const form = document.getElementById('lessonForm');
    const topicInput = document.getElementById('topicInput');
    const subjectInput = document.getElementById('subjectInput');
    const gradeInput = document.getElementById('gradeInput');
    const durationInput = document.getElementById('durationInput');
    const objectivesInput = document.getElementById('objectivesInput');
    const charCount = document.getElementById('charCount');
    const prefillBtn = document.getElementById('prefillExampleBtn');

    if (!form) return;

    // Character counter
    if (objectivesInput && charCount) {
      objectivesInput.addEventListener('input', () => {
        charCount.textContent = objectivesInput.value.length;
      });
    }

    // Input listeners for live preview card updates
    const inputsToWatch = [topicInput, subjectInput, gradeInput, durationInput];
    inputsToWatch.forEach(input => {
      if (input) {
        input.addEventListener('input', updateLivePreview);
        input.addEventListener('change', updateLivePreview);
      }
    });

    const diffRadios = document.querySelectorAll('input[name="difficulty"]');
    diffRadios.forEach(radio => radio.addEventListener('change', updateLivePreview));

    // Prefill button event listener
    if (prefillBtn) {
      prefillBtn.addEventListener('click', prefillScienceDemo);
    }

    // Form submit listener
    form.addEventListener('submit', handleFormSubmit);

    // Initial preview update
    updateLivePreview();
  }

  /**
   * Updates live preview card on the right column
   */
  function updateLivePreview() {
    const subject = document.getElementById('subjectInput')?.value || 'Science';
    const topic = document.getElementById('topicInput')?.value || 'Photosynthesis';
    const grade = document.getElementById('gradeInput')?.value || 'Grade 8';
    const duration = document.getElementById('durationInput')?.value || '45 minutes';
    
    let difficulty = 'Intermediate';
    const checkedDiff = document.querySelector('input[name="difficulty"]:checked');
    if (checkedDiff) difficulty = checkedDiff.value;

    // Update badges
    const subBadge = document.getElementById('previewSubjectBadge');
    if (subBadge) subBadge.textContent = subject;

    const grBadge = document.getElementById('previewGradeBadge');
    if (grBadge) grBadge.textContent = grade;

    const durBadge = document.getElementById('previewDurationBadge');
    if (durBadge) durBadge.textContent = duration;

    // Update text
    const topicText = document.getElementById('previewTopicText');
    if (topicText) topicText.textContent = topic || 'Enter a topic above...';

    const diffText = document.getElementById('previewDiffText');
    if (diffText) diffText.textContent = difficulty;
  }

  /**
   * Prefills form with Science Photosynthesis demo data
   */
  function prefillScienceDemo() {
    const subjectInput = document.getElementById('subjectInput');
    const topicInput = document.getElementById('topicInput');
    const gradeInput = document.getElementById('gradeInput');
    const durationInput = document.getElementById('durationInput');
    const objectivesInput = document.getElementById('objectivesInput');
    const charCount = document.getElementById('charCount');

    if (subjectInput) subjectInput.value = 'Science';
    if (topicInput) topicInput.value = 'Photosynthesis & Cell Energy';
    if (gradeInput) gradeInput.value = 'Grade 8';
    if (durationInput) durationInput.value = '45 minutes';
    
    const diffInter = document.getElementById('diffIntermediate');
    if (diffInter) diffInter.checked = true;

    if (objectivesInput) {
      objectivesInput.value = 'Students will understand how plants convert light energy into chemical energy and identify key chemical inputs (CO2, H2O) and outputs (Glucose, O2).';
      if (charCount) charCount.textContent = objectivesInput.value.length;
    }

    updateLivePreview();
    UI.showToast('info', 'Demo Loaded', 'Prefilled form with Science: Photosynthesis topic.');
  }

  /**
   * Handles Form Submission to Backend API
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    const subject = document.getElementById('subjectInput').value;
    const topic = document.getElementById('topicInput').value.trim();
    const grade = document.getElementById('gradeInput').value;
    const duration = document.getElementById('durationInput').value;
    const objectives = document.getElementById('objectivesInput').value.trim();
    
    let difficulty = 'Intermediate';
    const checkedDiff = document.querySelector('input[name="difficulty"]:checked');
    if (checkedDiff) difficulty = checkedDiff.value;

    if (!topic) {
      UI.showToast('error', 'Missing Topic', 'Please enter a topic for your lesson.');
      return;
    }

    const payload = {
      subject,
      topic,
      grade,
      duration,
      difficulty,
      objectives
    };

    // Show generation progress modal
    UI.startGenerationAnimation();

    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate lesson plan.');
      }

      // Small delay to let final step animation display nicely
      setTimeout(() => {
        UI.stopGenerationAnimation();
        
        // Render generated results into UI
        Results.renderLessonResults(data.data);

        // Switch view to Results
        UI.showView('resultsView');

        UI.showToast('success', 'Lesson Ready! 🎉', 'Your lesson plan, worksheet, and quiz are ready.');
      }, 1000);

    } catch (err) {
      console.error('[Create Form Error]:', err);
      UI.stopGenerationAnimation();
      UI.showToast('error', 'Generation Error', err.message || 'Could not connect to Gemini backend server.');
    }
  }

  return {
    init,
    prefillScienceDemo
  };
})();
