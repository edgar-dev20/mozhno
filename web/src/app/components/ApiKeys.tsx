import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Shield, Server, Smartphone, Plus, Trash2 } from 'lucide-react';
import { api, ApiKey, Environment } from '../../api';
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
  const handleDelete = async (id: number) => { if (!projectId || !confirm('Удалить?')) return; try { await api.apiKeys.delete(projectId, id); setKeys(keys.filter(k => k.id !== id)); } catch (e: any) { alert(e.message); } };
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
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">API ключи</h1><p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте ключами доступа для подключения SDK</p></div><button onClick={() => setCreating(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"><Plus size={18} />Создать ключ</button></div>

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
            <thead><tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50"><th className="px-6 py-4">Название & Среда</th><th className="px-6 py-4">Тип</th><th className="px-6 py-4">Секретный ключ</th><th className="px-6 py-4">Создан</th><th className="px-6 py-4 text-right">Последнее</th></tr></thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Загрузка...</td></tr>
              : keys.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Нет ключей</td></tr>
              : keys.map(k => (
                <tr key={k.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4"><div className="flex flex-col"><span className="font-medium text-neutral-900 dark:text-neutral-200">{k.name}</span><span className="text-xs font-medium mt-1 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${envColor(k.environmentId)}`}></span><span className="text-neutral-500 dark:text-neutral-400">{envName(k.environmentId)}</span></span></div></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300"><Server size={14} className="text-indigo-500" />Server</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 max-w-[240px]"><div className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm font-mono text-neutral-700 dark:text-neutral-300 truncate">{showKey === k.id ? k.apiKey : '••••••••••••••••••••••••••••'}</div><button onClick={() => setShowKey(showKey === k.id ? null : k.id)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1.5">{showKey === k.id ? <EyeOff size={16} /> : <Eye size={16} />}</button><button onClick={() => copyKey(k.apiKey)} className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5"><Copy size={16} /></button></div></td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{formatDate(k.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 text-right">{formatDate(k.lastUsedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0"><Shield size={20} /></div>
        <div><h4 className="text-indigo-900 dark:text-white font-medium mb-1">Безопасность ключей</h4><p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">Client SDK ключи безопасны для использования на фронтенде (в браузере, мобильных приложениях). Server SDK ключи обладают полным доступом к данным и <strong>никогда не должны попадать на сторону клиента</strong>.</p></div>
      </div>
    </div>
  );
}