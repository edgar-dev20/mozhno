import React from 'react';

export const PLUGIN_SLOTS = ['sidebar.admin', 'settings.premium'] as const;

export type PluginSlotId = (typeof PLUGIN_SLOTS)[number];

export interface PremiumPlugin {
  slotId: PluginSlotId;
  Component: React.ComponentType<Record<string, unknown>>;
  requiredPlan?: string;
  priority?: number;
  onInit?: () => void;
  onDestroy?: () => void;
}

class PluginRegistry {
  private plugins = new Map<PluginSlotId, PremiumPlugin[]>();
  private initialized = new Set<string>();

  register(
    slotId: PluginSlotId,
    Component: React.ComponentType<Record<string, unknown>>,
    options?: { requiredPlan?: string; priority?: number; onInit?: () => void; onDestroy?: () => void },
  ) {
    const existing = this.plugins.get(slotId) || [];
    const plugin: PremiumPlugin = {
      slotId,
      Component,
      requiredPlan: options?.requiredPlan,
      priority: options?.priority ?? 50,
      onInit: options?.onInit,
      onDestroy: options?.onDestroy,
    };
    existing.push(plugin);
    existing.sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
    this.plugins.set(slotId, existing);

    if (plugin.onInit && !this.initialized.has(`${slotId}-${Component.name}`)) {
      plugin.onInit();
      this.initialized.add(`${slotId}-${Component.name}`);
    }
  }

  unregister(slotId: PluginSlotId, Component: React.ComponentType<Record<string, unknown>>) {
    const existing = this.plugins.get(slotId) || [];
    const plugin = existing.find(p => p.Component === Component);
    if (plugin?.onDestroy) {
      plugin.onDestroy();
    }
    this.plugins.set(slotId, existing.filter(p => p.Component !== Component));
  }

  getForSlot(slotId: PluginSlotId): PremiumPlugin[] {
    return this.plugins.get(slotId) || [];
  }

  get registeredSlots(): PluginSlotId[] {
    return Array.from(this.plugins.keys());
  }
}

export const pluginRegistry = new PluginRegistry();
