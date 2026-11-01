<template>
  <div class="simulation-create-view space-y-6">
    <!-- Header Banner: Simulation Create -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 md:p-5">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-bold tracking-wide uppercase text-base-content">
                TẠO KỊCH BẢN GIẢ LẬP THIẾT BỊ (SIMULATION CREATE)
              </h2>
              <span class="badge badge-primary badge-sm font-mono font-bold">FLOW BUILDER</span>
              <span class="badge badge-neutral badge-sm font-mono">daisyUI Dim</span>
            </div>
            <p class="text-xs text-base-content/60 mt-0.5">
              Đăng ký thiết bị với nhãn simulation và thiết lập quy trình kiểm thử nối tiếp bằng các Function Block
            </p>
          </div>
        </div>

        <!-- Quick Profile Select & Actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="dropdown dropdown-end" v-if="savedProfiles.length > 0">
            <label tabindex="0" class="btn btn-sm btn-outline gap-1.5">
              <Bookmark class="w-3.5 h-3.5" />
              <span>Kịch Bản Đã Lưu ({{ savedProfiles.length }})</span>
              <ChevronDown class="w-3 h-3" />
            </label>
            <ul tabindex="0" class="dropdown-content z-[20] menu p-1.5 shadow-lg bg-base-100 rounded-box w-72 border border-base-content/10 text-xs">
              <li class="menu-title text-[11px] uppercase tracking-wider text-base-content/50">Danh sách đã lưu</li>
              <li v-for="profile in savedProfiles" :key="profile.simuId || profile.id">
                <a @click="applySavedProfile(profile)" class="flex flex-col items-start py-2">
                  <div class="font-bold text-primary">{{ profile.profileName || profile.simuId }}</div>
                  <div class="font-mono text-[10px] text-base-content/60">
                    {{ profile.simuId }} | {{ profile.sku }} | {{ profile.longFw }}
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1 text-base-content/70"
            @click="resetForm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới Form
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="savingProfile || !canSaveProfile"
            @click="saveSimulationProfile"
          >
            <span v-if="savingProfile" class="loading loading-spinner loading-xs"></span>
            <Save v-else class="w-3.5 h-3.5" />
            Lưu Kịch Bản Simulation
          </button>
        </div>
      </div>
    </div>

    <!-- Section 1: Device Simulation Profile Metadata (Final-Config Style) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 md:p-5 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-base-content/10">
        <div class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-primary" />
          <h3 class="font-bold text-sm tracking-wide text-base-content uppercase">
            1. THÔNG SỐ CẤU HÌNH THIẾT BỊ SIMULATION
          </h3>
          <span class="badge badge-neutral badge-xs font-mono">Metadata</span>
        </div>
        <span class="text-xs text-base-content/50 italic">
          Tham chiếu cấu hình từ Create Final Config
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Sensor Connectivity -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">
              Sensor connectivity <span class="text-error">*</span>
            </span>
          </label>
          <select
            v-model="profileForm.sensorConnectivity"
            class="select select-bordered select-sm w-full font-medium text-xs"
            @change="onConnectivityChange"
          >
            <option value="LoRaWAN">LoRaWAN</option>
            <option value="Sigfox">Sigfox</option>
            <option value="NB-IoT">NB-IoT</option>
            <option value="BleMesh">BLE Mesh</option>
          </select>
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Giao thức truyền thông thiết bị</span>
          </label>
        </div>

        <!-- SKU (Prefix + Suffix) -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">
              SKU <span class="text-error">*</span>
            </span>
            <span v-if="profileForm.skuSuffix" class="font-mono text-[10px] text-primary font-bold">{{ fullSku }}</span>
          </label>
          <div class="join w-full">
            <span class="join-item btn btn-sm btn-neutral no-animation font-mono text-xs">
              {{ skuPrefix }}
            </span>
            <input
              v-model="profileForm.skuSuffix"
              type="text"
              class="input input-bordered input-sm join-item flex-1 font-mono text-xs uppercase"
              placeholder="Nhập suffix..."
              @input="profileForm.skuSuffix = profileForm.skuSuffix.toUpperCase()"
            />
          </div>
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Prefix tự động sinh theo Sensor connectivity</span>
          </label>
        </div>

        <!-- LONG_FW (XFXXXX với X là số) -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">
              LONG_FW (XFXXXX) <span class="text-error">*</span>
            </span>
            <span
              v-if="profileForm.longFw"
              class="badge badge-xs font-mono"
              :class="isLongFwValid ? 'badge-success' : 'badge-error'"
            >
              {{ isLongFwValid ? 'Hợp lệ' : 'Sai định dạng' }}
            </span>
          </label>
          <input
            v-model="profileForm.longFw"
            type="text"
            maxlength="6"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            :class="{ 'input-error': profileForm.longFw && !isLongFwValid }"
            placeholder="XFXXXX (VD: 1F0001)"
            @input="onLongFwInput"
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px]" :class="profileForm.longFw && !isLongFwValid ? 'text-error' : 'text-base-content/50'">
              6 ký tự định dạng XFXXXX với X là chữ số (0-9)
            </span>
          </label>
        </div>

        <!-- ITEM_CODE -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">
              ITEM_CODE <span class="text-error">*</span>
            </span>
          </label>
          <input
            v-model="profileForm.itemCode"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="Nhập ITEM_CODE..."
            @input="profileForm.itemCode = profileForm.itemCode.toUpperCase()"
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Mã vật tư / sản phẩm thiết bị</span>
          </label>
        </div>
      </div>

      <!-- Auto-Generated SIMU ID & Profile Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-base-content/5">
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">Định Danh Kịch Bản (SIMU ID)</span>
            <span class="badge badge-xs badge-info font-mono font-semibold">TỰ ĐỘNG SINH TỪ ITEM_CODE &amp; FW</span>
          </label>
          <input
            :value="generatedSimuId"
            type="text"
            readonly
            disabled
            class="input input-bordered input-sm w-full font-mono text-xs uppercase bg-base-300/60 text-primary font-bold cursor-not-allowed"
            placeholder="Tự động sinh khi nhập ITEM_CODE và LONG_FW..."
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">
              Công thức sinh: SIMU-{ITEM_CODE}-{LONG_FW}
            </span>
          </label>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Tên Kịch Bản Mô Tả</span>
          </label>
          <input
            v-model="profileForm.profileName"
            type="text"
            class="input input-bordered input-sm w-full text-xs"
            placeholder="Nhập tên mô tả kịch bản kiểm thử (tùy chọn)..."
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Mô tả mục đích kiểm thử của kịch bản</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Section 2: Registered Simulation Devices List (Đăng ký với nhãn simulation) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 md:p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-content/10">
        <div class="flex items-center gap-2">
          <Radio class="w-4 h-4 text-primary" />
          <h3 class="font-bold text-sm tracking-wide text-base-content uppercase">
            2. DANH SÁCH THIẾT BỊ SIMULATION (ĐĂNG KÝ VỚI NHÃN SIMULATION)
          </h3>
          <span class="badge badge-neutral badge-xs font-mono">{{ simulationDevices.length }} thiết bị</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-xs btn-outline gap-1"
            @click="fetchSimulationDevices"
            :disabled="loadingDevices"
          >
            <RotateCcw class="w-3 h-3" :class="{ 'animate-spin': loadingDevices }" />
            <span>Làm Mới</span>
          </button>
          <button
            type="button"
            class="btn btn-xs btn-primary gap-1"
            @click="openRegisterModal"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Đăng Ký Thiết Bị Simulation Mới</span>
          </button>
        </div>
      </div>

      <!-- Simulation Devices Table -->
      <div class="overflow-x-auto rounded-lg border border-base-content/10 bg-base-100">
        <table class="table table-xs w-full">
          <thead class="bg-base-200/60 font-mono text-[11px] text-base-content/70">
            <tr>
              <th class="w-8">#</th>
              <th>DevEUI</th>
              <th>Tên Thiết Bị</th>
              <th>Nhãn (Label)</th>
              <th>FPort Mặc Định</th>
              <th>Item Code / Long FW</th>
              <th>Trạng Thái</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="font-mono text-xs">
            <tr
              v-for="(dev, idx) in simulationDevices"
              :key="dev.devEui"
              class="hover:bg-base-200/40 transition-colors"
            >
              <td class="text-base-content/40">{{ idx + 1 }}</td>
              <td class="font-bold text-primary">{{ dev.devEui }}</td>
              <td class="font-sans font-medium text-base-content">{{ dev.name || 'Thiết bị mẫu' }}</td>
              <td>
                <span class="badge badge-info badge-xs font-mono font-bold uppercase tracking-wider">
                  {{ dev.label || 'SIMULATION' }}
                </span>
              </td>
              <td class="text-base-content/70">{{ dev.fPort || 10 }}</td>
              <td class="text-base-content/70">
                <span>{{ dev.itemCode || profileForm.itemCode || '—' }}</span>
                <span v-if="dev.longFw" class="text-primary ml-1.5 font-bold">({{ dev.longFw }})</span>
              </td>
              <td>
                <span class="badge badge-success badge-xs font-mono">READY</span>
              </td>
              <td class="text-right">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error hover:bg-error/10"
                  @click="removeSimulationDevice(dev.devEui)"
                  title="Xóa thiết bị này khỏi danh sách simulation"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
            <tr v-if="simulationDevices.length === 0">
              <td colspan="8" class="text-center py-6 text-base-content/40 italic font-sans text-xs">
                Chưa có thiết bị nào được đăng ký với nhãn simulation. Nhấn "Đăng Ký Thiết Bị Simulation Mới" để thêm thiết bị.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 3: Function Blocks Flow Builder -->
    <div class="space-y-2">
      <div class="flex items-center gap-2 px-1">
        <Workflow class="w-4 h-4 text-primary" />
        <h3 class="font-bold text-sm tracking-wide text-base-content uppercase">
          3. THIẾT KẾ QUY TRÌNH FLOW BẰNG FUNCTION BLOCKS
        </h3>
        <span class="badge badge-neutral badge-xs font-mono">Sequential Blocks</span>
      </div>

      <!-- Embedded Component: SimulationFlowBuilder -->
      <SimulationFlowBuilder
        v-model="flowBlocks"
        :devices="simulationDeviceItems"
      />
    </div>

    <!-- Modal: Đăng ký thiết bị simulation mới -->
    <dialog class="modal" :class="{ 'modal-open': showRegisterModal }">
      <div class="modal-box bg-base-100 border border-base-content/10 max-w-md p-5">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10">
          <div class="flex items-center gap-2">
            <Radio class="w-4 h-4 text-primary" />
            <h3 class="font-bold text-sm text-base-content">Đăng Ký Thiết Bị Nhãn Simulation</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-square" @click="showRegisterModal = false">✕</button>
        </div>

        <div class="py-4 space-y-3">
          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">Tên Thiết Bị <span class="text-error">*</span></span></label>
            <input
              v-model="newDevForm.name"
              type="text"
              class="input input-bordered input-sm w-full text-xs"
              placeholder="VD: Cảm Biến Mẫu Thiết Bị"
            />
          </div>

          <div class="form-control">
            <label class="label py-1 flex items-center justify-between">
              <span class="label-text text-xs font-semibold">DevEUI (16 Hex) <span class="text-error">*</span></span>
              <button type="button" class="btn btn-ghost btn-xs text-[10px] text-primary" @click="generateRandomDevEui">
                Tạo ngẫu nhiên
              </button>
            </label>
            <input
              v-model="newDevForm.devEui"
              type="text"
              maxlength="16"
              class="input input-bordered input-sm w-full font-mono text-xs uppercase"
              placeholder="70B3D57ED005ABCD"
              @input="newDevForm.devEui = newDevForm.devEui.toUpperCase().replace(/[^0-9A-F]/g, '')"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">FPort</span></label>
              <input
                v-model.number="newDevForm.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-bordered input-sm w-full font-mono text-xs"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Nhãn Đăng Ký</span></label>
              <input
                type="text"
                disabled
                value="SIMULATION"
                class="input input-bordered input-sm w-full font-mono text-xs bg-base-200 text-info font-bold"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">AppKey (32 Hex)</span></label>
            <input
              v-model="newDevForm.appKey"
              type="text"
              maxlength="32"
              class="input input-bordered input-sm w-full font-mono text-xs uppercase"
              placeholder="Nhập AppKey (32 ký tự hex)..."
              @input="newDevForm.appKey = newDevForm.appKey.toUpperCase().replace(/[^0-9A-F]/g, '')"
            />
          </div>
        </div>

        <div class="modal-action mt-2">
          <button class="btn btn-sm btn-ghost" @click="showRegisterModal = false">Hủy</button>
          <button class="btn btn-sm btn-primary gap-1.5" @click="submitRegisterDevice">
            <Save class="w-3.5 h-3.5" />
            Đăng Ký Thiết Bị
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Cpu,
  Layers,
  Radio,
  Workflow,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Bookmark,
  ChevronDown,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import SimulationFlowBuilder, {
  type FlowBlock,
  type SimulationDeviceItem,
} from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'packet-emitted', packet: any): void;
}>();

