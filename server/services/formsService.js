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
        'https://www.googleapis.com/auth/drive'
      ]
    );

    const forms = google.forms({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    const title = quizData?.title || `Quiz: ${lessonTopic || 'Lesson Quiz'}`;
    
    // Create new Google Form
    const createRes = await forms.forms.create({
      requestBody: {
        info: {
          title,
          documentTitle: title
        }
      }
    });

    const formId = createRes.data.formId;
    const responderUri = createRes.data.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;

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
    return {
      success: false,
      configured: true,
      message: `Failed to create Google Form: ${error.message}`
    };
  }
}

module.exports = {
  createGoogleForm
};
