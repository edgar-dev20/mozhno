import React, { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Calendar, X } from "@/shared/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Calendar as CalendarComponent } from "@/app/components/ui/calendar";
import { useT } from "@/i18n";

interface DateRangePickerProps {
  from?: Date | null;
  to?: Date | null;
  onChange: (from: Date | undefined, to: Date | undefined) => void;
  placeholder?: string;
  presets?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function formatDisplay(date: Date): string {
  return format(date, "d MMM yyyy", { locale: ru });
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder,
  presets: showPresets = false,
  minDate,
  maxDate,
  className = "",
}: DateRangePickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const presets = [
    { label: t("common.today"), getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: t("common.last7days"), getValue: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); return { from, to }; } },
    { label: t("common.last30days"), getValue: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29); return { from, to }; } },
  ];

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      onChange(range.from, range.to);
    } else {
      onChange(undefined, undefined);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(undefined, undefined);
  };

  const displayFrom = from instanceof Date && !isNaN(from.getTime());
  const displayTo = to instanceof Date && !isNaN(to.getTime());
  const hasValue = displayFrom || displayTo;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-sm hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors ${className}`}
        >
          <Calendar size={14} className="text-muted-foreground/70 shrink-0" />
          <span className={hasValue ? "text-foreground/80" : "text-muted-foreground"}>
            {hasValue
              ? `${displayFrom ? formatDisplay(from!) : t("common.from")} - ${displayTo ? formatDisplay(to!) : t("common.to")}`
              : placeholder ?? t("common.selectPeriod")}
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
      <PopoverContent className="rounded-2xl w-auto p-0" align="center">
        <CalendarComponent
          mode="range"
          selected={hasValue ? { from: from ?? undefined, to: to ?? undefined } : undefined}
          onSelect={handleSelect}
          fromDate={minDate}
          toDate={maxDate}
          locale={ru}
          initialFocus
          numberOfMonths={1}
        />
        {showPresets && (
          <div className="flex items-center justify-center gap-1.5 px-4 py-3 flex-wrap border-t border-border">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const value = preset.getValue();
                  onChange(value.from, value.to);
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border bg-accent text-muted-foreground hover:bg-accent/80 border-transparent"
              >
                {preset.label}
              </button>
            ))}
            {hasValue && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined, undefined);
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border border-transparent bg-accent text-muted-foreground hover:bg-accent/80"
              >
                {t("common.clearFilter")}
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}