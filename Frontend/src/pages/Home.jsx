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
];

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', desc: 'Fundamentals & basics', color: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400/60', activeColor: 'border-emerald-400 bg-emerald-500/20', dot: 'bg-emerald-400' },
  { value: 'Medium', label: 'Medium', desc: 'Intermediate concepts', color: 'border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-400/60', activeColor: 'border-yellow-400 bg-yellow-500/20', dot: 'bg-yellow-400' },
  { value: 'Hard', label: 'Hard', desc: 'Advanced & system design', color: 'border-red-500/40 bg-red-500/5 hover:border-red-400/60', activeColor: 'border-red-400 bg-red-500/20', dot: 'bg-red-400' },
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
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState('Medium')
  const [interviewType, setInterviewType] = useState('text')
  const [showSuggestions, setShowSuggestions] = useState(false);
  function handleStart() {
    navigate('/interview', {
      state: { role, difficulty, interviewType },
    })
  }

  const filteredRoles = ROLES.filter((r) =>
    r.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm text-violet-300">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Technical Interview Simulator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Ace Your Next{' '}
            <span className="gradient-text">Technical Interview</span>
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto">
            Practice with an AI interviewer that asks real questions, evaluates your answers, and gives detailed feedback.
          </p>
        </div>

        {/* Setup form */}
        <div className="glass-card p-6 sm:p-8 space-y-8">
          {/* Role selection */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-3">
              Select Your Role
            </label>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search or type your role..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setRole(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500"
              />

              {/* Suggestions */}
              {showSuggestions && search && (
                <div className="absolute z-10 w-full mt-2 bg-[#111] border border-white/10 rounded-xl max-h-48 overflow-y-auto">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((r) => (
                      <div
                        key={r.value}
                        onClick={() => {
                          setRole(r.value);
                          setSearch(r.value);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white/10 text-white/80"
                      >
                        <span>{r.icon}</span>
                        {r.value}
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => {
                        setRole(search);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 text-white/70 cursor-pointer hover:bg-white/10"
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
                  onClick={() => {
                    setRole(r.value);
                    setSearch(r.value);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all
        ${role === r.value
                      ? "border-violet-500 bg-violet-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-3">
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
                  <span className="text-white font-semibold text-sm">{d.label}</span>
                  <span className="text-white/40 text-xs text-center leading-tight">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interview type */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-3">
              Interview Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setInterviewType(type.value)}
                  className={`flex flex-col items-start gap-2 px-4 py-4 rounded-xl border transition-all duration-200 text-left
                    ${interviewType === type.value
                      ? 'border-violet-500 bg-violet-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80'
                    }`}
                >
                  <div className={interviewType === type.value ? 'text-violet-400' : 'text-white/40'}>
                    {type.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{type.label}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-tight">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {interviewType === 'voice' && (
              <p className="mt-2 text-yellow-400/70 text-xs">
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
        <p className="text-center text-white/40 text-xs mt-6">
          Successfully converted coffee into code (and tokens).
          5 questions per session (because even AIs need a nap).
        </p>
      </div>
    </div>
  )
}
