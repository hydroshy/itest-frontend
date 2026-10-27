<template>
  <div class="testing-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon class="mr-2"><Odometer /></el-icon>
          Gateway Testing
        </h2>
        <span class="subtitle">Giám sát gói tin Dual Payload (Raw/Decoded) & phiên kiểm thử Gateway kết nối ChirpStack</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openCreateSessionDialog">
          Tạo Phiên Test Mới
        </el-button>
        <el-button :icon="Refresh" @click="refreshActiveTab" :loading="loading">
          Làm Mới
        </el-button>
      </div>
    </div>

    <!-- Main Tabs -->
    <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
      <!-- TAB 1: Gateway Test Sessions -->
      <el-tab-pane label="Gateway Test Sessions" name="gateway-sessions">
        <el-card shadow="never" class="table-card">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-md font-bold">Lịch Sử Phiên Test Gateway (ChirpStack)</h3>
            <el-button type="primary" :icon="Plus" size="small" @click="openCreateSessionDialog">
              Tạo Phiên Mới
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
                <span class="font-mono text-primary font-bold">{{ row.gatewayId || row.gateway_id || '—' }}</span>
                <div v-if="row.gatewayName || row.gateway_name" class="text-xs text-secondary">{{ row.gatewayName || row.gateway_name }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Trạng Thái" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ (row.status || '').toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Thống Kê Gói Tin" min-width="180">
              <template #default="{ row }">
                <div class="text-xs">
                  <div><strong>Tổng:</strong> {{ row.totalPackets ?? row.total_packets ?? 0 }}</div>
                  <div>
                    <span class="text-success font-bold">Pass: {{ row.passedPackets ?? row.passed_packets ?? 0 }}</span> |
                    <span class="text-danger font-bold">Fail: {{ row.failedPackets ?? row.failed_packets ?? 0 }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="startedAt" label="Bắt Đầu" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.startedAt || row.started_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="endedAt" label="Kết Thúc" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.endedAt || row.ended_at) }}
              </template>
            </el-table-column>
            <el-table-column label="Thao Tác" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" :icon="View" @click="viewSessionPackets(row)">
                  Gói Tin
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
              <el-button type="primary" :icon="Search" @click="loadPackets">Lọc</el-button>
              <el-button :icon="Refresh" @click="resetPacketFilters">Đặt Lại</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="table-card mt-3">
          <el-table :data="packetList" v-loading="loadingPackets" stripe border style="width: 100%">
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="networkId" label="DevEUI / Network ID" min-width="160">
              <template #default="{ row }">
                <el-tag type="info" class="font-mono">{{ row.networkId || row.network_id || '—' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="packetType" label="Loại Gói" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getPacketTypeTag(row.packetType || row.packet_type)">
                  {{ (row.packetType || row.packet_type || '').toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Dual Payload Preview (Raw vs Decoded)" min-width="320">
              <template #default="{ row }">
                <div class="payload-preview">
                  <div class="raw-preview text-xs">
                    <span class="label font-bold text-info">RAW:</span>
                    <span class="code font-mono ml-1">{{ truncateStr(row.rawPayload || row.raw_payload, 40) }}</span>
                  </div>
                  <div v-if="row.decodedPayload || row.decoded_payload" class="decoded-preview text-xs mt-1">
                    <span class="label font-bold text-success">DECODED:</span>
                    <span class="code font-mono ml-1">{{ truncateStr(JSON.stringify(row.decodedPayload || row.decoded_payload), 50) }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Chỉ Số RF (RSSI / SNR)" min-width="150" align="center">
              <template #default="{ row }">
                <div class="rf-stats text-xs">
                  <span v-if="row.rssi !== null && row.rssi !== undefined">RSSI: <b>{{ row.rssi }} dBm</b></span>
                  <span v-if="row.snr !== null && row.snr !== undefined" class="ml-2">SNR: <b>{{ row.snr }} dB</b></span>
                  <span v-if="row.rssi === null && row.snr === null" class="text-secondary">—</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Kết Quả" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ (row.status || '').toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="receivedAt" label="Thời Gian" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.receivedAt || row.received_at || row.createdAt || row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="Thao Tác" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" :icon="View" @click="inspectPacket(row)">
                  Chi Tiết
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
    </el-tabs>

    <!-- Dialog Chi Tiết Gói Tin Dual Payload -->
    <el-dialog v-model="packetDetailVisible" title="Chi Tiết Gói Tin Dual Payload" width="700px">
      <div v-if="selectedPacket" class="packet-detail-body">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="ID">{{ selectedPacket.id }}</el-descriptions-item>
          <el-descriptions-item label="Loại Gói">{{ selectedPacket.packetType || selectedPacket.packet_type }}</el-descriptions-item>
          <el-descriptions-item label="Network ID / EUI">{{ selectedPacket.networkId || selectedPacket.network_id }}</el-descriptions-item>
          <el-descriptions-item label="Trạng Thái">
            <el-tag :type="getStatusTagType(selectedPacket.status)">{{ (selectedPacket.status || '').toUpperCase() }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="RSSI">{{ selectedPacket.rssi ?? '—' }} dBm</el-descriptions-item>
          <el-descriptions-item label="SNR">{{ selectedPacket.snr ?? '—' }} dB</el-descriptions-item>
          <el-descriptions-item label="Thời Gian">{{ formatDateTime(selectedPacket.receivedAt || selectedPacket.received_at) }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt-4">
          <div class="section-title"><el-icon><Document /></el-icon> Raw Payload (HEX / Base64)</div>
          <pre class="raw-code">{{ selectedPacket.rawPayload || selectedPacket.raw_payload || 'Trống' }}</pre>
        </div>

        <div class="mt-4">
          <div class="section-title"><el-icon><DataAnalysis /></el-icon> Decoded Payload (JSONB)</div>
          <pre class="json-code">{{ JSON.stringify(selectedPacket.decodedPayload || selectedPacket.decoded_payload || {}, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="packetDetailVisible = false">Đóng</el-button>
      </template>
    </el-dialog>

    <!-- Dialog Tạo Phiên Test Gateway Mới -->
    <el-dialog v-model="createSessionDialogVisible" title="Tạo Phiên Test Gateway" width="500px">
      <el-form ref="sessionFormRef" :model="sessionForm" :rules="sessionRules" label-width="130px">
        <el-form-item label="Gateway EUI / ID" prop="gatewayId">
          <el-input v-model="sessionForm.gatewayId" placeholder="VD: 0016c001f1122334" />
        </el-form-item>
        <el-form-item label="Tên Gateway" prop="gatewayName">
          <el-input v-model="sessionForm.gatewayName" placeholder="VD: Gateway Outdoor SX1302" />
        </el-form-item>
        <el-form-item label="Ghi Chú" prop="notes">
          <el-input v-model="sessionForm.notes" type="textarea" :rows="3" placeholder="Ghi chú cấu hình kiểm thử..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createSessionDialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submittingSession" @click="submitCreateSession">Tạo Phiên</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Connection,
  Odometer,
  Search,
  Plus,
  Refresh,
  View,
  Document,
  DataAnalysis,
} from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { httpClient } from '@/api/client';

const route = useRoute();
const router = useRouter();

const activeTab = ref('gateway-sessions');
const loading = ref(false);

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
const createSessionDialogVisible = ref(false);
const submittingSession = ref(false);
const sessionFormRef = ref<FormInstance>();
const sessionForm = reactive({
  gatewayId: '',
  gatewayName: '',
  notes: '',
});
const sessionRules = {
  gatewayId: [{ required: true, message: 'Vui lòng nhập Gateway EUI / ID', trigger: 'blur' }],
};

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
    case 'in_progress':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'info';
  }
}

function getPacketTypeTag(type?: string) {
  switch (type?.toLowerCase()) {
    case 'uplink':
      return 'success';
    case 'downlink':
      return 'warning';
    case 'join_request':
      return 'primary';
    case 'ack':
      return 'info';
    default:
      return '';
  }
}

function truncateStr(str?: string, max = 30) {
  if (!str) return '—';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

function handleTabChange(tab: any) {
  router.replace({
    query: {
      ...route.query,
      tab: tab.paneName || tab,
    },
  });
  refreshActiveTab();
}

function refreshActiveTab() {
  if (activeTab.value === 'packets') {
    loadPackets();
  } else if (activeTab.value === 'gateway-sessions') {
    loadGatewaySessions();
  }
}

// Packets loading
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
      packetList.value = Array.isArray(res.data) ? res.data : (res.data.items || []);
      packetPagination.total = res.total ?? (res.data.total ?? packetList.value.length);
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

function inspectPacket(packet: any) {
  selectedPacket.value = packet;
  packetDetailVisible.value = true;
}

// Gateway sessions
async function loadGatewaySessions() {
  loadingSessions.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/gateway-sessions');
    sessionList.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error loading gateway sessions:', err);
    ElMessage.error(err?.message || 'Không thể tải danh sách phiên test Gateway');
  } finally {
    loadingSessions.value = false;
  }
}

function viewSessionPackets(session: any) {
  activeTab.value = 'packets';
  packetFilters.networkId = session.gatewayId || session.gateway_id || '';
  packetPagination.page = 1;
  handleTabChange('packets');
}

function openCreateSessionDialog() {
  createSessionDialogVisible.value = true;
}

async function submitCreateSession() {
  if (!sessionFormRef.value) return;
  await sessionFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submittingSession.value = true;
    try {
      await httpClient.post('/plugins/testing/gateway-sessions', {
        gatewayId: sessionForm.gatewayId,
        gatewayName: sessionForm.gatewayName || undefined,
        notes: sessionForm.notes || undefined,
      });
      ElMessage.success('Đã tạo phiên test Gateway thành công!');
      createSessionDialogVisible.value = false;
      loadGatewaySessions();
    } catch (err: any) {
      console.error('Error creating gateway session:', err);
      ElMessage.error(err?.message || 'Không thể tạo phiên test Gateway');
    } finally {
      submittingSession.value = false;
    }
  });
}

onMounted(() => {
  const queryTab = route.query.tab as string;
  if (queryTab && ['packets', 'gateway-sessions'].includes(queryTab)) {
    activeTab.value = queryTab;
  }
  if (route.query.networkId) {
    packetFilters.networkId = String(route.query.networkId);
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

.text-success {
  color: var(--el-color-success);
}

.text-danger {
  color: var(--el-color-danger);
}

.text-warning {
  color: var(--el-color-warning);
}
</style>
