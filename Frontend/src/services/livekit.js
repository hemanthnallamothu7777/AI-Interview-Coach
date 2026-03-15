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
 * Calls onResult(transcript) when speech is detected.
 * Calls onEnd() when the user stops speaking.
 */
export function startSpeechRecognition(onResult, onEnd, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
    return null
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = true     // show partial results while speaking
  recognition.continuous = false        // stop after a pause
  recognition.maxAlternatives = 1

  let finalTranscript = ''

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
      } else {
        interim += transcript
      }
    }
    // Send combined interim result for live display
    if (onResult) onResult(finalTranscript + interim, finalTranscript)
  }

  recognition.onend = () => {
    if (onEnd) onEnd(finalTranscript.trim())
    recognition = null
  }

  recognition.onerror = (event) => {
    console.error('[SpeechRecognition] Error:', event.error)
    if (onError) onError(`Speech recognition error: ${event.error}`)
    recognition = null
  }

  recognition.start()
  return recognition
}

/** Stop active speech recognition. */
export function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop()
  }
}

/**
 * Speak text aloud using the browser's text-to-speech engine.
 * @param {string} text - Text to speak
 * @param {function} onEnd - Called when speech finishes
 */
export function speakText(text, onEnd) {
  // Cancel any ongoing speech first
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Prefer a natural English voice if available
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
