<template>
  <div class="simulation-flow-builder space-y-4">
    <!-- Flow Header Controls -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm tracking-wide">QUY TRÌNH FUNCTION BLOCKS (FLOW SIMULATION)</span>
              <span class="badge badge-sm badge-primary font-mono font-bold">{{ blocks.length }} BLOCKS</span>
              <span class="badge badge-sm badge-outline font-mono">
                <Clock class="w-3 h-3 mr-1" />
                Tổng Thời Lượng: {{ totalDurationSeconds }}s ({{ (totalDurationSeconds / 60).toFixed(1) }} phút)
              </span>
              <span v-if="hasReferenceDevice" class="badge badge-sm badge-warning font-mono font-bold">
                CÓ THIẾT BỊ CHUẨN (REF)
              </span>
            </div>
            <p class="text-xs text-base-content/60 mt-0.5">
              Quy trình gồm 3 hàm chuẩn: Downlink (fport 1), Clear Downlink (FlushQueue), và Delay (tổng thời gian = tổng các delay).
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-ghost text-base-content/70"
            @click="showJsonModal = true"
            title="Xem / Chỉnh sửa cấu trúc JSON"
          >
            <Code class="w-3.5 h-3.5 mr-1" />
            JSON
          </button>

          <button
            v-if="blocks.length > 0"
            type="button"
            class="btn btn-sm btn-ghost text-error"
            @click="clearAllBlocks"
            title="Xóa hết các blocks"
          >
            <Trash2 class="w-3.5 h-3.5 mr-1" />
            Xóa Hết
          </button>

          <div class="join">
            <button
              type="button"
              class="btn btn-sm btn-outline btn-primary join-item gap-1"
              @click="addBlock('downlink')"
            >
              <Plus class="w-3.5 h-3.5" />
              + Downlink
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline btn-secondary join-item gap-1"
              @click="addBlock('clear_downlink')"
            >
              <Plus class="w-3.5 h-3.5" />
              + Clear Downlink
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline btn-accent join-item gap-1"
              @click="addBlock('delay')"
            >
              <Plus class="w-3.5 h-3.5" />
              + Delay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="blocks.length === 0"
      class="card bg-base-200/50 border border-dashed border-base-content/20 rounded-box p-8 text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mx-auto text-base-content/50">
        <Layers class="w-6 h-6" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-base-content">Chưa có Function Block nào</h4>
        <p class="text-xs text-base-content/60 max-w-md mx-auto mt-1">
          Bắt đầu tạo kịch bản với 3 hàm đơn giản: Downlink (DUT/REF), Clear Downlink (FlushQueue), hoặc Delay.
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 pt-2 flex-wrap">
        <button type="button" class="btn btn-sm btn-primary" @click="addBlock('downlink')">
          <Plus class="w-4 h-4 mr-1" />
          Thêm Downlink (DUT)
        </button>
        <button type="button" class="btn btn-sm btn-secondary" @click="addBlock('clear_downlink')">
          <Plus class="w-4 h-4 mr-1" />
          Thêm Clear Downlink
        </button>
        <button type="button" class="btn btn-sm btn-accent" @click="addBlock('delay')">
          <Plus class="w-4 h-4 mr-1" />
          Thêm Delay (Chờ)
        </button>
      </div>
    </div>

    <!-- Sequential Block Chain -->
    <div v-else class="space-y-3">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="relative transition-all"
      >
        <!-- Block Card -->
        <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 hover:border-primary/40 transition-colors">
          <!-- Block Header -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10 gap-2 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-sm font-mono font-bold bg-base-300">
                #{{ index + 1 }}
              </span>

              <span class="badge badge-sm font-bold uppercase tracking-wider" :class="getFunctionBadgeClass(block.functionType)">
                {{ getFunctionLabel(block.functionType) }}
              </span>

              <template v-if="block.functionType !== 'delay'">
                <span v-if="block.targetDevice === 'DUT'" class="badge badge-sm badge-accent font-mono font-semibold">
                  🎯 DUT (Thiết Bị Cần Test)
                </span>
                <span v-else-if="block.targetDevice === 'REF'" class="badge badge-sm badge-warning font-mono font-semibold">
                  ⭐ REF (Thiết Bị Chuẩn)
                </span>
              </template>
              <template v-else>
                <span class="badge badge-sm badge-outline font-mono">
                  ⏱️ Chờ {{ block.delaySeconds || 0 }}s
                </span>
              </template>
            </div>

            <!-- Block Header Actions -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === 0"
                @click="moveBlockUp(index)"
                title="Di chuyển lên trước"
              >
                <ArrowUp class="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === blocks.length - 1"
                @click="moveBlockDown(index)"
                title="Di chuyển xuống sau"
              >
                <ArrowDown class="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square text-base-content/70"
                @click="duplicateBlock(index)"
                title="Nhân bản block này"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>

              <div class="divider divider-horizontal m-0 py-1"></div>

              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square text-error hover:bg-error/20"
                @click="removeBlock(index)"
                title="Xóa block này"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Block Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- 1. Chọn Function Type -->
            <div class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Hàm Thực Thi (Function)</span>
              </label>
              <select
                v-model="block.functionType"
                class="select select-bordered select-sm w-full font-sans"
                @change="onFunctionTypeChanged(block)"
              >
                <option value="downlink">Downlink (Gửi lệnh vô tuyến)</option>
                <option value="clear_downlink">Clear Downlink (FlushQueue hàng đợi)</option>
                <option value="delay">Delay (Thời gian chờ kịch bản)</option>
              </select>
            </div>

            <!-- 2. Thiết bị mục tiêu: DUT hoặc REF (Chỉ áp dụng cho Downlink & Clear Downlink) -->
            <div v-if="block.functionType !== 'delay'" class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thiết Bị Mục Tiêu</span>
              </label>
              <select
                v-model="block.targetDevice"
                class="select select-bordered select-sm w-full font-mono text-xs"
                @change="emitUpdate"
              >
                <option value="DUT">🎯 Thiết bị được test (DUT)</option>
                <option value="REF">⭐ Thiết bị chuẩn đối chiếu (REF)</option>
              </select>
            </div>

            <!-- 3. FPort: Mặc định là 1 (Chỉ áp dụng cho Downlink) -->
            <div v-if="block.functionType === 'downlink'" class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">FPort (mặc định 1)</span>
              </label>
              <input
                v-model.number="block.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-bordered input-sm w-full font-mono text-xs text-center"
                placeholder="1"
                @input="emitUpdate"
              />
            </div>

            <!-- 4. Delay Seconds (Chỉ hiển thị khi functionType === 'delay') -->
            <div v-if="block.functionType === 'delay'" class="form-control md:col-span-8">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thời Gian Chờ (Delay)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.delaySeconds"
                  type="number"
                  min="1"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder="30"
                  @input="emitUpdate"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Khoảng {{ ((block.delaySeconds || 0) / 60).toFixed(1) }} phút. Tổng thời gian flow bằng các delay cộng lại.
                </span>
              </label>
            </div>

            <!-- 5. DOWNLINK HEX INPUT (Chỉ áp dụng cho Downlink) -->
            <div
              v-if="block.functionType === 'downlink'"
              class="form-control md:col-span-12"
            >
              <div class="flex items-center justify-between py-0.5">
                <label class="label-text text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                  <span>Downlink Hex Payload</span>
                  <span
                    v-if="block.payloadHex"
                    class="badge badge-xs font-mono"
                    :class="getHexValidation(block.payloadHex).valid ? 'badge-success' : 'badge-error'"
                  >
                    {{ getHexValidation(block.payloadHex).byteCount }} bytes
                  </span>
                </label>
                <button
                  v-if="block.payloadHex"
                  type="button"
                  class="btn btn-ghost btn-xs text-[10px] h-5 min-h-0 text-base-content/60"
                  @click="formatHexInput(block)"
                >
                  Định dạng Hex
                </button>
              </div>

              <input
                v-model="block.payloadHex"
                type="text"
                class="input input-bordered input-sm font-mono text-xs w-full uppercase"
                :class="{ 'input-error': block.payloadHex && !getHexValidation(block.payloadHex).valid }"
                placeholder="VD: 01 02 A3 FF (Hex bytes)"
                @input="onHexChange(block)"
              />
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Chuỗi hex chẵn ký tự, không delay khi thực hiện lệnh.
                </span>
              </label>
            </div>

            <!-- 6. Clear Downlink Note -->
            <div
              v-if="block.functionType === 'clear_downlink'"
              class="form-control md:col-span-12"
            >
              <div class="p-2.5 bg-base-100 rounded-lg border border-base-300 text-xs text-base-content/80 flex items-center gap-2">
                <span class="font-bold text-secondary font-mono">FlushQueue:</span>
                <span>Xóa toàn bộ hàng đợi downlink chưa gửi trên ChirpStack cho thiết bị <strong>{{ block.targetDevice }}</strong> ngay lập tức (không có delay).</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Preview / Direct Edit Modal -->
    <dialog class="modal" :class="{ 'modal-open': showJsonModal }">
      <div class="modal-box bg-base-100 border border-base-content/20 max-w-2xl p-5">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10 mb-3">
          <div class="flex items-center gap-2">
            <Code class="w-5 h-5 text-primary" />
            <h3 class="font-bold text-sm">CẤU TRÚC JSON FUNCTION BLOCKS</h3>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            @click="showJsonModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-base-content/70">
            Bạn có thể sao chép hoặc dán JSON các function blocks chuẩn để cấu hình nhanh:
          </p>

          <textarea
            v-model="rawJsonInput"
            class="textarea textarea-bordered font-mono text-xs w-full h-64 bg-base-200"
            placeholder="Dán mảng JSON blocks..."
          ></textarea>
        </div>

        <div class="modal-action flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            @click="copyJsonToClipboard"
          >
            <Copy class="w-3.5 h-3.5 mr-1" />
            Sao Chép JSON
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-ghost"
              @click="showJsonModal = false"
            >
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="applyJsonInput"
            >
              Áp Dụng JSON
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="showJsonModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  Code,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';

