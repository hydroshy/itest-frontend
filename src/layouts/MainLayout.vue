<template>
  <el-container class="layout-container">
  <!-- Sidebar (Ẩn hoàn toàn khi ở trang Launcher /menu, chỉ hiển thị khi chuyển sang dashboard/trang quản trị/plugin) -->
  <el-aside
    v-if="showSidebar"
    :width="isCollapse ? '64px' : '240px'"
    class="layout-aside"
  >
      <div class="logo-box">
        <span v-show="!isCollapse" class="logo-text">iTEST 2.0</span>
      </div>

      <el-scrollbar>
        <el-menu
          :default-active="activeRoute"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          background-color="#0b101c"
          text-color="#94a3b8"
          active-text-color="#00f0ff"
          class="sidebar-menu"
        >
          <!-- Core Menu Group -->
          <el-menu-item index="/menu">
            <el-icon><CyberIcon name="grid" size="18" /></el-icon>
            <template #title>Trung tâm Ứng dụng</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessDashboard" index="/dashboard">
            <el-icon><CyberIcon name="dashboard" size="18" /></el-icon>
            <template #title>Bảng điều khiển</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/users">
            <el-icon><CyberIcon name="users" size="18" /></el-icon>
            <template #title>Quản lý Người dùng</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/roles">
            <el-icon><CyberIcon name="roles" size="18" /></el-icon>
            <template #title>Quản lý Phân quyền</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/plugins">
            <el-icon><CyberIcon name="plugins" size="18" /></el-icon>
            <template #title>Quản lý Plugin</template>
          </el-menu-item>

          <!-- Divider if there are plugin menus -->
          <div v-if="pluginStore.menus.length > 0" class="menu-divider">
            <span v-show="!isCollapse">MÔ-ĐUN MỞ RỘNG</span>
          </div>

          <!-- Dynamic Plugin Menus -->
          <template v-for="menu in pluginStore.menus" :key="menu.id">
            <!-- Submenu -->
            <el-sub-menu
              v-if="menu.children && menu.children.length > 0"
              :index="menu.id"
            >
              <template #title>
                <el-icon>
                  <CyberIcon :name="resolveCyberIconName(menu.icon)" size="18" />
                </el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item
                v-for="sub in menu.children"
                :key="sub.id"
                :index="sub.path"
              >
                <el-icon v-if="sub.icon">
                  <CyberIcon :name="resolveCyberIconName(sub.icon)" size="18" />
                </el-icon>
                <template #title>{{ sub.title }}</template>
              </el-menu-item>
            </el-sub-menu>

            <!-- Single Item -->
            <el-menu-item v-else :index="menu.path">
              <el-icon>
                <CyberIcon :name="resolveCyberIconName(menu.icon)" size="18" />
              </el-icon>
              <template #title>
                <span>{{ menu.title }}</span>
                <el-badge
                  v-if="menu.badge"
                  :value="menu.badge"
                  class="menu-badge"
                  type="danger"
                />
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container class="layout-main-wrapper">
      <!-- Header -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
            v-if="showSidebar"
            link
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>

          <!-- Nút truy cập nhanh khi không ở trang /menu -->
          <el-button
            v-if="!showSidebar"
            link
            class="app-center-brand"
            @click="router.push('/menu')"
          >
            <el-icon class="brand-icon"><Grid /></el-icon>
            <span class="brand-title">iTEST 2.0</span>
          </el-button>

          <el-breadcrumb separator="/" class="breadcrumb breadcrumb-cyber">
            <el-breadcrumb-item v-if="route.path !== '/menu'">{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Dynamic Header Extension Slot -->
          <template v-for="ext in headerRightExtensions" :key="ext.id">
            <component :is="ext.component" />
          </template>

          <el-dropdown trigger="click" @command="handleUserCommand" popper-class="user-dropdown-popper">
            <div class="user-profile">
              <el-avatar :size="28" class="user-avatar">
                {{ userInitial }}
              </el-avatar>
              <div class="user-info-text">
                <span class="user-name">{{ authStore.user?.fullName || authStore.user?.username || 'User' }}</span>
                <span class="user-role-badge">{{ primaryRole }}</span>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <div class="cyber-dropdown-wrapper">
                <el-dropdown-menu class="cyber-dropdown-menu">
                  <div class="dropdown-header">
                    <div class="dropdown-sys-tag">
                      <span class="pulse-indicator"></span>
                      <span class="sys-label">SYS.OPERATOR // ACTIVE</span>
                    </div>
                    <div class="dropdown-user-name">{{ authStore.user?.fullName || authStore.user?.username }}</div>
                    <div class="dropdown-user-sub">
                      <span class="sub-role">{{ primaryRole }}</span>
                      <span class="sub-sep">•</span>
                      <span class="sub-id">{{ authStore.user?.email || 'SYS_ID: 0x' + (authStore.user?.id || '409').slice(0, 8) }}</span>
                    </div>
                  </div>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    <span class="item-label">Hồ sơ cá nhân</span>
                    <span class="item-code">01</span>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="canAccessAdmin" command="roles">
                    <el-icon><Lock /></el-icon>
                    <span class="item-label">Phân quyền ({{ primaryRole }})</span>
                    <span class="item-code">02</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout" class="logout-item">
                    <el-icon><SwitchButton /></el-icon>
                    <span class="item-label">Đăng xuất</span>
                    <span class="item-code">EXIT</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </div>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Content Area protected by CModuleBoundary -->
      <el-main class="layout-content" :class="{ 'from-menu': route.query.from === 'menu' || isFromMenu }">
        <CModuleBoundary moduleName="AppContent">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </CModuleBoundary>
      </el-main>
    </el-container>

    <!-- User Profile & Password Modal -->
    <UserProfileModal v-model="profileModalVisible" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePluginStore } from '@/stores/plugin';
