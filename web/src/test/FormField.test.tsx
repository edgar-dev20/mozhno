import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/shared/components/FormField';

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Username">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders hint', () => {
    render(
      <FormField label="Name" hint="Enter your name">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(
      <FormField label="Bio" maxLength={100} value="Hello">
        <input />
      </FormField>,
    );
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('does not show character count without maxLength', () => {
    render(
      <FormField label="Bio" value="Hello">
        <input />
      </FormField>,
    );
    expect(screen.queryByText(/\/\d/)).not.toBeInTheDocument();
  });
});
