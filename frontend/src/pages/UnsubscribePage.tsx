import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  
  const [email, setEmail] = useState(emailParam)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleUnsubscribe = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const response = await axios.post(`${BACKEND}/api/unsubscribe/`, {
        email: targetEmail.trim(),
      })
      setStatus('success')
      setMessage(response.data.message || 'Successfully unsubscribed from weekly resume tips.')
    } catch (err: any) {
      setStatus('error')
      setMessage(
        err.response?.data?.detail || err.response?.data?.error || 'Failed to unsubscribe. User might not exist or is already unsubscribed.'
      )
    }
  }

  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam)
    }
  }, [emailParam])

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div className="analysis-card" style={{ maxWidth: '500px', width: '100%', padding: '36px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔕</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--heading-text)' }}>
          Email Digest Unsubscribe
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', margin: '0 0 24px 0' }}>
          Manage your subscription preferences for weekly resume-tips email digest.
        </p>

        {status === 'loading' && (
          <div style={{ padding: '20px 0' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>Processing your unsubscribe request...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-accent)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontSize: '0.95rem'
          }}>
            ✅ {message}
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontSize: '0.95rem'
          }}>
            ⚠️ {message}
          </div>
        )}

        {status !== 'success' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleUnsubscribe(email)
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--control-border)',
                background: 'var(--control-bg)',
                color: 'var(--control-text)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="app-btn app-btn--primary"
              disabled={status === 'loading'}
              style={{ width: '100%' }}
            >
              Unsubscribe Me
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