export interface FlowBlock {
  id: string;
  functionType: 'downlink' | 'clear_downlink' | 'delay' | string;
  targetDevice?: 'DUT' | 'REF' | string;
  delaySeconds?: number;
  payloadHex?: string;
  fPort?: number;
  confirmed?: boolean;
  description?: string;
}

export interface SimulationDeviceItem {
  id?: string;
  devEui: string;
  name?: string;
  itemCode?: string;
  status?: string;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: FlowBlock[];
    devices?: SimulationDeviceItem[];
  }>(),
  {
    modelValue: () => [],
    devices: () => [],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FlowBlock[]): void;
}>();

const blocks = ref<FlowBlock[]>([]);
const showJsonModal = ref(false);
const rawJsonInput = ref('');

// Sync with modelValue prop and normalize legacy blocks
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(blocks.value)) {
      const raw = Array.isArray(newVal) ? newVal : [];
      blocks.value = raw.map((b) => normalizeBlock(b));
    }
  },
  { immediate: true, deep: true }
);

function normalizeBlock(b: any): FlowBlock {
  let fnType = b.functionType || b.type || 'downlink';
  if (fnType === 'downlink_hex') fnType = 'downlink';
  if (fnType === 'delay_wait') fnType = 'delay';

  const target = (b.targetDevice || b.target || 'DUT').toUpperCase();
  const normalizedTarget = target === 'REF' ? 'REF' : 'DUT';

  return {
    id: b.id || `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: fnType,
    targetDevice: fnType === 'delay' ? undefined : normalizedTarget,
    delaySeconds: fnType === 'delay' ? (Number(b.delaySeconds) || 30) : 0,
    payloadHex: fnType === 'downlink' ? (b.payloadHex || b.payload || '') : '',
    fPort: fnType === 'downlink' ? (Number(b.fPort || b.fport) || 1) : undefined,
    confirmed: Boolean(b.confirmed || b.isConfirmed),
    description: b.description || '',
  };
}

function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(blocks.value)));
}

// Compute total duration of flow (only sum of delay blocks)
const totalDurationSeconds = computed(() => {
  return blocks.value.reduce((acc, b) => {
    if (b.functionType === 'delay') {
      return acc + (Number(b.delaySeconds) || 0);
    }
    return acc;
  }, 0);
});

// Check if flow involves reference device
const hasReferenceDevice = computed(() => {
  return blocks.value.some((b) => b.functionType !== 'delay' && b.targetDevice === 'REF');
});

// Hex validation helper
function getHexValidation(hex: string) {
  if (!hex) return { valid: true, byteCount: 0 };
  const clean = hex.replace(/\s+/g, '');
  const isValid = /^[0-9A-Fa-f]*$/.test(clean) && clean.length % 2 === 0;
  return {
    valid: isValid,
    byteCount: isValid ? clean.length / 2 : 0,
  };
}

function onHexChange(block: FlowBlock) {
  if (block.payloadHex) {
    block.payloadHex = block.payloadHex.toUpperCase();
  }
  emitUpdate();
}

function formatHexInput(block: FlowBlock) {
  if (!block.payloadHex) return;
  const clean = block.payloadHex.replace(/\s+/g, '').toUpperCase();
  const chunks = clean.match(/.{1,2}/g);
  if (chunks) {
    block.payloadHex = chunks.join(' ');
  }
  emitUpdate();
}

function onFunctionTypeChanged(block: FlowBlock) {
  if (block.functionType === 'delay') {
    block.delaySeconds = block.delaySeconds || 30;
    block.targetDevice = undefined;
    block.payloadHex = '';
    block.fPort = undefined;
  } else if (block.functionType === 'downlink') {
    block.targetDevice = block.targetDevice === 'REF' ? 'REF' : 'DUT';
    block.fPort = block.fPort || 1;
    block.delaySeconds = 0;
  } else if (block.functionType === 'clear_downlink') {
    block.targetDevice = block.targetDevice === 'REF' ? 'REF' : 'DUT';
    block.fPort = undefined;
    block.payloadHex = '';
    block.delaySeconds = 0;
  }
  emitUpdate();
}

function getFunctionBadgeClass(type: string) {
  switch (type) {
    case 'downlink':
      return 'badge-primary text-primary-content';
    case 'clear_downlink':
      return 'badge-secondary text-secondary-content';
    case 'delay':
      return 'badge-accent text-accent-content';
    default:
      return 'badge-neutral';
  }
}

function getFunctionLabel(type: string) {
  switch (type) {
    case 'downlink':
      return 'GỬI DOWNLINK';
    case 'clear_downlink':
      return 'CLEAR DOWNLINK (FLUSH)';
    case 'delay':
      return 'DELAY (CHỜ)';
    default:
      return 'FUNCTION';
  }
}

// Block Actions
function addBlock(type: 'downlink' | 'clear_downlink' | 'delay') {
  const newBlock: FlowBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: type,
    targetDevice: type === 'delay' ? undefined : 'DUT',
    delaySeconds: type === 'delay' ? 30 : 0,
    payloadHex: type === 'downlink' ? '01 02' : '',
    fPort: type === 'downlink' ? 1 : undefined,
    confirmed: false,
    description: '',
  };
  blocks.value.push(newBlock);
  emitUpdate();
}

function removeBlock(index: number) {
  blocks.value.splice(index, 1);
  emitUpdate();
}

function duplicateBlock(index: number) {
  const source = blocks.value[index];
  const clone: FlowBlock = {
    ...JSON.parse(JSON.stringify(source)),
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description: `${source.description || 'Block'} (Bản sao)`,
  };
  blocks.value.splice(index + 1, 0, clone);
  emitUpdate();
  cyberToast.info('Đã nhân bản block thành công!');
}

function moveBlockUp(index: number) {
  if (index <= 0) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index - 1, 0, item);
  emitUpdate();
}

function moveBlockDown(index: number) {
  if (index >= blocks.value.length - 1) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index + 1, 0, item);
  emitUpdate();
}

function clearAllBlocks() {
  blocks.value = [];
  emitUpdate();
  cyberToast.info('Đã xóa toàn bộ function blocks');
}

// JSON Modal helpers
watch(showJsonModal, (open) => {
  if (open) {
    rawJsonInput.value = JSON.stringify(blocks.value, null, 2);
  }
});

function copyJsonToClipboard() {
  navigator.clipboard.writeText(rawJsonInput.value);
  cyberToast.success('Đã sao chép JSON vào bộ nhớ đệm!');
}

function applyJsonInput() {
  try {
    const parsed = JSON.parse(rawJsonInput.value);
    if (Array.isArray(parsed)) {
      blocks.value = parsed.map((b) => normalizeBlock(b));
      emitUpdate();
      showJsonModal.value = false;
      cyberToast.success('Đã áp dụng cấu hình JSON vào Flow Blocks!');
    } else {
      cyberToast.error('Dữ liệu JSON phải là một mảng (array) các blocks!');
    }
  } catch (err: any) {
    cyberToast.error(`Lỗi cú pháp JSON: ${err?.message || 'Không hợp lệ'}`);
  }
}
</script>

<style scoped>
.simulation-flow-builder {
  --depth: 0 !important;
}
</style>