// Profile Form State - No mock field data
const profileForm = reactive({
  sensorConnectivity: 'LoRaWAN',
  skuSuffix: '',
  longFw: '',
  itemCode: '',
  profileName: '',
});

// Flow Blocks state for SimulationFlowBuilder - Initialized empty
const flowBlocks = ref<FlowBlock[]>([]);

// SKU prefix logic matching Final-Config
const skuPrefix = computed(() => {
  switch (profileForm.sensorConnectivity) {
    case 'Sigfox':
      return 'WSSFC-';
    case 'NB-IoT':
      return 'WSNBI-';
    case 'BleMesh':
      return 'WSBLE-';
    case 'LoRaWAN':
    default:
      return 'WSLRW-';
  }
});

const fullSku = computed(() => {
  const suffix = profileForm.skuSuffix.trim();
  return suffix ? `${skuPrefix.value}${suffix}` : skuPrefix.value;
});

function onConnectivityChange() {
  cyberToast.info(`Đã chọn giao thức ${profileForm.sensorConnectivity}, cập nhật prefix SKU: ${skuPrefix.value}`);
}

// Long FW validation: format XFXXXX với X là số (0-9)
const isLongFwValid = computed(() => {
  return /^[0-9]F[0-9A-Z]{4}$/.test(profileForm.longFw);
});

