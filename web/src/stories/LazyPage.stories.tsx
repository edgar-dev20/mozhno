import type { Meta, StoryObj } from '@storybook/react';
import { LazyPage } from '@/shared/components/LazyPage';
import { lazy } from 'react';

const DummyComponent = lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="p-8 text-center">
        <h2 className="text-h2 font-heading mb-2">Loaded!</h2>
        <p className="text-body text-muted-foreground">
          This content was lazy-loaded with Suspense
        </p>
      </div>
    ),
  }),
);

const meta: Meta<typeof LazyPage> = {
  title: 'Shared/LazyPage',
  component: LazyPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof LazyPage>;

export const Default: Story = {
  args: { Component: DummyComponent },
};
