import { useState } from 'react';
import { Copy, Check } from '@/shared/icons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import { useT } from '@/i18n';

interface TruncatedCopyTooltipProps {
  value: string;
  className?: string;
}

export function TruncatedCopyTooltip({ value, className }: TruncatedCopyTooltipProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={value}
          className={`truncate max-w-full ${className ?? ''}`}
        >
          {value}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-caption flex items-center gap-2">
        <span className="select-all" aria-live="polite">
          {copied ? t('common.copied') : value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t('common.copy')}
          className="p-1.5 rounded hover:bg-popover-foreground/10 transition-colors shrink-0"
        >
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
        </button>
      </TooltipContent>
    </Tooltip>
  );
}
