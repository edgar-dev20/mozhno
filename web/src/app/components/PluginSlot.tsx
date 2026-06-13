import React, { useMemo } from 'react';
import { pluginRegistry, type PremiumPlugin, type PluginSlotId } from '@/app/pluginRegistry';

export interface PluginSlotProps {
  slotId: PluginSlotId;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

export function PluginSlot({ slotId, fallback = null, props = {} }: PluginSlotProps) {
  const plugins = useMemo(() => pluginRegistry.getForSlot(slotId), [slotId]);

  if (plugins.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {plugins.map((plugin: PremiumPlugin) => (
        <plugin.Component key={plugin.id} {...props} />
      ))}
    </>
  );
}
