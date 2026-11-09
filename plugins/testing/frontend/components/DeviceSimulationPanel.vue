<template>
  <div class="simulation-create-view space-y-4">
    <!-- Header: Unified Simulation Flow & Auto Check -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold tracking-wide uppercase text-base-content">
                TẠO SIMULATION FLOW &amp; AUTO CHECK (UNIFIED PROFILE)
              </h2>
              <span class="badge badge-xs badge-primary font-mono font-bold">GỘP FLOW &amp; CRITERIA</span>
            </div>
            <p class="text-xs text-base-content/60">
              Nhập ITEM_CODE &amp; FW_VERSION để nạp field data, cấu hình thiết bị tham chiếu, quy trình function blocks và tiêu chuẩn Auto Check.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5 text-base-content/80"
            @click="$emit('switch-tab', 'list-flow-simulation')"
          >
            <List class="w-3.5 h-3.5" />
            <span>Danh Sách Flow</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1"
            @click="resetForm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="savingProfile"
            @click="saveSimulationProfile"
          >
            <span v-if="savingProfile" class="loading loading-spinner loading-xs"></span>
            <Save v-else class="w-3.5 h-3.5" />
            Lưu Kịch Bản Unified
          </button>
        </div>
      </div>
    </div>

    <!-- Section 1: Cấu hình Thiết Bị Cần Test (DUT) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-accent font-mono font-bold">1. THIẾT BỊ ĐƯỢC TEST (DUT)</span>
          <span class="text-xs font-semibold text-base-content/80">Nhập ITEM_CODE &amp; FW_VERSION để tự động lấy field data</span>
        </div>
        <div v-if="dutFields.length > 0" class="badge badge-sm badge-success font-mono font-bold">
          {{ dutFields.length }} fields giải mã
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <!-- Tên Kịch Bản -->
        <div class="form-control lg:col-span-2">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Tên Kịch Bản (Profile Name)</span>
          </label>
          <input
            v-model="profileForm.name"
            type="text"
            class="input input-bordered input-sm w-full text-xs"
            placeholder="VD: Kịch bản kiểm thử khí WSSFC-ATH 20 phút"
          />
        </div>

        <!-- ITEM_CODE -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">ITEM_CODE</span>
          </label>
          <input
            v-model="profileForm.itemCode"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="VD: WSSFC-ATH"
            @input="onDutInputChanged"
          />
        </div>

        <!-- FW_VERSION -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">FW_VERSION</span>
          </label>
          <input
            v-model="profileForm.fwVersion"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder="VD: 4F0505"
            @input="onDutInputChanged"
          />
        </div>

        <!-- Sensor connectivity -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">Kết Nối</span>
          </label>
          <select
            v-model="profileForm.sensorConnectivity"
            class="select select-bordered select-sm w-full text-xs font-medium"
          >
            <option value="LoRaWAN">LoRaWAN</option>
            <option value="Sigfox">Sigfox</option>
          </select>
        </div>

        <!-- SIMU ID -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">SIMU ID</span>
            <span class="badge badge-xs badge-neutral font-mono text-[9px]">TỰ SINH</span>
          </label>
          <input
            :value="generatedSimuId"
            type="text"
            readonly
            disabled
            class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold bg-base-300/60 cursor-not-allowed"
            placeholder="Tự sinh từ ITEM &amp; FW..."
          />
        </div>
      </div>

      <!-- Action fetch field data cho DUT -->
      <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-xs btn-outline btn-primary gap-1"
          :disabled="loadingDutFields || (!profileForm.itemCode.trim() && !profileForm.fwVersion.trim())"
          @click="fetchDutFields"
        >
          <span v-if="loadingDutFields" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-3.5 h-3.5" />
          <span>{{ loadingDutFields ? 'Đang nạp field data…' : 'Lấy Field Data từ Decoder' }}</span>
        </button>

        <p v-if="dutFieldsError" class="text-error text-xs font-semibold bg-error/10 px-2.5 py-1 rounded">
          {{ dutFieldsError }}
        </p>

        <!-- Preview chip các fields giải mã -->
        <div v-if="dutFields.length > 0" class="flex flex-wrap gap-1 items-center">
          <span class="text-[11px] text-base-content/60 font-semibold mr-1">Fields:</span>
          <span
            v-for="f in dutFields.slice(0, 8)"
            :key="f.name"
            class="badge badge-xs badge-outline font-mono text-[10px]"
          >
            {{ f.name }}<span v-if="f.unit" class="text-primary ml-0.5">({{ f.unit }})</span>
          </span>
          <span v-if="dutFields.length > 8" class="badge badge-xs badge-neutral font-mono text-[9px]">
            +{{ dutFields.length - 8 }} khác
          </span>
        </div>
      </div>
    </div>

    <!-- Section 2: Thiết Bị Tham Chiếu (Reference Devices) & Thiết Bị Mô Phỏng (Simulator) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-warning font-mono font-bold">2. THIẾT BỊ THAM CHIẾU (REFERENCE) &amp; MÔ PHỎNG (SIMULATOR)</span>
          <span class="badge badge-xs badge-ghost font-mono">CÓ THỂ ĐỂ TRỐNG</span>
        </div>
        <button
          type="button"
          class="btn btn-xs btn-outline btn-warning gap-1"
          @click="addReferenceDevice"
        >
          <Plus class="w-3.5 h-3.5" />
          + Thêm Thiết Bị Tham Chiếu
        </button>
      </div>

      <!-- Danh sách Reference Devices -->
      <div v-if="referenceDevices.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
        Không có thiết bị tham chiếu nào. (Phần thiết bị tham chiếu có thể để trống nếu bài test không yêu cầu đối chiếu song song).
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(refDev, idx) in referenceDevices"
          :key="refDev.id"
          class="p-3 bg-base-100 rounded-lg border border-base-300 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-warning flex items-center gap-1.5 font-mono">
              ⭐ THIẾT BỊ THAM CHIẾU #{{ idx + 1 }}
            </span>
            <div class="flex items-center gap-2">
              <span v-if="refDev.fields?.length" class="badge badge-xs badge-success font-mono">
                {{ refDev.fields.length }} fields
              </span>
              <button
                type="button"
                class="btn btn-xs btn-ghost text-error"
                @click="removeReferenceDevice(idx)"
              >
                <Trash2 class="w-3 h-3 mr-0.5" />
                Xóa
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">Tên / Nhãn Tham Chiếu</span>
              </label>
              <input
                v-model="refDev.reference_name"
                type="text"
                class="input input-bordered input-xs w-full text-xs"
                placeholder="VD: Reference Sensor 01"
              />
            </div>
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">ITEM_CODE</span>
              </label>
              <input
                v-model="refDev.item_code"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                placeholder="VD: WSSFC-REF"
              />
            </div>
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">FW_VERSION</span>
              </label>
              <input
                v-model="refDev.fw_version"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                placeholder="VD: 4F0505"
              />
            </div>
            <div class="form-control flex justify-end pb-0.5">
              <button
                type="button"
                class="btn btn-xs btn-outline btn-warning w-full"
                :disabled="refDev.loading || (!refDev.item_code.trim() && !refDev.fw_version.trim())"
                @click="fetchRefDeviceFields(refDev)"
              >
                <span v-if="refDev.loading" class="loading loading-spinner loading-xs"></span>
                <span v-else>Lấy Field Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Thiết bị mô phỏng (Simulator Device - Có thể để trống) -->
      <div class="p-3 bg-base-100/60 rounded-lg border border-base-300">
        <div class="flex items-center justify-between pb-1 mb-1">
          <label class="label cursor-pointer gap-2 p-0">
            <input
              v-model="simulatorEnabled"
              type="checkbox"
              class="checkbox checkbox-xs checkbox-primary"
            />
            <span class="text-xs font-semibold text-base-content/80">Cấu hình Thiết Bị Mô Phỏng (Simulator Device)</span>
          </label>
          <span class="text-[11px] text-base-content/50 italic">Có thể để trống hoặc dùng chung thiết bị vật lý với REF</span>
        </div>

        <div v-if="simulatorEnabled" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">Tên Thiết Bị Mô Phỏng</span>
            </label>
            <input
              v-model="simulatorForm.name"
              type="text"
              class="input input-bordered input-xs w-full text-xs"
              placeholder="VD: Gas Chamber Simulator"
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">ITEM_CODE Mô Phỏng</span>
            </label>
            <input
              v-model="simulatorForm.item_code"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs uppercase"
              placeholder="VD: SIMU-GAS-01"
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">DevEUI / Network ID</span>
            </label>
            <input
              v-model="simulatorForm.dev_eui"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs uppercase"
              placeholder="16 ký tự Hex..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Quy Trình Function Blocks (Flow Simulation) -->
    <div class="space-y-2">
      <SimulationFlowBuilder
        v-model="flowBlocks"
        :devices="simulationDeviceItems"
      />
    </div>

    <!-- Section 4: Tiêu Chuẩn Auto Check (Gộp cùng Simulation Flow) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-success font-mono font-bold">3. TIÊU CHUẨN AUTO CHECK (INTEGRATED CRITERIA)</span>
          <span class="text-xs font-semibold text-base-content/80">Thiết lập quy tắc kiểm tra tự động gắn liền với kịch bản</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-xs btn-outline btn-success gap-1"
            @click="addDutRule"
          >
            <Plus class="w-3.5 h-3.5" />
            + Thêm Quy Tắc DUT
          </button>
          <button
            v-if="referenceDevices.length > 0"
            type="button"
            class="btn btn-xs btn-outline btn-warning gap-1"
            @click="addComparisonRule"
          >
            <Plus class="w-3.5 h-3.5" />
            + So Sánh Dung Sai DUT vs REF
          </button>
        </div>
      </div>

      <!-- Danh Sách Quy Tắc DUT -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wide text-base-content/70">
          Quy Tắc Đánh Giá Cho DUT (Device Under Test)
        </h4>

        <div v-if="dutRules.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
          Chưa có quy tắc Auto Check nào cho DUT. Nhấn "+ Thêm Quy Tắc DUT" để định nghĩa kiểm tra giá trị, Measurement Window, hoặc Average.
        </div>

        <div
          v-for="(rule, rIdx) in dutRules"
          :key="rIdx"
          class="p-3 bg-base-100 rounded-lg border border-base-300 space-y-2"
        >
          <div class="flex items-center justify-between border-b border-base-200 pb-1.5">
            <span class="text-xs font-mono font-bold text-primary">#{{ rIdx + 1 }} {{ rule.function_name }}</span>
            <button
              type="button"
              class="btn btn-xs btn-ghost text-error"
              @click="dutRules.splice(rIdx, 1)"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <!-- Loại Hàm Check -->
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">Loại Hàm Check</span>
              </label>
              <select
                v-model="rule.function_name"
                class="select select-bordered select-xs w-full font-sans text-xs"
              >
                <option value="CHECKVALUE">CHECKVALUE (Ngưỡng Min &lt;= Giá trị &lt;= Max)</option>
                <option value="CHECKCOUNT">CHECKCOUNT (Kiểm tra số lượng gói tin)</option>
                <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW (Counter_End - Counter_Start)</option>
                <option value="AVERAGE">AVERAGE (Hàm tính trung bình độc lập)</option>
              </select>
            </div>

            <!-- Trường Kiểm Tra (Parameter Field) -->
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">Trường Kiểm Tra (Field)</span>
              </label>
              <input
                v-model="rule.parameter_name"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs"
                placeholder="VD: gas_raw, fcnt, rssi..."
              />
            </div>

            <!-- Form fields theo loại hàm -->
            <template v-if="rule.function_name === 'CHECKVALUE'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">LOW_THRESHOLD (Min)</span>
                </label>
                <input
                  v-model.number="rule.low_threshold"
                  type="number"
                  step="any"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="Min"
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">HIGH_THRESHOLD (Max)</span>
                </label>
                <input
                  v-model.number="rule.high_threshold"
                  type="number"
                  step="any"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="Max"
                />
              </div>
            </template>

            <template v-else-if="rule.function_name === 'MEASUREMENT_WINDOW'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Mã Window ID</span>
                </label>
                <input
                  v-model="rule.measurement_window_id"
                  type="text"
                  class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                  placeholder="WINDOW_01"
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Số Gói Tối Thiểu (Min Count)</span>
                </label>
                <input
                  v-model.number="rule.min_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="10"
                />
              </div>
            </template>

            <template v-else-if="rule.function_name === 'AVERAGE'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Chế Độ Average</span>
                </label>
                <select
                  v-model="rule.average_mode"
                  class="select select-bordered select-xs w-full font-sans text-xs"
                >
                  <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW</option>
                  <option value="SAMPLE_COUNT">SAMPLE_COUNT</option>
                  <option value="TIME_WINDOW">TIME_WINDOW</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Số Mẫu / Window ID</span>
                </label>
                <input
                  v-if="rule.average_mode === 'SAMPLE_COUNT'"
                  v-model.number="rule.sample_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="10"
                />
                <input
                  v-else
                  v-model="rule.measurement_window_id"
                  type="text"
                  class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                  placeholder="WINDOW_01"
                />
              </div>
            </template>

            <template v-else>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Số Gói Tối Thiểu (MIN_COUNT)</span>
                </label>
                <input
                  v-model.number="rule.min_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="1"
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">Số Gói Tối Đa (MAX_COUNT)</span>
                </label>
                <input
                  v-model.number="rule.max_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder="100"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- So Sánh Dung Sai DUT vs Reference Devices (Tolerance Comparisons) -->
      <div v-if="referenceDevices.length > 0" class="space-y-2 pt-2 border-t border-base-200">
        <h4 class="text-xs font-bold uppercase tracking-wide text-warning">
          So Sánh Dung Sai DUT vs Thiết Bị Tham Chiếu (Tolerance Comparisons)
        </h4>

        <div v-if="comparisons.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
          Chưa có quy tắc so sánh sai lệch. Nhấn "+ So Sánh Dung Sai DUT vs REF" để thiết lập đối chiếu.
        </div>

        <div
          v-for="(comp, cIdx) in comparisons"
          :key="cIdx"
          class="p-2.5 bg-base-100 rounded-lg border border-base-300 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
        >
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">Trường của DUT</span>
            </label>
            <input
              v-model="comp.dut_field"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs"
              placeholder="VD: gas_raw"
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">Trường Tham Chiếu (REF)</span>
            </label>
            <input
              v-model="comp.reference_field"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs"
              placeholder="VD: gas_raw"
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">Dung Sai Cho Phép (Tolerance)</span>
            </label>
            <input
              v-model.number="comp.tolerance"
              type="number"
              step="any"
              class="input input-bordered input-xs w-full font-mono text-xs"
              placeholder="VD: 5"
            />
          </div>
          <div class="flex justify-end pt-4">
            <button
              type="button"
              class="btn btn-xs btn-ghost text-error"
              @click="comparisons.splice(cIdx, 1)"
            >
              <Trash2 class="w-3.5 h-3.5 mr-1" />
              Xóa
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
  Save,
  List,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import SimulationFlowBuilder, {
  type FlowBlock,
  type SimulationDeviceItem,
} from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'packet-emitted', packet: any): void;
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

