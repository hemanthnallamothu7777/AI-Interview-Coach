/**
 * Interview page — the core interview experience.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import QuestionCard from '../components/QuestionCard'
import VoiceControls from '../components/VoiceControls'
import { startInterview, evaluateAnswer, generateReport } from '../services/api'
import { speakText, cancelSpeech } from '../services/livekit'

const TOTAL_QUESTIONS = 5
const INTERVIEW_DURATION = 30 * 60

let msgIdCounter = 0
function mkId() { return `msg-${++msgIdCounter}` }

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Interview() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    role = 'React Developer',
    difficulty = 'Medium',
    interviewType = 'text',
    preloadedSession = null,
    isResumeBased = false,
  } = location.state || {}
  const isVoice = interviewType === 'voice'

  const [phase, setPhase] = useState('loading')
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluations, setEvaluations] = useState([])
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION)
  const timerRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [isFetchingReport, setIsFetchingReport] = useState(false)

  function pushMessage(type, content, data = null) {
    setMessages((prev) => [...prev, { id: mkId(), type, content, data }])
  }

  // Add this ref at the top of your component
  const textareaRef = useRef(null)

  // Auto-scroll to bottom whenever inputText changes
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [inputText])

  function maybeSpeak(text, onDone) {
    if (!isVoice) { if (onDone) onDone(); return }
    setIsSpeaking(true)
    speakText(text, () => { setIsSpeaking(false); if (onDone) onDone() })
  }

  useEffect(() => {
    if (!location.state) { navigate('/', { replace: true }); return }

    async function init() {
      try {
        setPhase('loading')
        let sessionData
        if (preloadedSession) {
          sessionData = preloadedSession
        } else {
          sessionData = await startInterview({ role, difficulty, interview_type: interviewType, num_questions: TOTAL_QUESTIONS })
        }

        setSessionId(sessionData.session_id)
        setQuestions(sessionData.questions)
        setPhase('active')

        const greeting = isResumeBased
          ? `Welcome! I'm your AI interviewer. I've analyzed your resume and prepared ${sessionData.questions.length} personalized questions. Let's begin!`
          : `Welcome! I'm your AI interviewer for this ${difficulty} ${role} interview. I'll ask you ${TOTAL_QUESTIONS} questions with detailed feedback.\n\nLet's begin!`

        pushMessage('ai', greeting)
        setTimeout(() => {
          const q1 = sessionData.questions[0]
          pushMessage('ai', `Question 1: ${q1}`)
          maybeSpeak(`Question 1: ${q1}`)
        }, 800)

      } catch (err) {
        setError(err.message || 'Failed to start interview. Please check your connection and try again.')
        setPhase('error')
      }
    }

    init()

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)

    return () => { clearInterval(timerRef.current); cancelSpeech() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = useCallback(async (answerText) => {
    const trimmed = (answerText || inputText).trim()
    if (!trimmed || isSubmitting || currentQ >= questions.length) return

    const question = questions[currentQ]
    setIsSubmitting(true)
    setInputText('')
    pushMessage('user', trimmed)
    setIsTyping(true)

    try {
      const evaluation = await evaluateAnswer({ session_id: sessionId, question, answer: trimmed, role, question_index: currentQ })
      setIsTyping(false)
      pushMessage('evaluation', '', evaluation)

      const evalData = { question, answer: trimmed, score: evaluation.score, feedback: evaluation.feedback, improvement: evaluation.improvement }
      const updatedEvals = [...evaluations, evalData]
      setEvaluations(updatedEvals)

      const nextQ = currentQ + 1
      setCurrentQ(nextQ)

      if (nextQ < questions.length) {
        setTimeout(() => {
          const msg = `Question ${nextQ + 1}: ${questions[nextQ]}`
          pushMessage('ai', msg)
          maybeSpeak(msg)
        }, 600)
      } else {
        setTimeout(() => {
          pushMessage('ai', "You've answered all questions! Great job completing the interview. Click **Get My Report** below to see your detailed feedback and score.")
          setPhase('complete')
          clearInterval(timerRef.current)
        }, 600)
      }
    } catch (err) {
      setIsTyping(false)
      pushMessage('ai', `Sorry, there was an error evaluating your answer: ${err.message}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, isSubmitting, currentQ, questions, sessionId, role, evaluations])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  async function handleGetReport() {
    if (evaluations.length === 0) return
    setIsFetchingReport(true)
    try {
      const report = await generateReport({ session_id: sessionId, role, evaluations })
      navigate('/results', { state: { report, role, difficulty, evaluations } })
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`)
      setIsFetchingReport(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F6F1' }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-pulse"
            style={{ background: '#C45C1A', boxShadow: '0 8px 24px rgba(196,92,26,0.35)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="font-semibold text-lg" style={{ color: '#1C1410' }}>Preparing your interview…</p>
          <p className="text-sm" style={{ color: '#9E9189' }}>Generating {TOTAL_QUESTIONS} personalized questions for {role}</p>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F9F6F1' }}>
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(220,38,38,0.1)' }}>
            <svg className="w-7 h-7" style={{ color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-bold text-xl" style={{ color: '#1C1410' }}>Something went wrong</h2>
          <p className="text-sm" style={{ color: '#6B6358' }}>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // ── Active / Complete ─────────────────────────────────────────────────────
  const timerWarning = timeLeft < 300




  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F6F1' }}>
      {/* Background blob */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full"
          style={{ background: '#C45C1A', opacity: 0.05, filter: 'blur(80px)' }} />
      </div>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(249,246,241,0.88)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => { cancelSpeech(); navigate('/app') }}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: '#9E9189' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1C1410'}
            onMouseLeave={e => e.currentTarget.style.color = '#9E9189'}
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
          <div className="flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1.5 rounded-lg"
            style={timerWarning
              ? { color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)' }
              : { color: '#6B6358', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.6)' }
            }>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* ── Chat area ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
        <ChatWindow messages={messages} isTyping={isTyping} />
      </main>

      {/* ── Input area ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-4 py-4"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)', background: 'rgba(249,246,241,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-3xl mx-auto space-y-3">

          {isVoice && phase === 'active' && (
            <VoiceControls
              disabled={isSubmitting || currentQ >= questions.length}
              isSpeaking={isSpeaking}
              resetTrigger={currentQ}
              onTranscriptUpdate={(text) => setInputText(text)}
              onTranscriptFinal={(text) => setInputText(text)}
            />
          )}

          {phase === 'active' && (
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
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
                style={{
                  fontWeight: inputText.trim() ? '600' : '400',
                  transition: 'font-weight 0.15s ease',
                }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={inputText.trim().length < 50 || isSubmitting || currentQ >= questions.length}
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
              <button onClick={() => navigate('/app')} className="btn-secondary px-6">
                New Interview
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm rounded-xl px-4 py-3"
              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)' }}>
              {error}
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
