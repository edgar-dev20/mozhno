import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "@/shared/icons";

interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  diffSlot?: React.ReactNode;
  onDiffDismiss?: () => void;
}

export function SidePanel({ open, onOpenChange, title, description, children, footer, diffSlot, onDiffDismiss }: SidePanelProps) {
  const hasDiff = !!diffSlot && !!onDiffDismiss;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
<Dialog.Overlay className="fixed inset-0 bg-gradient-to-b from-gradient-subtle-start/10 to-black/30 dark:from-black/20 dark:to-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
<Dialog.Content className="fixed right-4 top-4 bottom-4 w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:[--tw-exit-translate-x:calc(100%+1rem)] data-[state=open]:slide-in-from-right-full duration-200">
          <div className="flex-shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <Dialog.Title className="text-h2 font-heading text-foreground tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className={description ? "text-body-sm text-muted-foreground mt-1" : "sr-only"}>
                {description || title}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          
          {hasDiff ? (
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 overflow-y-auto p-6">
                {children}
              </div>
              <div
                onClick={onDiffDismiss}
                className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-[2px] cursor-pointer z-10 flex items-start justify-center pt-8"
                title="Нажмите чтобы отменить"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          )}

          {diffSlot}

          {footer && (
            <div className="flex-shrink-0 px-6 py-5 border-t border-border bg-gradient-to-t from-secondary/50 to-transparent flex justify-end gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
