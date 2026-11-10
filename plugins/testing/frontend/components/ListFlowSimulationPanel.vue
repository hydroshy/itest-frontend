<template>
  <div class="list-flow-simulation-panel space-y-4">
    <!-- Top Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">Testing Automation</span>
              <span class="badge badge-primary badge-xs font-mono font-bold">{{ flowProfiles.length }} KỊCH BẢN</span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              Danh Sách Kịch Bản Simulation (Flow Profiles)
            </h3>
            <p class="text-xs text-base-content/70">
              Quản lý các quy trình function blocks tự động (Downlink, Clear Downlink FlushQueue, Delay) cho thiết bị thử nghiệm và liên kết Test Batch
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-ghost gap-1.5"
            :disabled="loading"
            @click="loadFlowProfiles"
          >
            <RotateCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            Làm Mới
          </button>

          <button
            class="btn btn-sm btn-primary gap-1.5"
            @click="$emit('switch-tab', 'device-simulation')"
          >
            <Plus class="w-3.5 h-3.5" />
            Tạo Flow Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="card bg-base-200 border border-base-300 rounded-xl p-3 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="join w-full max-w-sm">
          <span class="join-item btn btn-sm btn-ghost pointer-events-none text-base-content/50">
            <Search class="w-4 h-4" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo Simu ID, tên, ITEM_CODE, FW..."
            class="input input-sm input-bordered join-item w-full font-mono text-xs"
          />
        </div>
      </div>
    </div>

    <!-- Flows Table -->
    <div class="card bg-base-200 border border-base-300 rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <thead class="bg-base-200/80 font-mono text-xs uppercase text-base-content/70">
            <tr>
              <th class="w-10 text-center">#</th>
              <th>Mã Kịch Bản (Simu ID)</th>
              <th>Tên Kịch Bản</th>
              <th>ITEM-CODE / SKU</th>
              <th>FW Version</th>
              <th>Số Blocks &amp; AutoCheck</th>
              <th>Thiết Bị Tham Chiếu</th>
              <th>Loại Kết Nối</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="font-mono text-xs">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="9" class="text-center py-10 text-base-content/60">
                <span class="loading loading-spinner loading-md text-primary"></span>
                <p class="mt-2 text-xs">Đang tải danh sách kịch bản mô phỏng...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredFlows.length === 0">
              <td colspan="9" class="text-center py-12 text-base-content/60">
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
                    Tạo Flow Mới
                  </button>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="(flow, idx) in filteredFlows"
              :key="flow.id || flow.simuId || idx"
              class="hover transition-colors"
            >
              <td class="text-center font-bold text-base-content/50">{{ idx + 1 }}</td>

              <!-- Simu ID -->
              <td>
                <div class="font-bold text-primary">{{ flow.simuId || flow.id }}</div>
                <div class="text-[10px] text-base-content/50">{{ flow.createdAt || 'Mới tạo' }}</div>
              </td>

              <!-- Profile Name -->
              <td>
                <div class="font-semibold text-base-content flex items-center gap-1.5">
                  <span>{{ flow.profileName || flow.name || 'Kịch bản không tên' }}</span>
                  <span v-if="hasRefDeviceInFlow(flow)" class="badge badge-warning badge-xs font-mono">
                    CẦN REF
                  </span>
                </div>
                <div class="text-[10px] text-base-content/60 line-clamp-1">
                  {{ flow.description || 'Quy trình kiểm tra tự động function blocks' }}
                </div>
              </td>

              <!-- Item Code / SKU -->
              <td>
                <div class="badge badge-sm badge-outline font-bold">
                  {{ flow.itemCode || flow.item_code || '--' }}
                </div>
                <div v-if="flow.sku" class="text-[10px] text-base-content/60 font-mono mt-0.5">
                  SKU: {{ flow.sku }}
                </div>
              </td>

              <!-- FW Version -->
              <td>
                <span class="badge badge-sm font-mono" :class="flow.longFw ? 'badge-neutral' : 'badge-ghost'">
                  {{ flow.longFw || flow.long_fw || flow.fwVersion || '--' }}
                </span>
              </td>

              <!-- Blocks & AutoCheck -->
              <td>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="badge badge-sm badge-primary font-bold">
                    {{ getBlocksList(flow).length }} blocks
                  </span>
                  <span v-if="flow.autoCheckCriteria || flow.autocheckId" class="badge badge-xs badge-success font-mono font-bold">
                    ✓ AUTOCHECK
                  </span>
                  <span class="text-[11px] text-base-content/70 flex items-center gap-1 font-semibold">
                    <Clock class="w-3 h-3 text-warning" />
                    {{ getDurationDisplay(flow) }}
                  </span>
                </div>
              </td>

              <!-- Reference Devices -->
              <td>
                <span v-if="flow.referenceDevices?.length" class="badge badge-xs badge-warning font-mono">
                  {{ flow.referenceDevices.length }} tham chiếu
                </span>
                <span v-else class="text-base-content/40 text-[11px] italic">
                  Trống
                </span>
              </td>

              <!-- Connectivity -->
              <td>
                <span class="badge badge-xs badge-outline">
                  {{ flow.sensorConnectivity || flow.protocol || 'LoRaWAN' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="btn btn-ghost btn-xs text-info gap-1"
                    title="Chỉnh Sửa Kịch Bản"
                    @click="openEditFlowModal(flow)"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                    Sửa
                  </button>
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
          <button class="btn btn-sm btn-circle btn-ghost" @click="showDetailModal = false">✕</button>
        </div>

        <div v-if="selectedFlow" class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div class="p-2.5 bg-base-200 rounded-lg">
              <span class="text-base-content/60 block text-[10px]">ITEM-CODE</span>
              <span class="font-bold text-primary">{{ selectedFlow.itemCode || selectedFlow.item_code || '--' }}</span>
            </div>
            <div class="p-2.5 bg-base-200 rounded-lg">
              <span class="text-base-content/60 block text-[10px]">FW VERSION</span>
              <span class="font-bold">{{ selectedFlow.longFw || selectedFlow.long_fw || selectedFlow.fwVersion || '--' }}</span>
            </div>
            <div class="p-2.5 bg-base-200 rounded-lg">
              <span class="text-base-content/60 block text-[10px]">TỔNG THỜI LƯỢNG</span>
              <span class="font-bold text-warning">{{ getDurationDisplay(selectedFlow) }}</span>
            </div>
            <div class="p-2.5 bg-base-200 rounded-lg">
              <span class="text-base-content/60 block text-[10px]">SỐ BLOCKS</span>
              <span class="font-bold">{{ getBlocksList(selectedFlow).length }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold uppercase text-base-content/80 mb-2">Danh Sách Các Khối Hàm Tuần Tự:</h4>
            <div v-if="getBlocksList(selectedFlow).length === 0" class="text-xs text-base-content/50 italic py-4 text-center">
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
                    <div class="font-semibold text-base-content">{{ getFunctionLabel(block.functionType || block.type) }}</div>
                    <div class="text-[10px] text-base-content/60 font-mono">
                      Target: <span class="badge badge-xs font-bold" :class="block.targetDevice === 'REF' ? 'badge-warning' : 'badge-ghost'">{{ block.targetDevice || 'DUT' }}</span>
                      <span v-if="block.fPort || block.fport"> &bull; FPort: {{ block.fPort || block.fport }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 text-[11px] font-mono">
                  <div v-if="block.payloadHex || block.payload" class="text-base-content/70">
                    Payload: <code class="text-primary font-bold">{{ block.payloadHex || block.payload }}</code>
                  </div>
                  <div v-if="block.functionType === 'delay' || block.type === 'delay'" class="badge badge-sm badge-accent">
                    Chờ {{ block.delaySeconds || block.duration_seconds || block.duration || 0 }}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-sm btn-ghost" @click="showDetailModal = false">Đóng</button>
          <button
            class="btn btn-sm btn-info gap-1"
            @click="showDetailModal = false; openEditFlowModal(selectedFlow)"
          >
            <Edit3 class="w-3.5 h-3.5" />
            Chỉnh Sửa
          </button>
          <button
            class="btn btn-sm btn-success gap-1.5"
            @click="useInBatch(selectedFlow); showDetailModal = false;"
          >
            <FolderPlus class="w-3.5 h-3.5" />
            Chọn Cho Test Batch
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showDetailModal = false">close</button>
      </form>
    </dialog>

    <!-- Modal: Chỉnh Sửa Flow Simulation -->
    <dialog class="modal" :class="{ 'modal-open': showEditModal }">
      <div class="modal-box bg-base-100 border border-base-300 max-w-4xl p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-300">
          <div class="flex items-center gap-2">
            <Edit3 class="w-5 h-5 text-info" />
            <div>
              <h3 class="font-bold text-sm uppercase">Chỉnh Sửa Kịch Bản Flow Simulation</h3>
              <p class="text-xs text-base-content/60 font-mono">
                {{ editFlowForm.simuId }} &bull; Cập nhật quy trình 3 hàm chuẩn
              </p>
            </div>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" @click="showEditModal = false">✕</button>
        </div>

        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <!-- Thông tin cơ bản -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold">Tên Kịch Bản</span>
              </label>
              <input
                v-model="editFlowForm.profileName"
                type="text"
                class="input input-sm input-bordered w-full text-xs"
                placeholder="Nhập tên kịch bản..."
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold">ITEM-CODE</span>
              </label>
              <input
                v-model="editFlowForm.itemCode"
                type="text"
                class="input input-sm input-bordered w-full font-mono text-xs uppercase"
                placeholder="VD: WSLRW-01"
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold">FW Version</span>
              </label>
              <input
                v-model="editFlowForm.longFw"
                type="text"
                class="input input-sm input-bordered w-full font-mono text-xs uppercase"
                placeholder="VD: 1F0001"
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold">Loại Kết Nối</span>
              </label>
              <select
                v-model="editFlowForm.sensorConnectivity"
                class="select select-sm select-bordered w-full text-xs font-mono"
              >
                <option value="LoRaWAN">LoRaWAN</option>
                <option value="Sigfox">Sigfox</option>
              </select>
            </div>
          </div>

          <!-- Function Blocks Builder -->
          <div class="pt-2">
            <SimulationFlowBuilder
              v-model="editFlowBlocks"
              :reference-devices="selectedFlow?.reference_devices || selectedFlow?.referenceDevices"
              :dut-name="editFlowForm.profileName || editFlowForm.itemCode || 'DUT'"
            />
          </div>
        </div>

        <div class="modal-action pt-3 border-t border-base-300">
          <button class="btn btn-sm btn-ghost" :disabled="savingEdit" @click="showEditModal = false">Hủy</button>
          <button
            class="btn btn-sm btn-primary gap-1.5"
            :disabled="savingEdit"
            @click="submitEditFlow"
          >
            <span v-if="savingEdit" class="loading loading-spinner loading-xs"></span>
            Lưu Thay Đổi Kịch Bản
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showEditModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Layers,
  Plus,
  RotateCcw,
  Search,
  Eye,
  Trash2,
  FolderPlus,
  Clock,
  Edit3,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';
import SimulationFlowBuilder, { type FlowBlock } from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

const loading = ref(false);
const flowProfiles = ref<any[]>([]);
const searchQuery = ref('');

// Modal detail state
const showDetailModal = ref(false);
const selectedFlow = ref<any>(null);

// Modal edit state
const showEditModal = ref(false);
const savingEdit = ref(false);
const editFlowBlocks = ref<FlowBlock[]>([]);
const editFlowForm = reactive({
  id: '',
  simuId: '',
  profileName: '',
  itemCode: '',
  longFw: '',
  sku: '',
  sensorConnectivity: 'LoRaWAN',
  referenceDevices: [] as any[],
});

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

function hasRefDeviceInFlow(flow: any): boolean {
  const blocks = getBlocksList(flow);
  return blocks.some((b: any) => (b.targetDevice || b.target) === 'REF');
}

function getDurationDisplay(flow: any): string {
  const blocks = getBlocksList(flow);
  if (blocks.length > 0) {
    const total = blocks.reduce((acc: number, b: any) => {
      const type = b.functionType || b.type;
      if (type === 'delay') {
        return acc + (Number(b.delaySeconds || b.duration_seconds || b.duration) || 0);
      }
      return acc;
    }, 0);
    return `${total}s`;
  }
  if (flow.durationSeconds) return `${flow.durationSeconds}s`;
  if (flow.flowDurationMinutes) return `${flow.flowDurationMinutes * 60}s`;
  if (flow.flowDurationSeconds) return `${flow.flowDurationSeconds}s`;
  return '0s';
}

function getFunctionLabel(type: string): string {
  switch (type) {
    case 'downlink':
      return 'GỬI DOWNLINK';
    case 'clear_downlink':
      return 'CLEAR DOWNLINK (FLUSH)';
    case 'delay':
      return 'DELAY (CHỜ)';
    default:
      return type?.toUpperCase() || 'FUNCTION';
  }
}

function getBlocksList(flow: any): any[] {
  if (!flow) return [];
  if (Array.isArray(flow.flowBlocks)) return flow.flowBlocks;
  if (Array.isArray(flow.blocks)) return flow.blocks;
  if (Array.isArray(flow.timedActions)) {
    return flow.timedActions.map((a: any) => ({
      id: a.id,
      name: a.label || a.actionType,
      functionType: a.actionType || 'downlink',
      payloadHex: a.payloadHex,
      delaySeconds: (a.triggerMinute || 1) * 60,
    }));
  }
  return [];
}

async function loadFlowProfiles() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/simulation/profiles');
    const items = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
    flowProfiles.value = Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.debug('[ListFlowSimulationPanel] Error loading profiles:', err.message);
    flowProfiles.value = [];
  } finally {
    loading.value = false;
  }
}

function viewFlowDetails(flow: any) {
  selectedFlow.value = flow;
  showDetailModal.value = true;
}

function openEditFlowModal(flow: any) {
  editFlowForm.id = flow.id || flow.simuId;
  editFlowForm.simuId = flow.simuId || flow.id;
  editFlowForm.profileName = flow.profileName || flow.name || '';
  editFlowForm.itemCode = flow.itemCode || flow.item_code || '';
  editFlowForm.longFw = flow.longFw || flow.long_fw || flow.fwVersion || '';
  editFlowForm.sku = flow.sku || '';
  editFlowForm.sensorConnectivity = flow.sensorConnectivity || 'LoRaWAN';
  const refDevs = flow.reference_devices || flow.referenceDevices || flow.autoCheckCriteria?.reference_devices || flow.criteria?.reference_devices || [];
  editFlowForm.referenceDevices = Array.isArray(refDevs) ? refDevs : [];

  const rawBlocks = getBlocksList(flow);
  editFlowBlocks.value = JSON.parse(JSON.stringify(rawBlocks));
  showEditModal.value = true;
}

async function submitEditFlow() {
  if (!editFlowForm.profileName.trim() && !editFlowForm.itemCode.trim()) {
    cyberToast.warning('Vui lòng nhập Tên kịch bản hoặc ITEM_CODE!');
    return;
  }

  savingEdit.value = true;
  const payload = {
    simuId: editFlowForm.simuId,
    name: editFlowForm.profileName,
    profileName: editFlowForm.profileName,
    itemCode: editFlowForm.itemCode,
    longFw: editFlowForm.longFw,
    sku: editFlowForm.sku,
    sensorConnectivity: editFlowForm.sensorConnectivity,
    flowBlocks: editFlowBlocks.value,
  };

  try {
    const targetId = encodeURIComponent(editFlowForm.id || editFlowForm.simuId);
    let updated: any;
    try {
      updated = await httpClient.put(`/plugins/testing/simulation/profiles/${targetId}`, payload);
    } catch (putErr: any) {
      const status = putErr?.response?.status || putErr?.status;
      if (status === 404 || putErr?.message?.includes('404') || putErr?.message?.includes('Cannot PUT')) {
        // Fallback post if put is not enabled or backend not redeployed yet
        updated = await httpClient.post('/plugins/testing/simulation/profiles', payload);
      } else {
        throw putErr;
      }
    }
    cyberToast.success('Cập nhật kịch bản Simulation thành công!');
    showEditModal.value = false;
    await loadFlowProfiles();
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật kịch bản';
    cyberToast.error(msg);
  } finally {
    savingEdit.value = false;
  }
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
    const targetId = encodeURIComponent(id);
    await httpClient.delete(`/plugins/testing/simulation/profiles/${targetId}`);
    cyberToast.success(`Đã xóa kịch bản ${name}`);
    await loadFlowProfiles();
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể xóa kịch bản (có thể đang được liên kết với Test Batch)';
    cyberToast.error(msg);
  }
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
