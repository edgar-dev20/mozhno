import React from 'react';
import { useT, type MessageKey } from '@/i18n';
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
  const variantButtonClasses: Record<string, string> = {
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    default: 'bg-brand text-brand-foreground hover:bg-brand/90',
  };

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

        {children && <div className="pb-6 min-w-0 overflow-hidden">{children}</div>}

        <AlertDialogFooter className="py-4 border-t border-border bg-secondary/50 gap-3 flex-row justify-end">
          <AlertDialogCancel className="px-4 py-2.5 text-body-sm font-medium text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
            {t(cancelLabel as MessageKey)}
          </AlertDialogCancel>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg text-body-sm font-semibold transition-all px-4 py-2.5 disabled:opacity-50 disabled:pointer-events-none ${variantButtonClasses[variant]}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t(confirmLabel as MessageKey)
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}