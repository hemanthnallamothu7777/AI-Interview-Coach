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


  console.log(error, "ddd");


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

      // Navigate to the existing Interview page with pre-loaded data
      navigate('/interview', {
        state: {
          // Pre-loaded session data — Interview.jsx will use these directly
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

  return (
    <div className="w-full">
      <button
        onClick={handleStart}
        disabled={disabled || isLoading || !skills?.length}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
          font-semibold text-sm transition-all duration-200
          ${disabled || !skills?.length
            ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
            : 'btn-primary'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
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
        <p className="mt-2 text-red-400 text-xs text-center">{error}</p>
      )}
    </div>
  )
}
