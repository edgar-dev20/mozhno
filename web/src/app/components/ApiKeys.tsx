import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Shield, Server, Smartphone, Plus, Trash2, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, ApiKey, Environment } from '../../api';
import { TipCard } from './TipCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEnvId, setNewEnvId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const projects = await api.projects.list();
        if (projects.length === 0) return setLoading(false);
        const pid = projects[0].id; setProjectId(pid);
        const [k, e] = await Promise.all([api.apiKeys.list(pid), api.environments.list(pid)]);
        setKeys(k); setEnvironments(e);
        if (e.length > 0 && !newEnvId) setNewEnvId(e[0].id);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    })();
  }, []);

  const handleCreate = async () => {
    if (!projectId || !newName) return;
    try { const k = await api.apiKeys.create(projectId, { name: newName, environmentId: newEnvId ?? undefined }); setKeys([k, ...keys]); setCreating(false); setNewName(''); setNewEnvId(environments[0]?.id ?? null); } catch (e: any) { alert(e.message); }
  };
  const handleDelete = async () => { if (!projectId || !deleteId) return; setDeleting(true); try { await api.apiKeys.delete(projectId, deleteId); setKeys(keys.filter(k => k.id !== deleteId)); setDeleteId(null); } catch (e: any) { alert(e.message); } finally { setDeleting(false); } };
  const copyKey = (key: string) => { navigator.clipboard.writeText(key); };
  const envName = (id: number | null) => environments.find(e => e.id === id)?.name ?? '—';
  const envColor = (id: number | null) => {
    const name = envName(id);
    if (name === 'Production') return 'bg-emerald-500';
    if (name === 'Development') return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU') : 'Не исп.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">API ключи</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-amber-500 to-red-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Управляйте ключами доступа для подключения SDK</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all active:scale-95"><Plus size={18} />Создать ключ</button>
      </div>

      <TipCard
        accentColor="#f59e0b"
        accentColor2="#ea580c"
        text="Ротируйте ключи каждые 90 дней и никогда не коммитьте их. Для CI/CD используйте separate key ring — компрометация одного не заденет остальные."
        label="Best Practice"
        icon={<BadgeCheck />}
        storageKey="apikeys"
      />

      {creating && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3"><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название ключа" className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm" />
            <Select value={String(newEnvId ?? '')} onValueChange={(v) => setNewEnvId(v ? Number(v) : null)}>
              <SelectTrigger className="w-fit gap-1.5 bg-input-background border-input data-[placeholder]:text-muted-foreground rounded-lg px-3 py-1.5 h-8 text-sm"><SelectValue placeholder="Выберите окружение" /></SelectTrigger>
              <SelectContent>
                {environments.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Создать</button>
            <button onClick={() => setCreating(false)} className="text-sm text-neutral-500">Отмена</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50"><th className="px-6 py-4">Название & Среда</th><th className="px-6 py-4">Тип</th><th className="px-6 py-4">Секретный ключ</th><th className="px-6 py-4">Создан</th><th className="px-6 py-4 text-right">Последнее</th><th className="px-6 py-4 w-16"></th></tr></thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? <tr><td colSpan={6} className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 animate-pulse" />
                <span className="text-sm text-neutral-400">Загрузка ключей...</span>
              </div></td></tr>
              : keys.length === 0 ? <tr><td colSpan={6} className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center">
                  <Key size={24} className="text-amber-500 dark:text-amber-400" />
                </div>
                <div><p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Нет ключей</p><p className="text-xs text-neutral-400 mt-1">Создайте API ключ для интеграции SDK</p></div>
                <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"><Plus size={14} />Создать ключ</button>
              </div></td></tr>
              : (
                <AnimatePresence mode="popLayout">
                  {keys.map((k, idx) => (
                <motion.tr
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18, delay: idx * 0.025 }}
                  className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-4"><div className="flex flex-col"><span className="font-medium text-neutral-900 dark:text-neutral-200">{k.name}</span><span className="text-xs font-medium mt-1 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${envColor(k.environmentId)}`}></span><span className="text-neutral-500 dark:text-neutral-400">{envName(k.environmentId)}</span></span></div></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300"><Server size={14} className="text-indigo-500" />Server</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 max-w-[240px]"><div className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm font-mono text-neutral-700 dark:text-neutral-300 truncate">{showKey === k.id ? k.apiKey : '••••••••••••••••••••••••••••'}</div><button onClick={() => setShowKey(showKey === k.id ? null : k.id)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5">{showKey === k.id ? <EyeOff size={16} /> : <Eye size={16} />}</button><button onClick={() => copyKey(k.apiKey)} className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5"><Copy size={16} /></button></div></td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{formatDate(k.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 text-right">{formatDate(k.lastUsedAt)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setDeleteId(k.id)} className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  </td>
                </motion.tr>
                ))}
                  </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0"><Shield size={20} /></div>
        <div><h4 className="text-indigo-900 dark:text-white font-medium mb-1">Безопасность ключей</h4><p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">Client SDK ключи безопасны для использования на фронтенде (в браузере, мобильных приложениях). Server SDK ключи обладают полным доступом к данным и <strong>никогда не должны попадать на сторону клиента</strong>.</p></div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить API ключ?"
        description={`API-ключ «${keys.find(k => k.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления и перестанет работать немедленно.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}