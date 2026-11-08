<template>
  <div class="device-test-batch-panel w-full">
    <!-- KHỐI LIỀN MẠCH DUY NHẤT (UNIFIED SINGLE CONTAINER) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl p-4 md:p-5 shadow-sm space-y-4 backdrop-blur-md">
      <!-- 1. Header Tinh Gọn -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-300/80">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Boxes class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Test Batch</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="isTesting ? 'badge-warning animate-pulse' : testFinished ? (batchVerdict === 'PASS' ? 'badge-success' : 'badge-error') : 'badge-ghost'"
              >
                {{ isTesting ? 'TESTING IN PROGRESS' : testFinished ? `COMPLETED (${batchVerdict || 'DONE'})` : 'IDLE / READY' }}
              </span>
            </div>
            <h3 class="font-bold text-base text-base-content mt-0.5">
              Device Test Batch
            </h3>
          </div>
        </div>

        <!-- Running Batch Quick Control -->
        <div v-if="runningBatches.length > 0 && !isTesting" class="flex items-center gap-2">
          <span class="text-xs text-warning font-medium">Batch đang chạy:</span>
          <select
            class="select select-xs select-bordered font-mono font-bold text-warning"
            @change="onSelectRunningBatch(($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled selected>Chọn batch đang chạy...</option>
            <option v-for="rb in runningBatches" :key="rb.id" :value="rb.id">
              {{ rb.batch_code || rb.batchCode || rb.id }} {{ rb.so_number || rb.soNumber ? `(${rb.so_number || rb.soNumber})` : '' }}
            </option>
          </select>
        </div>

        <div v-if="isTesting" class="flex items-center gap-2">
          <span class="text-xs font-mono text-warning animate-pulse font-bold">Đang chạy kiểm thử...</span>
          <button class="btn btn-xs btn-error gap-1" :disabled="cancellingBatch" @click="cancelSelectedBatch">
            <Square class="w-3 h-3" />
            Hủy Batch
          </button>
        </div>
      </div>

      <!-- 2. Hàng Điều Khiển Chính: SO_NUMBER, TEST BATCH, ITEM_CODE, FW_VERSION -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-base-100/50 p-3 rounded-lg border border-base-300/60">
        <!-- SO_NUMBER: Điền và tìm kiếm được (Chỉ hiển thị SO_NUMBER) - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5">
            <span class="label-text text-xs font-bold text-primary flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5" />
              SO_NUMBER <span class="text-error">*</span>
            </span>
            <span v-if="selectedSoNumber" class="badge badge-xs badge-primary font-mono font-bold">Đã chọn</span>
          </label>
          <div class="relative">
            <input
              v-model="selectedSoNumber"
              type="text"
              list="so-datalist"
              placeholder="Nhập hoặc chọn SO..."
              class="input input-sm input-bordered w-full text-xs font-mono font-bold bg-base-100 pr-8"
              :disabled="isTesting || loadingSos"
              @change="onSoChange"
              @input="onSoInput"
            />
            <datalist id="so-datalist">
              <option v-for="so in uniqueSoNumbers" :key="so" :value="so"></option>
            </datalist>
          </div>
        </div>

        <!-- TEST BATCH (Bỏ chữ Readonly) - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5 flex items-center justify-between">
            <span class="label-text text-xs font-bold flex items-center gap-1.5 text-base-content">
              <Cpu class="w-3.5 h-3.5 text-info" />
              TEST BATCH
            </span>
          </label>
          <input
            :value="activeBatchDisplayName"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed select-all"
            title="Tự động nhận diện theo SO"
          />
        </div>

        <!-- ITEM_CODE riêng biệt - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5">
            <span class="label-text text-xs font-bold text-base-content">
              ITEM_CODE
            </span>
          </label>
          <input
            :value="filterItemCode || '—'"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed"
          />
        </div>

        <!-- FW_VERSION riêng biệt - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5 flex items-center justify-between">
            <span class="label-text text-xs font-bold text-base-content">
              FW_VERSION
            </span>
            <span v-if="selectedBatchConfig" class="badge badge-xs badge-info font-mono">
              Max: {{ maxAllowedDevices }}
            </span>
          </label>
          <div class="flex items-center gap-2">
            <input
              :value="filterFwVersion || '—'"
              type="text"
              readonly
              class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed"
            />
            <button
              class="btn btn-sm btn-square btn-ghost"
              title="Tải lại dữ liệu SO & Batch"
              :disabled="loadingSos || isTesting"
              @click="loadSosWithBatches"
            >
              <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': loadingSos }" />
            </button>
          </div>
        </div>
      </div>

      <!-- Cảnh báo nếu SO chưa cấu hình -->
      <div
        v-if="selectedSoNumber && !selectedBatchConfig && !loadingSos"
        class="alert alert-warning py-2 px-3 text-xs flex items-center gap-2 rounded-lg font-medium"
      >
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        <div>
          <b>{{ selectedSoNumber }}</b> chưa được cấu hình vui lòng liên hệ ENGINEERING.
        </div>
      </div>

      <!-- 3. BẢNG TABULATOR 1: Thiết Bị Hiện Có Trong SO -->
      <div class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wide text-base-content">
              1. Danh Sách Thiết Bị Trong SO ({{ availableDevices.length }})
            </span>
            <span v-if="loadingDevices" class="loading loading-spinner loading-xs text-primary"></span>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative w-56">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                v-model="searchDeviceText"
                type="text"
                placeholder="Tìm Serial, DevEUI..."
                class="input input-xs input-bordered w-full pl-8 font-mono text-xs"
                @input="applyAvailableFilter"
              />
            </div>
            <button
              class="btn btn-xs btn-primary gap-1"
              :disabled="selectedAvailableRows.length === 0 || isTesting || selectedDevices.length >= maxAllowedDevices"
              @click="addSelectedAvailableRowsToBatch"
            >
              + Thêm Vào Batch ({{ selectedAvailableRows.length }})
            </button>
          </div>
        </div>

        <!-- Khung Tabulator 1 -->
        <div class="overflow-hidden rounded-lg border border-base-300">
          <div ref="availableTableRef" class="w-full text-xs min-h-[160px] max-h-[260px] overflow-auto"></div>
        </div>
      </div>

      <!-- 4. BẢNG TABULATOR 2: Thiết Bị Phục Vụ Chạy Test Batch -->
      <div class="space-y-2 pt-2 border-t border-base-300/80">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wide text-primary">
              2. Thiết Bị Phục Vụ Chạy Test Batch ({{ selectedDevices.length }} / {{ maxAllowedDevices }})
            </span>
            <span
              v-if="selectedDevices.length >= maxAllowedDevices"
              class="badge badge-xs badge-info font-mono font-bold"
            >
              ĐÃ ĐẠT GIỚI HẠN TỐI ĐA
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="requiresReferenceDevice"
              class="btn btn-xs btn-outline btn-success gap-1"
              :disabled="selectedDevices.length === 0 || isTesting"
              @click="autoAssignReferenceDevices"
            >
              <Sparkles class="w-3 h-3" />
              Tự Động Gán Chuẩn
            </button>
            <button
              class="btn btn-xs btn-ghost text-error"
              :disabled="selectedDevices.length === 0 || isTesting"
              @click="clearBatchDevices"
            >
              <Trash2 class="w-3 h-3" />
              Xóa Hết
            </button>

            <!-- Nút Bắt Đầu Test Batch Chính -->
            <button
              class="btn btn-xs btn-primary gap-1 px-3 font-bold"
              :disabled="selectedDevices.length === 0 || isTesting || !selectedBatchConfig"
              @click="startBatchTest"
            >
              <Play class="w-3 h-3 fill-current" />
              {{ isTesting ? 'Đang Test...' : 'Bắt Đầu Test Batch' }}
            </button>
          </div>
        </div>

        <!-- Khung Tabulator 2 -->
        <div class="overflow-hidden rounded-lg border border-base-300">
          <div ref="batchTableRef" class="w-full text-xs min-h-[180px] max-h-[300px] overflow-auto"></div>
        </div>
      </div>

      <!-- 5. Tiến Trình Testing Realtime (Hiển thị khi đang chạy hoặc vừa chạy xong) -->
      <div v-if="isTesting || testFinished" class="bg-base-100/70 p-3 rounded-lg border border-base-300/80 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2 font-mono">
            <Timer class="w-4 h-4 text-warning" />
            <span>Còn lại: <b class="text-primary font-bold">{{ formattedRemaining }}</b></span>
            <span>|</span>
            <span>Đã chạy: <b class="text-base-content/80">{{ formattedElapsed }}</b></span>
          </div>

          <div class="flex items-center gap-2 font-mono text-xs">
            <span v-if="testFinished" class="font-bold flex items-center gap-1">
              Kết quả:
              <span :class="batchVerdict === 'PASS' ? 'text-success' : 'text-error'">
                {{ batchVerdict === 'PASS' ? 'ĐẠT (PASS)' : 'KHÔNG ĐẠT (FAIL)' }}
              </span>
            </span>
            <span v-else class="text-info font-medium">
              Tiến độ: {{ Math.round((elapsedSeconds / Math.max(1, totalDurationSeconds)) * 100) }}%
            </span>
          </div>
        </div>

        <progress
          class="progress w-full h-2"
          :class="testFinished ? (batchVerdict === 'PASS' ? 'progress-success' : 'progress-error') : 'progress-primary'"
          :value="elapsedSeconds"
          :max="Math.max(1, totalDurationSeconds)"
        ></progress>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
  Boxes,
  Play,
  Square,
  Timer,
  Cpu,
  Layers,
  Sparkles,
  Trash2,
  Search,
  RotateCcw,
  AlertCircle,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const props = defineProps<{
  initialBatchPayload?: any;
}>();

