import type { Meta, StoryObj } from '@storybook/react';

function TypographyShowcase() {
  return (
    <div className="p-8 space-y-12 max-w-3xl">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">
          Font Families
        </h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">
              Sans (Inter)
            </span>
            <p className="text-body mt-1 font-sans">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">
              Mono (JetBrains Mono)
            </span>
            <p className="text-body mt-1 font-mono">The quick brown fox jumps over the lazy dog</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">
          Heading Scale
        </h2>
        <div className="space-y-6">
          {(['display', 'h1', 'h2', 'h3'] as const).map((level) => (
            <div key={level} className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">
                text-{level} · weight {level === 'display' ? '750' : '700'} · leading{' '}
                {level === 'display' ? '1.15' : '1.25'}
              </span>
              <p
                className={
                  level === 'display'
                    ? 'text-display font-display leading-display'
                    : `text-${level} font-heading leading-heading`
                }
              >
                {level === 'display' ? 'Display Heading' : `Heading ${level.toUpperCase()}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">
          Body Scale
        </h2>
        <div className="space-y-4">
          {(
            [
              { label: 'Body', className: 'text-body leading-body', weight: '400' },
              { label: 'Body SM', className: 'text-body-sm leading-body', weight: '400' },
              { label: 'Caption', className: 'text-caption leading-caption', weight: '400' },
              {
                label: 'Overline',
                className: 'text-overline leading-caption tracking-overline uppercase',
                weight: '500',
              },
            ] as const
          ).map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">
                {item.label} · weight {item.weight}
              </span>
              <p className={`${item.className} mt-1`}>
                The quick brown fox jumps over the lazy dog. 1234567890.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">
          Tabular Numbers
        </h2>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="space-y-2 font-mono tabular-nums text-body">
            {[1234, 56789, 1234567, 12.34, 567.89, 1234.56].map((n, i) => (
              <div key={i} className="text-right">
                {n.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-6">
          Mixed Content
        </h2>
        <div className="p-6 rounded-xl bg-card border border-border space-y-4">
          <h1 className="text-h1 font-heading leading-heading">Feature Flags</h1>
          <p className="text-body leading-body text-muted-foreground">
            Mozhno is an{' '}
            <strong className="font-medium text-foreground">
              open-core feature flag management
            </strong>{' '}
            platform that helps teams ship with confidence. Control feature rollouts, run A/B tests,
            and manage configuration across environments.
          </p>
          <p className="text-body-sm leading-body text-muted-foreground/60">
            Built with React 19, TypeScript, and Tailwind CSS v4. Uses OKLCH colors, Inter for UI,
            and JetBrains Mono for code.
          </p>
          <span className="text-overline tracking-overline uppercase text-muted-foreground/40 font-medium">
            v1.0.0 · production ready
          </span>
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Typography',
  component: TypographyShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full typography scale including font families, heading sizes, body sizes, tabular numbers, and mixed content examples.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const FullScale: Story = {};
