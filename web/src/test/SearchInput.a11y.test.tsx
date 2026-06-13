import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SearchInput } from '@/shared/components/SearchInput';

describe('SearchInput a11y', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SearchInput value="" onChange={onChange} placeholder="Search..." />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with value', async () => {
    const { container } = render(<SearchInput value="test" onChange={onChange} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
