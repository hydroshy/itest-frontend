<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
    <!-- KPI 1: Trạng thái Shell -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] hover:border-emerald-500/50 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-lg">
          <font-awesome-icon :icon="['fas', 'desktop']" />
        </div>
        <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
          SYS.OK
        </span>
      </div>
      <div class="mt-4">
        <span class="text-xs font-display font-bold text-[var(--owl-text-secondary)] uppercase tracking-wider block">Trạng thái Shell</span>
        <div class="text-2xl font-black font-display text-[var(--owl-text-primary)] mt-1">Hoạt động</div>
      </div>
      <div class="text-[11px] text-[var(--owl-text-secondary)] font-semibold mt-3 pt-3 border-t border-[var(--owl-border-light)] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Phản hồi &lt; 5ms</span>
      </div>
    </div>

    <!-- KPI 2: Plugins đã nạp -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] hover:border-sky-500/50 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 text-lg">
          <font-awesome-icon :icon="['fas', 'cubes']" />
        </div>
        <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/20">
          ONLINE
        </span>
      </div>
      <div class="mt-4">
        <span class="text-xs font-display font-bold text-[var(--owl-text-secondary)] uppercase tracking-wider block">Plugins Hệ thống</span>
        <div class="text-2xl font-black font-display text-[var(--owl-text-primary)] mt-1">
          {{ pluginStore.activePlugins.length }}
          <span class="text-xs font-bold text-[var(--owl-text-muted)] font-mono">/ {{ pluginStore.plugins.length }} nạp</span>
        </div>
      </div>
      <div class="text-[11px] text-[var(--owl-text-secondary)] font-semibold mt-3 pt-3 border-t border-[var(--owl-border-light)] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-sky-400"></span>
        <span>Kiến trúc mở Dynamic Module</span>
      </div>
    </div>

    <!-- KPI 3: Menu nghiệp vụ -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] hover:border-blue-500/50 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 text-lg">
          <font-awesome-icon :icon="['fas', 'border-all']" />
        </div>
        <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20">
          APP.ROUTED
        </span>
      </div>
      <div class="mt-4">
        <span class="text-xs font-display font-bold text-[var(--owl-text-secondary)] uppercase tracking-wider block">Menu & Launcher</span>
        <div class="text-2xl font-black font-display text-[var(--owl-text-primary)] mt-1">
          {{ pluginStore.menus.length }}
          <span class="text-xs font-bold text-[var(--owl-text-muted)]">mục</span>
        </div>
      </div>
      <div class="text-[11px] text-[var(--owl-text-secondary)] font-semibold mt-3 pt-3 border-t border-[var(--owl-border-light)] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span>Phân quyền vai trò người dùng</span>
      </div>
    </div>

    <!-- KPI 4: Tiện ích Widgets -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] hover:border-amber-500/50 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 text-lg">
          <font-awesome-icon :icon="['fas', 'microchip']" />
        </div>
        <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/20">
          ACTIVE
        </span>
      </div>
      <div class="mt-4">
        <span class="text-xs font-display font-bold text-[var(--owl-text-secondary)] uppercase tracking-wider block">Tiện ích Widgets</span>
        <div class="text-2xl font-black font-display text-[var(--owl-text-primary)] mt-1">
          {{ pluginStore.widgets.length }}
          <span class="text-xs font-bold text-[var(--owl-text-muted)]">slot</span>
        </div>
      </div>
      <div class="text-[11px] text-[var(--owl-text-secondary)] font-semibold mt-3 pt-3 border-t border-[var(--owl-border-light)] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>Giao diện nhúng trực tiếp</span>
      </div>
    </div>

    <!-- KPI 5: Phân quyền & Bảo mật -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] hover:border-indigo-500/50 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 text-lg">
          <font-awesome-icon :icon="['fas', 'shield-halved']" />
        </div>
        <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
          RBAC
        </span>
      </div>
      <div class="mt-4">
        <span class="text-xs font-display font-bold text-[var(--owl-text-secondary)] uppercase tracking-wider block">Bảo mật & RBAC</span>
        <div class="text-2xl font-black font-display text-[var(--owl-text-primary)] mt-1 truncate">
          {{ rolesCount }}
          <span class="text-xs font-bold text-[var(--owl-text-muted)]">vai trò</span>
        </div>
      </div>
      <div class="text-[11px] text-[var(--owl-text-secondary)] font-semibold mt-3 pt-3 border-t border-[var(--owl-border-light)] flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span>Kiểm soát truy cập chuẩn</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePluginStore } from '@/stores/plugin';

defineProps<{
  rolesCount: number;
}>();

const pluginStore = usePluginStore();
</script>