import UserProfileModal from '@/components/shared/UserProfileModal.vue';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import {
  Fold,
  Expand,
  ArrowDown,
  SwitchButton,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const pluginStore = usePluginStore();

const profileModalVisible = ref(false);
const isCollapse = ref(false);

const activeRoute = computed(() => route.path);
const isFromMenu = computed(() => route.query.from === 'menu');
// Ẩn sidebar khi:
// 1. Ở trang /menu (Launcher/Portal)
// 2. Truy cập vào các plugin từ /menu (có query param from=menu hoặc điều hướng từ menu)
// Khi truy cập plugin từ /dashboard hoặc thanh quản lý (không có from=menu), sidebar vẫn hiện bình thường.
const showSidebar = computed(() => {
  if (route.path === '/menu') {
    return false;
  }
  if (route.path.startsWith('/plugins/') && isFromMenu.value) {
    return false;
  }
  return true;
});
const currentRouteTitle = computed(() => (route.meta?.title as string) || 'Trang');

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

const primaryRole = computed(() => {
  const r = authStore.roles[0];
  if (!r) return 'USER';
  return r.toUpperCase();
});

const canAccessAdmin = computed(() => {
  const roles = authStore.roles.map((r: string) => r.toUpperCase());
  return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN') || roles.includes('ADMINISTRATOR');
});

const canAccessDashboard = computed(() => {
  const roles = authStore.roles.map((r: string) => r.toUpperCase());
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN') || roles.includes('ADMINISTRATOR') || roles.includes('OPERATOR')) {
    return true;
  }
  return authStore.hasPermission('dashboard:view');
});

const headerRightExtensions = computed(() => {
  return pluginStore.getExtensionPoints('header-right');
});

// Cyber Icon mapping helper
function resolveCyberIconName(iconName?: string): string {
  if (!iconName) return 'monitor';
  const lower = iconName.toLowerCase();
  if (lower.includes('cpu') || lower.includes('config')) return 'cpu';
  if (lower.includes('trace') || lower.includes('tool') || lower.includes('barcode')) return 'traceability';
  if (lower.includes('chirp') || lower.includes('lora') || lower.includes('radio') || lower.includes('antenna')) return 'chirpstack';
  if (lower.includes('data') || lower.includes('odometer') || lower.includes('board')) return 'dashboard';
  if (lower.includes('setup') || lower.includes('plugin')) return 'plugins';
  if (lower.includes('user')) return 'users';
  if (lower.includes('role') || lower.includes('lock')) return 'roles';
  return 'monitor';
}

