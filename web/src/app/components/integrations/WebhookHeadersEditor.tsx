import { useState, useMemo, useCallback } from 'react';
import { Plus, X, ChevronDown } from '@/shared/icons';
import { useT } from '@/i18n';
import type { HeaderRow } from './webhookUtils';
import { STANDARD_HEADERS } from './webhookUtils';

interface WebhookHeadersEditorProps {
  headers: HeaderRow[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: 'key' | 'value', val: string) => void;
}

export function WebhookHeadersEditor({
  headers,
  onAdd,
  onRemove,
  onUpdate,
}: WebhookHeadersEditorProps) {
  const t = useT();
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<'key' | 'value' | null>(null);

  const existingKeys = useMemo(
    () => new Set(headers.map((h) => h.key.trim().toLowerCase())),
    [headers],
  );

  const suggestions = useMemo(() => {
    return STANDARD_HEADERS.filter((h) => !existingKeys.has(h.toLowerCase()));
  }, [existingKeys]);

  const getSuggestedHeaders = useCallback(
    (keyInput: string): string[] => {
      if (!keyInput.trim()) return suggestions;
      const lower = keyInput.toLowerCase();
      return STANDARD_HEADERS.filter(
        (h) => h.toLowerCase().includes(lower) && !existingKeys.has(h.toLowerCase()),
      );
    },
    [suggestions, existingKeys],
  );

  const applySuggestion = useCallback(
    (id: number, value: string) => {
      onUpdate(id, 'key', value);
      setFocusedRowId(null);
      setFocusedField(null);
    },
    [onUpdate],
  );

  const handleKeyFocus = useCallback(
    (id: number) => {
      setFocusedRowId(id);
      setFocusedField('key');
    },
    [],
  );

  const handleValueFocus = useCallback(
    (id: number) => {
      setFocusedRowId(id);
      setFocusedField('value');
    },
    [],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setFocusedRowId(null);
      setFocusedField(null);
    }, 200);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">
          {t('integrations.headers')}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-brand hover:text-brand font-medium flex items-center gap-1 transition-colors"
        >
          <Plus size={12} />
          {t('integrations.addHeader')}
        </button>
      </div>
      <div className="space-y-2">
        {headers.map((h) => {
          const showKeySuggestions =
            focusedRowId === h.id && focusedField === 'key';
          const filteredSuggestions = getSuggestedHeaders(h.key);

          return (
            <div key={h.id} className="flex items-center gap-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={h.key}
                  onChange={(e) => onUpdate(h.id, 'key', e.target.value)}
                  onFocus={() => handleKeyFocus(h.id)}
                  onBlur={handleBlur}
                  maxLength={500}
                  placeholder={t('integrations.headerKeyPlaceholder')}
                  className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                />
                {showKeySuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => applySuggestion(h.id, s)}
                        className="w-full text-left px-3 py-1.5 text-xs font-mono text-foreground/80 hover:bg-brand/10 hover:text-brand transition-colors flex items-center gap-2"
                      >
                        <ChevronDown size={10} className="text-muted-foreground shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={h.value}
                  onChange={(e) => onUpdate(h.id, 'value', e.target.value)}
                  onFocus={() => handleValueFocus(h.id)}
                  maxLength={500}
                  placeholder={t('integrations.headerValuePlaceholder')}
                  className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(h.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
