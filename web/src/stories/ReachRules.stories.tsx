import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from 'storybook/test';
import { ReachRules } from '@/app/components/flags/ReachRules';

const meta: Meta<typeof ReachRules> = {
  title: 'App/Flags/ReachRules',
  component: ReachRules,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }} className="rounded-2xl border border-border bg-popover p-4">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ReachRules>;

export const CustomAndSegments: Story = {
  args: {
    sources: [
      {
        key: 'custom',
        kind: 'custom',
        name: 'Пользовательское',
        conditions: [
          { field: 'country', operator: 'in', values: ['RU', 'KZ', 'BY'] },
          { field: 'app_version', operator: 'gte', contextType: 'semver', values: ['2.4.0'] },
        ],
      },
      {
        key: 'seg-1',
        kind: 'segment',
        name: 'Бета-пользователи',
        color: '#2d9484',
        icon: 'Rocket',
        conditions: [{ field: 'plan', operator: 'eq', values: ['pro'] }],
      },
      {
        key: 'seg-2',
        kind: 'segment',
        name: 'Внутренние сотрудники',
        color: '#6d5ae0',
        icon: 'Users',
        conditions: [{ field: 'role', operator: 'eq', values: ['admin'] }],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Пользовательское')).toBeInTheDocument();
    await expect(canvas.getByText('Бета-пользователи')).toBeInTheDocument();
    await expect(canvas.getByText('Внутренние сотрудники')).toBeInTheDocument();
  },
};

export const ManyValues: Story = {
  args: {
    sources: [
      {
        key: 'custom',
        kind: 'custom',
        name: 'Пользовательское',
        conditions: [
          { field: 'country', operator: 'in', values: ['RU', 'KZ', 'BY', 'AM', 'GE', 'UZ'] },
          { field: 'email', operator: 'contains', values: ['@mozhno.dev'] },
        ],
      },
      {
        key: 'seg-3',
        kind: 'segment',
        name: 'Клиенты Pro',
        color: '#c08140',
        icon: 'Crown',
        conditions: [{ field: 'region', operator: 'in', values: ['EU', 'US'] }],
      },
    ],
  },
};
