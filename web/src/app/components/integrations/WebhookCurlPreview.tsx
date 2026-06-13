import { useState, useCallback } from 'react';
import { Code2, Clipboard, Check } from '@/shared/icons';
import { useT } from '@/i18n';
import type { HeaderRow } from './webhookUtils';
import { buildCurlCommand } from './webhookUtils';

interface WebhookCurlPreviewProps {
  formUrl: string;
  formHeaders: HeaderRow[];
  formBody: string;
}

export function WebhookCurlPreview({ formUrl, formHeaders, formBody }: WebhookCurlPreviewProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const curlCommand = buildCurlCommand(formUrl, formHeaders, formBody);

  const copyCurl = useCallback(async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [curlCommand]);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-1.5">
          <Code2 size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {t('integrations.preview')}
          </span>
        </div>
        <button
          type="button"
          onClick={copyCurl}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
        >
          {copied ? <Check size={11} /> : <Clipboard size={11} />}
          {copied ? t('integrations.copied') : t('integrations.copy')}
        </button>
      </div>
      <pre className="p-3 bg-input-background text-xs text-foreground/80 font-mono whitespace-pre-wrap break-all m-0 overflow-x-auto">
        {curlCommand}
      </pre>
    </div>
  );
}
