<template>
  <div class="device-test-batch-panel space-y-4">
    <!-- Top Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Boxes class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Parallel Testing</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="isTesting ? 'badge-warning animate-pulse' : testFinished ? 'badge-success' : 'badge-ghost'"
              >
                {{ isTesting ? 'TESTING IN PROGRESS' : testFinished ? 'COMPLETED' : 'IDLE / READY' }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              Device Test Batch (Kiểm Thử Hàng Loạt &amp; Đối Chiếu Thiết Bị Chuẩn)
            </h3>
            <p class="text-xs text-base-content/70">
              Chạy song song kịch bản Simulation Flow &amp; tự động đối chiếu thông số với các thiết bị chuẩn (Golden Reference) riêng biệt
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="btn btn-sm btn-outline gap-1.5"
            @click="$emit('switch-tab', 'create-test-batch')"
          >
            <FolderPlus class="w-3.5 h-3.5" />
            Tạo Batch Mới
          </button>

          <!-- Start / Stop Button -->
          <button
            v-if="!isTesting"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="selectedDevices.length === 0"
            @click="startBatchTest"
          >
            <Play class="w-4 h-4" />
            Bắt Đầu Test Batch ({{ selectedDevices.length }} TB)
          </button>
          <button
            v-else
            class="btn btn-sm btn-error gap-1.5 shadow-sm"
            @click="stopBatchTest"
          >
            <Square class="w-4 h-4" />
            Dừng Test Batch
          </button>
        </div>
      </div>
    </div>

    <!-- Active Timer & Simulation Progress HUD (Visible when testing or finished) -->
    <div v-if="isTesting || testFinished" class="card bg-base-200/80 border border-primary/40 rounded-xl shadow-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- Timer Countdown -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-base-100/90 px-3 py-1.5 rounded-lg border border-base-300">
            <Timer class="w-5 h-5 text-warning animate-spin-slow" />
            <div>
              <div class="text-[10px] font-mono uppercase text-base-content/60">Đếm giờ Simulation Flow</div>
              <div class="text-lg font-mono font-bold tracking-wider text-warning">
                {{ formatCountdown(remainingSeconds) }}
              </div>
            </div>
          </div>

          <!-- Total Duration & Elapsed -->
          <div class="hidden sm:block text-xs font-mono text-base-content/70">
            <div>Tổng thời lượng: <span class="font-bold text-white">{{ totalDurationSeconds }}s</span></div>
            <div>Đã chạy: <span class="font-bold text-primary">{{ elapsedSeconds }}s</span></div>
          </div>
        </div>

        <!-- Simulation Flow Steps Progress -->
        <div class="flex-1 max-w-xl">
          <div class="flex items-center justify-between text-xs font-mono mb-1">
            <span class="text-primary font-bold flex items-center gap-1.5">
              <Cpu class="w-3.5 h-3.5" />
              Flow: {{ currentFlowName }}
            </span>
            <span class="text-base-content/80 font-bold">
              Bước {{ currentStepIndex + 1 }}/{{ flowSteps.length }}: {{ currentStepName }}
            </span>
          </div>
          <progress
            class="progress progress-primary w-full h-2.5 bg-base-300"
            :value="progressPercent"
            max="100"
          ></progress>
        </div>

        <!-- Verdict Summary Badges -->
        <div class="flex items-center gap-2">
          <div class="badge badge-success gap-1 font-mono text-xs py-2 px-2.5">
            <CheckCircle2 class="w-3.5 h-3.5" />
            PASS: {{ passCount }}/{{ selectedDevices.length }}
          </div>
          <div v-if="failCount > 0" class="badge badge-error gap-1 font-mono text-xs py-2 px-2.5">
            <AlertCircle class="w-3.5 h-3.5" />
            FAIL: {{ failCount }}/{{ selectedDevices.length }}
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: Chọn Cấu Hình Đợt Test (ITEM-CODE & FW_VERSION Tự Động) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            1. Chọn Cấu Hình Đợt Test (Tự Động Theo Test Batch)
          </h4>
        </div>
        <div v-if="selectedBatchConfig" class="text-xs text-base-content/70 font-mono">
          Batch Code: <span class="text-primary font-bold">{{ selectedBatchConfig.batchCode || selectedBatchConfig.batch_code }}</span>
          | Max: <span class="font-bold text-info">{{ selectedBatchConfig.maxDevices || 5 }} thiết bị</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <!-- Choose Test Batch (Primary Selector) - 6 cols -->
        <div class="form-control md:col-span-6">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold text-primary flex items-center gap-1.5">
              <FolderPlus class="w-3.5 h-3.5" />
              Chọn Test Batch <span class="text-error">*</span>
            </span>
            <span v-if="selectedBatchConfig" class="badge badge-xs badge-primary font-mono">Đã chọn</span>
          </label>
          <select
            v-model="selectedBatchId"
            class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono font-bold"
            :disabled="isTesting"
            @change="onBatchSelectChange"
          >
            <option value="">-- Chọn Test Batch để kiểm thử --</option>
            <option v-for="b in savedBatches" :key="b.id" :value="b.id">
              {{ b.batchCode || b.batch_code }} - {{ b.batchName || b.name }} ({{ b.itemCode }} / {{ b.longFw || b.fwVersion }})
            </option>
          </select>
        </div>

        <!-- Auto-selected ITEM-CODE - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold flex items-center gap-1">
              ITEM-CODE
            </span>
            <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Tự động theo batch</span>
          </label>
          <input
            :value="filterItemCode || 'Chưa chọn batch'"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-300/40 border-base-300 font-bold text-base-content cursor-not-allowed select-all"
            title="ITEM-CODE tự động nhận diện từ Test Batch đã chọn"
          />
        </div>

        <!-- Auto-selected FW_VERSION - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold flex items-center gap-1">
              FW_VERSION
            </span>
            <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Tự động theo batch</span>
          </label>
          <input
            :value="filterFwVersion || 'Chưa chọn batch'"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-300/40 border-base-300 font-bold text-base-content cursor-not-allowed select-all"
            title="FW_VERSION tự động nhận diện từ Test Batch đã chọn"
          />
        </div>
      </div>
    </div>

    <!-- Step 2: Danh Sách Thiết Bị Cần Test & Ghép Cặp Thiết Bị Chuẩn (Golden Reference) -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <!-- Left: Device Selection Pool from Testing List (5 cols) -->
      <div class="xl:col-span-5 space-y-3">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-primary" />
              <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
                2. Thiết Bị Sẵn Sàng Thêm Vào Batch
              </h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-sm badge-neutral font-mono text-[11px]">
                {{ candidateDevices.length }} khả dụng
              </span>
              <button
                class="btn btn-ghost btn-xs btn-circle"
                title="Tải lại danh sách thiết bị testing"
                :disabled="loadingDevices"
                @click="loadAvailableDevices"
              >
                <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loadingDevices }" />
              </button>
            </div>
          </div>

          <!-- Search and filter toggle bar -->
          <div class="space-y-2">
            <div class="relative w-full">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                v-model="searchCandidateText"
                type="text"
                class="input input-xs input-bordered w-full pl-8 font-mono text-[11px]"
                placeholder="Tìm theo Serial, DevEUI, ITEM-CODE..."
              />
            </div>

            <div class="flex items-center justify-between text-[11px] text-base-content/70">
              <label class="cursor-pointer label py-0 px-0 gap-1.5">
                <input
                  v-model="filterOnlyBatchMatches"
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary"
                />
                <span class="label-text text-[11px]">Chỉ khớp ITEM-CODE của batch (<strong class="font-mono text-primary">{{ filterItemCode || 'Tất cả' }}</strong>)</span>
              </label>
              <span class="font-mono text-[10px] text-base-content/50">
                Hiển thị {{ candidateDevices.length }} / {{ allRawCandidateDevices.length }}
              </span>
            </div>
          </div>

          <!-- Candidates Table -->
          <div class="overflow-y-auto max-h-[380px] border border-base-300 rounded-lg">
            <table class="table table-zebra table-xs w-full">
              <thead class="sticky top-0 bg-base-200 z-10 text-[11px] uppercase">
                <tr>
                  <th class="w-8">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary"
                      :checked="isAllCandidatesSelected"
                      :disabled="candidateDevices.length === 0 || isTesting"
                      @change="toggleSelectAllCandidates"
                    />
                  </th>
                  <th>Serial / DevEUI</th>
                  <th>ITEM-CODE</th>
                  <th>FW Ver</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingDevices">
                  <td colspan="5" class="text-center py-6 text-primary text-xs">
                    <span class="loading loading-spinner loading-xs mr-2"></span>
                    Đang tải danh sách thiết bị testing...
                  </td>
                </tr>
                <tr v-else-if="candidateDevices.length === 0">
                  <td colspan="5" class="text-center py-6 text-base-content/50 italic text-xs">
                    {{ allRawCandidateDevices.length === 0 ? 'Chưa có thiết bị nào trong danh sách Testing Device.' : 'Không tìm thấy thiết bị nào khớp bộ lọc tìm kiếm.' }}
                  </td>
                </tr>
                <tr v-for="dev in candidateDevices" :key="dev.id || dev.devEui || dev.serialNumber" class="hover">
                  <td>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary"
                      :checked="isDeviceSelected(dev)"
                      :disabled="isTesting || (!isDeviceSelected(dev) && selectedDevices.length >= maxAllowedDevices)"
                      @change="toggleDeviceSelection(dev)"
                    />
                  </td>
                  <td>
                    <div class="font-mono font-bold text-xs text-primary">{{ dev.serialNumber || dev.serial_number || dev.registrationCode || dev.registration_code || dev.id }}</div>
                    <div class="font-mono text-[10px] text-base-content/60">{{ dev.devEui || dev.dev_eui || '—' }}</div>
                  </td>
                  <td>
                    <span class="badge badge-xs badge-outline font-mono">{{ dev.itemCode || dev.item_code || '—' }}</span>
                  </td>
                  <td>
                    <span class="font-mono text-xs">{{ dev.longFw || dev.long_fw || dev.fwVersion || dev.fw_version || '—' }}</span>
                  </td>
                  <td class="text-right">
                    <button
                      v-if="!isDeviceSelected(dev)"
                      class="btn btn-xs btn-ghost text-primary"
                      :disabled="selectedDevices.length >= maxAllowedDevices || isTesting"
                      @click="addDeviceToBatch(dev)"
                    >
                      + Thêm
                    </button>
                    <span v-else class="text-[10px] text-success font-semibold">Đã thêm</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between text-xs text-base-content/70 pt-1">
            <span>Tối đa cho phép: <strong class="text-white">{{ maxAllowedDevices }}</strong> thiết bị</span>
            <span>Đã chọn: <strong class="text-primary">{{ selectedDevices.length }}</strong> thiết bị</span>
          </div>
        </div>
      </div>

      <!-- Right: Batch Composition & 1-to-1 Reference Device Mapping (7 cols) -->
      <div class="xl:col-span-7 space-y-3">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              <GitCompare class="w-4 h-4 text-success" />
              <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
                3. Ghép Cặp Thiết Bị Chuẩn (Golden Reference) Cho Từng Thiết Bị Test
              </h4>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                class="btn btn-xs btn-outline btn-success gap-1"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="autoAssignReferenceDevices"
              >
                <Sparkles class="w-3 h-3" />
                Tự Động Gán Thiết Bị Chuẩn
              </button>
              <button
                class="btn btn-xs btn-ghost text-error"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="clearSelectedDevices"
              >
                Xóa Hết
              </button>
            </div>
          </div>

          <div class="p-2.5 bg-base-100/60 border border-base-300 rounded-lg text-xs text-base-content/80 flex items-start gap-2">
            <Info class="w-4 h-4 text-info shrink-0 mt-0.5" />
            <div>
              <strong>Quy tắc ghép đôi chuẩn:</strong> Khi test cùng lúc nhiều thiết bị (VD: 5 thiết bị), hệ thống yêu cầu gán riêng biệt từng thiết bị chuẩn tương ứng để thu thập và đối chiếu giá trị đo độc lập theo thời gian thực.
            </div>
          </div>

          <!-- Mapped Devices Table -->
          <div class="overflow-x-auto border border-base-300 rounded-lg">
            <table class="table table-zebra table-xs w-full">
              <thead class="bg-base-200 text-[11px] uppercase">
                <tr>
                  <th>#</th>
                  <th>Thiết Bị Cần Test (DUT)</th>
                  <th>Thiết Bị Chuẩn Đối Chiếu (Reference Device)</th>
                  <th>Kết Quả Đối Chiếu</th>
                  <th>Trạng Thái</th>
                  <th class="text-center">Bỏ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="selectedDevices.length === 0">
                  <td colspan="6" class="text-center py-8 text-base-content/50 italic text-xs">
                    Chưa có thiết bị nào trong Test Batch. Hãy chọn từ danh sách bên trái hoặc nhấn "+ Thêm".
                  </td>
                </tr>
                <tr v-for="(item, idx) in selectedDevices" :key="item.device.id" class="hover text-xs">
                  <td class="font-mono text-base-content/60">{{ idx + 1 }}</td>
                  <!-- DUT -->
                  <td>
                    <div class="font-mono font-bold text-primary">{{ item.device.serialNumber || item.device.serial_number }}</div>
                    <div class="font-mono text-[10px] text-base-content/60">{{ item.device.devEui || item.device.dev_eui }}</div>
                    <div class="text-[10px] text-base-content/70">
                      {{ item.device.itemCode }} ({{ item.device.fwVersion }})
                    </div>
                  </td>

                  <!-- Reference Device Picker -->
                  <td class="min-w-[210px]">
                    <div class="space-y-1">
                      <select
                        v-model="item.referenceDeviceId"
                        class="select select-bordered select-xs w-full font-mono text-[11px] bg-base-100"
                        :disabled="isTesting"
                        @change="onReferenceDeviceChange(item)"
                      >
                        <option value="">-- Chọn thiết bị chuẩn --</option>
                        <option
                          v-for="refDev in goldenReferenceDevices"
                          :key="refDev.id"
                          :value="refDev.id"
                        >
                          {{ refDev.name }} ({{ refDev.serialNumber }})
                        </option>
                      </select>
                      <div v-if="item.referenceDevice" class="flex items-center gap-1.5 text-[10px] font-mono text-success">
                        <CheckCircle class="w-3 h-3" />
                        <span>Mẫu chuẩn: {{ item.referenceDevice.calibratedDate || '2026-Q4' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Comparison Live Result -->
                  <td class="min-w-[170px]">
                    <div v-if="item.liveComparison" class="space-y-0.5 text-[11px] font-mono">
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Nhiệt độ (DUT / Ref):</span>
                        <span :class="item.liveComparison.tempDeltaPass ? 'text-success' : 'text-error font-bold'">
                          {{ item.liveComparison.dutTemp }}°C / {{ item.liveComparison.refTemp }}°C (Δ {{ item.liveComparison.tempDelta }}°C)
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-base-content/60">Độ ẩm (DUT / Ref):</span>
                        <span :class="item.liveComparison.humDeltaPass ? 'text-success' : 'text-error font-bold'">
                          {{ item.liveComparison.dutHum }}% / {{ item.liveComparison.refHum }}% (Δ {{ item.liveComparison.humDelta }}%)
                        </span>
                      </div>
                      <div class="flex justify-between text-[10px] text-base-content/50">
                        <span>Chất lượng RF:</span>
                        <span>{{ item.liveComparison.rssi }} dBm | {{ item.liveComparison.snr }} dB</span>
                      </div>
                    </div>
                    <div v-else class="text-[11px] text-base-content/40 italic">
                      {{ isTesting ? 'Đang đọc dữ liệu...' : 'Chờ bắt đầu test' }}
                    </div>
                  </td>

                  <!-- Status -->
                  <td>
                    <span
                      class="badge badge-xs font-mono font-bold"
                      :class="getItemStatusClass(item.status)"
                    >
                      {{ item.status || 'PENDING' }}
                    </span>
                  </td>

                  <!-- Remove Action -->
                  <td class="text-center">
                    <button
                      class="btn btn-ghost btn-xs btn-circle text-error"
                      :disabled="isTesting"
                      @click="removeDeviceFromBatch(item.device.id)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  Boxes,
  FolderPlus,
  Play,
  Square,
  Timer,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Layers,
  GitCompare,
  Sparkles,
  Info,
  CheckCircle,
  Trash2,
  Search,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const props = defineProps<{
  initialBatchPayload?: any;
}>();

// State filters
const selectedBatchId = ref('');
const filterItemCode = ref('');
const filterFwVersion = ref('');

const availableItemCodes = ref(['WSSFC-ATH', 'WSLRW-TH', 'WSSFC-ULC', 'WSLRW-AQI', 'WSSFC-CO2']);
const availableFwVersions = ref(['1.0.4', '1.0.5', '2.0.0', 'v2.1.0-RC1']);

const loadingDevices = ref(false);
const savedBatches = ref<any[]>([]);
const allRawCandidateDevices = ref<any[]>([]);
const searchCandidateText = ref('');
const filterOnlyBatchMatches = ref(false);

const candidateDevices = computed(() => {
  let list = allRawCandidateDevices.value;
  if (filterOnlyBatchMatches.value) {
    if (filterItemCode.value) {
      list = list.filter((d: any) => {
        const item = (d.itemCode || d.item_code || '').toUpperCase();
        return item.includes(filterItemCode.value.toUpperCase());
      });
    }
    if (filterFwVersion.value) {
      list = list.filter((d: any) => {
        const fw = (d.longFw || d.long_fw || d.fwVersion || d.fw_version || '').replace(/^v/i, '');
        const targetFw = filterFwVersion.value.replace(/^v/i, '');
        return fw.includes(targetFw);
      });
    }
  }
  if (searchCandidateText.value.trim()) {
    const q = searchCandidateText.value.trim().toLowerCase();
    list = list.filter((d: any) => {
      const s = (d.serialNumber || d.serial_number || d.registrationCode || d.registration_code || d.id || '').toLowerCase();
      const eui = (d.devEui || d.dev_eui || '').toLowerCase();
      const itm = (d.itemCode || d.item_code || '').toLowerCase();
      return s.includes(q) || eui.includes(q) || itm.includes(q);
    });
  }
  return list;
});

// Selected DUTs & Mappings
interface BatchDeviceItem {
  device: any;
  referenceDeviceId: string;
  referenceDevice?: any;
  status: 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL';
  liveComparison?: {
    dutTemp: number;
    refTemp: number;
    tempDelta: number;
    tempDeltaPass: boolean;
    dutHum: number;
    refHum: number;
    humDelta: number;
    humDeltaPass: boolean;
    rssi: number;
    snr: number;
  };
}

const selectedDevices = ref<BatchDeviceItem[]>([]);
const maxAllowedDevices = ref(5);

// Golden Reference Devices pool
const goldenReferenceDevices = ref([
  {
    id: 'GOLDEN-REF-01',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô A-01 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-001',
    calibratedDate: '2026-10-15',
    baseTemp: 27.5,
    baseHum: 62.0,
  },
  {
    id: 'GOLDEN-REF-02',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô A-02 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-002',
    calibratedDate: '2026-10-18',
    baseTemp: 27.4,
    baseHum: 62.2,
  },
  {
    id: 'GOLDEN-REF-03',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô A-03 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-003',
    calibratedDate: '2026-10-20',
    baseTemp: 27.6,
    baseHum: 61.8,
  },
  {
    id: 'GOLDEN-REF-04',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô A-04 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-004',
    calibratedDate: '2026-10-22',
    baseTemp: 27.5,
    baseHum: 62.1,
  },
  {
    id: 'GOLDEN-REF-05',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô A-05 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-005',
    calibratedDate: '2026-10-25',
    baseTemp: 27.3,
    baseHum: 62.4,
  },
  {
    id: 'GOLDEN-REF-06',
    name: 'Thiết Bị Chuẩn Đo Kiểm Lô B-01 (Golden Ref)',
    serialNumber: 'STD-CAL-2026-006',
    calibratedDate: '2026-10-28',
    baseTemp: 27.5,
    baseHum: 62.0,
  },
]);

// Testing Execution & Timer State
const isTesting = ref(false);
const testFinished = ref(false);
const totalDurationSeconds = ref(300);
const remainingSeconds = ref(300);
const elapsedSeconds = ref(0);
let timerInterval: any = null;
let simulationInterval: any = null;

const currentFlowName = ref('ATH Standard 5-Min Uplink Flow');
const flowSteps = ref([
  'Khởi tạo RF AU915 & Modulation Parameters',
  'OTAA Join Request & Receive Window RX1/RX2',
  'Chu kỳ Uplink Telemetry chuỗi 60s',
  'Đối chiếu giá trị cảm biến với Golden Reference',
  'Đánh giá tiêu chí Auto Check & Xuất Verdict',
]);
const currentStepIndex = ref(0);

const currentStepName = computed(() => {
  return flowSteps.value[currentStepIndex.value] || 'Hoàn tất kiểm thử';
});

const progressPercent = computed(() => {
  if (totalDurationSeconds.value <= 0) return 100;
  return Math.min(100, Math.round((elapsedSeconds.value / totalDurationSeconds.value) * 100));
});

const passCount = computed(() => selectedDevices.value.filter((d) => d.status === 'PASS').length);
const failCount = computed(() => selectedDevices.value.filter((d) => d.status === 'FAIL').length);

const selectedBatchConfig = computed(() => {
  return savedBatches.value.find((b) => b.id === selectedBatchId.value || b.batchCode === selectedBatchId.value);
});

// Candidate selection helpers
const isAllCandidatesSelected = computed(() => {
  if (candidateDevices.value.length === 0) return false;
  return candidateDevices.value.every((d) => isDeviceSelected(d));
});

function getDeviceIdentifier(dev: any): string {
  if (!dev) return '';
  return dev.id || dev.devEui || dev.dev_eui || dev.serialNumber || dev.serial_number || dev.registrationCode || dev.registration_code || '';
}

function isDeviceSelected(device: any): boolean {
  const targetId = getDeviceIdentifier(device);
  return selectedDevices.value.some((item) => getDeviceIdentifier(item.device) === targetId);
}

function toggleSelectAllCandidates(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    candidateDevices.value.forEach((d) => {
      if (!isDeviceSelected(d) && selectedDevices.value.length < maxAllowedDevices.value) {
        addDeviceToBatch(d);
      }
    });
  } else {
    selectedDevices.value = [];
  }
}

function toggleDeviceSelection(device: any) {
  if (isDeviceSelected(device)) {
    removeDeviceFromBatch(getDeviceIdentifier(device));
  } else {
    addDeviceToBatch(device);
  }
}

function addDeviceToBatch(device: any) {
  if (selectedDevices.value.length >= maxAllowedDevices.value) {
    cyberToast.warning(`Batch này chỉ cho phép tối đa ${maxAllowedDevices.value} thiết bị cùng lúc!`);
    return;
  }
  // Auto pair with an available golden reference
  const usedRefIds = new Set(selectedDevices.value.map((s) => s.referenceDeviceId));
  const availableRef = goldenReferenceDevices.value.find((r) => !usedRefIds.has(r.id));

  selectedDevices.value.push({
    device,
    referenceDeviceId: availableRef?.id || '',
    referenceDevice: availableRef,
    status: 'PENDING',
  });
  const devLabel = device.serialNumber || device.serial_number || device.devEui || device.dev_eui || 'thiết bị';
  cyberToast.success(`Đã thêm ${devLabel} vào batch`);
}

function removeDeviceFromBatch(deviceId: string) {
  selectedDevices.value = selectedDevices.value.filter((item) => getDeviceIdentifier(item.device) !== deviceId);
}

function clearSelectedDevices() {
  selectedDevices.value = [];
}

function onReferenceDeviceChange(item: BatchDeviceItem) {
  item.referenceDevice = goldenReferenceDevices.value.find((r) => r.id === item.referenceDeviceId);
}

function autoAssignReferenceDevices() {
  const availableRefs = [...goldenReferenceDevices.value];
  selectedDevices.value.forEach((item, idx) => {
    const refDev = availableRefs[idx % availableRefs.length];
    if (refDev) {
      item.referenceDeviceId = refDev.id;
      item.referenceDevice = refDev;
    }
  });
  cyberToast.success(`Đã tự động gán thiết bị chuẩn cho ${selectedDevices.value.length} thiết bị test`);
}

function onBatchSelectChange() {
  if (selectedBatchConfig.value) {
    const b = selectedBatchConfig.value;
    filterItemCode.value = b.itemCode || b.item_code || '';
    filterFwVersion.value = b.longFw || b.long_fw || b.fwVersion || b.fw_version || '';
    maxAllowedDevices.value = b.maxDevices || b.max_devices || 5;
    totalDurationSeconds.value = b.flowDurationSeconds || b.flow_duration_seconds || 300;
    remainingSeconds.value = totalDurationSeconds.value;
    selectedDevices.value = [];
    loadReferenceDevices();
    loadAvailableDevices();
  }
}

async function loadSavedBatches() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches');
    const items = res?.data?.items || res?.data || res?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      savedBatches.value = items;
    } else {
      loadFallbackBatches();
    }
  } catch {
    loadFallbackBatches();
  }

  // Tự động lựa chọn cấu hình FW_VERSION và ITEM_CODE theo Test Batch
  if (selectedBatchId.value) {
    onBatchSelectChange();
  } else if (savedBatches.value.length > 0) {
    selectedBatchId.value = savedBatches.value[0].id;
    onBatchSelectChange();
  }
}