const authStore = useAuthStore();

// ============================================================================
// STATE & SELECTIONS
// ============================================================================
const loadingSos = ref(false);
const loadingDevices = ref(false);
const sosList = ref<any[]>([]);

const selectedSoNumber = ref('');
const selectedBatchConfig = ref<any>(null);
const selectedBatchId = ref('');
const filterItemCode = ref('');
const filterFwVersion = ref('');
const maxAllowedDevices = ref(5);

// Available Devices in SO
const availableDevices = ref<any[]>([]);
const searchDeviceText = ref('');
const selectedAvailableRows = ref<any[]>([]);

// Selected Batch Devices
const selectedDevices = ref<any[]>([]);
const goldenReferenceDevices = ref<any[]>([]);

// Running Batches
const runningBatches = ref<any[]>([]);
const cancellingBatch = ref(false);

// Test Execution State
const isTesting = ref(false);
const testFinished = ref(false);
const totalDurationSeconds = ref(300);
const remainingSeconds = ref(300);
const elapsedSeconds = ref(0);
const batchStartedAt = ref('');
const batchFinishedAt = ref('');
const batchVerdict = ref('');

let timerInterval: any = null;
let simulationInterval: any = null;
let runningBatchesInterval: any = null;

// Tabulator Instance Refs
const availableTableRef = ref<HTMLDivElement | null>(null);
let availableTabulator: Tabulator | null = null;

