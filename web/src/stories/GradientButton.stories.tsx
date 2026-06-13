import type { Meta, StoryObj } from '@storybook/react';
import { GradientButton } from '@/shared/components/GradientButton';

const meta: Meta<typeof GradientButton> = {
  title: 'Shared/GradientButton',
  component: GradientButton,
  tags: ['autodocs'],
  args: { children: 'Button' },
};

export default meta;
type Story = StoryObj<typeof GradientButton>;

export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
export const Default: Story = { args: { variant: 'default', children: 'Default' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Outline' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost' } };
export const Loading: Story = { args: { loading: true, children: 'Saving...' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Large' } };
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
