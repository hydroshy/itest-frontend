<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'circle-check']" class="text-primary text-base" />
          Chi Tiết Final Config Session &amp; Audit
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <div v-if="device" class="space-y-3">
        <div class="text-sm">
          <span class="font-semibold">S/N:</span> {{ device.serialNumber || device.code }}
          <span class="mx-2 text-base-content/40">|</span>
          <span class="font-semibold">Trạng thái Config:</span>
          <span class="badge badge-sm ml-1" :class="device.configStatus === 'CONFIGURED_PASS' ? 'badge-success' : 'badge-error'">
            {{ device.configStatus }}
          </span>
        </div>
        <div class="text-sm">
          <span class="font-semibold">Session ID:</span> {{ device.finalConfigSessionId || 'Chưa liên kết Session' }}
        </div>
        <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
          <pre>{{ JSON.stringify(device.sessionProfile || device.auditData || device, null, 2) }}</pre>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-sm" @click="emit('close')">Đóng</button>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  device?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>
