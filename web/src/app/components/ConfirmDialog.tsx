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
} from "@/app/components/ui/alert-dialog";
import { Info, Trash2 } from "@/shared/icons";
import { GradientButton } from "@/shared";
import { StatusIcon } from "@/shared/components/StatusIcon";

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
            <StatusIcon
              variant={isDestructive ? 'destructive' : 'brand'}
              icon={isDestructive ? <Trash2 /> : <Info />}
            />

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
            {t(cancelLabel as MessageKey)}
          </AlertDialogCancel>
          <GradientButton
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            size="md"
          >
            {loading ? t('common.loading') : t(confirmLabel as MessageKey)}
          </GradientButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
