import React, { useState, useEffect } from 'react';
import { Filter, Clock, User, Activity, Flag, Users, Tag, Key, Layers, Globe, GitBranch, Blocks } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, AuditEvent, Environment, Project, SegmentResponse } from '../../api';
import { TipCard } from './TipCard';

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const projects = await api.projects.list();
        if (projects.length === 0) return setLoading(false);
        const pid = projects[0].id;
        const data = await api.audit.list(pid);
        setEvents(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'flag': return <Flag size={16} />;
      case 'user': return <User size={16} />;
      case 'tag': return <Tag size={16} />;
      case 'apikey': return <Key size={16} />;
      case 'segment': return <Users size={16} />;
      case 'project': return <Layers size={16} />;
      case 'environment': return <Globe size={16} />;
      case 'context': return <Filter size={16} />;
      case 'strategy': return <GitBranch size={16} />;
      case 'integration': return <Blocks size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'flag': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'user': return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20';
      case 'tag': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'apikey': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'segment': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
      case 'project': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
      case 'environment': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20';
      case 'context': return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20';
      case 'strategy': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20';
      case 'integration': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      default: return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-500/10 border-neutral-200 dark:border-neutral-500/20';
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'flag': return 'Флаг';
      case 'user': return 'Пользователь';
      case 'tag': return 'Тег';
      case 'apikey': return 'API Ключ';
      case 'segment': return 'Сегмент';
      case 'project': return 'Проект';
      case 'environment': return 'Окружение';
      case 'context': return 'Контекст';
      case 'strategy': return 'Стратегия';
      case 'integration': return 'Интеграция';
      default: return type;
    }
  };

  const filteredEvents = filterType ? events.filter(e => e.resourceType === filterType).slice(0, 200) : events.slice(0, 200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neutral-600 via-purple-500 to-violet-500 bg-clip-text text-transparent dark:from-neutral-300 dark:via-purple-400 dark:to-violet-400">Журнал событий</span>
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b from-purple-500 to-violet-500" />
          <p className="text-sm text-neutral-500/80 dark:text-neutral-400/80 leading-relaxed">История всех действий в системе</p>
        </div>
      </div>

      <TipCard
        accentColor="#a855f7"
        accentColor2="#8b5cf6"
        text="Все действия в системе логируются автоматически. Используйте фильтр по типу ресурса для быстрого поиска - например, отслеживайте только изменения флагов."
      />

      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 px-1">
          <Filter size={15} className="text-purple-500" />
          <span className="hidden sm:inline">Фильтр:</span>
        </div>
        <div className="h-6 w-px bg-neutral-200 dark:border-neutral-800 hidden sm:block" />
        <button onClick={() => setFilterType(null)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${filterType === null ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>Все</button>
        {['flag', 'user', 'tag', 'apikey', 'segment', 'project', 'environment', 'context', 'strategy', 'integration'].map(type => (
          <button key={type} onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 border ${filterType === type ? getResourceColor(type) : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            {getResourceIcon(type)}{getResourceLabel(type)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/10 dark:to-violet-500/10 animate-pulse" />
          <span className="text-sm text-neutral-400">Загрузка событий...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/10 dark:to-violet-500/10 flex items-center justify-center">
            <Activity size={28} className="text-purple-500 dark:text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Нет событий</p>
            <p className="text-xs text-neutral-400 mt-1">{filterType ? 'Попробуйте выбрать другой тип фильтра' : 'События появятся здесь после действий с флагами, тегами и настройками'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, delay: idx * 0.02 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg border ${getResourceColor(event.resourceType)}`}>{getResourceIcon(event.resourceType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900 dark:text-neutral-200">{event.userName ?? event.userEmail}</span>
                      <span className="text-neutral-600 dark:text-neutral-400">{event.action}</span>
                      <span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent font-semibold">{event.resourceName}</span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">{event.details}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Clock size={12} />{new Date(event.createdAt).toLocaleString('ru-RU')}</span>
                      <span className="flex items-center gap-1"><User size={12} />{event.userEmail}</span>
                      {event.ipAddress && <span className="font-mono">IP: {event.ipAddress}</span>}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getResourceColor(event.resourceType)}`}>{getResourceIcon(event.resourceType)}{getResourceLabel(event.resourceType)}</span>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}