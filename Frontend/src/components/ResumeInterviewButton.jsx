/**
 * ResumeInterviewButton — generates resume-based interview questions
 * and navigates to the Interview page with pre-loaded questions + session.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateResumeQuestions } from '../services/api'

export default function ResumeInterviewButton({
  skills,
  experienceLevel,
  projects,
  difficulty = 'Medium',
  interviewType = 'text',
  disabled = false,
}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    if (!skills?.length) {
      setError('No skills detected. Please upload and analyze your resume first.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await generateResumeQuestions({
        skills,
        projects,
        experience_level: experienceLevel || 'Mid-level',
        difficulty,
        num_questions: 5,
      })

      navigate('/interview', {
        state: {
          preloadedSession: {
            session_id: data.session_id,
            questions: data.questions,
          },
          role: data.role,
          difficulty,
          interviewType,
          isResumeBased: true,
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to generate questions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = disabled || isLoading || !skills?.length

  return (
    <div className="w-full">
      <button
        onClick={handleStart}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200"
        style={isDisabled
          ? { background: 'rgba(0,0,0,0.06)', color: '#9E9189', border: '1px solid rgba(0,0,0,0.08)', cursor: 'not-allowed' }
          : { background: '#C45C1A', color: '#ffffff', boxShadow: '0 4px 14px rgba(196,92,26,0.32)' }
        }
        onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = '#A84D16' }}
        onMouseLeave={e => { if (!isDisabled) e.currentTarget.style.background = '#C45C1A' }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#ffffff' }} />
            <span>Generating questions...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Start Resume-Based Interview</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-center" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