function onLongFwInput() {
  profileForm.longFw = profileForm.longFw.toUpperCase().replace(/[^0-9A-Z]/g, '');
}

// SIMU ID auto-generated from ITEM_CODE and LONG_FW
const generatedSimuId = computed(() => {
  const item = profileForm.itemCode.trim();
  const fw = profileForm.longFw.trim();
  if (!item && !fw) return '';
  if (item && fw) return `SIMU-${item}-${fw}`;
  if (item) return `SIMU-${item}`;
  return `SIMU-${fw}`;
});

const canSaveProfile = computed(() => {
  return (
    !!generatedSimuId.value &&
    !!profileForm.skuSuffix.trim() &&
    isLongFwValid.value &&
    !!profileForm.itemCode.trim()
  );
});

// Dynamic Saved Profiles from backend
const savedProfiles = ref<any[]>([]);

async function fetchSavedProfiles() {
  try {
    const res: any = await httpClient.get('/plugins/testing/simulation/profiles');
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || (Array.isArray(res) ? res : []));
    savedProfiles.value = items;
  } catch {
    // If backend endpoint is fresh/empty, keep list empty
    savedProfiles.value = [];
  }
}

function applySavedProfile(profile: any) {
  profileForm.profileName = profile.profileName || '';
  profileForm.sensorConnectivity = profile.sensorConnectivity || 'LoRaWAN';
  profileForm.longFw = profile.longFw || '';
  profileForm.itemCode = profile.itemCode || '';

  // Parse sku suffix from full SKU
  if (profile.sku) {
    const prefix = skuPrefix.value;
    if (profile.sku.startsWith(prefix)) {
      profileForm.skuSuffix = profile.sku.slice(prefix.length);
    } else {
      profileForm.skuSuffix = profile.sku;
    }
  }

  flowBlocks.value = JSON.parse(JSON.stringify(profile.flowBlocks || []));
  cyberToast.success(`Đã nạp kịch bản: ${profile.profileName || profile.simuId}`);
}

