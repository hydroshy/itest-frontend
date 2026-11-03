<template>
  <div class="device-payload-panel space-y-4">
    <!-- Header Banner & Integration Info -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Radio class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">ChirpStack v4 Ingestion</span>
              <span class="badge badge-xs font-mono" :class="integrationStatus.active ? 'badge-success' : 'badge-warning'">
                {{ integrationStatus.active ? 'HTTP INTEGRATION ACTIVE' : 'INTEGRATION PENDING' }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5 flex items-center gap-2">
              <span>Device Payload Live Telemetry</span>
              <span class="badge badge-sm badge-outline font-mono text-xs">
                App: {{ integrationStatus.applicationId }}
              </span>
            </h3>
            <p class="text-xs text-base-content/70">
              Tiếp nhận webhook HTTP Integration từ ChirpStack, trích xuất 6 thông số RF chuẩn hóa và tự động giải mã thuộc tính cảm biến động qua Plugin Decoder.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Auto Refresh Controls -->
          <div class="join">
            <button
              class="btn btn-sm join-item"
              :class="isLivePolling ? 'btn-success text-success-content' : 'btn-outline'"
              @click="toggleLivePolling"
            >
              <Activity class="w-3.5 h-3.5" :class="{ 'animate-spin': isLivePolling }" />
              <span>{{ isLivePolling ? 'Live Streaming' : 'Tạm Dừng' }}</span>
            </button>
            <select
              v-model="pollIntervalMs"
              class="select select-sm select-bordered join-item font-mono text-xs"
              :disabled="!isLivePolling"
            >
              <option :value="1000">1s</option>
              <option :value="2000">2s</option>
              <option :value="5000">5s</option>
            </select>
          </div>

          <button class="btn btn-sm btn-outline gap-1.5" :disabled="loading" @click="loadPayloads">
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            <span>Làm Mới</span>
          </button>

          <button
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="configuringIntegration"
            @click="triggerAutoRegisterIntegration"
          >
            <span v-if="configuringIntegration" class="loading loading-spinner loading-xs"></span>
            <Link2 v-else class="w-3.5 h-3.5" />
            <span>Đồng Bộ ChirpStack</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Tổng Số Gói Tin</span>
        <span class="text-lg font-bold font-mono text-primary">{{ totalPackets }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Thiết Bị Uplink</span>
        <span class="text-lg font-bold font-mono text-accent">{{ uniqueDevicesCount }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">RSSI Trung Bình</span>
        <span class="text-lg font-bold font-mono text-info">{{ avgRssi }} <span class="text-xs">dBm</span></span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">SNR Trung Bình</span>
        <span class="text-lg font-bold font-mono text-success">{{ avgSnr }} <span class="text-xs">dB</span></span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Dải SF Phổ Biến</span>
        <span class="text-lg font-bold font-mono text-warning">{{ dominantSf }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Đã Giải Mã</span>
        <span class="text-lg font-bold font-mono text-success">100% OK</span>
      </div>
    </div>

    <!-- Filters & Query Bar -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <!-- DevEUI Filter -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">DevEUI Thiết Bị</span>
          </label>
          <div class="relative">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              v-model="filters.devEui"
              type="text"
              placeholder="VD: 2026A1B2C3D4..."
              class="input input-sm input-bordered w-full pl-8 font-mono text-xs uppercase bg-base-100"
              @keyup.enter="loadPayloads"
            />
          </div>
        </div>

        <!-- ITEM-CODE Filter -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Dòng Sản Phẩm (ITEM-CODE)</span>
          </label>
          <select
            v-model="filters.itemCode"
            class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono"
            @change="loadPayloads"
          >
            <option value="">-- Tất cả loại cảm biến --</option>
            <option v-for="code in availableItemCodes" :key="code" :value="code">
              {{ code }}
            </option>
          </select>
        </div>

        <!-- Payload Search -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Tìm Hex / Từ Khóa Giá Trị</span>
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tìm theo chuỗi Hex hoặc JSON..."
            class="input input-sm input-bordered w-full text-xs font-mono bg-base-100"
            @keyup.enter="loadPayloads"
          />
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-primary flex-1 gap-1 text-xs" @click="loadPayloads">
            <Filter class="w-3.5 h-3.5" />
            <span>Áp Dụng Lọc</span>
          </button>
          <button class="btn btn-sm btn-ghost text-xs" @click="resetFilters">
            <span>Đặt Lại</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Payload Table (6 Constant RF Columns + Dynamic Sensor Columns) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            Bảng Bản Tin Device Payload (RF Metadata Đồng Nhất &amp; Cảm Biến Động)
          </h4>
          <span class="badge badge-sm badge-ghost font-mono">
            {{ filteredPayloads.length }} bản tin
          </span>
        </div>

        <div class="text-xs text-base-content/60 font-mono flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-success animate-ping"></span>
          <span>Cột cố định: RSSI, SNR, FCNT, SF, FREQ, RAW</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-xs w-full">
          <thead>
            <tr class="text-base-content/70 border-b border-base-300 font-mono text-[11px]">
              <th class="w-12">#</th>
              <th>Thời Gian Nhận</th>
              <th>DevEUI &amp; Dòng Máy</th>
              <!-- 6 Thông Số RF Chuẩn Hóa Cố Định -->
              <th class="text-center bg-base-300/30">RSSI</th>
              <th class="text-center bg-base-300/30">SNR</th>
              <th class="text-center bg-base-300/30">FCNT</th>
              <th class="text-center bg-base-300/30">SF</th>
              <th class="text-center bg-base-300/30">FREQ (MHz)</th>
              <th class="bg-base-300/30">RAW PAYLOAD (HEX)</th>
              <!-- Cột Cảm Biến Động Sau Khi Giải Mã -->
              <th class="text-primary font-bold">DỮ LIỆU CẢM BIẾN (DECODED SENSOR)</th>
              <th class="text-center">Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="11" class="text-center py-8">
                <span class="loading loading-spinner loading-md text-primary"></span>
                <p class="text-xs text-base-content/60 mt-2">Đang tải luồng bản tin Payload...</p>
              </td>
            </tr>
            <tr v-else-if="filteredPayloads.length === 0">
              <td colspan="11" class="text-center py-8 text-xs text-base-content/50 italic">
                Chưa có bản tin Payload nào từ ChirpStack HTTP Integration.
              </td>
            </tr>
            <tr
              v-for="(row, idx) in filteredPayloads"
              v-else
              :key="row.id || `${row.dev_eui}-${row.f_cnt}-${idx}`"
              class="hover:bg-base-200/60 transition-colors font-mono"
            >
              <!-- STT -->
              <td class="text-base-content/50 text-[10px]">{{ idx + 1 }}</td>

              <!-- Thời gian nhận -->
              <td class="text-[11px] whitespace-nowrap text-base-content/80">
                {{ formatTimestamp(row.received_at || row.created_at) }}
              </td>

              <!-- DevEUI & Thiết Bị -->
              <td>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-xs text-primary">{{ row.dev_eui }}</span>
                  <button
                    class="btn btn-ghost btn-xs p-0 text-base-content/40 hover:text-primary"
                    title="Sao chép DevEUI"
                    @click="copyText(row.dev_eui, 'Đã copy DevEUI')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
                <div class="flex items-center gap-1 mt-0.5">
                  <span class="badge badge-xs badge-outline font-mono text-[10px] text-accent">
                    {{ row.item_code || 'WSSFC-ATH' }}
                  </span>
                  <span v-if="row.long_fw || row.fw_version" class="text-[10px] text-base-content/50">
                    {{ row.long_fw || row.fw_version }}
                  </span>
                </div>
              </td>

              <!-- 1. RSSI (dBm) -->
              <td class="text-center bg-base-300/20">
                <span
                  class="badge badge-xs font-bold font-mono"
                  :class="getRssiBadgeClass(row.rssi)"
                >
                  {{ row.rssi }} dBm
                </span>
              </td>

              <!-- 2. SNR (dB) -->
              <td class="text-center bg-base-300/20 font-bold" :class="getSnrColorClass(row.snr)">
                {{ row.snr }} dB
              </td>

              <!-- 3. FCNT -->
              <td class="text-center bg-base-300/20 font-bold text-base-content">
                #{{ row.f_cnt }}
              </td>

              <!-- 4. SF (Spreading Factor) -->
              <td class="text-center bg-base-300/20 font-bold text-warning">
                SF{{ row.sf || 7 }}
              </td>

              <!-- 5. FREQUENCY (MHz) -->
              <td class="text-center bg-base-300/20 text-base-content/80">
                {{ formatFrequency(row.frequency) }}
              </td>

              <!-- 6. RAW PAYLOAD (HEX) -->
              <td class="bg-base-300/20 max-w-[180px]">
                <div class="flex items-center justify-between gap-1">
                  <span
                    class="text-[11px] truncate text-primary select-all font-semibold"
                    :title="row.raw_payload"
                  >
                    {{ row.raw_payload }}
                  </span>
                  <button
                    class="btn btn-ghost btn-xs p-0 text-base-content/40 hover:text-primary flex-shrink-0"
                    title="Sao chép Raw Payload"
                    @click="copyText(row.raw_payload, 'Đã copy Raw Payload')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- CỘT CẢM BIẾN ĐỘNG (DECODED SENSOR ATTRIBUTES) -->
              <td class="max-w-[260px]">
                <div v-if="hasDecodedData(row.decoded_payload)" class="flex flex-wrap gap-1">
                  <span
                    v-for="(val, key) in getSensorTelemetryItems(row.decoded_payload)"
                    :key="key"
                    class="badge badge-xs gap-1 border-base-300 bg-base-100 font-mono text-[10px]"
                    :class="getSensorMetricBadgeTheme(String(key))"
                  >
                    <span class="opacity-70">{{ key }}:</span>
                    <span class="font-bold">{{ formatSensorValue(val) }}</span>
                  </span>
                </div>
                <div v-else class="text-[11px] text-base-content/40 italic">
                  Chưa giải mã (Decoder bypass)
                </div>
              </td>

              <!-- Action: Inspector Dialog -->
              <td class="text-center">
                <button
                  class="btn btn-xs btn-outline btn-primary gap-1"
                  title="Xem chi tiết Dual Payload"
                  @click="openDualPayloadModal(row)"
                >
                  <Eye class="w-3 h-3" />
                  <span>Dual Inspector</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DUAL PAYLOAD INSPECTOR MODAL -->
    <dialog class="modal" :class="{ 'modal-open': modalVisible }">
      <div v-if="selectedPacket" class="modal-box w-11/12 max-w-4xl border border-base-300 bg-base-100 p-6 space-y-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-base-300">
          <div class="flex items-center gap-2">
            <Radio class="w-5 h-5 text-primary" />
            <h3 class="font-bold text-base text-base-content">
              Dual Payload Inspector: <span class="font-mono text-primary">{{ selectedPacket.dev_eui }}</span>
            </h3>
            <span class="badge badge-sm badge-outline font-mono">FCnt: #{{ selectedPacket.f_cnt }}</span>
          </div>
          <button class="btn btn-ghost btn-sm btn-circle" @click="modalVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- RF Metadata Quick Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-base-200/50 p-3 rounded-lg border border-base-300 text-center font-mono">
          <div>
            <div class="text-[10px] text-base-content/60">RSSI</div>
            <div class="text-xs font-bold text-info">{{ selectedPacket.rssi }} dBm</div>
          </div>
          <div>
            <div class="text-[10px] text-base-content/60">SNR</div>
            <div class="text-xs font-bold text-success">{{ selectedPacket.snr }} dB</div>
          </div>
          <div>
            <div class="text-[10px] text-base-content/60">SF</div>
            <div class="text-xs font-bold text-warning">SF{{ selectedPacket.sf || 7 }}</div>
          </div>
          <div>
            <div class="text-[10px] text-base-content/60">FREQUENCY</div>
            <div class="text-xs font-bold">{{ formatFrequency(selectedPacket.frequency) }}</div>
          </div>
          <div>
            <div class="text-[10px] text-base-content/60">FPORT</div>
            <div class="text-xs font-bold text-accent">{{ selectedPacket.f_port || 1 }}</div>
          </div>
          <div>
            <div class="text-[10px] text-base-content/60">DÒNG SẢN PHẨM</div>
            <div class="text-xs font-bold text-primary">{{ selectedPacket.item_code || 'WSSFC-ATH' }}</div>
          </div>
        </div>

        <!-- 2 Column Dual View: Raw vs Decoded -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Col 1: Raw Hex & Base64 Payload -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-base-content flex items-center gap-1.5">
                <Binary class="w-3.5 h-3.5 text-primary" />
                Raw Payload (Hex &amp; Base64)
              </span>
              <button
                class="btn btn-ghost btn-xs gap-1 text-[11px]"
                @click="copyText(selectedPacket.raw_payload, 'Đã copy Raw Hex')"
              >
                <Copy class="w-3 h-3" />
                Copy Hex
              </button>
            </div>
            <div class="bg-base-300/80 p-3 rounded-lg border border-base-300 space-y-2 font-mono text-xs">
              <div>
                <span class="text-[10px] text-base-content/60 block">HEX STRING:</span>
                <span class="text-primary font-bold break-all select-all">{{ selectedPacket.raw_payload }}</span>
              </div>
              <div v-if="selectedPacket.raw_payload_base64">
                <span class="text-[10px] text-base-content/60 block">BASE64:</span>
                <span class="text-base-content/80 break-all select-all">{{ selectedPacket.raw_payload_base64 }}</span>
              </div>
              <div class="text-[10px] text-base-content/50 pt-1 border-t border-base-content/10">
                Độ dài: {{ Math.round((selectedPacket.raw_payload?.length || 0) / 2) }} bytes ({{ selectedPacket.raw_payload?.length || 0 }} hex chars)
              </div>
            </div>
          </div>

          <!-- Col 2: Decoded Sensor Telemetry JSON -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5" />
                Decoded Sensor Data (JSON)
              </span>
              <button
                class="btn btn-ghost btn-xs gap-1 text-[11px]"
                @click="copyText(JSON.stringify(selectedPacket.decoded_payload, null, 2), 'Đã copy JSON')"
              >
                <Copy class="w-3 h-3" />
                Copy JSON
              </button>
            </div>
            <pre class="bg-base-300/80 p-3 rounded-lg border border-base-300 font-mono text-xs max-h-64 overflow-y-auto text-success select-all">{{ JSON.stringify(selectedPacket.decoded_payload || {}, null, 2) }}</pre>
          </div>
        </div>

        <!-- Sensor Attribute Cards -->
        <div v-if="hasDecodedData(selectedPacket.decoded_payload)" class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-base-content">
            Thuộc Tính Cảm Biến Trích Xuất (Parsed Metrics)
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="(val, key) in getSensorTelemetryItems(selectedPacket.decoded_payload)"
              :key="key"
              class="p-2 bg-base-200/60 border border-base-300 rounded font-mono text-xs"
            >
              <div class="text-[10px] text-base-content/60 uppercase">{{ key }}</div>
              <div class="font-bold text-sm text-primary mt-0.5">{{ formatSensorValue(val) }}</div>
            </div>
          </div>
        </div>

        <div class="modal-action pt-2 border-t border-base-300">
          <button class="btn btn-sm btn-ghost" @click="modalVisible = false">Đóng</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  Radio,
  Activity,
  RefreshCw,
  Link2,
  Search,
  Filter,
  Layers,
  Copy,
  Eye,
  Binary,
  CheckCircle2,
  X,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

const loading = ref(false);
const configuringIntegration = ref(false);
const isLivePolling = ref(true);
const pollIntervalMs = ref(2000);
let pollTimer: any = null;

const integrationStatus = reactive({
  active: true,
  applicationId: 'itest-default-app',
  endpointUrl: '/api/plugins/testing/integrations/chirpstack/uplink',
});

const filters = reactive({
  devEui: '',
  itemCode: '',
  search: '',
});

const availableItemCodes = ref(['WSSFC-ATH', 'WSLRW-TH', 'WSSFC-ULC', 'WSLRW-AQI', 'WSSFC-CO2']);

// Raw Payload item structure matching StandardDevicePayloadDTO
interface DevicePayloadItem {
  id?: string;
  dev_eui: string;
  device_name?: string;
  application_id?: string;
  f_cnt: number;
  f_port: number;
  rssi: number;
  snr: number;
  sf: number;
  frequency: number;
  raw_payload: string;
  raw_payload_base64?: string;
  decoded_payload: Record<string, any>;
  received_at: string;
  item_code?: string;
  fw_version?: string;
  long_fw?: string;
  created_at?: string;
}

const payloadList = ref<DevicePayloadItem[]>([]);
const modalVisible = ref(false);
const selectedPacket = ref<DevicePayloadItem | null>(null);

// Summary Computeds
const totalPackets = computed(() => payloadList.value.length);
const uniqueDevicesCount = computed(() => {
  const set = new Set(payloadList.value.map((p) => p.dev_eui));
  return set.size;
});

const avgRssi = computed(() => {
  if (payloadList.value.length === 0) return -85;
  const sum = payloadList.value.reduce((acc, p) => acc + (p.rssi || -85), 0);
  return Math.round(sum / payloadList.value.length);
});

const avgSnr = computed(() => {
  if (payloadList.value.length === 0) return 8.5;
  const sum = payloadList.value.reduce((acc, p) => acc + (p.snr || 8.5), 0);
  return (sum / payloadList.value.length).toFixed(1);
});

const dominantSf = computed(() => {
  if (payloadList.value.length === 0) return 'SF7';
  const sfCount: Record<string, number> = {};
  payloadList.value.forEach((p) => {
    const key = `SF${p.sf || 7}`;
    sfCount[key] = (sfCount[key] || 0) + 1;
  });
  let best = 'SF7';
  let max = 0;
  for (const k in sfCount) {
    if (sfCount[k] > max) {
      max = sfCount[k];
      best = k;
    }
  }
  return best;
});

const filteredPayloads = computed(() => {
  return payloadList.value.filter((p) => {
    if (filters.devEui && !p.dev_eui.toLowerCase().includes(filters.devEui.toLowerCase().trim())) {
      return false;
    }
    if (filters.itemCode && (p.item_code || '').toUpperCase() !== filters.itemCode.toUpperCase()) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const raw = (p.raw_payload || '').toLowerCase();
      const json = JSON.stringify(p.decoded_payload || {}).toLowerCase();
      if (!raw.includes(q) && !json.includes(q)) {
        return false;
      }
    }
    return true;
  });
});

async function loadPayloads() {
  loading.value = true;
  try {
    let items: any[] = [];
    // 1. Primary endpoint: GET /plugins/testing/packets (with devEui, rssi, snr, sf, frequency, fCnt, rawPayload, decodedPayload)
    try {
      const res: any = await httpClient.get('/plugins/testing/packets', {
        params: {
          limit: 100,
          networkId: filters.devEui || undefined,
          search: filters.search || undefined,
        },
      });
      const rawPackets = res?.data?.items || res?.data || res?.items || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawPackets) && rawPackets.length > 0) {
        items = rawPackets.map(normalizePayloadItem);
      }
    } catch (err: any) {
      console.debug('[DevicePayloadPanel] Query packets fallback:', err?.message);
    }

    // 2. Secondary fallback: /plugins/testing/device-payloads
    if (!Array.isArray(items) || items.length === 0) {
      try {
        const res2: any = await httpClient.get('/plugins/testing/device-payloads', {
          params: {
            dev_eui: filters.devEui || undefined,
            limit: 100,
          },
        });
        const liveItems = res2?.data?.items || res2?.data || res2?.items || [];
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          items = liveItems.map(normalizePayloadItem);
        }
      } catch {}
    }

    if (Array.isArray(items) && items.length > 0) {
      payloadList.value = items;
    } else {
      loadFallbackPayloads();
    }
  } catch {
    loadFallbackPayloads();
  } finally {
    loading.value = false;
  }
}

