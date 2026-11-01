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
                Tổng: {{ totalEstimatedSeconds }}s
              </span>
            </div>
            <p class="text-xs text-base-content/60 mt-0.5">
              Thiết lập chuỗi hàm điều khiển và downlink nối tiếp nhau cho thiết bị thử nghiệm hoặc thiết bị giả lập
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
            title="Xóa toàn bộ các khối lệnh"
          >
            <Trash2 class="w-3.5 h-3.5 mr-1" />
            Xóa Hết
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="addNewBlock"
          >
            <Plus class="w-4 h-4 mr-1" />
            Thêm Function Block
          </button>
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
          Bắt đầu tạo luồng kịch bản kiểm tra bằng cách thêm block hàm downlink.
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button type="button" class="btn btn-sm btn-primary" @click="addNewBlock">
          <Plus class="w-4 h-4 mr-1" />
          Thêm Block Đầu Tiên
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
              <span class="badge badge-neutral font-mono font-bold text-xs px-2.5 py-3">
                BLOCK #{{ index + 1 }}
              </span>

              <span
                class="badge badge-sm font-mono"
                :class="getFunctionBadgeClass(block.functionType)"
              >
                {{ getFunctionLabel(block.functionType) }}
              </span>

              <span v-if="block.targetDevice === 'DUT'" class="badge badge-sm badge-accent font-mono font-semibold">
                🎯 THIẾT BỊ ĐƯỢC TEST (DUT)
              </span>
              <span v-else class="badge badge-sm badge-ghost font-mono truncate max-w-[200px]" :title="block.targetDevice">
                ID: {{ block.targetDevice || 'Chưa gán' }}
              </span>
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
                class="btn btn-xs btn-ghost btn-square text-error"
                @click="removeBlock(index)"
                title="Xóa block này"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Block Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- 1. Chọn Function -->
            <div class="form-control md:col-span-3">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Hàm Thực Thi (Function)</span>
              </label>
              <select
                v-model="block.functionType"
                class="select select-bordered select-sm w-full font-sans"
              >
                <option value="downlink_hex">Downlink Hex (Lệnh vô tuyến)</option>
                <option value="delay_wait">Delay / Chờ phản hồi</option>
                <option value="trigger_buzzer">Kích hoạt còi báo (Buzzer)</option>
                <option value="reboot_cmd">Gửi lệnh Reboot Node</option>
              </select>
            </div>

            <!-- 2. Thiết bị đích: DUT hoặc Thiết bị trong danh sách Simulation -->
            <div class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thiết Bị Mục Tiêu</span>
              </label>
              <select
                v-model="block.targetDevice"
                class="select select-bordered select-sm w-full font-mono text-xs"
              >
                <option value="DUT">🎯 Thiết bị được test (DUT - Device Under Test)</option>
                <optgroup v-if="devices && devices.length > 0" label="Danh sách thiết bị Simulation">
                  <option
                    v-for="dev in devices"
                    :key="dev.id || dev.devEui"
                    :value="dev.devEui || dev.id"
                  >
                    {{ dev.name || dev.itemCode || 'Simu Node' }} ({{ dev.devEui }})
                  </option>
                </optgroup>
                <option v-else-if="!devices || devices.length === 0" disabled value="">
                  (Chưa có thiết bị simulation nào khác)
                </option>
              </select>
            </div>

            <!-- 3. Thời gian thực thi (Delay / Timer) -->
            <div class="form-control md:col-span-3">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thời Gian Kích Hoạt</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.delaySeconds"
                  type="number"
                  min="0"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder="0"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
            </div>

            <!-- 4. FPort (LoRaWAN) -->
            <div class="form-control md:col-span-2">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">FPort</span>
              </label>
              <input
                v-model.number="block.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-bordered input-sm w-full font-mono text-xs text-center"
                placeholder="10"
              />
            </div>

            <!-- 5. DOWNLINK HEX INPUT (Toàn chiều rộng) -->
            <div
              v-if="block.functionType !== 'delay_wait'"
              class="form-control md:col-span-12"
            >
              <div class="flex items-center justify-between py-0.5">
                <label class="label-text text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                  <span>Downlink Hex Payload</span>
                  <span class="text-error">*</span>
                  <span
                    v-if="getHexValidation(block.payloadHex).valid"
                    class="badge badge-xs badge-success font-mono font-normal"
                  >
                    {{ getHexValidation(block.payloadHex).byteCount }} bytes
                  </span>
                  <span
                    v-else-if="block.payloadHex && !getHexValidation(block.payloadHex).valid"
                    class="badge badge-xs badge-error font-mono font-normal"
                  >
                    Hex không hợp lệ
                  </span>
                </label>

                <div class="flex items-center gap-2 text-[11px]">
                  <label class="cursor-pointer flex items-center gap-1.5">
                    <input
                      v-model="block.confirmed"
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary"
                    />
                    <span class="text-base-content/70">Confirmed Downlink</span>
                  </label>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-primary font-mono"
                    @click="formatHexInput(block)"
                    title="Định dạng cách quãng 2 ký tự"
                  >
                    Format Hex
                  </button>
                </div>
              </div>

              <div class="relative">
                <input
                  v-model="block.payloadHex"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono uppercase tracking-wider text-xs"
                  :class="block.payloadHex && !getHexValidation(block.payloadHex).valid ? 'input-error' : ''"
                  placeholder="Ví dụ: 01020304 hoặc 01 02 03 FF..."
                  @input="onHexChange(block)"
                />
              </div>

              <div class="flex items-center justify-between text-[11px] text-base-content/50 mt-1">
                <span>Nhập chuỗi Hex mã hóa lệnh gửi xuống thiết bị đích</span>
                <span class="font-mono text-[10px] text-base-content/60">
                  {{ block.payloadHex ? block.payloadHex.replace(/\s+/g, '').length : 0 }} ký tự hex
                </span>
              </div>
            </div>

            <!-- Ghi chú/Mô tả bước (Tùy chọn) -->
            <div class="form-control md:col-span-12">
              <input
                v-model="block.description"
                type="text"
                class="input input-ghost input-xs w-full text-xs text-base-content/70 italic border-b border-base-content/10 focus:border-primary"
                placeholder="Ghi chú mục đích bước này (ví dụ: Gửi lệnh yêu cầu đọc cảm biến sau 30 giây)..."
              />
            </div>
          </div>
        </div>

        <!-- Sequential Connector Arrow between Blocks -->
        <div
          v-if="index < blocks.length - 1"
          class="flex items-center justify-center my-1.5"
        >
          <div class="flex items-center gap-1.5 text-xs text-base-content/40 font-mono">
            <div class="w-8 h-[1px] bg-base-content/15"></div>
            <div class="flex items-center gap-1 bg-base-300 px-2 py-0.5 rounded-full text-[10px] border border-base-content/10">
              <ArrowDown class="w-3 h-3 text-primary animate-bounce" />
              <span>Tiếp tục sau {{ blocks[index + 1]?.delaySeconds || 0 }}s</span>
            </div>
            <div class="w-8 h-[1px] bg-base-content/15"></div>
          </div>
        </div>
      </div>

      <!-- Add Next Block Button At End of List -->
      <div class="pt-2 flex items-center justify-center">
        <button
          type="button"
          class="btn btn-sm btn-outline btn-primary rounded-full px-6"
          @click="addNewBlock"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Thêm Block Nối Tiếp (Block #{{ blocks.length + 1 }})
        </button>
      </div>
    </div>

    <!-- JSON Preview & Edit Modal -->
    <dialog class="modal" :class="{ 'modal-open': showJsonModal }">
      <div class="modal-box max-w-2xl bg-base-200 border border-base-content/10">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10">
          <div class="flex items-center gap-2">
            <Code class="w-4 h-4 text-primary" />
            <h3 class="font-bold text-sm">Cấu Trúc JSON Flow Blocks</h3>
          </div>
          <button type="button" class="btn btn-sm btn-ghost btn-circle" @click="showJsonModal = false">
            ✕
          </button>
        </div>

        <div class="py-4 space-y-2">
          <p class="text-xs text-base-content/70">
            Dữ liệu JSON các Function Block hiện tại. Bạn có thể sao chép hoặc dán JSON để nhập nhanh kịch bản:
          </p>
          <textarea
            v-model="rawJsonInput"
            class="textarea textarea-bordered font-mono text-xs w-full h-64 bg-base-300 text-base-content/90"
            placeholder="[ ... ]"
          ></textarea>
        </div>

        <div class="modal-action flex items-center justify-between">
          <button type="button" class="btn btn-sm btn-outline" @click="copyJsonToClipboard">
            Sao Chép JSON
          </button>
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-sm btn-ghost" @click="showJsonModal = false">
              Đóng
            </button>
            <button type="button" class="btn btn-sm btn-primary" @click="applyJsonInput">
              Áp Dụng JSON
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showJsonModal = false">
        <button>close</button>
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
  functionType: 'downlink_hex' | 'delay_wait' | 'trigger_buzzer' | 'reboot_cmd' | string;
  targetDevice: string; // 'DUT' hoặc devEui/id thiết bị simulation
  delaySeconds: number; // thời gian offset (giây) hoặc phút
  payloadHex: string;   // Hex downlink ví dụ '0101'
  fPort: number;        // default 10
  confirmed?: boolean;  // confirmed downlink
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

// Sync with modelValue prop
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(blocks.value)) {
      blocks.value = JSON.parse(JSON.stringify(newVal || []));
    }
  },
  { immediate: true, deep: true }
);

