<template>
  <div class="list-flow-simulation-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Flow Simulation</span>
              <span class="badge badge-xs badge-neutral font-mono font-bold">{{ flowProfiles.length }} KỊCH BẢN</span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              List Flow Simulation (Danh Sách Kịch Bản Mô Phỏng)
            </h3>
            <p class="text-xs text-base-content/70">
              Quản lý các kịch bản kiểm thử mô phỏng chuỗi hàm (Function Blocks), thời lượng chạy và cấu hình RF/Payload cho Test Batch
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-ghost gap-1.5"
            :disabled="loading"
            @click="loadFlowProfiles"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <RefreshCw v-else class="w-3.5 h-3.5" />
            Làm Mới
          </button>
          <button
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            @click="$emit('switch-tab', 'device-simulation')"
          >
            <Plus class="w-4 h-4" />
            Tạo Flow Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative flex-1 min-w-[260px] max-w-md">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            v-model="searchQuery"
            type="text"
            class="input input-bordered input-sm w-full pl-9 text-xs bg-base-100 font-mono"
            placeholder="Tìm theo Mã Flow, Tên kịch bản, ITEM_CODE, SKU..."
          />
        </div>

        <div class="flex items-center gap-2 text-xs text-base-content/70 font-mono">
          <span>Tổng số: <strong class="text-base-content">{{ flowProfiles.length }}</strong></span>
          <span>|</span>
          <span>Khớp bộ lọc: <strong class="text-primary">{{ filteredFlows.length }}</strong></span>
        </div>
      </div>
    </div>

    <!-- Flow Profiles Table -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="overflow-x-auto rounded-lg border border-base-300 bg-base-100">
        <table class="table table-sm table-zebra w-full">
          <thead class="bg-base-200/80 font-mono text-xs uppercase text-base-content/70">
            <tr>
              <th class="w-10 text-center">#</th>
              <th>Mã Kịch Bản (Simu ID)</th>
              <th>Tên Kịch Bản</th>
              <th>ITEM-CODE / SKU</th>
              <th>FW Version</th>
              <th>Số Blocks &amp; Thời Lượng</th>
              <th>Loại Kết Nối</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="font-mono text-xs">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="8" class="text-center py-10 text-base-content/60">
                <span class="loading loading-spinner loading-md text-primary"></span>
                <p class="mt-2 text-xs">Đang tải danh sách kịch bản mô phỏng...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredFlows.length === 0">
              <td colspan="8" class="text-center py-12 text-base-content/60">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Layers class="w-8 h-8 text-base-content/30" />
                  <p class="text-sm font-semibold">Chưa có kịch bản Flow Simulation nào</p>
                  <p class="text-xs text-base-content/50 max-w-sm">
                    Nhấn nút "Tạo Flow Mới" để thiết lập kịch bản hàm chức năng và gửi dữ liệu thử nghiệm.
                  </p>
                  <button
                    class="btn btn-sm btn-primary mt-2 gap-1.5"
                    @click="$emit('switch-tab', 'device-simulation')"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    Tạo Kịch Bản Mới
                  </button>
                </div>
              </td>
            </tr>

            <!-- Flow Row Items -->
            <tr
              v-for="(flow, idx) in filteredFlows"
              :key="flow.id || flow.simuId || idx"
              class="hover group"
            >
              <!-- Index -->
              <td class="text-center text-base-content/40">{{ idx + 1 }}</td>

              <!-- Simu ID -->
              <td>
                <div class="font-bold text-primary flex items-center gap-1.5">
                  <span>{{ flow.simuId || flow.id || '—' }}</span>
                </div>
              </td>

              <!-- Profile Name -->
              <td>
                <div class="font-semibold text-base-content max-w-xs truncate" :title="flow.profileName || flow.name">
                  {{ flow.profileName || flow.name || 'Kịch bản chưa đặt tên' }}
                </div>
                <div v-if="flow.description" class="text-[11px] text-base-content/60 truncate max-w-xs">
                  {{ flow.description }}
                </div>
              </td>

              <!-- ITEM_CODE & SKU -->
              <td>
                <div class="flex items-center gap-1">
                  <span class="badge badge-sm badge-neutral font-bold border-base-300">
                    {{ flow.itemCode || flow.item_code || '—' }}
                  </span>
                </div>
                <div v-if="flow.sku" class="text-[10px] text-base-content/50 truncate max-w-[130px]" :title="flow.sku">
                  {{ flow.sku }}
                </div>
              </td>

              <!-- FW Version -->
              <td>
                <span class="text-base-content/80">
                  {{ flow.longFw || flow.long_fw || flow.fwVersion || '—' }}
                </span>
              </td>

              <!-- Blocks & Duration -->
              <td>
                <div class="flex items-center gap-2">
                  <span class="badge badge-xs badge-primary font-bold">
                    {{ (flow.flowBlocks || flow.blocks || []).length || (flow.blocksCount ?? 0) }} BLOCKS
                  </span>
                  <span class="text-base-content/70 flex items-center gap-1">
                    <Clock class="w-3 h-3 text-base-content/40" />
                    {{ getDurationDisplay(flow) }}
                  </span>
                </div>
              </td>

              <!-- Sensor Connectivity / Protocol -->
              <td>
                <span class="badge badge-xs badge-outline">
                  {{ flow.sensorConnectivity || flow.protocol || 'LoRaWAN' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="btn btn-ghost btn-xs text-primary gap-1"
                    title="Xem Chi Tiết Blocks"
                    @click="viewFlowDetails(flow)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    Blocks
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-success gap-1"
                    title="Sử Dụng Cho Test Batch"
                    @click="useInBatch(flow)"
                  >
                    <FolderPlus class="w-3.5 h-3.5" />
                    Batch
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error p-1"
                    title="Xóa Kịch Bản"
                    @click="confirmDeleteFlow(flow)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Chi Tiết Function Blocks -->
    <dialog class="modal" :class="{ 'modal-open': showDetailModal }">
      <div class="modal-box bg-base-100 border border-base-300 max-w-2xl p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-300">
          <div class="flex items-center gap-2">
            <Layers class="w-5 h-5 text-primary" />
            <div>
              <h3 class="font-bold text-sm uppercase">Chi Tiết Function Blocks</h3>
              <p class="text-xs text-base-content/60 font-mono">
                {{ selectedFlow?.simuId || selectedFlow?.id }} &bull; {{ selectedFlow?.profileName || selectedFlow?.name }}
              </p>
            </div>
          </div>
          <button type="button" class="btn btn-xs btn-circle btn-ghost" @click="showDetailModal = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div v-if="selectedFlow" class="space-y-4">
          <!-- Overview Cards -->
          <div class="grid grid-cols-3 gap-2">
            <div class="p-2.5 rounded-lg bg-base-200 border border-base-300 text-xs">
              <span class="text-base-content/60 block text-[10px] uppercase font-bold">ITEM-CODE</span>
              <strong class="font-mono text-primary">{{ selectedFlow.itemCode || selectedFlow.item_code || '—' }}</strong>
            </div>
            <div class="p-2.5 rounded-lg bg-base-200 border border-base-300 text-xs">
              <span class="text-base-content/60 block text-[10px] uppercase font-bold">Tổng Thời Lượng</span>
              <strong class="font-mono text-base-content">{{ getDurationDisplay(selectedFlow) }}</strong>
            </div>
            <div class="p-2.5 rounded-lg bg-base-200 border border-base-300 text-xs">
              <span class="text-base-content/60 block text-[10px] uppercase font-bold">FW Version</span>
              <strong class="font-mono text-base-content">{{ selectedFlow.longFw || selectedFlow.fwVersion || '—' }}</strong>
            </div>
          </div>

          <!-- Function Blocks List -->
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-base-content/80 mb-2 flex items-center justify-between">
              <span>Danh Sách Blocks Trong Quy Trình</span>
              <span class="badge badge-xs badge-neutral font-mono">
                {{ getBlocksList(selectedFlow).length }} blocks
              </span>
            </div>

            <div v-if="getBlocksList(selectedFlow).length === 0" class="text-center py-6 text-xs text-base-content/50 border border-dashed border-base-300 rounded-lg">
              Kịch bản chưa cấu hình chi tiết các khối function block.
            </div>

            <div v-else class="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              <div
                v-for="(block, bIdx) in getBlocksList(selectedFlow)"
                :key="block.id || bIdx"
                class="p-2.5 rounded-lg border border-base-300 bg-base-200/50 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">
                    {{ bIdx + 1 }}
                  </span>
                  <div>
                    <div class="font-semibold text-base-content">{{ block.name || block.type || `Block ${bIdx + 1}` }}</div>
                    <div class="text-[10px] text-base-content/60 font-mono">
                      Type: <span class="badge badge-xs badge-ghost">{{ block.type }}</span>
                      <span v-if="block.targetDevice"> &bull; Target: {{ block.targetDevice }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 text-[11px] font-mono">
                  <div v-if="block.payloadHex" class="text-base-content/70">
                    Payload: <code class="text-primary">{{ block.payloadHex }}</code>
                  </div>
                  <div class="badge badge-sm badge-outline">
                    {{ block.estimatedSeconds || block.duration || 10 }}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action pt-3 mt-4 border-t border-base-300 flex justify-between">
          <button
            class="btn btn-sm btn-primary gap-1.5"
            @click="useInBatch(selectedFlow); showDetailModal = false"
          >
            <FolderPlus class="w-3.5 h-3.5" />
            Sử Dụng Cho Test Batch Này
          </button>
          <button type="button" class="btn btn-sm btn-ghost" @click="showDetailModal = false">
            Đóng
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Clock,
  Eye,
  Trash2,
  FolderPlus,
  X,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

const emit = defineEmits<{
  (e: 'switch-tab', tabName: string, payload?: any): void;
}>();

const loading = ref(false);
const flowProfiles = ref<any[]>([]);
const searchQuery = ref('');

// Modal state
const showDetailModal = ref(false);
const selectedFlow = ref<any>(null);

const filteredFlows = computed(() => {
  if (!searchQuery.value.trim()) return flowProfiles.value;
  const q = searchQuery.value.toLowerCase().trim();
  return flowProfiles.value.filter((f) => {
    const id = (f.simuId || f.id || '').toLowerCase();
    const name = (f.profileName || f.name || '').toLowerCase();
    const item = (f.itemCode || f.item_code || '').toLowerCase();
    const sku = (f.sku || '').toLowerCase();
    const fw = (f.longFw || f.long_fw || f.fwVersion || '').toLowerCase();
    return id.includes(q) || name.includes(q) || item.includes(q) || sku.includes(q) || fw.includes(q);
  });
});

function getDurationDisplay(flow: any): string {
  if (flow.durationSeconds) return `${flow.durationSeconds}s`;
  if (flow.flowDurationMinutes) return `${flow.flowDurationMinutes * 60}s`;
  if (flow.flowDurationSeconds) return `${flow.flowDurationSeconds}s`;
  if (flow.duration) return `${flow.duration}s`;

  // Calculate from blocks if available
  const blocks = getBlocksList(flow);
  if (blocks.length > 0) {
    const total = blocks.reduce((acc: number, b: any) => acc + (Number(b.estimatedSeconds || b.duration) || 10), 0);
    return `${total}s`;
  }
  return '300s';
}

function getBlocksList(flow: any): any[] {
  if (!flow) return [];
  if (Array.isArray(flow.flowBlocks)) return flow.flowBlocks;
  if (Array.isArray(flow.blocks)) return flow.blocks;
  if (Array.isArray(flow.timedActions)) {
    return flow.timedActions.map((a: any) => ({
      id: a.id,
      name: a.label || a.actionType,
      type: a.actionType || 'downlink',
      payloadHex: a.payloadHex,
      estimatedSeconds: (a.triggerMinute || 1) * 60,
    }));
  }
  return [];
}

async function loadFlowProfiles() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/simulation/profiles');
    const items = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) {
      flowProfiles.value = items;
    } else {
      loadFallbackProfiles();
    }
  } catch (err: any) {
    console.debug('[ListFlowSimulationPanel] Error loading profiles, using fallbacks:', err.message);
    loadFallbackProfiles();
  } finally {
    loading.value = false;
  }
}

