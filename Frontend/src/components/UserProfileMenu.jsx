import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function UserProfileMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) return null

  // Get first letter of user's name or email as a fallback avatar
  const firstLetter = (user.name || user.email || 'U')[0].toUpperCase()

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ borderRadius: '9999px' }}
        aria-label="User menu"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User Profile'}
            className="w-9 h-9 rounded-full object-cover border-2 transition-colors duration-200"
            style={{
              borderColor: isOpen ? '#C45C1A' : 'rgba(196, 92, 26, 0.25)',
              boxShadow: isOpen ? '0 0 0 3px rgba(196, 92, 26, 0.2)' : 'none'
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #C45C1A 0%, #E8834A 100%)',
              boxShadow: isOpen ? '0 0 0 3px rgba(196, 92, 26, 0.25)' : 'none'
            }}
          >
            {firstLetter}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border border-black/5 p-1.5 z-[100] origin-top-right animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* User Profile Summary */}
          <div className="px-3.5 py-3 border-b border-black/5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Signed in as</p>
            <p className="text-sm font-bold text-neutral-800 truncate mt-0.5" title={user.name}>
              {user.name || 'User'}
            </p>
            <p className="text-xs text-neutral-500 truncate mt-0.5 font-medium" title={user.email}>
              {user.email}
            </p>
          </div>

          {/* Action List */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowConfirm(true)
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-lg text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-black/5 text-center animate-in zoom-in-95 duration-200"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-600 animate-pulse">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            {/* Title & Desc */}
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Do you really want to log out of your session? Any unsaved progress may be lost.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  logout()
                }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-colors focus:outline-none shadow-sm shadow-rose-600/10"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
