import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { Globe } from '@/shared/icons';

const meta: Meta<typeof ColorPicker> = {
  title: 'Shared/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  render: function DefaultRender() {
    const [color, setColor] = useState('#2d9484');
    return (
      <div className="max-w-md">
        <ColorPicker value={color} onChange={setColor} />
      </div>
    );
  },
};

export const WithNamedPreview: Story = {
  render: function NamedRender() {
    const [color, setColor] = useState('#c08140');
    return (
      <div className="max-w-md">
        <ColorPicker
          value={color}
          onChange={setColor}
          icon={<Globe size={20} className="text-primary-foreground" />}
          previewName="Production"
        />
      </div>
    );
  },
};

export const EmptyPreview: Story = {
  render: function EmptyRender() {
    const [color, setColor] = useState('#6d5ae0');
    return (
      <div className="max-w-md">
        <ColorPicker
          value={color}
          onChange={setColor}
          icon={<Globe size={20} className="text-primary-foreground" />}
          previewPlaceholder="No name set"
        />
      </div>
    );
  },
};

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: function DarkRender() {
    const [color, setColor] = useState('#3db8a5');
    return (
      <div className="max-w-md">
        <ColorPicker value={color} onChange={setColor} />
      </div>
    );
  },
};
