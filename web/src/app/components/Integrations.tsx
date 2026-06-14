import { useState, useRef, useMemo, useCallback } from 'react';
import { useT, type MessageKey } from '@/i18n';
import { Plus, Webhook, Globe, Trash2, Code2, FileText, X, Bell, Clipboard, Check, Copy, ChevronDown, AlertTriangle } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, Integration } from "@/api";
import { SidePanel } from "@/app/components/SidePanel";
import { TipCard } from "@/app/components/TipCard";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { SectionHeader, EmptyState, FormField, GradientButton, ErrorBox } from "@/shared";
import { Switch } from "@/app/components/ui/switch";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useProjectQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ALL_EVENTS = [
  'flag.created', 'flag.updated', 'flag.deleted', 'flag.archived', 'flag.unarchived',
  'strategy.created', 'strategy.updated',
  'environment.created', 'environment.updated', 'environment.deleted',
  'project.created', 'project.updated', 'project.deleted', 'project.logo_updated',
  'user.created', 'user.updated', 'user.deleted',
  'segment.created', 'segment.updated', 'segment.deleted',
  'tag.created', 'tag.updated', 'tag.deleted',
  'apikey.created', 'apikey.updated', 'apikey.deleted',
  'context_definition.created', 'context_definition.updated', 'context_definition.deleted',
  'context_value.created', 'context_value.updated', 'context_value.deleted',
];

const EVENT_CATEGORY_KEYS = ['flags', 'strategies', 'environments', 'projects', 'users', 'segments', 'tags', 'apiKeys', 'contexts'] as const;

type EventCategoryKey = (typeof EVENT_CATEGORY_KEYS)[number];

const CATEGORY_EVENT_MAP: Record<EventCategoryKey, string[]> = {
  flags: ['flag.created', 'flag.updated', 'flag.deleted', 'flag.archived', 'flag.unarchived'],
  strategies: ['strategy.created', 'strategy.updated'],
  environments: ['environment.created', 'environment.updated', 'environment.deleted'],
  projects: ['project.created', 'project.updated', 'project.deleted', 'project.logo_updated'],
  users: ['user.created', 'user.updated', 'user.deleted'],
  segments: ['segment.created', 'segment.updated', 'segment.deleted'],
  tags: ['tag.created', 'tag.updated', 'tag.deleted'],
  apiKeys: ['apikey.created', 'apikey.updated', 'apikey.deleted'],
  contexts: ['context_definition.created', 'context_definition.updated', 'context_definition.deleted', 'context_value.created', 'context_value.updated', 'context_value.deleted'],
};

function eventI18nKey(eventKey: string): MessageKey {
  return `integrations.eventDescriptions.${eventKey}` as MessageKey;
}

function categoryI18nKey(catKey: EventCategoryKey): MessageKey {
  return `integrations.eventCategories.${catKey}` as MessageKey;
}

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

const TEMPLATE_VAR_KEYS = [
  'events.action',
  'events.resourceType',
  'events.resourceId',
  'events.resourceName',
  'events.details',
  'events.projectId',
  'events.user.id',
  'events.user.name',
  'events.user.email',
  'events.timestamp',
] as const;