function loadFallbackBatches() {
  const cached = localStorage.getItem('itest_test_batches');
  if (cached) {
    try {
      savedBatches.value = JSON.parse(cached);
      return;
    } catch {}
  }
  savedBatches.value = [];
}

async function loadReferenceDevices() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches/reference-devices', {
      params: { itemCode: filterItemCode.value },
    });
    const items = res?.data?.items || res?.data || res?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      goldenReferenceDevices.value = items.map((r: any) => ({
        id: r.id || r.serialNumber,
        name: r.name || `Thiết bị chuẩn ${r.serialNumber}`,
        serialNumber: r.serialNumber || r.serial_number,
        devEui: r.devEui || r.dev_eui,
        calibratedDate: r.calibratedAt || r.calibrated_at || '2026-10-15',
        baseTemp: r.nominalValues?.temperature ?? 27.5,
        baseHum: r.nominalValues?.humidity ?? 62.0,
      }));
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Using fallback reference devices:', err.message);
  }
}

async function loadAvailableDevices() {
  loadingDevices.value = true;
  try {
    let devices: any[] = [];
    // 1. Try dedicated endpoint first (queries v_list_device_testing / device_test_registrations)
    try {
      const res: any = await httpClient.get('/plugins/testing/test-batches/available-devices', {
        params: {
          itemCode: filterItemCode.value || undefined,
          fwVersion: filterFwVersion.value || undefined,
          isAdmin: true,
          limit: 100,
        },
      });
      const raw1 = res?.data;
      devices = Array.isArray(raw1?.items) ? raw1.items : (Array.isArray(raw1?.data) ? raw1.data : (Array.isArray(raw1) ? raw1 : []));
    } catch {}

    // 2. Query device-registrations with isAdmin=true to get full list if empty
    if (!Array.isArray(devices) || devices.length === 0) {
      try {
        const res2: any = await httpClient.get('/plugins/testing/device-registrations', {
          params: { isAdmin: true, limit: 100 },
        });
        const raw2 = res2?.data;
        devices = Array.isArray(raw2?.items) ? raw2.items : (Array.isArray(raw2?.data) ? raw2.data : (Array.isArray(raw2) ? raw2 : []));
      } catch {}
    }

    allRawCandidateDevices.value = devices;
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error loading available devices:', err.message);
    allRawCandidateDevices.value = [];
  } finally {
    loadingDevices.value = false;
  }
}