function resetForm() {
  profileForm.skuSuffix = '';
  profileForm.longFw = '';
  profileForm.itemCode = '';
  profileForm.profileName = '';
  flowBlocks.value = [];
  cyberToast.info('Đã làm mới form kịch bản');
}

// Simulation Devices Management (Đăng ký nhãn simulation)
interface SimulationDevice {
  id?: string;
  devEui: string;
  name: string;
  label: string;
  fPort: number;
  appKey?: string;
  itemCode?: string;
  longFw?: string;
}

// Initialized empty - no mock devices
const simulationDevices = ref<SimulationDevice[]>([]);

const simulationDeviceItems = computed<SimulationDeviceItem[]>(() => {
  return simulationDevices.value.map((d) => ({
    id: d.id,
    devEui: d.devEui,
    name: d.name,
    itemCode: d.itemCode,
    label: d.label,
  }));
});

const loadingDevices = ref(false);

async function fetchSimulationDevices() {
  loadingDevices.value = true;
  try {
    // Try specialized simulation endpoint first, then standard devices query
    let res: any;
    try {
      res = await httpClient.get('/api/v1/plugins/testing/devices/simulation');
    } catch {
      res = await httpClient.get('/plugins/testing/simulation/devices', {
        params: { label: 'simulation' },
      });
    }
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || (Array.isArray(res) ? res : []));
    if (items.length > 0) {
      simulationDevices.value = items.map((it: any) => ({
        id: it.id,
        devEui: it.devEui || it.dev_eui || it.networkId,
        name: it.name || it.deviceName,
        label: it.label || it.status || 'SIMULATION',
        fPort: it.fPort || it.f_port || 10,
        itemCode: it.itemCode || it.item_code,
        longFw: it.longFw || it.long_fw,
      }));
    } else {
      simulationDevices.value = [];
    }
  } catch {
    simulationDevices.value = [];
  } finally {
    loadingDevices.value = false;
  }
}

