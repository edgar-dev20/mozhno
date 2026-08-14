import { Info } from '@/shared/icons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';

interface InfoTipProps {
  /** Explanatory text shown on hover / focus. */
  text: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: number;
  className?: string;
}

/**
 * Small, accessible info affordance: a muted "ⓘ" icon that reveals a concise
 * explanation on hover or keyboard focus. Used to document dashboard metrics
 * and states consistently.
 */
export function InfoTip({ text, side = 'top', size = 12, className = '' }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={text}
          className={`inline-flex items-center justify-center rounded-full p-1 -m-1 text-muted-foreground/70 dark:text-muted-foreground hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors cursor-help align-middle ${className}`}
        >
          <Info size={size} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-[220px] leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
