import { useState, useRef, useMemo } from 'react';
import { useT } from '@/i18n';
import { Plus, Webhook, Globe, Trash2, Code2, FileText, X, Info, Bell, Clipboard, Check, Copy, ChevronDown, AlertTriangle } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, Integration } from "@/api";
import { SidePanel } from "@/app/components/SidePanel";
import { TipCard } from "@/app/components/TipCard";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { SectionHeader, EmptyState, FormField, GradientButton } from "@/shared";
import { Switch } from "@/app/components/ui/switch";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useProjectQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EVENT_CATEGORIES: { label: string; events: { key: string; title: string; desc: string }[] }[] = [
  {
    label: 'Флаги',
    events: [
      { key: 'flag.created', title: 'Создание флага', desc: 'Новый флаг добавлен' },
      { key: 'flag.updated', title: 'Изменение флага', desc: 'Обновление настроек' },
      { key: 'flag.deleted', title: 'Удаление флага', desc: 'Флаг удалён' },
      { key: 'flag.archived', title: 'Архивирование', desc: 'Флаг перемещён в архив' },
      { key: 'flag.unarchived', title: 'Разархивирование', desc: 'Флаг восстановлен из архива' },
    ],
  },
  {
    label: 'Активация в средах',
    events: [
      { key: 'strategy.created', title: 'Активация флага', desc: 'Флаг включён в среде' },
      { key: 'strategy.updated', title: 'Изменение стратегии', desc: 'Правила активации изменены' },
    ],
  },
  {
    label: 'Окружения',
    events: [
      { key: 'environment.created', title: 'Создание окружения', desc: 'Добавлено новое окружение' },
      { key: 'environment.updated', title: 'Изменение окружения', desc: 'Окружение переименовано' },
      { key: 'environment.deleted', title: 'Удаление окружения', desc: 'Окружение удалено' },
    ],
  },
  {
    label: 'Проекты',
    events: [
      { key: 'project.created', title: 'Создание проекта', desc: 'Новый проект добавлен' },
      { key: 'project.updated', title: 'Изменение проекта', desc: 'Настройки проекта обновлены' },
      { key: 'project.deleted', title: 'Удаление проекта', desc: 'Проект удалён' },
      { key: 'project.logo_updated', title: 'Логотип обновлён', desc: 'Загружен новый логотип' },
    ],
  },
  {
    label: 'Пользователи',
    events: [
      { key: 'user.created', title: 'Приглашение', desc: 'Новый пользователь добавлен' },
      { key: 'user.updated', title: 'Изменение роли', desc: 'Роль или статус изменены' },
      { key: 'user.deleted', title: 'Удаление', desc: 'Пользователь удалён' },
    ],
  },
  {
    label: 'Сегменты',
    events: [
      { key: 'segment.created', title: 'Создание сегмента', desc: 'Новый сегмент добавлен' },
      { key: 'segment.updated', title: 'Изменение сегмента', desc: 'Сегмент обновлён' },
      { key: 'segment.deleted', title: 'Удаление сегмента', desc: 'Сегмент удалён' },
    ],
  },
  {
    label: 'Теги',
    events: [
      { key: 'tag.created', title: 'Создание тега', desc: 'Новый тег добавлен' },
      { key: 'tag.updated', title: 'Изменение тега', desc: 'Тег обновлён' },
      { key: 'tag.deleted', title: 'Удаление тега', desc: 'Тег удалён' },
    ],
  },
  {
    label: 'API ключи',
    events: [
      { key: 'apikey.created', title: 'Создание ключа', desc: 'Новый API ключ выпущен' },
      { key: 'apikey.updated', title: 'Изменение ключа', desc: 'API ключ обновлён' },
      { key: 'apikey.deleted', title: 'Удаление ключа', desc: 'API ключ удалён' },
    ],
  },
  {
    label: 'Контексты',
    events: [
      { key: 'context_definition.created', title: 'Создание определения', desc: 'Новый тип контекста' },
      { key: 'context_definition.updated', title: 'Изменение определения', desc: 'Тип контекста обновлён' },
      { key: 'context_definition.deleted', title: 'Удаление определения', desc: 'Тип контекста удалён' },
      { key: 'context_value.created', title: 'Добавление значения', desc: 'Новое значение контекста' },
      { key: 'context_value.updated', title: 'Изменение значения', desc: 'Значение контекста обновлено' },
      { key: 'context_value.deleted', title: 'Удаление значения', desc: 'Значение контекста удалено' },
    ],
  },
];

