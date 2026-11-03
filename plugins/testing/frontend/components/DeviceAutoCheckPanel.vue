<template>
  <div class="device-auto-check-panel space-y-4">
    <AutoCheckProfilePanel />

    <!-- Top Banner -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-success tracking-wider uppercase">LoRaWAN Device Auto Check</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="overallVerdict === 'PASSED' ? 'badge-success text-success-content' : overallVerdict === 'FAILED' ? 'badge-error text-error-content' : 'badge-ghost'"
              >
                VERDICT: {{ overallVerdict }}
              </span>
              <span v-if="realtimeEvaluating" class="badge badge-xs badge-primary animate-pulse font-mono">
                REALTIME AUTO EVAL
              </span>
            </div>
            <div class="text-xs text-base-content/70 mt-0.5">
              Hệ thống tự động kiểm tra chất lượng gói tin LoRaWAN: Protocol FCnt, chỉ số RF (RSSI/SNR), tính toàn vẹn Payload &amp; ngưỡng đo cảm biến
            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="btn btn-sm"
            :class="realtimeEvaluating ? 'btn-warning' : 'btn-outline btn-success'"
            @click="realtimeEvaluating = !realtimeEvaluating"
          >
            <Activity class="w-4 h-4" />
            <span>{{ realtimeEvaluating ? 'Tạm Dừng Live Check' : 'Bật Live Auto Check' }}</span>
          </button>
          <button class="btn btn-primary btn-sm gap-1.5 shadow-sm" :disabled="loadingCheck" @click="runBatchEvaluation">
            <span v-if="loadingCheck" class="loading loading-spinner loading-xs"></span>
            <Play v-else class="w-4 h-4" />
            <span>Kiểm Tra Lô Gói Tin</span>
          </button>
          <button class="btn btn-outline btn-sm gap-1.5" @click="rulesModalVisible = true">
            <SlidersHorizontal class="w-4 h-4" />
            <span>Bộ Tiêu Chí ({{ activeRulesCount }})</span>
          </button>
          <button class="btn btn-ghost btn-sm gap-1.5" @click="exportQaReport">
            <Download class="w-4 h-4" />
            <span>Xuất Báo Cáo QA</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Metric Score Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card bg-base-200/60 border border-base-300 rounded-xl p-3.5 shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between text-xs text-base-content/60">
          <span>Tổng Số Gói Tin Đã Check</span>
          <Radio class="w-4 h-4 text-primary" />
        </div>
        <div class="text-2xl font-bold font-mono text-white mt-1">{{ totalChecked }}</div>
        <div class="text-[11px] text-base-content/50 mt-0.5">Bao gồm cả Uplink &amp; Join</div>
      </div>

      <div class="card bg-base-200/60 border border-base-300 rounded-xl p-3.5 shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between text-xs text-base-content/60">
          <span>Số Gói Đạt (PASS)</span>
          <CheckCircle2 class="w-4 h-4 text-success" />
        </div>
        <div class="text-2xl font-bold font-mono text-success mt-1">{{ passCount }}</div>
        <div class="text-[11px] text-success/80 mt-0.5">Tỉ lệ đạt: {{ passRate }}%</div>
      </div>

      <div class="card bg-base-200/60 border border-base-300 rounded-xl p-3.5 shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between text-xs text-base-content/60">
          <span>Số Gói Lỗi (FAIL)</span>
          <AlertTriangle class="w-4 h-4 text-error" />
        </div>
        <div class="text-2xl font-bold font-mono text-error mt-1">{{ failCount }}</div>
        <div class="text-[11px] text-error/80 mt-0.5">Vi phạm ngưỡng tiêu chí</div>
      </div>

      <div class="card bg-base-200/60 border border-base-300 rounded-xl p-3.5 shadow-sm backdrop-blur-md">
        <div class="flex items-center justify-between text-xs text-base-content/60">
          <span>Chất Lượng Sóng TB (RF)</span>
          <Signal class="w-4 h-4 text-accent" />
        </div>
        <div class="text-2xl font-bold font-mono text-accent mt-1">{{ avgRssi }} dBm</div>
        <div class="text-[11px] text-base-content/50 mt-0.5">SNR TB: {{ avgSnr > 0 ? '+' : '' }}{{ avgSnr }} dB</div>
      </div>
    </div>

    <!-- Filter Bar & Target Device Selector -->
    <div class="p-3 bg-base-200/60 border border-base-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="font-medium text-base-content/70">Thiết bị kiểm thử:</span>
          <input
            v-model="targetDevEui"
            type="text"
            placeholder="Lọc theo DevEUI / Network ID..."
            class="input input-bordered input-xs font-mono w-56"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-medium text-base-content/70">Trạng thái:</span>
          <select v-model="filterStatus" class="select select-bordered select-xs">
            <option value="ALL">Tất cả (All)</option>
            <option value="PASS">Chỉ gói đạt (PASS)</option>
            <option value="FAIL">Chỉ gói lỗi (FAIL)</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-base-content/60">Hiển thị: {{ filteredResults.length }} kết quả</span>
        <button class="btn btn-ghost btn-xs text-primary" @click="clearResults">
          Xóa Kết Quả
        </button>
      </div>
    </div>

    <!-- Main Table: Evaluation Results -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm overflow-hidden backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm w-full">
          <thead>
            <tr class="bg-base-200 text-xs font-semibold uppercase">
              <th class="w-24">Thời Gian</th>
              <th>Network ID / DevEUI</th>
              <th class="text-center w-20">FCnt</th>
              <th class="text-center w-20">FPort</th>
              <th>Chỉ Số RF (RSSI / SNR)</th>
              <th>Tiêu Chí Đối Soát (Assertions)</th>
              <th class="text-center w-28">Đánh Giá</th>
              <th class="text-center w-24">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredResults.length === 0">
              <td colspan="8" class="text-center py-10 text-base-content/50 italic">
                Chưa có kết quả kiểm tra tự động nào. Hãy bật "Live Auto Check" hoặc nhấn "Kiểm Tra Lô Gói Tin".
              </td>
            </tr>
            <tr v-for="res in filteredResults" :key="res.id" class="hover">
              <td class="font-mono text-xs text-base-content/70">
                {{ res.time }}
              </td>
              <td>
                <div class="font-mono font-bold text-xs text-primary">{{ res.devEui }}</div>
                <div class="text-[10px] text-base-content/60 font-mono">GW: {{ res.gatewayEui || '—' }}</div>
              </td>
              <td class="text-center font-mono text-xs font-semibold">
                {{ res.fCnt }}
              </td>
              <td class="text-center font-mono text-xs">
                {{ res.fPort }}
              </td>
              <td>
                <div class="flex items-center gap-2 font-mono text-xs">
                  <span :class="res.rssi >= -110 ? 'text-success' : 'text-warning'">{{ res.rssi }} dBm</span>
                  <span class="text-base-content/40">/</span>
                  <span :class="res.snr >= 0 ? 'text-accent' : 'text-error'">{{ res.snr > 0 ? '+' : '' }}{{ res.snr }} dB</span>
                </div>
              </td>
              <td>
                <div class="space-y-1">
                  <div
                    v-for="(assertion, idx) in res.assertions"
                    :key="idx"
                    class="text-xs flex items-center gap-1.5"
                  >
                    <span
                      class="w-2 h-2 rounded-full shrink-0"
                      :class="assertion.pass ? 'bg-success' : 'bg-error'"
                    />
                    <span class="font-medium text-base-content/80">{{ assertion.ruleName }}:</span>
                    <span class="font-mono text-[11px]" :class="assertion.pass ? 'text-base-content/70' : 'text-error font-bold'">
                      {{ assertion.actualSummary }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span
                  class="badge badge-sm font-bold font-mono"
                  :class="res.verdict === 'PASS' ? 'badge-success text-success-content' : 'badge-error text-error-content'"
                >
                  {{ res.verdict }}
                </span>
              </td>
              <td class="text-center">
                <button class="btn btn-ghost btn-xs text-primary" @click="viewDetailModal(res)">
                  Chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Live Auto Check Event Console Card -->
    <div class="card bg-base-200 border border-base-content/10 shadow-sm rounded-box p-4 flex flex-col h-[320px]">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-base-content/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="realtimeEvaluating ? 'bg-success' : 'bg-base-content/30'"></span>
          <Terminal class="w-4 h-4 text-primary" />
          <h3 class="font-bold text-sm text-base-content">Live Auto Check Event Console</h3>
          <span class="badge badge-neutral badge-sm font-mono text-[10px]">{{ autoCheckLogs.length }} logs</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-300" @click="clearAutoCheckLogs">
            Xóa Log
          </button>
        </div>
      </div>

      <div
        ref="autoCheckLogContainer"
        class="flex-1 overflow-y-auto p-3 rounded-lg bg-base-300 font-mono text-[11px] space-y-1.5 border border-base-content/5 select-text"
      >
        <div v-if="autoCheckLogs.length === 0" class="text-base-content/40 italic py-8 text-center text-xs">
          Chưa có sự kiện đánh giá nào. Bật "Bật Live Auto Check" hoặc nhấn "Kiểm Tra Lô Gói Tin" để nhận logs thời gian thực.
        </div>
        <div
          v-for="log in autoCheckLogs"
          :key="log.id"
          class="leading-relaxed break-all flex items-start gap-2 py-0.5"
        >
          <span class="text-base-content/40 text-[10px] select-none font-mono shrink-0">[{{ log.time }}]</span>
          <span
            class="badge badge-xs font-mono font-bold shrink-0 uppercase"
            :class="getLogBadgeClass(log.type)"
          >
            {{ log.tag }}
          </span>
          <span class="flex-1" :class="getLogTextColor(log.type)">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Rules Configuration Modal -->
    <dialog class="modal" :class="{ 'modal-open': rulesModalVisible }">
      <div class="modal-box w-11/12 max-w-3xl bg-base-100 border border-base-300 p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-content/10">
          <h3 class="font-bold text-base flex items-center gap-2">
            <SlidersHorizontal class="w-5 h-5 text-primary" />
            Cấu Hình Bộ Tiêu Chí Tự Động (Auto Check Rule Engine)
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="rulesModalVisible = false">✕</button>
        </div>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div
            v-for="rule in rules"
            :key="rule.id"
            class="p-3 rounded-lg border flex items-center justify-between gap-3 text-xs"
            :class="rule.enabled ? 'bg-base-200/70 border-primary/30' : 'bg-base-200/20 border-base-300 opacity-60'"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-base-content">{{ rule.name }}</span>
                <span class="badge badge-xs font-mono" :class="getCategoryBadgeClass(rule.category)">
                  {{ rule.category }}
                </span>
                <span class="badge badge-xs badge-outline font-mono">Severity: {{ rule.severity }}</span>
              </div>
              <div class="text-base-content/70">{{ rule.description }}</div>
              <div class="font-mono text-primary text-[11px] font-medium">
                Điều kiện: {{ rule.conditionText }}
              </div>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer gap-2">
                <span class="label-text text-xs">{{ rule.enabled ? 'Bật' : 'Tắt' }}</span>
                <input
                  v-model="rule.enabled"
                  type="checkbox"
                  class="toggle toggle-primary toggle-sm"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="modal-action pt-3 mt-4 border-t border-base-content/10">
          <button class="btn btn-sm btn-ghost" @click="resetRulesToDefault">Khôi Phục Mặc Định</button>
          <button class="btn btn-sm btn-primary" @click="rulesModalVisible = false">Áp Dụng Tiêu Chí</button>
        </div>
      </div>
    </dialog>

    <!-- Detail Packet Modal -->
    <dialog class="modal" :class="{ 'modal-open': detailModalVisible }">
      <div class="modal-box w-11/12 max-w-2xl bg-base-100 border border-base-300 p-5">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-base flex items-center gap-2">
            <Radio class="w-5 h-5 text-primary" />
            Chi Tiết Đánh Giá Gói Tin LoRaWAN
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="detailModalVisible = false">✕</button>
        </div>

        <div v-if="selectedResult" class="space-y-3 text-xs font-mono">
          <div class="grid grid-cols-2 gap-2 p-3 bg-base-200 rounded-lg">
            <div><span class="text-base-content/60">DevEUI:</span> <span class="font-bold text-primary">{{ selectedResult.devEui }}</span></div>
            <div><span class="text-base-content/60">FCnt:</span> <span class="font-bold">{{ selectedResult.fCnt }}</span></div>
            <div><span class="text-base-content/60">FPort:</span> <span class="font-bold">{{ selectedResult.fPort }}</span></div>
            <div><span class="text-base-content/60">Gateway:</span> <span class="font-bold">{{ selectedResult.gatewayEui || '—' }}</span></div>
            <div><span class="text-base-content/60">RSSI:</span> <span class="font-bold">{{ selectedResult.rssi }} dBm</span></div>
            <div><span class="text-base-content/60">SNR:</span> <span class="font-bold">{{ selectedResult.snr }} dB</span></div>
          </div>

          <div>
            <div class="font-bold text-xs mb-1 text-base-content/70">Raw HEX:</div>
            <div class="p-2 bg-base-300 rounded border border-base-content/10 text-primary break-all font-mono text-xs">
              {{ selectedResult.rawPayload || '—' }}
            </div>
          </div>

          <div>
            <div class="font-bold text-xs mb-1 text-base-content/70">Decoded JSON:</div>
            <pre class="p-2.5 bg-base-300 rounded border border-base-content/10 text-success text-[11px] overflow-x-auto font-mono">{{ JSON.stringify(selectedResult.decodedPayload, null, 2) }}</pre>
          </div>

          <div>
            <div class="font-bold text-xs mb-1 text-base-content/70">Danh Sách Tiêu Chí &amp; Kết Quả Chi Tiết:</div>
            <div class="space-y-1.5">
              <div
                v-for="(ast, i) in selectedResult.assertions"
                :key="i"
                class="p-2 rounded border flex items-center justify-between text-xs"
                :class="ast.pass ? 'bg-success/5 border-success/30' : 'bg-error/5 border-error/30'"
              >
                <div>
                  <div class="font-bold" :class="ast.pass ? 'text-success' : 'text-error'">
                    {{ ast.pass ? '✓ PASS' : '✗ FAIL' }}: {{ ast.ruleName }}
                  </div>
                  <div class="text-base-content/70 text-[11px]">{{ ast.ruleDesc }}</div>
                </div>
                <div class="text-right font-mono text-[11px]">
                  <div>Mong muốn: <span class="text-base-content/80">{{ ast.expected }}</span></div>
                  <div>Thực tế: <span :class="ast.pass ? 'text-success' : 'text-error font-bold'">{{ ast.actual }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action pt-3 mt-3 border-t border-base-content/10">
          <button class="btn btn-sm btn-ghost" @click="detailModalVisible = false">Đóng</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import AutoCheckProfilePanel from './AutoCheckProfilePanel.vue';
import {
  CheckCircle2,
  AlertTriangle,
  Activity,
  Play,
  SlidersHorizontal,
  Download,
  Radio,
  Signal,
  Terminal,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

interface AutoCheckLog {
  id: string;
  time: string;
  tag: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'data';
  message: string;
}

const autoCheckLogs = ref<AutoCheckLog[]>([]);
const autoCheckLogContainer = ref<HTMLElement | null>(null);

function addAutoCheckLog(tag: string, message: string, type: 'success' | 'warning' | 'error' | 'info' | 'data' = 'info') {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  autoCheckLogs.value.push({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    time,
    tag,
    type,
    message,
  });
  if (autoCheckLogs.value.length > 200) {
    autoCheckLogs.value.shift();
  }
  nextTick(() => {
    if (autoCheckLogContainer.value) {
      autoCheckLogContainer.value.scrollTop = autoCheckLogContainer.value.scrollHeight;
    }
  });
}

function clearAutoCheckLogs() {
  autoCheckLogs.value = [];
}

function getLogBadgeClass(type: string) {
  switch (type) {
    case 'success':
      return 'badge-success text-success-content';
    case 'warning':
      return 'badge-warning text-warning-content';
    case 'error':
      return 'badge-error text-error-content';
    case 'data':
      return 'badge-info text-info-content';
    default:
      return 'badge-neutral text-neutral-content';
  }
}

function getLogTextColor(type: string) {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-error';
    case 'data':
      return 'text-info';
    default:
      return 'text-base-content/85';
  }
}

interface CheckRule {
  id: string;
  name: string;
  category: 'PROTOCOL' | 'RF_QUALITY' | 'PAYLOAD' | 'SENSOR_VALUE';
  severity: 'FAIL' | 'WARN';
  description: string;
  conditionText: string;
  enabled: boolean;
  evaluate: (packet: any, prevPacket?: any) => { pass: boolean; expected: string; actual: string };
}

interface EvaluationResult {
  id: string;
  time: string;
  devEui: string;
  gatewayEui?: string;
  fCnt: number | string;
  fPort: number;
  rssi: number;
  snr: number;
  rawPayload?: string;
  decodedPayload?: any;
  assertions: {
    ruleId: string;
    ruleName: string;
    ruleDesc: string;
    pass: boolean;
    expected: string;
    actual: string;
    actualSummary: string;
  }[];
  verdict: 'PASS' | 'FAIL';
}

const realtimeEvaluating = ref<boolean>(true);
const loadingCheck = ref<boolean>(false);
const rulesModalVisible = ref<boolean>(false);
const detailModalVisible = ref<boolean>(false);
const selectedResult = ref<EvaluationResult | null>(null);

const targetDevEui = ref<string>('');
const filterStatus = ref<'ALL' | 'PASS' | 'FAIL'>('ALL');
const results = ref<EvaluationResult[]>([]);

// Pre-defined LoRaWAN Auto Check Rules
const rules = reactive<CheckRule[]>([
  {
    id: 'rule-fcnt-continuity',
    name: 'FCnt Sequence Continuity',
    category: 'PROTOCOL',
    severity: 'FAIL',
    description: 'Kiểm tra tính liên tục của bộ đếm FCnt, phát hiện mất gói hoặc lặp lại (Anti-replay)',
    conditionText: 'FCnt > 0 và tăng dần hợp lệ',
    enabled: true,
    evaluate: (pkt, prev) => {
      const fcnt = Number(pkt.fCnt ?? pkt.f_cnt ?? 0);
      if (prev) {
        const prevFcnt = Number(prev.fCnt ?? prev.f_cnt ?? 0);
        const pass = fcnt > prevFcnt;
        return {
          pass,
          expected: `> ${prevFcnt}`,
          actual: String(fcnt),
        };
      }
      return {
        pass: fcnt >= 0,
        expected: '>= 0',
        actual: String(fcnt),
      };
    },
  },
  {
    id: 'rule-fport-valid',
    name: 'FPort Application Range',
    category: 'PROTOCOL',
    severity: 'FAIL',
    description: 'Kiểm tra FPort nằm trong dải cổng ứng dụng LoRaWAN hợp lệ (1-223)',
    conditionText: '1 <= FPort <= 223',
    enabled: true,
    evaluate: (pkt) => {
      const port = Number(pkt.fPort ?? pkt.f_port ?? 0);
      const pass = port >= 1 && port <= 223;
      return {
        pass,
        expected: '1 - 223',
        actual: String(port),
      };
    },
  },
  {
    id: 'rule-rf-rssi',
    name: 'RF Signal RSSI Threshold',
    category: 'RF_QUALITY',
    severity: 'FAIL',
    description: 'Ngưỡng thu nhận cường độ tín hiệu tối thiểu của trạm Gateway',
    conditionText: 'RSSI >= -115 dBm',
    enabled: true,
    evaluate: (pkt) => {
      const rssi = Number(pkt.rfInfo?.rssi ?? pkt.rf_info?.rssi ?? -80);
      const pass = rssi >= -115;
      return {
        pass,
        expected: '>= -115 dBm',
        actual: `${rssi} dBm`,
      };
    },
  },
  {
    id: 'rule-rf-snr',
    name: 'RF Signal SNR Threshold',
    category: 'RF_QUALITY',
    severity: 'FAIL',
    description: 'Tỉ số tín hiệu trên nhiễu tối thiểu cho phép giải mã tin cậy',
    conditionText: 'SNR >= -5.0 dB',
    enabled: true,
    evaluate: (pkt) => {
      const snr = Number(pkt.rfInfo?.snr ?? pkt.rf_info?.snr ?? 5);
      const pass = snr >= -5.0;
      return {
        pass,
        expected: '>= -5.0 dB',
        actual: `${snr > 0 ? '+' : ''}${snr} dB`,
      };
    },
  },
  {
    id: 'rule-payload-decoded',
    name: 'Payload Decoder Validation',
    category: 'PAYLOAD',
    severity: 'FAIL',
    description: 'Payload giải mã thành công không có lỗi parser JSONB',
    conditionText: 'Decoded object != null và có trường dữ liệu',
    enabled: true,
    evaluate: (pkt) => {
      const decoded = pkt.decodedPayload ?? pkt.decoded_payload;
      const pass = decoded && typeof decoded === 'object' && Object.keys(decoded).length > 0;
      return {
        pass: !!pass,
        expected: 'Valid JSON object',
        actual: pass ? `${Object.keys(decoded).length} fields` : 'Empty/Null',
      };
    },
  },
  {
    id: 'rule-sensor-battery',
    name: 'Battery Voltage Health Gate',
    category: 'SENSOR_VALUE',
    severity: 'FAIL',
    description: 'Điện áp pin của thiết bị đạt mức vận hành an toàn',
    conditionText: 'Battery >= 2.80V',
    enabled: true,
    evaluate: (pkt) => {
      const decoded = pkt.decodedPayload ?? pkt.decoded_payload ?? {};
      const bat = decoded.battery !== undefined ? Number(decoded.battery) : 3.6;
      const pass = bat >= 2.8;
      return {
        pass,
        expected: '>= 2.80V',
        actual: `${bat}V`,
      };
    },
  },
  {
    id: 'rule-sensor-temperature',
    name: 'Temperature Environmental Gate',
    category: 'SENSOR_VALUE',
    severity: 'WARN',
    description: 'Nhiệt độ môi trường hoạt động trong dải tiêu chuẩn',
    conditionText: '10.0°C <= Temperature <= 55.0°C',
    enabled: true,
    evaluate: (pkt) => {
      const decoded = pkt.decodedPayload ?? pkt.decoded_payload ?? {};
      if (decoded.temperature === undefined) {
        return { pass: true, expected: '10 - 55°C', actual: 'N/A (Skipped)' };
      }
      const temp = Number(decoded.temperature);
      const pass = temp >= 10.0 && temp <= 55.0;
      return {
        pass,
        expected: '10.0 - 55.0°C',
        actual: `${temp}°C`,
      };
    },
  },
]);

const activeRulesCount = computed(() => rules.filter((r) => r.enabled).length);

const totalChecked = computed(() => results.value.length);
const passCount = computed(() => results.value.filter((r) => r.verdict === 'PASS').length);
const failCount = computed(() => results.value.filter((r) => r.verdict === 'FAIL').length);
const passRate = computed(() => {
  if (totalChecked.value === 0) return 100;
  return Math.round((passCount.value / totalChecked.value) * 100);
});

const overallVerdict = computed(() => {
  if (totalChecked.value === 0) return 'READY';
  return failCount.value === 0 ? 'PASSED' : 'FAILED';
});

const avgRssi = computed(() => {
  if (results.value.length === 0) return -76;
  const sum = results.value.reduce((acc, r) => acc + (r.rssi || -76), 0);
  return Math.round(sum / results.value.length);
});

const avgSnr = computed(() => {
  if (results.value.length === 0) return 8.5;
  const sum = results.value.reduce((acc, r) => acc + (r.snr || 8.5), 0);
  return Number((sum / results.value.length).toFixed(1));
});

const filteredResults = computed(() => {
  return results.value.filter((r) => {
    if (targetDevEui.value.trim()) {
      const kw = targetDevEui.value.trim().toLowerCase();
      if (!r.devEui.toLowerCase().includes(kw)) return false;
    }
    if (filterStatus.value === 'PASS' && r.verdict !== 'PASS') return false;
    if (filterStatus.value === 'FAIL' && r.verdict !== 'FAIL') return false;
    return true;
  });
});

function getCategoryBadgeClass(cat: string) {
  switch (cat) {
    case 'PROTOCOL':
      return 'badge-primary';
    case 'RF_QUALITY':
      return 'badge-accent';
    case 'PAYLOAD':
      return 'badge-warning';
    case 'SENSOR_VALUE':
      return 'badge-info';
    default:
      return 'badge-ghost';
  }
}

// Evaluate single packet against active rules
function evaluatePacket(packet: any, prevPacket?: any): EvaluationResult {
  const enabledRules = rules.filter((r) => r.enabled);
  const assertions = enabledRules.map((rule) => {
    const res = rule.evaluate(packet, prevPacket);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleDesc: rule.description,
      pass: res.pass,
      expected: res.expected,
      actual: res.actual,
      actualSummary: `${res.actual} (Req: ${res.expected})`,
    };
  });

  const hasFail = assertions.some((a) => !a.pass);
  const now = new Date();
  const time = now.toTimeString().split(' ')[0];

  const evalResult: EvaluationResult = {
    id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    time,
    devEui: packet.devEui || packet.dev_eui || packet.networkId || packet.network_id || packet.deviceId || '—',
    gatewayEui: packet.gatewayId || packet.gateway_id || packet.rfInfo?.gateway_id || packet.rf_info?.gateway_id || '—',
    fCnt: packet.fCnt ?? packet.f_cnt ?? 0,
    fPort: Number(packet.fPort ?? packet.f_port ?? 0),
    rssi: Number(packet.rssi ?? packet.rfInfo?.rssi ?? packet.rf_info?.rssi ?? 0),
    snr: Number(packet.snr ?? packet.rfInfo?.snr ?? packet.rf_info?.snr ?? 0),
    rawPayload: packet.rawPayload || packet.raw_payload || '',
    decodedPayload: packet.decodedPayload || packet.decoded_payload || {},
    assertions,
    verdict: hasFail ? 'FAIL' : 'PASS',
  };

  if (hasFail) {
    const failedRules = assertions.filter((a) => !a.pass).map((a) => a.ruleName).join(', ');
    addAutoCheckLog('RULE-FAIL', `DevEUI: ${evalResult.devEui} | FCnt: ${evalResult.fCnt} | Vi phạm: ${failedRules}`, 'error');
  } else {
    addAutoCheckLog('RULE-PASS', `DevEUI: ${evalResult.devEui} | FCnt: ${evalResult.fCnt} | Đạt ${assertions.length}/${assertions.length} tiêu chí`, 'success');
  }

  return evalResult;
}

// Ingest incoming packet from live stream or simulation
function handleIncomingPacket(packet: any) {
  if (!realtimeEvaluating.value) return;
  const prev = results.value.length > 0 ? results.value[0] : undefined;
  const evaluated = evaluatePacket(packet, prev);
  results.value.unshift(evaluated);
  if (results.value.length > 300) {
    results.value.pop();
  }
}

// Run batch evaluation on recent database packets
async function runBatchEvaluation() {
  loadingCheck.value = true;
  try {
    addAutoCheckLog('BATCH-START', 'Bắt đầu truy xuất và kiểm tra lô gói tin từ máy chủ...', 'info');
    const res: any = await httpClient.get('/plugins/testing/packets', {
      params: { limit: 20 },
    });
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || (Array.isArray(res) ? res : []));

    if (items.length === 0) {
      addAutoCheckLog('BATCH-EMPTY', 'Không tìm thấy gói tin nào trong lịch sử để kiểm tra', 'warning');
      cyberToast.warning('Chưa có gói tin nào trong lịch sử để kiểm tra. Hãy thử phát sóng từ Device Simulation!');
      return;
    }

    let prev: any = undefined;
    const batchEvaluated: EvaluationResult[] = [];
    // Sort oldest first for continuity check, then reverse
    const sorted = [...items].reverse();
    for (const pkt of sorted) {
      const evalRes = evaluatePacket(pkt, prev);
      batchEvaluated.unshift(evalRes);
      prev = pkt;
    }

    results.value = batchEvaluated;
    const passed = batchEvaluated.filter((r) => r.verdict === 'PASS').length;
    const failed = batchEvaluated.filter((r) => r.verdict === 'FAIL').length;
    addAutoCheckLog('BATCH-DONE', `Hoàn tất kiểm tra ${batchEvaluated.length} gói tin (${passed} Đạt, ${failed} Lỗi)`, 'data');
    cyberToast.success(`Đã tự động kiểm tra ${batchEvaluated.length} gói tin thành công!`);
  } catch (err: any) {
    console.error('Error running batch evaluation:', err);
    addAutoCheckLog('BATCH-ERR', `Lỗi kiểm tra lô: ${err?.message || 'Không rõ nguyên nhân'}`, 'error');
    cyberToast.error(err?.message || 'Không thể chạy kiểm tra lô gói tin');
  } finally {
    loadingCheck.value = false;
  }
}

function clearResults() {
  results.value = [];
}

function resetRulesToDefault() {
  rules.forEach((r) => (r.enabled = true));
  cyberToast.info('Đã khôi phục bộ quy tắc mặc định');
}

function viewDetailModal(res: EvaluationResult) {
  selectedResult.value = res;
  detailModalVisible.value = true;
}

function exportQaReport() {
  const report = {
    report_title: 'LoRaWAN Device Quality Assurance Inspection Certificate',
    generated_at: new Date().toISOString(),
    overall_verdict: overallVerdict.value,
    summary: {
      total_checked: totalChecked.value,
      passed_packets: passCount.value,
      failed_packets: failCount.value,
      pass_rate_percentage: `${passRate.value}%`,
      avg_rssi: `${avgRssi.value} dBm`,
      avg_snr: `${avgSnr.value} dB`,
    },
    active_rules: rules.filter((r) => r.enabled).map((r) => ({
      name: r.name,
      category: r.category,
      condition: r.conditionText,
    })),
    evaluated_records: results.value,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `lorawan-device-qa-report-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  cyberToast.success('Đã xuất báo cáo kiểm định QA thành công!');
}

defineExpose({
  handleIncomingPacket,
});
</script>
