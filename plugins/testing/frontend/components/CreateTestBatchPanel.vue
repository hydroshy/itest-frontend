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
              <span class="label-text-alt text-[10px] text-base-content/60">Chọn có sẵn hoặc tự nhập</span>
            </label>
            <div class="relative">
              <input
                v-model="batchForm.itemCode"
                type="text"
                placeholder="Chọn hoặc nhập ITEM-CODE..."
                class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100 focus:border-primary"
                @focus="showItemCodeDropdown = true"
                @click="showItemCodeDropdown = true"
                @blur="closeItemCodeDropdown"
                @input="onItemCodeInput"
              />
              <div
                v-if="showItemCodeDropdown && filteredItemCodes.length > 0"
                class="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto z-50 bg-base-100 rounded-lg shadow-xl border border-base-300 p-1 font-mono text-xs"
              >
                <div
                  v-for="code in filteredItemCodes"
                  :key="code"
                  class="px-2.5 py-1.5 rounded hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors flex items-center justify-between"
                  @mousedown.prevent="selectItemCode(code)"
                >
                  <span class="font-bold">{{ code }}</span>
                  <span class="text-[10px] text-base-content/50">ITEM_CODE</span>
                </div>
              </div>
            </div>
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
            <div class="relative">
              <input
                v-model="batchForm.longFw"
                type="text"
                maxlength="35"
                placeholder="Chọn hoặc nhập FW_VERSION..."
                class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-100 focus:border-primary"
                :class="{ 'input-error': !isFwVersionValid && batchForm.longFw }"
                @focus="showFwDropdown = true"
                @click="showFwDropdown = true"
                @blur="closeFwDropdown"
                @input="onFwVersionInput"
              />
              <div
                v-if="showFwDropdown && filteredFwList.length > 0"
                class="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto z-50 bg-base-100 rounded-lg shadow-xl border border-base-300 p-1 font-mono text-xs"
              >
                <div
                  v-for="fw in filteredFwList"
                  :key="fw"
                  class="px-2.5 py-1.5 rounded hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors flex items-center justify-between"
                  @mousedown.prevent="selectFw(fw)"
                >
                  <span class="font-bold">{{ fw }}</span>
                  <span class="text-[10px] text-base-content/50">FW_VERSION</span>
                </div>
              </div>
            </div>
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

        <!-- Cấu Hình Thiết Bị Simulation / Tham Chiếu (Chỉ hiển thị khi flow có thiết bị tham chiếu) -->
        <div
          v-if="selectedFlowData && flowReferenceDevices.length > 0"
          class="p-4 bg-base-100/90 border border-base-300 rounded-xl space-y-3"
        >
          <div class="flex items-center justify-between border-b border-base-content/10 pb-2 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="badge badge-sm badge-warning font-mono font-bold">REF / SIMU</span>
              <span class="text-xs font-bold text-base-content uppercase tracking-wide flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                Cấu Hình Thiết Bị Simulation / Tham Chiếu
              </span>
              <span class="badge badge-xs badge-info font-mono">
                {{ flowReferenceDevices.length }} thiết bị
              </span>
            </div>

            <!-- Ô tick box về Chung cho toàn batch, để trống là không -->
            <label class="label cursor-pointer gap-2 py-0">
              <input
                v-model="batchForm.shareReferenceDevice"
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
              />
              <span class="text-xs font-semibold text-base-content/90">
                Chung cho toàn batch
              </span>
            </label>
          </div>

          <p class="text-[11px] text-base-content/70">
            Kịch bản yêu cầu thiết bị tham chiếu có sẵn trong Flow Simulation. Gán DevEUI tương ứng cho từng thiết bị:
          </p>

          <div class="space-y-2.5">
            <!-- Hiển thị chi tiết từng thiết bị tham chiếu có sẵn trong flow simulation -->
            <div
              v-for="(refDev, idx) in flowReferenceDevices"
              :key="idx"
              class="p-3 bg-base-200/60 border border-base-300 rounded-lg space-y-2"
            >
              <div class="flex items-center justify-between flex-wrap gap-1">
                <span class="text-xs font-bold text-warning flex items-center gap-1.5 font-mono">
                  ⭐ {{ refDev.reference_name || refDev.name || `REF_${idx + 1}` }}
                </span>
                <div class="flex items-center gap-2 text-[11px] font-mono text-base-content/60">
                  <span v-if="refDev.item_code">ITEM: <b class="text-base-content/80">{{ refDev.item_code }}</b></span>
                  <span v-if="refDev.fw_version">FW: <b class="text-base-content/80">{{ refDev.fw_version }}</b></span>
                </div>
              </div>

              <div class="form-control">
                <select
                  v-model="batchForm.assignedRefDevices[refDev.reference_name || refDev.name || `REF_${idx + 1}`]"
                  class="select select-sm select-bordered w-full font-mono text-xs bg-base-100"
                >
                  <option value="">-- Chọn DevEUI thiết bị tham chiếu --</option>
                  <option
                    v-for="simDev in simulationDevicesList"
                    :key="simDev.devEui"
                    :value="simDev.devEui"
                  >
                    {{ simDev.devEui }} - {{ simDev.name || simDev.serialNumber || 'Thiết bị' }}
                  </option>
                </select>
              </div>
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
import { useItemFwCatalog } from '../composables/useItemFwCatalog';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

