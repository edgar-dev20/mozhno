import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

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
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  variant = 'destructive',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <div className="px-6 pt-6 pb-5">
          <div className="flex gap-4">
            <div
              className={
                isDestructive
                  ? 'flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center'
                  : 'flex-shrink-0 w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center'
              }
            >
              {isDestructive ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Trash2 size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Info size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <AlertDialogHeader className="gap-1.5 p-0">
                <AlertDialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">
                  {title}
                </AlertDialogTitle>
                {description && (
                  <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 gap-3 flex-row justify-end">
          <AlertDialogCancel className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={
              isDestructive
                ? 'px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg shadow-sm transition-all disabled:opacity-50 border-0'
                : 'px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-lg shadow-sm transition-all disabled:opacity-50 border-0'
            }
          >
            {loading ? 'Удаление...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}