const batchTableRef = ref<HTMLDivElement | null>(null);
let batchTabulator: Tabulator | null = null;

// ============================================================================
// COMPUTED VALUES
// ============================================================================
const uniqueSoNumbers = computed(() => {
  const set = new Set<string>();
  sosList.value.forEach((s) => {
    if (s.soNumber && s.soNumber.trim()) set.add(s.soNumber.trim());
  });
  return Array.from(set);
});

const activeBatchDisplayName = computed(() => {
  if (!selectedSoNumber.value) return 'Vui lòng nhập/chọn SO_NUMBER';
  if (!selectedBatchConfig.value) return 'Chưa được cấu hình';
  const code = selectedBatchConfig.value.batchCode || selectedBatchConfig.value.code || '';
  const name = selectedBatchConfig.value.batchName || selectedBatchConfig.value.name || '';
  return code ? (name ? `[${code}] ${name}` : code) : (name || 'Test Batch');
});

const requiresReferenceDevice = computed(() => {
  return selectedBatchConfig.value?.requiresReferenceDevice === true ||
    selectedBatchConfig.value?.simulationFlow?.requiresGoldenReference === true;
});

const formattedRemaining = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60);
  const s = remainingSeconds.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const formattedElapsed = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60);
  const s = elapsedSeconds.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

// ============================================================================
// HELPERS
// ============================================================================
function getDeviceIdentifier(dev: any): string {
  if (!dev) return '';
  return dev.serialNumber || dev.serial_number || dev.devEui || dev.dev_eui || dev.id || '';
}

function isDeviceSelected(dev: any): boolean {
  const id = getDeviceIdentifier(dev);
  return selectedDevices.value.some((s) => getDeviceIdentifier(s.device || s) === id);
}

// ============================================================================
// 1. LOAD SOs WITH TEST BATCHES
// ============================================================================
async function loadSosWithBatches() {
  loadingSos.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/so-test-batch/sos');
    } catch {
      res = await httpClient.get('/plugins/testing/so-test-batch/sos');
    }
    const data = res?.data || res;
    const items = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
    sosList.value = items;

    // Auto-select if initial payload provided or only 1 SO exists
    if (props.initialBatchPayload?.soNumber) {
      selectedSoNumber.value = props.initialBatchPayload.soNumber;
      onSoChange();
    } else if (!selectedSoNumber.value && items.length > 0) {
      const withBatch = items.find((s: any) => Array.isArray(s.testBatches) && s.testBatches.length > 0);
      if (withBatch) {
        selectedSoNumber.value = withBatch.soNumber;
        onSoChange();
      }
    }
  } catch (err: any) {
    console.warn('[DeviceTestBatchPanel] Error loading SOs:', err.message);
  } finally {
    loadingSos.value = false;
  }
}

