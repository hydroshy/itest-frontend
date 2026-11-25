<template>
  <div class="list-gateway-test-panel space-y-4 w-full">
    <!-- Top Filter & Control Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Title & Count -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Radio class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content flex items-center gap-2">
              <span>LIST GATEWAY TESTING</span>
              <span class="badge badge-sm badge-primary font-mono text-[11px]">
                {{ totalItems }} Gateways
              </span>
            </h3>
            <p class="text-xs text-base-content/60">
              Danh sách Gateway đã đăng ký kiểm thử và các phiên đo kiểm kết nối ChirpStack
            </p>
          </div>
        </div>

        <!-- Controls: Search, Filter, Actions -->
        <div class="flex items-center gap-2 flex-wrap ml-auto">
          <!-- Search box -->
          <div class="relative w-48 sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder=""
              class="input input-sm input-bordered bg-base-100 pl-8 w-full text-xs font-mono"
              @keyup.enter="loadSessions(1)"
            />
            <button
              v-if="searchTerm"
              class="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2 text-base-content/50"
              @click="searchTerm = ''; loadSessions(1)"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="select select-bordered select-sm text-xs font-semibold"
            @change="loadSessions(1)"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="RUNNING">RUNNING (Đang chạy)</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
            <option value="FAILED">FAILED (Thất bại)</option>
          </select>

          <!-- Refresh button -->
          <button
            type="button"
            class="btn btn-sm btn-outline btn-square"
            :disabled="loading"
            title="Làm mới danh sách"
            @click="loadSessions(currentPage)"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <RefreshCw v-else class="w-3.5 h-3.5" />
          </button>

          <!-- Chuyển sang Create Gateway Testing -->
          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 font-bold"
            @click="emit('switch-tab', 'create-gateway-testing')"
          >
            <Plus class="w-4 h-4" />
            Tạo Gateway Mới
          </button>

          <!-- Chuyển sang Gateway Test Batch -->
          <button
            type="button"
            class="btn btn-sm btn-secondary gap-1.5 font-bold"
            @click="emit('switch-tab', 'gateway-test-batch')"
          >
            <Boxes class="w-4 h-4" />
            Gateway Test Batch
          </button>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="overflow-x-auto relative min-h-[300px]">
        <div v-if="loading" class="absolute inset-0 bg-base-100/60 backdrop-blur-xs flex items-center justify-center z-10">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>

        <table class="table table-zebra table-sm w-full">
          <thead>
            <tr class="text-xs uppercase bg-base-200/50">
              <th>Gateway EUI / Serial</th>
              <th>SO Number / WA / Item</th>
              <th>IP Gateway / Port</th>
              <th>Băng Tần / Mạng</th>
              <th class="text-center">Trạng Thái</th>
              <th>Thống Kê Gói Uplink</th>
              <th>Bắt Đầu</th>
              <th>Kết Thúc</th>
              <th class="text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sessionList.length === 0 && !loading">
              <td colspan="9" class="text-center py-10 text-base-content/50 italic">
                Chưa có Gateway hoặc phiên test nào. Nhấn <b>"Tạo Gateway Mới"</b> để bắt đầu.
              </td>
            </tr>
            <tr v-for="row in sessionList" :key="row.id" class="hover text-xs">
              <td>
                <div class="font-mono font-bold text-primary text-xs">{{ row.gateway_id || row.gatewayId || row.eui || '—' }}</div>
                <div v-if="row.serial_number || row.serialNumber" class="text-[11px] text-base-content/70">
                  SN: <span class="font-mono text-warning font-semibold">{{ row.serial_number || row.serialNumber }}</span>
                </div>
                <div v-if="row.model_name || row.hardware_specs?.modelName" class="text-[10px] text-base-content/50">
                  {{ row.model_name || row.hardware_specs?.modelName }}
                </div>
              </td>
              <td>
                <div class="font-mono font-bold text-base-content">{{ row.so_number || row.soNumber || '—' }}</div>
                <div class="text-[11px] text-base-content/70">WA: {{ row.wa_number || row.waNumber || '—' }}</div>
                <div v-if="row.item_code || row.itemCode" class="text-[10px] font-mono text-primary">
                  [{{ row.item_code || row.itemCode }}]
                </div>
              </td>
              <td>
                <div class="font-mono font-semibold">{{ row.gateway_ip || row.gatewayIp || '—' }}:4050</div>
                <div class="text-[10px] text-base-content/50">{{ row.internet_test_type || row.internetTestType || 'ETHERNET' }}</div>
              </td>
              <td>
                <span class="badge badge-xs font-mono font-bold" :class="row.region_test === 'EU868' || row.regionTest === 'EU868' ? 'badge-primary' : 'badge-neutral'">
                  {{ row.region_test || row.regionTest || 'AS923' }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge badge-sm font-mono font-bold" :class="getStatusBadgeClass(row.status)">
                  {{ row.status || 'UNKNOWN' }}
                </span>
              </td>
              <td>
                <div class="font-mono text-xs">
                  Tổng gói: <b class="text-primary">{{ row.total_packets ?? row.totalPackets ?? row.summary?.uplink_count ?? 0 }}</b>
                </div>
                <div class="text-[10px] text-base-content/60">
                  Uplink: {{ row.uplink_packets ?? row.uplinkPackets ?? row.summary?.uplink_count ?? 0 }}
                  <span v-if="row.summary?.rssi"> | RSSI: {{ row.summary.rssi }} dBm</span>
                </div>
              </td>
              <td class="font-mono text-[11px]">
                {{ formatDateTime(row.started_at || row.startedAt || row.created_at) }}
              </td>
              <td class="font-mono text-[11px]">
                {{ formatDateTime(row.ended_at || row.endedAt || row.completed_at) || '—' }}
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-primary"
                    title="Xem chi tiết"
                    @click="viewDetail(row)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-secondary"
                    title="Đưa vào Gateway Test Batch"
                    @click="addToBatch(row)"
                  >
                    <Boxes class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between pt-3 border-t border-base-content/10 mt-3 text-xs">
        <span class="text-base-content/60">
          Trang {{ currentPage }} / {{ totalPages }} (Tổng {{ totalItems }} bản ghi)
        </span>
        <div class="join">
          <button
            type="button"
            class="join-item btn btn-xs"
            :disabled="currentPage <= 1"
            @click="loadSessions(currentPage - 1)"
          >
            Trước
          </button>
          <button
            type="button"
            class="join-item btn btn-xs"
            :disabled="currentPage >= totalPages"
            @click="loadSessions(currentPage + 1)"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Session -->
    <dialog class="modal" :class="{ 'modal-open': detailModalVisible }">
      <div v-if="selectedSession" class="modal-box w-11/12 max-w-2xl border border-base-content/10 bg-base-100 p-5">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-base flex items-center gap-2">
            <Radio class="w-5 h-5 text-primary" />
            Chi Tiết Gateway Test Session: {{ selectedSession.gateway_id || selectedSession.gatewayId }}
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="detailModalVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-base-200/60 p-3 rounded-lg font-mono">
            <div>
              <span class="text-base-content/60 block">Serial Number:</span>
              <span class="font-bold text-warning">{{ selectedSession.serial_number || selectedSession.serialNumber || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">SO Number:</span>
              <span class="font-bold">{{ selectedSession.so_number || selectedSession.soNumber || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">WA Number:</span>
              <span class="font-bold">{{ selectedSession.wa_number || selectedSession.waNumber || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Item Code:</span>
              <span class="font-bold text-primary">{{ selectedSession.item_code || selectedSession.itemCode || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">IP Gateway:</span>
              <span>{{ selectedSession.gateway_ip || selectedSession.gatewayIp || '—' }}:4050</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Băng Tần:</span>
              <span>{{ selectedSession.region_test || selectedSession.regionTest || '—' }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Trạng Thái:</span>
              <span class="badge badge-xs font-bold" :class="getStatusBadgeClass(selectedSession.status)">
                {{ selectedSession.status }}
              </span>
            </div>
            <div>
              <span class="text-base-content/60 block">Tổng Gói:</span>
              <span class="font-bold text-primary">{{ selectedSession.total_packets ?? selectedSession.totalPackets ?? 0 }}</span>
            </div>
          </div>

          <div v-if="selectedSession.hardware_specs" class="space-y-1">
            <div class="font-bold text-primary">Thông Số Phần Cứng</div>
            <pre class="bg-base-200/80 p-2 rounded text-[11px] font-mono overflow-x-auto">{{ JSON.stringify(selectedSession.hardware_specs, null, 2) }}</pre>
          </div>

          <div v-if="selectedSession.summary" class="space-y-1">
            <div class="font-bold text-primary">Thống Kê Đo Kiểm (Summary)</div>
            <pre class="bg-base-200/80 p-2 rounded text-[11px] font-mono overflow-x-auto">{{ JSON.stringify(selectedSession.summary, null, 2) }}</pre>
          </div>
        </div>

        <div class="modal-action border-t border-base-content/10 pt-3 mt-4">
          <button type="button" class="btn btn-sm btn-ghost" @click="detailModalVisible = false">Đóng</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="detailModalVisible = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Radio, Search, Plus, Boxes, RefreshCw, Eye, X } from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

const sessionList = ref<any[]>([]);
const loading = ref(false);
const searchTerm = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

const detailModalVisible = ref(false);
const selectedSession = ref<any>(null);

function getStatusBadgeClass(status?: string): string {
  switch (status?.toUpperCase()) {
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'badge-warning text-warning-content animate-pulse';
    case 'COMPLETED':
    case 'PASS':
      return 'badge-success text-success-content';
    case 'FAILED':
    case 'FAIL':
      return 'badge-error text-error-content';
    default:
      return 'badge-ghost';
  }
}

function formatDateTime(val?: string | Date): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function loadSessions(page: number = 1) {
  loading.value = true;
  currentPage.value = page;
  try {
    const res: any = await httpClient.get('/plugins/testing/gateway-sessions', {
      params: {
        page,
        limit: 20,
        gatewayId: searchTerm.value || undefined,
        status: statusFilter.value || undefined,
      },
    });
    const items = Array.isArray(res) ? res : res?.data || [];
    sessionList.value = items;
    totalItems.value = res?.total ?? items.length;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / 20));
  } catch (err: any) {
    console.warn('Load gateway sessions error:', err);
    cyberToast.error('Không thể tải danh sách phiên test Gateway.');
  } finally {
    loading.value = false;
  }
}

function viewDetail(session: any) {
  selectedSession.value = session;
  detailModalVisible.value = true;
}

function addToBatch(session: any) {
  emit('switch-tab', 'gateway-test-batch', {
    selectedGateway: session,
  });
}

onMounted(() => {
  loadSessions(1);
});
</script>
