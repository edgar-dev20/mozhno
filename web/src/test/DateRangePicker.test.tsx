import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from "@/shared/components/DateRangePicker";

describe('DateRangePicker', () => {
  it('renders placeholder', () => {
    render(<DateRangePicker onChange={() => {}} placeholder="Pick dates" />);
    expect(screen.getByText('Pick dates')).toBeInTheDocument();
  });

  it('renders selected range', () => {
    const from = new Date(2024, 0, 15);
    const to = new Date(2024, 0, 20);
    render(<DateRangePicker from={from} to={to} onChange={() => {}} />);
    expect(screen.getByText(/15 янв. 2024/)).toBeInTheDocument();
    expect(screen.getByText(/20 янв. 2024/)).toBeInTheDocument();
  });

  it('renders from-only range', () => {
    const from = new Date(2024, 5, 1);
    render(<DateRangePicker from={from} onChange={() => {}} />);
    expect(screen.getByText(/1 июн. 2024/)).toBeInTheDocument();
  });

  it('renders default placeholder when none provided', () => {
    render(<DateRangePicker onChange={() => {}} />);
    expect(screen.getByText('Выберите период')).toBeInTheDocument();
  });

  it('calls onChange on clear click', async () => {
    let cleared = false;
    const from = new Date(2024, 0, 15);
    const to = new Date(2024, 0, 20);
    const user = userEvent.setup();
    render(<DateRangePicker from={from} to={to} onChange={(f, t) => { if (f === undefined) cleared = true; }} />);
    const clearBtn = screen.getByRole('button').querySelector('.ml-auto');
    if (clearBtn) await user.click(clearBtn);
    expect(cleared).toBe(true);
  });

  it('opens calendar popover on click', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