// DUT Form state
const profileForm = reactive({
  name: '',
  sensorConnectivity: 'LoRaWAN',
  skuSuffix: '',
  fwVersion: '',
  itemCode: '',
});

// Sku prefix reacts to sensor connectivity
const skuPrefix = computed(() => {
  return profileForm.sensorConnectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-';
});

const fullSku = computed(() => {
  const suffix = profileForm.skuSuffix.trim();
  return suffix ? `${skuPrefix.value}${suffix}` : '';
});

// SIMU ID auto-generated from ITEM_CODE and FW
const generatedSimuId = computed(() => {
  const item = profileForm.itemCode.trim();
  const fw = profileForm.fwVersion.trim();
  if (!item && !fw) return '';
  if (item && fw) return `SIMU-${item}-${fw}`;
  if (item) return `SIMU-${item}`;
  return `SIMU-${fw}`;
});

// DUT Fields State
const dutFields = ref<Array<{ name: string; label: string; unit?: string }>>([]);
const loadingDutFields = ref(false);
const dutFieldsError = ref('');

async function fetchDutFields() {
  const itemCode = profileForm.itemCode.trim();
  const fwVersion = profileForm.fwVersion.trim();
  if (!itemCode && !fwVersion) return;

  loadingDutFields.value = true;
  dutFieldsError.value = '';
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', {
      params: {
        itemCode,
        fwVersion,
        longFw: fwVersion,
      },
    });
    const payload = res?.data?.fields !== undefined ? res.data : (res?.fields !== undefined ? res : res?.data || {});
    const fields = payload.fields ?? payload.data?.fields ?? [];
    if (Array.isArray(fields)) {
      dutFields.value = fields;
      if (fields.length > 0) {
        cyberToast.success(`Đã nạp ${fields.length} trường giải mã cho DUT`);
      }
    }
  } catch (err: any) {
    dutFieldsError.value = 'Không thể lấy field data cho DUT từ decoder';
  } finally {
    loadingDutFields.value = false;
  }
}

