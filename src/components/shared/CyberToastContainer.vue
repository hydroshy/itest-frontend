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
        class="alert text-xs py-2.5 px-4 rounded-lg shadow-xl flex items-center justify-between gap-3 border pointer-events-auto min-w-[280px] max-w-md backdrop-blur-md font-sans"
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
      return 'bg-[#051c22]/95 border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]';
    case 'warning':
      return 'bg-[#211a05]/95 border-[#ecc48d]/50 text-[#ecc48d] shadow-[0_0_15px_rgba(236,196,141,0.2)]';
    case 'error':
      return 'bg-[#22070e]/95 border-[#ef5350]/60 text-[#ef5350] shadow-[0_0_15px_rgba(239,83,80,0.25)]';
    case 'info':
    default:
      return 'bg-[#051321]/95 border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]';
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