function loadFallbackProfiles() {
  const cached = localStorage.getItem('itest_simulation_profiles');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        flowProfiles.value = parsed;
        return;
      }
    } catch {}
  }

  // Built-in presets
  flowProfiles.value = [
    {
      id: 'SIMU-WSSFC-ATH-1.0.4',
      simuId: 'SIMU-WSSFC-ATH-1.0.4',
      name: 'ATH Standard 5-Min Uplink Flow',
      profileName: 'ATH Standard 5-Min Uplink Flow',
      itemCode: 'WSSFC-ATH',
      longFw: '1.0.4',
      duration: 300,
      description: 'Khởi động thiết bị, thực hiện OTAA Join trong 30s và gửi gói tin định kỳ 60s/lần.',
      flowBlocks: [
        { id: 'b1', name: 'Khởi tạo RF AU915', type: 'rf_init', estimatedSeconds: 30 },
        { id: 'b2', name: 'OTAA Join Request', type: 'otaa_join', estimatedSeconds: 30 },
        { id: 'b3', name: 'Chu kỳ Uplink 60s', type: 'uplink_loop', estimatedSeconds: 180 },
        { id: 'b4', name: 'Payload Telemetry', type: 'sensor_telemetry', estimatedSeconds: 60, payloadHex: '01017F02' },
      ],
    },
    {
      id: 'SIMU-WSLRW-FULL-10M',
      simuId: 'SIMU-WSLRW-FULL-10M',
      name: 'LoRaWAN Full Stress Test 10 Phút',
      profileName: 'LoRaWAN Full Stress Test 10 Phút',
      itemCode: 'WSLRW-STRESS',
      longFw: '2.0.1',
      duration: 600,
      description: 'Mô phỏng đa gói tin với thay đổi giá trị cảm biến biên trên nhiều kênh tần số.',
      flowBlocks: [
        { id: 'b1', name: 'Init Class A', type: 'rf_init', estimatedSeconds: 30 },
        { id: 'b2', name: 'Join OTAA', type: 'otaa_join', estimatedSeconds: 30 },
        { id: 'b3', name: 'Uplink Burst', type: 'uplink_loop', estimatedSeconds: 240 },
        { id: 'b4', name: 'Downlink Ack', type: 'downlink_ack', estimatedSeconds: 60, payloadHex: 'FF00' },
        { id: 'b5', name: 'Sensor Delta Shift', type: 'sensor_telemetry', estimatedSeconds: 180, payloadHex: '0204A1B2' },
        { id: 'b6', name: 'Final Status', type: 'status_report', estimatedSeconds: 60 },
      ],
    },
    {
      id: 'SIMU-RAPID-BURST-3M',
      simuId: 'SIMU-RAPID-BURST-3M',
      name: 'Rapid Telemetry Check 3 Phút',
      profileName: 'Rapid Telemetry Check 3 Phút',
      itemCode: 'RAPID-TEST',
      longFw: '1.0.0',
      duration: 180,
      description: 'Kiểm tra nhanh phản hồi cảm biến và giải mã Dual Payload.',
      flowBlocks: [
        { id: 'b1', name: 'Init Device', type: 'rf_init', estimatedSeconds: 20 },
        { id: 'b2', name: 'Fast Join', type: 'otaa_join', estimatedSeconds: 30 },
        { id: 'b3', name: 'Continuous 30s Uplink', type: 'uplink_loop', estimatedSeconds: 130, payloadHex: 'AA5501' },
      ],
    },
  ];
}

