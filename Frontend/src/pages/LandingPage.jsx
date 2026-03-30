import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

const FEATURES = [
  {
    icon: '🎯',
    title: 'Role-Specific Questions',
    desc: 'Get questions tailored to your exact job title — from React Developer to Machine Learning Engineer.',
  },
  {
    icon: '🗣️',
    title: 'Voice & Text Modes',
    desc: 'Practice speaking answers aloud or type them. Both modes simulate a real interview environment.',
  },
  {
    icon: '📄',
    title: 'Resume Analysis',
    desc: 'Upload your resume and get an AI-powered score, extracted skills, and personalized questions.',
  },
  {
    icon: '📊',
    title: 'Detailed Feedback',
    desc: 'Receive per-question scores and comprehensive feedback to understand exactly where to improve.',
  },
  {
    icon: '🧠',
    title: 'AI-Powered Evaluation',
    desc: 'Powered by Claude — our AI evaluates your answers with nuance, not just keyword matching.',
  },
  {
    icon: '⚡',
    title: 'Multiple Difficulty Levels',
    desc: 'Start with fundamentals or challenge yourself with system design and advanced concepts.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Choose Your Role',
    desc: 'Select from 15+ job titles or type your own. Optionally upload your resume for personalized questions.',
    icon: '🎯',
  },
  {
    num: '02',
    title: 'Set Difficulty & Mode',
    desc: 'Pick Easy, Medium, or Hard. Choose between text-based or voice-based interview format.',
    icon: '⚙️',
  },
  {
    num: '03',
    title: 'Interview & Get Feedback',
    desc: 'Answer questions from your AI interviewer and receive detailed scoring with improvement tips.',
    icon: '✨',
  },
]

const STATS = [
  { value: 15, suffix: '+', label: 'Job Roles' },
  { value: 3, suffix: '', label: 'Difficulty Levels' },
  { value: 2, suffix: '', label: 'Interview Modes' },
  { value: 100, suffix: '%', label: 'AI-Powered' },
]

const ROLES = [
  'React Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'AI Engineer', 'ML Engineer', 'Data Scientist', 'DevOps Engineer',
  'Cloud Engineer', 'iOS Developer', 'Android Developer', 'Node.js Developer',
  'Python Developer', 'System Design', 'React Native Dev',
]

const ROLE_TICKER = [...ROLES, ...ROLES]

const HERO_ROLES = ['Frontend Interview', 'Backend Interview', 'System Design', 'AI Engineer Interview', 'Full Stack Interview']

