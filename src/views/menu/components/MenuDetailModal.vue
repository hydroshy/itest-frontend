<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible && card"
        class="modal modal-open fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div class="modal-box max-w-2xl bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-3xl p-6 text-[var(--owl-text-primary)] max-h-[85vh] flex flex-col relative z-10 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-[var(--owl-border-light)]">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg">
                <CyberIcon :name="card.icon || 'cubes'" :size="20" />
              </div>
              <div>
                <h3 class="text-base font-bold font-display text-[var(--owl-text-primary)] flex items-center gap-2">
                  {{ card.title }}
                  <span class="badge badge-sm badge-outline font-mono text-[10px] border-blue-500/30 text-blue-600 dark:text-blue-400">
                    {{ card.pluginId || card.category }}
                  </span>
                </h3>
                <p class="text-xs text-[var(--owl-text-secondary)] font-medium mt-0.5 line-clamp-1">{{ card.description }}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-circle text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)]"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div class="p-2.5 rounded-xl bg-[var(--owl-bg-card)] border border-[var(--owl-border)]">
                <div class="text-[10px] text-[var(--owl-text-muted)] uppercase font-mono font-bold">Đường dẫn Route</div>
                <div class="font-mono font-bold text-[var(--owl-text-primary)] mt-0.5 truncate">{{ card.route || card.path || 'N/A' }}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-[var(--owl-bg-card)] border border-[var(--owl-border)]">
                <div class="text-[10px] text-[var(--owl-text-muted)] uppercase font-mono font-bold">Phân loại</div>
                <div class="font-bold text-[var(--owl-text-primary)] mt-0.5 capitalize">{{ card.category || 'Plugin' }}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-[var(--owl-bg-card)] border border-[var(--owl-border)]">
                <div class="text-[10px] text-[var(--owl-text-muted)] uppercase font-mono font-bold">Trạng thái Adapter</div>
                <div class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>

            <!-- Specific Detail section for Final Config -->
            <div v-if="card.pluginId === 'final-config' || card.id?.includes('final-config')" class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[var(--owl-text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'microchip']" class="text-blue-500" />
                  <span>Danh sách Profile Final Config ({{ profiles.length }})</span>
                </h4>
                <span v-if="loading" class="loading loading-spinner loading-xs text-blue-500"></span>
              </div>

              <div v-if="loading" class="py-8 text-center text-xs text-[var(--owl-text-muted)] font-semibold">
                Đang tải dữ liệu cấu hình Final Config...
              </div>

              <div v-else-if="profiles.length === 0" class="py-6 text-center text-xs text-[var(--owl-text-muted)] bg-[var(--owl-bg-card)]/50 rounded-xl border border-dashed border-[var(--owl-border)]">
                Chưa có profile Final Config nào được lưu trong hệ thống.
              </div>

              <div v-else class="border border-[var(--owl-border)] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table class="table table-xs w-full bg-[var(--owl-bg-card)]">
                  <thead class="bg-[var(--owl-bg-surface)] text-[11px] text-[var(--owl-text-secondary)] font-bold sticky top-0">
                    <tr>
                      <th>Tên Profile</th>
                      <th>Mã Thiết bị</th>
                      <th>Phiên bản FW</th>
                      <th>Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--owl-border-light)] text-[var(--owl-text-primary)]">
                    <tr v-for="p in profiles" :key="p.id" class="hover:bg-blue-500/[0.04]">
                      <td class="font-bold text-blue-600 dark:text-blue-400">{{ p.name }}</td>
                      <td class="font-mono text-[11px]">{{ p.device_code || p.deviceCode || '-' }}</td>
                      <td class="font-mono text-[11px]">{{ p.fw_version || p.fwVersion || '-' }}</td>
                      <td class="text-[10px] text-[var(--owl-text-muted)]">{{ p.updated_at || p.updatedAt ? new Date(p.updated_at || p.updatedAt).toLocaleDateString('vi-VN') : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-[var(--owl-border-light)] flex items-center justify-end gap-3">
            <button
              type="button"
              class="btn btn-sm px-4 rounded-xl bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] text-[var(--owl-text-primary)] border border-[var(--owl-border)] text-xs font-bold"
              @click="$emit('close')"
            >
              Đóng
            </button>
            <button
              type="button"
              class="btn btn-sm px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-none text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
              @click="$emit('open', card)"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              <span>Mở Phân Hệ</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import CyberIcon from '@/components/shared/CyberIcon.vue';

defineProps<{
  visible: boolean;
  card: any;
  profiles: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'open', card: any): void;
}>();
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
