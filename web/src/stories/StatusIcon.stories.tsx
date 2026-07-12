import type { Meta, StoryObj } from '@storybook/react';
import { StatusIcon } from '@/shared/components/StatusIcon';
import { Info as InfoIcon, Trash2, Check, AlertTriangle, Zap } from '@/shared/icons';

const meta: Meta<typeof StatusIcon> = {
  title: 'Shared/StatusIcon',
  component: StatusIcon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof StatusIcon>;

export const Brand: Story = { args: { variant: 'brand', icon: <Zap /> } };
export const Destructive: Story = { args: { variant: 'destructive', icon: <Trash2 /> } };
export const Success: Story = { args: { variant: 'success', icon: <Check /> } };
export const Warning: Story = { args: { variant: 'warning', icon: <AlertTriangle /> } };
export const Info: Story = { args: { variant: 'info', icon: <InfoIcon /> } };
export const Small: Story = { args: { variant: 'brand', icon: <Zap />, size: 'sm' } };
