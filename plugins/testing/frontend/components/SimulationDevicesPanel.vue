<template>
  <div class="space-y-4">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200 p-4 rounded-box border border-base-content/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-primary/10 rounded-lg text-primary">
          <Radio class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-base font-bold text-base-content uppercase tracking-wide flex items-center gap-2">
            Danh Sách Thiết Bị Simulation
            <span class="badge badge-primary badge-sm font-mono">{{ simulationDevices.length }}</span>
          </h2>
          <p class="text-xs text-base-content/70">
            Quản lý thiết bị giả lập đăng ký vào Simulation Application ID trên ChirpStack Network Server.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          :disabled="loadingDevices"
          @click="fetchSimulationDevices"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': loadingDevices }" />
          <span>Làm Mới</span>
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary gap-1.5"
          @click="openRegisterModal"
        >
          <Plus class="w-4 h-4" />
          <span>Đăng Ký Thiết Bị Mới</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box p-3 shadow-sm">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder=""
            class="input input-sm input-bordered pl-9 w-full font-mono text-xs"
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
              <th>Serial Number</th>
              <th>DevEUI</th>
              <th>AppEUI</th>
              <th>Tên Thiết Bị</th>
              <th>Item Code</th>
              <th>FW Version</th>
              <th>Trạng Thái</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="font-mono text-xs">
            <tr
              v-for="(dev, idx) in filteredDevices"
              :key="dev.devEui || dev.id"
              class="hover:bg-base-200/40 transition-colors"
            >
              <td class="text-base-content/40">{{ idx + 1 }}</td>
              <td class="font-bold text-base-content">{{ dev.serialNumber || '—' }}</td>
              <td class="font-bold text-primary">{{ dev.devEui }}</td>
              <td class="font-mono text-xs text-base-content/70">{{ dev.appEui || '—' }}</td>
              <td class="font-sans font-medium text-base-content">{{ dev.name || 'Thiết bị simulation' }}</td>
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
                    class="btn btn-ghost btn-xs text-error"
                    @click="removeDevice(dev)"
                    title="Xóa thiết bị"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDevices.length === 0 && !loadingDevices">
              <td colspan="9" class="text-center py-8 text-base-content/50 italic font-sans">
                Không tìm thấy thiết bị simulation nào. Nhấn "Đăng Ký Thiết Bị Mới" để thêm.
              </td>
            </tr>
            <tr v-if="loadingDevices">
              <td colspan="9" class="text-center py-8 text-base-content/50 italic font-sans">
                Đang tải danh sách thiết bị simulation...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Đăng ký thiết bị simulation mới -->
    <dialog class="modal" :class="{ 'modal-open': showRegisterModal }">
      <div class="modal-box bg-base-100 border border-base-content/10 max-w-lg p-5">
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
          <!-- 1. DEVICE_NAME & SERIAL_NUMBER -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">DEVICE_NAME</span></label>
              <input
                v-model="newDevForm.name"
                type="text"
                class="input input-bordered input-sm"
                placeholder=""
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">SERIAL_NUMBER <span class="text-error">*</span></span></label>
              <input
                v-model="newDevForm.serialNumber"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder=""
                required
              />
            </div>
          </div>

          <!-- 2. DEVEUI & APPEUI -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">DEVEUI <span class="text-error">*</span></span></label>
              <input
                v-model="newDevForm.devEui"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder=""
                maxlength="16"
                required
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">APPEUI</span></label>
              <input
                v-model="newDevForm.appEui"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder=""
                maxlength="16"
              />
            </div>
          </div>

          <!-- 3. ITEM_CODE & FW_VERSION -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">ITEM_CODE</span></label>
              <input
                v-model="newDevForm.itemCode"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder=""
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">FW_VERSION (XXFXXXX)</span></label>
              <input
                v-model="newDevForm.longFw"
                type="text"
                class="input input-bordered input-sm font-mono uppercase"
                placeholder=""
                maxlength="35"
              />
            </div>
          </div>

          <!-- 4. APPKEY -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">APPKEY</span></label>
            <input
              v-model="newDevForm.appKey"
              type="text"
              class="input input-bordered input-sm font-mono uppercase"
              placeholder=""
              maxlength="32"
            />
          </div>

          <div class="text-[11px] text-base-content/60 bg-base-200/50 p-2.5 rounded border border-base-content/10">
            ℹ️ Thiết bị sẽ tự động được đăng ký vào <strong>Simulation Application ID</strong> trên ChirpStack Network Server.
          </div>

          <div class="modal-action pt-2">
            <button type="button" class="btn btn-sm btn-ghost" @click="showRegisterModal = false">
              Hủy
            </button>
            <button type="submit" class="btn btn-sm btn-primary">
              Đăng Ký Thiết Bị
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="showRegisterModal = false">Đóng</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Radio,
  Plus,
  RotateCw,
  Search,
  Workflow,
  Trash2,
  X,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

