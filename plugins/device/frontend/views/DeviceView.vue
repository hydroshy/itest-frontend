<template>
  <div class="device-view w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div class="header-title">
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> DEVICE REPOSITORY
        </div>
        <h2 class="text-xl md:text-2xl font-bold flex items-center gap-2.5 tracking-tight text-white mt-0.5">
          <Cpu class="w-6 h-6 text-primary" />
          <span>Thiết Bị (Devices)</span>
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">
          Quản lý thiết bị IoT, liên kết truy vết Traceability (SO/WA/Item Code) độc lập
        </p>
      </div>
      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button
          type="button"
          class="btn btn-primary btn-sm gap-2 shadow-sm"
          @click="openRegisterDialog"
        >
          <Plus class="w-4 h-4" />
          Đăng Ký Thiết Bị
        </button>
        <button
          type="button"
          class="btn btn-outline btn-sm gap-2"
          :disabled="loadingDevices"
          @click="loadDevices"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loadingDevices }" />
          Làm Mới
        </button>
      </div>
    </header>

    <!-- Filter Card -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl p-4 shadow-sm backdrop-blur-md mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3 items-end">
        <div class="form-control sm:col-span-2 md:col-span-3 lg:col-span-3">
          <label class="label py-1"><span class="label-text text-xs font-medium">Tìm kiếm</span></label>
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tìm Serial, EUI, Tên..."
              class="input input-sm input-bordered bg-base-100 w-full pl-9"
              @keyup.enter="loadDevices"
            />
          </div>
        </div>

        <div class="form-control sm:col-span-1 md:col-span-2 lg:col-span-2">
          <label class="label py-1"><span class="label-text text-xs font-medium">Loại thiết bị</span></label>
          <select v-model="filters.deviceType" class="select select-sm select-bordered bg-base-100 w-full" @change="loadDevices">
            <option value="">Tất cả loại</option>
            <option value="lorawan_node">LoRaWAN Node</option>
            <option value="lorawan_gateway">LoRaWAN Gateway</option>
            <option value="modbus_rtu">Modbus RTU</option>
            <option value="modbus_tcp">Modbus TCP</option>
          </select>
        </div>

        <div class="form-control sm:col-span-1 md:col-span-2 lg:col-span-2">
          <label class="label py-1"><span class="label-text text-xs font-medium">Trạng thái</span></label>
          <select v-model="filters.status" class="select select-sm select-bordered bg-base-100 w-full" @change="loadDevices">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="testing">Testing</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div class="form-control sm:col-span-1 md:col-span-2 lg:col-span-2">
          <label class="label py-1"><span class="label-text text-xs font-medium">Mã SO</span></label>
          <input
            v-model="filters.soNumber"
            type="text"
            placeholder="Mã SO..."
            class="input input-sm input-bordered bg-base-100 w-full"
            @keyup.enter="loadDevices"
          />
        </div>

        <div class="form-control sm:col-span-1 md:col-span-2 lg:col-span-2">
          <label class="label py-1"><span class="label-text text-xs font-medium">Mã WA</span></label>
          <input
            v-model="filters.waNumber"
            type="text"
            placeholder="Mã WA..."
            class="input input-sm input-bordered bg-base-100 w-full"
            @keyup.enter="loadDevices"
          />
        </div>

        <div class="flex items-center gap-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
          <button type="button" class="btn btn-primary btn-sm flex-1 gap-1" @click="loadDevices">
            <Search class="w-3.5 h-3.5" />
            Lọc
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm w-full">
          <thead class="bg-base-300/60 font-mono text-xs uppercase text-base-content/70">
            <tr>
              <th class="w-12 text-center">ID</th>
              <th>Serial / IMEI</th>
              <th>Tên Thiết Bị</th>
              <th>Loại Thiết Bị</th>
              <th>Trạng Thái</th>
              <th>Traceability</th>
              <th>Firmware</th>
              <th>Cập Nhật</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingDevices && deviceList.length === 0">
              <td colspan="9" class="text-center py-8 text-base-content/50">
                <span class="loading loading-spinner loading-md text-primary mr-2"></span> Đang tải thiết bị...
              </td>
            </tr>
            <tr v-else-if="deviceList.length === 0">
              <td colspan="9" class="text-center py-8 text-base-content/40 font-mono text-sm">
                Không tìm thấy thiết bị nào phù hợp
              </td>
            </tr>
            <tr v-for="row in deviceList" :key="row.id">
              <td class="text-center font-mono text-xs text-base-content/60">{{ row.id }}</td>
              <td>
                <div class="font-mono text-xs font-bold text-primary">{{ row.serialNumber || row.serial_number }}</div>
                <div v-if="row.networkId || row.network_id" class="text-[11px] font-mono text-base-content/50">
                  EUI: {{ row.networkId || row.network_id }}
                </div>
              </td>
              <td>
                <div class="font-medium text-base-content">{{ row.deviceName || row.device_name || '—' }}</div>
              </td>
              <td>
                <span class="badge badge-sm font-mono text-xs" :class="getDeviceTypeBadgeClass(row.deviceType || row.device_type)">
                  {{ getDeviceTypeLabel(row.deviceType || row.device_type) }}
                </span>
              </td>
              <td>
                <span class="badge badge-sm font-mono text-xs" :class="getStatusBadgeClass(row.status)">
                  {{ row.status || 'Chưa rõ' }}
                </span>
              </td>
              <td class="text-xs">
                <div v-if="row.soNumber || row.so_number" class="space-y-0.5">
                  <div class="font-mono font-semibold text-primary">SO: {{ row.soNumber || row.so_number }}</div>
                  <div v-if="row.waNumber || row.wa_number" class="text-base-content/70">WA: {{ row.waNumber || row.wa_number }}</div>
                  <div v-if="row.itemCode || row.item_code" class="text-base-content/50 text-[11px]">SKU: {{ row.itemCode || row.item_code }}</div>
                </div>
                <span v-else class="text-base-content/40">—</span>
              </td>
              <td class="font-mono text-xs text-base-content/70">
                {{ row.shortFw || row.firmwareVersion || row.firmware_version || '—' }}
              </td>
              <td class="font-mono text-xs text-base-content/60">
                {{ formatDate(row.updated_at || row.updatedAt || row.created_at || row.createdAt) }}
              </td>
              <td class="text-right space-x-1">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-primary gap-1"
                  @click="goToGatewayTestingPackets(row)"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Xem Gói Tin
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                  @click="confirmDeleteDevice(row)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-3 border-t border-base-content/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content/70">
        <div>
          Tổng số: <strong class="font-mono font-bold text-base-content">{{ devicePagination.total }}</strong> thiết bị
        </div>
        <div class="flex items-center gap-2">
          <span>Kích thước trang:</span>
          <select v-model="devicePagination.limit" class="select select-xs select-bordered bg-base-100" @change="handlePageChange(1)">
            <option :value="10">10 / trang</option>
            <option :value="20">20 / trang</option>
            <option :value="50">50 / trang</option>
            <option :value="100">100 / trang</option>
          </select>
          <div class="join ml-2">
            <button
              type="button"
              class="join-item btn btn-xs"
              :disabled="devicePagination.page <= 1"
              @click="handlePageChange(devicePagination.page - 1)"
            >
              «
            </button>
            <button type="button" class="join-item btn btn-xs btn-active font-mono">
              Trang {{ devicePagination.page }} / {{ maxPage }}
            </button>
            <button
              type="button"
              class="join-item btn btn-xs"
              :disabled="devicePagination.page >= maxPage"
              @click="handlePageChange(devicePagination.page + 1)"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Đăng Ký Thiết Bị -->
    <dialog class="modal" :class="{ 'modal-open': registerDialogVisible }">
      <div class="modal-box bg-base-200 border border-base-content/15 shadow-2xl max-w-2xl">
        <h3 class="font-bold text-lg text-base-content mb-4 flex items-center gap-2">
          <Cpu class="w-5 h-5 text-primary" />
          Đăng Ký Thiết Bị Liên Kết Traceability
        </h3>

        <div class="space-y-4">
          <!-- Section 1: Traceability -->
          <div>
            <div class="text-xs font-mono font-semibold uppercase text-primary tracking-wider border-b border-base-content/10 pb-1 mb-3">
              Thông tin truy vết (Traceability)
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-control md:col-span-2">
                <label class="label py-1"><span class="label-text text-xs font-medium">Sale Order (SO)</span></label>
                <div class="flex gap-2">
                  <select
                    v-model="registerForm.soNumber"
                    class="select select-sm select-bordered bg-base-100 flex-1 font-mono text-xs"
                    @change="handleSOChange(registerForm.soNumber)"
                  >
                    <option value="">-- Chọn hoặc tìm mã SO --</option>
                    <option
                      v-for="so in soOptions"
                      :key="so.soNumber || so.so_number"
                      :value="so.soNumber || so.so_number"
                    >
                      {{ so.soNumber || so.so_number }} - {{ so.customerName || so.customer_name || '' }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    :disabled="loadingSOs"
                    @click="searchSOs('')"
                  >
                    <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingSOs }" />
                  </button>
                </div>
              </div>

              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">Work Auth (WA)</span></label>
                <select
                  v-model="registerForm.waNumber"
                  class="select select-sm select-bordered bg-base-100 w-full font-mono text-xs"
                  :disabled="!registerForm.soNumber || loadingWAs"
                  @change="handleWAChange(registerForm.waNumber)"
                >
                  <option value="">-- Chọn lệnh sản xuất WA --</option>
                  <option
                    v-for="wa in waOptions"
                    :key="wa.waNumber || wa.wa_number"
                    :value="wa.waNumber || wa.wa_number"
                  >
                    {{ wa.waNumber || wa.wa_number }} (Kế hoạch: {{ wa.plannedQuantity || wa.planned_qty || 0 }})
                  </option>
                </select>
              </div>

              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">Item Code / SKU</span></label>
                <select
                  v-model="registerForm.itemCode"
                  class="select select-sm select-bordered bg-base-100 w-full font-mono text-xs"
                  :disabled="loadingItems"
                >
                  <option value="">-- Chọn mã sản phẩm / SKU --</option>
                  <option v-for="item in itemOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 2: Thông tin thiết bị -->
          <div>
            <div class="text-xs font-mono font-semibold uppercase text-primary tracking-wider border-b border-base-content/10 pb-1 mb-3">
              Thông tin định danh thiết bị
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">Số Serial *</span></label>
                <input
                  v-model="registerForm.serialNumber"
                  type="text"
                  placeholder="VD: SN20261027001..."
                  class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
                />
              </div>

              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">DevEUI / Network ID</span></label>
                <input
                  v-model="registerForm.networkId"
                  type="text"
                  placeholder="VD: 70B3D57ED005xxxx"
                  class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
                />
              </div>

              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">Tên Thiết Bị *</span></label>
                <input
                  v-model="registerForm.deviceName"
                  type="text"
                  placeholder="VD: Cảm biến nhiệt độ phòng sạch..."
                  class="input input-sm input-bordered bg-base-100 text-xs w-full"
                />
              </div>

              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-medium">Loại Thiết Bị *</span></label>
                <select v-model="registerForm.deviceType" class="select select-sm select-bordered bg-base-100 w-full text-xs">
                  <option value="lorawan_node">LoRaWAN End Device (Node)</option>
                  <option value="lorawan_gateway">LoRaWAN Gateway</option>
                  <option value="modbus_rtu">Modbus RTU Sensor</option>
                  <option value="modbus_tcp">Modbus TCP Controller</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action mt-6">
          <button type="button" class="btn btn-sm btn-ghost" @click="handleCloseRegisterDialog">Hủy</button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="submittingRegister"
            @click="submitRegisterDevice"
          >
            <span v-if="submittingRegister" class="loading loading-spinner loading-xs mr-1"></span>
            Xác Nhận Đăng Ký
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Cpu,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
} from 'lucide-vue-next';
import { cyberToast, cyberConfirm } from '@/cyber/hud';
import { httpClient } from '@/api/client';

