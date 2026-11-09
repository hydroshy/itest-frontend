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
      </div>

      <!-- 2. THANH TIẾN TRÌNH & ĐIỀU KHIỂN KIỂM THỬ (ĐẶT TRÊN PHẦN CHỌN SO_NUMBER) -->
      <div class="bg-base-100/70 p-3 rounded-lg border border-base-300/80 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- Trạng thái & Bộ đếm thời gian -->
          <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div
              class="flex items-center gap-1.5 font-bold"
              :class="isTesting ? 'text-warning' : testFinished ? (batchVerdict === 'PASS' ? 'text-success' : 'text-error') : 'text-base-content/70'"
            >
              <Timer class="w-4 h-4" :class="{ 'animate-spin': isTesting }" />
              <span>{{ isTesting ? 'ĐANG CHẠY TEST' : testFinished ? `KẾT QUẢ: ${batchVerdict || 'XONG'}` : 'SẴN SÀNG' }}</span>
            </div>
            <span>|</span>
            <span>Còn lại: <b class="text-primary font-bold">{{ formattedRemaining }}</b></span>
            <span>|</span>
            <span>Đã chạy: <b class="text-base-content/80">{{ formattedElapsed }}</b></span>
            <span v-if="isTesting || testFinished">|</span>
            <span v-if="isTesting || testFinished" class="text-info font-medium">
              Tiến độ: {{ Math.round((elapsedSeconds / Math.max(1, totalDurationSeconds)) * 100) }}%
            </span>
          </div>

          <!-- Các Nút Hành Động Kiểm Thử Chính (Đưa lên trên đỉnh) -->
          <div class="flex items-center gap-2">
            <!-- Nút Bắt Đầu Test Batch Chính -->
            <button
              v-if="!isTesting && !testFinished"
              class="btn btn-sm btn-primary gap-1.5 px-4 font-bold shadow-sm"
              :disabled="selectedDevices.length === 0 || !selectedBatchConfig"
              @click="startBatchTest"
            >
              <Play class="w-4 h-4 fill-current" />
              Bắt Đầu Test Batch ({{ selectedDevices.length }})
            </button>

            <!-- Nút Hoàn Thành Test Batch -->
            <button
              v-if="isTesting || testFinished"
              class="btn btn-sm btn-success gap-1.5 px-3 font-bold"
              :disabled="completingBatch || !selectedBatchId"
              @click="completeSelectedBatch"
            >
              <CheckCircle2 class="w-4 h-4" />
              {{ completingBatch ? 'Đang Hoàn Thành...' : 'Hoàn Thành Test Batch' }}
            </button>

            <!-- Nút Hủy Batch -->
            <button
              v-if="isTesting"
              class="btn btn-sm btn-error gap-1 px-3"
              :disabled="cancellingBatch"
              @click="cancelSelectedBatch"
            >
              <Square class="w-3.5 h-3.5" />
              Hủy Batch
            </button>
          </div>
        </div>

        <!-- Thanh progress luôn hiển thị trực quan phía trên SO_NUMBER -->
        <progress
          class="progress w-full h-2"
          :class="testFinished ? (batchVerdict === 'PASS' ? 'progress-success' : 'progress-error') : isTesting ? 'progress-primary' : 'progress-ghost'"
          :value="isTesting || testFinished ? elapsedSeconds : 0"
          :max="Math.max(1, totalDurationSeconds)"
        ></progress>
      </div>

      <!-- 3. Hàng Điều Khiển Chính: SO_NUMBER, TEST BATCH, ITEM_CODE, FW_VERSION -->
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

      <!-- 4. KHU VỰC 2 TABULATOR: CHIA PHÂN NỬA 50-50 CĂN CHỈNH BẰNG NHAU -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <!-- CỘT 1 (50%): TABULATOR 1 - Danh Sách Thiết Bị Trong SO (Chưa test) -->
        <div class="flex flex-col h-full bg-base-100/40 p-3 rounded-xl border border-base-300 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wide text-base-content flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                1. Thiết Bị Trong SO ({{ availableDevicesDisplayCount }})
              </span>
              <span v-if="loadingDevices" class="loading loading-spinner loading-xs text-primary"></span>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative w-44 sm:w-52">
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
                title="Chuyển các thiết bị đã chọn sang Batch"
              >
                + Chuyển ({{ selectedAvailableRows.length }})
              </button>
            </div>
          </div>

          <!-- Khung Tabulator 1 -->
          <div class="overflow-hidden rounded-lg border border-base-300 flex-1">
            <div ref="availableTableRef" class="w-full text-xs h-[350px]"></div>
          </div>
          <div class="text-[11px] text-base-content/60 flex items-center justify-between pt-1">
            <span>💡 Nhấp đúp chuột vào hàng để chuyển nhanh sang Batch</span>
            <span v-if="selectedAvailableRows.length > 0" class="text-primary font-bold">Đã chọn: {{ selectedAvailableRows.length }} thiết bị</span>
          </div>
        </div>

        <!-- CỘT 2 (50%): TABULATOR 2 - Thiết Bị Trong Test Batch -->
        <div class="flex flex-col h-full bg-base-100/40 p-3 rounded-xl border border-base-300 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wide text-primary flex items-center gap-1.5">
                <Cpu class="w-3.5 h-3.5 text-primary" />
                2. Thiết Bị Trong Test Batch ({{ selectedDevices.length }}/{{ maxAllowedDevices }})
              </span>
              <span
                v-if="selectedDevices.length >= maxAllowedDevices"
                class="badge badge-xs badge-info font-mono font-bold"
              >
                TỐI ĐA
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="requiresReferenceDevice"
                class="btn btn-xs btn-outline btn-success gap-1"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="autoAssignReferenceDevices"
                title="Tự động gán thiết bị chuẩn"
              >
                <Sparkles class="w-3 h-3" />
                Gán Chuẩn
              </button>
              <button
                class="btn btn-xs btn-ghost text-error gap-1"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="clearBatchDevices"
                title="Trả tất cả thiết bị về lại danh sách SO"
              >
                <Trash2 class="w-3 h-3" />
                Xóa Hết
              </button>
            </div>
          </div>

          <!-- Khung Tabulator 2 -->
          <div class="overflow-hidden rounded-lg border border-base-300 flex-1">
            <div ref="batchTableRef" class="w-full text-xs h-[350px]"></div>
          </div>
          <div class="text-[11px] text-base-content/60 flex items-center justify-between pt-1">
            <span>💡 Nhấp đúp chuột vào hàng để bỏ khỏi Batch trả về SO</span>
            <span v-if="isTesting" class="text-info font-bold animate-pulse">Đang đo kiểm telemetry...</span>
          </div>
        </div>
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
  CheckCircle2,
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
const availableDevicesDisplayCount = computed(() => getFilteredAvailableDevices().length);

