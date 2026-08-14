import { Switch } from '@/app/components/ui/switch';
import { FormField, ErrorBox } from '@/shared';
import { Globe, AlertTriangle, Clock } from '@/shared/icons';
import { useT } from '@/i18n';
import { WebhookCurlPreview } from './WebhookCurlPreview';
import { WebhookHeadersEditor } from './WebhookHeadersEditor';
import { WebhookBodyEditor } from './WebhookBodyEditor';
import { WebhookEventsPicker } from './WebhookEventsPicker';
import type { WebhookFormState } from './useWebhookForm';

interface WebhookPanelProps {
  form: WebhookFormState;
  limitRemaining: number;
  showError: boolean;
  editingLastError: string | null;
}

export function WebhookPanel({
  form,
  limitRemaining,
  showError,
  editingLastError,
}: WebhookPanelProps) {
  const t = useT();

  return (
    <div className="space-y-6">
      {form.error && <ErrorBox>{form.error}</ErrorBox>}

      <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
        <div>
          <div className="font-medium text-body-sm text-foreground">{t('integrations.enable')}</div>
          <div className="text-caption text-muted-foreground mt-0.5">
            {t('integrations.enableHint')}
            {limitRemaining < Number.MAX_SAFE_INTEGER && (
              <span className="ml-2 text-brand">
                · {t('integrations.enableRemaining')}: {limitRemaining}
              </span>
            )}
          </div>
        </div>
        <Switch
          checked={form.formEnabled}
          onCheckedChange={form.setFormEnabled}
        />
      </div>

      <FormField
        label={t('integrations.name')}
        hint={t('integrations.nameHint')}
        maxLength={120}
        value={form.formName}
      >
        <input
          type="text"
          value={form.formName}
          onChange={(e) => form.setFormName(e.target.value)}
          maxLength={120}
          placeholder={t('integrations.namePlaceholder')}
          autoFocus={!form.editing}
          className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
        />
      </FormField>

      <FormField
        label={t('integrations.url')}
        hint={
          form.urlError ? t(form.urlError as 'integrations.urlRequired') : t('integrations.urlHint')
        }
        maxLength={2048}
        value={form.formUrl}
      >
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={form.formUrl}
            onChange={(e) => form.setFormUrl(e.target.value)}
            maxLength={2048}
            placeholder={t('integrations.urlPlaceholder')}
            className={`w-full bg-input-background border rounded-lg px-4 py-2.5 text-body-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground ${
              form.urlError ? 'border-warning/30' : 'border-border'
            }`}
          />
        </div>
      </FormField>

      {showError && editingLastError && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-body-sm font-medium text-palette-warning-600 dark:text-palette-warning-700">
                {t('integrations.lastDeliveryError')}
              </div>
              <div className="text-caption text-palette-warning-600 dark:text-palette-warning-700 mt-1 font-mono whitespace-pre-wrap break-all">
                {editingLastError}
              </div>
              <div className="flex items-center gap-1 mt-2 text-caption text-palette-warning-600 dark:text-palette-warning-700">
                <Clock size={11} />
                {t('integrations.deliveryErrorHint')}
              </div>
            </div>
          </div>
        </div>
      )}

      <WebhookCurlPreview
        formUrl={form.formUrl}
        formHeaders={form.formHeaders}
        formBody={form.formBody}
      />

      <WebhookHeadersEditor
        headers={form.formHeaders}
        onAdd={form.addHeaderRow}
        onRemove={form.removeHeaderRow}
        onUpdate={form.updateHeader}
      />

      <WebhookBodyEditor
        body={form.formBody}
        headers={form.formHeaders}
        showTemplateHelp={form.showTemplateHelp}
        copiedVar={form.copiedVar}
        onBodyChange={form.setFormBody}
        onToggleTemplateHelp={() => form.setShowTemplateHelp(!form.showTemplateHelp)}
        onCopyTemplateVar={form.copyTemplateVar}
      />

      <WebhookEventsPicker
        formEvents={form.formEvents}
        expandedCats={form.expandedCats}
        onFormEventsChange={form.setFormEvents}
        onToggleCatExpand={form.toggleCatExpand}
      />
    </div>
  );
}
