<template>
  <dialog :class="['modal modal-bottom sm:modal-middle backdrop-blur-md z-[9999]', confirmState.isOpen ? 'modal-open' : '']">
    <div class="modal-box bg-slate-900/95 border border-slate-700/60 shadow-2xl rounded-2xl text-slate-200 font-sans p-6 max-w-md">
      <!-- Title -->
      <h3 class="font-semibold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <span :class="getIconColor(confirmState.type)" class="text-lg">{{ getIcon(confirmState.type) }}</span>
        <span class="tracking-tight">{{ confirmState.title }}</span>
      </h3>

      <!-- Content -->
      <div class="py-4 text-sm text-slate-300 leading-relaxed break-words">
        {{ confirmState.message }}
      </div>

      <!-- Actions -->
      <div class="modal-action mt-2 gap-2.5 flex justify-end">
        <button
          type="button"
          class="btn btn-sm btn-ghost border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4"
          @click="handleConfirmAction('cancel')"
        >
          {{ confirmState.cancelText }}
        </button>
        <button
          type="button"
          class="btn btn-sm font-medium rounded-xl px-4 transition-all"
          :class="getConfirmBtnClass(confirmState.type)"
          @click="handleConfirmAction('confirm')"
        >
          {{ confirmState.confirmText }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleConfirmAction('cancel')">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { confirmState, handleConfirmAction } from '../../services/cyberConfirm';

function getIcon(type: string): string {
  switch (type) {
    case 'error':
      return '✖';
    case 'warning':
      return '⚠';
    case 'success':
      return '✔';
    default:
      return 'ℹ';
  }
}

function getIconColor(type: string): string {
  switch (type) {
    case 'error':
      return 'text-rose-400';
    case 'warning':
      return 'text-amber-400';
    case 'success':
      return 'text-emerald-400';
    default:
      return 'text-cyan-400';
  }
}

function getConfirmBtnClass(type: string): string {
  switch (type) {
    case 'error':
      return 'bg-rose-600 hover:bg-rose-500 text-white border-none shadow-md shadow-rose-950/40';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-500 text-white border-none shadow-md shadow-amber-950/40';
    case 'success':
      return 'bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md shadow-emerald-950/40';
    default:
      return 'bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-md shadow-cyan-950/40';
  }
}
</script>
