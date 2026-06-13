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
        caption: "flex justify-center pt-1 relative items-center w-full mb-2",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center gap-1",
        nav_button:
          "size-8 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-colors inline-flex items-center justify-center",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground/70 size-8 font-medium text-xs uppercase tracking-wider inline-flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 size-8 [&:has([aria-selected])]:bg-primary/10 dark:[&:has([aria-selected])]:bg-primary/20 [&:has([aria-selected].day-range-end)]:rounded-r-xl",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl"
            : "[&:has([aria-selected])]:rounded-xl",
        ),
        day: "size-8 rounded-xl p-0 font-normal aria-selected:opacity-100 hover:bg-accent text-foreground/80 inline-flex items-center justify-center",
        day_range_start:
          "day-range-start aria-selected:bg-gradient-to-r aria-selected:from-gradient-start aria-selected:to-gradient-end aria-selected:text-white rounded-l-xl",
        day_range_end:
          "day-range-end aria-selected:bg-gradient-to-r aria-selected:from-gradient-start aria-selected:to-gradient-end aria-selected:text-white rounded-r-xl",
        day_selected:
          "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-sm",
        day_today:
          "ring-1 ring-primary/30 dark:ring-primary/40 font-semibold",
        day_outside:
          "day-outside text-muted-foreground/30 dark:text-muted-foreground/20 aria-selected:text-muted-foreground",
        day_disabled: "opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-primary/10 dark:aria-selected:bg-primary/20 aria-selected:text-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
