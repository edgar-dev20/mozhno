import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { X } from "@/shared/icons";
import { useT } from '@/i18n';

interface MultiValueChipsProps {
  values: string[];
  onChange: (values: string[]) => void;
  autoFocus?: boolean;
}

export function MultiValueChips({ values, onChange, autoFocus }: MultiValueChipsProps) {
  const t = useT();
  const [input, setInput] = useState('');
  const [shakeId, setShakeId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const addValue = useCallback((raw: string) => {
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
  }, [values, onChange]);

  const removeValue = useCallback((idx: number) => {
    const next = values.filter((_, i) => i !== idx);
    onChange(next);
    if (next.length === 0) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [values, onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue(input);
    } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
      removeValue(values.length - 1);
    }
  }, [input, values, addValue, removeValue]);

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-1.5"
      >
        {values.map((v, i) => (
          <span
            key={i}
            data-shake={shakeId === i ? '' : undefined}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-150 data-[shake]:animate-[shake_400ms_ease-in-out]"
          >
            <span className="max-w-[160px] truncate">{v}</span>
            <button
              type="button"
              onClick={() => removeValue(i)}
              className="shrink-0 p-0.5 rounded-sm hover:bg-primary/20 transition-colors -mr-0.5"
              tabIndex={-1}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? t('flags.chipEmptyPlaceholder') : t('flags.chipPlaceholder')}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-xs placeholder:text-muted-foreground/60 py-1"
        />
      </div>
      {values.length > 0 && (
        <p className="text-xs text-muted-foreground/60 leading-none">
          {t('flags.chipHint', { n: String(values.length) })}
        </p>
      )}
    </div>
  );
}
