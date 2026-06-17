import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
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
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with hint', async () => {
    const { container } = render(
      <FormField label="Email" hint="We will never share your email.">
        <input type="email" placeholder="Enter email" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with character counter', async () => {
    const { container } = render(
      <FormField label="Bio" maxLength={100} value="Hello">
        <textarea placeholder="Tell us about yourself" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
