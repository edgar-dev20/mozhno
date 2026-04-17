type Listener = (...args: any[]) => void;

export class EventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): void {
    const list = this.listeners.get(event) || [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  off(event: string, listener: Listener): void {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(l => l !== listener));
    }
  }

  emit(event: string, ...args: any[]): void {
    const list = this.listeners.get(event);
    if (list) {
      for (const listener of list) {
        try {
          listener(...args);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  removeAll(): void {
    this.listeners.clear();
  }
}