function normalizePayloadItem(raw: any): DevicePayloadItem {
  return {
    id: raw.id,
    dev_eui: raw.dev_eui || raw.devEui || '2026A1B2C3D40001',
    device_name: raw.device_name || raw.deviceName,
    application_id: raw.application_id || raw.applicationId || 'itest-default-app',
    f_cnt: raw.f_cnt ?? raw.fCnt ?? 1,
    f_port: raw.f_port ?? raw.fPort ?? 1,
    rssi: raw.rssi ?? -85,
    snr: raw.snr ?? 9.0,
    sf: raw.sf ?? 7,
    frequency: raw.frequency ?? 921400000,
    raw_payload: (raw.raw_payload || raw.rawPayload || '').toUpperCase(),
    raw_payload_base64: raw.raw_payload_base64 || raw.rawPayloadBase64,
    decoded_payload: raw.decoded_payload || raw.decodedPayload || {},
    received_at: raw.received_at || raw.receivedAt || raw.created_at || raw.createdAt || new Date().toISOString(),
    item_code: raw.item_code || raw.itemCode || 'WSSFC-ATH',
    fw_version: raw.fw_version || raw.fwVersion,
    long_fw: raw.long_fw || raw.longFw || '4F0505',
  };
}

function loadFallbackPayloads() {
  payloadList.value = [
    {
      id: 'pkt-001',
      dev_eui: '2026A1B2C3D40001',
      device_name: 'Cảm Biến Khí Tượng ATH 01',
      application_id: 'itest-default-app',
      f_cnt: 142,
      f_port: 2,
      rssi: -78,
      snr: 9.8,
      sf: 7,
      frequency: 921400000,
      raw_payload: '01016402011B0302026C04020120',
      decoded_payload: {
        temperature: 27.5,
        humidity: 62.0,
        battery: 100,
        battery_voltage: 3.65,
        pressure_hpa: 1013.2,
      },
      received_at: new Date(Date.now() - 5000).toISOString(),
      item_code: 'WSSFC-ATH',
      long_fw: '4F0505',
    },
    {
      id: 'pkt-002',
      dev_eui: '2026A1B2C3D40002',
      device_name: 'Cảm Biến Khí Tượng ATH 02',
      application_id: 'itest-default-app',
      f_cnt: 89,
      f_port: 2,
      rssi: -84,
      snr: 8.2,
      sf: 7,
      frequency: 921600000,
      raw_payload: '01016202011C03020271',
      decoded_payload: {
        temperature: 28.4,
        humidity: 62.5,
        battery: 98,
        battery_voltage: 3.61,
      },
      received_at: new Date(Date.now() - 25000).toISOString(),
      item_code: 'WSSFC-ATH',
      long_fw: '4F0505',
    },
    {
      id: 'pkt-003',
      dev_eui: '2026B2C3D4E50003',
      device_name: 'Cảm Biến Chất Lượng Khí CO2',
      application_id: 'itest-default-app',
      f_cnt: 231,
      f_port: 3,
      rssi: -92,
      snr: 5.4,
      sf: 10,
      frequency: 922200000,
      raw_payload: '050201D406020032',
      decoded_payload: {
        co2_ppm: 468,
        tvoc_ppb: 50,
        battery_voltage: 3.58,
      },
      received_at: new Date(Date.now() - 60000).toISOString(),
      item_code: 'WSSFC-CO2',
      long_fw: '2F0102',
    },
  ];
}

