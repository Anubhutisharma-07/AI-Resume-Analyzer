export type CookieConsentChoice = 'accepted' | 'declined' | 'customized'

export const COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent_choice'
export const CONSENT_ANALYTICS_KEY = 'consent_analytics'
export const CONSENT_RESUME_ROAST_KEY = 'consent_resume_roast'

export interface DataConsentPreferences {
  analytics: boolean
  resumeRoast: boolean
}

export function getCookieConsentChoice(): CookieConsentChoice | null {
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    return saved === 'accepted' || saved === 'declined' || saved === 'customized' ? saved : null
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(): boolean {
  try {
    // Explicit opt-in only (Off by default)
    return localStorage.getItem(CONSENT_ANALYTICS_KEY) === 'true'
  } catch {
    return false
  }
}

export function hasResumeRoastConsent(): boolean {
  try {
    // Explicit opt-in only (Off by default)
    return localStorage.getItem(CONSENT_RESUME_ROAST_KEY) === 'true'
  } catch {
    return false
  }
}

export function getConsentPreferences(): DataConsentPreferences {
  return {
    analytics: hasAnalyticsConsent(),
    resumeRoast: hasResumeRoastConsent(),
  }
}

export function saveConsentPreferences(prefs: DataConsentPreferences) {
  try {
    localStorage.setItem(CONSENT_ANALYTICS_KEY, String(prefs.analytics))
    localStorage.setItem(CONSENT_RESUME_ROAST_KEY, String(prefs.resumeRoast))
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'customized')
  } catch {
    // ignore
  }
}

export function saveCookieConsentChoice(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
    if (choice === 'accepted') {
      localStorage.setItem(CONSENT_ANALYTICS_KEY, 'true')
      localStorage.setItem(CONSENT_RESUME_ROAST_KEY, 'true')
    } else if (choice === 'declined') {
      localStorage.setItem(CONSENT_ANALYTICS_KEY, 'false')
      localStorage.setItem(CONSENT_RESUME_ROAST_KEY, 'false')
    }
  } catch {
    // Consent still applies for current session if storage unavailable.
  }
}

export function setAnalyticsConsent(allowed: boolean) {
  try {
    localStorage.setItem(CONSENT_ANALYTICS_KEY, String(allowed))
  } catch {
    // ignore
  }
}

export function setResumeRoastConsent(allowed: boolean) {
  try {
    localStorage.setItem(CONSENT_RESUME_ROAST_KEY, String(allowed))
  } catch {
    // ignore
  }
}

export function initializeTrackingIfConsented() {
  if (!hasAnalyticsConsent()) return
  // Tracking initialization
}
