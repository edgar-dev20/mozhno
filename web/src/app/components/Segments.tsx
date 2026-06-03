import React, { useState, useEffect } from 'react';
import { Plus, Users, Filter, MoreHorizontal, Edit2, Trash2, Settings, X } from 'lucide-react';
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
import { api, SegmentResponse, ContextDefinition } from '../../api';

interface SegmentContextEntry {
  id: string;
  contextDefinitionId: number;
  contextValues: string;
}

export function Segments() {
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [contexts, setContexts] = useState<ContextDefinition[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContexts, setFormContexts] = useState<SegmentContextEntry[]>([]);
  const [error, setError] = useState('');
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

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormContexts([]); setError(''); setPanelOpen(true); };
  const openEdit = (s: SegmentResponse) => {
    setEditing(s); setFormName(s.name); setFormDesc(s.description ?? '');
    setFormContexts((s.context ?? []).map((c, i) => ({
      id: `sc-${Date.now()}-${i}`,
      contextDefinitionId: c.contextDefinitionId,
      contextValues: c.contextValues,
    })));
    setError(''); setPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    try { await api.segments.delete(projectId, deleteId); setSegments(segments.filter(s => s.id !== deleteId)); setDeleteId(null); } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  };

  const addContext = () => setFormContexts(prev => [...prev, { id: `sc-${Date.now()}`, contextDefinitionId: contexts[0]?.id ?? 0, contextValues: '' }]);
  const removeContext = (id: string) => setFormContexts(prev => prev.filter(c => c.id !== id));
  const updateContextDef = (id: string, contextDefinitionId: number) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, contextDefinitionId } : c));
  const updateContextVal = (id: string, contextValues: string) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, contextValues } : c));

  const handleSave = async () => {
    if (!projectId) return; setError(''); setSaving(true);
    try {
      const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, contextValues: c.contextValues }));
      if (editing) {
        const u = await api.segments.update(projectId, editing.id, { projectId, name: formName, description: formDesc, context });
        setSegments(segments.map(s => s.id === u.id ? u : s));
      } else {
        const c = await api.segments.create(projectId, { projectId, name: formName, description: formDesc, context });
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
        text="Сегменты позволяют раскатывать флаги на конкретные группы пользователей. Комбинируйте сегменты с процентами для канареечных релизов — например, 10% пользователей из сегмента «Beta Testers»."
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
              <Users size={28} className="text-teal-500 dark:text-teal-400" />
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
              <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />
              <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 p-2.5 rounded-xl text-teal-600 dark:text-teal-400 cursor-pointer" onClick={() => openEdit(s)}><Users size={24} /></div>
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
                            <span className="text-neutral-400 dark:text-neutral-600 font-mono text-[10px] uppercase">in</span>
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

          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: Beta Тестеры" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Кто входит в этот сегмент?" rows={2} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div>

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
                return (
                  <div key={c.id} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2.5">
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
                        <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Значения</label>
                        <input type="text" value={c.contextValues} onChange={e => updateContextVal(c.id, e.target.value)} placeholder="значения через запятую..." className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    {ctxDef && (
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 rounded px-2 py-1">
                        <Filter size={10} />
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{ctxDef.name}</span>
                        <span className="text-neutral-400">—</span>
                        <code className="font-mono text-emerald-600 dark:text-emerald-400 break-all">{c.contextValues || '(пусто)'}</code>
                      </div>
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