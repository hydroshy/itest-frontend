<template>
  <div class="final-config-tool">
    <!-- 1. HARDWARE & PORT BAR -->
    <el-card shadow="never" class="tool-card">
      <template #header>
        <div class="flex-between">
          <div class="header-title">
            <el-icon class="icon-brand"><Connection /></el-icon>
            <span>Web Serial Port & Modbus RTU</span>
            <el-tag :type="isSerialSupported ? 'success' : 'danger'" size="small" effect="plain">
              {{ isSerialSupported ? 'Serial API Sẵn sàng' : 'Trình duyệt không hỗ trợ Web Serial' }}
            </el-tag>
          </div>
          <div class="header-badges">
            <el-tag v-if="serialConnected" type="success" effect="dark">
              ĐÃ KẾT NỐI: {{ portLabel || 'COM PORT' }} ({{ baudRate }} bps, 8-N-1)
            </el-tag>
            <el-tag v-else-if="isAutoReconnecting" type="warning" effect="dark">
              ĐANG ĐỢI TỰ ĐỘNG KẾT NỐI LẠI (USB RECONNECT)...
            </el-tag>
            <el-tag v-else type="info" effect="plain">CHƯA KẾT NỐI CỔNG SERIAL</el-tag>
          </div>
        </div>
      </template>

      <el-row :gutter="16" class="align-center">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="field-group">
            <label class="field-label">Cổng COM (Serial Port)</label>
            <div class="flex-gap">
              <el-button
                type="primary"
                :disabled="!isSerialSupported || serialConnected || isExecuting"
                @click="requestSerialPort"
              >
                {{ serialPort ? 'Đổi cổng' : 'Chọn cổng COM' }}
              </el-button>
              <span v-if="portLabel" class="port-name font-mono">{{ portLabel }}</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="6" :md="4">
          <div class="field-group">
            <label class="field-label">Baud Rate</label>
            <el-select v-model="baudRate" :disabled="serialConnected || isExecuting" class="w-full">
              <el-option :value="9600" label="9600 bps" />
              <el-option :value="19200" label="19200 bps" />
              <el-option :value="38400" label="38400 bps" />
              <el-option :value="57600" label="57600 bps" />
              <el-option :value="115200" label="115200 bps" />
            </el-select>
          </div>
        </el-col>

        <el-col :xs="24" :sm="6" :md="3">
          <div class="field-group">
            <label class="field-label">Slave ID</label>
            <el-input-number v-model="modbusSlave" :min="1" :max="247" :disabled="isExecuting" class="w-full" />
          </div>
        </el-col>

        <el-col :xs="24" :sm="6" :md="3">
          <div class="field-group">
            <label class="field-label">Timeout (ms)</label>
            <el-input-number v-model="readTimeoutMs" :min="300" :max="10000" :step="100" :disabled="isExecuting" class="w-full" />
          </div>
        </el-col>

        <el-col :xs="24" :sm="18" :md="8">
          <div class="field-group">
            <label class="field-label">Thao tác kết nối</label>
            <div class="flex-gap">
              <el-button
                v-if="!serialConnected"
                type="success"
                :disabled="!serialPort || !isSerialSupported || isConnecting"
                :loading="isConnecting"
                @click="connectSerial"
              >
                Mở kết nối
              </el-button>
              <el-button
                v-else
                type="danger"
                :disabled="isExecuting"
                @click="disconnectSerial(true)"
              >
                Ngắt kết nối
              </el-button>
              <el-button
                :disabled="!serialConnected || isExecuting"
                @click="flushBuffers"
              >
                Flush Buffer
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. PROFILE & EXECUTION BAR -->
    <el-card shadow="never" class="tool-card">
      <template #header>
        <div class="flex-between">
          <div class="header-title">
            <el-icon class="icon-brand"><Document /></el-icon>
            <span>Chọn Final Config Profile & Thực thi QA UART</span>
          </div>
          <div class="flex-gap">
            <el-button size="small" :icon="Refresh" :loading="loadingProfiles" @click="loadProfiles">
              Tải lại profiles
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="16" class="align-center mb-3">
        <el-col :xs="24" :md="8">
          <div class="field-group">
            <label class="field-label">Final Config Profile (*)</label>
            <el-select
              v-model="selectedProfileId"
              filterable
              placeholder="Chọn profile theo SKU / SO Number..."
              class="w-full"
              :disabled="isExecuting"
              @change="onProfileChange"
            >
              <el-option
                v-for="p in profileList"
                :key="p.id"
                :value="p.id"
                :label="`${p.sku} | ${p.soNumber} | ${p.connectivity} (${p.registersCount || 0} registers)`"
              >
                <div class="option-row">
                  <span class="font-bold">{{ p.sku }}</span>
                  <span class="text-muted">{{ p.soNumber }}</span>
                  <el-tag size="small">{{ p.connectivity }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </div>
        </el-col>

        <el-col :xs="24" :md="6">
          <div class="field-group">
            <label class="field-label">Mã Serial / IMEI Thiết bị</label>
            <el-input
              v-model="deviceSerialNumber"
              placeholder="Nhập hoặc quét Serial/IMEI..."
              clearable
              :disabled="isExecuting"
            />
          </div>
        </el-col>

        <el-col :xs="24" :md="10">
          <div class="field-group">
            <label class="field-label">Điều khiển thực thi</label>
            <div class="flex-gap">
              <el-button
                type="primary"
                size="large"
                :icon="VideoPlay"
                :disabled="!canRunExecution || isExecuting"
                :loading="isExecuting"
                @click="runFullExecution"
              >
                Đọc & Đối soát UART TTL ({{ executableRegisters.length }} registers)
              </el-button>
              <el-button
                v-if="isExecuting"
                type="danger"
                size="large"
                :icon="VideoPause"
                @click="abortExecution"
              >
                Dừng (Abort)
              </el-button>
              <el-button
                :disabled="isExecuting || executableRegisters.length === 0"
                @click="resetRegisterResults"
              >
                Xóa kết quả
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Stateful Server Session Banner -->
      <div v-if="activeSessionId || activeSessionStatus !== 'IDLE'" class="session-banner mb-3">
        <div class="session-info">
          <el-tag
            :type="activeSessionStatus === 'COMPLETED' ? 'success' : (activeSessionStatus === 'IN_PROGRESS' ? 'warning' : (activeSessionStatus === 'FAILED' ? 'danger' : 'info'))"
            effect="dark"
            size="small"
          >
            {{ activeSessionStatus }}
          </el-tag>
          <span class="session-id-text">
            <strong>Server Session:</strong> <code>{{ activeSessionId || 'Chưa khởi tạo' }}</code>
          </span>
          <span v-if="deviceSerialNumber" class="session-device-text">
            <strong>Device:</strong> <code>{{ deviceSerialNumber }}</code>
          </span>
          <span v-if="isSessionSyncing" class="sync-tag">
            <el-icon class="is-loading"><Loading /></el-icon> Đang đồng bộ máy chủ...
          </span>
        </div>
        <div class="session-actions">
          <el-checkbox
            v-if="hasPassedRegisters"
            v-model="resumeMode"
            :disabled="isExecuting"
            class="mr-2"
          >
            Bỏ qua register đã PASS (Resume)
          </el-checkbox>
          <el-button
            v-if="activeSessionId && !isExecuting"
            size="small"
            type="warning"
            plain
            @click="resetSession"
          >
            Làm mới phiên
          </el-button>
        </div>
      </div>

      <!-- Profile details pills -->
      <div v-if="currentProfile" class="profile-summary-pills">
        <div class="pill"><strong>SKU:</strong> {{ currentProfile.sku }}</div>
        <div class="pill"><strong>SO Number:</strong> {{ currentProfile.soNumber }}</div>
        <div class="pill"><strong>Item Code:</strong> {{ currentProfile.itemCode || '-' }}</div>
        <div class="pill"><strong>Connectivity:</strong> {{ currentProfile.connectivity }}</div>
        <div class="pill"><strong>LONG_FW:</strong> {{ currentProfile.longFw }}</div>
        <div class="pill"><strong>SHORT_FW:</strong> {{ currentProfile.shortFw }}</div>
        <div class="pill"><strong>Registers được chọn:</strong> {{ executableRegisters.length }} / {{ allRegisters.length }}</div>
      </div>

      <!-- Execution progress & statistics -->
      <div v-if="currentProfile" class="exec-stats-bar">
        <div class="stats-counters">
          <span class="counter-badge all">Tổng: {{ stats.total }}</span>
          <span class="counter-badge pass">PASS: {{ stats.pass }}</span>
          <span class="counter-badge fail">FAIL: {{ stats.fail }}</span>
          <span class="counter-badge error">ERROR: {{ stats.error }}</span>
          <span class="counter-badge pending">PENDING: {{ stats.pending }}</span>
        </div>
        <div v-if="isExecuting || statusMessage" class="exec-status-text">
          <el-icon v-if="isExecuting" class="is-loading"><Loading /></el-icon>
          <span>{{ statusMessage }}</span>
        </div>
      </div>
      <el-progress
        v-if="currentProfile && (isExecuting || stats.total > 0)"
        :percentage="progressPercentage"
        :status="stats.fail > 0 || stats.error > 0 ? 'exception' : (stats.pass === stats.total && stats.total > 0 ? 'success' : undefined)"
        class="mt-2"
      />
    </el-card>

    <!-- 3. MAIN WORKSPACE: REGISTERS TABLE & LOG PANEL -->
    <el-row :gutter="16" class="mt-4">
      <!-- Registers List -->
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="table-card">
          <template #header>
            <div class="flex-between">
              <span class="font-bold">Danh sách Registers thực thi UART TTL (selected = true)</span>
              <span class="text-xs text-muted">Sử dụng Modbus FC 03</span>
            </div>
          </template>

          <el-table
            :data="executableRegisters"
            row-key="id"
            border
            stripe
            size="small"
            empty-text="Chưa có profile được chọn hoặc không có register nào được đánh dấu selected"
            class="reg-table"
          >
            <el-table-column prop="modbusRegisterDec" label="Dec" width="70" align="center" />
            <el-table-column prop="modbusRegisterHex" label="Hex" width="75" align="center" />
            <el-table-column prop="registerCount" label="Count" width="65" align="center" />
            <el-table-column prop="description" label="Description" min-width="140" show-overflow-tooltip />
            <el-table-column prop="format" label="Format" width="85" align="center" />
            
            <el-table-column label="Giá trị kỳ vọng" min-width="110" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="font-mono text-xs">{{ row.inputConfig || row.endUserDefault || '(Trống)' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Đọc được" min-width="110" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.valueReadBack !== undefined" class="font-mono font-bold text-xs" :class="row.execStatus === 'PASS' ? 'text-success' : 'text-danger'">
                  {{ row.valueReadBack }}
                </span>
                <span v-else class="text-muted text-xs">-</span>
              </template>
            </el-table-column>

            <el-table-column label="Raw Hex" min-width="110" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.rawHex" class="font-mono text-xs text-muted">{{ row.rawHex }}</span>
                <span v-else class="text-muted text-xs">-</span>
              </template>
            </el-table-column>

            <el-table-column label="Kết quả" width="95" align="center">
              <template #default="{ row }">
                <el-tag
                  v-if="row.execStatus === 'PASS'"
                  type="success"
                  size="small"
                  effect="dark"
                >PASS</el-tag>
                <el-tag
                  v-else-if="row.execStatus === 'FAIL'"
                  type="danger"
                  size="small"
                  effect="dark"
                >FAIL</el-tag>
                <el-tag
                  v-else-if="row.execStatus === 'ERROR'"
                  type="danger"
                  size="small"
                  effect="plain"
                >ERROR</el-tag>
                <el-tag
                  v-else-if="row.execStatus === 'READING'"
                  type="warning"
                  size="small"
                  effect="light"
                >ĐỌC...</el-tag>
                <el-tag
                  v-else
                  type="info"
                  size="small"
                  effect="plain"
                >CHỜ</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="Thao tác" width="70" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  :disabled="!serialConnected || isExecuting"
                  @click="runSingleRegister(row)"
                >
                  Đọc lại
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- UART / Modbus Frame Log Console -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="log-card">
          <template #header>
            <div class="flex-between">
              <div class="flex-gap">
                <span class="font-bold">Log UART TTL / Modbus Frame</span>
                <el-tag size="small" type="info">{{ logs.length }} records</el-tag>
              </div>
              <div class="flex-gap">
                <el-button link type="primary" size="small" @click="copyLogs">Sao chép</el-button>
                <el-button link type="danger" size="small" @click="clearLogs">Xóa log</el-button>
              </div>
            </div>
          </template>

          <div ref="logContainerEl" class="log-console font-mono">
            <div v-if="logs.length === 0" class="log-empty">
              Chưa có dữ liệu log UART / Modbus...
            </div>
            <div
              v-for="(log, idx) in logs"
              :key="idx"
              class="log-line"
              :class="`log-${log.type.toLowerCase()}`"
            >
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-badge" :class="`badge-${log.type.toLowerCase()}`">{{ log.type }}</span>
              <span class="log-msg">{{ log.message }}</span>
              <span v-if="log.hex" class="log-hex">{{ log.hex }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Connection,
  Document,
  Refresh,
  VideoPlay,
  VideoPause,
  Loading,
} from '@element-plus/icons-vue';

// -----------------------------------------------------------------------------
// TYPES & INTERFACES
// -----------------------------------------------------------------------------
interface FinalConfigProfile {
  id: string;
  soNumber: string;
  itemCode: string;
  connectivity: string;
  sku: string;
  longFw: string;
  shortFw: string;
  registersCount: number;
  status: string;
  registers?: RegisterRow[];
}

interface RegisterRow {
  id?: string;
  rowNumber?: number;
  modbusRegisterDec: number;
  modbusRegisterHex?: string;
  registerCount: number;
  description?: string;
  format?: string;
  comment?: string;
  endUserDefault?: string;
  inputConfig?: string;
  configCheck?: string;
  selected?: boolean;
  // Execution runtime fields:
  execStatus?: 'PENDING' | 'READING' | 'PASS' | 'FAIL' | 'ERROR';
  valueReadBack?: string;
  rawHex?: string;
  execError?: string;
}

interface LogEntry {
  time: string;
  type: 'TX' | 'RX' | 'SYS' | 'WARN' | 'ERROR' | 'INFO';
  message: string;
  hex?: string;
}

// -----------------------------------------------------------------------------
// REACTIVE STATE
// -----------------------------------------------------------------------------
const isSerialSupported = ref(typeof navigator !== 'undefined' && 'serial' in navigator);
const serialPort = ref<any>(null);
const serialConnected = ref(false);
const isConnecting = ref(false);
const isAutoReconnecting = ref(false);
const portLabel = ref('');

const baudRate = ref(9600);
const modbusSlave = ref(1);
const readTimeoutMs = ref(1200);

const profileList = ref<FinalConfigProfile[]>([]);
const selectedProfileId = ref<string>('');
const currentProfile = ref<FinalConfigProfile | null>(null);
const allRegisters = ref<RegisterRow[]>([]);
const loadingProfiles = ref(false);

const deviceSerialNumber = ref<string>('');
const activeSessionId = ref<string | null>(null);
const activeSessionStatus = ref<string>('IDLE');
const isSessionSyncing = ref<boolean>(false);
const resumeMode = ref<boolean>(false);

const isExecuting = ref(false);
const abortRequested = ref(false);
const statusMessage = ref('');

const logs = ref<LogEntry[]>([]);
const logContainerEl = ref<HTMLElement | null>(null);

let activeWriter: any = null;
let activeReader: any = null;

// -----------------------------------------------------------------------------
// COMPUTED
// -----------------------------------------------------------------------------
const executableRegisters = computed(() => {
  return allRegisters.value.filter((r) => r.selected === true);
});

const canRunExecution = computed(() => {
  return serialConnected.value && currentProfile.value && executableRegisters.value.length > 0;
});

const stats = computed(() => {
  const list = executableRegisters.value;
  return {
    total: list.length,
    pass: list.filter((r) => r.execStatus === 'PASS').length,
    fail: list.filter((r) => r.execStatus === 'FAIL').length,
    error: list.filter((r) => r.execStatus === 'ERROR').length,
    pending: list.filter((r) => !r.execStatus || r.execStatus === 'PENDING').length,
  };
});

const hasPassedRegisters = computed(() => {
  return executableRegisters.value.some((r) => r.execStatus === 'PASS');
});

const progressPercentage = computed(() => {
  if (stats.value.total === 0) return 0;
  const done = stats.value.pass + stats.value.fail + stats.value.error;
  return Math.min(100, Math.round((done / stats.value.total) * 100));
});

// -----------------------------------------------------------------------------
// LOGGING UTILITIES
// -----------------------------------------------------------------------------
const getNowTimeStr = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
};

const addLog = (
  type: 'TX' | 'RX' | 'SYS' | 'WARN' | 'ERROR' | 'INFO',
  message: string,
  rawBytes?: Uint8Array | number[] | null,
) => {
  let hex: string | undefined;
  if (rawBytes && rawBytes.length > 0) {
    hex = Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  }
  logs.value.push({
    time: getNowTimeStr(),
    type,
    message,
    hex,
  });
  if (logs.value.length > 1000) {
    logs.value.shift();
  }
  nextTick(() => {
    if (logContainerEl.value) {
      logContainerEl.value.scrollTop = logContainerEl.value.scrollHeight;
    }
  });
};

const clearLogs = () => {
  logs.value = [];
};

const copyLogs = async () => {
  const text = logs.value
    .map((l) => `[${l.time}] [${l.type}] ${l.message} ${l.hex ? `(${l.hex})` : ''}`)
    .join('\n');
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('Đã sao chép toàn bộ log vào clipboard');
  } catch {
    ElMessage.error('Không thể sao chép log');
  }
};

// -----------------------------------------------------------------------------
// WEB SERIAL API & MODBUS RTU ENGINE
// -----------------------------------------------------------------------------
const requestSerialPort = async () => {
  if (!isSerialSupported.value) {
    ElMessage.error('Trình duyệt của bạn không hỗ trợ Web Serial API.');
    return;
  }
  try {
    const port = await (navigator as any).serial.requestPort();
    serialPort.value = port;
    const info = port.getInfo ? port.getInfo() : {};
    portLabel.value = info.usbVendorId
      ? `VID:${info.usbVendorId.toString(16).padStart(4, '0').toUpperCase()} PID:${(info.usbProductId || 0).toString(16).padStart(4, '0').toUpperCase()}`
      : 'Serial Device';
    addLog('SYS', `Đã chọn cổng Serial: ${portLabel.value}`);
  } catch (err: any) {
    if (err.name !== 'NotFoundError') {
      addLog('ERROR', `Lỗi chọn cổng Serial: ${err.message || err}`);
    }
  }
};

const connectSerial = async () => {
  if (!serialPort.value) {
    ElMessage.warning('Vui lòng chọn cổng Serial trước.');
    return;
  }
  isConnecting.value = true;
  try {
    await serialPort.value.open({
      baudRate: Number(baudRate.value) || 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 255,
    });
    serialConnected.value = true;
    isAutoReconnecting.value = false;
    addLog('SYS', `Kết nối thành công cổng ${portLabel.value || 'COM'} @ ${baudRate.value} bps (8-N-1)`);
    ElMessage.success(`Đã mở kết nối Serial @ ${baudRate.value} bps`);
  } catch (err: any) {
    addLog('ERROR', `Không thể mở cổng Serial: ${err.message || err}`);
    ElMessage.error(`Lỗi mở cổng: ${err.message || err}`);
  } finally {
    isConnecting.value = false;
  }
};

const disconnectSerial = async (isManual = true) => {
  if (isExecuting.value) {
    abortRequested.value = true;
    isExecuting.value = false;
  }
  try {
    if (activeWriter) {
      try { activeWriter.releaseLock(); } catch (_) {}
      activeWriter = null;
    }
    if (activeReader) {
      try { await activeReader.cancel(); } catch (_) {}
      try { activeReader.releaseLock(); } catch (_) {}
      activeReader = null;
    }
    if (serialPort.value) {
      await serialPort.value.close();
    }
  } catch (err: any) {
    console.warn('Error during serial close:', err);
  } finally {
    serialConnected.value = false;
    if (isManual) {
      isAutoReconnecting.value = false;
      addLog('SYS', 'Đã đóng cổng Serial bởi người dùng');
      ElMessage.info('Đã ngắt kết nối cổng Serial');
    }
  }
};

const flushBuffers = async () => {
  if (!serialPort.value || !serialConnected.value || !serialPort.value.readable) return;
  try {
    const reader = serialPort.value.readable.getReader();
    let timeoutId: any;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, 80);
    });
    await Promise.race([reader.read(), timeoutPromise]).finally(() => clearTimeout(timeoutId));
    try { await reader.cancel(); } catch (_) {}
    reader.releaseLock();
    addLog('SYS', 'Đã flush RX buffer');
  } catch (_) {}
};

