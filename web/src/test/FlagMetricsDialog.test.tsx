import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlagMetricsDialog } from '@/app/components/FlagMetricsDialog';
import { api } from '@/api';
import type { FlagContributor, FlagMetric } from '@/api';

vi.mock('../api', () => ({
  api: {
    metrics: {
      get: vi.fn(),
      contributors: vi.fn(),
    },
  },
}));

const mockEnvironments = [
  { id: 1, projectId: 1, name: 'production', createdAt: '' },
  { id: 2, projectId: 1, name: 'staging', createdAt: '' },
];

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

function hourBucket(hoursAgo: number): string {
  const d = new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours()) -
      hoursAgo * 3600000,
  ).toISOString();
}

function metricAt(hoursAgo: number, trueCount: number, falseCount: number): FlagMetric {
  return {
    flagId: 1,
    environmentId: 1,
    evaluationTrueCount: trueCount,
    evaluationFalseCount: falseCount,
    timeBucket: hourBucket(hoursAgo),
  };
}

const METRICS: FlagMetric[] = [
  metricAt(0, 620, 150),
  metricAt(2, 780, 200),
  metricAt(4, 540, 130),
  metricAt(6, 690, 170),
];

function renderDialog(overrides: Partial<Parameters<typeof FlagMetricsDialog>[0]> = {}) {
  return render(
    <FlagMetricsDialog
      open={true}
      onOpenChange={() => {}}
      flagId={1}
      flagName="Test Flag"
      environments={mockEnvironments}
      defaultEnvId={1}
      {...overrides}
    />,
  );
}

describe('FlagMetricsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.metrics.get).mockResolvedValue([]);
    vi.mocked(api.metrics.contributors).mockResolvedValue([]);
  });

  it('renders dialog when open', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('Test Flag')).toBeTruthy();
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
      />,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('loads metrics and contributors for default env on open', async () => {
    renderDialog();
    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 1, undefined);
    });
    await waitFor(() => {
      expect(api.metrics.contributors).toHaveBeenCalledWith(1, 1);
    });
  });

  it('hides env selector when defaultEnvId is provided', async () => {
    renderDialog({ defaultEnvId: 2 });
    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 2, undefined);
    });
    expect(screen.queryByLabelText('Окружение')).toBeNull();
  });

  it('shows env selector when no defaultEnvId', async () => {
    renderDialog({ defaultEnvId: undefined });
    await waitFor(() => {
      expect(screen.getByText('production')).toBeTruthy();
    });
  });

  it('shows empty state when no data', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText(/Нет данных/)).toBeTruthy();
    });
  });

  it('shows contributors empty state when SDKs sent no metrics', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('SDK ещё не отправляли метрики')).toBeTruthy();
    });
  });

  it('displays true/false totals from loaded metrics', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue(METRICS);
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText(/true 2\s*630/)).toBeTruthy();
      expect(screen.getByText(/false 650/)).toBeTruthy();
    });
  });

  it('groups contributors by app sorted by contribution descending', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue(METRICS);
    vi.mocked(api.metrics.contributors).mockResolvedValue(CONTRIBUTORS);
    renderDialog();

    await waitFor(() => {
      const appButtons = screen.getAllByRole('button', { name: /web-app|checkout-service/ });
      expect(appButtons.length).toBe(2);
      expect(appButtons[0].textContent).toContain('web-app');
      expect(appButtons[1].textContent).toContain('checkout-service');
    });
  });

  it('filters chart by app when app row clicked', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue(METRICS);
    vi.mocked(api.metrics.contributors).mockResolvedValue(CONTRIBUTORS);
    renderDialog();

    await waitFor(() => {
      expect(screen.getAllByText('web-app').length).toBeGreaterThan(0);
    });
    await userEvent.click(screen.getAllByText('web-app')[0]);

    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 1, { appName: 'web-app' });
    });
    expect(screen.getByText('Показано:')).toBeTruthy();
  });

  it('filters chart by instance when expanded instance row clicked', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue(METRICS);
    vi.mocked(api.metrics.contributors).mockResolvedValue(CONTRIBUTORS);
    renderDialog();

    const chevron = await screen.findByRole('button', { expanded: false });
    await userEvent.click(chevron);

    const instance = await screen.findByText('a1b2c3d4-1111');
    await userEvent.click(instance);

    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 1, { instanceId: 11 });
    });
    expect(screen.getByText('Показано:')).toBeTruthy();
  });

  it('shows filtered empty state with show-all action when filter yields no data', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue([]);
    vi.mocked(api.metrics.contributors).mockResolvedValue([CONTRIBUTORS[0]]);
    renderDialog();

    await waitFor(() => {
      expect(screen.getAllByText('web-app').length).toBeGreaterThan(0);
    });
    await userEvent.click(screen.getAllByText('web-app')[0]);

    await waitFor(() => {
      expect(screen.getByText('У этого приложения нет оценок за последние 48 часов')).toBeTruthy();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Показать все' }));
    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 1, undefined);
    });
  });

  it('resets filters when environment changes', async () => {
    vi.mocked(api.metrics.get).mockResolvedValue(METRICS);
    vi.mocked(api.metrics.contributors).mockResolvedValue(CONTRIBUTORS);
    const { rerender } = renderDialog();

    await waitFor(() => {
      expect(screen.getAllByText('web-app').length).toBeGreaterThan(0);
    });
    await userEvent.click(screen.getAllByText('web-app')[0]);
    await waitFor(() => {
      expect(screen.getByText('Показано:')).toBeTruthy();
    });

    rerender(
      <FlagMetricsDialog
        open={true}
        onOpenChange={() => {}}
        flagId={1}
        flagName="Test Flag"
        environments={mockEnvironments}
        defaultEnvId={2}
      />,
    );

    await waitFor(() => {
      expect(api.metrics.get).toHaveBeenCalledWith(1, 2, undefined);
    });
    expect(screen.queryByText('Показано:')).toBeNull();
  });
});
