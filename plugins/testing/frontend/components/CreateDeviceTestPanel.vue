<template>
  <div class="create-device-test-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 md:p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold tracking-wide uppercase text-base-content">
              TẠO THIẾT BỊ TEST (CREATE DEVICE TESTING)
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            @click="resetAll"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Wizard Steps Indicator (Chỉ ghi STEP 1, STEP 2, STEP 3 theo chỉ đạo) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-3">
      <ul class="steps steps-horizontal w-full text-xs font-semibold">
        <li
          class="step cursor-pointer font-bold font-mono"
          :class="currentStep >= 1 ? 'step-primary' : ''"
          @click="goToStep(1)"
        >
          STEP 1
        </li>
        <li
          class="step cursor-pointer font-bold font-mono"
          :class="currentStep >= 2 ? 'step-primary' : ''"
          @click="goToStep(2)"
        >
          STEP 2
        </li>
        <li
          class="step cursor-pointer font-bold font-mono"
          :class="currentStep >= 3 ? 'step-primary' : ''"
          @click="goToStep(3)"
        >
          STEP 3
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 1: Chọn Connectivity, SO, WA, Network Server                         -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <FileText class="w-4 h-4" />
            <span>STEP 1</span>
          </div>
          <span class="badge badge-sm badge-info font-mono">BẮT BUỘC</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Connectivity (Chỉ hỗ trợ LoRaWAN) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Chuẩn Kết Nối (Connectivity) *</span>
            </label>
            <div class="join w-full">
              <input
                type="text"
                class="input input-bordered input-sm join-item flex-1 bg-base-300 font-bold text-primary text-xs"
                value="LoRaWAN"
                readonly
              />
              <span class="join-item btn btn-sm btn-neutral pointer-events-none text-xs font-mono">
                Chỉ hỗ trợ LoRaWAN
              </span>
            </div>
            <label class="label py-0.5">
              <span class="label-text-alt text-[11px] text-base-content/60">
                Theo yêu cầu hệ thống: Quy trình tạo thiết bị test chỉ hỗ trợ chuẩn LoRaWAN
              </span>
            </label>
          </div>

          <!-- Network Server -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Network Server (ChirpStack) *</span>
              <span class="label-text-alt text-xs font-mono text-success">
                <span v-if="loadingServers" class="loading loading-spinner loading-xs mr-1"></span>
                API Online
              </span>
            </label>
            <select
              v-model="step1.serverId"
              class="select select-bordered select-sm w-full text-xs font-mono"
              :disabled="loadingServers"
              @change="onNetworkServerChange"
            >
              <option v-for="ns in networkServers" :key="ns.id" :value="ns.id">
                {{ ns.name }} ({{ ns.apiUrl }})
              </option>
            </select>
            <label class="label py-0.5">
              <span class="label-text-alt text-[11px] text-base-content/60 font-mono">
                URL: {{ step1.serverUrl }}
              </span>
            </label>
            <div v-if="step1.applicationId || step1.deviceProfileId" class="mt-1.5 p-2 bg-base-200/60 rounded-lg border border-base-300 text-xs space-y-1 font-mono">
              <div class="flex items-center justify-between text-base-content/80">
                <span class="text-base-content/60">Application ID:</span>
                <span class="badge badge-sm badge-primary/15 text-primary font-bold">{{ step1.applicationId || '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-base-content/80">
                <span class="text-base-content/60">Device Profile:</span>
                <span class="badge badge-sm badge-secondary/15 text-secondary font-bold">{{ step1.deviceProfileId || '—' }}</span>
              </div>
              <div v-if="step1.tenantId" class="flex items-center justify-between text-base-content/80">
                <span class="text-base-content/60">Tenant ID:</span>
                <span class="badge badge-sm badge-ghost text-base-content/70">{{ step1.tenantId }}</span>
              </div>
            </div>
          </div>

          <!-- Chọn SO (Sales Order) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Đơn Hàng Sản Xuất (SO Number) *</span>
              <span class="label-text-alt text-xs text-base-content/60">Từ Device Traceability</span>
            </label>
            <div class="relative">
              <select
                v-model="step1.soNumber"
                class="select select-bordered select-sm w-full text-xs font-mono"
                :disabled="loadingSos"
                @change="onSoChange"
              >
                <option value="">-- Chọn Sales Order (SO) --</option>
                <option v-for="so in salesOrders" :key="so.id || so.soNumber" :value="so.soNumber">
                  {{ so.soNumber }} {{ so.customerName ? `- ${so.customerName}` : '' }}
                </option>
              </select>
            </div>
          </div>

          <!-- Chọn WA (Work Assignment) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Lệnh Làm Việc (WA Number) *</span>
              <span class="label-text-alt text-xs text-base-content/60">Theo SO đã chọn</span>
            </label>
            <select
              v-model="step1.waNumber"
              class="select select-bordered select-sm w-full text-xs font-mono"
              :disabled="loadingWas || !step1.soNumber"
              @change="onWaChange"
            >
              <option value="">-- Chọn Work Order (WA) --</option>
              <option v-for="wa in workAssignments" :key="wa.id || wa.waNumber" :value="wa.waNumber">
                {{ wa.waNumber }} {{ wa.itemCode ? `(${wa.itemCode})` : '' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Traceability Summary Preview -->
        <div v-if="step1.soNumber && step1.waNumber" class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
          <div class="font-bold text-primary flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4" />
            <span>Đã liên kết Traceability thành công:</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-base-content/80 mt-1">
            <div>SO: <span class="font-bold text-white">{{ step1.soNumber }}</span></div>
            <div>WA: <span class="font-bold text-white">{{ step1.waNumber }}</span></div>
            <div>Item Code: <span class="font-bold text-white">{{ step1.itemCode || 'Theo Sensor' }}</span></div>
            <div>Network Server: <span class="font-bold text-white">ChirpStack</span></div>
          </div>
        </div>

        <!-- Next Action -->
        <div class="flex justify-end pt-2">
          <button
            type="button"
            class="btn btn-sm btn-primary gap-2"
            :disabled="!step1.soNumber || !step1.waNumber"
            @click="nextToStep2"
          >
            <span>Tiếp Tục: STEP 2</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 2: Serial Tool Đọc Nhanh Thanh Ghi 0..259 theo ATH_TEMPLATE.csv       -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 2" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <Cable class="w-4 h-4" />
            <span>STEP 2</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="badge badge-sm font-mono font-bold"
              :class="serialConnected ? 'badge-success text-success-content' : 'badge-neutral'"
            >
              {{ serialConnected ? 'CONNECTED' : 'DISCONNECTED' }}
            </span>
          </div>
        </div>

        <!-- Serial Controls Toolbar (Flow chuẩn Final Config Tool: Chọn cổng tự động kết nối -> Chờ bấm START) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-base-100 p-4 rounded-lg border border-base-content/10">
          <!-- Chọn cổng COM: Bấm chọn là tự động kết nối ngay -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Cổng Kết Nối (COM Port)</span>
            </label>
            <div class="flex gap-2">
              <button
                v-if="!serialConnected"
                type="button"
                class="btn btn-sm btn-outline btn-primary flex-1 gap-1.5 font-bold"
                @click="selectAndConnectPort"
              >
                <Cable class="w-4 h-4" />
                <span>{{ selectedPortName || 'Chọn Cổng COM' }}</span>
              </button>
              <div v-else class="join w-full">
                <span class="join-item btn btn-sm btn-success no-animation flex-1 text-xs font-mono text-success-content pointer-events-none">
                  ✓ {{ selectedPortName || 'Cổng COM (Đã kết nối)' }}
                </span>
                <button
                  type="button"
                  class="join-item btn btn-sm btn-error text-error-content px-2"
                  title="Ngắt kết nối cổng"
                  @click="disconnectSerialPort"
                >
                  <PowerOff class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Baudrate -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Baudrate</span>
            </label>
            <select
              v-model.number="serialBaudRate"
              class="select select-bordered select-sm w-full font-mono text-xs"
              :disabled="serialConnected"
            >
              <option :value="9600">9600 (Mặc định cảm biến)</option>
              <option :value="19200">19200</option>
              <option :value="115200">115200</option>
            </select>
          </div>

          <!-- Nút START ĐỌC THANH GHI -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Thao Tác Đọc</span>
            </label>
            <button
              type="button"
              class="btn btn-sm btn-primary w-full gap-2 font-bold shadow-md"
              :class="{ 'btn-disabled': !serialConnected || readingRegisters }"
              :disabled="!serialConnected || readingRegisters"
              @click="startFastRead0To259"
            >
              <span v-if="readingRegisters" class="loading loading-spinner loading-xs"></span>
              <Play v-else class="w-4 h-4 fill-current" />
              <span>START ĐỌC</span>
            </button>
          </div>
        </div>

        <!-- Reading Progress Indicator -->
        <div v-if="readingRegisters || readCompleted" class="space-y-1 bg-base-100 p-3 rounded-lg border border-base-content/10">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="font-bold flex items-center gap-1.5">
              <span v-if="readingRegisters" class="loading loading-spinner loading-xs text-primary"></span>
              <CheckCircle2 v-else class="w-3.5 h-3.5 text-success" />
              <span>{{ readingStatusText }}</span>
            </span>
            <span class="font-bold text-primary">{{ readProgress }}%</span>
          </div>
          <progress
            class="progress progress-primary w-full h-2"
            :value="readProgress"
            max="100"
          ></progress>
        </div>

        <!-- 12 Extracted Register Parameters Table (ATH_TEMPLATE.csv) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-base-content flex items-center gap-2">
              <Table class="w-4 h-4 text-primary" />
              <span>DỮ LIỆU THANH GHI THIẾT BỊ (THEO ATH_TEMPLATE.CSV)</span>
            </h3>
            <span class="badge badge-xs badge-neutral font-mono">12 THAM SỐ CHUẨN</span>
          </div>

          <div class="overflow-x-auto rounded-lg border border-base-content/10 bg-base-100">
            <table class="table table-xs w-full font-mono">
              <thead class="bg-base-200/60 text-[11px] text-base-content/70">
                <tr>
                  <th class="w-8">#</th>
                  <th>Tên Tham Số</th>
                  <th>Thanh Ghi Dec</th>
                  <th>Số Regs</th>
                  <th>Định Dạng</th>
                  <th>Giá Trị Đọc Được</th>
                  <th class="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in extractedRegisters"
                  :key="row.key"
                  class="hover:bg-base-200/40 transition-colors"
                >
                  <td class="text-base-content/40">{{ idx + 1 }}</td>
                  <td class="font-semibold text-white">{{ row.label }}</td>
                  <td class="text-primary font-bold">Dec {{ row.regDec }}</td>
                  <td>{{ row.numRegs }}</td>
                  <td><span class="badge badge-xs badge-ghost">{{ row.format }}</span></td>
                  <td class="font-bold" :class="row.value ? 'text-success' : 'text-base-content/40'">
                    {{ row.value || 'Chưa đọc' }}
                  </td>
                  <td class="text-center">
                    <span
                      class="badge badge-xs font-bold"
                      :class="row.value ? 'badge-success text-success-content' : 'badge-ghost'"
                    >
                      {{ row.value ? 'OK' : 'PENDING' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            @click="currentStep = 1"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Quay Lại STEP 1</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-2"
            :disabled="!hasRequiredRegisters"
            @click="nextToStep3"
          >
            <span>Tiếp Tục: STEP 3</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 3: Tự Động Đăng Ký Lên ChirpStack (2 Lần) & Thông Báo Gắn Pin        -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 3" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <Radio class="w-4 h-4" />
            <span>STEP 3</span>
          </div>
        </div>

        <!-- Status Result Alert -->
        <div
          v-if="step3Result.status === 'SUCCESS'"
          class="alert alert-success shadow-lg border border-success/30 text-success-content p-4"
        >
          <div class="flex items-start gap-3 w-full">
            <BatteryCharging class="w-8 h-8 flex-shrink-0 animate-bounce" />
            <div class="flex-1">
              <h3 class="font-black text-base uppercase tracking-wide">
                ĐĂNG KÝ THÀNH CÔNG VUI LÒNG GẮN PIN CẢM BIẾN
              </h3>
              <p class="text-xs opacity-90 mt-1">
                Thiết bị <strong class="underline">{{ registerData.SERIAL_NUMBER || registerData.deviceEUI }}</strong> đã được khởi tạo thành công trên ChirpStack với Device Profile và OTAA Keys. Hãy lắp pin vào thiết bị để cảm biến tiến hành JOIN mạng LoRaWAN!
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="step3Result.status === 'ERROR'"
          class="alert alert-error shadow-lg border border-error/30 text-error-content p-4"
        >
          <div class="flex items-start gap-3 w-full">
            <AlertCircle class="w-8 h-8 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-bold text-base uppercase">ĐĂNG KÝ THIẾT BỊ THẤT BẠI TRÊN HỆ THỐNG</h3>
              <p class="text-xs opacity-90 mt-1 font-mono">
                {{ step3Result.message || 'Lỗi kết nối tới Network Server API hoặc xung đột DevEUI.' }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="step3Result.status === 'PROCESSING'"
          class="alert alert-info shadow-lg border border-info/30 text-info-content p-4"
        >
          <div class="flex items-center gap-3">
            <span class="loading loading-spinner loading-md"></span>
            <div>
              <h3 class="font-bold text-sm uppercase">ĐANG TỰ ĐỘNG THỰC THI 2 BƯỚC ĐĂNG KÝ CHIRPSTACK...</h3>
              <p class="text-xs opacity-90 font-mono mt-0.5">
                1. POST /api/devices (Tạo Device) &rarr; 2. POST /api/devices/{devEui}/keys (Cài đặt OTAA Keys)
              </p>
            </div>
          </div>
        </div>

        <!-- Device & ChirpStack Payload Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Device Info Summary -->
          <div class="bg-base-100 p-4 rounded-lg border border-base-content/10 space-y-2 text-xs">
            <div class="font-bold text-primary border-b border-base-content/10 pb-1.5 flex items-center justify-between">
              <span>Thông Tin Thiết Bị Đăng Ký (DUT)</span>
              <span class="badge badge-xs badge-neutral font-mono">Decoded Hardware</span>
            </div>
            <div class="grid grid-cols-2 gap-2 font-mono text-[11px] text-base-content/80">
              <div>DevEUI: <strong class="text-white">{{ registerData.deviceEUI }}</strong></div>
              <div>AppEUI (JoinEUI): <strong class="text-white">{{ registerData['LRW appEUI'] }}</strong></div>
              <div>Serial Number: <strong class="text-white">{{ registerData.SERIAL_NUMBER }}</strong></div>
              <div>Item Code: <strong class="text-white">{{ registerData.ITEM_CODE || step1.itemCode }}</strong></div>
              <div>FW Code: <strong class="text-white">{{ registerData.FW_CODE }}</strong></div>
              <div>FW Version: <strong class="text-white">{{ registerData.FW_VERSION }}</strong></div>
              <div>HW Version: <strong class="text-white">{{ registerData.HW_VERSION }}</strong></div>
              <div>Class / Region: <strong class="text-white">{{ registerData.class }} / {{ registerData['region code'] }}</strong></div>
              <div v-if="matchedDeviceProfile" class="text-primary font-mono text-[11px] col-span-2">
                ChirpStack Profile: <strong>{{ matchedDeviceProfile.name }}</strong> (ID: {{ matchedDeviceProfile.id }})
              </div>
            </div>
          </div>

          <!-- ChirpStack JSON Payload Preview -->
          <div class="bg-base-100 p-4 rounded-lg border border-base-content/10 space-y-2 text-xs">
            <div class="font-bold text-info border-b border-base-content/10 pb-1.5 flex items-center justify-between">
              <span>Payload ChirpStack 2 Bước</span>
              <span class="badge badge-xs badge-info font-mono">JSON SPEC</span>
            </div>
            <pre class="bg-base-300 p-2.5 rounded font-mono text-[10px] text-success overflow-x-auto max-h-48 leading-tight">{{ JSON.stringify(computedChirpstackPayload, null, 2) }}</pre>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            @click="currentStep = 2"
            :disabled="step3Result.status === 'PROCESSING'"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Quay Lại STEP 2</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              v-if="step3Result.status === 'ERROR'"
              type="button"
              class="btn btn-sm btn-warning gap-1.5"
              @click="executeChirpstackRegistration"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Thử Đăng Ký Lại</span>
            </button>

            <button
              v-if="step3Result.status === 'SUCCESS'"
              type="button"
              class="btn btn-sm btn-primary gap-1.5"
              @click="finishAndReset"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tạo Thiết Bị Tiếp Theo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Cpu,
  RotateCcw,
  FileText,
  Cable,
  Power,
  PowerOff,
  Zap,
  Table,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Radio,
  BatteryCharging,
  AlertCircle,
  Plus,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

// Flow Step State (1, 2, 3)
const currentStep = ref(1);

// ============================================================================
// BƯỚC 1: SO, WA, Network Server
// ============================================================================
const loadingSos = ref(false);
const loadingWas = ref(false);
const salesOrders = ref<any[]>([]);
const workAssignments = ref<any[]>([]);

const loadingServers = ref(false);
const networkServers = ref<any[]>([]);

const step1 = reactive({
  connectivity: 'LoRaWAN',
  serverId: '',
  serverUrl: '',
  apiToken: '',
  tenantId: '',
  applicationId: '',
  deviceProfileId: '',
  soNumber: '',
  waNumber: '',
  itemCode: '',
});

const loadingProfiles = ref(false);
const availableDeviceProfiles = ref<any[]>([]);
const matchedDeviceProfile = ref<any>(null);

function onNetworkServerChange() {
  const ns = networkServers.value.find((s) => s.id === step1.serverId);
  if (ns) {
    step1.serverUrl = ns.apiUrl || ns.api_url || '';
    step1.apiToken = ns.apiToken || ns.api_token || '';
    step1.tenantId = ns.tenantId || ns.tenant_id || '';
    step1.applicationId = ns.applicationId || ns.application_id || '';
    step1.deviceProfileId = ns.deviceProfileId || ns.device_profile_id || '';
  }
  loadDeviceProfiles();
}

async function loadDeviceProfiles() {
  if (!step1.serverId) return;
  loadingProfiles.value = true;
  try {
    const res: any = await httpClient.get('/plugins/lorawan-chirpstack/device-profiles', {
      params: {
        serverId: step1.serverId,
        tenantId: step1.tenantId,
      },
    });
    const data = res?.data || res;
    const list = Array.isArray(data) ? data : (Array.isArray(data?.result) ? data.result : (data?.deviceProfiles || []));
    availableDeviceProfiles.value = list;
    matchDeviceProfileByRegion();
  } catch (err) {
    console.warn('Failed to load device profiles for ChirpStack:', err);
    availableDeviceProfiles.value = [];
  } finally {
    loadingProfiles.value = false;
  }
}

function matchDeviceProfileByRegion(): any {
  const rawRegion = (registerData['region code'] || '').trim().toUpperCase();
  const rawClass = (registerData.class || 'A').trim().toUpperCase();
  if (availableDeviceProfiles.value.length === 0) {
    matchedDeviceProfile.value = null;
    return null;
  }

  // 1. Try finding profile matching region from register 69 (e.g. EU868, AS923)
  let found = availableDeviceProfiles.value.find((p: any) => {
    const pRegion = (p.region || '').trim().toUpperCase();
    const pName = (p.name || '').trim().toUpperCase();
    if (rawRegion) {
      if (pRegion === rawRegion || rawRegion.startsWith(pRegion) || pRegion.startsWith(rawRegion)) return true;
      if (pName.includes(rawRegion)) return true;
    }
    return false;
  });

  // 2. Fallback to first profile if not matched
  if (!found && availableDeviceProfiles.value.length > 0) {
    found = availableDeviceProfiles.value[0];
  }

  matchedDeviceProfile.value = found;
  if (found?.id) {
    step1.deviceProfileId = found.id;
  }
  return found;
}

async function loadNetworkServers() {
  loadingServers.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/testing/network-servers');
    } catch {
      try {
        res = await httpClient.get('/plugins/lorawan-chirpstack/servers');
      } catch {
        res = await httpClient.get('/lorawan-chirpstack/servers').catch(() => []);
      }
    }
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    if (list.length > 0) {
      networkServers.value = list.map((ns: any) => ({
        id: ns.id,
        name: ns.name,
        apiUrl: ns.apiUrl || ns.api_url || '',
        apiToken: ns.apiToken || ns.api_token || '',
        tenantId: ns.tenantId || ns.tenant_id || '',
        applicationId: ns.applicationId || ns.application_id || '',
        deviceProfileId: ns.deviceProfileId || ns.device_profile_id || '',
      }));
      if (!step1.serverId || !networkServers.value.some((s) => s.id === step1.serverId)) {
        step1.serverId = networkServers.value[0].id;
        onNetworkServerChange();
      }
    } else {
      networkServers.value = [
        {
          id: 'srv-globiots-test',
          name: 'Globiots ChirpStack Test Network Server',
          apiUrl: 'https://chirpstack-test-api.globiots.com',
          apiToken: '',
          tenantId: '52f14fb4-c5a1-4566-9b57-69502b78a9c1',
          applicationId: 'app-iot-monitoring',
          deviceProfileId: 'dp-as923-otaa',
        },
      ];
      step1.serverId = 'srv-globiots-test';
      onNetworkServerChange();
    }
  } catch (err) {
    console.warn('Failed to load network servers for testing:', err);
  } finally {
    loadingServers.value = false;
  }
}

async function loadSalesOrders() {
  loadingSos.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/so');
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    salesOrders.value = items;
  } catch {
    salesOrders.value = [];
  } finally {
    loadingSos.value = false;
  }
}

async function onSoChange() {
  step1.waNumber = '';
  if (!step1.soNumber) {
    workAssignments.value = [];
    return;
  }
  loadingWas.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/wa', {
      params: { soNumber: step1.soNumber },
    });
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    workAssignments.value = items;
    if (items.length > 0) {
      step1.waNumber = items[0].waNumber || items[0].wa_number || '';
      step1.itemCode = items[0].itemCode || items[0].item_code || '';
    }
  } catch {
    workAssignments.value = [];
  } finally {
    loadingWas.value = false;
  }
}

function onWaChange() {
  const wa = workAssignments.value.find((w) => w.waNumber === step1.waNumber);
  if (wa && wa.itemCode) {
    step1.itemCode = wa.itemCode;
  }
}

function nextToStep2() {
  if (!step1.soNumber || !step1.waNumber) {
    cyberToast.warning('Vui lòng chọn Sales Order (SO) và Work Order (WA)!');
    return;
  }
  currentStep.value = 2;
}

// ============================================================================
// BƯỚC 2: Serial Tool & Fast Read (0..259 theo ATH_TEMPLATE.csv)
// ============================================================================
const serialConnected = ref(false);
const serialBaudRate = ref(9600);
const selectedPortName = ref('');
const readingRegisters = ref(false);
const readProgress = ref(0);
const readingStatusText = ref('Sẵn sàng');
const readCompleted = ref(false);
let activeSerialPort: any = null;

// Extracted 12 Register fields
const registerData = reactive<Record<string, string>>({
  FW_CODE: '',
  FW_VERSION: '',
  HW_VERSION: '',
  ME_VERSION: '',
  deviceEUI: '',
  'LRW appEUI': '',
  'LRW appKey': '',
  'region code': '',
  class: '',
  'sensor type': '',
  SERIAL_NUMBER: '',
  ITEM_CODE: '',
});

const extractedRegisters = computed(() => [
  { key: 'FW_CODE', label: 'FW_CODE', regDec: 0, numRegs: 5, format: 'string', value: registerData.FW_CODE },
  { key: 'FW_VERSION', label: 'FW_VERSION', regDec: 5, numRegs: 4, format: 'string', value: registerData.FW_VERSION },
  { key: 'HW_VERSION', label: 'HW_VERSION', regDec: 9, numRegs: 2, format: 'string', value: registerData.HW_VERSION },
  { key: 'ME_VERSION', label: 'ME_VERSION', regDec: 15, numRegs: 2, format: 'string', value: registerData.ME_VERSION },
  { key: 'deviceEUI', label: 'deviceEUI', regDec: 27, numRegs: 4, format: 'hex (64-bit)', value: registerData.deviceEUI },
  { key: 'LRW appEUI', label: 'LRW appEUI (joinEui)', regDec: 31, numRegs: 4, format: 'hex (64-bit)', value: registerData['LRW appEUI'] },
  { key: 'LRW appKey', label: 'LRW appKey', regDec: 35, numRegs: 8, format: 'hex (128-bit)', value: registerData['LRW appKey'] },
  { key: 'region code', label: 'region code', regDec: 69, numRegs: 3, format: 'string', value: registerData['region code'] },
  { key: 'class', label: 'class', regDec: 85, numRegs: 1, format: 'string', value: registerData.class },
  { key: 'sensor type', label: 'sensor type', regDec: 103, numRegs: 1, format: 'uint16', value: registerData['sensor type'] },
  { key: 'SERIAL_NUMBER', label: 'SERIAL_NUMBER', regDec: 259, numRegs: 9, format: 'string', value: registerData.SERIAL_NUMBER },
  { key: 'ITEM_CODE', label: 'ITEM_CODE', regDec: 386, numRegs: 14, format: 'string', value: registerData.ITEM_CODE },
]);

const hasRequiredRegisters = computed(() => {
  return (
    !!registerData.deviceEUI &&
    !!registerData['LRW appEUI'] &&
    !!registerData['LRW appKey'] &&
    !!registerData.SERIAL_NUMBER
  );
});

// CRC-16 Modbus
function calcModbusCRC16(buf: Uint8Array | number[]): number {
  let crc = 0xffff;
  for (let pos = 0; pos < buf.length; pos++) {
    crc ^= buf[pos];
    for (let i = 8; i !== 0; i--) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc;
}

function bytesToString(bytes: number[]): string {
  return String.fromCharCode(...bytes.filter((b) => b >= 32 && b <= 126)).trim();
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function selectAndConnectPort() {
  if (!('serial' in navigator)) {
    cyberToast.warning('Trình duyệt không hỗ trợ Web Serial API. Vui lòng dùng Chrome hoặc Edge!');
    return;
  }
  try {
    const port = await (navigator as any).serial.requestPort();
    if (!port) return;
    activeSerialPort = port;
    const info = port.getInfo ? port.getInfo() : {};
    let desc = 'COM Port (USB)';
    if (info.usbVendorId) {
      desc = `USB (VID: 0x${info.usbVendorId.toString(16).toUpperCase()} PID: 0x${(info.usbProductId || 0).toString(16).toUpperCase()})`;
    }
    selectedPortName.value = desc;

    // Tự động kết nối ngay theo đúng flow của Final Config Tool
    await openActivePort();
  } catch (err: any) {
    if (err.name !== 'NotFoundError') {
      cyberToast.error(`Lỗi chọn cổng: ${err.message}`);
    }
  }
}

async function openActivePort() {
  if (!activeSerialPort) return;
  try {
    await activeSerialPort.open({
      baudRate: Number(serialBaudRate.value) || 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 255,
    });
    if (activeSerialPort.setSignals) {
      try {
        await activeSerialPort.setSignals({
          dataTerminalReady: true,
          requestToSend: true,
        });
      } catch (e) {}
    }
    serialConnected.value = true;
    cyberToast.success(`Đã kết nối ${selectedPortName.value || 'cổng COM'} @ ${serialBaudRate.value} bps. Hãy nhấn START để đọc.`);
  } catch (err: any) {
    serialConnected.value = false;
    cyberToast.error(`Không thể kết nối cổng: ${err.message}`);
  }
}

async function disconnectSerialPort() {
  if (activeSerialPort) {
    try {
      await activeSerialPort.close();
    } catch {}
    activeSerialPort = null;
  }
  serialConnected.value = false;
  selectedPortName.value = '';
  cyberToast.info('Đã ngắt kết nối cổng Serial');
}

// Flush UART RX buffer to drain any stray bytes
async function flushUartRxBuffer(flushTimeoutMs = 100) {
  if (!activeSerialPort || !activeSerialPort.readable) return;
  try {
    if (activeSerialPort.setSignals) {
      try {
        await activeSerialPort.setSignals({ requestToSend: false, dataTerminalReady: false });
        await new Promise((r) => setTimeout(r, 5));
        await activeSerialPort.setSignals({ requestToSend: true, dataTerminalReady: true });
      } catch (e) {}
    }
    const reader = activeSerialPort.readable.getReader();
    const startTime = Date.now();
    try {
      while (Date.now() - startTime < flushTimeoutMs) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 25));
        try {
          const res = (await Promise.race([reader.read(), timeoutPromise])) as any;
          if (res?.done) break;
        } catch {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (e) {}
  await new Promise((r) => setTimeout(r, 25));
}

// Low-level Modbus FC 03 read with CRC validation
async function readModbusRaw(
  slave: number,
  fc: number,
  startReg: number,
  numRegs: number,
  timeoutMs = 1200
): Promise<number[]> {
  if (!activeSerialPort || !activeSerialPort.readable || !activeSerialPort.writable) {
    throw new Error('Cổng Serial không khả dụng');
  }

  await flushUartRxBuffer(30);

  const frame = [
    slave & 0xff,
    fc & 0xff,
    (startReg >> 8) & 0xff,
    startReg & 0xff,
    (numRegs >> 8) & 0xff,
    numRegs & 0xff,
  ];
  const crc = calcModbusCRC16(frame);
  frame.push(crc & 0xff, (crc >> 8) & 0xff);

  const writer = activeSerialPort.writable.getWriter();
  try {
    await writer.write(new Uint8Array(frame));
  } finally {
    try { writer.releaseLock(); } catch {}
  }

  const reader = activeSerialPort.readable.getReader();
  const expectedBytes = 3 + numRegs * 2 + 2;
  const rxBuffer: number[] = [];
  const startTime = Date.now();

  try {
    while (rxBuffer.length < expectedBytes && Date.now() - startTime < timeoutMs) {
      const remaining = Math.max(10, timeoutMs - (Date.now() - startTime));
      let timeoutId: any;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), remaining);
      });
      let res: any;
      try {
        res = await Promise.race([reader.read(), timeoutPromise]);
      } finally {
        clearTimeout(timeoutId);
      }
      if (res.done) break;
      if (res.value) {
        rxBuffer.push(...(Array.from(res.value) as number[]));
      }
    }
  } finally {
    try { await reader.cancel(); } catch {}
    try { reader.releaseLock(); } catch {}
  }

  if (rxBuffer.length < 5) {
    throw new Error(`Không có phản hồi từ thiết bị cho thanh ghi ${startReg}`);
  }

  // Find valid Modbus frame header in rxBuffer to strip RS485 line noise bytes
  let validFrame: number[] | null = null;
  const expectedDataLen = numRegs * 2;

  for (let i = 0; i <= rxBuffer.length - expectedBytes; i++) {
    const s = rxBuffer[i];
    const f = rxBuffer[i + 1];
    const b = rxBuffer[i + 2];
    if ((s === slave || s === 0 || s === 1) && f === (fc & 0xff) && b === expectedDataLen) {
      const candidate = rxBuffer.slice(i, i + expectedBytes);
      const calcCrc = calcModbusCRC16(candidate.slice(0, candidate.length - 2));
      const rxCrc = candidate[candidate.length - 2] | (candidate[candidate.length - 1] << 8);
      if (calcCrc === rxCrc) {
        validFrame = candidate;
        break;
      }
    }
  }

  if (!validFrame) {
    // Direct CRC verification on buffer if alignment matches
    if (rxBuffer.length >= expectedBytes) {
      const candidate = rxBuffer.slice(0, expectedBytes);
      const calcCrc = calcModbusCRC16(candidate.slice(0, candidate.length - 2));
      const rxCrc = candidate[candidate.length - 2] | (candidate[candidate.length - 1] << 8);
      if (calcCrc === rxCrc) {
        validFrame = candidate;
      }
    }
  }

  if (!validFrame) {
    throw new Error(`Dữ liệu nhận được không khớp hoặc sai CRC tại thanh ghi ${startReg}`);
  }

  const byteCount = validFrame[2];
  return validFrame.slice(3, 3 + byteCount);
}

