import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/shared/components/SearchInput';

describe('SearchInput', () => {
  it('renders with value', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('calls onChange on input', async () => {
    let val = '';
    render(
      <SearchInput
        value=""
        onChange={(v) => {
          val = v;
        }}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), 'h');
    expect(val).toBe('h');
  });

  it('shows custom placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Find..." />);
    expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument();
  });

  it('shows default placeholder when none provided', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Поиск...')).toBeInTheDocument();
  });
});
