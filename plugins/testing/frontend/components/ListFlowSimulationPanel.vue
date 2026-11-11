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

          <!-- Nút Export All Flows -->
          <button
            class="btn btn-sm btn-outline btn-neutral gap-1.5"
            :disabled="loading || flowProfiles.length === 0"
            title="Xuất tất cả kịch bản ra file JSON"
            @click="exportAllFlows"
          >
            <Download class="w-3.5 h-3.5" />
            Export Tất Cả
          </button>

          <!-- Nút Import Flow -->
          <button
            class="btn btn-sm btn-outline btn-info gap-1.5"
            title="Nhập kịch bản từ file JSON hoặc dán mã JSON"
            @click="openImportModal"
          >
            <Upload class="w-3.5 h-3.5" />
            Import Flow
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
                    @click="onEditFlowClick(flow)"
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
                    class="btn btn-ghost btn-xs text-secondary gap-1"
                    title="Xuất kịch bản này ra file JSON"
                    @click="exportSingleFlow(flow)"
                  >
                    <Download class="w-3.5 h-3.5" />
                    Export
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
            class="btn btn-sm btn-outline btn-secondary gap-1"
            title="Xuất kịch bản ra JSON"
            @click="exportSingleFlow(selectedFlow)"
          >
            <Download class="w-3.5 h-3.5" />
            Xuất JSON
          </button>
          <button
            class="btn btn-sm btn-info gap-1"
            @click="showDetailModal = false; onEditFlowClick(selectedFlow)"
          >
            <Edit3 class="w-3.5 h-3.5" />
            Chỉnh Sửa Flow
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

    <!-- Modal: Nhập Kịch Bản Simulation (Import JSON) -->
    <dialog class="modal" :class="{ 'modal-open': showImportModal }">
      <div class="modal-box bg-base-100 border border-base-300 max-w-2xl p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-base-300">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-info/20 text-info flex items-center justify-center font-bold">
              <Upload class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-sm uppercase">Nhập Kịch Bản Simulation (Import JSON)</h3>
              <p class="text-xs text-base-content/60">
                Tải lên file .json hoặc dán nội dung JSON kịch bản mô phỏng
              </p>
            </div>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" @click="showImportModal = false">✕</button>
        </div>

        <!-- Mode Tabs: Chọn File vs Dán JSON -->
        <div class="tabs tabs-boxed bg-base-200 p-1">
          <a
            class="tab tab-sm"
            :class="{ 'tab-active !bg-primary !text-primary-content font-bold': importMode === 'file' }"
            @click="importMode = 'file'"
          >
            📁 Tải Lên File JSON
          </a>
          <a
            class="tab tab-sm"
            :class="{ 'tab-active !bg-primary !text-primary-content font-bold': importMode === 'paste' }"
            @click="importMode = 'paste'"
          >
            📋 Dán Nội Dung JSON
          </a>
        </div>

        <!-- Mode 1: File Upload -->
        <div v-if="importMode === 'file'" class="space-y-3">
          <div
            class="border-2 border-dashed border-base-300 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-base-200/40"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="onFileDrop"
          >
            <FileJson class="w-10 h-10 text-primary/70 mx-auto mb-2" />
            <p class="text-xs font-semibold text-base-content">
              Nhấn để chọn file <span class="text-primary font-mono font-bold">.json</span> hoặc kéo thả vào đây
            </p>
            <p class="text-[11px] text-base-content/50 mt-1">
              Hỗ trợ kịch bản đơn lẻ (Single Flow) hoặc gói kịch bản (Bundle Flows)
            </p>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,application/json"
              class="hidden"
              @change="onFileSelected"
            />
          </div>
          <div v-if="selectedFileName" class="flex items-center justify-between p-2 rounded-lg bg-base-200 text-xs font-mono">
            <span class="text-primary font-semibold truncate max-w-md">📄 {{ selectedFileName }}</span>
            <button class="btn btn-ghost btn-xs text-error" @click="clearImportFile">Xóa</button>
          </div>
        </div>

        <!-- Mode 2: Paste JSON -->
        <div v-else class="space-y-2">
          <label class="label py-0 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">Nội dung JSON:</span>
            <span class="text-[10px] text-base-content/50 font-mono">JSON format</span>
          </label>
          <textarea
            v-model="rawJsonInput"
            class="textarea textarea-bordered w-full font-mono text-xs h-36"
            placeholder=""
            @input="onPasteInput"
          ></textarea>
        </div>

        <!-- Validation & Preview Results -->
        <div v-if="parseStatus !== 'idle'" class="space-y-2">
          <!-- Error State -->
          <div v-if="parseStatus === 'error'" class="alert alert-error text-xs p-3">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ parseErrorMessage }}</span>
          </div>

          <!-- Success Preview -->
          <div v-else-if="parseStatus === 'valid'" class="space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-success">
                <CheckCircle2 class="w-4 h-4" />
                Hợp lệ: Sẵn sàng nhập {{ parsedProfiles.length }} kịch bản
              </span>
              <label class="label cursor-pointer gap-2 py-0">
                <input
                  v-model="generateNewSimuId"
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary"
                />
                <span class="label-text text-[11px]">Tạo mới Simu ID (tránh ghi đè)</span>
              </label>
            </div>

            <!-- List Preview Cards -->
            <div class="max-h-44 overflow-y-auto space-y-2 pr-1">
              <div
                v-for="(p, pIdx) in parsedProfiles"
                :key="pIdx"
                class="p-2.5 rounded-lg border border-base-300 bg-base-200/60 text-xs font-mono space-y-1"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-primary">{{ p.profileName || p.name || `Kịch bản #${pIdx + 1}` }}</span>
                  <span class="badge badge-xs badge-info font-mono">{{ p.simuId || 'Tự sinh ID' }}</span>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-base-content/70">
                  <span>ITEM: <strong>{{ p.itemCode || '--' }}</strong></span>
                  <span>FW: <strong>{{ p.longFw || p.fwVersion || '--' }}</strong></span>
                  <span class="text-success font-semibold">{{ (p.flowBlocks || []).length }} blocks</span>
                  <span v-if="p.autoCheckCriteria" class="badge badge-xs badge-success">AutoCheck</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-action">
          <button class="btn btn-sm btn-ghost" :disabled="importing" @click="showImportModal = false">
            Hủy
          </button>
          <button
            class="btn btn-sm btn-primary gap-1.5"
            :disabled="parseStatus !== 'valid' || parsedProfiles.length === 0 || importing"
            @click="executeImport"
          >
            <Upload class="w-3.5 h-3.5" :class="{ 'animate-spin': importing }" />
            {{ importing ? 'Đang Nhập...' : `Xác Nhận Nhập (${parsedProfiles.length} Kịch Bản)` }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showImportModal = false">close</button>
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
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';
import type { FlowBlock } from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string, payload?: any): void;
  (e: 'edit-flow', flow: any): void;
}>();

