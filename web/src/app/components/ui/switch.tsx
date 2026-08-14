'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/app/components/ui/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-brand data-[state=checked]:shadow-sm data-[state=checked]:shadow-brand/25 data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-6 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-brand-foreground pointer-events-none block size-4.5 m-0.5 rounded-full ring-0 shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[calc(100%-6px)] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
