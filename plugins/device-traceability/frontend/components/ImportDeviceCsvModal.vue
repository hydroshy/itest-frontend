<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-3xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="text-primary text-base" />
          Import Danh Sách Thiết Bị Đã Test (CSV)
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <div class="alert alert-info py-2.5 px-4 text-xs rounded-lg mb-4 flex items-start gap-2">
        <font-awesome-icon :icon="['fas', 'circle-info']" class="shrink-0 mt-0.5 text-sm" />
        <div>
          <div class="font-semibold">Quy định Import Dữ Liệu Kiểm Thử</div>
          <div class="opacity-90">Hệ thống hỗ trợ cấu trúc file CSV kiểm thử phần cứng (ví dụ WSLRW-C-RS485-01_tested.csv). Có thể liên kết trực tiếp vào SO hoặc theo WA (nếu nhập WA hệ thống sẽ tự động gán vào SO tương ứng).</div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Phương thức gán <span class="text-error">*</span></span></label>
          <div class="join">
            <button
              type="button"
              class="join-item btn btn-sm font-semibold"
              :class="assignMode === 'WA' ? 'btn-primary' : 'btn-ghost border-base-300'"
              @click="assignMode = 'WA'"
            >
              Gán theo WA (khuyên dùng)
            </button>
            <button
              type="button"
              class="join-item btn btn-sm font-semibold"
              :class="assignMode === 'SO' ? 'btn-primary' : 'btn-ghost border-base-300'"
              @click="assignMode = 'SO'"
            >
              Gán trực tiếp theo SO
            </button>
          </div>
        </div>

        <!-- Mode WA Selection -->
        <div v-if="assignMode === 'WA'" class="space-y-3 p-3 bg-base-200/50 rounded-lg border border-base-300">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Chọn Work Authorization (WA) <span class="text-error">*</span></span></label>
            <select
              v-model="selectedWaId"
              class="select select-bordered select-sm w-full font-medium"
              required
            >
              <option value="">-- Chọn lệnh sản xuất WA --</option>
              <option
                v-for="wa in allWas"
                :key="wa.id"
                :value="wa.id"
              >
                {{ wa.waNumber }} - SO: {{ wa.soNumber || wa.saleOrder?.soNumber || 'N/A' }} | Item: {{ wa.itemCode || 'N/A' }} ({{ wa.plannedQuantity || 0 }} pcs)
              </option>
            </select>
          </div>
          <div v-if="currentSelectedWa" class="text-xs text-base-content/70 flex flex-wrap gap-3">
            <span>SO liên kết: <strong class="text-primary">{{ currentSelectedWa.soNumber || currentSelectedWa.saleOrder?.soNumber }}</strong></span>
            <span>Item code: <strong class="text-warning">{{ currentSelectedWa.itemCode || 'Chưa gán' }}</strong></span>
            <span>Kế hoạch: <strong>{{ currentSelectedWa.plannedQuantity || 0 }} pcs</strong></span>
          </div>
        </div>

        <!-- Mode SO Selection -->
        <div v-else class="space-y-3 p-3 bg-base-200/50 rounded-lg border border-base-300">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Chọn Sale Order (SO) <span class="text-error">*</span></span></label>
            <select
              v-model="selectedSoId"
              class="select select-bordered select-sm w-full font-medium"
              required
            >
              <option value="">-- Chọn mã SO --</option>
              <option
                v-for="so in saleOrdersList"
                :key="so.id"
                :value="so.id"
              >
                {{ so.soNumber }} ({{ so.customerName || 'N/A' }})
              </option>
            </select>
          </div>
          <div v-if="selectedSoId" class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Work Authorization (WA)</span></label>
            <select
              v-model="selectedWaId"
              class="select select-bordered select-sm w-full font-medium"
            >
              <option value="">-- Chọn WA thuộc SO này (khuyên dùng để liên kết chính xác) --</option>
              <option
                v-for="wa in availableWasForSelectedSo"
                :key="wa.id"
                :value="wa.id"
              >
                {{ wa.waNumber }} - {{ wa.itemCode || 'Không có Item Code' }} (Kế hoạch: {{ wa.plannedQuantity || 0 }} pcs)
              </option>
            </select>
            <div v-if="availableWasForSelectedSo.length === 0" class="text-xs text-warning mt-1">
              ⚠️ Đơn hàng này chưa có WA. Thiết bị sẽ được gán trực tiếp vào SO.
            </div>
            <div v-else class="text-xs text-info mt-1">
              ℹ️ Đã tìm thấy {{ availableWasForSelectedSo.length }} WA của SO này. Chọn WA giúp liên kết thiết bị theo từng mặt hàng/lệnh sản xuất cụ thể.
            </div>
          </div>
        </div>

        <!-- File upload button -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold text-xs">Chọn File CSV <span class="text-error">*</span></span></label>
          <input
            type="file"
            ref="fileInputRef"
            accept=".csv,text/csv"
            class="hidden"
            @change="handleFileChange"
          />
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="btn btn-outline btn-sm gap-2"
              @click="fileInputRef?.click()"
            >
              <font-awesome-icon :icon="['fas', 'file-csv']" />
              {{ selectedFile ? 'Đổi File Khác' : 'Chọn File CSV...' }}
            </button>
            <span v-if="selectedFile" class="text-xs font-mono text-primary font-semibold">
              {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
            </span>
            <span v-else class="text-xs text-base-content/50">Chưa có file nào được chọn</span>
          </div>
        </div>

        <!-- CSV Preview -->
        <div v-if="csvPreviewRows.length > 0" class="space-y-2">
          <div class="text-xs font-semibold flex items-center justify-between">
            <span>Bản xem trước dữ liệu ({{ csvPreviewRows.length }} dòng đầu):</span>
            <span class="text-base-content/60 font-normal">Tổng cộng khoảng {{ totalParsedRows }} bản ghi</span>
          </div>
          <div class="overflow-x-auto border border-base-300 rounded-lg max-h-48">
            <table class="table table-xs table-zebra w-full font-mono text-[11px]">
              <thead>
                <tr class="bg-base-200">
                  <th v-for="(h, idx) in csvHeaders" :key="idx">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, rIdx) in csvPreviewRows" :key="rIdx">
                  <td v-for="(h, cIdx) in csvHeaders" :key="cIdx" class="max-w-xs truncate">{{ r[h] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-action mt-6">
          <button type="button" class="btn btn-sm" @click="emit('close')">Hủy</button>
          <button
            type="submit"
            class="btn btn-sm btn-primary gap-1 font-semibold"
            :disabled="!selectedFile || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <font-awesome-icon v-else :icon="['fas', 'cloud-arrow-up']" />
            Bắt Đầu Import CSV
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  saleOrdersList: any[];
  allWas: any[];
  initialSoId?: string;
  initialWaId?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { file: File; assignMode: 'WA' | 'SO'; soId: string; waId: string }): void;
}>();

