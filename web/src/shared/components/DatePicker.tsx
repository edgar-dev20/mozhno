import React, { useState } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, X } from '@/shared/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar as CalendarComponent } from '@/app/components/ui/calendar';
import { useLocale, useT } from '@/i18n';
import { dateLocales } from '@/i18n/dateLocales';
import type { Locale } from 'date-fns/locale';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  presets?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function formatDisplay(date: Date, locale: Locale): string {
  return format(date, 'd MMM yyyy', { locale });
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  presets: showPresets = false,
  minDate,
  maxDate,
  className = '',
}: DatePickerProps) {
  const { locale } = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const dateLocale = dateLocales[locale] ?? enUS;

  const presets = [
    { label: t('common.today'), getValue: () => new Date() },
    {
      label: t('common.yesterday'),
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      },
    },
  ];

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(undefined);
  };

  const displayDate = value instanceof Date && !isNaN(value.getTime());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={`relative ${className}`}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={
              displayDate
                ? formatDisplay(value!, dateLocale)
                : (placeholder ?? t('common.selectDate'))
            }
            className={`inline-flex items-center gap-2 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors ${displayDate ? 'pr-8' : ''}`}
          >
            <Calendar size={14} className="text-muted-foreground/70 dark:text-muted-foreground shrink-0" />
            <span className={displayDate ? 'text-foreground/80' : 'text-muted-foreground'}>
              {displayDate
                ? formatDisplay(value!, dateLocale)
                : (placeholder ?? t('common.selectDate'))}
            </span>
          </button>
        </PopoverTrigger>
        {displayDate && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleClear}
            aria-label={t('common.clearFilter')}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <PopoverContent className="rounded-xl w-auto p-0 max-w-[calc(100vw-2rem)]" align="center" avoidCollisions={false}>
        <CalendarComponent
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          startMonth={minDate}
          endMonth={maxDate}
          locale={dateLocale}
        />
        {showPresets && (
          <div className="flex items-center justify-center gap-1.5 px-4 py-3 flex-wrap border-t border-border">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelect(preset.getValue())}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border bg-accent text-muted-foreground hover:bg-accent/80 border-transparent"
              >
                {preset.label}
              </button>
            ))}
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border bg-accent text-muted-foreground hover:bg-accent/80 border-transparent"
              >
                {t('common.clearFilter')}
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
