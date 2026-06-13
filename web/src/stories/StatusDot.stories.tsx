import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from '@/shared/components/StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Shared/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Active: Story = { args: { state: 'active' } };
export const Recent: Story = { args: { state: 'recent' } };
export const Stale: Story = { args: { state: 'stale' } };
export const Neutral: Story = { args: { state: 'neutral' } };
export const Small: Story = { args: { state: 'active', size: 'sm' } };
