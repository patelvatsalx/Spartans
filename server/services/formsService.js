/**
 * Google Forms Service for LessonCraft AI
 * Creates interactive Google Forms quizzes using googleapis.
 */

const { google } = require('googleapis');

/**
 * Creates a Google Form Quiz from generated quiz questions
 */
async function createGoogleForm(quizData, lessonTopic) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey || clientEmail.trim() === '') {
    return {
      success: false,
      configured: false,
      message: 'Google Forms integration is not configured yet. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your .env file.'
    };
  }

  try {
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      [
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    );

    const forms = google.forms({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    const title = quizData?.title || `Quiz: ${lessonTopic || 'Lesson Quiz'}`;

    let formId;
    let responderUri;

    try {
      // Method 1: Create new Google Form via Forms API
      const createRes = await forms.forms.create({
        requestBody: {
          info: { title }
        }
      });
      formId = createRes.data.formId;
      responderUri = createRes.data.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;
    } catch (createErr) {
      console.warn('[Forms Service] Direct forms.create failed, trying drive.files.create fallback...', createErr.message);
      // Method 2: Fallback to Drive API file creation
      const driveRes = await drive.files.create({
        requestBody: {
          name: title,
          mimeType: 'application/vnd.google-apps.form'
        }
      });
      formId = driveRes.data.id;
      responderUri = `https://docs.google.com/forms/d/${formId}/viewform`;
    }

    const questions = quizData?.questions || [];
    const updateRequests = [];

    // Add each quiz question
    questions.forEach((q, index) => {
      const options = (q.options || []).map(opt => ({ value: opt }));
      
      updateRequests.push({
        createItem: {
          item: {
            title: `${index + 1}. ${q.question || q.questionText}`,
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: options.length > 0 ? options : [{ value: 'Option 1' }, { value: 'Option 2' }]
                }
              }
            }
          },
          location: {
            index: index
          }
        }
      });
    });

    if (updateRequests.length > 0) {
      await forms.forms.batchUpdate({
        formId,
        requestBody: {
          requests: updateRequests
        }
      });
    }

    // Attempt to make form publicly accessible
    try {
      await drive.permissions.create({
        fileId: formId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('[Forms Service] Permission update notice:', permError.message);
    }

    return {
      success: true,
      configured: true,
      formId,
      formUrl: responderUri,
      message: 'Google Form created successfully!'
    };

  } catch (error) {
    console.error('[Google Forms Service Error]:', error.message || error);
    let msg = error.message;
    if (msg && (msg.includes('caller does not have permission') || msg.includes('Internal error'))) {
      msg = 'Service Account needs Editor permission. Go to Google Cloud Console > IAM & Admin > IAM and grant Editor role to lessoncraft-bot@planar-name-467804-b6.iam.gserviceaccount.com';
    }
    return {
      success: false,
      configured: true,
      message: `Google Forms Export Notice: ${msg}`
    };
  }
}

module.exports = {
  createGoogleForm
};
