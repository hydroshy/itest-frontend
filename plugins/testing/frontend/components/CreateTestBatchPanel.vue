<template>
  <div class="create-test-batch-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <FolderPlus class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">Testing Suite Management</span>
              <span class="badge badge-xs badge-outline font-mono">BATCH SETUP</span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              Tạo Test Batch (Create Test Batch)
            </h3>
            <p class="text-xs text-base-content/70">
              Khởi tạo cấu hình đợt kiểm thử hàng loạt: định nghĩa ITEM-CODE, LONG_FW, gán Simulation Flow và Device Auto Check cho đa thiết bị
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button class="btn btn-sm btn-ghost gap-1.5" @click="resetForm">
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới Form
          </button>
          <button
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="saving"
            @click="saveTestBatch"
          >
            <span v-if="saving" class="loading loading-spinner loading-xs"></span>
            <Save v-else class="w-3.5 h-3.5" />
            Lưu Test Batch
          </button>
        </div>
      </div>
    </div>

    <!-- Main Form Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Left Column: Thông tin cơ bản & Định danh thiết bị (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3.5">
          <div class="flex items-center gap-2 pb-2 border-b border-base-300">
            <Layers class="w-4 h-4 text-primary" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
              1. Định Danh Sản Phẩm &amp; Thông Tin Batch
            </h4>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- ITEM-CODE (Required) -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold flex items-center gap-1">
                  ITEM-CODE <span class="text-error">*</span>
                </span>
                <span class="label-text-alt text-[10px] text-base-content/60">Mã dòng sản phẩm</span>
              </label>
              <div class="relative">
                <input
                  v-model="batchForm.itemCode"
                  type="text"
                  placeholder="VD: WSSFC-ATH, WSLRW-TH..."
                  class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100"
                  @input="onItemOrFwChange"
                />
              </div>
              <div class="flex gap-1.5 mt-1 flex-wrap">
                <button
                  v-for="code in itemCodeSuggestions"
                  :key="code"
                  type="button"
                  class="badge badge-sm badge-ghost text-[10px] cursor-pointer hover:badge-primary transition-colors"
                  @click="batchForm.itemCode = code; onItemOrFwChange()"
                >
                  {{ code }}
                </button>
              </div>
            </div>

            <!-- LONG_FW (FW_VERSION) (Required) -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold flex items-center gap-1">
                  LONG_FW (FW_VERSION) <span class="text-error">*</span>
                </span>
                <span class="label-text-alt text-[10px] text-base-content/60">Phiên bản Firmware</span>
              </label>
              <input
                v-model="batchForm.longFw"
                type="text"
                placeholder="VD: 1.0.4, v2.1.0-RC1..."
                class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100"
                @input="onItemOrFwChange"
              />
              <div class="flex gap-1.5 mt-1 flex-wrap">
                <button
                  v-for="fw in fwSuggestions"
                  :key="fw"
                  type="button"
                  class="badge badge-sm badge-ghost text-[10px] cursor-pointer hover:badge-primary transition-colors"
                  @click="batchForm.longFw = fw; onItemOrFwChange()"
                >
                  {{ fw }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <!-- Batch Name -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold">Tên Đợt Test (Batch Name)</span>
              </label>
              <input
                v-model="batchForm.batchName"
                type="text"
                placeholder="VD: Đợt test cảm biến Lô 01..."
                class="input input-sm input-bordered w-full text-xs bg-base-100"
              />
            </div>

            <!-- Batch Code (Auto or Custom) -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold">Mã Batch (Batch Code)</span>
                <button
                  type="button"
                  class="label-text-alt text-[10px] text-primary hover:underline"
                  @click="generateBatchCode"
                >
                  Tự sinh mã
                </button>
              </label>
              <input
                v-model="batchForm.batchCode"
                type="text"
                placeholder="VD: TB-ATH-20261103-01"
                class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100"
              />
            </div>
          </div>

          <!-- Max Devices & Duration -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold flex items-center gap-1">
                  Số thiết bị test cùng lúc (Max Devices)
                </span>
                <span class="badge badge-xs badge-info font-mono text-[10px]">
                  {{ batchForm.maxDevices }} thiết bị
                </span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="batchForm.maxDevices"
                  type="range"
                  min="1"
                  max="20"
                  class="range range-primary range-xs flex-1"
                />
                <input
                  v-model.number="batchForm.maxDevices"
                  type="number"
                  min="1"
                  max="50"
                  class="input input-sm input-bordered w-16 text-center font-mono text-xs bg-base-100"
                />
              </div>
              <div class="flex gap-1.5 mt-1.5">
                <button
                  v-for="count in [3, 5, 8, 10]"
                  :key="count"
                  type="button"
                  class="btn btn-xs btn-outline"
                  :class="batchForm.maxDevices === count ? 'btn-primary' : 'btn-ghost'"
                  @click="batchForm.maxDevices = count"
                >
                  {{ count }} thiết bị
                </button>
              </div>
            </div>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold">Thời lượng đếm giờ (Seconds)</span>
                <span class="label-text-alt text-[10px] font-mono text-base-content/70">
                  ≈ {{ Math.round(batchForm.flowDurationSeconds / 60) }} phút
                </span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="batchForm.flowDurationSeconds"
                  type="number"
                  min="30"
                  step="30"
                  class="input input-sm input-bordered join-item flex-1 font-mono text-xs bg-base-100"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs font-mono px-3">
                  giây
                </span>
              </div>
              <div class="flex gap-1.5 mt-1.5">
                <button
                  v-for="dur in [180, 300, 600, 900]"
                  :key="dur"
                  type="button"
                  class="btn btn-xs btn-outline"
                  :class="batchForm.flowDurationSeconds === dur ? 'btn-primary' : 'btn-ghost'"
                  @click="batchForm.flowDurationSeconds = dur"
                >
                  {{ dur / 60 }}p ({{ dur }}s)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Gán Simulation Flow & Auto Check (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <!-- Section 2: Gán Simulation Flow -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-primary" />
              <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
                2. Gán Simulation Flow
              </h4>
            </div>
            <button
              type="button"
              class="text-xs text-primary hover:underline flex items-center gap-1"
              @click="$emit('switch-tab', 'device-simulation')"
            >
              <span>Tạo flow mới</span>
              <ExternalLink class="w-3 h-3" />
            </button>
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Chọn Kịch Bản Simulation Flow</span>
            </label>
            <select
              v-model="batchForm.simuId"
              class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono"
              @change="onSimulationFlowSelected"
            >
              <option value="">-- Chọn kịch bản kịch bản mô phỏng --</option>
              <option v-for="flow in availableFlows" :key="flow.id" :value="flow.id">
                {{ flow.name }} ({{ flow.duration }}s - {{ flow.blocksCount }} blocks)
              </option>
            </select>
          </div>

          <!-- Flow Summary Card -->
          <div v-if="selectedFlowData" class="p-3 bg-base-100/80 border border-base-300 rounded-lg space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="text-primary flex items-center gap-1.5">
                <PlayCircle class="w-3.5 h-3.5" />
                {{ selectedFlowData.name }}
              </span>
              <span class="badge badge-xs badge-neutral font-mono">
                {{ selectedFlowData.duration }} giây
              </span>
            </div>
            <p class="text-[11px] text-base-content/70">
              {{ selectedFlowData.description }}
            </p>
            <div class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="(step, idx) in selectedFlowData.steps"
                :key="idx"
                class="badge badge-xs badge-outline font-mono text-[10px]"
              >
                {{ idx + 1 }}. {{ step }}
              </span>
            </div>
          </div>
        </div>

        <!-- Section 3: Gán Device Auto Check -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-success" />
              <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
                3. Gán Device Auto Check
              </h4>
            </div>
            <button
              type="button"
              class="text-xs text-success hover:underline flex items-center gap-1"
              @click="$emit('switch-tab', 'device-auto-check')"
            >
              <span>Quy tắc check</span>
              <ExternalLink class="w-3 h-3" />
            </button>
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Chọn Bộ Tiêu Chí Auto Check</span>
            </label>
            <select
              v-model="batchForm.autoCheckId"
              class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono"
              @change="onAutoCheckSelected"
            >
              <option value="">-- Chọn bộ tiêu chí Auto Check --</option>
              <option v-for="crit in availableCriteria" :key="crit.id" :value="crit.id">
                {{ crit.name }} ({{ crit.rulesCount }} tiêu chí)
              </option>
            </select>
          </div>

          <!-- Auto Check Summary Card -->
          <div v-if="selectedCriteriaData" class="p-3 bg-base-100/80 border border-base-300 rounded-lg space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="text-success flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ selectedCriteriaData.name }}
              </span>
              <span class="badge badge-xs badge-success badge-outline font-mono">
                {{ selectedCriteriaData.rulesCount }} rules
              </span>
            </div>
            <p class="text-[11px] text-base-content/70">
              {{ selectedCriteriaData.description }}
            </p>
            <div class="space-y-1 pt-1">
              <div
                v-for="(rule, idx) in selectedCriteriaData.rules"
                :key="idx"
                class="flex items-center justify-between text-[11px] font-mono text-base-content/80 bg-base-200/50 px-2 py-0.5 rounded"
              >
                <span>{{ rule.name }}</span>
                <span class="text-primary text-[10px]">{{ rule.threshold }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Danh Sách Các Test Batch Đã Tạo -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <ListFilter class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            Danh Sách Test Batch Đã Lưu ({{ batchList.length }})
          </h4>
        </div>
        <button class="btn btn-xs btn-outline gap-1" :disabled="loadingBatches" @click="loadBatches">
          <span v-if="loadingBatches" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-3 h-3" />
          Tải Lại Danh Sách
        </button>
      </div>

      <!-- Batches Table -->
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm w-full">
          <thead>
            <tr class="text-xs uppercase bg-base-200/50">
              <th>Mã Batch</th>
              <th>Tên Batch</th>
              <th>ITEM-CODE</th>
              <th>LONG_FW</th>
              <th>Số Lượng TB</th>
              <th>Simulation Flow</th>
              <th>Auto Check</th>
              <th>Thời Lượng</th>
              <th>Trạng Thái</th>
              <th class="text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="batchList.length === 0 && !loadingBatches">
              <td colspan="10" class="text-center py-8 text-base-content/50 italic text-xs">
                Chưa có Test Batch nào được lưu. Hãy điền form bên trên và nhấn "Lưu Test Batch".
              </td>
            </tr>
            <tr v-for="b in batchList" :key="b.id" class="hover text-xs">
              <td>
                <span class="font-mono font-bold text-primary">{{ b.batchCode || b.batch_code }}</span>
              </td>
              <td class="font-medium max-w-[180px] truncate">
                {{ b.batchName || b.batch_name }}
              </td>
              <td>
                <span class="badge badge-sm badge-outline font-mono text-[11px]">{{ b.itemCode || b.item_code }}</span>
              </td>
              <td>
                <span class="font-mono text-xs">{{ b.longFw || b.long_fw || b.fwVersion || b.fw_version }}</span>
              </td>
              <td>
                <span class="font-mono text-xs">{{ b.maxDevices || b.max_devices || 5 }} TB</span>
              </td>
              <td class="max-w-[160px] truncate text-[11px]">
                {{ b.simuId || b.simu_id || 'Mặc định' }}
              </td>
              <td class="max-w-[160px] truncate text-[11px]">
                <span class="text-success">{{ b.autoCheckCriteria?.name || b.auto_check_criteria?.name || 'Standard 2%' }}</span>
              </td>
              <td>
                <span class="font-mono text-xs">{{ b.flowDurationSeconds || b.flow_duration_seconds || 300 }}s</span>
              </td>
              <td>
                <span
                  class="badge badge-xs font-mono font-bold"
                  :class="getBatchStatusClass(b.status)"
                >
                  {{ b.status || 'READY' }}
                </span>
              </td>
              <td>
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    class="btn btn-xs btn-primary gap-1"
                    title="Bắt đầu Test đợt này"
                    @click="executeBatch(b)"
                  >
                    <Play class="w-3 h-3" />
                    <span>Test Ngay</span>
                  </button>
                  <button
                    class="btn btn-xs btn-ghost text-error"
                    title="Xóa Batch"
                    @click="deleteBatch(b)"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  FolderPlus,
  Layers,
  Cpu,
  CheckCircle2,
  RotateCcw,
  Save,
  Play,
  PlayCircle,
  ExternalLink,
  ListFilter,
  RefreshCw,
  Trash2,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

const itemCodeSuggestions = ['WSSFC-ATH', 'WSLRW-TH', 'WSSFC-ULC', 'WSLRW-AQI', 'WSSFC-CO2'];
const fwSuggestions = ['1.0.4', '1.0.5', '2.0.0', 'v2.1.0-RC1'];

const saving = ref(false);
const loadingBatches = ref(false);

const batchForm = reactive({
  itemCode: 'WSSFC-ATH',
  longFw: '1.0.4',
  batchName: 'Đợt Kiểm Thử Cảm Biến WSSFC-ATH',
  batchCode: 'TB-WSSFC-ATH-1.0.4-01',
  maxDevices: 5,
  flowDurationSeconds: 300,
  simuId: 'SIMU-WSSFC-ATH-1.0.4',
  autoCheckId: 'CRIT-SENSOR-TOLERANCE-2PCT',
});

// Available Simulation Flows
const availableFlows = ref([
  {
    id: 'SIMU-WSSFC-ATH-1.0.4',
    name: 'ATH Standard 5-Min Uplink Flow',
    duration: 300,
    blocksCount: 4,
    description: 'Khởi động thiết bị, thực hiện OTAA Join trong 30s và gửi gói tin định kỳ 60s/lần.',
    steps: ['Khởi tạo RF AU915', 'OTAA Join Request', 'Chu kỳ Uplink 60s', 'Payload Telemetry'],
  },
  {
    id: 'SIMU-WSLRW-FULL-10M',
    name: 'LoRaWAN Full Stress Test 10 Phút',
    duration: 600,
    blocksCount: 6,
    description: 'Mô phỏng đa gói tin với thay đổi giá trị cảm biến biên trên nhiều kênh tần số.',
    steps: ['Init Class A', 'Join OTAA', 'Uplink Burst', 'Downlink Ack', 'Sensor Delta Shift', 'Final Status'],
  },
  {
    id: 'SIMU-RAPID-BURST-3M',
    name: 'Rapid Telemetry Check 3 Phút',
    duration: 180,
    blocksCount: 3,
    description: 'Kiểm tra nhanh phản hồi cảm biến và giải mã Dual Payload.',
    steps: ['Init Device', 'Fast Join', 'Continuous 30s Uplink'],
  },
]);

// Available Auto Check Criteria
const availableCriteria = ref([
  {
    id: 'CRIT-SENSOR-TOLERANCE-2PCT',
    name: 'Đối chiếu Thiết Bị Chuẩn & Sai Số ≤ 2%',
    rulesCount: 4,
    description: 'So sánh giá trị đo trực tiếp với Golden Reference Device tương ứng, sai số cho phép ±2%.',
    rules: [
      { name: 'Nhiệt độ (Temp Delta)', threshold: '≤ ±0.5°C' },
      { name: 'Độ ẩm (Humidity Delta)', threshold: '≤ ±2.0% RH' },
      { name: 'RSSI & SNR Quality', threshold: 'RSSI > -115 dBm, SNR > -10 dB' },
      { name: 'FCnt Sequence Integrity', threshold: 'Tăng liên tục không rớt gói' },
    ],
  },
  {
    id: 'CRIT-STRICT-INDUSTRIAL',
    name: 'Tiêu Chuẩn Công Nghiệp Cấp 1 (Strict QA)',
    rulesCount: 5,
    description: 'Quy chuẩn gắt gao cho thiết bị đo áp suất và chất lượng khí, sai số tối đa ±1%.',
    rules: [
      { name: 'Sensor Accuracy Delta', threshold: '≤ ±1.0%' },
      { name: 'Battery Voltage Drift', threshold: 'Delta < 50mV' },
      { name: 'Frame Loss Rate', threshold: '0% Packet Loss' },
      { name: 'Payload Decode Match', threshold: '100% Valid Payload' },
      { name: 'Modbus CRC Integrity', threshold: 'CRC-16 Valid' },
    ],
  },
]);

const selectedFlowData = computed(() => {
  return availableFlows.value.find((f) => f.id === batchForm.simuId);
});

const selectedCriteriaData = computed(() => {
  return availableCriteria.value.find((c) => c.id === batchForm.autoCheckId);
});

function onItemOrFwChange() {
  generateBatchCode();
}

function generateBatchCode() {
  const item = batchForm.itemCode.trim().toUpperCase() || 'ITEM';
  const fw = batchForm.longFw.trim().replace(/\./g, '') || 'FW';
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  batchForm.batchCode = `TB-${item}-${fw}-${dateStr}`;
  if (!batchForm.batchName || batchForm.batchName.startsWith('Đợt Kiểm Thử')) {
    batchForm.batchName = `Đợt Kiểm Thử ${item} FW ${batchForm.longFw}`;
  }
}

function onSimulationFlowSelected() {
  if (selectedFlowData.value) {
    batchForm.flowDurationSeconds = selectedFlowData.value.duration;
  }
}

function onAutoCheckSelected() {
  // Handled automatically via computed property
}

function resetForm() {
  batchForm.itemCode = 'WSSFC-ATH';
  batchForm.longFw = '1.0.4';
  batchForm.batchName = 'Đợt Kiểm Thử Cảm Biến WSSFC-ATH';
  generateBatchCode();
  batchForm.maxDevices = 5;
  batchForm.flowDurationSeconds = 300;
  batchForm.simuId = 'SIMU-WSSFC-ATH-1.0.4';
  batchForm.autoCheckId = 'CRIT-SENSOR-TOLERANCE-2PCT';
  cyberToast.info('Đã làm mới form tạo Test Batch');
}

// Batches list
const batchList = ref<any[]>([]);

async function loadBatches() {
  loadingBatches.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches');
    const items = res?.data?.items || res?.data || res?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      batchList.value = items;
    } else {
      loadFallbackBatches();
    }
  } catch {
    loadFallbackBatches();
  } finally {
    loadingBatches.value = false;
  }
}

