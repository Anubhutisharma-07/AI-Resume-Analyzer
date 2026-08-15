// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App'

// The auto-mock leaves axios.create() returning undefined, and the shared API
// client (src/api/client.ts) calls it at import time to build the instance it
// attaches interceptors to. Supply a usable instance so importing App works.
// Everything is defined inside the factory because vi.mock is hoisted above
// module-level declarations.
vi.mock('axios', () => {
  const instance = {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    request: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }

  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isAxiosError: vi.fn(),
    create: vi.fn(() => instance),
  }

  return {
    default: mockAxios,
    ...mockAxios,
    AxiosHeaders: { from: (headers: unknown) => headers },
  }
})

describe('Resume Roast Mode (#497)', () => {
  it('toggles roast mode on and off for suggestions', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        score: 85,
        skills_found: ['React', 'TypeScript'],
        suggestions: [
          'Add projects or experience with Python',
          'Quantify bullet: Increased revenue',
          'General suggestion test',
        ],
        matched_skills: ['React'],
        missing_skills: ['Python'],
        resume_text: 'Sample Resume Content',
      },
    })
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    vi.mocked(axios.isAxiosError).mockReturnValue(false)

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    // Click sample resume button to load initial suggestions
    const sampleBtn = screen.getByText('Try Sample Resume')
    fireEvent.click(sampleBtn)

    // Wait for analysis result to appear
    const doneHeader = await screen.findByText('✅ Resume Analysis Complete', {}, { timeout: 5000 })
    expect(doneHeader).toBeInTheDocument()

    // Check default mode is OFF and heading says "💡 Suggestions"
    expect(screen.getByText('💡 Suggestions')).toBeInTheDocument()

    // Find the roast mode toggle checkbox
    const roastToggle = screen.getByRole('checkbox', { name: /Toggle Resume Roast mode/i })
    expect(roastToggle).not.toBeChecked()

    // Turn roast mode ON
    fireEvent.click(roastToggle)
    expect(roastToggle).toBeChecked()
    expect(screen.getByText('🔥 Resume Roast')).toBeInTheDocument()
    expect(screen.getByText(/🔥 Roast Mode ON/i)).toBeInTheDocument()

    // Turn roast mode OFF again
    fireEvent.click(roastToggle)
    expect(roastToggle).not.toBeChecked()
    expect(screen.getByText('💡 Suggestions')).toBeInTheDocument()
    expect(screen.getByText(/🔥 Roast Mode OFF/i)).toBeInTheDocument()
  })
})