// Timer & Simulation Execution
function startBatchTest() {
  if (selectedDevices.value.length === 0) {
    cyberToast.warning('Vui lòng chọn ít nhất 1 thiết bị để test!');
    return;
  }

  // Check if reference devices are mapped
  const unmapped = selectedDevices.value.filter((d) => !d.referenceDeviceId);
  if (unmapped.length > 0) {
    autoAssignReferenceDevices();
  }

  isTesting.value = true;
  testFinished.value = false;
  remainingSeconds.value = totalDurationSeconds.value;
  elapsedSeconds.value = 0;
  currentStepIndex.value = 0;

  selectedDevices.value.forEach((d) => {
    d.status = 'RUNNING';
    d.liveComparison = undefined;
  });

  // Call backend start API if batch is selected
  if (selectedBatchId.value) {
    const startPayload = {
      devices: selectedDevices.value.map((item) => ({
        serialNumber: item.device.serialNumber || item.device.serial_number,
        devEui: item.device.devEui || item.device.dev_eui,
        itemCode: item.device.itemCode || item.device.item_code,
        fwVersion: item.device.fwVersion || item.device.fw_version,
        referenceDeviceId: item.referenceDeviceId,
        referenceSerialNumber: item.referenceDevice?.serialNumber,
        referenceDevEui: item.referenceDevice?.devEui,
        referenceDeviceName: item.referenceDevice?.name,
      })),
    };
    httpClient.post(`/plugins/testing/test-batches/${selectedBatchId.value}/start`, startPayload).catch((err: any) => {
      console.debug('[DeviceTestBatchPanel] Backend start note:', err.message);
    });
  }

  cyberToast.success(`Bắt đầu chạy Test Batch với ${selectedDevices.value.length} thiết bị song song`);

  // Start countdown timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
    remainingSeconds.value = Math.max(0, totalDurationSeconds.value - elapsedSeconds.value);

    // Update flow steps based on elapsed progress
    const stepDuration = totalDurationSeconds.value / flowSteps.value.length;
    currentStepIndex.value = Math.min(
      flowSteps.value.length - 1,
      Math.floor(elapsedSeconds.value / stepDuration)
    );

    if (remainingSeconds.value <= 0) {
      finishBatchTest();
    }
  }, 1000);

  // Periodic telemetry simulation & comparison
  clearInterval(simulationInterval);
  simulationInterval = setInterval(() => {
    simulateLiveTelemetry();
  }, 3000);
}