// Emit update when blocks change
function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(blocks.value)));
}

// Compute total duration of flow
const totalEstimatedSeconds = computed(() => {
  return blocks.value.reduce((acc, b) => acc + (Number(b.delaySeconds) || 0), 0);
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

function getFunctionBadgeClass(type: string) {
  switch (type) {
    case 'downlink_hex':
      return 'badge-primary text-primary-content';
    case 'delay_wait':
      return 'badge-warning text-warning-content';
    case 'trigger_buzzer':
      return 'badge-accent text-accent-content';
    case 'reboot_cmd':
      return 'badge-error text-error-content';
    default:
      return 'badge-neutral';
  }
}

function getFunctionLabel(type: string) {
  switch (type) {
    case 'downlink_hex':
      return 'GỬI DOWNLINK HEX';
    case 'delay_wait':
      return 'CHỜ / DELAY';
    case 'trigger_buzzer':
      return 'KÍCH HOẠT CÒI';
    case 'reboot_cmd':
      return 'REBOOT NODE';
    default:
      return 'HÀM TÙY BIẾN';
  }
}

// Block Actions
function addNewBlock() {
  const newBlock: FlowBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: 'downlink_hex',
    targetDevice: 'DUT',
    delaySeconds: blocks.value.length === 0 ? 0 : 30,
    payloadHex: '',
    fPort: 10,
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
      blocks.value = parsed;
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
