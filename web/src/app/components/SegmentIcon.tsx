import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { GradientButton, ColorIcon } from '@/shared';
import { useT, type MessageKey } from '@/i18n';

export const SEGMENT_ICONS = [
  'Users',
  'UserCheck',
  'UserCog',
  'UserRound',
  'UserPlus',
  'Crown',
  'Star',
  'Sparkles',
  'Award',
  'Medal',
  'Zap',
  'Flame',
  'Bolt',
  'ThumbsUp',
  'Heart',
  'Globe',
  'Target',
  'Crosshair',
  'Compass',
  'MapPin',
  'Shield',
  'ShieldCheck',
  'Lock',
  'Key',
  'Fingerprint',
  'Layers',
  'Blocks',
  'Box',
  'Package',
  'Container',
  'Bell',
  'BellRing',
  'Eye',
  'ScanEye',
  'Brain',
  'Rocket',
  'Gem',
  'Diamond',
  'Briefcase',
  'Building2',
  'Monitor',
  'Smartphone',
  'Cloud',
  'Code',
  'Bug',
] as const;

interface ColorCategory {
  label: string;
  colors: string[];
}
const COLOR_CATEGORIES: ColorCategory[] = [
  { label: 'tags.colors.red', colors: ['#b85a50', '#c87068', '#d8847c', '#a04840'] },
  { label: 'tags.colors.orange', colors: ['#b86840', '#c87850', '#e09060', '#9a4828'] },
  { label: 'tags.colors.amber', colors: ['#b89430', '#d0a840', '#e8c050', '#987820'] },
  { label: 'tags.colors.green', colors: ['#4a8c5e', '#5a9e6e', '#6db87e', '#3a7048', '#2d8860', '#1d7850'] },
  { label: 'tags.colors.teal', colors: ['#1a6b60', '#2d9484', '#3db8a5', '#155a50', '#0e7a6e'] },
  { label: 'tags.colors.blue', colors: ['#4a6e8a', '#5a82a0', '#6e94b4', '#3a5870'] },
  { label: 'tags.colors.violet', colors: ['#2d3a32', '#4a5e50', '#5a7260', '#6b8676', '#3a4a40', '#507060'] },
  { label: 'tags.colors.pink', colors: ['#b87070', '#c88484', '#d89898', '#a05858', '#9a4860'] },
];

const colorHexCache: Record<string, string> = {};
const getColorName = (hex: string): string => {
  if (colorHexCache[hex]) return colorHexCache[hex];
  const normalized = hex.toLowerCase();
  const names: Record<string, string> = {
    '#b85a50': 'Red 500', '#c87068': 'Red 400', '#d8847c': 'Red 300', '#a04840': 'Red 600',
    '#b86840': 'Terracotta 500', '#c87850': 'Terracotta 400', '#e09060': 'Terracotta 300', '#9a4828': 'Terracotta 600',
    '#b89430': 'Gold 500', '#d0a840': 'Gold 400', '#e8c050': 'Gold 300', '#987820': 'Gold 600',
    '#4a8c5e': 'Forest 500', '#5a9e6e': 'Forest 400', '#6db87e': 'Forest 300', '#3a7048': 'Forest 600', '#2d8860': 'Pine 500', '#1d7850': 'Pine 600',
    '#1a6b60': 'Teal 700', '#2d9484': 'Teal 500', '#3db8a5': 'Teal 400', '#155a50': 'Teal 800', '#0e7a6e': 'Teal 900',
    '#4a6e8a': 'Slate 500', '#5a82a0': 'Slate 400', '#6e94b4': 'Slate 300', '#3a5870': 'Slate 600',
    '#2d3a32': 'Moss 800', '#4a5e50': 'Moss 600', '#5a7260': 'Moss 500', '#6b8676': 'Moss 400', '#3a4a40': 'Moss 700', '#507060': 'Moss 550',
    '#b87070': 'Rose 500', '#c88484': 'Rose 400', '#d89898': 'Rose 300', '#a05858': 'Rose 600', '#9a4860': 'Rose 700',
  };
  colorHexCache[hex] = names[normalized] ?? hex;
  return colorHexCache[hex];
};

export type SegmentIconName = (typeof SEGMENT_ICONS)[number];

interface SegmentIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function SegmentIcon({ name, className = '', size = 20 }: SegmentIconProps) {
  const IconComponent = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>
  )[name];
  if (!IconComponent) {
    const Fallback = LucideIcons.Users;
    return <Fallback size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
}

export function SegmentIconPicker({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}) {
  return (
    <div className="max-h-[240px] overflow-hidden rounded-xl">
      <div className="grid grid-cols-6 gap-1.5 max-h-[240px] overflow-y-auto p-1.5">
        {SEGMENT_ICONS.map((icon) => {
          const isSelected = value === icon;
          return (
            <button
              key={icon}
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(icon); }}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                isSelected
                  ? 'text-primary-foreground'
                  : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground/70 dark:hover:text-muted-foreground/60'
              }`}
              style={
                isSelected && color
                  ? { backgroundColor: color, boxShadow: `0 0 0 3px ${color}55` }
                  : undefined
              }
              title={icon}
            >
              <SegmentIcon name={icon} size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SegmentColorPicker({
  value,
  onChange,
  icon = 'Users',
}: {
  value: string;
  onChange: (color: string) => void;
  icon?: string;
}) {
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
            icon={<SegmentIcon name={icon} size={20} className="text-primary-foreground" />}
            shadow
            darkDim={false}
            className="transition-all"
          />
          <div className="space-y-1 min-w-0">
            <div className="text-caption font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {t('tags.form.color.preview')}
            </div>
            <div className="font-mono text-body-sm text-foreground/80">{value}</div>
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
                if (e.key === 'Enter') applyCustomHex();
              }}
              placeholder={t('tags.form.color.hexPlaceholder')}
              maxLength={7}
              className="w-full bg-card border border-border rounded-lg pl-8 pr-4 py-2.5 text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-border transition-all placeholder:text-muted-foreground"
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
        {COLOR_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-caption font-semibold text-muted-foreground/70 uppercase tracking-wider">
                {t(cat.label as MessageKey)}
              </span>
              <div className="h-px flex-1 bg-accent" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cat.colors.map((c) => {
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
        <LucideIcons.Sparkles size={12} className="text-warning" />
        {t('tags.form.color.hint')}
      </p>
    </div>
  );
}
