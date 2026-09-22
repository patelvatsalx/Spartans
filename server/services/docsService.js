/**
 * Google Docs Service for LessonCraft AI
 * Creates formatted Google Documents for lesson plans & worksheets using googleapis.
 */

const { google } = require('googleapis');

/**
 * Creates a Google Doc for the generated lesson plan
 */
async function createGoogleDoc(lessonData) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey || clientEmail.trim() === '') {
    return {
      success: false,
      configured: false,
      message: 'Google Docs integration is not configured yet. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your .env file.'
    };
  }

  try {
    // Sanitize private key newline formatting
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    );

    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    const title = lessonData?.lesson?.title || `Lesson Plan: ${lessonData?.lesson?.topic || 'Untitled'}`;

    let documentId;
    try {
      // Method 1: Create new blank document via Docs API
      const createRes = await docs.documents.create({
        requestBody: { title }
      });
      documentId = createRes.data.documentId;
    } catch (createErr) {
      console.warn('[Docs Service] Direct docs.create failed, trying drive.files.create fallback...', createErr.message);
      // Method 2: Fallback to Drive API file creation
      const driveRes = await drive.files.create({
        requestBody: {
          name: title,
          mimeType: 'application/vnd.google-apps.document'
        }
      });
      documentId = driveRes.data.id;
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // Format content text
    const textContent = formatDocText(lessonData);

    // Insert text into document
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: textContent
            }
          }
        ]
      }
    });

    // Make document publicly readable via Drive API if service account allows
    try {
      await drive.permissions.create({
        fileId: documentId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('[Docs Service] Permission update notice:', permError.message);
    }

    return {
      success: true,
      configured: true,
      documentId,
      documentUrl,
      message: 'Google Doc created successfully!'
    };

  } catch (error) {
    console.error('[Google Docs Service Error]:', error.message || error);
    let msg = error.message;
    if (msg && msg.includes('caller does not have permission')) {
      msg = 'Service Account needs Editor permission. Go to Google Cloud Console > IAM & Admin > IAM and grant Editor role to lessoncraft-bot@planar-name-467804-b6.iam.gserviceaccount.com';
    }
    return {
      success: false,
      configured: true,
      message: `Google Docs Export Notice: ${msg}`
    };
  }
}

/**
 * Formats structured lesson plan data into human-readable text for Google Docs
 */
function formatDocText(data) {
  const lesson = data.lesson || {};
  let content = `${lesson.title || 'Lesson Plan'}\n`;
  content += `Subject: ${lesson.subject || ''} | Grade: ${lesson.grade || ''} | Duration: ${lesson.duration || ''} | Difficulty: ${lesson.difficulty || ''}\n`;
  content += `========================================================================\n\n`;

  // Learning Objectives
  content += `1. LEARNING OBJECTIVES\n`;
  content += `---------------------\n`;
  if (Array.isArray(data.learningObjectives)) {
    data.learningObjectives.forEach((obj, index) => {
      content += `• ${obj}\n`;
    });
  }
  content += `\n`;

  // Required Materials
  content += `2. REQUIRED MATERIALS\n`;
  content += `--------------------\n`;
  if (Array.isArray(data.materials)) {
    data.materials.forEach((mat) => {
      content += `• ${mat}\n`;
    });
  }
  content += `\n`;

  // Lesson Timeline
  content += `3. LESSON TIMELINE\n`;
  content += `-----------------\n`;
  if (Array.isArray(data.timeline)) {
    data.timeline.forEach((item) => {
      content += `[${item.time || item.duration}] ${item.activity}\n  ${item.description}\n\n`;
    });
  }

  // Activities
  content += `4. TEACHING & STUDENT ACTIVITIES\n`;
  content += `-------------------------------\n`;
  if (Array.isArray(data.activities)) {
    data.activities.forEach((act, idx) => {
      content += `Activity ${idx + 1}: ${act.title} (${act.duration})\n`;
      content += `  Teacher Action: ${act.teacherAction}\n`;
      content += `  Student Action: ${act.studentAction}\n\n`;
    });
  }

  // Assessment Strategy
  content += `5. ASSESSMENT STRATEGY\n`;
  content += `---------------------\n`;
  content += `${data.assessment || 'Formative assessment through observation and quiz results.'}\n\n`;

  // Student Worksheet
  if (data.worksheet) {
    content += `========================================================================\n`;
    content += `STUDENT WORKSHEET: ${data.worksheet.title || lesson.topic}\n`;
    content += `Instructions: ${data.worksheet.instructions || ''}\n\n`;
    if (Array.isArray(data.worksheet.questions)) {
      data.worksheet.questions.forEach((q, i) => {
        content += `Q${i + 1}. ${q.questionText || q.question}\n`;
        if (Array.isArray(q.options)) {
          q.options.forEach(opt => content += `   ${opt}\n`);
        }
        if (q.answerSpace) content += `   ${q.answerSpace}\n`;
        content += `\n`;
      });
    }
  }

  return content;
}

module.exports = {
  createGoogleDoc
};
