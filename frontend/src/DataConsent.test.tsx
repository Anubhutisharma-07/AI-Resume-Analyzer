import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CookieConsentBanner from './components/CookieConsentBanner'
import {
  hasAnalyticsConsent,
  hasResumeRoastConsent,
  setAnalyticsConsent,
  setResumeRoastConsent,
  getConsentPreferences,
  saveConsentPreferences,
} from './utils/cookieConsent'

describe('Optional Data Collection Consent (#536)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults optional data collection (analytics and resume roast) to OFF', () => {
    expect(hasAnalyticsConsent()).toBe(false)
    expect(hasResumeRoastConsent()).toBe(false)
    const prefs = getConsentPreferences()
    expect(prefs.analytics).toBe(false)
    expect(prefs.resumeRoast).toBe(false)
  })

  it('updates consent preferences individually and persists them', () => {
    setAnalyticsConsent(true)
    expect(hasAnalyticsConsent()).toBe(true)
    expect(hasResumeRoastConsent()).toBe(false)

    setResumeRoastConsent(true)
    expect(hasResumeRoastConsent()).toBe(true)

    saveConsentPreferences({ analytics: false, resumeRoast: true })
    expect(hasAnalyticsConsent()).toBe(false)
    expect(hasResumeRoastConsent()).toBe(true)
  })

  it('handles Decline Optional in first-visit banner keeping optional tracking off', () => {
    render(<CookieConsentBanner />)

    const declineBtn = screen.getByRole('button', { name: /Decline Optional/i })
    fireEvent.click(declineBtn)

    expect(hasAnalyticsConsent()).toBe(false)
    expect(hasResumeRoastConsent()).toBe(false)
  })

  it('allows customizing granular toggles in the banner', () => {
    render(<CookieConsentBanner />)

    const customizeBtn = screen.getByRole('button', { name: /Customize/i })
    fireEvent.click(customizeBtn)

    const analyticsToggle = screen.getByLabelText(/Analytics & Performance Telemetry/i)
    const roastToggle = screen.getByLabelText(/AI Resume Roast Feedback Processing/i)

    expect(analyticsToggle).not.toBeChecked()
    expect(roastToggle).not.toBeChecked()

    fireEvent.click(analyticsToggle)
    expect(analyticsToggle).toBeChecked()

    const saveBtn = screen.getByRole('button', { name: /Save Preferences/i })
    fireEvent.click(saveBtn)

    expect(hasAnalyticsConsent()).toBe(true)
    expect(hasResumeRoastConsent()).toBe(false)
  })
})