const router = useRouter();

// Devices State
const loadingDevices = ref(false);
const deviceList = ref<any[]>([]);
const filters = reactive({
  search: '',
  deviceType: '',
  status: '',
  soNumber: '',
  waNumber: '',
});
const devicePagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const maxPage = computed(() => {
  return Math.max(1, Math.ceil(devicePagination.total / devicePagination.limit));
});

function handlePageChange(newPage: number) {
  devicePagination.page = newPage;
  loadDevices();
}

// Register Dialog State
const registerDialogVisible = ref(false);
const submittingRegister = ref(false);
const loadingSOs = ref(false);
const loadingWAs = ref(false);
const loadingItems = ref(false);

const soOptions = ref<any[]>([]);
const waOptions = ref<any[]>([]);
const itemOptions = ref<string[]>([]);

const registerForm = reactive({
  soId: '',
  soNumber: '',
  waId: '',
  waNumber: '',
  itemCode: '',
  serialNumber: '',
  networkId: '',
  deviceName: '',
  deviceType: 'lorawan_node',
});

function resetRegisterForm() {
  Object.assign(registerForm, {
    soId: '',
    soNumber: '',
    waId: '',
    waNumber: '',
    itemCode: '',
    serialNumber: '',
    networkId: '',
    deviceName: '',
    deviceType: 'lorawan_node',
  });
  soOptions.value = [];
  waOptions.value = [];
  itemOptions.value = [];
}

