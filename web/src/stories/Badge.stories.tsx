import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/shared/components/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Label' },
  argTypes: {
    variant: {
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'destructive', 'info'],
      control: { type: 'select' },
    },
    style: {
      options: ['solid', 'outline', 'subtle'],
      control: { type: 'select' },
    },
    shape: {
      options: ['rounded', 'pill'],
      control: { type: 'select' },
    },
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Variants: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
          Solid
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" style="solid">
            Default
          </Badge>
          <Badge variant="primary" style="solid">
            Primary
          </Badge>
          <Badge variant="success" style="solid">
            Success
          </Badge>
          <Badge variant="warning" style="solid">
            Warning
          </Badge>
          <Badge variant="destructive" style="solid">
            Destructive
          </Badge>
          <Badge variant="info" style="solid">
            Info
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
          Outline
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" style="outline">
            Default
          </Badge>
          <Badge variant="primary" style="outline">
            Primary
          </Badge>
          <Badge variant="success" style="outline">
            Success
          </Badge>
          <Badge variant="warning" style="outline">
            Warning
          </Badge>
          <Badge variant="destructive" style="outline">
            Destructive
          </Badge>
          <Badge variant="info" style="outline">
            Info
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
          Subtle
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" style="subtle">
            Default
          </Badge>
          <Badge variant="primary" style="subtle">
            Primary
          </Badge>
          <Badge variant="success" style="subtle">
            Success
          </Badge>
          <Badge variant="warning" style="subtle">
            Warning
          </Badge>
          <Badge variant="destructive" style="subtle">
            Destructive
          </Badge>
          <Badge variant="info" style="subtle">
            Info
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
          Shapes & Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary" shape="rounded" size="sm">
            Rounded SM
          </Badge>
          <Badge variant="primary" shape="rounded" size="md">
            Rounded MD
          </Badge>
          <Badge variant="primary" shape="pill" size="sm">
            Pill SM
          </Badge>
          <Badge variant="primary" shape="pill" size="md">
            Pill MD
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
          With Icons
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}>
            Active
          </Badge>
          <Badge
            variant="destructive"
            icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
          >
            Failed
          </Badge>
          <Badge variant="info" uppercase>
            UPPERCASE
          </Badge>
        </div>
      </div>
    </div>
  ),
};
