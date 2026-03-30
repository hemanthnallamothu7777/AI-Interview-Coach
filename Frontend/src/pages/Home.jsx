/**
 * Home page — interview setup screen.
 * User selects role, difficulty, and interview type, then clicks "Start Interview".
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  { value: "React Developer", icon: "⚛️" },
  { value: "Frontend Developer", icon: "🎨" },
  { value: "Backend Developer", icon: "⚙️" },
  { value: "Full Stack Developer", icon: "🔧" },
  { value: "React Native Developer", icon: "📱" },
  { value: "Node.js Developer", icon: "🟢" },
  { value: "Python Developer", icon: "🐍" },
  { value: "AI Engineer", icon: "🤖" },
  { value: "Machine Learning Engineer", icon: "🧠" },
  { value: "Data Scientist", icon: "📊" },
  { value: "DevOps Engineer", icon: "🚀" },
  { value: "Cloud Engineer", icon: "☁️" },
  { value: "System Design Engineer", icon: "🏗️" },
  { value: "Android Developer", icon: "🤖📱" },
  { value: "iOS Developer", icon: "🍎" },
]

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', desc: 'Fundamentals & basics', color: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50', activeColor: 'border-emerald-500 bg-emerald-500/10', dot: 'bg-emerald-500' },
  { value: 'Medium', label: 'Medium', desc: 'Intermediate concepts', color: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50', activeColor: 'border-amber-500 bg-amber-500/10', dot: 'bg-amber-500' },
  { value: 'Hard', label: 'Hard', desc: 'Advanced & system design', color: 'border-red-500/30 bg-red-500/5 hover:border-red-500/50', activeColor: 'border-red-500 bg-red-500/10', dot: 'bg-red-500' },
]

const INTERVIEW_TYPES = [
  {
    value: 'text',
    label: 'Text Interview',
    desc: 'Type your answers at your own pace',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    value: 'voice',
    label: 'Voice Interview',
    desc: 'Speak your answers — just like a real interview',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [difficulty, setDifficulty] = useState('Medium')
  const [interviewType, setInterviewType] = useState('text')
  const [showSuggestions, setShowSuggestions] = useState(false)

  function handleStart() {
    if (role === "") {
      alert("Role is required")
    } else {
      navigate('/interview', {
        state: { role, difficulty, interviewType },
      })
    }
  }

  const filteredRoles = ROLES.filter((r) =>
    r.value.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F9F6F1' }}>
      {/* Warm background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full" style={{ background: '#C45C1A', opacity: 0.06, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full" style={{ background: '#E8834A', opacity: 0.05, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Back to landing */}
          <div className='w-full flex items-center justify-between mb-6'>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm  transition-colors"
              style={{ color: '#9E9189' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C45C1A'}
              onMouseLeave={e => e.currentTarget.style.color = '#9E9189'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </button>

            <div className="inline-flex items-center gap-2 glass-card px-4 py-2  text-sm" style={{ color: '#C45C1A' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C45C1A' }} />
              AI-Powered Technical Interview Simulator
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: '#1C1410' }}>
            Ace Your Next{' '}
            <span className="gradient-text">Technical Interview</span>
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#6B6358' }}>
            Practice with an AI interviewer that asks real questions, evaluates your answers, and gives detailed feedback.
          </p>
        </div>

        {/* AI Hiring Coach — mode selector */}
        <div className="glass-card p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: '#9E9189' }}>
            AI Hiring Coach — Choose Your Mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Resume mode */}
            <button
              onClick={() => navigate('/resume')}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left group"
              style={{ borderColor: 'rgba(196,92,26,0.25)', }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.5)'; e.currentTarget.style.background = 'rgba(196,92,26,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.25)'; e.currentTarget.style.background = '#fff' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(196,92,26,0.12)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1C1410' }}>Upload Resume & Analyze</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9E9189' }}>
                  AI scores your resume, extracts skills, and builds a personalized interview
                </p>
              </div>
            </button>

            {/* Role-based mode */}
            <button
              onClick={() => document.getElementById('role-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left group"
              style={{ borderColor: 'rgba(196,92,26,0.25)', }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.5)'; e.currentTarget.style.background = 'rgba(196,92,26,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.25)'; e.currentTarget.style.background = '#fff' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <svg className="w-5 h-5" style={{ color: '#6B6358' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1C1410' }}>Start Interview by Role</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9E9189' }}>
                  Pick a job title and get questions tailored to that role
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Setup form */}
        <div id="role-form" className="glass-card p-6 sm:p-8 space-y-8">
          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#6B6358' }}>
              Select Your Role
            </label>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                required
                placeholder="Search or type your role..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setRole(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                className="input-field"
              />

              {/* Suggestions */}
              {showSuggestions && search && (
                <div className="absolute z-10 w-full mt-2 rounded-xl max-h-48 overflow-y-auto"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((r) => (
                      <div
                        key={r.value}
                        onClick={() => { setRole(r.value); setSearch(r.value); setShowSuggestions(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors"
                        style={{ color: '#1C1410' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,92,26,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>{r.icon}</span>
                        {r.value}
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => { setRole(search); setShowSuggestions(false) }}
                      className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                      style={{ color: '#6B6358' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,92,26,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Use "{search}" as role
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Popular Roles Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ROLES.slice(0, 8).map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setSearch(r.value) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all text-sm font-medium"
                  style={role === r.value
                    ? { borderColor: '#C45C1A', background: 'rgba(196,92,26,0.1)', color: '#C45C1A' }
                    : { borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.6)', color: '#6B6358' }
                  }
                  onMouseEnter={e => { if (role !== r.value) { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.35)'; e.currentTarget.style.color = '#C45C1A' } }}
                  onMouseLeave={e => { if (role !== r.value) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#6B6358' } }}
                >
                  <span>{r.icon}</span>
                  <span>{r.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#6B6358' }}>
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border transition-all duration-200
                    ${difficulty === d.value ? d.activeColor : d.color}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${d.dot}`} />
                  <span className="font-semibold text-sm" style={{ color: '#1C1410' }}>{d.label}</span>
                  <span className="text-xs text-center leading-tight" style={{ color: '#9E9189' }}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interview type */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#6B6358' }}>
              Interview Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setInterviewType(type.value)}
                  className="flex flex-col items-start gap-2 px-4 py-4 rounded-xl border transition-all duration-200 text-left"
                  style={interviewType === type.value
                    ? { borderColor: '#C45C1A', background: 'rgba(196,92,26,0.08)', color: '#1C1410' }
                    : { borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', color: '#6B6358' }
                  }
                  onMouseEnter={e => { if (interviewType !== type.value) e.currentTarget.style.borderColor = 'rgba(196,92,26,0.35)' }}
                  onMouseLeave={e => { if (interviewType !== type.value) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
                >
                  <div style={{ color: interviewType === type.value ? '#C45C1A' : '#9E9189' }}>
                    {type.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{type.label}</p>
                    <p className="text-xs mt-0.5 leading-tight" style={{ color: '#9E9189' }}>{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {interviewType === 'voice' && (
              <p className="mt-2 text-xs" style={{ color: '#d97706' }}>
                ⚠️ Voice mode uses your browser's microphone. Chrome/Edge recommended.
              </p>
            )}
          </div>

          {/* CTA */}
          <button onClick={handleStart} className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
            <span>Start Interview</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: '#9E9189' }}>
          Pro tip: Good WiFi = no accidental dramatic pauses in the middle of your best answers.
        </p>
      </div>
    </div>
  )
}
