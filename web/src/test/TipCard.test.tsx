import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TipCard } from '@/app/components/TipCard';

vi.mock('@/i18n', () => ({
  useT: () => (key: string) => {
    const fallbacks: Record<string, string> = { 'common.tip': 'Tip' };
    return fallbacks[key] ?? key;
  },
  useLocale: () => ({ locale: 'ru', setLocale: vi.fn() }),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: Record<string, unknown>) => (
      <div className={className as string} {...props}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/icons', () => ({
  X: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="x-icon" className={className} width={size} height={size} />
  ),
  AlertCircle: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="alert-circle-icon" className={className} width={size} height={size} />
  ),
}));

describe('TipCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders text and label props', () => {
    render(<TipCard text="Here is a helpful tip" label="Info" />);
    expect(screen.getByText('Here is a helpful tip')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('uses default label when label is not provided', () => {
    render(<TipCard text="A tip without label" />);
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });

  it('has a dismiss button', () => {
    render(<TipCard text="Dismissible tip" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('hides card when dismiss button is clicked', async () => {
    render(<TipCard text="Dismissible tip" />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.queryByText('Dismissible tip')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<TipCard text="Tip with icon" icon={<span data-testid="custom-icon">ico</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('persists dismissed state to localStorage when storageKey is provided', async () => {
    render(<TipCard text="Persist tip" storageKey="test-tip" />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(localStorage.getItem('tip-test-tip')).toBe('dismissed');
  });

  it('shows card initially when not dismissed in localStorage', () => {
    render(<TipCard text="Visible tip" storageKey="new-tip" />);
    expect(screen.getByText('Visible tip')).toBeInTheDocument();
  });

  it('hides card on mount when dismissed in localStorage', () => {
    localStorage.setItem('tip-hidden-tip', 'dismissed');
    render(<TipCard text="Hidden tip" storageKey="hidden-tip" />);
    expect(screen.queryByText('Hidden tip')).not.toBeInTheDocument();
    localStorage.removeItem('tip-hidden-tip');
  });
});
