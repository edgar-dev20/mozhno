import type { Meta, StoryObj } from '@storybook/react';
import { WebhookCurlPreview } from '@/app/components/integrations/WebhookCurlPreview';

const meta: Meta<typeof WebhookCurlPreview> = {
  title: 'App/Integrations/WebhookCurlPreview',
  component: WebhookCurlPreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WebhookCurlPreview>;

export const Default: Story = {
  args: {
    formUrl: 'https://api.example.com/webhooks',
    formHeaders: [{ id: 1, key: 'Content-Type', value: 'application/json' }],
    formBody: '{"event":"flag.updated"}',
  },
};

export const EmptyHeaders: Story = {
  args: { formUrl: 'https://api.example.com/webhooks', formHeaders: [], formBody: '' },
};

export const WithAuthHeader: Story = {
  args: {
    formUrl: 'https://api.example.com/webhooks',
    formHeaders: [
      { id: 1, key: 'Content-Type', value: 'application/json' },
      { id: 2, key: 'Authorization', value: 'Bearer sk-abc123...' },
    ],
    formBody: '{"event":"flag.updated","data":{"key":"checkout-v2"}}',
  },
};