// Load Devices List
async function loadDevices() {
  loadingDevices.value = true;
  try {
    const params: Record<string, any> = {
      page: devicePagination.page,
      limit: devicePagination.limit,
    };
    if (filters.search) params.search = filters.search.trim();
    if (filters.deviceType) params.deviceType = filters.deviceType;
    if (filters.status) params.status = filters.status;
    if (filters.soNumber) params.soNumber = filters.soNumber.trim();
    if (filters.waNumber) params.waNumber = filters.waNumber.trim();

    let res: any;
    try {
      res = await httpClient.get('/plugins/device/devices', { params });
    } catch {
      res = await httpClient.get('/plugins/testing/devices', { params });
    }

    if (Array.isArray(res)) {
      deviceList.value = res;
      devicePagination.total = res.length;
    } else if (res && Array.isArray(res.items)) {
      deviceList.value = res.items;
      devicePagination.total = res.total || res.items.length;
    } else {
      deviceList.value = [];
      devicePagination.total = 0;
    }
  } catch (err: any) {
    console.error('Error loading devices:', err);
    cyberToast.error(err?.message || 'Không thể tải danh sách thiết bị');
  } finally {
    loadingDevices.value = false;
  }
}

function goToGatewayTestingPackets(device: any) {
  const netId = device.networkId || device.network_id || device.serialNumber || device.serial_number;
  router.push({
    path: '/plugins/testing',
    query: {
      tab: 'packets',
      networkId: netId,
    },
  });
}

