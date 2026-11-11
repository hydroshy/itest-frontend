<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <!-- ITEM_CODE Field -->
    <div class="form-control relative" ref="itemContainerRef">
      <label class="label py-0.5 flex items-center justify-between">
        <span class="label-text font-semibold" :class="labelClass">
          {{ itemLabel || 'ITEM_CODE' }}
        </span>
        <span
          v-if="catalogItemCodes.length > 0"
          class="badge badge-xs badge-info font-mono text-[9px]"
        >
          {{ catalogItemCodes.length }} có sẵn
        </span>
      </label>

      <div class="relative w-full">
        <input
          :value="modelItemCode"
          type="text"
          :disabled="disabled"
          :class="[
            sizeClass,
            'input input-bordered w-full font-mono uppercase bg-base-100 pr-7 transition-all',
            showItemDropdown ? 'ring-2 ring-primary/40 border-primary' : '',
          ]"
          placeholder="Chọn hoặc tự nhập ITEM_CODE..."
          @focus="openItemDropdown"
          @input="onItemInput"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
          @click="toggleItemDropdown"
        >
          <ChevronDown
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'rotate-180 text-primary': showItemDropdown }"
          />
        </button>
      </div>

      <!-- ITEM_CODE Dropdown Menu -->
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="showItemDropdown"
          class="absolute left-0 right-0 top-full mt-1 z-50 p-1.5 shadow-xl bg-base-100 rounded-box border border-base-300 max-h-56 overflow-y-auto space-y-1"
        >
          <div class="text-[10px] text-base-content/50 uppercase font-bold px-2 py-1 flex items-center justify-between border-b border-base-200">
            <span>Danh sách ITEM_CODE hiện có</span>
            <span class="font-normal lowercase">chọn hoặc tự gõ</span>
          </div>
          <ul class="menu menu-compact p-0 font-mono text-xs">
            <li v-for="code in filteredItemCodes" :key="code">
              <a
                class="py-1 px-2 flex items-center justify-between hover:bg-primary/10 rounded"
                :class="{ 'active font-bold': modelItemCode?.toUpperCase() === code }"
                @mousedown.prevent="selectItemCode(code)"
              >
                <span class="font-semibold text-primary">{{ code }}</span>
                <span
                  v-if="catalogItemFwMap[code]?.length"
                  class="badge badge-xs badge-ghost text-[9px] font-mono text-base-content/60"
                >
                  {{ catalogItemFwMap[code].length }} FW
                </span>
              </a>
            </li>
            <li v-if="filteredItemCodes.length === 0" class="p-2 text-center text-xs text-base-content/50 italic">
              Không có mã trùng khớp. Bạn có thể tự nhập mã mới.
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- FW_VERSION Field -->
    <div class="form-control relative" ref="fwContainerRef">
      <label class="label py-0.5 flex items-center justify-between">
        <span class="label-text font-semibold" :class="labelClass">
          {{ fwLabel || 'FW_VERSION' }}
        </span>
        <span
          v-if="availableFwList.length > 0"
          class="badge badge-xs badge-success font-mono text-[9px]"
        >
          {{ availableFwList.length }} FW theo mã
        </span>
      </label>

      <div class="relative w-full">
        <input
          :value="modelFwVersion"
          type="text"
          :disabled="disabled"
          :class="[
            sizeClass,
            'input input-bordered w-full font-mono uppercase bg-base-100 pr-7 transition-all',
            showFwDropdown ? 'ring-2 ring-primary/40 border-primary' : '',
            !isFwValid && modelFwVersion ? 'input-warning' : '',
          ]"
          :placeholder="modelItemCode ? `Chọn hoặc tự nhập FW cho ${modelItemCode}...` : 'Chọn hoặc tự nhập FW_VERSION...'"
          @focus="openFwDropdown"
          @input="onFwInput"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
          @click="toggleFwDropdown"
        >
          <ChevronDown
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'rotate-180 text-primary': showFwDropdown }"
          />
        </button>
      </div>

      <label v-if="showFwValidation && !isFwValid && modelFwVersion" class="label py-0.5">
        <span class="label-text-alt text-[10px] text-warning font-medium">
          Cấu trúc: XXFXXXX (ví dụ: 4F0505, 32F0505)
        </span>
      </label>

      <!-- FW_VERSION Dropdown Menu -->
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="showFwDropdown"
          class="absolute left-0 right-0 top-full mt-1 z-50 p-1.5 shadow-xl bg-base-100 rounded-box border border-base-300 max-h-56 overflow-y-auto space-y-1"
        >
          <div class="text-[10px] text-base-content/50 uppercase font-bold px-2 py-1 flex items-center justify-between border-b border-base-200">
            <span>
              {{ modelItemCode ? `FW tương ứng với ${modelItemCode}` : 'Danh sách FW có sẵn' }}
            </span>
            <span class="font-normal lowercase">chọn hoặc tự gõ</span>
          </div>
          <ul class="menu menu-compact p-0 font-mono text-xs">
            <li v-for="fw in filteredFwList" :key="fw">
              <a
                class="py-1 px-2 flex items-center justify-between hover:bg-success/10 rounded"
                :class="{ 'active font-bold': modelFwVersion?.toUpperCase() === fw }"
                @mousedown.prevent="selectFwVersion(fw)"
              >
                <span class="font-semibold text-success">{{ fw }}</span>
                <span class="text-[10px] text-base-content/40">phiên bản</span>
              </a>
            </li>
            <li v-if="filteredFwList.length === 0" class="p-2 text-center text-xs text-base-content/50 italic">
              Không có FW tương ứng có sẵn. Bạn có thể tự nhập phiên bản mới.
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useItemFwCatalog } from '../composables/useItemFwCatalog';

