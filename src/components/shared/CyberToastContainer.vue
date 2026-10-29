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
        class="alert text-sm py-3 px-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 border pointer-events-auto min-w-[300px] max-w-md backdrop-blur-xl font-sans transition-all"
        :class="getToastClasses(item.type)"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-base flex-shrink-0">
            {{ getToastIcon(item.type) }}
          </span>
          <span class="font-medium text-[#ffffff] leading-tight break-words">
            {{ item.message }}
          </span>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-circle text-[#94a3b8] hover:text-[#ffffff] hover:bg-white/10"
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
      return 'bg-slate-900/90 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40';
    case 'warning':
      return 'bg-slate-900/90 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/40';
    case 'error':
      return 'bg-slate-900/90 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-950/40';
    case 'info':
    default:
      return 'bg-slate-900/90 border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/40';
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
