import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from 'storybook/test';
import { FlagSparkline, SparklinePlaceholder } from '@/app/components/FlagSparkline';

interface SparklineBucket {
  trueCount: number;
  falseCount: number;
}

const SAMPLE_DATA: SparklineBucket[] = Array.from({ length: 48 }, (_, i) => ({
  trueCount: Math.round(20 + 15 * Math.sin((i / 48) * Math.PI * 2) + Math.random() * 10),
  falseCount: Math.round(5 + 8 * Math.cos((i / 48) * Math.PI * 2 + 1) + Math.random() * 5),
}));

const FLAT_DATA: SparklineBucket[] = Array.from({ length: 24 }, () => ({
  trueCount: Math.round(30 + Math.random() * 10),
  falseCount: Math.round(10 + Math.random() * 5),
}));

const EMPTY_DATA: SparklineBucket[] = [];

const meta: Meta<typeof FlagSparkline> = {
  title: 'App/Flags/FlagSparkline',
  component: FlagSparkline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagSparkline>;

export const WithData: Story = {
  args: { data: SAMPLE_DATA },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Sparkline chart' })).toBeInTheDocument();
  },
};

export const TallSparkline: Story = {
  args: { data: SAMPLE_DATA, height: 120 },
};

export const FlatData: Story = {
  args: { data: FLAT_DATA },
};

export const Empty: Story = {
  args: { data: EMPTY_DATA },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('—')).toBeInTheDocument();
  },
};

export const Placeholder: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div className="p-4 rounded-xl bg-card border border-border">
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">
          Placeholder (loading)
        </span>
        <SparklinePlaceholder height={56} />
      </div>
      <div className="p-4 rounded-xl bg-card border border-border">
        <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">
          Placeholder (tall)
        </span>
        <SparklinePlaceholder height={120} />
      </div>
    </div>
  ),
};
