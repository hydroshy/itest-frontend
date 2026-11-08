<template>
  <div v-if="visible" class="modal modal-open">
    <div class="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6 space-y-5">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-base-300">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info">
            <Info class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content uppercase tracking-wide">
              Chi Tiết Test Batch Theo Sale Order
            </h3>
            <p class="text-xs text-base-content/60 font-mono mt-0.5">
              Thông tin cấu hình các Test Batch đang liên kết với SO
            </p>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-circle btn-ghost" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="space-y-4">
        <!-- SO Card -->
        <div class="p-3 bg-base-200/60 border border-base-300 rounded-lg flex items-center justify-between">
          <div>
            <span class="text-xs text-base-content/60 font-semibold uppercase">Sale Order:</span>
            <div class="font-mono font-bold text-sm text-primary mt-0.5">
              {{ soData?.soNumber || soData?.code }}
            </div>
          </div>
          <div v-if="soData?.customerName" class="text-right">
            <span class="text-xs text-base-content/60 font-semibold uppercase">Khách hàng:</span>
            <div class="text-xs font-semibold text-base-content mt-0.5">
              {{ soData.customerName }}
            </div>
          </div>
        </div>

        <!-- List of Linked Batches -->
        <div>
          <div class="text-xs font-semibold text-base-content uppercase mb-2">
            Danh sách Test Batch liên kết ({{ batchesList.length }}):
          </div>

          <div v-if="batchesList.length === 0" class="text-center py-8 bg-base-200/30 border border-dashed border-base-300 rounded-lg">
            <p class="text-xs text-base-content/60 font-mono">Sale Order này chưa được gán Test Batch nào.</p>
          </div>

          <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div
              v-for="(b, idx) in batchesList"
              :key="b.id || idx"
              class="p-4 bg-base-200/50 border border-base-300 rounded-lg space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="badge badge-primary badge-sm font-mono font-bold">
                    {{ b.batchCode || b.batch_code || b.code }}
                  </span>
                  <span class="font-bold text-xs text-base-content">
                    {{ b.batchName || b.name || 'Test Batch' }}
                  </span>
                </div>
                <span class="badge badge-outline badge-xs font-mono">
                  {{ b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—' }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-base-content/70 bg-base-100/60 p-2 rounded">
                <div>Item Code: <strong class="text-base-content">{{ b.itemCode || b.item_code || '—' }}</strong></div>
                <div>FW Ver: <strong class="text-base-content">{{ b.fwVersion || b.fw_version || '—' }}</strong></div>
                <div>Số thiết bị: <strong class="text-info">{{ b.deviceCount || b.maxDevices || '—' }}</strong></div>
                <div>Trạng thái: <strong class="text-success">{{ b.status || 'Active' }}</strong></div>
              </div>

              <div v-if="b.notes" class="text-xs text-base-content/70 italic">
                Ghi chú: {{ b.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-action pt-2 border-t border-base-300">
        <button type="button" class="btn btn-sm btn-primary" @click="close">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  soData: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const batchesList = computed(() => {
  if (!props.soData) return [];
  const list = props.soData.testBatches || props.soData.batches || [];
  return Array.isArray(list) ? list : [];
});

function close() {
  emit('close');
}
</script>
