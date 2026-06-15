import { useState, useRef, useCallback, useMemo } from 'react';
import {
  type HeaderRow,
  type EventCategoryKey,
  EVENT_CATEGORY_KEYS,
  CATEGORY_EVENT_MAP,
  ALL_EVENTS,
  buildHeadersMap,
  parseWebhookConfig,
  parseEvents,
  validateUrl,
  buildCurlCommand,
} from './webhookUtils';
import type { Integration } from '@/api';

interface InitialState {
  name: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  enabled: boolean;
  events: string[];
}

export interface WebhookFormState {
  formName: string;
  formUrl: string;
  formHeaders: HeaderRow[];
  formBody: string;
  formEnabled: boolean;
  formEvents: string[];
  showTemplateHelp: boolean;
  copied: boolean;
  copiedVar: string | null;
  expandedCats: Set<EventCategoryKey>;
  error: string;
  editing: Integration | null;
  initialRef: React.MutableRefObject<InitialState | null>;
  headerIdRef: React.MutableRefObject<number>;
  urlError: string | null;
  isDirty: boolean;
  curlCommand: string;
  currentHeaders: Record<string, string>;
  setFormName: (v: string) => void;
  setFormUrl: (v: string) => void;
  setFormHeaders: React.Dispatch<React.SetStateAction<HeaderRow[]>>;
  setFormBody: (v: string) => void;
  setFormEnabled: (v: boolean) => void;
  setFormEvents: React.Dispatch<React.SetStateAction<string[]>>;
  setShowTemplateHelp: (v: boolean) => void;
  setCopied: (v: boolean) => void;
  setCopiedVar: (v: string | null) => void;
  setExpandedCats: React.Dispatch<React.SetStateAction<Set<EventCategoryKey>>>;
  setError: (v: string) => void;
  setEditing: (v: Integration | null) => void;
  openCreate: () => void;
  openEdit: (item: Integration) => void;
  addHeaderRow: () => void;
  removeHeaderRow: (id: number) => void;
  updateHeader: (id: number, field: 'key' | 'value', val: string) => void;
  copyCurl: () => Promise<void>;
  copyTemplateVar: (key: string) => Promise<void>;
  toggleCatExpand: (catKey: EventCategoryKey) => void;
  toggleCatAll: (catKey: EventCategoryKey) => void;
  toggleAllEvents: () => void;
}

