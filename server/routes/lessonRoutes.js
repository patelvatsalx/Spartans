/**
 * Express Router for LessonCraft AI API
 */

const express = require('express');
const router = express.Router();
const { validateLessonInput } = require('../utils/validation');
const { generateLessonPlan } = require('../services/geminiService');
const { createGoogleDoc } = require('../services/docsService');
const { createGoogleForm } = require('../services/formsService');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const hasGoogleCreds = !!process.env.GOOGLE_CLIENT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY;

  res.json({
    status: 'ok',
    app: 'LessonCraft AI Backend',
    timestamp: new Date().toISOString(),
    integrations: {
      gemini: {
        configured: hasGeminiKey,
        mode: hasGeminiKey ? 'Live Google Gemini API' : 'Demonstration / High-quality Template Mode'
      },
      googleDocs: {
        configured: hasGoogleCreds
      },
      googleForms: {
        configured: hasGoogleCreds
      }
    }
  });
});

/**
 * Generate complete lesson plan using Gemini API
 * POST /api/generate-lesson
 */
router.post('/generate-lesson', async (req, res) => {
  try {
    const { isValid, errors } = validateLessonInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    const { subject, topic, grade, duration, difficulty, objectives } = req.body;

    console.log(`[API /generate-lesson] Request received for Topic: "${topic}", Subject: "${subject}", Grade: "${grade}"`);

    const result = await generateLessonPlan({
      subject,
      topic,
      grade,
      duration,
      difficulty,
      objectives
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[API /generate-lesson Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred while generating your lesson plan.'
    });
  }
});

/**
 * Export lesson plan to Google Docs
 * POST /api/create-doc
 */
router.post('/create-doc', async (req, res) => {
  try {
    const lessonData = req.body;
    if (!lessonData || !lessonData.lesson) {
      return res.status(400).json({
        success: false,
        error: 'Lesson data payload is required'
      });
    }

    const result = await createGoogleDoc(lessonData);
    
    if (!result.success && !result.configured) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: result.message
      });
    }

    return res.json(result);

  } catch (error) {
    console.error('[API /create-doc Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Google Doc.'
    });
  }
});

/**
 * Export quiz to Google Form
 * POST /api/create-form
 */
router.post('/create-form', async (req, res) => {
  try {
    const { quiz, topic } = req.body;
    if (!quiz) {
      return res.status(400).json({
        success: false,
        error: 'Quiz data is required'
      });
    }

    const result = await createGoogleForm(quiz, topic);

    if (!result.success && !result.configured) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: result.message
      });
    }

    return res.json(result);

  } catch (error) {
    console.error('[API /create-form Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Google Form.'
    });
  }
});

module.exports = router;
