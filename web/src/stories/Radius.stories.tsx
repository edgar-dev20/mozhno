import type { Meta, StoryObj } from "@storybook/react";

const RADII: { name: string; cssVar: string; computed: string }[] = [
  { name: "sm", cssVar: "var(--radius-sm)", computed: "calc(var(--radius) - 0.25rem) = 0.375rem" },
  { name: "md", cssVar: "var(--radius-md)", computed: "calc(var(--radius) - 0.125rem) = 0.5rem" },
  { name: "lg", cssVar: "var(--radius-lg)", computed: "var(--radius) = 0.625rem" },
  { name: "xl", cssVar: "var(--radius-xl)", computed: "calc(var(--radius) + 0.25rem) = 0.875rem" },
];

function RadiusShowcase() {
  return (
    <div className="p-8 space-y-12 max-w-3xl">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Radius Scale</h2>
        <p className="text-body-sm text-muted-foreground mb-4">
          Base token: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--radius: 0.625rem</code>
        </p>
        <div className="flex flex-wrap gap-6 items-end">
          {RADII.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-3">
              <div
                className="w-20 h-20 bg-brand text-brand-foreground flex items-center justify-center"
                style={{ borderRadius: r.cssVar }}
              >
                <span className="text-xs font-mono font-medium">{r.name}</span>
              </div>
              <span className="text-caption text-muted-foreground/50 text-center font-mono leading-tight max-w-[120px]">
                {r.computed}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Applied to Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RADII.map((r) => (
            <div
              key={r.name}
              className="p-5 bg-card border border-border"
              style={{ borderRadius: r.cssVar }}
            >
              <div className="text-sm font-medium text-foreground mb-1">Radius {r.name}</div>
              <div className="text-xs text-muted-foreground/50 font-mono">
                {r.computed}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Tailwind Utility Mapping</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              { utility: "rounded-sm", token: "var(--radius-sm)", example: "Button, Badge" },
              { utility: "rounded-md", token: "var(--radius-md)", example: "Skeleton, small cards" },
              { utility: "rounded-lg", token: "var(--radius-lg)", example: "Input, Select, Toggle" },
              { utility: "rounded-xl", token: "var(--radius-xl)", example: "Card, Calendar day, Panel" },
            ] as const
          ).map((item) => (
            <div key={item.utility} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div
                className="size-12 bg-brand flex items-center justify-center shrink-0"
                style={{ borderRadius: item.token }}
              >
                <span className="text-white text-xs font-mono font-medium">{item.utility.split("-")[1]}</span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <code className="text-xs font-mono text-foreground/80">{item.utility}</code>
                <span className="text-caption text-muted-foreground/40">{item.example}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Radius",
  component: RadiusShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Border-radius tokens defined via `@theme inline` in `theme.css`. Base `--radius: 0.625rem` with computed `--radius-sm/md/lg/xl` variables. All shadcn/ui components use Tailwind's `rounded-*` utilities which resolve to these CSS variables.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const RadiusScale: Story = {};
