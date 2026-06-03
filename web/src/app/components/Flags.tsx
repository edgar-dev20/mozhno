import React, { useState, useEffect, useCallback } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { Plus, Tag, Trash2, Percent, Users, Settings, X, Filter } from 'lucide-react';
import { SidePanel } from './SidePanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api, FlagResponse, FlagRequest, Tag as TagType, Environment, SegmentResponse, FlagStrategy, StrategyRequest, FlagTagValue, ContextDefinition, ContextValue } from '../../api';

interface EnvState { enabled: boolean; percentage: number; segmentId: number | null; strategyId: number | null; contextDefinitionId: number | null; contextValuesJson: string | null; }
interface FlagView { key: string; name: string; description: string; flagType: string; tags: FlagTagValue[]; flagId: number; environments: Record<number, EnvState>; }

interface RolloutRule {
  id: string;
  percentage: number;
  segmentIds: number[];
  constraints: ConstraintEntry[];
}
interface ConstraintEntry {
  contextDefId: number;
  operator: string;
  value: string;
}

export function Flags() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [flags, setFlags] = useState<FlagView[]>([]);
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [contexts, setContexts] = useState<ContextDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<{ flag: FlagView | null; mode: 'create' | 'general' | 'environment'; envId: number | null }>({ flag: null, mode: 'create', envId: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('RELEASE');
  const [formTags, setFormTags] = useState<FlagTagValue[]>([]);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagId, setNewTagId] = useState<number | null>(null);
  const [newTagVal, setNewTagVal] = useState('');

  const [envRules, setEnvRules] = useState<RolloutRule[]>([]);
  const [envDefault, setEnvDefault] = useState(false);
  const [initialEnvRules, setInitialEnvRules] = useState<RolloutRule[]>([]);
  const [initialEnvDefault, setInitialEnvDefault] = useState(false);

  const isEnvDirty = envDefault !== initialEnvDefault ||
    JSON.stringify(envRules) !== JSON.stringify(initialEnvRules);

  const [selectedTagTypeFilter, setSelectedTagTypeFilter] = useState<number | null>(null);
  const [selectedTagValueFilter, setSelectedTagValueFilter] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    try {
      let projects = await api.projects.list();
      if (projects.length === 0) {
        const p = await api.projects.create({ name: 'Default', description: 'Default project' });
        projects = [p];
      }
      const pid = projects[0].id;
      setProjectId(pid);
      const [envs, segs, tg, ctx] = await Promise.all([
        api.environments.list(pid),
        api.segments.list(pid),
        api.tags.list(pid),
        api.contexts.list(pid),
      ]);
      if (envs.length === 0) {
        const dev = await api.environments.create(pid, 'Development');
        const prod = await api.environments.create(pid, 'Production');
        setEnvironments([dev, prod]);
      } else setEnvironments(envs);
      setSegments(segs);
      setTags(tg);
      setContexts(ctx);
    } catch (e) { console.error('Failed', e); setLoading(false); }
  }, []);

  const loadFlags = useCallback(async () => {
    if (!projectId) return;
    try {
      const envs = environments.length > 0 ? environments : await api.environments.list(projectId);
      const [base, segs, tg, ctx] = await Promise.all([
        api.flags.list(projectId),
        api.segments.list(projectId),
        api.tags.list(projectId),
        api.contexts.list(projectId),
      ]);
      setSegments(segs); setTags(tg); setContexts(ctx);

      const byKey = new Map<string, FlagView>();
      for (const f of base) {
        if (!byKey.has(f.key)) byKey.set(f.key, { key: f.key, name: f.name, description: f.description ?? '', flagType: f.flagType, tags: f.tags ?? [], flagId: f.id, environments: {} });
      }
      for (const env of envs) {
        const envFlags = await api.flags.list(projectId, env.id);
        for (const f of envFlags) {
          const v = byKey.get(f.key) ?? byKey.set(f.key, { key: f.key, name: f.name, description: f.description ?? '', flagType: f.flagType, tags: f.tags ?? [], flagId: f.id, environments: {} }).get(f.key)!;
          v.environments[env.id] = { enabled: f.enabled, percentage: f.percentage ?? 100, segmentId: f.segmentId ?? null, strategyId: f.strategyId ?? null, contextDefinitionId: f.contextDefinitionId ?? null, contextValuesJson: f.contextValuesJson ?? null };
        }
      }
      setFlags(Array.from(byKey.values()));
    } catch (e) { console.error('Failed', e); } finally { setLoading(false); }
  }, [projectId, environments]);

  useEffect(() => { loadProject(); }, []);
  useEffect(() => { if (projectId && environments.length > 0) loadFlags(); }, [projectId, environments]);

  const openCreate = () => {
    setEditing({ flag: null, mode: 'create', envId: null }); setError(''); setPanelOpen(true);
    setFormName(''); setFormKey(''); setFormDesc(''); setFormType('RELEASE'); setFormTags([]);
    setAddingTag(false); setNewTagId(null); setNewTagVal('');
  };

  const openGeneral = (flag: FlagView) => {
    setEditing({ flag, mode: 'general', envId: null }); setError(''); setPanelOpen(true);
    setFormName(flag.name); setFormKey(flag.key); setFormDesc(flag.description); setFormType(flag.flagType);
    setFormTags(flag.tags ?? []);
    setAddingTag(false); setNewTagId(null); setNewTagVal('');
  };

  const openEnvironment = (flag: FlagView, envId: number) => {
    setEditing({ flag, mode: 'environment', envId }); setError(''); setPanelOpen(true);
    setFormName(flag.name); setFormKey(flag.key);
    const es = flag.environments[envId] ?? { enabled: false, percentage: 100, segmentId: null, strategyId: null, contextDefinitionId: null, contextValuesJson: null };
    setEnvDefault(es.enabled);
    setInitialEnvDefault(es.enabled);
    let constraints: ConstraintEntry[] = [];
    if (es.contextValuesJson && es.contextDefinitionId) {
      try {
        const parsed = JSON.parse(es.contextValuesJson);
        if (Array.isArray(parsed)) {
          constraints = parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null && 'op' in item) {
              return { contextDefId: es.contextDefinitionId!, operator: item.op ?? 'eq', value: item.val ?? String(item.value ?? '') };
            }
            return { contextDefId: es.contextDefinitionId!, operator: 'in', value: String(item) };
          });
        }
      } catch {}
    }
    const initialRules = [{ id: `r-${Date.now()}`, percentage: es.percentage ?? 100, segmentIds: es.segmentId ? [es.segmentId] : [], constraints: constraints.map(c => ({...c})) }];
    setEnvRules(initialRules);
    setInitialEnvRules(initialRules);
  };

  const handleDelete = async (flag: FlagView) => {
    if (!projectId || !confirm('Удалить флаг из всех окружений?')) return;
    try {
      for (const envId of Object.keys(flag.environments).map(Number)) {
        try { await api.flags.delete(projectId, flag.flagId); } catch {}
      }
      setFlags(flags.filter(f => f.key !== flag.key));
    } catch (e: any) { alert(e.message); }
  };

  const handleSave = async () => {
    if (!projectId) return;
    setError(''); setSaving(true);
    try {
      if (editing.mode === 'create') {
        const tagsPayload = formTags.map(t => ({ tagId: t.tagId, value: t.value }));
        const created = await api.flags.create(projectId, { name: formName, key: formKey, description: formDesc, flagType: formType, tags: tagsPayload.length > 0 ? tagsPayload : undefined });
        for (const env of environments) {
          await api.strategies.create(created.id, { environmentId: env.id, enabled: false, percentage: 100 });
        }
        await loadFlags();
      } else if (editing.mode === 'general' && editing.flag) {
        const tagsPayload = formTags.map(t => ({ tagId: t.tagId, value: t.value }));
        const req = { name: formName, key: formKey, description: formDesc, flagType: formType, tags: tagsPayload.length > 0 ? tagsPayload : undefined } as FlagRequest;
        for (const envId of Object.keys(editing.flag.environments).map(Number)) {
          const envFlags = await api.flags.list(projectId, envId);
          const match = envFlags.find(f => f.key === editing.flag!.key);
          if (match) await api.flags.update(projectId, match.id, req);
        }
        await loadFlags();
      } else if (editing.mode === 'environment' && editing.flag && editing.envId) {
        const envFlags = await api.flags.list(projectId, editing.envId);
        const envFlag = envFlags.find(f => f.key === editing.flag!.key);
        if (!envFlag) {
          setError('Флаг не найден в окружении. Попробуйте обновить страницу.');
          setSaving(false);
          return;
        }
        const primaryRule = envRules[0] ?? { percentage: 100, segmentIds: [], constraints: [] };
        let contextDefId: number | undefined;
        let contextValuesJson: string | undefined;
        if (primaryRule.constraints.length > 0) {
          contextDefId = primaryRule.constraints[0].contextDefId;
          contextValuesJson = JSON.stringify(primaryRule.constraints.map(c => ({ cd: c.contextDefId, op: c.operator, val: c.value })));
        }
        await api.strategies.upsert(envFlag.id, {
          environmentId: editing.envId,
          enabled: envDefault,
          percentage: primaryRule.percentage,
          segmentId: primaryRule.segmentIds[0] ?? undefined,
          contextDefinitionId: contextDefId,
          contextValuesJson,
        });
        await loadFlags();
      }
      setPanelOpen(false);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const toggleFlag = async (flag: FlagView, envId: number) => {
    if (!projectId) return;
    const es = flag.environments[envId];
    if (!es) return;
    const envFlags = await api.flags.list(projectId, envId);
    const envFlag = envFlags.find(f => f.key === flag.key);
    if (!envFlag) return;
    const newEnabled = !es.enabled;
    setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, environments: { ...f.environments, [envId]: { ...es, enabled: newEnabled } } } : f));
    try {
      await api.strategies.upsert(envFlag.id, {
        environmentId: envId,
        enabled: newEnabled,
        percentage: es.percentage,
        segmentId: es.segmentId ?? undefined,
        contextDefinitionId: es.contextDefinitionId ?? undefined,
        contextValuesJson: es.contextValuesJson ?? undefined,
      });
    } catch { loadFlags(); }
  };

  const addRule = () => setEnvRules(prev => [...prev, { id: `r-${Date.now()}`, percentage: 0, segmentIds: [], constraints: [] }]);
  const removeRule = (id: string) => setEnvRules(prev => prev.filter(r => r.id !== id));
  const updateRulePercent = (id: string, pct: number) => setEnvRules(prev => prev.map(r => r.id === id ? { ...r, percentage: pct } : r));
  const updateRuleSegments = (id: string, sids: number[]) => setEnvRules(prev => prev.map(r => r.id === id ? { ...r, segmentIds: sids } : r));
  const addConstraint = (ruleId: string) => setEnvRules(prev => prev.map(r => r.id === ruleId ? { ...r, constraints: [...r.constraints, { contextDefId: contexts[0]?.id ?? 0, operator: 'eq', value: '' }] } : r));
  const removeConstraint = (ruleId: string, idx: number) => setEnvRules(prev => prev.map(r => r.id === ruleId ? { ...r, constraints: r.constraints.filter((_, i) => i !== idx) } : r));
  const updateConstraint = (ruleId: string, idx: number, field: keyof ConstraintEntry, val: any) => setEnvRules(prev => prev.map(r => r.id === ruleId ? { ...r, constraints: r.constraints.map((c, i) => i === idx ? { ...c, [field]: val } : c) } : r));

  const adjustColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  const getTypeColor = (t: string) => {
    switch (t) {
      case 'RELEASE': return 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10';
      case 'EXPERIMENT': return 'bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10';
      case 'KILLSWITCH': return 'bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10';
      default: return 'bg-gradient-to-r from-neutral-600 to-neutral-500 bg-clip-text text-transparent border-neutral-200 dark:border-neutral-500/20 bg-neutral-50 dark:bg-neutral-500/10';
    }
  };
  const getTypeLabel = (t: string) => t === 'RELEASE' ? 'Релиз' : t === 'EXPERIMENT' ? 'Эксперимент' : t === 'KILLSWITCH' ? 'Рубильник' : t;

  let filtered = flags;
  if (selectedTagTypeFilter) filtered = filtered.filter(f => f.tags.some(tg => tg.tagId === selectedTagTypeFilter && (!selectedTagValueFilter || tg.value === selectedTagValueFilter)));
  const uniqueTagValues = (typeId: number) => [...new Set(flags.flatMap(f => f.tags.filter(t => t.tagId === typeId).map(t => t.value)))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Feature Flags</h1><p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте доступностью функций во всех окружениях</p></div>
        <button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"><Plus size={18} />Создать флаг</button>
      </div>

      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Тип тега:</span>
            <button onClick={() => { setSelectedTagTypeFilter(null); setSelectedTagValueFilter(null); }} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${!selectedTagTypeFilter ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>Все</button>
            {tags.map(tg => (
              <button key={tg.id} onClick={() => { setSelectedTagTypeFilter(selectedTagTypeFilter === tg.id ? null : tg.id); setSelectedTagValueFilter(null); }} className="px-3 py-1.5 text-sm font-medium rounded-lg text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})`, opacity: selectedTagTypeFilter === tg.id ? 1 : 0.7 }}>{tg.name}</button>
            ))}
          </div>
          {selectedTagTypeFilter && (
            <div className="flex items-center gap-2 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Значение:</span>
              <button onClick={() => setSelectedTagValueFilter(null)} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${!selectedTagValueFilter ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>Все</button>
              {uniqueTagValues(selectedTagTypeFilter).map(v => {
                const tg = tags.find(t => t.id === selectedTagTypeFilter);
                return <button key={v} onClick={() => setSelectedTagValueFilter(selectedTagValueFilter === v ? null : v)} className={`px-3 py-1.5 text-sm font-medium rounded-lg text-white ${selectedTagValueFilter === v ? 'opacity-100' : 'opacity-70'}`} style={{ backgroundColor: tg?.color ?? '#666' }}>{v}</button>;
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50"><th className="px-6 py-4">Название & Ключ</th><th className="px-6 py-4">Тип</th>{environments.map(env => (<th key={env.id} className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-1.5"><span className={`w-2 h-2 rounded-full ${env.name === 'Production' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>{env.name}</div></th>))}</tr></thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? <tr><td colSpan={2 + environments.length} className="px-6 py-12 text-center text-neutral-500">Загрузка...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={2 + environments.length} className="px-6 py-12 text-center text-neutral-500">Нет флагов</td></tr>
              : filtered.map(flag => (
                <tr key={flag.key} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => openGeneral(flag)}>
                    <div className="font-medium text-neutral-900 dark:text-neutral-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-violet-600 hover:bg-clip-text hover:text-transparent">{flag.name}</div>
                    <div className="text-xs font-mono text-neutral-500 mt-0.5">{flag.key}</div>
                    {flag.tags.length > 0 && (<div className="flex items-center gap-1.5 mt-2 flex-wrap">{flag.tags.map((tv, i) => { const tg = tags.find(t => t.id === tv.tagId); return tg ? (<span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}>{tv.value}</span>) : null; })}</div>)}
                  </td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeColor(flag.flagType)}`}><Tag size={12} />{getTypeLabel(flag.flagType)}</span></td>
                  {environments.map(env => {
                    const es = flag.environments[env.id];
                    return (<td key={env.id} className="px-6 py-4">{es ? (<div className="flex flex-col items-center gap-1.5"><div className="flex items-center gap-2"><Switch.Root checked={es.enabled} onCheckedChange={() => toggleFlag(flag, env.id)} className={`w-[42px] h-[24px] rounded-full relative outline-none cursor-pointer transition-colors ${es.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}><Switch.Thumb className={`block w-[20px] h-[20px] bg-white rounded-full transition-transform translate-x-[2px] will-change-transform ${es.enabled ? 'translate-x-[20px]' : ''} shadow-sm`} /></Switch.Root>{es.percentage !== 100 && (<div className="flex items-center gap-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 min-w-[42px] justify-center"><Percent size={10} />{es.percentage}</div>)}{es.percentage === 100 && es.enabled && <span className="text-xs text-neutral-400">100%</span>}</div><button onClick={() => openEnvironment(flag, env.id)} className="text-xs bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent font-medium opacity-0 group-hover:opacity-100 transition-opacity">Настроить</button></div>) : <span className="text-sm text-neutral-400">—</span>}</td>);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        open={panelOpen} onOpenChange={setPanelOpen}
        title={editing.mode === 'create' ? 'Новый флаг' : editing.mode === 'general' ? 'Настройки флага' : `Таргетинг для ${environments.find(e => e.id === editing.envId)?.name ?? ''}`}
        description={editing.mode === 'create' ? 'Флаг будет создан для всех окружений (Production и Development)' : editing.mode === 'general' ? 'Общие настройки флага применяются ко всем окружениям' : 'Настройте таргетинг и раскатку для этого окружения'}
        footer={<>
          <button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button>
          <button onClick={handleSave} disabled={saving || (editing.mode === 'create' && (!formName || !formKey)) || (editing.mode === 'general' && !formName) || (editing.mode === 'environment' && !isEnvDirty)} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 rounded-lg">{saving ? 'Сохранение...' : editing.mode === 'create' ? 'Создать флаг' : 'Сохранить изменения'}</button>
        </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700">{error}</div>}

          {(editing.mode === 'create' || editing.mode === 'general') && <div className="space-y-5">
            {editing.mode === 'create' && <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"><p className="text-xs text-indigo-700 dark:text-indigo-300">Флаг будет создан для <strong>всех окружений</strong> (Production и Development). Вы сможете настроить параметры раскатки отдельно для каждого окружения после создания.</p></div>}

            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: Новый чекаут" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ключ (Key)</label><input type="text" value={formKey} onChange={e => setFormKey(e.target.value)} disabled={editing.mode !== 'create'} placeholder="new-checkout-flow" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono text-sm" /><p className="text-xs text-neutral-500">Используется в коде. Нельзя изменить после создания.</p></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Краткое описание флага..." rows={3} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Тип флага</label><Select value={formType} onValueChange={setFormType}><SelectTrigger className="w-full rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RELEASE">Релиз (Release)</SelectItem><SelectItem value="EXPERIMENT">Эксперимент (Experiment)</SelectItem><SelectItem value="KILLSWITCH">Рубильник (Kill-switch)</SelectItem></SelectContent></Select></div>

            {(editing.mode === 'create' || editing.mode === 'general') && <div className="space-y-2"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Теги</label>
              {formTags.length > 0 && <div className="flex flex-wrap gap-2">{formTags.map((tv, i) => { const tg = tags.find(t => t.id === tv.tagId); if (!tg) return null; return (<div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}><span>{tv.value}</span><button onClick={() => setFormTags(formTags.filter((_, j) => j !== i))} className="hover:opacity-80"><X size={12} /></button></div>); })}</div>}
              {!addingTag ? <button onClick={() => setAddingTag(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg border border-dashed border-blue-300 dark:border-violet-500/30"><Plus size={14} />Добавить тег</button>
              : <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-2"><label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Выберите тип тега</label>
                    <div className="grid grid-cols-2 gap-2">{tags.map(tg => (<button key={tg.id} onClick={() => setNewTagId(tg.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${newTagId === tg.id ? 'shadow-sm' : 'hover:shadow-sm border-neutral-200 dark:border-neutral-800'}`} style={newTagId === tg.id ? { borderColor: tg.color, borderWidth: '2px' } : {}}><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }} /><span className="text-neutral-700 dark:text-neutral-300">{tg.name}</span></button>))}</div>
                  </div>
                  {newTagId && <div className="flex gap-2 items-center pt-1"><input type="text" value={newTagVal} onChange={e => setNewTagVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTagVal.trim()) { const tg = tags.find(t => t.id === newTagId)!; setFormTags([...formTags, { tagId: tg.id, tagName: tg.name, tagColor: tg.color, value: newTagVal.trim() }]); setAddingTag(false); setNewTagId(null); setNewTagVal(''); } else if (e.key === 'Escape') { setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} placeholder="Введите значение тега" autoFocus className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button onClick={() => { if (newTagVal.trim() && newTagId) { const tg = tags.find(t => t.id === newTagId)!; setFormTags([...formTags, { tagId: tg.id, tagName: tg.name, tagColor: tg.color, value: newTagVal.trim() }]); setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} disabled={!newTagVal.trim()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Добавить</button></div>}
                  <button onClick={() => { setAddingTag(false); setNewTagId(null); setNewTagVal(''); }} className="w-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button>
                </div>}
            </div>}

            {editing.flag && <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800"><button onClick={() => { handleDelete(editing.flag!); setPanelOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20"><Trash2 size={16} />Удалить флаг из всех окружений</button></div>}
          </div>}

          {editing.mode === 'environment' && <div className="space-y-5">
            <div className="flex items-center justify-between"><div><h4 className="text-sm font-medium text-neutral-900 dark:text-white">Правила таргетинга</h4><p className="text-xs text-neutral-500 mt-0.5">Управляйте раскаткой для разных аудиторий</p></div><button onClick={addRule} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"><Plus size={14} />Добавить правило</button></div>

            {envRules.map((rule, ri) => (
              <div key={rule.id} className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-5">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Правило {ri + 1}</span>{envRules.length > 1 && <button onClick={() => removeRule(rule.id)} className="text-red-600 dark:text-red-400 hover:text-red-500 p-1"><X size={16} /></button>}</div>

                {/* Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2"><Percent size={14} className="text-indigo-600 dark:text-indigo-400" />Процент раскатки</label><span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{rule.percentage}%</span></div>
                  <Slider.Root value={[rule.percentage]} onValueChange={([v]) => updateRulePercent(rule.id, v)} max={100} step={1} className="relative flex items-center select-none touch-none w-full h-5"><Slider.Track className="bg-neutral-200 dark:bg-neutral-800 relative grow rounded-full h-2.5"><Slider.Range className="absolute bg-indigo-600 dark:bg-indigo-500 rounded-full h-full" /></Slider.Track><Slider.Thumb className="block w-6 h-6 bg-white border-2 border-violet-600 dark:border-violet-500 rounded-full shadow-lg hover:bg-violet-50 dark:hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2" /></Slider.Root>
                  <p className="text-xs text-neutral-500">{rule.percentage === 100 ? 'Полная раскатка на всех пользователей' : rule.percentage === 0 ? 'Флаг отключен' : `${rule.percentage}% пользователей увидят эту функцию`}</p>
                </div>

                {/* Segments */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3"><Users size={16} className="text-indigo-600 dark:text-indigo-400" /><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Целевые сегменты</label></div>
                  <div className="grid grid-cols-1 gap-2 p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {segments.map(seg => { const checked = rule.segmentIds.includes(seg.id); return (
                      <label key={seg.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer group">
                        <input type="checkbox" checked={checked} onChange={e => updateRuleSegments(rule.id, e.target.checked ? [...rule.segmentIds, seg.id] : rule.segmentIds.filter(id => id !== seg.id))} className="w-4 h-4 text-indigo-600 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">{seg.name}</span>
                      </label>
                    ); })}
                  </div>
                  {rule.segmentIds.length === 0 && <p className="text-xs text-neutral-500 mt-2 ml-1">Нет выбранных сегментов — правило применится ко всем пользователям</p>}
                </div>

                {rule.segmentIds.length > 0 && (() => {
                  const segsWithContext = rule.segmentIds
                    .map(sid => segments.find(s => s.id === sid))
                    .filter((s): s is SegmentResponse => !!s && (s.context?.length ?? 0) > 0);
                  if (segsWithContext.length === 0) return null;
                  return (
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-amber-600 dark:text-amber-400" />
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Constraints из сегментов
                        </label>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                          только чтение
                        </span>
                      </div>
                      {segsWithContext.map(seg => (
                        <div key={seg.id} className="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20 mb-2">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            {seg.name}
                          </p>
                          <div className="space-y-1">
                            {seg.context!.map((c, ci) => {
                              const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                              return (
                                <div key={ci} className="flex items-center gap-2 text-xs bg-amber-100 dark:bg-amber-500/10 rounded-md px-2.5 py-1.5 border border-amber-200/50 dark:border-amber-500/10">
                                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                                    {ctxDef?.name ?? `Поле #${c.contextDefinitionId}`}
                                  </span>
                                  <span className="text-amber-500 dark:text-amber-600 font-mono text-[10px] uppercase tracking-wider">
                                    in
                                  </span>
                                  <code className="font-mono text-amber-800 dark:text-amber-200 break-all">
                                    {c.contextValues}
                                  </code>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Constraints */}
                <div>
                  <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Settings size={16} className="text-indigo-600 dark:text-indigo-400" /><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Дополнительные условия</label><span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">настраиваемые</span></div><button onClick={() => addConstraint(rule.id)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />Добавить</button></div>
                  <div className="space-y-2">
                    {rule.constraints.map((c, ci) => (
                      <div key={ci} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                        <div className="flex items-center justify-between"><span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Условие {ci + 1}</span><button onClick={() => removeConstraint(rule.id, ci)} className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400"><X size={14} /></button></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Поле</label>
                            <Select value={String(c.contextDefId)} onValueChange={(v) => updateConstraint(rule.id, ci, 'contextDefId', Number(v))}>
                                <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                                <SelectContent>{contexts.map(ctx => <SelectItem key={ctx.id} value={String(ctx.id)}>{ctx.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Оператор</label>
                            <Select value={c.operator} onValueChange={(v) => updateConstraint(rule.id, ci, 'operator', v)}>
                              <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eq">равно</SelectItem><SelectItem value="ne">не равно</SelectItem><SelectItem value="in">в списке</SelectItem><SelectItem value="not_in">не в списке</SelectItem><SelectItem value="gt">&gt;</SelectItem><SelectItem value="gte">≥</SelectItem><SelectItem value="lt">&lt;</SelectItem><SelectItem value="lte">≤</SelectItem><SelectItem value="contains">содержит</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Значение</label><input type="text" value={c.value} onChange={e => updateConstraint(rule.id, ci, 'value', e.target.value)} placeholder="значение..." className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        </div>
                      </div>
                    ))}
                    {rule.constraints.length === 0 && <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center"><p className="text-xs text-neutral-500 dark:text-neutral-400">Нет дополнительных условий. Нажмите "Добавить" для настройки таргетинга по контексту.</p></div>}
                  </div>
                </div>
              </div>
            ))}

            {/* Info box */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"><div className="flex gap-3"><div className="shrink-0 mt-0.5"><div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"><Settings size={12} className="text-white" /></div></div><div><h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Как работает таргетинг?</h5><p className="text-xs text-indigo-700 dark:text-indigo-300">Процент раскатки работает внутри выбранных сегментов и условий. Например, 50% для сегмента "Premium" покажет флаг половине premium-пользователей.</p></div></div></div>

            {/* Default value */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800"><h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center gap-2"><Settings size={14} className="text-neutral-500" />Значение по умолчанию</h4><p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Возвращается, если пользователь не попадает ни под одно правило</p>
              <div className="flex items-center gap-3">
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 bg-white dark:bg-neutral-950 border rounded-lg hover:border-indigo-500 transition-colors ${envDefault ? 'border-neutral-200 dark:border-neutral-800' : 'border-indigo-500'}`}><input type="radio" checked={!envDefault} onChange={() => setEnvDefault(false)} className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Выключено</span></label>
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 bg-white dark:bg-neutral-950 border rounded-lg hover:border-indigo-500 transition-colors ${envDefault ? 'border-indigo-500' : 'border-neutral-200 dark:border-neutral-800'}`}><input type="radio" checked={envDefault} onChange={() => setEnvDefault(true)} className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Включено</span></label>
              </div>
            </div>
          </div>}
        </div>
      </SidePanel>
    </div>
  );
}