let dutFetchTimeout: any = null;
function onDutInputChanged() {
  clearTimeout(dutFetchTimeout);
  if (profileForm.itemCode.trim() && profileForm.fwVersion.trim()) {
    dutFetchTimeout = setTimeout(() => {
      fetchDutFields();
    }, 600);
  }
}

// Reference Devices State (Multi-reference support)
export interface ReferenceDeviceFormItem {
  id: string;
  reference_name: string;
  item_code: string;
  fw_version: string;
  fields?: Array<{ name: string; label?: string; unit?: string }>;
  loading?: boolean;
}

const referenceDevices = ref<ReferenceDeviceFormItem[]>([]);

function addReferenceDevice() {
  referenceDevices.value.push({
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reference_name: `Reference Device ${referenceDevices.value.length + 1}`,
    item_code: '',
    fw_version: '',
    fields: [],
    loading: false,
  });
}

function removeReferenceDevice(index: number) {
  referenceDevices.value.splice(index, 1);
}

async function fetchRefDeviceFields(refDev: ReferenceDeviceFormItem) {
  const code = refDev.item_code.trim();
  const fw = refDev.fw_version.trim();
  if (!code && !fw) return;

  refDev.loading = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', {
      params: { itemCode: code, fwVersion: fw, longFw: fw },
    });
    const payload = res?.data?.fields !== undefined ? res.data : (res?.fields !== undefined ? res : res?.data || {});
    const fields = payload.fields ?? payload.data?.fields ?? [];
    if (Array.isArray(fields)) {
      refDev.fields = fields;
      cyberToast.success(`Đã nạp ${fields.length} trường cho ${refDev.reference_name || 'thiết bị tham chiếu'}`);
    }
  } catch {
    cyberToast.warning(`Không tìm thấy decoder cho thiết bị tham chiếu ${code}`);
  } finally {
    refDev.loading = false;
  }
}

