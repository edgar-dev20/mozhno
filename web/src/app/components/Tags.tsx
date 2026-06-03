import React, { useState, useEffect } from 'react';
import { Plus, Tag as TagIcon, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidePanel } from './SidePanel';
import { ConfirmDialog } from './ConfirmDialog';
import { api, Tag } from '../../api';

const PRESET_COLORS = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef'];

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

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormColor('#3b82f6'); setError(''); setPanelOpen(true); };
  const openEdit = (t: Tag) => { setEditing(t); setFormName(t.name); setFormDesc(t.description ?? ''); setFormColor(t.color); setError(''); setPanelOpen(true); };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Теги</h1><p className="text-neutral-500 dark:text-neutral-400 mt-1">Типы тегов для классификации флагов</p></div>
        <button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"><Plus size={18} />Создать тег</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? <p className="text-neutral-500">Загрузка...</p> : tags.length === 0 ? <p className="text-neutral-500">Нет тегов</p> :
          tags.map(t => (
            <div key={t.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${t.color}, ${adjustColor(t.color, 20)})` }} />
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-200">{t.name}</div>
                  <div className="text-xs text-neutral-500">{t.description}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 outline-none"><MoreHorizontal size={18} /></button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => openEdit(t)}><Edit2 size={14} />Редактировать</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(t.id)}><Trash2 size={14} />Удалить</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        }
      </div>

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen} title={editing ? 'Редактировать' : 'Новый тег'} footer={<>
        <button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button>
        <button onClick={handleSave} disabled={saving || !formName} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 rounded-lg">{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Цвет</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setFormColor(c)} className="w-8 h-8 rounded-lg border-2 transition-all shadow-sm"
                  style={{ backgroundColor: c, borderColor: formColor === c ? '#8b5cf6' : 'transparent', transform: formColor === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
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