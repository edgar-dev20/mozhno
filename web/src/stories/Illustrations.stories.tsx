import type { Meta, StoryObj } from '@storybook/react';
import {
  EmptyFlagsIllustration,
  EmptyKeysIllustration,
  EmptySegmentsIllustration,
} from '@/shared/components/illustrations';

const meta: Meta = {
  title: 'Shared/Illustrations',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

export const EmptyFlags: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyFlagsIllustration />
      <p className="text-sm text-muted-foreground">Empty Flags Illustration</p>
    </div>
  ),
};

export const EmptyKeys: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyKeysIllustration />
      <p className="text-sm text-muted-foreground">Empty API Keys Illustration</p>
    </div>
  ),
};

export const EmptySegments: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptySegmentsIllustration />
      <p className="text-sm text-muted-foreground">Empty Segments Illustration</p>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyFlagsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyFlags</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyKeysIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyKeys</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptySegmentsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptySegments</span>
      </div>
    </div>
  ),
};