const assignMode = ref<'WA' | 'SO'>('WA');
const selectedSoId = ref('');
const selectedWaId = ref('');
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const csvHeaders = ref<string[]>([]);
const csvPreviewRows = ref<any[]>([]);
const totalParsedRows = ref(0);

const currentSelectedWa = computed(() => {
  return props.allWas.find((w) => w.id === selectedWaId.value);
});

const availableWasForSelectedSo = computed(() => {
  if (!selectedSoId.value) return [];
  const so = props.saleOrdersList.find((s) => s.id === selectedSoId.value);
  return so?.workAuthorizations || [];
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.initialWaId) {
        assignMode.value = 'WA';
        selectedWaId.value = props.initialWaId;
      } else if (props.initialSoId) {
        assignMode.value = 'SO';
        selectedSoId.value = props.initialSoId;
        selectedWaId.value = '';
      } else {
        assignMode.value = 'WA';
        selectedWaId.value = '';
        selectedSoId.value = '';
      }
      selectedFile.value = null;
      csvHeaders.value = [];
      csvPreviewRows.value = [];
      totalParsedRows.value = 0;
      if (fileInputRef.value) fileInputRef.value.value = '';
    }
  }
);

watch(
  () => selectedSoId.value,
  () => {
    if (assignMode.value === 'SO') {
      selectedWaId.value = '';
    }
  }
);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  selectedFile.value = file;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result as string;
    if (!text) return;
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      csvHeaders.value = headers;
      totalParsedRows.value = lines.length - 1;

      const preview: any[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] ?? '';
        });
        preview.push(rowObj);
      }
      csvPreviewRows.value = preview;
    }
  };
  reader.readAsText(file);
};

const handleSubmit = () => {
  if (!selectedFile.value) return;
  emit('submit', {
    file: selectedFile.value,
    assignMode: assignMode.value,
    soId: selectedSoId.value,
    waId: selectedWaId.value,
  });
};
</script>
