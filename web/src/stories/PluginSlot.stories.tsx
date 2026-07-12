import type { Meta, StoryObj } from '@storybook/react';
import { PluginSlot } from '@/app/components/PluginSlot';

const meta: Meta<typeof PluginSlot> = {
  title: 'App/PluginSlot',
  component: PluginSlot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PluginSlot>;

export const WithFallback: Story = {
  args: {
    slotId: 'settings.premium',
    fallback: <span className="text-xs text-muted-foreground">No plugin registered</span>,
  },
};
export const Empty: Story = { args: { slotId: 'settings.premium' } };
