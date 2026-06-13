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
}: CreateProjectStepProps) {
  const t = useT();
  return (
    <div className="space-y-3 flex-1">
      <div>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          maxLength={120}
          placeholder={t('onboarding.projectNamePlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
        />
        <div className="text-xs font-normal text-muted-foreground/50 tabular-nums text-right mt-0.5">
          {projectName.length}/120
        </div>
      </div>
      <div>
        <textarea
          value={projectDesc}
          onChange={(e) => setProjectDesc(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t('onboarding.projectDescPlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
        />
        <div className="text-xs font-normal text-muted-foreground/50 tabular-nums text-right mt-0.5">
          {projectDesc.length}/500
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        onChange={onLogoUpload}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        {pendingLogoPreviewUrl && (
          <img
            src={pendingLogoPreviewUrl}
            alt="Logo preview"
            className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
          />
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary border border-border rounded-lg transition-colors"
        >
          <Upload size={12} />
          {pendingLogoFile ? pendingLogoFile.name : t('onboarding.uploadLogo')}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{t('onboarding.logoHint')}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <GradientButton onClick={onCreate} disabled={creating} loading={creating} className="w-full">
        {t('onboarding.createProject')}
      </GradientButton>
    </div>
  );
}
