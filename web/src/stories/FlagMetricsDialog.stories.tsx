import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { FlagMetricsDialog } from '@/app/components/FlagMetricsDialog';
import { LocaleProvider } from '@/i18n';
import type { Environment, FlagContributor, FlagMetric } from '@/api';

const MOCK_ENVS: Environment[] = [
  { id: 1, name: 'Production', projectId: 1, color: '#22c55e', createdAt: '' },
  { id: 2, name: 'Staging', projectId: 1, color: '#eab308', createdAt: '' },
];

const NOW = Date.now();

const mockState = vi.hoisted(() => ({
  metrics: [] as FlagMetric[],
  contributors: [] as FlagContributor[],
}));

vi.mock('@/api', () => ({
  api: {
    metrics: {
      get: vi.fn(() => Promise.resolve(mockState.metrics)),
      contributors: vi.fn(() => Promise.resolve(mockState.contributors)),
    },
  },
}));

function hourBucket(hoursAgo: number): string {
  const now = new Date();
  const ms =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()) -
    hoursAgo * 3600000;
  return new Date(ms).toISOString();
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

const CONTRIBUTORS: FlagContributor[] = [
  {
    instanceId: 11,
    sdkInstanceId: 'a1b2c3d4-1111',
    appName: 'web-app',
    appType: 'js',
    sdkVersion: '1.8.0',
    lastSeenAt: new Date(NOW - 2 * 60000).toISOString(),
    evaluationTrueCount: 2400,
    evaluationFalseCount: 600,
  },
  {
    instanceId: 12,
    sdkInstanceId: 'a1b2c3d4-2222',
    appName: 'web-app',
    appType: 'js',
    sdkVersion: '1.7.2',
    lastSeenAt: new Date(NOW - 40 * 60000).toISOString(),
    evaluationTrueCount: 700,
    evaluationFalseCount: 100,
  },
  {
    instanceId: 21,
    sdkInstanceId: '9f8e7d6c-3333',
    appName: 'checkout-service',
    appType: 'java',
    sdkVersion: '2.4.0',
    lastSeenAt: new Date(NOW - 3 * 3600000).toISOString(),
    evaluationTrueCount: 1500,
    evaluationFalseCount: 500,
  },
];

const METRICS: FlagMetric[] = [
  metricAt(0, 620, 150),
  metricAt(2, 780, 200),
  metricAt(4, 540, 130),
  metricAt(6, 690, 170),
  metricAt(8, 510, 120),
  metricAt(10, 460, 110),
];

function setStoryData(contributors: FlagContributor[], metrics: FlagMetric[]) {
  mockState.contributors = contributors;
  mockState.metrics = metrics;
}

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        Open Metrics
      </button>
      <FlagMetricsDialog
        open={open}
        onOpenChange={setOpen}
        flagId={1}
        flagName="new-checkout"
        environments={MOCK_ENVS}
        defaultEnvId={1}
      />
    </div>
  );
}

const meta: Meta<typeof FlagMetricsDialog> = {
  title: 'App/Flags/FlagMetricsDialog',
  component: FlagMetricsDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      localStorage.setItem('mozhno-locale', 'en');
      return (
        <LocaleProvider>
          <Story />
        </LocaleProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Contributors: Story = {
  render: () => {
    setStoryData(CONTRIBUTORS, METRICS);
    return <Demo />;
  },
  play: async () => {
    await screen.findByText('web-app');
    await screen.findByText('checkout-service');
  },
};

export const FilteredByApp: Story = {
  render: () => {
    setStoryData(CONTRIBUTORS, METRICS);
    return <Demo />;
  },
  play: async () => {
    const appRow = await screen.findByText('web-app');
    fireEvent.click(appRow);
    await screen.findByText('Showing:');
  },
};

export const FilteredByInstance: Story = {
  render: () => {
    setStoryData(CONTRIBUTORS, METRICS);
    return <Demo />;
  },
  play: async () => {
    const chevron = await screen.findByRole('button', { expanded: false });
    fireEvent.click(chevron);
    const instance = await screen.findByText('a1b2c3d4-1111');
    fireEvent.click(instance);
    await screen.findByText('Showing:');
  },
};

export const Empty: Story = {
  render: () => {
    setStoryData([], []);
    return <Demo />;
  },
  play: async () => {
    await screen.findByText('SDKs have not sent metrics yet');
  },
};

export const FilteredToZero: Story = {
  render: () => {
    setStoryData([CONTRIBUTORS[0]], []);
    return <Demo />;
  },
  play: async () => {
    const appRow = await screen.findByText('web-app');
    fireEvent.click(appRow);
    await screen.findByRole('button', { name: 'Show all' });
  },
};

function SingleEnvDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        Open Metrics
      </button>
      <FlagMetricsDialog
        open={open}
        onOpenChange={setOpen}
        flagId={1}
        flagName="single-env-flag"
        environments={[
          { id: 1, name: 'Production', projectId: 1, color: '#22c55e', createdAt: '' },
        ]}
        defaultEnvId={1}
      />
    </div>
  );
}

export const SingleEnvironment: Story = {
  render: () => {
    setStoryData(CONTRIBUTORS, METRICS);
    return <SingleEnvDemo />;
  },
};
