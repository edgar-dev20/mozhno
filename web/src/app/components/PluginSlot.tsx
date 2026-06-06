import React from 'react';
import { pluginRegistry } from '../pluginRegistry';

export interface PluginSlotProps {
  slotId: string;
  fallback?: React.ReactNode;
}

export function PluginSlot({ slotId, fallback = null }: PluginSlotProps) {
  const plugins = pluginRegistry.getForSlot(slotId);

  if (plugins.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {plugins.map((plugin, i) => (
        <plugin.Component key={`${slotId}-${i}`} />
      ))}
    </>
  );
}
