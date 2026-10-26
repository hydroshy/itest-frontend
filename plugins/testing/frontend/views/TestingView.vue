<template>
  <div class="testing-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon class="mr-2"><Cpu /></el-icon>
          Testing System
        </h2>
        <span class="subtitle">Quản lý kiểm thử thiết bị, liên kết truy vết Traceability (SO/WA/Item Code) & giám sát gói tin</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openRegisterDialog">
          Đăng Ký Thiết Bị Kiểm Thử
        </el-button>
        <el-button :icon="Refresh" @click="refreshActiveTab" :loading="loading">
          Làm Mới
        </el-button>
      </div>
    </div>

    <!-- Main Tabs -->
    <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
      <!-- TAB 1: Danh sách thiết bị -->
      <el-tab-pane label="Thiết Bị Kiểm Thử" name="devices">
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
                <el-option label="End Device" value="end_device" />
                <el-option label="Sensor" value="sensor" />
                <el-option label="Meter" value="meter" />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-select v-model="filters.status" placeholder="Trạng thái" clearable @change="loadDevices">
                <el-option label="Tất cả trạng thái" value="" />
                <el-option label="ACTIVE" value="active" />
                <el-option label="REGISTERED" value="registered" />
                <el-option label="IN_TEST" value="in_test" />
                <el-option label="PASSED" value="passed" />
                <el-option label="FAILED" value="failed" />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-input
                v-model="filters.soNumber"
                placeholder="Lọc theo Sale Order (SO)"
                clearable
                @clear="loadDevices"
                @keyup.enter="loadDevices"
              />
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-input
                v-model="filters.waNumber"
                placeholder="Lọc theo WA"
                clearable
                @clear="loadDevices"
                @keyup.enter="loadDevices"
              />
            </el-col>
            <el-col :xs="24" :sm="8" :md="2">
              <el-button type="primary" :icon="Search" @click="loadDevices">Lọc</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="table-card mt-3">
          <el-table :data="deviceList" v-loading="loadingDevices" stripe border style="width: 100%">
            <el-table-column prop="serialNumber" label="Serial Number" min-width="160">
              <template #default="{ row }">
                <span class="font-mono text-primary font-bold">{{ row.serialNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="networkId" label="Network ID / DevEUI" min-width="170">
              <template #default="{ row }">
                <span class="font-mono text-secondary">{{ row.networkId || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="Tên Thiết Bị" min-width="180" />
            <el-table-column prop="deviceType" label="Loại" min-width="130">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.deviceType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Truy Vết Traceability" min-width="220">
              <template #default="{ row }">
                <div class="trace-info text-xs">
                  <div><strong>SO:</strong> <span class="text-info">{{ row.soNumber || '—' }}</span></div>
                  <div><strong>WA:</strong> <span class="text-warning">{{ row.waNumber || '—' }}</span></div>
                  <div><strong>Item:</strong> {{ row.itemCode || '—' }}</div>
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
                {{ formatDateTime(row.updatedAt || row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="Thao Tác" min-width="180" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" :icon="View" @click="viewDevicePackets(row)">
                  Xem Gói Tin
                </el-button>
                <el-button link type="danger" size="small" :icon="Delete" @click="confirmDeleteDevice(row)">
                  Xóa
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="devicePagination.page"
              v-model:page-size="devicePagination.limit"
              :total="devicePagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadDevices"
              @current-change="loadDevices"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- TAB 2: Giám sát gói tin (Packets) -->
      <el-tab-pane label="Giám Sát Gói Tin (Packets)" name="packets">
        <el-card shadow="never" class="filter-card">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="packetFilters.networkId"
                placeholder="DevEUI / Network ID..."
                clearable
                :prefix-icon="Search"
                @clear="loadPackets"
                @keyup.enter="loadPackets"
              />
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-select v-model="packetFilters.packetType" placeholder="Loại gói tin" clearable @change="loadPackets">
                <el-option label="Tất cả loại" value="" />
                <el-option label="UPLINK" value="uplink" />
                <el-option label="DOWNLINK" value="downlink" />
                <el-option label="JOIN REQUEST" value="join_request" />
                <el-option label="ACK" value="ack" />
                <el-option label="STATUS" value="status" />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="packetFilters.search"
                placeholder="Tìm trong Payload..."
                clearable
                @clear="loadPackets"
                @keyup.enter="loadPackets"
              />
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-button type="primary" :icon="Search" @click="loadPackets">Lọc Gói Tin</el-button>
              <el-button :icon="Refresh" @click="resetPacketFilters">Reset</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="table-card mt-3">
          <el-table
            :data="packetList"
            v-loading="loadingPackets"
            stripe
            border
            style="width: 100%"
            row-key="id"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="packet-expand-box p-3">
                  <el-row :gutter="16">
                    <el-col :xs="24" :md="12">
                      <div class="expand-section">
                        <div class="section-title">
                          <el-icon><Document /></el-icon>
                          <span>Raw Payload</span>
                        </div>
                        <div class="raw-code font-mono">{{ row.rawPayload || '(Empty raw payload)' }}</div>
                      </div>
                      <div class="expand-section mt-3">
                        <div class="section-title">
                          <el-icon><Connection /></el-icon>
                          <span>RF Metrics & Gateway Info</span>
                        </div>
                        <div class="json-code">
                          <pre>{{ JSON.stringify(row.rfInfo || {}, null, 2) }}</pre>
                        </div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="12">
                      <div class="expand-section">
                        <div class="section-title">
                          <el-icon><DataAnalysis /></el-icon>
                          <span>Decoded Payload (JSONB)</span>
                        </div>
                        <div class="json-code">
                          <pre>{{ JSON.stringify(row.decodedPayload || {}, null, 2) }}</pre>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="createdAt" label="Thời Gian" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="packetType" label="Loại" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.packetType === 'uplink' ? 'success' : 'warning'">
                  {{ (row.packetType || 'unknown').toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Cổng & FCNT" min-width="130" align="center">
              <template #default="{ row }">
                <span>Port: {{ row.fPort ?? '—' }} | FCnt: {{ row.fCnt ?? '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="rawPayload" label="Raw Payload Preview" min-width="200">
              <template #default="{ row }">
                <span class="font-mono text-xs truncate block max-w-xs">{{ row.rawPayload || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="RF Metrics" min-width="180">
              <template #default="{ row }">
                <div v-if="row.rfInfo" class="text-xs">
                  <span v-if="row.rfInfo.rssi !== undefined">RSSI: <strong>{{ row.rfInfo.rssi }} dBm</strong> | </span>
                  <span v-if="row.rfInfo.snr !== undefined">SNR: <strong>{{ row.rfInfo.snr }} dB</strong></span>
                  <div v-if="row.rfInfo.gatewayEui" class="text-secondary font-mono">GW: {{ row.rfInfo.gatewayEui }}</div>
                </div>
                <span v-else class="text-secondary">—</span>
              </template>
            </el-table-column>
            <el-table-column label="Hành Động" width="100" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="inspectPacket(row)">
                  Chi tiết
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="packetPagination.page"
              v-model:page-size="packetPagination.limit"
              :total="packetPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadPackets"
              @current-change="loadPackets"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- TAB 3: Gateway Test Sessions -->
      <el-tab-pane label="Gateway Test Sessions" name="gateway-sessions">
        <el-card shadow="never" class="table-card">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-md font-bold">Lịch Sử Phiên Test Gateway (ChirpStack)</h3>
            <el-button type="primary" :icon="Plus" @click="openCreateSessionDialog">
              Tạo Phiên Test Mới
            </el-button>
          </div>
          <el-table :data="sessionList" v-loading="loadingSessions" stripe border style="width: 100%">
            <el-table-column prop="id" label="Session ID" min-width="150">
              <template #default="{ row }">
                <span class="font-mono">{{ row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="gatewayId" label="Gateway EUI / ID" min-width="170">
              <template #default="{ row }">
                <span class="font-mono text-primary font-bold">{{ row.gatewayId }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Trạng Thái" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
                  {{ (row.status || '').toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Kết Quả Summary" min-width="250">
              <template #default="{ row }">
                <div v-if="row.summary" class="text-xs">
                  <div>Tỷ lệ đạt: <strong>{{ row.summary.passedSteps || 0 }}/{{ row.summary.totalSteps || 5 }}</strong></div>
                  <div class="text-secondary">{{ row.summary.note || '' }}</div>
                </div>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="Thời Gian" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- DIALOG: Đăng Ký Thiết Bị Mới (Cascading SO -> WA -> Item Code) -->
    <el-dialog
      v-model="registerDialogVisible"
      title="Đăng Ký Thiết Bị Kiểm Thử (Liên Kết Traceability)"
      width="650px"
      :before-close="handleCloseRegisterDialog"
      destroy-on-close
    >
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="150px" label-position="left">
        <!-- 1. Cụm liên kết Traceability -->
        <div class="form-section-title">
          <el-icon class="mr-1"><Files /></el-icon>
          Truy Vết Traceability (ERP Link)
        </div>
        
        <el-form-item label="Sale Order (SO)" prop="soNumber" required>
          <el-select
            v-model="registerForm.soNumber"
            filterable
            remote
            placeholder="Tìm hoặc chọn SO..."
            :remote-method="searchSOs"
            :loading="loadingSOs"
            style="width: 100%"
            @change="handleSOChange"
          >
            <el-option
              v-for="so in soOptions"
              :key="so.id || so.soNumber"
              :label="`${so.soNumber} - ${so.customerName || 'ERP'}`"
              :value="so.soNumber"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Work Auth (WA)" prop="waNumber" required>
          <el-select
            v-model="registerForm.waNumber"
            filterable
            placeholder="Chọn WA thuộc SO đã chọn..."
            :disabled="!registerForm.soNumber"
            :loading="loadingWAs"
            style="width: 100%"
            @change="handleWAChange"
          >
            <el-option
              v-for="wa in waOptions"
              :key="wa.id || wa.waNumber"
              :label="`${wa.waNumber} ${wa.plannedQuantity ? '(SL: ' + wa.plannedQuantity + ')' : ''}`"
              :value="wa.waNumber"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Item Code" prop="itemCode" required>
          <el-select
            v-model="registerForm.itemCode"
            filterable
            allow-create
            placeholder="Chọn hoặc nhập Item Code..."
            :disabled="!registerForm.waNumber && waOptions.length > 0"
            :loading="loadingItems"
            style="width: 100%"
          >
            <el-option
              v-for="item in itemOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <!-- 2. Thông tin định danh thiết bị -->
        <div class="form-section-title mt-4">
          <el-icon class="mr-1"><Cpu /></el-icon>
          Thông Số Định Danh Thiết Bị
        </div>

        <el-form-item label="Serial Number" prop="serialNumber" required>
          <el-input v-model="registerForm.serialNumber" placeholder="Nhập Serial Number duy nhất..." />
        </el-form-item>

        <el-form-item label="Network ID / DevEUI" prop="networkId">
          <el-input v-model="registerForm.networkId" placeholder="Ví dụ: DevEUI, MAC, Gateway EUI..." />
        </el-form-item>

        <el-form-item label="Tên Thiết Bị" prop="deviceName" required>
          <el-input v-model="registerForm.deviceName" placeholder="Tên gợi nhớ của thiết bị..." />
        </el-form-item>

        <el-form-item label="Loại Thiết Bị" prop="deviceType" required>
          <el-select v-model="registerForm.deviceType" style="width: 100%">
            <el-option label="LoRaWAN End Device" value="lorawan_node" />
            <el-option label="LoRaWAN Gateway" value="lorawan_gateway" />
            <el-option label="Generic Sensor" value="sensor" />
            <el-option label="Smart Meter" value="meter" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="registerDialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submittingRegister" @click="submitRegisterDevice">
          Đăng Ký
        </el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: Chi Tiết Gói Tin / Inspect JSON -->
    <el-dialog v-model="packetDetailVisible" title="Chi Tiết Gói Tin" width="700px">
      <div v-if="selectedPacket">
        <el-descriptions border :column="2" class="mb-3">
          <el-descriptions-item label="Packet ID">{{ selectedPacket.id }}</el-descriptions-item>
          <el-descriptions-item label="Loại Gói">{{ selectedPacket.packetType }}</el-descriptions-item>
          <el-descriptions-item label="FPort">{{ selectedPacket.fPort ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="FCnt">{{ selectedPacket.fCnt ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="Thời Gian" :span="2">{{ formatDateTime(selectedPacket.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <div class="font-bold mb-1">Raw Payload:</div>
        <div class="raw-code p-2 mb-3 font-mono">{{ selectedPacket.rawPayload || '(Empty)' }}</div>

        <div class="font-bold mb-1">Decoded Payload (JSONB):</div>
        <div class="json-code p-2 mb-3">
          <pre>{{ JSON.stringify(selectedPacket.decodedPayload || {}, null, 2) }}</pre>
        </div>

        <div class="font-bold mb-1">RF Info:</div>
        <div class="json-code p-2">
          <pre>{{ JSON.stringify(selectedPacket.rfInfo || {}, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Cpu,
  Connection,
  Odometer,
  Files,
  Search,
  Plus,
  Refresh,
  Delete,
  View,
  Document,
  DataAnalysis,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { httpClient } from '@/api/client';

const route = useRoute();
const router = useRouter();

const activeTab = ref('devices');
const loading = ref(false);

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

// Packets State
const loadingPackets = ref(false);
const packetList = ref<any[]>([]);
const packetFilters = reactive({
  networkId: '',
  packetType: '',
  search: '',
});
const packetPagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});
const packetDetailVisible = ref(false);
const selectedPacket = ref<any>(null);

// Gateway Sessions State
const loadingSessions = ref(false);
const sessionList = ref<any[]>([]);

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
  itemCode: [{ required: true, message: 'Vui lòng nhập hoặc chọn Item Code', trigger: 'change' }],
  serialNumber: [{ required: true, message: 'Vui lòng nhập Serial Number', trigger: 'blur' }],
  deviceName: [{ required: true, message: 'Vui lòng nhập Tên Thiết Bị', trigger: 'blur' }],
  deviceType: [{ required: true, message: 'Vui lòng chọn Loại Thiết Bị', trigger: 'change' }],
};

// Formatting
function formatDateTime(isoStr?: string) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

function getStatusTagType(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'passed':
      return 'success';
    case 'in_test':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'registered':
    default:
      return 'info';
  }
}

// Tab handling
function handleTabChange(tab: string) {
  router.replace({ query: { ...route.query, tab } });
  refreshActiveTab();
}

function refreshActiveTab() {
  if (activeTab.value === 'devices') {
    loadDevices();
  } else if (activeTab.value === 'packets') {
    loadPackets();
  } else if (activeTab.value === 'gateway-sessions') {
    loadGatewaySessions();
  }
}

// Load Devices
async function loadDevices() {
  loadingDevices.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/devices', {
      params: {
        page: devicePagination.page,
        limit: devicePagination.limit,
        search: filters.search || undefined,
        deviceType: filters.deviceType || undefined,
        status: filters.status || undefined,
        soNumber: filters.soNumber || undefined,
        waNumber: filters.waNumber || undefined,
      },
    });
    if (res?.data) {
      deviceList.value = res.data.items || [];
      devicePagination.total = res.data.total || 0;
    } else if (Array.isArray(res)) {
      deviceList.value = res;
      devicePagination.total = res.length;
    }
  } catch (err: any) {
    console.error('Error loading devices:', err);
    ElMessage.error(err?.message || 'Không thể tải danh sách thiết bị kiểm thử');
  } finally {
    loadingDevices.value = false;
  }
}

// Load Packets
async function loadPackets() {
  loadingPackets.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/packets', {
      params: {
        page: packetPagination.page,
        limit: packetPagination.limit,
        networkId: packetFilters.networkId || undefined,
        packetType: packetFilters.packetType || undefined,
        search: packetFilters.search || undefined,
      },
    });
    if (res?.data) {
      packetList.value = res.data.items || [];
      packetPagination.total = res.data.total || 0;
    } else if (Array.isArray(res)) {
      packetList.value = res;
      packetPagination.total = res.length;
    }
  } catch (err: any) {
    console.error('Error loading packets:', err);
    ElMessage.error(err?.message || 'Không thể tải danh sách gói tin');
  } finally {
    loadingPackets.value = false;
  }
}

function resetPacketFilters() {
  packetFilters.networkId = '';
  packetFilters.packetType = '';
  packetFilters.search = '';
  packetPagination.page = 1;
  loadPackets();
}

function viewDevicePackets(device: any) {
  activeTab.value = 'packets';
  packetFilters.networkId = device.networkId || '';
  packetFilters.search = device.serialNumber || '';
  packetPagination.page = 1;
  loadPackets();
}

function inspectPacket(packet: any) {
  selectedPacket.value = packet;
  packetDetailVisible.value = true;
}

// Gateway sessions
async function loadGatewaySessions() {
  loadingSessions.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/gateway-sessions');
    sessionList.value = res?.data?.items || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error loading gateway sessions:', err);
  } finally {
    loadingSessions.value = false;
  }
}

function openCreateSessionDialog() {
  ElMessage.info('Tính năng đo kiểm 5 bước Gateway đang đồng bộ với server ChirpStack.');
}

// Delete device
async function confirmDeleteDevice(device: any) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa thiết bị ${device.serialNumber} (${device.deviceName})?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    );
    await httpClient.delete(`/plugins/testing/devices/${device.id}`);
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
    const res: any = await httpClient.get('/plugins/testing/lookup/so', {
      params: { search: query, limit: 50 },
    });
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

  const foundSO = soOptions.value.find((s) => s.soNumber === soNumber);
  if (foundSO) {
    registerForm.soId = foundSO.id;
  }

  if (!soNumber) return;

  loadingWAs.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/wa', {
      params: { soNumber, limit: 100 },
    });
    waOptions.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error fetching WAs:', err);
  } finally {
    loadingWAs.value = false;
  }
}

async function handleWAChange(waNumber: string) {
  registerForm.itemCode = '';
  itemOptions.value = [];

  const foundWA = waOptions.value.find((w) => w.waNumber === waNumber);
  if (foundWA) {
    registerForm.waId = foundWA.id;
  }

  if (!waNumber) return;

  loadingItems.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/items', {
      params: {
        soId: registerForm.soId || undefined,
        waId: registerForm.waId || undefined,
      },
    });
    itemOptions.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error fetching items:', err);
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
      await httpClient.post('/plugins/testing/devices', {
        soId: registerForm.soId || undefined,
        soNumber: registerForm.soNumber,
        waId: registerForm.waId || undefined,
        waNumber: registerForm.waNumber,
        itemCode: registerForm.itemCode,
        serialNumber: registerForm.serialNumber,
        networkId: registerForm.networkId || undefined,
        deviceName: registerForm.deviceName,
        deviceType: registerForm.deviceType,
      });
      ElMessage.success('Đăng ký thiết bị kiểm thử thành công!');
      registerDialogVisible.value = false;
      loadDevices();
    } catch (err: any) {
      console.error('Error registering device:', err);
      ElMessage.error(err?.message || 'Không thể đăng ký thiết bị kiểm thử');
    } finally {
      submittingRegister.value = false;
    }
  });
}

onMounted(() => {
  const queryTab = route.query.tab as string;
  if (queryTab && ['devices', 'packets', 'gateway-sessions'].includes(queryTab)) {
    activeTab.value = queryTab;
  }
  refreshActiveTab();
});
</script>

<style scoped>
.testing-view {
  padding: 16px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left .title {
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  margin: 0 0 4px 0;
}

.header-left .subtitle {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.custom-tabs {
  background: transparent;
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed var(--el-border-color);
  padding-bottom: 4px;
}

.raw-code,
.json-code {
  background: var(--el-fill-color-darker, #1e1e1e);
  color: #a9b7c6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.82rem;
  overflow-x: auto;
  border: 1px solid var(--el-border-color);
}

.section-title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-primary);
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

.text-primary {
  color: var(--el-color-primary);
}

.text-secondary {
  color: var(--el-text-color-secondary);
}

.text-info {
  color: var(--el-color-info);
}

.text-warning {
  color: var(--el-color-warning);
}
</style>
