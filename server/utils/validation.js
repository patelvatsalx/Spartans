/**
 * Input Validation Utilities for LessonCraft AI
 */

function validateLessonInput(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid request payload'] };
  }

  const { subject, topic, grade, duration, difficulty } = data;

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    errors.push('Subject is required');
  }

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    errors.push('Topic is required');
  } else if (topic.trim().length < 2) {
    errors.push('Topic must be at least 2 characters long');
  }

  if (!grade || typeof grade !== 'string' || !grade.trim()) {
    errors.push('Grade level is required');
  }

  if (!duration || typeof duration !== 'string' || !duration.trim()) {
    errors.push('Class duration is required');
  }

  const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    errors.push('Difficulty must be Beginner, Intermediate, or Advanced');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateLessonInput
};
