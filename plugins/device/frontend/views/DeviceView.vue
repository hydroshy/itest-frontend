<template>
  <div class="device-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon class="mr-2"><Cpu /></el-icon>
          Thiết Bị (Devices)
        </h2>
        <span class="subtitle">Quản lý thiết bị IoT, liên kết truy vết Traceability (SO/WA/Item Code) độc lập</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openRegisterDialog">
          Đăng Ký Thiết Bị
        </el-button>
        <el-button :icon="Refresh" @click="loadDevices" :loading="loadingDevices">
          Làm Mới
        </el-button>
      </div>
    </div>

    <!-- Filter Card -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="8" :md="6">
          <el-input
            v-model="filters.search"
            placeholder="Tìm Serial, EUI, Tên..."
            clearable
            :prefix-icon="Search"
            @clear="loadDevices"
            @keyup.enter="loadDevices"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="filters.deviceType" placeholder="Loại thiết bị" clearable @change="loadDevices">
            <el-option label="Tất cả loại" value="" />
            <el-option label="LoRaWAN Node" value="lorawan_node" />
            <el-option label="LoRaWAN Gateway" value="lorawan_gateway" />
            <el-option label="Modbus RTU" value="modbus_rtu" />
            <el-option label="Modbus TCP" value="modbus_tcp" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-select v-model="filters.status" placeholder="Trạng thái" clearable @change="loadDevices">
            <el-option label="Tất cả trạng thái" value="" />
            <el-option label="Active" value="active" />
            <el-option label="Testing" value="testing" />
            <el-option label="Passed" value="passed" />
            <el-option label="Failed" value="failed" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-input
            v-model="filters.soNumber"
            placeholder="Mã SO..."
            clearable
            @clear="loadDevices"
            @keyup.enter="loadDevices"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="4">
          <el-input
            v-model="filters.waNumber"
            placeholder="Mã WA..."
            clearable
            @clear="loadDevices"
            @keyup.enter="loadDevices"
          />
        </el-col>
        <el-col :xs="24" :sm="8" :md="2">
          <el-button type="primary" :icon="Search" class="w-full" @click="loadDevices">Lọc</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Table Card -->
    <el-card shadow="never" class="table-card mt-3">
      <el-table :data="deviceList" v-loading="loadingDevices" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="serialNumber" label="Serial / IMEI" min-width="150">
          <template #default="{ row }">
            <div class="font-bold font-mono">{{ row.serialNumber || row.serial_number || '—' }}</div>
            <div class="text-xs text-muted">{{ row.deviceName || row.device_name || '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="networkId" label="DevEUI / Network ID" min-width="170">
          <template #default="{ row }">
            <el-tag v-if="row.networkId || row.network_id" type="info" class="font-mono">
              {{ row.networkId || row.network_id }}
            </el-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceType" label="Loại Thiết Bị" min-width="140">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.deviceType || row.device_type || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Truy Vết Traceability" min-width="220">
          <template #default="{ row }">
            <div class="trace-info text-xs">
              <div><strong>SO:</strong> <span class="text-info">{{ row.soNumber || row.so_number || '—' }}</span></div>
              <div><strong>WA:</strong> <span class="text-warning">{{ row.waNumber || row.wa_number || '—' }}</span></div>
              <div><strong>Item:</strong> {{ row.itemCode || row.item_code || '—' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng Thái" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ (row.status || '').toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="Cập Nhật" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt || row.createdAt || row.updated_at || row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Thao Tác" min-width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="View" @click="goToGatewayTestingPackets(row)">
              Xem Gói Tin
            </el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="confirmDeleteDevice(row)">
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper mt-3">
        <el-pagination
          v-model:current-page="devicePagination.page"
          v-model:page-size="devicePagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="devicePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDevices"
          @current-change="loadDevices"
        />
      </div>
    </el-card>

    <!-- Dialog Đăng Ký Thiết Bị -->
    <el-dialog
      v-model="registerDialogVisible"
      title="Đăng Ký Thiết Bị Liên Kết Traceability"
      width="640px"
      :before-close="handleCloseRegisterDialog"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="130px"
        label-position="right"
      >
        <el-divider content-position="left">Thông tin truy vết (Traceability)</el-divider>

        <el-form-item label="Sale Order (SO)" prop="soNumber">
          <el-select
            v-model="registerForm.soNumber"
            filterable
            remote
            reserve-keyword
            placeholder="Tìm mã SO (DIS/ERP)..."
            :remote-method="searchSOs"
            :loading="loadingSOs"
            class="w-full"
            @change="handleSOChange"
          >
            <el-option
              v-for="so in soOptions"
              :key="so.soNumber || so.so_number"
              :label="`${so.soNumber || so.so_number} - ${so.customerName || so.customer_name || ''}`"
              :value="so.soNumber || so.so_number"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Work Auth (WA)" prop="waNumber">
          <el-select
            v-model="registerForm.waNumber"
            placeholder="Chọn lệnh sản xuất WA..."
            :loading="loadingWAs"
            :disabled="!registerForm.soNumber"
            class="w-full"
            @change="handleWAChange"
          >
            <el-option
              v-for="wa in waOptions"
              :key="wa.waNumber || wa.wa_number"
              :label="`${wa.waNumber || wa.wa_number} (Kế hoạch: ${wa.plannedQuantity || wa.planned_qty || 0})`"
              :value="wa.waNumber || wa.wa_number"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Item Code" prop="itemCode">
          <el-select
            v-model="registerForm.itemCode"
            filterable
            allow-create
            default-first-option
            placeholder="Mã sản phẩm / SKU..."
            :loading="loadingItems"
            class="w-full"
          >
            <el-option
              v-for="item in itemOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">Thông tin định danh thiết bị</el-divider>

        <el-form-item label="Số Serial" prop="serialNumber">
          <el-input
            v-model="registerForm.serialNumber"
            placeholder="VD: SN20261027001..."
          />
        </el-form-item>

        <el-form-item label="DevEUI / Network ID" prop="networkId">
          <el-input
            v-model="registerForm.networkId"
            placeholder="VD: 70B3D57ED005xxxx (LoRaWAN EUI / Mac address)"
          />
        </el-form-item>

        <el-form-item label="Tên Thiết Bị" prop="deviceName">
          <el-input
            v-model="registerForm.deviceName"
            placeholder="VD: Cảm biến nhiệt độ phòng sạch..."
          />
        </el-form-item>

        <el-form-item label="Loại Thiết Bị" prop="deviceType">
          <el-select v-model="registerForm.deviceType" class="w-full">
            <el-option label="LoRaWAN End Device (Node)" value="lorawan_node" />
            <el-option label="LoRaWAN Gateway" value="lorawan_gateway" />
            <el-option label="Modbus RTU Sensor" value="modbus_rtu" />
            <el-option label="Modbus TCP Controller" value="modbus_tcp" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseRegisterDialog">Hủy</el-button>
          <el-button type="primary" :loading="submittingRegister" @click="submitRegisterDevice">
            Xác Nhận Đăng Ký
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Cpu,
  Search,
  Plus,
  Refresh,
  Delete,
  View,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
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

// Register Dialog State
const registerDialogVisible = ref(false);
const submittingRegister = ref(false);
const registerFormRef = ref<FormInstance>();
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

const registerRules = {
  soNumber: [{ required: true, message: 'Vui lòng chọn Sale Order (SO)', trigger: 'change' }],
  waNumber: [{ required: true, message: 'Vui lòng chọn Work Authorization (WA)', trigger: 'change' }],
  itemCode: [{ required: true, message: 'Vui lòng nhập hoặc chọn Item Code', trigger: 'blur' }],
  serialNumber: [{ required: true, message: 'Vui lòng nhập Serial Number', trigger: 'blur' }],
  deviceName: [{ required: true, message: 'Vui lòng nhập tên thiết bị', trigger: 'blur' }],
};

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  } catch {
    return dateStr;
  }
}

function getStatusTagType(status?: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  switch ((status || '').toLowerCase()) {
    case 'active':
    case 'passed':
      return 'success';
    case 'testing':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'info';
  }
}

// Fetch helper: thử endpoint /plugins/device/devices trước, fallback /plugins/testing/devices
async function fetchDevicesApi(params: any) {
  try {
    return await httpClient.get('/plugins/device/devices', { params });
  } catch {
    return await httpClient.get('/plugins/testing/devices', { params });
  }
}

async function loadDevices() {
  loadingDevices.value = true;
  try {
    const params = {
      page: devicePagination.page,
      limit: devicePagination.limit,
      search: filters.search || undefined,
      deviceType: filters.deviceType || undefined,
      status: filters.status || undefined,
      soNumber: filters.soNumber || undefined,
      waNumber: filters.waNumber || undefined,
    };
    const res: any = await fetchDevicesApi(params);
    if (res?.data && Array.isArray(res.data)) {
      deviceList.value = res.data;
      devicePagination.total = res.meta?.total || res.total || res.data.length;
    } else if (Array.isArray(res)) {
      deviceList.value = res;
      devicePagination.total = res.length;
    } else if (res?.items && Array.isArray(res.items)) {
      deviceList.value = res.items;
      devicePagination.total = res.total || res.items.length;
    } else {
      deviceList.value = [];
      devicePagination.total = 0;
    }
  } catch (err: any) {
    console.error('Error loading devices:', err);
    ElMessage.error(err?.message || 'Không thể tải danh sách thiết bị');
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
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa thiết bị ${device.serialNumber || device.serial_number} (${device.deviceName || device.device_name})?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    );
    try {
      await httpClient.delete(`/plugins/device/devices/${device.id}`);
    } catch {
      await httpClient.delete(`/plugins/testing/devices/${device.id}`);
    }
    ElMessage.success('Đã xóa thiết bị thành công');
    loadDevices();
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || 'Lỗi khi xóa thiết bị');
    }
  }
}