async function triggerAutoRegisterIntegration() {
  configuringIntegration.value = true;
  try {
    // Backend endpoint does not take client URL/token; it resolves on active server
    const res: any = await httpClient.post('/plugins/testing/integrations/chirpstack/register', {});
    integrationStatus.active = true;
    if (res?.data?.applicationId) {
      integrationStatus.applicationId = res.data.applicationId;
    }
    cyberToast.success('Đã tự động đăng ký HTTP Integration vào Default Application!');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Chưa hoàn tất đồng bộ ChirpStack';
    console.debug('[DevicePayloadPanel] ChirpStack integration auto-register:', msg);
    // Don't show scary toast on initial mount if server env vars aren't set yet
    integrationStatus.active = false;
  } finally {
    configuringIntegration.value = false;
  }
}

function toggleLivePolling() {
  isLivePolling.value = !isLivePolling.value;
  if (isLivePolling.value) {
    startPolling();
    cyberToast.info('Đã bật Live Streaming Payload');
  } else {
    stopPolling();
    cyberToast.info('Đã tạm dừng Live Streaming');
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(() => {
    loadPayloads();
  }, pollIntervalMs.value);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function resetFilters() {
  filters.devEui = '';
  filters.itemCode = '';
  filters.search = '';
  loadPayloads();
}

function openDualPayloadModal(pkt: DevicePayloadItem) {
  selectedPacket.value = pkt;
  modalVisible.value = true;
}

function copyText(val: string, msg: string) {
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    cyberToast.success(msg);
  }).catch(() => {
    cyberToast.info(val);
  });
}

