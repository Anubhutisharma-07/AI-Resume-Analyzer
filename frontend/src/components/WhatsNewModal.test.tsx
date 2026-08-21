import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WhatsNewModal } from './WhatsNewModal'
import {
  CURRENT_RELEASE,
  WHATS_NEW_STORAGE_KEY,
  shouldShowWhatsNew,
  markWhatsNewAsSeen,
} from '../data/whatsNewReleases'

describe("What's New Changelog Popup (#532)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('detects when popup should be shown for new/returning users', () => {
    expect(shouldShowWhatsNew()).toBe(true)

    markWhatsNewAsSeen(CURRENT_RELEASE.version)
    expect(shouldShowWhatsNew()).toBe(false)
  })

  it('renders modal with release highlights when open', () => {
    render(<WhatsNewModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/What's New/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`v${CURRENT_RELEASE.version}`, 'i'))).toBeInTheDocument()

    // Check highlights are rendered
    for (const highlight of CURRENT_RELEASE.highlights) {
      expect(screen.getByText(highlight.title)).toBeInTheDocument()
    }
  })

  it('does not render modal when isOpen is false', () => {
    render(<WhatsNewModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('dismisses modal, updates localStorage, and calls onClose when clicking button', () => {
    const handleClose = vi.fn()
    render(<WhatsNewModal isOpen={true} onClose={handleClose} />)

    const dismissBtn = screen.getByRole('button', { name: /Got It, Let's Go!/i })
    fireEvent.click(dismissBtn)

    expect(handleClose).toHaveBeenCalled()
    expect(localStorage.getItem(WHATS_NEW_STORAGE_KEY)).toBe(CURRENT_RELEASE.version)
    expect(shouldShowWhatsNew()).toBe(false)
  })

  it('dismisses when pressing Escape key', () => {
    const handleClose = vi.fn()
    render(<WhatsNewModal isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
    expect(localStorage.getItem(WHATS_NEW_STORAGE_KEY)).toBe(CURRENT_RELEASE.version)
  })
})
