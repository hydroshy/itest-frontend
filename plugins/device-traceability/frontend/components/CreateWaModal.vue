<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-lg bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'ticket']" class="text-primary text-base" />
          Tạo Work Authorization (WA) Thuộc SO
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Sale Order</span></label>
          <div class="font-bold text-primary text-sm px-1">{{ targetSo?.soNumber || 'N/A' }}</div>
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Mã WA (WA/xxxx/xxxxx) <span class="text-error">*</span></span></label>
          <input
            v-model="form.waNumber"
            type="text"
            placeholder="Ví dụ: WA/2026/00001"
            class="input input-bordered input-sm w-full font-medium"
            @blur="formatWaNumber"
            required
          />
          <span class="text-xs text-base-content/60 mt-1">Cú pháp bắt buộc theo chuẩn: WA/xxxx/xxxxx</span>
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Item Code / Mã SP</span></label>
          <input
            v-model="form.itemCode"
            type="text"
            placeholder="Ví dụ: WS433-DI-01"
            class="input input-bordered input-sm w-full font-medium"
          />
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Số Lượng Dự Kiến</span></label>
          <input
            v-model.number="form.plannedQuantity"
            type="number"
            min="1"
            class="input input-bordered input-sm w-full font-medium"
          />
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Ghi Chú</span></label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Ghi chú lệnh sản xuất..."
            class="textarea textarea-bordered textarea-sm w-full font-medium"
          ></textarea>
        </div>
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-sm" @click="emit('close')">Hủy</button>
          <button type="submit" class="btn btn-sm btn-primary gap-1" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <font-awesome-icon v-else :icon="['fas', 'floppy-disk']" />
            Lưu WA
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  targetSo?: any;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: { waNumber: string; itemCode: string; plannedQuantity: number; notes: string; soId: string }): void;
}>();

const form = reactive({
  waNumber: '',
  itemCode: '',
  plannedQuantity: 100,
  notes: '',
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.waNumber = '';
      form.itemCode = '';
      form.plannedQuantity = 100;
      form.notes = '';
    }
  }
);

const formatWaNumber = () => {
  const val = form.waNumber.trim();
  if (!val) return;
  if (/^WA\/\d{4}\/\d{5}$/i.test(val)) {
    form.waNumber = val.toUpperCase();
    return;
  }
  const clean = val.replace(/[^a-zA-Z0-9]/g, '');
  const digits = clean.replace(/^[a-zA-Z]*/, '');
  const year = new Date().getFullYear();
  if (digits.length > 0 && digits.length <= 5) {
    form.waNumber = `WA/${year}/${digits.padStart(5, '0')}`;
  } else if (digits.length > 5) {
    const yr = digits.slice(0, 4);
    const seq = digits.slice(4, 9).padStart(5, '0');
    form.waNumber = `WA/${yr}/${seq}`;
  }
};

const handleSubmit = () => {
  formatWaNumber();
  emit('submit', {
    ...form,
    soId: props.targetSo?.id || '',
  });
};
</script>
