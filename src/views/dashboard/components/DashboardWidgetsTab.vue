<template>
  <div>
    <div v-if="pluginStore.widgets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="widget in pluginStore.widgets"
        :key="widget.id"
        class="card bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-2xl overflow-hidden flex flex-col"
        :class="{
          'md:col-span-2 lg:col-span-2': widget.width === 'half',
          'md:col-span-2 lg:col-span-3': widget.width === 'full'
        }"
      >
        <div class="card-body p-5 flex flex-col h-full">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-[var(--owl-border-light)]">
            <span class="card-title text-sm font-black text-[var(--owl-text-primary)] font-display m-0">{{ widget.title }}</span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              {{ widget.id }}
            </span>
          </div>
          <div class="flex-1 w-full overflow-hidden">
            <CModuleBoundary :moduleName="`Widget:${widget.id}`">
              <component :is="widget.component" />
            </CModuleBoundary>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Widgets State -->
    <div
      v-else
      class="text-center py-16 px-4 border border-dashed border-[var(--owl-border)] rounded-3xl bg-[var(--owl-bg-card)]/50"
    >
      <div class="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 text-2xl">
        <font-awesome-icon :icon="['fas', 'cubes']" />
      </div>
      <h3 class="text-base font-black text-[var(--owl-text-primary)] font-display">Chưa có Widget nào được nạp</h3>
      <p class="text-xs font-semibold text-[var(--owl-text-secondary)] max-w-md mx-auto mt-1 leading-relaxed">
        Các plugin đã cài đặt hiện không cung cấp tiện ích hiển thị trang chủ hoặc đang ở chế độ xem độc lập.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePluginStore } from '@/stores/plugin';
import CModuleBoundary from '@/components/shared/CModuleBoundary.vue';

const pluginStore = usePluginStore();
</script>
