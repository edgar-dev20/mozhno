import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

describe('ConfirmDialog a11y', () => {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no accessibility violations in destructive mode', async () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete item?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[role="alertdialog"]')).toBeTruthy();
    });
    await checkA11y(container);
  });

  it('has no accessibility violations in default mode', async () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Save changes?"
        description="Review before saving."
        variant="default"
        confirmLabel="Save"
        onConfirm={onConfirm}
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[role="alertdialog"]')).toBeTruthy();
    });
    await checkA11y(container);
  });
});
