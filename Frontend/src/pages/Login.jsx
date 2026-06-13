import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSuccess = async (response) => {
    setIsVerifying(true)
    setErrorMsg('')
    try {
      await login(response.credential)
      navigate('/app', { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleError = () => {
    setErrorMsg('Google Sign-In failed. Please try again.')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: '#F9F6F1' }}>
      
      {/* Custom Styles/Animations */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Warm background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full" style={{ background: '#C45C1A', opacity: 0.08, filter: 'blur(100px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full" style={{ background: '#E8834A', opacity: 0.07, filter: 'blur(100px)' }} />
      </div>

      {/* Floating Back Navigation Link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group focus:outline-none"
        style={{ color: '#9E9189' }}
      >
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="group-hover:text-[#C45C1A]">Back to home</span>
      </button>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Centered card */}
        <div className="glass-card p-8 sm:p-10 text-center space-y-7 border border-white/80 shadow-xl">
          
          {/* Application Logo (with floating effect) */}
          <div className="animate-float">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: '#C45C1A', boxShadow: '0 8px 24px rgba(196,92,26,0.3)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 8v4l3 3" />
                <path d="M22 2 12 12" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1C1410' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: '#6B6358' }}>
              Accelerate your prep and ace your next interview
            </p>
          </div>

          {/* Value Propositions / Bullet points */}
          <div className="bg-white/40 border border-black/5 rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🎯</span>
              <div>
                <p className="text-xs font-bold text-neutral-800">Adaptive Mock Interviews</p>
                <p className="text-[11px] text-neutral-500">Practice custom questions based on role & difficulty.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🎙️</span>
              <div>
                <p className="text-xs font-bold text-neutral-800">Voice & Text Simulation</p>
                <p className="text-[11px] text-neutral-500">Real-time speak-to-answer or keyboard input modes.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">📊</span>
              <div>
                <p className="text-xs font-bold text-neutral-800">Granular AI Reports</p>
                <p className="text-[11px] text-neutral-500">Strengths, weaknesses, and actionable metrics.</p>
              </div>
            </div>
          </div>

          {/* Google Login / Loading State */}
          <div className="flex flex-col items-center justify-center pt-3 min-h-[60px]">
            {isVerifying ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C45C1A', borderTopColor: 'transparent' }} />
                <p className="text-xs font-medium" style={{ color: '#9E9189' }}>Verifying account details...</p>
              </div>
            ) : (
              <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                  useOneTap={false}
                  shape="pill"
                  theme="outline"
                  size="large"
                  width="280px"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs rounded-xl px-4 py-3 text-center animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {errorMsg}
            </div>
          )}

          {/* Legal / Privacy note */}
          <p className="text-[10px] leading-relaxed" style={{ color: '#9E9189' }}>
            By signing in, you agree to our <a href="#" className="underline hover:text-[#C45C1A]">Terms of Service</a> and <a href="#" className="underline hover:text-[#C45C1A]">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  )
}
