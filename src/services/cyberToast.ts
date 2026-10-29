import { reactive } from 'vue';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  timer?: ReturnType<typeof setTimeout>;
}

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export const toastState = reactive<{
  toasts: ToastItem[];
}>({
  toasts: [],
});

let toastCounter = 0;

export function showToast(messageOrOptions: string | ToastOptions, type: ToastType = 'info', duration = 3500): string {
  let message = '';
  let toastType = type;
  let toastDuration = duration;

  if (typeof messageOrOptions === 'string') {
    message = messageOrOptions;
  } else if (messageOrOptions && typeof messageOrOptions === 'object') {
    message = messageOrOptions.message || '';
    toastType = messageOrOptions.type || type;
    toastDuration = messageOrOptions.duration ?? duration;
  }

  const id = `cyber-toast-${Date.now()}-${++toastCounter}`;
  const item: ToastItem = {
    id,
    message,
    type: toastType,
    duration: toastDuration,
  };

  if (toastDuration > 0) {
    item.timer = setTimeout(() => {
      removeToast(id);
    }, toastDuration);
  }

  toastState.toasts.push(item);
  return id;
}

export function removeToast(id: string): void {
  const index = toastState.toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    const item = toastState.toasts[index];
    if (item.timer) clearTimeout(item.timer);
    toastState.toasts.splice(index, 1);
  }
}

// Backward-compatible alias for ElMessage
export const cyberToast = {
  show: showToast,
  success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
  warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
  info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
  error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
  close: (id: string) => removeToast(id),
};

// Callable signature matching ElMessage(options) and ElMessage.success(msg)
export const ElMessage = Object.assign(
  (options: string | ToastOptions) => showToast(options),
  cyberToast
);