// Delete device
async function confirmDeleteDevice(device: any) {
  const serial = device.serialNumber || device.serial_number;
  const name = device.deviceName || device.device_name || '';
  const confirmed = await cyberConfirm(`Bạn có chắc chắn muốn xóa thiết bị ${serial} (${name})?`);
  if (!confirmed) return;

  try {
    try {
      await httpClient.delete(`/plugins/device/devices/${device.id}`);
    } catch {
      await httpClient.delete(`/plugins/testing/devices/${device.id}`);
    }
    cyberToast.success('Đã xóa thiết bị thành công');
    loadDevices();
  } catch (err: any) {
    cyberToast.error(err?.message || 'Lỗi khi xóa thiết bị');
  }
}

// Lookup functions for Register Dialog
async function searchSOs(query: string = '') {
  loadingSOs.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/dis-manager/so', { params: { search: query } });
    } catch {
      res = await httpClient.get('/plugins/device-traceability/so', { params: { search: query } });
    }
    if (Array.isArray(res)) {
      soOptions.value = res;
    } else if (res && Array.isArray(res.items)) {
      soOptions.value = res.items;
    } else {
      soOptions.value = [];
    }
  } catch (err: any) {
    console.error('Error searching SOs:', err);
  } finally {
    loadingSOs.value = false;
  }
}

async function handleSOChange(val: string) {
  registerForm.waNumber = '';
  registerForm.waId = '';
  registerForm.itemCode = '';
  waOptions.value = [];
  itemOptions.value = [];

  const selected = soOptions.value.find((s) => (s.soNumber || s.so_number) === val);
  if (selected) {
    registerForm.soId = selected.id || selected._id || '';
    if (selected.customerName || selected.customer_name) {
      registerForm.deviceName = `${selected.customerName || selected.customer_name} Device`;
    }
  }

  if (val) {
    await fetchWAsForSO(val, registerForm.soId);
  }
}

