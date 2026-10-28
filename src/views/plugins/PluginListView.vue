<template>
  <div class="plugin-list-container flex flex-col gap-6 p-4 sm:p-6 bg-[#011627] min-h-full text-[#d6deeb]">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b2942]/60 p-5 rounded-lg border border-[#1d3b5a]/60 shadow-lg backdrop-blur-md">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
          <CyberIcon name="plugins" :size="24" color="#00f0ff" />
          Quản lý Plugin Frontend
        </h2>
        <p class="text-xs text-[#94a3b8] mt-1 font-mono">
          Danh sách các plugin được biên dịch tại build-time cùng Frontend Shell
        </p>
      </div>
      <div class="badge badge-info badge-outline gap-2 font-mono text-xs py-3 px-4 border-[#00f0ff]/40 bg-[#081d32]/80">
        <span class="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
        SDK v{{ pluginStore.diagnostics.sdkVersion }} | Tự động sinh lúc: {{ formattedDate }}
      </div>
    </div>

    <!-- Table Card Container -->
    <div class="card bg-[#0b2942]/80 border border-[#1d3b5a] shadow-2xl rounded-lg overflow-hidden backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-left">
          <!-- head -->
          <thead>
            <tr class="bg-[#081d32] border-b border-[#1d3b5a] text-[#7fdbca] font-mono text-xs uppercase tracking-wider">
              <th class="py-3 px-4">Mã Plugin (ID)</th>
              <th class="py-3 px-4">Tên hiển thị</th>
              <th class="py-3 px-4 text-center">Phiên bản</th>
              <th class="py-3 px-4">Mô tả</th>
              <th class="py-3 px-4 text-center">Trạng thái</th>
              <th class="py-3 px-4 text-center">Điểm gắn (Slots)</th>
              <th class="py-3 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1d3b5a]/50 text-xs font-sans">
            <tr
              v-for="row in pluginStore.plugins"
              :key="row.definition.manifest.id"
              class="hover:bg-[#133e63]/40 transition-colors"
            >
              <!-- Plugin ID -->
              <td class="py-3 px-4 font-mono font-bold text-[#00f0ff]">
                {{ row.definition.manifest.id }}
              </td>

              <!-- Display Name -->
              <td class="py-3 px-4 font-semibold text-[#d6deeb]">
                {{ row.definition.manifest.name }}
              </td>

              <!-- Version -->
              <td class="py-3 px-4 text-center">
                <span class="badge badge-sm badge-outline font-mono border-[#7fdbca]/60 text-[#7fdbca] bg-[#011627]/50">
                  {{ row.definition.manifest.version }}
                </span>
              </td>

              <!-- Description -->
              <td class="py-3 px-4 text-[#94a3b8] max-w-xs truncate" :title="row.definition.manifest.description">
                {{ row.definition.manifest.description || 'Không có mô tả' }}
              </td>

              <!-- Status -->
              <td class="py-3 px-4 text-center">
                <span
                  class="badge badge-sm font-mono font-semibold"
                  :class="row.status === 'active' ? 'badge-success bg-[#7fdbca]/20 text-[#7fdbca] border-[#7fdbca]/40' : 'badge-ghost text-[#94a3b8] border-[#94a3b8]/40'"
                >
                  {{ row.status === 'active' ? 'Đang hoạt động' : 'Tắt' }}
                </span>
              </td>

              <!-- Extension Points -->
              <td class="py-3 px-4 text-center">
                <div class="flex flex-wrap gap-1 justify-center">
                  <span
                    v-for="ext in (row.definition.manifest.extensions || [])"
                    :key="ext.slot"
                    class="badge badge-xs badge-info font-mono bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30"
                  >
                    {{ ext.slot }}
                  </span>
                  <span
                    v-if="!(row.definition.manifest.extensions?.length)"
                    class="text-[#5f7e97] text-[11px] italic"
                  >
                    (Không có)
                  </span>
                </div>
              </td>

              <!-- Toggle Action -->
              <td class="py-3 px-4 text-center">
                <input
                  type="checkbox"
                  class="toggle toggle-sm toggle-info bg-[#081d32] border-[#1d3b5a] checked:bg-[#00f0ff] checked:border-[#00f0ff]"
                  :checked="row.status === 'active'"
                  @change="togglePlugin(row)"
                />
              </td>
            </tr>

            <tr v-if="pluginStore.plugins.length === 0">
              <td colspan="7" class="py-8 text-center text-[#5f7e97] font-mono">
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
import { ElMessage } from 'element-plus';

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
      ElMessage.success(`Đã kích hoạt plugin "${plugin.definition.manifest.name}"`);
    } else {
      await pluginStore.disablePlugin(plugin.definition.manifest.id);
      ElMessage.info(`Đã tắt plugin "${plugin.definition.manifest.name}"`);
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi thay đổi trạng thái: ${err?.message || err}`);
  }
}
</script>
