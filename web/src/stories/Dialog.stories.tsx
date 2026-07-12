import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';

function DialogDemo({ title = 'Dialog Title' }: { title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>This is a dialog description.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => <DialogDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    await expect(screen.getByText('Dialog Title')).toBeVisible();
  },
};

export const CloseWithEscape: Story = {
  render: () => <DialogDemo />,
};

export const LongContent: Story = {
  render: () => <DialogDemo title="Terms and Conditions" />,
};
