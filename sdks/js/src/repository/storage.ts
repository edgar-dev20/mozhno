import type { StorageProvider } from '../types';

declare let localStorage: Storage;
declare let globalThis: { localStorage?: Storage };

export const createDefaultStorage = (): StorageProvider => {
  const ls = (typeof globalThis !== 'undefined' && globalThis.localStorage) ||
              (typeof localStorage !== 'undefined' ? localStorage : undefined);

  if (ls) {
    return {
      save(name: string, data: unknown) {
        ls.setItem('mozhno:' + name, JSON.stringify(data));
      },
      get(name: string) {
        const raw = ls.getItem('mozhno:' + name);
        return raw ? JSON.parse(raw) : undefined;
      },
    };
  }

  const store: Record<string, unknown> = {};
  return {
    save(name: string, data: unknown) {
      store[name] = data;
    },
    get(name: string) {
      return store[name];
    },
  };
};
