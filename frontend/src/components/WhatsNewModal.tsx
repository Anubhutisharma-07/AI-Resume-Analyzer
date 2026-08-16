import React, { useEffect } from 'react'
import { Sparkles, X, Check, ArrowRight } from 'lucide-react'
import { CURRENT_RELEASE, markWhatsNewAsSeen, type ReleaseInfo } from '../data/whatsNewReleases'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
  release?: ReleaseInfo
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  release = CURRENT_RELEASE,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, release.version])

  if (!isOpen) return null

  const handleDismiss = () => {
    markWhatsNewAsSeen(release.version)
    onClose()
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'New':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' }
      case 'Improved':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' }
      case 'Security':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' }
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' }
    }
  }

  return (
    <div
      className="auth-overlay"
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="card glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
          position: 'relative',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--surface-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--surface-border, rgba(255, 255, 255, 0.1))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2
                id="whats-new-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0,
                  color: 'var(--heading-text, #fff)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                What's New <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>v{release.version}</span>
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-text, #94a3b8)' }}>
                Latest releases and architectural updates ({release.date})
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Close What's New modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted-text, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Highlight Items List */}
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px',
            marginBottom: '20px',
          }}
        >
          {release.highlights.map((item, idx) => {
            const tagStyle = getTagColor(item.tag)
            return (
              <div
                key={idx}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md, 10px)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--surface-border, rgba(255, 255, 255, 0.08))',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: '1.2' }}>{item.icon || '✨'}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        color: 'var(--heading-text, #fff)',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: tagStyle.bg,
                        color: tagStyle.text,
                        border: `1px solid ${tagStyle.border}`,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--muted-text, #cbd5e1)',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--surface-border, rgba(255, 255, 255, 0.1))',
            paddingTop: '16px',
          }}
        >
          <button
            type="button"
            className="app-btn app-btn--primary"
            onClick={handleDismiss}
            style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} /> Got It, Let's Go!
          </button>
        </div>
      </div>
    </div>
  )
}
