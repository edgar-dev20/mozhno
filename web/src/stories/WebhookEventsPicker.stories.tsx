import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { WebhookEventsPicker } from '@/app/components/integrations/WebhookEventsPicker';

const meta: Meta<typeof WebhookEventsPicker> = {
  title: 'App/Integrations/WebhookEventsPicker',
  component: WebhookEventsPicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WebhookEventsPicker>;

export const Default: Story = {
  args: {
    formEvents: [],
    expandedCats: new Set(),
    onFormEventsChange: fn(),
    onToggleCatExpand: fn(),
  },
};

export const WithSelections: Story = {
  args: {
    formEvents: ['flag.created', 'flag.updated', 'flag.deleted'],
    expandedCats: new Set(['flags']),
    onFormEventsChange: fn(),
    onToggleCatExpand: fn(),
  },
};

export const AllExpanded: Story = {
  args: {
    formEvents: ['flag.created', 'instance.connected', 'user.invited'],
    expandedCats: new Set(['flags', 'instances', 'users']),
    onFormEventsChange: fn(),
    onToggleCatExpand: fn(),
  },
};
