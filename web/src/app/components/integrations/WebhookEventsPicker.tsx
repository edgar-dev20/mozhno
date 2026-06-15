import { useMemo, useCallback } from 'react';
import { ChevronDown } from '@/shared/icons';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useT, useLocale } from '@/i18n';
import { getMessages } from '@/i18n/messages';
import {
  ALL_EVENTS,
  EVENT_CATEGORY_KEYS,
  CATEGORY_EVENT_MAP,
  type EventCategoryKey,
  categoryI18nKey,
} from './webhookUtils';

interface WebhookEventsPickerProps {
  formEvents: string[];
  expandedCats: Set<EventCategoryKey>;
  onFormEventsChange: React.Dispatch<React.SetStateAction<string[]>>;
  onToggleCatExpand: (catKey: EventCategoryKey) => void;
}

export function WebhookEventsPicker({
  formEvents,
  expandedCats,
  onFormEventsChange,
  onToggleCatExpand,
}: WebhookEventsPickerProps) {
  const t = useT();
  const { locale } = useLocale();

  const formEventSet = useMemo(() => new Set(formEvents), [formEvents]);

  const eventCategories = useMemo(() => {
    const messages = getMessages(locale);
    const descriptions = messages.integrations.eventDescriptions as Record<
      string,
      { title: string; desc: string }
    >;
    return EVENT_CATEGORY_KEYS.map((catKey) => {
      const events = CATEGORY_EVENT_MAP[catKey];
      return {
        catKey,
        label: t(categoryI18nKey(catKey)),
        events: events.map((eventKey) => {
          const evt = descriptions[eventKey];
          return {
            key: eventKey,
            title: evt?.title ?? eventKey,
            desc: evt?.desc ?? '',
          };
        }),
      };
    });
  }, [t, locale]);

  const toggleAllEvents = useCallback(() => {
    onFormEventsChange((prev) => {
      if (prev.length === ALL_EVENTS.length) return [];
      return [...ALL_EVENTS];
    });
  }, [onFormEventsChange]);

  const toggleCatAll = useCallback(
    (catKey: EventCategoryKey) => {
      const keys = CATEGORY_EVENT_MAP[catKey];
      onFormEventsChange((prev) => {
        const set = new Set(prev);
        const allInCat = keys.every((key) => set.has(key));
        if (allInCat) {
          return prev.filter((k) => !keys.includes(k));
        } else {
          return [...new Set([...prev, ...keys])];
        }
      });
    },
    [onFormEventsChange],
  );

  const toggleEvent = useCallback(
    (key: string, checked: boolean) => {
      onFormEventsChange((prev) => {
        if (checked) {
          return [...prev, key];
        } else {
          return prev.filter((k) => k !== key);
        }
      });
    },
    [onFormEventsChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">
          {t('integrations.events')}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('integrations.eventsCount', {
              selected: String(formEvents.length),
              total: String(ALL_EVENTS.length),
            })}
          </span>
          <button
            type="button"
            onClick={toggleAllEvents}
            className="text-xs font-medium text-brand hover:text-brand transition-colors"
          >
            {formEvents.length === ALL_EVENTS.length
              ? t('integrations.deselectAll')
              : t('integrations.selectAll')}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {eventCategories.map((cat) => {
          const allInCat = cat.events.every((e) => formEventSet.has(e.key));
          const expanded = expandedCats.has(cat.catKey);
          return (
            <div
              key={cat.catKey}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                type="button"
                onClick={() => onToggleCatExpand(cat.catKey)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  />
                  <span className="text-sm font-medium text-foreground/80">
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cat.events.filter((e) => formEventSet.has(e.key)).length}/
                    {cat.events.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCatAll(cat.catKey);
                  }}
                  className="text-xs font-medium text-brand hover:text-brand transition-colors"
                >
                  {allInCat
                    ? t('integrations.deselectCategory')
                    : t('integrations.selectCategory')}
                </button>
              </button>
              {expanded && (
                <div className="px-3 pb-2.5 grid grid-cols-2 gap-1">
                  {cat.events.map((evt) => {
                    const checked = formEventSet.has(evt.key);
                    return (
                      <label
                        key={evt.key}
                        className={`flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${checked ? 'bg-brand/10' : 'hover:bg-secondary'}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            toggleEvent(evt.key, !!c);
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground/80">
                            {evt.title}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                            {evt.desc}
                          </div>
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
  );
}