function onEditFlowClick(flow: any) {
  emit('edit-flow', flow);
  emit('switch-tab', 'device-simulation', flow);
}

const loading = ref(false);
const flowProfiles = ref<any[]>([]);
const searchQuery = ref('');

// Modal detail state
const showDetailModal = ref(false);
const selectedFlow = ref<any>(null);

// Import & Export State
const showImportModal = ref(false);
const importMode = ref<'file' | 'paste'>('file');
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const rawJsonInput = ref('');
const parseStatus = ref<'idle' | 'valid' | 'error'>('idle');
const parseErrorMessage = ref('');
const parsedProfiles = ref<any[]>([]);
const generateNewSimuId = ref(false);
const importing = ref(false);

function downloadJsonFile(filename: string, data: any) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportSingleFlow(flow: any) {
  if (!flow) return;
  const nameClean = (flow.profileName || flow.name || 'flow').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
  const filename = `${flow.simuId || flow.id || 'flow'}_${nameClean}.json`;
  const exportData = {
    version: '2.0',
    type: 'itest_simulation_flow',
    exportedAt: new Date().toISOString(),
    profile: {
      profileName: flow.profileName || flow.name,
      name: flow.profileName || flow.name,
      simuId: flow.simuId || flow.id,
      itemCode: flow.itemCode || flow.item_code,
      longFw: flow.longFw || flow.long_fw || flow.fwVersion,
      fwVersion: flow.longFw || flow.long_fw || flow.fwVersion,
      sku: flow.sku || '',
      sensorConnectivity: flow.sensorConnectivity || flow.protocol || 'LoRaWAN',
      flowBlocks: getBlocksList(flow),
      referenceDevices: flow.referenceDevices || flow.reference_devices || [],
      autoCheckCriteria: flow.autoCheckCriteria || flow.criteria || null,
      simulatorDevice: flow.simulatorDevice || null,
      description: flow.description || '',
    },
  };
  downloadJsonFile(filename, exportData);
  cyberToast.success(`Đã xuất kịch bản "${flow.profileName || flow.simuId}" thành công!`);
}

