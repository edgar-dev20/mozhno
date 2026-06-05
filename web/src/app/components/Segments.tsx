import React, { useState, useEffect } from 'react';
import { Plus, Users, Filter, MoreHorizontal, Edit2, Trash2, Settings, X, PieChart, Upload, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TipCard } from './TipCard';
import { SidePanel } from './SidePanel';
import { ConfirmDialog } from './ConfirmDialog';
import { SegmentIcon, SegmentIconPicker, SegmentColorPicker } from './SegmentIcon';
import { api, SegmentResponse, ContextDefinition } from '../../api';

interface SegmentContextEntry {
  id: string;
  contextDefinitionId: number;
  operator: string;
  contextValues: string;
}

export function Segments() {
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [contexts, setContexts] = useState<ContextDefinition[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const adjustColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Users');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formContexts, setFormContexts] = useState<SegmentContextEntry[]>([]);
  const [error, setError] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const projects = await api.projects.list();
      if (projects.length === 0) return setLoading(false);
      const pid = projects[0].id; setProjectId(pid);
      const [segs, ctx] = await Promise.all([
        api.segments.list(pid),
        api.contexts.list(pid),
      ]);
      setSegments(segs);
      setContexts(ctx);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormIcon('Users'); setFormColor('#3b82f6'); setFormContexts([]); setError(''); setShowCustomize(false); setPanelOpen(true); };
  const openEdit = (s: SegmentResponse) => {
    setEditing(s); setFormName(s.name); setFormDesc(s.description ?? ''); setFormIcon(s.icon ?? 'Users'); setFormColor(s.color ?? '#3b82f6');
    setFormContexts((s.context ?? []).map((c, i) => ({
      id: `sc-${Date.now()}-${i}`,
      contextDefinitionId: c.contextDefinitionId,
      operator: c.operator ?? 'in',
      contextValues: c.contextValues,
    })));
    setError(''); setShowCustomize(false); setPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    try { await api.segments.delete(projectId, deleteId); setSegments(segments.filter(s => s.id !== deleteId)); setDeleteId(null); } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  };

  const addContext = () => setFormContexts(prev => [...prev, { id: `sc-${Date.now()}`, contextDefinitionId: contexts[0]?.id ?? 0, operator: 'in', contextValues: '' }]);
  const removeContext = (id: string) => setFormContexts(prev => prev.filter(c => c.id !== id));
  const updateContextDef = (id: string, contextDefinitionId: number) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, contextDefinitionId } : c));
  const updateOperator = (id: string, operator: string) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, operator } : c));
  const updateContextVal = (id: string, contextValues: string) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, contextValues } : c));

  const addValue = (id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormContexts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const existing = c.contextValues ? c.contextValues.split(',').map(v => v.trim()).filter(Boolean) : [];
      if (existing.includes(trimmed)) return c;
      return { ...c, contextValues: existing.concat(trimmed).join(', ') };
    }));
  };

  const removeValue = (id: string, index: number) => {
    setFormContexts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const values = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
      values.splice(index, 1);
      return { ...c, contextValues: values.join(', ') };
    }));
  };

  const handleFileUpload = (id: string, file: File) => {
    const MAX_SIZE = 1_048_576;
    if (file.size > MAX_SIZE) { setError(`Файл слишком большой. Максимальный размер: ${(MAX_SIZE / 1024 / 1024).toFixed(1)}MB`); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const newValues = text.split(/[\n\r,]+/).map(v => v.trim()).filter(Boolean);
      setFormContexts(prev => prev.map(c => {
        if (c.id !== id) return c;
        const existing = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
        const merged = [...new Set([...existing, ...newValues])];
        return { ...c, contextValues: merged.join(', ') };
      }));
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!projectId) return; setError(''); setSaving(true);
    try {
      const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
      if (editing) {
        const u = await api.segments.update(projectId, editing.id, { projectId, name: formName, description: formDesc, icon: formIcon, color: formColor, context });
        setSegments(segments.map(s => s.id === u.id ? u : s));
      } else {
        const c = await api.segments.create(projectId, { projectId, name: formName, description: formDesc, icon: formIcon, color: formColor, context });
        setSegments([c, ...segments]);
      }
      setPanelOpen(false);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500 bg-clip-text text-transparent">Сегменты</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-teal-500 to-green-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Создавайте аудитории для таргетирования фиче-флагов</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-95"><Plus size={18} />Создать сегмент</button>
      </div>

      <TipCard
        accentColor="#14b8a6"
        accentColor2="#10b981"
        text="Прогревайте сегменты от внутренних тестеров к external beta и только потом на 100%. Каждый переход — это новая точка отката без даунтайма."
        label="Стратегия"
        icon={<PieChart />}
        storageKey="segments"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-500/10 dark:to-emerald-500/10 animate-pulse" />
            <span className="text-sm text-neutral-400">Загрузка сегментов...</span>
          </div>
        ) : segments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-500/10 dark:to-emerald-500/10 flex items-center justify-center">
              <SegmentIcon name="Users" size={28} className="text-teal-500 dark:text-teal-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Нет сегментов</p>
              <p className="text-xs text-neutral-400 mt-1">Создайте сегменты для таргетинга по аудиториям</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"><Plus size={14} />Создать сегмент</button>
          </div>
        ) :
          <AnimatePresence mode="popLayout">
            {segments.map((s, idx) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="h-1.5" style={{ background: `linear-gradient(to right, ${s.color || '#3b82f6'}, ${adjustColor(s.color || '#3b82f6', 40)})` }} />
              <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div
                  className="p-2.5 rounded-xl text-white cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: s.color || '#3b82f6' }}
                  onClick={() => openEdit(s)}
                >
                  <SegmentIcon name={s.icon || 'Users'} size={24} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 outline-none p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={20} /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openEdit(s)}><Edit2 size={14} /> Редактировать</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(s.id)}><Trash2 size={14} /> Удалить</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-600 hover:to-emerald-600 hover:bg-clip-text hover:text-transparent transition-colors" onClick={() => openEdit(s)}>{s.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 h-10">{s.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Users size={16} className="text-neutral-400 dark:text-neutral-500" /><span className="text-neutral-600 dark:text-neutral-300">~{(s.context ?? []).length} контекстов</span></div>
                {s.context && s.context.length > 0 && (
                  <div className="bg-neutral-50 dark:bg-neutral-950 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider"><Filter size={12} />Правила</div>
                    <div className="space-y-1">
                      {s.context.map((c, ci) => {
                        const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                        return (
                          <div key={ci} className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-neutral-600 dark:text-neutral-400">{ctxDef?.name ?? `Поле #${c.contextDefinitionId}`}</span>
                            <span className="text-neutral-400 dark:text-neutral-600 font-mono text-[10px] uppercase">{c.operator ?? 'in'}</span>
                            <code className="font-mono text-emerald-600 dark:text-emerald-400 break-all line-clamp-1">{c.contextValues}</code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
            ))}
              </AnimatePresence>
        }
      </div>

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen} title={editing ? 'Редактировать сегмент' : 'Новый сегмент'} description="Настройте название и правила таргетинга для сегмента аудитории" footer={<>
        <button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Отмена</button>
        <button onClick={handleSave} disabled={saving || !formName} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 rounded-xl shadow-lg shadow-emerald-500/20 transition-all">{saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}</button>
      </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: Beta Тестеры" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:font-normal placeholder:text-neutral-400" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Кто входит в этот сегмент?" rows={2} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 64) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 64) + 'px'; }} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400 resize-none overflow-hidden" /></div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: formColor }}
                >
                  <SegmentIcon name={formIcon} size={15} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Оформление</div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">Иконка и цвет сегмента</div>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-transform duration-200 ${showCustomize ? 'rotate-180' : ''}`}
              />
            </button>

            {showCustomize && (
              <div className="mt-3 space-y-4 pl-2">
                <div>
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">Иконка</label>
                  <SegmentIconPicker value={formIcon} onChange={setFormIcon} />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">Цвет</label>
                  <SegmentColorPicker value={formColor} onChange={setFormColor} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Правила таргетинга</label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">настраиваемые</span>
              </div>
              <button onClick={addContext} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />Добавить</button>
            </div>
            <div className="space-y-3">
              {formContexts.map((c, ci) => {
                const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                const parsedValues = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
                return (
                  <div key={c.id} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Условие {ci + 1}</span>
                      <button onClick={() => removeContext(c.id)} className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Поле</label>
                        <Select value={String(c.contextDefinitionId)} onValueChange={(v) => updateContextDef(c.id, Number(v))}>
                            <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {contexts.map(ctx => <SelectItem key={ctx.id} value={String(ctx.id)}>{ctx.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Оператор</label>
                        <Select value={c.operator} onValueChange={(v) => updateOperator(c.id, v)}>
                          <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eq">равно</SelectItem>
                            <SelectItem value="ne">не равно</SelectItem>
                            <SelectItem value="in">в списке</SelectItem>
                            <SelectItem value="not_in">не в списке</SelectItem>
                            <SelectItem value="gt">&gt;</SelectItem>
                            <SelectItem value="gte">≥</SelectItem>
                            <SelectItem value="lt">&lt;</SelectItem>
                            <SelectItem value="lte">≤</SelectItem>
                            <SelectItem value="contains">содержит</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">Значения
                        <label className="cursor-pointer text-indigo-500 hover:text-indigo-400 transition-colors" title="Загрузить из файла (.txt, .csv, до 1MB)">
                          <Upload size={11} />
                          <input type="file" accept=".txt,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(c.id, f); e.target.value = ''; }} />
                        </label>
                      </label>
                      <input
                        type="text"
                        placeholder="Добавить значение..."
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-2 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addValue(c.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                    {parsedValues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedValues.map((v, vi) => (
                          <span key={vi} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 rounded-md break-all">
                            {v}
                            <button onClick={() => removeValue(c.id, vi)} className="text-emerald-500 hover:text-red-500 transition-colors"><X size={11} /></button>
                          </span>
                        ))}
                        <span className="text-[10px] text-neutral-400 self-center ml-1">{parsedValues.length} знач.</span>
                      </div>
                    )}
                    {parsedValues.length === 0 && (
                      <div className="text-[10px] text-neutral-400 italic">Нет значений. Введите значение и нажмите Enter, или загрузите файл.</div>
                    )}
                  </div>
                );
              })}
              {formContexts.length === 0 && (
                <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Нет правил таргетинга. Нажмите «Добавить» для настройки контекста.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5"><div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"><Settings size={12} className="text-white" /></div></div>
              <div>
                <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Как работают сегменты?</h5>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">Сегменты позволяют таргетировать фичи на определённые группы пользователей. Выберите поле контекста и укажите значения — только пользователи, подходящие под эти условия, попадут в сегмент.</p>
              </div>
            </div>
          </div>
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить сегмент?"
        description={`Сегмент «${segments.find(s => s.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}