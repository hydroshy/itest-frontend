<template>
  <div class="simulation-devices-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Radio class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-base-content tracking-tight uppercase">
                Danh Sách Thiết Bị Simulation
              </h2>
              <span class="badge badge-info badge-sm font-mono font-bold">NHÃN SIMULATION</span>
              <span class="badge badge-neutral badge-sm font-mono">{{ filteredDevices.length }} Thiết Bị</span>
            </div>
            <p class="text-xs text-base-content/60 mt-0.5">
              Quản lý các thiết bị kiểm thử được gắn nhãn simulation hoặc template trong hệ thống
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-outline gap-1.5"
            @click="fetchSimulationDevices"
            :disabled="loadingDevices"
          >
            <RotateCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingDevices }" />
            <span>Làm Mới</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            @click="openRegisterModal"
          >
            <Plus class="w-4 h-4" />
            <span>Đăng Ký Thiết Bị Mới</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative flex-1 min-w-[240px] max-w-md">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            v-model="searchQuery"
            type="text"
            class="input input-bordered input-sm w-full pl-9 text-xs"
            placeholder="Tìm theo DevEUI, tên thiết bị, Item Code..."
          />
        </div>

        <div class="flex items-center gap-2 text-xs text-base-content/60 font-mono">
          <span>Tổng: {{ simulationDevices.length }}</span>
          <span>|</span>
          <span>Hiển thị: {{ filteredDevices.length }}</span>
        </div>
      </div>
    </div>

    <!-- Simulation Devices Table -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="overflow-x-auto rounded-lg border border-base-content/10 bg-base-100">
        <table class="table table-sm w-full">
          <thead class="bg-base-200/60 font-mono text-xs text-base-content/70">
            <tr>
              <th class="w-10">#</th>
              <th>DevEUI</th>
              <th>Tên Thiết Bị</th>
              <th>Nhãn</th>
              <th>FPort</th>
              <th>Item Code</th>
              <th>Long FW</th>
              <th>Trạng Thái</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="font-mono text-xs">
            <tr
              v-for="(dev, idx) in filteredDevices"
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
              <td class="text-base-content/70">{{ dev.itemCode || '—' }}</td>
              <td class="text-base-content/70">
                <span v-if="dev.longFw" class="badge badge-neutral badge-xs font-mono">{{ dev.longFw }}</span>
                <span v-else>—</span>
              </td>
              <td>
                <span class="badge badge-success badge-xs font-mono">READY</span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-primary gap-1"
                    @click="$emit('select-for-flow', dev)"
                    title="Tạo kịch bản flow cho thiết bị này"
                  >
                    <Workflow class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Tạo Flow</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    @click="removeDevice(dev)"
                    title="Xóa thiết bị"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredDevices.length === 0">
              <td colspan="9" class="text-center py-8 text-base-content/40 italic font-sans text-xs">
                <span v-if="loadingDevices">Đang tải danh sách thiết bị simulation...</span>
                <span v-else-if="searchQuery">Không tìm thấy thiết bị nào khớp với "{{ searchQuery }}"</span>
                <span v-else>Chưa có thiết bị nào được đăng ký với nhãn simulation. Nhấn "Đăng Ký Thiết Bị Mới" để thêm.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Đăng ký thiết bị simulation mới -->
    <dialog class="modal" :class="{ 'modal-open': showRegisterModal }">
      <div class="modal-box bg-base-100 border border-base-content/10 max-w-md p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-content/10">
          <div class="flex items-center gap-2">
            <Radio class="w-5 h-5 text-primary" />
            <h3 class="font-bold text-sm uppercase">Đăng Ký Thiết Bị Simulation Mới</h3>
          </div>
          <button type="button" class="btn btn-xs btn-circle btn-ghost" @click="showRegisterModal = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitRegisterModal" class="space-y-3 text-xs">
          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">DevEUI <span class="text-error">*</span></span></label>
            <input
              v-model="newDevForm.devEui"
              type="text"
              class="input input-bordered input-sm font-mono uppercase"
              placeholder="16 ký tự HEX (VD: 70B3D57ED0050001)"
              maxlength="16"
              required
            />
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">Tên Thiết Bị</span></label>
            <input
              v-model="newDevForm.name"
              type="text"
              class="input input-bordered input-sm"
              placeholder="VD: Node Cảm Biến Khí Gas Mẫu 01"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Item Code</span></label>
              <input
                v-model="newDevForm.itemCode"
                type="text"
                class="input input-bordered input-sm font-mono"
                placeholder="VD: WSLRW-ENV-01"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">FW Version (XXFXXXX)</span></label>
              <input
                v-model="newDevForm.longFw"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder="VD: 4F0505, 32F0505"
                maxlength="35"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">FPort Mặc Định</span></label>
              <input
                v-model.number="newDevForm.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-bordered input-sm font-mono"
                placeholder="10"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Nhãn Gán</span></label>
              <input
                type="text"
                class="input input-bordered input-sm font-mono bg-base-200"
                value="SIMULATION"
                readonly
                disabled
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">AppKey (Tùy chọn)</span></label>
            <input
              v-model="newDevForm.appKey"
              type="text"
              class="input input-bordered input-sm font-mono uppercase"
              placeholder="32 ký tự HEX"
              maxlength="32"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-base-content/10">
            <button type="button" class="btn btn-sm btn-ghost" @click="showRegisterModal = false">
              Hủy
            </button>
            <button type="submit" class="btn btn-sm btn-primary gap-1">
              <Plus class="w-4 h-4" />
              <span>Đăng Ký</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Radio,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Workflow,
  X,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

