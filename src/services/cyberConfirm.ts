import { reactive } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'error' | 'success';
}

export interface ConfirmState {
  isOpen: boolean;
  message: string;
  title: string;
  confirmText: string;
  cancelText: string;
  type: 'warning' | 'info' | 'error' | 'success';
  resolve?: (value: 'confirm') => void;
  reject?: (reason: 'cancel') => void;
}

export const confirmState = reactive<ConfirmState>({
  isOpen: false,
  message: '',
  title: 'Xác nhận thao tác',
  confirmText: 'Đồng ý',
  cancelText: 'Hủy',
  type: 'warning',
});

export function showConfirm(
  messageOrOptions: string | ConfirmOptions,
  titleOrOptions?: string | ConfirmOptions,
  options?: ConfirmOptions
): Promise<'confirm'> {
  return new Promise((resolve, reject) => {
    let resolvedMessage = '';
    let resolvedTitle = 'Xác nhận thao tác';
    let resolvedOptions: ConfirmOptions = {};

    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      resolvedMessage = messageOrOptions.message || '';
      resolvedTitle = messageOrOptions.title || 'Xác nhận thao tác';
      resolvedOptions = messageOrOptions;
    } else {
      resolvedMessage = String(messageOrOptions || '');
      if (typeof titleOrOptions === 'string') {
        resolvedTitle = titleOrOptions;
        if (options) resolvedOptions = options;
      } else if (titleOrOptions && typeof titleOrOptions === 'object') {
        resolvedOptions = titleOrOptions;
        if (resolvedOptions.title) resolvedTitle = resolvedOptions.title;
      }
    }

    confirmState.isOpen = true;
    confirmState.message = resolvedMessage;
    confirmState.title = resolvedTitle;
    confirmState.confirmText = resolvedOptions.confirmText || resolvedOptions.confirmButtonText || 'Đồng ý';
    confirmState.cancelText = resolvedOptions.cancelText || resolvedOptions.cancelButtonText || 'Hủy';
    confirmState.type = resolvedOptions.type || 'warning';
    confirmState.resolve = resolve;
    confirmState.reject = reject;
  });
}

export function handleConfirmAction(action: 'confirm' | 'cancel'): void {
  confirmState.isOpen = false;
  if (action === 'confirm' && confirmState.resolve) {
    confirmState.resolve('confirm');
  } else if (action === 'cancel' && confirmState.reject) {
    confirmState.reject('cancel');
  }
}

// Backward-compatible ElMessageBox & callable cyberConfirm
export const cyberConfirm = Object.assign(showConfirm, {
  confirm: showConfirm,
  alert: showConfirm,
});

export const ElMessageBox = {
  confirm: showConfirm,
  alert: showConfirm,
};
