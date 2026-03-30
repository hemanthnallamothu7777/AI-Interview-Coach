/**
 * LiveKit service — manages real-time audio room for voice interviews.
 *
 * Uses livekit-client SDK for WebRTC audio.
 * Speech-to-text is handled by the browser's built-in Web Speech API (SpeechRecognition).
 * Text-to-speech (AI reading questions) uses the Web Speech Synthesis API.
 *
 * This architecture works without any extra APIs or costs beyond LiveKit.
 */

import { Room, RoomEvent, Track, createLocalAudioTrack } from 'livekit-client'

let room = null
let recognition = null
let _manualStop = false


/** Connect to a LiveKit room as a participant. */
export async function connectToRoom(url, token, onParticipantConnected) {
  room = new Room({
    adaptiveStream: true,
    dynacast: true,
  })

  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log('[LiveKit] Participant connected:', participant.identity)
    if (onParticipantConnected) onParticipantConnected(participant)
  })

  room.on(RoomEvent.Disconnected, () => {
    console.log('[LiveKit] Disconnected from room')
  })

  await room.connect(url, token)
  console.log('[LiveKit] Connected to room:', room.name)

  // Enable microphone
  await room.localParticipant.setMicrophoneEnabled(true)
  return room
}

/** Disconnect and clean up the room. */
export async function disconnectFromRoom() {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
  if (room) {
    await room.disconnect()
    room = null
  }
}


/**
 * Start speech recognition using the Web Speech API.
 * Stays alive indefinitely — restarts automatically on pause.
 * Auto-stops only via stopSpeechRecognition() or 60 s silence (handled in VoiceControls).
 *
 * @param {function} onInterim(liveText)         - Called on every partial result
 * @param {function} onSegmentFinal(segmentText) - Called when a speech chunk is committed
 * @param {function} onError(message)            - Called on real errors (not 'no-speech')
 */
export function startSpeechRecognition(onInterim, onSegmentFinal, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
    return null
  }

  _manualStop = false

  function createAndStart() {
    recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true   // live partial results while speaking
    recognition.continuous = true       // don't auto-stop mid-sentence
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          if (onSegmentFinal) onSegmentFinal(transcript)
        } else {
          interim += transcript
        }
      }
      if (interim && onInterim) onInterim(interim)
    }

    recognition.onerror = (event) => {
      console.error('[SpeechRecognition] Error:', event.error)
      // 'no-speech' fires when the browser detects a pause — not a real error,
      // onend will restart it automatically so we just ignore it here
      if (event.error === 'no-speech') return
      if (onError) onError(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      // Browser stopped (pause, timeout, etc.) — restart unless manually stopped
      if (!_manualStop) {
        try {
          recognition.start()
        } catch (_) {
          // Race condition: recognition already restarting, safe to ignore
        }
      } else {
        recognition = null
      }
    }

    recognition.start()
  }

  createAndStart()
}

/** Stop active speech recognition. Sets the manual-stop flag so onend won't restart. */
export function stopSpeechRecognition() {
  _manualStop = true
  if (recognition) {
    recognition.stop()
    // recognition = null is set inside onend after the stop completes
  }
}

// ─── Your existing functions below — unchanged ────────────────────────────────

/**
 * Speak text aloud using the browser's text-to-speech engine.
 * @param {string} text - Text to speak
 * @param {function} onEnd - Called when speech finishes
 */
export function speakText(text, onEnd) {
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.0
  utterance.volume = 1.0

  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
  )
  if (preferred) utterance.voice = preferred

  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}

/** Cancel any active text-to-speech. */
export function cancelSpeech() {
  window.speechSynthesis.cancel()
}

/** Check if the browser supports speech recognition. */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}
