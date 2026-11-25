<template>
  <div class="create-gateway-test-panel space-y-4 w-full">
    <!-- Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm p-4 md:p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Gauge class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Gateway</span>
              <span class="badge badge-xs badge-neutral font-mono">
                STEP {{ currentWizardStep + 1 }} / 4
              </span>
            </div>
            <h2 class="text-lg md:text-xl font-bold tracking-tight text-base-content mt-0.5">
              CREATE GATEWAY TESTING
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            :disabled="submitting"
            @click="resetForm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Stepper Navigation -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-3">
      <ul class="steps steps-horizontal w-full text-xs font-semibold">
        <li
          class="step font-bold"
          :class="currentWizardStep >= 0 ? 'step-primary cursor-pointer' : 'cursor-not-allowed'"
          @click="goToStep(0)"
        >
          SO &amp; WA
        </li>
        <li
          class="step font-bold"
          :class="currentWizardStep >= 1 ? 'step-primary cursor-pointer' : 'cursor-not-allowed'"
          @click="goToStep(1)"
        >
          Internet &amp; Region
        </li>
        <li
          class="step font-bold"
          :class="currentWizardStep >= 2 ? 'step-primary cursor-pointer' : 'cursor-not-allowed'"
          @click="goToStep(2)"
        >
          Confirm
        </li>
        <li
          class="step font-bold"
          :class="currentWizardStep >= 3 ? 'step-primary cursor-pointer' : 'cursor-not-allowed'"
          @click="goToStep(3)"
        >
          Final
        </li>
      </ul>
    </div>

    <!-- STEP PANELS -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-5 relative min-h-[420px]">
      <!-- Overlay khi đang submit -->
      <div
        v-if="submitting"
        class="absolute inset-0 bg-base-100/90 backdrop-blur-sm z-30 flex items-center justify-center p-6 rounded-xl"
      >
        <div class="max-w-md w-full text-center space-y-4">
          <div class="flex items-center justify-center">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
          <div>
            <div class="font-bold text-base text-base-content mb-1">Đang Xử Lý Đăng Ký Gateway</div>
            <div class="text-xs text-base-content/70">{{ currentStepDescription }}</div>
          </div>
          <progress class="progress progress-primary w-full" :value="progressPercentage" max="100"></progress>
          <div v-if="progressError" class="alert alert-error text-xs text-left">
            <span>{{ progressError }}</span>
          </div>
          <div v-if="progressError" class="pt-2">
            <button type="button" class="btn btn-sm btn-outline" @click="submitting = false; progressError = ''">
              Quay Lại
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 1: SO & WA                            -->
      <!-- ========================================== -->
      <div v-show="currentWizardStep === 0" class="space-y-4">
        <div class="flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
          <span class="badge badge-primary badge-sm font-mono">01</span>
          <span>Liên Kết SO &amp; WA (Sale Order &amp; Work Authorization)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-semibold">SO Number <span class="text-error">*</span></span>
            </label>
            <div class="flex gap-2">
              <select
                v-model="form.soNumber"
                class="select select-bordered select-sm flex-1 font-mono"
                :disabled="loadingSo"
                @change="onSoChange"
              >
                <option value="" disabled>-- Chọn SO Number --</option>
                <option v-for="so in soOptions" :key="so.value" :value="so.value">
                  {{ so.label }}
                </option>
              </select>
              <button
                type="button"
                class="btn btn-sm btn-outline btn-square"
                :disabled="loadingSo"
                title="Tải lại danh sách SO"
                @click="searchSoList('')"
              >
                <span v-if="loadingSo" class="loading loading-spinner loading-xs"></span>
                <RefreshCw v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-semibold">WA Number <span class="text-error">*</span></span>
            </label>
            <select
              v-model="form.waNumber"
              class="select select-bordered select-sm w-full font-mono"
              :disabled="loadingWa || !form.soNumber"
            >
              <option value="" disabled>
                {{ form.soNumber ? (loadingWa ? 'Đang tải danh sách WA...' : '-- Chọn WA Number --') : 'Vui lòng chọn SO Number trước' }}
              </option>
              <option v-for="wa in waOptions" :key="wa.waNumber" :value="wa.waNumber">
                {{ wa.waNumber }} {{ wa.itemCode ? `[${wa.itemCode}]` : '' }} (SL: {{ wa.plannedQuantity }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text font-semibold">Network Server (ChirpStack) <span class="text-error">*</span></span>
          </label>
          <select
            v-model="form.networkServerId"
            class="select select-bordered select-sm w-full"
            :disabled="loadingServers"
          >
            <option value="" disabled>-- Chọn Network Server liên kết --</option>
            <option v-for="srv in serverList" :key="srv.id" :value="srv.id">
              {{ srv.name }} ({{ srv.apiUrl }}) - Status: {{ srv.status }}
            </option>
          </select>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2: Internet & Region                  -->
      <!-- ========================================== -->
      <div v-show="currentWizardStep === 1" class="space-y-4">
        <div class="flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
          <span class="badge badge-primary badge-sm font-mono">02</span>
          <span>Internet &amp; Region (Cấu Hình Mạng &amp; Băng Tần LoRaWAN)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-semibold">Địa Chỉ IP Gateway (Cổng 4050) <span class="text-error">*</span></span>
            </label>
            <input
              v-model="form.gatewayIp"
              type="text"
              placeholder=""
              class="input input-bordered input-sm font-mono"
              :class="{ 'input-error': form.gatewayIp && !ipv4Regex.test(form.gatewayIp) }"
            />
            <span class="text-xs text-base-content/60 mt-1">
              IP LAN kết nối với Gateway. Cổng cấu hình mặc định là 4050.
            </span>
          </div>

          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-semibold">Khu Vực Băng Tần Kiểm Thử <span class="text-error">*</span></span>
            </label>
            <select v-model="form.regionTest" class="select select-bordered select-sm w-full font-mono">
              <option v-for="r in regionOptions" :key="r.value" :value="r.value">
                {{ r.label }} ({{ r.desc }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text font-semibold">Phương Thức Kết Nối Internet Kiểm Thử <span class="text-error">*</span></span>
          </label>
          <div class="join">
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="form.internetTestType === 'ETHERNET' ? 'btn-primary' : 'btn-outline'"
              @click="form.internetTestType = 'ETHERNET'"
            >
              ETHERNET (Cáp Mạng LAN)
            </button>
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="form.internetTestType === '4G' ? 'btn-primary' : 'btn-outline'"
              @click="form.internetTestType = '4G'"
            >
              4G LTE (Sim Data Di Động)
            </button>
          </div>
        </div>

        <div class="alert alert-info text-xs mt-3">
          <Link class="w-4 h-4 shrink-0" />
          <span>
            Thông số sẽ được gửi tới Gateway qua API cổng 4050 (/api/gateway-config/changeGatewayConfig) với cấu trúc gatewayConfig đầy đủ để Packet Forwarder trỏ về ChirpStack Server.
          </span>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 3: Confirm                            -->
      <!-- ========================================== -->
      <div v-show="currentWizardStep === 2" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-base-content/10">
          <div class="flex items-center gap-2 font-bold text-sm text-primary">
            <span class="badge badge-primary badge-sm font-mono">03</span>
            <span>Confirm (Xác Thực Thông Số Phần Cứng &amp; Serial Number)</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-primary btn-sm gap-2"
              :disabled="fetchingConfig || !form.gatewayIp || !ipv4Regex.test(form.gatewayIp)"
              @click="fetchGatewayConfig"
            >
              <span v-if="fetchingConfig" class="loading loading-spinner loading-xs"></span>
              <Cpu v-else class="w-4 h-4" />
              Đọc Lại Cấu Hình: {{ form.gatewayIp || '...' }}
            </button>
          </div>
        </div>

        <!-- Hardware Specs Grid -->
        <div v-if="gatewayConfig" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">GATEWAY EUI</span>
            <span class="font-mono text-primary font-bold text-sm">{{ gatewayConfig.eui || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">SERIAL NUMBER</span>
            <span class="font-mono text-warning font-bold text-sm">{{ gatewayConfig.serial_number || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">MODEL NAME</span>
            <span class="font-mono text-sm">{{ gatewayConfig.model_name || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">FIRMWARE VER</span>
            <span class="font-mono text-sm">{{ gatewayConfig.firmware_version || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">HARDWARE VER</span>
            <span class="font-mono text-sm">{{ gatewayConfig.hardware_version || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">MECHANICAL VER</span>
            <span class="font-mono text-sm">{{ formatMechanicalVer(gatewayConfig.mechanical_version) }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">LTE MODULE IMEI</span>
            <span class="font-mono text-sm">{{ gatewayConfig.lte_module_imei || '—' }}</span>
          </div>
          <div class="card border border-base-content/10 bg-base-100 p-3 shadow-xs">
            <span class="text-xs text-base-content/60 font-medium">MAC ADDRESS</span>
            <span class="font-mono text-sm">{{ gatewayConfig.mac_address || '—' }}</span>
          </div>
        </div>

        <!-- Loading or Empty State when config not fetched yet -->
        <div v-else class="text-center py-8 border border-dashed border-base-content/20 rounded-lg">
          <span v-if="fetchingConfig" class="loading loading-spinner loading-md text-primary mb-2"></span>
          <Cpu v-else class="w-10 h-10 mx-auto text-base-content/40 mb-2" />
          <div class="text-sm font-semibold">
            {{ fetchingConfig ? 'Đang tự động đọc thông số phần cứng từ Gateway...' : 'Chưa có thông số phần cứng Gateway' }}
          </div>
          <div class="text-xs text-base-content/60 mt-1 max-w-md mx-auto">
            {{ fetchingConfig ? 'Hệ thống đang kết nối tới cổng 4050 để truy xuất thông tin.' : 'Bấm nút "Đọc Lại Cấu Hình" phía trên để kết nối tới Gateway.' }}
          </div>
        </div>

        <!-- Serial Confirmation Input -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text font-semibold">Xác Nhận Serial Number Thiết Bị <span class="text-error">*</span></span>
          </label>
          <input
            v-model="form.confirmedSerialNumber"
            type="text"
            placeholder=""
            class="input input-bordered input-sm font-mono w-full"
            :class="{
              'input-success': isSerialMatched,
              'input-error': form.confirmedSerialNumber && !isSerialMatched
            }"
          />
          <div class="mt-1 flex items-center justify-between text-xs">
            <span v-if="isSerialMatched" class="text-success font-semibold flex items-center gap-1">
              <Check class="w-3.5 h-3.5" /> Serial Number trùng khớp với thông số từ thiết bị!
            </span>
            <span v-else-if="form.confirmedSerialNumber && !isSerialMatched" class="text-error font-semibold flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5" /> Serial Number không khớp với dữ liệu từ thiết bị ({{ gatewayConfig?.serial_number || 'Chưa đọc' }})!
            </span>
            <span v-else class="text-base-content/60">
              Phải trùng khớp với Serial Number đọc được từ phần cứng để mở khóa bước tiếp theo.
            </span>
            <button
              v-if="gatewayConfig?.serial_number"
              type="button"
              class="btn btn-ghost btn-xs text-primary"
              @click="form.confirmedSerialNumber = gatewayConfig.serial_number"
            >
              Điền tự động
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 4: Final                              -->
      <!-- ========================================== -->
      <div v-show="currentWizardStep === 3" class="space-y-4">
        <div class="flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
          <span class="badge badge-primary badge-sm font-mono">04</span>
          <span>Final (Xác Nhận &amp; Khởi Tạo Phiên Kiểm Thử)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="card border border-base-content/10 bg-base-100 p-3 space-y-2">
            <div class="font-bold text-xs text-primary border-b border-base-content/10 pb-1">THÔNG TIN ĐƠN HÀNG &amp; MẠNG</div>
            <div class="flex justify-between"><span class="text-base-content/60">SO Number:</span> <span class="font-mono font-bold">{{ form.soNumber }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">WA Number:</span> <span class="font-mono font-bold">{{ form.waNumber }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Network Server:</span> <span class="font-mono text-xs">{{ selectedServerName }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Địa Chỉ IP:</span> <span class="font-mono">{{ form.gatewayIp }}:4050</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Băng Tần LoRa:</span> <span class="font-mono font-semibold text-primary">{{ form.regionTest }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Kết Nối Internet:</span> <span class="badge badge-sm badge-info font-mono">{{ form.internetTestType }}</span></div>
          </div>

          <div class="card border border-base-content/10 bg-base-100 p-3 space-y-2">
            <div class="font-bold text-xs text-primary border-b border-base-content/10 pb-1">THÔNG SỐ PHẦN CỨNG GATEWAY</div>
            <div class="flex justify-between"><span class="text-base-content/60">Gateway EUI:</span> <span class="font-mono font-bold text-primary">{{ gatewayConfig?.eui || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Serial Number:</span> <span class="font-mono font-bold text-warning">{{ form.confirmedSerialNumber || gatewayConfig?.serial_number || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Model Name:</span> <span class="font-mono">{{ gatewayConfig?.model_name || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Firmware Ver:</span> <span class="font-mono">{{ gatewayConfig?.firmware_version || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Hardware Ver:</span> <span class="font-mono">{{ gatewayConfig?.hardware_version || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">Mechanical Ver:</span> <span class="font-mono">{{ formatMechanicalVer(gatewayConfig?.mechanical_version) }}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60">LTE Module IMEI:</span> <span class="font-mono">{{ gatewayConfig?.lte_module_imei || '—' }}</span></div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between border-t border-base-content/10 pt-4 mt-6">
        <div>
          <button
            v-if="currentWizardStep > 0 && !submitting"
            type="button"
            class="btn btn-sm btn-outline gap-1"
            @click="prevWizardStep"
          >
            <ArrowLeft class="w-4 h-4" />
            Bước Trước
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="currentWizardStep < 3"
            type="button"
            class="btn btn-sm btn-primary gap-1"
            :disabled="!canProceedNextStep || submitting"
            @click="nextWizardStep"
          >
            Tiếp Tục
            <ArrowRight class="w-4 h-4" />
          </button>

          <button
            v-else
            type="button"
            class="btn btn-sm btn-success gap-2 text-success-content font-bold"
            :disabled="!canSubmit || submitting"
            @click="submitRegistration"
          >
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <Check v-else class="w-4 h-4" />
            Hoàn Tất Đăng Ký &amp; Tạo Phiên Test
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Gauge,
  Cpu,
  RefreshCw,
  RotateCcw,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Link,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

const emit = defineEmits<{
  (e: 'success', session: any): void;
  (e: 'switch-tab', tab: string): void;
}>();

const currentWizardStep = ref(0);

const form = reactive({
  soNumber: '',
  waNumber: '',
  networkServerId: '',
  regionTest: 'AS923_2',
  internetTestType: 'ETHERNET' as 'ETHERNET' | '4G',
  gatewayIp: '',
  confirmedSerialNumber: '',
});

function formatMechanicalVer(raw: any): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  const str = String(raw).trim();
  const matched = str.match(/\d+/);
  return matched ? matched[0] : str;
}

const gatewayConfig = ref<any>(null);
const fetchingConfig = ref(false);

const soOptions = ref<{ label: string; value: string; customer?: string }[]>([]);
const loadingSo = ref(false);
const waOptions = ref<{ waNumber: string; itemCode?: string; plannedQuantity?: number }[]>([]);
const loadingWa = ref(false);
const serverList = ref<any[]>([]);
const loadingServers = ref(false);

const regionOptions = [
  { value: 'AS923_2', label: 'AS923-2', desc: 'Việt Nam, Indonesia, v.v.' },
  { value: 'AS923_1', label: 'AS923-1', desc: 'Nhật Bản, Malaysia, Singapore' },
  { value: 'EU868', label: 'EU868', desc: 'Châu Âu' },
  { value: 'US915', label: 'US915', desc: 'Bắc Mỹ' },
  { value: 'AU915', label: 'AU915', desc: 'Úc, Nam Mỹ' },
  { value: 'IN865', label: 'IN865', desc: 'Ấn Độ' },
  { value: 'RU864', label: 'RU864', desc: 'Nga' },
  { value: 'KR920', label: 'KR920', desc: 'Hàn Quốc' },
];

const submitting = ref(false);
const activeStepIdx = ref(0);
const progressPercentage = ref(0);
const progressError = ref('');

const currentStepDescription = computed(() => {
  switch (activeStepIdx.value) {
    case 0:
      return 'BƯỚC 1/4: Kiểm tra và xác nhận Serial Number...';
    case 1:
      return `BƯỚC 2/4: Ghi cấu hình Packet Forwarder vào Gateway (${form.gatewayIp}:4050)...`;
    case 2:
      return 'BƯỚC 3/4: Đăng ký Gateway EUI lên ChirpStack Server...';
    case 3:
      return 'BƯỚC 4/4: Khởi tạo phiên kiểm thử và lưu thông tin Gateway Test...';
    default:
      return 'Đang chuẩn bị...';
  }
});

const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const isSerialMatched = computed(() => {
  if (!gatewayConfig.value?.serial_number) return false;
  return (
    form.confirmedSerialNumber.trim().toUpperCase() ===
    String(gatewayConfig.value.serial_number).trim().toUpperCase()
  );
});

const canProceedNextStep = computed(() => {
  if (currentWizardStep.value === 0) {
    return !!form.soNumber && !!form.waNumber && !!form.networkServerId;
  }
  if (currentWizardStep.value === 1) {
    return !!form.gatewayIp && ipv4Regex.test(form.gatewayIp) && !!form.regionTest;
  }
  if (currentWizardStep.value === 2) {
    return !!gatewayConfig.value && isSerialMatched.value;
  }
  return true;
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

const selectedServerName = computed(() => {
  const srv = serverList.value.find((s) => s.id === form.networkServerId);
  return srv ? `${srv.name} (${srv.apiUrl})` : '—';
});

function goToStep(step: number) {
  if (step > currentWizardStep.value && !canProceedNextStep.value) {
    return;
  }
  currentWizardStep.value = step;
  if (currentWizardStep.value === 2 && !gatewayConfig.value) {
    fetchGatewayConfig();
  }
}

function nextWizardStep() {
  if (canProceedNextStep.value && currentWizardStep.value < 3) {
    currentWizardStep.value++;
    if (currentWizardStep.value === 2 && !gatewayConfig.value) {
      fetchGatewayConfig();
    }
  }
}

function prevWizardStep() {
  if (currentWizardStep.value > 0) {
    currentWizardStep.value--;
  }
}

function resetForm() {
  currentWizardStep.value = 0;
  form.soNumber = '';
  form.waNumber = '';
  form.gatewayIp = '';
  form.confirmedSerialNumber = '';
  gatewayConfig.value = null;
  submitting.value = false;
  progressError.value = '';
  searchSoList('');
  loadNetworkServers();
}

async function searchSoList(keyword: string = '') {
  loadingSo.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/testing/lookup/so', {
        params: { search: keyword, limit: 50 },
      });
    } catch {
      res = await httpClient.get('/plugins/device-traceability/so', {
        params: { soNumber: keyword, limit: 50 },
      }).catch(() => []);
    }

    const items = Array.isArray(res) ? res : res?.data || res?.items || [];
    soOptions.value = items.map((so: any) => ({
      value: so.soNumber || so.so_number || so.name,
      label: `${so.soNumber || so.so_number || so.name} ${so.customerName || so.customer_name ? `(${so.customerName || so.customer_name})` : ''}`,
      customer: so.customerName || so.customer_name,
    }));
  } catch (err) {
    console.warn('Search SO error:', err);
  } finally {
    loadingSo.value = false;
  }
}

async function onSoChange() {
  form.waNumber = '';
  waOptions.value = [];
  if (!form.soNumber) return;

  loadingWa.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/testing/lookup/wa', {
        params: { soNumber: form.soNumber, limit: 100 },
      });
    } catch {
      res = await httpClient.get('/plugins/device-traceability/wa', {
        params: { soNumber: form.soNumber, limit: 100 },
      }).catch(() => []);
    }

    const waList = Array.isArray(res) ? res : res?.data || [];
    waOptions.value = waList.map((w: any) => ({
      waNumber: w.waNumber || w.wa_number || w.name,
      itemCode: w.itemCode || w.item_code || '',
      plannedQuantity: w.planned_quantity || w.plannedQuantity || 0,
    }));
  } catch (err) {
    console.warn('Load WA list for SO error:', err);
    waOptions.value = [];
  } finally {
    loadingWa.value = false;
  }
}

async function loadNetworkServers() {
  loadingServers.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/lorawan-chirpstack/servers');
    } catch {
      res = await httpClient.get('/lorawan-chirpstack/servers').catch(() => []);
    }
    const list = Array.isArray(res) ? res : res?.data || [];
    serverList.value = list;
    if (list.length > 0 && !form.networkServerId) {
      form.networkServerId = list[0].id;
    }
  } catch (err) {
    console.warn('Load servers error:', err);
  } finally {
    loadingServers.value = false;
  }
}

async function fetchGatewayConfig() {
  const ip = form.gatewayIp.trim();
  if (!ip || !ipv4Regex.test(ip)) {
    cyberToast.warning('Vui lòng nhập IP Gateway hợp lệ trước khi đọc cấu hình!');
    return;
  }

  fetchingConfig.value = true;
  gatewayConfig.value = null;

  const candidateEndpoints = [
    '/api/gateway-config/getGatewayConfigInfo',
    '/api/gateway-config/getConfigGateway',
    '/api/gateway-config',
    '/api/gateway-config/config',
    '/getGatewayConfigInfo',
    '/getConfigGateway',
  ];

  try {
    let data: any = null;

    // 1. Probe via Backend Proxy
    for (const ep of candidateEndpoints) {
      try {
        const proxyRes: any = await httpClient.get(`/plugins/testing/gateway-proxy/config`, {
          params: { ip, endpoint: ep },
          timeout: 60000,
        });
        const resObj = proxyRes?.data || proxyRes;
        const resData =
          resObj?.['gateway-config-info'] ||
          resObj?.['gateway_config_info'] ||
          resObj?.data ||
          resObj?.config ||
          resObj;
        if (resData && (resData.eui || resData.serial_number || resData.gateway_id)) {
          data = resData;
          break;
        }
      } catch {
        // try next
      }
    }

    // 2. Direct LAN browser fetch fallback
    if (!data || (!data.eui && !data.serial_number && !data.gateway_id)) {
      for (const ep of candidateEndpoints) {
        try {
          const directRes = await fetch(`http://${ip}:4050${ep}`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(60000),
          });
          if (directRes.ok) {
            const rawJson = await directRes.json();
            const resData =
              rawJson?.['gateway-config-info'] ||
              rawJson?.['gateway_config_info'] ||
              rawJson?.data ||
              rawJson?.config ||
              rawJson;
            if (resData && (resData.eui || resData.serial_number || resData.gateway_id)) {
              data = resData;
              break;
            }
          }
        } catch {
          // try next
        }
      }
    }

    if (data && (data.eui || data.serial_number || data.gateway_id)) {
      const normalizedData = {
        ...data,
        eui: data.eui || data.gateway_id || data.gatewayId || '',
        serial_number: data.serial_number || data.serialNumber || '',
        model_name: data.model_name || data.model || 'GW-ETH',
        firmware_version: data.firmware_version || data.firmware || '1.0.0',
        hardware_version: data.hardware_version || data.hardware || '1.0',
        mechanical_version: formatMechanicalVer(data.mechanical_version || '1'),
        lte_module_imei: data.lte_module_imei || 'N/A',
        mac_address: data.eth_mac_address || data.mac_address || data.mac || 'N/A',
      };
      gatewayConfig.value = normalizedData;
      cyberToast.success(`Đã đọc thành công thông số Gateway (EUI: ${normalizedData.eui || 'N/A'})!`);
      if (normalizedData.serial_number && !form.confirmedSerialNumber) {
        form.confirmedSerialNumber = normalizedData.serial_number;
      }
    } else {
      throw new Error(
        `Không tìm thấy endpoint cấu hình hợp lệ trên cổng 4050 (đã thử getGatewayConfigInfo, getConfigGateway,...).`
      );
    }
  } catch (err: any) {
    console.warn('Fetch gateway config notice:', err);
    cyberToast.error(`Không thể đọc cấu hình từ ${ip}:4050. ${err.message || ''}`);
  } finally {
    fetchingConfig.value = false;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function submitRegistration() {
  if (!canSubmit.value) return;

  submitting.value = true;
  activeStepIdx.value = 0;
  progressPercentage.value = 15;
  progressError.value = '';

  const selectedServer = serverList.value.find((s) => s.id === form.networkServerId);
  const forwarderServerHost = selectedServer?.apiUrl ? new URL(selectedServer.apiUrl).hostname : '127.0.0.1';
  const matchedWa = waOptions.value.find((w) => w.waNumber === form.waNumber);

  try {
    // Bước 1: Xác thực Serial
    activeStepIdx.value = 0;
    progressPercentage.value = 25;
    await delay(300);

    if (!isSerialMatched.value) {
      throw new Error('Xác nhận Serial Number không khớp với thiết bị!');
    }

    // Bước 2: Gửi cấu hình changeGatewayConfig
    activeStepIdx.value = 1;
    progressPercentage.value = 50;

    const fullGatewayConfigPayload = {
      serial_number: form.confirmedSerialNumber || '',
      ethernet_metric: form.internetTestType === 'ETHERNET' ? '100' : '102',
      lte_metric: form.internetTestType === '4G' ? '100' : '102',
      wifi_metric: '101',
      is_reboot: 'false',
      lorawan_frequency_plan: form.regionTest.toLowerCase(),
      network_server_host: forwarderServerHost,
      ns_uplink_port: '1700',
      ns_downlink_port: '1700',
      antenna_gain: '0',
      gps_tty_device_path: '/dev/ttyAMA5',
      timezone: 'UTC',
    };

    const changeConfigPayload = {
      gatewayIp: form.gatewayIp,
      gatewayConfig: fullGatewayConfigPayload,
      internetTestType: form.internetTestType,
      regionTest: form.regionTest,
      serverAddress: forwarderServerHost,
      servPortUp: 1700,
      servPortDown: 1700,
    };

    let configSent = false;
    try {
      await httpClient.post('/plugins/testing/gateway-proxy/change-config', changeConfigPayload);
      configSent = true;
    } catch (proxyErr) {
      console.warn('Backend proxy change-config failed, trying direct LAN call...', proxyErr);
    }

    if (!configSent) {
      const directPostRes = await fetch(`http://${form.gatewayIp}:4050/api/gateway-config/changeGatewayConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayConfig: fullGatewayConfigPayload }),
      });
      if (!directPostRes.ok) {
        throw new Error(`Gửi lệnh changeGatewayConfig thất bại (HTTP ${directPostRes.status})`);
      }
    }

    await delay(400);

    // Bước 3: Đăng ký Gateway lên ChirpStack
    activeStepIdx.value = 2;
    progressPercentage.value = 75;

    const chirpstackPayload = {
      networkServerId: form.networkServerId,
      gatewayId: gatewayConfig.value.eui,
      name: `GW-${form.confirmedSerialNumber}`,
      description: `Registered via iTest Testing Plugin. SO: ${form.soNumber}, WA: ${form.waNumber}`,
      statsInterval: 30,
      ...(form.regionTest === 'EU868' ? { tenantId: '775836fd-1e66-4b9b-a30d-25cc02a18c3c' } : {}),
    };

    await httpClient.post('/plugins/lorawan-chirpstack/gateways', chirpstackPayload);

    await delay(400);

    // Bước 4: Tạo phiên kiểm thử Gateway
    activeStepIdx.value = 3;
    progressPercentage.value = 100;

    const sessionPayload = {
      gatewayId: gatewayConfig.value.eui,
      serialNumber: form.confirmedSerialNumber,
      soNumber: form.soNumber,
      waNumber: form.waNumber,
      itemCode: matchedWa?.itemCode || null,
      networkServerId: form.networkServerId,
      gatewayIp: form.gatewayIp,
      regionTest: form.regionTest,
      internetTestType: form.internetTestType,
      hardwareSpecs: {
        modelName: gatewayConfig.value.model_name,
        firmwareVersion: gatewayConfig.value.firmware_version,
        hardwareVersion: gatewayConfig.value.hardware_version,
        mechanicalVersion: gatewayConfig.value.mechanical_version,
        lteModuleImei: gatewayConfig.value.lte_module_imei,
        macAddress: gatewayConfig.value.mac_address,
      },
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
    };

    const sessionRes: any = await httpClient.post('/plugins/testing/gateway-sessions', sessionPayload);
    const createdSession = sessionRes?.data || sessionRes;

    cyberToast.success('Đăng ký Gateway và khởi tạo phiên test thành công!');
    emit('success', createdSession);
    emit('switch-tab', 'gateway-test-batch');
  } catch (err: any) {
    console.error('Registration pipeline error:', err);
    progressError.value = err.message || 'Lỗi trong quá trình đăng ký Gateway.';
  } finally {
    if (!progressError.value) {
      submitting.value = false;
    }
  }
}

onMounted(() => {
  searchSoList('');
  loadNetworkServers();
});
</script>
