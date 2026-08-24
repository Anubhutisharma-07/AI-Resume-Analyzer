// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobDescriptionInput } from './JobDescriptionInput';

describe('JobDescriptionInput Component', () => {
  it('renders input area, label, icon, and character count correctly', () => {
    const onChange = vi.fn();
    render(<JobDescriptionInput value="" onChange={onChange} maxCharacters={2000} />);

    expect(screen.getByText('Target Job Description')).toBeInTheDocument();
    expect(screen.getByText('0/2000')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText(/Paste or type the core engineering skills/i);
    expect(textarea).toBeInTheDocument();
  });

  it('triggers onChange callback when text is entered', () => {
    const onChange = vi.fn();
    render(<JobDescriptionInput value="Initial text" onChange={onChange} maxCharacters={2000} />);

    expect(screen.getByText('12/2000')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Paste or type the core engineering skills/i);
    fireEvent.change(textarea, { target: { value: 'New text entered' } });

    expect(onChange).toHaveBeenCalledWith('New text entered');
  });

  it('enforces character ceiling and does not allow typing beyond maxCharacters', () => {
    const onChange = vi.fn();
    render(<JobDescriptionInput value="" onChange={onChange} maxCharacters={10} />);

    const textarea = screen.getByPlaceholderText(/Paste or type the core engineering skills/i);
    
    // Type 9 chars -> allowed
    fireEvent.change(textarea, { target: { value: '123456789' } });
    expect(onChange).toHaveBeenCalledWith('123456789');

    // Type 11 chars -> ignored
    fireEvent.change(textarea, { target: { value: '12345678901' } });
    expect(onChange).not.toHaveBeenCalledWith('12345678901');
  });
});
