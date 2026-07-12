import type { Meta, StoryObj } from '@storybook/react';
import { PageLoader } from '@/shared/components/PageLoader';

const meta: Meta<typeof PageLoader> = {
  title: 'Shared/PageLoader',
  component: PageLoader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PageLoader>;

export const Default: Story = {};
