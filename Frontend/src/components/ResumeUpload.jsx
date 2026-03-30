/**
 * ResumeUpload — drag-and-drop + click-to-browse resume uploader.
 */

import { useRef, useState } from 'react'
import { uploadResume } from '../services/api'

const ACCEPTED_TYPES = '.pdf,.docx,.doc'
const MAX_SIZE_MB = 5

export default function ResumeUpload({ onUploadSuccess, onError }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false) }
  function handleDrop(e) {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  async function processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      onError?.('Unsupported file type. Please upload a PDF or DOCX file.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError?.(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`)
      return
    }

    setIsUploading(true)
    setUploadedFile(file)

    try {
      const data = await uploadResume(file)
      onUploadSuccess?.(data)
    } catch (err) {
      onError?.(err.message || 'Failed to upload resume. Please try again.')
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const zoneStyle = isDragging
    ? { borderColor: '#C45C1A', background: 'rgba(196,92,26,0.06)', transform: 'scale(1.01)' }
    : isUploading
      ? { borderColor: 'rgba(196,92,26,0.4)', background: 'rgba(196,92,26,0.03)', cursor: 'wait' }
      : uploadedFile
        ? { borderColor: 'rgba(22,163,74,0.5)', background: 'rgba(22,163,74,0.04)' }
        : { borderColor: 'rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.4)' }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center gap-4 w-full min-h-[180px] rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none"
        style={zoneStyle}
        onMouseEnter={e => { if (!isDragging && !isUploading && !uploadedFile) { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.4)'; e.currentTarget.style.background = 'rgba(196,92,26,0.04)' } }}
        onMouseLeave={e => { if (!isDragging && !isUploading && !uploadedFile) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.4)' } }}
      >
        {isUploading ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#C45C1A', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#6B6358' }}>Parsing your resume...</p>
          </>
        ) : uploadedFile ? (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.12)' }}>
              <svg className="w-6 h-6" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm" style={{ color: '#16a34a' }}>{uploadedFile.name}</p>
              <p className="text-xs mt-1" style={{ color: '#9E9189' }}>
                {(uploadedFile.size / 1024).toFixed(0)} KB — click to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(196,92,26,0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#C45C1A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm" style={{ color: '#1C1410' }}>
                {isDragging ? 'Drop your resume here' : 'Drop your resume here or click to browse'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#9E9189' }}>PDF or DOCX — max {MAX_SIZE_MB} MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
