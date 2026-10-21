<template>
  <div v-if="hasError" class="c-module-boundary-error">
    <el-result
      icon="warning"
      :title="title || 'Lỗi tải thành phần'"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button type="primary" size="small" @click="retry">
          Thử lại
        </el-button>
      </template>
    </el-result>
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

<style scoped>
.c-module-boundary-error {
  padding: 16px;
  background-color: var(--el-fill-color-light, #fafafa);
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  margin: 12px 0;
}
</style>