async function handleUserCommand(cmd: string) {
  if (cmd === 'logout') {
    await authStore.logout();
    router.push('/auth/login');
  } else if (cmd === 'roles') {
    router.push('/roles');
  } else if (cmd === 'profile') {
    profileModalVisible.value = true;
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layout-aside {
  background-color: var(--owl-bg-aside, #051321);
  border-right: 1px solid var(--owl-border, #1d3b5a);
  color: var(--owl-text-primary, #d6deeb);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.logo-box {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: var(--owl-bg-aside, #051321);
  border-bottom: 1px solid var(--owl-border, #1d3b5a);
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 700;
  font-size: 17px;
  color: var(--owl-text-bright, #ffffff);
  letter-spacing: 0.5px;
}

.logo-icon {
  font-size: 22px;
  color: var(--owl-teal, #7fdbca);
}

.sidebar-menu {
  border-right: none;
  background-color: transparent !important;
}

.menu-divider {
  padding: 12px 16px 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--owl-text-muted, #5f7e97);
  letter-spacing: 0.5px;
}

.menu-badge {
  margin-left: 8px;
}

.layout-main-wrapper {
  background-color: var(--owl-bg-canvas, #011627);
  background-image:
    radial-gradient(circle at 50% 0%, rgba(127, 219, 202, 0.04) 0%, transparent 65%),
    linear-gradient(rgba(29, 59, 90, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 59, 90, 0.08) 1px, transparent 1px);
  background-size: 100% 100%, 32px 32px, 32px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 56px;
  background: rgba(8, 29, 50, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--owl-border, #1d3b5a);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  color: var(--owl-teal, #7fdbca);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  color: #ffffff;
}

.app-center-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 700;
  font-size: 15px;
  color: var(--owl-text-bright, #ffffff);
  padding: 4px 10px;
  letter-spacing: 0.5px;
  border-radius: var(--cyber-radius-sm, 6px);
  border: 1px solid rgba(127, 219, 202, 0.25);
  background: rgba(127, 219, 202, 0.08);
  transition: all 0.25s ease;
}

.app-center-brand:hover {
  border-color: var(--owl-teal, #7fdbca);
  background: rgba(127, 219, 202, 0.16);
  color: var(--owl-teal, #7fdbca);
}

.brand-icon {
  font-size: 16px;
  color: var(--owl-teal, #7fdbca);
}

.app-center-brand .logo-icon {
  font-size: 20px;
  color: var(--owl-teal, #7fdbca);
}

.brand-title {
  letter-spacing: -0.2px;
}

.back-menu-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  background: var(--owl-bg-surface, #081d32) !important;
  border: 1px solid var(--owl-border, #1d3b5a);
  border-radius: var(--cyber-radius, 8px);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover {
  border-color: var(--owl-teal, #7fdbca);
  background: var(--owl-bg-card-hover, #0f3152) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  background: linear-gradient(135deg, #7fdbca 0%, #57c7b1 100%);
  color: #011627;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(127, 219, 202, 0.25);
}

.user-info-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: left;
}

.user-name {
  font-family: var(--cyber-font-display, sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--owl-text-bright, #ffffff);
}

.user-role-badge {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 10px;
  font-weight: 600;
  color: var(--owl-teal, #7fdbca);
  letter-spacing: 0.5px;
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--owl-text-secondary, #7e97b8);
  transition: transform 0.2s;
}

.user-profile:hover .dropdown-arrow {
  color: var(--owl-teal, #7fdbca);
  transform: translateY(2px);
}

.layout-content {
  padding: 20px;
  overflow-y: auto;
}

/* Khi truy cập plugin từ /menu (có query from=menu hoặc isolate), ẩn thanh tab header của plugin để mỗi mục hoạt động chuyên biệt */
body:has([data-from-menu="true"]) .layout-content :deep(.el-tabs__header),
.layout-content.from-menu :deep(.el-tabs__header) {
  display: none !important;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
