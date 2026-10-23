<template>
  <el-container class="layout-container">
  <!-- Sidebar (Ẩn hoàn toàn khi ở trang Launcher /menu, chỉ hiển thị khi chuyển sang dashboard/trang quản trị/plugin) -->
  <el-aside
    v-if="showSidebar"
    :width="isCollapse ? '64px' : '240px'"
    class="layout-aside"
  >
      <div class="logo-box">
        <el-icon class="logo-icon"><Platform /></el-icon>
        <span v-show="!isCollapse" class="logo-text">ITEST Shell</span>
      </div>

      <el-scrollbar>
        <el-menu
          :default-active="activeRoute"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          background-color="#1e222d"
          text-color="#a6b2c2"
          active-text-color="#409eff"
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

          <!-- Nút truy cập nhanh về Trung tâm ứng dụng khi không ở trang /menu -->
          <el-button
            v-if="!showSidebar"
            link
            class="app-center-brand"
            @click="router.push('/menu')"
          >
            <el-icon class="logo-icon"><Platform /></el-icon>
            <span class="brand-title">ITEST Platform</span>
          </el-button>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/menu' }">Trung tâm Ứng dụng</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path !== '/menu'">{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Phím tắt quay lại Trung tâm Ứng dụng khi đang ở các trang con -->
          <el-button
            v-if="showSidebar"
            size="small"
            plain
            type="primary"
            class="back-menu-btn"
            @click="router.push('/menu')"
          >
            <el-icon><Grid /></el-icon>
            <span>Trung tâm Ứng dụng</span>
          </el-button>

          <!-- Dynamic Header Extension Slot -->
          <template v-for="ext in headerRightExtensions" :key="ext.id">
            <component :is="ext.component" />
          </template>

          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-profile">
              <el-avatar :size="32" class="user-avatar">
                {{ userInitial }}
              </el-avatar>
              <span class="user-name">{{ authStore.user?.fullName || authStore.user?.username || 'Quản trị viên' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  Vai trò: {{ authStore.roles.join(', ') || 'user' }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  Đăng xuất
                </el-dropdown-item>
              </el-dropdown-menu>
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
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePluginStore } from '@/stores/plugin';
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
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const pluginStore = usePluginStore();

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
  background-color: #1e222d;
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
  background-color: #161922;
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
}

.logo-icon {
  font-size: 22px;
  color: #409eff;
}

.sidebar-menu {
  border-right: none;
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
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 56px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  color: #4b5563;
}

.app-center-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #1f2d3d;
  padding: 0;
}

.app-center-brand .logo-icon {
  font-size: 20px;
  color: #409eff;
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
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-profile:hover {
  background-color: #f3f4f6;
}

.user-avatar {
  background-color: #409eff;
  color: #ffffff;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
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
