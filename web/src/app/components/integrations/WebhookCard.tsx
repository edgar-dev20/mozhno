import { motion } from 'motion/react';
import { Webhook, AlertTriangle } from '@/shared/icons';
import { type Integration } from '@/api';
import { useT } from '@/i18n';
import { migrateEventKeys, parseWebhookConfig, parseEvents } from './webhookUtils';

interface WebhookCardProps {
  item: Integration;
  index: number;
  onEdit: (item: Integration) => void;
}

export function WebhookCard({ item, index, onEdit }: WebhookCardProps) {
  const t = useT();
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
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onEdit(item)}
    >
      <div
        className={`h-1.5 bg-gradient-to-r ${hasError ? 'from-destructive to-warning' : 'from-gradient-start to-gradient-end'}`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end border border-blue-200/50 dark:border-brand/20 shrink-0">
              {hasError ? (
                <AlertTriangle size={18} className="text-warning" />
              ) : (
                <Webhook size={18} className="text-info" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground/70 font-mono mt-0.5 truncate">
                {cfg.url || t('integrations.urlNotSet')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {item.enabled ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-success/10 text-success border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {t('integrations.status.connected')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-accent text-muted-foreground border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              {t('integrations.status.disconnected')}
            </span>
          )}
          {hasError && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full leading-none bg-warning/10 text-warning border border-warning/20"
              title={item.lastError!}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {t('integrations.status.error')}
            </span>
          )}
          <span className="text-xs text-muted-foreground/70">
            {evts.length > 0
              ? t('integrations.eventCount', { count: String(evts.length) })
              : t('integrations.noEvents')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
