import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { adjustColor } from "@/shared/color";
import { GradientButton } from "@/shared";
import { useT, type MessageKey } from '@/i18n';

export const SEGMENT_ICONS = [
  'Users', 'UserCheck', 'UserCog', 'UserRound', 'UserPlus',
  'Crown', 'Star', 'Sparkles', 'Award', 'Medal',
  'Zap', 'Flame', 'Bolt', 'ThumbsUp', 'Heart',
  'Globe', 'Target', 'Crosshair', 'Compass', 'MapPin',
  'Shield', 'ShieldCheck', 'Lock', 'Key', 'Fingerprint',
  'Layers', 'Blocks', 'Box', 'Package', 'Container',
  'Bell', 'BellRing', 'Eye', 'ScanEye', 'Brain',
  'Rocket', 'Gem', 'Diamond', 'Briefcase', 'Building2',
  'Monitor', 'Smartphone', 'Cloud', 'Code', 'Bug',
] as const;

interface ColorCategory { label: string; colors: string[]; }
const COLOR_CATEGORIES: ColorCategory[] = [
  { label: 'tags.colors.red', colors: ['#ef4444','#dc2626','#f87171','#b91c1c'] },
  { label: 'tags.colors.orange', colors: ['#f97316','#ea580c','#fb923c','#c2410c'] },
  { label: 'tags.colors.amber', colors: ['#f59e0b','#d97706','#fbbf24','#b45309'] },
  { label: 'tags.colors.green', colors: ['#84cc16','#65a30d','#22c55e','#16a34a','#10b981','#059669'] },
  { label: 'tags.colors.teal', colors: ['#14b8a6','#0d9488','#06b6d4','#0891b2','#0e7490'] },
  { label: 'tags.colors.blue', colors: ['#3b82f6','#2563eb','#1d4ed8','#60a5fa'] },
  { label: 'tags.colors.violet', colors: ['#6366f1','#4f46e5','#8b5cf6','#7c3aed','#a855f7','#9333ea'] },
  { label: 'tags.colors.pink', colors: ['#d946ef','#c026d3','#ec4899','#db2777','#be185d'] },
];

const colorHexCache: Record<string, string> = {};
const getColorName = (hex: string): string => {
  if (colorHexCache[hex]) return colorHexCache[hex];
  const normalized = hex.toLowerCase();
  const names: Record<string, string> = {
    '#ef4444': 'Red 500', '#dc2626': 'Red 600', '#f87171': 'Red 400', '#b91c1c': 'Red 700',
    '#f97316': 'Orange 500', '#ea580c': 'Orange 600', '#fb923c': 'Orange 400', '#c2410c': 'Orange 700',
    '#f59e0b': 'Amber 500', '#d97706': 'Amber 600', '#fbbf24': 'Amber 400', '#b45309': 'Amber 700',
    '#84cc16': 'Lime 500', '#65a30d': 'Lime 600', '#22c55e': 'Green 500', '#16a34a': 'Green 600',
    '#10b981': 'Emerald 500', '#059669': 'Emerald 600', '#14b8a6': 'Teal 500', '#0d9488': 'Teal 600',
    '#06b6d4': 'Cyan 500', '#0891b2': 'Cyan 600', '#0e7490': 'Cyan 700',
    '#3b82f6': 'Blue 500', '#2563eb': 'Blue 600', '#1d4ed8': 'Blue 700', '#60a5fa': 'Blue 400',
    '#6366f1': 'Indigo 500', '#4f46e5': 'Indigo 600', '#8b5cf6': 'Violet 500', '#7c3aed': 'Violet 600',
    '#a855f7': 'Purple 500', '#9333ea': 'Purple 600', '#d946ef': 'Fuchsia 500', '#c026d3': 'Fuchsia 600',
    '#ec4899': 'Pink 500', '#db2777': 'Pink 600', '#be185d': 'Pink 700',
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
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name];
  if (!IconComponent) {
    const Fallback = LucideIcons.Users;
    return <Fallback size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
}

export function SegmentIconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="max-h-[240px] overflow-hidden rounded-xl">
      <div className="grid grid-cols-6 gap-1.5 max-h-[240px] overflow-y-auto p-1.5">
        {SEGMENT_ICONS.map((icon) => {
          const isSelected = value === icon;
          return (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                isSelected
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500 dark:ring-indigo-400'
                  : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground/70 dark:hover:text-muted-foreground/60'
              }`}
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

export function SegmentColorPicker({ value, onChange, icon = 'Users' }: { value: string; onChange: (color: string) => void; icon?: string }) {
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
          <div
            className="w-14 h-14 rounded-2xl shadow-lg shrink-0 flex items-center justify-center transition-all"
            style={{
              backgroundImage: `linear-gradient(135deg, ${value}, ${adjustColor(value, 25)})`,
              boxShadow: `0 8px 24px ${value}40`,
            }}
          >
            <SegmentIcon name={icon} size={20} className="text-white" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{t('tags.form.color.preview')}</div>
            <div className="font-mono text-sm text-foreground/80">{value}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">#</span>
            <input
              type="text"
              value={customHex}
              onChange={e => setCustomHex(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applyCustomHex(); }}
              placeholder={t('tags.form.color.hexPlaceholder')}
              maxLength={7}
              className="w-full bg-card border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-border transition-all placeholder:text-muted-foreground"
            />
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
              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t(cat.label as MessageKey)}</span>
              <div className="h-px flex-1 bg-accent" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cat.colors.map(c => {
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
                      boxShadow: active ? `0 0 0 3px ${c}55, 0 4px 12px ${c}40` : '0 1px 3px #00000015',
                      zIndex: active ? 5 : 1,
                    }}
                  >
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      </span>
                    )}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {getColorName(c)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
        <LucideIcons.Sparkles size={12} className="text-warning" />
        {t('tags.form.color.hint')}
      </p>
    </div>
  );
}
