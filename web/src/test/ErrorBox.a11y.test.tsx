import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { ErrorBox } from '@/shared/components/ErrorBox';

describe('ErrorBox a11y', () => {
  it('has no violations with text', async () => {
    const { container } = render(<ErrorBox>Something went wrong</ErrorBox>);
    await checkA11y(container);
  });

  it('has no violations with longer message', async () => {
    const { container } = render(
      <ErrorBox>
        The operation could not be completed. Please check your input and try again.
      </ErrorBox>,
    );
    await checkA11y(container);
  });

  it('has no violations with custom className', async () => {
    const { container } = render(<ErrorBox className="custom-error">Error</ErrorBox>);
    await checkA11y(container);
  });
});