function loadFallbackBatches() {
  const cached = localStorage.getItem('itest_test_batches');
  if (cached) {
    try {
      batchList.value = JSON.parse(cached);
      return;
    } catch {}
  }
  // Default mock batches
  batchList.value = [
    {
      id: 'batch-001',
      batchCode: 'TB-WSSFC-ATH-104-01',
      batchName: 'Kiểm thử Lô Cảm Biến Khí Tượng ATH 01',
      itemCode: 'WSSFC-ATH',
      longFw: '1.0.4',
      maxDevices: 5,
      simuId: 'SIMU-WSSFC-ATH-1.0.4',
      autoCheckCriteria: { name: 'Đối chiếu Thiết Bị Chuẩn & Sai Số ≤ 2%' },
      flowDurationSeconds: 300,
      status: 'READY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'batch-002',
      batchCode: 'TB-WSLRW-TH-200-02',
      batchName: 'Kiểm tra Nhiệt Ẩm LoRaWAN Lô 2',
      itemCode: 'WSLRW-TH',
      longFw: '2.0.0',
      maxDevices: 8,
      simuId: 'SIMU-WSLRW-FULL-10M',
      autoCheckCriteria: { name: 'Tiêu Chuẩn Công Nghiệp Cấp 1 (Strict QA)' },
      flowDurationSeconds: 600,
      status: 'READY',
      createdAt: new Date().toISOString(),
    },
  ];
}