export interface SimulationDevice {
  id?: string;
  devEui: string;
  name?: string;
  label?: string;
  fPort?: number;
  appKey?: string;
  itemCode?: string;
  longFw?: string;
}

const emit = defineEmits<{
  (e: 'select-for-flow', device: SimulationDevice): void;
}>();

const simulationDevices = ref<SimulationDevice[]>([]);
const loadingDevices = ref(false);
const searchQuery = ref('');
const showRegisterModal = ref(false);

const newDevForm = reactive({
  devEui: '',
  name: '',
  fPort: 10,
  appKey: '',
  itemCode: '',
  longFw: '',
});

const filteredDevices = computed(() => {
  if (!searchQuery.value.trim()) {
    return simulationDevices.value;
  }
  const q = searchQuery.value.toLowerCase().trim();
  return simulationDevices.value.filter(
    (d) =>
      d.devEui?.toLowerCase().includes(q) ||
      d.name?.toLowerCase().includes(q) ||
      d.itemCode?.toLowerCase().includes(q) ||
      d.longFw?.toLowerCase().includes(q),
  );
});

async function fetchSimulationDevices() {
  loadingDevices.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/devices/simulation');
    const items = Array.isArray(res?.data)
      ? res.data
      : (res?.data?.items || (Array.isArray(res) ? res : []));
    if (Array.isArray(items)) {
      simulationDevices.value = items.map((it: any) => ({
        id: it.id,
        devEui: it.devEui || it.dev_eui || it.networkId || it.serialNumber,
        name: it.name || it.deviceName,
        label: it.label || it.status || 'SIMULATION',
        fPort: it.fPort || it.f_port || 10,
        itemCode: it.itemCode || it.item_code,
        longFw: it.longFw || it.long_fw,
        appKey: it.appKey || it.app_key,
      }));
    }
  } catch (err: any) {
    console.warn('Could not fetch simulation devices from backend:', err);
  } finally {
    loadingDevices.value = false;
  }
}

function openRegisterModal() {
  newDevForm.devEui = '';
  newDevForm.name = '';
  newDevForm.fPort = 10;
  newDevForm.appKey = '';
  newDevForm.itemCode = '';
  newDevForm.longFw = '';
  showRegisterModal.value = true;
}

async function submitRegisterModal() {
  const eui = newDevForm.devEui.trim().toUpperCase();
  if (!eui || eui.length < 8) {
    cyberToast.warning('Vui lòng nhập DevEUI hợp lệ (ít nhất 8 ký tự HEX)!');
    return;
  }

  const existing = simulationDevices.value.find((d) => d.devEui === eui);
  if (existing) {
    cyberToast.warning(`Thiết bị ${eui} đã tồn tại trong danh sách!`);
    return;
  }

  const newDevice: SimulationDevice = {
    devEui: eui,
    name: newDevForm.name.trim() || `Thiết bị ${eui.slice(-4)}`,
    label: 'SIMULATION',
    fPort: newDevForm.fPort || 10,
    appKey: newDevForm.appKey.trim().toUpperCase(),
    itemCode: newDevForm.itemCode.trim(),
    longFw: newDevForm.longFw.trim().toUpperCase(),
  };

  try {
    await httpClient.post('/plugins/testing/devices', {
      ...newDevice,
      status: 'simulation',
      isSimulation: true,
      deviceType: 'SIMULATION',
      pluginId: 'testing',
    });
    simulationDevices.value.unshift(newDevice);
    cyberToast.success(`Đã đăng ký thành công thiết bị ${eui} với nhãn SIMULATION!`);
    showRegisterModal.value = false;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể đăng ký thiết bị simulation';
    cyberToast.error(msg);
  }
}

async function removeDevice(device: SimulationDevice) {
  const id = device.id || device.devEui;
  const name = device.name || device.devEui;
  if (!confirm(`Bạn có chắc chắn muốn xóa thiết bị simulation "${name}" không?`)) {
    return;
  }

  try {
    const targetId = encodeURIComponent(id);
    await httpClient.delete(`/plugins/testing/devices/${targetId}`);
    simulationDevices.value = simulationDevices.value.filter((d) => (d.id || d.devEui) !== id);
    cyberToast.info(`Đã xóa thiết bị ${name} khỏi danh sách simulation`);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể xóa thiết bị simulation';
    cyberToast.error(msg);
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
