import React from 'react';
import { Upload } from '@/shared/icons';
import { GradientButton } from '@/shared';
import { useT } from '@/i18n';

interface CreateProjectStepProps {
  projectName: string;
  setProjectName: (v: string) => void;
  projectDesc: string;
  setProjectDesc: (v: string) => void;
  creating: boolean;
  error: string;
  pendingLogoFile: File | null;
  pendingLogoPreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  existingProjectId: number | null;
}

export function CreateProjectStep({
  projectName,
  setProjectName,
  projectDesc,
  setProjectDesc,
  creating,
  error,
  pendingLogoFile,
  pendingLogoPreviewUrl,
  fileInputRef,
  onLogoUpload,
  onCreate,
  existingProjectId,
}: CreateProjectStepProps) {
  const t = useT();
  const isEditing = existingProjectId != null;
  return (
    <div className="space-y-3 flex-1">
      <div>
        <label
          htmlFor="onboarding-project-name"
          className="block text-body-sm font-medium text-foreground/80 mb-1.5"
        >
          {t('onboarding.projectNameLabel')}
        </label>
        <input
          id="onboarding-project-name"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          maxLength={120}
          placeholder={t('onboarding.projectNamePlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
        />
        <div className="text-caption font-normal text-muted-foreground tabular-nums text-right mt-0.5">
          {projectName.length}/120
        </div>
      </div>
      <div>
        <label
          htmlFor="onboarding-project-desc"
          className="block text-body-sm font-medium text-foreground/80 mb-1.5"
        >
          {t('onboarding.projectDescLabel')}
        </label>
        <textarea
          id="onboarding-project-desc"
          value={projectDesc}
          onChange={(e) => setProjectDesc(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t('onboarding.projectDescPlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
        />
        <div className="text-caption font-normal text-muted-foreground tabular-nums text-right mt-0.5">
          {projectDesc.length}/500
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onLogoUpload}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        {pendingLogoPreviewUrl && (
          <img
            src={pendingLogoPreviewUrl}
            alt={t('onboarding.logoPreviewAlt')}
            className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
          />
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-caption font-medium text-muted-foreground hover:text-foreground bg-secondary border border-border rounded-lg transition-colors"
        >
          <Upload size={12} />
          {pendingLogoFile ? pendingLogoFile.name : t('onboarding.uploadLogo')}
        </button>
      </div>
      <p className="text-caption text-muted-foreground">{t('onboarding.logoHint')}</p>
      {error && (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
      <GradientButton onClick={onCreate} disabled={creating} loading={creating} className="w-full">
        {isEditing ? t('onboarding.saveAndContinue') : t('onboarding.createProject')}
      </GradientButton>
    </div>
  );
}
