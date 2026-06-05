import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

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
  { label: 'Красные', colors: ['#ef4444','#dc2626','#f87171','#b91c1c'] },
  { label: 'Оранжевые', colors: ['#f97316','#ea580c','#fb923c','#c2410c'] },
  { label: 'Янтарные', colors: ['#f59e0b','#d97706','#fbbf24','#b45309'] },
  { label: 'Зелёные', colors: ['#84cc16','#65a30d','#22c55e','#16a34a','#10b981','#059669'] },
  { label: 'Бирюзовые', colors: ['#14b8a6','#0d9488','#06b6d4','#0891b2','#0e7490'] },
  { label: 'Синие', colors: ['#3b82f6','#2563eb','#1d4ed8','#60a5fa'] },
  { label: 'Фиолетовые', colors: ['#6366f1','#4f46e5','#8b5cf6','#7c3aed','#a855f7','#9333ea'] },
  { label: 'Розовые', colors: ['#d946ef','#c026d3','#ec4899','#db2777','#be185d'] },
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

const adjustColor = (hex: string, amount: number) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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
    <div className="grid grid-cols-6 gap-1.5 max-h-[240px] overflow-y-auto pr-0.5">
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
                : 'bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
            title={icon}
          >
            <SegmentIcon name={icon} size={18} />
          </button>
        );
      })}
    </div>
  );
}

export function SegmentColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
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
      <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl shadow-lg shrink-0 flex items-center justify-center transition-all"
            style={{
              backgroundImage: `linear-gradient(135deg, ${value}, ${adjustColor(value, 25)})`,
              boxShadow: `0 8px 24px ${value}40`,
            }}
          >
            <SegmentIcon name="Users" size={20} className="text-white" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Предпросмотр</div>
            <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">{value}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">#</span>
            <input
              type="text"
              value={customHex}
              onChange={e => setCustomHex(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applyCustomHex(); }}
              placeholder="Введите HEX"
              maxLength={7}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400"
            />
          </div>
          <button
            onClick={applyCustomHex}
            disabled={!customHex}
            className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-30 text-white rounded-xl transition-all shrink-0"
          >
            Применить
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {COLOR_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{cat.label}</span>
              <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
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
                    className="w-9 h-9 rounded-xl transition-all relative group"
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
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {getColorName(c)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
        <LucideIcons.Sparkles size={12} className="text-amber-400" />
        Выберите из палитры или введите свой HEX-код выше
      </p>
    </div>
  );
}
