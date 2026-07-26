import { describe, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
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
    await checkA11y(container);
  });

  it('has no accessibility violations with value', async () => {
    const { container } = render(<SearchInput value="test" onChange={onChange} />);
    await checkA11y(container);
  });
});