const ALL_EVENTS = EVENT_CATEGORIES.flatMap(c => c.events.map(e => e.key));

const OLD_EVENT_KEY_MAP: Record<string, string> = {
  flagCreated: 'flag.created',
  flagUpdated: 'flag.updated',
  flagDeleted: 'flag.deleted',
  userInvited: 'user.created',
};

function migrateEventKeys(events: string[]): string[] {
  return events.map(k => OLD_EVENT_KEY_MAP[k] || k).filter(k => ALL_EVENTS.includes(k));
}

interface HeaderRow { id: number; key: string; value: string; }

const TEMPLATE_VARS = [
  { key: 'events.action', label: 'Тип события' },
  { key: 'events.resourceType', label: 'Тип ресурса' },
  { key: 'events.resourceId', label: 'ID ресурса' },
  { key: 'events.resourceName', label: 'Имя ресурса' },
  { key: 'events.details', label: 'Детали' },
  { key: 'events.projectId', label: 'ID проекта' },
  { key: 'events.user.id', label: 'ID пользователя' },
  { key: 'events.user.name', label: 'Имя пользователя' },
  { key: 'events.user.email', label: 'Email' },
  { key: 'events.timestamp', label: 'Время (ISO 8601)' },
];

let headerIdCounter = 0;

function parseWebhookConfig(integration: Integration): { url: string; headers: Record<string, string>; body: string } {
  try {
    const cfg = JSON.parse(integration.configJson || '{}');
    return {
      url: cfg.url || '',
      headers: cfg.headers || {},
      body: cfg.body || '',
    };
  } catch {
    return { url: '', headers: {}, body: '' };
  }
}

function parseEvents(integration: Integration): string[] {
  try {
    return JSON.parse(integration.eventSubscriptionsJson || '[]');
  } catch {
    return [];
  }
}

function buildHeadersMap(headers: HeaderRow[]): Record<string, string> {
  const h: Record<string, string> = {};
  for (const r of headers) {
    if (r.key.trim()) h[r.key.trim()] = r.value;
  }
  return h;
}

