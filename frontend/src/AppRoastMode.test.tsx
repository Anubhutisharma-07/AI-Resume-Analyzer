import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

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
    expect(roastToggle).not.be.checked

    // Turn roast mode ON
    fireEvent.click(roastToggle)
    expect(roastToggle).toBe.checked
    expect(screen.getByText('🔥 Resume Roast')).toBeInTheDocument()
    expect(screen.getByText(/🔥 Roast Mode ON/i)).toBeInTheDocument()

    // Turn roast mode OFF again
    fireEvent.click(roastToggle)
    expect(roastToggle).not.be.checked
    expect(screen.getByText('💡 Suggestions')).toBeInTheDocument()
    expect(screen.getByText(/🔥 Roast Mode OFF/i)).toBeInTheDocument()
  })
})
