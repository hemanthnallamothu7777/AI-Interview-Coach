/**
 * VoiceControls — microphone recording UI for voice interview mode.
 *
 * Uses the Web Speech API (SpeechRecognition) to capture and transcribe audio.
 * While recording, shows a live transcript in the parent via onTranscriptUpdate.
 * When the user stops, calls onTranscriptFinal with the final text.
 */

import { useState, useEffect, useRef } from 'react'
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../services/livekit'

/**
 * @param {{
 *   onTranscriptFinal: (text: string) => void,
 *   onTranscriptUpdate: (text: string) => void,
 *   disabled: boolean,
 *   isSpeaking: boolean,   // true when AI TTS is active
 * }} props
 */
export default function VoiceControls({ onTranscriptFinal, onTranscriptUpdate, disabled, isSpeaking }) {
  const [isRecording, setIsRecording] = useState(false)
  const [liveText, setLiveText] = useState('')
  const [error, setError] = useState('')
  const isSupported = isSpeechRecognitionSupported()

  // Clean up on unmount
  useEffect(() => {
    return () => stopSpeechRecognition()
  }, [])

  function handleToggleRecording() {
    if (isRecording) {
      // User clicked stop manually
      stopSpeechRecognition()
      setIsRecording(false)
    } else {
      setError('')
      setLiveText('')
      setIsRecording(true)

      startSpeechRecognition(
        // Live update
        (liveTranscript, _finalSoFar) => {
          setLiveText(liveTranscript)
          if (onTranscriptUpdate) onTranscriptUpdate(liveTranscript)
        },
        // Final result
        (finalText) => {
          setIsRecording(false)
          setLiveText('')
          if (finalText.trim()) {
            if (onTranscriptFinal) onTranscriptFinal(finalText.trim())
          }
        },
        // Error
        (errMsg) => {
          setIsRecording(false)
          setLiveText('')
          setError(errMsg)
        }
      )
    }
  }

  if (!isSupported) {
    return (
      <div className="glass-card px-4 py-3 text-center">
        <p className="text-yellow-400 text-sm">
          ⚠️ Speech recognition is not supported in this browser. Please use Chrome or Edge, or switch to text mode.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm font-medium">Voice Input</span>
        {isSpeaking && (
          <span className="flex items-center gap-1.5 text-cyan-400 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI speaking…
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Record / Stop button */}
        <button
          onClick={handleToggleRecording}
          disabled={disabled || isSpeaking}
          className={`relative flex-shrink-0 w-14 h-14 rounded-full transition-all duration-200
            flex items-center justify-center shadow-lg
            disabled:opacity-40 disabled:cursor-not-allowed
            ${isRecording
              ? 'bg-red-500 hover:bg-red-400 shadow-red-500/40 animate-recording-ring'
              : 'bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-900/40'
            }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            /* Stop icon */
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            /* Mic icon */
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <div>
              <p className="text-red-400 text-xs font-medium mb-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Recording… speak your answer
              </p>
              {liveText && (
                <p className="text-white/60 text-sm line-clamp-2 italic">"{liveText}"</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-white/60 text-sm">
                {disabled ? 'Wait for the question…' : 'Press the mic to speak your answer'}
              </p>
              <p className="text-white/30 text-xs mt-0.5">Recording stops automatically after a pause</p>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
