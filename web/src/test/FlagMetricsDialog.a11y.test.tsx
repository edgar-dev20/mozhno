import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '@/test/a11y-helpers';
import { FlagMetricsDialog } from '@/app/components/FlagMetricsDialog';
import { api } from '@/api';
import type { FlagContributor } from '@/api';

vi.mock('@/api', () => ({
  api: {
    metrics: {
      get: vi.fn(),
      contributors: vi.fn(),
    },
  },
}));

const mockEnvironments = [{ id: 1, projectId: 1, name: 'production', createdAt: '' }];

const now = Date.now();

const CONTRIBUTORS: FlagContributor[] = [
  {
    instanceId: 11,
    sdkInstanceId: 'a1b2c3d4-1111',
    appName: 'web-app',
    appType: 'js',
    sdkVersion: '1.8.0',
    lastSeenAt: new Date(now - 2 * 60000).toISOString(),
    evaluationTrueCount: 2400,
    evaluationFalseCount: 600,
  },
  {
    instanceId: 12,
    sdkInstanceId: 'a1b2c3d4-2222',
    appName: 'web-app',
    appType: 'js',
    sdkVersion: '1.7.2',
    lastSeenAt: new Date(now - 40 * 60000).toISOString(),
    evaluationTrueCount: 700,
    evaluationFalseCount: 100,
  },
  {
    instanceId: 21,
    sdkInstanceId: '9f8e7d6c-3333',
    appName: 'checkout-service',
    appType: 'java',
    sdkVersion: '2.4.0',
    lastSeenAt: new Date(now - 3 * 3600000).toISOString(),
    evaluationTrueCount: 1500,
    evaluationFalseCount: 500,
  },
];

describe('FlagMetricsDialog a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.metrics.get).mockResolvedValue([]);
    vi.mocked(api.metrics.contributors).mockResolvedValue([]);
  });

  it('has no accessibility violations in empty state', async () => {
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

  it('has no accessibility violations with contributors and expanded instances', async () => {
    vi.mocked(api.metrics.contributors).mockResolvedValue(CONTRIBUTORS);
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
      expect(screen.getAllByText('web-app').length).toBeGreaterThan(0);
    });

    const chevron = await screen.findByRole('button', { expanded: false });
    await userEvent.click(chevron);
    await screen.findByText('a1b2c3d4-1111');

    await checkA11y(container);
  });
});
