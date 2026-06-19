import type { Meta, StoryObj } from '@storybook/react';

function TokensPage() {
  const tokens = {
    color: {
      semantic: [
        ['background', 'foreground'],
        ['card', 'card-foreground'],
        ['popover', 'popover-foreground'],
        ['primary', 'primary-foreground'],
        ['secondary', 'secondary-foreground'],
        ['muted', 'muted-foreground'],
        ['accent', 'accent-foreground'],
        ['destructive', 'destructive-foreground'],
        ['success', 'success-foreground'],
        ['warning', 'warning-foreground'],
        ['info', 'info-foreground'],
        ['brand', 'brand-foreground'],
        ['border', 'overlay'],
        ['input-background', 'disabled-bg'],
      ],
      palette: ['gray', 'brand', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    headingSizes: {
      display: { style: 'text-display', weight: 'font-display', leading: 'leading-display', label: 'Display Heading' },
      h1: { style: 'text-h1', weight: 'font-heading', leading: 'leading-heading', label: 'Heading H1' },
      h2: { style: 'text-h2', weight: 'font-heading', leading: 'leading-heading', label: 'Heading H2' },
      h3: { style: 'text-h3', weight: 'font-heading', leading: 'leading-heading', label: 'Heading H3' },
    } as Record<string, { style: string; weight: string; leading: string; label: string }>,
    bodySizes: {
      body: { style: 'text-body', leading: 'leading-body', label: 'Body' },
      'body-sm': { style: 'text-body-sm', leading: 'leading-body', label: 'Body SM' },
      caption: { style: 'text-caption', leading: 'leading-caption', label: 'Caption' },
      overline: { style: 'text-overline', leading: 'leading-caption', label: 'Overline' },
    } as Record<string, { style: string; leading: string; label: string }>,
    radius: ['sm', 'md', 'lg', 'xl'],
    shadow: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    zIndex: {
      layers: {
        base: 0,
        docked: 10,
        dropdown: 20,
        sticky: 30,
        overlay: 40,
        drawer: 50,
        modal: 60,
        popover: 70,
        tooltip: 80,
        toast: 90,
      },
    },
    motion: {
      duration: { instant: '0ms', fast: '150ms', normal: '200ms', slow: '300ms', deliberate: '500ms' },
      easing: ['default', 'in', 'out', 'in-out', 'spring'],
    },
    iconSize: { sm: '0.75rem', md: '1rem', lg: '1.25rem' },
  };

  return (
    <div className="p-8 space-y-12 bg-background text-foreground font-sans">
      <h1 className="text-display font-display leading-display">Design Tokens</h1>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Semantic Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {tokens.color.semantic.map(([bg, fg]) => (
            <div key={bg} className="space-y-1">
              <div
                className="h-16 rounded-lg border border-border flex items-end p-2"
                style={{ backgroundColor: `var(--${bg})` }}
              >
                <span
                  className="text-caption tabular-nums-feature"
                  style={{ color: `var(--${fg || 'foreground'})` }}
                >
                  {bg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Palettes</h2>
        {tokens.color.palette.map((palette) => (
          <div key={palette} className="mb-4">
            <p className="text-caption font-semibold mb-2">{palette}</p>
            <div className="flex gap-0">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => (
                <div
                  key={step}
                  className="flex-1 h-8 first:rounded-l last:rounded-r flex items-center justify-center"
                  style={{ backgroundColor: `var(--palette-${palette}-${step})` }}
                >
                  <span
                    className="text-[0.5rem] tabular-nums-feature"
                    style={{ color: step >= 500 ? 'white' : 'black' }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Typography</h2>
        <div className="space-y-4">
          {Object.entries(tokens.headingSizes).map(([key, { style, weight, leading, label }]) => (
            <div key={key}>
              <span className="text-caption text-muted-foreground">text-{key}</span>
              <p className={`${style} ${weight} ${leading}`}>{label}</p>
            </div>
          ))}
          {Object.entries(tokens.bodySizes).map(([key, { style, leading, label }]) => (
            <div key={key}>
              <span className="text-caption text-muted-foreground">text-{key}</span>
              <p className={`${style} ${leading}`}>The quick brown fox jumps over the lazy dog.</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Font Weights</h2>
        <div className="flex gap-8 text-body">
          <div><span className="text-caption text-muted-foreground block">display - 750</span></div>
          <div><span className="text-caption text-muted-foreground block">heading - 700</span></div>
          <div><span className="text-caption text-muted-foreground block">medium - 500</span></div>
          <div><span className="text-caption text-muted-foreground block">normal - 400</span></div>
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Border Radius</h2>
        <div className="flex gap-4 items-end">
          {tokens.radius.map((r) => (
            <div key={r} className="text-center">
              <div
                className="w-16 h-16 bg-primary border border-border"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <span className="text-caption text-muted-foreground mt-1 block">--radius-{r}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Shadows</h2>
        <div className="flex gap-4">
          {tokens.shadow.map((s) => (
            <div key={s} className="text-center">
              <div
                className="w-20 h-20 rounded-xl bg-card border border-border"
                style={{ boxShadow: `var(--shadow-${s})` }}
              />
              <span className="text-caption text-muted-foreground mt-1 block">shadow-{s}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Z-Index Layers</h2>
        <div className="space-y-1">
          {Object.entries(tokens.zIndex.layers).map(([name, value]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-caption tabular-nums-feature w-24 text-muted-foreground">{value}</span>
              <div className="h-1 bg-primary rounded-full" style={{ width: `${(Number(value) / 90) * 100}%` }} />
              <span className="text-body-sm">--z-{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Motion</h2>
        <h3 className="text-h3 font-heading mb-3">Durations</h3>
        <div className="flex gap-4 mb-6">
          {Object.entries(tokens.motion.duration).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="w-12 h-12 bg-primary rounded-full mx-auto animate-pulse"
                style={{ animationDuration: value }}
              />
              <span className="text-caption text-muted-foreground mt-1 block">{name}</span>
              <span className="text-caption text-muted-foreground block">{value}</span>
            </div>
          ))}
        </div>
        <h3 className="text-h3 font-heading mb-3">Easing</h3>
        <div className="space-y-1">
          {tokens.motion.easing.map((e) => (
            <div key={e} className="flex items-center gap-2">
              <span className="text-caption tabular-nums-feature w-24 text-muted-foreground">--ease-{e}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 font-heading leading-heading mb-6">Icon Sizes</h2>
        <div className="flex gap-6 items-end">
          {Object.entries(tokens.iconSize).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="bg-primary rounded"
                style={{ width: value, height: value }}
              />
              <span className="text-caption text-muted-foreground mt-1 block">--icon-{name}</span>
              <span className="text-caption text-muted-foreground block">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof TokensPage> = {
  title: 'Design System/Tokens',
  component: TokensPage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TokensPage>;

export const AllTokens: Story = {};
