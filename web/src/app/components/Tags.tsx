import React, { useState, useEffect } from 'react';
import { Plus, Tag as TagIcon, Edit2, Trash2, MoreHorizontal, Palette, Hash, Info, Sparkles, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidePanel } from './SidePanel';
import { TipCard } from './TipCard';
import { ConfirmDialog } from './ConfirmDialog';
import { api, Tag } from '../../api';

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
const ALL_PRESET_COLORS = COLOR_CATEGORIES.flatMap(cat => cat.colors);
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

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [customHex, setCustomHex] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const projects = await api.projects.list();
      if (projects.length === 0) return setLoading(false);
      const pid = projects[0].id; setProjectId(pid);
      setTags(await api.tags.list(pid));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormColor('#3b82f6'); setCustomHex(''); setError(''); setPanelOpen(true); };
  const openEdit = (t: Tag) => { setEditing(t); setFormName(t.name); setFormDesc(t.description ?? ''); setFormColor(t.color); setCustomHex(''); setError(''); setPanelOpen(true); };

  const applyCustomHex = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setFormColor(hex.toLowerCase());
      setCustomHex('');
    }
  };

  const handleDelete = async () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    try { await api.tags.delete(projectId, deleteId); setTags(tags.filter(t => t.id !== deleteId)); setDeleteId(null); } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  };

  const handleSave = async () => {
    if (!projectId) return; setError(''); setSaving(true);
    try {
      if (editing) {
        const u = await api.tags.update(projectId, editing.id, { projectId, name: formName, description: formDesc, color: formColor });
        setTags(tags.map(t => t.id === u.id ? u : t));
      } else {
        const c = await api.tags.create(projectId, { projectId, name: formName, description: formDesc, color: formColor });
        setTags([c, ...tags]);
      }
      setPanelOpen(false);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const adjustColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Теги</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Лейблы для организации и фильтрации фича-флагов. Назначайте теги флагам, чтобы группировать их по командам, релизам или типу функциональности.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />Создать тег
        </button>
      </div>

      <TipCard
        accentColor="#3b82f6"
        accentColor2="#8b5cf6"
        text="Назначайте теги флагам, чтобы группировать их по командам или модулям. Цвет тега отображается на карточках флагов и помогает визуально отличать категории друг от друга."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/10 dark:to-violet-500/10 flex items-center justify-center mb-6">
            <TagIcon size={36} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Нет тегов</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-sm mb-6">
            Создайте теги, чтобы группировать флаги по командам, модулям или этапам разработки.
          </p>
          <button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
            <Plus size={18} />Создать первый тег
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openEdit(t)}
              >
                <div className="h-2" style={{ backgroundImage: `linear-gradient(to right, ${t.color}, ${adjustColor(t.color, 30)})` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${t.color}, ${adjustColor(t.color, 25)})`,
                          boxShadow: `0 4px 12px ${t.color}33`,
                        }}
                      >
                        <TagIcon size={18} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{t.name}</h3>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">{getColorName(t.color)}</p>
                      </div>
                    </div>
                    <div className="shrink-0" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-all outline-none">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEdit(t)} className="gap-2.5">
                            <Edit2 size={15} className="text-neutral-500" />Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(t.id)} className="gap-2.5">
                            <Trash2 size={15} />Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {t.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  {!t.description && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 italic leading-relaxed">
                      Нет описания — добавьте, чтобы было понятнее
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900" style={{ backgroundColor: adjustColor(t.color, i * 15 - 15), opacity: 0.6 - i * 0.15 }} />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{getColorName(t.color)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? 'Редактировать тег' : 'Новый тег'}
        description={editing
          ? 'Измените название, описание или цвет тега. Все связанные флаги автоматически отобразят изменения.'
          : 'Создайте метку для группировки флагов. Название должно быть коротким и понятным, а цвет — помогать визуально отличать теги друг от друга.'
        }
        footer={<>
          <button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={saving || !formName.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-40 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-95">{saving ? 'Сохранение...' : editing ? 'Сохранить изменения' : 'Создать тег'}</button>
        </>}
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-2.5">
              <Info size={18} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Название</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Например: Команда бэкенда"
              autoFocus={!editing}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400"
            />
            <p className="text-xs text-neutral-400 dark:text-neutral-500 pl-1">Короткое имя для отображения на флагах и в фильтрах</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Info size={14} className="text-neutral-400" />Описание
            </label>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Опишите, для чего нужен этот тег..."
              rows={3}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400 resize-none"
            />
            <p className="text-xs text-neutral-400 dark:text-neutral-500 pl-1">Детальное описание помогает команде понять назначение тега</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Palette size={14} className="text-violet-500" />Цвет
            </label>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl shadow-lg shrink-0 flex items-center justify-center transition-all"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${formColor}, ${adjustColor(formColor, 25)})`,
                    boxShadow: `0 8px 24px ${formColor}40`,
                  }}
                >
                  <TagIcon size={20} className="text-white" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Предпросмотр</div>
                  {formName.trim() ? (
                    <div className="font-semibold text-neutral-900 dark:text-white truncate">{formName}</div>
                  ) : (
                    <div className="text-sm text-neutral-400 italic truncate">Название не указано</div>
                  )}
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono flex items-center gap-1">
                    <Hash size={10} />{formColor}
                  </div>
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
              {COLOR_CATEGORIES.map((cat, ci) => (
                <div key={cat.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{cat.label}</span>
                    <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {cat.colors.map(c => {
                      const active = formColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormColor(c)}
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
              <Sparkles size={12} className="text-amber-400" />
              Выберите из палитры или введите свой HEX-код выше
            </p>
          </div>
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить тег?"
        description={`Тег «${tags.find(t => t.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}