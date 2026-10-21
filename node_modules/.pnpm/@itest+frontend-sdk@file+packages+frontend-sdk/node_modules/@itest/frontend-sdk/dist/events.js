export class SimpleEventBus {
    listeners = new Map();
    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (!handlers)
            return;
        handlers.forEach((handler) => {
            try {
                handler(payload);
            }
            catch (err) {
                console.error(`[EventBus] Error handling event "${event}":`, err);
            }
        });
    }
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.listeners.delete(event);
            }
        }
    }
    once(event, handler) {
        const wrapper = (payload) => {
            this.off(event, wrapper);
            handler(payload);
        };
        this.on(event, wrapper);
    }
    clear() {
        this.listeners.clear();
    }
}
//# sourceMappingURL=events.js.map