function viewFlowDetails(flow: any) {
  selectedFlow.value = flow;
  showDetailModal.value = true;
}

function useInBatch(flow: any) {
  emit('switch-tab', 'create-test-batch', {
    selectedFlowId: flow.simuId || flow.id,
    flowItemCode: flow.itemCode || flow.item_code,
    flowFwVersion: flow.longFw || flow.long_fw || flow.fwVersion,
  });
  cyberToast.info(`Đã chọn kịch bản ${flow.profileName || flow.simuId} cho Test Batch!`);
}

async function confirmDeleteFlow(flow: any) {
  const name = flow.profileName || flow.simuId || flow.id;
  if (!confirm(`Bạn có chắc chắn muốn xóa kịch bản "${name}" không?`)) {
    return;
  }

  const id = flow.id || flow.simuId;
  try {
    await httpClient.delete(`/plugins/testing/simulation/profiles/${id}`);
  } catch (err: any) {
    console.debug('[ListFlowSimulationPanel] Backend delete failed or fallback:', err.message);
  }

  flowProfiles.value = flowProfiles.value.filter((f) => (f.id || f.simuId) !== id);
  cyberToast.success(`Đã xóa kịch bản ${name}`);
}

onMounted(() => {
  loadFlowProfiles();
});
</script>

<style scoped>
.list-flow-simulation-panel {
  width: 100%;
}
</style>