const saving = ref(false);

const { itemCodes, getFwListForItem, loadCatalog } = useItemFwCatalog();

const showItemCodeDropdown = ref(false);
const showFwDropdown = ref(false);

const filteredItemCodes = computed(() => {
  const q = (batchForm.itemCode || '').trim().toUpperCase();
  if (!q) return itemCodes.value;
  return itemCodes.value.filter((c) => c.includes(q));
});

const filteredFwList = computed(() => {
  const list = getFwListForItem(batchForm.itemCode);
  const q = (batchForm.longFw || '').trim().toUpperCase();
  if (!q) return list;
  return list.filter((f) => f.includes(q));
});

function selectItemCode(code: string) {
  batchForm.itemCode = code.toUpperCase();
  showItemCodeDropdown.value = false;
  const fws = getFwListForItem(code);
  if (fws.length > 0 && (!batchForm.longFw || !fws.includes(batchForm.longFw))) {
    batchForm.longFw = fws[0];
  }
  generateBatchCode();
}

function selectFw(fw: string) {
  batchForm.longFw = fw.toUpperCase();
  showFwDropdown.value = false;
  generateBatchCode();
}

function closeItemCodeDropdown() {
  setTimeout(() => {
    showItemCodeDropdown.value = false;
  }, 200);
}

function closeFwDropdown() {
  setTimeout(() => {
    showFwDropdown.value = false;
  }, 200);
}

const batchForm = reactive({
  itemCode: '',
  longFw: '',
  batchName: '',
  batchCode: '',
  maxDevices: 10,
  flowDurationSeconds: 0,
  simuId: '',
  shareReferenceDevice: false, // Ô tick box về Chung cho toàn batch, để trống là không
  assignedRefDevices: {} as Record<string, string>,
  selectedSimulationDevices: [] as any[], // Danh sách thiết bị simulation đã chọn
});

const simulationDevicesList = ref<any[]>([]);

function addSimulationDevice(event: Event) {
  const target = event.target as HTMLSelectElement;
  const devEui = target.value;
  if (!devEui) return;
  const dev = simulationDevicesList.value.find((d) => d.devEui === devEui);
  if (dev && !batchForm.selectedSimulationDevices.some((s) => s.devEui === devEui)) {
    batchForm.selectedSimulationDevices.push(dev);
  }
  target.value = ''; // Reset select
}

