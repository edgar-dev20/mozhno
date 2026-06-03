import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MoreHorizontal, Type, Hash, ToggleLeft, Globe, Monitor, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidePanel } from './SidePanel';
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

  const load = async () => {
    try { const projects = await api.projects.list(); if (projects.length === 0) return setLoading(false); const pid = projects[0].id; setProjectId(pid); setContexts(await api.contexts.list(pid)); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setError(''); setPanelOpen(true); };
  const openEdit = (c: ContextDefinition) => { setEditing(c); setFormName(c.name); setFormDesc(c.description ?? ''); setError(''); setPanelOpen(true); };
  const handleDelete = async (id: number) => { if (!projectId || !confirm('Удалить?')) return; try { await api.contexts.delete(projectId, id); setContexts(contexts.filter(c => c.id !== id)); } catch (e: any) { alert(e.message); } };
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
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Контексты</h1><p className="text-neutral-500 dark:text-neutral-400 mt-1">Поля контекста для таргетинга флагов</p></div><button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"><Plus size={18} />Добавить контекст</button></div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left"><thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800"><tr className="text-sm font-medium text-neutral-500 dark:text-neutral-400"><th className="px-6 py-3">Название</th><th className="px-6 py-3">Ключ</th><th className="px-6 py-3">Тип</th><th className="px-6 py-3">Описание</th><th className="px-6 py-3 w-16"></th></tr></thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Загрузка...</td></tr>
            : contexts.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Нет контекстов</td></tr>
            : contexts.map(c => (
              <tr key={c.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
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
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(c.id)}><Trash2 size={14} />Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen} title={editing ? 'Редактировать' : 'Новый контекст'} footer={<><button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button><button onClick={handleSave} disabled={saving || !formName} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg">{saving ? 'Сохранение...' : 'Сохранить'}</button></>}>
        {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700 mb-4">{error}</div>}
        <div className="space-y-4"><div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: User ID" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div></div>
      </SidePanel>
    </div>
  );
}