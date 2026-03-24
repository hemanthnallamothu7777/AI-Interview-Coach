import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Results from './pages/Results'
import ResumeAnalysis from './pages/ResumeAnalysis'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
