import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { X } from '@/shared/icons';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useT } from '@/i18n';

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

function PanelContent({
  title,
  description,
  children,
  footer,
  diffSlot,
  onDiffDismiss,
}: Omit<SidePanelProps, 'open' | 'onOpenChange'>) {
  const hasDiff = !!diffSlot && !!onDiffDismiss;
  const t = useT();

  return (
    <>
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <Dialog.Title className="text-h2 font-heading text-foreground tracking-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description
            className={description ? 'text-body-sm text-muted-foreground mt-1' : 'sr-only'}
          >
            {description || title}
          </Dialog.Description>
        </div>
        <Dialog.Close asChild>
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </Dialog.Close>
      </div>

      {hasDiff ? (
        <div className="flex-1 relative overflow-hidden">
          <div inert className="absolute inset-0 overflow-y-auto p-4 sm:p-6">{children}</div>
          <div
            onClick={onDiffDismiss}
            className="absolute inset-0 bg-overlay backdrop-blur-[2px] cursor-pointer z-10 flex items-start justify-center pt-8"
            title={t('flags.diffDismissTitle')}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      )}

      {diffSlot}

      {footer && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-5 border-t border-border bg-gradient-to-t from-secondary/50 to-transparent flex justify-end gap-3">
          {footer}
        </div>
      )}
    </>
  );
}

export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  diffSlot,
  onDiffDismiss,
}: SidePanelProps) {
  const isMobile = useIsMobile(640);

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-overlay backdrop-blur-sm z-40" />
          <Drawer.Content className="bg-card border-t border-border rounded-t-3xl z-50 fixed bottom-0 left-0 right-0 max-h-[90dvh] flex flex-col outline-none">
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/20 flex-shrink-0" />
            <PanelContent
              title={title}
              description={description}
              children={children}
              footer={footer}
              diffSlot={diffSlot}
              onDiffDismiss={onDiffDismiss}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed right-4 top-4 bottom-4 w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:[--tw-exit-translate-x:calc(100%+1rem)] data-[state=open]:slide-in-from-right-full duration-200">
          <PanelContent
            title={title}
            description={description}
            children={children}
            footer={footer}
            diffSlot={diffSlot}
            onDiffDismiss={onDiffDismiss}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
