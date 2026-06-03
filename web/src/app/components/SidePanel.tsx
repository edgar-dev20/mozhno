import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

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
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full transition-transform duration-300">
          <div className="flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {footer && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
