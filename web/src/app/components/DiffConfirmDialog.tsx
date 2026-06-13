import { DiffView } from '@/app/components/DiffView';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { useT } from '@/i18n';
import type { DiffChange } from '@/shared/diffUtils';

interface DiffConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  changes: DiffChange[];
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export function DiffConfirmDialog({
  open,
  onClose,
  changes,
  description,
  confirmLabel,
  onConfirm,
}: DiffConfirmDialogProps) {
  const t = useT();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={t('common.applyChanges')}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={t('common.cancel')}
      variant="default"
      onConfirm={onConfirm}
      loading={false}
      wide
    >
      <DiffView changes={changes} />
    </ConfirmDialog>
  );
}
