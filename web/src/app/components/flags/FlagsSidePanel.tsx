import type { FlagView } from '@/app/hooks/flagTypes';
import type { FlagTagValue, SegmentResponse, ContextDefinition, Tag as TagType } from '@/api';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { DiffChange } from '@/shared/diffUtils';
import type { PanelEditingState } from '@/app/hooks/useFlagPanels';
import { SidePanel } from '@/app/components/SidePanel';
import { InlineDiffBar } from '@/app/components/InlineDiffBar';
import { ErrorBox, GradientButton } from '@/shared';
import { FlagCreatePanel } from '@/app/components/flags/FlagCreatePanel';
import { FlagEditPanel } from '@/app/components/flags/FlagEditPanel';
import { FlagEnvironmentPanel } from '@/app/components/flags/FlagEnvironmentPanel';
import { createFormId, editFormId } from '@/app/components/flags/formIds';
import { isMultiOperator } from '@/app/components/operatorsMeta';
import { isConstraintValueValid } from '@/app/components/operators';
import { useT } from '@/i18n';
import type { CreateFlagFormValues, EditFlagFormValues } from '@/app/components/flags/schemas';

interface FlagsSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editing: PanelEditingState;
  generalDirty: boolean;
  envRulePercent: number;
  envRuleSegments: number[];
  envRuleConstraints: ConstraintGroup[];
  envRuleEnabled: boolean;
  isEnvDirty: boolean;
  activeGroupId: string | null;
  saving: boolean;
  error: string;
  diffOpen: boolean;
  diffChanges: DiffChange[];
  onDiffDismiss: () => void;
  onConfirmDiff: () => void;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
  allTags: TagType[];
  onSaveCreate: (data: CreateFlagFormValues, tags: FlagTagValue[]) => void;
  onSaveGeneral: (data: EditFlagFormValues, tags: FlagTagValue[]) => void;
  onSaveEnvironment: () => void;
  onSetEnvRulePercent: (v: number) => void;
  onSetEnvRuleSegments: (v: number[]) => void;
  onSetEnvRuleConstraints: (v: ConstraintGroup[]) => void;
  onSetEnvRuleEnabled: (v: boolean) => void;
  onSetActiveGroupId: (id: string | null) => void;
  onSetGeneralDirty: (dirty: boolean) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

export function FlagsSidePanel({
  open,
  onOpenChange,
  onClose,
  editing,
  generalDirty,
  envRulePercent,
  envRuleSegments,
  envRuleConstraints,
  envRuleEnabled,
  isEnvDirty,
  activeGroupId,
  saving,
  error,
  diffOpen,
  diffChanges,
  onDiffDismiss,
  onConfirmDiff,
  environments,
  segments,
  contexts,
  allTags,
  onSaveCreate,
  onSaveGeneral,
  onSaveEnvironment,
  onSetEnvRulePercent,
  onSetEnvRuleSegments,
  onSetEnvRuleConstraints,
  onSetEnvRuleEnabled,
  onSetActiveGroupId,
  onSetGeneralDirty,
  onArchive,
  onUnarchive,
  onDelete,
}: FlagsSidePanelProps) {
  const t = useT();

  const title =
    editing.mode === 'create'
      ? t('flags.createTitle')
      : editing.mode === 'general'
        ? t('flags.generalSettings')
        : `${t('flags.environmentTitle')} ${environments.find((e) => e.id === editing.envId)?.name ?? ''}`;

  const description =
    editing.mode === 'create'
      ? t('flags.createDescription')
      : editing.mode === 'general'
        ? t('flags.generalDescription')
        : t('flags.environmentDescription');

  const activeFormId =
    editing.mode === 'create' ? createFormId : editing.mode === 'general' ? editFormId : undefined;

  const saveLabel = t('common.saveChanges');
  const hasInvalidConstraints = envRuleConstraints.some((g) => {
    if (g.contextDefId === 0) return false;
    if (!g.operator || g.operator.trim() === '') return true;
    if (g.values.length === 0 || g.values.every((v) => v.trim() === '')) return true;
    const ctx = Array.isArray(contexts) ? contexts.find((c) => c.id === g.contextDefId) : undefined;
    const isMulti = isMultiOperator(g.operator);
    if (!isMulti && g.values.length > 1) return true;
    return !isConstraintValueValid(ctx?.type, g.values[0] ?? '', g.operator);
  });

  const saveDisabled =
    saving ||
    (editing.mode === 'environment' && !isEnvDirty) ||
    (editing.mode === 'general' && !generalDirty) ||
    hasInvalidConstraints;

  return (
    <SidePanel
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          return;
        }
        onOpenChange(true);
      }}
      title={title}
      description={description}
      diffSlot={diffOpen ? <InlineDiffBar changes={diffChanges} /> : undefined}
      onDiffDismiss={diffOpen ? onDiffDismiss : undefined}
      footer={
        diffOpen ? (
          <>
            <GradientButton variant="ghost" onClick={onDiffDismiss}>
              {t('common.cancel')}
            </GradientButton>
            <GradientButton onClick={onConfirmDiff} disabled={hasInvalidConstraints} loading={saving}>
              {t('common.applyChanges')}
            </GradientButton>
          </>
        ) : (
          <>
            <GradientButton variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </GradientButton>
            {editing.mode === 'create' || editing.mode === 'general' ? (
              <GradientButton
                type="submit"
                form={activeFormId}
                disabled={saveDisabled}
                loading={saving}
              >
                {saveLabel}
              </GradientButton>
            ) : (
              <GradientButton onClick={onSaveEnvironment} disabled={saveDisabled} loading={saving}>
                {saveLabel}
              </GradientButton>
            )}
          </>
        )
      }
    >
      <div className="space-y-5">
        {error && <ErrorBox>{error}</ErrorBox>}

        {editing.mode === 'create' && (
          <FlagCreatePanel allTags={allTags} onSave={onSaveCreate} />
        )}

        {editing.mode === 'general' && editing.flag && (
          <FlagEditPanel
            flag={editing.flag}
            allTags={allTags}
            onSave={onSaveGeneral}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
            onDirtyChange={onSetGeneralDirty}
          />
        )}

        {editing.mode === 'environment' && (
          <FlagEnvironmentPanel
            envRulePercent={envRulePercent}
            onEnvRulePercentChange={onSetEnvRulePercent}
            envRuleSegments={envRuleSegments}
            onEnvRuleSegmentsChange={onSetEnvRuleSegments}
            envRuleConstraintGroups={envRuleConstraints}
            onEnvRuleConstraintGroupsChange={onSetEnvRuleConstraints}
            envRuleEnabled={envRuleEnabled}
            onEnvRuleEnabledChange={onSetEnvRuleEnabled}
            segments={segments}
            contexts={contexts}
            activeGroupId={activeGroupId}
            onActiveGroupIdChange={onSetActiveGroupId}
            envName={environments.find((e) => e.id === editing.envId)?.name}
          />
        )}
      </div>
    </SidePanel>
  );
}