function exportAllFlows() {
  if (flowProfiles.value.length === 0) {
    cyberToast.warning('Không có kịch bản nào để xuất!');
    return;
  }
  const filename = `itest_simulation_flows_all_${new Date().toISOString().slice(0, 10)}.json`;
  const exportData = {
    version: '2.0',
    type: 'itest_simulation_flow_bundle',
    exportedAt: new Date().toISOString(),
    totalProfiles: flowProfiles.value.length,
    profiles: flowProfiles.value.map((flow) => ({
      profileName: flow.profileName || flow.name,
      name: flow.profileName || flow.name,
      simuId: flow.simuId || flow.id,
      itemCode: flow.itemCode || flow.item_code,
      longFw: flow.longFw || flow.long_fw || flow.fwVersion,
      fwVersion: flow.longFw || flow.long_fw || flow.fwVersion,
      sku: flow.sku || '',
      sensorConnectivity: flow.sensorConnectivity || flow.protocol || 'LoRaWAN',
      flowBlocks: getBlocksList(flow),
      referenceDevices: flow.referenceDevices || flow.reference_devices || [],
      autoCheckCriteria: flow.autoCheckCriteria || flow.criteria || null,
      simulatorDevice: flow.simulatorDevice || null,
      description: flow.description || '',
    })),
  };
  downloadJsonFile(filename, exportData);
  cyberToast.success(`Đã xuất thành công ${flowProfiles.value.length} kịch bản!`);
}

function openImportModal() {
  showImportModal.value = true;
  clearImportFile();
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function clearImportFile() {
  selectedFileName.value = '';
  rawJsonInput.value = '';
  parseStatus.value = 'idle';
  parseErrorMessage.value = '';
  parsedProfiles.value = [];
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = (e.target?.result as string) || '';
    rawJsonInput.value = content;
    parseAndValidateJson(content);
  };
  reader.readAsText(file);
}

function onFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = (e.target?.result as string) || '';
    rawJsonInput.value = content;
    parseAndValidateJson(content);
  };
  reader.readAsText(file);
}

function onPasteInput() {
  parseAndValidateJson(rawJsonInput.value);
}

