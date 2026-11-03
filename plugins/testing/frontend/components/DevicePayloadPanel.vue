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
          <!-- SSE Realtime Status & Actions -->
          <div class="flex items-center gap-2">
            <div
              class="badge badge-sm gap-1.5 font-mono text-xs border-base-300 bg-base-100"
              :class="sseConnected ? 'text-success font-semibold' : 'text-base-content/60'"
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="sseConnected ? 'bg-success animate-pulse' : 'bg-base-content/40'"
              ></span>
              <span>{{ sseConnected ? 'SSE Realtime Active' : 'Connecting Stream...' }}</span>
            </div>

            <button class="btn btn-sm btn-outline gap-1.5" :disabled="loading" @click="loadPayloads(false)">
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
    </div>

    <!-- Backend Connection & Webhook Inspector Bar -->
    <div class="card bg-base-200/50 border border-base-300 p-3 rounded-xl backdrop-blur-md text-xs space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Backend Server Port / Host Setting -->
        <div class="flex items-center gap-2 flex-wrap">
          <Server class="w-4 h-4 text-primary" />
          <span class="font-bold text-base-content">Backend Server URL:</span>
          <div class="join">
            <input
              v-model="backendServerUrl"
              type="text"
              placeholder="VD: http://lanu.myvc.com:3000"
              class="input input-xs input-bordered join-item font-mono w-56 sm:w-64 bg-base-100"
              @keyup.enter="saveAndTestBackendConnection"
            />
            <button
              class="btn btn-xs btn-primary join-item gap-1"
              :disabled="testingBackend"
              @click="saveAndTestBackendConnection"
            >
              <span v-if="testingBackend" class="loading loading-spinner loading-xs"></span>
              <span v-else>Kết Nối</span>
            </button>
          </div>
          <span
            class="badge badge-xs font-mono font-bold"
            :class="backendConnected ? 'badge-success text-success-content' : 'badge-ghost'"
          >
            {{ backendConnected ? 'ĐÃ KẾT NỐI :3000' : 'CHƯA TEST KẾT NỐI' }}
          </span>
        </div>

        <!-- ChirpStack Webhook Guide -->
        <div class="flex items-center gap-2 flex-wrap font-mono text-[11px]">
          <span class="text-base-content/60">Webhook URL ChirpStack:</span>
          <code class="bg-base-300/80 px-2 py-0.5 rounded text-primary font-bold select-all">
            {{ activeWebhookUrl }}
          </code>
          <button
            class="btn btn-ghost btn-xs p-1 text-base-content/60 hover:text-primary"
            title="Sao chép Webhook URL"
            @click="copyText(activeWebhookUrl, 'Đã copy Webhook URL')"
          >
            <Copy class="w-3.5 h-3.5" />
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
        <span class="text-lg font-bold font-mono text-info">{{ avgRssi }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">SNR Trung Bình</span>
        <span class="text-lg font-bold font-mono text-success">{{ avgSnr }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Dải SF Phổ Biến</span>
        <span class="text-lg font-bold font-mono text-warning">{{ dominantSf }}</span>
      </div>
      <div class="card bg-base-200/50 border border-base-300 p-3 rounded-lg text-center">
        <span class="text-[11px] text-base-content/60 uppercase font-mono">Đã Giải Mã</span>
        <span class="text-lg font-bold font-mono" :class="decodedPercent !== '—' ? 'text-success' : 'text-base-content/50'">{{ decodedPercent }}</span>
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
              @keyup.enter="refreshPayloads"
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
            @change="refreshPayloads"
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
            @keyup.enter="refreshPayloads"
          />
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-primary flex-1 gap-1 text-xs" @click="refreshPayloads">
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
            <tr v-if="loading && payloadList.length === 0">
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
              :key="row.id || `${row.dev_eui}-${row.f_cnt}`"
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
                  v-if="row.rssi !== null && row.rssi !== undefined"
                  class="badge badge-xs font-bold font-mono"
                  :class="getRssiBadgeClass(row.rssi)"
                >
                  {{ row.rssi }} dBm
                </span>
                <span v-else class="text-base-content/40 text-xs">—</span>
              </td>

              <!-- 2. SNR (dB) -->
              <td class="text-center bg-base-300/20 font-bold" :class="getSnrColorClass(row.snr)">
                {{ row.snr !== null && row.snr !== undefined ? `${row.snr} dB` : '—' }}
              </td>

              <!-- 3. FCNT -->
              <td class="text-center bg-base-300/20 font-bold text-base-content">
                {{ row.f_cnt !== null && row.f_cnt !== undefined ? `#${row.f_cnt}` : '—' }}
              </td>

              <!-- 4. SF (Spreading Factor) -->
              <td class="text-center bg-base-300/20 font-bold text-warning">
                {{ row.sf ? `SF${row.sf}` : '—' }}
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
  Server,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

const loading = ref(false);
const configuringIntegration = ref(false);
const sseConnected = ref(false);
let eventSource: EventSource | null = null;

const backendServerUrl = ref(
  (typeof window !== 'undefined' && localStorage.getItem('itest_backend_url')) ||
  (typeof window !== 'undefined' && window.location.port !== '3000'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : '')
);
const testingBackend = ref(false);
const backendConnected = ref(false);

const activeWebhookUrl = computed(() => {
  const base = backendServerUrl.value.trim() || `${window.location.protocol}//${window.location.hostname}:3000`;
  return `${base.replace(/\/+$/, '')}/lorawan/chirpstack/uplink`;
});

async function saveAndTestBackendConnection() {
  testingBackend.value = true;
  const rawUrl = backendServerUrl.value.trim();
  if (!rawUrl) {
    localStorage.removeItem('itest_backend_url');
    cyberToast.info('Đã xóa cấu hình backend URL tuỳ chỉnh');
    testingBackend.value = false;
    return;
  }

  const cleanOrigin = rawUrl.replace(/\/+$/, '').replace(/\/api(\/v1)?\/?$/, '');
  const apiUrl = `${cleanOrigin}/api/v1`;

  try {
    const res = await fetch(`${cleanOrigin}/api/realtime/status`, { signal: AbortSignal.timeout(4000) });
    backendConnected.value = res.ok;
    localStorage.setItem('itest_backend_url', apiUrl);
    httpClient.defaults.baseURL = apiUrl;
    cyberToast.success(`Đã kết nối thành công tới Backend ${cleanOrigin}!`);
    setupRealtimeStream();
    loadPayloads(false);
  } catch {
    backendConnected.value = false;
    localStorage.setItem('itest_backend_url', apiUrl);
    httpClient.defaults.baseURL = apiUrl;
    cyberToast.warning(`Đã lưu URL: ${cleanOrigin}. Đang thử kết nối...`);
    setupRealtimeStream();
    loadPayloads(false);
  } finally {
    testingBackend.value = false;
  }
}

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
  if (payloadList.value.length === 0) return '—';
  const valid = payloadList.value.filter((p) => typeof p.rssi === 'number');
  if (valid.length === 0) return '—';
  const sum = valid.reduce((acc, p) => acc + (p.rssi as number), 0);
  return `${Math.round(sum / valid.length)} dBm`;
});

