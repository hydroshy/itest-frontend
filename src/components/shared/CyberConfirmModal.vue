<template>
  <dialog :class="['modal modal-bottom sm:modal-middle backdrop-blur-sm z-[9999]', confirmState.isOpen ? 'modal-open' : '']">
    <div class="modal-box bg-[#081d32] border border-[#1d3b5a] shadow-[0_0_30px_rgba(0,240,255,0.15)] text-[#d6deeb] font-sans p-6 max-w-md">
      <!-- Title -->
      <h3 class="font-bold text-base text-[#ffffff] flex items-center gap-2 border-b border-[#1d3b5a] pb-3">
        <span :class="getIconColor(confirmState.type)">{{ getIcon(confirmState.type) }}</span>
        <span>{{ confirmState.title }}</span>
      </h3>

      <!-- Content -->
      <div class="py-4 text-sm text-[#cbd5e1] leading-relaxed break-words">
        {{ confirmState.message }}
      </div>

      <!-- Actions -->
      <div class="modal-action mt-2 gap-2 flex justify-end">
        <button
          type="button"
          class="btn btn-sm btn-ghost border border-[#1d3b5a] text-[#94a3b8] hover:bg-[#0b2942] hover:text-[#ffffff]"
          @click="handleConfirmAction('cancel')"
        >
          {{ confirmState.cancelText }}
        </button>
        <button
          type="button"
          class="btn btn-sm font-semibold shadow-md"
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
      return 'text-[#ef5350]';
    case 'warning':
      return 'text-[#ecc48d]';
    case 'success':
      return 'text-[#00ff88]';
    default:
      return 'text-[#00f0ff]';
  }
}

function getConfirmBtnClass(type: string): string {
  switch (type) {
    case 'error':
      return 'bg-[#ef5350] hover:bg-[#d32f2f] text-white border-none shadow-[0_0_10px_rgba(239,83,80,0.4)]';
    case 'warning':
      return 'bg-[#ecc48d] hover:bg-[#d8a867] text-[#011627] border-none shadow-[0_0_10px_rgba(236,196,141,0.4)]';
    case 'success':
      return 'bg-[#00ff88] hover:bg-[#00cc6a] text-[#011627] border-none shadow-[0_0_10px_rgba(0,255,136,0.4)]';
    default:
      return 'bg-[#00f0ff] hover:bg-[#00b4d8] text-[#011627] border-none shadow-[0_0_10px_rgba(0,240,255,0.4)]';
  }
}
</script>