function removeSimulationDevice(devEui: string) {
  batchForm.selectedSimulationDevices = batchForm.selectedSimulationDevices.filter(
    (d) => d.devEui !== devEui
  );
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

// Danh sách thiết bị tham chiếu có sẵn trong flow simulation
const flowReferenceDevices = computed<any[]>(() => {
  const f = selectedFlowData.value;
  if (!f) return [];
  let list: any[] = [];
  if (Array.isArray(f.referenceDevices) && f.referenceDevices.length > 0) {
    list = f.referenceDevices;
  } else if (typeof f.referenceDevices === 'string') {
    try { list = JSON.parse(f.referenceDevices); } catch {}
  } else if (Array.isArray(f.reference_devices) && f.reference_devices.length > 0) {
    list = f.reference_devices;
  } else if (typeof f.reference_devices === 'string') {
    try { list = JSON.parse(f.reference_devices); } catch {}
  } else if (Array.isArray(f.autoCheckCriteria?.reference_devices) && f.autoCheckCriteria.reference_devices.length > 0) {
    list = f.autoCheckCriteria.reference_devices;
  }
  // Check if flowBlocks has targetDevice === 'REF' or other named ref devices
  if (list.length === 0 && Array.isArray(f.flowBlocks)) {
    const refBlocks = f.flowBlocks.filter((b: any) => {
      const target = (b.targetDevice || b.target || '').toUpperCase();
      return target === 'REF' || target === 'SIMU';
    });
    if (refBlocks.length > 0) {
      list = [{ reference_name: 'REF', name: 'REF' }];
    }
  }
  return list;
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
  batchForm.assignedRefDevices = {};
  batchForm.selectedSimulationDevices = [];
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

  // Thu thập danh sách thiết bị tham chiếu và simulation devices được gán
  const refDevicesPayload: any[] = [];
  const simDevicesPayload: any[] = [];
  let sharedDevEui = '';

  for (const refDev of flowReferenceDevices.value) {
    const key = refDev.reference_name || refDev.name || 'REF';
    const devEui = batchForm.assignedRefDevices[key];
    if (devEui) {
      const foundDev = simulationDevicesList.value.find((d) => d.devEui === devEui);
      const entry = {
        id: foundDev?.id || devEui,
        devEui,
        serialNumber: foundDev?.serialNumber || devEui,
        name: foundDev?.name || key,
        reference_name: key,
        itemCode: foundDev?.itemCode || refDev.item_code,
        fwVersion: refDev.fw_version,
      };
      refDevicesPayload.push(entry);
      simDevicesPayload.push(entry);
      if (!sharedDevEui) {
        sharedDevEui = devEui;
      }
    }
  }

  batchForm.selectedSimulationDevices.forEach((d) => {
    if (!simDevicesPayload.some((s) => s.devEui === d.devEui)) {
      simDevicesPayload.push(d);
    }
  });

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
    referenceDevices: refDevicesPayload,
    simulationDevices: simDevicesPayload,
    shareReferenceDevice: batchForm.shareReferenceDevice,
    sharedReferenceDevEui: batchForm.shareReferenceDevice ? sharedDevEui : undefined,
    requiresReferenceDevice: flowReferenceDevices.value.length > 0,
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
        let refDevs: any[] = [];
        if (Array.isArray(f.referenceDevices)) {
          refDevs = f.referenceDevices;
        } else if (typeof f.referenceDevices === 'string') {
          try { refDevs = JSON.parse(f.referenceDevices); } catch {}
        } else if (Array.isArray(f.reference_devices)) {
          refDevs = f.reference_devices;
        } else if (typeof f.reference_devices === 'string') {
          try { refDevs = JSON.parse(f.reference_devices); } catch {}
        } else if (Array.isArray(f.autoCheckCriteria?.reference_devices)) {
          refDevs = f.autoCheckCriteria.reference_devices;
        }
        return {
          id: f.simuId || f.id,
          name: f.name || f.profileName || f.simuId || f.id,
          duration,
          blocksCount: blocks.length,
          flowBlocks: blocks,
          referenceDevices: refDevs,
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
  loadCatalog();
});
</script>
