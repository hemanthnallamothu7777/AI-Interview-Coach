/**
 * ResumeAnalysis page — full resume analyzer experience.
 *
 * Flow:
 *  1. User uploads resume → POST /resume/upload → extract text + skills preview
 *  2. Auto-analyze → POST /resume/analyze → full structured analysis
 *  3. Show score, skills, strengths, missing skills, improvement suggestions
 *  4. "Start Resume-Based Interview" button → generates questions → navigates to Interview
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResumeUpload from '../components/ResumeUpload'
import ResumeScore from '../components/ResumeScore'
import SkillList from '../components/SkillList'
import ResumeInterviewButton from '../components/ResumeInterviewButton'
import { analyzeResume } from '../services/api'
import ProjectList from '../components/ProjectsList'

export default function ResumeAnalysis() {
  const navigate = useNavigate()

  const [phase, setPhase] = useState('idle')      // idle | analyzing | done | error
  const [uploadData, setUploadData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [difficulty, setDifficulty] = useState('Medium')
  const [interviewType, setInterviewType] = useState('text')

  async function handleUploadSuccess(data) {
    setUploadData(data)
    setPhase('analyzing')
    setErrorMsg('')

    try {
      const result = await analyzeResume(data.text)
      setAnalysis(result)
      setPhase('done')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to analyze resume. Please try again.')
      setPhase('error')
    }
  }

  function handleError(msg) {
    setErrorMsg(msg)
    setPhase('error')
  }

  function handleReset() {
    setPhase('idle')
    setUploadData(null)
    setAnalysis(null)
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/30 text-xs">AI Resume Analyzer</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-5 text-sm text-violet-300">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            AI Hiring Coach
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Analyze Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-white/45 text-base max-w-md mx-auto">
            Upload your resume to get an AI-powered score, skill breakdown, and a personalized technical interview.
          </p>
        </div>

        {/* Upload section — always visible so user can re-upload */}
        <div className="glass-card p-6 mb-5">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onError={handleError}
          />

          {uploadData && phase !== 'idle' && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-white/40 text-xs">
                {uploadData.char_count.toLocaleString()} characters extracted
              </p>
              <button
                onClick={handleReset}
                className="text-violet-400 hover:text-violet-300 text-xs transition-colors"
              >
                Upload different resume
              </button>
            </div>
          )}
        </div>

        {/* Error state */}
        {phase === 'error' && errorMsg && (
          <div className="glass-card p-4 mb-5 border border-red-500/25 bg-red-500/5">
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          </div>
        )}

        {/* Analyzing loader */}
        {phase === 'analyzing' && (
          <div className="glass-card p-10 flex flex-col items-center gap-5 mb-5">
            <div className="w-12 h-12 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="text-white/80 font-medium">Analyzing your resume...</p>
              <p className="text-white/40 text-sm mt-1">This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {phase === 'done' && analysis && (
          <div className="space-y-5 animate-fade-in">
            {/* Score + experience level */}
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <p className="text-white/50 text-sm font-medium">Resume Score</p>
              <ResumeScore score={analysis.score} experienceLevel={analysis.experience_level} />
            </div>

            {/* Skills */}
            {analysis.skills?.length > 0 && (
              <div className="glass-card p-6">
                <SkillList skills={analysis.skills} title="Detected Skills" variant="default" />
              </div>
            )}

            {/* Projects Found */}
            {analysis.projects?.length > 0 && (
              <div className="glass-card p-6">
                <ProjectList projects={analysis.projects} title="Detected Projects " variant="default" />
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Strengths</p>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing skills */}
            {analysis.missing_skills?.length > 0 && (
              <div className="glass-card p-6">
                <SkillList skills={analysis.missing_skills} title="Skills to Add" variant="missing" />
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements?.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Improvement Suggestions</p>
                <ul className="space-y-2.5">
                  {analysis.improvements.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className="text-yellow-400/70 font-bold flex-shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interview settings + CTA */}
            <div className="glass-card p-6 space-y-5">
              <p className="text-white/70 text-sm font-medium">Configure Your Resume Interview</p>

              {/* Difficulty */}
              <div>
                <p className="text-white/50 text-xs mb-2">Difficulty</p>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${difficulty === d
                        ? 'border-violet-500 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="text-white/50 text-xs mb-2">Format</p>
                <div className="flex gap-2">
                  {[
                    { value: 'text', label: 'Text' },
                    { value: 'voice', label: 'Voice' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setInterviewType(t.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${interviewType === t.value
                        ? 'border-violet-500 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <ResumeInterviewButton
                skills={analysis?.skills}
                projects={analysis?.projects}
                experienceLevel={analysis.experience_level}
                difficulty={difficulty}
                interviewType={interviewType}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
