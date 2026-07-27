import React, { useState, useEffect } from 'react'
import { TemplateCard } from './TemplateCard'
import '../components/AnalysisSkeleton/AnalysisSkeleton.css'

const TEMPLATES = [
  {
    name: 'Modern',
    description: 'A clean, modern layout with clear sections and plenty of white space.',
    atsNote: 'Optimized for ATS parsing – simple formatting, no tables.',
    fileName: 'modern.docx',
    imageSrc: '/templates/modern.png',
  },
  {
    name: 'Clean',
    description: 'Simple and professional design, easy to read for recruiters.',
    atsNote: 'Uses standard headings and bullet points – ATS friendly.',
    fileName: 'clean.docx',
    imageSrc: '/templates/clean.png',
  },
  {
    name: 'Creative',
    description: 'Subtle color accents and modern typography while staying ATS compatible.',
    atsNote: 'No complex tables or graphics – plain text formatting.',
    fileName: 'creative.docx',
    imageSrc: '/templates/creative.png',
  },
]

function TemplateCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
      aria-hidden="true"
    >
      <div
        className="skeleton-shimmer"
        style={{ width: '100%', height: '192px', borderRadius: '6px' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '60%', height: '20px', borderRadius: '4px' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '90%', height: '14px', borderRadius: '4px' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '80%', height: '14px', borderRadius: '4px' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '100px', height: '36px', borderRadius: '20px' }}
      />
    </div>
  )
}

export const TemplateGallery: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    // Simulate async fetch; replace with real fetch() call when templates are served remotely
    const timer = setTimeout(() => {
      if (!cancelled) setStatus('success')
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading resume templates"
        style={{
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        }}
      >
        <span className="sr-only">Loading resume templates, please wait…</span>
        {[0, 1, 2].map((i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        style={{
          textAlign: 'center',
          padding: '24px',
          color: 'var(--color-danger)',
          background: 'rgba(239,68,68,0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
      >
        <p style={{ margin: '0 0 12px', fontWeight: 600 }}>⚠️ Failed to load templates.</p>
        <button className="app-btn app-btn--secondary" onClick={() => setStatus('loading')}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      }}
    >
      {TEMPLATES.map((t) => (
        <TemplateCard
          key={t.name}
          name={t.name}
          description={t.description}
          atsNote={t.atsNote}
          fileName={t.fileName}
          imageSrc={t.imageSrc}
        />
      ))}
    </div>
  )
}
