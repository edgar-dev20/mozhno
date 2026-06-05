import React, { useState, useEffect, useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Switch } from './ui/switch';
import { Plus, Tag, Trash2, Percent, Users, Settings, X, Filter, Rocket, ShieldOff, Zap, Archive, ArchiveRestore, Clock, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { SidePanel } from './SidePanel';
import { TipCard } from './TipCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SegmentIcon } from './SegmentIcon';
import { api, FlagResponse, FlagRequest, Tag as TagType, Environment, SegmentResponse, FlagStrategy, StrategyRequest, FlagTagValue, ContextDefinition, ContextValue } from '../../api';

interface EnvState { enabled: boolean; percentage: number; segmentIds: number[]; strategyId: number | null; contextDefinitionId: number | null; contextValuesJson: string | null; lastUsedAt: string | null; }
interface FlagView { key: string; name: string; description: string; flagType: string; tags: FlagTagValue[]; flagId: number; environments: Record<number, EnvState>; archived: boolean; createdAt: string | null; createdBy: string | null; archivedBy: string | null; archivedAt: string | null; }

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

  const [envRulePercent, setEnvRulePercent] = useState(100);
  const [envRuleSegments, setEnvRuleSegments] = useState<number[]>([]);
  const [envRuleConstraints, setEnvRuleConstraints] = useState<ConstraintEntry[]>([]);
  const [envRuleEnabled, setEnvRuleEnabled] = useState(false);
  const [initialEnvRulePercent, setInitialEnvRulePercent] = useState(100);
  const [initialEnvRuleSegments, setInitialEnvRuleSegments] = useState<number[]>([]);
  const [initialEnvRuleConstraints, setInitialEnvRuleConstraints] = useState<ConstraintEntry[]>([]);
  const [initialEnvRuleEnabled, setInitialEnvRuleEnabled] = useState(false);

  const isEnvDirty = envRulePercent !== initialEnvRulePercent ||
    JSON.stringify(envRuleSegments) !== JSON.stringify(initialEnvRuleSegments) ||
    JSON.stringify(envRuleConstraints) !== JSON.stringify(initialEnvRuleConstraints) ||
    envRuleEnabled !== initialEnvRuleEnabled;

  const [selectedTagTypeFilter, setSelectedTagTypeFilter] = useState<number | null>(null);
  const [selectedTagValueFilter, setSelectedTagValueFilter] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlagView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<FlagView | null>(null);
  const [archiving, setArchiving] = useState(false);

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
        api.flags.list(projectId, undefined, true),
        api.segments.list(projectId),
        api.tags.list(projectId),
        api.contexts.list(projectId),
      ]);
      setSegments(segs); setTags(tg); setContexts(ctx);

      const byKey = new Map<string, FlagView>();
      for (const f of base) {
        if (!byKey.has(f.key)) byKey.set(f.key, { key: f.key, name: f.name, description: f.description ?? '', flagType: f.flagType, tags: f.tags ?? [], flagId: f.id, environments: {}, archived: f.archived, createdAt: f.createdAt ?? null, createdBy: f.createdBy ?? null, archivedBy: f.archivedBy ?? null, archivedAt: f.archivedAt ?? null });
      }
      for (const env of envs) {
        const envFlags = await api.flags.list(projectId, env.id);
        for (const f of envFlags) {
          const v = byKey.get(f.key) ?? byKey.set(f.key, { key: f.key, name: f.name, description: f.description ?? '', flagType: f.flagType, tags: f.tags ?? [], flagId: f.id, environments: {}, archived: f.archived, createdAt: f.createdAt ?? null, createdBy: f.createdBy ?? null, archivedBy: f.archivedBy ?? null, archivedAt: f.archivedAt ?? null }).get(f.key)!;
          v.environments[env.id] = { enabled: f.enabled, percentage: f.percentage ?? 100, segmentIds: f.segmentIds ?? [], strategyId: f.strategyId ?? null, contextDefinitionId: f.contextDefinitionId ?? null, contextValuesJson: f.contextValuesJson ?? null, lastUsedAt: f.lastUsedAt ?? null };
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
    const es = flag.environments[envId] ?? { enabled: false, percentage: 100, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null };
    let constraints: ConstraintEntry[] = [];
    if (es.contextValuesJson) {
      try {
        const parsed = JSON.parse(es.contextValuesJson);
        if (Array.isArray(parsed)) {
          constraints = parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null && 'op' in item) {
              return { contextDefId: item.cd ?? es.contextDefinitionId ?? 0, operator: item.op ?? 'eq', value: item.val ?? String(item.value ?? '') };
            }
            return { contextDefId: es.contextDefinitionId ?? 0, operator: 'in', value: String(item) };
          });
        }
      } catch {}
    }
    setEnvRulePercent(es.percentage ?? 100);
    setEnvRuleSegments(es.segmentIds ?? []);
    setEnvRuleConstraints(constraints.map(c => ({...c})));
    setEnvRuleEnabled(es.enabled ?? false);
    setInitialEnvRulePercent(es.percentage ?? 100);
    setInitialEnvRuleSegments(es.segmentIds ?? []);
    setInitialEnvRuleConstraints(constraints.map(c => ({...c})));
    setInitialEnvRuleEnabled(es.enabled ?? false);
  };

  const handleDelete = async () => {
    if (!projectId || !deleteTarget) return;
    setDeleting(true);
    try {
      for (const envId of Object.keys(deleteTarget.environments).map(Number)) {
        try { await api.flags.delete(projectId, deleteTarget.flagId); } catch {}
      }
      setFlags(flags.filter(f => f.key !== deleteTarget.key));
      setDeleteTarget(null);
    } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  };

  const handleArchive = async () => {
    if (!projectId || !archiveTarget) return;
    setArchiving(true);
    try {
      await api.flags.archive(projectId, archiveTarget.flagId);
      setArchiveTarget(null);
      setPanelOpen(false);
      await loadFlags();
    } catch (e: any) { alert(e.message); } finally { setArchiving(false); }
  };

  const handleUnarchive = async (flag: FlagView) => {
    if (!projectId) return;
    try {
      await api.flags.unarchive(projectId, flag.flagId);
      await loadFlags();
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
        let contextDefId: number | undefined;
        let contextValuesJson: string | undefined;
        if (envRuleConstraints.length > 0) {
          contextDefId = envRuleConstraints[0].contextDefId;
          contextValuesJson = JSON.stringify(envRuleConstraints.map(c => ({ cd: c.contextDefId, op: c.operator, val: c.value })));
        }
        await api.strategies.upsert(envFlag.id, {
          environmentId: editing.envId,
          enabled: envRuleEnabled,
          percentage: envRulePercent,
          segmentIds: envRuleSegments.length > 0 ? envRuleSegments : undefined,
          contextDefinitionId: contextDefId,
          contextValuesJson,
        });
        setInitialEnvRuleEnabled(envRuleEnabled);
        setInitialEnvRulePercent(envRulePercent);
        setInitialEnvRuleSegments([...envRuleSegments]);
        setInitialEnvRuleConstraints(envRuleConstraints.map(c => ({...c})));
        await loadFlags();
      }
      if (editing.mode === 'create') setPanelOpen(false);
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
        segmentIds: es.segmentIds.length > 0 ? es.segmentIds : undefined,
        contextDefinitionId: es.contextDefinitionId ?? undefined,
        contextValuesJson: es.contextValuesJson ?? undefined,
      });
    } catch { loadFlags(); }
  };

  const addConstraint = () => setEnvRuleConstraints(prev => [...prev, { contextDefId: contexts[0]?.id ?? 0, operator: 'eq', value: '' }]);
  const removeConstraint = (idx: number) => setEnvRuleConstraints(prev => prev.filter((_, i) => i !== idx));
  const updateConstraint = (idx: number, field: keyof ConstraintEntry, val: any) => setEnvRuleConstraints(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));

  const adjustColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  const getTypeColor = (t: string) => {
    switch (t) {
      case 'RELEASE': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'KILLSWITCH': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      default: return 'text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-500/10 border-neutral-200 dark:border-neutral-500/20';
    }
  };
  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'RELEASE': return Rocket;
      case 'KILLSWITCH': return ShieldOff;
      default: return Tag;
    }
  };
  const getTypeLabel = (t: string) => t === 'RELEASE' ? 'Релиз' : t === 'KILLSWITCH' ? 'Рубильник' : t;
  const formatDate = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatDateTime = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const timeAgo = (d: string | null) => {
    if (!d) return 'Никогда не использовался';
    const diff = Date.now() - new Date(d).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Только что';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин. назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч. назад`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} дн. назад`;
    return formatDate(d) ?? '';
  };

  let filtered = flags.filter(f => !f.archived);
  if (selectedTagTypeFilter) filtered = filtered.filter(f => f.tags.some(tg => tg.tagId === selectedTagTypeFilter && (!selectedTagValueFilter || tg.value === selectedTagValueFilter)));
  let archivedFlags = flags.filter(f => f.archived);
  if (selectedTagTypeFilter) archivedFlags = archivedFlags.filter(f => f.tags.some(tg => tg.tagId === selectedTagTypeFilter && (!selectedTagValueFilter || tg.value === selectedTagValueFilter)));
  const uniqueTagValues = (typeId: number) => [...new Set(flags.flatMap(f => f.tags.filter(t => t.tagId === typeId).map(t => t.value)))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-violet-500 to-purple-500 bg-clip-text text-transparent">Feature Flags</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Управляйте доступностью функций во всех окружениях</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all active:scale-95"><Plus size={18} />Создать флаг</button>
      </div>

      <div className="flex items-center gap-2">
        {archivedFlags.length === 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed select-none">
                <Archive size={16} />
                Архив
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-full">0</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>Нет архивных флагов</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setArchiveOpen(!archiveOpen)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
              archiveOpen
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Archive size={16} />
            Архив
            <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold rounded-full ${archiveOpen ? 'bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>{archivedFlags.length}</span>
          </button>
        )}
      </div>

      <TipCard
        accentColor="#6366f1"
        accentColor2="#8b5cf6"
        text="Держите число активных флагов под контролем — удаляйте те, что отработали больше двух спринтов. Старые флаги замедляют CI и забивают контекст команды."
        label="Гигиена кода"
        icon={<Zap />}
        storageKey="flags"
      />

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

      <div className="space-y-2">
        <div className="flex items-center px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <div className="flex-1 pl-2">Название & Ключ</div>
          {environments.map(env => (<div key={env.id} className="w-[152px] text-center">{env.name}</div>))}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-6 py-16 text-center shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/10 dark:to-violet-500/10 animate-pulse" />
              <span className="text-sm text-neutral-400">Загрузка флагов...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-6 py-16 text-center shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/10 dark:to-violet-500/10 flex items-center justify-center">
                <Rocket size={24} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Нет флагов</p>
                <p className="text-xs text-neutral-400 mt-1">Создайте первый флаг для управления функциональностью</p>
              </div>
              <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all">
                <Plus size={14} />Создать флаг
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((flag, idx) => (
              <motion.div
                key={flag.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: idx * 0.025 }}
                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-6 py-4 flex items-center shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openGeneral(flag)}>
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-neutral-900 dark:text-neutral-200 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-violet-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">{flag.name}</span>
                    {(() => { const Icon = getTypeIcon(flag.flagType); return (<span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getTypeColor(flag.flagType)}`}><Icon size={10} />{getTypeLabel(flag.flagType)}</span>); })()}
                  </div>
                  <div className="text-xs font-mono text-neutral-500 mt-0.5">{flag.key}</div>
                  {flag.tags.length > 0 && (<div className="flex items-center gap-1.5 mt-2 flex-wrap">{flag.tags.map((tv, i) => { const tg = tags.find(t => t.id === tv.tagId); return tg ? (<span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}>{tv.value}</span>) : null; })}</div>)}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                    {flag.createdAt && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1"><Clock size={10} />{formatDate(flag.createdAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{formatDateTime(flag.createdAt)}</TooltipContent>
                      </Tooltip>
                    )}
                    {flag.createdBy && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 truncate max-w-[160px]"><User size={10} />{flag.createdBy}</span>
                        </TooltipTrigger>
                        <TooltipContent>{flag.createdBy}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-6 shrink-0">
                  {environments.map(env => {
                    const es = flag.environments[env.id];
                    return (
                      <div key={env.id} className="w-[120px] flex flex-col items-center justify-center">
                        {es ? (
                          <>
                          <div className="flex items-center justify-center gap-2">
                            <Switch checked={es.enabled} onCheckedChange={() => toggleFlag(flag, env.id)} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-violet-500" />
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold min-w-[42px] justify-center select-none transition-colors ${es.enabled ? 'bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'}`}><Percent size={9} />{es.percentage ?? 100}</span>
                            <button onClick={() => openEnvironment(flag, env.id)} className="flex items-center justify-center size-[22px] rounded-md text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 dark:hover:from-blue-500/10 dark:hover:to-violet-500/10 transition-colors" title="Настроить"><Settings size={13} /></button>
                          </div>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 leading-none">{timeAgo(es.lastUsedAt)}</span>
                          </>
                        ) : <span className="text-sm text-neutral-400">—</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {archiveOpen && archivedFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/20 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Archive size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Архивные флаги</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400">Не отображаются в SDK и не влияют на работу приложения</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <AnimatePresence>
              {archivedFlags.map((flag) => (
                <motion.div
                  key={flag.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">{flag.name}</span>
                      {(() => { const Icon = getTypeIcon(flag.flagType); return (<span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getTypeColor(flag.flagType)}`}><Icon size={10} />{getTypeLabel(flag.flagType)}</span>); })()}
                    </div>
                    <div className="text-xs font-mono text-neutral-400 mt-0.5">{flag.key}</div>
                    {flag.tags.length > 0 && (<div className="flex items-center gap-1.5 mt-1.5 flex-wrap">{flag.tags.map((tv, i) => { const tg = tags.find(t => t.id === tv.tagId); return tg ? (<span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}>{tv.value}</span>) : null; })}</div>)}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                      <span className="flex items-center gap-1"><User size={10} />{flag.createdBy ?? '—'}</span>
                      {flag.createdAt && <span className="flex items-center gap-1"><Clock size={10} />{formatDate(flag.createdAt)}</span>}
                    </div>
                    {flag.archivedBy && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <span className="flex items-center gap-1"><Archive size={10} />{flag.archivedBy}</span>
                        {flag.archivedAt && <span className="flex items-center gap-1"><Clock size={10} />{formatDate(flag.archivedAt)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-4 shrink-0">
                    <button
                      onClick={() => handleUnarchive(flag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      <ArchiveRestore size={13} />Восстановить
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <SidePanel
        open={panelOpen} onOpenChange={setPanelOpen}
        title={editing.mode === 'create' ? 'Новый флаг' : editing.mode === 'general' ? 'Настройки флага' : `Таргетинг для ${environments.find(e => e.id === editing.envId)?.name ?? ''}`}
        description={editing.mode === 'create' ? 'Флаг будет создан для всех окружений (Production и Development)' : editing.mode === 'general' ? 'Общие настройки флага применяются ко всем окружениям' : 'Настройте таргетинг и раскатку для этого окружения'}
        footer={<>
          <button onClick={() => setPanelOpen(false)} className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={saving || (editing.mode === 'create' && (!formName || !formKey)) || (editing.mode === 'general' && !formName) || (editing.mode === 'environment' && !isEnvDirty)} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-40 rounded-xl shadow-lg shadow-violet-500/20 transition-all">{saving ? 'Сохранение...' : editing.mode === 'create' ? 'Создать флаг' : 'Сохранить изменения'}</button>
        </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700">{error}</div>}

          {(editing.mode === 'create' || editing.mode === 'general') && <div className="space-y-5">
            {editing.mode === 'create' && <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"><p className="text-xs text-indigo-700 dark:text-indigo-300">Флаг будет создан для <strong>всех окружений</strong> (Production и Development). Вы сможете настроить параметры раскатки отдельно для каждого окружения после создания.</p></div>}

            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Например: Новый чекаут" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:font-normal placeholder:text-neutral-400" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ключ (Key)</label><input type="text" value={formKey} onChange={e => setFormKey(e.target.value)} disabled={editing.mode !== 'create'} placeholder="new-checkout-flow" className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400 disabled:opacity-50 font-mono" /><p className="text-xs text-neutral-500">Используется в коде. Нельзя изменить после создания.</p></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Краткое описание флага..." rows={3} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; }} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400 resize-none overflow-hidden" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Тип флага</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFormType('RELEASE')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${formType === 'RELEASE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-sm' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-blue-300 dark:hover:border-blue-700'}`}>
                    <Rocket size={18} className={formType === 'RELEASE' ? 'text-blue-500' : 'text-neutral-400'} />Релиз
                  </button>
                  <button onClick={() => setFormType('KILLSWITCH')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${formType === 'KILLSWITCH' ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 shadow-sm' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-700'}`}>
                    <ShieldOff size={18} className={formType === 'KILLSWITCH' ? 'text-red-500' : 'text-neutral-400'} />Рубильник
                  </button>
                </div>
              </div>

            {(editing.mode === 'create' || editing.mode === 'general') && <div className="space-y-2"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Теги</label>
              {formTags.length > 0 && <div className="flex flex-wrap gap-2">{formTags.map((tv, i) => { const tg = tags.find(t => t.id === tv.tagId); if (!tg) return null; return (<div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}><span>{tv.value}</span><button onClick={() => setFormTags(formTags.filter((_, j) => j !== i))} className="hover:opacity-80"><X size={12} /></button></div>); })}</div>}
              {!addingTag ? <button onClick={() => setAddingTag(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg border border-dashed border-blue-300 dark:border-violet-500/30 transition-all"><Plus size={14} />Добавить тег</button>
              : <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-2"><label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Выберите тип тега</label>
                    <div className="grid grid-cols-2 gap-2">{tags.map(tg => (<button key={tg.id} onClick={() => setNewTagId(tg.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${newTagId === tg.id ? 'shadow-sm' : 'hover:shadow-sm border-neutral-200 dark:border-neutral-800'}`} style={newTagId === tg.id ? { borderColor: tg.color, borderWidth: '2px' } : {}}><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }} /><span className="text-neutral-700 dark:text-neutral-300">{tg.name}</span></button>))}</div>
                  </div>
                  {newTagId && <div className="flex gap-2 items-center pt-1"><input type="text" value={newTagVal} onChange={e => setNewTagVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTagVal.trim()) { const tg = tags.find(t => t.id === newTagId)!; setFormTags([...formTags, { tagId: tg.id, tagName: tg.name, tagColor: tg.color, value: newTagVal.trim() }]); setAddingTag(false); setNewTagId(null); setNewTagVal(''); } else if (e.key === 'Escape') { setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} placeholder="Введите значение тега" autoFocus className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-400" /><button onClick={() => { if (newTagVal.trim() && newTagId) { const tg = tags.find(t => t.id === newTagId)!; setFormTags([...formTags, { tagId: tg.id, tagName: tg.name, tagColor: tg.color, value: newTagVal.trim() }]); setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} disabled={!newTagVal.trim()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Добавить</button></div>}
                  <button onClick={() => { setAddingTag(false); setNewTagId(null); setNewTagVal(''); }} className="w-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Отмена</button>
                </div>}
            </div>}

            {editing.flag && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <User size={12} className="text-neutral-400" />
                  <span>Создал: <span className="font-medium text-neutral-700 dark:text-neutral-300">{editing.flag.createdBy ?? 'Неизвестно'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Clock size={12} className="text-neutral-400" />
                  <span>Создан: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDateTime(editing.flag.createdAt) ?? '—'}</span></span>
                </div>
                {editing.flag.archivedBy && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <Archive size={12} className="text-amber-500" />
                      <span>Архивировал: <span className="font-medium text-neutral-700 dark:text-neutral-300">{editing.flag.archivedBy}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <Clock size={12} className="text-amber-500" />
                      <span>Архивирован: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDateTime(editing.flag.archivedAt) ?? '—'}</span></span>
                    </div>
                  </>
                )}
              </div>
            )}

            {editing.flag && <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              {editing.flag.archived
                ? <button onClick={() => handleUnarchive(editing.flag!)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20"><ArchiveRestore size={16} />Разархивировать флаг</button>
                : <button onClick={() => { setArchiveTarget(editing.flag!); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20"><Archive size={16} />Архивировать флаг</button>
              }
              <button onClick={() => { setDeleteTarget(editing.flag!); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20"><Trash2 size={16} />Удалить флаг из всех окружений</button>
              </div>}
          </div>}

          {editing.mode === 'environment' && <div className="space-y-5">
            <div className="flex items-center justify-between"><div><h4 className="text-sm font-medium text-neutral-900 dark:text-white">Правило таргетинга</h4><p className="text-xs text-neutral-500 mt-0.5">Управляйте раскаткой для разных аудиторий</p></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-neutral-500">{envRuleEnabled ? 'Вкл' : 'Выкл'}</span>
                <Switch checked={envRuleEnabled} onCheckedChange={setEnvRuleEnabled} />
              </label>
            </div>

            <div className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-5">
              {/* Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2"><Percent size={14} className="text-indigo-600 dark:text-indigo-400" />Процент раскатки</label><span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{envRulePercent}%</span></div>
                <Slider.Root value={[envRulePercent]} onValueChange={([v]) => setEnvRulePercent(v)} max={100} step={1} className="relative flex items-center select-none touch-none w-full h-5"><Slider.Track className="bg-neutral-200 dark:bg-neutral-800 relative grow rounded-full h-2.5"><Slider.Range className="absolute bg-indigo-600 dark:bg-indigo-500 rounded-full h-full" /></Slider.Track><Slider.Thumb className="block w-6 h-6 bg-white border-2 border-violet-600 dark:border-violet-500 rounded-full shadow-lg hover:bg-violet-50 dark:hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2" /></Slider.Root>
                <p className="text-xs text-neutral-500">{envRulePercent === 100 ? 'Полная раскатка на всех пользователей' : envRulePercent === 0 ? 'Флаг отключен' : `${envRulePercent}% пользователей увидят эту функцию`}</p>
              </div>

              {/* Segments */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-3"><Users size={16} className="text-indigo-600 dark:text-indigo-400" /><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Целевые сегменты</label></div>
                <div className="grid grid-cols-1 gap-2">
                  {segments.map(seg => {
                    const checked = envRuleSegments.includes(seg.id);
                    const hasContext = (seg.context?.length ?? 0) > 0;
                    const segColor = seg.color || '#3b82f6';
                    return (
                    <div
                      key={seg.id}
                      onClick={() => setEnvRuleSegments(checked ? envRuleSegments.filter(id => id !== seg.id) : [...envRuleSegments, seg.id])}
                      className={`group cursor-pointer flex flex-col p-3.5 rounded-xl transition-all border ${
                        checked
                          ? 'shadow-sm'
                          : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
                      }`}
                      style={checked ? {
                        backgroundColor: segColor + '0D',
                        borderColor: segColor + '40',
                      } : undefined}
                    >
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5"
                          style={{ backgroundColor: segColor }}
                        >
                          <SegmentIcon name={seg.icon || 'Users'} size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{seg.name}</div>
                          {seg.description && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{seg.description}</div>
                          )}
                        </div>

                        <div className="shrink-0 mt-0.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 ${
                              checked ? '' : 'border-neutral-300 dark:border-neutral-600'
                            }`}
                            style={checked ? {
                              backgroundColor: segColor,
                              borderColor: segColor,
                            } : undefined}
                          >
                            {checked && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                      {checked && hasContext && (
                        <div className="mt-2.5 space-y-1">
                          {seg.context!.map((c, ci) => {
                            const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                            return (
                              <div key={ci} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border"
                                style={{
                                  backgroundColor: segColor + '0F',
                                  borderColor: segColor + '1A',
                                }}>
                                <span className="font-semibold shrink-0" style={{ color: segColor }}>{ctxDef?.name ?? `#${c.contextDefinitionId}`}</span>
                                <span className="text-[10px] uppercase font-mono tracking-wider opacity-60" style={{ color: segColor }}>{c.operator ?? 'in'}</span>
                                <code className="font-mono break-all min-w-0 opacity-90" style={{ color: segColor }}>{c.contextValues}</code>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ); })}
                </div>
                {envRuleSegments.length === 0 && <p className="text-xs text-neutral-500 mt-2 ml-1">Нет выбранных сегментов — правило применится ко всем пользователям</p>}
              </div>

              {/* Constraints */}
              <div>
                <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Settings size={16} className="text-indigo-600 dark:text-indigo-400" /><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Дополнительные условия</label><span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">настраиваемые</span></div><button onClick={() => addConstraint()} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />Добавить</button></div>
                <div className="space-y-2">
                  {envRuleConstraints.map((c, ci) => (
                    <div key={ci} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between"><span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Условие {ci + 1}</span><button onClick={() => removeConstraint(ci)} className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400"><X size={14} /></button></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Поле</label>
                          <Select value={String(c.contextDefId)} onValueChange={(v) => updateConstraint(ci, 'contextDefId', Number(v))}>
                              <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent>{contexts.map(ctx => <SelectItem key={ctx.id} value={String(ctx.id)}>{ctx.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Оператор</label>
                          <Select value={c.operator} onValueChange={(v) => updateConstraint(ci, 'operator', v)}>
                            <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eq">равно</SelectItem><SelectItem value="ne">не равно</SelectItem><SelectItem value="in">в списке</SelectItem><SelectItem value="not_in">не в списке</SelectItem><SelectItem value="gt">&gt;</SelectItem><SelectItem value="gte">≥</SelectItem><SelectItem value="lt">&lt;</SelectItem><SelectItem value="lte">≤</SelectItem><SelectItem value="contains">содержит</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Значение</label><input type="text" value={c.value} onChange={e => updateConstraint(ci, 'value', e.target.value)} placeholder="значение..." className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-2 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all" /></div>
                      </div>
                    </div>
                  ))}
                  {envRuleConstraints.length === 0 && <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center"><p className="text-xs text-neutral-500 dark:text-neutral-400">Нет дополнительных условий. Нажмите "Добавить" для настройки таргетинга по контексту.</p></div>}
                </div>
              </div>
            </div>

            {/* Targeting Summary */}
              {(() => {
                const hasSegments = envRuleSegments.length > 0;
                const hasConstraints = envRuleConstraints.length > 0;
                const selectedSegs = envRuleSegments.map(sid => segments.find(s => s.id === sid)).filter((s): s is SegmentResponse => !!s);

                interface SummaryLine { field: string; operator: string; values: string[]; source: string; }
                const lines: SummaryLine[] = [];

                for (const seg of selectedSegs) {
                  for (const c of (seg.context ?? [])) {
                    const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                    const field = ctxDef?.name ?? `Поле #${c.contextDefinitionId}`;
                    const vals = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
                    const existing = lines.find(l => l.field === field && l.operator === (c.operator ?? 'in'));
                    if (existing) {
                      for (const v of vals) { if (!existing.values.includes(v)) existing.values.push(v); }
                    } else {
                      lines.push({ field, operator: c.operator ?? 'in', values: vals, source: seg.name });
                    }
                  }
                }

                for (const c of envRuleConstraints) {
                  const ctxDef = contexts.find(cd => cd.id === c.contextDefId);
                  const field = ctxDef?.name ?? `Поле #${c.contextDefId}`;
                  const existing = lines.find(l => l.field === field && l.operator === c.operator);
                  if (existing) {
                    if (!existing.values.includes(c.value)) existing.values.push(c.value);
                    if (existing.source !== 'custom') existing.source = existing.source + ' + custom';
                  } else {
                    lines.push({ field, operator: c.operator, values: [c.value], source: 'custom' });
                  }
                }

                const hasSummary = envRulePercent !== 100 || hasSegments || hasConstraints;

                if (!hasSummary) return null;

                const operatorLabels: Record<string, string> = { eq: '=', ne: '≠', in: 'IN', not_in: 'NOT IN', gt: '>', gte: '≥', lt: '<', lte: '≤', contains: '≈' };

                return (
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={16} className="text-violet-600 dark:text-violet-400" />
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Итоговое выражение</label>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium">тактика</span>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/5 dark:to-indigo-500/5 rounded-xl border border-violet-200 dark:border-violet-500/20 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center">
                            <Percent size={16} className="text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-violet-700 dark:text-violet-300">{envRulePercent}%</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-1.5">от {hasSegments ? selectedSegs.map(s => s.name).join(', ') : 'всех пользователей'}</span>
                          </div>
                        </div>

                        {lines.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                              <Filter size={10} />
                              условия (AND)
                            </div>
                            <div className="space-y-1.5">
                              {lines.map((line, li) => (
                                <div key={li} className="flex items-center gap-2 text-xs bg-white/70 dark:bg-neutral-900/50 rounded-lg px-3 py-2 border border-violet-100 dark:border-violet-500/10">
                                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">{line.field}</span>
                                  <span className="font-mono text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded shrink-0">{operatorLabels[line.operator] ?? line.operator}</span>
                                  <code className="font-mono text-neutral-700 dark:text-neutral-300 break-all min-w-0">
                                    {line.values.length === 1 ? line.values[0] : `[${line.values.join(', ')}]`}
                                  </code>
                                  <span className="text-[10px] text-neutral-400 shrink-0 ml-auto" title={line.source}>← {line.source}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(hasSegments || hasConstraints) && lines.length === 0 && (
                          <div className="flex items-center gap-2 text-xs text-neutral-400 italic">
                            <Filter size={12} />
                            Нет активных условий (сегменты без правил)
                          </div>
                        )}

                        {!hasSegments && !hasConstraints && envRulePercent !== 100 && (
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Filter size={12} />
                            Без дополнительных условий — раскатка применяется глобально
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Info box */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg"><div className="flex gap-3"><div className="shrink-0 mt-0.5"><div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"><Settings size={12} className="text-white" /></div></div><div><h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Как работает таргетинг?</h5><p className="text-xs text-indigo-700 dark:text-indigo-300">Процент раскатки работает внутри выбранных сегментов и условий. Например, 50% для сегмента "Premium" покажет флаг половине premium-пользователей.</p></div></div></div>
          </div>}
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Удалить флаг из всех окружений?"
        description={`Флаг «${deleteTarget?.name ?? ''}» будет удалён без возможности восстановления. Это действие затронет все окружения.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleting}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}
        title="Архивировать флаг?"
        description={`Флаг «${archiveTarget?.name ?? ''}» будет помещён в архив. Он перестанет отображаться в списке по умолчанию и будет скрыт из SDK-ответов. Его можно будет разархивировать позже.`}
        confirmLabel="Архивировать"
        onConfirm={handleArchive}
        loading={archiving}
      />
    </div>
  );
}