<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-md bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'folder-open']" class="text-primary text-base" />
          Tạo Mới Đơn Hàng (Sale Order)
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Mã Sale Order <span class="text-error">*</span></span></label>
          <input
            v-model="form.soNumber"
            type="text"
            placeholder="Ví dụ: SO-2026-001 hoặc SO/26/001"
            class="input input-bordered input-sm w-full font-medium"
            required
          />
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Tên Khách Hàng</span></label>
          <input
            v-model="form.customerName"
            type="text"
            placeholder="Tên khách hàng / Đối tác"
            class="input input-bordered input-sm w-full font-medium"
          />
        </div>
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Ghi Chú</span></label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Ghi chú đơn hàng..."
            class="textarea textarea-bordered textarea-sm w-full font-medium"
          ></textarea>
        </div>
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-sm" @click="emit('close')">Hủy</button>
          <button type="submit" class="btn btn-sm btn-primary gap-1" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <font-awesome-icon v-else :icon="['fas', 'floppy-disk']" />
            Lưu SO
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
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: { soNumber: string; customerName: string; customerCode: string; notes: string }): void;
}>();

const form = reactive({
  soNumber: '',
  customerName: '',
  customerCode: '',
  notes: '',
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.soNumber = '';
      form.customerName = '';
      form.customerCode = '';
      form.notes = '';
    }
  }
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>