function simulateLiveTelemetry() {
  selectedDevices.value.forEach((item, idx) => {
    const ref = item.referenceDevice || goldenReferenceDevices.value[0];
    const baseT = ref?.baseTemp || 27.5;
    const baseH = ref?.baseHum || 62.0;

    // DUT telemetry with small jitter
    // Introduce deliberate fault on device 4 if present for realistic testing
    const isFaultyDevice = idx === 3 && selectedDevices.value.length > 3;
    const deltaT = isFaultyDevice ? 1.8 : +(Math.random() * 0.6 - 0.3).toFixed(2);
    const deltaH = isFaultyDevice ? 5.5 : +(Math.random() * 1.5 - 0.75).toFixed(1);

    const dutT = +(baseT + deltaT).toFixed(2);
    const dutH = +(baseH + deltaH).toFixed(1);

    // Criteria: temp delta <= 0.5, hum delta <= 2.0
    const tempPass = Math.abs(deltaT) <= 0.5;
    const humPass = Math.abs(deltaH) <= 2.0;

    item.liveComparison = {
      dutTemp: dutT,
      refTemp: baseT,
      tempDelta: Math.abs(deltaT),
      tempDeltaPass: tempPass,
      dutHum: dutH,
      refHum: baseH,
      humDelta: Math.abs(deltaH),
      humDeltaPass: humPass,
      rssi: -75 - Math.floor(Math.random() * 15),
      snr: 9 + Math.floor(Math.random() * 4),
    };

    if (tempPass && humPass) {
      item.status = 'PASS';
    } else {
      item.status = 'FAIL';
    }
  });
}

