import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { X } from '@/shared/icons';
import { useT } from '@/i18n';

interface MultiValueChipsProps {
  values: string[];
  onChange: (values: string[]) => void;
  autoFocus?: boolean;
  validValues?: string[];
}

export function MultiValueChips({ values, onChange, autoFocus, validValues }: MultiValueChipsProps) {
  const t = useT();
  const [input, setInput] = useState('');
  const [shakeId, setShakeId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const addValue = useCallback(
    (raw: string) => {
      const v = raw.trim();
      if (!v) return;
      if (values.length >= 100) return;
      if (values.includes(v)) {
        const idx = values.indexOf(v);
        setShakeId(idx);
        setTimeout(() => setShakeId(null), 500);
        return;
      }
      onChange([...values, v]);
      setInput('');
    },
    [values, onChange],
  );

  const removeValue = useCallback(
    (idx: number) => {
      const next = values.filter((_, i) => i !== idx);
      onChange(next);
      if (next.length === 0) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [values, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addValue(input);
      } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
        removeValue(values.length - 1);
      }
    },
    [input, values, addValue, removeValue],
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => {
          const hasWhitelist = validValues && validValues.length > 0;
          const inWhitelist = hasWhitelist ? validValues!.includes(v) : true;
          return (
          <span
            key={i}
            data-shake={shakeId === i ? '' : undefined}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium border animate-in fade-in zoom-in-95 duration-150 data-[shake]:animate-[shake_400ms_ease-in-out] ${
              hasWhitelist
                ? inWhitelist
                  ? 'bg-success/10 text-success dark:text-palette-success-700 border-success/20'
                  : 'bg-warning/10 text-palette-warning-700 border-warning/30'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            <span className="max-w-[160px] truncate">{v}</span>
            <button
              type="button"
              onClick={() => removeValue(i)}
              aria-label={`${t('common.remove')}: ${v}`}
              className={`shrink-0 p-1.5 rounded-sm transition-colors -mr-0.5 hover:text-destructive focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                hasWhitelist
                  ? inWhitelist
                    ? 'text-success dark:text-palette-success-700'
                    : 'text-palette-warning-700'
                  : ''
              }`}
            >
              <X size={12} />
            </button>
          </span>
        );
        })}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t('flags.chipInputLabel')}
          placeholder={
            values.length === 0 ? t('flags.chipEmptyPlaceholder') : t('flags.chipPlaceholder')
          }
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none rounded-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring text-caption placeholder:text-muted-foreground/60 px-1.5 py-1"
        />
      </div>
      <p className="text-caption text-muted-foreground leading-none">
        {values.length > 0 ? t('flags.chipHint') : t('flags.chipHintEmpty')}
      </p>
    </div>
  );
}