async function fetchWAsForSO(soNumber: string, soId?: string) {
  loadingWAs.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/dis-manager/wa', { params: { soNumber, soId } });
    } catch {
      res = await httpClient.get('/plugins/device-traceability/wa', { params: { soNumber, soId } });
    }
    if (Array.isArray(res)) {
      waOptions.value = res;
    } else if (res && Array.isArray(res.items)) {
      waOptions.value = res.items;
    } else {
      waOptions.value = [];
    }
  } catch (err: any) {
    console.error('Error fetching WAs for SO:', err);
  } finally {
    loadingWAs.value = false;
  }
}

async function handleWAChange(val: string) {
  registerForm.itemCode = '';
  itemOptions.value = [];

  const selected = waOptions.value.find((w) => (w.waNumber || w.wa_number) === val);
  if (selected) {
    registerForm.waId = selected.id || selected._id || '';
    if (selected.itemCode || selected.item_code) {
      registerForm.itemCode = selected.itemCode || selected.item_code;
    }
  }

  if (val) {
    await fetchItemsForWA(val, registerForm.waId);
  }
}

async function fetchItemsForWA(waNumber: string, waId?: string) {
  loadingItems.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/dis-manager/items', { params: { waNumber, waId } });
    } catch {
      res = await httpClient.get('/plugins/device-traceability/items', { params: { waNumber, waId } });
    }
    if (Array.isArray(res)) {
      itemOptions.value = res.map((item: any) => typeof item === 'string' ? item : (item.itemCode || item.item_code || item.sku));
    } else if (res && Array.isArray(res.items)) {
      itemOptions.value = res.items.map((item: any) => typeof item === 'string' ? item : (item.itemCode || item.item_code || item.sku));
    } else {
      itemOptions.value = [];
    }
  } catch (err: any) {
    console.error('Error fetching items for WA:', err);
  } finally {
    loadingItems.value = false;
  }
}

function openRegisterDialog() {
  registerDialogVisible.value = true;
  searchSOs('');
}

function handleCloseRegisterDialog() {
  registerDialogVisible.value = false;
  resetRegisterForm();
}

async function submitRegisterDevice() {
  if (!registerForm.serialNumber.trim()) {
    cyberToast.warning('Vui lòng nhập số Serial');
    return;
  }
  if (!registerForm.deviceName.trim()) {
    cyberToast.warning('Vui lòng nhập tên thiết bị');
    return;
  }

  submittingRegister.value = true;
  try {
    const payload = {
      soId: registerForm.soId || undefined,
      soNumber: registerForm.soNumber,
      waId: registerForm.waId || undefined,
      waNumber: registerForm.waNumber,
      itemCode: registerForm.itemCode,
      serialNumber: registerForm.serialNumber,
      networkId: registerForm.networkId || undefined,
      deviceName: registerForm.deviceName,
      deviceType: registerForm.deviceType,
    };
    try {
      await httpClient.post('/plugins/device/devices', payload);
    } catch {
      await httpClient.post('/plugins/testing/devices', payload);
    }
    cyberToast.success('Đăng ký thiết bị thành công!');
    registerDialogVisible.value = false;
    resetRegisterForm();
    loadDevices();
  } catch (err: any) {
    console.error('Error registering device:', err);
    cyberToast.error(err?.message || 'Không thể đăng ký thiết bị');
  } finally {
    submittingRegister.value = false;
  }
}

function getDeviceTypeBadgeClass(type: string): string {
  switch (type) {
    case 'lorawan_node': return 'badge-info badge-outline';
    case 'lorawan_gateway': return 'badge-success badge-outline';
    case 'modbus_rtu': return 'badge-warning badge-outline';
    case 'modbus_tcp': return 'badge-secondary badge-outline';
    default: return 'badge-ghost';
  }
}

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case 'lorawan_node': return 'LoRaWAN Node';
    case 'lorawan_gateway': return 'LoRaWAN Gateway';
    case 'modbus_rtu': return 'Modbus RTU';
    case 'modbus_tcp': return 'Modbus TCP';
    default: return type || 'Chưa phân loại';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
    case 'passed': return 'badge-success text-success-content';
    case 'failed': return 'badge-error text-error-content';
    case 'testing': return 'badge-warning text-warning-content';
    default: return 'badge-ghost';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

onMounted(() => {
  loadDevices();
});
</script>
