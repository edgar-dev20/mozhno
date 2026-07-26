import { describe, it, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { FlagMetricsDialog } from '@/app/components/FlagMetricsDialog';
import { api } from '@/api';

vi.mock('@/api', () => ({
  api: {
    metrics: {
      get: vi.fn(),
    },
    clientInstances: {
      list: vi.fn().mockResolvedValue([]),
    },
  },
}));

const mockEnvironments = [{ id: 1, projectId: 1, name: 'production', createdAt: '' }];

describe('FlagMetricsDialog a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.metrics.get).mockResolvedValue([]);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Test Flag"
        environments={mockEnvironments}
        defaultEnvId={1}
      />,
    );
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    });
    await checkA11y(container);
  });
});