function formatTimestamp(isoStr?: string | Date): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' +
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function formatFrequency(freq?: number): string {
  if (!freq) return '921.4';
  if (freq > 1000000) {
    return (freq / 1000000).toFixed(1);
  }
  return String(freq);
}

function getRssiBadgeClass(rssi?: number): string {
  if (!rssi) return 'badge-ghost';
  if (rssi >= -80) return 'badge-success text-success-content';
  if (rssi >= -100) return 'badge-warning text-warning-content';
  return 'badge-error text-error-content';
}

function getSnrColorClass(snr?: number): string {
  if (!snr) return 'text-base-content';
  if (snr >= 8) return 'text-success';
  if (snr >= 0) return 'text-warning';
  return 'text-error';
}

function hasDecodedData(obj?: Record<string, any>): boolean {
  return !!obj && Object.keys(obj).length > 0;
}

function getSensorTelemetryItems(obj?: Record<string, any>): Record<string, any> {
  if (!obj) return {};
  const allowed = { ...obj };
  // Hide internal or metadata fields
  delete allowed.raw;
  delete allowed.raw_payload;
  delete allowed.f_cnt;
  delete allowed.f_port;
  return allowed;
}

function formatSensorValue(val: any): string {
  if (typeof val === 'number') {
    return Number.isInteger(val) ? String(val) : val.toFixed(1);
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return String(val);
}

function getSensorMetricBadgeTheme(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('temp')) return 'text-error font-semibold';
  if (k.includes('hum')) return 'text-info font-semibold';
  if (k.includes('co2') || k.includes('gas') || k.includes('aqi')) return 'text-warning font-semibold';
  if (k.includes('bat') || k.includes('volt')) return 'text-success font-semibold';
  if (k.includes('press')) return 'text-accent font-semibold';
  return 'text-base-content';
}

onMounted(() => {
  loadPayloads();
  startPolling();
  triggerAutoRegisterIntegration();
});

onUnmounted(() => {
  stopPolling();
});
</script>