// ============================================================================
// 2. ON SO CHANGE: TỰ ĐỘNG MAP TEST BATCH & LOAD DEVICES
// ============================================================================
let soInputTimeout: any = null;
function onSoInput() {
  clearTimeout(soInputTimeout);
  soInputTimeout = setTimeout(() => {
    onSoChange();
  }, 400);
}

async function onSoChange() {
  if (!selectedSoNumber.value || !selectedSoNumber.value.trim()) {
    selectedBatchConfig.value = null;
    selectedBatchId.value = '';
    filterItemCode.value = '';
    filterFwVersion.value = '';
    availableDevices.value = [];
    selectedDevices.value = [];
    updateTabulatorData();
    return;
  }

  const cleanSo = selectedSoNumber.value.trim();
  const so = sosList.value.find((s) => (s.soNumber || '').trim().toLowerCase() === cleanSo.toLowerCase());
  const batches = Array.isArray(so?.testBatches) ? so.testBatches : [];

  if (batches.length > 0) {
    const b = batches[0];
    selectedBatchConfig.value = b;
    selectedBatchId.value = b.batchId || b.id || '';
    filterItemCode.value = b.itemCode || '';
    filterFwVersion.value = b.fwVersion || '';
    maxAllowedDevices.value = b.deviceCount || b.maxDevices || 5;
    if (b.flowDurationSeconds) {
      totalDurationSeconds.value = b.flowDurationSeconds;
      remainingSeconds.value = b.flowDurationSeconds;
    }
    fetchBatchDetail(selectedBatchId.value);
  } else {
    selectedBatchConfig.value = null;
    selectedBatchId.value = '';
    filterItemCode.value = '';
    filterFwVersion.value = '';
    maxAllowedDevices.value = 5;
  }

  // Load candidate devices for this SO
  await loadAvailableDevicesForSo(cleanSo);
}

async function fetchBatchDetail(batchId: string) {
  if (!batchId) return;
  try {
    const res: any = await httpClient.get(`/plugins/testing/test-batches/${batchId}`);
    const data = res?.data || res;
    if (data) {
      selectedBatchConfig.value = { ...selectedBatchConfig.value, ...data };
      if (data.maxDevices) maxAllowedDevices.value = data.maxDevices;
      if (data.flowDurationSeconds) {
        totalDurationSeconds.value = data.flowDurationSeconds;
        remainingSeconds.value = data.flowDurationSeconds;
      }
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error fetching full batch detail:', err.message);
  }
}

// ============================================================================
// 3. LOAD DEVICES IN SO
// ============================================================================
async function loadAvailableDevicesForSo(soNumber: string) {
  if (!soNumber) {
    availableDevices.value = [];
    updateTabulatorData();
    return;
  }

  loadingDevices.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/devices', {
      params: {
        soNumber: soNumber.trim(),
        limit: 200,
      },
    });

    const rawList = res?.data?.items || res?.data || [];
    availableDevices.value = (Array.isArray(rawList) ? rawList : []).map((d: any) => ({
      id: d.id,
      serialNumber: d.serialNumber || d.serial_number || d.networkId || d.network_id || d.id,
      devEui: d.networkId || d.network_id || d.devEui || d.dev_eui || '—',
      itemCode: d.itemCode || d.item_code || filterItemCode.value || '—',
      fwVersion: d.fwVersion || d.fw_version || filterFwVersion.value || '—',
      status: d.status || 'READY',
      isRunningBatch: d.isRunningBatch === true || d.isTestingInBatch === true || d.status === 'RUNNING_BATCH',
      runningBatchCode: d.runningBatchCode || null,
      createdAt: d.createdAt || d.created_at || '',
      raw: d,
    }));

    selectedAvailableRows.value = [];
    updateTabulatorData();
  } catch (err: any) {
    console.warn('[DeviceTestBatchPanel] Error loading devices for SO:', err.message);
    availableDevices.value = [];
    updateTabulatorData();
  } finally {
    loadingDevices.value = false;
  }
}