// Colors
const C = {
  bg: '#F9F6F1',
  card: 'rgba(255,255,255,0.68)',
  cardBorder: 'rgba(255,255,255,0.88)',
  accent: '#C45C1A',
  accentLight: 'rgba(196, 92, 26, 0.1)',
  accentBorder: 'rgba(196, 92, 26, 0.2)',
  text: '#1C1410',
  textSec: '#6B6358',
  textMuted: '#9E9189',
  shadow: '0 4px 24px rgba(0,0,0,0.07)',
  shadowLg: '0 16px 48px rgba(0,0,0,0.09)',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navRef = useRef(null)
  const heroTagRef = useRef(null)
  const heroHeadRef = useRef(null)
  const heroRoleRef = useRef(null)
  const heroSubRef = useRef(null)
  const heroBtnsRef = useRef(null)
  const heroCardRef = useRef(null)
  const orb1Ref = useRef(null)
  const orb2Ref = useRef(null)
  const orb3Ref = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const modesRef = useRef(null)
  const rolesRef = useRef(null)
  const ctaRef = useRef(null)
  const tickerRef = useRef(null)

  useEffect(() => {
    // ── Pre-set scroll-animated elements to invisible ──────────────
    // Must happen before ScrollTrigger.refresh() so positions are correct
    const revealEls = document.querySelectorAll('.reveal-up')
    const featCards = featuresRef.current.querySelectorAll('.feat-card')
    const stepCards = stepsRef.current.querySelectorAll('.step-card')
    const modeCards = modesRef.current.querySelectorAll('.mode-card')
    const roleTags = rolesRef.current.querySelectorAll('.role-tag')

    gsap.set([...revealEls, ...featCards, ...modeCards], { opacity: 0, y: 50 })
    gsap.set([...stepCards], { opacity: 0, x: -60 })
    gsap.set([...roleTags], { opacity: 0, scale: 0.7 })

    // ── Pre-set hero elements to initial hidden state ─────────────
    gsap.set(navRef.current, { y: -70, opacity: 0 })
    gsap.set(heroTagRef.current, { y: 30, opacity: 0 })
    gsap.set(heroHeadRef.current.querySelectorAll('.hw'), { y: 90, opacity: 0 })
    gsap.set(heroRoleRef.current, { y: 20, opacity: 0 })
    gsap.set(heroSubRef.current, { y: 24, opacity: 0 })
    gsap.set(heroBtnsRef.current.children, { y: 28, opacity: 0 })
    gsap.set(heroCardRef.current, { y: 50, opacity: 0, scale: 0.95 })

    // ── Entrance timeline ─────────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(navRef.current, { y: 0, opacity: 1, duration: 0.9 })
      .to(heroTagRef.current, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .to(
        heroHeadRef.current.querySelectorAll('.hw'),
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.75, ease: 'power4.out' },
        '-=0.3'
      )
      .to(heroRoleRef.current, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .to(heroSubRef.current, { y: 0, opacity: 1, duration: 0.55 }, '-=0.3')
      .to(
        heroBtnsRef.current.children,
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
        '-=0.3'
      )
      .to(heroCardRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.3)' }, '-=0.5')

    // ── Typewriter for hero roles ─────────────────────────────────
    let roleIdx = 0
    const cycleRoles = () => {
      roleIdx = (roleIdx + 1) % HERO_ROLES.length
      gsap.to(heroRoleRef.current, {
        duration: 0.3,
        opacity: 0,
        y: -10,
        onComplete: () => {
          heroRoleRef.current.textContent = HERO_ROLES[roleIdx]
          gsap.to(heroRoleRef.current, { duration: 0.4, opacity: 1, y: 0 })
        },
      })
    }
    const roleInterval = setInterval(cycleRoles, 2500)

    // ── Floating orbs ─────────────────────────────────────────────
    gsap.to(orb1Ref.current, { y: -40, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    gsap.to(orb2Ref.current, { y: 30, x: -20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 })
    gsap.to(orb3Ref.current, { y: -25, x: 15, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 })

    // ── Ticker ────────────────────────────────────────────────────
    const ticker = tickerRef.current
    const tickerWidth = ticker.scrollWidth / 2
    gsap.to(ticker, { x: -tickerWidth, duration: 28, repeat: -1, ease: 'none' })

    // ── Stats counter ─────────────────────────────────────────────
    statsRef.current.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseFloat(el.dataset.target)
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val) },
          })
        },
      })
    })

    // ── Section reveals ───────────────────────────────────────────
    revealEls.forEach((el) => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
      })
    })

    gsap.to(featCards, {
      scrollTrigger: { trigger: featuresRef.current, start: 'top 88%' },
      y: 0,
      opacity: 1,
      stagger: 0.09,
      duration: 0.65,
      ease: 'power3.out',
    })

    gsap.to(stepCards, {
      scrollTrigger: { trigger: stepsRef.current, start: 'top 88%' },
      x: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
    })

    gsap.to(modeCards, {
      scrollTrigger: { trigger: modesRef.current, start: 'top 88%' },
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.7,
      ease: 'back.out(1.2)',
    })

    gsap.to(roleTags, {
      scrollTrigger: { trigger: rolesRef.current, start: 'top 88%' },
      scale: 1,
      opacity: 1,
      stagger: 0.04,
      duration: 0.45,
      ease: 'back.out(1.6)',
    })

    // ── Magnetic buttons ──────────────────────────────────────────
    const magBtns = document.querySelectorAll('.mag-btn')
    const magHandlers = []
    magBtns.forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' })
      const onMove = (e) => {
        const rect = btn.getBoundingClientRect()
        xTo((e.clientX - (rect.left + rect.width / 2)) * 0.3)
        yTo((e.clientY - (rect.top + rect.height / 2)) * 0.3)
      }
      const onLeave = () => { xTo(0); yTo(0) }
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      magHandlers.push({ btn, onMove, onLeave })
    })

    // Recalculate all trigger positions after setup
    ScrollTrigger.refresh()

    return () => {
      clearInterval(roleInterval)
      tl.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      gsap.killTweensOf('*')
      // Only reset styles when refs are still attached (StrictMode double-mount).
      // On real navigation the refs are null — skip to avoid the crash.
      if (heroHeadRef.current) {
        gsap.set(
          [
            navRef.current,
            heroTagRef.current,
            heroSubRef.current,
            heroCardRef.current,
            ...Array.from(heroHeadRef.current.querySelectorAll('.hw')),
            ...Array.from(heroBtnsRef.current.children),
            ...Array.from(revealEls),
            ...Array.from(featCards),
            ...Array.from(stepCards),
            ...Array.from(modeCards),
            ...Array.from(roleTags),
          ],
          { clearProps: 'opacity,transform,x,y,scale' }
        )
      }
      magHandlers.forEach(({ btn, onMove, onLeave }) => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Decorative blobs ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div ref={orb1Ref} className="absolute" style={{ top: '5%', right: '8%', width: 380, height: 380, borderRadius: '50%', background: '#C45C1A', opacity: 0.07, filter: 'blur(90px)' }} />
        <div ref={orb2Ref} className="absolute" style={{ bottom: '15%', left: '4%', width: 320, height: 320, borderRadius: '50%', background: '#E8834A', opacity: 0.06, filter: 'blur(100px)' }} />
        <div ref={orb3Ref} className="absolute" style={{ top: '45%', left: '50%', width: 260, height: 260, borderRadius: '50%', background: '#C45C1A', opacity: 0.05, filter: 'blur(80px)' }} />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#C45C1A" fillOpacity="0.18" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(249,246,241,0.88)',
          backdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: C.accent }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 8v4l3 3" />
                <path d="M22 2 12 12" />
              </svg>
            </div>
            <span className="font-bold text-lg" style={{ color: C.text }}>InterviewCoach</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How it Works', '#how-it-works'], ['Roles', '#roles']].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium transition-colors hover:opacity-100"
                style={{ color: C.textSec }}
                onMouseEnter={e => e.target.style.color = C.accent}
                onMouseLeave={e => e.target.style.color = C.textSec}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/resume')}
              className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: C.textSec, border: '1px solid rgba(0,0,0,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = C.textSec }}
            >
              Upload Resume
            </button>
            <button
              onClick={() => navigate('/app')}
              className="mag-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: C.accent, boxShadow: '0 4px 16px rgba(196,92,26,0.32)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 22px rgba(196,92,26,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,92,26,0.32)'}
            >
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div
            ref={heroTagRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: C.accent }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.accent }} />
            AI-Powered Technical Interview Simulator
          </div>

          {/* Headline */}
          <div ref={heroHeadRef} className="overflow-hidden mb-3">
            <h1
              className="text-5xl sm:text-7xl font-extrabold leading-[1.08] tracking-tight"
              style={{ color: C.text }}
            >
              {['Ace', 'Your', 'Next'].map((w, i) => (
                <span key={i} className="hw inline-block mr-4">{w}</span>
              ))}
              <br />
              <span
                ref={heroRoleRef}
                className="hw inline-block"
                style={{ color: C.accent }}
              >
                {HERO_ROLES[0]}
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p
            ref={heroSubRef}
            className="text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: C.textSec }}
          >
            Practice with an AI interviewer that asks real questions, evaluates your answers,
            and gives detailed feedback — in text or voice mode.
          </p>

          {/* CTAs */}
          <div ref={heroBtnsRef} className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="mag-btn btn-primary flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300"
              style={{ boxShadow: '0 10px 30px rgba(196,92,26,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,92,26,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(196,92,26,0.4)' }}
            >
              Start Interview
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/resume')}
              className="mag-btn flex items-center gap-2 px-9 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.1)', color: C.text, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.11)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Analyze My Resume
            </button>
          </div>

          {/* Hero Mock Card */}
          <div
            ref={heroCardRef}
            className="max-w-2xl mx-auto mt-16 text-left"
            style={{
              background: C.card,
              backdropFilter: 'blur(24px)',
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 28,
              boxShadow: '0 32px 80px rgba(0,0,0,0.1)',
              padding: 28,
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-5">
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CA41' }} />
              <div
                className="ml-4 px-4 py-1 rounded-full text-xs"
                style={{ background: 'rgba(0,0,0,0.05)', color: C.textMuted }}
              >
                AI Interview · React Developer · Hard
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#28CA41' }} />
                <span className="text-xs" style={{ color: C.textMuted }}>Live</span>
              </div>
            </div>

            {/* AI question */}
            <div className="flex gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: C.accent }}
              >
                AI
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                style={{ background: C.accentLight, color: C.text, border: `1px solid ${C.accentBorder}` }}
              >
                Can you explain the difference between{' '}
                <strong>useEffect</strong> and <strong>useLayoutEffect</strong>{' '}
                in React, and when would you prefer one over the other?
              </div>
            </div>

            {/* User reply */}
            <div className="flex gap-3 justify-end mb-4">
              <div
                className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
                style={{ background: C.text, color: '#FAF7F2', maxWidth: '72%' }}
              >
                useEffect runs after the browser paints, while useLayoutEffect runs
                synchronously after DOM mutations but before painting — great for
                measuring DOM elements...
              </div>
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.08)', color: C.text }}
              >
                U
              </div>
            </div>

            {/* Score bar */}
            <div
              className="flex items-center gap-4 p-3 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: C.accent }}
              >
                8.5
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color: C.text }}>Excellent answer!</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: '85%', background: C.accent }}
                  />
                </div>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: C.textSec, maxWidth: 160 }}>
                Mention synchronous execution for full marks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Ticker ──────────────────────────────────────────── */}
      <div
        className="py-5 overflow-hidden"
        style={{ borderTop: '1px solid rgba(0,0,0,0.07)', borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.45)', zIndex: 1, position: 'relative' }}
      >
        <div ref={tickerRef} className="flex gap-4 whitespace-nowrap" style={{ width: 'max-content' }}>
          {ROLE_TICKER.map((role, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
              style={{ background: i % 4 === 0 ? C.accentLight : 'rgba(0,0,0,0.04)', color: i % 4 === 0 ? C.accent : C.textSec, border: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="text-center p-7 rounded-2xl"
              style={{ background: C.card, backdropFilter: 'blur(18px)', border: `1px solid ${C.cardBorder}`, boxShadow: C.shadow }}
            >
              <div className="text-4xl font-extrabold mb-1.5 tabular-nums" style={{ color: C.accent }}>
                <span className="stat-num" data-target={stat.value}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: C.textSec }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal-up">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.accent }}>Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: C.text }}>Everything you need to prepare</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: C.textSec }}>
              A complete interview preparation toolkit designed for modern tech roles.
            </p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feat-card group p-7 rounded-2xl cursor-default"
                style={{ background: C.card, backdropFilter: 'blur(18px)', border: `1px solid ${C.cardBorder}`, boxShadow: C.shadow, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = C.shadowLg }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = C.shadow }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: C.accentLight }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: C.text }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 reveal-up">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.accent }}>Process</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: C.text }}>How it works</h2>
            <p className="text-lg" style={{ color: C.textSec }}>Get started in under 60 seconds.</p>
          </div>

          <div ref={stepsRef} className="space-y-5">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="step-card flex items-start gap-6 p-7 rounded-2xl"
                style={{ background: C.card, backdropFilter: 'blur(18px)', border: `1px solid ${C.cardBorder}`, boxShadow: C.shadow, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = C.shadowLg }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = C.shadow }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-white font-extrabold"
                  style={{ background: C.accent }}
                >
                  <span className="text-lg leading-none">{step.num}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{step.icon}</span>
                    <h3 className="font-bold text-lg" style={{ color: C.text }}>{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>{step.desc}</p>
                </div>
                <div className="ml-auto hidden sm:flex items-center justify-center w-10 h-10 rounded-full" style={{ background: C.accentLight }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interview Modes ──────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 reveal-up">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.accent }}>Modes</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: C.text }}>Practice your way</h2>
            <p className="text-lg" style={{ color: C.textSec }}>Two formats, one goal: land the job.</p>
          </div>

          <div ref={modesRef} className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '💬',
                title: 'Text Interview',
                desc: 'Type your answers at your own pace. Great for structured, thoughtful responses with full keyboard control.',
                badge: 'Most Popular',
                cta: 'Try Text Mode',
              },
              {
                icon: '🎙️',
                title: 'Voice Interview',
                desc: 'Speak your answers just like a real interview. Uses your browser microphone. Chrome & Edge recommended.',
                badge: 'Most Realistic',
                cta: 'Try Voice Mode',
              },
            ].map((mode, i) => (
              <div
                key={i}
                className="mode-card relative p-9 rounded-2xl overflow-hidden"
                style={{ background: C.card, backdropFilter: 'blur(22px)', border: `1px solid ${C.cardBorder}`, boxShadow: C.shadow, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = C.shadowLg }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = C.shadow }}
              >
                <span
                  className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: C.accentLight, color: C.accent }}
                >
                  {mode.badge}
                </span>
                <div className="text-5xl mb-5">{mode.icon}</div>
                <h3 className="font-bold text-xl mb-3" style={{ color: C.text }}>{mode.title}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: C.textSec }}>{mode.desc}</p>
                <button
                  onClick={() => navigate('/app')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: C.text }}
                  onMouseEnter={e => e.currentTarget.style.background = C.accent}
                  onMouseLeave={e => e.currentTarget.style.background = C.text}
                >
                  {mode.cta}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12 reveal-up">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.accent }}>Supported Roles</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: C.text }}>15+ job roles covered</h2>
            <p className="text-lg" style={{ color: C.textSec }}>Can't find yours? Just type any role you want.</p>
          </div>

          <div ref={rolesRef} className="flex flex-wrap justify-center gap-3">
            {ROLES.map((role, i) => (
              <button
                key={i}
                className="role-tag px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(0,0,0,0.1)', color: C.textSec, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                onClick={() => navigate('/app')}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentLight; e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = C.textSec; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ zIndex: 1, position: 'relative' }}>
        <div
          ref={ctaRef}
          className="max-w-2xl mx-auto text-center p-14 rounded-3xl reveal-up"
          style={{ background: C.card, backdropFilter: 'blur(28px)', border: `1px solid ${C.cardBorder}`, boxShadow: '0 24px 80px rgba(0,0,0,0.1)' }}
        >
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: C.text }}>Ready to ace your interview?</h2>
          <p className="text-lg mb-8" style={{ color: C.textSec }}>
            No signup required. Start practicing in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="mag-btn btn-primary flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300"
              style={{ boxShadow: '0 10px 30px rgba(196,92,26,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,92,26,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(196,92,26,0.4)' }}
            >
              Start Interview Now →
            </button>
            <button
              onClick={() => navigate('/resume')}
              className="mag-btn flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              style={{ background: 'rgba(0,0,0,0.06)', color: C.text, border: '1px solid rgba(0,0,0,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}
            >
              Upload Resume
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)', zIndex: 1, position: 'relative' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.accent }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="font-semibold" style={{ color: C.text }}>InterviewCoach</span>
          </div>
          <div className="flex items-center gap-4 text-sm">

            {/* GitHub */}
            <a
              href="https://github.com/hemanthnallamothu7777"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: C.textMuted }}
            >
              <i className="fab fa-github"></i>
              GitHub
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/hemanth-nallamothu-b770a422b/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: C.textMuted }}
            >
              <i className="fab fa-linkedin"></i>
              LinkedIn
            </a>

            {/* Email */}
            <a
              href="mailto:hemanth.nallamothu7@gmail.com"
              className="flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: C.textMuted }}
            >
              <i className="fas fa-envelope"></i>
              Email
            </a>

          </div>
        </div>
      </footer>
    </div>
  )
}
