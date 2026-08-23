import { useState, useEffect, useCallback } from 'react'

export interface PartialSkillItem {
  skill: string
  matched_variant?: string
  note?: string
}

export interface AnalysisEntry {
  id: string
  timestamp: number
  score: number
  skills: string[]
  suggestions: string[]
  matchedSkills: string[]
  partialSkills?: PartialSkillItem[]
  missingSkills: string[]
  targetRole: string
  experienceLevel?: string
  fileName: string
  source?: 'sample' | 'upload'
  share_id?: string
  coverLetterText?: string
  coverLetterFeedback?: any
  interviewQuestions?: string[]
}

const STORAGE_KEY = 'resume_analysis_history'
const LAST_VIEWED_KEY = 'resume_analysis_last_viewed'
const NOTIFICATION_PREFERENCES_STORAGE_KEY = 'resume_notification_preferences'

function loadHistory(): AnalysisEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch { return [] }
}

function saveHistory(entries: AnalysisEntry[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch { /* storage unavailable */ }
}

function loadLastViewed(): number {
  try {
    const raw = localStorage.getItem(LAST_VIEWED_KEY)
    if (!raw) return 0
    const val = Number(raw)
    return isNaN(val) ? 0 : val
  } catch { return 0 }
}

function saveLastViewed(ts: number): void {
  try { localStorage.setItem(LAST_VIEWED_KEY, ts.toString()) } catch { /* storage unavailable */ }
}

function loadInAppPreference(): boolean {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY)
    if (!raw) return true
    return JSON.parse(raw)?.in_app !== false
  } catch { return true }
}

export function useAnalysisHistory() {
  const [entries, setEntries] = useState<AnalysisEntry[]>(() => loadHistory())
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<number>(() => loadLastViewed())
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] = useState<boolean>(() => loadInAppPreference())

  useEffect(() => { saveHistory(entries) }, [entries])

  useEffect(() => {
    const syncPreference = () => setInAppNotificationsEnabled(loadInAppPreference())
    window.addEventListener('notification-preferences-changed', syncPreference)
    return () => window.removeEventListener('notification-preferences-changed', syncPreference)
  }, [])

  const markAllAsViewed = useCallback(() => {
    const now = Date.now()
    setLastViewedTimestamp(now)
    saveLastViewed(now)
  }, [])

  const unreadCount = inAppNotificationsEnabled
    ? entries.filter((entry) => entry.timestamp > lastViewedTimestamp).length
    : 0

  const addEntry = useCallback((entry: Omit<AnalysisEntry, 'id' | 'timestamp'>) => {
    setEntries((prev) => {
      const filteredEntries = prev.filter((e) => e.fileName !== entry.fileName)
      return [{ ...entry, id: Date.now().toString(), timestamp: Date.now() }, ...filteredEntries]
    })
  }, [])

  const deleteEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))
  const clearHistory = () => setEntries([])

  return {
    entries,
    unreadCount,
    lastViewedTimestamp,
    markAllAsViewed,
    addEntry,
    deleteEntry,
    clearHistory,
    setEntries,
  }
}
