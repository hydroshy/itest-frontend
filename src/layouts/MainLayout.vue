<template>
  <div class="layout-container flex h-screen w-screen overflow-hidden bg-[#011627] text-[#d6deeb]">
    <!-- Sidebar (Ẩn hoàn toàn khi ở trang Launcher /menu, hoặc khi truy cập plugin từ menu) -->
    <aside
      v-if="showSidebar"
      class="layout-aside flex flex-col flex-shrink-0 bg-[#051321] border-r border-[#1d3b5a] transition-all duration-300 select-none z-20"
      :class="isCollapse ? 'w-16' : 'w-60'"
    >
      <!-- Logo Box -->
      <div class="logo-box h-14 flex items-center justify-center gap-2 border-b border-[#1d3b5a] bg-[#051321]">
        <div class="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse"></div>
        <span v-show="!isCollapse" class="font-black text-sm tracking-widest text-[#00f0ff] font-mono">
          iTEST 2.0
        </span>
      </div>

      <!-- Navigation Menu -->
      <div class="sidebar-menu-wrapper flex-1 overflow-y-auto overflow-x-hidden p-2">
        <ul class="menu menu-compact w-full p-0 gap-1">
          <!-- Core Menu Group -->
          <li>
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
              :class="activeRoute === '/menu' ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
              @click="router.push('/menu')"
            >
              <CyberIcon name="grid" :size="18" :color="activeRoute === '/menu' ? '#00f0ff' : '#94a3b8'" />
              <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">Trung tâm Ứng dụng</span>
            </a>
          </li>

          <li v-if="canAccessDashboard">
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
              :class="activeRoute === '/dashboard' ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
              @click="router.push('/dashboard')"
            >
              <CyberIcon name="dashboard" :size="18" :color="activeRoute === '/dashboard' ? '#00f0ff' : '#94a3b8'" />
              <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">Bảng điều khiển</span>
            </a>
          </li>

          <li v-if="canAccessAdmin">
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
              :class="activeRoute === '/users' ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
              @click="router.push('/users')"
            >
              <CyberIcon name="users" :size="18" :color="activeRoute === '/users' ? '#00f0ff' : '#94a3b8'" />
              <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">Quản lý Người dùng</span>
            </a>
          </li>

          <li v-if="canAccessAdmin">
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
              :class="activeRoute === '/roles' ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
              @click="router.push('/roles')"
            >
              <CyberIcon name="roles" :size="18" :color="activeRoute === '/roles' ? '#00f0ff' : '#94a3b8'" />
              <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">Quản lý Phân quyền</span>
            </a>
          </li>

          <li v-if="canAccessAdmin">
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
              :class="activeRoute === '/plugins' ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
              @click="router.push('/plugins')"
            >
              <CyberIcon name="plugins" :size="18" :color="activeRoute === '/plugins' ? '#00f0ff' : '#94a3b8'" />
              <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">Quản lý Plugin</span>
            </a>
          </li>

          <!-- Dynamic Plugin Menus -->
          <template v-if="pluginStore.menus.length > 0">
            <li v-show="!isCollapse" class="menu-title px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#5f7e97]">
              Ứng dụng mở rộng
            </li>

            <template v-for="menu in pluginStore.menus" :key="menu.id">
              <!-- Sub-menu if has children -->
              <li v-if="menu.children && menu.children.length > 0">
                <details :open="activeRoute.startsWith(menu.path)">
                  <summary class="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]">
                    <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" color="#94a3b8" />
                    <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">{{ menu.title }}</span>
                  </summary>
                  <ul class="pl-4 mt-1 border-l border-[#1d3b5a] ml-4 gap-1">
                    <li v-for="sub in menu.children" :key="sub.id">
                      <a
                        class="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all"
                        :class="activeRoute === sub.path ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
                        @click="router.push(sub.path)"
                      >
                        <CyberIcon v-if="sub.icon" :name="resolveCyberIconName(sub.icon)" :size="14" :color="activeRoute === sub.path ? '#00f0ff' : '#94a3b8'" />
                        <span>{{ sub.title }}</span>
                      </a>
                    </li>
                  </ul>
                </details>
              </li>

              <!-- Single item -->
              <li v-else>
                <a
                  class="flex items-center justify-between px-3 py-2.5 rounded-md transition-all"
                  :class="activeRoute === menu.path ? 'active bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-[#94a3b8] hover:text-[#d6deeb] hover:bg-[#0b2942]'"
                  @click="router.push(menu.path)"
                >
                  <div class="flex items-center gap-3">
                    <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" :color="activeRoute === menu.path ? '#00f0ff' : '#94a3b8'" />
                    <span v-show="!isCollapse" class="font-medium text-xs tracking-wide">{{ menu.title }}</span>
                  </div>
                  <span
                    v-if="menu.badge && !isCollapse"
                    class="badge badge-xs font-mono bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40"
                  >
                    {{ menu.badge }}
                  </span>
                </a>
              </li>
            </template>
          </template>
        </ul>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="layout-main-wrapper flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      <!-- Navbar / Header -->
      <header class="navbar h-14 min-h-[3.5rem] bg-[#081d32]/90 backdrop-blur-md border-b border-[#1d3b5a] px-4 justify-between z-10">
        <!-- Left: Collapse toggle, Brand & Breadcrumb -->
        <div class="flex items-center gap-3">
          <button
            v-if="showSidebar"
            class="btn btn-sm btn-ghost btn-square text-[#7fdbca] hover:bg-[#0b2942]"
            @click="isCollapse = !isCollapse"
            title="Đóng / Mở menu"
          >
            <CyberIcon :name="isCollapse ? 'grid' : 'monitor'" :size="18" color="#7fdbca" />
          </button>

          <!-- Nút trở về /menu khi không có sidebar -->
          <button
            v-if="!showSidebar"
            class="btn btn-sm btn-outline border-[#7fdbca]/30 text-[#7fdbca] hover:bg-[#7fdbca]/10 gap-2 font-mono text-xs"
            @click="router.push('/menu')"
          >
            <CyberIcon name="grid" :size="14" color="#7fdbca" />
            <span class="font-bold">iTEST 2.0</span>
          </button>

          <!-- Breadcrumb -->
          <div class="text-xs breadcrumbs py-0 text-[#94a3b8] font-mono">
            <ul>
              <li>
                <a @click="router.push('/menu')" class="hover:text-[#00f0ff] flex items-center gap-1 cursor-pointer">
                  <span>Hệ thống</span>
                </a>
              </li>
              <li v-if="route.path !== '/menu'" class="text-[#00f0ff] font-semibold">
                {{ currentRouteTitle }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Header Extensions & User Profile Dropdown -->
        <div class="flex items-center gap-3">
          <!-- Dynamic Header Extension Slot -->
          <template v-for="ext in headerRightExtensions" :key="ext.id">
            <component :is="ext.component" />
          </template>

          <!-- User Dropdown (daisyUI dropdown-end) -->
          <div class="dropdown dropdown-end">
            <label
              tabindex="0"
              class="btn btn-ghost btn-sm h-10 px-2 rounded-lg border border-[#1d3b5a] bg-[#081d32] hover:bg-[#0b2942] hover:border-[#7fdbca] flex items-center gap-2.5 cursor-pointer shadow-md transition-all"
            >
              <!-- Avatar -->
              <div class="avatar placeholder">
                <div class="bg-gradient-to-br from-[#7fdbca] to-[#00f0ff] text-[#011627] font-black rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-[0_0_8px_rgba(127,219,202,0.4)]">
                  <span>{{ userInitial }}</span>
                </div>
              </div>
              <!-- User Info -->
              <div class="flex flex-col text-left leading-tight hidden sm:flex">
                <span class="text-xs font-semibold text-[#ffffff] font-sans">
                  {{ authStore.user?.fullName || authStore.user?.username || 'User' }}
                </span>
                <span class="text-[10px] font-mono text-[#7fdbca] tracking-wider uppercase">
                  {{ primaryRole }}
                </span>
              </div>
              <!-- Caret Icon -->
              <span class="text-[10px] text-[#7fdbca] ml-1">▼</span>
            </label>

            <!-- Dropdown Menu -->
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow-2xl bg-[#081d32] border border-[#1d3b5a] rounded-box w-56 mt-2 gap-1 backdrop-blur-xl z-50 text-xs font-sans"
            >
              <!-- Header info in dropdown -->
              <li class="menu-title px-3 py-1.5 border-b border-[#1d3b5a]/60 pb-2 mb-1">
                <span class="text-[10px] font-mono text-[#00f0ff] uppercase tracking-wider">Tài khoản cá nhân</span>
                <span class="text-xs text-[#d6deeb] font-semibold mt-0.5 truncate">{{ authStore.user?.email || authStore.user?.username }}</span>
              </li>

              <li>
                <a class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#0b2942] hover:text-[#00f0ff]" @click="handleUserCommand('profile')">
                  <CyberIcon name="users" :size="16" color="#00f0ff" />
                  <span class="flex-1 font-medium">Hồ sơ người dùng</span>
                  <span class="badge badge-xs badge-outline font-mono text-[#7fdbca] border-[#7fdbca]/40">INFO</span>
                </a>
              </li>

              <li v-if="canAccessAdmin">
                <a class="flex items-center gap-2.5 py-2 px-3 rounded hover:bg-[#0b2942] hover:text-[#00f0ff]" @click="handleUserCommand('roles')">
                  <CyberIcon name="roles" :size="16" color="#7fdbca" />
                  <span class="flex-1 font-medium">Quản trị phân quyền</span>
                  <span class="badge badge-xs badge-outline font-mono text-[#00f0ff] border-[#00f0ff]/40">SEC</span>
                </a>
              </li>

              <div class="divider my-1 border-[#1d3b5a]/40"></div>

              <li>
                <a class="flex items-center gap-2.5 py-2 px-3 rounded text-[#ef5350] hover:bg-[#ef5350]/10 hover:text-[#ff869a]" @click="handleUserCommand('logout')">
                  <span class="font-bold">⏻</span>
                  <span class="flex-1 font-medium">Đăng xuất</span>
                  <span class="badge badge-xs badge-outline font-mono text-[#ef5350] border-[#ef5350]/40">EXIT</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Content Area protected by CModuleBoundary -->
      <main class="layout-content flex-1 overflow-y-auto p-4 sm:p-6" :class="{ 'from-menu': route.query.from === 'menu' || isFromMenu }">
        <CModuleBoundary moduleName="AppContent">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </CModuleBoundary>
      </main>
    </div>

    <!-- User Profile & Password Modal -->
    <UserProfileModal v-model="profileModalVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePluginStore } from '@/stores/plugin';
import UserProfileModal from '@/components/shared/UserProfileModal.vue';
import CyberIcon from '@/components/shared/CyberIcon.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const pluginStore = usePluginStore();

const profileModalVisible = ref(false);
const isCollapse = ref(false);

const activeRoute = computed(() => route.path);
const isFromMenu = computed(() => route.query.from === 'menu');

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
.layout-main-wrapper {
  background-color: var(--owl-bg-canvas, #011627);
  background-image:
    radial-gradient(circle at 50% 0%, rgba(127, 219, 202, 0.04) 0%, transparent 65%),
    linear-gradient(rgba(29, 59, 90, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 59, 90, 0.08) 1px, transparent 1px);
  background-size: 100% 100%, 32px 32px, 32px 32px;
}

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