function templateVarI18nKey(key: string): MessageKey {
  return `integrations.templateVars.${key}` as MessageKey;
}

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
  const [expandedCats, setExpandedCats] = useState<Set<EventCategoryKey>>(new Set(EVENT_CATEGORY_KEYS));

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initialRef = useRef<{ name: string; url: string; headers: Record<string, string>; body: string; enabled: boolean; events: string[] } | null>(null);
  const headerIdRef = useRef(0);

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

  const eventCategories = useMemo(() => {
    return EVENT_CATEGORY_KEYS.map(catKey => {
      const events = CATEGORY_EVENT_MAP[catKey];
      return {
        catKey,
        label: t(categoryI18nKey(catKey)),
        events: events.map(eventKey => {
          const evtKey = eventI18nKey(eventKey);
          return {
            key: eventKey,
            title: t(`${evtKey}.title` as MessageKey),
            desc: t(`${evtKey}.desc` as MessageKey),
          };
        }),
      };
    });
  }, [t]);

  const templateVars = useMemo(() => {
    return TEMPLATE_VAR_KEYS.map(key => ({
      key,
      label: t(templateVarI18nKey(key)),
    }));
  }, [t]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormName('');
    setFormUrl('');
    setFormHeaders([{ id: ++headerIdRef.current, key: 'Content-Type', value: 'application/json' }]);
    setFormBody('');
    setFormEnabled(false);
    setFormEvents([]);
    setShowTemplateHelp(false);
    setCopied(false);
    setExpandedCats(new Set(EVENT_CATEGORY_KEYS));
    setError('');
    initialRef.current = { name: '', url: '', headers: { 'Content-Type': 'application/json' }, body: '', enabled: false, events: [] };
    setPanelOpen(true);
  }, []);

  const openEdit = useCallback((item: Integration) => {
    const cfg = parseWebhookConfig(item);
    const evts = parseEvents(item);
    setEditing(item);
    setFormName(item.name);
    setFormUrl(cfg.url);
    const hdrArr = Object.entries(cfg.headers).map(([k, v]) => ({ id: ++headerIdRef.current, key: k, value: v }));
    setFormHeaders(hdrArr.length > 0 ? hdrArr : [{ id: ++headerIdRef.current, key: '', value: '' }]);
    setFormBody(cfg.body);
    setFormEnabled(item.enabled);
    setFormEvents(evts);
    setShowTemplateHelp(false);
    setExpandedCats(new Set(EVENT_CATEGORY_KEYS));
    setError('');
    initialRef.current = { name: item.name, url: cfg.url, headers: { ...cfg.headers }, body: cfg.body, enabled: item.enabled, events: [...evts] };
    setPanelOpen(true);
  }, []);

  const addHeaderRow = () => setFormHeaders(prev => [...prev, { id: ++headerIdRef.current, key: '', value: '' }]);
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

  const buildCurlCommand = useCallback((): string => {
    const hdrLines = formHeaders
      .filter(h => h.key.trim())
      .map(h => `-H '${h.key.trim()}: ${h.value}'`)
      .join(' ');
    const hdrsPart = hdrLines ? ` ${hdrLines}` : '';
    const bodyPart = formBody.trim() ? ` -d '${formBody.replace(/'/g, "'\\''")}'` : '';
    return `curl -v -X POST '${formUrl}'${hdrsPart}${bodyPart}`;
  }, [formUrl, formHeaders, formBody]);

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

  const toggleCatExpand = (catKey: EventCategoryKey) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  const toggleCatAll = (catKey: EventCategoryKey) => {
    const keys = CATEGORY_EVENT_MAP[catKey];
    const allInCat = keys.every(key => formEventSet.has(key));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={t('integrations.title')}
          description={t('integrations.description')}
        />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>{t('integrations.connect')}</GradientButton>
      </div>

      <TipCard
        text={t('integrations.tipText')}
        label={t('integrations.tipLabel')}
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
                  className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
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
                          <p className="text-xs text-muted-foreground/70 font-mono mt-0.5 truncate">{cfg.url || t('integrations.urlNotSet')}</p>
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
                        {evts.length > 0 ? t('integrations.eventCount', { count: String(evts.length) }) : t('integrations.noEvents')}
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
          ? t('integrations.panelEditDescription')
          : t('integrations.panelCreateDescription')
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
          <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors">{t('common.cancel')}</button>
          <GradientButton onClick={handleSave} disabled={saving || !isDirty} loading={saving}>{t('common.saveChanges')}</GradientButton>
        </>}
      >
        <div className="space-y-6">
          {error && (
            <ErrorBox>{error}</ErrorBox>
          )}

          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
            <div>
              <div className="font-medium text-sm text-foreground">{t('integrations.enable')}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('integrations.enableHint')}
                {limitRemaining < Number.MAX_SAFE_INTEGER && (
                  <span className="ml-2 text-violet-500">· {t('integrations.enableRemaining')}: {limitRemaining}</span>
                )}
              </div>
            </div>
            <Switch checked={formEnabled} onCheckedChange={setFormEnabled}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-violet-500 scale-75 origin-right" />
          </div>

          <FormField label={t('integrations.name')} hint={t('integrations.nameHint')} maxLength={120} value={formName}>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              maxLength={120}
              placeholder={t('integrations.namePlaceholder')}
              autoFocus={!editing}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label={t('integrations.url')} hint={t('integrations.urlHint')} maxLength={2048} value={formUrl}>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
                maxLength={2048}
                placeholder={t('integrations.urlPlaceholder')}
                className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
              />
            </div>
          </FormField>

          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-secondary border-b border-border">
              <div className="flex items-center gap-1.5">
                <Code2 size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{t('integrations.preview')}</span>
              </div>
              <button
                type="button"
                onClick={copyCurl}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors"
              >
                {copied ? <Check size={11} /> : <Clipboard size={11} />}
                {copied ? t('integrations.copied') : t('integrations.copy')}
              </button>
            </div>
            <pre className="p-3 bg-white dark:bg-neutral-950 text-xs text-foreground/80 font-mono whitespace-pre-wrap break-all m-0 overflow-x-auto">
              {curlCommand}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80">{t('integrations.headers')}</label>
              <button
                type="button"
                onClick={addHeaderRow}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />{t('integrations.addHeader')}
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
                    placeholder={t('integrations.headerKeyPlaceholder')}
                    className="flex-1 bg-white dark:bg-neutral-950 border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={e => updateHeader(h.id, 'value', e.target.value)}
                    maxLength={500}
                    placeholder={t('integrations.headerValuePlaceholder')}
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
                <FileText size={14} className="text-muted-foreground" />{t('integrations.body')}
              </label>
              <button
                type="button"
                onClick={() => setShowTemplateHelp(!showTemplateHelp)}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Code2 size={12} />{showTemplateHelp ? t('integrations.hideVariables') : t('integrations.showVariables')}
              </button>
            </div>
            {showTemplateHelp && (
              <div className="p-3 bg-secondary border border-border rounded-xl space-y-0.5">
                {templateVars.map(v => {
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
              placeholder={t('integrations.bodyPlaceholder')}
              rows={7}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-y"
            />
            <p className="text-xs text-muted-foreground/70">{t('integrations.bodyHint')}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80">{t('integrations.events')}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('integrations.eventsCount', { selected: String(formEvents.length), total: String(ALL_EVENTS.length) })}</span>
                <button
                  type="button"
                  onClick={toggleAllEvents}
                  className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                  {formEvents.length === ALL_EVENTS.length ? t('integrations.deselectAll') : t('integrations.selectAll')}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {eventCategories.map(cat => {
                const allInCat = cat.events.every(e => formEventSet.has(e.key));
                const expanded = expandedCats.has(cat.catKey);
                return (
                  <div key={cat.catKey} className="rounded-xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCatExpand(cat.catKey)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary dark:hover:bg-neutral-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium text-foreground/80">{cat.label}</span>
                        <span className="text-xs text-muted-foreground">{cat.events.filter(e => formEventSet.has(e.key)).length}/{cat.events.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleCatAll(cat.catKey); }}
                        className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        {allInCat ? t('integrations.deselectCategory') : t('integrations.selectCategory')}
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
        title={t('integrations.confirmTitle')}
        description={t('integrations.confirmDescription', { name: items.find(i => i.id === deleteId)?.name ?? '' })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
