<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'pen-to-square']" class="text-primary text-base" />
          Chi Tiết &amp; Chỉnh Sửa Thông Tin Thiết Bị
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <div v-if="form" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Số Serial (S/N):</span></label>
            <input :value="form.serialNumber" disabled class="input input-bordered input-sm bg-base-200 text-base-content/70 cursor-not-allowed font-mono" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">DevEUI:</span></label>
            <input v-model="form.devEui" placeholder="Nhập DevEUI (16 hex)" class="input input-bordered input-sm font-mono font-medium" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Mã Sản Phẩm (Item):</span></label>
            <input v-model="form.itemCode" placeholder="Mã item..." class="input input-bordered input-sm font-medium" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">SKU:</span></label>
            <input v-model="form.sku" placeholder="SKU sản phẩm..." class="input input-bordered input-sm font-medium" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Kết Quả Test:</span></label>
            <select v-model="form.testResult" class="select select-bordered select-sm font-medium">
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="PENDING">NONE / PENDING</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Trạng Thái Config:</span></label>
            <select v-model="form.configStatus" class="select select-bordered select-sm font-medium">
              <option value="CONFIGURED_PASS">CONFIGURED_PASS (Đã nạp)</option>
              <option value="CONFIG_FAILED">CONFIG_FAILED (Lỗi cấu hình)</option>
              <option value="PENDING">PENDING / UNCONFIGURED</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Trạm Kiểm Thử:</span></label>
            <input v-model="form.testStation" placeholder="Ví dụ: STATION_01" class="input input-bordered input-sm font-medium" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Người Kiểm Thử:</span></label>
            <input v-model="form.testPerson" placeholder="Tên hoặc mã nhân viên..." class="input input-bordered input-sm font-medium" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">HW Version:</span></label>
            <input v-model="form.hwVersion" placeholder="Phiên bản phần cứng..." class="input input-bordered input-sm font-medium" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">FW Version:</span></label>
            <input v-model="form.fwVersion" placeholder="Phiên bản firmware..." class="input input-bordered input-sm font-medium" />
          </div>
        </div>

        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold">Dữ Liệu Raw Test (JSON):</span></label>
          <textarea
            v-model="form.rawJsonText"
            rows="5"
            placeholder="{ ... }"
            class="textarea textarea-bordered font-mono text-xs"
          ></textarea>
        </div>

        <div class="modal-action border-t border-base-300 pt-3 mt-4">
          <button class="btn btn-sm btn-ghost" @click="emit('close')">Hủy Bỏ</button>
          <button
            class="btn btn-sm btn-primary gap-1 font-semibold"
            :disabled="isSaving"
            @click="emit('save')"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <font-awesome-icon v-else :icon="['fas', 'floppy-disk']" />
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  form?: any;
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
