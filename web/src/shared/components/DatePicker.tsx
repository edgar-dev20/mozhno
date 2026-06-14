import React, { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Calendar, X } from "@/shared/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Calendar as CalendarComponent } from "@/app/components/ui/calendar";
import { useT } from "@/i18n";

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  presets?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function formatDisplay(date: Date): string {
  return format(date, "d MMM yyyy", { locale: ru });
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  presets: showPresets = false,
  minDate,
  maxDate,
  className = "",
}: DatePickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const presets = [
    { label: t("common.today"), getValue: () => new Date() },
    { label: t("common.yesterday"), getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
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
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={placeholder ?? t("common.selectDate")}
          className={`inline-flex items-center gap-2 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors ${className}`}
        >
          <Calendar size={14} className="text-muted-foreground/70 shrink-0" />
          <span className={displayDate ? "text-foreground/80" : "text-muted-foreground"}>
            {displayDate ? formatDisplay(value!) : placeholder ?? t("common.selectDate")}
          </span>
          {displayDate && (
            <span
              onClick={handleClear}
              className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={13} />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="rounded-xl w-auto p-0" align="center">
        <CalendarComponent
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          fromDate={minDate}
          toDate={maxDate}
          locale={ru}
          initialFocus
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
                onClick={() => handleSelect(undefined)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border bg-accent text-muted-foreground hover:bg-accent/80 border-transparent"
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