/**
 * ChatWindow — renders the conversation between the AI interviewer and the candidate.
 * Supports three message types: 'ai', 'user', and 'evaluation'.
 * Auto-scrolls to the latest message.
 */

import { useEffect, useRef } from 'react'
import ScoreCard from './ScoreCard'

// Avatar icons as inline SVG for zero dependencies
const AIAvatar = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-900/40">
    AI
  </div>
)

const UserAvatar = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
    You
  </div>
)

/**
 * @param {{ messages: Array<{ id: string, type: 'ai'|'user'|'evaluation', content: string, data?: object }>, isTyping: boolean }} props
 */
export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/30">
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
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
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
                <div className="bg-violet-600/30 border border-violet-500/20 rounded-2xl rounded-tr-sm p-4 max-w-full">
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
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
              <span className="text-white/40 text-xs mr-1">AI is thinking</span>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
