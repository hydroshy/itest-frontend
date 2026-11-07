<template>
  <div class="dashboard-container flex flex-col gap-6 text-[var(--owl-text-primary)] transition-colors duration-250">
    <!-- Hero Header Modular Component -->
    <DashboardHero
      :refreshing="refreshing"
      :current-role-label="currentRoleLabel"
      :user="authStore.user"
      @refresh="handleRefresh"
      @launch="router.push('/menu')"
    />

    <!-- KPI Metrics Strip Modular Component -->
    <DashboardStats :roles-count="rolesList.length" />

    <!-- Main Workspace Section: Tabs & Dynamic Subviews -->
    <div class="bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-3xl overflow-hidden shadow-sm transition-colors duration-250">
      <!-- Tab Header Strip -->
      <div class="flex items-center gap-2 p-3 border-b border-[var(--owl-border)] bg-[var(--owl-bg-aside)] overflow-x-auto">
        <button
          type="button"
          class="px-5 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 cursor-pointer"
          :class="activeTab === 'widgets'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
          @click="activeTab = 'widgets'"
        >
          <font-awesome-icon :icon="['fas', 'cubes']" class="mr-2" />
          Tiện ích Hệ thống (Widgets)
        </button>

        <button
          type="button"
          class="px-5 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 cursor-pointer"
          :class="activeTab === 'menu-permission'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
          @click="activeTab = 'menu-permission'"
        >
          <font-awesome-icon :icon="['fas', 'shield-halved']" class="mr-2" />
          Quản lý Phân quyền Menu
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-5 md:p-6">
        <!-- Tab 1: Plugin Widgets -->
        <DashboardWidgetsTab v-show="activeTab === 'widgets'" />

        <!-- Tab 2: Menu Permission Matrix -->
        <DashboardMenuPermsTab
          v-show="activeTab === 'menu-permission'"
          :selected-role="selectedRole"
          :roles-list="rolesList"
          :menu-items-list="menuItemsList"
          :allowed-menu-ids="checkedIds"
          :loading-perms="loadingPerms"
          :saving-perms="savingPerms"
          @role-change="handleRoleChange"
          @refresh="loadData"
          @save="saveMenuPermissions"
          @toggle-menu="toggleMenuItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePluginStore } from '@/stores/plugin';
import { useAuthStore } from '@/stores/auth';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';
import DashboardHero from './components/DashboardHero.vue';
import DashboardStats from './components/DashboardStats.vue';
import DashboardWidgetsTab from './components/DashboardWidgetsTab.vue';
import DashboardMenuPermsTab from './components/DashboardMenuPermsTab.vue';

const router = useRouter();
const pluginStore = usePluginStore();
const authStore = useAuthStore();

const refreshing = ref(false);
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
  description?: string;
  route: string;
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
    id: 'device-traceability:tool',
    title: 'Device Traceability Tool (Isolated View)',
    description: 'Giao diện độc lập chỉ tra cứu số series và truy xuất lịch sử kiểm tra thiết bị.',
    route: '/plugin/device-traceability/tool',
    category: 'plugin',
    pluginId: 'device-traceability',
    tab: 'tool',
    order: 11
  }
];

const menuItemsList = ref<any[]>(fallbackMenuItems);
const checkedIds = ref<string[]>([]);
const roleAssignments = ref<Record<string, string[]>>({
  SUPER_ADMIN: fallbackMenuItems.map(m => m.id),
  ADMIN: fallbackMenuItems.map(m => m.id),
  END_USER: ['dashboard', 'final-config:tool', 'device-traceability:tool'],
  OPERATOR: ['dashboard', 'final-config:tool', 'device-traceability:tool']
});

const currentRoleLabel = computed(() => {
  const upperRoles = authStore.roles.map((r: string) => String(r).toUpperCase().trim());
  if (upperRoles.includes('SUPER_ADMIN') || upperRoles.includes('QUẢN TRỊ TỐI CAO')) return 'Quản trị tối cao';
  if (upperRoles.includes('ADMIN') || upperRoles.includes('QUẢN TRỊ VIÊN') || authStore.isAdmin) return 'Quản trị viên';
  if (upperRoles.includes('OPERATOR') || upperRoles.includes('KỸ THUẬT VIÊN VẬN HÀNH') || upperRoles.includes('KỸ THUẬT VIÊN')) return 'Kỹ thuật viên';
  return 'Người dùng thao tác';
});

async function handleRefresh() {
  refreshing.value = true;
  try {
    pluginStore.refreshState();
    await loadData();
    cyberToast.success('Đã cập nhật chỉ số hệ thống!');
  } catch {
    cyberToast.error('Không thể làm mới dữ liệu');
  } finally {
    setTimeout(() => {
      refreshing.value = false;
    }, 350);
  }
}

function handleRoleChange(role: string) {
  selectedRole.value = role;
  if (selectedRole.value === 'SUPER_ADMIN') {
    checkedIds.value = menuItemsList.value.map(m => m.id);
  } else {
    checkedIds.value = [...(roleAssignments.value[selectedRole.value] || [])];
  }
}

function toggleMenuItem(id: string) {
  const idx = checkedIds.value.indexOf(id);
  if (idx > -1) {
    checkedIds.value.splice(idx, 1);
  } else {
    checkedIds.value.push(id);
  }
}

async function loadData() {
  loadingPerms.value = true;
  try {
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
      // Fallback roles
    }

    try {
      const itemsRes: any = await httpClient.get('/menu/admin/items');
      const itemsData = itemsRes?.data || itemsRes;
      if (Array.isArray(itemsData) && itemsData.length > 0) {
        menuItemsList.value = itemsData;
      }
    } catch {
      // Fallback items
    }

    try {
      const assignRes: any = await httpClient.get('/menu/admin/assignments');
      const assignData = assignRes?.data || assignRes;
      if (assignData && typeof assignData === 'object') {
        roleAssignments.value = { ...roleAssignments.value, ...assignData };
      }
    } catch {
      // Fallback assignments
    }

    handleRoleChange(selectedRole.value);
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
    roleAssignments.value[selectedRole.value] = [...checkedIds.value];
    cyberToast.success(`Đã lưu phân quyền menu cho vai trò ${selectedRole.value} thành công!`);
  } catch {
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

<style scoped>
.dashboard-container {
  font-family: var(--cyber-font-body);
}
</style>
