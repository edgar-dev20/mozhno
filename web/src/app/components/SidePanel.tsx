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
}

export function SidePanel({ open, onOpenChange, title, description, children, footer }: SidePanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full transition-transform duration-300">
          <div className="flex-shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Description className={description ? "text-sm text-muted-foreground mt-1" : "sr-only"}>
                {description || title}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {footer && (
            <div className="flex-shrink-0 px-6 py-5 border-t border-border bg-secondary/50 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
