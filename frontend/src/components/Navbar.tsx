import React, { useState } from 'react'
import type { AuthUser } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

interface NavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: AuthUser | null
  onLogin: () => void
  onLogout: () => void
  onHistoryClick: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  user,
  onLogin,
  onLogout,
  onHistoryClick,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        🚀 AI Resume Analyzer
      </Link>

      <button
        className="navbar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="navbar-menu"
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <div id="navbar-menu" className={`navbar-menu ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="navbar-links">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <Link to="/analyze" onClick={() => setMobileOpen(false)}>
            Analyze Resume
          </Link>
          <a
            href="#ats-score"
            onClick={(e) => {
              e.preventDefault()
              if (window.location.pathname !== '/analyze') {
                window.location.href = '/analyze#ats-score'
              } else {
                const atsSection = document.getElementById('ats-score')
                if (atsSection) {
                  atsSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }
              }
              setMobileOpen(false)
            }}
          >
            ATS Score
          </a>
          <a
            href="#"
            data-tour="history-link"
            onClick={(e) => {
              e.preventDefault()
              onHistoryClick()
              setMobileOpen(false)
            }}
          >
            History
          </a>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="app-btn app-btn--secondary theme-toggle-btn theme-toggle-navbar"
            onClick={() => {
              toggleTheme()
              setMobileOpen(false)
            }}
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>

          {user ? (
            <div className="navbar-user">
              <span className="auth-username">👤 {user.username}</span>
              <button
                className="auth-bar-btn"
                onClick={() => {
                  onLogout()
                  setMobileOpen(false)
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="auth-bar-btn"
              onClick={() => {
                onLogin()
                setMobileOpen(false)
              }}
            >
              🔐 Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
