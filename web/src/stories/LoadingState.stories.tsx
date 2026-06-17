import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState } from '@/shared/components/LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'Shared/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {};
export const CustomText: Story = { args: { text: 'Loading users...' } };