// -----------------------------------------------------------------------------
// CRC16 & MODBUS RTU FRAMING (FC 03)
// -----------------------------------------------------------------------------
const calcModbusCRC16 = (bytes: number[] | Uint8Array): number => {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc & 0xffff;
};

const buildModbusReadReq = (slave: number, fc: number, reg: number, numreg: number): Uint8Array => {
  const s = Number(slave) & 0xff;
  const f = Number(fc) & 0xff;
  const r = Number(reg) & 0xffff;
  const n = Number(numreg) & 0xffff;
  const frame = [s, f, (r >> 8) & 0xff, r & 0xff, (n >> 8) & 0xff, n & 0xff];
  const crc = calcModbusCRC16(frame);
  frame.push(crc & 0xff);
  frame.push((crc >> 8) & 0xff);
  return new Uint8Array(frame);
};

const decodeModbusPayload = (dataBytes: number[], format?: string, endianness = 'Big-Endian'): string => {
  if (!dataBytes || dataBytes.length === 0) return '';
  const len = dataBytes.length;
  const fmt = (format || '').toLowerCase().trim();

  if (fmt === 'hex') {
    return dataBytes.map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join('');
  }

  if (fmt === 'string' || fmt === 'ascii') {
    return String.fromCharCode(...dataBytes.filter((x) => x >= 32 && x <= 126)).trim();
  }

  if (len === 2) {
    let b0 = dataBytes[0];
    let b1 = dataBytes[1];
    if (endianness === 'Little-Endian' || endianness === 'BA') {
      [b0, b1] = [b1, b0];
    }
    const u16 = (b0 << 8) | b1;
    if (fmt === 'int' || fmt === 'int16') {
      return String(u16 >= 0x8000 ? u16 - 0x10000 : u16);
    }
    return String(u16);
  }

  if (len === 4) {
    let [a, b, c, d] = dataBytes;
    let reordered = [a, b, c, d];
    if (endianness === 'Little-Endian' || endianness === 'DCBA') {
      reordered = [d, c, b, a];
    } else if (endianness === 'Mid-Big' || endianness === 'BADC') {
      reordered = [b, a, d, c];
    } else if (endianness === 'Mid-Little' || endianness === 'CDAB') {
      reordered = [c, d, a, b];
    }
    const u8 = new Uint8Array(reordered);
    const dv = new DataView(u8.buffer);
    if (fmt === 'float' || fmt === 'float32') {
      return String(Number(dv.getFloat32(0, false).toFixed(4)));
    } else if (fmt === 'int' || fmt === 'int32') {
      return String(dv.getInt32(0, false));
    } else {
      return String(dv.getUint32(0, false));
    }
  }

  return dataBytes.map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join('');
};

