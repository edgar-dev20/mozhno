import React from 'react';
import { pluginRegistry, type PremiumPlugin, type PluginSlotId } from '@/app/pluginRegistry';

export interface PluginSlotProps {
  slotId: PluginSlotId;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

export function PluginSlot({ slotId, fallback = null, props = {} }: PluginSlotProps) {
  const plugins = pluginRegistry.getForSlot(slotId);

  if (plugins.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {plugins.map((plugin: PremiumPlugin, i: number) => (
        <plugin.Component key={`${slotId}-${i}`} {...props} />
      ))}
    </>
  );
}
