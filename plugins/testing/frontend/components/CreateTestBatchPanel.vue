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

          <!-- 4. Phiên Bản Firmware (FW_VERSION: có cấu trúc XXFXXXX với XX có thể là từ 1 đến 32 nói chung x là số) -->
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
                {{ isFwVersionValid ? 'Cấu trúc: XXFXXXX (VD: 4F0505, 32F0505)' : 'Chưa đúng chuẩn XXFXXXX' }}
              </span>
            </label>
            <input
              v-model="batchForm.longFw"
              type="text"
              maxlength="35"
              placeholder=""
              class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100 focus:border-primary"
              :class="{ 'input-error': !isFwVersionValid && batchForm.longFw }"
              @input="onFwVersionInput"
            />
            <div v-if="!isFwVersionValid && batchForm.longFw" class="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" />
              <span>FW_VERSION có cấu trúc XXFXXXX với XX có thể là từ 1 đến 32 nói chung x là số muốn nằm ở mức nào cũng được</span>
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

      <!-- Section 2: SIMULATION FLOW -->
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-base-300">
          <div class="flex items-center gap-2">
            <PlayCircle class="w-4 h-4 text-primary" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
              SIMULATION FLOW
            </h4>
          </div>
          <button
            type="button"
            class="text-xs text-primary hover:underline flex items-center gap-1"
            @click="$emit('switch-tab', 'device-simulation')"
          >
            <span>Tạo Simulation Flow</span>
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
            <option value="">-- Chọn kịch bản Simulation Flow --</option>
            <option v-for="flow in availableFlows" :key="flow.id" :value="flow.id">
              {{ flow.name }} ({{ flow.duration }}s - {{ flow.blocksCount }} blocks)
            </option>
          </select>
        </div>

        <!-- Flow Summary Card -->
        <div v-if="selectedFlowData" class="p-3 bg-base-100/80 border border-base-300 rounded-lg space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold flex-wrap gap-1">
            <span class="text-primary flex items-center gap-1.5 font-bold">
              <PlayCircle class="w-3.5 h-3.5" />
              {{ selectedFlowData.name }}
            </span>
            <div class="flex items-center gap-1.5">
              <span v-if="selectedFlowData.autoCheckCriteria || selectedFlowData.autocheckId" class="badge badge-xs badge-success font-mono font-bold">
                ✓ ĐÃ GỘP AUTOCHECK
              </span>
              <span v-if="selectedFlowData.referenceDevices?.length" class="badge badge-xs badge-warning font-mono">
                {{ selectedFlowData.referenceDevices.length }} REF
              </span>
              <span class="badge badge-xs badge-neutral font-mono">
                {{ selectedFlowData.duration }} giây
              </span>
            </div>
          </div>
          <p v-if="selectedFlowData.description" class="text-[11px] text-base-content/70">
            {{ selectedFlowData.description }}
          </p>
          <div v-if="selectedFlowData.steps?.length" class="flex flex-wrap gap-1 pt-1">
            <span
              v-for="(step, idx) in selectedFlowData.steps"
              :key="idx"
              class="badge badge-xs badge-outline font-mono text-[10px]"
            >
              {{ idx + 1 }}. {{ step }}
            </span>
          </div>
        </div>

        <!-- Tích chọn chung thiết bị simulation / tham chiếu -->
        <div v-if="selectedFlowData" class="p-3 bg-base-100/90 border border-base-300 rounded-lg space-y-2.5">
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3 py-1">
              <input
                v-model="batchForm.shareReferenceDevice"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text text-xs font-semibold text-base-content flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                Tích chọn chung thiết bị simulation cho test batch
                <span class="text-base-content/50 font-normal">(để trống là không chung)</span>
              </span>
            </label>
          </div>

          <!-- Khi tích chọn chung: hiển thị danh sách thiết bị simulation để chọn -->
          <div v-if="batchForm.shareReferenceDevice" class="pl-7 space-y-2">
            <p class="text-[11px] text-base-content/70 leading-relaxed">
              Chung thiết bị tham chiếu có nghĩa khi chạy test batch thì sẽ chỉ downlink hoặc thực hiện chung lấy giá trị từ 1 thiết bị, khi chọn device test batch thì sẽ chọn chung cho 1 lần tất cả thiết bị có trong list test batch.
            </p>
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-semibold text-primary">
                  Chọn thiết bị simulation / tham chiếu dùng chung:
                </span>
              </label>
              <select
                v-model="batchForm.sharedReferenceDevEui"
                class="select select-sm select-bordered w-full font-mono text-xs bg-base-100"
                @change="onSharedDeviceSelect"
              >
                <option value="">-- Chọn thiết bị simulation (List Device Simulation) --</option>
                <option
                  v-for="simDev in simulationDevicesList"
                  :key="simDev.devEui"
                  :value="simDev.devEui"
                >
                  {{ simDev.devEui }} - {{ simDev.name || simDev.serialNumber || 'Thiết bị' }} ({{ simDev.region || 'LoRaWAN' }})
                </option>
              </select>
            </div>
            <div v-if="selectedSharedDev" class="text-xs bg-primary/10 p-2 rounded border border-primary/20 flex items-center gap-2">
              <span class="badge badge-primary badge-xs font-mono font-bold">ĐÃ CHỌN CHUNG</span>
              <span class="font-mono font-bold text-primary">{{ selectedSharedDev.devEui }}</span>
              <span class="text-base-content/80 text-[11px]">({{ selectedSharedDev.name || selectedSharedDev.serialNumber }})</span>
            </div>
          </div>
        </div>
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
  ExternalLink,
  Save,
  RotateCcw,
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