// ============================================================================
// 4. TABULATOR MANAGEMENT
// ============================================================================
function initAvailableTabulator() {
  if (!availableTableRef.value) return;
  if (availableTabulator) {
    availableTabulator.destroy();
    availableTabulator = null;
  }

  availableTabulator = new Tabulator(availableTableRef.value, {
    data: getFilteredAvailableDevices(),
    layout: 'fitColumns',
    placeholder: 'Chưa có thiết bị nào trong SO đã chọn.',
    height: '240px',
    selectableRows: true,
    selectableRowsCheck: (row) => {
      const data = row.getData();
      // Block selecting devices that are currently in another running batch
      return !data.isRunningBatch;
    },
    columns: [
      {
        formatter: 'rowSelection',
        titleFormatter: 'rowSelection',
        width: 45,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'STT',
        formatter: 'rownum',
        width: 55,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'Mã Thiết Bị / Serial',
        field: 'serialNumber',
        widthGrow: 2,
        headerSort: true,
        formatter: (cell) => {
          const val = cell.getValue();
          return `<span class="font-mono font-bold text-xs text-primary">${val || '—'}</span>`;
        },
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 2,
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-xs text-base-content/80">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Item Code',
        field: 'itemCode',
        width: 140,
        formatter: (cell) => `<span class="badge badge-xs badge-outline font-mono">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'FW Version',
        field: 'fwVersion',
        width: 110,
        formatter: (cell) => `<span class="font-mono text-xs">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Trạng Thái',
        field: 'status',
        width: 125,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.isRunningBatch) {
            return `<span class="badge badge-warning badge-xs font-mono font-bold" title="Đang test trong batch ${rowData.runningBatchCode || ''}">Đang Test (${rowData.runningBatchCode || 'Busy'})</span>`;
          }
          return `<span class="badge badge-ghost badge-xs font-mono">${cell.getValue() || 'READY'}</span>`;
        },
      },
      {
        title: 'Thao tác',
        width: 110,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.isRunningBatch) {
            return '<span class="text-[10px] text-warning font-semibold cursor-not-allowed">Đang chạy</span>';
          }
          const added = isDeviceSelected(rowData);
          if (added) {
            return '<span class="badge badge-success badge-xs font-semibold">Đã thêm</span>';
          }
          return '<button class="btn btn-xs btn-primary font-medium">+ Thêm</button>';
        },
        cellClick: (_e, cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.isRunningBatch) {
            cyberToast.warning(`Thiết bị ${rowData.serialNumber} đang chạy test batch khác (${rowData.runningBatchCode || ''}), không thể thêm!`);
            return;
          }
          if (!isDeviceSelected(rowData)) {
            addSingleDeviceToBatch(rowData);
          }
        },
      },
    ],
  });

  availableTabulator.on('rowSelectionChanged', (data: any[]) => {
    selectedAvailableRows.value = data.filter((d) => !d.isRunningBatch);
  });
}

function initBatchTabulator() {
  if (!batchTableRef.value) return;
  if (batchTabulator) {
    batchTabulator.destroy();
    batchTabulator = null;
  }

  batchTabulator = new Tabulator(batchTableRef.value, {
    data: selectedDevices.value,
    layout: 'fitColumns',
    placeholder: 'Chưa có thiết bị nào được thêm vào Test Batch.',
    height: '240px',
    columns: [
      {
        title: 'STT',
        formatter: 'rownum',
        width: 55,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'Serial Number',
        field: 'serialNumber',
        widthGrow: 2,
        formatter: (cell) => `<span class="font-mono font-bold text-xs text-primary">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 2,
        formatter: (cell) => `<span class="font-mono text-xs text-base-content/80">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Item Code',
        field: 'itemCode',
        width: 130,
        formatter: (cell) => `<span class="badge badge-xs badge-outline font-mono">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'FW Version',
        field: 'fwVersion',
        width: 100,
        formatter: (cell) => `<span class="font-mono text-xs">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Trạng Thái',
        field: 'status',
        width: 120,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = cell.getValue() || 'PENDING';
          const cls =
            val === 'PASS'
              ? 'badge-success text-success-content font-bold'
              : val === 'FAIL'
              ? 'badge-error text-error-content font-bold'
              : val === 'RUNNING'
              ? 'badge-warning text-warning-content animate-pulse font-bold'
              : 'badge-ghost';
          return `<span class="badge badge-xs font-mono ${cls}">${val}</span>`;
        },
      },
      {
        title: 'Gói Tin / Metrics',
        field: 'metrics',
        widthGrow: 1.5,
        formatter: (cell) => {
          const row = cell.getRow().getData();
          if (row.status === 'PENDING') {
            return '<span class="text-xs text-base-content/40 font-mono">Chờ kích hoạt</span>';
          }
          return `<span class="font-mono text-xs">Gói: <b>${row.packetsCount ?? 0}</b> | RSSI: ${row.avgRssi ?? '—'} dBm</span>`;
        },
      },
      {
        title: 'Xóa',
        width: 65,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
        formatter: () => '<button class="btn btn-xs btn-ghost text-error" title="Xóa khỏi batch">✕</button>',
        cellClick: (_e, cell) => {
          if (isTesting.value) {
            cyberToast.warning('Batch đang chạy kiểm thử!');
            return;
          }
          const rowData = cell.getRow().getData();
          removeDeviceFromBatch(getDeviceIdentifier(rowData.device || rowData));
        },
      },
    ],
  });
}