// -----------------------------------------------------------------------------
// READ REGISTERS OVER WEB SERIAL
// -----------------------------------------------------------------------------
const readModbusRegisters = async (
  slave: number,
  reg: number,
  numreg: number,
  timeoutMs = 1200,
): Promise<{ rawBytes: number[]; hexStr: string }> => {
  if (!serialPort.value || !serialPort.value.readable || !serialPort.value.writable || !serialConnected.value) {
    throw new Error('Cổng Serial chưa được mở hoặc không sẵn sàng');
  }

  // 1. Gửi bản tin TX (FC 03)
  const req = buildModbusReadReq(slave, 3, reg, numreg);
  addLog('TX', `Đọc Register ${reg} (${numreg} regs) qua Slave ${slave}`, req);

  activeWriter = serialPort.value.writable.getWriter();
  try {
    await activeWriter.write(req);
  } finally {
    try { activeWriter.releaseLock(); } catch (_) {}
    activeWriter = null;
  }

  // 2. Đón nhận bản tin RX với timeout
  activeReader = serialPort.value.readable.getReader();
  const expectedBytes = 3 + numreg * 2 + 2;
  const rxBuffer: number[] = [];
  const startTime = Date.now();

  try {
    while (rxBuffer.length < expectedBytes && Date.now() - startTime < timeoutMs) {
      if (abortRequested.value) {
        throw new Error('ABORTED');
      }
      const remaining = Math.max(10, timeoutMs - (Date.now() - startTime));
      let timeoutId: any;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), remaining);
      });
      const res: any = await Promise.race([activeReader.read(), timeoutPromise]).finally(() =>
        clearTimeout(timeoutId),
      );
      if (res.done) break;
      if (res.value) {
        for (let i = 0; i < res.value.length; i++) rxBuffer.push(res.value[i]);
      }
    }
  } catch (err: any) {
    if (err?.message !== 'TIMEOUT' && err?.message !== 'ABORTED') {
      throw err;
    }
  } finally {
    if (activeReader) {
      try { await activeReader.cancel(); } catch (_) {}
      try { activeReader.releaseLock(); } catch (_) {}
      activeReader = null;
    }
  }

  if (abortRequested.value) {
    throw new Error('Thao tác đã bị dừng bởi người dùng');
  }

  if (rxBuffer.length < 5) {
    throw new Error(`Timeout không nhận được phản hồi từ thiết bị (nhận ${rxBuffer.length}/${expectedBytes} bytes)`);
  }

  // Check CRC16
  const rxCrc = rxBuffer[rxBuffer.length - 2] | (rxBuffer[rxBuffer.length - 1] << 8);
  const calcCrc = calcModbusCRC16(rxBuffer.slice(0, rxBuffer.length - 2));
  if (rxCrc !== calcCrc) {
    throw new Error(`Lỗi CRC: nhận 0x${rxCrc.toString(16).toUpperCase()} != tính toán 0x${calcCrc.toString(16).toUpperCase()}`);
  }

  // Check Exception response
  if (rxBuffer[1] & 0x80) {
    throw new Error(`Modbus Exception Response: Code ${rxBuffer[2]}`);
  }

  const byteCount = rxBuffer[2];
  const dataBytes = rxBuffer.slice(3, 3 + byteCount);
  const hexStr = Array.from(dataBytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  addLog('RX', `Phản hồi Register ${reg} OK (${dataBytes.length} bytes)`, rxBuffer);
  return { rawBytes: dataBytes, hexStr };
};

