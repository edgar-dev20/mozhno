import React from 'react';

export interface PremiumPlugin {
  slotId: string;
  Component: React.ComponentType;
  requiredPlan?: string;
}

class PluginRegistry {
  private plugins = new Map<string, PremiumPlugin[]>();

  register(slotId: string, Component: React.ComponentType, requiredPlan?: string) {
    const existing = this.plugins.get(slotId) || [];
    existing.push({ slotId, Component, requiredPlan });
    this.plugins.set(slotId, existing);
  }

  getForSlot(slotId: string): PremiumPlugin[] {
    return this.plugins.get(slotId) || [];
  }
}

export const pluginRegistry = new PluginRegistry();