function getFilteredAvailableDevices() {
  let list = availableDevices.value;
  if (searchDeviceText.value.trim()) {
    const q = searchDeviceText.value.trim().toLowerCase();
    list = list.filter((d) => {
      const s = (d.serialNumber || '').toLowerCase();
      const e = (d.devEui || '').toLowerCase();
      const it = (d.itemCode || '').toLowerCase();
      return s.includes(q) || e.includes(q) || it.includes(q);
    });
  }
  return list;
}

function applyAvailableFilter() {
  if (availableTabulator) {
    availableTabulator.replaceData(getFilteredAvailableDevices());
  }
}

function updateTabulatorData() {
  nextTick(() => {
    if (availableTabulator) {
      availableTabulator.replaceData(getFilteredAvailableDevices());
    }
    if (batchTabulator) {
      batchTabulator.replaceData(selectedDevices.value);
    }
  });
}

// ============================================================================
// 5. BATCH DEVICE OPERATIONS
// ============================================================================
function addSingleDeviceToBatch(deviceRow: any) {
  if (isTesting.value) {
    cyberToast.warning('Batch đang chạy kiểm thử!');
    return;
  }
  if (deviceRow.isRunningBatch) {
    cyberToast.warning(`Thiết bị ${deviceRow.serialNumber} đang chạy test batch khác, không thể thêm!`);
    return;
  }
  if (selectedDevices.value.length >= maxAllowedDevices.value) {
    cyberToast.warning(`Batch này chỉ cho phép tối đa ${maxAllowedDevices.value} thiết bị!`);
    return;
  }

  const rawDev = deviceRow.raw || deviceRow;
  selectedDevices.value.push({
    serialNumber: deviceRow.serialNumber,
    devEui: deviceRow.devEui,
    itemCode: deviceRow.itemCode,
    fwVersion: deviceRow.fwVersion,
    device: rawDev,
    referenceDeviceId: '',
    status: 'PENDING',
    packetsCount: 0,
    avgRssi: null,
    avgSnr: null,
  });

  cyberToast.success(`Đã thêm ${deviceRow.serialNumber} vào batch`);
  updateTabulatorData();
}

function addSelectedAvailableRowsToBatch() {
  if (isTesting.value) {
    cyberToast.warning('Batch đang chạy kiểm thử!');
    return;
  }
  if (selectedAvailableRows.value.length === 0) return;

  let addedCount = 0;
  for (const row of selectedAvailableRows.value) {
    if (row.isRunningBatch) continue;
    if (selectedDevices.value.length >= maxAllowedDevices.value) {
      cyberToast.warning(`Đã đạt giới hạn tối đa ${maxAllowedDevices.value} thiết bị của đợt test!`);
      break;
    }
    if (!isDeviceSelected(row)) {
      const rawDev = row.raw || row;
      selectedDevices.value.push({
        serialNumber: row.serialNumber,
        devEui: row.devEui,
        itemCode: row.itemCode,
        fwVersion: row.fwVersion,
        device: rawDev,
        referenceDeviceId: '',
        status: 'PENDING',
        packetsCount: 0,
        avgRssi: null,
        avgSnr: null,
      });
      addedCount++;
    }
  }

  if (addedCount > 0) {
    cyberToast.success(`Đã thêm ${addedCount} thiết bị vào đợt test`);
    updateTabulatorData();
  }
}

function removeDeviceFromBatch(deviceId: string) {
  selectedDevices.value = selectedDevices.value.filter((s) => {
    const id = getDeviceIdentifier(s.device || s);
    return id !== deviceId;
  });
  updateTabulatorData();
}

function clearBatchDevices() {
  selectedDevices.value = [];
  updateTabulatorData();
  cyberToast.info('Đã xóa tất cả thiết bị khỏi batch');
}

function autoAssignReferenceDevices() {
  if (goldenReferenceDevices.value.length === 0) {
    cyberToast.warning('Không tìm thấy thiết bị chuẩn phù hợp.');
    return;
  }
  selectedDevices.value.forEach((item, idx) => {
    const refDev = goldenReferenceDevices.value[idx % goldenReferenceDevices.value.length];
    if (refDev) {
      item.referenceDeviceId = refDev.id;
      item.referenceDevice = refDev;
    }
  });
  updateTabulatorData();
  cyberToast.success('Đã tự động gán thiết bị chuẩn cho các thiết bị trong batch');
}

