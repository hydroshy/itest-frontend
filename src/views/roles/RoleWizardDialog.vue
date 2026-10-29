<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
    <!-- Wizard Modal Container -->
    <div
      class="relative w-full max-w-5xl bg-[#081d32]/95 border border-[#1d3b5a] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(0,240,255,0.15)] flex flex-col max-h-[92vh] overflow-hidden text-xs font-sans text-[#d6deeb]"
    >
      <!-- Cyber Top Ambient Glow line -->
      <div class="h-1 w-full bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>

      <!-- Close Button (Top Right) -->
      <button
        type="button"
        class="absolute top-4 right-4 text-[#5f7e97] hover:text-[#00f0ff] p-1.5 rounded-lg hover:bg-[#0b2942] transition-colors z-10"
        @click="visible = false"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="p-5 pb-3 border-b border-[#1d3b5a]/60 flex-shrink-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-block w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
          <span class="font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">RBAC WIZARD CONFIG</span>
        </div>
        <h3 class="text-base font-bold text-[#d6deeb] font-mono tracking-wide flex items-center gap-2">
          <span>Cấu hình Phân quyền &amp; Vai trò:</span>
          <span class="text-[#00f0ff] font-mono">{{ roleData?.name || roleData?.code || '' }}</span>
        </h3>
        <p class="text-[11px] text-[#5f7e97] mt-0.5">
          Quy trình 3 bước thiết lập tài khoản thành viên, quyền hạn chức năng API và các view menu hiển thị
        </p>
      </div>

      <!-- Stepper Indicator Bar -->
      <div class="px-5 py-3 bg-[#051321] border-b border-[#1d3b5a] flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
        <div
          v-for="(s, idx) in steps"
          :key="s.step"
          class="flex items-center gap-3 cursor-pointer select-none transition-all py-1 px-3 rounded-lg"
          :class="[
            currentStep === s.step ? 'bg-[#0b2942] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'hover:bg-[#0b2942]/40',
            currentStep > s.step ? 'opacity-90' : ''
          ]"
          @click="goToStep(s.step)"
        >
          <!-- Step Badge -->
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all"
            :class="[
              currentStep === s.step ? 'bg-[#00f0ff] text-[#011627] shadow-[0_0_8px_#00f0ff]' : '',
              currentStep > s.step ? 'bg-[#22da6e] text-[#011627]' : '',
              currentStep < s.step ? 'bg-[#081d32] border border-[#1d3b5a] text-[#5f7e97]' : ''
            ]"
          >
            <span v-if="currentStep > s.step">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </div>

          <!-- Step Info -->
          <div>
            <div
              class="font-mono text-xs font-bold uppercase tracking-wider"
              :class="currentStep === s.step ? 'text-[#00f0ff]' : (currentStep > s.step ? 'text-[#7fdbca]' : 'text-[#5f7e97]')"
            >
              {{ s.title }}
            </div>
            <div class="text-[10px] text-[#5f7e97] hidden sm:block">{{ s.desc }}</div>
          </div>

          <!-- Connector Arrow -->
          <div v-if="idx < steps.length - 1" class="text-[#1d3b5a] font-mono text-sm ml-2 hidden md:block">
            →
          </div>
        </div>
      </div>

      <!-- Wizard Body Content Area -->
      <div class="flex-1 p-5 overflow-y-auto min-h-[380px] max-h-[58vh]">
        <!-- Loading overlay -->
        <div v-if="loadingData" class="flex flex-col items-center justify-center py-20">
          <span class="loading loading-spinner text-[#00f0ff] loading-lg"></span>
          <span class="text-xs text-[#5f7e97] font-mono mt-3">Đang tải cấu hình phân quyền vai trò...</span>
        </div>

        <template v-else>
          <!-- STEP 1: ASSIGN USERS -->
          <div v-show="currentStep === 1" class="space-y-4">
            <!-- Header bar / search & actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[#051321] border border-[#1d3b5a] rounded-lg">
              <div class="relative flex-1 max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="Tìm theo tên đăng nhập, họ tên, email..."
                  class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div class="flex items-center gap-3">
                <span class="font-mono text-[11px] text-[#7fdbca]">
                  Đã gán: <strong class="text-[#00f0ff]">{{ selectedUserIds.length }}</strong> / {{ allUsers.length }} người dùng
                </span>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono"
                  @click="selectAllFilteredUsers"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#5f7e97] hover:text-[#ef5350] hover:bg-[#ef5350]/10 font-mono"
                  @click="clearAllUsers"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <!-- Users Table (DaisyUI) -->
            <div class="border border-[#1d3b5a] rounded-lg overflow-hidden bg-[#051321]">
              <div class="overflow-x-auto max-h-[380px]">
                <table class="table table-zebra table-pin-rows w-full text-xs">
                  <thead>
                    <tr class="bg-[#0b2942] border-b border-[#1d3b5a] text-[#7fdbca] font-mono uppercase tracking-wider">
                      <th class="w-12 text-center">
                        <input
                          type="checkbox"
                          class="checkbox checkbox-xs checkbox-primary border-[#1d3b5a]"
                          :checked="isAllVisibleUsersSelected"
                          @change="toggleSelectAllVisibleUsers"
                        />
                      </th>
                      <th>Tên người dùng</th>
                      <th>Email</th>
                      <th class="text-center w-28">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="filteredUsers.length === 0">
                      <td colspan="4" class="text-center py-10 text-[#5f7e97] font-mono">
                        Không tìm thấy người dùng nào phù hợp từ khóa
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="user in filteredUsers"
                      :key="user.id"
                      class="border-b border-[#1d3b5a]/30 hover:bg-[#0b2942]/40 transition-colors cursor-pointer"
                      :class="{ 'bg-[#00f0ff]/5': selectedUserIds.includes(user.id) }"
                      @click="toggleUserSelection(user.id)"
                    >
                      <td class="text-center" @click.stop>
                        <input
                          type="checkbox"
                          class="checkbox checkbox-xs checkbox-primary border-[#1d3b5a]"
                          :checked="selectedUserIds.includes(user.id)"
                          @change="toggleUserSelection(user.id)"
                        />
                      </td>
                      <td>
                        <div class="flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-full bg-[#0b2942] border border-[#1d3b5a] text-[#00f0ff] font-bold font-mono text-xs flex items-center justify-center flex-shrink-0">
                            {{ user.username.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <div class="font-mono font-bold text-[#00f0ff]">{{ user.username }}</div>
                            <div class="text-[10px] text-[#5f7e97]">{{ user.fullName || 'Chưa đặt tên' }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-mono text-[#d6deeb]/90">{{ user.email || '—' }}</td>
                      <td class="text-center">
                        <span
                          class="badge badge-xs font-mono text-[10px] px-2 py-0.5"
                          :class="user.isActive ? 'bg-[#22da6e]/20 text-[#22da6e] border border-[#22da6e]/40' : 'bg-[#ef5350]/20 text-[#ef5350] border border-[#ef5350]/40'"
                        >
                          {{ user.isActive ? 'Hoạt động' : 'Đã khóa' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- STEP 2: PLUGIN PERMISSIONS -->
          <div v-show="currentStep === 2" class="space-y-4">
            <!-- Header bar / search & actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[#051321] border border-[#1d3b5a] rounded-lg">
              <div class="relative flex-1 max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="permSearchQuery"
                  type="text"
                  placeholder="Tìm theo mã quyền hoặc tên quyền..."
                  class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div class="flex items-center gap-3">
                <span class="font-mono text-[11px] text-[#7fdbca]">
                  Đã cấp: <strong class="text-[#00f0ff]">{{ selectedPermissionIds.length }}</strong> / {{ totalPermissionsCount }} quyền
                </span>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono"
                  @click="toggleSelectAllPermissions(true)"
                >
                  Cấp tất cả
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#5f7e97] hover:text-[#ef5350] hover:bg-[#ef5350]/10 font-mono"
                  @click="toggleSelectAllPermissions(false)"
                >
                  Bỏ tất cả
                </button>
              </div>
            </div>

            <!-- Permission Groups Accordions -->
            <div v-if="filteredPermissionGroups.length === 0" class="text-center py-12 text-[#5f7e97] font-mono">
              Không tìm thấy quyền nào phù hợp từ khóa
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="group in filteredPermissionGroups"
                :key="group.module"
                class="border border-[#1d3b5a] rounded-lg bg-[#051321] overflow-hidden"
              >
                <!-- Group Header -->
                <div class="p-3 bg-[#0b2942]/60 border-b border-[#1d3b5a] flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#d6deeb]">{{ group.moduleTitle || group.module }}</span>
                    <span class="badge badge-xs bg-[#011627] border border-[#1d3b5a] font-mono text-[#5f7e97] text-[10px]">
                      {{ group.module }}
                    </span>
                    <span class="badge badge-xs bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-mono text-[10px]">
                      {{ group.selectedCount }} / {{ group.permissions.length }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono text-[11px]"
                      @click="toggleGroupPermissions(group, true)"
                    >
                      Chọn nhóm
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost text-[#5f7e97] hover:bg-[#ef5350]/10 hover:text-[#ef5350] font-mono text-[11px]"
                      @click="toggleGroupPermissions(group, false)"
                    >
                      Bỏ nhóm
                    </button>
                  </div>
                </div>

                <!-- Group Permissions Grid -->
                <div class="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#051321]">
                  <div
                    v-for="perm in group.permissions"
                    :key="perm.id"
                    class="p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none"
                    :class="isPermissionSelected(perm.id)
                      ? 'bg-[#00f0ff]/10 border-[#00f0ff]/60 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                      : 'bg-[#011627] border-[#1d3b5a]/60 hover:border-[#1d3b5a] hover:bg-[#0b2942]/30'"
                    @click="toggleSinglePermission(perm.id)"
                  >
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary border-[#1d3b5a] mt-0.5"
                      :checked="isPermissionSelected(perm.id)"
                      @click.stop="toggleSinglePermission(perm.id)"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-mono text-xs font-semibold text-[#00f0ff] truncate">{{ perm.code || perm.name }}</span>
                        <span
                          v-if="getActionTag(perm.action || perm.code)"
                          class="badge badge-xs font-mono text-[9px] px-1.5 py-0"
                          :class="getActionBadgeClass(getActionTag(perm.action || perm.code)?.type)"
                        >
                          {{ getActionTag(perm.action || perm.code)?.label }}
                        </span>
                      </div>
                      <div class="text-[11px] text-[#5f7e97] mt-0.5 line-clamp-1">
                        {{ perm.description || perm.name || 'Không có mô tả chi tiết' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: MENU VIEWS VISIBILITY -->
          <div v-show="currentStep === 3" class="space-y-4">
            <!-- Header bar / search & actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[#051321] border border-[#1d3b5a] rounded-lg">
              <div class="relative flex-1 max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="menuSearchQuery"
                  type="text"
                  placeholder="Tìm view/card menu theo tiêu đề, route, plugin..."
                  class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div class="flex items-center gap-3">
                <span class="font-mono text-[11px] text-[#7fdbca]">
                  Hiển thị: <strong class="text-[#00f0ff]">{{ selectedMenuIds.length }}</strong> / {{ allMenuItems.length }} mục menu
                </span>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono"
                  @click="toggleSelectAllMenus(true)"
                >
                  Bật tất cả
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost text-[#5f7e97] hover:text-[#ef5350] hover:bg-[#ef5350]/10 font-mono"
                  @click="toggleSelectAllMenus(false)"
                >
                  Ẩn tất cả
                </button>
              </div>
            </div>

            <!-- Menu Cards Grid -->
            <div v-if="filteredMenuItems.length === 0" class="text-center py-12 text-[#5f7e97] font-mono">
              Không tìm thấy mục menu nào phù hợp từ khóa
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="menu in filteredMenuItems"
                :key="menu.id"
                class="p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none"
                :class="isMenuSelected(menu.id)
                  ? 'bg-[#00f0ff]/10 border-[#00f0ff]/70 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-[#051321] border-[#1d3b5a] hover:border-[#1d3b5a]/80 opacity-60 hover:opacity-100'"
                @click="toggleMenuCard(menu.id)"
              >
                <!-- Card Header -->
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-[#0b2942] border border-[#1d3b5a] text-[#00f0ff] flex items-center justify-center flex-shrink-0">
                        <CyberIcon :name="menu.icon || 'Cpu'" class="w-4 h-4" />
                      </div>
                      <div>
                        <div class="font-bold text-[#d6deeb] leading-tight">{{ menu.title }}</div>
                        <div class="font-mono text-[10px] text-[#5f7e97] truncate max-w-[150px]">{{ menu.route || menu.path || '—' }}</div>
                      </div>
                    </div>

                    <!-- Switch toggle (DaisyUI) -->
                    <input
                      type="checkbox"
                      class="toggle toggle-sm toggle-primary border-[#1d3b5a]"
                      :checked="isMenuSelected(menu.id)"
                      @click.stop="toggleMenuCard(menu.id)"
                    />
                  </div>

                  <p class="text-[11px] text-[#5f7e97] mt-2.5 line-clamp-2 leading-relaxed">
                    {{ menu.description || 'Truy cập và thao tác màn hình chức năng.' }}
                  </p>
                </div>

                <!-- Card Footer Meta -->
                <div class="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#1d3b5a]/40">
                  <span class="badge badge-xs bg-[#011627] border border-[#1d3b5a] font-mono text-[10px] text-[#5f7e97]">
                    {{ menu.category || menu.pluginId || 'system' }}
                  </span>
                  <span
                    class="font-mono text-[10px] font-bold"
                    :class="isMenuSelected(menu.id) ? 'text-[#00f0ff]' : 'text-[#5f7e97]'"
                  >
                    {{ isMenuSelected(menu.id) ? '● Hiển thị' : '○ Đã ẩn' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Wizard Footer Controls Bar -->
      <div class="p-4 bg-[#051321] border-t border-[#1d3b5a] flex items-center justify-between gap-3 flex-shrink-0">
        <div class="text-[11px] text-[#5f7e97] font-mono hidden sm:block">
          Bước {{ currentStep }} / 3: <span class="text-[#7fdbca]">{{ steps[currentStep - 1]?.title }}</span>
        </div>
        <div class="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            :disabled="submitting"
            class="btn btn-sm btn-ghost border border-[#1d3b5a] text-[#5f7e97] hover:text-[#d6deeb] hover:bg-[#0b2942]"
            @click="visible = false"
          >
            Hủy
          </button>
          <button
            v-if="currentStep > 1"
            type="button"
            :disabled="submitting"
            class="btn btn-sm bg-[#0b2942] hover:bg-[#103554] border border-[#1d3b5a] text-[#7fdbca] font-mono"
            @click="prevStep"
          >
            ← Quay lại
          </button>
          <button
            v-if="currentStep < 3"
            type="button"
            class="btn btn-sm bg-[#00f0ff] hover:bg-[#00d2e0] text-[#011627] font-bold border-none shadow-[0_0_12px_rgba(0,240,255,0.35)]"
            @click="nextStep"
          >
            Tiếp tục →
          </button>
          <button
            v-else
            type="button"
            :disabled="submitting"
            class="btn btn-sm bg-[#22da6e] hover:bg-[#1db85b] text-[#011627] font-bold border-none shadow-[0_0_14px_rgba(34,218,110,0.4)]"
            @click="submitWizard"
          >
            <span v-if="submitting" class="loading loading-spinner loading-xs mr-1"></span>
            Hoàn tất &amp; Áp dụng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import { PLUGIN_PERMISSION_GROUPS, PLUGIN_MENU_VIEWS } from '@/generated/plugin-metadata';

export interface RoleData {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: any[];
}

interface UserItem {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  isActive?: boolean;
  roles?: any[];
}

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module?: string;
  action?: string;
  description?: string;
}

interface MenuItem {
  id: string;
  title: string;
  route?: string;
  path?: string;
  icon?: string;
  pluginId?: string;
  category?: string;
  description?: string;
}

interface PermissionGroup {
  module: string;
  moduleTitle: string;
  permissions: PermissionItem[];
  selectedCount: number;
}

const props = defineProps<{
  modelValue: boolean;
  role: RoleData | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const roleData = computed(() => props.role);

const currentStep = ref(1);
const loadingData = ref(false);
const submitting = ref(false);

const steps = [
  { step: 1, title: 'Gán Người dùng', desc: 'Chọn các tài khoản thuộc vai trò' },
  { step: 2, title: 'Quyền Plugins', desc: 'Cấp quyền chức năng theo plugin' },
  { step: 3, title: 'Menu Views', desc: 'Bật/tắt hiển thị view trên menu' },
];

// Step 1: Users state
const userSearchQuery = ref('');
const allUsers = ref<UserItem[]>([]);
const selectedUserIds = ref<string[]>([]);

// Step 2: Permissions state
const permSearchQuery = ref('');
const allPermissions = ref<PermissionItem[]>([]);
const selectedPermissionIds = ref<string[]>([]);

// Step 3: Menus state
const menuSearchQuery = ref('');
const allMenuItems = ref<MenuItem[]>([]);
const selectedMenuIds = ref<string[]>([]);

// Fallback static items based on standard system & plugins
const fallbackMenuItems: MenuItem[] = [
  { id: 'dashboard', title: 'Bảng điều khiển', route: '/dashboard', icon: 'Odometer', category: 'system', description: 'Tổng quan hệ thống, trạng thái dịch vụ và phân quyền quản trị menu.' },
  { id: 'final-config:tool', title: 'Final Config Tool', route: '/plugins/final-config?tab=tool', icon: 'Cpu', pluginId: 'final-config', description: 'Nạp cấu hình, ghi AppKey và kiểm tra tự động Modbus qua Web Serial.' },
  { id: 'device-traceability:so', title: 'Truy xuất SO & Thiết bị', route: '/plugins/device-traceability', icon: 'Search', pluginId: 'device-traceability', description: 'Tra cứu thông tin thiết bị, serial và lịch sử kiểm định từ DIS/SO.' },
  { id: 'memmap-manager:list', title: 'Quản lý MemMap', route: '/plugins/memmap-manager', icon: 'Grid', pluginId: 'memmap-manager', description: 'Cấu hình và kiểm tra sơ đồ địa chỉ Modbus cho từng SKU sản phẩm.' },
  { id: 'lorawan-chirpstack:gateways', title: 'LoRaWAN Gateway & Device', route: '/plugins/lorawan-chirpstack', icon: 'Connection', pluginId: 'lorawan-chirpstack', description: 'Giám sát trạm Gateway và thiết bị mạng không dây LoRaWAN.' },
  { id: 'users:list', title: 'Quản lý Người dùng', route: '/users', icon: 'User', category: 'system', description: 'Quản lý danh sách tài khoản, trạng thái khóa và thông tin liên hệ.' },
  { id: 'roles:list', title: 'Phân quyền & Vai trò', route: '/roles', icon: 'Lock', category: 'system', description: 'Thiết lập nhóm vai trò, cấp quyền phân hệ và hiển thị menu.' },
];

// Computed Filtered Users
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return allUsers.value;
  const q = userSearchQuery.value.trim().toLowerCase();
  return allUsers.value.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
  );
});

const isAllVisibleUsersSelected = computed(() => {
  if (filteredUsers.value.length === 0) return false;
  return filteredUsers.value.every((u) => selectedUserIds.value.includes(u.id));
});

function toggleSelectAllVisibleUsers() {
  if (isAllVisibleUsersSelected.value) {
    const visibleIds = filteredUsers.value.map((u) => u.id);
    selectedUserIds.value = selectedUserIds.value.filter((id) => !visibleIds.includes(id));
  } else {
    const visibleIds = filteredUsers.value.map((u) => u.id);
    selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, ...visibleIds]));
  }
}

function toggleUserSelection(id: string) {
  if (selectedUserIds.value.includes(id)) {
    selectedUserIds.value = selectedUserIds.value.filter((item) => item !== id);
  } else {
    selectedUserIds.value.push(id);
  }
}

function selectAllFilteredUsers() {
  const ids = filteredUsers.value.map((u) => u.id);
  selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, ...ids]));
}

function clearAllUsers() {
  selectedUserIds.value = [];
}

// Computed Filtered Permissions Groups
const totalPermissionsCount = computed(() => allPermissions.value.length);

const filteredPermissionGroups = computed<PermissionGroup[]>(() => {
  const q = permSearchQuery.value.trim().toLowerCase();
  const matched = !q
    ? allPermissions.value
    : allPermissions.value.filter(
        (p) =>
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.module && p.module.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );

  // Group by module
  const groupsMap = new Map<string, PermissionItem[]>();
  for (const perm of matched) {
    const mod = (perm.module || 'system').toLowerCase();
    if (!groupsMap.has(mod)) {
      groupsMap.set(mod, []);
    }
    groupsMap.get(mod)!.push(perm);
  }

  const result: PermissionGroup[] = [];
  groupsMap.forEach((perms, mod) => {
    const selectedCount = perms.filter((p) => selectedPermissionIds.value.includes(p.id)).length;
    result.push({
      module: mod,
      moduleTitle: formatModuleName(mod),
      permissions: perms,
      selectedCount,
    });
  });

  return result;
});

// Computed Filtered Menu Items
const filteredMenuItems = computed(() => {
  if (!menuSearchQuery.value) return allMenuItems.value;
  const q = menuSearchQuery.value.trim().toLowerCase();
  return allMenuItems.value.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.route && m.route.toLowerCase().includes(q)) ||
      (m.pluginId && m.pluginId.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
  );
});

function formatModuleName(mod: string): string {
  const names: Record<string, string> = {
    system: 'Hệ thống cốt lõi (Core System)',
    roles: 'Phân quyền & Vai trò (RBAC)',
    users: 'Quản lý Người dùng (Users)',
    'final-config': 'Plugin Final Config',
    'device-traceability': 'Plugin Device Traceability',
    'memmap-manager': 'Plugin Memmap Manager',
    'lorawan-chirpstack': 'Plugin LoRaWAN ChirpStack',
  };
  return names[mod] || `Phân hệ ${mod.toUpperCase()}`;
}

function getActionTag(actionStr?: string): { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' } | null {
  if (!actionStr) return null;
  const a = actionStr.toLowerCase();
  if (a.includes('read') || a.includes('view') || a.includes('list')) {
    return { label: 'READ', type: 'info' };
  }
  if (a.includes('write') || a.includes('update') || a.includes('create') || a.includes('edit')) {
    return { label: 'WRITE', type: 'warning' };
  }
  if (a.includes('delete') || a.includes('remove')) {
    return { label: 'DELETE', type: 'danger' };
  }
  if (a.includes('execute') || a.includes('sync') || a.includes('run')) {
    return { label: 'EXECUTE', type: 'primary' };
  }
  return { label: 'ACCESS', type: 'success' };
}

function getActionBadgeClass(type?: string): string {
  switch (type) {
    case 'info':
      return 'bg-[#0b2942] text-[#00f0ff] border border-[#00f0ff]/40';
    case 'warning':
      return 'bg-[#ecc48d]/20 text-[#ecc48d] border border-[#ecc48d]/40';
    case 'danger':
      return 'bg-[#ef5350]/20 text-[#ef5350] border border-[#ef5350]/40';
    case 'primary':
      return 'bg-[#7fdbca]/20 text-[#7fdbca] border border-[#7fdbca]/40';
    case 'success':
    default:
      return 'bg-[#22da6e]/20 text-[#22da6e] border border-[#22da6e]/40';
  }
}

// Watch dialog open
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal && props.role) {
      currentStep.value = 1;
      await loadAllWizardData();
    }
  }
);

async function loadAllWizardData() {
  if (!props.role) return;
  loadingData.value = true;
  try {
    // 1. Load users
    try {
      const uRes: any = await httpClient.get('/users');
      const uList = Array.isArray(uRes) ? uRes : (uRes?.data || uRes?.items || []);
      allUsers.value = uList;
    } catch {
      allUsers.value = [];
    }

    // 2. Load role users membership
    try {
      const roleUsersRes: any = await httpClient.get(`/roles/${props.role.id}/users`);
      const assigned = Array.isArray(roleUsersRes) ? roleUsersRes : (roleUsersRes?.data || roleUsersRes?.userIds || []);
      if (Array.isArray(assigned) && assigned.length > 0) {
        selectedUserIds.value = assigned.map((item: any) => (typeof item === 'string' ? item : item.id));
      } else {
        const roleCode = props.role.code?.toUpperCase();
        selectedUserIds.value = allUsers.value
          .filter((u) => u.roles?.some((r: any) => r.id === props.role?.id || r.code?.toUpperCase() === roleCode))
          .map((u) => u.id);
      }
    } catch {
      const roleCode = props.role.code?.toUpperCase();
      selectedUserIds.value = allUsers.value
        .filter((u) => u.roles?.some((r: any) => r.id === props.role?.id || r.code?.toUpperCase() === roleCode))
        .map((u) => u.id);
    }

    // 3. Load permissions list
    try {
      const pRes: any = await httpClient.get('/permissions');
      const pList = Array.isArray(pRes) ? pRes : (pRes?.data || pRes?.items || []);
      if (Array.isArray(pList) && pList.length > 0) {
        allPermissions.value = pList;
      } else {
        const flatGenerated = PLUGIN_PERMISSION_GROUPS.flatMap((group) =>
          group.permissions.map((p) => ({
            id: p.id,
            code: p.id,
            name: p.name,
            module: group.pluginId || p.module,
            action: p.action,
            description: p.description,
          }))
        );
        allPermissions.value = flatGenerated;
      }
    } catch {
      const flatGenerated = PLUGIN_PERMISSION_GROUPS.flatMap((group) =>
        group.permissions.map((p) => ({
          id: p.id,
          code: p.id,
          name: p.name,
          module: group.pluginId || p.module,
          action: p.action,
          description: p.description,
        }))
      );
      allPermissions.value = flatGenerated;
    }

    // 4. Load role current permissions
    try {
      const roleDetailRes: any = await httpClient.get(`/roles/${props.role.id}`);
      const perms = roleDetailRes?.permissions || roleDetailRes?.data?.permissions || props.role.permissions || [];
      selectedPermissionIds.value = perms.map((p: any) => (typeof p === 'string' ? p : p.id));
    } catch {
      selectedPermissionIds.value = (props.role.permissions || []).map((p: any) =>
        typeof p === 'string' ? p : p.id
      );
    }

    // 5. Load menu list
    try {
      const mRes: any = await httpClient.get('/menu');
      const mList = Array.isArray(mRes) ? mRes : (mRes?.data || mRes?.items || []);
      if (Array.isArray(mList) && mList.length > 0) {
        allMenuItems.value = mList;
      } else {
        allMenuItems.value = (PLUGIN_MENU_VIEWS as MenuItem[]) || fallbackMenuItems;
      }
    } catch {
      allMenuItems.value = (PLUGIN_MENU_VIEWS as MenuItem[]) || fallbackMenuItems;
    }

    // 6. Load role menu permissions
    try {
      const roleAssignmentsRes: any = await httpClient.get('/menu/admin/role-assignments');
      const assignments = roleAssignmentsRes?.data || roleAssignmentsRes || {};
      const roleCode = (props.role.code || '').toUpperCase();
      if (assignments[roleCode] && Array.isArray(assignments[roleCode])) {
        selectedMenuIds.value = [...assignments[roleCode]];
      } else {
        selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
      }
    } catch {
      selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
    }
  } catch (err: any) {
    cyberToast.error(err?.message || 'Có lỗi khi tải dữ liệu cấu hình phân quyền.');
  } finally {
    loadingData.value = false;
  }
}

// Step 2: Permissions handlers
function isPermissionSelected(id: string): boolean {
  return selectedPermissionIds.value.includes(id);
}

function toggleSinglePermission(id: string) {
  if (isPermissionSelected(id)) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter((item) => item !== id);
  } else {
    selectedPermissionIds.value.push(id);
  }
}

function toggleGroupPermissions(group: PermissionGroup, enable: boolean) {
  const groupIds = group.permissions.map((p) => p.id);
  if (enable) {
    selectedPermissionIds.value = Array.from(new Set([...selectedPermissionIds.value, ...groupIds]));
  } else {
    selectedPermissionIds.value = selectedPermissionIds.value.filter((id) => !groupIds.includes(id));
  }
}

function toggleSelectAllPermissions(enable: boolean) {
  if (enable) {
    selectedPermissionIds.value = allPermissions.value.map((p) => p.id);
  } else {
    selectedPermissionIds.value = [];
  }
}

// Step 3: Menus handlers
function isMenuSelected(id: string): boolean {
  return selectedMenuIds.value.includes(id);
}

function toggleMenuCard(id: string) {
  if (isMenuSelected(id)) {
    selectedMenuIds.value = selectedMenuIds.value.filter((item) => item !== id);
  } else {
    selectedMenuIds.value.push(id);
  }
}

function toggleSelectAllMenus(enable: boolean) {
  if (enable) {
    selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
  } else {
    selectedMenuIds.value = [];
  }
}

// Navigation between steps
function goToStep(step: number) {
  currentStep.value = step;
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

// Submit Wizard (Done)
async function submitWizard() {
  if (!props.role) return;
  submitting.value = true;
  const roleId = props.role.id;
  const roleCode = props.role.code;

  let errors: string[] = [];

  try {
    // 1. Save Users Membership (Step 1)
    try {
      await httpClient.put(`/roles/${roleId}/users`, {
        userIds: selectedUserIds.value,
      });
    } catch (uErr: any) {
      try {
        await httpClient.post(`/roles/${roleId}/assign-users`, {
          userIds: selectedUserIds.value,
        });
      } catch (assignErr: any) {
        errors.push(`Người dùng: ${assignErr.message}`);
      }
    }

    // 2. Save Permissions (Step 2)
    try {
      await httpClient.put(`/roles/${roleId}/permissions`, {
        permissionIds: selectedPermissionIds.value,
      });
    } catch (pErr: any) {
      try {
        await httpClient.patch(`/roles/${roleId}`, {
          permissionIds: selectedPermissionIds.value,
        });
      } catch (patchErr: any) {
        errors.push(`Quyền hạn: ${patchErr.message}`);
      }
    }

    // 3. Save Menu Permissions (Step 3)
    try {
      await httpClient.put(`/roles/${roleId}/menus`, {
        menuKeys: selectedMenuIds.value,
        menuItemIds: selectedMenuIds.value,
      });
    } catch (mErr: any) {
      try {
        await httpClient.post('/menu/admin/assign', {
          roleCode: roleCode,
          menuItemIds: selectedMenuIds.value,
        });
      } catch (menuAdminErr: any) {
        errors.push(`Menu Views: ${menuAdminErr.message}`);
      }
    }

    if (errors.length > 0) {
      cyberToast.warning(`Lưu hoàn tất với cảnh báo: ${errors.join('; ')}`);
    } else {
      cyberToast.success(`Cấu hình phân quyền vai trò ${props.role.name} thành công!`);
    }

    emit('saved');
    visible.value = false;
  } catch (err: any) {
    cyberToast.error(err?.message || 'Không thể lưu cấu hình phân quyền.');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
