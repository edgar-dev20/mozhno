import type { Meta, StoryObj } from "@storybook/react";

const SHADOWS: { name: string; cssVar: string; label: string }[] = [
  { name: "xs", cssVar: "var(--shadow-xs)", label: "XS · subtle lift" },
  { name: "sm", cssVar: "var(--shadow-sm)", label: "SM · card default" },
  { name: "md", cssVar: "var(--shadow-md)", label: "MD · dropdown" },
  { name: "lg", cssVar: "var(--shadow-lg)", label: "LG · dialog" },
  { name: "xl", cssVar: "var(--shadow-xl)", label: "XL · modal" },
  { name: "2xl", cssVar: "var(--shadow-2xl)", label: "2XL · dramatic" },
];

function ShadowsShowcase() {
  return (
    <div className="p-8 space-y-10 max-w-3xl">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Shadow Scale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SHADOWS.map((shadow) => (
            <div key={shadow.name} className="flex flex-col gap-3">
              <div
                className="h-24 rounded-xl bg-card border border-border flex items-center justify-center"
                style={{ boxShadow: shadow.cssVar }}
              >
                <span className="text-xs font-mono text-muted-foreground/50">{shadow.name}</span>
              </div>
              <span className="text-xs text-muted-foreground/40 text-center">{shadow.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">On Brand Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SHADOWS.map((shadow) => (
            <div key={shadow.name} className="flex flex-col gap-3">
              <div
                className="h-24 rounded-xl bg-brand text-brand-foreground flex items-center justify-center"
                style={{ boxShadow: shadow.cssVar }}
              >
                <span className="text-xs font-mono opacity-70">{shadow.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Shadows",
  component: ShadowsShowcase,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

export const ShadowScale: Story = {};
