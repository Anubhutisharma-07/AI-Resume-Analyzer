/**
 * Utility functions for the Web Notifications API and Page Visibility API.
 *
 * The user's browser-notification preference is persisted by the profile API
 * and mirrored in localStorage so this utility can make a synchronous decision
 * when an analysis completes without performing an API request in the hot path.
 */

export const NOTIFICATION_PREFERENCES_STORAGE_KEY = 'resume_notification_preferences'

export type NotificationPreferences = {
  in_app: boolean
  browser: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  in_app: true,
  browser: false,
}

export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES
    const parsed = JSON.parse(raw)
    return {
      in_app: parsed?.in_app !== false,
      browser: parsed?.browser === true,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    window.dispatchEvent(new Event('notification-preferences-changed'))
  } catch {
    // localStorage may be unavailable in restricted modes.
  }
}

/** Requests notification permission after an explicit user action. */
export const requestNotificationPermission = async (): Promise<NotificationPermission | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission()
    } catch {
      return Notification.permission
    }
  }
  return Notification.permission
}

/** Fires only when the user has opted in, permission is granted, and the tab is hidden. */
export const sendAnalysisCompleteNotification = (fileName?: string): void => {
  if (getNotificationPreferences().browser === false) return
  if (typeof window === 'undefined' || !('Notification' in window)) return

  if (Notification.permission === 'granted' && document.hidden) {
    const title = 'Resume Analysis Complete 🚀'
    const displayName = fileName ? `"${fileName}"` : 'Your resume'
    const body = `Analysis for ${displayName} is complete! Click to view your ATS score & recommendations.`

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: 'resume-analysis-complete',
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}
