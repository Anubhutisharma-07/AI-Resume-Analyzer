// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

describe('Navbar Component (#241)', () => {
  const defaultProps = {
    theme: 'dark' as const,
    toggleTheme: vi.fn(),
    user: null,
    onLogin: vi.fn(),
    onLogout: vi.fn(),
    onHistoryClick: vi.fn(),
  }

  it('renders the header brand with emoji and "AI Resume Analyzer" title text', () => {
    render(
      <MemoryRouter>
        <Navbar {...defaultProps} />
      </MemoryRouter>
    )
    const brandElement = screen.getByText(/AI Resume Analyzer/i)
    expect(brandElement).toBeInTheDocument()
    expect(brandElement.textContent).toContain('🚀')
  })

  it('renders correctly in light mode', () => {
    render(
      <MemoryRouter>
        <Navbar {...defaultProps} theme="light" />
      </MemoryRouter>
    )
    expect(screen.getByText(/AI Resume Analyzer/i)).toBeInTheDocument()
  })
})

describe('Navbar Component right-side cluster (#244)', () => {
  it('renders all right-side cluster elements without clipping issues', () => {
    render(
      <MemoryRouter>
        <Navbar
          theme="light"
          toggleTheme={() => {}}
          user={null}
          onLogin={() => {}}
          onLogout={() => {}}
          onHistoryClick={() => {}}
        />
      </MemoryRouter>
    )

    const loginBtn = screen.getByRole('button', { name: /login \/ sign up/i })
    expect(loginBtn).toBeInTheDocument()
    expect(loginBtn).toHaveClass('auth-bar-btn')

    const themeBtn = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeBtn).toBeInTheDocument()
    expect(themeBtn).toHaveClass('theme-toggle-navbar')
  })

  it('renders user profile when user is authenticated', () => {
    const user = { username: 'testuser', token: 'fake-token' }
    render(
      <MemoryRouter>
        <Navbar
          theme="dark"
          toggleTheme={() => {}}
          user={user}
          onLogin={() => {}}
          onLogout={() => {}}
          onHistoryClick={() => {}}
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/testuser/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})

describe('Navbar responsive hamburger (#245)', () => {
  it('renders the hamburger toggle button', () => {
    render(
      <MemoryRouter>
        <Navbar
          theme="light"
          toggleTheme={() => {}}
          user={null}
          onLogin={() => {}}
          onLogout={() => {}}
          onHistoryClick={() => {}}
        />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'navbar-menu')
  })

  it('toggles mobile menu open and closed on click', () => {
    render(
      <MemoryRouter>
        <Navbar
          theme="light"
          toggleTheme={() => {}}
          user={null}
          onLogin={() => {}}
          onLogout={() => {}}
          onHistoryClick={() => {}}
        />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    const menu = document.getElementById('navbar-menu')!

    expect(menu.className).not.toContain('mobile-open')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(menu.className).toContain('mobile-open')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(menu.className).not.toContain('mobile-open')
  })

  it('closes menu when a nav link is clicked', () => {
    const onHistoryClick = vi.fn()
    render(
      <MemoryRouter>
        <Navbar
          theme="light"
          toggleTheme={() => {}}
          user={null}
          onLogin={() => {}}
          onLogout={() => {}}
          onHistoryClick={onHistoryClick}
        />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    const menu = document.getElementById('navbar-menu')!

    fireEvent.click(toggle)
    expect(menu.className).toContain('mobile-open')

    const historyLink = screen.getByText('History')
    fireEvent.click(historyLink)
    expect(menu.className).not.toContain('mobile-open')
    expect(onHistoryClick).toHaveBeenCalled()
  })
})