const props = withDefaults(
  defineProps<{
    modelItemCode?: string;
    modelFwVersion?: string;
    itemLabel?: string;
    fwLabel?: string;
    size?: 'sm' | 'xs';
    showFwValidation?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelItemCode: '',
    modelFwVersion: '',
    itemLabel: 'ITEM_CODE',
    fwLabel: 'FW_VERSION',
    size: 'sm',
    showFwValidation: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelItemCode', value: string): void;
  (e: 'update:modelFwVersion', value: string): void;
  (e: 'change'): void;
}>();

const { itemCodes: catalogItemCodes, fwByItemCode: catalogItemFwMap, allFwVersions: catalogAllFw, loadCatalog, getFwListForItem } = useItemFwCatalog();

const showItemDropdown = ref(false);
const showFwDropdown = ref(false);
const itemContainerRef = ref<HTMLElement | null>(null);
const fwContainerRef = ref<HTMLElement | null>(null);

const sizeClass = computed(() => (props.size === 'xs' ? 'input-xs text-xs' : 'input-sm text-xs'));
const labelClass = computed(() => (props.size === 'xs' ? 'text-[11px]' : 'text-xs'));

// FW structure validation (e.g. 4F0505, 32F0505)
const isFwValid = computed(() => {
  if (!props.modelFwVersion) return true;
  return /^[0-9]+F[0-9]+$/i.test(props.modelFwVersion.trim());
});

// Filtered Item Codes based on typed input
const filteredItemCodes = computed(() => {
  const current = (props.modelItemCode || '').trim().toUpperCase();
  if (!current) return catalogItemCodes.value;
  return catalogItemCodes.value.filter((c) => c.toUpperCase().includes(current));
});

// Available FW versions for the selected Item Code
const availableFwList = computed(() => {
  return getFwListForItem(props.modelItemCode || '');
});

// Filtered FW list based on typed FW input
const filteredFwList = computed(() => {
  const currentFw = (props.modelFwVersion || '').trim().toUpperCase();
  if (!currentFw) return availableFwList.value;
  return availableFwList.value.filter((f) => f.toUpperCase().includes(currentFw));
});

function openItemDropdown() {
  if (props.disabled) return;
  showItemDropdown.value = true;
  showFwDropdown.value = false;
}

function toggleItemDropdown() {
  if (props.disabled) return;
  showItemDropdown.value = !showItemDropdown.value;
  if (showItemDropdown.value) showFwDropdown.value = false;
}

function openFwDropdown() {
  if (props.disabled) return;
  showFwDropdown.value = true;
  showItemDropdown.value = false;
}

function toggleFwDropdown() {
  if (props.disabled) return;
  showFwDropdown.value = !showFwDropdown.value;
  if (showFwDropdown.value) showItemDropdown.value = false;
}

function onItemInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const val = target.value.toUpperCase();
  emit('update:modelItemCode', val);
  showItemDropdown.value = true;
  emit('change');
}

function selectItemCode(code: string) {
  emit('update:modelItemCode', code);
  showItemDropdown.value = false;

  // Auto-select first FW version for this Item Code if available and current FW is not in the list
  const fws = getFwListForItem(code);
  if (fws.length > 0 && (!props.modelFwVersion || !fws.includes(props.modelFwVersion.toUpperCase()))) {
    emit('update:modelFwVersion', fws[0]);
  }
  emit('change');
}

function onFwInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const val = target.value.toUpperCase();
  emit('update:modelFwVersion', val);
  showFwDropdown.value = true;
  emit('change');
}

function selectFwVersion(fw: string) {
  emit('update:modelFwVersion', fw);
  showFwDropdown.value = false;
  emit('change');
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (itemContainerRef.value && !itemContainerRef.value.contains(target)) {
    showItemDropdown.value = false;
  }
  if (fwContainerRef.value && !fwContainerRef.value.contains(target)) {
    showFwDropdown.value = false;
  }
}

onMounted(() => {
  loadCatalog();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
