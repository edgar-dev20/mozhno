import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FlagMetricsDialog } from '../app/components/FlagMetricsDialog';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    metrics: {
      get: vi.fn(),
    },
  },
}));

const mockEnvironments = [
  { id: 1, projectId: 1, name: 'production', createdAt: '' },
  { id: 2, projectId: 1, name: 'staging', createdAt: '' },
];

describe('FlagMetricsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.metrics.get as any).mockResolvedValue([]);
  });

  it('renders dialog when open', async () => {
    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Test Flag"
        environments={mockEnvironments}
        defaultEnvId={1}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Test Flag · production')).toBeTruthy();
    });
  });

  it('does not render dialog content when closed', () => {
    const { container } = render(
      <FlagMetricsDialog
        open={false}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Test Flag"
        environments={mockEnvironments}
      />
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('loads metrics for default env on open', async () => {
    const mockMetrics = [
      { id: 1, projectId: 1, flagId: 1, environmentId: 1, evaluationTrueCount: 50, evaluationFalseCount: 10, timeBucket: '2026-06-06T10:00:00Z', createdAt: '' },
    ];
    (api.metrics.get as any).mockResolvedValue(mockMetrics);

    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Test Flag"
        environments={mockEnvironments}
        defaultEnvId={1}
      />
    );

    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 1);
    });
  });

  it('hides env selector when defaultEnvId is provided', async () => {
    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="My Flag"
        environments={mockEnvironments}
        defaultEnvId={2}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('My Flag · staging')).toBeTruthy();
    });
    expect(screen.queryByLabelText('Окружение')).toBeNull();
  });

  it('shows env selector when no defaultEnvId', async () => {
    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="My Flag"
        environments={mockEnvironments}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Окружение')).toBeTruthy();
    });
  });

  it('shows empty state when no data', async () => {
    (api.metrics.get as any).mockResolvedValue([]);

    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Empty Flag"
        environments={mockEnvironments}
        defaultEnvId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Нет данных/)).toBeTruthy();
    });
  });

  it('displays true/false totals from loaded metrics', async () => {
    const mockMetrics = [
      { id: 1, projectId: 1, flagId: 1, environmentId: 1, evaluationTrueCount: 70, evaluationFalseCount: 30, timeBucket: '2026-06-06T10:00:00Z', createdAt: '' },
      { id: 2, projectId: 1, flagId: 1, environmentId: 1, evaluationTrueCount: 50, evaluationFalseCount: 20, timeBucket: '2026-06-06T11:00:00Z', createdAt: '' },
    ];
    (api.metrics.get as any).mockResolvedValue(mockMetrics);

    render(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Total Flag"
        environments={mockEnvironments}
        defaultEnvId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('true 120')).toBeTruthy();
      expect(screen.getByText('false 50')).toBeTruthy();
    });
  });
});