// Selected Batch Devices
const selectedDevices = ref<any[]>([]);
const goldenReferenceDevices = ref<any[]>([]);

// Running Batches
const runningBatches = ref<any[]>([]);
const cancellingBatch = ref(false);
const completingBatch = ref(false);

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
    const user = authStore.user?.username || '';
    const res: any = await httpClient.get('/plugins/testing/test-batches/available-devices', {
      params: {
        soNumber: soNumber.trim(),
        user: user || undefined,
        limit: 200,
      },
    });

    const rawList = res?.data || res?.items || [];
    availableDevices.value = (Array.isArray(rawList) ? rawList : []).map((d: any) => ({
      id: d.id,
      serialNumber: d.serialNumber || d.serial_number || d.registrationCode || d.registration_code || d.networkId || d.id,
      devEui: d.devEui || d.dev_eui || d.networkId || d.network_id || '—',
      itemCode: d.itemCode || d.item_code || filterItemCode.value || '—',
      fwVersion: d.fwVersion || d.fw_version || d.longFw || d.long_fw || filterFwVersion.value || '—',
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
    placeholder: 'Không có thiết bị chưa test trong SO.',
    height: '350px',
    selectableRows: true,
    selectableRowsCheck: (row) => {
      const data = row.getData();
      return !data.isRunningBatch;
    },
    columns: [
      {
        formatter: 'rowSelection',
        titleFormatter: 'rowSelection',
        width: 38,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'STT',
        formatter: 'rownum',
        width: 45,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'Serial Number',
        field: 'serialNumber',
        widthGrow: 1.8,
        minWidth: 120,
        headerSort: true,
        formatter: (cell) => {
          const val = cell.getValue();
          return `<span class="font-mono font-bold text-xs text-primary">${val || '—'}</span>`;
        },
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 1.8,
        minWidth: 120,
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-xs text-base-content/80">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Item Code',
        field: 'itemCode',
        width: 100,
        formatter: (cell) => `<span class="badge badge-xs badge-outline font-mono">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'FW',
        field: 'fwVersion',
        width: 75,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => `<span class="font-mono text-xs">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Chuyển',
        width: 65,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.isRunningBatch) {
            return '<span class="text-[10px] text-warning font-semibold cursor-not-allowed">Đang chạy</span>';
          }
          return '<button class="btn btn-xs btn-primary btn-outline font-bold px-1.5" title="Chuyển vào Test Batch">→</button>';
        },
        cellClick: (_e, cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.isRunningBatch) {
            cyberToast.warning(`Thiết bị ${rowData.serialNumber} đang chạy test batch khác (${rowData.runningBatchCode || ''}), không thể thêm!`);
            return;
          }
          addSingleDeviceToBatch(rowData);
        },
      },
    ],
    rowDblClick: (_e, row) => {
      const rowData = row.getData();
      if (!rowData.isRunningBatch) {
        addSingleDeviceToBatch(rowData);
      }
    },
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
    placeholder: 'Chưa có thiết bị nào trong Test Batch. Nhấp đúp chuột hoặc chọn từ bảng bên trái.',
    height: '350px',
    columns: [
      {
        title: 'STT',
        formatter: 'rownum',
        width: 45,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'Serial Number',
        field: 'serialNumber',
        widthGrow: 1.5,
        minWidth: 115,
        formatter: (cell) => `<span class="font-mono font-bold text-xs text-primary">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 1.5,
        minWidth: 115,
        formatter: (cell) => `<span class="font-mono text-xs text-base-content/80">${cell.getValue() || '—'}</span>`,
      },
      {
        title: 'Trạng Thái',
        field: 'status',
        width: 90,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = (cell.getValue() || 'PENDING').toUpperCase();
          if (val === 'PASS' || val === 'TESTED_PASS') {
            return '<span class="badge badge-success badge-xs font-bold">PASS</span>';
          }
          if (val === 'FAIL' || val === 'TESTED_FAIL') {
            return '<span class="badge badge-error badge-xs font-bold">FAIL</span>';
          }
          if (val === 'RUNNING') {
            return '<span class="badge badge-warning badge-xs animate-pulse font-bold">RUNNING</span>';
          }
          return '<span class="badge badge-ghost badge-xs font-bold">PENDING</span>';
        },
      },
      {
        title: 'Gói',
        field: 'packetsCount',
        width: 50,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => `<span class="badge badge-ghost badge-xs font-mono">${cell.getValue() || 0}</span>`,
      },
      {
        title: 'AVG_CYCLE',
        field: 'avgCycle',
        width: 85,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = cell.getValue();
          if (val != null && val !== '') {
            return `<span class="font-mono font-bold text-xs text-info">${Number(val).toFixed(1)}s</span>`;
          }
          return '<span class="text-xs text-base-content/40 font-mono">—</span>';
        },
      },
      {
        title: 'AVG_RSSI',
        field: 'avgRssi',
        width: 85,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = cell.getValue();
          if (val != null && val !== '') {
            return `<span class="font-mono font-bold text-xs text-primary">${val}</span>`;
          }
          return '<span class="text-xs text-base-content/40 font-mono">—</span>';
        },
      },
      {
        title: 'AVG_SNR',
        field: 'avgSnr',
        width: 80,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = cell.getValue();
          if (val != null && val !== '') {
            return `<span class="font-mono font-bold text-xs text-success">${val}</span>`;
          }
          return '<span class="text-xs text-base-content/40 font-mono">—</span>';
        },
      },
      {
        title: 'Bỏ',
        width: 50,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
        formatter: () => '<button class="btn btn-xs btn-ghost text-error px-1 font-bold" title="Bỏ khỏi batch trả về SO">✕</button>',
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
    rowDblClick: (_e, row) => {
      if (isTesting.value) {
        cyberToast.warning('Batch đang chạy kiểm thử!');
        return;
      }
      const rowData = row.getData();
      removeDeviceFromBatch(getDeviceIdentifier(rowData.device || rowData));
    },
  });
}

function getFilteredAvailableDevices() {
  let list = availableDevices.value || [];

  // 1. Chỉ hiển thị thiết bị CHƯA TEST
  list = list.filter((d) => {
    const st = (d.status || '').toUpperCase();
    const tr = (d.testResult || d.raw?.testResult || d.raw?.test_result || d.raw?.status || '').toUpperCase();
    if (st === 'PASS' || st === 'FAIL' || st === 'TESTED_PASS' || st === 'TESTED_FAIL') return false;
    if (tr === 'PASS' || tr === 'FAIL' || tr === 'TESTED_PASS' || tr === 'TESTED_FAIL') return false;
    return true;
  });

  // 2. Khi chuyển sang Tabulator 2 thì thiết bị ở Tabulator 1 biến mất
  const selectedIdentifiers = new Set(
    selectedDevices.value.map((s) => getDeviceIdentifier(s.device || s))
  );
  list = list.filter((d) => !selectedIdentifiers.has(getDeviceIdentifier(d.raw || d)));

  // 3. Lọc tìm kiếm nếu có
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
  const devId = getDeviceIdentifier(rawDev);
  if (selectedDevices.value.some((s) => getDeviceIdentifier(s.device || s) === devId)) {
    return;
  }

  selectedDevices.value.push({
    serialNumber: deviceRow.serialNumber,
    devEui: deviceRow.devEui,
    itemCode: deviceRow.itemCode,
    fwVersion: deviceRow.fwVersion,
    device: rawDev,
    referenceDeviceId: '',
    status: 'PENDING',
    packetsCount: 0,
    avgCycle: null,
    avgRssi: null,
    avgSnr: null,
  });

  if (requiresReferenceDevice.value && goldenReferenceDevices.value.length > 0) {
    const idx = selectedDevices.value.length - 1;
    const refDev = goldenReferenceDevices.value[idx % goldenReferenceDevices.value.length];
    if (refDev) {
      selectedDevices.value[idx].referenceDeviceId = refDev.id;
      selectedDevices.value[idx].referenceDevice = refDev;
    }
  }

  selectedAvailableRows.value = selectedAvailableRows.value.filter(
    (r) => getDeviceIdentifier(r.raw || r) !== devId
  );

  cyberToast.success(`Đã chuyển ${deviceRow.serialNumber} vào Test Batch`);
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
    const rawDev = row.raw || row;
    const devId = getDeviceIdentifier(rawDev);
    if (!selectedDevices.value.some((s) => getDeviceIdentifier(s.device || s) === devId)) {
      selectedDevices.value.push({
        serialNumber: row.serialNumber,
        devEui: row.devEui,
        itemCode: row.itemCode,
        fwVersion: row.fwVersion,
        device: rawDev,
        referenceDeviceId: '',
        status: 'PENDING',
        packetsCount: 0,
        avgCycle: null,
        avgRssi: null,
        avgSnr: null,
      });
      addedCount++;
    }
  }

  if (requiresReferenceDevice.value && goldenReferenceDevices.value.length > 0) {
    selectedDevices.value.forEach((item, idx) => {
      if (!item.referenceDeviceId) {
        const refDev = goldenReferenceDevices.value[idx % goldenReferenceDevices.value.length];
        if (refDev) {
          item.referenceDeviceId = refDev.id;
          item.referenceDevice = refDev;
        }
      }
    });
  }

  selectedAvailableRows.value = [];
  updateTabulatorData();
  if (addedCount > 0) {
    cyberToast.success(`Đã chuyển ${addedCount} thiết bị vào Test Batch.`);
  }
}

function removeDeviceFromBatch(deviceId: string) {
  if (isTesting.value) {
    cyberToast.warning('Batch đang chạy kiểm thử!');
    return;
  }
  const removed = selectedDevices.value.find((s) => getDeviceIdentifier(s.device || s) === deviceId);
  selectedDevices.value = selectedDevices.value.filter((s) => {
    const id = getDeviceIdentifier(s.device || s);
    return id !== deviceId;
  });
  updateTabulatorData();
  if (removed) {
    cyberToast.info(`Đã trả thiết bị ${removed.serialNumber} về danh sách SO`);
  }
}

function clearBatchDevices() {
  if (isTesting.value) {
    cyberToast.warning('Batch đang chạy kiểm thử!');
    return;
  }
  selectedDevices.value = [];
  updateTabulatorData();
  cyberToast.info('Đã trả tất cả thiết bị về lại danh sách SO');
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
          if (dev.avgCycle != null) item.avgCycle = dev.avgCycle;
          else if (dev.comparisonResult?.avg_cycle != null) item.avgCycle = dev.comparisonResult.avg_cycle;
          if (dev.avgRssi != null) item.avgRssi = dev.avgRssi;
          else if (dev.comparisonResult?.avg_rssi != null) item.avgRssi = dev.comparisonResult.avg_rssi;
          if (dev.avgSnr != null) item.avgSnr = dev.avgSnr;
          else if (dev.comparisonResult?.avg_snr != null) item.avgSnr = dev.comparisonResult.avg_snr;
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

async function completeSelectedBatch() {
  const id = selectedBatchId.value;
  if (!id) return;
  if (isTesting.value) {
    if (!window.confirm('Đợt test đang chạy. Bạn có chắc chắn muốn hoàn thành ngay? Kết quả sẽ được ghi nhận vào Traceability và thiết bị sẽ được xóa khỏi hệ thống đo kiểm.')) {
      return;
    }
  }

  completingBatch.value = true;
  try {
    const res: any = await httpClient.post(`/plugins/testing/test-batches/${id}/complete`);
    const verdict = res?.data?.verdict || batchVerdict.value || 'PASS';
    cyberToast.success(`Đã hoàn thành Test Batch (${verdict}) và đồng bộ sang Traceability.`);

    resetBatchInterface();
    await loadRunningBatches();
    await loadSosWithBatches();
  } catch (err: any) {
    cyberToast.error(err?.response?.data?.message || 'Không thể hoàn thành Test Batch');
  } finally {
    completingBatch.value = false;
  }
}

function resetBatchInterface() {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  timerInterval = null;
  simulationInterval = null;

  selectedBatchId.value = '';
  selectedBatchConfig.value = null;
  selectedSoNumber.value = '';
  filterItemCode.value = '';
  filterFwVersion.value = '';
  availableDevices.value = [];
  selectedDevices.value = [];
  selectedAvailableRows.value = [];
  isTesting.value = false;
  testFinished.value = false;
  batchVerdict.value = '';
  elapsedSeconds.value = 0;
  remainingSeconds.value = 0;

  try {
    const user = authStore.user?.username || 'default';
    sessionStorage.removeItem(`device_test_batch_active_${user}`);
  } catch {}

  updateTabulatorData();
}

async function cancelSelectedBatch() {
  const id = selectedBatchId.value;
  if (!id || !window.confirm('Bạn có chắc chắn muốn hủy Test Batch đang chạy?')) return;
  cancellingBatch.value = true;
  try {
    await httpClient.post(`/plugins/testing/test-batches/${id}/cancel`);
    resetBatchInterface();
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
        avgCycle: d.avgCycle ?? d.comparisonResult?.avg_cycle ?? null,
        avgRssi: d.avgRssi ?? d.comparisonResult?.avg_rssi ?? null,
        avgSnr: d.avgSnr ?? d.comparisonResult?.avg_snr ?? null,
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
    try {
      const user = authStore.user?.username || 'default';
      sessionStorage.setItem(`device_test_batch_active_${user}`, id);
    } catch {}
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

  // If there is an active running batch, prioritize restoring user's saved session
  const user = authStore.user?.username || 'default';
  const savedActiveBatchId = sessionStorage.getItem(`device_test_batch_active_${user}`);
  if (savedActiveBatchId && runningBatches.value.some((b) => b.id === savedActiveBatchId)) {
    await onSelectRunningBatch(savedActiveBatchId);
  } else if (runningBatches.value.length > 0 && !selectedBatchId.value) {
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
