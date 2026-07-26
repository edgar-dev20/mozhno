import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { DatePicker } from '@/shared/components/DatePicker';

describe('DatePicker a11y', () => {
  it('has no violations with placeholder', async () => {
    const { container } = render(
      <DatePicker onChange={() => {}} placeholder="Pick a date" />,
    );
    await checkA11y(container);
  });

  it('has no violations with selected date', async () => {
    const { container } = render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={() => {}} />,
    );
    await checkA11y(container);
  });

  it('has no violations with default placeholder', async () => {
    const { container } = render(<DatePicker onChange={() => {}} />);
    await checkA11y(container);
  });
});
