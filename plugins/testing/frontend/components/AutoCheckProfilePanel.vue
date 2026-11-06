<template>
  <form class="space-y-4 border border-base-300 rounded-xl bg-base-200 p-4" @submit.prevent="save">
    <div class="flex items-center justify-between border-b border-base-300 pb-2">
      <div>
        <h3 class="font-bold text-sm uppercase text-primary">Cấu hình AutoCheck Function Blocks</h3>
        <p class="text-xs text-base-content/60">
          Thiết lập tiêu chuẩn kiểm tra tự động theo chuẩn hàm FUNC_AUTOCHECK (CHECKVALUE, CHECKAVG, CHECKCOUNT, PERIOD...)
        </p>
      </div>
      <div v-if="autocheckId" class="badge badge-primary font-mono text-xs">
        {{ autocheckId }}
      </div>
    </div>

    <p v-if="error" role="alert" class="text-error text-xs font-semibold bg-error/10 p-2.5 rounded-lg border border-error/20 break-words">{{ error }}</p>
    <p v-if="notice" role="status" class="text-success text-xs font-semibold bg-success/10 p-2.5 rounded-lg border border-success/20">{{ notice }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <label class="block space-y-1">
        <span class="text-xs font-semibold">Tên AutoCheck</span>
        <input v-model="name" required maxlength="255" placeholder="VD: Tiêu Chuẩn Đo Kiểm Cảm Biến Khí WSSFC-ATH" class="input input-sm input-bordered w-full text-xs" />
      </label>
      <label class="block space-y-1">
        <span class="text-xs font-semibold">Mã Cấu Hình (AUTOCHECK_ID)</span>
        <input :value="autocheckId || 'Hệ thống tự sinh mã khi lưu (AC-...)'" readonly class="input input-sm input-bordered w-full font-mono text-xs bg-base-300/40 text-base-content/60 cursor-not-allowed" />
      </label>
    </div>

    <div class="p-3 bg-base-100/80 border border-base-300 rounded-xl flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <input
          id="toggle-use-reference"
          v-model="useReference"
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary border-primary bg-base-100"
        />
        <label for="toggle-use-reference" class="cursor-pointer select-none text-xs font-semibold text-base-content flex items-center gap-1.5">
          <span>Kích hoạt kiểm tra so sánh với Thiết Bị Tham Chiếu (Reference Device)</span>
          <span class="badge badge-xs font-mono font-bold" :class="useReference ? 'badge-primary' : 'badge-ghost'">
            {{ useReference ? 'ĐÃ BẬT' : 'CHƯA BẬT' }}
          </span>
        </label>
      </div>

      <button
        type="button"
        class="btn btn-xs gap-1.5 font-bold transition-all"
        :class="useReference ? 'btn-error btn-outline' : 'btn-primary'"
        @click="useReference = !useReference"
      >
        <span>{{ useReference ? '✕ Bỏ Thiết Bị Tham Chiếu' : '+ Thêm Thiết Bị Tham Chiếu' }}</span>
      </button>
    </div>

    <!-- DUT & Reference Specs and Discovery -->
    <div class="grid grid-cols-1" :class="useReference ? 'lg:grid-cols-2 gap-4' : 'gap-3'">
      <section v-for="side in activeSides" :key="side.key" class="space-y-3 border border-base-300 rounded-xl bg-base-100/70 p-3.5">
        <div class="flex items-center justify-between border-b border-base-300 pb-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content flex items-center gap-1.5">
            <span class="badge badge-xs font-mono" :class="side.key === 'dut' ? 'badge-primary' : 'badge-secondary'">
              {{ side.key.toUpperCase() }}
            </span>
            {{ side.label }}
          </h4>
          <span class="text-[11px] font-mono text-base-content/60">
            {{ side.fields.length }} fields giải mã
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <label class="block space-y-1">
            <span class="text-[11px] font-semibold">ITEM_CODE</span>
            <input v-model="side.item_code" required placeholder="VD: WSSFC-ATH" class="input input-xs input-bordered w-full font-mono uppercase" @input="invalidate(side)" />
          </label>
          <label class="block space-y-1">
            <span class="text-[11px] font-semibold">FW_VERSION (LONG_FW)</span>
            <input v-model="side.fw_version" required placeholder="VD: 4F0505 hoặc 01.00.00" class="input input-xs input-bordered w-full font-mono uppercase" @input="invalidate(side)" />
          </label>
        </div>

        <button type="button" class="btn btn-xs btn-outline btn-primary w-full gap-1" :disabled="side.loading || (!side.item_code.trim() && !side.fw_version.trim())" @click="discover(side)">
          <span v-if="side.loading" class="loading loading-spinner loading-xs"></span>
          <span>{{ side.loading ? 'Đang lấy field data từ decoder…' : 'Lấy Field Data từ Decoder' }}</span>
        </button>

        <p v-if="side.error" role="alert" class="text-error text-[11px] bg-error/10 p-1.5 rounded">{{ side.error }}</p>
        <p v-if="side.loaded && !side.fields.length" class="text-warning text-[11px] italic">Chưa có field giải mã cho sản phẩm này.</p>

        <!-- Function Blocks per Side -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wide">Quy tắc kiểm tra (Function Blocks)</span>
            <button type="button" class="btn btn-xs btn-ghost text-primary font-bold" :disabled="!side.fields.length" @click="side.rules.push(newRule())">
              + Thêm Hàm
            </button>
          </div>

          <div v-if="!side.rules.length" class="text-center py-4 border border-dashed border-base-300 rounded-lg text-base-content/40 text-xs italic">
            {{ side.fields.length ? 'Nhấn "+ Thêm Hàm" để gán quy tắc kiểm tra cho thiết bị' : 'Tra cứu field để thiết lập hàm kiểm tra' }}
          </div>

          <div v-for="(rule, index) in side.rules" :key="index" class="space-y-2 border border-base-300 rounded-lg bg-base-200/50 p-2.5">
            <div class="flex items-center justify-between border-b border-base-300/60 pb-1.5">
              <span class="text-[11px] font-mono font-bold text-primary">#{{ index + 1 }} Function Block</span>
              <button type="button" class="btn btn-ghost btn-xs text-error font-mono" @click="side.rules.splice(index, 1)">
                ✕ Xóa
              </button>
            </div>

            <!-- Row 1: Function Type & Field Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">Loại Hàm (FUNC_AUTOCHECK)</span>
                <select v-model="rule.funcName" class="select select-xs select-bordered w-full font-mono">
                  <option value="CHECKVALUE">CHECKVALUE (Ngưỡng giá trị)</option>
                  <option value="CHECKAVG">CHECKAVG (Trung bình cả đợt)</option>
                  <option value="CHECKCOUNT">CHECKCOUNT (Đếm số lần thoả)</option>
                  <option value="CHECKVALUE_PERIOD">CHECKVALUE_PERIOD (Ngưỡng theo chu kỳ)</option>
                  <option value="CHECKAVG_PERIOD">CHECKAVG_PERIOD (Trung bình theo chu kỳ)</option>
                  <option value="FUNC_AVG">FUNC_AVG (Tính AVG theo thời gian)</option>
                  <option value="FUNC_OFFSET_AVGZERO">FUNC_OFFSET_AVGZERO (Hiệu chuẩn Zero)</option>
                </select>
              </label>

              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">Tham số cần đo (Parameter / Field)</span>
                <select v-model="rule.field" required class="select select-xs select-bordered w-full font-mono">
                  <option value="" disabled>-- Chọn field giải mã --</option>
                  <option v-for="field in side.fields" :key="field" :value="field">{{ field }}</option>
                </select>
              </label>
            </div>

            <!-- Row 2: Dynamic Function Input Variables according to FUNC_AUTOCHECK.xlsx -->
            <!-- 1. CHECKVALUE & CHECKAVG -->
            <div v-if="rule.funcName === 'CHECKVALUE' || rule.funcName === 'CHECKAVG'" class="grid grid-cols-2 gap-2 pt-1">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">LOW_THRESHOLD</span>
                <input v-model.number="rule.lowThreshold" type="number" step="any" placeholder="Ngưỡng dưới (min)" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">HIGH_THRESHOLD</span>
                <input v-model.number="rule.highThreshold" type="number" step="any" placeholder="Ngưỡng trên (max)" class="input input-xs input-bordered w-full font-mono" />
              </label>
            </div>

            <!-- 2. CHECKCOUNT -->
            <div v-else-if="rule.funcName === 'CHECKCOUNT'" class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">LOW_THRESHOLD</span>
                <input v-model.number="rule.lowThreshold" type="number" step="any" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">HIGH_THRESHOLD</span>
                <input v-model.number="rule.highThreshold" type="number" step="any" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">MIN_COUNT</span>
                <input v-model.number="rule.minCount" type="number" min="0" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">MAX_COUNT</span>
                <input v-model.number="rule.maxCount" type="number" min="1" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
            </div>

            <!-- 3. FUNC_AVG -->
            <div v-else-if="rule.funcName === 'FUNC_AVG'" class="grid grid-cols-2 gap-2 pt-1">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">START_TIME (Offset giây)</span>
                <input v-model.number="rule.startTime" type="number" min="0" step="1" placeholder="Giây bắt đầu" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">DURATION (Thời lượng giây)</span>
                <input v-model.number="rule.duration" type="number" min="1" step="1" placeholder="Thời lượng" class="input input-xs input-bordered w-full font-mono" />
              </label>
            </div>

            <!-- 4. FUNC_OFFSET_AVGZERO -->
            <div v-else-if="rule.funcName === 'FUNC_OFFSET_AVGZERO'" class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">STANDARD ZERO</span>
                <input v-model.number="rule.standardZero" type="number" step="any" placeholder="Chuẩn Zero (VD: 0)" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">START OFFSET TIME (s)</span>
                <input v-model.number="rule.startOffsetTime" type="number" min="0" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">DURATION FOR AVG ZERO (s)</span>
                <input v-model.number="rule.durationZero" type="number" min="1" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
            </div>

            <!-- 5. CHECKVALUE_PERIOD & CHECKAVG_PERIOD -->
            <div v-else-if="rule.funcName === 'CHECKVALUE_PERIOD' || rule.funcName === 'CHECKAVG_PERIOD'" class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">PERIOD START (s)</span>
                <input v-model.number="rule.periodStartOffsetTime" type="number" min="0" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">PERIOD DURATION (s)</span>
                <input v-model.number="rule.periodDurationTime" type="number" min="1" step="1" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">LOW_THRESHOLD</span>
                <input v-model.number="rule.lowThreshold" type="number" step="any" class="input input-xs input-bordered w-full font-mono" />
              </label>
              <label class="block space-y-0.5">
                <span class="text-[10px] font-semibold uppercase text-base-content/70">HIGH_THRESHOLD</span>
                <input v-model.number="rule.highThreshold" type="number" step="any" class="input input-xs input-bordered w-full font-mono" />
              </label>
            </div>

            <p class="text-[10px] text-base-content/50 italic">
              {{ getFunctionDescription(rule.funcName) }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Reference Comparison Tolerance Section -->
    <section v-if="useReference" class="space-y-3 border border-base-300 rounded-xl bg-base-100/70 p-3.5">
      <div class="flex items-center justify-between border-b border-base-300 pb-2">
        <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
          Đối chiếu sai số DUT với Thiết Bị Chuẩn Tham Chiếu
        </h4>
        <button type="button" class="btn btn-xs btn-outline btn-primary" :disabled="!dut.fields.length || !reference.fields.length" @click="comparisons.push({ dut_field: dut.fields[0] || '', reference_field: reference.fields[0] || '', tolerance: 2 })">
          + Thêm Cặp Đối Chiếu
        </button>
      </div>

      <div v-if="!comparisons.length" class="text-center py-4 border border-dashed border-base-300 rounded-lg text-base-content/40 text-xs italic">
        Chưa có cặp đối chiếu nào. Nhấn "+ Thêm Cặp Đối Chiếu" để so sánh sai số hai thiết bị.
      </div>

      <div v-for="(comparison, index) in comparisons" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border border-base-300 p-2 rounded-lg bg-base-200/50">
        <label class="block space-y-0.5">
          <span class="text-[10px] font-semibold uppercase text-base-content/70">Field DUT</span>
          <select v-model="comparison.dut_field" required class="select select-xs select-bordered w-full font-mono">
            <option v-for="field in dut.fields" :key="field" :value="field">{{ field }}</option>
          </select>
        </label>
        <label class="block space-y-0.5">
          <span class="text-[10px] font-semibold uppercase text-base-content/70">Field Thiết Bị Chuẩn</span>
          <select v-model="comparison.reference_field" required class="select select-xs select-bordered w-full font-mono">
            <option v-for="field in reference.fields" :key="field" :value="field">{{ field }}</option>
          </select>
        </label>
        <label class="block space-y-0.5">
          <span class="text-[10px] font-semibold uppercase text-base-content/70">Sai số cho phép (Tolerance: Δ)</span>
          <input v-model.number="comparison.tolerance" type="number" min="0" step="any" required class="input input-xs input-bordered w-full font-mono" />
        </label>
        <button type="button" class="btn btn-xs btn-ghost text-error font-mono h-7" @click="comparisons.splice(index, 1)">
          ✕ Xóa
        </button>
      </div>
    </section>

    <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-300">
      <button v-if="profileId" type="button" class="btn btn-sm btn-ghost" :disabled="saving" @click="resetForm">Tạo cấu hình khác</button>
      <button type="submit" class="btn btn-sm btn-primary px-6 font-bold" :disabled="saving">
        <span v-if="saving" class="loading loading-spinner loading-xs"></span>
        <span>{{ saving ? 'Đang lưu AutoCheck…' : 'Lưu Cấu Hình AutoCheck' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';

export type AutoCheckRule = {
  funcName: 'CHECKVALUE' | 'CHECKAVG' | 'CHECKCOUNT' | 'FUNC_AVG' | 'FUNC_OFFSET_AVGZERO' | 'CHECKVALUE_PERIOD' | 'CHECKAVG_PERIOD';
  field: string;
  count?: number;
  lowThreshold?: number;
  highThreshold?: number;
  minCount?: number;
  maxCount?: number;
  startTime?: number;
  duration?: number;
  standardZero?: number;
  startOffsetTime?: number;
  durationZero?: number;
  periodStartOffsetTime?: number;
  periodDurationTime?: number;
};

type Side = {
  key: string;
  label: string;
  item_code: string;
  fw_version: string;
  fields: string[];
  rules: AutoCheckRule[];
  loading: boolean;
  loaded: boolean;
  error: string;
  revision: number;
};

const newRule = (): AutoCheckRule => ({
  funcName: 'CHECKVALUE',
  field: '',
  count: 1,
  lowThreshold: 0,
  highThreshold: 100,
});

const makeSide = (key: string, label: string): Side => ({
  key,
  label,
  item_code: '',
  fw_version: '',
  fields: [],
  rules: [],
  loading: false,
  loaded: false,
  error: '',
  revision: 0,
});

const dut = reactive(makeSide('dut', 'Thiết bị cần kiểm tra (DUT)'));
const reference = reactive(makeSide('reference', 'Thiết bị tham chiếu'));
const activeSides = computed(() => (useReference.value ? [dut, reference] : [dut]));
const useReference = ref(false);
const name = ref('');
const autocheckId = ref('');
const profileId = ref('');
const saving = ref(false);
const error = ref('');
const notice = ref('');
const comparisons = reactive<{ dut_field: string; reference_field: string; tolerance: number }[]>([]);

function getFunctionDescription(funcName: string): string {
  switch (funcName) {
    case 'CHECKVALUE':
      return 'Kiểm tra LOW_THRESHOLD <= Giá trị <= HIGH_THRESHOLD ở tất cả các gói tin trong suốt thời gian test.';
    case 'CHECKAVG':
      return 'Kiểm tra LOW_THRESHOLD <= Giá trị trung bình (AVG) <= HIGH_THRESHOLD trong suốt thời gian test.';
    case 'CHECKCOUNT':
      return 'Đếm số gói tin thỏa ngưỡng [LOW, HIGH]. Đạt nếu MIN_COUNT <= số lần đếm <= MAX_COUNT.';
    case 'FUNC_AVG':
      return 'Tính giá trị trung bình của field trong khoảng thời lượng DURATION kể từ mốc START_TIME.';
    case 'FUNC_OFFSET_AVGZERO':
      return 'Tính hệ số hiệu chuẩn CONSTANT_B = STANDARD_ZERO - AVG_ZERO trong chu kỳ Zero.';
    case 'CHECKVALUE_PERIOD':
      return 'Kiểm tra LOW_THRESHOLD <= Giá trị <= HIGH_THRESHOLD trong khoảng thời gian PERIOD [START_OFFSET, START_OFFSET + DURATION].';
    case 'CHECKAVG_PERIOD':
      return 'Kiểm tra LOW_THRESHOLD <= AVG(Giá trị) <= HIGH_THRESHOLD trong khoảng thời gian PERIOD.';
    default:
      return '';
  }
}

function invalidate(side: Side) {
  side.revision++;
  side.fields = [];
  side.rules = [];
  side.loaded = false;
  side.error = '';
  comparisons.splice(0);
}

function message(err: any): string {
  const value = err?.response?.data?.message || err?.message || 'Không thể thực hiện yêu cầu';
  return Array.isArray(value) ? value.join('; ') : String(value);
}

async function discover(side: Side) {
  const itemCode = side.item_code.trim();
  const fwVersion = side.fw_version.trim();
  if (!itemCode && !fwVersion) {
    side.error = 'Vui lòng nhập ITEM_CODE hoặc FW_VERSION (LONG_FW) để lấy field data';
    return;
  }

  const revision = ++side.revision;
  side.loading = true;
  side.error = '';
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
    if (!Array.isArray(fields)) throw new Error('API field discovery trả dữ liệu không hợp lệ');
    if (revision !== side.revision) return;

    side.fields = fields
      .map((field: any) => (typeof field === 'string' ? field : field.field || field.name))
      .filter((field: any) => typeof field === 'string' && field.trim().length > 0);
    side.loaded = true;

    if (side.fields.length === 0) {
      side.error = payload.message || `Không tìm thấy decoder script hoặc telemetry fields cho ITEM_CODE='${itemCode}' / FW='${fwVersion}'`;
    } else {
      cyberToast.success(`Đã lấy thành công ${side.fields.length} field data từ Decoder!`);
    }
  } catch (err) {
    if (revision === side.revision) side.error = message(err);
  } finally {
    side.loading = false;
  }
}

function buildCriteria(side: Side) {
  if (!side.rules.length) throw new Error(`${side.label}: cần ít nhất một Function Block kiểm tra`);
  return {
    item_code: side.item_code.trim(),
    fw_version: side.fw_version.trim(),
    rules: side.rules.map((rule) => {
      if (!side.fields.includes(rule.field)) {
        throw new Error(`${side.label}: field '${rule.field}' không hợp lệ hoặc chưa được chọn`);
      }

      const item: any = {
        name: `${rule.funcName}_${rule.field}`,
        func_name: rule.funcName,
        funcName: rule.funcName,
        field: rule.field,
        parameter: rule.field,
      };

      if (rule.lowThreshold !== undefined && rule.lowThreshold !== null && rule.lowThreshold !== ('' as any)) {
        item.low_threshold = Number(rule.lowThreshold);
        item.lowThreshold = Number(rule.lowThreshold);
      }
      if (rule.highThreshold !== undefined && rule.highThreshold !== null && rule.highThreshold !== ('' as any)) {
        item.high_threshold = Number(rule.highThreshold);
        item.highThreshold = Number(rule.highThreshold);
      }
      if (rule.minCount !== undefined && rule.minCount !== null && rule.minCount !== ('' as any)) {
        item.min_count = Number(rule.minCount);
        item.minCount = Number(rule.minCount);
      }
      if (rule.maxCount !== undefined && rule.maxCount !== null && rule.maxCount !== ('' as any)) {
        item.max_count = Number(rule.maxCount);
        item.maxCount = Number(rule.maxCount);
      }
      if (rule.startTime !== undefined && rule.startTime !== null && rule.startTime !== ('' as any)) {
        item.start_time = Number(rule.startTime);
        item.startTime = Number(rule.startTime);
      }
      if (rule.duration !== undefined && rule.duration !== null && rule.duration !== ('' as any)) {
        item.duration = Number(rule.duration);
      }
      if (rule.standardZero !== undefined && rule.standardZero !== null && rule.standardZero !== ('' as any)) {
        item.standard_zero = Number(rule.standardZero);
        item.standardZero = Number(rule.standardZero);
      }
      if (rule.startOffsetTime !== undefined && rule.startOffsetTime !== null && rule.startOffsetTime !== ('' as any)) {
        item.start_offset_time = Number(rule.startOffsetTime);
        item.startOffsetTime = Number(rule.startOffsetTime);
      }
      if (rule.durationZero !== undefined && rule.durationZero !== null && rule.durationZero !== ('' as any)) {
        item.duration_zero = Number(rule.durationZero);
        item.durationZero = Number(rule.durationZero);
      }
      if (rule.periodStartOffsetTime !== undefined && rule.periodStartOffsetTime !== null && rule.periodStartOffsetTime !== ('' as any)) {
        item.period_start_offset_time = Number(rule.periodStartOffsetTime);
        item.periodStartOffsetTime = Number(rule.periodStartOffsetTime);
      }
      if (rule.periodDurationTime !== undefined && rule.periodDurationTime !== null && rule.periodDurationTime !== ('' as any)) {
        item.period_duration_time = Number(rule.periodDurationTime);
        item.periodDurationTime = Number(rule.periodDurationTime);
      }

      return item;
    }),
  };
}

function resetForm() {
  profileId.value = '';
  autocheckId.value = '';
  name.value = '';
  notice.value = '';
  error.value = '';
  dut.rules = [];
  reference.rules = [];
  comparisons.splice(0);
}

async function save() {
  error.value = '';
  notice.value = '';
  try {
    if (!name.value.trim()) throw new Error('Vui lòng nhập tên cấu hình AutoCheck');
    const rules: any = { dut: buildCriteria(dut) };
    if (useReference.value) {
      rules.reference = buildCriteria(reference);
      rules.comparisons = comparisons.map((comparison) => {
        if (
          !dut.fields.includes(comparison.dut_field) ||
          !reference.fields.includes(comparison.reference_field) ||
          !Number.isFinite(comparison.tolerance) ||
          comparison.tolerance < 0
        ) {
          throw new Error('Mapping so sánh hoặc sai số không hợp lệ');
        }
        return { ...comparison };
      });
    }

    const payload = {
      name: name.value.trim(),
      itemCode: dut.item_code.trim(),
      fwVersion: dut.fw_version.trim(),
      referenceItemCode: useReference.value ? reference.item_code.trim() : null,
      referenceFwVersion: useReference.value ? reference.fw_version.trim() : null,
      criteria: rules,
    };

    saving.value = true;
    const res: any = profileId.value
      ? await httpClient.put(`/plugins/testing/autocheck/profiles/${encodeURIComponent(profileId.value)}`, payload)
      : await httpClient.post('/plugins/testing/autocheck/profiles', payload);
    const data = res?.data || res;
    if (!data.id || !data.autocheckId) throw new Error('API chưa trả mã AutoCheck đã lưu');
    profileId.value = data.id;
    autocheckId.value = data.autocheckId;
    notice.value = 'Đã lưu cấu hình AutoCheck Function Blocks thành công.';
  } catch (err) {
    error.value = message(err);
  } finally {
    saving.value = false;
  }
}
</script>