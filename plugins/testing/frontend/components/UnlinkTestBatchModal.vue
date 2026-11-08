<template>
  <div v-if="visible" class="modal modal-open">
    <div class="modal-box max-w-lg bg-base-100 border border-base-300 shadow-2xl p-6 space-y-5">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-base-300">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error">
            <Trash2 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content uppercase tracking-wide">
              Xóa Test Batch Khỏi Sale Order
            </h3>
            <p class="text-xs text-base-content/60 font-mono mt-0.5">
              Hủy liên kết Test Batch khỏi SO đã chọn
            </p>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-circle btn-ghost" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="space-y-4">
        <div class="p-3 bg-base-200/60 border border-base-300 rounded-lg">
          <div class="text-xs text-base-content/60 font-semibold uppercase">Sale Order:</div>
          <div class="font-mono font-bold text-sm text-primary mt-0.5">
            {{ soData?.soNumber || soData?.code }}
          </div>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Chọn Test Batch Cần Hủy Liên Kết *</span>
          </label>

          <div v-if="!batchesList || batchesList.length === 0" class="text-center py-4 bg-base-200/40 rounded-lg text-xs text-base-content/60">
            SO này hiện chưa gán Test Batch nào.
          </div>

          <div v-else class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="b in batchesList"
              :key="b.id || b.batchId"
              class="p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between"
              :class="[
                selectedBatchId === (b.id || b.batchId)
                  ? 'bg-error/10 border-error'
                  : 'bg-base-200/40 border-base-300 hover:bg-base-200'
              ]"
              @click="selectedBatchId = b.id || b.batchId"
            >
              <div>
                <div class="font-mono font-bold text-xs text-error">
                  {{ b.batchCode || b.batch_code || b.code }}
                </div>
                <div class="text-[11px] text-base-content/60 font-mono mt-0.5">
                  {{ b.batchName || b.name || 'Test Batch' }}
                </div>
              </div>
              <input
                type="radio"
                name="unlink-batch"
                class="radio radio-error radio-sm"
                :checked="selectedBatchId === (b.id || b.batchId)"
                @change="selectedBatchId = b.id || b.batchId"
              />
            </div>
          </div>
        </div>

        <div class="alert alert-warning text-xs py-2 shadow-sm">
          <span>Lưu ý: Thao tác này sẽ hủy liên kết giữa SO và Test Batch. Dữ liệu cấu hình Test Batch gốc vẫn được giữ nguyên.</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-action pt-2 border-t border-base-300">
        <button type="button" class="btn btn-sm btn-ghost" :disabled="submitting" @click="close">
          Hủy bỏ
        </button>
        <button
          type="button"
          class="btn btn-sm btn-error gap-1.5"
          :disabled="!selectedBatchId || submitting"
          @click="submitUnlink"
        >
          <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
          <Trash2 class="w-4 h-4" />
          Xác Nhận Hủy Liên Kết
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

const props = defineProps<{
  visible: boolean;
  soData: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const submitting = ref(false);
const selectedBatchId = ref('');

const batchesList = computed(() => {
  if (!props.soData) return [];
  const list = props.soData.testBatches || props.soData.batches || [];
  return Array.isArray(list) ? list : [];
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedBatchId.value = batchesList.value.length > 0 ? (batchesList.value[0].id || batchesList.value[0].batchId) : '';
    }
  }
);

async function submitUnlink() {
  if (!selectedBatchId.value || !props.soData) return;
  submitting.value = true;
  try {
    const selectedBatch = batchesList.value.find(
      (b) => (b.id || b.batchId || b.batch_id) === selectedBatchId.value
    );
    await httpClient.post('/plugins/so-test-batch/unlink', {
      soId: props.soData.id,
      soNumber: props.soData.soNumber || props.soData.code,
      batchId: selectedBatch?.batchId || selectedBatch?.id || selectedBatchId.value,
      batchCode: selectedBatch?.batchCode || selectedBatch?.batch_code,
      linkId: selectedBatch?.linkId || selectedBatch?.link_id,
    });
    cyberToast.success('Đã hủy liên kết Test Batch khỏi SO thành công');
    emit('success');
    close();
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi hủy liên kết Test Batch';
    cyberToast.error(msg);
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
