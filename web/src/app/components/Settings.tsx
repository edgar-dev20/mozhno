import React, { useState, useEffect } from 'react';
import { Building2, Globe, Shield, Save, Plus, X, Cog } from 'lucide-react';
import { api, Project, Environment, ProjectSettings } from '../../api';
import { TipCard } from './TipCard';
import { ConfirmDialog } from './ConfirmDialog';
import { PluginSlot } from './PluginSlot';

export function Settings() {
  const [project, setProject] = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);

  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const [newEnvName, setNewEnvName] = useState('');
  const [savingEnv, setSavingEnv] = useState(false);

  const [requireMfa, setRequireMfa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(24);
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [deleteEnvId, setDeleteEnvId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let projects = await api.projects.list();
        if (projects.length === 0) {
          projects = [await api.projects.create({ name: 'Default', description: '' })];
        }
        const pid = projects[0].id;
        if (cancelled) return;
        setProjectId(pid);
        const [p, envs, s] = await Promise.all([
          api.projects.get(pid),
          api.environments.list(pid),
          api.settings.get(pid),
        ]);
        if (cancelled) return;
        setProject(p);
        setProjectName(p.name);
        setProjectDesc(p.description ?? '');
        setEnvironments(envs);
        setSettings(s);
        setRequireMfa(s.requireMfa);
        setSessionTimeout(s.sessionTimeoutHours);
        setIpWhitelist(s.ipWhitelist ?? '');
      } catch (e) { console.error(e); } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProject = async () => {
    if (!projectId) return;
    setSavingProject(true);
    try {
      const updated = await api.projects.update(projectId, { name: projectName, description: projectDesc });
      setProject(updated);
    } catch (e: any) { alert(e.message); } finally { setSavingProject(false); }
  };

  const addEnv = async () => {
    if (!projectId || !newEnvName.trim()) return;
    setSavingEnv(true);
    try {
      const created = await api.environments.create(projectId, newEnvName.trim());
      setEnvironments([...environments, created]);
      setNewEnvName('');
    } catch (e: any) { alert(e.message); } finally { setSavingEnv(false); }
  };

  const removeEnv = async () => {
    if (!projectId || !deleteEnvId) return;
    setDeleting(true);
    try {
      await api.environments.delete(projectId, deleteEnvId);
      setEnvironments(environments.filter(e => e.id !== deleteEnvId));
      setDeleteEnvId(null);
    } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  };

  const saveSecurity = async () => {
    if (!projectId) return;
    setSavingSecurity(true);
    try {
      const s = await api.settings.update(projectId, { requireMfa, sessionTimeoutHours: sessionTimeout, ipWhitelist });
      setSettings(s);
    } catch (e: any) { alert(e.message); } finally { setSavingSecurity(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-100 to-stone-100 dark:from-zinc-500/10 dark:to-stone-500/10 animate-pulse" />
      <span className="text-sm text-neutral-400">Загрузка настроек...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neutral-700 via-zinc-600 to-stone-600 dark:from-zinc-200 dark:via-stone-300 dark:to-neutral-300 bg-clip-text text-transparent">Настройки</span>
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-zinc-500 to-stone-500 dark:from-zinc-400 dark:to-stone-400" />
          <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Управление общими параметрами системы</p>
        </div>
      </div>

      <TipCard
        accentColor="#78716c"
        accentColor2="#57534e"
        text="Прогоните security checklist раз в квартал: MFA, IP whitelist, audit log retention ≥ 90 дней. Одна галочка сегодня — минус инцидент завтра."
        label="Чеклист"
        icon={<Cog />}
        storageKey="settings"
      />

      <div className="space-y-6">
        {/* Project */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 border border-blue-200/50 dark:border-blue-500/20">
              <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Проект</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название проекта</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
              <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={2}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
            </div>
            <button onClick={saveProject} disabled={savingProject}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50">
              <Save size={16} />{savingProject ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Environments */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-500/10 dark:to-violet-500/20 border border-violet-200/50 dark:border-violet-500/20">
              <Globe size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Окружения</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="text" value={newEnvName} onChange={e => setNewEnvName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEnv()}
                placeholder="Добавить окружение..."
                className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <button onClick={addEnv} disabled={savingEnv || !newEnvName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50">
                {savingEnv ? '...' : 'Добавить'}
              </button>
            </div>
            <p className="text-xs text-neutral-500">Используется: {environments.length}</p>
            <div className="flex flex-wrap gap-2">
              {environments.map(env => (
                <div key={env.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 border border-blue-200 dark:border-violet-500/20 rounded-lg text-sm font-medium text-neutral-900 dark:text-neutral-200">
                  {env.name}
                  <button onClick={() => setDeleteEnvId(env.id)} className="text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/20 border border-red-200/50 dark:border-red-500/20">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Безопасность</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-200">Требовать MFA</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Многофакторная аутентификация для всех пользователей</div>
              </div>
              <input type="checkbox" checked={requireMfa} onChange={e => setRequireMfa(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-violet-600 focus:ring-violet-500" />
            </label>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Таймаут сессии (часы)</label>
              <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">IP Whitelist (по одному на строку)</label>
              <textarea value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="192.168.1.0/24" rows={3}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm" />
            </div>
            <button onClick={saveSecurity} disabled={savingSecurity}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50">
              <Save size={16} />{savingSecurity ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>

      <PluginSlot slotId="settings.premium" />

      <ConfirmDialog
        open={!!deleteEnvId}
        onOpenChange={(open) => { if (!open) setDeleteEnvId(null); }}
        title="Удалить окружение?"
        description={`Окружение «${environments.find(e => e.id === deleteEnvId)?.name ?? ''}» будет удалено без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={removeEnv}
        loading={deleting}
      />
    </div>
  );
}