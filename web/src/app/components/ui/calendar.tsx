"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/app/components/ui/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2 items-center justify-center",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center w-full mb-2",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center gap-1",
        button_previous:
          "size-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center absolute left-1",
        button_next:
          "size-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center absolute right-1",
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "text-muted-foreground/70 size-8 font-medium text-xs uppercase tracking-wider inline-flex items-center justify-center",
        weeks: "flex flex-col mt-2",
        week: "flex w-full",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 size-8 group [&:has([aria-selected])]:bg-primary/10 dark:[&:has([aria-selected])]:bg-primary/20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl"
            : "[&:has([aria-selected])]:rounded-xl",
        ),
        day_button:
          "size-8 rounded-xl p-0 font-normal hover:bg-accent text-foreground/80 inline-flex items-center justify-center group-aria-[selected]:text-white",
        selected:
          "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-sm",
        range_start:
          "bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-l-xl",
        range_end:
          "bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-r-xl",
        range_middle:
          "bg-primary/10 dark:bg-primary/20 text-foreground rounded-none",
        today:
          "ring-1 ring-primary/30 dark:ring-primary/40 font-semibold",
        outside:
          "text-muted-foreground/30 dark:text-muted-foreground/20 aria-selected:text-muted-foreground",
        disabled: "opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-4", className)} {...props} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