export function useWebhookForm() {
  const [editing, setEditing] = useState<Integration | null>(null);
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formHeaders, setFormHeaders] = useState<HeaderRow[]>([]);
  const [formBody, setFormBody] = useState('');
  const [formEnabled, setFormEnabled] = useState(false);
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [showTemplateHelp, setShowTemplateHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<EventCategoryKey>>(
    new Set(EVENT_CATEGORY_KEYS),
  );
  const [error, setError] = useState('');

  const initialRef = useRef<InitialState | null>(null);
  const headerIdRef = useRef(0);

  const urlError = useMemo(() => {
    const result = validateUrl(formUrl);
    return result.valid ? null : result.error ?? null;
  }, [formUrl]);

  const currentHeaders = useMemo(() => buildHeadersMap(formHeaders), [formHeaders]);

  const isDirty = useMemo(() => {
    const orig = initialRef.current;
    if (!orig) return false;
    if (!editing) return formName.trim() !== '' || formUrl.trim() !== '';
    const curHdrs = buildHeadersMap(formHeaders);
    const origHdrs = orig.headers;
    if (Object.keys(curHdrs).length !== Object.keys(origHdrs).length) return true;
    for (const k of Object.keys(curHdrs)) {
      if (curHdrs[k] !== origHdrs[k]) return true;
    }
    return (
      formName !== orig.name ||
      formUrl !== orig.url ||
      formBody !== orig.body ||
      formEnabled !== orig.enabled ||
      formEvents.length !== orig.events.length ||
      formEvents.some((e) => !orig.events.includes(e))
    );
  }, [formName, formUrl, formHeaders, formBody, formEnabled, formEvents, editing]);

  const curlCommand = useMemo(
    () => buildCurlCommand(formUrl, formHeaders, formBody),
    [formUrl, formHeaders, formBody],
  );

  const openCreate = useCallback(() => {
    const defaultBody = `{
  "text": "{{events.action}} \u2014 {{events.resourceName}}",
  "channel": "integrations",
  "username": "Mozhno"
}`;
    setEditing(null);
    setFormName('');
    setFormUrl('');
    setFormHeaders([
      { id: ++headerIdRef.current, key: 'Content-Type', value: 'application/json' },
    ]);
    setFormBody(defaultBody);
    setFormEnabled(false);
    setFormEvents([]);
    setShowTemplateHelp(false);
    setCopied(false);
    setExpandedCats(new Set(EVENT_CATEGORY_KEYS));
    setError('');
    initialRef.current = {
      name: '',
      url: '',
      headers: { 'Content-Type': 'application/json' },
      body: defaultBody,
      enabled: false,
      events: [],
    };
  }, []);

  const openEdit = useCallback((item: Integration) => {
    const cfg = parseWebhookConfig(item);
    const evts = parseEvents(item);
    setEditing(item);
    setFormName(item.name);
    setFormUrl(cfg.url);
    const hdrArr = Object.entries(cfg.headers).map(([k, v]) => ({
      id: ++headerIdRef.current,
      key: k,
      value: v,
    }));
    setFormHeaders(
      hdrArr.length > 0 ? hdrArr : [{ id: ++headerIdRef.current, key: '', value: '' }],
    );
    setFormBody(cfg.body);
    setFormEnabled(item.enabled);
    setFormEvents(evts);
    setShowTemplateHelp(false);
    setExpandedCats(new Set(EVENT_CATEGORY_KEYS));
    setError('');
    initialRef.current = {
      name: item.name,
      url: cfg.url,
      headers: { ...cfg.headers },
      body: cfg.body,
      enabled: item.enabled,
      events: [...evts],
    };
  }, []);

  const addHeaderRow = useCallback(() => {
    setFormHeaders((prev) => [...prev, { id: ++headerIdRef.current, key: '', value: '' }]);
  }, []);

  const removeHeaderRow = useCallback((id: number) => {
    setFormHeaders((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHeader = useCallback((id: number, field: 'key' | 'value', val: string) => {
    setFormHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
    );
  }, []);

  const buildCurlCmd = useCallback((): string => {
    return buildCurlCommand(formUrl, formHeaders, formBody);
  }, [formUrl, formHeaders, formBody]);

  const copyCurl = useCallback(async () => {
    await navigator.clipboard.writeText(buildCurlCmd());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [buildCurlCmd]);

  const copyTemplateVar = useCallback(async (key: string) => {
    await navigator.clipboard.writeText(`{{${key}}}`);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 1500);
  }, []);

  const toggleCatExpand = useCallback((catKey: EventCategoryKey) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  }, []);

  const toggleCatAll = useCallback(
    (catKey: EventCategoryKey) => {
      const keys = CATEGORY_EVENT_MAP[catKey];
      setFormEvents((prev) => {
        const formEventSet = new Set(prev);
        const allInCat = keys.every((key) => formEventSet.has(key));
        if (allInCat) {
          return prev.filter((k) => !keys.includes(k));
        } else {
          return [...new Set([...prev, ...keys])];
        }
      });
    },
    [],
  );

  const toggleAllEvents = useCallback(() => {
    setFormEvents((prev) => {
      if (prev.length === ALL_EVENTS.length) return [];
      return [...ALL_EVENTS];
    });
  }, []);

  return {
    formName,
    formUrl,
    formHeaders,
    formBody,
    formEnabled,
    formEvents,
    showTemplateHelp,
    copied,
    copiedVar,
    expandedCats,
    error,
    editing,
    initialRef,
    headerIdRef,
    urlError,
    isDirty,
    curlCommand,
    currentHeaders,
    setFormName,
    setFormUrl,
    setFormHeaders,
    setFormBody,
    setFormEnabled,
    setFormEvents,
    setShowTemplateHelp,
    setCopied,
    setCopiedVar,
    setExpandedCats,
    setError,
    setEditing,
    openCreate,
    openEdit,
    addHeaderRow,
    removeHeaderRow,
    updateHeader,
    copyCurl,
    copyTemplateVar,
    toggleCatExpand,
    toggleCatAll,
    toggleAllEvents,
  };
}