export function Integrations() {
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['integrations', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const all = await api.integrations.list();
      return all.filter(i => i.type === 'custom_webhook');
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const { data: limitData } = useQuery({
    queryKey: ['integrations', 'webhookLimit', projectId],
    queryFn: () => api.integrations.webhookLimit(),
    enabled: !!projectId,
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const limitRemaining = limitData?.remaining ?? Number.MAX_SAFE_INTEGER;

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formHeaders, setFormHeaders] = useState<HeaderRow[]>([]);
  const [formBody, setFormBody] = useState('');
  const [formEnabled, setFormEnabled] = useState(false);
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [showTemplateHelp, setShowTemplateHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(EVENT_CATEGORIES.map(c => c.label)));

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initialRef = useRef<{ name: string; url: string; headers: Record<string, string>; body: string; enabled: boolean; events: string[] } | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('No project');
      const hdrs = buildHeadersMap(formHeaders);
      const configJson = JSON.stringify({ url: formUrl, headers: hdrs, body: formBody });
      const body = {
        type: 'custom_webhook',
        name: formName || 'Webhook',
        enabled: formEnabled,
        configJson,
        eventSubscriptionsJson: JSON.stringify(formEvents),
      };
      if (editing) {
        return api.integrations.update(editing.id, body);
      } else {
        return api.integrations.create(body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', projectId] });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : t('integrations.errors.connect'));
    },
    onSettled: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.integrations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', projectId] });
      setDeleteId(null);
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : t('integrations.errors.disconnect'));
    },
    onSettled: () => setDeleting(false),
  });

  const t = useT();

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormUrl('');
    setFormHeaders([{ id: ++headerIdCounter, key: 'Content-Type', value: 'application/json' }]);
    setFormBody('');
    setFormEnabled(false);
    setFormEvents([]);
    setShowTemplateHelp(false);
    setCopied(false);
    setExpandedCats(new Set(EVENT_CATEGORIES.map(c => c.label)));
    setError('');
    initialRef.current = { name: '', url: '', headers: { 'Content-Type': 'application/json' }, body: '', enabled: false, events: [] };
    setPanelOpen(true);
  };

  const openEdit = (item: Integration) => {
    const cfg = parseWebhookConfig(item);
    const evts = parseEvents(item);
    setEditing(item);
    setFormName(item.name);
    setFormUrl(cfg.url);
    const hdrArr = Object.entries(cfg.headers).map(([k, v]) => ({ id: ++headerIdCounter, key: k, value: v }));
    setFormHeaders(hdrArr.length > 0 ? hdrArr : [{ id: ++headerIdCounter, key: '', value: '' }]);
    setFormBody(cfg.body);
    setFormEnabled(item.enabled);
    setFormEvents(evts);
    setShowTemplateHelp(false);
    setExpandedCats(new Set(EVENT_CATEGORIES.map(c => c.label)));
    setError('');
    initialRef.current = { name: item.name, url: cfg.url, headers: { ...cfg.headers }, body: cfg.body, enabled: item.enabled, events: [...evts] };
    setPanelOpen(true);
  };

  const addHeaderRow = () => setFormHeaders(prev => [...prev, { id: ++headerIdCounter, key: '', value: '' }]);
  const removeHeaderRow = (id: number) => setFormHeaders(prev => prev.filter(h => h.id !== id));
  const updateHeader = (id: number, field: 'key' | 'value', val: string) => {
    setFormHeaders(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const handleSave = () => {
    if (!projectId) return;
    setError('');
    setSaving(true);
    saveMutation.mutate();
  };

  const buildCurlCommand = (): string => {
    const hdrLines = formHeaders
      .filter(h => h.key.trim())
      .map(h => `-H '${h.key.trim()}: ${h.value}'`)
      .join(' ');
    const hdrsPart = hdrLines ? ` ${hdrLines}` : '';
    const bodyPart = formBody.trim() ? ` -d '${formBody.replace(/'/g, "'\\''")}'` : '';
    return `curl -v -X POST '${formUrl}'${hdrsPart}${bodyPart}`;
  };

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTemplateVar = async (key: string) => {
    await navigator.clipboard.writeText(`{{${key}}}`);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const toggleCatExpand = (label: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const toggleCatAll = (cat: typeof EVENT_CATEGORIES[number]) => {
    const keys = cat.events.map(e => e.key);
    const allInCat = cat.events.every(e => formEventSet.has(e.key));
    if (allInCat) {
      setFormEvents(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setFormEvents(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const toggleAllEvents = () => {
    if (formEvents.length === ALL_EVENTS.length) {
      setFormEvents([]);
    } else {
      setFormEvents([...ALL_EVENTS]);
    }
  };

  const currentHeaders = (): Record<string, string> => buildHeadersMap(formHeaders);

  const isDirty = useMemo(() => {
    const orig = initialRef.current;
    if (!orig) return false;
    if (!editing) return formName.trim() !== '' || formUrl.trim() !== '';
    const curHdrs = currentHeaders();
    const origHdrs = orig.headers;
    if (Object.keys(curHdrs).length !== Object.keys(origHdrs).length) return true;
    for (const k of Object.keys(curHdrs)) {
      if (curHdrs[k] !== origHdrs[k]) return true;
    }
    return formName !== orig.name
      || formUrl !== orig.url
      || formBody !== orig.body
      || formEnabled !== orig.enabled
      || formEvents.length !== orig.events.length
      || formEvents.some(e => !orig.events.includes(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formName, formUrl, formHeaders, formBody, formEnabled, formEvents, editing]);

  const formEventSet = useMemo(() => new Set(formEvents), [formEvents]);

  const curlCommand = useMemo(() => buildCurlCommand(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formUrl, formHeaders, formBody]);

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          title={t('integrations.title')}
          description={t('integrations.description')}
        />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>{t('integrations.connect')}</GradientButton>
      </div>

      <TipCard
        text="Настройте вебхук на событие «flag.updated» и получайте HTTP POST на ваш endpoint с деталями каждого изменения. Используйте шаблоны {{events.*}} в теле запроса."
        label="Вебхуки"
        icon={<Bell />}
        storageKey="integrations"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-accent rounded w-2/3" />
                  <div className="h-3 bg-accent rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Webhook size={28} className="text-blue-600 dark:text-blue-400" />}
          title={t('integrations.emptyTitle')}
          description={t('integrations.emptyDescription')}
          buttonLabel={t('integrations.connect')}
          onAction={openCreate}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, idx) => {
              const cfg = parseWebhookConfig(item);
              const evts = migrateEventKeys(parseEvents(item));
              const hasError = item.lastError != null;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-border hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openEdit(item)}
                >
                  <div className={`h-1.5 bg-gradient-to-r ${hasError ? 'from-red-500 to-amber-500' : 'from-gradient-start to-gradient-end'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end border border-blue-200/50 dark:border-violet-500/20 shrink-0">
                          {hasError ? <AlertTriangle size={18} className="text-amber-500" /> : <Webhook size={18} className="text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                          <p className="text-xs text-muted-foreground/70 font-mono mt-0.5 truncate">{cfg.url || 'URL не указан'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {item.enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{t('integrations.status.connected')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-accent text-muted-foreground border border-border">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />{t('integrations.status.disconnected')}
                        </span>
                      )}
                      {hasError && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20" title={item.lastError!}>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{t('integrations.status.error')}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground/70">
                        {evts.length > 0 ? `${evts.length} событ.` : 'Нет событий'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? t('integrations.configure') : t('integrations.connect')}
        description={editing
          ? 'Измените URL, заголовки, тело запроса или список событий для этого вебхука.'
          : 'Создайте вебхук для отправки HTTP POST с данными событий на ваш endpoint.'
        }
        footer={<>
          {editing && (
            <button
              type="button"
              onClick={() => { setDeleteId(editing.id); }}
              className="px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 transition-all mr-auto"
            >
              <Trash2 size={16} className="inline mr-1.5" />{t('common.delete')}
            </button>
          )}
          <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-xl transition-colors">{t('common.cancel')}</button>
          <GradientButton onClick={handleSave} disabled={saving || !isDirty} loading={saving}>{t('common.saveChanges')}</GradientButton>
        </>}
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-2.5">
              <Info size={18} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
            <div>
              <div className="font-medium text-sm text-foreground">Включить вебхук</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Отправлять события при их наступлении
                {limitRemaining < Number.MAX_SAFE_INTEGER && (
                  <span className="ml-2 text-violet-500">· Осталось отправок: {limitRemaining}</span>
                )}
              </div>
            </div>
            <Switch checked={formEnabled} onCheckedChange={setFormEnabled}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-violet-500 scale-75 origin-right" />
          </div>

          <FormField label="Название" hint="Короткое имя для идентификации вебхука" maxLength={120} value={formName}>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              maxLength={120}
              placeholder="Мой вебхук"
              autoFocus={!editing}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label="URL" hint="HTTPS-эндпоинт, на который будут отправляться POST-запросы" maxLength={2048} value={formUrl}>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
                maxLength={2048}
                placeholder="https://example.com/webhook"
                className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
              />
            </div>
          </FormField>

          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-secondary border-b border-border">
              <div className="flex items-center gap-1.5">
                <Code2 size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Preview запроса</span>
              </div>
              <button
                type="button"
                onClick={copyCurl}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors"
              >
                {copied ? <Check size={11} /> : <Clipboard size={11} />}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
            <pre className="p-3 bg-white dark:bg-neutral-950 text-xs text-foreground/80 font-mono whitespace-pre-wrap break-all m-0 overflow-x-auto">
              {curlCommand}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80">Заголовки</label>
              <button
                type="button"
                onClick={addHeaderRow}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />Добавить
              </button>
            </div>
            <div className="space-y-2">
              {formHeaders.map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.key}
                    onChange={e => updateHeader(h.id, 'key', e.target.value)}
                    maxLength={500}
                    placeholder="Header"
                    className="flex-1 bg-white dark:bg-neutral-950 border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={e => updateHeader(h.id, 'value', e.target.value)}
                    maxLength={500}
                    placeholder="Value"
                    className="flex-1 bg-white dark:bg-neutral-950 border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeaderRow(h.id)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <FileText size={14} className="text-muted-foreground" />Тело запроса
              </label>
              <button
                type="button"
                onClick={() => setShowTemplateHelp(!showTemplateHelp)}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Code2 size={12} />{showTemplateHelp ? 'Скрыть переменные' : 'Переменные'}
              </button>
            </div>
            {showTemplateHelp && (
              <div className="p-3 bg-secondary border border-border rounded-xl space-y-0.5">
                {TEMPLATE_VARS.map(v => {
                  const isCopied = copiedVar === v.key;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => copyTemplateVar(v.key)}
                      className="w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors group"
                    >
                      <code className="text-violet-600 dark:text-violet-400 font-mono">{`{{${v.key}}}`}</code>
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {v.label}
                        {isCopied
                          ? <Check size={12} className="text-emerald-500 shrink-0" />
                          : <Copy size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        }
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <textarea
              value={formBody}
              onChange={e => setFormBody(e.target.value)}
              maxLength={10000}
              placeholder={'{\n  "text": "**{{events.action}}**: {{events.resourceName}} ({{events.resourceType}} #{{events.resourceId}})\\nby {{events.user.name}} at {{events.timestamp}}",\n  "channel": "integrations",\n  "username": "Mozhno"\n}'}
              rows={7}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-y"
            />
            <p className="text-xs text-muted-foreground/70">Если заголовок Content-Type не указан, по умолчанию используется application/json.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80">Отправлять при событиях</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formEvents.length} из {ALL_EVENTS.length}</span>
                <button
                  type="button"
                  onClick={toggleAllEvents}
                  className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                  {formEvents.length === ALL_EVENTS.length ? 'Снять всё' : 'Выбрать всё'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {EVENT_CATEGORIES.map(cat => {
                const allInCat = cat.events.every(e => formEventSet.has(e.key));
                const expanded = expandedCats.has(cat.label);
                return (
                  <div key={cat.label} className="rounded-xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCatExpand(cat.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary dark:hover:bg-neutral-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium text-foreground/80">{cat.label}</span>
                        <span className="text-xs text-muted-foreground">{cat.events.filter(e => formEventSet.has(e.key)).length}/{cat.events.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleCatAll(cat); }}
                        className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        {allInCat ? 'Снять' : 'Все'}
                      </button>
                    </button>
                    {expanded && (
                      <div className="px-3 pb-2.5 grid grid-cols-2 gap-1">
                        {cat.events.map(evt => {
                          const checked = formEventSet.has(evt.key);
                          return (
                            <label
                              key={evt.key}
                              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${checked ? 'bg-violet-50/70 dark:bg-violet-500/10' : 'hover:bg-secondary dark:hover:bg-neutral-900'}`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) => {
                                  if (c) {
                                    setFormEvents(prev => [...prev, evt.key]);
                                  } else {
                                    setFormEvents(prev => prev.filter(k => k !== evt.key));
                                  }
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-foreground/80">{evt.title}</div>
                                <div className="text-xs text-muted-foreground leading-tight mt-0.5">{evt.desc}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить вебхук?"
        description={`Вебхук «${items.find(i => i.id === deleteId)?.name ?? ''}» будет удалён без возможности восстановления.`}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