// Fast Chunk Read 0..259 & 386 (Safe chunking & Dual Slave 0/1 wake-up probe)
async function startFastRead0To259() {
  if (!serialConnected.value || !activeSerialPort) {
    cyberToast.warning('Vui lòng chọn cổng Serial trước khi đọc!');
    return;
  }

  readingRegisters.value = true;
  readProgress.value = 0;
  readingStatusText.value = 'Đang kích hoạt / đánh thức cảm biến (MCU Wake-up probe)...';

  try {
    // Giai đoạn 0: MCU Wake-up probe (thử cả Slave 0 theo ATH_TEMPLATE.csv và Slave 1 tiêu chuẩn)
    let mcuAwake = false;
    let activeSlave = 0; // Ưu tiên Slave 0 theo ATH_TEMPLATE.csv

    for (let attempt = 1; attempt <= 6; attempt++) {
      // Thử xen kẽ Slave 0 và Slave 1
      const slaveToTry = attempt % 2 === 1 ? 0 : 1;
      try {
        readingStatusText.value = `Đang đánh thức cảm biến (Slave ${slaveToTry}, Lần thử ${attempt}/6)...`;
        const testBytes = await readModbusRaw(slaveToTry, 3, 0, 5, 800);
        if (testBytes && testBytes.length >= 10) {
          mcuAwake = true;
          activeSlave = slaveToTry;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!mcuAwake) {
      // Thử đọc với slave 1 lần cuối trước khi báo lỗi
      try {
        const testBytes = await readModbusRaw(1, 3, 0, 5, 1000);
        if (testBytes && testBytes.length >= 10) {
          mcuAwake = true;
          activeSlave = 1;
        }
      } catch {}
    }

    if (!mcuAwake) {
      throw new Error('Cảm biến không phản hồi sau 6 lần thử. Vui lòng kiểm tra cáp UART/RS485, baudrate (9600/115200) và nguồn cấp cảm biến.');
    }

    const rawMemory = new Map<number, [number, number]>();

    // Giai đoạn 1: Đọc nhanh theo khối an toàn (< 45 regs/khối) với activeSlave đã phát hiện
    readingStatusText.value = `Đang đọc Khối 1: Cấu hình Hardware & Keys (Slave ${activeSlave}, Reg 0..42)...`;
    readProgress.value = 20;
    try {
      const b1 = await readModbusRaw(activeSlave, 3, 0, 43, 1200);
      for (let i = 0; i < 43; i++) {
        rawMemory.set(i, [b1[i * 2], b1[i * 2 + 1]]);
      }
    } catch {
      // Fallback đọc từng dải thanh ghi nếu khối 43 regs bị từ chối
      const bFwCode = await readModbusRaw(activeSlave, 3, 0, 5, 1000);
      for (let i = 0; i < 5; i++) rawMemory.set(i, [bFwCode[i * 2], bFwCode[i * 2 + 1]]);
      const bFwVer = await readModbusRaw(activeSlave, 3, 5, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(5 + i, [bFwVer[i * 2], bFwVer[i * 2 + 1]]);
      const bHwVer = await readModbusRaw(activeSlave, 3, 9, 2, 1000);
      for (let i = 0; i < 2; i++) rawMemory.set(9 + i, [bHwVer[i * 2], bHwVer[i * 2 + 1]]);
      const bMeVer = await readModbusRaw(activeSlave, 3, 15, 2, 1000);
      for (let i = 0; i < 2; i++) rawMemory.set(15 + i, [bMeVer[i * 2], bMeVer[i * 2 + 1]]);
      const bDevEui = await readModbusRaw(activeSlave, 3, 27, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(27 + i, [bDevEui[i * 2], bDevEui[i * 2 + 1]]);
      const bAppEui = await readModbusRaw(activeSlave, 3, 31, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(31 + i, [bAppEui[i * 2], bAppEui[i * 2 + 1]]);
      const bAppKey = await readModbusRaw(activeSlave, 3, 35, 8, 1000);
      for (let i = 0; i < 8; i++) rawMemory.set(35 + i, [bAppKey[i * 2], bAppKey[i * 2 + 1]]);
    }

    // Khối 2: Reg 69..85 (17 regs = 34 bytes response -> lấy region code, class)
    readingStatusText.value = `Đang đọc Khối 2: LoRaWAN Region & Class (Slave ${activeSlave}, Reg 69..85)...`;
    readProgress.value = 45;
    try {
      const b2 = await readModbusRaw(activeSlave, 3, 69, 17, 1200);
      for (let i = 0; i < 17; i++) {
        rawMemory.set(69 + i, [b2[i * 2], b2[i * 2 + 1]]);
      }
    } catch {
      const bReg = await readModbusRaw(activeSlave, 3, 69, 3, 1000);
      for (let i = 0; i < 3; i++) rawMemory.set(69 + i, [bReg[i * 2], bReg[i * 2 + 1]]);
      const bCls = await readModbusRaw(activeSlave, 3, 85, 1, 1000);
      rawMemory.set(85, [bCls[0], bCls[1]]);
    }

    // Khối 3: Reg 103 (1 reg -> sensor type)
    readingStatusText.value = `Đang đọc Khối 3: Sensor Type (Slave ${activeSlave}, Reg 103)...`;
    readProgress.value = 65;
    try {
      const b3 = await readModbusRaw(activeSlave, 3, 103, 1, 1000);
      rawMemory.set(103, [b3[0], b3[1]]);
    } catch {}

    // Khối 4: Reg 259..267 (9 regs = 18 bytes -> SERIAL_NUMBER)
    readingStatusText.value = `Đang đọc Khối 4: Serial Number (Slave ${activeSlave}, Reg 259)...`;
    readProgress.value = 85;
    try {
      const b4 = await readModbusRaw(activeSlave, 3, 259, 9, 1000);
      for (let i = 0; i < 9; i++) {
        rawMemory.set(259 + i, [b4[i * 2], b4[i * 2 + 1]]);
      }
    } catch {}

    // Khối 5: Reg 386..399 (14 regs = 28 bytes -> ITEM_CODE)
    readingStatusText.value = `Đang đọc Khối 5: Item Code (Slave ${activeSlave}, Reg 386)...`;
    readProgress.value = 95;
    try {
      const b5 = await readModbusRaw(activeSlave, 3, 386, 14, 1000);
      for (let i = 0; i < 14; i++) {
        rawMemory.set(386 + i, [b5[i * 2], b5[i * 2 + 1]]);
      }
    } catch {}

    readProgress.value = 100;

    // Decode to registerData
    decodeRegistersFromMemory(rawMemory);
    readCompleted.value = true;
    readingStatusText.value = 'Đã đọc thành công 12 tham số theo ATH_TEMPLATE.csv!';
    cyberToast.success(`Đã đọc thành công thiết bị: ${registerData.SERIAL_NUMBER || registerData.deviceEUI}`);
  } catch (err: any) {
    readingStatusText.value = `Lỗi đọc: ${err.message}`;
    cyberToast.error(`Lỗi đọc thanh ghi: ${err.message}`);
  } finally {
    readingRegisters.value = false;
  }
}

function decodeRegistersFromMemory(rawMemory: Map<number, [number, number]>) {
  function getBytes(start: number, count: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < count; i++) {
      const pair = rawMemory.get(start + i);
      if (pair) bytes.push(pair[0], pair[1]);
    }
    return bytes;
  }

  registerData.FW_CODE = bytesToString(getBytes(0, 5));
  registerData.FW_VERSION = bytesToString(getBytes(5, 4));
  registerData.HW_VERSION = bytesToString(getBytes(9, 2));
  registerData.ME_VERSION = bytesToString(getBytes(15, 2));
  registerData.deviceEUI = bytesToHex(getBytes(27, 4));
  registerData['LRW appEUI'] = bytesToHex(getBytes(31, 4));
  registerData['LRW appKey'] = bytesToHex(getBytes(35, 8));
  registerData['region code'] = bytesToString(getBytes(69, 3));
  registerData.class = bytesToString(getBytes(85, 1));
  const stBytes = getBytes(103, 1);
  registerData['sensor type'] = stBytes.length >= 2 ? String((stBytes[0] << 8) | stBytes[1]) : '';
  registerData.SERIAL_NUMBER = bytesToString(getBytes(259, 9));
  registerData.ITEM_CODE = bytesToString(getBytes(386, 14));
  matchDeviceProfileByRegion();
}

function nextToStep3() {
  if (!hasRequiredRegisters.value) {
    cyberToast.warning('Chưa có đủ thông tin DeviceEUI, AppKey, Serial Number!');
    return;
  }
  currentStep.value = 3;
  executeChirpstackRegistration();
}

// ============================================================================
// BƯỚC 3: Tự Động Đăng Ký ChirpStack (2 Lần) & Thông Báo Gắn Pin
// ============================================================================
const step3Result = reactive({
  status: 'IDLE', // 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  message: '',
});

const computedChirpstackPayload = computed(() => {
  const profileId = matchedDeviceProfile.value?.id || step1.deviceProfileId || `profile-${registerData.class || 'A'}-${registerData['region code'] || 'AS923'}`;
  return {
    step1_device: {
      applicationId: step1.applicationId || 'app-iot-monitoring',
      description: 'ITEST 2.0',
      devEui: registerData.deviceEUI,
      deviceProfileId: profileId,
      isDisabled: false,
      joinEui: registerData['LRW appEUI'] || '0000000000000000',
      name: registerData.SERIAL_NUMBER || `DEV-${registerData.deviceEUI}`,
      skipFcntCheck: true,
      variables: {
        soNumber: step1.soNumber,
        waNumber: step1.waNumber,
        itemCode: registerData.ITEM_CODE || step1.itemCode,
        fwCode: registerData.FW_CODE,
        fwVersion: registerData.FW_VERSION,
        hwVersion: registerData.HW_VERSION,
        tenantId: step1.tenantId,
        applicationId: step1.applicationId,
        deviceProfileId: profileId,
        deviceProfileName: matchedDeviceProfile.value?.name,
      },
    },
    step2_deviceKeys: {
      devEui: registerData.deviceEUI,
      nwkKey: registerData['LRW appKey'],
      appKey: registerData['LRW appKey'],
    },
  };
});

async function executeChirpstackRegistration() {
  step3Result.status = 'PROCESSING';
  step3Result.message = '';

  const payload = {
    connectivity: 'LoRaWAN',
    soNumber: step1.soNumber,
    waNumber: step1.waNumber,
    serverId: step1.serverId,
    serverUrl: step1.serverUrl,
    apiToken: step1.apiToken,
    tenantId: step1.tenantId,
    applicationId: step1.applicationId,
    deviceProfileId: computedChirpstackPayload.value.step1_device.deviceProfileId,
    // Step 2 Registers
    fwCode: registerData.FW_CODE,
    fwVersion: registerData.FW_VERSION,
    hwVersion: registerData.HW_VERSION,
    meVersion: registerData.ME_VERSION,
    devEui: registerData.deviceEUI,
    appEui: registerData['LRW appEUI'],
    appKey: registerData['LRW appKey'],
    regionCode: registerData['region code'],
    classMode: registerData.class,
    sensorType: registerData['sensor type'],
    serialNumber: registerData.SERIAL_NUMBER,
    itemCode: registerData.ITEM_CODE || step1.itemCode,
  };

  try {
    const res: any = await httpClient.post('/plugins/testing/register-device-flow', payload);
    const data = res?.data || res;

    if (data?.success || data?.status === 'SUCCESS_ATTACH_BATTERY' || res?.status === 200) {
      step3Result.status = 'SUCCESS';
      step3Result.message = data?.message || 'Đăng ký Thành công vui lòng gắn pin cảm biến';
      cyberToast.success('Đăng ký Thành công vui lòng gắn pin cảm biến');
    } else {
      step3Result.status = 'ERROR';
      step3Result.message = data?.message || 'Lỗi không xác định từ Network Server';
      cyberToast.error(step3Result.message);
    }
  } catch (err: any) {
    step3Result.status = 'ERROR';
    step3Result.message =
      err?.response?.data?.message || err?.message || 'Lỗi khi gọi API đăng ký ChirpStack';
    cyberToast.error(step3Result.message);
  }
}

function goToStep(step: number) {
  if (step === 2 && (!step1.soNumber || !step1.waNumber)) {
    cyberToast.warning('Vui lòng hoàn thành Bước 1 trước!');
    return;
  }
  if (step === 3 && !hasRequiredRegisters.value) {
    cyberToast.warning('Vui lòng hoàn thành Bước 2 (đọc thanh ghi) trước!');
    return;
  }
  currentStep.value = step;
}

function finishAndReset() {
  resetAll();
  currentStep.value = 1;
}

function resetAll() {
  step1.soNumber = '';
  step1.waNumber = '';
  step1.itemCode = '';
  workAssignments.value = [];
  registerData.FW_CODE = '';
  registerData.FW_VERSION = '';
  registerData.HW_VERSION = '';
  registerData.ME_VERSION = '';
  registerData.deviceEUI = '';
  registerData['LRW appEUI'] = '';
  registerData['LRW appKey'] = '';
  registerData['region code'] = '';
  registerData.class = '';
  registerData['sensor type'] = '';
  registerData.SERIAL_NUMBER = '';
  registerData.ITEM_CODE = '';
  readCompleted.value = false;
  readProgress.value = 0;
  readingStatusText.value = 'Sẵn sàng';
  step3Result.status = 'IDLE';
  step3Result.message = '';
  cyberToast.info('Đã làm mới form tạo thiết bị');
}

onMounted(() => {
  loadSalesOrders();
  loadNetworkServers();
});
</script>

<style scoped>
.create-device-test-panel {
  animation: fadeIn 0.15s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
