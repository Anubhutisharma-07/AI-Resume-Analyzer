// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfilePage } from './ProfilePage'

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
  BACKEND_URL: 'http://127.0.0.1:8000',
  onSessionExpired: vi.fn(() => () => {}),
}))

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))

vi.mock('../utils/notification', () => ({
  requestNotificationPermission: vi.fn().mockResolvedValue('granted'),
  saveNotificationPreferences: vi.fn(),
}))

import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { requestNotificationPermission, saveNotificationPreferences } from '../utils/notification'

const mockedGet = vi.mocked(api.get)
const mockedPut = vi.mocked(api.put)
const mockedUseAuth = vi.mocked(useAuth)

describe('ProfilePage notification preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue({
      user: { username: 'testuser', token: 'fake-token' },
      signup: vi.fn(), login: vi.fn(), loginWithOAuth: vi.fn(), logout: vi.fn(),
      sessionExpired: false, dismissSessionExpired: vi.fn(), updateProfileSession: vi.fn(),
      updateUserAvatar: vi.fn(), exportUserData: vi.fn().mockResolvedValue(undefined),
    })
    mockedGet.mockResolvedValue({ data: {
      username: 'testuser', email: 'test@example.com', weekly_digest_opt_in: false,
      notification_preferences: { in_app: true, browser: false },
    } })
  })

  it('shows all notification types with documented defaults', async () => {
    render(<ProfilePage />)
    await waitFor(() => expect(screen.getByDisplayValue('testuser')).toBeInTheDocument())

    expect(screen.getByRole('heading', { name: /notification preferences/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /in-app notifications/i })).toBeChecked()
    expect(screen.getByRole('switch', { name: /browser notifications/i })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: /weekly resume-tips email digest/i })).not.toBeChecked()
    expect(screen.getByText('Default: On (opt-out)')).toBeInTheDocument()
    expect(screen.getAllByText('Default: Off (opt-in)').length).toBeGreaterThanOrEqual(2)
  })

  it('requests browser permission when browser notifications are enabled', async () => {
    render(<ProfilePage />)
    await waitFor(() => expect(screen.getByDisplayValue('testuser')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    fireEvent.click(screen.getByRole('switch', { name: /browser notifications/i }))
    await waitFor(() => expect(requestNotificationPermission).toHaveBeenCalled())
    expect(screen.getByRole('switch', { name: /browser notifications/i })).toBeChecked()
  })

  it('persists all three notification preferences through the profile API', async () => {
    mockedPut.mockResolvedValueOnce({ data: {
      username: 'testuser', email: 'test@example.com', weekly_digest_opt_in: true,
      notification_preferences: { in_app: false, browser: true },
    } })

    render(<ProfilePage />)
    await waitFor(() => expect(screen.getByDisplayValue('testuser')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    fireEvent.click(screen.getByRole('switch', { name: /in-app notifications/i }))
    fireEvent.click(screen.getByRole('switch', { name: /browser notifications/i }))
    fireEvent.click(screen.getByRole('switch', { name: /weekly resume-tips email digest/i }))
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockedPut).toHaveBeenCalled())
    expect(mockedPut).toHaveBeenCalledWith('/api/profile/', expect.objectContaining({
      username: 'testuser', email: 'test@example.com', weekly_digest_opt_in: true,
      notification_preferences: { in_app: false, browser: true },
    }))
    expect(saveNotificationPreferences).toHaveBeenCalledWith({ in_app: false, browser: true })
    expect(await screen.findByText(/profile and notification preferences updated successfully/i)).toBeInTheDocument()
  })

  it('does not enable browser notifications when permission is denied', async () => {
    vi.mocked(requestNotificationPermission).mockResolvedValueOnce('denied')
    render(<ProfilePage />)
    await waitFor(() => expect(screen.getByDisplayValue('testuser')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    fireEvent.click(screen.getByRole('switch', { name: /browser notifications/i }))
    await waitFor(() => expect(screen.getByText(/browser notifications are blocked/i)).toBeInTheDocument())
    expect(screen.getByRole('switch', { name: /browser notifications/i })).not.toBeChecked()
  })
})
