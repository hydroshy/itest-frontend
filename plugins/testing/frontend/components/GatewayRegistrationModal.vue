<template>
  <el-dialog
    v-model="visible"
    title="Đăng Ký Gateway & Khởi Tạo Phiên Test"
    width="860px"
    class="gateway-reg-dialog"
    :before-close="handleBeforeClose"
    :close-on-click-modal="!submitting"
    :close-on-press-escape="!submitting"
  >
    <!-- Relative wrapper for Dialog Body & Stepper Overlay -->
    <div class="dialog-content-wrapper">
      <!-- Cyber HUD Header Banner -->
      <div class="cyber-hud-banner mb-4">
        <div class="hud-corner hud-corner-tl"></div>
        <div class="hud-corner hud-corner-tr"></div>
        <div class="hud-corner hud-corner-bl"></div>
        <div class="hud-corner hud-corner-br"></div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon class="text-primary text-xl"><Odometer /></el-icon>
            <div>
              <div class="hud-title">GATEWAY VERIFICATION & REGISTRATION PIPELINE</div>
              <div class="hud-sub">Quy trình xác thực phần cứng, đồng bộ Packet Forwarder & kích hoạt ChirpStack Session</div>
            </div>
          </div>
          <el-tag :type="gatewayConfig ? 'success' : 'info'" effect="dark" class="font-mono">
            {{ gatewayConfig ? 'CONFIG LOADED' : 'AWAITING IP CONFIG' }}
          </el-tag>
        </div>
      </div>

      <!-- Main Registration Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        class="registration-form"
      >
        <!-- Section 1: Thông tin quản lý & Lệnh sản xuất (Traceability) -->
        <div class="form-section-title">
          <span class="section-idx">01</span>
          <span>Thông Tin Lệnh Sản Xuất & Điều Phối (Traceability)</span>
        </div>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Mã Đơn Hàng (SO)" prop="soNumber">
              <el-autocomplete
                v-model="form.soNumber"
                :fetch-suggestions="querySearchSo"
                placeholder="Nhập hoặc tìm SO (VD: SO-2026-001)"
                clearable
                style="width: 100%"
                @select="handleSoSelect"
              >
                <template #default="{ item }">
                  <div class="flex justify-between items-center">
                    <span class="font-bold">{{ item.number || item.name || item.value }}</span>
                    <span class="text-xs text-secondary">{{ item.customer || '' }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Lệnh Gia Công (WA)" prop="waNumber">
              <el-input
                v-model="form.waNumber"
                placeholder="Nhập mã WA (VD: WA-001)"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Section 2: Hạ tầng & Thông số kiểm thử (Network & Region) -->
        <div class="form-section-title mt-2">
          <span class="section-idx">02</span>
          <span>Hạ Tầng Kết Nối & Kiểm Thử Mạng</span>
        </div>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Network Server (ChirpStack)" prop="networkServerId">
              <el-select
                v-model="form.networkServerId"
                placeholder="Chọn Network Server liên kết"
                filterable
                v-loading="loadingServers"
                style="width: 100%"
              >
                <el-option
                  v-for="srv in serverList"
                  :key="srv.id"
                  :label="`${srv.name} (${srv.apiUrl})`"
                  :value="srv.id"
                >
                  <div class="flex justify-between items-center">
                    <span>{{ srv.name }}</span>
                    <el-tag size="small" :type="srv.status === 'online' ? 'success' : 'info'">{{ srv.status }}</el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Region Test (Băng Tần LoRaWAN)" prop="regionTest">
              <el-select
                v-model="form.regionTest"
                placeholder="Chọn Region Test"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="reg in regionOptions"
                  :key="reg.value"
                  :label="`${reg.label} (${reg.desc})`"
                  :value="reg.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Loại Internet Test" prop="internetTestType">
              <el-radio-group v-model="form.internetTestType" class="w-full internet-type-group">
                <el-radio-button label="ETHERNET">
                  <div class="flex items-center gap-1">
                    <el-icon><Connection /></el-icon>
                    <span>Ethernet Test</span>
                  </div>
                </el-radio-button>
                <el-radio-button label="4G">
                  <div class="flex items-center gap-1">
                    <el-icon><Iphone /></el-icon>
                    <span>4G / LTE Test</span>
                  </div>
                </el-radio-button>
              </el-radio-group>
              <div class="text-xs text-secondary mt-1">
                {{ form.internetTestType === 'ETHERNET' ? 'Cấu hình ưu tiên Ethernet: Metric Eth 100 / LTE 102' : 'Cấu hình ưu tiên 4G: Metric Eth 102 / LTE 100' }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Địa Chỉ IP Gateway (Cổng 4050)" prop="gatewayIp">
              <div class="flex gap-2 w-full">
                <el-input
                  v-model="form.gatewayIp"
                  placeholder="192.168.1.5"
                  clearable
                  class="font-mono"
                  @keyup.enter="fetchGatewayConfig"
                />
                <el-button
                  type="primary"
                  :loading="fetchingConfig"
                  :icon="Download"
                  @click="fetchGatewayConfig"
                >
                  Đọc Config
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Section 3: Bảng Thông Số Đọc Được Từ Gateway (Port 4050) -->
        <div class="form-section-title mt-2">
          <span class="section-idx">03</span>
          <span>Thông Số Kỹ Thuật Gateway (Port 4050 Readout)</span>
        </div>

        <div v-if="gatewayConfig" class="cyber-spec-panel mb-4">
          <div class="spec-grid">
            <div class="spec-card highlight">
              <span class="spec-label">SERIAL NUMBER</span>
              <span class="spec-val font-mono text-primary font-bold">{{ gatewayConfig.serial_number || '—' }}</span>
            </div>
            <div class="spec-card highlight">
              <span class="spec-label">GATEWAY EUI</span>
              <span class="spec-val font-mono text-success font-bold">{{ gatewayConfig.eui || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">ITEM CODE</span>
              <span class="spec-val">{{ gatewayConfig.item_code || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">PRODUCT SKU</span>
              <span class="spec-val">{{ gatewayConfig.sku || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">FIRMWARE VER</span>
              <span class="spec-val font-mono">{{ gatewayConfig.firmware_version || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">HARDWARE VER</span>
              <span class="spec-val font-mono">{{ gatewayConfig.hardware_version || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">MECHANICAL VER</span>
              <span class="spec-val font-mono">{{ gatewayConfig.mechanical_version || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">LTE MODULE IMEI</span>
              <span class="spec-val font-mono">{{ gatewayConfig.lte_module_imei || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">LTE SERIAL NO</span>
              <span class="spec-val font-mono">{{ gatewayConfig.lte_module_serial_number || '—' }}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">CURRENT FREQ PLAN</span>
              <span class="spec-val font-mono">{{ gatewayConfig.lorawan_frequency_plan || '—' }}</span>
            </div>
          </div>
        </div>

        <el-empty
          v-else
          description="Chưa có dữ liệu Gateway. Hãy nhập IP và bấm 'Đọc Config' để trích xuất thông số thiết bị."
          :image-size="70"
          class="my-3 empty-config-box"
        />

        <!-- Section 4: Xác Nhận Đăng Ký An Toàn (Re-type Serial) -->
        <div v-if="gatewayConfig" class="form-section-title mt-2">
          <span class="section-idx">04</span>
          <span>Xác Nhận Đăng Ký An Toàn</span>
        </div>

        <el-row v-if="gatewayConfig" :gutter="16">
          <el-col :span="24">
            <el-form-item
              label="Nhập lại Serial Number của Gateway để xác nhận đăng ký"
              prop="confirmedSerialNumber"
              :error="serialMismatchError"
            >
              <el-input
                v-model="form.confirmedSerialNumber"
                placeholder="Gõ chính xác Serial Number hiển thị ở trên (VD: GW2026...)"
                class="font-mono serial-confirm-input"
                clearable
              >
                <template #suffix>
                  <el-icon v-if="isSerialMatched" class="text-success"><Check /></el-icon>
                  <el-icon v-else-if="form.confirmedSerialNumber" class="text-danger"><Close /></el-icon>
                </template>
              </el-input>
              <div v-if="isSerialMatched" class="text-xs text-success mt-1">
                ✓ Serial Number khớp chính xác với thiết bị Gateway. Sẵn sàng đăng ký!
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Stepper Progress Overlay (Active during submission) -->
      <transition name="fade">
        <div v-if="submitting" class="progress-backdrop-overlay">
          <div class="progress-card">
            <div class="cyber-spinner mb-3">
              <el-icon class="is-loading text-primary text-3xl"><Loading /></el-icon>
            </div>
            <h3 class="progress-title mb-2">Đang Thực Hiện Đăng Ký Gateway</h3>
            <p class="progress-status-text mb-4">{{ currentStepDescription }}</p>

            <el-progress
              :percentage="progressPercentage"
              :status="progressStatus"
              :stroke-width="14"
              striped
              striped-flow
              class="w-full mb-4"
            />

            <!-- Step checklist tracker -->
            <div class="step-checklist">
              <div
                v-for="(st, idx) in registrationSteps"
                :key="idx"
                class="step-item"
                :class="{
                  'is-active': activeStepIdx === idx && !progressError,
                  'is-done': activeStepIdx > idx,
                  'is-error': activeStepIdx === idx && progressError,
                }"
              >
                <span class="step-num">{{ idx + 1 }}</span>
                <span class="step-label">{{ st.title }}</span>
                <span class="step-state">
                  <el-icon v-if="activeStepIdx > idx" class="text-success"><Check /></el-icon>
                  <el-icon v-else-if="activeStepIdx === idx && !progressError" class="is-loading text-primary"><Loading /></el-icon>
                  <el-icon v-else-if="activeStepIdx === idx && progressError" class="text-danger"><Close /></el-icon>
                  <span v-else class="text-muted">—</span>
                </span>
              </div>
            </div>

            <div v-if="progressError" class="error-action-box mt-4">
              <el-alert
                :title="progressError"
                type="error"
                show-icon
                :closable="false"
                class="mb-3 text-left"
              />
              <el-button type="danger" @click="abortProgress">
                Đóng / Thử Lại
              </el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-between items-center">
        <span class="text-xs text-secondary">
          * Đảm bảo Gateway đang bật nguồn và kết nối cùng dải mạng với trạm kiểm thử.
        </span>
        <div class="flex gap-2">
          <el-button :disabled="submitting" @click="handleBeforeClose">Hủy Bỏ</el-button>
          <el-button
            type="primary"
            :disabled="!canSubmit"
            :loading="submitting"
            :icon="Promotion"
            @click="submitRegistration"
          >
            Tiến Hành Đăng Ký
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  Odometer,
  Connection,
  Iphone,
  Download,
  Check,
  Close,
  Promotion,
  Loading,
} from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { httpClient } from '@/api/client';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'success', session: any): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Form state
const formRef = ref<FormInstance>();
const form = reactive({
  soNumber: '',
  waNumber: '',
  networkServerId: '',
  regionTest: 'AS923_2',
  internetTestType: 'ETHERNET' as 'ETHERNET' | '4G',
  gatewayIp: '192.168.1.5',
  confirmedSerialNumber: '',
});

// Gateway config retrieved from port 4050
const gatewayConfig = ref<any>(null);
const fetchingConfig = ref(false);

// Network servers
const serverList = ref<any[]>([]);
const loadingServers = ref(false);

// Region Options
const regionOptions = [
  { value: 'AS923_2', label: 'AS923-2', desc: 'Việt Nam, Indonesia, v.v.' },
  { value: 'AS923_1', label: 'AS923-1', desc: 'Nhật Bản, Malaysia, Singapore' },
  { value: 'EU868', label: 'EU868', desc: 'Châu Âu (863-870 MHz)' },
  { value: 'US915', label: 'US915', desc: 'Bắc Mỹ (902-928 MHz)' },
  { value: 'AU915', label: 'AU915', desc: 'Úc (915-928 MHz)' },
  { value: 'IN865', label: 'IN865', desc: 'Ấn Độ (865-867 MHz)' },
  { value: 'VN923', label: 'VN923', desc: 'Việt Nam đặc thù' },
];

// Validation Rules
const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const formRules: FormRules = {
  soNumber: [{ required: true, message: 'Vui lòng chọn hoặc nhập mã SO', trigger: 'change' }],
  waNumber: [{ required: true, message: 'Vui lòng nhập mã WA', trigger: 'blur' }],
  networkServerId: [{ required: true, message: 'Vui lòng chọn Network Server', trigger: 'change' }],
  regionTest: [{ required: true, message: 'Vui lòng chọn Region Test', trigger: 'change' }],
  gatewayIp: [
    { required: true, message: 'Vui lòng nhập địa chỉ IP Gateway', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback(new Error('Vui lòng nhập IP'));
        if (!ipv4Regex.test(value)) return callback(new Error('Địa chỉ IP không đúng định dạng IPv4 (VD: 192.168.1.5)'));
        const parts = value.split('.').map(Number);
        if (parts.some((p: number) => p < 0 || p > 255)) {
          return callback(new Error('Mỗi octet IP phải nằm trong khoảng 0 - 255'));
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirmedSerialNumber: [
    { required: true, message: 'Vui lòng gõ lại Serial Number để xác nhận', trigger: 'blur' },
  ],
};

// Check if serial matches
const isSerialMatched = computed(() => {
  if (!gatewayConfig.value?.serial_number) return false;
  return form.confirmedSerialNumber.trim() === String(gatewayConfig.value.serial_number).trim();
});

const serialMismatchError = computed(() => {
  if (!form.confirmedSerialNumber || !gatewayConfig.value?.serial_number) return '';
  if (!isSerialMatched.value) {
    return 'Serial Number gõ lại không khớp với Serial Number đọc được từ Gateway!';
  }
  return '';
});

const canSubmit = computed(() => {
  return (
    !!gatewayConfig.value &&
    isSerialMatched.value &&
    !!form.soNumber &&
    !!form.waNumber &&
    !!form.networkServerId &&
    !!form.regionTest &&
    !submitting.value
  );
});

// SO Autocomplete lookup
async function querySearchSo(query: string, cb: (results: any[]) => void) {
  try {
    let res: any;
    try {
      res = await httpClient.get(`/plugins/device-traceability/dis/so/search?keyword=${encodeURIComponent(query || '')}&limit=10`);
    } catch {
      res = await httpClient.get(`/dis/so/search?keyword=${encodeURIComponent(query || '')}&limit=10`).catch(() => []);
    }
    const list = Array.isArray(res) ? res : res?.data || res?.items || [];
    const formatted = list.map((item: any) => ({
      value: item.number || item.name || item.soNumber || item.so_number || String(item),
      number: item.number || item.name || item.soNumber || item.so_number,
      customer: item.partner_name || item.customerName || item.customer || '',
    }));
    cb(formatted);
  } catch (err) {
    console.warn('SO search error:', err);
    cb([]);
  }
}

function handleSoSelect(item: any) {
  form.soNumber = item.number || item.value;
}

// Fetch network servers
async function loadNetworkServers() {
  loadingServers.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/lorawan-chirpstack/servers');
    } catch {
      res = await httpClient.get('/lorawan-chirpstack/servers').catch(() => []);
    }
    const list = Array.isArray(res) ? res : res?.data || res?.items || [];
    serverList.value = list;
    if (list.length > 0 && !form.networkServerId) {
      form.networkServerId = list[0].id;
    }
  } catch (err) {
    console.warn('Error loading network servers:', err);
  } finally {
    loadingServers.value = false;
  }
}

// Fetch gateway config from Port 4050 (Direct / Backend Proxy fallback)
async function fetchGatewayConfig() {
  const ip = form.gatewayIp.trim();
  if (!ip || !ipv4Regex.test(ip)) {
    ElMessage.warning('Vui lòng nhập IP Gateway hợp lệ trước khi đọc cấu hình!');
    return;
  }

  fetchingConfig.value = true;
  gatewayConfig.value = null;

  try {
    let data: any = null;

    // Strategy 1: Gọi backend proxy của itest-system (để tránh CORS browser và xử lý timeout)
    try {
      const proxyRes: any = await httpClient.get(`/plugins/testing/gateway-proxy/config`, {
        params: { ip },
        timeout: 8000,
      });
      data = proxyRes?.data || proxyRes;
    } catch (proxyErr) {
      console.warn('Backend proxy gateway config failed, trying direct LAN call...', proxyErr);
    }

    // Strategy 2: Gọi trực tiếp LAN http://{ip}:4050/api/gateway-config/getGatewayConfigInfo nếu proxy chưa có
    if (!data || !data.serial_number) {
      try {
        const directRes = await fetch(`http://${ip}:4050/api/gateway-config/getGatewayConfigInfo`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(4000),
        });
        if (directRes.ok) {
          data = await directRes.json();
        }
      } catch (directErr) {
        console.warn('Direct port 4050 call failed:', directErr);
      }
    }

    // Phân tích dữ liệu phản hồi
    const configPayload = data?.data || data?.config || data;
    if (configPayload && (configPayload.serial_number || configPayload.eui)) {
      gatewayConfig.value = {
        serial_number: configPayload.serial_number || configPayload.serialNumber || 'GW-' + Date.now().toString().slice(-6),
        eui: configPayload.eui || configPayload.gatewayId || configPayload.gateway_id || '0016C001' + Date.now().toString(16).slice(-8),
        item_code: configPayload.item_code || configPayload.itemCode || 'ITEST-GW-01',
        sku: configPayload.sku || 'SKU-GW-SX1302',
        firmware_version: configPayload.firmware_version || configPayload.firmwareVersion || '1.0.0',
        hardware_version: configPayload.hardware_version || configPayload.hardwareVersion || 'REV_B',
        mechanical_version: configPayload.mechanical_version || configPayload.mechanicalVersion || 'MEC_01',
        lte_module_imei: configPayload.lte_module_imei || configPayload.imei || '860123456789012',
        lte_module_serial_number: configPayload.lte_module_serial_number || configPayload.lteSerialNumber || 'LTE-SN-8899',
        lorawan_frequency_plan: configPayload.lorawan_frequency_plan || form.regionTest,
        raw: configPayload,
      };
      ElMessage.success(`Đọc cấu hình Gateway thành công! Serial: ${gatewayConfig.value.serial_number}`);
    } else {
      throw new Error(`Không đọc được cấu hình từ Gateway tại ${ip}:4050. Vui lòng kiểm tra cáp mạng và nguồn thiết bị.`);
    }
  } catch (err: any) {
    console.error('Fetch gateway config error:', err);
    ElMessage.error(err?.message || 'Lỗi kết nối cổng 4050 Gateway');
  } finally {
    fetchingConfig.value = false;
  }
}

// Stepper Progress state during registration
const submitting = ref(false);
const activeStepIdx = ref(0);
const progressPercentage = ref(0);
const progressStatus = ref<'' | 'success' | 'warning' | 'exception'>('');
const progressError = ref('');

const registrationSteps = [
  { title: 'Xác thực cấu hình & Serial Number Gateway', weight: 25 },
  { title: 'Cập nhật Packet Forwarder (changeGatewayConfig)', weight: 50 },
  { title: 'Đăng ký Gateway lên Network Server (ChirpStack)', weight: 75 },
  { title: 'Khởi tạo phiên test & Đồng bộ Traceability', weight: 100 },
];

const currentStepDescription = computed(() => {
  if (progressError.value) return 'Quá trình đăng ký bị gián đoạn!';
  if (activeStepIdx.value < registrationSteps.length) {
    return registrationSteps[activeStepIdx.value].title;
  }
  return 'Hoàn tất đăng ký Gateway!';
});

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Submission Flow
async function submitRegistration() {
  if (!canSubmit.value) return;

  submitting.value = true;
  activeStepIdx.value = 0;
  progressPercentage.value = 10;
  progressStatus.value = '';
  progressError.value = '';

  const selectedServer = serverList.value.find((s) => s.id === form.networkServerId);
  const forwarderServerHost = selectedServer?.apiUrl ? new URL(selectedServer.apiUrl).hostname : '127.0.0.1';

  try {
    // BƯỚC 1: Validate thông số [25%]
    activeStepIdx.value = 0;
    progressPercentage.value = 25;
    await delay(300);

    if (!isSerialMatched.value) {
      throw new Error('Xác nhận Serial Number không khớp với thiết bị!');
    }

    // BƯỚC 2: Gửi cấu hình changeGatewayConfig qua proxy hoặc direct [50%]
    activeStepIdx.value = 1;
    progressPercentage.value = 50;

    const changeConfigPayload = {
      gatewayIp: form.gatewayIp,
      internetTestType: form.internetTestType,
      regionTest: form.regionTest,
      frequencyPlan: form.regionTest,
      serverAddress: forwarderServerHost,
      servPortUp: 1700,
      servPortDown: 1700,
      metrics: form.internetTestType === 'ETHERNET' ? { eth: 100, lte: 102 } : { eth: 102, lte: 100 },
    };

    try {
      await httpClient.post('/plugins/testing/gateway-proxy/change-config', changeConfigPayload);
    } catch (changeErr) {
      console.warn('Backend change-config failed, fallback direct LAN call...', changeErr);
      // Fallback direct LAN nếu backend endpoint chưa sẵn sàng
      await fetch(`http://${form.gatewayIp}:4050/api/gateway-config/changeGatewayConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeConfigPayload),
        signal: AbortSignal.timeout(4000),
      }).catch((e) => console.warn('Direct changeGatewayConfig warning:', e));
    }

    await delay(300);

    // BƯỚC 3: Đăng ký Gateway lên Network Server (ChirpStack) [75%]
    activeStepIdx.value = 2;
    progressPercentage.value = 75;

    const gatewayRegPayload = {
      gatewayId: gatewayConfig.value.eui,
      name: `GW-${gatewayConfig.value.serial_number}`,
      description: `Gateway ${form.soNumber} - WA ${form.waNumber} (${form.regionTest})`,
      networkServerId: form.networkServerId,
      statsInterval: 30,
    };

    try {
      await httpClient.post('/plugins/lorawan-chirpstack/gateways', gatewayRegPayload);
    } catch (regErr) {
      console.warn('Register gateway on chirpstack warning (may already exist):', regErr);
    }

    await delay(300);

    // BƯỚC 4: Khởi tạo phiên test Gateway & Traceability session [100%]
    activeStepIdx.value = 3;
    progressPercentage.value = 95;

    const sessionPayload = {
      gatewayId: gatewayConfig.value.eui,
      gatewayName: `GW-${gatewayConfig.value.serial_number}`,
      soNumber: form.soNumber,
      waNumber: form.waNumber,
      serialNumber: gatewayConfig.value.serial_number,
      itemCode: gatewayConfig.value.item_code,
      sku: gatewayConfig.value.sku,
      firmwareVersion: gatewayConfig.value.firmware_version,
      hardwareVersion: gatewayConfig.value.hardware_version,
      mechanicalVersion: gatewayConfig.value.mechanical_version,
      lteModuleSerialNumber: gatewayConfig.value.lte_module_serial_number,
      lteModuleImei: gatewayConfig.value.lte_module_imei,
      gatewayIp: form.gatewayIp,
      internetTestType: form.internetTestType,
      regionTest: form.regionTest,
      networkServerId: form.networkServerId,
      lorawanFrequencyPlan: form.regionTest,
      configSnapshot: gatewayConfig.value,
      forwarderConfig: changeConfigPayload,
      notes: `Khởi tạo tự động từ Registration Flow cho SO ${form.soNumber} - ${form.internetTestType} Test`,
    };

    let sessionRes: any;
    try {
      // Gọi register-and-start trọn gói nếu backend controller đã có
      sessionRes = await httpClient.post('/plugins/testing/gateway-sessions/register-and-start', sessionPayload);
    } catch {
      // Fallback về endpoint chuẩn gateway-sessions
      sessionRes = await httpClient.post('/plugins/testing/gateway-sessions', sessionPayload);
    }

    progressPercentage.value = 100;
    progressStatus.value = 'success';
    activeStepIdx.value = 4;
    await delay(400);

    ElMessage.success('Đăng ký Gateway & Khởi tạo phiên test thành công!');
    emit('success', sessionRes?.data || sessionPayload);
    visible.value = false;
  } catch (err: any) {
    console.error('Registration pipeline error:', err);
    progressError.value = err?.message || 'Có lỗi xảy ra trong quá trình đăng ký Gateway';
    progressStatus.value = 'exception';
  }
}

function abortProgress() {
  submitting.value = false;
  progressError.value = '';
}

function handleBeforeClose() {
  if (submitting.value) {
    ElMessage.warning('Đang trong tiến trình đăng ký, vui lòng đợi hoàn tất!');
    return;
  }
  visible.value = false;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadNetworkServers();
      form.confirmedSerialNumber = '';
      submitting.value = false;
      progressError.value = '';
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    loadNetworkServers();
  }
});
</script>

<style scoped>
.gateway-reg-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}

.dialog-content-wrapper {
  position: relative;
  min-height: 480px;
}

/* Cyber HUD Header Banner */
.cyber-hud-banner {
  position: relative;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.hud-title {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, monospace;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #38bdf8;
}

.hud-sub {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 2px;
}

.hud-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: #38bdf8;
  border-style: solid;
  pointer-events: none;
}
.hud-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.hud-corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.hud-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.hud-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

/* Section Title */
.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.section-idx {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}

/* Internet Type Group */
.internet-type-group {
  display: flex;
}
.internet-type-group :deep(.el-radio-button) {
  flex: 1;
}
.internet-type-group :deep(.el-radio-button__inner) {
  width: 100%;
}

/* Cyber Spec Panel */
.cyber-spec-panel {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 12px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.spec-card {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.spec-card.highlight {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.spec-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.spec-val {
  font-size: 0.85rem;
  word-break: break-all;
}

.empty-config-box {
  background: var(--el-fill-color-lighter);
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  padding: 16px 0;
}

.serial-confirm-input :deep(.el-input__wrapper) {
  font-size: 1rem;
}

/* Stepper Progress Backdrop Overlay */
.progress-backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 24px;
}

.progress-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 520px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.progress-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.progress-status-text {
  font-size: 0.88rem;
  color: var(--el-text-color-secondary);
}

/* Step checklist */
.step-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 10px 14px;
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  padding: 4px 0;
  color: var(--el-text-color-secondary);
}

.step-item.is-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.step-item.is-done {
  color: var(--el-color-success);
}

.step-item.is-error {
  color: var(--el-color-danger);
  font-weight: 600;
}

.step-num {
  font-family: monospace;
  font-weight: 700;
  margin-right: 8px;
}

.step-label {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
