<template>
  <div class="dashboard-container">
    <!-- Header with Quick Switch to Menu -->
    <div class="dashboard-header">
      <div>
        <h2 class="dashboard-title">Bảng điều khiển Trung tâm</h2>
        <p class="dashboard-subtitle">Quản lý tổng quan hệ thống, tiện ích plugin và phân quyền menu truy cập</p>
      </div>
      <el-button type="primary" :icon="Grid" @click="goToMenu">
        Mở Menu Ứng dụng
      </el-button>
    </div>

    <!-- Summary Metrics -->
    <el-row :gutter="20" class="metric-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Trạng thái Shell</span>
              <span class="metric-value status-online">Hoạt động</span>
            </div>
            <div class="metric-icon-box bg-blue">
              <el-icon><Platform /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Plugins đã nạp</span>
              <span class="metric-value">{{ pluginStore.plugins.length }}</span>
            </div>
            <div class="metric-icon-box bg-green">
              <el-icon><SetUp /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Mô-đun kích hoạt</span>
              <span class="metric-value">{{ pluginStore.activePlugins.length }}</span>
            </div>
            <div class="metric-icon-box bg-orange">
              <el-icon><Connection /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">SDK Version</span>
              <span class="metric-value">v{{ pluginStore.diagnostics.sdkVersion }}</span>
            </div>
            <div class="metric-icon-box bg-purple">
              <el-icon><Cpu /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Content Tabs: Widgets & Menu Assignment Management -->
    <el-tabs v-model="activeTab" class="dashboard-tabs" type="border-card">
      <!-- Tab 1: Plugin Widgets -->
      <el-tab-pane label="TIỆN ÍCH HỆ THỐNG (WIDGETS)" name="widgets">
        <div class="tab-pane-content">
          <el-row v-if="pluginStore.widgets.length > 0" :gutter="20">
            <el-col
              v-for="widget in pluginStore.widgets"
              :key="widget.id"
              :xs="24"
              :sm="widget.width === 'half' ? 12 : 24"
              :md="widget.width === 'third' ? 8 : widget.width === 'half' ? 12 : 24"
              class="widget-col"
            >
              <el-card shadow="hover" class="widget-card">
                <template #header>
                  <div class="widget-header">
                    <span class="widget-title">{{ widget.title }}</span>
                  </div>
                </template>
                <CModuleBoundary :module-name="`Widget: ${widget.title}`">
                  <component :is="widget.component" />
                </CModuleBoundary>
              </el-card>
            </el-col>
          </el-row>

          <el-empty
            v-else
            description="Chưa có tiện ích nào được cung cấp bởi plugin hiện tại"
            :image-size="100"
          />
        </div>
      </el-tab-pane>

      <!-- Tab 2: Quản lý Phân quyền Menu theo Role & Tab Plugin -->
      <el-tab-pane label="QUẢN LÝ PHÂN QUYỀN MENU" name="menu-permission">
        <div class="tab-pane-content menu-permission-section">
          <div class="section-top-bar">
            <div>
              <h3 class="perm-title">Phân quyền Menu & Từng Tab Tính năng</h3>
              <p class="perm-desc">
                Cấu hình các menu card hiển thị trên trang Menu (/menu) theo từng vai trò (Role).
                Hỗ trợ phân quyền riêng cho từng tab/tính năng (ví dụ: Final Config Tool).
              </p>
            </div>
            <div class="role-selector-box">
              <span class="role-label">Chọn Vai trò:</span>
              <el-select
                v-model="selectedRole"
                placeholder="Chọn vai trò"
                style="width: 220px"
                @change="onRoleChange"
              >
                <el-option
                  v-for="role in rolesList"
                  :key="role.code"
                  :label="`${role.name} (${role.code})`"
                  :value="role.code"
                />
              </el-select>
              <el-button
                type="primary"
                :icon="Check"
                :loading="savingPerms"
                :disabled="!selectedRole"
                @click="saveMenuPermissions"
              >
                Lưu Phân quyền
              </el-button>
              <el-button :icon="Refresh" @click="loadData">
                Làm mới
              </el-button>
            </div>
          </div>

          <el-divider style="margin: 16px 0;" />

          <div v-loading="loadingPerms" class="perm-tables-container">
            <el-alert
              v-if="selectedRole === 'SUPER_ADMIN'"
              title="SUPER_ADMIN có toàn quyền truy cập tất cả menu và tính năng trong hệ thống."
              type="info"
              show-icon
              :closable="false"
              style="margin-bottom: 16px;"
            />

            <!-- Bảng phân quyền chi tiết -->
            <el-table
              :data="menuItemsList"
              style="width: 100%"
              row-key="id"
              border
              empty-text="Không có menu item nào"
            >
              <el-table-column label="Cho phép hiển thị" width="160" align="center">
                <template #default="{ row }">
                  <el-checkbox
                    :model-value="isItemChecked(row.id)"
                    :disabled="selectedRole === 'SUPER_ADMIN'"
                    @change="(val: boolean) => toggleItemPermission(row.id, val)"
                  />
                </template>
              </el-table-column>

              <el-table-column prop="title" label="Tên Menu / Tính năng" min-width="200">
                <template #default="{ row }">
                  <div class="menu-item-info">
                    <span class="menu-name">{{ row.title }}</span>
                    <el-tag v-if="row.tab" size="small" type="warning" effect="light">
                      Tab: {{ row.tab }}
                    </el-tag>
                    <el-tag v-else-if="row.category === 'system'" size="small" type="info">
                      Hệ thống
                    </el-tag>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="id" label="Mã ID Menu" width="220">
                <template #default="{ row }">
                  <code>{{ row.id }}</code>
                </template>
              </el-table-column>

              <el-table-column prop="description" label="Mô tả chức năng" min-width="260" />

              <el-table-column prop="route" label="Đường dẫn (Route)" min-width="220">
                <template #default="{ row }">
                  <code>{{ row.route }}</code>
                </template>
              </el-table-column>

              <el-table-column prop="category" label="Phân loại" width="130" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.category === 'plugin' ? 'success' : 'primary'">
                    {{ row.category === 'plugin' ? 'Plugin' : 'Hệ thống' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="perm-footer-summary">
              <span>Đã chọn: <strong>{{ checkedIds.length }}</strong> / {{ menuItemsList.length }} mục cho vai trò <strong>{{ selectedRole }}</strong></span>
              <el-button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                size="small"
                @click="selectAllItems"
              >
                Chọn tất cả
              </el-button>
              <el-button
                v-if="selectedRole !== 'SUPER_ADMIN'"
                size="small"
                @click="clearAllItems"
              >
                Bỏ chọn tất cả
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePluginStore } from '@/stores/plugin';
import {
  Platform,
  SetUp,
  Connection,
  Cpu,
  Grid,
  Refresh,
  Check
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
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
    route: '/plugins/final-config?tab=tool',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'tool',
    order: 10
  },
  {
    id: 'final-config:manager',
    title: 'Final Config - Quản lý hồ sơ',
    description: 'Tra cứu danh sách Final Config, lọc hồ sơ SKU và xuất audit kiểm định.',
    route: '/plugins/final-config?tab=manager',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'manager',
    order: 11
  },
  {
    id: 'final-config:create',
    title: 'Final Config - Tạo mới hồ sơ',
    description: 'Khởi tạo cấu hình cuối mới từ Memmap Payload đã được nghiệm thu.',
    route: '/plugins/final-config?tab=create',
    category: 'plugin',
    pluginId: 'final-config',
    tab: 'create',
    order: 12
  },
  {
    id: 'device-traceability:so',
    title: 'Device Traceability - Lệnh sản xuất (SO)',
    description: 'Quản lý và kích hoạt lệnh sản xuất (Sales Order) cho dây chuyền.',
    route: '/plugins/device-traceability/so',
    category: 'plugin',
    pluginId: 'device-traceability',
    tab: 'so',
    order: 20
  },
  {
    id: 'device-traceability:devices',
    title: 'Device Traceability - Quản lý Thiết bị',
    description: 'Tra cứu lịch sử DevEUI, MAC, trạng thái sản xuất và biên bản xuất xưởng.',
    route: '/plugins/device-traceability/devices',
    category: 'plugin',
    pluginId: 'device-traceability',
    tab: 'devices',
    order: 21
  },
  {
    id: 'memmap-payload:manager',
    title: 'Memmap Manager',
    description: 'Quản lý bản đồ bộ nhớ Modbus Register, chuẩn hóa payload định dạng Hex.',
    route: '/plugins/memmap-manager',
    category: 'plugin',
    pluginId: 'memmap-manager',
    order: 30
  },
  {
    id: 'lorawan-chirpstack:integration',
    title: 'ChirpStack Integration',
    description: 'Giám sát trạm Gateway LoRaWAN, đồng bộ thiết bị và kiểm tra kết nối Network Server.',
    route: '/plugins/lorawan-chirpstack',
    category: 'plugin',
    pluginId: 'lorawan-chirpstack',
    order: 40
  }
];

