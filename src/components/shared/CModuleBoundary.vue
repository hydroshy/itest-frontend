<template>
  <div v-if="hasError" class="p-6 my-3 rounded-lg border border-dashed border-warning/40 bg-base-300/40 text-center">
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xl font-bold">
        ⚠️
      </div>
      <div>
        <h4 class="text-base font-bold text-base-content">{{ title || 'Lỗi tải thành phần' }}</h4>
        <p class="text-xs text-error mt-1 font-mono break-all max-w-md">{{ errorMessage }}</p>
      </div>
      <button class="btn btn-warning btn-sm gap-1" @click="retry">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Thử lại
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    moduleName?: string;
  }>(),
  {
    title: 'Lỗi tải mô-đun',
    moduleName: 'Plugin/Component',
  }
);

const emit = defineEmits<{
  (e: 'error', error: Error): void;
}>();

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true;
  errorMessage.value = `${props.moduleName}: ${err.message || 'Lỗi không xác định'}`;
  console.error(`[CModuleBoundary] Captured error in ${props.moduleName}:`, err, info);
  emit('error', err);
  // Stop propagation so Shell navigation and other modules are not disrupted
  return false;
});

function retry() {
  hasError.value = false;
  errorMessage.value = '';
}
</script>
