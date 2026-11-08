<template>
  <div v-if="visible" class="modal modal-open">
    <div class="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6 space-y-5">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-base-300">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content uppercase tracking-wide">
              Gán Test Batch Vào Sale Order
            </h3>
            <p class="text-xs text-base-content/60 font-mono mt-0.5">
              Liên kết một Test Batch đã tạo vào SO để quản lý cấu hình và kiểm định
            </p>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-circle btn-ghost" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="space-y-4">
        <!-- SO Information -->
        <div class="p-3 bg-base-200/60 border border-base-300 rounded-lg flex items-center justify-between">
          <div>
            <span class="text-xs text-base-content/60 font-semibold uppercase">Sale Order (SO):</span>
            <div class="font-mono font-bold text-sm text-primary mt-0.5">
              {{ soData?.soNumber || soData?.code || 'Chưa chọn SO' }}
            </div>
          </div>
          <div v-if="soData?.customerName" class="text-right">
            <span class="text-xs text-base-content/60 font-semibold uppercase">Khách hàng:</span>
            <div class="text-xs font-semibold text-base-content mt-0.5">
              {{ soData.customerName }}
            </div>
          </div>
        </div>

        <!-- Chọn Test Batch từ hệ thống -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Chọn Test Batch *</span>
            <span class="label-text-alt text-xs font-mono text-base-content/60">
              <span v-if="loadingBatches" class="loading loading-spinner loading-xs mr-1"></span>
              {{ availableBatches.length }} Batch khả dụng
            </span>
          </label>

          <div v-if="loadingBatches" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
            <span class="text-xs text-base-content/60 ml-2 font-mono">Đang tải danh sách Test Batch...</span>
          </div>

          <div v-else-if="availableBatches.length === 0" class="text-center py-6 bg-base-200/40 border border-dashed border-base-300 rounded-lg space-y-2">
            <AlertCircle class="w-8 h-8 text-warning mx-auto" />
            <p class="text-xs text-base-content/70">Không có Test Batch khả dụng trên hệ thống.</p>
            <p class="text-[11px] text-base-content/50">Vui lòng tạo Test Batch trước tại trang Testing.</p>
          </div>

          <div v-else class="max-h-64 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="b in availableBatches"
              :key="b.id"
              class="p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between"
              :class="[
                selectedBatchId === b.id
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : 'bg-base-200/40 border-base-300 hover:bg-base-200 hover:border-base-content/20'
              ]"
              @click="selectedBatchId = b.id"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-xs text-primary">{{ b.batchCode || b.batch_code }}</span>
                  <span class="badge badge-sm badge-neutral text-[10px] font-mono">{{ b.name || b.batchName || 'Test Batch' }}</span>
                </div>
                <div class="flex items-center gap-3 text-[11px] font-mono text-base-content/70">
                  <span>Item: <strong class="text-base-content">{{ b.itemCode || b.item_code || '—' }}</strong></span>
                  <span>FW: <strong class="text-base-content">{{ b.fwVersion || b.fw_version || '—' }}</strong></span>
                  <span>Max: <strong class="text-info">{{ b.maxDevices || b.deviceCount || 5 }} đ/v</strong></span>
                </div>
              </div>
              <input
                type="radio"
                name="selected-batch"
                class="radio radio-primary radio-sm"
                :checked="selectedBatchId === b.id"
                @change="selectedBatchId = b.id"
              />
            </div>
          </div>
        </div>

        <!-- Ghi chú liên kết -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Ghi chú (Tùy chọn)</span>
          </label>
          <input
            v-model="notes"
            type="text"
            class="input input-bordered input-sm w-full text-xs"
            placeholder="Nhập ghi chú liên kết nếu có..."
          />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-action pt-2 border-t border-base-300">
        <button type="button" class="btn btn-sm btn-ghost" :disabled="submitting" @click="close">
          Hủy bỏ
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary gap-1.5"
          :disabled="!selectedBatchId || submitting"
          @click="submitAssign"
        >
          <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
          <Check class="w-4 h-4" />
          Xác Nhận Gán Batch
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Layers, AlertCircle, Check } from 'lucide-vue-next';
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

const loadingBatches = ref(false);
const submitting = ref(false);
const availableBatches = ref<any[]>([]);
const selectedBatchId = ref('');
const notes = ref('');

watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedBatchId.value = '';
      notes.value = '';
      loadAvailableBatches();
    }
  }
);

async function loadAvailableBatches() {
  loadingBatches.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/so-test-batch/available-batches');
    } catch {
      res = await httpClient.get('/plugins/testing/test-batches');
    }
    const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res) ? res : []));
    availableBatches.value = items.map((b: any) => ({
      id: b.id,
      batchCode: b.batchCode || b.batch_code || b.code,
      batchName: b.name || b.batchName || b.batch_name || 'Test Batch',
      itemCode: b.itemCode || b.item_code || '',
      fwVersion: b.fwVersion || b.fw_version || '',
      maxDevices: b.maxDevices || b.max_devices || b.deviceCount || 5,
    }));
  } catch (err: any) {
    console.warn('Could not load test batches:', err);
    availableBatches.value = [];
  } finally {
    loadingBatches.value = false;
  }
}

async function submitAssign() {
  if (!selectedBatchId.value || !props.soData) return;
  submitting.value = true;
  const chosen = availableBatches.value.find((b) => b.id === selectedBatchId.value);
  const payload = {
    soId: props.soData.id,
    soNumber: props.soData.soNumber || props.soData.code,
    batchId: selectedBatchId.value,
    batchCode: chosen?.batchCode || '',
    notes: notes.value.trim() || undefined,
  };

  try {
    await httpClient.post('/plugins/so-test-batch/link', payload);
    cyberToast.success(`Đã gán Test Batch ${chosen?.batchCode || ''} vào SO ${props.soData.soNumber || ''}`);
    emit('success');
    close();
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi liên kết Test Batch với SO';
    cyberToast.error(msg);
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
