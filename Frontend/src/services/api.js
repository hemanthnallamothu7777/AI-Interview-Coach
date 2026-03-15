/**
 * API service — all backend communication goes through this module.
 * Vite's proxy forwards /interview and /evaluation to http://localhost:8000.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',            // relative URLs — Vite proxy handles routing in dev
  timeout: 60_000,        // 60s timeout for slow AI responses
  headers: { 'Content-Type': 'application/json' },
})

// Log errors in development
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Unknown error'
    console.error('[API Error]', msg, err.response?.status)
    return Promise.reject(new Error(msg))
  }
)

/**
 * Start a new interview session.
 * @param {object} params - { role, difficulty, interview_type, num_questions }
 * @returns {Promise<{ session_id, questions, room_name, livekit_token }>}
 */
export async function startInterview({ role, difficulty, interview_type = 'text', num_questions = 5 }) {
  const { data } = await api.post('/interview/start', {
    role,
    difficulty,
    interview_type,
    num_questions,
  })
  return data
}

/**
 * Submit and evaluate a candidate's answer.
 * @param {object} params - { session_id, question, answer, role, question_index }
 * @returns {Promise<{ score, feedback, improvement, follow_up }>}
 */
export async function evaluateAnswer({ session_id, question, answer, role, question_index }) {
  const { data } = await api.post('/interview/evaluate', {
    session_id,
    question,
    answer,
    role,
    question_index,
  })
  return data
}

/**
 * Generate final interview report.
 * @param {object} params - { session_id, role, evaluations }
 * @returns {Promise<{ overall_score, strengths, weaknesses, improvement_plan, summary }>}
 */
export async function generateReport({ session_id, role, evaluations }) {
  const { data } = await api.post('/evaluation/report', {
    session_id,
    role,
    evaluations,
  })
  return data
}

/**
 * Get a LiveKit access token for voice interview.
 * @param {string} room_name
 * @param {string} participant_name
 * @returns {Promise<{ token, url }>}
 */
export async function getLiveKitToken(room_name, participant_name) {
  const { data } = await api.post('/interview/livekit-token', {
    room_name,
    participant_name,
  })
  return data
}

export default api
