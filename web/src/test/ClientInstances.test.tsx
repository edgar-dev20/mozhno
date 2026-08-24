import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientInstances } from '@/app/components/ClientInstances';
import { api } from '@/api';
import type { ClientInstance, ClientInstanceUsage } from '@/api';

vi.mock('@/api', () => ({
  api: {
    clientInstances: {
      list: vi.fn(),
      usage: vi.fn(),
    },
  },
}));

vi.mock('@/app/hooks/queries', () => ({
  useProjectQuery: () => ({ data: { id: 1 } }),
  useEnvironmentsQuery: () => ({
    data: [{ id: 1, projectId: 1, name: 'production', color: '#22c55e', createdAt: '' }],
  }),
}));

const now = Date.now();

function makeInstance(overrides: Partial<ClientInstance> = {}): ClientInstance {
  return {
    id: 1,
    projectId: 1,
    environmentId: 1,
    apiKeyId: null,
    appName: 'web-app',
    instanceId: 'inst-a',
    appType: 'js',
    sdkVersion: '1.8.0',
    keyType: 'FRONTEND',
    firstSeenAt: new Date(now - 3600_000).toISOString(),
    lastSeenAt: new Date(now - 60_000).toISOString(),
    ...overrides,
  };
}

function makeUsage(overrides: Partial<ClientInstanceUsage> = {}): ClientInstanceUsage {
  return {
    appName: 'web-app',
    environmentId: 1,
    hours: 168,
    totalActiveFlags: 4,
    flags: [
      {
        flagId: 1,
        key: 'new-checkout',
        name: 'Новый чек-аут',
        flagType: 'RELEASE',
        enabled: true,
        percentage: null,
        evaluationTrueCount: 1200,
        evaluationFalseCount: 1800,
        totalEvaluations: 3000,
      },
    ],
    ...overrides,
  };
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <ClientInstances />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ClientInstances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.clientInstances.list).mockResolvedValue([makeInstance()]);
    vi.mocked(api.clientInstances.usage).mockResolvedValue(makeUsage());
  });

  it('renders empty state when no instances are connected', async () => {
    vi.mocked(api.clientInstances.list).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Нет подключений')).toBeTruthy();
  });

  it('loads activation usage on expand and shows flags with observed rate', async () => {
    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));

    expect(await screen.findByText('Новый чек-аут')).toBeTruthy();
    expect(screen.getByText('1 из 4')).toBeTruthy();
    expect(screen.getByText('new-checkout')).toBeTruthy();
    expect(api.clientInstances.usage).toHaveBeenCalledWith('web-app', 1, 168);
    expect(screen.getAllByText('40%').length).toBeGreaterThan(0);
    expect(screen.getByText('3.0K')).toBeTruthy();
  });

  it('shows empty message when the app attempted no activations', async () => {
    vi.mocked(api.clientInstances.usage).mockResolvedValue(makeUsage({ flags: [] }));

    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));

    expect(
      await screen.findByText(
        'Приложение не вызывало флаги за выбранный период (или SDK не передаёт метрики)',
      ),
    ).toBeTruthy();
    expect(screen.getByText('0 из 4')).toBeTruthy();
  });

  it('shows error with retry when usage fails', async () => {
    vi.mocked(api.clientInstances.usage).mockRejectedValueOnce(new Error('boom'));

    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));

    expect(await screen.findByText('Не удалось загрузить активации')).toBeTruthy();
    await userEvent.click(screen.getByText('Повторить'));

    await waitFor(() => {
      expect(api.clientInstances.usage).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('Новый чек-аут')).toBeTruthy();
  });

  it('refetches usage with the selected window', async () => {
    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));
    await screen.findByText('Новый чек-аут');

    await userEvent.click(screen.getByRole('button', { name: '30 дн' }));

    await waitFor(() => {
      expect(api.clientInstances.usage).toHaveBeenLastCalledWith('web-app', 1, 720);
    });
    expect(await screen.findByText('Новый чек-аут')).toBeTruthy();
  });

  it('marks the observed rate as approximate when the sample is small', async () => {
    vi.mocked(api.clientInstances.usage).mockResolvedValue(
      makeUsage({
        flags: [
          {
            flagId: 1,
            key: 'rare-flag',
            name: 'Редкий флаг',
            flagType: 'KILLSWITCH',
            enabled: false,
            percentage: 100,
            evaluationTrueCount: 20,
            evaluationFalseCount: 20,
            totalEvaluations: 40,
          },
        ],
      }),
    );

    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));

    expect(await screen.findByText('Редкий флаг')).toBeTruthy();
    expect(screen.getByText('~50%')).toBeTruthy();
    expect(screen.getByLabelText(/мало данных/)).toBeTruthy();
  });

  it('caps the chip list at 10 and expands on show-all', async () => {
    const flags = Array.from({ length: 12 }, (_, i) => ({
      flagId: i + 1,
      key: `flag-${i + 1}`,
      name: `Флаг ${i + 1}`,
      flagType: 'RELEASE' as const,
      enabled: true,
      percentage: null,
      evaluationTrueCount: 10,
      evaluationFalseCount: 0,
      totalEvaluations: 10,
    }));
    vi.mocked(api.clientInstances.usage).mockResolvedValue(makeUsage({ flags }));

    renderPage();

    await screen.findByText('web-app');
    await userEvent.click(screen.getByText('web-app'));

    expect(await screen.findByText('Флаг 1')).toBeTruthy();
    expect(screen.queryByText('Флаг 12')).toBeNull();
    expect(screen.getByText('+2')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /\+2/ }));
    expect(screen.getByText('Флаг 12')).toBeTruthy();
  });
});
