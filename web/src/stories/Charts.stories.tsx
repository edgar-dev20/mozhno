import type { Meta, StoryObj } from '@storybook/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const BAR_DATA = [
  { time: '00:00', true: 24, false: 8 },
  { time: '02:00', true: 18, false: 6 },
  { time: '04:00', true: 12, false: 4 },
  { time: '06:00', true: 8, false: 3 },
  { time: '08:00', true: 15, false: 5 },
  { time: '10:00', true: 32, false: 10 },
  { time: '12:00', true: 45, false: 12 },
  { time: '14:00', true: 38, false: 11 },
  { time: '16:00', true: 50, false: 15 },
  { time: '18:00', true: 42, false: 13 },
  { time: '20:00', true: 35, false: 9 },
  { time: '22:00', true: 28, false: 7 },
];

const LINE_DATA = [
  { day: 'Mon', flags: 12, evaluations: 420 },
  { day: 'Tue', flags: 15, evaluations: 580 },
  { day: 'Wed', flags: 18, evaluations: 720 },
  { day: 'Thu', flags: 20, evaluations: 650 },
  { day: 'Fri', flags: 22, evaluations: 890 },
  { day: 'Sat', flags: 10, evaluations: 310 },
  { day: 'Sun', flags: 8, evaluations: 250 },
];

function ChartDemo() {
  return (
    <div className="p-8 space-y-12 max-w-4xl">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">
          Stacked Bar Chart
        </h2>
        <div className="rounded-xl bg-card ring-1 ring-border p-5 h-[350px]">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
              Flag Evaluations (48h)
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-true" />
              <span className="text-muted-foreground/60">true</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-false" />
              <span className="text-muted-foreground/60">false</span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={BAR_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-border)"
                strokeOpacity={0.12}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                interval={2}
                height={30}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                allowDecimals={false}
                width={40}
              />
              <Tooltip
                cursor={{
                  stroke: 'var(--color-sparkline-false)',
                  strokeWidth: 1,
                  strokeOpacity: 0.25,
                }}
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'calc(var(--radius) + 0.125rem)',
                  color: 'var(--color-popover-foreground)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
              />
              <Bar
                dataKey="false"
                stackId="a"
                fill="var(--sparkline-false)"
                name="false"
              />
              <Bar
                dataKey="true"
                stackId="a"
                fill="var(--sparkline-true)"
                radius={[3, 3, 0, 0]}
                name="true"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">
          Line Chart
        </h2>
        <div className="rounded-xl bg-card ring-1 ring-border p-5 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LINE_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-border)"
                strokeOpacity={0.12}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                height={30}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} width={45} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'calc(var(--radius) + 0.125rem)',
                  color: 'var(--color-popover-foreground)',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="flags"
                stroke="var(--color-brand)"
                strokeWidth={2}
                dot={{
                  stroke: 'var(--color-brand)',
                  strokeWidth: 2,
                  fill: 'var(--color-card)',
                  r: 4,
                }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="evaluations"
                stroke="var(--color-chart-5)"
                strokeWidth={2}
                dot={{
                  stroke: 'var(--color-chart-5)',
                  strokeWidth: 2,
                  fill: 'var(--color-card)',
                  r: 4,
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">
          Chart Colors
        </h2>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="size-12 rounded-xl flex items-center justify-center text-xs font-mono font-medium text-primary-foreground"
              style={{ backgroundColor: `var(--chart-${i})` }}
            >
              {i}
            </div>
          ))}
          <div className="size-12 rounded-xl flex items-center justify-center text-xs font-mono font-medium text-primary-foreground bg-sparkline-true">
            T
          </div>
          <div className="size-12 rounded-xl flex items-center justify-center text-xs font-mono font-medium bg-sparkline-false">
            F
          </div>
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Charts',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const ChartGallery: Story = {
  render: () => <ChartDemo />,
};
