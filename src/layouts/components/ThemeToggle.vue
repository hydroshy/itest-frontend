<template>
  <button
    type="button"
    class="theme-toggle-btn relative inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 select-none cursor-pointer focus:outline-none"
    :class="isDark
      ? 'bg-slate-800/80 border-blue-500/30 text-amber-400 hover:bg-slate-800 hover:border-blue-400/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
      : 'bg-white border-slate-300 text-blue-600 hover:bg-slate-50 hover:border-blue-500 hover:shadow-sm'"
    :title="isDark ? 'Chuyển sang chế độ Sáng (Light Mode)' : 'Chuyển sang chế độ Tối (Dark Mode)'"
    :aria-label="isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'"
    @click="toggleTheme"
  >
    <!-- Sun icon in Dark mode -->
    <font-awesome-icon
      v-if="isDark"
      :icon="['fas', 'sun']"
      class="text-base transition-transform duration-200 hover:rotate-45"
    />

    <!-- Moon icon in Light mode -->
    <font-awesome-icon
      v-else
      :icon="['fas', 'moon']"
      class="text-base transition-transform duration-200 hover:-rotate-12"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.theme-toggle-btn {
  line-height: 1;
}
</style>
