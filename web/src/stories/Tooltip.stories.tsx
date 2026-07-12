import type { Meta, StoryObj } from '@storybook/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';

function TooltipDemo({ text = 'Tooltip text' }: { text?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
          Hover me
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => <TooltipDemo />,
};

export const LongText: Story = {
  render: () => <TooltipDemo text="A much longer tooltip with detailed explanation." />,
};
