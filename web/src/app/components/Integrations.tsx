import { useState } from 'react';
import { useT } from '@/i18n';
import { Plus, Webhook, Trash2, Bell } from '@/shared/icons';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, type Integration } from '@/api';
import { SidePanel } from '@/app/components/SidePanel';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { SectionHeader, EmptyState, GradientButton, getErrorMessage, Fab } from '@/shared';
import { IntegrationCardSkeletonList } from '@/app/components/skeletons';
import { useProjectQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { WebhookCard } from './integrations/WebhookCard';
import { WebhookPanel } from './integrations/WebhookPanel';
import { useWebhookForm } from './integrations/useWebhookForm';
import { buildHeadersMap } from './integrations/webhookUtils';

export function Integrations() {
  const queryClient = useQueryClient();
  const t = useT();

  const { data: project, isLoading: projectLoading } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: items = [], isLoading: loading, isError, error } = useQuery({
    queryKey: queryKeys.integrations.byProject(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      const all = await api.integrations.list();
      return all.filter((i) => i.type === 'custom_webhook');
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const { data: limitData } = useQuery({
    queryKey: queryKeys.integrations.webhookLimit(projectId),
    queryFn: () => api.integrations.webhookLimit(),
    enabled: !!projectId,
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const limitRemaining = limitData?.remaining ?? Number.MAX_SAFE_INTEGER;

  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const form = useWebhookForm();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('No project');
      const hdrs = buildHeadersMap(form.formHeaders);
      const configJson = JSON.stringify({
        url: form.formUrl,
        headers: hdrs,
        body: form.formBody,
      });
      const body = {
        type: 'custom_webhook',
        name: form.formName || 'Webhook',
        enabled: form.formEnabled,
        configJson,
        eventSubscriptionsJson: JSON.stringify(form.formEvents),
      };
      if (form.editing) {
        return api.integrations.update(form.editing.id, body);
      } else {
        return api.integrations.create(body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.byProject(projectId) });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      form.setError(getErrorMessage(e));
    },
    onSettled: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.integrations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.byProject(projectId) });
      setDeleteId(null);
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setDeleting(false),
  });

  const handleSave = () => {
    if (!projectId) return;
    form.setError('');
    setSaving(true);
    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  const openCreateAndReset = () => {
    form.openCreate();
    setPanelOpen(true);
  };

  const openEditAndReset = (item: Integration) => {
    form.openEdit(item);
    setPanelOpen(true);
  };

  const editingLastError = form.editing?.lastError ?? null;

  const canSave = form.isDirty && !form.urlError && !saving;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={t('integrations.title')}
          description={t('integrations.description')}
        />
        <div className="hidden sm:block">
          <GradientButton onClick={openCreateAndReset} icon={<Plus size={18} />}>
            {t('integrations.connect')}
          </GradientButton>
        </div>
      </div>

      <TipCard
        text={t('integrations.tipText')}
        label={t('integrations.tipLabel')}
        icon={<Bell />}
        storageKey="integrations"
      />

      {projectLoading || loading ? (
        <IntegrationCardSkeletonList count={3} />
      ) : isError ? (
        <EmptyState
          icon={<Webhook size={28} className="text-destructive" />}
          title={t('integrations.loadError')}
          description={getErrorMessage(error)}
          buttonLabel={t('common.retry')}
          onAction={() => queryClient.invalidateQueries({ queryKey: queryKeys.integrations.byProject(projectId) })}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Webhook size={28} className="text-info" />}
          title={t('integrations.emptyTitle')}
          description={t('integrations.emptyDescription')}
          buttonLabel={t('integrations.connect')}
          onAction={openCreateAndReset}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <WebhookCard key={item.id} item={item} index={idx} onEdit={openEditAndReset} />
            ))}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={form.editing ? t('integrations.configure') : t('integrations.connect')}
        description={
          form.editing
            ? t('integrations.panelEditDescription')
            : t('integrations.panelCreateDescription')
        }
        footer={
          <>
            {form.editing && (
              <button
                type="button"
                onClick={() => {
                  setDeleteId(form.editing!.id);
                }}
                className="px-5 py-2.5 text-body-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20 transition-all mr-auto"
              >
                <Trash2 size={16} className="inline mr-1.5" />
                {t('common.delete')}
              </button>
            )}
            <button
              onClick={() => setPanelOpen(false)}
              className="inline-flex items-center px-5 py-2.5 text-body-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <GradientButton onClick={handleSave} disabled={!canSave} loading={saving}>
              {t('common.saveChanges')}
            </GradientButton>
          </>
        }
      >
        <WebhookPanel
          form={form}
          limitRemaining={limitRemaining}
          showError={!!form.editing}
          editingLastError={editingLastError}
        />
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('integrations.confirmTitle')}
        description={t('integrations.confirmDescription', {
          name: items.find((i) => i.id === deleteId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        confirmPhrase={items.find((i) => i.id === deleteId)?.name}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <Fab onClick={openCreateAndReset} label={t('integrations.create')} />
    </div>
  );
}