const menuItemsList = ref<MenuItemDef[]>(fallbackMenuItems);
const roleAssignments = ref<Record<string, string[]>>({
  SUPER_ADMIN: fallbackMenuItems.map(m => m.id),
  ADMIN: fallbackMenuItems.map(m => m.id),
  END_USER: ['final-config:tool'],
  OPERATOR: ['final-config:tool', 'device-traceability:so', 'device-traceability:devices']
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
      // Dùng fallbackMenuItems
    }

    // 3. Tải ma trận phân quyền theo role
    try {
      const assignRes: any = await httpClient.get('/menu/admin/role-assignments');
      const assignData = assignRes?.data || assignRes;
      if (assignData && typeof assignData === 'object') {
        roleAssignments.value = { ...roleAssignments.value, ...assignData };
      }
    } catch {
      // Dùng default roleAssignments
    }

    onRoleChange();
  } catch (err: any) {
    console.warn('Lỗi khi tải dữ liệu phân quyền menu:', err);
  } finally {
    loadingPerms.value = false;
  }
}

async function saveMenuPermissions() {
  if (!selectedRole.value) {
    ElMessage.warning('Vui lòng chọn vai trò');
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
    ElMessage.success(`Đã lưu phân quyền menu cho vai trò ${selectedRole.value} thành công!`);
  } catch (err: any) {
    // Nếu backend chưa deploy kịp, vẫn lưu vào local state để preview và báo thông tin
    roleAssignments.value[selectedRole.value] = [...checkedIds.value];
    ElMessage.success(`Đã cập nhật phân quyền cục bộ cho vai trò ${selectedRole.value}`);
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--cyber-card-bg, rgba(10, 18, 32, 0.85));
  border-radius: 8px;
  border: 1px solid var(--cyber-border-color, rgba(0, 240, 255, 0.2));
  backdrop-filter: blur(12px);
}

