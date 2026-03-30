import { useState, useEffect, useRef } from 'react'
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../services/livekit'

const SILENCE_TIMEOUT_MS = 60_000 // auto-stop after 60 s of silence

export default function VoiceControls({ onTranscriptFinal, onTranscriptUpdate, resetTrigger, disabled, isSpeaking }) {
  const [isRecording, setIsRecording] = useState(false)
  const [liveText, setLiveText] = useState('')
  const [error, setError] = useState('')
  const [fullTranscript, setFullTranscript] = useState('')
  const silenceTimerRef = useRef(null)
  const fullTranscriptRef = useRef('') // mirror for use inside closures
  const isSupported = isSpeechRecognitionSupported()

  // Keep ref in sync
  useEffect(() => { fullTranscriptRef.current = fullTranscript }, [fullTranscript])

  useEffect(() => {
    setFullTranscript('')
    fullTranscriptRef.current = ''
    setLiveText('')
    setIsRecording(false)
    clearTimeout(silenceTimerRef.current)
    stopSpeechRecognition()
  }, [resetTrigger])

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(silenceTimerRef.current)
    stopSpeechRecognition()
  }, [])

  function resetSilenceTimer() {
    clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = setTimeout(() => {
      // 60 s of silence → auto-stop
      doStop()
    }, SILENCE_TIMEOUT_MS)
  }

  function doStop() {
    stopSpeechRecognition()
    clearTimeout(silenceTimerRef.current)
    setIsRecording(false)
    setLiveText('')
    const finalText = fullTranscriptRef.current.trim()
    if (onTranscriptFinal && finalText) onTranscriptFinal(finalText)
    setFullTranscript('')
    fullTranscriptRef.current = ''
  }

  function handleToggleRecording() {
    if (isRecording) {
      doStop()
      return
    }

    setError('')
    setLiveText('')
    setIsRecording(true)
    resetSilenceTimer() // start counting from the moment recording begins

    startSpeechRecognition(
      (liveTranscript) => {
        // Interim result → reset silence timer, show live text
        resetSilenceTimer()
        setLiveText(liveTranscript)
        const combined = (fullTranscriptRef.current + ' ' + liveTranscript).trim()
        if (onTranscriptUpdate) onTranscriptUpdate(combined)
      },
      (finalSegment) => {
        // A segment was committed → append it, reset silence timer
        // Note: with continuous=true this fires per-utterance, NOT on stop
        resetSilenceTimer()
        setLiveText('')
        if (!finalSegment.trim()) return
        const updated = (fullTranscriptRef.current + ' ' + finalSegment).trim()
        fullTranscriptRef.current = updated
        setFullTranscript(updated)
        if (onTranscriptUpdate) onTranscriptUpdate(updated)
      },
      (errMsg) => {
        setIsRecording(false)
        setLiveText('')
        clearTimeout(silenceTimerRef.current)
        setError(errMsg)
      }
    )
  }


  if (!isSupported) {
    return (
      <div className="glass-card px-4 py-3 text-center">
        <p className="text-sm" style={{ color: '#d97706' }}>
          ⚠️ Speech recognition is not supported in this browser. Please use Chrome or Edge, or switch to text mode.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: '#6B6358' }}>Voice Input</span>
        {isSpeaking && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#C45C1A' }}>
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#C45C1A' }} />
            AI speaking…
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleRecording}
          disabled={disabled || isSpeaking}
          className="relative flex-shrink-0 w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          style={isRecording
            ? { background: '#dc2626', boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }
            : { background: '#C45C1A', boxShadow: '0 4px 14px rgba(196,92,26,0.4)' }
          }
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <div>
              <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#dc2626' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#dc2626' }} />
                Recording… speak your answer
              </p>
              {liveText && (
                <p className="text-sm line-clamp-2 italic" style={{ color: '#6B6358' }}>"{liveText}"</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm" style={{ color: '#6B6358' }}>
                {disabled ? 'Wait for the question…' : 'Press the mic to speak your answer'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9E9189' }}>Recording stops automatically after a pause</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs rounded-lg px-3 py-2"
          style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
