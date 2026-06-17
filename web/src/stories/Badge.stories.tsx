import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/shared/components/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Label' },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { variant: 'default', children: 'Default' } };
export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
export const Success: Story = { args: { variant: 'success', children: 'Success' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Destructive' } };
export const Pill: Story = { args: { variant: 'primary', shape: 'pill', children: 'Pill' } };
export const Uppercase: Story = {
  args: { variant: 'primary', uppercase: true, children: 'UPPER' },
};
export const Solid: Story = { args: { variant: 'success', style: 'solid', children: 'Solid' } };
export const Outline: Story = {
  args: { variant: 'primary', style: 'outline', children: 'Outline' },
};
export const WithIcon: Story = {
  args: {
    variant: 'success',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-current" />,
    children: 'With Icon',
  },
};
