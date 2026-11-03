<template>
  <div class="testing-view w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div class="header-title">
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary" /> LORAWAN TESTING SUITE
        </div>
        <h2 class="text-xl md:text-2xl font-bold flex items-center gap-2.5 tracking-tight text-white mt-0.5">
          <Gauge class="w-6 h-6 text-primary" />
          <span>LoRaWAN Testing Suite</span>
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">
          Hệ thống kiểm thử Gateway kết nối ChirpStack, giám sát gói tin Dual Payload, Giả lập thiết bị LoRaWAN &amp; Tự động kiểm tra chất lượng (Device Auto Check)
        </p>
      </div>
      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button
          v-if="activeTab === 'gateway-sessions'"
          class="btn btn-primary btn-sm gap-2 shadow-sm"
          @click="openCreateSessionDialog"
        >
          <Plus class="w-4 h-4" />
          Tạo Phiên Test Mới
        </button>
        <button class="btn btn-outline btn-sm gap-2" :disabled="loading" @click="refreshActiveTab">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-4 h-4" />
          Làm Mới
        </button>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div v-if="!isIsolatedView" role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
      <button
        v-for="t in tabList"
        :key="t.name"
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === t.name }"
        @click="selectTab(t.name)"
      >
        <component :is="t.icon" class="w-4 h-4" />
        {{ t.label }}
      </button>
    </div>

    <!-- TAB 1: Gateway Test Sessions -->
    <div v-if="activeTab === 'gateway-sessions'">
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-base">Lịch Sử Phiên Test Gateway (ChirpStack)</h3>
          <button class="btn btn-primary btn-sm gap-1" @click="openCreateSessionDialog">
            <Plus class="w-4 h-4" />
            Tạo Phiên Mới
          </button>
        </div>

        <div class="overflow-x-auto relative">
          <div v-if="loadingSessions" class="absolute inset-0 bg-base-100/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>

          <table class="table table-zebra table-sm w-full">
            <thead>
              <tr class="text-xs uppercase bg-base-200/50">
                <th>Session ID</th>
                <th>Gateway EUI / Serial</th>
                <th>SO / WA</th>
                <th>Mạng / IP / Region</th>
                <th class="text-center">Trạng Thái</th>
                <th>Thống Kê Gói Tin</th>
                <th>Bắt Đầu</th>
                <th>Kết Thúc</th>
                <th class="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sessionList.length === 0 && !loadingSessions">
                <td colspan="9" class="text-center py-8 text-base-content/50 italic">
                  Chưa có phiên kiểm thử Gateway nào. Nhấn "Tạo Phiên Mới" để bắt đầu.
                </td>
              </tr>
              <tr v-for="row in sessionList" :key="row.id" class="hover">
                <td>
                  <span class="font-mono text-xs font-semibold">{{ row.id }}</span>
                </td>
                <td>
                  <div class="font-mono font-bold text-primary text-xs">{{ row.gatewayId || row.gateway_id || '—' }}</div>
                  <div v-if="row.serialNumber || row.serial_number" class="text-xs text-base-content/70">
                    SN: <span class="font-mono">{{ row.serialNumber || row.serial_number }}</span>
                  </div>
                </td>
                <td>
                  <div class="text-xs font-semibold">{{ row.soNumber || row.so_number || '—' }}</div>
                  <div class="text-xs text-base-content/60">WA: {{ row.waNumber || row.wa_number || '—' }}</div>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    <span
                      class="badge badge-xs font-mono"
                      :class="(row.internetTestType === 'lte_4g' || row.internet_test_type === 'lte_4g') ? 'badge-warning' : 'badge-primary'"
                    >
                      {{ row.internetTestType || row.internet_test_type || 'ETH' }}
                    </span>
                    <span v-if="row.region" class="badge badge-xs badge-info font-mono">
                      {{ row.region }}
                    </span>
                  </div>
                  <div v-if="row.gatewayIp || row.gateway_ip" class="text-[11px] font-mono text-base-content/60 mt-0.5">
                    {{ row.gatewayIp || row.gateway_ip }}
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge badge-sm font-mono font-semibold" :class="getStatusBadgeClass(row.status)">
                    {{ row.status || 'UNKNOWN' }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-1 text-xs">
                    <span class="badge badge-xs badge-ghost">Total: {{ row.totalPackets ?? row.total_packets ?? 0 }}</span>
                    <span class="badge badge-xs badge-success text-success-content">↑ {{ row.uplinkCount ?? row.uplink_count ?? 0 }}</span>
                    <span class="badge badge-xs badge-info text-info-content">↓ {{ row.downlinkCount ?? row.downlink_count ?? 0 }}</span>
                  </div>
                </td>
                <td class="text-xs text-base-content/70">
                  {{ formatDateTime(row.startedAt || row.started_at) }}
                </td>
                <td class="text-xs text-base-content/70">
                  {{ formatDateTime(row.endedAt || row.ended_at) }}
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-ghost btn-xs text-primary gap-1"
                    title="Xem Gói Tin Của Session"
                    @click="viewSessionPackets(row)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    Xem Gói
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: Device Payload (ChirpStack Ingestion & Dynamic Sensor Telemetry) -->
    <div v-if="activeTab === 'device-payload'">
      <DevicePayloadPanel />
    </div>

    <!-- TAB: List Flow Simulation (Kịch Bản Mô Phỏng) -->
    <div v-if="activeTab === 'list-flow-simulation'">
      <ListFlowSimulationPanel @switch-tab="selectTab" />
    </div>

    <!-- TAB 3: Device Simulation (Giả Lập Thiết Bị & Tạo Flow) -->
    <div v-if="activeTab === 'device-simulation'">
      <DeviceSimulationPanel @packet-emitted="onDevicePacketEmitted" @switch-tab="selectTab" />
    </div>

    <!-- TAB: List Device Simulation (Danh Sách Thiết Bị Simulation) -->
    <div v-if="activeTab === 'list-device-simulation' || activeTab === 'simulation-devices'">
      <SimulationDevicesPanel @select-for-flow="onSelectDeviceForFlow" />
    </div>

    <!-- TAB: Create Device Testing (Tạo Kiểm Thử Thiết Bị) -->
    <div v-if="activeTab === 'create-device-testing'">
      <CreateDeviceTestPanel @select-tab="selectTab" />
    </div>

    <!-- TAB: List Device Testing (Danh Sách Thiết Bị Test) -->
    <div v-if="activeTab === 'list-device-testing'">
      <ListDeviceTestPanel ref="listDevicePanelRef" @switch-tab="selectTab" />
    </div>

    <!-- TAB: Device Test Batch (Kiểm Thử Hàng Loạt & Đối Chiếu Chuẩn) -->
    <div v-if="activeTab === 'test-batch' || activeTab === 'device-test-batch'">
      <DeviceTestBatchPanel :initial-batch-payload="selectedBatchPayload" @switch-tab="selectTab" />
    </div>

    <!-- TAB: Create Test Batch (Tạo Cấu Hình Test Batch) -->
    <div v-if="activeTab === 'create-test-batch'">
      <CreateTestBatchPanel @switch-tab="onSwitchTabWithPayload" />
    </div>

    <!-- TAB 4: Device Auto Check (Kiểm Tra Tự Động) -->
    <div v-if="activeTab === 'device-auto-check'">
      <DeviceAutoCheckPanel ref="autoCheckPanelRef" />
    </div>

    <!-- Dialog Chi Tiết Gói Tin Dual Payload -->
    <dialog class="modal" :class="{ 'modal-open': packetDetailVisible }">
      <div v-if="selectedPacket" class="modal-box w-11/12 max-w-3xl border border-base-content/10 bg-base-100 p-6">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-content/10">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <Radio class="w-5 h-5 text-primary" />
            Chi Tiết Gói Tin Dual Payload (Raw &amp; Decoded)
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="packetDetailVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4 text-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-base-200/50 p-3 rounded-lg border border-base-content/10 font-mono text-xs">
            <div>
              <span class="text-base-content/60 block">ID:</span>
              <span class="font-bold">{{ selectedPacket.id }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">DevEUI:</span>
              <span class="font-bold text-primary">{{ selectedPacket.devEui || selectedPacket.dev_eui || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Gateway ID:</span>
              <span>{{ selectedPacket.gatewayId || selectedPacket.gateway_id || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Loại Gói:</span>
              <span class="badge badge-xs" :class="getPacketTypeBadgeClass(selectedPacket.packetType || selectedPacket.packet_type)">
                {{ selectedPacket.packetType || selectedPacket.packet_type }}
              </span>
            </div>
            <div>
              <span class="text-base-content/60 block">FPort / FCnt:</span>
              <span>{{ selectedPacket.fPort ?? selectedPacket.f_port ?? '—' }} / {{ selectedPacket.fCnt ?? selectedPacket.f_cnt ?? '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">RSSI / SNR:</span>
              <span>{{ selectedPacket.rssi ?? '—' }} dBm / {{ selectedPacket.snr ?? '—' }} dB</span>
            </div>
            <div class="col-span-2">
              <span class="text-base-content/60 block">Thời Gian:</span>
              <span>{{ formatDateTime(selectedPacket.receivedAt || selectedPacket.received_at) }}</span>
            </div>
          </div>

          <div>
            <div class="font-semibold text-xs text-primary mb-1 flex items-center gap-1">
              <FileText class="w-3.5 h-3.5" /> Raw Payload (HEX / Base64)
            </div>
            <pre class="bg-base-300 text-base-content p-3 rounded font-mono text-xs overflow-x-auto border border-base-content/10">{{ selectedPacket.rawPayload || selectedPacket.raw_payload || 'Trống' }}</pre>
          </div>

          <div>
            <div class="font-semibold text-xs text-primary mb-1 flex items-center gap-1">
              <Binary class="w-3.5 h-3.5" /> Decoded Payload (JSONB)
            </div>
            <pre class="bg-base-300 text-base-content p-3 rounded font-mono text-xs overflow-x-auto border border-base-content/10 max-h-60">{{ JSON.stringify(selectedPacket.decodedPayload || selectedPacket.decoded_payload || {}, null, 2) }}</pre>
          </div>
        </div>

        <div class="modal-action border-t border-base-content/10 pt-3 mt-4">
          <button class="btn btn-sm" @click="packetDetailVisible = false">Đóng</button>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop" @click="packetDetailVisible = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Dialog Đăng Ký Gateway Testing & Tạo Phiên Mới -->
    <GatewayRegistrationModal
      v-model="createSessionDialogVisible"
      @success="handleGatewayRegistrationSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Gauge,
  Search,
  Plus,
  RefreshCw,
  Eye,
  FileText,
  Binary,
  Radio,
  Activity,
  X,
  Cpu,
  CheckCircle2,
  FlaskConical,
  List,
  Boxes,
  FolderPlus,
  Layers,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';
import GatewayRegistrationModal from '../components/GatewayRegistrationModal.vue';
import DeviceSimulationPanel from '../components/DeviceSimulationPanel.vue';
import DeviceAutoCheckPanel from '../components/DeviceAutoCheckPanel.vue';
import SimulationDevicesPanel from '../components/SimulationDevicesPanel.vue';
import CreateDeviceTestPanel from '../components/CreateDeviceTestPanel.vue';
import ListDeviceTestPanel from '../components/ListDeviceTestPanel.vue';
import CreateTestBatchPanel from '../components/CreateTestBatchPanel.vue';
import DeviceTestBatchPanel from '../components/DeviceTestBatchPanel.vue';
import DevicePayloadPanel from '../components/DevicePayloadPanel.vue';
import ListFlowSimulationPanel from '../components/ListFlowSimulationPanel.vue';

const route = useRoute();
const isIsolatedView = computed(() => route.query.from === 'menu' || route.query.isolated === 'true');
const router = useRouter();

const VALID_TABS = [
  'gateway-sessions',
  'device-payload',
  'create-device-testing',
  'list-device-testing',
  'test-batch',
  'device-test-batch',
  'create-test-batch',
  'list-flow-simulation',
  'device-simulation',
  'list-device-simulation',
  'simulation-devices',
  'simulation-flow',
  'device-auto-check',
];

const tabList = [
  { name: 'gateway-sessions', label: 'Gateway Test Sessions', icon: Activity },
  { name: 'device-payload', label: 'Device Payload (ChirpStack)', icon: Radio },
  { name: 'create-device-testing', label: 'Create Device Testing', icon: FlaskConical },
  { name: 'list-device-testing', label: 'List Device Testing', icon: List },
  { name: 'test-batch', label: 'Device Test Batch', icon: Boxes },
  { name: 'create-test-batch', label: 'Create Test Batch', icon: FolderPlus },
  { name: 'list-flow-simulation', label: 'List Flow Simulation', icon: Layers },
  { name: 'device-simulation', label: 'Device Simulation (Tạo Flow)', icon: Cpu },
  { name: 'list-device-simulation', label: 'List Device Simulation', icon: Radio },
  { name: 'device-auto-check', label: 'Device Auto Check (Tự Động)', icon: CheckCircle2 },
];

const activeTab = ref('gateway-sessions');
const loading = ref(false);
const autoCheckPanelRef = ref<any>(null);
const listDevicePanelRef = ref<any>(null);
const selectedBatchPayload = ref<any>(null);

function onSwitchTabWithPayload(tabName: string, payload?: any) {
  if (payload) {
    selectedBatchPayload.value = payload;
  }
  selectTab(tabName);
}

function normalizeTab(tabName: string): string {
  if (tabName === 'device-test-batch') return 'test-batch';
  if (tabName === 'simulation-devices') return 'list-device-simulation';
  if (tabName === 'simulation-flow') return 'list-flow-simulation';
  return tabName;
}

function selectTab(tabName: string) {
  const normalizedTab = normalizeTab(tabName);
  activeTab.value = normalizedTab;
  handleTabChange(normalizedTab);
  if (!isIsolatedView.value) {
    router.replace({ query: { ...route.query, tab: normalizedTab } }).catch(() => {});
  }
}

function onSelectDeviceForFlow(device?: any) {
  selectTab('device-simulation');
}

function onDevicePacketEmitted(packet: any) {
  if (autoCheckPanelRef.value?.handleIncomingPacket) {
    autoCheckPanelRef.value.handleIncomingPacket(packet);
  }
}

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

function handleGatewayRegistrationSuccess(createdSession: any) {
  loadGatewaySessions();
  if (createdSession?.gatewayId) {
    cyberToast.success(`Phiên test cho Gateway ${createdSession.gatewayId} đã được khởi tạo!`);
  }
}

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

function getStatusBadgeClass(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'badge-primary';
    case 'PASSED':
    case 'COMPLETED':
    case 'SUCCESS':
      return 'badge-success text-success-content';
    case 'FAILED':
    case 'ERROR':
      return 'badge-error text-error-content';
    case 'ABORTED':
    case 'STOPPED':
      return 'badge-warning text-warning-content';
    default:
      return 'badge-ghost';
  }
}

function getPacketTypeBadgeClass(type?: string) {
  switch ((type || '').toLowerCase()) {
    case 'uplink':
      return 'badge-success text-success-content';
    case 'downlink':
      return 'badge-primary text-primary-content';
    case 'join_request':
      return 'badge-warning text-warning-content';
    case 'ack':
      return 'badge-info text-info-content';
    case 'status':
      return 'badge-neutral';
    default:
      return 'badge-ghost';
  }
}

function handleTabChange(tab: string | number) {
  if (tab === 'gateway-sessions') {
    loadGatewaySessions();
  } else if (tab === 'list-device-testing') {
    listDevicePanelRef.value?.loadDevices?.();
  }
}

function refreshActiveTab() {
  if (activeTab.value === 'gateway-sessions') {
    loadGatewaySessions();
  } else if (activeTab.value === 'list-device-testing') {
    listDevicePanelRef.value?.loadDevices?.();
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
    cyberToast.error(err?.message || 'Không thể tải danh sách gói tin');
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
    cyberToast.error(err?.message || 'Không thể tải danh sách phiên test Gateway');
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

watch(() => route.query.tab, (tab) => {
  if (typeof tab === 'string' && VALID_TABS.includes(tab)) {
    activeTab.value = normalizeTab(tab);
    refreshActiveTab();
  }
});

onMounted(() => {
  const queryTab = route.query.tab as string;
  if (queryTab && VALID_TABS.includes(queryTab)) {
    activeTab.value = normalizeTab(queryTab);
  }
  if (route.query.networkId) {
    packetFilters.networkId = String(route.query.networkId);
  }
  refreshActiveTab();
});
</script>

<style scoped>
.testing-view {
  width: 100%;
}
</style>
