import React, { useId, useState } from 'react';
import { useT, type MessageKey } from '@/i18n';
import { GradientButton } from '@/shared';
import { Trash2, AlertTriangle, Info } from '@/shared/icons';
import { Input } from '@/app/components/ui/input';
import { cn } from '@/app/components/ui/utils';
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
  confirmPhrase?: string;
  icon?: React.ReactNode;
}

const CONFIRM_VARIANT = {
  destructive: 'danger',
  warning: 'warning',
  default: 'primary',
} as const;

const VARIANT_ICON = {
  destructive: Trash2,
  warning: AlertTriangle,
  default: Info,
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
  confirmPhrase,
  icon,
}: ConfirmDialogProps) {
  const t = useT();
  const inputId = useId();
  const [typed, setTyped] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('');
    onOpenChange(next);
  };

  const IconComp = VARIANT_ICON[variant];
  const gated = variant === 'destructive' && !!confirmPhrase;
  const mismatch = gated && typed.trim() !== (confirmPhrase ?? '').trim();
  const confirmDisabled = loading || mismatch;

  const cancelButton = (className: string) => (
    <AlertDialogCancel className={className}>
      {t(cancelLabel as MessageKey)}
    </AlertDialogCancel>
  );

  const confirmButton = (
    <GradientButton
      variant={CONFIRM_VARIANT[variant]}
      size="md"
      loading={loading}
      disabled={confirmDisabled}
      onClick={onConfirm}
      className="text-body-sm"
    >
      {t(confirmLabel as MessageKey)}
    </GradientButton>
  );

  if (children) {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
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

          <div className="min-w-0 overflow-hidden">{children}</div>

          <AlertDialogFooter className="-mx-6 -mb-6 px-6 pt-4 pb-6 border-t border-border bg-secondary/50 rounded-b-xl gap-3 flex-row justify-end items-center">
            {cancelButton(
              'h-9 px-4 gap-2 text-body-sm font-semibold text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors mt-0',
            )}
            {confirmButton}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (variant === 'destructive') {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="sm:max-w-md gap-0">
          <AlertDialogHeader className="gap-0 p-0">
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10 text-destructive">
                {icon ?? <IconComp className="size-5" />}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <AlertDialogTitle className="text-h3 font-semibold text-foreground leading-heading">
                  {title}
                </AlertDialogTitle>
                {description && (
                  <AlertDialogDescription className="text-body-sm text-muted-foreground leading-body">
                    {description}
                  </AlertDialogDescription>
                )}
              </div>
            </div>
          </AlertDialogHeader>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/15 bg-destructive/5 px-3.5 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-caption leading-caption text-foreground/90">
                {t('common.confirmDelete.irreversible')}
              </p>
            </div>

            {gated && (
              <div className="space-y-2">
                <label
                  htmlFor={inputId}
                  className="block text-body-sm text-muted-foreground leading-body"
                >
                  {t('common.confirmDelete.promptBefore')}{' '}
                  <code className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-caption font-bold text-foreground">
                    {confirmPhrase}
                  </code>{' '}
                  {t('common.confirmDelete.promptAfter')}
                </label>
                <Input
                  id={inputId}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={confirmPhrase}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="font-mono"
                />
              </div>
            )}
          </div>

          <AlertDialogFooter className="mt-5 pt-4 border-t border-border gap-3 flex-row justify-end items-center">
            {cancelButton(
              'mt-0 h-9 px-4 gap-2 text-body-sm font-semibold text-foreground/80 bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors',
            )}
            {confirmButton}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-sm gap-0 p-5">
        <AlertDialogHeader className="gap-2 p-0">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md border',
                variant === 'warning'
                  ? 'border-warning/20 bg-warning/10 text-palette-warning-600 dark:text-palette-warning-700'
                  : 'border-primary/20 bg-primary/10 text-primary',
              )}
            >
              {icon ?? <IconComp className="size-4" />}
            </span>
            <AlertDialogTitle className="text-h3 font-semibold text-foreground leading-heading">
              {title}
            </AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="text-body-sm text-muted-foreground leading-body">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 gap-2 flex-row justify-end items-center">
          {cancelButton(
            'mt-0 h-9 px-3 gap-2 text-body-sm font-semibold text-muted-foreground bg-transparent border-transparent shadow-none rounded-lg hover:bg-accent hover:text-foreground transition-colors',
          )}
          {confirmButton}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
