import { FrontendEventBus } from './types.js';
export declare class SimpleEventBus implements FrontendEventBus {
    private listeners;
    emit<T = any>(event: string, payload?: T): void;
    on<T = any>(event: string, handler: (payload: T) => void): () => void;
    off<T = any>(event: string, handler: (payload: T) => void): void;
    once<T = any>(event: string, handler: (payload: T) => void): void;
    clear(): void;
}
//# sourceMappingURL=events.d.ts.map