import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { WebhookCard } from '@/app/components/integrations/WebhookCard';
import { type Integration } from '@/api';

const MOCK_ITEM = {
  id: 1,
  name: 'Slack Notifier',
  url: 'https://hooks.slack.com/...',
  events: ['flag.created'],
  enabled: true,
  headers: [],
  body: '{}',
  createdAt: '2026-01-01',
} as unknown as Integration;

const meta: Meta<typeof WebhookCard> = {
  title: 'App/Integrations/WebhookCard',
  component: WebhookCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WebhookCard>;

export const Default: Story = { args: { item: MOCK_ITEM, index: 0, onEdit: fn() } };
export const Disabled: Story = {
  args: { item: { ...MOCK_ITEM, enabled: false }, index: 0, onEdit: fn() },
};
