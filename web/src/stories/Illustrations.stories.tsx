import type { Meta, StoryObj } from '@storybook/react';
import {
  EmptyFlagsIllustration,
  EmptyKeysIllustration,
  EmptySegmentsIllustration,
  EmptyTagsIllustration,
  EmptyConstraintsIllustration,
  EmptyAuditLogIllustration,
  EmptyUsersIllustration,
  EmptySettingsIllustration,
  EmptyIntegrationsIllustration,
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

export const EmptyTags: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyTagsIllustration />
      <p className="text-sm text-muted-foreground">Empty Tags Illustration</p>
    </div>
  ),
};

export const EmptyConstraints: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyConstraintsIllustration />
      <p className="text-sm text-muted-foreground">Empty Constraints Illustration</p>
    </div>
  ),
};

export const EmptyAuditLog: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyAuditLogIllustration />
      <p className="text-sm text-muted-foreground">Empty Audit Log Illustration</p>
    </div>
  ),
};

export const EmptyUsers: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyUsersIllustration />
      <p className="text-sm text-muted-foreground">Empty Users Illustration</p>
    </div>
  ),
};

export const EmptySettings: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptySettingsIllustration />
      <p className="text-sm text-muted-foreground">Empty Settings Illustration</p>
    </div>
  ),
};

export const EmptyIntegrations: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <EmptyIntegrationsIllustration />
      <p className="text-sm text-muted-foreground">Empty Integrations Illustration</p>
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
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyTagsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyTags</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyConstraintsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyConstraints</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyAuditLogIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyAuditLog</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyUsersIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyUsers</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptySettingsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptySettings</span>
      </div>
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border">
        <EmptyIntegrationsIllustration />
        <span className="text-xs text-muted-foreground/50">EmptyIntegrations</span>
      </div>
    </div>
  ),
};
