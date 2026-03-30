/**
 * ChatWindow — renders the conversation between the AI interviewer and the candidate.
 */

import { useEffect, useRef } from 'react'
import ScoreCard from './ScoreCard'

const AIAvatar = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
    style={{ background: '#C45C1A', boxShadow: '0 2px 8px rgba(196,92,26,0.35)' }}>
    AI
  </div>
)

const UserAvatar = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
    style={{ background: '#1C1410', color: '#F9F6F1' }}>
    You
  </div>
)

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#9E9189' }}>
        <p className="text-sm">Your interview will start here...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => {
        if (msg.type === 'evaluation') {
          return (
            <div key={msg.id} className="flex gap-3 animate-fade-in">
              <AIAvatar />
              <div className="flex-1 max-w-[85%]">
                <ScoreCard evaluation={msg.data} />
              </div>
            </div>
          )
        }

        if (msg.type === 'ai') {
          return (
            <div key={msg.id} className="flex gap-3 animate-slide-up">
              <AIAvatar />
              <div className="flex-1 max-w-[85%]">
                <div className="glass-card p-4 rounded-2xl rounded-tl-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#1C1410' }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          )
        }

        if (msg.type === 'user') {
          return (
            <div key={msg.id} className="flex gap-3 flex-row-reverse animate-slide-up">
              <UserAvatar />
              <div className="flex-1 max-w-[85%] flex justify-end">
                <div className="rounded-2xl rounded-tr-sm p-4 max-w-full"
                  style={{ background: '#1C1410', border: '1px solid rgba(0,0,0,0.15)' }}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#F9F6F1' }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          )
        }

        return null
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 animate-fade-in">
          <AIAvatar />
          <div className="glass-card px-5 py-4 rounded-2xl rounded-tl-sm">
            <div className="flex gap-1.5 items-center">
              <span className="text-xs mr-1" style={{ color: '#9E9189' }}>AI is thinking</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#C45C1A', animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
