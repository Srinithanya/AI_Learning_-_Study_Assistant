const API_BASE = 'http://localhost:8000/api';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(err.detail || `Server returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // Auth
  getMe: () => fetchAPI('/auth/me'),

  // Documents
  listDocuments: () => fetchAPI('/documents'),
  uploadDocument: (formData) => fetchAPI('/documents/upload', {
    method: 'POST',
    headers: {}, // Let browser set multipart boundary
    body: formData,
  }),
  deleteDocument: (id) => fetchAPI(`/documents/${id}`, { method: 'DELETE' }),
  getDocumentChunks: (id) => fetchAPI(`/documents/${id}/chunks`),

  // Agent Chat
  sendAgentMessage: (message, conversation_id = null, subject_filter = null) => fetchAPI('/agent/chat', {
    method: 'POST',
    body: { message, conversation_id, subject_filter },
  }),
  listConversations: () => fetchAPI('/agent/conversations'),
  getConversationMessages: (id) => fetchAPI(`/agent/conversations/${id}`),

  // Study Plans
  listStudyPlans: () => fetchAPI('/study-plans'),
  generateStudyPlan: (data) => fetchAPI('/study-plans/generate', { method: 'POST', body: data }),
  toggleTask: (taskId) => fetchAPI(`/study-plans/tasks/${taskId}/toggle`, { method: 'PATCH' }),
  deletePlan: (id) => fetchAPI(`/study-plans/${id}`, { method: 'DELETE' }),

  // Quizzes
  listQuizzes: () => fetchAPI('/quizzes'),
  generateQuiz: (data) => fetchAPI('/quizzes/generate', { method: 'POST', body: data }),
  submitQuiz: (quizId, answers) => fetchAPI(`/quizzes/${quizId}/submit`, { method: 'POST', body: { quiz_id: quizId, answers } }),
  getAttemptHistory: () => fetchAPI('/quizzes/attempts/history'),

  // Flashcards
  listFlashcardDecks: () => fetchAPI('/flashcards'),
  generateFlashcards: (data) => fetchAPI('/flashcards/generate', { method: 'POST', body: data }),

  // Memory Profile
  listMemories: (category = null) => fetchAPI(`/memory${category ? `?category=${category}` : ''}`),
  createMemory: (data) => fetchAPI('/memory', { method: 'POST', body: data }),
  deleteMemory: (id) => fetchAPI(`/memory/${id}`, { method: 'DELETE' }),
  clearAllMemories: () => fetchAPI('/memory/clear/all', { method: 'DELETE' }),

  // Progress Analytics
  getProgress: () => fetchAPI('/progress'),
};
