import React from 'react';
import { useT, type MessageKey } from '@/i18n';
import { GradientButton } from '@/shared';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default' | 'warning';
  onConfirm: () => void;
  loading?: boolean;
  children?: React.ReactNode;
  wide?: boolean;
}

const CONFIRM_VARIANT = {
  destructive: 'danger',
  warning: 'warning',
  default: 'primary',
} as const;

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'common.delete',
  cancelLabel = 'common.cancel',
  variant = 'destructive',
  onConfirm,
  loading = false,
  children,
  wide = false,
}: ConfirmDialogProps) {
  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={wide ? 'sm:max-w-3xl' : 'sm:max-w-md'}>
        <AlertDialogHeader className="gap-1.5 p-0 pb-5">
          <AlertDialogTitle className="text-h2 font-semibold text-foreground leading-tight">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-body-sm text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children && <div className="min-w-0 overflow-hidden">{children}</div>}

        <AlertDialogFooter className="-mx-6 -mb-6 px-6 pt-4 pb-6 border-t border-border bg-secondary/50 rounded-b-xl gap-3 flex-row justify-end items-center">
          <AlertDialogCancel className="h-9 px-4 gap-2 text-body-sm font-semibold text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors mt-0">
            {t(cancelLabel as MessageKey)}
          </AlertDialogCancel>
          <GradientButton
            variant={CONFIRM_VARIANT[variant]}
            size="md"
            loading={loading}
            onClick={onConfirm}
            className="text-body-sm"
          >
            {t(confirmLabel as MessageKey)}
          </GradientButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}