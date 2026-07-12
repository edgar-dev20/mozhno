import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

function BrokenComponent() {
  throw new Error('Test error for ErrorBoundary demo');
  return null;
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'App/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = { args: { children: <span>Everything is fine</span> } };
export const WithError: Story = {
  render: () => (
    <ErrorBoundary fallback={<div className="p-4 text-destructive">Something went wrong!</div>}>
      <BrokenComponent />
    </ErrorBoundary>
  ),
};