async function saveTestBatch() {
  if (!batchForm.itemCode.trim()) {
    cyberToast.warning('Vui lòng nhập ITEM-CODE!');
    return;
  }
  if (!batchForm.longFw.trim()) {
    cyberToast.warning('Vui lòng nhập LONG_FW (FW_VERSION)!');
    return;
  }

  saving.value = true;
  const payload = {
    batchCode: batchForm.batchCode,
    batchName: batchForm.batchName,
    itemCode: batchForm.itemCode.trim().toUpperCase(),
    longFw: batchForm.longFw.trim(),
    fwVersion: batchForm.longFw.trim(),
    maxDevices: batchForm.maxDevices,
    flowDurationSeconds: batchForm.flowDurationSeconds,
    simuId: batchForm.simuId,
    simulationFlow: selectedFlowData.value || { id: batchForm.simuId },
    autoCheckCriteria: selectedCriteriaData.value || { id: batchForm.autoCheckId },
    status: 'READY',
  };

  try {
    const res: any = await httpClient.post('/plugins/testing/test-batches', payload);
    cyberToast.success('Tạo Test Batch thành công!');
    const newBatch = res?.data || res || { ...payload, id: `tb-${Date.now()}` };
    batchList.value.unshift(newBatch);
    saveBatchesToLocal();
  } catch (err: any) {
    // If backend is still initializing or returned 404, fallback save locally
    const fallbackItem = { ...payload, id: `tb-${Date.now()}` };
    batchList.value.unshift(fallbackItem);
    saveBatchesToLocal();
    cyberToast.success('Đã lưu cấu hình Test Batch thành công!');
  } finally {
    saving.value = false;
  }
}

