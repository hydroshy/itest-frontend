<template>
  <div class="plugin-list-container flex flex-col gap-6 p-4 sm:p-6 bg-[#0f172a] min-h-full text-[#f8fafc]">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151d2c] p-5 rounded-2xl border border-white/10 shadow-none backdrop-blur-md">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
          <CyberIcon name="plugins" :size="24" color="#7c3aed" />
          <span>Quản lý Plugin Frontend</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1 font-sans">
          Danh sách các plugin được biên dịch tại build-time cùng Frontend Shell
        </p>
      </div>
      <div class="badge badge-outline gap-2 font-mono text-xs py-3 px-4 border-violet-500/30 bg-[#1a2436] text-violet-300 rounded-xl">
        <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
        SDK v{{ pluginStore.diagnostics.sdkVersion }} | Tự động sinh lúc: {{ formattedDate }}
      </div>
    </div>

    <!-- Table Card Container -->
    <div class="card bg-[#151d2c] border border-white/10 shadow-none rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-left">
          <!-- head -->
          <thead>
            <tr class="bg-[#1a2436] border-b border-white/10 text-slate-300 font-sans text-xs uppercase tracking-wider">
              <th class="py-3.5 px-4">Mã Plugin (ID)</th>
              <th class="py-3.5 px-4">Tên hiển thị</th>
              <th class="py-3.5 px-4 text-center">Phiên bản</th>
              <th class="py-3.5 px-4">Mô tả</th>
              <th class="py-3.5 px-4 text-center">Trạng thái</th>
              <th class="py-3.5 px-4 text-center">Điểm gắn (Slots)</th>
              <th class="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-xs font-sans">
            <tr
              v-for="row in pluginStore.plugins"
              :key="row.definition.manifest.id"
              class="hover:bg-[#202c42]/50 transition-colors"
            >
              <!-- Plugin ID -->
              <td class="py-3.5 px-4 font-mono font-bold text-violet-400">
                {{ row.definition.manifest.id }}
              </td>

              <!-- Display Name -->
              <td class="py-3.5 px-4 font-semibold text-white">
                {{ row.definition.manifest.name }}
              </td>

              <!-- Version -->
              <td class="py-3.5 px-4 text-center">
                <span class="badge badge-sm badge-outline font-mono border-white/20 text-slate-300 bg-[#1a2436]">
                  {{ row.definition.manifest.version }}
                </span>
              </td>

              <!-- Description -->
              <td class="py-3.5 px-4 text-slate-400 max-w-xs truncate" :title="row.definition.manifest.description">
                {{ row.definition.manifest.description || 'Không có mô tả' }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="badge badge-sm font-sans font-medium rounded-full"
                  :class="row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/30 text-slate-400 border border-white/10'"
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
                    class="badge badge-xs font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {{ ext.slot }}
                  </span>
                  <span
                    v-if="!(row.definition.manifest.extensions?.length)"
                    class="text-slate-500 text-[11px] italic"
                  >
                    (Không có)
                  </span>
                </div>
              </td>

              <!-- Toggle Action -->
              <td class="py-3.5 px-4 text-center">
                <input
                  type="checkbox"
                  class="toggle toggle-sm bg-[#1a2436] border-white/20 checked:bg-violet-600 checked:border-violet-600"
                  :checked="row.status === 'active'"
                  @change="togglePlugin(row)"
                />
              </td>
            </tr>

            <tr v-if="pluginStore.plugins.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-500 font-sans">
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
