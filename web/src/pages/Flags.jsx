import { useState, useEffect } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { Plus, Tag, Trash2, Percent, Users, Settings, X } from 'lucide-react';
import { SidePanel } from '../components/SidePanel';
import { getProjects, getEnvironments, getContexts, getTags, getSegments, getFlags, createFlag, updateFlag, deleteFlag, upsertStrategy } from '../api';

const FLAG_TYPES = [
  { value: 'RELEASE', label: 'Релиз' },
  { value: 'KILLSWITCH', label: 'Рубильник' },
];

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function getTypeColor(type) {
  switch (type) {
    case 'RELEASE': return 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10';
    case 'KILLSWITCH': return 'bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10';
    default: return 'bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent border-gray-200 dark:border-gray-500/20 bg-gray-50 dark:bg-gray-500/10';
  }
}

function getTypeLabel(type) {
  const found = FLAG_TYPES.find(t => t.value === type);
  return found ? found.label : type;
}

const ENV_COLORS = [
  'bg-emerald-500',
  'bg-yellow-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

export function Flags() {
  const [flagKeys, setFlagKeys] = useState([]);
  const [flagsByEnv, setFlagsByEnv] = useState({});
  const [environments, setEnvironments] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [segments, setSegments] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [editMode, setEditMode] = useState('create');
  const [editingEnvId, setEditingEnvId] = useState(null);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagTypeId, setNewTagTypeId] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const [selectedTagTypeFilter, setSelectedTagTypeFilter] = useState(null);
  const [selectedTagValueFilter, setSelectedTagValueFilter] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    flagType: 'RELEASE',
    enabled: false,
    tags: [],
    rolloutRules: [{ id: 'new-1', percentage: 100, segmentIds: [], contextConstraints: [] }],
    defaultValue: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const projects = await getProjects();
      if (projects && projects.length > 0) {
        const pid = projects[0].id;
        setProjectId(pid);
        const [env, tagsData, seg, ctx] = await Promise.all([
          getEnvironments(pid),
          getTags(pid),
          getSegments(pid),
          getContexts(pid)
        ]);
        setEnvironments(env || []);
        setAllTags(tagsData || []);
        setSegments(seg || []);
        setContexts(ctx || []);

        if (env && env.length > 0) {
          const envFlagsResults = await Promise.all(
            env.map(e => getFlags(pid, e.id))
          );
          const byEnv = {};
          const keySet = new Map();
          env.forEach((e, i) => {
            byEnv[e.id] = envFlagsResults[i] || [];
            (envFlagsResults[i] || []).forEach(f => {
              if (!keySet.has(f.key)) {
                keySet.set(f.key, {
                  id: f.id,
                  name: f.name,
                  key: f.key,
                  description: f.description,
                  flagType: f.flagType,
                  createdAt: f.createdAt,
                  tags: f.tags
                });
              }
            });
          });
          setFlagsByEnv(byEnv);
          setFlagKeys(Array.from(keySet.values()));
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const refreshFlags = async () => {
    if (!projectId || environments.length === 0) return;
    const envFlagsResults = await Promise.all(
      environments.map(e => getFlags(projectId, e.id))
    );
    const byEnv = {};
    const keySet = new Map();
    environments.forEach((e, i) => {
      byEnv[e.id] = envFlagsResults[i] || [];
      (envFlagsResults[i] || []).forEach(f => {
        if (!keySet.has(f.key)) {
          keySet.set(f.key, {
            id: f.id,
            name: f.name,
            key: f.key,
            description: f.description,
            flagType: f.flagType,
            createdAt: f.createdAt,
            tags: f.tags
          });
        }
      });
    });
    setFlagsByEnv(byEnv);
    setFlagKeys(Array.from(keySet.values()));
  };

  const getFlagForEnv = (flagKey, envId) => {
    const envFlags = flagsByEnv[envId] || [];
    return envFlags.find(f => f.key === flagKey) || null;
  };

  const getFlagPercentage = (flagKey, envId) => {
    const flag = getFlagForEnv(flagKey, envId);
    return flag ? (flag.rolloutPercentage || flag.percentage || 100) : null;
  };

  const handleOpenCreate = () => {
    setEditingFlag(null);
    setEditMode('create');
    setEditingEnvId(null);
    setIsAddingTag(false);
    setNewTagTypeId('');
    setNewTagValue('');
    setFormData({
      name: '',
      key: '',
      description: '',
      flagType: 'RELEASE',
      enabled: false,
      tags: [],
      rolloutRules: [{ id: 'new-1', percentage: 100, segmentIds: [], contextConstraints: [] }],
      defaultValue: false
    });
    setIsPanelOpen(true);
  };

  const handleOpenGeneralEdit = (flagKeyInfo) => {
    setEditingFlag(flagKeyInfo);
    setEditMode('general');
    setEditingEnvId(null);
    setFormData({
      name: flagKeyInfo.name,
      key: flagKeyInfo.key,
      description: flagKeyInfo.description || '',
      flagType: flagKeyInfo.flagType || 'RELEASE',
      enabled: false,
      tags: flagKeyInfo.tags || [],
      rolloutRules: [],
      defaultValue: false
    });
    setIsPanelOpen(true);
  };

  const handleOpenEnvironmentEdit = (flagKey, envId) => {
    const flag = getFlagForEnv(flagKey, envId);
    if (!flag) return;
    setEditingFlag(flag);
    setEditMode('environment');
    setEditingEnvId(envId);
    setFormData({
      name: flag.name,
      key: flag.key,
      description: flag.description || '',
      flagType: flag.flagType || 'RELEASE',
      enabled: flag.enabled,
      tags: flag.tags || [],
      strategyType: flag.strategyType || 'SERVER',
      percentage: flag.percentage || 100,
      rolloutPercentage: flag.rolloutPercentage || null,
      segmentId: flag.segmentId || null,
      contextDefinitionId: flag.contextDefinitionId || null,
      contextValuesJson: flag.contextValuesJson || null,
      rolloutRules: [{ id: 'env-1', percentage: flag.rolloutPercentage || flag.percentage || 100, segmentIds: flag.segmentId ? [String(flag.segmentId)] : [], contextConstraints: (() => {
        if (!flag.contextDefinitionId || !flag.contextValuesJson) return [];
        const ctxDef = contexts.find(c => c.id === flag.contextDefinitionId);
        const ctxName = ctxDef ? ctxDef.name : '';
        let values;
        try { values = JSON.parse(flag.contextValuesJson); } catch { values = [flag.contextValuesJson]; }
        const value = Array.isArray(values) && values.length > 0 ? values[0] : (values || '');
        return [{ contextKey: ctxName, operator: 'eq', value: value?.toString() || '' }];
      })() }],
      defaultValue: flag.enabled
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот флаг из всех окружений?')) return;
    try {
      await deleteFlag(projectId, id);
      await refreshFlags();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editMode === 'create') {
        const created = await createFlag(projectId, {
          name: formData.name,
          key: formData.key,
          description: formData.description,
          flagType: formData.flagType,
          enabled: formData.enabled,
          tags: (formData.tags || []).map(t => ({ tagId: parseInt(t.tagId) || t.tagId, value: t.value })),
          projectId
        });
        await refreshFlags();
      } else if (editMode === 'general') {
        await updateFlag(projectId, editingFlag.id, {
          name: formData.name,
          key: formData.key,
          description: formData.description,
          flagType: formData.flagType,
          enabled: editingFlag.enabled,
          tags: (formData.tags || []).map(t => ({ tagId: parseInt(t.tagId) || t.tagId, value: t.value })),
          projectId
        });
        await refreshFlags();
      } else if (editMode === 'environment') {
        if (editingEnvId) {
          const rule = formData.rolloutRules?.[0] || {};
          const constraints = (rule.contextConstraints || []).filter(c => c.value && c.value.toString().trim() !== '' && c.contextKey);
          let contextDefinitionId = null;
          let contextValuesJson = null;
          if (constraints.length > 0) {
            const ctxDef = contexts.find(c => c.name === constraints[0].contextKey);
            if (ctxDef) {
              contextDefinitionId = ctxDef.id;
              contextValuesJson = JSON.stringify(constraints.map(c => c.value.toString().trim()));
            }
          }
          await upsertStrategy(editingFlag.id, {
            flagId: editingFlag.id,
            environmentId: editingEnvId,
            type: 'TARGETING',
            enabled: formData.enabled,
            percentage: rule.percentage || 100,
            segmentId: rule.segmentIds?.length > 0 ? parseInt(rule.segmentIds[0]) : null,
            contextDefinitionId,
            contextValuesJson,
            rolloutPercentage: rule.percentage || 100
          });
        }
        await refreshFlags();
      }
      setIsPanelOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleFlagForEnv = async (flagKey, envId) => {
    const flag = getFlagForEnv(flagKey, envId);
    if (!flag) return;
    try {
      await upsertStrategy(flag.id, {
        flagId: flag.id,
        environmentId: envId,
        type: 'SERVER',
        enabled: !flag.enabled,
        percentage: 100
      });
      await refreshFlags();
    } catch (e) {
      alert(e.message);
    }
  };

  const updateRolloutPercentage = (ruleId, percentage) => {
    const updatedRules = (formData.rolloutRules || []).map(rule =>
      rule.id === ruleId ? { ...rule, percentage } : rule
    );
    setFormData({ ...formData, rolloutRules: updatedRules });
  };

  const addRolloutRule = () => {
    const newRule = { id: `rule-${Date.now()}`, percentage: 0, segmentIds: [], contextConstraints: [] };
    setFormData({ ...formData, rolloutRules: [...(formData.rolloutRules || []), newRule] });
  };

  const removeRolloutRule = (ruleId) => {
    setFormData({ ...formData, rolloutRules: (formData.rolloutRules || []).filter(r => r.id !== ruleId) });
  };

  const updateRuleSegments = (ruleId, segmentIds) => {
    const updatedRules = (formData.rolloutRules || []).map(rule =>
      rule.id === ruleId ? { ...rule, segmentIds } : rule
    );
    setFormData({ ...formData, rolloutRules: updatedRules });
  };

  const addConstraintToRule = (ruleId) => {
    if (!contexts || contexts.length === 0) return;
    const updatedRules = (formData.rolloutRules || []).map(rule => {
      if (rule.id === ruleId) {
        const newConstraint = { contextKey: contexts[0].name, operator: 'eq', value: '' };
        return { ...rule, contextConstraints: [...(rule.contextConstraints || []), newConstraint] };
      }
      return rule;
    });
    setFormData({ ...formData, rolloutRules: updatedRules });
  };

  const updateConstraint = (ruleId, constraintIndex, field, value) => {
    const updatedRules = (formData.rolloutRules || []).map(rule => {
      if (rule.id === ruleId) {
        const updatedConstraints = (rule.contextConstraints || []).map((c, idx) =>
          idx === constraintIndex ? { ...c, [field]: value } : c
        );
        return { ...rule, contextConstraints: updatedConstraints };
      }
      return rule;
    });
    setFormData({ ...formData, rolloutRules: updatedRules });
  };

  const removeConstraint = (ruleId, constraintIndex) => {
    const updatedRules = (formData.rolloutRules || []).map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, contextConstraints: (rule.contextConstraints || []).filter((_, i) => i !== constraintIndex) };
      }
      return rule;
    });
    setFormData({ ...formData, rolloutRules: updatedRules });
  };

  if (loading) return <div className="text-center py-12 text-neutral-500">Загрузка...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка: {error}</div>;

  let filteredFlagKeys = [...flagKeys];

  if (selectedTagTypeFilter || selectedTagValueFilter) {
    filteredFlagKeys = filteredFlagKeys.filter(fk => {
      if (!fk.tags || fk.tags.length === 0) return false;
      return fk.tags.some(tag => {
        const typeMatch = !selectedTagTypeFilter || tag.tagId === parseInt(selectedTagTypeFilter) || tag.tagId === selectedTagTypeFilter;
        const valueMatch = !selectedTagValueFilter || tag.value === selectedTagValueFilter;
        return typeMatch && valueMatch;
      });
    });
  }

  const getUniqueTagValues = (typeId) => {
    const values = new Set();
    flagKeys.forEach(fk => {
      fk.tags?.forEach(tag => {
        if (tag.tagId === parseInt(typeId) || tag.tagId === typeId) {
          values.add(tag.value);
        }
      });
    });
    return Array.from(values).sort();
  };

  const OPERATORS = [
    { value: 'eq', label: 'равно' },
    { value: 'ne', label: 'не равно' },
    { value: 'in', label: 'в списке' },
    { value: 'not_in', label: 'не в списке' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '\u2265' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '\u2264' },
    { value: 'contains', label: 'содержит' },
  ];

  const editingEnv = environments.find(e => e.id === editingEnvId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Feature Flags</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Управляйте доступностью функций во всех окружениях</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Создать флаг
        </button>
      </div>

      {allTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Тип тега:</span>
            <button
              onClick={() => { setSelectedTagTypeFilter(null); setSelectedTagValueFilter(null); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                !selectedTagTypeFilter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Все
            </button>
            {allTags.map(tagType => (
              <button
                key={tagType.id}
                onClick={() => {
                  setSelectedTagTypeFilter(selectedTagTypeFilter === String(tagType.id) ? null : String(tagType.id));
                  setSelectedTagValueFilter(null);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm ${
                  selectedTagTypeFilter === String(tagType.id)
                    ? 'text-white'
                    : 'text-white opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundImage: selectedTagTypeFilter === String(tagType.id)
                    ? `linear-gradient(to right, ${tagType.color || '#3b82f6'}, ${adjustColor(tagType.color || '#3b82f6', 20)})`
                    : `linear-gradient(to right, ${tagType.color || '#3b82f6'}cc, ${adjustColor(tagType.color || '#3b82f6', 20)}cc)`
                }}
              >
                {tagType.name}
              </button>
            ))}
          </div>

          {selectedTagTypeFilter && (
            <div className="flex items-center gap-2 flex-wrap pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Значение:</span>
              <button
                onClick={() => setSelectedTagValueFilter(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  !selectedTagValueFilter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Все
              </button>
              {getUniqueTagValues(selectedTagTypeFilter).map(value => {
                const tagType = allTags.find(t => String(t.id) === selectedTagTypeFilter);
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedTagValueFilter(selectedTagValueFilter === value ? null : value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-white ${
                      selectedTagValueFilter === value ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: tagType?.color || '#3b82f6' }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="px-6 py-4 font-medium">Название & Ключ</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                {environments.map((env, idx) => (
                  <th key={env.id} className="px-6 py-4 font-medium text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ENV_COLORS[idx % ENV_COLORS.length]}`}></span>
                      {env.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredFlagKeys.length > 0 ? filteredFlagKeys.map((flagKeyInfo) => (
                <tr key={flagKeyInfo.key} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col cursor-pointer" onClick={() => handleOpenGeneralEdit(flagKeyInfo)}>
                      <span className="font-medium text-neutral-900 dark:text-neutral-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-violet-600 hover:bg-clip-text hover:text-transparent transition-all">{flagKeyInfo.name}</span>
                      <span className="text-xs font-mono text-neutral-500 mt-0.5">{flagKeyInfo.key}</span>
                      {flagKeyInfo.tags && flagKeyInfo.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {flagKeyInfo.tags.map((tag, index) => {
                            const tagType = allTags.find(t => t.id === tag.tagId);
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm"
                                style={{
                                  backgroundImage: `linear-gradient(to right, ${tagType?.color || '#3b82f6'}, ${adjustColor(tagType?.color || '#3b82f6', 20)})`
                                }}
                              >
                                {tagType?.name ? `${tagType.name}: ` : ''}{tag.value}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeColor(flagKeyInfo.flagType)}`}>
                      <Tag size={12} />
                      {getTypeLabel(flagKeyInfo.flagType)}
                    </span>
                  </td>
                  {environments.map((env) => {
                    const envFlag = getFlagForEnv(flagKeyInfo.key, env.id);
                    const pct = getFlagPercentage(flagKeyInfo.key, env.id);
                    return (
                      <td key={env.id} className="px-6 py-4">
                        {envFlag ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-2">
                              <Switch.Root
                                checked={envFlag.enabled}
                                onCheckedChange={() => toggleFlagForEnv(flagKeyInfo.key, env.id)}
                                className={`w-[42px] h-[24px] rounded-full relative outline-none cursor-pointer transition-colors ${
                                  envFlag.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                                }`}
                              >
                                <Switch.Thumb
                                  className={`block w-[20px] h-[20px] bg-white rounded-full transition-transform translate-x-[2px] will-change-transform ${
                                    envFlag.enabled ? 'translate-x-[20px]' : ''
                                  } shadow-sm`}
                                />
                              </Switch.Root>
                              <div className="flex items-center gap-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 min-w-[42px] justify-center">
                                <Percent size={10} />
                                <span>{pct}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenEnvironmentEdit(flagKeyInfo.key, env.id)}
                              className="text-xs bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-violet-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Настроить
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={2 + environments.length} className="px-6 py-12 text-center text-neutral-500">
                    Нет флагов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={
          editMode === 'create' ? "Новый флаг" :
          editMode === 'general' ? "Настройки флага" :
          `Таргетинг для ${editingEnv?.name || 'окружения'}`
        }
        description={
          editMode === 'create' ? "Флаг будет создан для всех окружений (Production и Development)" :
          editMode === 'general' ? "Общие настройки флага применяются ко всем окружениям" :
          "Настройте таргетинг и раскатку для этого окружения"
        }
        footer={
          <>
            <button onClick={() => setIsPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.key}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              {editMode === 'create' ? "Создать флаг" : "Сохранить изменения"}
            </button>
          </>
        }
      >
        {(editMode === 'create' || editMode === 'general') && (
          <div className="space-y-5">
            {editMode === 'create' && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Флаг будет создан для <strong>всех окружений</strong> (Production и Development). Вы сможете настроить параметры раскатки отдельно для каждого окружения после создания.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value, key: editMode === 'create' ? e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : formData.key})}
                placeholder="Например: Новый чекаут"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ключ (Key)</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                disabled={!!editingFlag}
                placeholder="new-checkout-flow"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-mono text-sm"
              />
              <p className="text-xs text-neutral-500">Используется в коде. Нельзя изменить после создания.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Краткое описание флага..."
                rows={3}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Тип флага</label>
              <select
                value={formData.flagType}
                onChange={(e) => setFormData({...formData, flagType: e.target.value})}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                {FLAG_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Теги</label>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => {
                    const tagType = allTags.find(t => t.id === tag.tagId || t.id === parseInt(tag.tagId));
                    return (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-white bg-gradient-to-r shadow-sm"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${tagType?.color || '#3b82f6'}, ${adjustColor(tagType?.color || '#3b82f6', 20)})`
                        }}
                      >
                        <span>{tagType?.name ? `${tagType.name}: ` : ''}{tag.value}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags.filter((_, i) => i !== index);
                            setFormData({...formData, tags: newTags});
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isAddingTag ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-violet-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all border border-dashed border-blue-300 dark:border-violet-500/30"
                >
                  <Plus size={14} />
                  Добавить тег
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Выберите тип тега</label>
                    <div className="grid grid-cols-2 gap-2">
                      {allTags.map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setNewTagTypeId(String(type.id))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                            newTagTypeId === String(type.id)
                              ? 'bg-white dark:bg-neutral-950 shadow-sm'
                              : 'bg-white dark:bg-neutral-950 hover:shadow-sm border-neutral-200 dark:border-neutral-800'
                          }`}
                          style={newTagTypeId === String(type.id) ? { borderColor: type.color || '#3b82f6', borderWidth: '2px' } : {}}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${type.color || '#3b82f6'}, ${adjustColor(type.color || '#3b82f6', 20)})`
                            }}
                          />
                          <span className="text-neutral-700 dark:text-neutral-300">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {newTagTypeId && (
                    <div className="flex gap-2 items-center pt-1">
                      <input
                        type="text"
                        value={newTagValue}
                        onChange={(e) => setNewTagValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTagValue.trim()) {
                            setFormData({...formData, tags: [...(formData.tags || []), { tagId: parseInt(newTagTypeId) || newTagTypeId, value: newTagValue.trim() }]});
                            setNewTagTypeId('');
                            setNewTagValue('');
                            setIsAddingTag(false);
                          } else if (e.key === 'Escape') {
                            setIsAddingTag(false);
                            setNewTagTypeId('');
                            setNewTagValue('');
                          }
                        }}
                        placeholder="Введите значение тега"
                        autoFocus
                        className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTagValue.trim()) {
                            setFormData({...formData, tags: [...(formData.tags || []), { tagId: parseInt(newTagTypeId) || newTagTypeId, value: newTagValue.trim() }]});
                            setNewTagTypeId('');
                            setNewTagValue('');
                            setIsAddingTag(false);
                          }
                        }}
                        disabled={!newTagValue.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        Добавить
                      </button>
                    </div>
                  )}

                  <button type="button" onClick={() => { setIsAddingTag(false); setNewTagTypeId(''); setNewTagValue(''); }}
                    className="w-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {editMode === 'general' && editingFlag && (
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => { handleDelete(editingFlag.id); setIsPanelOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Удалить флаг из всех окружений
                </button>
              </div>
            )}
          </div>
        )}

        {editMode === 'environment' && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Правила таргетинга</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Управляйте раскаткой для разных аудиторий</p>
                </div>
                <button
                  onClick={addRolloutRule}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Добавить правило
                </button>
              </div>

              {(formData.rolloutRules || []).map((rule, ruleIndex) => (
                <div key={rule.id} className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Правило {ruleIndex + 1}</span>
                    {(formData.rolloutRules?.length || 0) > 1 && (
                      <button onClick={() => removeRolloutRule(rule.id)} className="text-red-600 dark:text-red-400 hover:text-red-500 p-1">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                        <Percent size={14} className="text-indigo-600 dark:text-indigo-400" />
                        Процент раскатки
                      </label>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{rule.percentage}%</span>
                    </div>
                    <Slider.Root
                      value={[rule.percentage]}
                      onValueChange={([value]) => updateRolloutPercentage(rule.id, value)}
                      max={100}
                      step={1}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-neutral-200 dark:bg-neutral-800 relative grow rounded-full h-2.5">
                        <Slider.Range className="absolute bg-indigo-600 dark:bg-indigo-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-violet-600 dark:border-violet-500 rounded-full shadow-lg hover:bg-violet-50 dark:hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2" />
                    </Slider.Root>
                    <p className="text-xs text-neutral-500">
                      {rule.percentage === 100 ? 'Полная раскатка на всех пользователей' : rule.percentage === 0 ? 'Флаг отключен' : `${rule.percentage}% пользователей увидят эту функцию`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Целевые сегменты</label>
                      </div>
                      <div className="grid grid-cols-1 gap-2 p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {segments.length > 0 ? segments.map(segment => {
                          const isSelected = rule.segmentIds?.includes(String(segment.id));
                          return (
                            <label key={segment.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors group">
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={(e) => {
                                  const currentSegments = rule.segmentIds || [];
                                  const newSegments = e.target.checked
                                    ? [...currentSegments, String(segment.id)]
                                    : currentSegments.filter(id => id !== String(segment.id));
                                  updateRuleSegments(rule.id, newSegments);
                                }}
                                className="w-4 h-4 text-indigo-600 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                                {segment.name}
                              </span>
                            </label>
                          );
                        }) : (
                          <p className="text-xs text-neutral-500 p-2">Нет доступных сегментов</p>
                        )}
                      </div>
                      {(!rule.segmentIds || rule.segmentIds.length === 0) && (
                        <p className="text-xs text-neutral-500 mt-2 ml-1">Нет выбранных сегментов - правило применится ко всем пользователям</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Дополнительные условия из контекста</label>
                        </div>
                        <button
                          onClick={() => addConstraintToRule(rule.id)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"
                        >
                          <Plus size={12} />
                          Добавить
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(rule.contextConstraints || []).map((constraint, constraintIndex) => (
                          <div key={constraintIndex} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Условие {constraintIndex + 1}</span>
                              <button
                                onClick={() => removeConstraint(rule.id, constraintIndex)}
                                className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Поле</label>
                                <select
                                  value={constraint.contextKey}
                                  onChange={(e) => updateConstraint(rule.id, constraintIndex, 'contextKey', e.target.value)}
                                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  {contexts.map(ctx => (
                                    <option key={ctx.id} value={ctx.name}>{ctx.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Оператор</label>
                                <select
                                  value={constraint.operator}
                                  onChange={(e) => updateConstraint(rule.id, constraintIndex, 'operator', e.target.value)}
                                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  {OPERATORS.map(op => (
                                    <option key={op.value} value={op.value}>{op.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Значение</label>
                                <input
                                  type="text"
                                  value={constraint.value?.toString() || ''}
                                  onChange={(e) => updateConstraint(rule.id, constraintIndex, 'value', e.target.value)}
                                  placeholder="значение..."
                                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!rule.contextConstraints || rule.contextConstraints.length === 0) && (
                          <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Нет дополнительных условий. Нажмите "Добавить" для настройки таргетинга по контексту.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                      <Settings size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Как работает таргетинг?</h5>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Процент раскатки работает внутри выбранных сегментов и условий. Например, 50% для сегмента "Premium" покажет флаг половине premium-пользователей.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <Settings size={14} className="text-neutral-500" />
                  Значение по умолчанию
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  Возвращается, если пользователь не попадает ни под одно правило
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      checked={formData.defaultValue === true}
                      onChange={() => setFormData({...formData, defaultValue: true, enabled: true})}
                      className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Включено</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      checked={formData.defaultValue === false}
                      onChange={() => setFormData({...formData, defaultValue: false, enabled: false})}
                      className="w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Выключено</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}