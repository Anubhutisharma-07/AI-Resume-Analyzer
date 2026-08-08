// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('axios', () => {
  const mockResponse = {
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
  }
  const mockPost = vi.fn().mockResolvedValue(mockResponse)
  const mockGet = vi.fn().mockResolvedValue({ data: [] })
  return {
    default: {
      post: mockPost,
      get: mockGet,
      isAxiosError: () => false,
    },
    post: mockPost,
    get: mockGet,
    isAxiosError: () => false,
  }
})

describe('Resume Roast Mode (#497)', () => {
  it('toggles roast mode on and off for suggestions', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    // Click sample resume button to load initial suggestions
    const sampleBtn = screen.getByText('Try Sample Resume')
    fireEvent.click(sampleBtn)

    // Wait for analysis result to appear
    const doneHeader = await screen.findByText('✅ Resume Analysis Complete')
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
