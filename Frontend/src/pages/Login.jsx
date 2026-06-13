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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: '#F9F6F1' }}>
      {/* Warm background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full" style={{ background: '#C45C1A', opacity: 0.07, filter: 'blur(90px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full" style={{ background: '#E8834A', opacity: 0.06, filter: 'blur(90px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Centered card */}
        <div className="glass-card p-8 sm:p-10 text-center space-y-6">
          
          {/* Application Logo */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: '#C45C1A', boxShadow: '0 8px 24px rgba(196,92,26,0.25)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 8v4l3 3" />
              <path d="M22 2 12 12" />
            </svg>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1C1410' }}>
              Sign in to continue
            </h1>
            <p className="text-sm" style={{ color: '#6B6358' }}>
              Access your interview dashboard
            </p>
          </div>

          {/* Google Login / Loading State */}
          <div className="flex flex-col items-center justify-center pt-4 min-h-[60px]">
            {isVerifying ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C45C1A', borderTopColor: 'transparent' }} />
                <p className="text-xs" style={{ color: '#9E9189' }}>Verifying identity...</p>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
              />
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs rounded-xl px-4 py-3 text-center"
              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {errorMsg}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
