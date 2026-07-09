import { useState, type ReactNode } from 'react';
import { Hash, Sparkles } from '@/shared/icons';
import { useT } from '@/i18n';
import { COLOR_PALETTES, getColorName } from '@/shared/colorPalette';
import { ColorIcon } from '@/shared/components/ColorIcon';
import { GradientButton } from '@/shared/components/GradientButton';

interface ColorPickerProps {
  /** Currently selected hex color. */
  value: string;
  /** Called with the new hex when the user picks or applies a color. */
  onChange: (color: string) => void;
  /** Icon rendered inside the preview swatch. */
  icon?: ReactNode;
  /** Name shown next to the preview (e.g. the entity being colored). */
  previewName?: string;
  /** Italic placeholder shown when {@link previewName} is empty. */
  previewPlaceholder?: string;
}

/**
 * Palette + custom-HEX color picker shared by tag, segment and environment
 * customization so the experience is identical everywhere.
 */
export function ColorPicker({
  value,
  onChange,
  icon,
  previewName,
  previewPlaceholder,
}: ColorPickerProps) {
  const t = useT();
  const [customHex, setCustomHex] = useState('');

  const applyCustomHex = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex.toLowerCase());
      setCustomHex('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary rounded-2xl border border-border space-y-4">
        <div className="flex items-center gap-3">
          <ColorIcon
            variant="gradient"
            size="xl"
            color={value}
            icon={icon ?? <span className="w-4 h-4 rounded-full bg-primary-foreground/90" />}
            shadow
            darkDim={false}
            className="transition-all"
          />
          <div className="space-y-1 min-w-0">
            <div className="text-caption font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {t('tags.form.color.preview')}
            </div>
            {previewName && previewName.trim() ? (
              <div className="font-semibold text-foreground truncate">{previewName}</div>
            ) : previewPlaceholder ? (
              <div className="text-body-sm text-muted-foreground italic truncate">
                {previewPlaceholder}
              </div>
            ) : null}
            <div className="text-caption text-muted-foreground/70 font-mono flex items-center gap-1">
              <Hash size={10} />
              {value}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-body-sm">
              #
            </span>
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCustomHex();
                }
              }}
              placeholder={t('tags.form.color.hexPlaceholder')}
              maxLength={7}
              className="w-full bg-card border border-border rounded-xl pl-8 pr-4 py-2.5 text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption font-normal text-muted-foreground/50 tabular-nums">
              {customHex.length}/7
            </span>
          </div>
          <GradientButton
            onClick={applyCustomHex}
            disabled={!customHex}
            size="sm"
            className="shrink-0"
          >
            {t('tags.form.color.apply')}
          </GradientButton>
        </div>
      </div>

      <div className="space-y-3">
        {COLOR_PALETTES.map(([key, colors]) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-caption font-semibold text-muted-foreground/70 uppercase tracking-wider">
                {t(key)}
              </span>
              <div className="h-px flex-1 bg-accent" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {colors.map((c) => {
                const active = value === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    title={getColorName(c)}
                    className="w-9 h-9 rounded-lg transition-all relative group"
                    style={{
                      backgroundColor: c,
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: active
                        ? `0 0 0 3px ${c}55, 0 4px 12px ${c}40`
                        : '0 1px 3px #00000015',
                      zIndex: active ? 5 : 1,
                    }}
                  >
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-background shadow-sm" />
                      </span>
                    )}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border text-caption font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {getColorName(c)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-caption text-muted-foreground/70 flex items-center gap-1">
        <Sparkles size={12} className="text-warning" />
        {t('tags.form.color.hint')}
      </p>
    </div>
  );
}