// ============================================================================
// 6. TEST EXECUTION & TELEMETRY
// ============================================================================
async function startBatchTest() {
  if (selectedDevices.value.length === 0) {
    cyberToast.warning('Vui lòng thêm ít nhất 1 thiết bị vào Test Batch!');
    return;
  }
  if (!selectedBatchId.value) {
    cyberToast.warning('Không tìm thấy cấu hình Test Batch!');
    return;
  }

  isTesting.value = true;
  testFinished.value = false;
  batchVerdict.value = '';
  elapsedSeconds.value = 0;
  remainingSeconds.value = totalDurationSeconds.value;

  selectedDevices.value.forEach((d) => {
    d.status = 'RUNNING';
    d.packetsCount = 0;
  });
  updateTabulatorData();

  const testerName = authStore.user?.fullName || authStore.user?.username || 'Tester';
  const startPayload = {
    testerName,
    testPerson: testerName,
    testedBy: testerName,
    soNumber: selectedSoNumber.value,
    waNumber: selectedBatchConfig.value?.waNumber || '',
    requiresReferenceDevice: requiresReferenceDevice.value,
    devices: selectedDevices.value.map((item) => ({
      serialNumber: item.serialNumber,
      devEui: item.devEui,
      itemCode: item.itemCode,
      fwVersion: item.fwVersion,
      soNumber: selectedSoNumber.value,
      referenceDeviceId: item.referenceDeviceId || null,
    })),
  };

  try {
    const res: any = await httpClient.post(
      `/plugins/testing/test-batches/${selectedBatchId.value}/start`,
      startPayload
    );
    batchStartedAt.value = res?.data?.startedAt || new Date().toISOString();
    cyberToast.success(`Bắt đầu chạy Test Batch với ${selectedDevices.value.length} thiết bị song song`);

    // Timer Interval
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds.value++;
      remainingSeconds.value = Math.max(0, totalDurationSeconds.value - elapsedSeconds.value);
      if (remainingSeconds.value <= 0) {
        pollBatchStatus();
      }
    }, 1000);

    // Status Polling Interval
    clearInterval(simulationInterval);
    pollBatchStatus();
    simulationInterval = setInterval(() => {
      pollBatchStatus();
    }, 3000);

    await loadRunningBatches();
  } catch (err: any) {
    cyberToast.error(err?.response?.data?.message || 'Không thể bắt đầu Test Batch');
    isTesting.value = false;
    selectedDevices.value.forEach((d) => {
      d.status = 'PENDING';
    });
    updateTabulatorData();
  }
}

async function pollBatchStatus() {
  const id = selectedBatchId.value;
  if (!id) return;
  try {
    const res: any = await httpClient.get(`/plugins/testing/test-batches/${id}/status`);
    const statusData = res?.data || res;
    if (!statusData) return;

    if (typeof statusData.elapsedSeconds === 'number') {
      elapsedSeconds.value = statusData.elapsedSeconds;
    }
    if (typeof statusData.remainingSeconds === 'number') {
      remainingSeconds.value = statusData.remainingSeconds;
    }

    if (Array.isArray(statusData.devices) && statusData.devices.length > 0) {
      statusData.devices.forEach((dev: any) => {
        const item = selectedDevices.value.find(
          (s) => s.serialNumber === dev.serialNumber || s.devEui === dev.devEui
        );
        if (item) {
          item.status = dev.verdict || dev.status || item.status;
          item.packetsCount = dev.packetsReceived ?? dev.packets_received ?? (Array.isArray(dev.dutPackets) ? dev.dutPackets.length : item.packetsCount);
          if (dev.avgRssi != null) item.avgRssi = dev.avgRssi;
        }
      });
      updateTabulatorData();
    }

    if (statusData.status === 'COMPLETED' || statusData.status === 'STOPPED' || remainingSeconds.value <= 0) {
      finishBatchTest(statusData);
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Polling error:', err.message);
  }
}

function finishBatchTest(statusData?: any) {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  isTesting.value = false;
  testFinished.value = true;
  batchFinishedAt.value = statusData?.finishedAt || new Date().toISOString();
  batchVerdict.value = statusData?.verdict || 'PASS';

  selectedDevices.value.forEach((d) => {
    if (d.status === 'RUNNING') d.status = batchVerdict.value;
  });
  updateTabulatorData();
  loadRunningBatches();
  cyberToast.success(`Test Batch hoàn thành! Kết quả: ${batchVerdict.value}`);
}

async function cancelSelectedBatch() {
  const id = selectedBatchId.value;
  if (!id || !window.confirm('Bạn có chắc chắn muốn hủy Test Batch đang chạy?')) return;
  cancellingBatch.value = true;
  try {
    await httpClient.post(`/plugins/testing/test-batches/${id}/cancel`);
    clearInterval(timerInterval);
    clearInterval(simulationInterval);
    isTesting.value = false;
    testFinished.value = false;
    selectedDevices.value.forEach((d) => {
      d.status = 'PENDING';
    });
    updateTabulatorData();
    await loadRunningBatches();
    cyberToast.success('Đã hủy Test Batch');
  } catch (err: any) {
    cyberToast.error(err?.response?.data?.message || 'Không thể hủy Test Batch');
  } finally {
    cancellingBatch.value = false;
  }
}

// ============================================================================
// 7. RUNNING BATCHES & RESTORING STATE
// ============================================================================
async function loadRunningBatches() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches/running');
    const items = res?.data || res?.items || [];
    runningBatches.value = Array.isArray(items) ? items : [];
  } catch {
    runningBatches.value = [];
  }
}

