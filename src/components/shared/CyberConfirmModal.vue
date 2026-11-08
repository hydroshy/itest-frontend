<template>
  <Transition name="modal-fade">
    <div
      v-if="confirmState.isOpen"
      class="modal modal-open modal-bottom sm:modal-middle fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div class="relative z-10 modal-box bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-2xl text-[var(--owl-text-primary)] font-sans p-6 max-w-md shadow-2xl">
      <!-- Title -->
      <h3 class="font-semibold text-base text-[var(--owl-text-primary)] flex items-center justify-between border-b border-[var(--owl-border)] pb-3 font-display">
        <div class="flex items-center gap-2.5">
          <span :class="getIconColor(confirmState.type)" class="text-lg">{{ getIcon(confirmState.type) }}</span>
          <span class="tracking-tight">{{ confirmState.title }}</span>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-circle text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Đóng"
          @click="handleConfirmAction('cancel')"
        >
          ✕
        </button>
      </h3>

      <!-- Content -->
      <div class="py-4 text-sm text-[var(--owl-text-secondary)] leading-relaxed break-words">
        {{ confirmState.message }}
      </div>

      <!-- Actions -->
      <div class="modal-action mt-2 gap-2.5 flex justify-end">
        <button
          type="button"
          class="btn btn-sm btn-ghost border border-[var(--owl-border)] text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] hover:bg-[var(--owl-bg-card-hover)] rounded-xl px-4"
          @click="handleConfirmAction('cancel')"
        >
          {{ confirmState.cancelText }}
        </button>
        <button
          type="button"
          class="btn btn-sm font-medium rounded-xl px-4 transition-colors border-none"
          :class="getConfirmBtnClass(confirmState.type)"
          @click="handleConfirmAction('confirm')"
        >
          {{ confirmState.confirmText }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click.stop.prevent></div>
    </div>
  </Transition>
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
      return 'text-sky-400';
  }
}

function getConfirmBtnClass(type: string): string {
  switch (type) {
    case 'error':
      return 'bg-rose-500 hover:bg-rose-600 text-white';
    case 'warning':
      return 'bg-amber-500 hover:bg-amber-600 text-slate-900';
    case 'success':
      return 'bg-emerald-500 hover:bg-emerald-600 text-slate-900';
    default:
      return 'bg-violet-600 hover:bg-violet-700 text-white';
  }
}
</script>