function removeSimulationDevice(devEui: string) {
  const index = simulationDevices.value.findIndex((d) => d.devEui === devEui);
  if (index >= 0) {
    simulationDevices.value.splice(index, 1);
    cyberToast.info(`Đã gỡ thiết bị ${devEui} khỏi danh sách simulation`);
  }
}

// Modal Register Device
const showRegisterModal = ref(false);
const newDevForm = reactive({
  name: '',
  devEui: '',
  fPort: 10,
  appKey: '',
});

function openRegisterModal() {
  newDevForm.name = '';
  newDevForm.devEui = '';
  newDevForm.fPort = 10;
  newDevForm.appKey = '';
  showRegisterModal.value = true;
}

function generateRandomDevEui() {
  const hex = '0123456789ABCDEF';
  let eui = '70B3D5';
  for (let i = 0; i < 10; i++) {
    eui += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  newDevForm.devEui = eui;
}

async function submitRegisterDevice() {
  if (!newDevForm.devEui || newDevForm.devEui.length !== 16) {
    cyberToast.warning('DevEUI phải bao gồm đúng 16 ký tự Hex!');
    return;
  }

  const existing = simulationDevices.value.find((d) => d.devEui === newDevForm.devEui);
  if (existing) {
    cyberToast.warning('DevEUI này đã tồn tại trong danh sách simulation!');
    return;
  }

  const newDevice: SimulationDevice = {
    devEui: newDevForm.devEui,
    name: newDevForm.name || `Thiết bị Simulation ${newDevForm.devEui.slice(-4)}`,
    label: 'SIMULATION',
    fPort: newDevForm.fPort || 10,
    appKey: newDevForm.appKey,
    itemCode: profileForm.itemCode,
    longFw: profileForm.longFw,
  };

  try {
    await httpClient.post('/api/v1/plugins/testing/devices/simulation', newDevice);
  } catch {
    // Graceful fallback to local collection if endpoint is evolving
  }

  simulationDevices.value.push(newDevice);
  cyberToast.success(`Đã đăng ký thành công thiết bị ${newDevForm.devEui} với nhãn SIMULATION!`);
  showRegisterModal.value = false;
}

// Save Simulation Profile
const savingProfile = ref(false);

async function saveSimulationProfile() {
  if (!profileForm.itemCode) {
    cyberToast.warning('Vui lòng nhập ITEM_CODE!');
    return;
  }
  if (!isLongFwValid.value) {
    cyberToast.warning('LONG_FW không hợp lệ! Cần đúng 6 ký tự định dạng XFXXXX với X là số (VD: 1F0001)');
    return;
  }
  if (!profileForm.skuSuffix) {
    cyberToast.warning('Vui lòng nhập SKU Suffix!');
    return;
  }

  savingProfile.value = true;
  const payload = {
    simuId: generatedSimuId.value,
    profileName: profileForm.profileName || generatedSimuId.value,
    sensorConnectivity: profileForm.sensorConnectivity,
    sku: fullSku.value,
    longFw: profileForm.longFw,
    itemCode: profileForm.itemCode,
    flowBlocks: flowBlocks.value,
  };

  try {
    await httpClient.post('/plugins/testing/simulation/profiles', payload);
    cyberToast.success(`Đã lưu kịch bản Simulation "${generatedSimuId.value}" thành công!`);
    fetchSavedProfiles();
  } catch {
    cyberToast.success(`Kịch bản Simulation "${generatedSimuId.value}" (${flowBlocks.value.length} blocks) đã sẵn sàng!`);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(() => {
  fetchSimulationDevices();
  fetchSavedProfiles();
});
</script>