// Lookup functions for Register Dialog
async function searchSOs(query: string = '') {
  loadingSOs.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/device/lookup/so', { params: { search: query, limit: 50 } });
    } catch {
      res = await httpClient.get('/plugins/testing/lookup/so', { params: { search: query, limit: 50 } });
    }
    soOptions.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error fetching SOs:', err);
  } finally {
    loadingSOs.value = false;
  }
}

async function handleSOChange(soNumber: string) {
  registerForm.waNumber = '';
  registerForm.itemCode = '';
  waOptions.value = [];
  itemOptions.value = [];

  const found = soOptions.value.find((s) => (s.soNumber || s.so_number) === soNumber);
  if (found) {
    registerForm.soId = found.id || '';
  }

  loadingWAs.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get(`/plugins/device/lookup/so/${encodeURIComponent(soNumber)}/was`);
    } catch {
      res = await httpClient.get(`/plugins/testing/lookup/so/${encodeURIComponent(soNumber)}/was`);
    }
    waOptions.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error fetching WAs for SO:', err);
  } finally {
    loadingWAs.value = false;
  }
}

async function handleWAChange(waNumber: string) {
  registerForm.itemCode = '';
  itemOptions.value = [];

  const found = waOptions.value.find((w) => (w.waNumber || w.wa_number) === waNumber);
  if (found) {
    registerForm.waId = found.id || '';
    if (found.itemCode || found.item_code) {
      registerForm.itemCode = found.itemCode || found.item_code;
      itemOptions.value = [registerForm.itemCode];
    }
  }

  loadingItems.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get(`/plugins/device/lookup/wa/${encodeURIComponent(waNumber)}/items`);
    } catch {
      res = await httpClient.get(`/plugins/testing/lookup/wa/${encodeURIComponent(waNumber)}/items`);
    }
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items)) {
      itemOptions.value = Array.from(new Set([...itemOptions.value, ...items.map((i: any) => i.itemCode || i.item_code || i)]));
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
  if (registerFormRef.value) {
    registerFormRef.value.resetFields();
  }
}

async function submitRegisterDevice() {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return;
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
      ElMessage.success('Đăng ký thiết bị thành công!');
      registerDialogVisible.value = false;
      loadDevices();
    } catch (err: any) {
      console.error('Error registering device:', err);
      ElMessage.error(err?.message || 'Không thể đăng ký thiết bị');
    } finally {
      submittingRegister.value = false;
    }
  });
}

onMounted(() => {
  loadDevices();
});
</script>

<style scoped>
.device-view {
  padding: 16px;
  background-color: var(--el-bg-color-page, #0b132b);
  min-height: calc(100vh - 60px);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-header .title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  color: var(--el-text-color-primary, #e0e6ed);
}

.view-header .subtitle {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary, #7d8da1);
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 12px;
}

.font-mono {
  font-family: monospace;
}

.font-bold {
  font-weight: 600;
}

.text-xs {
  font-size: 12px;
}

.text-muted {
  color: var(--el-text-color-secondary, #888);
}

.text-info {
  color: #409eff;
}

.text-warning {
  color: #e6a23c;
}
</style>
