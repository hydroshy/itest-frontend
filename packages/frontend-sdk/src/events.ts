import { FrontendEventBus } from './types.js';

export class SimpleEventBus implements FrontendEventBus {
  private listeners = new Map<string, Set<(payload: any) => void>>();

  emit<T = any>(event: string, payload?: T): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error handling event "${event}":`, err);
      }
    });
  }

  on<T = any>(event: string, handler: (payload: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<T = any>(event: string, handler: (payload: T) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once<T = any>(event: string, handler: (payload: T) => void): void {
    const wrapper = (payload: T) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  clear(): void {
    this.listeners.clear();
  }
}
