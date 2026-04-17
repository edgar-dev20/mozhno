import React from 'react';
import { useT } from '@/i18n';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Info, Trash2 } from "@/shared/icons";
import { GradientButton } from "@/shared";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
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
  const isDestructive = variant === 'destructive';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={wide ? 'sm:max-w-3xl' : 'sm:max-w-md'}>
        <div className="pt-0 pb-5">
          <div className="flex gap-4">
            <div
              className={
                isDestructive
                  ? 'flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center'
                  : 'flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'
              }
            >
              {isDestructive ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Trash2 size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center">
                  <Info size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <AlertDialogHeader className="gap-1.5 p-0">
                <AlertDialogTitle className="text-lg font-semibold text-foreground leading-tight">
                  {title}
                </AlertDialogTitle>
                {description && (
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
            </div>
          </div>
        </div>

        {children && (
          <div className="pb-6 min-w-0 overflow-hidden">
            {children}
          </div>
        )}

        <AlertDialogFooter className="py-4 border-t border-border bg-secondary/50 gap-3 flex-row justify-end">
          <AlertDialogCancel className="px-4 py-2.5 text-sm font-medium text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
            {t(cancelLabel as any)}
          </AlertDialogCancel>
          <GradientButton
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            size="md"
          >
            {loading ? t('common.loading') : t(confirmLabel as any)}
          </GradientButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