const batchForm = reactive({
  itemCode: '',
  longFw: '',
  batchName: '',
  batchCode: '',
  maxDevices: 10,
  flowDurationSeconds: 0,
  simuId: '',
  shareReferenceDevice: false,
  sharedReferenceDeviceId: '',
  sharedReferenceDevEui: '',
  sharedReferenceDeviceName: '',
});

// Available Simulation Devices (loaded dynamically from LIST DEVICE SIMULATION)
const simulationDevicesList = ref<any[]>([]);

const selectedSharedDev = computed(() => {
  if (!batchForm.sharedReferenceDevEui) return null;
  return simulationDevicesList.value.find((d) => d.devEui === batchForm.sharedReferenceDevEui) || null;
});

function onSharedDeviceSelect() {
  const found = simulationDevicesList.value.find((d) => d.devEui === batchForm.sharedReferenceDevEui);
  if (found) {
    batchForm.sharedReferenceDeviceId = found.id || '';
    batchForm.sharedReferenceDeviceName = found.name || found.serialNumber || '';
  } else {
    batchForm.sharedReferenceDeviceId = '';
    batchForm.sharedReferenceDeviceName = '';
  }
}

async function loadSimulationDevices() {
  try {
    const res: any = await httpClient.get('/plugins/testing/devices/simulation');
    const items = Array.isArray(res?.data)
      ? res.data
      : (res?.data?.items || (Array.isArray(res) ? res : []));
    if (Array.isArray(items)) {
      simulationDevicesList.value = items.map((it: any) => ({
        id: it.id,
        devEui: it.devEui || it.dev_eui || it.networkId || it.serialNumber,
        serialNumber: it.serialNumber || it.serial_number || '',
        name: it.name || it.deviceName,
        itemCode: it.itemCode || it.item_code,
        region: it.region || it.metadata?.region || 'AS923-2',
      })).filter((d: any) => d.devEui);
    }
  } catch (err) {
    simulationDevicesList.value = [];
  }
}

