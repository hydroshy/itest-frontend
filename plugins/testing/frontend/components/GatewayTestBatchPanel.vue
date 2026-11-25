<template>
  <div class="gateway-test-batch-panel w-full space-y-4">
    <!-- KHỐI LIỀN MẠCH DUY NHẤT (UNIFIED SINGLE CONTAINER) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl p-4 md:p-5 shadow-sm space-y-4 backdrop-blur-md">
      <!-- 1. Header Tinh Gọn -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-300/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Boxes class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Gateway Batch</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="isTesting ? 'badge-warning animate-pulse' : testFinished ? (batchVerdict === 'PASS' ? 'badge-success' : 'badge-error') : 'badge-ghost'"
              >
                {{ isTesting ? 'TESTING IN PROGRESS (12H)' : testFinished ? `COMPLETED (${batchVerdict || 'DONE'})` : 'IDLE / READY' }}
              </span>
            </div>
            <h3 class="font-bold text-base text-base-content mt-0.5">
              Gateway Test Batch (Treo Đo Kiểm 12 Giờ)
            </h3>
          </div>
        </div>

        <!-- Running Batch Quick Control -->
        <div v-if="runningBatches.length > 0 && !isTesting" class="flex items-center gap-2">
          <span class="text-xs text-warning font-medium">Batch đang chạy:</span>
          <select
            class="select select-xs select-bordered font-mono font-bold text-warning"
            @change="onSelectRunningBatch(($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled selected>Chọn batch đang chạy...</option>
            <option v-for="rb in runningBatches" :key="rb.id" :value="rb.id">
              {{ rb.batch_code || rb.id }} {{ rb.so_number ? `(${rb.so_number})` : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- 2. THANH TIẾN TRÌNH & ĐIỀU KHIỂN ĐẾM THỜI GIAN 12 GIỜ -->
      <div class="bg-base-100/70 p-3 rounded-lg border border-base-300/80 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- Trạng thái & Bộ đếm thời gian 12h -->
          <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div
              class="flex items-center gap-1.5 font-bold"
              :class="isTesting ? 'text-warning' : testFinished ? (batchVerdict === 'PASS' ? 'text-success' : 'text-error') : 'text-base-content/70'"
            >
              <Timer class="w-4 h-4" :class="{ 'animate-spin': isTesting }" />
              <span>{{ isTesting ? 'ĐANG TREO TEST 12H' : testFinished ? `KẾT QUẢ: ${batchVerdict || 'XONG'}` : 'SẴN SÀNG' }}</span>
            </div>
            <span>|</span>
            <span>Còn lại: <b class="text-primary font-bold">{{ formattedRemaining }}</b></span>
            <span>|</span>
            <span>Đã chạy: <b class="text-base-content/80">{{ formattedElapsed }}</b></span>
            <span v-if="isTesting || testFinished">|</span>
            <span v-if="isTesting || testFinished" class="text-info font-medium">
              Tiến độ: {{ Math.round((elapsedSeconds / Math.max(1, totalDurationSeconds)) * 100) }}%
            </span>
          </div>

          <!-- Các Nút Hành Động Kiểm Thử Chính -->
          <div class="flex items-center gap-2">
            <!-- Nút Bắt Đầu Gateway Test Batch -->
            <button
              v-if="!isTesting && !testFinished"
              class="btn btn-sm btn-primary gap-1.5 px-4 font-bold shadow-sm"
              :disabled="selectedGateways.length === 0"
              @click="startBatchTest"
            >
              <Play class="w-4 h-4 fill-current" />
              Bắt Đầu Gateway Test Batch ({{ selectedGateways.length }})
            </button>

            <!-- Nút Hoàn Thành Test Batch -->
            <button
              v-if="isTesting || testFinished"
              class="btn btn-sm btn-success gap-1.5 px-3 font-bold text-success-content"
              :disabled="completingBatch"
              @click="openCompleteModal"
            >
              <CheckCircle2 class="w-4 h-4" />
              {{ completingBatch ? 'Đang Hoàn Thành...' : 'Hoàn Thành Test Batch' }}
            </button>

            <!-- Nút Hủy Batch -->
            <button
              v-if="isTesting"
              class="btn btn-sm btn-error gap-1 px-3 text-error-content"
              :disabled="cancellingBatch"
              @click="cancelSelectedBatch"
            >
              <Square class="w-3.5 h-3.5" />
              Hủy Batch
            </button>
          </div>
        </div>

        <!-- Thanh progress đếm ngược 12 giờ -->
        <progress
          class="progress w-full h-2.5 transition-all"
          :class="testFinished ? (batchVerdict === 'PASS' ? 'progress-success' : 'progress-error') : isTesting ? 'progress-primary' : 'progress-ghost'"
          :value="isTesting || testFinished ? elapsedSeconds : 0"
          :max="Math.max(1, totalDurationSeconds)"
        ></progress>
      </div>

      <!-- 3. Hàng Điều Khiển Chính: SO_NUMBER, GATEWAY BATCH, ITEM_CODE, REGION -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-base-100/50 p-3 rounded-lg border border-base-300/60">
        <!-- SO_NUMBER: Tìm kiếm và chọn SO - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5">
            <span class="label-text text-xs font-bold text-primary flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5" />
              SO_NUMBER <span class="text-error">*</span>
            </span>
            <span v-if="selectedSoNumber" class="badge badge-xs badge-primary font-mono font-bold">Đã chọn</span>
          </label>
          <div class="relative">
            <input
              v-model="selectedSoNumber"
              type="text"
              list="gw-so-datalist"
              placeholder=""
              class="input input-sm input-bordered w-full text-xs font-mono font-bold bg-base-100 pr-8"
              :disabled="isTesting || loadingSos"
              @change="onSoChange"
              @input="onSoInput"
            />
            <datalist id="gw-so-datalist">
              <option v-for="so in uniqueSoNumbers" :key="so" :value="so"></option>
            </datalist>
          </div>
        </div>

        <!-- GATEWAY BATCH CODE - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5 flex items-center justify-between">
            <span class="label-text text-xs font-bold flex items-center gap-1.5 text-base-content">
              <Radio class="w-3.5 h-3.5 text-info" />
              GATEWAY BATCH
            </span>
          </label>
          <input
            :value="activeBatchDisplayName"
            type="text"
            readonly
            placeholder=""
            class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed select-all"
            title="Mã đợt kiểm thử Gateway"
          />
        </div>

        <!-- ITEM_CODE - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5">
            <span class="label-text text-xs font-bold text-base-content">
              ITEM_CODE
            </span>
          </label>
          <input
            :value="filterItemCode || '—'"
            type="text"
            readonly
            placeholder=""
            class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed"
          />
        </div>

        <!-- REGION & REFRESH - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-0.5 flex items-center justify-between">
            <span class="label-text text-xs font-bold text-base-content">
              REGION
            </span>
            <span class="badge badge-xs badge-info font-mono">12 Hours</span>
          </label>
          <div class="flex items-center gap-2">
            <input
              :value="filterRegion || 'EU868 / AS923'"
              type="text"
              readonly
              placeholder=""
              class="input input-sm input-bordered w-full font-mono text-xs font-bold bg-base-300/40 border-base-300 text-base-content cursor-not-allowed"
            />
            <button
              type="button"
              class="btn btn-sm btn-square btn-ghost"
              title="Tải lại danh sách Gateway"
              :disabled="loadingSos || isTesting"
              @click="loadGateways"
            >
              <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': loadingSos }" />
            </button>
          </div>
        </div>
      </div>

      <!-- 4. KHU VỰC 2 BẢNG & NÚT ĐIỀU HƯỚNG Ở GIỮA -->
      <div class="flex flex-col lg:flex-row gap-3 items-stretch justify-center">
        <!-- BẢNG 1: Danh Sách Gateway Khả Dụng (Chưa đưa vào test) -->
        <div class="flex-1 flex flex-col bg-base-100/40 p-3 rounded-xl border border-base-300 space-y-2 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-bold text-xs text-base-content flex items-center gap-1.5">
              <Radio class="w-3.5 h-3.5 text-primary" />
              <span>Gateway Khả Dụng ({{ availableGateways.length }})</span>
            </div>
            <div class="text-[11px] text-base-content/60">
              Đã chọn: <b class="text-primary">{{ selectedAvailableKeys.size }}</b>
            </div>
          </div>

          <div class="overflow-x-auto overflow-y-auto max-h-[380px] border border-base-300/80 rounded-lg">
            <table class="table table-xs table-zebra w-full font-mono">
              <thead class="sticky top-0 bg-base-200 z-10 text-[11px]">
                <tr>
                  <th class="w-8">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs"
                      :checked="availableGateways.length > 0 && selectedAvailableKeys.size === availableGateways.length"
                      :disabled="isTesting || availableGateways.length === 0"
                      @change="toggleSelectAllAvailable"
                    />
                  </th>
                  <th>Gateway EUI</th>
                  <th>Serial Number</th>
                  <th>IP / Port</th>
                  <th>Băng Tần</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="availableGateways.length === 0">
                  <td colspan="5" class="text-center py-8 text-base-content/50 italic font-sans text-xs">
                    Không có Gateway nào khả dụng. Vui lòng chọn SO_NUMBER hoặc đăng ký thêm Gateway.
                  </td>
                </tr>
                <tr
                  v-for="gw in availableGateways"
                  :key="gw.gateway_id || gw.id"
                  class="hover cursor-pointer"
                  :class="{ 'bg-primary/10': selectedAvailableKeys.has(gw.gateway_id || gw.id) }"
                  @click="toggleSelectAvailable(gw.gateway_id || gw.id)"
                >
                  <td @click.stop>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs"
                      :checked="selectedAvailableKeys.has(gw.gateway_id || gw.id)"
                      :disabled="isTesting"
                      @change="toggleSelectAvailable(gw.gateway_id || gw.id)"
                    />
                  </td>
                  <td class="font-bold text-primary">{{ gw.gateway_id || gw.eui }}</td>
                  <td class="text-warning font-semibold">{{ gw.serial_number || '—' }}</td>
                  <td class="text-base-content/70">{{ gw.gateway_ip ? `${gw.gateway_ip}:4050` : '—' }}</td>
                  <td>{{ gw.region_test || gw.regionTest || 'EU868' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CỘT GIỮA: NÚT ĐIỀU HƯỚNG (THÊM / BỎ GATEWAY) -->
        <div class="flex lg:flex-col items-center justify-center gap-2 py-2">
          <button
            type="button"
            class="btn btn-sm btn-primary btn-square"
            title="Thêm Gateway đã chọn vào Batch"
            :disabled="isTesting || selectedAvailableKeys.size === 0"
            @click="moveSelectedToBatch"
          >
            <ChevronRight class="w-4 h-4 hidden lg:inline" />
            <ChevronDown class="w-4 h-4 lg:hidden" />
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline btn-square"
            title="Loại bỏ Gateway đã chọn khỏi Batch"
            :disabled="isTesting || selectedBatchKeys.size === 0"
            @click="moveSelectedFromBatch"
          >
            <ChevronLeft class="w-4 h-4 hidden lg:inline" />
            <ChevronUp class="w-4 h-4 lg:hidden" />
          </button>
        </div>

        <!-- BẢNG 2: Gateway Đang Chạy Trong Batch & Đếm Gói Uplink Thực Tế -->
        <div class="flex-1 flex flex-col bg-base-100/40 p-3 rounded-xl border border-base-300 space-y-2 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-bold text-xs text-base-content flex items-center gap-1.5">
              <Activity class="w-3.5 h-3.5 text-warning" />
              <span>Gateway Trong Batch Treo 12H ({{ selectedGateways.length }})</span>
            </div>
            <div class="text-[11px] text-base-content/60 font-mono">
              Tổng Gói Thu Thập: <b class="text-primary">{{ totalUplinkPacketsInBatch }}</b>
            </div>
          </div>

          <div class="overflow-x-auto overflow-y-auto max-h-[380px] border border-base-300/80 rounded-lg">
            <table class="table table-xs table-zebra w-full font-mono">
              <thead class="sticky top-0 bg-base-200 z-10 text-[11px]">
                <tr>
                  <th class="w-8">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs"
                      :checked="selectedGateways.length > 0 && selectedBatchKeys.size === selectedGateways.length"
                      :disabled="isTesting || selectedGateways.length === 0"
                      @change="toggleSelectAllBatch"
                    />
                  </th>
                  <th>Gateway EUI / Serial</th>
                  <th>Gói Uplink Nhận</th>
                  <th>Thiết Bị Gửi Qua GW</th>
                  <th>Lần Nhận Cuối</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="selectedGateways.length === 0">
                  <td colspan="6" class="text-center py-8 text-base-content/50 italic font-sans text-xs">
                    Chưa có Gateway nào trong đợt test. Chọn Gateway ở bảng trái và nhấn mũi tên sang phải.
                  </td>
                </tr>
                <tr
                  v-for="gw in selectedGateways"
                  :key="gw.gateway_id || gw.id"
                  class="hover cursor-pointer"
                  :class="{ 'bg-primary/10': selectedBatchKeys.has(gw.gateway_id || gw.id) }"
                  @click="toggleSelectBatch(gw.gateway_id || gw.id)"
                >
                  <td @click.stop>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs"
                      :checked="selectedBatchKeys.has(gw.gateway_id || gw.id)"
                      :disabled="isTesting"
                      @change="toggleSelectBatch(gw.gateway_id || gw.id)"
                    />
                  </td>
                  <td>
                    <div class="font-bold text-primary">{{ gw.gateway_id || gw.eui }}</div>
                    <div class="text-[10px] text-warning font-semibold">{{ gw.serial_number || '—' }}</div>
                  </td>
                  <td>
                    <div class="font-bold text-sm text-primary flex items-center gap-1">
                      <Radio class="w-3 h-3" />
                      <span>{{ gw.uplink_count || 0 }}</span>
                    </div>
                    <div v-if="gw.avg_rssi !== undefined" class="text-[10px] text-base-content/60">
                      RSSI: {{ gw.avg_rssi }} dBm | SNR: {{ gw.avg_snr ?? '—' }} dB
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-xs font-mono font-bold badge-outline">
                      {{ (gw.dev_euis || []).length }} DevEUIs
                    </span>
                  </td>
                  <td class="text-[10px] text-base-content/70">
                    {{ gw.last_uplink_at ? formatTime(gw.last_uplink_at) : 'Chưa có gói' }}
                  </td>
                  <td>
                    <span
                      class="badge badge-xs font-mono font-bold"
                      :class="gw.status === 'PASS' ? 'badge-success text-success-content' : gw.status === 'RECEIVING' ? 'badge-warning text-warning-content animate-pulse' : 'badge-ghost'"
                    >
                      {{ gw.status || (isTesting ? 'RECEIVING' : 'IDLE') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL HOÀN THÀNH TEST BATCH & ĐÁNH GIÁ (PASS / FAIL) -->
    <dialog class="modal" :class="{ 'modal-open': completeModalVisible }">
      <div class="modal-box w-11/12 max-w-2xl border border-base-content/10 bg-base-100 p-5 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-base-content/10">
          <h3 class="font-bold text-base flex items-center gap-2">
            <CheckCircle2 class="w-5 h-5 text-success" />
            Hoàn Thành Gateway Test Batch: {{ activeBatchDisplayName }}
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="completeModalVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-base-200/50 p-3 rounded-lg font-mono">
            <div>
              <span class="text-base-content/60 block">Tổng Gateway:</span>
              <span class="font-bold text-primary">{{ selectedGateways.length }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Đạt (PASS):</span>
              <span class="font-bold text-success">{{ passCount }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Không Đạt (FAIL):</span>
              <span class="font-bold text-error">{{ failCount }}</span>
            </div>
            <div>
              <span class="text-base-content/60 block">Thời Gian Treo:</span>
              <span class="font-bold">{{ formattedElapsed }}</span>
            </div>
          </div>

          <!-- Yêu cầu gõ OK để xác nhận -->
          <div class="form-control space-y-1">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">
                Gõ <b class="text-error font-mono font-bold">OK</b> để xác nhận hoàn tất kết quả đo kiểm:
              </span>
            </label>
            <input
              v-model="confirmationText"
              type="text"
              placeholder=""
              class="input input-sm input-bordered font-mono font-bold uppercase w-32"
            />
          </div>
        </div>

        <div class="modal-action border-t border-base-content/10 pt-3">
          <button type="button" class="btn btn-sm btn-ghost" @click="completeModalVisible = false">
            Hủy Bỏ
          </button>
          <button
            type="button"
            class="btn btn-sm btn-success text-success-content font-bold gap-1"
            :disabled="confirmationText.trim().toUpperCase() !== 'OK' || completingBatch"
            @click="confirmCompleteBatch"
          >
            <Check class="w-4 h-4" />
            Xác Nhận Hoàn Thành
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="completeModalVisible = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  Boxes,
  Radio,
  Timer,
  Play,
  Square,
  CheckCircle2,
  Check,
  RotateCcw,
  Layers,
  Activity,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

const props = defineProps<{
  initialPayload?: any;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

// 12 hours = 43,200 seconds
const totalDurationSeconds = ref(12 * 3600);
const elapsedSeconds = ref(0);
const isTesting = ref(false);
const testFinished = ref(false);
const batchVerdict = ref<'PASS' | 'FAIL' | ''>('');
let timerInterval: any = null;

const runningBatches = ref<any[]>([]);
const selectedSoNumber = ref('');
const uniqueSoNumbers = ref<string[]>([]);
const filterItemCode = ref('');
const filterRegion = ref('');
const loadingSos = ref(false);

const availableGateways = ref<any[]>([]);
const selectedAvailableKeys = ref<Set<string>>(new Set());

const selectedGateways = ref<any[]>([]);
const selectedBatchKeys = ref<Set<string>>(new Set());

const activeBatchDisplayName = computed(() => {
  if (selectedSoNumber.value) {
    const clean = selectedSoNumber.value.replace(/[^a-zA-Z0-9]/g, '-');
    return `GW-BATCH-${clean}`;
  }
  return 'GW-BATCH-AUTO';
});

const formattedElapsed = computed(() => formatDuration(elapsedSeconds.value));
const formattedRemaining = computed(() =>
  formatDuration(Math.max(0, totalDurationSeconds.value - elapsedSeconds.value))
);

const totalUplinkPacketsInBatch = computed(() => {
  return selectedGateways.value.reduce((acc, gw) => acc + (gw.uplink_count || 0), 0);
});

const passCount = computed(() => {
  return selectedGateways.value.filter((gw) => (gw.uplink_count || 0) > 0).length;
});

const failCount = computed(() => {
  return selectedGateways.value.filter((gw) => (gw.uplink_count || 0) === 0).length;
});

const completeModalVisible = ref(false);
const completingBatch = ref(false);
const cancellingBatch = ref(false);
const confirmationText = ref('');

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(val?: string | Date): string {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function loadGateways() {
  loadingSos.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/gateway-sessions', {
      params: { limit: 100 },
    });
    const items: any[] = Array.isArray(res) ? res : res?.data || [];
    
    // Extract unique SOs
    const soSet = new Set<string>();
    items.forEach((item) => {
      const so = item.so_number || item.soNumber;
      if (so) soSet.add(so);
    });
    uniqueSoNumbers.value = Array.from(soSet);

    if (!selectedSoNumber.value && uniqueSoNumbers.value.length > 0) {
      selectedSoNumber.value = uniqueSoNumbers.value[0];
    }

    // Filter available gateways by selected SO
    filterGatewaysBySo(items);
  } catch (err: any) {
    console.warn('Failed to load gateways for batch:', err);
  } finally {
    loadingSos.value = false;
  }
}

function filterGatewaysBySo(allItems: any[]) {
  const selectedSo = selectedSoNumber.value.trim().toLowerCase();
  const matched = allItems.filter((g) => {
    const so = (g.so_number || g.soNumber || '').trim().toLowerCase();
    return !selectedSo || so === selectedSo;
  });

  // Keep aside already selected in batch
  const selectedIds = new Set(selectedGateways.value.map((g) => g.gateway_id || g.id));
  availableGateways.value = matched.filter((g) => !selectedIds.has(g.gateway_id || g.id));

  if (matched.length > 0) {
    filterItemCode.value = matched[0].item_code || matched[0].itemCode || '—';
    filterRegion.value = matched[0].region_test || matched[0].regionTest || 'EU868';
  }
}

function onSoChange() {
  selectedGateways.value = [];
  selectedAvailableKeys.value.clear();
  selectedBatchKeys.value.clear();
  loadGateways();
}

function onSoInput() {
  // responsive datalist input
}

function toggleSelectAvailable(id: string) {
  if (selectedAvailableKeys.value.has(id)) {
    selectedAvailableKeys.value.delete(id);
  } else {
    selectedAvailableKeys.value.add(id);
  }
}

function toggleSelectAllAvailable() {
  if (selectedAvailableKeys.value.size === availableGateways.value.length) {
    selectedAvailableKeys.value.clear();
  } else {
    selectedAvailableKeys.value = new Set(availableGateways.value.map((g) => g.gateway_id || g.id));
  }
}

function toggleSelectBatch(id: string) {
  if (selectedBatchKeys.value.has(id)) {
    selectedBatchKeys.value.delete(id);
  } else {
    selectedBatchKeys.value.add(id);
  }
}

function toggleSelectAllBatch() {
  if (selectedBatchKeys.value.size === selectedGateways.value.length) {
    selectedBatchKeys.value.clear();
  } else {
    selectedBatchKeys.value = new Set(selectedGateways.value.map((g) => g.gateway_id || g.id));
  }
}

function moveSelectedToBatch() {
  const toMove: any[] = [];
  availableGateways.value = availableGateways.value.filter((g) => {
    const id = g.gateway_id || g.id;
    if (selectedAvailableKeys.value.has(id)) {
      toMove.push({
        ...g,
        uplink_count: g.uplink_packets ?? g.total_packets ?? 0,
        dev_euis: [],
        status: 'IDLE',
      });
      return false;
    }
    return true;
  });
  selectedGateways.value.push(...toMove);
  selectedAvailableKeys.value.clear();
}

function moveSelectedFromBatch() {
  const toMove: any[] = [];
  selectedGateways.value = selectedGateways.value.filter((g) => {
    const id = g.gateway_id || g.id;
    if (selectedBatchKeys.value.has(id)) {
      toMove.push(g);
      return false;
    }
    return true;
  });
  availableGateways.value.push(...toMove);
  selectedBatchKeys.value.clear();
}

// Polling and packet counting
let packetPollInterval: any = null;

async function pollGatewayUplinks() {
  if (!isTesting.value || selectedGateways.value.length === 0) return;
  try {
    // Poll updated stats from gateway-sessions
    const res: any = await httpClient.get('/plugins/testing/gateway-sessions', {
      params: { limit: 100 },
    });
    const items: any[] = Array.isArray(res) ? res : res?.data || [];
    const itemMap = new Map<string, any>();
    items.forEach((it) => {
      const id = (it.gateway_id || it.eui || '').toLowerCase();
      if (id) itemMap.set(id, it);
    });

    selectedGateways.value.forEach((gw) => {
      const id = (gw.gateway_id || gw.eui || '').toLowerCase();
      const updated = itemMap.get(id);
      if (updated) {
        gw.uplink_count = updated.total_packets ?? updated.uplink_packets ?? updated.summary?.uplink_count ?? gw.uplink_count;
        if (gw.uplink_count > 0) {
          gw.status = 'RECEIVING';
          gw.last_uplink_at = updated.last_packet_at || new Date().toISOString();
        }
      }
    });
  } catch {
    // silent poll failure
  }
}

function startBatchTest() {
  if (selectedGateways.value.length === 0) {
    cyberToast.warning('Vui lòng chọn ít nhất 1 Gateway vào Batch trước khi bắt đầu!');
    return;
  }

  isTesting.value = true;
  testFinished.value = false;
  batchVerdict.value = '';
  elapsedSeconds.value = 0;

  selectedGateways.value.forEach((gw) => {
    gw.status = 'RECEIVING';
  });

  cyberToast.success('Đã bắt đầu phiên kiểm thử Gateway Test Batch (Treo 12 giờ)!');

  // Start 12h countdown timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
    if (elapsedSeconds.value >= totalDurationSeconds.value) {
      clearInterval(timerInterval);
      finishBatchAuto();
    }
  }, 1000);

  // Start polling gateway uplinks every 5s
  clearInterval(packetPollInterval);
  packetPollInterval = setInterval(pollGatewayUplinks, 5000);
}

function finishBatchAuto() {
  isTesting.value = false;
  testFinished.value = true;
  const allPassed = selectedGateways.value.every((gw) => (gw.uplink_count || 0) > 0);
  batchVerdict.value = allPassed ? 'PASS' : 'FAIL';
  cyberToast.info('Đã hoàn thành thời gian treo 12 giờ của Gateway Test Batch!');
  openCompleteModal();
}

function openCompleteModal() {
  confirmationText.value = '';
  completeModalVisible.value = true;
}

async function confirmCompleteBatch() {
  completingBatch.value = true;
  try {
    clearInterval(timerInterval);
    clearInterval(packetPollInterval);
    isTesting.value = false;
    testFinished.value = true;
    batchVerdict.value = passCount.value === selectedGateways.value.length ? 'PASS' : 'FAIL';

    // Update status of all gateways in batch
    for (const gw of selectedGateways.value) {
      if (gw.id) {
        await httpClient.put(`/plugins/testing/gateway-sessions/${gw.id}`, {
          status: (gw.uplink_count || 0) > 0 ? 'COMPLETED' : 'FAILED',
          endedAt: new Date().toISOString(),
          summary: {
            uplink_count: gw.uplink_count || 0,
            batch_code: activeBatchDisplayName.value,
            verdict: (gw.uplink_count || 0) > 0 ? 'PASS' : 'FAIL',
            duration_seconds: elapsedSeconds.value,
          },
        }).catch(() => {});
      }
    }

    cyberToast.success('Đã hoàn thành và lưu kết quả Gateway Test Batch!');
    completeModalVisible.value = false;
  } catch (err: any) {
    cyberToast.error(err.message || 'Lỗi khi hoàn tất batch.');
  } finally {
    completingBatch.value = false;
  }
}

function cancelSelectedBatch() {
  clearInterval(timerInterval);
  clearInterval(packetPollInterval);
  isTesting.value = false;
  selectedGateways.value.forEach((gw) => {
    gw.status = 'CANCELLED';
  });
  cyberToast.warning('Đã hủy phiên Gateway Test Batch.');
}

function onSelectRunningBatch(batchId: string) {
  // restore running batch state if needed
}

onMounted(() => {
  loadGateways();
  if (props.initialPayload?.selectedGateway) {
    const gw = props.initialPayload.selectedGateway;
    selectedGateways.value.push({
      ...gw,
      uplink_count: gw.uplink_packets ?? 0,
      status: 'IDLE',
    });
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
  clearInterval(packetPollInterval);
});
</script>
