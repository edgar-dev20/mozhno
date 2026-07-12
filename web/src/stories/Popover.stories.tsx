import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
        Open Popover
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-xs text-muted-foreground">Set the dimensions for the layer.</p>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="width">Width</Label>
            <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => <PopoverDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open Popover' }));
    await expect(screen.getByText('Dimensions')).toBeVisible();
  },
};

export const CloseOnEscape: Story = {
  render: () => <PopoverDemo />,
};
