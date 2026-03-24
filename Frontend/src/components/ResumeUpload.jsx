/**
 * ResumeUpload — drag-and-drop + click-to-browse resume uploader.
 * Accepts PDF and DOCX files up to 5 MB.
 * Calls the backend /resume/upload endpoint and returns parsed text + skills preview.
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

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)
    // Reset so the same file can be re-selected
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
        className={`
          relative flex flex-col items-center justify-center gap-4
          w-full min-h-[180px] rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer select-none
          ${isDragging
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : isUploading
              ? 'border-violet-500/50 bg-violet-500/5 cursor-wait'
              : uploadedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-white/15 bg-white/3 hover:border-violet-500/50 hover:bg-violet-500/5'
          }
        `}
      >
        {isUploading ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
            <p className="text-white/60 text-sm">Parsing your resume...</p>
          </>
        ) : uploadedFile ? (
          <>
            {/* Success state */}
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-medium text-sm">{uploadedFile.name}</p>
              <p className="text-white/40 text-xs mt-1">
                {(uploadedFile.size / 1024).toFixed(0)} KB — click to replace
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Idle state */}
            <div className="w-12 h-12 rounded-full bg-violet-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/70 font-medium text-sm">
                {isDragging ? 'Drop your resume here' : 'Drop your resume here or click to browse'}
              </p>
              <p className="text-white/35 text-xs mt-1">PDF or DOCX — max {MAX_SIZE_MB} MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