async function onSelectRunningBatch(id: string) {
  if (!id) return;
  try {
    // Call batch status to restore full running state and devices
    const res: any = await httpClient.get(`/plugins/testing/test-batches/${id}/status`);
    const statusData = res?.data || res;
    if (!statusData) return;

    selectedBatchId.value = id;
    selectedBatchConfig.value = {
      batchId: id,
      batchCode: statusData.batchCode,
      batchName: statusData.batchName || statusData.batchCode,
      maxDevices: statusData.devices?.length || 5,
      flowDurationSeconds: statusData.flowDurationSeconds || 300,
    };

    if (statusData.soNumber) {
      selectedSoNumber.value = statusData.soNumber;
      await loadAvailableDevicesForSo(statusData.soNumber);
    }

    totalDurationSeconds.value = statusData.flowDurationSeconds || 300;
    elapsedSeconds.value = statusData.elapsedSeconds || 0;
    remainingSeconds.value = statusData.remainingSeconds || 0;

    if (Array.isArray(statusData.devices) && statusData.devices.length > 0) {
      selectedDevices.value = statusData.devices.map((d: any) => ({
        serialNumber: d.serialNumber,
        devEui: d.devEui,
        itemCode: d.itemCode || filterItemCode.value || '',
        fwVersion: d.fwVersion || filterFwVersion.value || '',
        device: d,
        status: d.verdict || d.status || 'RUNNING',
        packetsCount: d.packetsReceived ?? 0,
        avgRssi: d.avgRssi ?? null,
      }));

      if (statusData.devices[0]?.itemCode) {
        filterItemCode.value = statusData.devices[0].itemCode;
      }
      if (statusData.devices[0]?.fwVersion) {
        filterFwVersion.value = statusData.devices[0].fwVersion;
      }
    }

    if (statusData.status === 'RUNNING') {
      isTesting.value = true;
      testFinished.value = false;

      // Start timers
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        elapsedSeconds.value++;
        remainingSeconds.value = Math.max(0, totalDurationSeconds.value - elapsedSeconds.value);
        if (remainingSeconds.value <= 0) {
          pollBatchStatus();
        }
      }, 1000);

      clearInterval(simulationInterval);
      simulationInterval = setInterval(() => {
        pollBatchStatus();
      }, 3000);
    } else if (statusData.status === 'COMPLETED') {
      isTesting.value = false;
      testFinished.value = true;
      batchVerdict.value = statusData.verdict || 'PASS';
    }

    updateTabulatorData();
    cyberToast.success(`Đã khôi phục trạng thái Test Batch ${statusData.batchCode}`);
  } catch (err: any) {
    cyberToast.error(err?.response?.data?.message || 'Không thể khôi phục Test Batch');
  }
}

async function loadReferenceDevices() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches/reference-devices');
    const items = res?.data?.items || res?.data || [];
    goldenReferenceDevices.value = Array.isArray(items) ? items : [];
  } catch {
    goldenReferenceDevices.value = [];
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  nextTick(() => {
    initAvailableTabulator();
    initBatchTabulator();
  });

  await loadSosWithBatches();
  loadReferenceDevices();
  await loadRunningBatches();

  // If there is an active running batch, auto restore first running batch
  if (runningBatches.value.length > 0 && !selectedBatchId.value) {
    const firstRunning = runningBatches.value[0];
    if (firstRunning && firstRunning.id) {
      await onSelectRunningBatch(firstRunning.id);
    }
  }

  runningBatchesInterval = setInterval(loadRunningBatches, 5000);
});

onBeforeUnmount(() => {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  clearInterval(runningBatchesInterval);
  if (availableTabulator) availableTabulator.destroy();
  if (batchTabulator) batchTabulator.destroy();
});
</script>

<style scoped>
.device-test-batch-panel :deep(.tabulator) {
  border-radius: 0.5rem;
}
</style>