// Simulator Device State
const simulatorEnabled = ref(false);
const simulatorForm = reactive({
  name: '',
  item_code: '',
  dev_eui: '',
});

// Flow Blocks state
const flowBlocks = ref<FlowBlock[]>([]);

// DUT AutoCheck Rules State
export interface AutoCheckRuleItem {
  function_name: string;
  parameter_name: string;
  low_threshold?: number;
  high_threshold?: number;
  min_count?: number;
  max_count?: number;
  measurement_window_id?: string;
  average_mode?: string;
  sample_count?: number;
}

const dutRules = ref<AutoCheckRuleItem[]>([]);

function addDutRule() {
  dutRules.value.push({
    function_name: 'CHECKVALUE',
    parameter_name: dutFields.value.length > 0 ? dutFields.value[0].name : '',
    low_threshold: 0,
    high_threshold: 100,
    min_count: 1,
    max_count: 100,
  });
}

// Tolerance Comparisons State
export interface ToleranceComparisonItem {
  dut_field: string;
  reference_field: string;
  tolerance: number;
}

const comparisons = ref<ToleranceComparisonItem[]>([]);

function addComparisonRule() {
  comparisons.value.push({
    dut_field: dutFields.value.length > 0 ? dutFields.value[0].name : '',
    reference_field: '',
    tolerance: 5,
  });
}

