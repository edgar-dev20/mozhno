import React, { useState, useMemo, useCallback } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, Clock, X, Check } from '@/shared/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar as CalendarComponent } from '@/app/components/ui/calendar';
import { useLocale, useT } from '@/i18n';
import { dateLocales } from '@/i18n/dateLocales';

interface DateTimePickerProps {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
}

function parseISO(value?: string): { date: Date | null; hours: string; minutes: string } {
  if (!value) return { date: null, hours: '', minutes: '' };
  try {
    let d: Date;
    if (/^\d{2}:\d{2}$/.test(value)) {
      d = new Date('1970-01-01T' + value + ':00');
    } else {
      d = new Date(value);
    }
    if (isNaN(d.getTime())) return { date: null, hours: '', minutes: '' };
    return {
      date: d,
      hours: String(d.getHours()).padStart(2, '0'),
      minutes: String(d.getMinutes()).padStart(2, '0'),
    };
  } catch {
    return { date: null, hours: '', minutes: '' };
  }
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  className = '',
}: DateTimePickerProps) {
  const { locale } = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const dateLocale = dateLocales[locale] ?? enUS;

  const parsed = useMemo(() => parseISO(value), [value]);
  const [date, setDate] = useState<Date | undefined>(parsed.date ?? undefined);
  const [hours, setHoursState] = useState(parsed.hours);
  const [minutes, setMinutesState] = useState(parsed.minutes);

  const resetState = useCallback(() => {
    const p = parseISO(value);
    setDate(p.date ?? undefined);
    setHoursState(p.hours);
    setMinutesState(p.minutes);
  }, [value]);

  const handleOpenChange = useCallback(
    (openVal: boolean) => {
      if (openVal) resetState();
      setOpen(openVal);
    },
    [resetState],
  );

  const handleConfirm = useCallback(() => {
    if (!date) return;
    const d = setMinutes(setHours(date, parseInt(hours, 10) || 0), parseInt(minutes, 10) || 0);
    onChange(d.toISOString());
    setOpen(false);
  }, [date, hours, minutes, onChange]);

  const displayText = useMemo(() => {
    if (!value) return placeholder ?? t('common.selectDateTime');
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return placeholder ?? t('common.selectDateTime');
      return format(d, 'd MMM yyyy, HH:mm', { locale: dateLocale });
    } catch {
      return placeholder ?? t('common.selectDateTime');
    }
  }, [value, placeholder, dateLocale, t]);

  const hasValue = value && value.length > 0;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={placeholder ?? t('common.selectDateTime')}
          className={`inline-flex items-center gap-2 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors ${className}`}
        >
          <Calendar size={14} className="text-muted-foreground/70 shrink-0" />
          <span className={hasValue ? 'text-foreground/80' : 'text-muted-foreground'}>
            {displayText}
          </span>
          {hasValue && (
            <span
              onClick={handleClear}
              className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={13} />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="rounded-xl w-auto p-0" align="center" avoidCollisions={false}>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(d) => setDate(d)}
          locale={dateLocale}
        />
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-border pt-3">
          <Clock size={14} className="text-muted-foreground shrink-0" />
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHoursState(e.target.value)}
            placeholder="HH"
            className="w-14 bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
          />
          <span className="text-muted-foreground text-sm font-medium">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutesState(e.target.value)}
            placeholder="MM"
            className="w-14 bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!date}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--color-gradient-start), var(--color-gradient-end))',
            }}
          >
            <Check size={14} />
            {t('common.add')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
