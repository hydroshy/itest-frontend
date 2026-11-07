<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'circle-info']" class="text-primary text-base" />
          Chi Tiết Dữ Liệu Kiểm Thử Gốc
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <div v-if="device" class="space-y-3">
        <div class="text-sm">
          <span class="font-semibold">Thiết bị:</span> {{ device.serialNumber || device.code }}
          <span class="mx-2 text-base-content/40">|</span>
          <span class="font-semibold">DevEUI:</span> {{ device.devEui || 'N/A' }}
        </div>
        <div class="text-sm">
          <span class="font-semibold">Trạm kiểm thử:</span> {{ device.testStation || 'N/A' }}
          <span class="mx-2 text-base-content/40">|</span>
          <span class="font-semibold">Người kiểm thử:</span> {{ device.testPerson || 'N/A' }}
        </div>
        <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
          <pre>{{ JSON.stringify(device.testRawData || device, null, 2) }}</pre>
        </div>
      </div>

      <div v-else-if="rawData" class="space-y-3">
        <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
          <pre>{{ JSON.stringify(rawData, null, 2) }}</pre>
        </div>
      </div>

      <div v-else class="text-center py-6 text-base-content/60">
        Không có dữ liệu mở rộng.
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
  rawData?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>