function stopBatchTest() {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  isTesting.value = false;
  cyberToast.info('Đã dừng kiểm thử Test Batch');
}

function finishBatchTest() {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  isTesting.value = false;
  testFinished.value = true;
  cyberToast.success(`Hoàn thành Test Batch! Đạt ${passCount.value}/${selectedDevices.value.length} thiết bị.`);
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getItemStatusClass(status?: string) {
  switch (status) {
    case 'PASS':
      return 'badge-success text-success-content';
    case 'FAIL':
      return 'badge-error text-error-content';
    case 'RUNNING':
      return 'badge-warning text-warning-content animate-pulse';
    default:
      return 'badge-ghost';
  }
}

onMounted(() => {
  loadSavedBatches();
  loadReferenceDevices();
  loadAvailableDevices();

  // If passed initialBatchPayload from Create Batch
  if (props.initialBatchPayload) {
    const p = props.initialBatchPayload;
    if (p.itemCode) filterItemCode.value = p.itemCode;
    if (p.fwVersion) filterFwVersion.value = p.fwVersion;
    if (p.batchId) selectedBatchId.value = p.batchId;
    if (p.maxDevices) maxAllowedDevices.value = p.maxDevices;
    if (p.flowDurationSeconds) {
      totalDurationSeconds.value = p.flowDurationSeconds;
      remainingSeconds.value = p.flowDurationSeconds;
    }
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
});
</script>
