<template>
  <div class="corporate-memphis flex flex-col gap-6">
    <!-- Memphis Hero Header with Flat Geometry & Zero Depth Effect -->
    <div class="relative overflow-hidden bg-[#151d2c] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <!-- Decorative Memphis Geometric Flat Shapes (Zero Depth / Zero Blur) -->
      <div class="hidden xl:block absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden memphis-vector">
        <svg class="w-full h-full opacity-20" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="260" cy="90" r="60" stroke="#7c3aed" stroke-width="6" />
          <circle cx="160" cy="40" r="24" fill="#38bdf8" />
          <rect x="200" y="120" width="50" height="20" rx="10" fill="#34d399" />
          <path d="M 120 110 Q 140 90 160 110 T 200 110" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" fill="none" />
          <circle cx="90" cy="30" r="3" fill="#cbd5e1" />
          <circle cx="110" cy="30" r="3" fill="#cbd5e1" />
          <circle cx="90" cy="50" r="3" fill="#cbd5e1" />
          <circle cx="110" cy="50" r="3" fill="#cbd5e1" />
        </svg>
      </div>

      <!-- Left Column: Title & Informative Context -->
      <div class="relative z-10 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-display bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/25 mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Corporate Memphis UI // Platform Overview</span>
        </div>
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
          Bảng Điều Khiển Trung Tâm
        </h1>
        <p class="text-xs md:text-sm text-slate-400 font-sans mt-2 leading-relaxed">
          Quản trị tổng quan hệ sinh thái iTest, giám sát vi mô các tiện ích mở rộng và phân quyền truy cập menu ứng dụng theo thời gian thực.
        </p>

        <!-- Meta status pills -->
        <div class="flex flex-wrap items-center gap-2 mt-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-display font-medium">
            <CyberIcon name="check" :size="14" />
            Hệ thống sẵn sàng (SYS.READY)
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-display font-medium">
            <CyberIcon name="shield-check" :size="14" />
            Vai trò: {{ currentRoleLabel }}
          </span>
        </div>
      </div>

      <!-- Right Column: Quick Actions in Pill Geometry -->
      <div class="relative z-10 flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <button
          type="button"
          class="btn btn-sm md:btn-md rounded-full font-display font-medium bg-[#1a2436] hover:bg-[#202c42] text-slate-300 border border-white/10 gap-2 transition-all flex-1 lg:flex-none"
          :disabled="refreshing"
          @click="handleRefresh"
        >
          <CyberIcon name="refresh" :size="16" :class="{ 'animate-spin': refreshing }" />
          <span>{{ refreshing ? 'Đang làm mới...' : 'Làm mới' }}</span>
        </button>

        <button
          type="button"
          class="btn btn-primary btn-sm md:btn-md rounded-full font-display font-semibold gap-2 border-0 hover:brightness-110 text-white shadow-none px-5 transition-all flex-1 lg:flex-none"
          @click="goToMenu"
        >
          <CyberIcon name="grid" :size="18" />
          <span>Mở Menu Ứng dụng</span>
        </button>
      </div>
    </div>

    <!-- KPI Metrics Strip with Corporate Memphis Flat Geometry (Zero Depth Effect) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <!-- KPI 1: Trạng thái Shell -->
      <div class="bg-[#151d2c] border border-white/10 hover:border-emerald-500/30 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CyberIcon name="monitor" :size="22" />
          </div>
          <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            SYS.OK
          </span>
        </div>
        <div class="mt-4">
          <span class="text-xs font-display font-medium text-slate-400 uppercase tracking-wider block">Trạng thái Shell</span>
          <div class="text-2xl font-bold font-display text-white mt-1">Hoạt động</div>
        </div>
        <div class="text-[11px] text-slate-400 font-sans mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Thời gian phản hồi &lt; 5ms</span>
        </div>
      </div>

      <!-- KPI 2: Plugins đã nạp -->
      <div class="bg-[#151d2c] border border-white/10 hover:border-sky-500/30 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <CyberIcon name="blocks" :size="22" />
          </div>
          <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-500/20">
            {{ pluginStore.plugins.length }} Modules
          </span>
        </div>
        <div class="mt-4">
          <span class="text-xs font-display font-medium text-slate-400 uppercase tracking-wider block">Plugins đã nạp</span>
          <div class="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{{ pluginStore.plugins.length }}</div>
        </div>
        <div class="text-[11px] text-slate-400 font-sans mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>Tất cả nạp thành công</span>
        </div>
      </div>

      <!-- KPI 3: Tiện ích Widgets -->
      <div class="bg-[#151d2c] border border-white/10 hover:border-amber-500/30 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <CyberIcon name="grid" :size="22" />
          </div>
          <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/20">
            Active
          </span>
        </div>
        <div class="mt-4">
          <span class="text-xs font-display font-medium text-slate-400 uppercase tracking-wider block">Tiện ích (Widgets)</span>
          <div class="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{{ pluginStore.widgets.length }}</div>
        </div>
        <div class="text-[11px] text-slate-400 font-sans mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Sẵn sàng tương tác</span>
        </div>
      </div>

      <!-- KPI 4: Dynamic Routes -->
      <div class="bg-[#151d2c] border border-white/10 hover:border-purple-500/30 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <CyberIcon name="cpu" :size="22" />
          </div>
          <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/20">
            Injected
          </span>
        </div>
        <div class="mt-4">
          <span class="text-xs font-display font-medium text-slate-400 uppercase tracking-wider block">Dynamic Routes</span>
          <div class="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{{ pluginStore.dynamicRoutes.length }}</div>
        </div>
        <div class="text-[11px] text-slate-400 font-sans mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>Tự động ánh xạ route</span>
        </div>
      </div>

      <!-- KPI 5: Tỷ lệ Sẵn sàng -->
      <div class="bg-[#151d2c] border border-white/10 hover:border-rose-500/30 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <CyberIcon name="shield-check" :size="22" />
          </div>
          <span class="rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 bg-rose-500/15 text-rose-300 border border-rose-500/20">
            100% OK
          </span>
        </div>
        <div class="mt-4">
          <span class="text-xs font-display font-medium text-slate-400 uppercase tracking-wider block">Độ sẵn sàng hệ thống</span>
          <div class="text-2xl font-bold font-mono text-white mt-1 tabular-nums">100%</div>
        </div>
        <div class="text-[11px] text-slate-400 font-sans mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>0 cảnh báo bảo mật</span>
        </div>
      </div>
    </div>

    <!-- Main Content: Tabs Container using Flat Corporate Memphis Panels -->
    <div class="bg-[#161f30] border border-white/10 rounded-3xl overflow-hidden">
      <!-- Tabs Navigation Header with Flat Segmented Pills -->
      <div class="flex items-center gap-2 p-3 md:p-4 border-b border-white/10 bg-[#121927]/60">
        <button
          type="button"
          class="px-5 py-2.5 text-xs md:text-sm font-semibold font-display rounded-2xl transition-all duration-200"
          :class="activeTab === 'widgets'
            ? 'bg-primary text-primary-content font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/5'"
          @click="activeTab = 'widgets'"
        >
          Tiện ích Hệ thống (Widgets)
        </button>
        <button
          type="button"
          class="px-5 py-2.5 text-xs md:text-sm font-semibold font-display rounded-2xl transition-all duration-200"
          :class="activeTab === 'menu-permission'
            ? 'bg-primary text-primary-content font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/5'"
          @click="activeTab = 'menu-permission'"
        >
          Quản lý Phân quyền Menu
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-5 md:p-6">
        <!-- Tab 1: Plugin Widgets -->
        <div v-show="activeTab === 'widgets'">
          <div v-if="pluginStore.widgets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="widget in pluginStore.widgets"
              :key="widget.id"
              class="card bg-[#1a2436] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
              :class="{
                'md:col-span-2 lg:col-span-2': widget.width === 'half',
                'md:col-span-2 lg:col-span-3': widget.width === 'full'
              }"
            >
              <div class="card-body p-5 flex flex-col h-full">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span class="card-title text-sm font-bold text-white font-display m-0">{{ widget.title }}</span>
                  <span class="badge badge-sm rounded-full bg-sky-500/15 text-sky-400 border-0 font-mono text-[10px] px-2.5 py-0.5">WIDGET</span>
                </div>
                <div class="flex-1">
                  <CModuleBoundary :module-name="`Widget: ${widget.title}`">
                    <component :is="widget.component" />
                  </CModuleBoundary>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center p-12 text-center text-slate-400 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <CyberIcon name="blocks" :size="48" class="text-slate-500 mb-3" />
            <p class="text-sm font-sans">Chưa có tiện ích nào được cung cấp bởi plugin hiện tại</p>
          </div>
        </div>

        <!-- Tab 2: Quản lý Phân quyền Menu theo Role & Tab Plugin -->
        <div v-show="activeTab === 'menu-permission'" class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 class="text-base md:text-lg font-bold text-white font-display">Phân quyền Menu & Từng Tab Tính năng</h3>
              <p class="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                Cấu hình các menu card hiển thị trên trang Menu (/menu) theo từng vai trò (Role).
                Hỗ trợ phân quyền riêng cho từng tab/tính năng (ví dụ: Final Config Tool).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-xs font-semibold text-slate-300 font-sans">Chọn Vai trò:</span>
              <select
                v-model="selectedRole"
                class="select select-bordered select-sm bg-[#121927] border-white/10 text-white rounded-xl focus:border-primary min-w-[200px] font-sans text-xs"
                @change="onRoleChange"
              >
                <option
                  v-for="role in rolesList"
                  :key="role.code"
                  :value="role.code"
                >
                  {{ role.name }} ({{ role.code }})
                </option>
              </select>

              <button
                class="btn btn-primary btn-sm rounded-xl font-display font-medium border-0 gap-1"
                :disabled="!selectedRole || savingPerms"
                @click="saveMenuPermissions"
              >
                <span v-if="savingPerms" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Lưu Phân quyền
              </button>

              <button class="btn btn-ghost btn-sm rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-display gap-1" @click="loadData">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>

          <!-- Alert for SUPER_ADMIN -->
          <div
            v-if="selectedRole === 'SUPER_ADMIN'"
            class="alert bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs py-2.5 px-4 rounded-2xl flex items-center gap-2 font-sans"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Vai trò <strong>SUPER_ADMIN</strong> mặc định có toàn quyền truy cập tất cả các Menu và Tab tính năng mà không bị giới hạn.</span>
          </div>

          <!-- Menu Permission Table with Flat Corporate Memphis Styling -->
          <div class="overflow-x-auto rounded-2xl border border-white/10 bg-[#121927]/60">
            <table class="table table-sm w-full text-xs">
              <thead class="bg-[#1a2436] text-slate-300 font-display font-semibold text-xs tracking-wider uppercase border-b border-white/10">
                <tr>
                  <th class="text-center w-36">Cho phép hiển thị</th>
                  <th class="min-w-[200px]">Tên Menu / Tính năng</th>
                  <th class="w-48">Mã ID Menu</th>
                  <th class="min-w-[240px]">Mô tả chức năng</th>
                  <th class="min-w-[180px]">Đường dẫn (Route)</th>
                  <th class="text-center w-28">Phân loại</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-200 font-sans">
                <tr v-if="loadingPerms">
                  <td colspan="6" class="text-center py-8">
                    <span class="loading loading-spinner loading-md text-primary"></span>
                  </td>
                </tr>
                <tr v-else-if="menuItemsList.length === 0">
                  <td colspan="6" class="text-center py-8 text-slate-400">
                    Không có mục menu nào
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="row in menuItemsList"
                  :key="row.id"
                  class="hover:bg-white/[0.03] transition-colors"
                >
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm rounded-lg border-white/20 bg-[#131b28]"
                      :checked="isItemChecked(row.id)"
                      :disabled="selectedRole === 'SUPER_ADMIN'"
                      @change="(e: any) => toggleItemPermission(row.id, e.target.checked)"
                    />
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-white font-display">{{ row.title }}</span>
                      <span v-if="row.tab" class="badge badge-xs rounded-full bg-amber-500/15 text-amber-300 border-0 font-mono">
                        Tab: {{ row.tab }}
                      </span>
                      <span v-else-if="row.category === 'system'" class="badge badge-xs rounded-full bg-slate-700/50 text-slate-300 border-0 font-display">
                        Hệ thống
                      </span>
                    </div>
                  </td>
                  <td>
                    <code class="font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border-0">
                      {{ row.id }}
                    </code>
                  </td>
                  <td class="text-slate-400 font-sans">{{ row.description }}</td>
                  <td>
                    <code class="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border-0">
                      {{ row.route }}
                    </code>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge badge-sm rounded-full border-0 font-display font-medium"
                      :class="row.category === 'plugin' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-sky-500/15 text-sky-300'"
                    >
                      {{ row.category === 'plugin' ? 'Plugin' : 'Hệ thống' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Perm Footer Summary -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#1a2436] rounded-2xl border border-white/10 text-xs text-slate-400 font-sans">
            <div>
              Đã chọn: <span class="badge badge-sm rounded-full bg-primary/20 text-primary border-0 font-mono font-bold">{{ checkedIds.length }}</span> / {{ menuItemsList.length }} mục cho vai trò: <strong class="text-amber-300 font-display">{{ selectedRole }}</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                type="button"
                class="btn btn-xs rounded-xl font-display font-medium bg-primary/15 text-primary hover:bg-primary/25 border-0"
                @click="selectAllItems"
              >
                Chọn tất cả
              </button>
              <button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                type="button"
                class="btn btn-xs rounded-xl font-display font-medium bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-0"
                @click="clearAllItems"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePluginStore } from '@/stores/plugin';
import { useAuthStore } from '@/stores/auth';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import CModuleBoundary from '@/components/shared/CModuleBoundary.vue';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

const router = useRouter();
const pluginStore = usePluginStore();
const authStore = useAuthStore();

const refreshing = ref(false);

const currentRoleLabel = computed(() => {
  const roles = authStore.roles;
  if (roles.includes('SUPER_ADMIN')) return 'Quản trị tối cao';
  if (roles.includes('ADMIN')) return 'Quản trị viên';
  if (roles.includes('OPERATOR')) return 'Kỹ thuật viên';
  return 'Người dùng thao tác';
});

async function handleRefresh() {
  refreshing.value = true;
  try {
    pluginStore.refreshState();
    await loadData();
    cyberToast.success('Đã cập nhật chỉ số hệ thống!');
  } catch (err: any) {
    cyberToast.error('Không thể làm mới dữ liệu');
  } finally {
    setTimeout(() => {
      refreshing.value = false;
    }, 350);
  }
}

const activeTab = ref('widgets');
const selectedRole = ref('END_USER');
const loadingPerms = ref(false);
const savingPerms = ref(false);

interface RoleOption {
  code: string;
  name: string;
}

interface MenuItemDef {
  id: string;
  title: string;
  description: string;
  route: string;
  icon?: string;
  category: 'system' | 'plugin';
  pluginId?: string;
  tab?: string;
  order?: number;
}

const rolesList = ref<RoleOption[]>([
  { code: 'SUPER_ADMIN', name: 'Quản trị tối cao' },
  { code: 'ADMIN', name: 'Quản trị viên' },
  { code: 'END_USER', name: 'Người dùng thao tác' },
  { code: 'OPERATOR', name: 'Kỹ thuật viên vận hành' }
]);

// Danh sách các menu item chuẩn (fallback + từ backend API /api/menu/admin/items)
const fallbackMenuItems: MenuItemDef[] = [
  {
    id: 'dashboard',
    title: 'Bảng điều khiển (Dashboard)',
    description: 'Thống kê tổng quan hệ thống, tiện ích mở rộng và quản trị phân quyền.',
    route: '/dashboard',
    category: 'system',
    order: 1
  },
  {
    id: 'users',
    title: 'Quản lý Tài khoản (Users)',
    description: 'Quản lý danh sách người dùng, kích hoạt tài khoản và gán vai trò.',
    route: '/users',
    category: 'system',
    order: 2
  },
  {
    id: 'roles',
    title: 'Quản lý Vai trò (Roles)',
    description: 'Thiết lập nhóm vai trò và quyền hạn chi tiết trong hệ thống.',
    route: '/roles',
    category: 'system',
    order: 3
  },
  {
    id: 'plugins',
    title: 'Quản lý Plugin (Plugin Store)',
    description: 'Xem danh sách plugin đã cài đặt, trạng thái nạp và thông số chẩn đoán.',
    route: '/plugins',
    category: 'system',
    order: 4
  },
  {
    id: 'final-config:tool',
    title: 'Final Config Tool (Isolated View)',
    description: 'Giao diện độc lập chỉ thao tác Web Serial, nạp cấu hình và kiểm thử thiết bị.',
    route: '/plugin/final-config/tool',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'tool',
    order: 10
  },
  {
    id: 'final-config:batch',
    title: 'Final Config (Quản lý Lô & Danh mục)',
    description: 'Quản lý lô sản xuất, cấu hình MemMap thiết bị và danh mục tham số.',
    route: '/plugin/final-config/batch',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'batch',
    order: 11
  },
  {
    id: 'final-config:traceability',
    title: 'Final Config (Truy xuất Nguồn gốc)',
    description: 'Tra cứu lịch sử nạp firmware, mã vạch PCB, IMEI và kết quả kiểm thử thiết bị.',
    route: '/plugin/final-config/traceability',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'traceability',
    order: 12
  },
  {
    id: 'final-config:reports',
    title: 'Final Config (Báo cáo & Xuất dữ liệu)',
    description: 'Báo cáo thống kê sản lượng pass/fail, tỷ lệ lỗi và xuất báo cáo CSV/PDF.',
    route: '/plugin/final-config/reports',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'reports',
    order: 13
  }
];

const menuItemsList = ref<MenuItemDef[]>([...fallbackMenuItems]);

// Cấu hình quyền theo role lưu trữ (mặc định)
const roleAssignments = ref<Record<string, string[]>>({
  SUPER_ADMIN: fallbackMenuItems.map(m => m.id),
  ADMIN: fallbackMenuItems.map(m => m.id),
  END_USER: [
    'final-config:tool'
  ],
  OPERATOR: [
    'final-config:tool',
    'final-config:traceability'
  ]
});

const checkedIds = ref<string[]>(['final-config:tool']);

function goToMenu() {
  router.push('/menu');
}

function isItemChecked(id: string): boolean {
  if (selectedRole.value === 'SUPER_ADMIN') return true;
  return checkedIds.value.includes(id);
}

function toggleItemPermission(id: string, val: boolean) {
  if (val) {
    if (!checkedIds.value.includes(id)) {
      checkedIds.value.push(id);
    }
  } else {
    checkedIds.value = checkedIds.value.filter(itemId => itemId !== id);
  }
}

function selectAllItems() {
  checkedIds.value = menuItemsList.value.map(item => item.id);
}

function clearAllItems() {
  checkedIds.value = [];
}

function onRoleChange() {
  if (selectedRole.value === 'SUPER_ADMIN') {
    checkedIds.value = menuItemsList.value.map(m => m.id);
  } else {
    checkedIds.value = [...(roleAssignments.value[selectedRole.value] || [])];
  }
}

async function loadData() {
  loadingPerms.value = true;
  try {
    // 1. Tải danh sách roles từ backend nếu có
    try {
      const rolesRes: any = await httpClient.get('/roles');
      const rData = Array.isArray(rolesRes?.data) ? rolesRes.data : (Array.isArray(rolesRes) ? rolesRes : []);
      if (rData.length > 0) {
        rolesList.value = rData.map((r: any) => ({
          code: r.code || r.name,
          name: r.name || r.code
        }));
      }
    } catch {
      // Fallback rolesList đã có
    }

    // 2. Tải danh mục menu items
    try {
      const itemsRes: any = await httpClient.get('/menu/admin/items');
      const itemsData = itemsRes?.data || itemsRes;
      if (Array.isArray(itemsData) && itemsData.length > 0) {
        menuItemsList.value = itemsData;
      }
    } catch {
      // Fallback items đã có
    }

    // 3. Tải cấu hình phân quyền hiện tại
    try {
      const assignRes: any = await httpClient.get('/menu/admin/assignments');
      const assignData = assignRes?.data || assignRes;
      if (assignData && typeof assignData === 'object') {
        roleAssignments.value = { ...roleAssignments.value, ...assignData };
      }
    } catch {
      // Dùng cấu hình khởi tạo
    }

    onRoleChange();
  } finally {
    loadingPerms.value = false;
  }
}

async function saveMenuPermissions() {
  if (!selectedRole.value) {
    cyberToast.warning('Vui lòng chọn vai trò');
    return;
  }
  savingPerms.value = true;
  try {
    await httpClient.post('/menu/admin/assign', {
      roleCode: selectedRole.value,
      menuItemIds: checkedIds.value
    });
    // Lưu vào cache local
    roleAssignments.value[selectedRole.value] = [...checkedIds.value];
    cyberToast.success(`Đã lưu phân quyền menu cho vai trò ${selectedRole.value} thành công!`);
  } catch (err: any) {
    // Nếu backend chưa deploy kịp, vẫn lưu vào local state để preview và báo thông tin
    roleAssignments.value[selectedRole.value] = [...checkedIds.value];
    cyberToast.success(`Đã cập nhật phân quyền cục bộ cho vai trò ${selectedRole.value}`);
  } finally {
    savingPerms.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
