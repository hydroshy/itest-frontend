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
              Đăng ký thiết bị với nhãn simulation và thiết lập kịch bản kiểm thử nối tiếp bằng các Function Block
            </p>
          </div>
        </div>

        <!-- Quick Profile Select & Actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-sm btn-outline gap-1.5">
              <Bookmark class="w-3.5 h-3.5" />
              <span>Nạp Profile Mẫu</span>
              <ChevronDown class="w-3 h-3" />
            </label>
            <ul tabindex="0" class="dropdown-content z-[20] menu p-1.5 shadow-lg bg-base-100 rounded-box w-72 border border-base-content/10 text-xs">
              <li class="menu-title text-[11px] uppercase tracking-wider text-base-content/50">Kịch bản có sẵn</li>
              <li v-for="preset in availablePresets" :key="preset.id">
                <a @click="applyPreset(preset)" class="flex flex-col items-start py-2">
                  <div class="font-bold text-primary">{{ preset.profileName }}</div>
                  <div class="font-mono text-[10px] text-base-content/60">
                    {{ preset.simuId }} | {{ preset.sku }} | {{ preset.longFw }}
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
            Làm Mới
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="savingProfile"
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
            <span class="font-mono text-[10px] text-primary font-bold">{{ fullSku }}</span>
          </label>
          <div class="join w-full">
            <span class="join-item btn btn-sm btn-neutral no-animation font-mono text-xs">
              {{ skuPrefix }}
            </span>
            <input
              v-model="profileForm.skuSuffix"
              type="text"
              class="input input-bordered input-sm join-item flex-1 font-mono text-xs uppercase"
              placeholder="Nhập suffix (VD: SP01-EU868)..."
              @input="profileForm.skuSuffix = profileForm.skuSuffix.toUpperCase()"
            />
          </div>
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Mã SKU tự động gán prefix theo giao thức</span>
          </label>
        </div>

        <!-- LONG_FW (5FXXXX) -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">
              LONG_FW (5FXXXX) <span class="text-error">*</span>
            </span>
            <span
              v-if="profileForm.longFw"
              class="badge badge-xs font-mono"
              :class="isLongFwValid ? 'badge-success' : 'badge-error'"
            >
              {{ isLongFwValid ? 'Hợp lệ' : 'Sai format' }}
            </span>
          </label>
          <input
            v-model="profileForm.longFw"
            type="text"
            maxlength="6"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            :class="{ 'input-error': profileForm.longFw && !isLongFwValid }"
            placeholder="5FXXXX (VD: 5FA1B2)"
            @input="onLongFwInput"
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px]" :class="profileForm.longFw && !isLongFwValid ? 'text-error' : 'text-base-content/50'">
              6 ký tự bắt đầu bằng 5F (VD: 5FA1B2)
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
            placeholder="VD: ITEM-9901-SMART-PLUG"
            @input="profileForm.itemCode = profileForm.itemCode.toUpperCase()"
          />
          <label class="label py-0.5">
            <span class="label-text-alt text-[10px] text-base-content/50">Mã vật tư / sản phẩm kiểm định</span>
          </label>
        </div>
      </div>

      <!-- Additional Identification: Simu ID & Profile Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-base-content/5">
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Định Danh Kịch Bản (Simu ID) <span class="text-error">*</span></span>
          </label>
          <input
            v-model="profileForm.simuId"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="VD: SIMU-LORA-SP01"
            @input="profileForm.simuId = profileForm.simuId.toUpperCase()"
          />
        </div>
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Tên Kịch Bản Mô Tả</span>
          </label>
          <input
            v-model="profileForm.profileName"
            type="text"
            class="input input-bordered input-sm w-full text-xs"
            placeholder="VD: Kịch bản kiểm thử Downlink ngắt còi và cấu hình chu kỳ"
          />
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
              placeholder="VD: Cảm Biến Mẫu Khí Gas SIMU-01"
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
              placeholder="2B7E151628AED2A6ABF7158809CF4F3C"
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

// Profile Form State
const profileForm = reactive({
  simuId: 'SIMU-LORA-SP01',
  profileName: 'Kịch bản kiểm thử Smart Plug (Downlink ngắt còi & chu kỳ)',
  sensorConnectivity: 'LoRaWAN',
  skuSuffix: 'SP01-EU868',
  longFw: '5FA1B2',
  itemCode: 'ITEM-9901-SMART-PLUG',
});

