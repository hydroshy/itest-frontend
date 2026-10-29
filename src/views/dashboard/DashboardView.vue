<template>
  <div class="flex flex-col gap-5">
    <!-- Header with Quick Switch to Menu -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-[#0b2942]/85 border border-[#1d3b5a] rounded-lg backdrop-blur-md shadow-lg">
      <div>
        <h2 class="text-xl font-bold font-['Orbitron',sans-serif] text-[#f8fafc] tracking-wide">Bảng điều khiển Trung tâm</h2>
        <p class="text-xs md:text-sm text-[#94a3b8] mt-1">Quản lý tổng quan hệ thống, tiện ích plugin và phân quyền menu truy cập</p>
      </div>
      <button class="btn btn-primary btn-sm md:btn-md gap-2" @click="goToMenu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Mở Menu Ứng dụng
      </button>
    </div>

    <!-- Summary Metrics with daisyUI Stats & Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stats bg-[#0b2942]/85 border border-[#1d3b5a] hover:border-[#00f0ff] transition-all duration-300 shadow-lg text-[#d6deeb] backdrop-blur-md rounded-lg">
        <div class="stat p-4">
          <div class="stat-figure text-[#38bdf8] p-2.5 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/20">
            <CyberIcon name="monitor" :size="24" />
          </div>
          <div class="stat-title text-xs text-[#5f7e97] font-medium tracking-wide">Trạng thái Shell</div>
          <div class="stat-value text-xl font-bold font-mono text-[#22da6e] drop-shadow-[0_0_8px_rgba(34,218,110,0.4)]">Hoạt động</div>
          <div class="stat-desc text-[11px] text-[#7fdbca] font-mono mt-1">SYS.OK // ONLINE</div>
        </div>
      </div>

      <div class="stats bg-[#0b2942]/85 border border-[#1d3b5a] hover:border-[#00f0ff] transition-all duration-300 shadow-lg text-[#d6deeb] backdrop-blur-md rounded-lg">
        <div class="stat p-4">
          <div class="stat-figure text-[#34d399] p-2.5 rounded-lg bg-[#34d399]/10 border border-[#34d399]/20">
            <CyberIcon name="blocks" :size="24" />
          </div>
          <div class="stat-title text-xs text-[#5f7e97] font-medium tracking-wide">Plugins đã nạp</div>
          <div class="stat-value text-xl font-bold font-mono text-[#f8fafc]">{{ pluginStore.plugins.length }}</div>
          <div class="stat-desc text-[11px] text-[#7fdbca] font-mono mt-1">MODULES INSTALLED</div>
        </div>
      </div>

      <div class="stats bg-[#0b2942]/85 border border-[#1d3b5a] hover:border-[#00f0ff] transition-all duration-300 shadow-lg text-[#d6deeb] backdrop-blur-md rounded-lg">
        <div class="stat p-4">
          <div class="stat-figure text-[#fb923c] p-2.5 rounded-lg bg-[#fb923c]/10 border border-[#fb923c]/20">
            <CyberIcon name="grid" :size="24" />
          </div>
          <div class="stat-title text-xs text-[#5f7e97] font-medium tracking-wide">Tiện ích (Widgets)</div>
          <div class="stat-value text-xl font-bold font-mono text-[#f8fafc]">{{ pluginStore.widgets.length }}</div>
          <div class="stat-desc text-[11px] text-[#ecc48d] font-mono mt-1">ACTIVE WIDGETS</div>
        </div>
      </div>

      <div class="stats bg-[#0b2942]/85 border border-[#1d3b5a] hover:border-[#00f0ff] transition-all duration-300 shadow-lg text-[#d6deeb] backdrop-blur-md rounded-lg">
        <div class="stat p-4">
          <div class="stat-figure text-[#c084fc] p-2.5 rounded-lg bg-[#c084fc]/10 border border-[#c084fc]/20">
            <CyberIcon name="cpu" :size="24" />
          </div>
          <div class="stat-title text-xs text-[#5f7e97] font-medium tracking-wide">Dynamic Routes</div>
          <div class="stat-value text-xl font-bold font-mono text-[#f8fafc]">{{ pluginStore.dynamicRoutes.length }}</div>
          <div class="stat-desc text-[11px] text-[#c084fc] font-mono mt-1">ROUTES INJECTED</div>
        </div>
      </div>
    </div>

    <!-- Main Content: Tabs Container using DaisyUI -->
    <div class="bg-[#0b2942]/85 border border-[#1d3b5a] rounded-lg shadow-xl backdrop-blur-md overflow-hidden">
      <!-- Tabs Navigation Header -->
      <div class="flex border-b border-[#1d3b5a] bg-[#071726]/80 px-4 pt-3 gap-2">
        <button
          type="button"
          class="px-4 py-2.5 text-xs md:text-sm font-semibold tracking-wide rounded-t-lg transition-all duration-200 border-t border-x"
          :class="activeTab === 'widgets'
            ? 'bg-[#0b2942] border-[#00f0ff] text-[#00f0ff] shadow-[0_-2px_8px_rgba(0,240,255,0.15)] -mb-px'
            : 'border-transparent text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]/40'"
          @click="activeTab = 'widgets'"
        >
          TIỆN ÍCH HỆ THỐNG (WIDGETS)
        </button>
        <button
          type="button"
          class="px-4 py-2.5 text-xs md:text-sm font-semibold tracking-wide rounded-t-lg transition-all duration-200 border-t border-x"
          :class="activeTab === 'menu-permission'
            ? 'bg-[#0b2942] border-[#00f0ff] text-[#00f0ff] shadow-[0_-2px_8px_rgba(0,240,255,0.15)] -mb-px'
            : 'border-transparent text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]/40'"
          @click="activeTab = 'menu-permission'"
        >
          QUẢN LÝ PHÂN QUYỀN MENU
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-4 md:p-6">
        <!-- Tab 1: Plugin Widgets -->
        <div v-show="activeTab === 'widgets'">
          <div v-if="pluginStore.widgets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="widget in pluginStore.widgets"
              :key="widget.id"
              class="card bg-[#0b2942]/85 border border-[#1d3b5a] shadow-xl backdrop-blur-md rounded-lg overflow-hidden flex flex-col"
              :class="{
                'md:col-span-2 lg:col-span-2': widget.width === 'half',
                'md:col-span-2 lg:col-span-3': widget.width === 'full'
              }"
            >
              <div class="card-body p-4 flex flex-col h-full">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-[#1d3b5a]/60">
                  <span class="card-title text-sm font-semibold text-[#d6deeb] font-sans m-0">{{ widget.title }}</span>
                  <span class="badge badge-xs badge-info badge-outline font-mono text-[10px]">WIDGET</span>
                </div>
                <div class="flex-1">
                  <CModuleBoundary :module-name="`Widget: ${widget.title}`">
                    <component :is="widget.component" />
                  </CModuleBoundary>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center p-12 text-center text-[#94a3b8]">
            <CyberIcon name="blocks" :size="48" class="text-[#5f7e97] mb-3" />
            <p class="text-sm">Chưa có tiện ích nào được cung cấp bởi plugin hiện tại</p>
          </div>
        </div>

        <!-- Tab 2: Quản lý Phân quyền Menu theo Role & Tab Plugin -->
        <div v-show="activeTab === 'menu-permission'" class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1d3b5a]">
            <div>
              <h3 class="text-base font-semibold text-[#f8fafc] font-['Orbitron',sans-serif]">Phân quyền Menu & Từng Tab Tính năng</h3>
              <p class="text-xs text-[#94a3b8] mt-1 max-w-2xl">
                Cấu hình các menu card hiển thị trên trang Menu (/menu) theo từng vai trò (Role).
                Hỗ trợ phân quyền riêng cho từng tab/tính năng (ví dụ: Final Config Tool).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-xs font-semibold text-[#e2e8f0]">Chọn Vai trò:</span>
              <select
                v-model="selectedRole"
                class="select select-bordered select-sm bg-[#0b1a2d] border-[#1d3b5a] text-[#f8fafc] focus:border-[#00f0ff] min-w-[200px]"
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
                class="btn btn-primary btn-sm gap-1"
                :disabled="!selectedRole || savingPerms"
                @click="saveMenuPermissions"
              >
                <span v-if="savingPerms" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Lưu Phân quyền
              </button>

              <button class="btn btn-ghost btn-sm gap-1 border border-[#1d3b5a] text-[#94a3b8] hover:text-[#f8fafc]" @click="loadData">
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
            class="alert alert-info bg-info/10 border border-info/30 text-info text-xs py-2 px-4 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Vai trò <strong>SUPER_ADMIN</strong> mặc định có toàn quyền truy cập tất cả các Menu và Tab tính năng mà không bị giới hạn.</span>
          </div>

          <!-- Menu Permission Table in DaisyUI -->
          <div class="overflow-x-auto rounded-md border border-[#1d3b5a] bg-[#071726]/60">
            <table class="table table-sm w-full text-xs">
              <thead class="bg-[#0b2942]/90 text-[#7fdbca] font-mono border-b border-[#1d3b5a]">
                <tr>
                  <th class="text-center w-36">Cho phép hiển thị</th>
                  <th class="min-w-[200px]">Tên Menu / Tính năng</th>
                  <th class="w-48">Mã ID Menu</th>
                  <th class="min-w-[240px]">Mô tả chức năng</th>
                  <th class="min-w-[180px]">Đường dẫn (Route)</th>
                  <th class="text-center w-28">Phân loại</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1d3b5a]/40 text-[#d6deeb]">
                <tr v-if="loadingPerms">
                  <td colspan="6" class="text-center py-8">
                    <span class="loading loading-spinner loading-md text-primary"></span>
                  </td>
                </tr>
                <tr v-else-if="menuItemsList.length === 0">
                  <td colspan="6" class="text-center py-8 text-[#94a3b8]">
                    Không có mục menu nào
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="row in menuItemsList"
                  :key="row.id"
                  class="hover:bg-[#0b2942]/40 transition-colors"
                >
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm border-[#1d3b5a] bg-[#0b1a2d]"
                      :checked="isItemChecked(row.id)"
                      :disabled="selectedRole === 'SUPER_ADMIN'"
                      @change="(e: any) => toggleItemPermission(row.id, e.target.checked)"
                    />
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-[#f8fafc]">{{ row.title }}</span>
                      <span v-if="row.tab" class="badge badge-warning badge-xs font-mono">
                        Tab: {{ row.tab }}
                      </span>
                      <span v-else-if="row.category === 'system'" class="badge badge-ghost badge-xs font-mono text-[#94a3b8]">
                        Hệ thống
                      </span>
                    </div>
                  </td>
                  <td>
                    <code class="font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-1.5 py-0.5 rounded border border-[#00f0ff]/20">
                      {{ row.id }}
                    </code>
                  </td>
                  <td class="text-[#94a3b8]">{{ row.description }}</td>
                  <td>
                    <code class="font-mono text-[#ecc48d] bg-[#ecc48d]/10 px-1.5 py-0.5 rounded border border-[#ecc48d]/20">
                      {{ row.route }}
                    </code>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge badge-sm font-mono"
                      :class="row.category === 'plugin' ? 'badge-success badge-outline' : 'badge-primary badge-outline'"
                    >
                      {{ row.category === 'plugin' ? 'Plugin' : 'Hệ thống' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Perm Footer Summary -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0b2942]/60 rounded-md border border-[#1d3b5a] text-xs text-[#94a3b8]">
            <div>
              Đã chọn: <span class="badge badge-sm badge-primary font-mono font-bold">{{ checkedIds.length }}</span> / {{ menuItemsList.length }} mục cho vai trò: <strong class="text-[#ecc48d]">{{ selectedRole }}</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                type="button"
                class="btn btn-xs btn-outline btn-primary font-mono"
                @click="selectAllItems"
              >
                Chọn tất cả
              </button>
              <button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                type="button"
                class="btn btn-xs btn-outline btn-ghost text-[#ef5350] hover:bg-[#ef5350]/20 font-mono"
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePluginStore } from '@/stores/plugin';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import CModuleBoundary from '@/components/shared/CModuleBoundary.vue';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

const router = useRouter();
const pluginStore = usePluginStore();

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