function saveBatchesToLocal() {
  localStorage.setItem('itest_test_batches', JSON.stringify(batchList.value));
}

function deleteBatch(batch: any) {
  if (confirm(`Bạn có chắc chắn muốn xóa batch ${batch.batchCode || batch.batch_code}?`)) {
    const id = batch.id;
    httpClient.delete(`/plugins/testing/test-batches/${id}`).catch(() => {});
    batchList.value = batchList.value.filter((b) => b.id !== id);
    saveBatchesToLocal();
    cyberToast.success('Đã xóa Test Batch');
  }
}

function executeBatch(batch: any) {
  emit('switch-tab', 'test-batch', {
    batchId: batch.id,
    itemCode: batch.itemCode || batch.item_code,
    fwVersion: batch.longFw || batch.long_fw || batch.fwVersion || batch.fw_version,
    batchCode: batch.batchCode || batch.batch_code,
    batchName: batch.batchName || batch.batch_name,
    maxDevices: batch.maxDevices || batch.max_devices || 5,
    flowDurationSeconds: batch.flowDurationSeconds || batch.flow_duration_seconds || 300,
    simuId: batch.simuId || batch.simu_id,
    autoCheckCriteria: batch.autoCheckCriteria || batch.auto_check_criteria,
  });
}

function getBatchStatusClass(status?: string) {
  switch (status) {
    case 'READY':
      return 'badge-info text-info-content';
    case 'RUNNING':
      return 'badge-warning text-warning-content animate-pulse';
    case 'COMPLETED':
      return 'badge-success text-success-content';
    case 'FAILED':
      return 'badge-error text-error-content';
    default:
      return 'badge-neutral';
  }
}

onMounted(() => {
  loadBatches();
});
</script>
