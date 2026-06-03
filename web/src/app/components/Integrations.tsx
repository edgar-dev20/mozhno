import React, { useState, useEffect } from 'react';
import { Mail, Send, MessageSquare, Webhook, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Integration } from '../../api';
import { TipCard } from './TipCard';

interface LocalCfg { enabled: boolean; configJson: string; eventsJson: string; }
type TypeDef = { label: string; desc: string; icon: React.ReactNode; fields: { key: string; label: string; hint: string; type: string }[] };
const TYPES: Record<string, TypeDef> = {
  email: { label: 'Email уведомления', desc: 'Отправка уведомлений на email', icon: <Mail size={20} className="text-blue-600 dark:text-blue-400" />, fields: [{ key: 'recipients', label: 'Получатели', hint: 'Введите email адреса через запятую', type: 'text' }] },
  telegram: { label: 'Telegram', desc: 'Отправка событий в Telegram бот', icon: <Send size={20} className="text-blue-600 dark:text-blue-400" />, fields: [{ key: 'botToken', label: 'Bot Token', hint: 'Получите токен у @BotFather в Telegram', type: 'password' }, { key: 'chatId', label: 'Chat ID', hint: 'ID чата или канала для отправки уведомлений', type: 'text' }] },
  mattermost: { label: 'Mattermost', desc: 'Отправка событий в Mattermost', icon: <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />, fields: [{ key: 'webhookUrl', label: 'Webhook URL', hint: 'URL входящего вебхука Mattermost', type: 'text' }, { key: 'channel', label: 'Канал (опционально)', hint: 'По умолчанию используется стандартный канал', type: 'text' }] },
  webhook: { label: 'Webhook', desc: 'Отправка событий на ваш HTTP endpoint', icon: <Webhook size={20} className="text-blue-600 dark:text-blue-400" />, fields: [{ key: 'url', label: 'URL', hint: 'URL вашего получателя webhook', type: 'text' }, { key: 'secret', label: 'Секретный ключ (HMAC)', hint: 'Используется для проверки подлинности на вашей стороне', type: 'password' }] },
};
const EVENTS = ['flagCreated', 'flagUpdated', 'flagDeleted', 'userInvited'] as const;
const EVENT_LABELS: Record<string, { title: string; desc: string }> = {
  flagCreated: { title: 'Создание флага', desc: 'Новый флаг добавлен' },
  flagUpdated: { title: 'Изменение флага', desc: 'Обновление настроек' },
  flagDeleted: { title: 'Удаление флага', desc: 'Флаг удален' },
  userInvited: { title: 'Приглашение', desc: 'Новый пользователь' },
};

export function Integrations() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let projects = await api.projects.list();
        if (projects.length === 0) projects = [await api.projects.create({ name: 'Default' })];
        const pid = projects[0].id; setProjectId(pid);
        setItems(await api.integrations.list(pid));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const toggleOpen = (t: string) => setOpen(prev => prev.includes(t) ? prev.filter(s => s !== t) : [...prev, t]);

  const upsert = async (type: string, cfg: LocalCfg) => {
    if (!projectId) return;
    const existing = items.find(i => i.type === type);
    const body = { type, name: TYPES[type].label, enabled: cfg.enabled, configJson: cfg.configJson, eventSubscriptionsJson: cfg.eventsJson };
    try {
      if (existing) {
        const u = await api.integrations.update(projectId, existing.id, body);
        setItems(items.map(i => i.id === u.id ? u : i));
      } else {
        const c = await api.integrations.create(projectId, body);
        setItems([...items, c]);
      }
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-fuchsia-100 dark:from-blue-500/10 dark:to-fuchsia-500/10 animate-pulse" />
      <span className="text-sm text-neutral-400">Загрузка интеграций...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Интеграции</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-blue-500 to-fuchsia-500" />
            <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">Настройка уведомлений и внешних интеграций</p>
          </div>
        </div>
      </div>

      <TipCard
        accentColor="#3b82f6"
        accentColor2="#8b5cf6"
        text="Настройте вебхук или Telegram-бота, чтобы получать уведомления об изменениях флагов в реальном времени. Выберите события, на которые хотите подписаться."
      />

      <div className="space-y-6">
        {Object.entries(TYPES).map(([key, def], idx) => {
          const existing = items.find(i => i.type === key);
          const rawCfg = existing ? JSON.parse(existing.configJson) : {};
          const events = existing ? JSON.parse(existing.eventSubscriptionsJson) : [];
          const enabled = existing?.enabled ?? false;
          const isOpen = open.includes(key);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.06 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden"
            >
              <button onClick={() => toggleOpen(key)} className="w-full p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 border border-blue-200 dark:border-violet-500/20">{def.icon}</div>
                  <div className="text-left"><h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{def.label}</h2><p className="text-sm text-neutral-600 dark:text-neutral-400">{def.desc}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  {enabled && <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Активна</span>}
                  <ChevronDown size={20} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {isOpen && (
                <IntegrationSection type={key} def={def} rawCfg={rawCfg} enabled={enabled} events={events} onSave={upsert} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationSection({ type, def, rawCfg, enabled: initEnabled, events: initEvents, onSave }: {
  type: string; def: TypeDef; rawCfg: Record<string, string>; enabled: boolean; events: string[]; onSave: (type: string, cfg: LocalCfg) => void;
}) {
  const [enabled, setEnabled] = useState(initEnabled);
  const [cfg, setCfg] = useState(def.fields.reduce((acc, f) => ({ ...acc, [f.key]: rawCfg[f.key] ?? '' }), {} as Record<string, string>));
  const [evts, setEvts] = useState<string[]>(initEvents);

  const handleSave = () => {
    onSave(type, { enabled, configJson: JSON.stringify(cfg), eventsJson: JSON.stringify(evts) });
  };

  return (
    <div className="p-6 space-y-5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div><div className="font-medium text-neutral-900 dark:text-neutral-200">Включить интеграцию</div><div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{def.desc}</div></div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-violet-600" />
        </label>
      </div>

      {enabled && (<>
        {def.fields.map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{f.label}</label>
            <input type={f.type} value={cfg[f.key] ?? ''} onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })}
              placeholder={f.hint} className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-1"><AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{f.hint}</p>
          </div>
        ))}

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">Отправлять при событиях</label>
          <div className="grid grid-cols-2 gap-2">
            {EVENTS.map(evt => {
              const checked = evts.includes(evt);
              return (
                <label key={evt} className={`flex items-start gap-2.5 p-3 rounded-lg bg-white dark:bg-neutral-900 border cursor-pointer transition-all group ${checked ? 'border-violet-300 dark:border-violet-700' : 'border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700'}`}>
                  <input type="checkbox" checked={checked} onChange={e => setEvts(e.target.checked ? [...evts, evt] : evts.filter(x => x !== evt))} className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-violet-600 focus:ring-violet-500" />
                  <div><div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">{EVENT_LABELS[evt].title}</div><div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{EVENT_LABELS[evt].desc}</div></div>
                </label>
              );
            })}
          </div>
        </div>
      </>)}

      <button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"><Save size={16} />Сохранить</button>
    </div>
  );
}