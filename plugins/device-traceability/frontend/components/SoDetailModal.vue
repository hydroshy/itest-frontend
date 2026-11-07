<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-4xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'folder-open']" class="text-primary text-base" />
          Chi Tiết Sale Order: {{ selectedSo?.soNumber || '' }}
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>
      <div v-if="selectedSo" class="space-y-4">
        <!-- Summary Header -->
        <div class="p-3 bg-base-200/60 border border-base-300 rounded-lg text-xs space-y-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div><span class="text-base-content/70">Mã Đơn Hàng (SO):</span> <strong class="text-primary font-mono text-sm ml-1">{{ selectedSo.soNumber }}</strong></div>
              <div><span class="text-base-content/70">Khách Hàng:</span> <strong class="ml-1">{{ selectedSo.customerName || 'Không có tên' }}</strong></div>
              <div v-if="selectedSo.partnerEmail || selectedSo.partner_email"><span class="text-base-content/70">Email:</span> <span class="font-mono text-primary ml-1">{{ selectedSo.partnerEmail || selectedSo.partner_email }}</span></div>
            </div>
            <div>
              <div><span class="text-base-content/70">Tổng Lệnh WA:</span> <span class="badge badge-warning badge-sm font-semibold ml-1">{{ selectedSo.workAuthorizations?.length || selectedSo.waCount || 0 }} WA</span></div>
              <div><span class="text-base-content/70">Tổng Thiết Bị:</span> <strong class="ml-1">{{ selectedSo.stats?.totalDevices ?? selectedSo.totalDevices ?? 0 }} thiết bị</strong></div>
              <div class="mt-1">
                <span class="text-base-content/70">Trạng Thái Test:</span>
                <span class="badge badge-success badge-xs font-bold ml-1">PASS: {{ selectedSo.stats?.testPassCount ?? selectedSo.testPassCount ?? 0 }}</span>
                <span class="badge badge-info badge-xs font-bold ml-1">Config PASS: {{ selectedSo.stats?.configPassCount ?? selectedSo.configPassCount ?? 0 }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedSo.notes" class="mt-2 text-xs text-base-content/70 border-t border-base-300 pt-2">
            <strong>Ghi chú / Nguồn:</strong> {{ selectedSo.notes }}
          </div>
        </div>

        <!-- WA Table Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-warning text-sm flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'ticket']" class="text-xs" />
              Danh Sách Lệnh Work Authorization (WA) ({{ selectedSo.workAuthorizations?.length || 0 }} lệnh):
            </span>
            <button class="btn btn-primary btn-xs gap-1" @click="emit('createWa', selectedSo)">
              <font-awesome-icon :icon="['fas', 'plus']" /> Thêm WA Mới
            </button>
          </div>

          <div class="overflow-x-auto border border-base-300 rounded-lg max-h-72">
            <table class="table table-xs table-zebra w-full">
              <thead>
                <tr class="bg-base-200">
                  <th class="w-44">Mã Lệnh WA</th>
                  <th>Item Code / Sản Phẩm</th>
                  <th class="text-right w-28">Kế Hoạch</th>
                  <th>Ghi Chú</th>
                  <th class="text-center w-28">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="wa in (selectedSo.workAuthorizations || [])" :key="wa.id">
                  <td><code class="font-bold text-warning font-mono">{{ wa.waNumber }}</code></td>
                  <td><span class="font-bold text-primary">{{ wa.itemCode || '-' }}</span></td>
                  <td class="text-right font-mono">{{ wa.plannedQuantity || 0 }} pcs</td>
                  <td class="text-xs text-base-content/70">{{ wa.notes || '-' }}</td>
                  <td class="text-center">
                    <button class="btn btn-success btn-xs gap-1" @click="emit('importCsvWa', selectedSo.id, wa.id)">
                      <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" /> Import CSV
                    </button>
                  </td>
                </tr>
                <tr v-if="!selectedSo.workAuthorizations || selectedSo.workAuthorizations.length === 0">
                  <td colspan="5" class="text-center py-4 text-base-content/60">Chưa có lệnh WA nào thuộc SO này.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" @click="emit('close')">Đóng</button>
        <button class="btn btn-primary btn-sm gap-1" @click="emit('importCsvSo', selectedSo?.id)">
          <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" /> Import CSV Cho SO Này
        </button>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  selectedSo?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'createWa', so: any): void;
  (e: 'importCsvWa', soId: string, waId: string): void;
  (e: 'importCsvSo', soId: string): void;
}>();
</script>
