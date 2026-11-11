<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-4xl bg-base-100 border border-base-300 shadow-2xl p-0 overflow-hidden text-base-content">
      <!-- 1. Modal Header -->
      <div class="px-5 py-4 bg-base-200/80 border-b border-base-300 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Activity class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">Device Test Metrics Report</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="isPass ? 'badge-success text-success-content' : isFail ? 'badge-error text-error-content' : 'badge-ghost'"
              >
                {{ testVerdict }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-base-content flex items-center gap-2 mt-0.5">
              <span>{{ device?.serialNumber || device?.code || 'Thiết Bị' }}</span>
              <span v-if="device?.devEui" class="text-xs font-mono font-normal text-base-content/60">({{ device.devEui }})</span>
            </h3>
          </div>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 2. Modal Body -->
      <div class="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
        <!-- Metadata Overview Card -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-base-200/50 border border-base-300 text-xs font-mono">
          <div>
            <span class="text-base-content/60 block text-[11px]">SO NUMBER:</span>
            <span class="font-bold text-primary">{{ device?.soNumber || device?.so?.so_number || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">WA NUMBER:</span>
            <span class="font-bold text-base-content">{{ device?.waNumber || device?.wa?.wa_number || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">ITEM CODE:</span>
            <span class="font-bold text-base-content">{{ device?.itemCode || device?.sku || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">HW / FW VER:</span>
            <span class="font-bold text-base-content">{{ device?.hwVersion || '—' }} / {{ device?.fwVersion || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">TESTED BY:</span>
            <span class="font-bold text-base-content">{{ testPerson || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">TIME TEST:</span>
            <span class="font-bold text-base-content">{{ formattedTestTime }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">BATCH CODE:</span>
            <span class="font-bold text-info">{{ rawMetrics?.batchCode || '—' }}</span>
          </div>
          <div>
            <span class="text-base-content/60 block text-[11px]">TOTAL UPLINKS:</span>
            <span class="font-bold text-success">{{ totalUplinks }} gói</span>
          </div>
        </div>

        <!-- 3 RF Metric KPI Tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- AVG_CYCLE -->
          <div class="card bg-base-200/70 border border-base-300 p-3 rounded-xl space-y-1">
            <div class="flex items-center justify-between text-base-content/70 text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-info">
                <Clock class="w-3.5 h-3.5" />
                AVG_CYCLE
              </span>
              <span class="badge badge-xs badge-info font-mono">Chu kỳ</span>
            </div>
            <div class="text-xl font-bold font-mono text-base-content mt-1">
              {{ avgCycleDisplay }}
            </div>
            <div class="text-[11px] text-base-content/60">
              Khoảng cách trung bình giữa các gói tin
            </div>
          </div>

          <!-- AVG_RSSI -->
          <div class="card bg-base-200/70 border border-base-300 p-3 rounded-xl space-y-1">
            <div class="flex items-center justify-between text-base-content/70 text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-primary">
                <Radio class="w-3.5 h-3.5" />
                AVG_RSSI
              </span>
              <span class="badge badge-xs badge-primary font-mono">Tín hiệu</span>
            </div>
            <div class="text-xl font-bold font-mono text-base-content mt-1">
              {{ avgRssiDisplay }}
            </div>
            <div class="text-[11px] text-base-content/60">
              Mức thu công suất RF trung bình
            </div>
          </div>

          <!-- AVG_SNR -->
          <div class="card bg-base-200/70 border border-base-300 p-3 rounded-xl space-y-1">
            <div class="flex items-center justify-between text-base-content/70 text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-success">
                <Zap class="w-3.5 h-3.5" />
                AVG_SNR
              </span>
              <span class="badge badge-xs badge-success font-mono">Tỷ số S/N</span>
            </div>
            <div class="text-xl font-bold font-mono text-base-content mt-1">
              {{ avgSnrDisplay }}
            </div>
            <div class="text-[11px] text-base-content/60">
              Tỷ số tín hiệu trên nhiễu trung bình
            </div>
          </div>
        </div>

        <!-- Tab Selector: Tolerance vs Timeline vs Variables vs Raw -->
        <div class="tabs tabs-boxed bg-base-200/60 p-1 rounded-xl">
          <button
            class="tab tab-sm font-bold text-xs"
            :class="{ 'tab-active !bg-primary !text-primary-content': activeTab === 'tolerance' }"
            @click="activeTab = 'tolerance'"
          >
            Đối Soát Thiết Bị Chuẩn
          </button>
          <button
            class="tab tab-sm font-bold text-xs"
            :class="{ 'tab-active !bg-primary !text-primary-content': activeTab === 'timeline' }"
            @click="activeTab = 'timeline'"
          >
            Timeline Gói Tin ({{ allTimelinePackets.length }})
          </button>
          <button
            class="tab tab-sm font-bold text-xs"
            :class="{ 'tab-active !bg-primary !text-primary-content': activeTab === 'variables' }"
            @click="activeTab = 'variables'"
          >
            Biến Mô Phỏng ({{ flowVariablesList.length }})
          </button>
          <button
            class="tab tab-sm font-bold text-xs"
            :class="{ 'tab-active !bg-primary !text-primary-content': activeTab === 'raw' }"
            @click="activeTab = 'raw'"
          >
            Dữ Liệu JSON
          </button>
        </div>

        <!-- PANEL 1: Đối Soát Thiết Bị Chuẩn (Golden Reference Tolerance) -->
        <div v-show="activeTab === 'tolerance'" class="space-y-3">
          <div v-if="comparisonData" class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="text-base-content/80">
                Thiết bị chuẩn đối chiếu:
                <span class="font-mono font-bold text-primary">
                  {{ rawMetrics?.referenceSerialNumber || rawMetrics?.referenceDevEui || comparisonData?.ref_device || 'Golden Reference' }}
                </span>
              </div>
              <div
                class="badge badge-sm font-mono font-bold"
                :class="comparisonData.tolerance_pass ? 'badge-success' : 'badge-error'"
              >
                Dung sai: {{ comparisonData.tolerance_pass ? 'ĐẠT (PASS)' : 'KHÔNG ĐẠT (FAIL)' }}
              </div>
            </div>

            <!-- Tolerance Comparison Table -->
            <div class="overflow-x-auto rounded-xl border border-base-300">
              <table class="table table-xs w-full">
                <thead>
                  <tr class="bg-base-200 text-xs">
                    <th>Thông Số</th>
                    <th class="text-center">Giá Trị DUT</th>
                    <th class="text-center">Giá Trị Chuẩn (Ref)</th>
                    <th class="text-center">Độ Lệch (Delta)</th>
                    <th class="text-center">Ngưỡng Chuẩn</th>
                    <th class="text-center">Kết Quả</th>
                  </tr>
                </thead>
                <tbody class="font-mono text-xs">
                  <!-- Temperature -->
                  <tr>
                    <td class="font-bold text-base-content">Nhiệt Độ (°C)</td>
                    <td class="text-center font-bold text-primary">{{ comparisonData.dut_temp != null ? `${comparisonData.dut_temp}°C` : '—' }}</td>
                    <td class="text-center font-bold text-info">{{ comparisonData.ref_temp != null ? `${comparisonData.ref_temp}°C` : '—' }}</td>
                    <td class="text-center font-bold">{{ comparisonData.temp_delta != null ? `±${comparisonData.temp_delta}°C` : '—' }}</td>
                    <td class="text-center text-base-content/60">≤ 1.0°C</td>
                    <td class="text-center">
                      <span
                        class="badge badge-xs font-bold"
                        :class="comparisonData.temp_pass ? 'badge-success' : 'badge-error'"
                      >
                        {{ comparisonData.temp_pass ? 'PASS' : 'FAIL' }}
                      </span>
                    </td>
                  </tr>

                  <!-- Humidity -->
                  <tr>
                    <td class="font-bold text-base-content">Độ Ẩm (%RH)</td>
                    <td class="text-center font-bold text-primary">{{ comparisonData.dut_hum != null ? `${comparisonData.dut_hum}%` : '—' }}</td>
                    <td class="text-center font-bold text-info">{{ comparisonData.ref_hum != null ? `${comparisonData.ref_hum}%` : '—' }}</td>
                    <td class="text-center font-bold">{{ comparisonData.hum_delta != null ? `±${comparisonData.hum_delta}%` : '—' }}</td>
                    <td class="text-center text-base-content/60">≤ 5.0%</td>
                    <td class="text-center">
                      <span
                        class="badge badge-xs font-bold"
                        :class="comparisonData.hum_pass ? 'badge-success' : 'badge-error'"
                      >
                        {{ comparisonData.hum_pass ? 'PASS' : 'FAIL' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-base-content/50">
            Không có dữ liệu đối chiếu với thiết bị chuẩn cho thiết bị này.
          </div>
        </div>

        <!-- PANEL 2: Timeline Gói Tin Có Timestamp -->
        <div v-show="activeTab === 'timeline'" class="space-y-2">
          <div v-if="allTimelinePackets.length > 0" class="overflow-x-auto rounded-xl border border-base-300 max-h-[300px]">
            <table class="table table-xs w-full table-pin-rows">
              <thead>
                <tr class="bg-base-200 text-xs">
                  <th class="w-12 text-center">STT</th>
                  <th>Thời Gian (Timestamp)</th>
                  <th>Nguồn</th>
                  <th class="text-center">FCnt</th>
                  <th class="text-center">RSSI</th>
                  <th class="text-center">SNR</th>
                  <th class="text-center">Nhiệt Độ</th>
                  <th class="text-center">Độ Ẩm</th>
                </tr>
              </thead>
              <tbody class="font-mono text-xs">
                <tr v-for="(pkt, idx) in allTimelinePackets" :key="idx" class="hover:bg-base-200/50">
                  <td class="text-center text-base-content/50">{{ idx + 1 }}</td>
                  <td class="font-bold text-base-content whitespace-nowrap">{{ formatPacketTime(pkt.timestamp || pkt.createdAt || pkt.created_at) }}</td>
                  <td>
                    <span
                      class="badge badge-xs font-bold font-mono"
                      :class="pkt.source === 'REF' ? 'badge-warning text-warning-content' : 'badge-primary text-primary-content'"
                    >
                      {{ pkt.source === 'REF' ? 'REFERENCE' : 'DUT' }}
                    </span>
                  </td>
                  <td class="text-center">{{ pkt.fCnt ?? pkt.fcnt ?? pkt.f_cnt ?? '—' }}</td>
                  <td class="text-center text-primary font-bold">{{ pkt.rssi != null ? `${pkt.rssi} dBm` : '—' }}</td>
                  <td class="text-center text-success font-bold">{{ pkt.snr != null ? `${pkt.snr} dB` : '—' }}</td>
                  <td class="text-center font-bold text-info">{{ pkt.temperature != null || pkt.temp != null ? `${pkt.temperature ?? pkt.temp}°C` : '—' }}</td>
                  <td class="text-center font-bold">{{ pkt.humidity != null || pkt.hum != null ? `${pkt.humidity ?? pkt.hum}%` : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-6 text-xs text-base-content/50">
            Chưa có gói tin uplink nào được ghi nhận trong phiên kiểm thử này.
          </div>
        </div>

        <!-- PANEL: Biến Mô Phỏng (Simulation Flow Variables & Metadata) -->
        <div v-show="activeTab === 'variables'" class="space-y-3">
          <div v-if="flowVariablesList.length > 0" class="overflow-x-auto rounded-xl border border-base-300">
            <table class="table table-xs w-full">
              <thead>
                <tr class="bg-base-200 text-xs">
                  <th>Tên Biến</th>
                  <th class="text-center">Nguồn Tạo (Source Block)</th>
                  <th class="text-center">Kiểu Dữ Liệu</th>
                  <th class="text-right">Giá Trị Lưu Trữ</th>
                </tr>
              </thead>
              <tbody class="font-mono text-xs">
                <tr v-for="(v, idx) in flowVariablesList" :key="idx" class="hover:bg-base-200/50">
                  <td class="font-bold text-primary">{{ v.name }}</td>
                  <td class="text-center">
                    <span class="badge badge-xs font-mono font-semibold badge-outline">
                      {{ v.sourceBlock || 'Flow Step' }}
                    </span>
                  </td>
                  <td class="text-center text-base-content/70">
                    {{ v.dataType || 'string' }}
                  </td>
                  <td class="text-right font-bold text-success font-mono">
                    {{ v.value != null ? v.value : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-6 text-xs text-base-content/50">
            Chưa có thông tin biến mô phỏng được lưu trữ trong đợt kiểm thử này.
          </div>
        </div>

        <!-- PANEL 3: Raw JSON Data -->
        <div v-show="activeTab === 'raw'" class="space-y-2">
          <div class="flex items-center justify-between text-xs pb-1">
            <span class="text-base-content/60">Dữ liệu JSON thô lưu trong traceability:</span>
            <button class="btn btn-xs btn-outline" @click="copyJson">
              Sao Chép JSON
            </button>
          </div>
          <div class="bg-base-300/50 p-3 rounded-xl border border-base-300 font-mono text-xs overflow-auto max-h-[300px]">
            <pre>{{ formattedJson }}</pre>
          </div>
        </div>
      </div>

      <!-- 3. Modal Footer -->
      <div class="px-5 py-3 bg-base-200/60 border-t border-base-300 flex items-center justify-between">
        <div class="text-xs text-base-content/60 font-mono">
          Trạng thái lưu trữ: <span class="text-success font-semibold">Đã đồng bộ Traceability</span>
        </div>
        <button class="btn btn-sm btn-ghost" @click="emit('close')">
          Đóng
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Activity,
  X,
  Clock,
  Radio,
  Zap,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';

const props = defineProps<{
  visible: boolean;
  device?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeTab = ref<'tolerance' | 'timeline' | 'variables' | 'raw'>('tolerance');

// Raw parsed test metrics
const rawMetrics = computed(() => {
  if (!props.device) return null;
  const raw = props.device.testRawData || props.device.test_raw_data || props.device.metadata?.testRawData;
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
});

// Danh sách các biến mô phỏng lưu trong Traceability
const flowVariablesList = computed(() => {
  const vars =
    rawMetrics.value?.variables ||
    rawMetrics.value?.flowVariables ||
    rawMetrics.value?.simulationVariables ||
    props.device?.variables ||
    props.device?.testRawData?.variables ||
    [];

  if (Array.isArray(vars)) {
    return vars.map((v: any) => ({
      name: v.name || v.key || v.varName || 'var',
      value: v.value ?? v.val ?? v.hex ?? '',
      sourceBlock: v.sourceBlock || v.sourceType || v.source || v.functionType || 'Flow Step',
      dataType: v.dataType || v.data_type || v.type || 'string',
    }));
  }
  if (vars && typeof vars === 'object') {
    return Object.entries(vars).map(([name, val]: [string, any]) => {
      if (val && typeof val === 'object') {
        return {
          name,
          value: val.value ?? val.val ?? val.hex ?? JSON.stringify(val),
          sourceBlock: val.sourceBlock || val.sourceType || val.source || val.functionType || 'Flow Step',
          dataType: val.dataType || val.data_type || typeof (val.value ?? val),
        };
      }
      return {
        name,
        value: val,
        sourceBlock: 'Flow Step',
        dataType: typeof val,
      };
    });
  }
  return [];
});

const comparisonData = computed(() => {
  return rawMetrics.value?.comparisonResult || props.device?.comparisonResult || null;
});

const testVerdict = computed(() => {
  const v = (props.device?.testResult || props.device?.test_result || rawMetrics.value?.itemVerdict || '').toUpperCase();
  return v || 'NONE';
});

const isPass = computed(() => testVerdict.value === 'PASS');
const isFail = computed(() => testVerdict.value === 'FAIL');

const testPerson = computed(() => {
  return props.device?.testPerson || props.device?.test_person || rawMetrics.value?.testPerson || '—';
});

const formattedTestTime = computed(() => {
  const t = props.device?.testedAt || props.device?.tested_at || rawMetrics.value?.testedAt || props.device?.createdAt;
  if (!t) return '—';
  try {
    const d = new Date(t);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(t);
  }
});

// RF KPIs
const avgCycleDisplay = computed(() => {
  const c = rawMetrics.value?.avgCycle ?? comparisonData.value?.avg_cycle ?? props.device?.avgCycle ?? props.device?.avg_cycle;
  if (c != null && c !== '') return `${Number(c).toFixed(1)}s`;
  return '—';
});

const avgRssiDisplay = computed(() => {
  const r = rawMetrics.value?.avgRssi ?? comparisonData.value?.avg_rssi ?? props.device?.avgRssi ?? props.device?.avg_rssi;
  if (r != null && r !== '') return `${r} dBm`;
  return '—';
});

const avgSnrDisplay = computed(() => {
  const s = rawMetrics.value?.avgSnr ?? comparisonData.value?.avg_snr ?? props.device?.avgSnr ?? props.device?.avg_snr;
  if (s != null && s !== '') return `${s} dB`;
  return '—';
});

const totalUplinks = computed(() => {
  return rawMetrics.value?.packetsReceived ?? comparisonData.value?.packets_received ?? allTimelinePackets.value.length ?? 0;
});

// Packets Timeline List
const allTimelinePackets = computed(() => {
  const dut = Array.isArray(rawMetrics.value?.dutPackets)
    ? rawMetrics.value.dutPackets.map((p: any) => ({ ...p, source: 'DUT' }))
    : Array.isArray(comparisonData.value?.dut_packets)
    ? comparisonData.value.dut_packets.map((p: any) => ({ ...p, source: 'DUT' }))
    : [];

  const ref = Array.isArray(rawMetrics.value?.referencePackets)
    ? rawMetrics.value.referencePackets.map((p: any) => ({ ...p, source: 'REF' }))
    : Array.isArray(comparisonData.value?.reference_packets)
    ? comparisonData.value.reference_packets.map((p: any) => ({ ...p, source: 'REF' }))
    : [];

  const combined = [...dut, ...ref];
  combined.sort((a, b) => {
    const ta = new Date(a.timestamp || a.createdAt || a.created_at || 0).getTime();
    const tb = new Date(b.timestamp || b.createdAt || b.created_at || 0).getTime();
    return tb - ta; // Newest first
  });
  return combined;
});

function formatPacketTime(t: any): string {
  if (!t) return '—';
  try {
    const d = new Date(t);
    return (
      d.toLocaleDateString('vi-VN') +
      ' ' +
      d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      '.' +
      String(d.getMilliseconds()).padStart(3, '0')
    );
  } catch {
    return String(t);
  }
}

// JSON Formatting & Copy
const formattedJson = computed(() => {
  return JSON.stringify(props.device?.testRawData || props.device?.test_raw_data || props.device || {}, null, 2);
});

async function copyJson() {
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    cyberToast.success('Đã sao chép JSON vào clipboard');
  } catch {
    cyberToast.error('Không thể sao chép JSON');
  }
}
</script>
