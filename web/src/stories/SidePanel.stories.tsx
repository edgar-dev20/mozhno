import type { Meta, StoryObj } from '@storybook/react';
import { SidePanel } from '@/app/components/SidePanel';
import { useState } from 'react';

const meta: Meta<typeof SidePanel> = {
  title: 'App/SidePanel',
  component: SidePanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {
  render: function SidePanelRender() {
    const [open, setOpen] = useState(true);
    return (
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        title="Settings"
        description="Configure your flag settings"
      >
        <div className="p-4 text-sm text-muted-foreground">Panel content goes here</div>
      </SidePanel>
    );
  },
};

export const WithFooter: Story = {
  render: function FooterRender() {
    const [open, setOpen] = useState(true);
    return (
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        title="Create Flag"
        description="Fill in the details below"
        footer={
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">
              Cancel
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
              Save
            </button>
          </div>
        }
      >
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-body-sm font-medium">Name</label>
            <input
              className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm"
              placeholder="Feature flag name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-body-sm font-medium">Key</label>
            <input
              className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-body-sm"
              placeholder="feature-flag-key"
            />
          </div>
        </div>
      </SidePanel>
    );
  },
};

export const LongContent: Story = {
  render: function LongRender() {
    const [open, setOpen] = useState(true);
    return (
      <SidePanel open={open} onOpenChange={setOpen} title="Documentation">
        <div className="p-4 space-y-3 text-body-sm text-muted-foreground">
          {Array.from({ length: 15 }, (_, i) => (
            <p key={i}>
              Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </SidePanel>
    );
  },
};