// -----------------------------------------------------------------------------
// FIRST REGISTER WAKE-UP RETRY LOOP (MCU SLEEP GUARD)
// -----------------------------------------------------------------------------
const readFirstRegisterUntilSuccess = async (
  slave: number,
  addr: number,
  numreg: number,
  options?: { backoffMs?: number; label?: string },
): Promise<{ success: boolean; rawBytes: number[]; hexStr: string; attempts: number }> => {
  const backoffMs = options?.backoffMs || 300;
  const label = options?.label || `Reg ${addr}`;
  let attempt = 0;

  while (!abortRequested.value) {
    attempt++;
    statusMessage.value = `Đang đánh thức MCU / Thử đọc ${label} (lần ${attempt})...`;
    try {
      await flushBuffers();
      const res = await readModbusRegisters(slave, addr, numreg, readTimeoutMs.value);
      addLog('INFO', `[MCU Wake-up] ${label} đọc THÀNH CÔNG ở lần thử thứ ${attempt}`);
      return { success: true, rawBytes: res.rawBytes, hexStr: res.hexStr, attempts: attempt };
    } catch (err: any) {
      if (abortRequested.value) {
        throw new Error('Thao tác đã dừng');
      }
      addLog('WARN', `[MCU Wake-up] ${label} chưa phản hồi (lần ${attempt}): ${err.message}. Tiếp tục thử...`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  throw new Error('Thao tác đã dừng');
};

// -----------------------------------------------------------------------------
// COMPARISON & VERDICT LOGIC
// -----------------------------------------------------------------------------
const evaluateVerdict = (expected: string | undefined, actual: string | undefined, format?: string): boolean => {
  if (expected === undefined || expected === null || expected.trim() === '') {
    // Blank expected value is considered valid readback PASS
    return true;
  }
  const expStr = expected.trim().toLowerCase();
  const actStr = (actual || '').trim().toLowerCase();

  // If format is HEX, compare normalized hex without 0x or spaces
  if ((format || '').toUpperCase() === 'HEX') {
    const cleanExp = expStr.replace(/^0x/, '').replace(/\s+/g, '');
    const cleanAct = actStr.replace(/^0x/, '').replace(/\s+/g, '');
    return cleanExp === cleanAct;
  }

  // Numeric comparison for INT / FLOAT
  if (['INT', 'INT16', 'INT32', 'UINT', 'UINT16', 'UINT32', 'FLOAT', 'FLOAT32'].includes((format || '').toUpperCase())) {
    const numExp = Number(expStr);
    const numAct = Number(actStr);
    if (!isNaN(numExp) && !isNaN(numAct)) {
      return Math.abs(numExp - numAct) < 0.0001;
    }
  }

  // Default string match
  return expStr === actStr;
};

// -----------------------------------------------------------------------------
// STATEFUL EXECUTION SESSIONS & STEP CHECKPOINTS (SERVER LEDGER)
// -----------------------------------------------------------------------------
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token =
    localStorage.getItem('itest_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const createOrResumeSession = async (profileId: string): Promise<string | null> => {
  if (activeSessionId.value) return activeSessionId.value;
  isSessionSyncing.value = true;
  try {
    const payload = {
      deviceId: deviceSerialNumber.value.trim() || undefined,
      serialNumber: deviceSerialNumber.value.trim() || undefined,
      metadata: {
        baudRate: baudRate.value,
        slaveId: modbusSlave.value,
        totalSteps: executableRegisters.value.length,
        startedAt: new Date().toISOString(),
      },
    };
    const res = await fetch(`/api/plugins/final-config/profiles/${profileId}/execution-sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const sid = data.id || data.sessionId;
    activeSessionId.value = sid;
    activeSessionStatus.value = data.status || 'IN_PROGRESS';
    addLog('SYS', `Đã khởi tạo phiên ghi trên server [Session ID: ${sid}]`);
    return sid;
  } catch (err: any) {
    addLog('WARN', `Chưa thể tạo phiên kiểm tra trên máy chủ (${err.message}). Tiến trình đọc UART cục bộ vẫn tiếp tục.`);
    return null;
  } finally {
    isSessionSyncing.value = false;
  }
};

const sendStepCheckpoint = async (
  sessionId: string,
  stepData: {
    modbusRegisterDec: number;
    modbusRegisterHex?: string;
    action: 'READ' | 'WRITE' | 'VERIFY';
    status: 'PASS' | 'FAIL';
    expectedValue?: string;
    readValue?: string;
    writtenValue?: string;
    rawHex?: string;
    errorMessage?: string;
    durationMs?: number;
  },
) => {
  try {
    const res = await fetch(`/api/plugins/final-config/execution-sessions/${sessionId}/step`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stepData),
    });
    if (!res.ok) {
      console.warn(`Step checkpoint HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`Lỗi ghi checkpoint bước Reg ${stepData.modbusRegisterDec}:`, err);
  }
};

const finalizeSession = async (
  sessionId: string,
  status: 'COMPLETED' | 'FAILED' | 'ABORTED',
) => {
  isSessionSyncing.value = true;
  try {
    const res = await fetch(`/api/plugins/final-config/execution-sessions/${sessionId}/finalize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        metadata: {
          stats: stats.value,
          completedAt: new Date().toISOString(),
        },
      }),
    });
    if (res.ok) {
      activeSessionStatus.value = status;
      addLog('SYS', `Đã chốt phiên máy chủ [${sessionId}] trạng thái: ${status}`);
    }
  } catch (err: any) {
    addLog('WARN', `Lỗi chốt phiên trên máy chủ (${err.message})`);
  } finally {
    isSessionSyncing.value = false;
  }
};

const resumeSession = async (sessionId: string) => {
  if (!sessionId) return;
  statusMessage.value = `Đang khôi phục phiên ${sessionId} từ máy chủ...`;
  try {
    const res = await fetch(`/api/plugins/final-config/execution-sessions/${sessionId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    activeSessionId.value = data.id;
    activeSessionStatus.value = data.status || 'IN_PROGRESS';
    const logs = data.logs || data.steps || [];
    if (Array.isArray(logs) && logs.length > 0) {
      logs.forEach((step: any) => {
        const found = allRegisters.value.find(
          (r) => r.modbusRegisterDec === step.modbusRegisterDec || r.modbusRegisterDec === step.modbus_register_dec,
        );
        if (found) {
          found.execStatus = step.status;
          found.valueReadBack = step.readValue || step.read_value || '';
          found.rawHex = step.rawHex || step.raw_hex || '';
          found.execError = step.errorMessage || step.error_message || undefined;
        }
      });
      addLog('SYS', `Khôi phục thành công ${logs.length} bước đã ghi từ phiên trước.`);
      ElMessage.success(`Đã khôi phục ${logs.length} bước từ phiên ${sessionId}`);
    }
  } catch (err: any) {
    addLog('ERROR', `Lỗi khôi phục phiên: ${err.message}`);
    ElMessage.error(`Không thể khôi phục phiên: ${err.message}`);
  }
};

const resetSession = () => {
  activeSessionId.value = null;
  activeSessionStatus.value = 'IDLE';
  addLog('SYS', 'Đã đặt lại phiên làm việc máy chủ.');
};

// -----------------------------------------------------------------------------
// EXECUTION WORKFLOW
// -----------------------------------------------------------------------------
const runSingleRegister = async (row: RegisterRow) => {
  if (!serialConnected.value) {
    ElMessage.warning('Vui lòng kết nối cổng Serial trước.');
    return;
  }
  row.execStatus = 'READING';
  statusMessage.value = `Đang đọc Register ${row.modbusRegisterDec}...`;
  const startTime = Date.now();
  try {
    const res = await readModbusRegisters(
      modbusSlave.value,
      row.modbusRegisterDec,
      row.registerCount || 1,
      readTimeoutMs.value,
    );
    row.rawHex = res.hexStr;
    const decoded = decodeModbusPayload(res.rawBytes, row.format);
    row.valueReadBack = decoded;
    const expected = row.inputConfig || row.endUserDefault;
    const isPass = evaluateVerdict(expected, decoded, row.format);
    row.execStatus = isPass ? 'PASS' : 'FAIL';
    statusMessage.value = `Hoàn tất đọc Reg ${row.modbusRegisterDec}: ${row.execStatus}`;

    const durationMs = Date.now() - startTime;
    if (activeSessionId.value) {
      await sendStepCheckpoint(activeSessionId.value, {
        modbusRegisterDec: row.modbusRegisterDec,
        modbusRegisterHex: row.modbusRegisterHex || `0x${row.modbusRegisterDec.toString(16).toUpperCase()}`,
        action: 'READ',
        status: row.execStatus === 'PASS' ? 'PASS' : 'FAIL',
        expectedValue: row.inputConfig || row.endUserDefault,
        readValue: String(row.valueReadBack ?? ''),
        rawHex: row.rawHex,
        durationMs,
      });
    }
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    row.execStatus = 'ERROR';
    row.execError = err.message || String(err);
    addLog('ERROR', `Lỗi đọc Register ${row.modbusRegisterDec}: ${row.execError}`);
    statusMessage.value = `Lỗi đọc Reg ${row.modbusRegisterDec}: ${row.execError}`;

    if (activeSessionId.value) {
      await sendStepCheckpoint(activeSessionId.value, {
        modbusRegisterDec: row.modbusRegisterDec,
        modbusRegisterHex: row.modbusRegisterHex || `0x${row.modbusRegisterDec.toString(16).toUpperCase()}`,
        action: 'READ',
        status: 'FAIL',
        expectedValue: row.inputConfig || row.endUserDefault,
        errorMessage: row.execError,
        durationMs,
      });
    }
  }
};

const runFullExecution = async () => {
  if (!canRunExecution.value) return;

  isExecuting.value = true;
  abortRequested.value = false;
  if (!resumeMode.value) {
    resetRegisterResults();
  }

  // Ensure server session exists
  if (!activeSessionId.value && selectedProfileId.value) {
    await createOrResumeSession(selectedProfileId.value);
  }

  const regs = executableRegisters.value;
  addLog('SYS', `BẮT ĐẦU ĐỌC & ĐỐI SOÁT UART TTL (${regs.length} registers)`);

  try {
    for (let i = 0; i < regs.length; i++) {
      if (abortRequested.value) {
        addLog('WARN', 'Quy trình đã dừng theo yêu cầu của người dùng.');
        if (activeSessionId.value) {
          await finalizeSession(activeSessionId.value, 'ABORTED');
        }
        break;
      }

      const row = regs[i];

      // If in resume mode and already PASS, skip
      if (resumeMode.value && row.execStatus === 'PASS') {
        addLog('INFO', `[RESUME] Bỏ qua Reg ${row.modbusRegisterDec} (đã PASS trước đó)`);
        continue;
      }

      row.execStatus = 'READING';
      const startTime = Date.now();

      try {
        if (i === 0 && !resumeMode.value) {
          // First register: Wake-up MCU continuous retry loop
          const res = await readFirstRegisterUntilSuccess(
            modbusSlave.value,
            row.modbusRegisterDec,
            row.registerCount || 1,
            { label: `Reg ${row.modbusRegisterDec} (${row.description || 'First Reg'})` },
          );
          row.rawHex = res.hexStr;
          const decoded = decodeModbusPayload(res.rawBytes, row.format);
          row.valueReadBack = decoded;
          const expected = row.inputConfig || row.endUserDefault;
          row.execStatus = evaluateVerdict(expected, decoded, row.format) ? 'PASS' : 'FAIL';
        } else {
          // Subsequent registers: Standard read with inter-read settling delay
          statusMessage.value = `Đang đọc (${i + 1}/${regs.length}): Reg ${row.modbusRegisterDec} (${row.description || ''})...`;
          await new Promise((r) => setTimeout(r, 40));
          const res = await readModbusRegisters(
            modbusSlave.value,
            row.modbusRegisterDec,
            row.registerCount || 1,
            readTimeoutMs.value,
          );
          row.rawHex = res.hexStr;
          const decoded = decodeModbusPayload(res.rawBytes, row.format);
          row.valueReadBack = decoded;
          const expected = row.inputConfig || row.endUserDefault;
          row.execStatus = evaluateVerdict(expected, decoded, row.format) ? 'PASS' : 'FAIL';
        }

        const durationMs = Date.now() - startTime;
        if (activeSessionId.value) {
          await sendStepCheckpoint(activeSessionId.value, {
            modbusRegisterDec: row.modbusRegisterDec,
            modbusRegisterHex: row.modbusRegisterHex || `0x${row.modbusRegisterDec.toString(16).toUpperCase()}`,
            action: 'READ',
            status: row.execStatus === 'PASS' ? 'PASS' : 'FAIL',
            expectedValue: row.inputConfig || row.endUserDefault,
            readValue: String(row.valueReadBack ?? ''),
            rawHex: row.rawHex,
            durationMs,
          });
        }
      } catch (rErr: any) {
        const durationMs = Date.now() - startTime;
        row.execStatus = 'ERROR';
        row.execError = rErr.message || String(rErr);
        addLog('ERROR', `Lỗi đọc Register ${row.modbusRegisterDec}: ${row.execError}`);

        if (activeSessionId.value) {
          await sendStepCheckpoint(activeSessionId.value, {
            modbusRegisterDec: row.modbusRegisterDec,
            modbusRegisterHex: row.modbusRegisterHex || `0x${row.modbusRegisterDec.toString(16).toUpperCase()}`,
            action: 'READ',
            status: 'FAIL',
            expectedValue: row.inputConfig || row.endUserDefault,
            errorMessage: row.execError,
            durationMs,
          });
        }
      }
    }

    const s = stats.value;
    addLog(
      s.fail === 0 && s.error === 0 ? 'INFO' : 'WARN',
      `HOÀN TẤT THỰC THI: Tổng ${s.total} | PASS: ${s.pass} | FAIL: ${s.fail} | ERROR: ${s.error}`,
    );
    statusMessage.value = `Hoàn tất: ${s.pass}/${s.total} PASS (Fail: ${s.fail}, Error: ${s.error})`;

    if (activeSessionId.value && !abortRequested.value) {
      const finalStatus = s.fail === 0 && s.error === 0 ? 'COMPLETED' : 'FAILED';
      await finalizeSession(activeSessionId.value, finalStatus);
    }

    if (s.fail === 0 && s.error === 0) {
      ElMessage.success('Toàn bộ registers đối soát thành công (PASS)!');
    } else {
      ElMessage.warning(`Kết quả có ${s.fail} FAIL và ${s.error} ERROR.`);
    }
  } catch (err: any) {
    addLog('ERROR', `Lỗi trong quá trình thực thi: ${err.message || err}`);
    ElMessage.error(`Lỗi thực thi: ${err.message || err}`);
  } finally {
    isExecuting.value = false;
  }
};

const abortExecution = () => {
  abortRequested.value = true;
  statusMessage.value = 'Đang dừng quy trình...';
  addLog('WARN', 'Người dùng bấm Dừng (Abort).');
};

const resetRegisterResults = () => {
  executableRegisters.value.forEach((r) => {
    r.execStatus = 'PENDING';
    r.valueReadBack = undefined;
    r.rawHex = undefined;
    r.execError = undefined;
  });
  statusMessage.value = '';
};

// -----------------------------------------------------------------------------
// PROFILE & REST API
// -----------------------------------------------------------------------------
const loadProfiles = async () => {
  loadingProfiles.value = true;
  try {
    const res = await fetch('/api/plugins/final-config/profiles');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    profileList.value = Array.isArray(data) ? data : (data.items || []);
    addLog('SYS', `Đã tải ${profileList.value.length} profiles từ backend.`);
  } catch (err: any) {
    addLog('ERROR', `Lỗi tải danh sách profiles: ${err.message || err}`);
  } finally {
    loadingProfiles.value = false;
  }
};

const onProfileChange = async (profileId: string) => {
  if (!profileId) {
    currentProfile.value = null;
    allRegisters.value = [];
    return;
  }
  statusMessage.value = 'Đang tải chi tiết profile và registers...';
  try {
    const res = await fetch(`/api/plugins/final-config/profiles/${profileId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentProfile.value = data;
    allRegisters.value = (data.registers || []).map((r: any) => ({
      ...r,
      execStatus: 'PENDING',
    }));
    addLog(
      'INFO',
      `Đã nạp Profile: ${data.sku} | SO: ${data.soNumber} (${executableRegisters.value.length}/${allRegisters.value.length} registers selected)`,
    );
    statusMessage.value = `Đã chọn profile ${data.sku} (${executableRegisters.value.length} registers)`;
  } catch (err: any) {
    addLog('ERROR', `Lỗi tải chi tiết profile ${profileId}: ${err.message || err}`);
    ElMessage.error(`Lỗi tải profile: ${err.message || err}`);
  }
};

// -----------------------------------------------------------------------------
// LIFECYCLE HOOKS
// -----------------------------------------------------------------------------
const handleHardwareDisconnect = async (event: any) => {
  console.warn('Hardware disconnected event:', event);
  addLog('WARN', 'Phát hiện ngắt kết nối phần cứng USB/COM.');
  await disconnectSerial(false);
  isAutoReconnecting.value = true;
};

const handleHardwareConnect = (event: any) => {
  console.log('Hardware connect event:', event);
  addLog('SYS', 'Phát hiện thiết bị USB kết nối lại.');
};

onMounted(() => {
  loadProfiles();
  if (isSerialSupported.value && (navigator as any).serial) {
    (navigator as any).serial.addEventListener('disconnect', handleHardwareDisconnect);
    (navigator as any).serial.addEventListener('connect', handleHardwareConnect);
  }
});

onUnmounted(() => {
  disconnectSerial(true);
  if (isSerialSupported.value && (navigator as any).serial) {
    (navigator as any).serial.removeEventListener('disconnect', handleHardwareDisconnect);
    (navigator as any).serial.removeEventListener('connect', handleHardwareConnect);
  }
});
</script>

<style scoped>
.final-config-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.icon-brand {
  font-size: 18px;
  color: #3b82f6;
}

.flex-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.align-center {
  align-items: flex-end;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.port-name {
  font-size: 12px;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.profile-summary-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
}

.session-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  color: #334155;
}

.pill strong {
  color: #0f172a;
}

.exec-stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.stats-counters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.counter-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.counter-badge.all { background: #e2e8f0; color: #334155; }
.counter-badge.pass { background: #dcfce7; color: #166534; }
.counter-badge.fail { background: #fee2e2; color: #991b1b; }
.counter-badge.error { background: #fef3c7; color: #92400e; }
.counter-badge.pending { background: #f1f5f9; color: #64748b; }

.exec-status-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
}

.table-card, .log-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  height: 580px;
  display: flex;
  flex-direction: column;
}

:deep(.table-card .el-card__body),
:deep(.log-card .el-card__body) {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reg-table {
  width: 100%;
  height: 100%;
}

.log-console {
  flex: 1;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 10px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-empty {
  color: #64748b;
  text-align: center;
  margin-top: 20px;
}

.log-line {
  display: flex;
  gap: 6px;
  align-items: baseline;
  word-break: break-all;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-badge {
  font-size: 10px;
  font-weight: bold;
  padding: 0 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.badge-tx { background: #1e3a8a; color: #93c5fd; }
.badge-rx { background: #064e3b; color: #6ee7b7; }
.badge-sys { background: #374151; color: #d1d5db; }
.badge-warn { background: #78350f; color: #fde68a; }
.badge-error { background: #7f1d1d; color: #fca5a5; }
.badge-info { background: #1e293b; color: #38bdf8; }

.log-msg {
  color: #f8fafc;
}

.log-hex {
  color: #38bdf8;
  font-weight: bold;
}

.text-success { color: #16a34a; }
.text-danger { color: #dc2626; }
.text-muted { color: #94a3b8; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.font-bold { font-weight: 600; }
.text-xs { font-size: 11px; }
.w-full { width: 100%; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
</style>
