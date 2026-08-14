import { useMemo } from 'react';
import { FileText, Code2, Check, Copy, Braces, AlertTriangle } from '@/shared/icons';
import { useT, useLocale } from '@/i18n';
import { getMessages } from '@/i18n/messages';
import { TEMPLATE_VAR_KEYS, isValidJson, isJsonContentType } from './webhookUtils';
import type { HeaderRow } from './webhookUtils';

interface WebhookBodyEditorProps {
  body: string;
  headers: HeaderRow[];
  showTemplateHelp: boolean;
  copiedVar: string | null;
  onBodyChange: (v: string) => void;
  onToggleTemplateHelp: () => void;
  onCopyTemplateVar: (key: string) => void;
}

export function WebhookBodyEditor({
  body,
  headers,
  showTemplateHelp,
  copiedVar,
  onBodyChange,
  onToggleTemplateHelp,
  onCopyTemplateVar,
}: WebhookBodyEditorProps) {
  const t = useT();
  const { locale } = useLocale();

  const jsonContentType = useMemo(() => isJsonContentType(headers), [headers]);
  const jsonValid = useMemo(() => {
    if (!jsonContentType) return null;
    if (!body.trim()) return true;
    return isValidJson(body);
  }, [body, jsonContentType]);

  const templateVars = useMemo(() => {
    const messages = getMessages(locale);
    const vars = messages.integrations.templateVars as Record<string, string>;
    return TEMPLATE_VAR_KEYS.map((key) => ({
      key,
      label: vars[key] ?? key,
    }));
  }, [locale]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-body-sm font-medium text-foreground/80 flex items-center gap-1.5 justify-between">
          <span className="flex items-center gap-1.5">
            <FileText size={14} className="text-muted-foreground" />
            {t('integrations.body')}
            {jsonContentType && jsonValid !== null && (
              <span className="ml-1">
                {jsonValid ? (
                  <Check size={12} className="text-success inline" />
                ) : (
                  <AlertTriangle size={12} className="text-warning inline" />
                )}
              </span>
            )}
          </span>
          <span className="text-caption font-normal text-muted-foreground/70 dark:text-muted-foreground tabular-nums">
            {body.length}/10000
          </span>
        </label>
        <button
          type="button"
          onClick={onToggleTemplateHelp}
          className="text-caption text-brand hover:text-brand font-medium flex items-center gap-1 transition-colors"
        >
          {showTemplateHelp ? <Code2 size={12} /> : <Braces size={12} />}
          {showTemplateHelp ? t('integrations.hideVariables') : t('integrations.showVariables')}
        </button>
      </div>
      {showTemplateHelp && (
        <div className="p-3 bg-secondary border border-border rounded-xl space-y-0.5">
          {templateVars.map((v) => {
            const isCopied = copiedVar === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => onCopyTemplateVar(v.key)}
                className="w-full flex items-center justify-between text-left text-caption px-2 py-1.5 rounded-lg hover:bg-brand/10 transition-colors group"
              >
                <code className="text-brand font-mono">{`{{${v.key}}}`}</code>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {v.label}
                  {isCopied ? (
                    <Check size={12} className="text-success shrink-0" />
                  ) : (
                    <Copy
                      size={12}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        maxLength={10000}
        placeholder={t('integrations.bodyPlaceholder')}
        rows={7}
        aria-invalid={jsonContentType && jsonValid === false || undefined}
        aria-describedby={
          jsonContentType && jsonValid === false ? 'webhook-body-error' : undefined
        }
        className={`w-full bg-input-background border rounded-lg px-4 py-2.5 text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-y whitespace-pre overflow-x-auto ${
          jsonContentType && jsonValid === false ? 'border-warning/30' : 'border-border'
        }`}
      />
      {jsonContentType && jsonValid === false && (
        <p id="webhook-body-error" role="alert" className="text-caption text-palette-warning-600 dark:text-palette-warning-700">
          {t('integrations.bodyInvalidJson')}
        </p>
      )}
      <p className="text-caption text-muted-foreground/70 dark:text-muted-foreground">{t('integrations.bodyHint')}</p>
    </div>
  );
}
