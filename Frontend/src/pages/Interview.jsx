/**
 * Interview page — the core interview experience.
 *
 * Flow:
 *  1. Mounts → calls POST /interview/start → gets session_id + questions
 *  2. Shows Q1 in chat as AI message
 *  3. User types (text mode) or speaks (voice mode) their answer
 *  4. Calls POST /interview/evaluate → shows ScoreCard in chat
 *  5. Shows next question, repeat for all 5
 *  6. After all answered → "Get Report" button → POST /evaluation/report
 *  7. Navigate to /results with report data
 *
 * Voice mode extras:
 *  - AI reads each question using SpeechSynthesis
 *  - VoiceControls component captures mic input via SpeechRecognition
 *  - Transcript fills the answer input automatically
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import QuestionCard from '../components/QuestionCard'
import VoiceControls from '../components/VoiceControls'
import { startInterview, evaluateAnswer, generateReport } from '../services/api'
import { speakText, cancelSpeech } from '../services/livekit'

const TOTAL_QUESTIONS = 5
const INTERVIEW_DURATION = 30 * 60 // 30 minutes in seconds

let msgIdCounter = 0
function mkId() { return `msg-${++msgIdCounter}` }

/** Format seconds as MM:SS */
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Interview() {
  const navigate = useNavigate()
  const location = useLocation()

  // ── Setup data from Home page ────────────────────────────────────────────
  const { role = 'React Developer', difficulty = 'Medium', interviewType = 'text' } =
    location.state || {}
  const isVoice = interviewType === 'voice'

  // ── Session state ────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('loading')   // loading | active | complete | error
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)

  // ── Chat state ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  // ── Answer input ─────────────────────────────────────────────────────────
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Evaluations for final report ─────────────────────────────────────────
  const [evaluations, setEvaluations] = useState([])

  // ── Timer ────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION)
  const timerRef = useRef(null)

  // ── Voice TTS ────────────────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false)

  // ── Error ────────────────────────────────────────────────────────────────
  const [error, setError] = useState('')

  // ── Report loading ───────────────────────────────────────────────────────
  const [isFetchingReport, setIsFetchingReport] = useState(false)

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────

  function pushMessage(type, content, data = null) {
    setMessages((prev) => [...prev, { id: mkId(), type, content, data }])
  }

  /** Speak a question aloud if in voice mode. */
  function maybeSpeak(text, onDone) {
    if (!isVoice) {
      if (onDone) onDone()
      return
    }
    setIsSpeaking(true)
    speakText(text, () => {
      setIsSpeaking(false)
      if (onDone) onDone()
    })
  }

  // ────────────────────────────────────────────────────────────────────────
  // Session start
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true })
      return
    }

    async function init() {
      try {
        setPhase('loading')
        const data = await startInterview({
          role,
          difficulty,
          interview_type: interviewType,
          num_questions: TOTAL_QUESTIONS,
        })

        setSessionId(data.session_id)
        setQuestions(data.questions)
        setPhase('active')

        // Greet + show first question
        const greeting = `Welcome! I'm your AI interviewer for this ${difficulty} ${role} interview. I'll ask you ${TOTAL_QUESTIONS} questions and provide detailed feedback after each answer.\n\nLet's begin!`
        pushMessage('ai', greeting)

        // Small delay before showing first question for UX
        setTimeout(() => {
          const q1 = data.questions[0]
          pushMessage('ai', `Question 1: ${q1}`)
          maybeSpeak(`Question 1: ${q1}`)
        }, 800)

      } catch (err) {
        setError(err.message || 'Failed to start interview. Please check your API key and try again.')
        setPhase('error')
      }
    }

    init()

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ────────────────────────────────────────────────────────────────────────
  // Submit answer
  // ────────────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (answerText) => {
    const trimmed = (answerText || inputText).trim()
    if (!trimmed || isSubmitting || currentQ >= questions.length) return

    const question = questions[currentQ]
    setIsSubmitting(true)
    setInputText('')

    // Add user message to chat
    pushMessage('user', trimmed)
    setIsTyping(true)

    try {
      const evaluation = await evaluateAnswer({
        session_id: sessionId,
        question,
        answer: trimmed,
        role,
        question_index: currentQ,
      })

      setIsTyping(false)

      // Show evaluation card in chat
      pushMessage('evaluation', '', evaluation)

      // Store evaluation for final report
      const evalData = {
        question,
        answer: trimmed,
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvement: evaluation.improvement,
      }
      const updatedEvals = [...evaluations, evalData]
      setEvaluations(updatedEvals)

      const nextQ = currentQ + 1
      setCurrentQ(nextQ)

      if (nextQ < questions.length) {
        // Small pause, then show next question
        setTimeout(() => {
          const nextQuestion = questions[nextQ]
          const msg = `Question ${nextQ + 1}: ${nextQuestion}`
          pushMessage('ai', msg)
          maybeSpeak(msg)
        }, 600)
      } else {
        // All questions answered
        setTimeout(() => {
          pushMessage('ai', "You've answered all questions! Great job completing the interview. Click **Get My Report** below to see your detailed feedback and score.")
          setPhase('complete')
          clearInterval(timerRef.current)
        }, 600)
      }

    } catch (err) {
      setIsTyping(false)
      pushMessage('ai', `Sorry, there was an error evaluating your answer: ${err.message}. Please try submitting again.`)
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, isSubmitting, currentQ, questions, sessionId, role, evaluations])

  // ────────────────────────────────────────────────────────────────────────
  // Handle Enter key in textarea
  // ────────────────────────────────────────────────────────────────────────

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Get final report
  // ────────────────────────────────────────────────────────────────────────

  async function handleGetReport() {
    if (evaluations.length === 0) return
    setIsFetchingReport(true)

    try {
      const report = await generateReport({
        session_id: sessionId,
        role,
        evaluations,
      })
      navigate('/results', { state: { report, role, difficulty, evaluations } })
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`)
      setIsFetchingReport(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Render: Loading
  // ────────────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-lg">Preparing your interview…</p>
          <p className="text-white/40 text-sm">Generating {TOTAL_QUESTIONS} personalized questions for {role}</p>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // Render: Error
  // ────────────────────────────────────────────────────────────────────────

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl">Something went wrong</h2>
          <p className="text-white/60 text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // Render: Active / Complete interview
  // ────────────────────────────────────────────────────────────────────────

  const timerWarning = timeLeft < 300  // warn when < 5 minutes

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Background orb */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => { cancelSpeech(); navigate('/') }}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Exit
          </button>

          <QuestionCard
            current={Math.min(currentQ, TOTAL_QUESTIONS)}
            total={TOTAL_QUESTIONS}
            role={role}
            difficulty={difficulty}
          />

          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1.5 rounded-lg border
            ${timerWarning
              ? 'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse'
              : 'text-white/60 border-white/10 bg-white/5'
            }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* ── Chat area ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
        <ChatWindow messages={messages} isTyping={isTyping} />
      </main>

      {/* ── Input area ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">

          {/* Voice controls (voice mode only) */}
          {isVoice && phase === 'active' && (
            <VoiceControls
              disabled={isSubmitting || currentQ >= questions.length}
              isSpeaking={isSpeaking}
              onTranscriptUpdate={(text) => setInputText(text)}
              onTranscriptFinal={(text) => {
                setInputText(text)
                // Auto-submit after voice transcript is final
                setTimeout(() => handleSubmit(text), 300)
              }}
            />
          )}

          {/* Text input */}
          {phase === 'active' && (
            <div className="flex gap-3 items-end">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isVoice
                    ? 'Your speech will appear here, or type manually…'
                    : 'Type your answer here… (Enter to submit, Shift+Enter for new line)'
                }
                rows={3}
                disabled={isSubmitting || currentQ >= questions.length}
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isSubmitting || currentQ >= questions.length}
                className="btn-primary px-5 py-3 flex-shrink-0 self-stretch flex items-center gap-2"
              >
                {isSubmitting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isSubmitting ? 'Evaluating…' : 'Submit'}</span>
              </button>
            </div>
          )}

          {/* Get Report button (phase === complete) */}
          {phase === 'complete' && (
            <div className="flex gap-3">
              <button
                onClick={handleGetReport}
                disabled={isFetchingReport}
                className="btn-primary flex-1 py-4 text-base flex items-center justify-center gap-2"
              >
                {isFetchingReport ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Report…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Get My Interview Report
                  </>
                )}
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary px-6">
                New Interview
              </button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
