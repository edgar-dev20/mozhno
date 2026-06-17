import { Plus } from '@/shared/icons';
import { GradientButton } from '@/shared';
import { useT } from '@/i18n';

interface CreateFlagStepProps {
  flagName: string;
  setFlagName: (v: string) => void;
  flagKey: string;
  setFlagKey: (v: string) => void;
  creating: boolean;
  error: string;
  onCreate: () => void;
}

export function CreateFlagStep({
  flagName,
  setFlagName,
  flagKey,
  setFlagKey,
  creating,
  error,
  onCreate,
}: CreateFlagStepProps) {
  const t = useT();
  return (
    <div className="space-y-3 flex-1">
      <div>
        <input
          type="text"
          value={flagName}
          onChange={(e) => setFlagName(e.target.value)}
          maxLength={120}
          placeholder={t('onboarding.flagNamePlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
        />
        <div className="text-xs font-normal text-muted-foreground/50 tabular-nums text-right mt-0.5">
          {flagName.length}/120
        </div>
      </div>
      <div>
        <input
          type="text"
          value={flagKey}
          onChange={(e) => setFlagKey(e.target.value)}
          maxLength={100}
          placeholder={t('onboarding.flagKeyPlaceholder')}
          className="w-full bg-input-background border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground font-mono"
        />
        <div className="text-xs font-normal text-muted-foreground/50 tabular-nums text-right mt-0.5">
          {flagKey.length}/100
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <GradientButton
        onClick={onCreate}
        disabled={creating}
        loading={creating}
        icon={<Plus size={16} />}
        className="w-full"
      >
        {t('onboarding.createFirstFlag')}
      </GradientButton>
    </div>
  );
}
