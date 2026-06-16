import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { Trash2 } from '@/shared/icons';
import { useState } from 'react';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => {
      const [open, setOpen] = useState(true);
      return <Story args={{ open, onOpenChange: setOpen }} />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Destructive: Story = {
  args: {
    title: 'Delete flag',
    description: 'Are you sure you want to delete "new-checkout"? This action cannot be undone.',
    variant: 'destructive',
    confirmLabel: 'Delete',
    onConfirm: () => {},
  },
};

export const Default: Story = {
  args: {
    title: 'Save changes',
    description: 'You have unsaved changes. Do you want to save them before leaving?',
    variant: 'default',
    confirmLabel: 'Save',
    onConfirm: () => {},
  },
};

export const Loading: Story = {
  args: {
    title: 'Deleting...',
    description: 'Please wait while we delete the flag.',
    variant: 'destructive',
    confirmLabel: 'Delete',
    loading: true,
    onConfirm: () => {},
  },
};
