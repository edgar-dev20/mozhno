import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MoreHorizontal, Type, Hash, ToggleLeft, Globe, Monitor, Settings2, Braces } from 'lucide-react';
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
import { api, ContextDefinition } from '../../api';

const TYPE_ICONS: Record<string, React.ReactNode> = { String: <Type size={14} />, Number: <Hash size={14} />, Boolean: <ToggleLeft size={14} />, SemVer: <Settings2 size={14} /> };
const TYPE_COLORS: Record<string, string> = { String: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', Number: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20', Boolean: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20', SemVer: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' };

export function Constraints() {
  const [contexts, setContexts] = useState<ContextDefinition[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<ContextDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try { const projects = await api.projects.list(); if (projects.length === 0) return setLoading(false); const pid = projects[0].id; setProjectId(pid); setContexts(await api.contexts.list(pid)); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setError(''); setPanelOpen(true); };
  const openEdit = (c: ContextDefinition) => { setEditing(c); setFormName(c.name); setFormDesc(c.description ?? ''); setError(''); setPanelOpen(true); };
  const handleDelete = async () => { if (!projectId || !deleteId) return; setDeleting(true); try { await api.contexts.delete(projectId, deleteId); setContexts(contexts.filter(c => c.id !== deleteId)); setDeleteId(null); } catch (e: any) { alert(e.message); } finally { setDeleting(false); } };
  const handleSave = async () => {
    if (!projectId) return; setError(''); setSaving(true);
    try {
      if (editing) { const u = await api.contexts.update(projectId, editing.id, { name: formName, description: formDesc }); setContexts(contexts.map(c => c.id === u.id ? u : c)); }
      else { const c = await api.contexts.create(projectId, { name: formName, description: formDesc }); setContexts([c, ...contexts]); }
      setPanelOpen(false);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Контексты</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Поля контекста для таргетинга флагов</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95"><Plus size={18} />Добавить контекст</button>
      </div>

      <TipCard
        accentColor="#0ea5e9"
        accentColor2="#6366f1"
        text="Карта контекстных полей — ваш DSL для таргетинга. Минимум: user_id и страна. Максимум: добавьте версию приложения и часовой пояс для сверхточных правил."
        label="DSL"
        icon={<Braces />}
        storageKey="constraints"
      />

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left"><thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800"><tr className="text-sm font-medium text-neutral-500 dark:text-neutral-400"><th className="px-6 py-3">Название</th><th className="px-6 py-3">Ключ</th><th className="px-6 py-3">Тип</th><th className="px-6 py-3">Описание</th><th className="px-6 py-3 w-16"></th></tr></thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading ? <tr><td colSpan={5} className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-500/10 dark:to-indigo-500/10 animate-pulse" />
                <span className="text-sm text-neutral-400">Загрузка...</span>
              </div></td></tr>
            : contexts.length === 0 ? <tr><td colSpan={5} className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-500/10 dark:to-indigo-500/10 flex items-center justify-center">
                  <Settings2 size={24} className="text-sky-500 dark:text-sky-400" />
                </div>
                <div><p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Нет контекстов</p><p className="text-xs text-neutral-400 mt-1">Добавьте контекстные поля для точного таргетинга</p></div>
                <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"><Plus size={14} />Добавить контекст</button>
              </div></td></tr>
            : (
              <AnimatePresence mode="popLayout">
                {contexts.map((c, idx) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, delay: idx * 0.025 }}
                className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <td className="px-6 py-4"><span className="font-medium text-neutral-900 dark:text-white">{c.name}</span></td>
                <td className="px-6 py-4"><code className="text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{c.id}</code></td>
                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${TYPE_COLORS.String}`}>{TYPE_ICONS.String}String</span></td>
                <td className="px-6 py-4"><span className="text-sm text-neutral-600 dark:text-neutral-400">{c.description || '—'}</span></td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded opacity-0 group-hover:opacity-100 outline-none"><MoreHorizontal size={18} /></button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openEdit(c)}><Edit2 size={14} />Редактировать</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(c.id)}><Trash2 size={14} />Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
              ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
      </div>

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen} title={editing ? 'Редактировать' : 'Новый контекст'} description={editing ? 'Измените название или описание контекстного поля' : 'Контекстные поля используются для условий таргетинга в стратегиях флагов'} footer={<><button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Отмена</button><button onClick={handleSave} disabled={saving || !formName} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-40 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">{saving ? 'Сохранение...' : 'Сохранить'}</button></>}>
        {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700 mb-4">{error}</div>}
        <div className="space-y-4"><div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: User ID" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:font-normal placeholder:text-neutral-400" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; }} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400 resize-none overflow-hidden" /></div></div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить контекст?"
        description={`Контекст «${contexts.find(c => c.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}