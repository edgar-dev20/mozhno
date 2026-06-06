import React, { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, Box, Braces, Clock, User, Type, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SidePanel } from './SidePanel';
import { TipCard } from './TipCard';
import { ConfirmDialog } from './ConfirmDialog';
import { SegmentIcon } from './SegmentIcon';
import { api, ContextDefinition, SegmentResponse } from '../../api';

const TYPES = ['string', 'number', 'time', 'semver'] as const;
const TYPE_ICONS: Record<string, React.ReactNode> = { string: <Type size={13} />, number: <span className="text-[13px] font-semibold">123</span>, time: <Clock size={13} />, semver: <Settings2 size={13} /> };
const TYPE_LABELS: Record<string, string> = { string: 'Строка', number: 'Число', time: 'Время', semver: 'Версия' };
const TYPE_COLORS: Record<string, string> = { string: '#3b82f6', number: '#f97316', time: '#06b6d4', semver: '#10b981' };
const TYPE_COLORS_BAR: Record<string, string> = {
  string: 'linear-gradient(to right, #3b82f6, #93bbfd)',
  number: 'linear-gradient(to right, #f97316, #fdba74)',
  time: 'linear-gradient(to right, #06b6d4, #67e8f9)',
  semver: 'linear-gradient(to right, #10b981, #6ee7b7)',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function Constraints() {
  const [contexts, setContexts] = useState<ContextDefinition[]>([]);
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<ContextDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formType, setFormType] = useState('string');
  const [formDesc, setFormDesc] = useState('');
  const [error, setError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const projects = await api.projects.list();
      if (projects.length === 0) return setLoading(false);
      const pid = projects[0].id;
      setProjectId(pid);
      const [ctx, seg] = await Promise.all([api.contexts.list(pid), api.segments.list(pid)]);
      setContexts(ctx);
      setSegments(seg);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const segmentUsage = new Map<number, SegmentResponse[]>();
  for (const s of segments) {
    for (const c of s.context) {
      if (!segmentUsage.has(c.contextDefinitionId)) segmentUsage.set(c.contextDefinitionId, []);
      segmentUsage.get(c.contextDefinitionId)!.push(s);
    }
  }

  const editingUsage = editing ? segmentUsage.get(editing.id) : undefined;
  const canDelete = editing ? !editingUsage || editingUsage.length === 0 : false;
  const isDirty = editing
    ? formName !== editing.name || formKey !== editing.key || formType !== (editing.type ?? 'string') || formDesc !== (editing.description ?? '')
    : true;

  const openCreate = () => { setEditing(null); setFormName(''); setFormKey(''); setFormType('string'); setFormDesc(''); setError(''); setKeyError(''); setPanelOpen(true); };
  const openEdit = (c: ContextDefinition) => { setEditing(c); setFormName(c.name); setFormKey(c.key); setFormType(c.type ?? 'string'); setFormDesc(c.description ?? ''); setError(''); setKeyError(''); setPanelOpen(true); };
  const handleDelete = async () => { if (!projectId || !deleteId) return; setDeleting(true); try { await api.contexts.delete(projectId, deleteId); setContexts(contexts.filter(c => c.id !== deleteId)); setDeleteId(null); setPanelOpen(false); } catch (e: any) { alert(e.message); } finally { setDeleting(false); } };
  const handleSave = async () => {
    if (!projectId) return; setError(''); setKeyError('');
    if (!/^[a-zA-Z0-9_]+$/.test(formKey)) { setKeyError('Только латиница, цифры и _'); return; }
    setSaving(true);
    try {
      if (editing) {
        const u = await api.contexts.update(projectId, editing.id, { name: formName, key: formKey, type: formType, description: formDesc });
        setContexts(contexts.map(c => c.id === u.id ? u : c));
      } else {
        const c = await api.contexts.create(projectId, { name: formName, key: formKey, type: formType, description: formDesc });
        setContexts([c, ...contexts]);
      }
      setPanelOpen(false);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Контексты</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80">Поля контекста для таргетинга флагов</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95"><Plus size={18} />Добавить</button>
      </div>

      <TipCard accentColor="#0ea5e9" accentColor2="#6366f1" text="Контекстные поля определяют параметры аудитории. Ключ используется в правилах таргетинга флагов и условий сегментов." label="DSL" icon={<Braces />} storageKey="constraints" />

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-20 text-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-500/10 dark:to-indigo-500/10 animate-pulse mx-auto mb-3" />
          <span className="text-sm text-neutral-400">Загрузка...</span>
        </div>
      ) : contexts.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Box size={28} className="text-sky-400 dark:text-sky-500" />
          </div>
          <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">Нет контекстов</p>
          <p className="text-sm text-neutral-400 mt-1 mb-4">Добавьте контекстные поля для таргетинга флагов</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"><Plus size={15} />Добавить контекст</button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contexts.map((c, idx) => {
              const usage = segmentUsage.get(c.id);
              return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: idx * 0.04 }} className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200">
                <div className="h-1.5" style={{ background: TYPE_COLORS_BAR[c.type ?? 'string'] }} />
                <div className="px-5 py-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 pt-0.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TYPE_COLORS[c.type ?? 'string'] + '18' }}>
                        <span style={{ color: TYPE_COLORS[c.type ?? 'string'] }}>{TYPE_ICONS[c.type ?? 'string']}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-200 truncate">{c.name}</span>
                          <code className="text-[10px] font-mono text-neutral-400 shrink-0">{c.key}</code>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button onClick={() => openEdit(c)} className="flex items-center justify-center size-6 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Настроить"><Settings size={13} /></button>
                        </div>
                      </div>
                      {c.description && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed line-clamp-2">{c.description}</p>}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400 flex-wrap">
                        {c.createdAt && <span className="flex items-center gap-1"><Clock size={10} />{formatDate(c.createdAt)}</span>}
                        {c.createdBy && <span className="flex items-center gap-1"><User size={10} />{c.createdBy}</span>}
                      </div>
                      {usage && usage.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {usage.map(s => (
                            <span key={s.id} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ color: s.color, backgroundColor: s.color + '14' }}>
                              <SegmentIcon name={s.icon} size={10} />{s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );})}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? editing.name : 'Новый контекст'}
        description=""
        footer={<>
          <div className="flex items-center gap-2">
            <div className="flex-1" />
            <button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Отмена</button>
            <button onClick={handleSave} disabled={saving || !formName || !formKey || !isDirty} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-40 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">{saving ? '…' : editing ? 'Сохранить' : 'Создать'}</button>
          </div>
        </>}
      >
        {error && <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400 mb-5 leading-relaxed">{error}</div>}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Название</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="User ID" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all placeholder:font-normal placeholder:text-neutral-400" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Ключ</label>
            <input type="text" value={formKey} onChange={e => { setFormKey(e.target.value); setKeyError(''); }} placeholder="user_id" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400" />
            {keyError && <p className="text-[10px] text-red-500 mt-1">{keyError}</p>}
            <p className="text-[10px] text-neutral-400 leading-relaxed">Идентификатор поля в SDK. Доступен как <code className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">context['user_id']</code></p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Тип</label>
            <div className="grid grid-cols-4 gap-1.5">
              {TYPES.map(t => (
                <button key={t} onClick={() => setFormType(t)} className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[10px] font-medium transition-all duration-150 ${formType === t ? 'border-current/30' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-400'}`} style={formType === t ? { color: TYPE_COLORS[t], backgroundColor: TYPE_COLORS[t] + '12' } : undefined}>
                  <span className={formType === t ? '' : 'text-neutral-400'}>{TYPE_ICONS[t]}</span>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">Формат значения при таргетинге. SDK валидирует переданное значение по типу.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Описание</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 72) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 72) + 'px'; }} placeholder="Опишите назначение этого поля" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all placeholder:text-neutral-400 resize-none overflow-hidden leading-relaxed" />
          </div>
        </div>

        {editingUsage && editingUsage.length > 0 && (
          <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Связанные сегменты</label>
            <div className="mt-3 flex flex-col gap-2">
              {editingUsage.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: s.color + '40', backgroundColor: s.color + '0A' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '20' }}>
                    <SegmentIcon name={s.icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold" style={{ color: s.color }}>{s.name}</div>
                    {s.description && <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{s.description}</div>}
                  </div>
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 shrink-0">В использовании</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">Контекст используется в сегментах и не может быть удалён. Сначала удалите связи с сегментами.</p>
          </div>
        )}

        {editing && <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          {canDelete ? (
            <button onClick={() => setDeleteId(editing.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20"><Trash2 size={16} />Удалить контекст</button>
          ) : (
            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-300 dark:text-neutral-600 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-not-allowed"><Trash2 size={16} />Удалить контекст</button>
          )}
        </div>}
      </SidePanel>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }} title="Удалить контекст?" description={`Контекст «${contexts.find(c => c.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления.`} confirmLabel="Удалить" onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
