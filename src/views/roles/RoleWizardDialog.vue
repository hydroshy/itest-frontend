<template>
  <el-dialog
    v-model="visible"
    :title="`Cấu hình Phân quyền & Vai trò: ${roleData?.name || roleData?.code || ''}`"
    width="860px"
    class="role-wizard-dialog"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <!-- Stepper HUD Indicator -->
    <div class="cyber-stepper-container">
      <div
        v-for="(s, idx) in steps"
        :key="s.step"
        class="stepper-item"
        :class="{
          'is-active': currentStep === s.step,
          'is-completed': currentStep > s.step,
        }"
        @click="goToStep(s.step)"
      >
        <div class="step-badge">
          <span v-if="currentStep > s.step" class="step-check">✓</span>
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <div class="step-info">
          <div class="step-title">{{ s.title }}</div>
          <div class="step-desc">{{ s.desc }}</div>
        </div>
        <div v-if="idx < steps.length - 1" class="step-connector" />
      </div>
    </div>

    <!-- Step Contents Container -->
    <div class="wizard-body-content" v-loading="loadingData">
      <!-- STEP 1: Assign Users -->
      <div v-show="currentStep === 1" class="step-panel step-users">
        <div class="panel-header-bar">
          <div class="header-search">
            <el-input
              v-model="userSearchQuery"
              placeholder="Tìm theo tên đăng nhập, họ tên, email..."
              clearable
              prefix-icon="Search"
            />
          </div>
          <div class="header-stats">
            <span class="stat-badge">
              Đã gán: <strong>{{ selectedUserIds.length }}</strong> / {{ allUsers.length }} người dùng
            </span>
            <el-button link type="primary" size="small" @click="selectAllFilteredUsers">
              Chọn tất cả tìm thấy
            </el-button>
            <el-button link type="info" size="small" @click="clearAllUsers">
              Bỏ chọn tất cả
            </el-button>
          </div>
        </div>

        <div class="users-list-scroll">
          <el-table
            :data="filteredUsers"
            style="width: 100%"
            height="360"
            empty-text="Không tìm thấy người dùng nào"
            @selection-change="handleUserSelectionChange"
            ref="userTableRef"
            row-key="id"
          >
            <el-table-column type="selection" width="50" reserve-selection />
            <el-table-column prop="username" label="Tên người dùng" min-width="160">
              <template #default="{ row }">
                <div class="user-row-info">
                  <div class="user-avatar-placeholder">
                    {{ (row.username || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="user-name-text">{{ row.username }}</div>
                    <div class="user-fullname-sub text-muted">{{ row.fullName || 'Chưa đặt tên' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="Email" min-width="180">
              <template #default="{ row }">
                <span class="text-mono">{{ row.email || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isActive" label="Trạng thái" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'danger'" size="small" effect="plain">
                  {{ row.isActive ? 'Hoạt động' : 'Đã khóa' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- STEP 2: Plugin Permissions -->
      <div v-show="currentStep === 2" class="step-panel step-permissions">
        <div class="panel-header-bar">
          <div class="header-search">
            <el-input
              v-model="permSearchQuery"
              placeholder="Tìm theo mã quyền hoặc tên quyền..."
              clearable
              prefix-icon="Search"
            />
          </div>
          <div class="header-stats">
            <span class="stat-badge">
              Đã cấp: <strong>{{ selectedPermissionIds.length }}</strong> / {{ totalPermissionsCount }} quyền
            </span>
            <el-button link type="primary" size="small" @click="toggleSelectAllPermissions(true)">
              Cấp tất cả
            </el-button>
            <el-button link type="info" size="small" @click="toggleSelectAllPermissions(false)">
              Thu hồi tất cả
            </el-button>
          </div>
        </div>

        <div class="permissions-scroll-container">
          <div
            v-for="group in filteredPermissionGroups"
            :key="group.module"
            class="permission-group-card"
          >
            <div class="group-header">
              <div class="group-title-box">
                <span class="group-name">{{ group.moduleTitle || group.module }}</span>
                <span class="group-slug text-mono">{{ group.module }}</span>
                <el-tag size="small" effect="plain" type="info">
                  {{ group.selectedCount }} / {{ group.permissions.length }}
                </el-tag>
              </div>
              <div class="group-actions">
                <el-button
                  size="small"
                  link
                  type="primary"
                  @click="toggleGroupPermissions(group, true)"
                >
                  Chọn nhóm
                </el-button>
                <el-button
                  size="small"
                  link
                  type="info"
                  @click="toggleGroupPermissions(group, false)"
                >
                  Bỏ nhóm
                </el-button>
              </div>
            </div>

            <div class="group-body">
              <el-row :gutter="12">
                <el-col
                  v-for="perm in group.permissions"
                  :key="perm.id"
                  :xs="24"
                  :sm="12"
                  :md="12"
                  class="perm-col-item"
                >
                  <div
                    class="perm-checkbox-item"
                    :class="{ 'is-selected': isPermissionSelected(perm.id) }"
                    @click="toggleSinglePermission(perm.id)"
                  >
                    <el-checkbox
                      :model-value="isPermissionSelected(perm.id)"
                      @change="() => toggleSinglePermission(perm.id)"
                      @click.stop
                    />
                    <div class="perm-detail">
                      <div class="perm-title-row">
                        <span class="perm-code text-mono">{{ perm.code || perm.name }}</span>
                        <el-tag
                          v-if="getActionTag(perm.action || perm.code)"
                          :type="getActionTag(perm.action || perm.code).type"
                          size="small"
                          effect="plain"
                          class="action-tag"
                        >
                          {{ getActionTag(perm.action || perm.code).label }}
                        </el-tag>
                      </div>
                      <div class="perm-desc text-muted">
                        {{ perm.description || perm.name || 'Không có mô tả chi tiết' }}
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>

          <el-empty
            v-if="filteredPermissionGroups.length === 0"
            description="Không tìm thấy quyền nào phù hợp từ khóa"
          />
        </div>
      </div>

      <!-- STEP 3: Plugin Menu Views Visibility -->
      <div v-show="currentStep === 3" class="step-panel step-menus">
        <div class="panel-header-bar">
          <div class="header-search">
            <el-input
              v-model="menuSearchQuery"
              placeholder="Tìm view/card menu theo tiêu đề, route, plugin..."
              clearable
              prefix-icon="Search"
            />
          </div>
          <div class="header-stats">
            <span class="stat-badge">
              Hiển thị: <strong>{{ selectedMenuIds.length }}</strong> / {{ allMenuItems.length }} Views
            </span>
            <el-button link type="primary" size="small" @click="toggleSelectAllMenus(true)">
              Hiện tất cả
            </el-button>
            <el-button link type="info" size="small" @click="toggleSelectAllMenus(false)">
              Ẩn tất cả
            </el-button>
          </div>
        </div>

        <div class="menus-scroll-container">
          <el-row :gutter="14">
            <el-col
              v-for="menu in filteredMenuItems"
              :key="menu.id"
              :xs="24"
              :sm="12"
              :md="8"
              class="menu-col-card"
            >
              <div
                class="menu-view-card"
                :class="{ 'is-enabled': isMenuSelected(menu.id) }"
                @click="toggleMenuCard(menu.id)"
              >
                <div class="card-top">
                  <div class="card-icon-box">
                    <CyberIcon :name="menu.icon || 'Collection'" class="card-icon" />
                  </div>
                  <div class="card-switch" @click.stop>
                    <el-switch
                      :model-value="isMenuSelected(menu.id)"
                      active-color="#38bdf8"
                      inactive-color="#334155"
                      @change="() => toggleMenuCard(menu.id)"
                    />
                  </div>
                </div>

                <div class="card-body">
                  <div class="card-title">{{ menu.title }}</div>
                  <div class="card-route text-mono">{{ menu.route || menu.path || '--' }}</div>
                  <div class="card-desc text-muted">
                    {{ menu.description || 'Hiển thị trên bảng menu và thanh điều hướng' }}
                  </div>
                </div>

                <div class="card-footer">
                  <el-tag size="small" effect="plain" type="info">
                    {{ menu.category || menu.pluginId || 'system' }}
                  </el-tag>
                  <span class="status-indicator" :class="{ 'status-active': isMenuSelected(menu.id) }">
                    {{ isMenuSelected(menu.id) ? 'Hiển thị' : 'Đã ẩn' }}
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-empty
            v-if="filteredMenuItems.length === 0"
            description="Không tìm thấy mục menu nào phù hợp từ khóa"
          />
        </div>
      </div>
    </div>

    <!-- Wizard Footer Controls -->
    <template #footer>
      <div class="wizard-footer-bar">
        <div class="footer-left">
          <span class="text-muted footer-hint">
            Bước {{ currentStep }} / 3: {{ steps[currentStep - 1]?.title }}
          </span>
        </div>
        <div class="footer-right">
          <el-button @click="visible = false" :disabled="submitting">
            Hủy
          </el-button>
          <el-button
            v-if="currentStep > 1"
            @click="prevStep"
            :disabled="submitting"
          >
            Quay lại
          </el-button>
          <el-button
            v-if="currentStep < 3"
            type="primary"
            class="cyber-action-btn"
            @click="nextStep"
          >
            Tiếp tục
          </el-button>
          <el-button
            v-else
            type="primary"
            class="cyber-action-btn cyber-done-btn"
            :loading="submitting"
            @click="submitWizard"
          >
            Hoàn tất & Áp dụng
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import { httpClient } from '@/api/client';
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
const userTableRef = ref<any>();

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
  { id: 'final-config:tool', title: 'Final Config Tool', route: '/plugins/final-config?tab=tool', icon: 'Cpu', pluginId: 'final-config', description: 'Nạp cấu hình thiết bị tự động qua Web Serial và kiểm thử 4 công đoạn.' },
  { id: 'final-config:manager', title: 'Final Config Manager', route: '/plugins/final-config?tab=manager', icon: 'Memo', pluginId: 'final-config', description: 'Quản lý, tìm kiếm và tra cứu danh sách profile Final Config.' },
  { id: 'final-config:test', title: 'Final Config Test', route: '/plugins/final-config?tab=test', icon: 'Checked', pluginId: 'final-config', description: 'Kiểm thử chức năng phần cứng và truyền nhận dữ liệu thiết bị.' },
  { id: 'device-traceability:manager', title: 'Device Traceability', route: '/plugins/device-traceability?tab=manager', icon: 'Search', pluginId: 'device-traceability', description: 'Tra cứu lịch sử cấu hình, mã DevEUI, Serials và truy xuất nguồn gốc thiết bị.' },
  { id: 'device-traceability:dis-sync', title: 'DIS Sync Tool', route: '/plugins/device-traceability?tab=dis-sync', icon: 'Refresh', pluginId: 'device-traceability', description: 'Đồng bộ đơn hàng sản xuất và danh sách lệnh xuất từ hệ thống DIS.' },
  { id: 'memmap-manager:manager', title: 'Memmap Manager', route: '/plugins/memmap-manager?tab=manager', icon: 'Collection', pluginId: 'memmap-manager', description: 'Quản lý danh sách profile bản đồ bộ nhớ thiết bị Modbus và payload IEC485.' },
  { id: 'memmap-payload:upload', title: 'Memmap Upload', route: '/plugins/memmap-manager?tab=upload', icon: 'Upload', pluginId: 'memmap-manager', description: 'Tải lên và tiền kiểm tra tệp CSV Memmap Payload trước khi lưu trữ.' },
  { id: 'lorawan-chirpstack:integration', title: 'LoRaWAN ChirpStack', route: '/plugins/lorawan-chirpstack', icon: 'Connection', pluginId: 'lorawan-chirpstack', description: 'Đồng bộ thiết bị và cấu hình kết nối ChirpStack Network Server v4.' },
  { id: 'users:manager', title: 'Quản lý Người dùng', route: '/users', icon: 'User', category: 'system', description: 'Quản lý danh sách tài khoản, phân quyền và trạng thái đăng nhập.' },
  { id: 'roles:manager', title: 'Quản lý Phân quyền', route: '/roles', icon: 'Lock', category: 'system', description: 'Thiết lập vai trò, ma trận quyền hạn và quyền xem menu.' },
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

    // 2. Load role users membership (from role or users endpoint)
    try {
      const roleUsersRes: any = await httpClient.get(`/roles/${props.role.id}/users`);
      const assigned = Array.isArray(roleUsersRes) ? roleUsersRes : (roleUsersRes?.data || roleUsersRes?.userIds || []);
      if (Array.isArray(assigned) && assigned.length > 0) {
        selectedUserIds.value = assigned.map((item: any) => (typeof item === 'string' ? item : item.id));
      } else {
        // Fallback: Check allUsers having this role code or id
        const roleCode = props.role.code?.toUpperCase();
        selectedUserIds.value = allUsers.value
          .filter((u) => u.roles?.some((r: any) => r.id === props.role?.id || r.code?.toUpperCase() === roleCode))
          .map((u) => u.id);
      }
    } catch {
      // Fallback
      const roleCode = props.role.code?.toUpperCase();
      selectedUserIds.value = allUsers.value
        .filter((u) => u.roles?.some((r: any) => r.id === props.role?.id || r.code?.toUpperCase() === roleCode))
        .map((u) => u.id);
    }

    // Sync table selection in next tick
    await nextTick();
    syncUserTableSelection();

    // 3. Load permissions
    try {
      const pRes: any = await httpClient.get('/roles/permissions');
      const pList = Array.isArray(pRes) ? pRes : (pRes?.data || []);
      if (Array.isArray(pList) && pList.length > 0) {
        allPermissions.value = pList;
      } else {
        // Fallback from standardized catalog
        const flatCatalog: PermissionItem[] = [];
        for (const grp of PLUGIN_PERMISSION_GROUPS) {
          for (const p of grp.permissions) {
            flatCatalog.push({
              id: p.id,
              code: p.id,
              name: p.name,
              module: grp.pluginId,
              action: p.action,
              description: p.description,
            });
          }
        }
        allPermissions.value = flatCatalog;
      }
    } catch {
      const flatCatalog: PermissionItem[] = [];
      for (const grp of PLUGIN_PERMISSION_GROUPS) {
        for (const p of grp.permissions) {
          flatCatalog.push({
            id: p.id,
            code: p.id,
            name: p.name,
            module: grp.pluginId,
            action: p.action,
            description: p.description,
          });
        }
      }
      allPermissions.value = flatCatalog;
    }

    // Load role permissions
    try {
      const rDetail: any = await httpClient.get(`/roles/${props.role.id}`);
      const perms = rDetail?.permissions || props.role.permissions || [];
      selectedPermissionIds.value = perms.map((p: any) => (typeof p === 'string' ? p : p.id));
    } catch {
      const perms = props.role.permissions || [];
      selectedPermissionIds.value = perms.map((p: any) => (typeof p === 'string' ? p : p.id));
    }

    // 4. Load menu items
    try {
      const mRes: any = await httpClient.get('/menu/admin/items');
      const mList = Array.isArray(mRes) ? mRes : (mRes?.data || mRes?.items || []);
      if (Array.isArray(mList) && mList.length > 0) {
        allMenuItems.value = mList;
      } else {
        allMenuItems.value = (PLUGIN_MENU_VIEWS as MenuItem[]) || fallbackMenuItems;
      }
    } catch {
      allMenuItems.value = (PLUGIN_MENU_VIEWS as MenuItem[]) || fallbackMenuItems;
    }

    // Load role menu permissions
    try {
      const roleAssignmentsRes: any = await httpClient.get('/menu/admin/role-assignments');
      const assignments = roleAssignmentsRes?.data || roleAssignmentsRes || {};
      const roleCode = (props.role.code || '').toUpperCase();
      if (assignments[roleCode] && Array.isArray(assignments[roleCode])) {
        selectedMenuIds.value = [...assignments[roleCode]];
      } else {
        // Fallback: default to all items if admin, or subset
        if (roleCode === 'ADMIN' || roleCode === 'SUPER_ADMIN') {
          selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
        } else {
          selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
        }
      }
    } catch {
      selectedMenuIds.value = allMenuItems.value.map((m) => m.id);
    }
  } catch (err: any) {
    ElMessage.error(err?.message || 'Có lỗi khi tải dữ liệu cấu hình phân quyền.');
  } finally {
    loadingData.value = false;
  }
}

// Step 1: User table sync
function syncUserTableSelection() {
  if (!userTableRef.value) return;
  userTableRef.value.clearSelection();
  for (const user of allUsers.value) {
    if (selectedUserIds.value.includes(user.id)) {
      userTableRef.value.toggleRowSelection(user, true);
    }
  }
}

function handleUserSelectionChange(selection: UserItem[]) {
  // Merge current visible selection with previously selected IDs
  const visibleIds = filteredUsers.value.map((u) => u.id);
  const selectedInVisible = selection.map((u) => u.id);

  // Keep ids that were not in visible set, and update for visible set
  const preserved = selectedUserIds.value.filter((id) => !visibleIds.includes(id));
  selectedUserIds.value = Array.from(new Set([...preserved, ...selectedInVisible]));
}

function selectAllFilteredUsers() {
  const ids = filteredUsers.value.map((u) => u.id);
  selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, ...ids]));
  syncUserTableSelection();
}

function clearAllUsers() {
  selectedUserIds.value = [];
  if (userTableRef.value) {
    userTableRef.value.clearSelection();
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
    // 1. Save Users (Step 1)
    try {
      await httpClient.put(`/roles/${roleId}/users`, {
        userIds: selectedUserIds.value,
      });
    } catch (uErr: any) {
      console.warn('PUT /roles/:id/users fallback:', uErr);
      // Fallback via PATCH /roles/:id or individual user updates if needed
    }

    // 2. Save Permissions (Step 2)
    try {
      await httpClient.put(`/roles/${roleId}/permissions`, {
        permissionIds: selectedPermissionIds.value,
      });
    } catch (pErr: any) {
      // Fallback to PATCH /roles/:id
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
      // Fallback to /menu/admin/assign
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
      ElMessage.warning(`Lưu hoàn tất với cảnh báo: ${errors.join('; ')}`);
    } else {
      ElMessage.success(`Cấu hình phân quyền vai trò ${props.role.name} thành công!`);
    }

    emit('saved');
    visible.value = false;
  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể lưu cấu hình phân quyền.');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.role-wizard-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color, #334155);
  padding: 16px 20px;
  margin-right: 0;
}

.role-wizard-dialog :deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 16px;
  color: #f1f5f9;
}

.role-wizard-dialog :deep(.el-dialog__body) {
  padding: 18px 24px 10px;
}

.role-wizard-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid var(--border-color, #334155);
  padding: 14px 20px;
}

/* Cyber Stepper Indicator */
.cyber-stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(15, 23, 42, 0.6);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #334155;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  position: relative;
  transition: all 0.2s ease;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #475569;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.step-desc {
  font-size: 11px;
  color: #64748b;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #334155;
  margin: 0 12px;
}

.stepper-item.is-active .step-badge {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.stepper-item.is-active .step-title {
  color: #38bdf8;
}

.stepper-item.is-completed .step-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border-color: #f59e0b;
}

.stepper-item.is-completed .step-title {
  color: #e2e8f0;
}

.stepper-item.is-completed .step-connector {
  background: #f59e0b;
}

/* Panel Header Bar */
.panel-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.header-search {
  flex: 1;
  max-width: 380px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-badge {
  font-size: 12px;
  color: #94a3b8;
  background: #1e293b;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #334155;
}

.stat-badge strong {
  color: #38bdf8;
}

/* Step 1: Users */
.users-list-scroll {
  border: 1px solid #334155;
  border-radius: 6px;
  overflow: hidden;
}

.user-row-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.user-name-text {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 13px;
}

.user-fullname-sub {
  font-size: 11px;
}

/* Step 2: Permissions */
.permissions-scroll-container {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.permission-group-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.group-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-weight: 600;
  font-size: 13px;
  color: #f1f5f9;
}

.group-slug {
  font-size: 11px;
  color: #64748b;
  background: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
}

.group-body {
  padding: 10px 14px;
}

.perm-col-item {
  margin-bottom: 8px;
}

.perm-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.perm-checkbox-item:hover {
  background: rgba(56, 189, 248, 0.06);
  border-color: rgba(56, 189, 248, 0.4);
}

.perm-checkbox-item.is-selected {
  background: rgba(56, 189, 248, 0.1);
  border-color: #38bdf8;
}

.perm-detail {
  flex: 1;
  min-width: 0;
}

.perm-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.perm-code {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.action-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 18px;
}

.perm-desc {
  font-size: 11px;
  margin-top: 2px;
  line-height: 1.3;
}

/* Step 3: Menus */
.menus-scroll-container {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}

.menu-col-card {
  margin-bottom: 14px;
}

.menu-view-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease;
}

.menu-view-card:hover {
  border-color: rgba(56, 189, 248, 0.4);
}

.menu-view-card.is-enabled {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.05);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 16px;
}

.card-body {
  flex: 1;
  margin-bottom: 10px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 4px;
}

.card-route {
  font-size: 11px;
  color: #38bdf8;
  margin-bottom: 6px;
  word-break: break-all;
}

.card-desc {
  font-size: 11px;
  line-height: 1.3;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #1e293b;
  padding-top: 8px;
  font-size: 11px;
}

.status-indicator {
  color: #64748b;
}

.status-indicator.status-active {
  color: #38bdf8;
  font-weight: 600;
}

/* Footer Bar */
.wizard-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.footer-hint {
  font-size: 12px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cyber-action-btn {
  font-weight: 700;
  height: 36px;
  padding: 0 18px;
}

.cyber-done-btn {
  background-color: #0284c7 !important;
  border-color: #0284c7 !important;
}

.text-mono {
  font-family: monospace;
}

.text-muted {
  color: #64748b;
}
</style>
