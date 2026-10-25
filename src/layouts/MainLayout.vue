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
            <el-icon><Grid /></el-icon>
            <template #title>Trung tâm Ứng dụng</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessDashboard" index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>Bảng điều khiển</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/users">
            <el-icon><User /></el-icon>
            <template #title>Quản lý Người dùng</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/roles">
            <el-icon><Lock /></el-icon>
            <template #title>Quản lý Phân quyền</template>
          </el-menu-item>

          <el-menu-item v-if="canAccessAdmin" index="/plugins">
            <el-icon><SetUp /></el-icon>
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
                  <component :is="resolveIcon(menu.icon)" />
                </el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item
                v-for="sub in menu.children"
                :key="sub.id"
                :index="sub.path"
              >
                <el-icon v-if="sub.icon">
                  <component :is="resolveIcon(sub.icon)" />
                </el-icon>
                <template #title>{{ sub.title }}</template>
              </el-menu-item>
            </el-sub-menu>

            <!-- Single Item -->
            <el-menu-item v-else :index="menu.path">
              <el-icon>
                <component :is="resolveIcon(menu.icon)" />
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

          <el-breadcrumb separator="//" class="breadcrumb breadcrumb-cyber">
            <el-breadcrumb-item v-if="route.path !== '/menu'">{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Dynamic Header Extension Slot -->
          <template v-for="ext in headerRightExtensions" :key="ext.id">
            <component :is="ext.component" />
          </template>

          <el-dropdown trigger="click" @command="handleUserCommand" popper-class="user-dropdown-popper">
            <div class="user-profile" data-augmented-ui="tl-clip br-clip border">
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
              <div class="cyber-dropdown-wrapper" data-augmented-ui="tl-clip br-clip border">
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
import {
  Platform,
  Odometer,
  SetUp,
  User,
  Lock,
  Fold,
  Expand,
  ArrowDown,
  Monitor,
  Cpu,
  Tools,
  Grid,
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

// Icon mapping helper
function resolveIcon(iconName?: string) {
  if (!iconName) return Monitor;
  const map: Record<string, any> = {
    Cpu,
    Tools,
    SetUp,
    Monitor,
    Odometer,
  };
  return map[iconName] || Monitor;
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
  background-color: #0b101c;
  border-right: 1px solid rgba(0, 240, 255, 0.15);
  color: #fff;
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
  background-color: #080c14;
  border-bottom: 1px solid rgba(0, 240, 255, 0.18);
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 800;
  font-size: 18px;
  color: #f1f5f9;
  letter-spacing: 1px;
}

.logo-icon {
  font-size: 22px;
  color: var(--cyber-cyan, #00f0ff);
}

.sidebar-menu {
  border-right: none;
  background-color: transparent !important;
}

.menu-divider {
  padding: 12px 16px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #5a6678;
  letter-spacing: 0.5px;
}

.menu-badge {
  margin-left: 8px;
}

.layout-main-wrapper {
  background-color: #080c14;
  background-image:
    radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.05) 0%, transparent 70%),
    linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 32px 32px, 32px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 56px;
  background: rgba(11, 16, 28, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(0, 240, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  color: var(--cyber-cyan, #00f0ff);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  color: #ffffff;
  text-shadow: 0 0 8px var(--cyber-cyan);
}

.app-center-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 800;
  font-size: 17px;
  color: #f1f5f9;
  padding: 4px 10px;
  letter-spacing: 0.5px;
  border-radius: 4px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(0, 240, 255, 0.05);
  transition: all 0.25s ease;
}

.app-center-brand:hover {
  border-color: var(--cyber-cyan);
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}

.brand-icon {
  font-size: 16px;
  color: var(--cyber-cyan);
}

.app-center-brand:hover {
  color: var(--cyber-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.app-center-brand .logo-icon {
  font-size: 20px;
  color: var(--cyber-cyan, #00f0ff);
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
  --aug-border-all: 1px;
  --aug-border-bg: rgba(0, 240, 255, 0.25);
  --aug-tl: 8px;
  --aug-br: 8px;
  background: rgba(13, 20, 36, 0.65) !important;
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
  --aug-border-bg: #00f0ff;
  background: rgba(18, 27, 48, 0.85) !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}

.user-avatar {
  background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%);
  color: #0d131f;
  font-weight: 800;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
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
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.3px;
}

.user-role-badge {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 10px;
  font-weight: 700;
  color: var(--cyber-cyan, #00f0ff);
  letter-spacing: 0.5px;
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--cyber-cyan, #00f0ff);
  transition: transform 0.2s;
}

.user-profile:hover .dropdown-arrow {
  color: #ffffff;
  transform: translateY(2px);
}

:deep(.user-dropdown-popper) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.user-dropdown-popper .el-popper__arrow) {
  display: none !important;
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
