/**
 * ResumeAnalysis page — full resume analyzer experience.
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

  const [phase, setPhase] = useState('idle')
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

  function handleError(msg) { setErrorMsg(msg); setPhase('error') }

  function handleReset() {
    setPhase('idle')
    setUploadData(null)
    setAnalysis(null)
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F9F6F1' }}>
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: '#C45C1A', opacity: 0.05, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: '#E8834A', opacity: 0.04, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#9E9189' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1C1410'}
            onMouseLeave={e => e.currentTarget.style.color = '#9E9189'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <span className="text-xs" style={{ color: '#9E9189' }}>AI Resume Analyzer</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-5 text-sm" style={{ color: '#C45C1A' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C45C1A' }} />
            AI Hiring Coach
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight" style={{ color: '#1C1410' }}>
            Analyze Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: '#6B6358' }}>
            Upload your resume to get an AI-powered score, skill breakdown, and a personalized technical interview.
          </p>
        </div>

        {/* Upload section */}
        <div className="glass-card p-6 mb-5">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onError={handleError}
          />
          {uploadData && phase !== 'idle' && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs" style={{ color: '#9E9189' }}>
                {uploadData.char_count.toLocaleString()} characters extracted
              </p>
              <button
                onClick={handleReset}
                className="text-xs transition-colors"
                style={{ color: '#C45C1A' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A84D16'}
                onMouseLeave={e => e.currentTarget.style.color = '#C45C1A'}
              >
                Upload different resume
              </button>
            </div>
          )}
        </div>

        {/* Error state */}
        {phase === 'error' && errorMsg && (
          <div className="glass-card p-4 mb-5"
            style={{ borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.04)' }}>
            <p className="text-sm text-center" style={{ color: '#dc2626' }}>{errorMsg}</p>
          </div>
        )}

        {/* Analyzing loader */}
        {phase === 'analyzing' && (
          <div className="glass-card p-10 flex flex-col items-center gap-5 mb-5">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#C45C1A', borderTopColor: 'transparent' }} />
            <div className="text-center">
              <p className="font-medium" style={{ color: '#1C1410' }}>Analyzing your resume...</p>
              <p className="text-sm mt-1" style={{ color: '#9E9189' }}>This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {phase === 'done' && analysis && (
          <div className="space-y-5 animate-fade-in">
            {/* Score */}
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <p className="text-sm font-medium" style={{ color: '#6B6358' }}>Resume Score</p>
              <ResumeScore score={analysis.score} experienceLevel={analysis.experience_level} />
            </div>

            {/* Skills */}
            {analysis.skills?.length > 0 && (
              <div className="glass-card p-6">
                <SkillList skills={analysis.skills} title="Detected Skills" variant="default" />
              </div>
            )}

            {/* Projects */}
            {analysis.projects?.length > 0 && (
              <div className="glass-card p-6">
                <ProjectList projects={analysis.projects} />
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E9189' }}>Strengths</p>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#1C1410' }}>
                      <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(22,163,74,0.12)' }}>
                        <svg className="w-2.5 h-2.5" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E9189' }}>Improvement Suggestions</p>
                <ul className="space-y-2.5">
                  {analysis.improvements.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#6B6358' }}>
                      <span className="font-bold flex-shrink-0" style={{ color: '#C45C1A' }}>{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interview settings + CTA */}
            <div className="glass-card p-6 space-y-5">
              <p className="text-sm font-medium" style={{ color: '#1C1410' }}>Configure Your Resume Interview</p>

              {/* Difficulty */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#9E9189' }}>Difficulty</p>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all"
                      style={difficulty === d
                        ? { borderColor: '#C45C1A', background: 'rgba(196,92,26,0.1)', color: '#C45C1A' }
                        : { borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', color: '#6B6358' }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#9E9189' }}>Format</p>
                <div className="flex gap-2">
                  {[{ value: 'text', label: 'Text' }, { value: 'voice', label: 'Voice' }].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setInterviewType(t.value)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all"
                      style={interviewType === t.value
                        ? { borderColor: '#C45C1A', background: 'rgba(196,92,26,0.1)', color: '#C45C1A' }
                        : { borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', color: '#6B6358' }
                      }
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