export interface SimulationDevice {
  id?: string;
  serialNumber?: string;
  devEui: string;
  name?: string;
  appEui?: string;
  appKey?: string;
  itemCode?: string;
  longFw?: string;
  label?: string;
}

const emit = defineEmits<{
  (e: 'select-for-flow', device: SimulationDevice): void;
}>();

const simulationDevices = ref<SimulationDevice[]>([]);
const loadingDevices = ref(false);
const searchQuery = ref('');
const showRegisterModal = ref(false);

const newDevForm = reactive({
  name: '',
  serialNumber: '',
  devEui: '',
  appEui: '0000000000000000',
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
      d.serialNumber?.toLowerCase().includes(q) ||
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
        serialNumber: it.serialNumber || it.serial_number || '',
        devEui: it.devEui || it.dev_eui || it.networkId || it.serialNumber,
        name: it.name || it.deviceName,
        itemCode: it.itemCode || it.item_code,
        longFw: it.longFw || it.long_fw || it.fwVersion,
        appEui: it.appEui || it.app_eui,
        appKey: it.appKey || it.app_key,
        label: it.label || it.status || 'SIMULATION',
      }));
    }
  } catch (err: any) {
    console.warn('Could not fetch simulation devices from backend:', err);
  } finally {
    loadingDevices.value = false;
  }
}

function openRegisterModal() {
  newDevForm.name = '';
  newDevForm.serialNumber = '';
  newDevForm.devEui = '';
  newDevForm.appEui = '0000000000000000';
  newDevForm.appKey = '';
  newDevForm.itemCode = '';
  newDevForm.longFw = '';
  showRegisterModal.value = true;
}

async function submitRegisterModal() {
  const eui = newDevForm.devEui.trim().toUpperCase();
  const serial = newDevForm.serialNumber.trim();
  const name = newDevForm.name.trim() || serial || `DEV-${eui}`;

  if (!serial) {
    cyberToast.warning('Vui lòng nhập Số Serial (SERIAL_NUMBER)!');
    return;
  }
  if (!eui || eui.length !== 16 || !/^[0-9A-F]{16}$/i.test(eui)) {
    cyberToast.warning('Vui lòng nhập DevEUI hợp lệ (chính xác 16 ký tự HEX)!');
    return;
  }

  const existing = simulationDevices.value.find((d) => d.devEui === eui || (d.serialNumber && d.serialNumber === serial));
  if (existing) {
    cyberToast.warning(`Thiết bị ${eui} (hoặc SN ${serial}) đã tồn tại trong danh sách!`);
    return;
  }

  const newDevice: SimulationDevice = {
    serialNumber: serial,
    devEui: eui,
    name,
    appEui: newDevForm.appEui.trim().toUpperCase() || '0000000000000000',
    appKey: newDevForm.appKey.trim().toUpperCase(),
    itemCode: newDevForm.itemCode.trim(),
    longFw: newDevForm.longFw.trim().toUpperCase(),
    label: 'SIMULATION',
  };

  try {
    await httpClient.post('/plugins/testing/devices', {
      serialNumber: serial,
      deviceName: name,
      devEui: eui,
      networkId: eui,
      appEui: newDevice.appEui,
      appKey: newDevice.appKey,
      itemCode: newDevice.itemCode,
      fwVersion: newDevice.longFw,
      longFw: newDevice.longFw,
      status: 'simulation',
      isSimulation: true,
      deviceType: 'SIMULATION',
      pluginId: 'testing',
    });
    simulationDevices.value.unshift(newDevice);
    cyberToast.success(`Đã đăng ký thiết bị ${serial} (${eui}) vào Simulation Application ID thành công!`);
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
    await httpClient.delete(`/plugins/testing/devices/${id}`);
    simulationDevices.value = simulationDevices.value.filter((d) => (d.id || d.devEui) !== id);
    cyberToast.success(`Đã xóa thiết bị ${name}`);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể xóa thiết bị';
    cyberToast.error(msg);
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
