<template>
  <div class="toast toast-top toast-end z-[9999] p-4 flex flex-col gap-2.5 pointer-events-none">
    <transition-group
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="item in toastState.toasts"
        :key="item.id"
        class="pointer-events-auto min-w-[320px] max-w-md rounded-xl p-3.5 shadow-2xl border flex items-center justify-between gap-3 font-sans transition-all bg-base-300"
        :class="getToastClasses(item.type)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-inner"
            :class="getIconBadgeClasses(item.type)"
          >
            {{ getToastIcon(item.type) }}
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
              {{ getToastTitle(item.type) }}
            </span>
            <span class="text-xs font-medium text-base-content leading-snug break-words">
              {{ item.message }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content hover:bg-base-content/10 flex-shrink-0"
          aria-label="Đóng thông báo"
          @click="removeToast(item.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { toastState, removeToast, type ToastType } from '../../services/cyberToast';

function getToastClasses(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'border-success/40 border-l-4 border-l-success shadow-success/10';
    case 'warning':
      return 'border-warning/40 border-l-4 border-l-warning shadow-warning/10';
    case 'error':
      return 'border-error/40 border-l-4 border-l-error shadow-error/10';
    case 'info':
    default:
      return 'border-info/40 border-l-4 border-l-info shadow-info/10';
  }
}

function getIconBadgeClasses(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-success/15 text-success border border-success/30';
    case 'warning':
      return 'bg-warning/15 text-warning border border-warning/30';
    case 'error':
      return 'bg-error/15 text-error border border-error/30';
    case 'info':
    default:
      return 'bg-info/15 text-info border border-info/30';
  }
}

function getToastTitle(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'Thành công';
    case 'warning':
      return 'Cảnh báo';
    case 'error':
      return 'Lỗi';
    case 'info':
    default:
      return 'Thông tin';
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✔';
    case 'warning':
      return '⚠';
    case 'error':
      return '✖';
    case 'info':
    default:
      return 'ℹ';
  }
}
</script>
