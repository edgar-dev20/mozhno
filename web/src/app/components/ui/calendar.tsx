'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { addMonths, addYears, setMonth, setYear, startOfMonth } from 'date-fns';

import { useLocale } from '@/i18n';
import { cn } from '@/app/components/ui/utils';

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CaptionView = 'days' | 'months' | 'years';

function MonthYearCaption({
  month,
  view,
  onViewChange,
  onMonthChange,
  months,
}: {
  month: Date;
  view: CaptionView;
  onViewChange: (v: CaptionView) => void;
  onMonthChange: (d: Date) => void;
  months: string[];
}) {
  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();

  if (view === 'months') {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-between w-full mb-1">
          <button
            type="button"
            onClick={() => onMonthChange(addYears(month, -1))}
            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('years')}
            className="text-sm font-semibold text-foreground hover:bg-muted px-2 py-1 rounded-lg transition-colors"
          >
            {currentYear}
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addYears(month, 1))}
            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1 w-full">
          {months.map((name, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onMonthChange(setMonth(month, i));
                onViewChange('days');
              }}
              className={cn(
                'h-9 rounded-xl text-sm font-medium transition-colors',
                i === currentMonth
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-muted',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'years') {
    const decadeStart = Math.floor(currentYear / 12) * 12;
    const decadeEnd = decadeStart + 11;
    const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);

    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-between w-full mb-1">
          <button
            type="button"
            onClick={() => onMonthChange(setYear(month, decadeStart - 12))}
            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {decadeStart} – {decadeEnd}
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(setYear(month, decadeStart + 12))}
            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1 w-full">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                onMonthChange(setYear(month, y));
                onViewChange('months');
              }}
              className={cn(
                'h-9 rounded-xl text-sm font-medium transition-colors',
                y === currentYear
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-muted',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 w-full">
      <button
        type="button"
        onClick={() => onMonthChange(addMonths(month, -1))}
        className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('months')}
        className="text-sm font-semibold text-foreground hover:bg-muted px-1.5 py-1 rounded-lg transition-colors"
      >
        {months[currentMonth]}
      </button>
      <button
        type="button"
        onClick={() => onViewChange('years')}
        className="text-sm font-semibold text-foreground hover:bg-muted px-1.5 py-1 rounded-lg transition-colors"
      >
        {currentYear}
      </button>
      <button
        type="button"
        onClick={() => onMonthChange(addMonths(month, 1))}
        className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: monthProp,
  onMonthChange: onMonthChangeProp,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const [captionView, setCaptionView] = React.useState<CaptionView>('days');
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    monthProp ?? startOfMonth(new Date()),
  );
  const { locale } = useLocale();
  const months = locale === 'ru' ? MONTHS_RU : MONTHS_EN;

  React.useEffect(() => {
    if (monthProp) setInternalMonth(monthProp);
  }, [monthProp]);

  const handleMonthChange = React.useCallback(
    (d: Date) => {
      setInternalMonth(d);
      onMonthChangeProp?.(d);
    },
    [onMonthChangeProp],
  );

  const isPicker = captionView !== 'days';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={internalMonth}
      onMonthChange={handleMonthChange}
      className={cn('p-4', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2 items-center justify-center',
        month: 'flex flex-col gap-3',
        month_caption: cn(
          'flex justify-center pt-1 relative items-center w-full mb-2',
          isPicker && 'mb-0',
        ),
        caption_label: 'text-sm font-semibold text-foreground',
        nav: 'hidden',
        button_previous: 'hidden',
        button_next: 'hidden',
        month_grid: cn('w-full border-collapse', isPicker && 'hidden'),
        weekdays: cn('flex w-full', isPicker && 'hidden'),
        weekday:
          'text-muted-foreground/70 size-8 font-medium text-xs uppercase tracking-wider inline-flex items-center justify-center',
        weeks: cn('flex flex-col mt-2', isPicker && 'hidden'),
        week: 'flex w-full',
        day: cn(
          'relative p-0 text-center text-sm text-foreground/80 focus-within:relative focus-within:z-20 size-8 group [&:not(:has([aria-selected=true]))]:hover:bg-muted transition-colors',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl'
            : '[&:has([aria-selected])]:rounded-xl',
        ),
        day_button: 'size-8 rounded-xl p-0 font-normal inline-flex items-center justify-center',
        selected: 'bg-brand text-brand-foreground shadow-sm [&.today]:ring-brand/40',
        range_start: 'bg-brand text-brand-foreground rounded-l-xl',
        range_end: 'bg-brand text-brand-foreground rounded-r-xl',
        range_middle: 'bg-chart-4/15 dark:bg-chart-4/20 text-foreground rounded-none',
        today: 'ring-1 ring-brand/30 dark:ring-brand/40 font-semibold',
        outside:
          'text-muted-foreground/30 dark:text-muted-foreground/20 aria-selected:text-muted-foreground',
        disabled: 'opacity-30 cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        MonthCaption: () => (
          <MonthYearCaption
            month={internalMonth}
            view={captionView}
            onViewChange={setCaptionView}
            onMonthChange={handleMonthChange}
            months={months}
          />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
