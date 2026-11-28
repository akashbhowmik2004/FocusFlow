import { request } from './apiClient'

const API_BASE = '/api/learning'

export async function getTopicLearningHub(topicId) {
  if (!topicId) throw new Error('Topic ID is required')
  return request(`${API_BASE}/topics/${topicId}/learning`, {
    method: 'GET',
  })
}

export async function requestPdfUploadUrl({ fileName, size }) {
  return request(`${API_BASE}/uploads/pdf-url`, {
    method: 'POST',
    body: JSON.stringify({ fileName, size }),
  })
}

export async function generateQuiz(
  topicId,
  {
    difficulty = 'medium',
    questionCount = 5,
    questionTypes = ['mcq'],
    customNotes = '',
    sourceDocument = null,
  } = {},
  { signal } = {}
) {
  if (!topicId) throw new Error('Topic ID is required')

  return request(`${API_BASE}/topics/${topicId}/quizzes`, {
    method: 'POST',
    signal,
    body: JSON.stringify({
      difficulty,
      questionCount,
      questionTypes,
      customNotes,
      ...(sourceDocument ? { sourceDocument } : {}),
    }),
  })
}

export const generateTopicQuiz = generateQuiz

export async function submitQuiz(quizId, answers, timeSpentSec = 0, confidence = {}) {
  if (!quizId) throw new Error('Quiz ID is required')

  return request(`${API_BASE}/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      answers,
      timeSpentSec,
      confidence,
    }),
  })
}

export async function evaluateConceptualAnswer(questionId, studentAnswer, confidence = 'Medium') {
  if (!questionId) throw new Error('Question ID is required')

  return request(`${API_BASE}/questions/${questionId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({
      studentAnswer,
      confidence,
    }),
  })
}

export async function getFlashcards(topicId, dueOnly = false) {
  if (!topicId) throw new Error('Topic ID is required')
  const qs = dueOnly ? '?dueOnly=true' : ''
  return request(`${API_BASE}/topics/${topicId}/flashcards${qs}`, {
    method: 'GET',
  })
}

export async function generateFlashcards(topicId, count = 5, customNotes = '') {
  if (!topicId) throw new Error('Topic ID is required')
  return request(`${API_BASE}/topics/${topicId}/flashcards/generate`, {
    method: 'POST',
    body: JSON.stringify({ count, customNotes }),
  })
}

export async function reviewFlashcard(flashcardId, rating) {
  if (!flashcardId) throw new Error('Flashcard ID is required')
  return request(`${API_BASE}/flashcards/${flashcardId}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ rating: String(rating).toUpperCase() }),
  })
}

export async function getMistakes() {
  return request(`${API_BASE}/mistakes`, {
    method: 'GET',
  })
}

export async function resolveMistake(mistakeId) {
  if (!mistakeId) throw new Error('Mistake ID is required')
  return request(`${API_BASE}/mistakes/${mistakeId}/resolve`, {
    method: 'PATCH',
  })
}

export async function getAIUsage() {
  return request(`${API_BASE}/usage`, {
    method: 'GET',
  })
}

export const learningService = {
  getTopicLearningHub,
  generateQuiz,
  generateTopicQuiz,
  submitQuiz,
  evaluateConceptualAnswer,
  getFlashcards,
  generateFlashcards,
  reviewFlashcard,
  getMistakes,
  resolveMistake,
  getAIUsage,
}

export default learningService
