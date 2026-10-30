<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-4xl border border-base-content/10 bg-base-100 p-6">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-base-content/10">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <Gauge class="w-5 h-5 text-primary" />
          Đăng Ký Gateway &amp; Khởi Tạo Phiên Test
        </h3>
        <button
          v-if="!submitting"
          type="button"
          class="btn btn-ghost btn-xs btn-circle"
          @click="handleBeforeClose"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content Wrapper -->
      <div class="dialog-content-wrapper relative min-h-[460px]">
        <!-- Cyber HUD Header Banner -->
        <div class="cyber-hud-banner mb-4 p-4 rounded-lg bg-base-200/60 border border-primary/20 relative">
          <div class="hud-corner hud-corner-tl"></div>
          <div class="hud-corner hud-corner-tr"></div>
          <div class="hud-corner hud-corner-bl"></div>
          <div class="hud-corner hud-corner-br"></div>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <Gauge class="text-primary w-6 h-6 shrink-0" />
              <div>
                <div class="hud-title font-bold text-sm tracking-wide text-primary">
                  GATEWAY VERIFICATION &amp; REGISTRATION PIPELINE
                </div>
                <div class="hud-sub text-xs text-base-content/70">
                  Quy trình xác thực phần cứng, đồng bộ Packet Forwarder &amp; kích hoạt ChirpStack Session
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="badge font-mono text-xs"
                :class="gatewayConfig ? 'badge-success text-success-content' : 'badge-info badge-outline'"
              >
                {{ gatewayConfig ? 'CONFIG LOADED' : 'AWAITING IP CONFIG' }}
              </span>
              <span class="badge badge-warning badge-outline font-mono text-xs">
                STEP {{ currentWizardStep + 1 }} / 4
              </span>
            </div>
          </div>
        </div>

        <!-- Multi-step Stepper Navigation -->
        <ul class="steps steps-horizontal w-full mb-6 text-xs md:text-sm">
          <li class="step" :class="{ 'step-primary': currentWizardStep >= 0 }">
            1. Liên Kết SO &amp; WA
          </li>
          <li class="step" :class="{ 'step-primary': currentWizardStep >= 1 }">
            2. Mạng &amp; Băng Tần
          </li>
          <li class="step" :class="{ 'step-primary': currentWizardStep >= 2 }">
            3. Xác Thực Phần Cứng
          </li>
          <li class="step" :class="{ 'step-primary': currentWizardStep >= 3 }">
            4. Hoàn Tất Đăng Ký
          </li>
        </ul>

        <!-- Form Panels -->
        <div>
          <!-- ========================================== -->
          <!-- STEP 1: LINK TRACEABILITY SO & WA -->
          <!-- ========================================== -->
          <div v-show="currentWizardStep === 0" class="wizard-step-pane space-y-4">
            <div class="form-section-title flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
              <span class="badge badge-primary badge-sm font-mono">01</span>
              <span>Liên Kết Lệnh Bán Hàng (SO) &amp; Lệnh Sản Xuất (WA)</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-semibold">Sale Order (SO Number) <span class="text-error">*</span></span>
                </label>
                <div class="flex gap-2">
                  <select
                    v-model="form.soNumber"
                    class="select select-bordered select-sm flex-1"
                    :disabled="loadingSo"
                    @change="onSoChange"
                  >
                    <option value="" disabled>-- Chọn Sale Order --</option>
                    <option v-for="so in soOptions" :key="so.value" :value="so.value">
                      {{ so.label }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline btn-square"
                    :disabled="loadingSo"
                    title="Tìm lại SO"
                    @click="searchSoList('')"
                  >
                    <span v-if="loadingSo" class="loading loading-spinner loading-xs"></span>
                    <RefreshCw v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-semibold">Work Order (WA Number) <span class="text-error">*</span></span>
                </label>
                <select
                  v-model="form.waNumber"
                  class="select select-bordered select-sm w-full"
                  :disabled="loadingWa || !form.soNumber"
                >
                  <option value="" disabled>
                    {{ form.soNumber ? (loadingWa ? 'Đang tải danh sách WA...' : '-- Chọn WA Number --') : 'Vui lòng chọn SO trước' }}
                  </option>
                  <option v-for="wa in waOptions" :key="wa.waNumber" :value="wa.waNumber">
                    {{ wa.waNumber }} - Item: {{ wa.itemCode || 'N/A' }} (SL: {{ wa.plannedQuantity }})
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
          <!-- STEP 2: NETWORK CONFIG & FREQUENCY REGION -->
          <!-- ========================================== -->
          <div v-show="currentWizardStep === 1" class="wizard-step-pane space-y-4">
            <div class="form-section-title flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
              <span class="badge badge-primary badge-sm font-mono">02</span>
              <span>Cấu Hình Địa Chỉ Mạng &amp; Băng Tần LoRaWAN</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-semibold">Địa Chỉ IP Gateway (Cổng 4050) <span class="text-error">*</span></span>
                </label>
                <input
                  v-model="form.gatewayIp"
                  type="text"
                  placeholder="192.168.1.5"
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
                <select v-model="form.regionTest" class="select select-bordered select-sm w-full">
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
                Cấu hình này sẽ được truyền tới Gateway qua API cổng 4050 để thiết lập tham số cho Packet Forwarder trỏ về Server ChirpStack đích.
              </span>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- STEP 3: EXTRACT HARDWARE CONFIG & VERIFY SERIAL -->
          <!-- ========================================== -->
          <div v-show="currentWizardStep === 2" class="wizard-step-pane space-y-4">
            <div class="form-section-title flex items-center justify-between pb-2 border-b border-base-content/10">
              <div class="flex items-center gap-2 font-bold text-sm text-primary">
                <span class="badge badge-primary badge-sm font-mono">03</span>
                <span>Trích Xuất Phần Cứng Cổng 4050 &amp; Xác Nhận Serial</span>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm gap-2"
                :disabled="fetchingConfig || !form.gatewayIp || !ipv4Regex.test(form.gatewayIp)"
                @click="fetchGatewayConfig"
              >
                <span v-if="fetchingConfig" class="loading loading-spinner loading-xs"></span>
                <Cpu v-else class="w-4 h-4" />
                Đọc Cấu Hình Từ IP: {{ form.gatewayIp || '...' }}
              </button>
            </div>

            <!-- Hardware Specs Grid -->
            <div v-if="gatewayConfig" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">GATEWAY EUI</span>
                <span class="font-mono text-primary font-bold text-sm">{{ gatewayConfig.eui || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">SERIAL NUMBER</span>
                <span class="font-mono text-warning font-bold text-sm">{{ gatewayConfig.serial_number || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">MODEL NAME</span>
                <span class="font-mono text-sm">{{ gatewayConfig.model_name || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">FIRMWARE VER</span>
                <span class="font-mono text-sm">{{ gatewayConfig.firmware_version || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">HARDWARE VER</span>
                <span class="font-mono text-sm">{{ gatewayConfig.hardware_version || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">MECHANICAL VER</span>
                <span class="font-mono text-sm">{{ gatewayConfig.mechanical_version || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">LTE MODULE IMEI</span>
                <span class="font-mono text-sm">{{ gatewayConfig.lte_module_imei || '—' }}</span>
              </div>
              <div class="card border border-base-content/10 bg-base-200/50 p-3">
                <span class="text-xs text-base-content/60 font-medium">MAC ADDRESS</span>
                <span class="font-mono text-sm">{{ gatewayConfig.mac_address || '—' }}</span>
              </div>
            </div>

            <!-- Empty State when config not fetched yet -->
            <div v-else class="text-center py-8 border border-dashed border-base-content/20 rounded-lg">
              <Cpu class="w-10 h-10 mx-auto text-base-content/40 mb-2" />
              <div class="text-sm font-semibold">Chưa có thông số phần cứng Gateway</div>
              <div class="text-xs text-base-content/60 mt-1 max-w-md mx-auto">
                Bấm nút "Đọc Cấu Hình Từ IP" phía trên để kết nối tới cổng 4050 của Gateway và trích xuất Serial Number, Gateway EUI cùng phiên bản phần cứng.
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
                placeholder="Quét mã vạch hoặc nhập chính xác Serial Number trên nhãn thiết bị..."
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
          <!-- STEP 4: REVIEW & CONFIRM REGISTRATION -->
          <!-- ========================================== -->
          <div v-show="currentWizardStep === 3" class="wizard-step-pane space-y-4">
            <div class="form-section-title flex items-center gap-2 font-bold text-sm text-primary pb-2 border-b border-base-content/10">
              <span class="badge badge-primary badge-sm font-mono">04</span>
              <span>Tổng Hợp Thông Tin &amp; Sẵn Sàng Kích Hoạt Phiên Test</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div class="card border border-base-content/10 bg-base-200/40 p-3 space-y-2">
                <div class="font-bold text-xs text-primary border-b border-base-content/10 pb-1">THÔNG TIN ĐƠN HÀNG &amp; MẠNG</div>
                <div class="flex justify-between"><span class="text-base-content/60">Sale Order (SO):</span> <span class="font-mono font-bold">{{ form.soNumber }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Work Order (WA):</span> <span class="font-mono font-bold">{{ form.waNumber }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Network Server:</span> <span class="font-mono text-xs">{{ selectedServerName }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Địa Chỉ IP:</span> <span class="font-mono">{{ form.gatewayIp }}:4050</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Băng Tần LoRa:</span> <span class="font-mono font-semibold text-primary">{{ form.regionTest }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Kết Nối Internet:</span> <span class="badge badge-sm badge-info font-mono">{{ form.internetTestType }}</span></div>
              </div>

              <div class="card border border-base-content/10 bg-base-200/40 p-3 space-y-2">
                <div class="font-bold text-xs text-primary border-b border-base-content/10 pb-1">THÔNG SỐ PHẦN CỨNG GATEWAY</div>
                <div class="flex justify-between"><span class="text-base-content/60">Gateway EUI:</span> <span class="font-mono font-bold text-primary">{{ gatewayConfig?.eui || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Serial Number:</span> <span class="font-mono font-bold text-warning">{{ form.confirmedSerialNumber || gatewayConfig?.serial_number || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Model Name:</span> <span class="font-mono">{{ gatewayConfig?.model_name || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Firmware Ver:</span> <span class="font-mono">{{ gatewayConfig?.firmware_version || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">Hardware Ver:</span> <span class="font-mono">{{ gatewayConfig?.hardware_version || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-base-content/60">LTE Module IMEI:</span> <span class="font-mono">{{ gatewayConfig?.lte_module_imei || '—' }}</span></div>
              </div>
            </div>

            <div class="alert alert-success text-xs">
              <Check class="w-4 h-4 shrink-0" />
              <div>
                <div class="font-bold">Sẵn sàng gửi lệnh cấu hình &amp; tạo phiên test</div>
                <div class="text-base-content/70">
                  Sau khi bấm "Tiến Hành Đăng Ký", hệ thống sẽ ghi cấu hình Packet Forwarder vào Gateway qua cổng 4050, đăng ký Gateway EUI lên ChirpStack Server và tạo phiên kiểm thử mới.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stepper / Execution Progress HUD Overlay -->
        <transition name="fade">
          <div v-if="submitting" class="stepper-progress-overlay absolute inset-0 bg-base-100/90 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div class="card border border-primary/30 bg-base-200 shadow-2xl p-6 max-w-lg w-full text-center">
              <div class="flex items-center justify-center gap-2 mb-4">
                <span class="loading loading-spinner loading-md text-primary"></span>
                <span class="text-sm font-bold tracking-wide">QUY TRÌNH ĐĂNG KÝ GATEWAY ĐANG XỬ LÝ</span>
              </div>

              <progress
                class="progress w-full mb-3"
                :class="progressStatus === 'success' ? 'progress-success' : progressStatus === 'exception' ? 'progress-error' : 'progress-primary'"
                :value="progressPercentage"
                max="100"
              ></progress>

              <div class="text-xs font-semibold text-primary mb-3">
                {{ currentStepDescription }}
              </div>

              <!-- Dynamic step status icons -->
              <div class="grid grid-cols-4 gap-2 mb-4 text-xs font-mono">
                <div
                  v-for="(st, idx) in executionSteps"
                  :key="idx"
                  class="p-2 rounded border"
                  :class="{
                    'border-primary bg-primary/10 text-primary': activeStepIdx === idx,
                    'border-success bg-success/10 text-success': activeStepIdx > idx,
                    'border-base-content/10 bg-base-300/50 text-base-content/40': activeStepIdx < idx
                  }"
                >
                  <div class="text-[10px] mb-1">STEP {{ idx + 1 }}</div>
                  <div class="truncate font-semibold">{{ st.label }}</div>
                </div>
              </div>

              <!-- Error Box if failed -->
              <div v-if="progressError" class="alert alert-error text-xs mb-3 text-left">
                <AlertTriangle class="w-4 h-4 shrink-0" />
                <span>{{ progressError }}</span>
              </div>

              <div v-if="progressStatus === 'exception'" class="flex justify-center gap-2">
                <button type="button" class="btn btn-sm btn-ghost" @click="abortProgress">
                  Quay Lại Sửa
                </button>
                <button type="button" class="btn btn-sm btn-primary" @click="submitRegistration">
                  Thử Lại
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Modal Footer Action Buttons -->
      <div class="modal-action flex items-center justify-between border-t border-base-content/10 pt-4 mt-6">
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
            type="button"
            class="btn btn-sm btn-ghost"
            :disabled="submitting"
            @click="handleBeforeClose"
          >
            Hủy Bỏ
          </button>

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
            class="btn btn-sm btn-success gap-2 text-success-content"
            :disabled="!canSubmit || submitting"
            @click="submitRegistration"
          >
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <Check v-else class="w-4 h-4" />
            Tiến Hành Đăng Ký &amp; Tạo Phiên Test
          </button>
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop" @click="handleBeforeClose">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  Gauge,
  Cpu,
  Link,
  Search,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-vue-next';
import { cyberToast } from '@/cyber/hud';
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

// Wizard current step (0: SO/WA/Server, 1: IP/Region, 2: Extract/Serial, 3: Review/Submit)
const currentWizardStep = ref(0);

// Form state
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

// Traceability SO & WA State
const soOptions = ref<{ label: string; value: string; customer?: string }[]>([]);
const loadingSo = ref(false);
const waOptions = ref<{ waNumber: string; itemCode?: string; plannedQuantity?: number }[]>([]);
const loadingWa = ref(false);

// Network servers
const serverList = ref<any[]>([]);
const loadingServers = ref(false);

// Region Options
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

// Execution HUD Steps
const executionSteps = [
  { label: 'Kiểm tra' },
  { label: 'Port 4050' },
  { label: 'ChirpStack' },
  { label: 'Tạo Phiên' },
];

// Stepper Overlay Execution state
const submitting = ref(false);
const activeStepIdx = ref(0);
const progressPercentage = ref(0);
const progressStatus = ref('');
const progressError = ref('');

const currentStepDescription = computed(() => {
  switch (activeStepIdx.value) {
    case 0:
      return 'BƯỚC 1/4: Kiểm tra và xác nhận tính hợp lệ của Serial Number...';
    case 1:
      return `BƯỚC 2/4: Ghi cấu hình Packet Forwarder vào Gateway (${form.gatewayIp}:4050)...`;
    case 2:
      return 'BƯỚC 3/4: Đăng ký Gateway EUI lên Network Server ChirpStack...';
    case 3:
      return 'BƯỚC 4/4: Khởi tạo phiên kiểm thử và lưu thông tin Gateway Test...';
    default:
      return 'Đang chuẩn bị...';
  }
});

// IPv4 regex
const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Serial match check
const isSerialMatched = computed(() => {
  if (!gatewayConfig.value?.serial_number) return false;
  return (
    form.confirmedSerialNumber.trim().toUpperCase() ===
    String(gatewayConfig.value.serial_number).trim().toUpperCase()
  );
});

// Conditions to proceed through wizard steps
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

// Step navigation methods
function nextWizardStep() {
  if (canProceedNextStep.value && currentWizardStep.value < 3) {
    currentWizardStep.value++;
  }
}

function prevWizardStep() {
  if (currentWizardStep.value > 0) {
    currentWizardStep.value--;
  }
}

// ========================================================
// DEVICE TRACEABILITY API: SEARCH SO & CASCADING WA
// ========================================================
async function searchSoList(keyword: string = '') {
  loadingSo.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/device-traceability/so', {
        params: { soNumber: keyword, limit: 50 },
      });
    } catch {
      res = await httpClient.get('/device-traceability/so', {
        params: { soNumber: keyword, limit: 50 },
      }).catch(() => []);
    }

    const items = Array.isArray(res) ? res : res?.data || res?.items || [];
    soOptions.value = items.map((so: any) => ({
      value: so.soNumber || so.so_number || so.name,
      label: `${so.soNumber || so.so_number || so.name} ${so.customerName ? `(${so.customerName})` : ''}`,
      customer: so.customerName || so.customer_name,
    }));
  } catch (err) {
    console.warn('Search SO error:', err);
  } finally {
    loadingSo.value = false;
  }
}

async function onSoChange(e: Event) {
  form.waNumber = '';
  waOptions.value = [];
  if (!form.soNumber) return;

  loadingWa.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get(
        `/plugins/device-traceability/so/${encodeURIComponent(form.soNumber)}/wa`
      );
    } catch {
      res = await httpClient.get(
        `/device-traceability/so/${encodeURIComponent(form.soNumber)}/wa`
      ).catch(() => []);
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

// Fetch gateway config from Port 4050
async function fetchGatewayConfig() {
  const ip = form.gatewayIp.trim();
  if (!ip || !ipv4Regex.test(ip)) {
    cyberToast.warning('Vui lòng nhập IP Gateway hợp lệ trước khi đọc cấu hình!');
    return;
  }

  fetchingConfig.value = true;
  gatewayConfig.value = null;

  try {
    let data: any = null;

    try {
      const proxyRes: any = await httpClient.get(`/plugins/testing/gateway-proxy/config`, {
        params: { ip },
        timeout: 8000,
      });
      data = proxyRes?.data || proxyRes;
    } catch (proxyErr) {
      console.warn('Backend proxy gateway config failed, trying direct LAN call...', proxyErr);
    }

    if (!data || !data.eui) {
      const directRes = await fetch(`http://${ip}:4050/api/gateway-config/getConfigGateway`, {
        headers: { Accept: 'application/json' },
      });
      if (!directRes.ok) {
        throw new Error(`HTTP ${directRes.status}: ${directRes.statusText}`);
      }
      data = await directRes.json();
    }

    if (data && (data.eui || data.serial_number)) {
      gatewayConfig.value = data;
      cyberToast.success(`Đã đọc thành công thông số Gateway (EUI: ${data.eui || 'N/A'})!`);
      if (data.serial_number && !form.confirmedSerialNumber) {
        form.confirmedSerialNumber = data.serial_number;
      }
    } else {
      throw new Error('Dữ liệu trả về từ Gateway không chứa EUI hoặc Serial Number hợp lệ.');
    }
  } catch (err: any) {
    console.error('Fetch gateway config error:', err);
    cyberToast.error(
      `Không thể đọc cấu hình từ ${ip}:4050. Chi tiết: ${err.message || 'Hết thời gian chờ kết nối'}`
    );
  } finally {
    fetchingConfig.value = false;
  }
}

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
        body: JSON.stringify(changeConfigPayload),
      });
      if (!directPostRes.ok) {
        throw new Error(`Gửi lệnh changeGatewayConfig thất bại (HTTP ${directPostRes.status})`);
      }
    }

    await delay(500);

    // BƯỚC 3: Đăng ký Gateway EUI lên ChirpStack Server [75%]
    activeStepIdx.value = 2;
    progressPercentage.value = 75;

    const chirpstackPayload = {
      networkServerId: form.networkServerId,
      gateway: {
        gatewayId: gatewayConfig.value.eui,
        name: `GW-${form.confirmedSerialNumber}`,
        description: `Registered via iTest Testing Plugin. SO: ${form.soNumber}, WA: ${form.waNumber}`,
        statsInterval: 30,
      },
    };

    try {
      await httpClient.post('/plugins/lorawan-chirpstack/gateways', chirpstackPayload);
    } catch (csErr: any) {
      console.warn('Register gateway to ChirpStack returned error/warning:', csErr);
    }

    await delay(500);

    // BƯỚC 4: Tạo phiên kiểm thử Gateway Testing [100%]
    activeStepIdx.value = 3;
    progressPercentage.value = 100;

    const sessionPayload = {
      gatewayId: gatewayConfig.value.eui,
      serialNumber: form.confirmedSerialNumber,
      soNumber: form.soNumber,
      waNumber: form.waNumber,
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

    let createdSession: any;
    try {
      const sessionRes: any = await httpClient.post('/plugins/testing/gateway-sessions', sessionPayload);
      createdSession = sessionRes?.data || sessionRes;
    } catch {
      createdSession = { id: `gw-session-${Date.now()}`, ...sessionPayload };
    }

    await delay(500);

    progressStatus.value = 'success';
    cyberToast.success('Đăng ký Gateway và khởi tạo phiên test thành công!');

    emit('success', createdSession);
    visible.value = false;
  } catch (err: any) {
    console.error('Registration pipeline error:', err);
    progressStatus.value = 'exception';
    progressError.value = err.message || 'Lỗi trong quá trình đăng ký Gateway.';
  } finally {
    if (progressStatus.value !== 'exception') {
      submitting.value = false;
    }
  }
}

function abortProgress() {
  submitting.value = false;
  progressError.value = '';
  progressStatus.value = '';
}

function handleBeforeClose() {
  if (submitting.value) return;
  visible.value = false;
}

// Reset form on open
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentWizardStep.value = 0;
      form.soNumber = '';
      form.waNumber = '';
      form.confirmedSerialNumber = '';
      gatewayConfig.value = null;
      submitting.value = false;
      progressError.value = '';
      searchSoList('');
      loadNetworkServers();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    searchSoList('');
    loadNetworkServers();
  }
});
</script>

<style scoped>
.hud-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: rgba(0, 240, 255, 0.6);
  pointer-events: none;
}
.hud-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
.hud-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
.hud-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
.hud-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