function parseAndValidateJson(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    parseStatus.value = 'idle';
    parseErrorMessage.value = '';
    parsedProfiles.value = [];
    return;
  }

  try {
    const parsed = JSON.parse(trimmed);
    let list: any[] = [];

    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.profiles)) {
        list = parsed.profiles;
      } else if (parsed.profile && typeof parsed.profile === 'object') {
        list = [parsed.profile];
      } else if (Array.isArray(parsed)) {
        if (parsed.length > 0 && parsed[0]?.functionType) {
          // Array of flowBlocks
          list = [{
            profileName: `Imported Flow ${new Date().toISOString().slice(0, 10)}`,
            flowBlocks: parsed,
          }];
        } else {
          list = parsed;
        }
      } else {
        list = [parsed];
      }
    }

    if (!Array.isArray(list) || list.length === 0) {
      parseStatus.value = 'error';
      parseErrorMessage.value = 'Không tìm thấy kịch bản hợp lệ trong file JSON.';
      parsedProfiles.value = [];
      return;
    }

    // Normalize each profile
    const validProfiles: any[] = [];
    for (const p of list) {
      const blocks = Array.isArray(p.flowBlocks) ? p.flowBlocks : (Array.isArray(p.blocks) ? p.blocks : (Array.isArray(p.flow_blocks) ? p.flow_blocks : []));
      validProfiles.push({
        profileName: p.profileName || p.name || p.simuId || 'Imported Flow',
        name: p.profileName || p.name || p.simuId || 'Imported Flow',
        simuId: p.simuId || p.id || '',
        itemCode: (p.itemCode || p.item_code || '').toUpperCase(),
        longFw: p.longFw || p.long_fw || p.fwVersion || '',
        fwVersion: p.fwVersion || p.longFw || p.long_fw || '',
        sku: p.sku || '',
        sensorConnectivity: p.sensorConnectivity || p.protocol || 'LoRaWAN',
        flowBlocks: blocks,
        referenceDevices: Array.isArray(p.referenceDevices) ? p.referenceDevices : (Array.isArray(p.reference_devices) ? p.reference_devices : []),
        autoCheckCriteria: p.autoCheckCriteria || p.criteria || null,
        simulatorDevice: p.simulatorDevice || null,
        description: p.description || '',
      });
    }

    parsedProfiles.value = validProfiles;
    parseStatus.value = 'valid';
    parseErrorMessage.value = '';
  } catch (err: any) {
    parseStatus.value = 'error';
    parseErrorMessage.value = `Cú pháp JSON không hợp lệ: ${err.message}`;
    parsedProfiles.value = [];
  }
}

async function executeImport() {
  if (parsedProfiles.value.length === 0) return;
  importing.value = true;
  let successCount = 0;
  let errorCount = 0;

  for (const prof of parsedProfiles.value) {
    try {
      const simuId = generateNewSimuId.value || !prof.simuId
        ? `SIMU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        : prof.simuId;

      const payload = {
        name: prof.profileName || prof.name || simuId,
        profileName: prof.profileName || prof.name || simuId,
        simuId,
        sensorConnectivity: prof.sensorConnectivity || prof.protocol || 'LoRaWAN',
        sku: prof.sku || '',
        longFw: prof.longFw || prof.long_fw || prof.fwVersion || '',
        fwVersion: prof.fwVersion || prof.longFw || prof.long_fw || '',
        itemCode: (prof.itemCode || prof.item_code || '').toUpperCase(),
        flowBlocks: Array.isArray(prof.flowBlocks) ? prof.flowBlocks : [],
        referenceDevices: Array.isArray(prof.referenceDevices) ? prof.referenceDevices : [],
        simulatorDevice: prof.simulatorDevice || null,
        autoCheckCriteria: prof.autoCheckCriteria || null,
        description: prof.description || '',
      };

      await httpClient.post('/plugins/testing/simulation/profiles', payload);
      successCount++;
    } catch (err: any) {
      errorCount++;
      console.error('Import profile error:', err);
    }
  }

  importing.value = false;
  if (successCount > 0) {
    cyberToast.success(`Đã nhập thành công ${successCount} kịch bản simulation!`);
    showImportModal.value = false;
    clearImportFile();
    await loadFlowProfiles();
  }
  if (errorCount > 0) {
    cyberToast.error(`Có ${errorCount} kịch bản gặp lỗi khi lưu vào hệ thống.`);
  }
}

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