// FW_VERSION format: XXFXXXX with XX from 1 to 32 (or numbers in general, e.g. 4F0505, 32F0505)
const isFwVersionValid = computed(() => {
  if (!batchForm.longFw) return true;
  return /^[0-9]+F[0-9]+$/i.test(batchForm.longFw.trim());
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
  const item = batchForm.itemCode.trim().toUpperCase();
  const fw = batchForm.longFw.trim().toUpperCase();
  if (!item || !fw) {
    batchForm.batchCode = '';
    return;
  }
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

// Available Simulation Flows (loaded dynamically from API)
const availableFlows = ref<any[]>([]);

// Available Auto Check Criteria (loaded dynamically from API)
const availableCriteria = ref<any[]>([]);

const selectedFlowData = computed(() => {
  return availableFlows.value.find((f) => f.id === batchForm.simuId);
});

function onSimulationFlowSelected() {
  const flow = availableFlows.value.find((f) => f.id === batchForm.simuId);
  if (flow) {
    batchForm.flowDurationSeconds = flow.duration || 0;
  }
}

watch(
  () => batchForm.simuId,
  (newId) => {
    const flow = availableFlows.value.find((f) => f.id === newId);
    if (flow) {
      batchForm.flowDurationSeconds = flow.duration || 0;
    }
  },
  { immediate: true }
);

function resetForm() {
  batchForm.itemCode = '';
  batchForm.longFw = '';
  batchForm.batchName = '';
  batchForm.batchCode = '';
  batchForm.maxDevices = 10;
  batchForm.simuId = '';
  batchForm.flowDurationSeconds = 0;
  batchForm.shareReferenceDevice = false;
  batchForm.sharedReferenceDeviceId = '';
  batchForm.sharedReferenceDevEui = '';
  batchForm.sharedReferenceDeviceName = '';
  cyberToast.info('Đã làm mới form tạo Test Batch');
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
  if (!/^[0-9]+F[0-9]+$/i.test(batchForm.longFw.trim())) {
    cyberToast.warning('FW_VERSION có cấu trúc XXFXXXX với XX có thể là từ 1 đến 32 nói chung x là số muốn nằm ở mức nào cũng được!');
    return;
  }
  if (!batchForm.maxDevices || batchForm.maxDevices < 1) {
    cyberToast.warning('Số lượng thiết bị phải lớn hơn 0!');
    return;
  }

  if (!batchForm.batchName.trim()) {
    cyberToast.warning('Vui lòng nhập Tên Đợt Test!');
    return;
  }
  if (!batchForm.simuId) {
    cyberToast.warning('Vui lòng chọn Kịch Bản Mô Phỏng (Simulation Flow)!');
    return;
  }

  if (batchForm.shareReferenceDevice && !batchForm.sharedReferenceDevEui) {
    cyberToast.warning('Bạn đã tích chọn dùng chung thiết bị, vui lòng chọn một thiết bị simulation trong danh sách!');
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
    simulationFlow: selectedFlowData.value?.flowBlocks || selectedFlowData.value || (batchForm.simuId ? { id: batchForm.simuId } : undefined),
    autoCheckCriteria: selectedFlowData.value?.autoCheckCriteria || selectedFlowData.value?.criteria || undefined,
    shareReferenceDevice: batchForm.shareReferenceDevice,
    sharedReferenceDeviceId: batchForm.shareReferenceDevice ? (batchForm.sharedReferenceDeviceId || undefined) : undefined,
    sharedReferenceDevEui: batchForm.shareReferenceDevice ? (batchForm.sharedReferenceDevEui || undefined) : undefined,
    sharedReferenceDeviceName: batchForm.shareReferenceDevice ? (batchForm.sharedReferenceDeviceName || undefined) : undefined,
    status: 'READY',
  };

  try {
    await httpClient.post('/plugins/testing/test-batches', payload);
    cyberToast.success('Tạo Test Batch thành công!');
    resetForm();
    emit('switch-tab', 'list-test-batch');
  } catch (err: any) {
    cyberToast.error('Không thể tạo Test Batch: ' + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
}

function getFlowBlocks(f: any): any[] {
  if (Array.isArray(f.flowBlocks)) return f.flowBlocks;
  if (Array.isArray(f.blocks)) return f.blocks;
  if (Array.isArray(f.timedActions)) return f.timedActions;
  return [];
}

function getFlowDuration(blocks: any[], fallbackDuration?: number): number {
  if (Array.isArray(blocks) && blocks.length > 0) {
    return blocks.reduce((acc: number, b: any) => {
      const type = b.functionType || b.type;
      if (type === 'delay') {
        return acc + (Number(b.delaySeconds || b.duration_seconds || b.duration) || 0);
      }
      return acc;
    }, 0);
  }
  return fallbackDuration || 0;
}

function getBlockStepLabel(b: any): string {
  const type = b.functionType || b.type;
  const target = (b.targetDevice || b.target || 'DUT').toUpperCase();
  switch (type) {
    case 'downlink':
      return `Downlink (${target}, fport ${b.fPort || b.fport || 1})`;
    case 'clear_downlink':
      return `Clear Downlink (${target})`;
    case 'delay':
      return `Delay (${b.delaySeconds || b.duration_seconds || b.duration || 0}s)`;
    default:
      return b.name || b.label || type || 'Step';
  }
}

async function loadFlows() {
  try {
    const res: any = await httpClient.get('/plugins/testing/simulation/profiles');
    const raw = res?.data;
    const items = Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
    if (items.length > 0) {
      availableFlows.value = items.map((f: any) => {
        const blocks = getFlowBlocks(f);
        const duration = getFlowDuration(blocks, f.duration || f.flowDurationSeconds || f.durationSeconds);
        return {
          id: f.simuId || f.id,
          name: f.name || f.profileName || f.simuId || f.id,
          duration,
          blocksCount: blocks.length,
          flowBlocks: blocks,
          description: f.description || `Kịch bản mô phỏng cho ${f.itemCode || 'thiết bị'}`,
          steps: blocks.map((b: any) => getBlockStepLabel(b)),
          autoCheckCriteria: f.autoCheckCriteria || f.criteria || undefined,
        };
      });
    } else {
      availableFlows.value = [];
    }
  } catch (err: any) {
    console.debug('[CreateTestBatchPanel] Error loading simulation flows:', err.message);
    availableFlows.value = [];
  }
}

onMounted(() => {
  loadFlows();
  loadSimulationDevices();
});
</script>