function resetForm() {
  profileForm.name = '';
  profileForm.sensorConnectivity = 'LoRaWAN';
  profileForm.skuSuffix = '';
  profileForm.fwVersion = '';
  profileForm.itemCode = '';
  dutFields.value = [];
  referenceDevices.value = [];
  simulatorEnabled.value = false;
  simulatorForm.name = '';
  simulatorForm.item_code = '';
  simulatorForm.dev_eui = '';
  flowBlocks.value = [];
  dutRules.value = [];
  comparisons.value = [];
  cyberToast.info('Đã làm mới form');
}

// Simulation devices for target dropdown
const simulationDevices = ref<any[]>([]);
const simulationDeviceItems = computed<SimulationDeviceItem[]>(() => {
  return simulationDevices.value.map((d) => ({
    id: d.id,
    devEui: d.devEui || d.dev_eui || '',
    name: d.name || d.device_name || '',
    itemCode: d.itemCode || d.item_code || '',
    status: d.status || '',
  }));
});

async function fetchSimulationDevices() {
  try {
    const res: any = await httpClient.get('/plugins/testing/simulation-devices');
    const items = res?.data?.items || res?.data || res?.items || [];
    simulationDevices.value = Array.isArray(items) ? items : [];
  } catch {
    simulationDevices.value = [];
  }
}

