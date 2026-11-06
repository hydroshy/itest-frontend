<template>
  <div class="simulation-create-view space-y-4">
    <!-- Header: Simulation Create -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-wide uppercase text-base-content">
              TẠO FLOW SIMULATION (SIMULATION CREATE)
            </h2>
            <p class="text-xs text-base-content/60">
              Nhập thông tin thiết bị và tạo flow kịch bản bằng function block nối tiếp
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5 text-base-content/80"
            @click="$emit('switch-tab', 'list-flow-simulation')"
          >
            <List class="w-3.5 h-3.5" />
            <span>Danh Sách Flow</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1"
            @click="resetForm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5"
            :disabled="savingProfile"
            @click="saveSimulationProfile"
          >
            <span v-if="savingProfile" class="loading loading-spinner loading-xs"></span>
            <Save v-else class="w-3.5 h-3.5" />
            Lưu Kịch Bản
          </button>
        </div>
      </div>
    </div>

    <!-- Section 1: Thông tin cấu hình thiết bị (Ô trống đơn giản, không mô tả thừa) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Sensor connectivity -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Sensor connectivity</span>
          </label>
          <select
            v-model="profileForm.sensorConnectivity"
            class="select select-bordered select-sm w-full text-xs font-medium"
          >
            <option value="LoRaWAN">LoRaWAN</option>
            <option value="Sigfox">Sigfox</option>
          </select>
        </div>

        <!-- SKU -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">SKU</span>
          </label>
          <div class="join w-full">
            <span class="join-item btn btn-sm btn-neutral no-animation font-mono text-xs font-bold px-2.5 pointer-events-none select-none">
              {{ skuPrefix }}
            </span>
            <input
              v-model="profileForm.skuSuffix"
              type="text"
              class="input input-bordered input-sm join-item flex-1 font-mono text-xs uppercase"
              placeholder="Nhập suffix (VD: SP01-EU868)..."
              @input="onSkuSuffixInput"
            />
          </div>
        </div>

        <!-- LONG_FW -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">LONG_FW</span>
          </label>
          <input
            v-model="profileForm.longFw"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="LONG_FW..."
          />
        </div>

        <!-- ITEM_CODE -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">ITEM_CODE</span>
          </label>
          <input
            v-model="profileForm.itemCode"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="ITEM_CODE..."
          />
        </div>

        <!-- SIMU ID (Tự sinh từ ITEM CODE và FW) -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">SIMU ID</span>
            <span class="badge badge-xs badge-neutral font-mono text-[9px]">TỰ SINH</span>
          </label>
          <input
            :value="generatedSimuId"
            type="text"
            readonly
            disabled
            class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold bg-base-300/60 cursor-not-allowed"
            placeholder="Tự sinh từ ITEM_CODE & FW..."
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Flow Builder bằng Function Block (Bên dưới) -->
    <div class="space-y-2">
      <SimulationFlowBuilder
        v-model="flowBlocks"
        :devices="simulationDeviceItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Cpu, RotateCcw, Save, List } from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import SimulationFlowBuilder, {
  type FlowBlock,
  type SimulationDeviceItem,
} from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'packet-emitted', packet: any): void;
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

// Form state - Plain empty inputs, no mock data
const profileForm = reactive({
  sensorConnectivity: 'LoRaWAN',
  skuSuffix: '',
  longFw: '',
  itemCode: '',
});

// Sku prefix reacts to sensor connectivity
const skuPrefix = computed(() => {
  return profileForm.sensorConnectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-';
});

const fullSku = computed(() => {
  const suffix = profileForm.skuSuffix.trim();
  return suffix ? `${skuPrefix.value}${suffix}` : '';
});

function onSkuSuffixInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.toUpperCase();
  if (val.startsWith('WSLRW-')) val = val.slice(6);
  if (val.startsWith('WSSFC-')) val = val.slice(6);
  profileForm.skuSuffix = val;
}

// Flow Blocks state
const flowBlocks = ref<FlowBlock[]>([]);

// SIMU ID auto-generated from ITEM_CODE and FW
const generatedSimuId = computed(() => {
  const item = profileForm.itemCode.trim();
  const fw = profileForm.longFw.trim();
  if (!item && !fw) return '';
  if (item && fw) return `SIMU-${item}-${fw}`;
  if (item) return `SIMU-${item}`;
  return `SIMU-${fw}`;
});

function resetForm() {
  profileForm.sensorConnectivity = 'LoRaWAN';
  profileForm.skuSuffix = '';
  profileForm.longFw = '';
  profileForm.itemCode = '';
  flowBlocks.value = [];
  cyberToast.info('Đã làm mới form');
}

// Background simulation devices lookup for target device dropdown
const simulationDevices = ref<any[]>([]);

const simulationDeviceItems = computed<SimulationDeviceItem[]>(() => {
  return simulationDevices.value.map((d: any) => ({
    id: d.id,
    devEui: d.devEui || d.dev_eui || d.networkId || '',
    name: d.name || d.deviceName,
    itemCode: d.itemCode || d.item_code,
    label: d.label || d.status || 'SIMULATION',
  }));
});

async function fetchSimulationDevices() {
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/testing/devices', {
        params: { label: 'simulation' },
      });
    } catch {
      res = await httpClient.get('/plugins/testing/devices/simulation');
    }
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || (Array.isArray(res) ? res : []));
    simulationDevices.value = items;
  } catch {
    simulationDevices.value = [];
  }
}

// Save Profile
const savingProfile = ref(false);

async function saveSimulationProfile() {
  if (!profileForm.itemCode.trim() && !profileForm.skuSuffix.trim()) {
    cyberToast.warning('Vui lòng nhập ITEM_CODE hoặc SKU!');
    return;
  }

  savingProfile.value = true;
  const payload = {
    simuId: generatedSimuId.value || `SIMU-${Date.now()}`,
    sensorConnectivity: profileForm.sensorConnectivity,
    sku: fullSku.value,
    longFw: profileForm.longFw,
    itemCode: profileForm.itemCode,
    flowBlocks: flowBlocks.value,
  };

  try {
    await httpClient.post('/plugins/testing/simulation/profiles', payload);
    cyberToast.success('Đã lưu kịch bản Simulation thành công!');
    emit('switch-tab', 'list-flow-simulation');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu kịch bản Simulation';
    cyberToast.error(msg);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
