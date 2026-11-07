<template>
  <div class="space-y-6">
    <!-- Role Selector & Actions Bar -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--owl-bg-card)] border border-[var(--owl-border)]">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <label class="text-xs font-bold uppercase tracking-wider text-[var(--owl-text-secondary)] font-display shrink-0">
          Chọn Vai trò cấu hình:
        </label>
        <select
          v-model="internalSelectedRole"
          class="select select-sm h-10 rounded-xl bg-[var(--owl-bg-surface)] border-[var(--owl-border)] text-xs font-bold text-[var(--owl-text-primary)] focus:border-blue-500 w-full sm:w-64"
          :disabled="loadingPerms || savingPerms"
          @change="$emit('roleChange', internalSelectedRole)"
        >
          <option v-for="r in rolesList" :key="r.code" :value="r.code">
            {{ r.name }} ({{ r.code }})
          </option>
        </select>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <button
          type="button"
          class="btn btn-sm h-10 px-4 rounded-xl bg-[var(--owl-bg-surface)] hover:bg-[var(--owl-bg-card-hover)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          :disabled="loadingPerms || savingPerms"
          @click="$emit('refresh')"
        >
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" :class="{ 'animate-spin': loadingPerms }" class="text-blue-500 text-xs" />
          <span>Tải lại</span>
        </button>

        <button
          type="button"
          class="btn btn-sm h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-none text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          :disabled="loadingPerms || savingPerms"
          @click="$emit('save')"
        >
          <span v-if="savingPerms" class="loading loading-spinner loading-xs"></span>
          <font-awesome-icon v-else :icon="['fas', 'floppy-disk']" class="text-white text-xs" />
          <span>{{ savingPerms ? 'Đang lưu...' : 'Lưu cấu hình quyền' }}</span>
        </button>
      </div>
    </div>

    <!-- Menu Permission Table -->
    <div class="overflow-x-auto rounded-2xl border border-[var(--owl-border)] bg-[var(--owl-bg-card)]">
      <table class="table table-sm w-full text-xs">
        <thead class="bg-[var(--owl-bg-surface)] text-[var(--owl-text-secondary)] font-display font-bold text-xs tracking-wider uppercase border-b border-[var(--owl-border)]">
          <tr>
            <th class="text-center w-36">Cho phép hiển thị</th>
            <th class="min-w-[200px]">Tên Menu / Tính năng</th>
            <th class="w-48">Mã ID Menu</th>
            <th class="min-w-[240px]">Mô tả chức năng</th>
            <th class="min-w-[180px]">Đường dẫn (Route)</th>
            <th class="text-center w-28">Phân loại</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--owl-border-light)] text-[var(--owl-text-primary)] font-sans">
          <tr v-if="loadingPerms">
            <td colspan="6" class="text-center py-8">
              <span class="loading loading-spinner loading-md text-blue-600"></span>
            </td>
          </tr>
          <tr v-else-if="menuItemsList.length === 0">
            <td colspan="6" class="text-center py-8 text-[var(--owl-text-muted)] font-semibold">
              Không có mục menu nào
            </td>
          </tr>
          <tr
            v-else
            v-for="row in menuItemsList"
            :key="row.id"
            class="hover:bg-blue-500/[0.04] transition-colors"
          >
            <td class="text-center">
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary rounded-md"
                :checked="allowedMenuIds.includes(row.id)"
                :disabled="loadingPerms || savingPerms"
                @change="$emit('toggleMenu', row.id)"
              />
            </td>
            <td>
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 text-xs">
                  <CyberIcon :name="row.icon || 'monitor'" :size="14" />
                </div>
                <div>
                  <div class="font-bold text-[var(--owl-text-primary)] text-xs">{{ row.name }}</div>
                  <div v-if="row.parentId" class="text-[10px] text-[var(--owl-text-muted)] font-mono">
                    Thuộc nhóm: {{ row.parentId }}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <code class="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                {{ row.id }}
              </code>
            </td>
            <td class="text-[var(--owl-text-secondary)] font-medium text-xs">{{ row.description || 'Chức năng hệ thống' }}</td>
            <td>
              <span class="font-mono text-[11px] text-[var(--owl-text-muted)] font-semibold">{{ row.route }}</span>
            </td>
            <td class="text-center">
              <span
                class="badge badge-sm font-mono text-[10px] font-bold"
                :class="row.category === 'CORE'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'"
              >
                {{ row.category }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CyberIcon from '@/components/shared/CyberIcon.vue';

const props = defineProps<{
  selectedRole: string;
  rolesList: any[];
  menuItemsList: any[];
  allowedMenuIds: string[];
  loadingPerms: boolean;
  savingPerms: boolean;
}>();

const emit = defineEmits<{
  (e: 'roleChange', role: string): void;
  (e: 'refresh'): void;
  (e: 'save'): void;
  (e: 'toggleMenu', menuId: string): void;
}>();

const internalSelectedRole = ref(props.selectedRole);

watch(() => props.selectedRole, (newVal) => {
  internalSelectedRole.value = newVal;
});
</script>
