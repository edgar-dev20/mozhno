import type { Meta, StoryObj } from "@storybook/react";

const PALETTES = ["gray", "brand", "primary", "success", "warning", "danger", "info"] as const;
const SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const SEMANTIC = [
  { name: "background", label: "Background", light: "bg-background", dark: "" },
  { name: "foreground", label: "Foreground", light: "text-foreground", dark: "" },
  { name: "card", label: "Card", light: "bg-card", dark: "" },
  { name: "primary", label: "Primary", light: "bg-primary text-primary-foreground", dark: "" },
  { name: "secondary", label: "Secondary", light: "bg-secondary text-secondary-foreground", dark: "" },
  { name: "muted", label: "Muted", light: "bg-muted text-muted-foreground", dark: "" },
  { name: "accent", label: "Accent", light: "bg-accent text-accent-foreground", dark: "" },
  { name: "destructive", label: "Destructive", light: "bg-destructive text-destructive-foreground", dark: "" },
  { name: "success", label: "Success", light: "bg-success text-success-foreground", dark: "" },
  { name: "warning", label: "Warning", light: "bg-warning text-warning-foreground", dark: "" },
  { name: "info", label: "Info", light: "bg-info text-info-foreground", dark: "" },
  { name: "brand", label: "Brand", light: "bg-brand text-brand-foreground", dark: "" },
  { name: "border", label: "Border", light: "bg-border", dark: "" },
  { name: "sparkline-true", label: "Sparkline True", light: "bg-sparkline-true", dark: "" },
  { name: "sparkline-false", label: "Sparkline False", light: "bg-sparkline-false", dark: "" },
  { name: "chart-1", label: "Chart 1", light: "bg-chart-1", dark: "" },
  { name: "chart-2", label: "Chart 2", light: "bg-chart-2", dark: "" },
  { name: "chart-3", label: "Chart 3", light: "bg-chart-3", dark: "" },
  { name: "chart-4", label: "Chart 4", light: "bg-chart-4", dark: "" },
  { name: "chart-5", label: "Chart 5", light: "bg-chart-5", dark: "" },
];

function ColorsShowcase() {
  return (
    <div className="p-8 space-y-12 max-w-4xl">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Semantic Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SEMANTIC.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`h-16 rounded-xl ${color.light} border border-border flex items-end p-2`}
              >
                <span className="text-xs font-mono opacity-50">{color.name}</span>
              </div>
              <span className="text-caption text-muted-foreground/50">{color.label}</span>
            </div>
          ))}
        </div>
      </section>

      {PALETTES.map((palette) => (
        <section key={palette}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3 capitalize">
            {palette}
          </h2>
          <div className="flex gap-1">
            {SCALE.map((step) => (
              <div key={step} className="flex-1 flex flex-col gap-1">
                <div
                  className="h-12 rounded-md"
                  style={{ backgroundColor: `var(--palette-${palette}-${step})` }}
                />
                <span className="text-xs text-center text-muted-foreground/30 font-mono">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">Disabled State</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-disabled-bg border border-disabled-border">
            <span className="text-xs text-disabled-fg">Disabled background with disabled text</span>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground">Normal card for comparison</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: "Design System/Colors",
  component: ColorsShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Complete color system: semantic tokens (background, foreground, primary, etc.), 7 palette scales (gray, brand, success, warning, danger, info, primary) with 11 steps each (50–950), chart colors, sparkline colors, and disabled state.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllColors: Story = {};