.dashboard-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--cyber-text-primary, #e2e8f0);
  font-family: var(--cyber-font-header, 'Orbitron', sans-serif);
  letter-spacing: 0.5px;
}

.dashboard-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--cyber-text-secondary, #94a3b8);
}

.metric-row {
  margin-bottom: 8px;
}

.metric-card {
  border-radius: 8px;
  border: 1px solid var(--cyber-border-color, rgba(0, 240, 255, 0.2));
  background: var(--cyber-card-bg, rgba(10, 18, 32, 0.85));
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: var(--cyber-cyan-neon, #00f0ff);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.metric-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 13px;
  color: var(--cyber-text-secondary, #94a3b8);
  margin-bottom: 6px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyber-text-primary, #f8fafc);
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
}

.status-online {
  color: #10b981;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.metric-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-blue { background-color: rgba(59, 130, 246, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
.bg-green { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
.bg-orange { background-color: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3); }
.bg-purple { background-color: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }

.dashboard-tabs {
  background: var(--cyber-card-bg, rgba(10, 18, 32, 0.85));
  border: 1px solid var(--cyber-border-color, rgba(0, 240, 255, 0.2));
  border-radius: 8px;
  min-height: 450px;
  backdrop-filter: blur(12px);
  padding: 8px 16px;
}

.tab-pane-content {
  padding: 12px 4px;
}

.widget-col {
  margin-bottom: 20px;
}

.widget-card {
  border-radius: 8px;
  border: 1px solid var(--cyber-border-color, rgba(0, 240, 255, 0.2));
  background: var(--cyber-card-bg, rgba(10, 18, 32, 0.85));
  backdrop-filter: blur(10px);
  min-height: 200px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--cyber-text-primary, #e2e8f0);
}

.menu-permission-section {
  display: flex;
  flex-direction: column;
}

.section-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.perm-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--cyber-text-primary, #f8fafc);
  font-family: var(--cyber-font-header, 'Orbitron', sans-serif);
}

.perm-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--cyber-text-secondary, #94a3b8);
  max-width: 650px;
}

.role-selector-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.role-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--cyber-text-primary, #e2e8f0);
}

.menu-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-name {
  font-weight: 600;
  color: var(--cyber-text-primary, #e2e8f0);
}

.perm-footer-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 6px;
  border: 1px solid var(--cyber-border-color, rgba(0, 240, 255, 0.2));
  font-size: 13px;
  color: var(--cyber-text-secondary, #94a3b8);
}
</style>
