<template>
  <div class="plugin-list-container flex flex-col gap-6 p-4 sm:p-6 bg-[var(--owl-bg-canvas)] min-h-full text-[var(--owl-text-primary)] transition-colors">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--owl-bg-surface)] p-5 rounded-2xl border border-[var(--owl-border)] shadow-sm">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold font-display text-[var(--owl-text-primary)] tracking-wide flex items-center gap-2.5">
          <CyberIcon name="plugins" :size="24" color="#2563eb" />
          <span>Quản lý Plugin Frontend</span>
        </h2>
        <p class="text-xs text-[var(--owl-text-secondary)] mt-1 font-sans">
          Danh sách các plugin được biên dịch tại build-time cùng Frontend Shell
        </p>
      </div>
      <div class="badge badge-outline gap-2 font-mono text-xs py-3 px-4 border-blue-500/30 bg-[var(--owl-bg-card)] text-blue-600 dark:text-blue-300 rounded-xl">
        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        SDK v{{ pluginStore.diagnostics.sdkVersion }} | Tự động sinh lúc: {{ formattedDate }}
      </div>
    </div>

    <!-- Table Card Container -->
    <div class="card bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] shadow-sm rounded-2xl overflow-hidden transition-colors">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-left">
          <!-- head -->
          <thead>
            <tr class="bg-[var(--owl-bg-aside)] border-b border-[var(--owl-border)] text-[var(--owl-text-secondary)] font-sans text-xs uppercase tracking-wider">
              <th class="py-3.5 px-4">Mã Plugin (ID)</th>
              <th class="py-3.5 px-4">Tên hiển thị</th>
              <th class="py-3.5 px-4 text-center">Phiên bản</th>
              <th class="py-3.5 px-4">Mô tả</th>
              <th class="py-3.5 px-4 text-center">Trạng thái</th>
              <th class="py-3.5 px-4 text-center">Điểm gắn (Slots)</th>
              <th class="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--owl-border-light)] text-xs font-sans">
            <tr
              v-for="row in pluginStore.plugins"
              :key="row.definition.manifest.id"
              class="hover:bg-[var(--owl-bg-card-hover)] transition-colors"
            >
              <!-- Plugin ID -->
              <td class="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ row.definition.manifest.id }}
              </td>

              <!-- Display Name -->
              <td class="py-3.5 px-4 font-semibold text-[var(--owl-text-primary)]">
                {{ row.definition.manifest.name }}
              </td>

              <!-- Version -->
              <td class="py-3.5 px-4 text-center">
                <span class="badge badge-sm badge-outline font-mono border-[var(--owl-border)] text-[var(--owl-text-secondary)] bg-[var(--owl-bg-card)]">
                  {{ row.definition.manifest.version }}
                </span>
              </td>

              <!-- Description -->
              <td class="py-3.5 px-4 text-[var(--owl-text-secondary)] max-w-xs truncate" :title="row.definition.manifest.description">
                {{ row.definition.manifest.description || 'Không có mô tả' }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="badge badge-sm font-sans font-medium rounded-full"
                  :class="row.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/15 text-[var(--owl-text-muted)] border border-[var(--owl-border)]'"
                >
                  {{ row.status === 'active' ? 'Đang hoạt động' : 'Tắt' }}
                </span>
              </td>

              <!-- Extension Points -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex flex-wrap gap-1 justify-center">
                  <span
                    v-for="ext in (row.definition.manifest.extensions || [])"
                    :key="ext.slot"
                    class="badge badge-xs font-mono bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20"
                  >
                    {{ ext.slot }}
                  </span>
                  <span
                    v-if="!(row.definition.manifest.extensions?.length)"
                    class="text-[var(--owl-text-muted)] text-[11px] italic"
                  >
                    (Không có)
                  </span>
                </div>
              </td>

              <!-- Toggle Action -->
              <td class="py-3.5 px-4 text-center">
                <input
                  type="checkbox"
                  class="toggle toggle-sm bg-[var(--owl-bg-card)] border-[var(--owl-border)] checked:bg-blue-600 checked:border-blue-600"
                  :checked="row.status === 'active'"
                  @change="togglePlugin(row)"
                />
              </td>
            </tr>

            <tr v-if="pluginStore.plugins.length === 0">
              <td colspan="7" class="py-8 text-center text-[var(--owl-text-muted)] font-sans">
                Không tìm thấy plugin nào được nạp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePluginStore } from '@/stores/plugin';
import type { FrontendPluginInstance } from '@itest/frontend-sdk';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import { cyberToast } from '@/services/cyberToast';

const pluginStore = usePluginStore();

const formattedDate = computed(() => {
  const ts = pluginStore.diagnostics.generatedAt;
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleString('vi-VN');
});

async function togglePlugin(plugin: FrontendPluginInstance) {
  try {
    if (plugin.status === 'disabled') {
      await pluginStore.enablePlugin(plugin.definition.manifest.id);
      cyberToast.success(`Đã kích hoạt plugin "${plugin.definition.manifest.name}"`);
    } else {
      await pluginStore.disablePlugin(plugin.definition.manifest.id);
      cyberToast.info(`Đã tắt plugin "${plugin.definition.manifest.name}"`);
    }
  } catch (err: any) {
    cyberToast.error(`Lỗi thay đổi trạng thái: ${err?.message || err}`);
  }
}
</script>
