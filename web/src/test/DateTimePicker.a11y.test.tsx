import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { DateTimePicker } from '@/shared/components/DateTimePicker';

describe('DateTimePicker a11y', () => {
  it('has no violations with placeholder', async () => {
    const { container } = render(
      <DateTimePicker onChange={() => {}} placeholder="Pick date and time" />,
    );
    await checkA11y(container);
  });

  it('has no violations with selected value', async () => {
    const iso = new Date(2024, 0, 15, 14, 30).toISOString();
    const { container } = render(<DateTimePicker value={iso} onChange={() => {}} />);
    await checkA11y(container);
  });

  it('has no violations with default placeholder', async () => {
    const { container } = render(<DateTimePicker onChange={() => {}} />);
    await checkA11y(container);
  });
});