// Save Unified Profile
const savingProfile = ref(false);

async function saveSimulationProfile() {
  if (!profileForm.itemCode.trim() && !profileForm.name.trim()) {
    cyberToast.warning('Vui lòng nhập ITEM_CODE hoặc Tên Kịch Bản!');
    return;
  }

  savingProfile.value = true;
  const simuId = generatedSimuId.value || `SIMU-${Date.now()}`;
  const profileName = profileForm.name.trim() || simuId;

  const autoCheckCriteriaPayload = {
    dut: {
      item_code: profileForm.itemCode,
      fw_version: profileForm.fwVersion,
      fields: dutFields.value.map((f) => f.name),
      function_rules: dutRules.value,
    },
    reference_devices: referenceDevices.value.map((r) => ({
      reference_name: r.reference_name,
      item_code: r.item_code,
      fw_version: r.fw_version,
      fields: (r.fields || []).map((f) => f.name),
    })),
    comparisons: comparisons.value,
  };

  const payload = {
    name: profileName,
    profileName: profileName,
    simuId,
    sensorConnectivity: profileForm.sensorConnectivity,
    sku: fullSku.value,
    longFw: profileForm.fwVersion,
    fwVersion: profileForm.fwVersion,
    itemCode: profileForm.itemCode,
    flowBlocks: flowBlocks.value,
    referenceDevices: referenceDevices.value.map((r) => ({
      reference_name: r.reference_name,
      item_code: r.item_code,
      fw_version: r.fw_version,
    })),
    simulatorDevice: simulatorEnabled.value && simulatorForm.item_code ? simulatorForm : null,
    autoCheckCriteria: autoCheckCriteriaPayload,
  };

  try {
    await httpClient.post('/plugins/testing/simulation/profiles', payload);
    cyberToast.success('Đã lưu kịch bản Unified Simulation & Auto Check thành công!');
    emit('switch-tab', 'list-flow-simulation');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu kịch bản';
    cyberToast.error(msg);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
