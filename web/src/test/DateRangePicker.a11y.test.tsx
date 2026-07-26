import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { DateRangePicker } from '@/shared/components/DateRangePicker';

describe('DateRangePicker a11y', () => {
  it('has no violations with placeholder', async () => {
    const { container } = render(<DateRangePicker onChange={() => {}} placeholder="Pick dates" />);
    await checkA11y(container);
  });

  it('has no violations with selected range', async () => {
    const from = new Date(2024, 0, 15);
    const to = new Date(2024, 0, 20);
    const { container } = render(
      <DateRangePicker from={from} to={to} onChange={() => {}} />,
    );
    await checkA11y(container);
  });

  it('has no violations with default placeholder', async () => {
    const { container } = render(<DateRangePicker onChange={() => {}} />);
    await checkA11y(container);
  });
});