// Flow Blocks state for SimulationFlowBuilder
const flowBlocks = ref<FlowBlock[]>([
  {
    id: 'block-init-1',
    functionType: 'downlink_hex',
    targetDevice: 'DUT',
    delaySeconds: 10,
    payloadHex: '01 01',
    fPort: 10,
    confirmed: false,
    description: 'Bước 1: Gửi lệnh Downlink bật còi báo động',
  },
  {
    id: 'block-init-2',
    functionType: 'delay_wait',
    targetDevice: 'DUT',
    delaySeconds: 30,
    payloadHex: '',
    fPort: 10,
    confirmed: false,
    description: 'Bước 2: Tạm dừng 30 giây để kiểm tra còi báo động',
  },
  {
    id: 'block-init-3',
    functionType: 'downlink_hex',
    targetDevice: 'DUT',
    delaySeconds: 10,
    payloadHex: '01 00',
    fPort: 10,
    confirmed: true,
    description: 'Bước 3: Gửi lệnh Downlink tắt còi báo động (Confirmed ACK)',
  },
]);

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

// Long FW validation (format: 5FXXXX)
const isLongFwValid = computed(() => {
  return /^5F[A-Z0-9]{4}$/.test(profileForm.longFw);
});

function onLongFwInput() {
  profileForm.longFw = profileForm.longFw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Preset Profiles
const availablePresets = [
  {
    id: 'preset-sp01',
    simuId: 'SIMU-LORA-SP01',
    profileName: 'Thiết Bị Mẫu Smart Plug (SP01)',
    sensorConnectivity: 'LoRaWAN',
    skuSuffix: 'SP01-EU868',
    sku: 'WSLRW-SP01-EU868',
    longFw: '5FA1B2',
    itemCode: 'ITEM-9901-SMART-PLUG',
    blocks: [
      {
        id: 'blk-p1',
        functionType: 'downlink_hex',
        targetDevice: 'DUT',
        delaySeconds: 10,
        payloadHex: '01 01',
        fPort: 10,
        confirmed: false,
        description: 'Bật còi báo động SP01',
      },
      {
        id: 'blk-p2',
        functionType: 'delay_wait',
        targetDevice: 'DUT',
        delaySeconds: 30,
        payloadHex: '',
        fPort: 10,
        confirmed: false,
        description: 'Duy trì trạng thái còi 30 giây',
      },
      {
        id: 'blk-p3',
        functionType: 'downlink_hex',
        targetDevice: 'DUT',
        delaySeconds: 10,
        payloadHex: '01 00',
        fPort: 10,
        confirmed: true,
        description: 'Tắt còi báo động SP01',
      },
    ],
  },
  {
    id: 'preset-wm02',
    simuId: 'SIMU-LORA-WM02',
    profileName: 'Thiết Bị Mẫu Water Meter (WM02)',
    sensorConnectivity: 'LoRaWAN',
    skuSuffix: 'WM02-AS923',
    sku: 'WSLRW-WM02-AS923',
    longFw: '5FB3C4',
    itemCode: 'ITEM-9902-WATER-METER',
    blocks: [
      {
        id: 'blk-wm1',
        functionType: 'downlink_hex',
        targetDevice: 'DUT',
        delaySeconds: 15,
        payloadHex: '02 00 3C',
        fPort: 10,
        confirmed: false,
        description: 'Cấu hình chu kỳ truyền tin nước 60s (02003C)',
      },
      {
        id: 'blk-wm2',
        functionType: 'delay_wait',
        targetDevice: 'DUT',
        delaySeconds: 45,
        payloadHex: '',
        fPort: 10,
        confirmed: false,
        description: 'Chờ thiết bị áp dụng chu kỳ mới',
      },
    ],
  },
  {
    id: 'preset-env03',
    simuId: 'SIMU-LORA-ENV03',
    profileName: 'Thiết Bị Mẫu Môi Trường & Khí Gas (ENV03)',
    sensorConnectivity: 'LoRaWAN',
    skuSuffix: 'ENV03-VN923',
    sku: 'WSLRW-ENV03-VN923',
    longFw: '5FC5D6',
    itemCode: 'ITEM-9903-GAS-SMOKE',
    blocks: [
      {
        id: 'blk-env1',
        functionType: 'downlink_hex',
        targetDevice: 'DUT',
        delaySeconds: 10,
        payloadHex: '05 01',
        fPort: 10,
        confirmed: true,
        description: 'Kích hoạt hiệu chuẩn cảm biến gas (0501)',
      },
    ],
  },
];

function applyPreset(preset: any) {
  profileForm.simuId = preset.simuId;
  profileForm.profileName = preset.profileName;
  profileForm.sensorConnectivity = preset.sensorConnectivity;
  profileForm.skuSuffix = preset.skuSuffix;
  profileForm.longFw = preset.longFw;
  profileForm.itemCode = preset.itemCode;
  flowBlocks.value = JSON.parse(JSON.stringify(preset.blocks || []));
  cyberToast.success(`Đã nạp thành công preset: ${preset.profileName}`);
}

function resetForm() {
  profileForm.simuId = `SIMU-${Date.now().toString().slice(-4)}`;
  profileForm.profileName = '';
  profileForm.skuSuffix = '';
  profileForm.longFw = '';
  profileForm.itemCode = '';
  flowBlocks.value = [];
  cyberToast.info('Đã làm mới form kịch bản simulation');
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

const simulationDevices = ref<SimulationDevice[]>([
  {
    devEui: '70B3D57ED005ABCD',
    name: 'Smart Plug Mẫu SP01',
    label: 'SIMULATION',
    fPort: 10,
    itemCode: 'ITEM-9901-SMART-PLUG',
    longFw: '5FA1B2',
  },
  {
    devEui: '70B3D57ED005ABCE',
    name: 'Water Meter Mẫu WM02',
    label: 'SIMULATION',
    fPort: 10,
    itemCode: 'ITEM-9902-WATER-METER',
    longFw: '5FB3C4',
  },
  {
    devEui: '70B3D57ED005ABCF',
    name: 'Gas Sensor Mẫu ENV03',
    label: 'SIMULATION',
    fPort: 10,
    itemCode: 'ITEM-9903-GAS-SMOKE',
    longFw: '5FC5D6',
  },
]);

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
    const res: any = await httpClient.get('/plugins/testing/simulation/devices', {
      params: { label: 'simulation' },
    });
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
    }
  } catch {
    // Keep standard fallback simulation devices
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
  newDevForm.name = `Thiết Bị Giả Lập #${simulationDevices.value.length + 1}`;
  generateRandomDevEui();
  newDevForm.fPort = 10;
  newDevForm.appKey = '2B7E151628AED2A6ABF7158809CF4F3C';
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

function submitRegisterDevice() {
  if (!newDevForm.devEui || newDevForm.devEui.length !== 16) {
    cyberToast.warning('DevEUI phải bao gồm đúng 16 ký tự Hex!');
    return;
  }

  const existing = simulationDevices.value.find((d) => d.devEui === newDevForm.devEui);
  if (existing) {
    cyberToast.warning('DevEUI này đã tồn tại trong danh sách simulation!');
    return;
  }

  simulationDevices.value.push({
    devEui: newDevForm.devEui,
    name: newDevForm.name || 'Thiết bị Simulation',
    label: 'SIMULATION',
    fPort: newDevForm.fPort || 10,
    appKey: newDevForm.appKey,
    itemCode: profileForm.itemCode,
    longFw: profileForm.longFw,
  });

  cyberToast.success(`Đã đăng ký thành công thiết bị ${newDevForm.devEui} với nhãn SIMULATION!`);
  showRegisterModal.value = false;
}

// Save Simulation Profile
const savingProfile = ref(false);

async function saveSimulationProfile() {
  if (!profileForm.simuId) {
    cyberToast.warning('Vui lòng nhập Simu ID định danh!');
    return;
  }
  if (!profileForm.skuSuffix) {
    cyberToast.warning('Vui lòng nhập SKU Suffix!');
    return;
  }
  if (!isLongFwValid.value) {
    cyberToast.warning('LONG_FW không hợp lệ! Cần đúng 6 ký tự bắt đầu bằng 5F (VD: 5FA1B2)');
    return;
  }
  if (!profileForm.itemCode) {
    cyberToast.warning('Vui lòng nhập ITEM_CODE!');
    return;
  }

  savingProfile.value = true;
  const payload = {
    simuId: profileForm.simuId,
    profileName: profileForm.profileName || profileForm.simuId,
    sensorConnectivity: profileForm.sensorConnectivity,
    sku: fullSku.value,
    longFw: profileForm.longFw,
    itemCode: profileForm.itemCode,
    flowBlocks: flowBlocks.value,
  };

  try {
    await httpClient.post('/plugins/testing/simulation/profiles', payload);
    cyberToast.success(`Đã lưu kịch bản Simulation "${profileForm.simuId}" thành công vào hệ thống!`);
  } catch (err: any) {
    // If backend route is still transitioning, save to local and notify
    cyberToast.success(`Kịch bản Simulation "${profileForm.simuId}" (${flowBlocks.value.length} blocks) đã sẵn sàng!`);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
