import { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Shield, Server, Smartphone, Plus, Trash2 } from 'lucide-react';
import { getProjects, getEnvironments, getApiKeys, createApiKey, deleteApiKey } from '../api';

export function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKey, setShowKey] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', environmentId: '', description: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const projects = await getProjects();
      if (projects && projects.length > 0) {
        const pid = projects[0].id;
        setProjectId(pid);
        const [env, apiKeys] = await Promise.all([
          getEnvironments(pid),
          getApiKeys(pid)
        ]);
        setEnvironments(env || []);
        setKeys(apiKeys || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleCreate = async () => {
    try {
      const envId = formData.environmentId ? parseInt(formData.environmentId) : undefined;
      const created = await createApiKey(projectId, {
        name: formData.name,
        environmentId: envId || null,
        description: formData.description
      });
      setKeys([created, ...keys]);
      setIsCreating(false);
      setFormData({ name: '', environmentId: '', description: '' });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот API ключ?')) return;
    try {
      await deleteApiKey(projectId, id);
      setKeys(keys.filter(k => k.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-neutral-500">Загрузка...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка: {error}</div>;

  const getEnvName = (envId) => {
    const env = environments.find(e => e.id === envId);
    return env ? env.name : '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">API ключи</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте ключами доступа для подключения SDK</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Создать ключ
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-6 py-4 font-medium">Название & Среда</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Секретный ключ</th>
                <th className="px-6 py-4 font-medium">Создан</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {keys.map((k) => (
                <tr key={k.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900 dark:text-neutral-200">{k.name}</span>
                      <span className="text-xs font-medium mt-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getEnvName(k.environmentId) === 'Production' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-neutral-500 dark:text-neutral-400">{getEnvName(k.environmentId)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                      <Server size={14} className="text-indigo-500" />
                      Server
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[240px]">
                      <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm font-mono text-neutral-700 dark:text-neutral-300 truncate">
                        {showKey === k.id ? k.apiKey : '••••••••••••••••••••••••••••'}
                      </div>
                      <button
                        onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1.5"
                      >
                        {showKey === k.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleCopy(k.apiKey)}
                        className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {k.createdAt ? new Date(k.createdAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Нет API ключей</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Создать API ключ</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Например: Production Server"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Окружение</label>
                <select
                  value={formData.environmentId}
                  onChange={(e) => setFormData({...formData, environmentId: e.target.value})}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Все окружения</option>
                  {environments.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Для чего этот ключ?"
                  rows={2}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Создать ключ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="text-indigo-900 dark:text-white font-medium mb-1">Безопасность ключей</h4>
          <p className="text-sm text-indigo-700 dark:text-neutral-400 max-w-3xl">
            Client SDK ключи безопасны для использования на фронтенде (в браузере, мобильных приложениях).
            Server SDK ключи обладают полным доступом к данным и <strong>никогда не должны попадать на сторону клиента</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}