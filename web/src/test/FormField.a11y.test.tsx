import { describe, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { FormField } from '@/shared/components/FormField';

describe('FormField a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no accessibility violations with text input', async () => {
    const { container } = render(
      <FormField label="Name">
        <input type="text" placeholder="Enter name" />
      </FormField>,
    );
    await checkA11y(container);
  });

  it('has no accessibility violations with hint', async () => {
    const { container } = render(
      <FormField label="Email" hint="We will never share your email.">
        <input type="email" placeholder="Enter email" />
      </FormField>,
    );
    await checkA11y(container);
  });

  it('has no accessibility violations with character counter', async () => {
    const { container } = render(
      <FormField label="Bio" maxLength={100} value="Hello">
        <textarea placeholder="Tell us about yourself" />
      </FormField>,
    );
    await checkA11y(container);
  });
});