const avgSnr = computed(() => {
  if (payloadList.value.length === 0) return '—';
  const valid = payloadList.value.filter((p) => typeof p.snr === 'number');
  if (valid.length === 0) return '—';
  const sum = valid.reduce((acc, p) => acc + (p.snr as number), 0);
  return `${(sum / valid.length).toFixed(1)} dB`;
});

const dominantSf = computed(() => {
  if (payloadList.value.length === 0) return '—';
  const valid = payloadList.value.filter((p) => typeof p.sf === 'number');
  if (valid.length === 0) return '—';
  const sfCount: Record<string, number> = {};
  valid.forEach((p) => {
    const key = `SF${p.sf}`;
    sfCount[key] = (sfCount[key] || 0) + 1;
  });
  let best = '—';
  let max = 0;
  for (const k in sfCount) {
    if (sfCount[k] > max) {
      max = sfCount[k];
      best = k;
    }
  }
  return best;
});

const decodedPercent = computed(() => {
  if (payloadList.value.length === 0) return '—';
  const decoded = payloadList.value.filter((p) => hasDecodedData(p.decoded_payload)).length;
  return `${Math.round((decoded / payloadList.value.length) * 100)}% (${decoded}/${payloadList.value.length})`;
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

function refreshPayloads() {
  loadPayloads(false);
}

async function loadPayloads(isSilent = false) {
  if (!isSilent && payloadList.value.length === 0) {
    loading.value = true;
  }
  try {
    const res: any = await httpClient.get('/plugins/testing/packets', {
      params: {
        limit: 100,
        networkId: filters.devEui || undefined,
        search: filters.search || undefined,
      },
    });
    const rawPackets = res?.data?.items || res?.data || res?.items || (Array.isArray(res) ? res : []);
    payloadList.value = Array.isArray(rawPackets) ? rawPackets.map(normalizePayloadItem) : [];
  } catch (err: any) {
    console.debug('[DevicePayloadPanel] Query packets failed:', err?.message);
  } finally {
    loading.value = false;
  }
}

function normalizePayloadItem(raw: any): DevicePayloadItem {
  return {
    id: raw.id,
    dev_eui: raw.dev_eui || raw.devEui || '—',
    device_name: raw.device_name || raw.deviceName || '',
    application_id: raw.application_id || raw.applicationId || '',
    f_cnt: raw.f_cnt ?? raw.fCnt ?? null,
    f_port: raw.f_port ?? raw.fPort ?? null,
    rssi: raw.rssi ?? null,
    snr: raw.snr ?? null,
    sf: raw.sf ?? null,
    frequency: raw.frequency ?? null,
    raw_payload: (raw.raw_payload || raw.rawPayload || '').toUpperCase(),
    raw_payload_base64: raw.raw_payload_base64 || raw.rawPayloadBase64 || '',
    decoded_payload: raw.decoded_payload || raw.decodedPayload || {},
    received_at: raw.received_at || raw.receivedAt || raw.created_at || raw.createdAt || '',
    item_code: raw.item_code || raw.itemCode || '—',
    fw_version: raw.fw_version || raw.fwVersion || '—',
    long_fw: raw.long_fw || raw.longFw || '—',
  };
}

function handleIncomingPacket(raw: any) {
  const item = normalizePayloadItem(raw);
  if (!item.dev_eui || item.dev_eui === '—') return;
  // Deduplicate by id if present
  const existingIdx = payloadList.value.findIndex((p) => p.id && p.id === item.id);
  if (existingIdx >= 0) {
    payloadList.value[existingIdx] = item;
  } else {
    payloadList.value.unshift(item);
    if (payloadList.value.length > 200) {
      payloadList.value.pop();
    }
  }
}

function getRealtimeStreamUrl(): string {
  try {
    const apiBase = httpClient.defaults.baseURL || (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    const resolved = new URL(apiBase, window.location.origin);
    return `${resolved.origin}/api/realtime/stream`;
  } catch {
    return '/api/realtime/stream';
  }
}

let fallbackPollTimer: any = null;

function startFallbackPolling() {
  if (fallbackPollTimer) return;
  fallbackPollTimer = setInterval(() => {
    loadPayloads(true);
  }, 3000);
}

function stopFallbackPolling() {
  if (fallbackPollTimer) {
    clearInterval(fallbackPollTimer);
    fallbackPollTimer = null;
  }
}

function setupRealtimeStream() {
  if (typeof EventSource === 'undefined') {
    startFallbackPolling();
    return;
  }
  closeRealtimeStream();
  try {
    const sseUrl = getRealtimeStreamUrl();
    eventSource = new EventSource(sseUrl);
    eventSource.onopen = () => {
      sseConnected.value = true;
      stopFallbackPolling();
    };
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'plugin' && payload.data?.event === 'testing:packet:received') {
          const raw = payload.data.packet || payload.data.data || payload.data;
          if (raw) handleIncomingPacket(raw);
        } else if (payload?.type === 'telemetry' || payload?.type === 'unified_telemetry') {
          if (payload.data) handleIncomingPacket(payload.data);
        }
      } catch (err) {
        console.debug('[DevicePayloadPanel] SSE parse error:', err);
      }
    };
    eventSource.onerror = () => {
      sseConnected.value = false;
      // If SSE connection fails across different ports, fall back to silent background polling
      startFallbackPolling();
    };
  } catch (err) {
    console.debug('[DevicePayloadPanel] SSE init error:', err);
    startFallbackPolling();
  }
}

function closeRealtimeStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  sseConnected.value = false;
}

async function triggerAutoRegisterIntegration() {
  configuringIntegration.value = true;
  try {
    const res: any = await httpClient.post('/plugins/testing/integrations/chirpstack/register', {});
    integrationStatus.active = true;
    if (res?.data?.applicationId) {
      integrationStatus.applicationId = res.data.applicationId;
    }
    cyberToast.success('Đã tự động đăng ký HTTP Integration vào Default Application!');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Chưa hoàn tất đồng bộ ChirpStack';
    console.debug('[DevicePayloadPanel] ChirpStack integration auto-register:', msg);
    integrationStatus.active = false;
  } finally {
    configuringIntegration.value = false;
  }
}

function resetFilters() {
  filters.devEui = '';
  filters.itemCode = '';
  filters.search = '';
  loadPayloads(false);
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
  if (!freq) return '—';
  if (freq > 1000000) {
    return `${(freq / 1000000).toFixed(1)} MHz`;
  }
  return `${freq} MHz`;
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
  if (backendServerUrl.value) {
    const cleanOrigin = backendServerUrl.value.trim().replace(/\/+$/, '').replace(/\/api(\/v1)?\/?$/, '');
    httpClient.defaults.baseURL = `${cleanOrigin}/api/v1`;
  }
  loadPayloads(false);
  setupRealtimeStream();
  triggerAutoRegisterIntegration();
});

onUnmounted(() => {
  closeRealtimeStream();
  stopFallbackPolling();
});
</script>
