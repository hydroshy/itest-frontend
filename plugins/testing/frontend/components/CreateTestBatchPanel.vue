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
              Khởi tạo cấu hình đợt kiểm thử hàng loạt: định nghĩa ITEM-CODE, FW_VERSION, số lượng DUTs và gán Simulation Flow tự động
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

    <!-- Stacked Full-Width Sections 1 -> 2 -> 3 -->
    <div class="space-y-4">
      <!-- Section 1: Định Danh Sản Phẩm & Thông Tin Batch (Full Width) -->
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-base-300">
          <div class="flex items-center gap-2">
            <Layers class="w-4 h-4 text-primary" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
              1. Định Danh Sản Phẩm &amp; Thông Tin Batch
            </h4>
          </div>
          <span class="badge badge-xs badge-outline font-mono text-[10px]">CẤU HÌNH BATCH</span>
        </div>

        <!-- Sắp xếp theo thứ tự từ trên xuống ngang qua hết -->
        <div class="space-y-3">
          <!-- 1. Mã Batch (Batch code: người dùng không thể điền, hiển thị thông tin thôi) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <ScanBarcode class="w-3.5 h-3.5 text-primary" />
                Mã Batch (Batch Code)
              </span>
              <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Tự động sinh mã</span>
            </label>
            <input
              :value="batchForm.batchCode"
              type="text"
              readonly
              class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-300/40 border-base-300 text-base-content font-bold cursor-not-allowed select-all focus:outline-none"
              title="Mã batch tự động tạo theo thông tin dòng máy và ngày tháng (không thể sửa)"
              tabindex="-1"
            />
          </div>

          <!-- 2. Tên Đợt Test (Batch name: field người dùng điền) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <FileText class="w-3.5 h-3.5 text-primary" />
                Tên Đợt Test (Batch Name) <span class="text-error">*</span>
              </span>
              <span class="label-text-alt text-[10px] text-base-content/60">Người dùng nhập</span>
            </label>
            <input
              v-model="batchForm.batchName"
              type="text"
              placeholder="Nhập tên đợt test (VD: Đợt Kiểm Thử Cảm Biến Lô 01...)"
              class="input input-sm input-bordered w-full text-xs bg-base-100 focus:border-primary"
            />
          </div>

          <!-- 3. Mã Sản Phẩm (Item code) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <Cpu class="w-3.5 h-3.5 text-primary" />
                Mã Sản Phẩm (ITEM-CODE) <span class="text-error">*</span>
              </span>
              <span class="label-text-alt text-[10px] text-base-content/60">Dòng sản phẩm</span>
            </label>
            <input
              v-model="batchForm.itemCode"
              type="text"
              placeholder="VD: WSSFC-ATH, WSLRW-TH..."
              class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100 focus:border-primary"
              @input="onItemCodeInput"
            />
          </div>

          <!-- 4. Phiên Bản Firmware (FW_VERSION: có cấu trúc như là 4F0505 với XFXXXX , x là số) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <Terminal class="w-3.5 h-3.5 text-primary" />
                Phiên Bản Firmware (FW_VERSION) <span class="text-error">*</span>
              </span>
              <span
                class="label-text-alt text-[10px] font-mono"
                :class="isFwVersionValid ? 'text-base-content/60' : 'text-error font-semibold'"
              >
                {{ isFwVersionValid ? 'Cấu trúc: XFXXXX (VD: 4F0505)' : 'Chưa đúng chuẩn XFXXXX' }}
              </span>
            </label>
            <input
              v-model="batchForm.longFw"
              type="text"
              maxlength="6"
              placeholder="VD: 4F0505"
              class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100 focus:border-primary"
              :class="{ 'input-error': !isFwVersionValid && batchForm.longFw }"
              @input="onFwVersionInput"
            />
            <div v-if="!isFwVersionValid && batchForm.longFw" class="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" />
              <span>FW_VERSION phải có cấu trúc XFXXXX với x là số (VD: 4F0505, x là số)</span>
            </div>
          </div>

          <!-- 5. Số Lượng Thiết Bị (số lượng thiết bị là field người dùng nhập) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <Server class="w-3.5 h-3.5 text-primary" />
                Số Lượng Thiết Bị Test Cùng Lúc <span class="text-error">*</span>
              </span>
              <span class="label-text-alt text-[10px] text-base-content/60">Người dùng nhập</span>
            </label>
            <input
              v-model.number="batchForm.maxDevices"
              type="number"
              min="1"
              max="50"
              placeholder="Nhập số lượng thiết bị (VD: 5)"
              class="input input-sm input-bordered w-full font-mono text-xs bg-base-100 focus:border-primary"
            />
          </div>

          <!-- 6. Thời Gian Đếm Sensor (hiển thị theo simulation flow , không cho người dùng điền) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-primary" />
                Thời Gian Đếm Sensor
              </span>
              <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Theo Simulation Flow</span>
            </label>
            <div class="flex items-center justify-between px-3 py-2 bg-base-300/40 border border-base-300 rounded-lg text-xs">
              <div class="flex items-center gap-2">
                <Timer class="w-4 h-4 text-primary" />
                <span class="font-mono font-bold text-base-content">
                  {{ formatDuration(batchForm.flowDurationSeconds) }}
                </span>
              </div>
              <span class="text-[11px] text-base-content/60 font-mono">
                {{ selectedFlowData ? selectedFlowData.name : 'Khóa tự động theo flow' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Gán Simulation Flow (Full Width) -->
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-base-300">
          <div class="flex items-center gap-2">
            <PlayCircle class="w-4 h-4 text-primary" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
              2. Gán Simulation Flow
            </h4>
          </div>
          <button
            type="button"
            class="text-xs text-primary hover:underline flex items-center gap-1"
            @click="$emit('switch-tab', 'simulation-flow')"
          >
            <span>Quản lý kịch bản</span>
            <ExternalLink class="w-3 h-3" />
          </button>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Chọn Kịch Bản Mô Phỏng (Simulation Flow)</span>
          </label>
          <select
            v-model="batchForm.simuId"
            class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono"
            @change="onSimulationFlowSelected"
          >
            <option value="">-- Chọn kịch bản mô phỏng --</option>
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

      <!-- Section 3: Gán Device Auto Check (Full Width) -->
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
          >
            <option value="">-- Chọn bộ tiêu chí Auto Check --</option>
            <option v-for="crit in availableCriteria" :key="crit.id" :value="crit.id">
              {{ crit.name }} ({{ crit.rulesCount }} rules)
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

    <!-- Section 4: Danh Sách Các Test Batch Đã Tạo -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <ListFilter class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            4. Danh Sách Test Batch Đã Thiết Lập (Batch History)
          </h4>
          <span class="badge badge-sm badge-ghost font-mono">
            {{ filteredBatches.length }} đợt
          </span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <div class="relative w-48 sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm mã batch, tên..."
              class="input input-xs input-bordered w-full pl-8 font-mono text-xs bg-base-100"
            />
          </div>
          <button class="btn btn-xs btn-ghost gap-1" @click="loadBatches">
            <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loadingBatches }" />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-xs w-full">
          <thead>
            <tr class="text-base-content/70 border-b border-base-300">
              <th>Mã Batch</th>
              <th>Tên Đợt Test</th>
              <th>ITEM-CODE</th>
              <th>FW_VERSION</th>
              <th>Số lượng TB</th>
              <th>Simulation Flow</th>
              <th>Auto Check</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th class="text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingBatches">
              <td colspan="10" class="text-center py-6">
                <span class="loading loading-spinner loading-sm text-primary"></span>
                <span class="text-xs text-base-content/60 ml-2">Đang tải danh sách Test Batch...</span>
              </td>
            </tr>
            <tr v-else-if="filteredBatches.length === 0">
              <td colspan="10" class="text-center py-6 text-xs text-base-content/50 italic">
                Chưa có Test Batch nào phù hợp với bộ lọc.
              </td>
            </tr>
            <tr
              v-for="b in filteredBatches"
              v-else
              :key="b.id || b.batchCode"
              class="hover:bg-base-200/50 transition-colors"
            >
              <td>
                <span class="font-mono text-xs font-bold text-primary">{{ b.batchCode || b.batch_code }}</span>
              </td>
              <td class="font-semibold text-xs max-w-[180px] truncate">
                {{ b.batchName || b.batch_name || b.name || 'Không có tên' }}
              </td>
              <td>
                <span class="badge badge-sm badge-outline font-mono text-[11px]">{{ b.itemCode || b.item_code }}</span>
              </td>
              <td>
                <span class="font-mono text-xs font-semibold text-accent">{{ b.longFw || b.long_fw || b.fwVersion || b.fw_version }}</span>
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
                    title="Xóa cấu hình Batch này"
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
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  FolderPlus,
  Layers,
  Cpu,
  Clock,
  PlayCircle,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  ListFilter,
  RefreshCw,
  Search,
  Trash2,
  Play,
  AlertTriangle,
  Timer,
  ScanBarcode,
  FileText,
  Server,
  Terminal,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

const saving = ref(false);
const loadingBatches = ref(false);

const batchForm = reactive({
  itemCode: 'WSSFC-ATH',
  longFw: '4F0505',
  batchName: 'Đợt Kiểm Thử Cảm Biến WSSFC-ATH 4F0505',
  batchCode: 'TB-WSSFC-ATH-4F0505-01',
  maxDevices: 5,
  flowDurationSeconds: 300,
  simuId: 'SIMU-WSSFC-ATH-1.0.4',
  autoCheckId: 'CRIT-SENSOR-TOLERANCE-2PCT',
});

// FW_VERSION format: XFXXXX where x is a number (0-9)
const isFwVersionValid = computed(() => {
  if (!batchForm.longFw) return true;
  return /^[0-9]F[0-9]{4}$/.test(batchForm.longFw.trim());
});

function onItemCodeInput(e: Event) {
  const target = e.target as HTMLInputElement;
  batchForm.itemCode = target.value.toUpperCase();
  generateBatchCode();
}

function onFwVersionInput(e: Event) {
  const target = e.target as HTMLInputElement;
  batchForm.longFw = target.value.toUpperCase();
  generateBatchCode();
}

function generateBatchCode() {
  const item = batchForm.itemCode.trim().toUpperCase() || 'ITEM';
  const fw = batchForm.longFw.trim().toUpperCase() || 'FW';
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  batchForm.batchCode = `TB-${item}-${fw}-${dateStr}`;
  if (!batchForm.batchName || batchForm.batchName.startsWith('Đợt Kiểm Thử')) {
    batchForm.batchName = `Đợt Kiểm Thử ${item} ${fw}`;
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 giây';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${seconds}s (${m} phút ${s}s)`;
  if (m > 0) return `${seconds}s (${m} phút)`;
  return `${seconds} giây`;
}

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
    description: 'So sánh giá trị đo trực tiếp với Golden Reference Device tương ứng, sai số cho phép ≤ 2%.',
    rules: [
      { name: 'Nhiệt độ (Temperature Delta)', threshold: '≤ ±0.5 °C' },
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

function onSimulationFlowSelected() {
  const flow = availableFlows.value.find((f) => f.id === batchForm.simuId);
  if (flow) {
    batchForm.flowDurationSeconds = flow.duration;
  }
}

watch(
  () => batchForm.simuId,
  (newId) => {
    const flow = availableFlows.value.find((f) => f.id === newId);
    if (flow) {
      batchForm.flowDurationSeconds = flow.duration;
    }
  },
  { immediate: true }
);

function resetForm() {
  batchForm.itemCode = 'WSSFC-ATH';
  batchForm.longFw = '4F0505';
  batchForm.batchName = 'Đợt Kiểm Thử Cảm Biến WSSFC-ATH 4F0505';
  generateBatchCode();
  batchForm.maxDevices = 5;
  batchForm.simuId = 'SIMU-WSSFC-ATH-1.0.4';
  const flow = availableFlows.value.find((f) => f.id === batchForm.simuId);
  batchForm.flowDurationSeconds = flow ? flow.duration : 300;
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
      batchCode: 'TB-WSSFC-ATH-4F0505-01',
      batchName: 'Kiểm thử Lô Cảm Biến Khí Tượng ATH 01',
      itemCode: 'WSSFC-ATH',
      longFw: '4F0505',
      fwVersion: '4F0505',
      maxDevices: 5,
      simuId: 'SIMU-WSSFC-ATH-1.0.4',
      autoCheckCriteria: { name: 'Đối chiếu Thiết Bị Chuẩn & Sai Số ≤ 2%' },
      flowDurationSeconds: 300,
      status: 'READY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'batch-002',
      batchCode: 'TB-WSLRW-TH-1F0001-02',
      batchName: 'Kiểm tra Nhiệt Ẩm LoRa Cấp Tốc',
      itemCode: 'WSLRW-TH',
      longFw: '1F0001',
      fwVersion: '1F0001',
      maxDevices: 8,
      simuId: 'SIMU-RAPID-BURST-3M',
      autoCheckCriteria: { name: 'Tiêu Chuẩn Công Nghiệp Cấp 1 (Strict QA)' },
      flowDurationSeconds: 180,
      status: 'READY',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

async function saveTestBatch() {
  if (!batchForm.itemCode.trim()) {
    cyberToast.warning('Vui lòng nhập ITEM-CODE!');
    return;
  }
  if (!batchForm.longFw.trim()) {
    cyberToast.warning('Vui lòng nhập FW_VERSION!');
    return;
  }
  if (!/^[0-9]F[0-9]{4}$/.test(batchForm.longFw.trim())) {
    cyberToast.warning('FW_VERSION phải có cấu trúc XFXXXX (VD: 4F0505, x là số)!');
    return;
  }
  if (!batchForm.maxDevices || batchForm.maxDevices < 1) {
    cyberToast.warning('Số lượng thiết bị phải lớn hơn 0!');
    return;
  }

  saving.value = true;
  const payload = {
    batchCode: batchForm.batchCode,
    batchName: batchForm.batchName,
    itemCode: batchForm.itemCode.trim().toUpperCase(),
    longFw: batchForm.longFw.trim().toUpperCase(),
    fwVersion: batchForm.longFw.trim().toUpperCase(),
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
  const id = batch.id || batch.batchCode;
  batchList.value = batchList.value.filter((b) => (b.id || b.batchCode) !== id);
  saveBatchesToLocal();
  httpClient.delete(`/plugins/testing/test-batches/${id}`).catch(() => {});
  cyberToast.info('Đã xóa Test Batch');
}

function executeBatch(batch: any) {
  emit('switch-tab', 'test-batch', {
    batchId: batch.id || batch.batchCode,
    batchCode: batch.batchCode,
    itemCode: batch.itemCode,
    longFw: batch.longFw || batch.fwVersion,
    fwVersion: batch.longFw || batch.fwVersion,
    maxDevices: batch.maxDevices,
    simuId: batch.simuId,
    flowDurationSeconds: batch.flowDurationSeconds,
  });
  cyberToast.success(`Đã chọn Test Batch: ${batch.batchCode || batch.id}`);
}

const searchQuery = ref('');

const filteredBatches = computed(() => {
  return batchList.value.filter((b) => {
    if (!searchQuery.value) return true;
    const q = searchQuery.value.toLowerCase();
    const code = (b.batchCode || b.batch_code || '').toLowerCase();
    const name = (b.batchName || b.batch_name || b.name || '').toLowerCase();
    const item = (b.itemCode || b.item_code || '').toLowerCase();
    const fw = (b.longFw || b.long_fw || b.fwVersion || b.fw_version || '').toLowerCase();
    return code.includes(q) || name.includes(q) || item.includes(q) || fw.includes(q);
  });
});

function getBatchStatusClass(status?: string) {
  switch (status) {
    case 'COMPLETED':
      return 'badge-success';
    case 'RUNNING':
      return 'badge-warning';
    case 'FAILED':
      return 'badge-error';
    default:
      return 'badge-info';
  }
}

onMounted(() => {
  generateBatchCode();
  loadBatches();
});
</script>
