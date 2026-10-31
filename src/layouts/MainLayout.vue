<template>
  <div class="layout-container flex h-screen w-screen overflow-hidden bg-[#0f172a] text-[#f8fafc]">
    <!-- Sidebar (Ẩn hoàn toàn khi ở trang Launcher /menu, hoặc khi truy cập plugin từ menu) -->
    <aside
      v-if="showSidebar"
      class="layout-aside flex flex-col flex-shrink-0 bg-[#0b1120] border-r border-white/10 transition-[width] duration-300 ease-in-out select-none z-20 overflow-hidden will-change-[width]"
      :class="isCollapse ? 'w-16' : 'w-64'"
    >
      <!-- Logo Box -->
      <div class="logo-box h-16 flex items-center justify-center gap-3 border-b border-white/10 bg-[#0b1120] flex-shrink-0 overflow-hidden px-4">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-sky-400 flex items-center justify-center shadow-none flex-shrink-0">
          <span class="text-white text-xs font-bold font-mono tracking-tighter">iT</span>
        </div>
        <div
          class="flex flex-col truncate transition-opacity duration-200"
          :class="isCollapse ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100'"
        >
          <span class="font-bold text-sm tracking-wide text-white font-sans">
            iTEST <span class="text-violet-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 ml-1">2.0</span>
          </span>
          <span class="text-[10px] text-slate-400 font-sans tracking-tight">Industrial Test Suite</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="sidebar-menu-wrapper flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        <ul class="menu menu-compact w-full p-0 gap-1.5 font-sans">
          <!-- Core Menu Group -->
          <li>
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide"
              :class="activeRoute === '/menu' ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="router.push('/menu')"
            >
              <CyberIcon name="grid" :size="18" :color="activeRoute === '/menu' ? '#7c3aed' : '#94a3b8'" />
              <span v-show="!isCollapse" class="truncate font-semibold">Launcher</span>
            </a>
          </li>

          <li v-if="canAccessDashboard">
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide"
              :class="activeRoute === '/dashboard' ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="router.push('/dashboard')"
            >
              <CyberIcon name="monitor" :size="18" :color="activeRoute === '/dashboard' ? '#7c3aed' : '#94a3b8'" />
              <span v-show="!isCollapse" class="truncate">Dashboard</span>
            </a>
          </li>

          <!-- System Administration Group (ADMIN / SUPER_ADMIN) -->
          <template v-if="canAccessAdmin">
            <li v-show="!isCollapse" class="menu-title px-3 pt-4 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <span>Hệ thống</span>
            </li>
            <li v-show="isCollapse" class="divider my-1 border-white/[0.06]"></li>

            <li>
              <a
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide"
                :class="activeRoute === '/users' ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                :title="isCollapse ? 'Người dùng' : undefined"
                @click="router.push('/users')"
              >
                <CyberIcon name="users" :size="18" :color="activeRoute === '/users' ? '#7c3aed' : '#94a3b8'" />
                <span v-show="!isCollapse" class="truncate">Người dùng</span>
              </a>
            </li>

            <li>
              <a
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide"
                :class="activeRoute === '/roles' ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                :title="isCollapse ? 'Vai trò & Quyền' : undefined"
                @click="router.push('/roles')"
              >
                <CyberIcon name="shield" :size="18" :color="activeRoute === '/roles' ? '#7c3aed' : '#94a3b8'" />
                <span v-show="!isCollapse" class="truncate">Vai trò & Quyền</span>
              </a>
            </li>

            <li>
              <a
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide"
                :class="activeRoute === '/plugins' ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                :title="isCollapse ? 'Quản lý Plugin' : undefined"
                @click="router.push('/plugins')"
              >
                <CyberIcon name="cpu" :size="18" :color="activeRoute === '/plugins' ? '#7c3aed' : '#94a3b8'" />
                <span v-show="!isCollapse" class="truncate">Quản lý Plugin</span>
              </a>
            </li>
          </template>

          <!-- Dynamic Plugin Menus -->
          <template v-if="pluginStore.menus.length > 0">
            <li v-show="!isCollapse" class="menu-title px-3 pt-4 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <span>Ứng dụng & Tiện ích</span>
            </li>
            <li v-show="isCollapse" class="divider my-1 border-white/[0.06]"></li>

            <template v-for="menu in pluginStore.menus" :key="menu.id">
              <!-- Item with sub-menus -->
              <li v-if="menu.children && menu.children.length > 0">
                <details v-if="!isCollapse" :open="activeRoute.startsWith(menu.path)">
                  <summary class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-medium">
                    <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" color="#94a3b8" class="flex-shrink-0" />
                    <span class="truncate">{{ menu.title }}</span>
                  </summary>
                  <ul class="pl-4 mt-1 border-l border-white/[0.08] ml-4 gap-1">
                    <li v-for="sub in menu.children" :key="sub.id">
                      <a
                        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150"
                        :class="activeRoute === sub.path ? 'active bg-violet-600/15 text-violet-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                        @click="router.push(sub.path)"
                      >
                        <CyberIcon v-if="sub.icon" :name="resolveCyberIconName(sub.icon)" :size="14" :color="activeRoute === sub.path ? '#7c3aed' : '#94a3b8'" class="flex-shrink-0" />
                        <span class="truncate">{{ sub.title }}</span>
                      </a>
                    </li>
                  </ul>
                </details>
                <!-- Khi thu gọn -->
                <a
                  v-else
                  class="flex items-center justify-center px-3 py-2.5 rounded-xl transition-colors duration-150"
                  :class="activeRoute.startsWith(menu.path) ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                  :title="menu.title"
                  @click="router.push(menu.children[0]?.path || menu.path)"
                >
                  <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" :color="activeRoute.startsWith(menu.path) ? '#7c3aed' : '#94a3b8'" class="flex-shrink-0" />
                </a>
              </li>

              <!-- Single item -->
              <li v-else>
                <a
                  class="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium"
                  :class="activeRoute === menu.path ? 'active bg-violet-600/15 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                  :title="isCollapse ? menu.title : undefined"
                  @click="router.push(menu.path)"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" :color="activeRoute === menu.path ? '#7c3aed' : '#94a3b8'" class="flex-shrink-0" />
                    <span v-show="!isCollapse" class="truncate">{{ menu.title }}</span>
                  </div>
                  <span
                    v-if="menu.badge && !isCollapse"
                    class="badge badge-xs font-mono bg-violet-500/20 text-violet-300 border-violet-500/30 flex-shrink-0 rounded-full"
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
      <header class="navbar relative shrink-0 h-16 min-h-[4rem] bg-[#151d2c]/90 backdrop-blur-xl border-b border-white/10 px-6 justify-between z-10">
        <!-- Left: Collapse toggle, Brand & Breadcrumb -->
        <div class="flex items-center gap-4 shrink-0">
          <button
            v-if="showSidebar"
            class="btn btn-ghost btn-sm btn-square rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            :title="isCollapse ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
            @click="toggleSidebar"
          >
            <CyberIcon :name="isCollapse ? 'maximize' : 'minimize'" :size="18" color="#94a3b8" />
          </button>

          <!-- Breadcrumb / Page Title -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-white tracking-wide font-sans">{{ currentRouteTitle }}</span>
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-none"></div>
          </div>
        </div>

        <!-- Center: Portal for View Top Bar actions (e.g. Launcher Search & Filters) -->
        <div id="layout-navbar-center" class="flex-1 flex items-center justify-center px-4 min-w-0 max-w-3xl mx-auto h-full"></div>

        <!-- Right: Actions & User Dropdown -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Return to Launcher button -->
          <button
            v-if="route.path !== '/menu'"
            class="btn btn-ghost btn-sm rounded-xl text-xs gap-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
            @click="router.push('/menu')"
          >
            <CyberIcon name="grid" :size="16" color="#7c3aed" />
            <span class="hidden md:inline font-medium">Launcher</span>
          </button>

          <!-- Header Right Extension Points (Dynamic from plugins) -->
          <div v-if="headerRightExtensions.length > 0" class="flex items-center gap-2">
            <component
              v-for="ext in headerRightExtensions"
              :is="ext.component"
              :key="ext.id"
            />
          </div>

          <div class="h-5 w-px bg-white/10 mx-1"></div>

          <!-- User Dropdown -->
          <div>
            <button ref="userDropdownTrigger" type="button" popovertarget="user-account-menu" @click="positionUserDropdown"
              class="btn btn-ghost btn-sm h-10 px-2.5 rounded-xl border border-white/10 bg-[#1a2436] hover:bg-[#202c42] hover:border-violet-500/30 flex items-center gap-2.5 cursor-pointer shadow-none transition-all"
            >
              <!-- Avatar: Modern sleek rounded-xl background -->
              <div class="avatar placeholder flex-shrink-0">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-sky-400 text-white font-bold flex items-center justify-center text-xs select-none shadow-none">
                  <span class="leading-none">{{ userInitial }}</span>
                </div>
              </div>
              <!-- User Info -->
              <div class="flex flex-col text-left leading-tight hidden sm:flex">
                <span class="text-xs font-semibold text-white font-sans">
                  {{ authStore.user?.fullName || authStore.user?.username || 'User' }}
                </span>
                <span class="text-[10px] font-mono text-violet-400 tracking-wider uppercase">
                  {{ primaryRole }}
                </span>
              </div>
              <!-- Caret Icon -->
              <span class="text-[10px] text-slate-400 ml-1">▼</span>
            </button>

            <!-- Native popover escapes dashboard stacking contexts. -->
            <ul
              id="user-account-menu" ref="userDropdown" popover="auto"
              class="user-account-menu menu p-2 shadow-none bg-[#151d2c] border border-white/10 rounded-2xl w-60 gap-1 text-xs font-sans"
            >
              <!-- Header info in dropdown -->
              <li class="menu-title px-3 py-2 border-b border-white/10 mb-1">
                <span class="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Tài khoản cá nhân</span>
                <span class="text-xs text-white font-medium mt-0.5 truncate">{{ authStore.user?.email || authStore.user?.username }}</span>
              </li>

              <li>
                <a class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-violet-500/15 hover:text-violet-300 text-slate-300 transition-colors" @click="handleUserCommand('profile')">
                  <CyberIcon name="users" :size="16" color="#7c3aed" />
                  <span class="flex-1 font-medium">Hồ sơ người dùng</span>
                </a>
              </li>

              <li v-if="canAccessAdmin">
                <a class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-violet-500/15 hover:text-violet-300 text-slate-300 transition-colors" @click="handleUserCommand('roles')">
                  <CyberIcon name="shield" :size="16" color="#7c3aed" />
                  <span class="flex-1 font-medium">Phân quyền hệ thống</span>
                </a>
              </li>

              <div class="divider my-1 border-white/10"></div>

              <li>
                <a class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors" @click="handleUserCommand('logout')">
                  <span class="font-bold text-sm">⏻</span>
                  <span class="flex-1 font-medium">Đăng xuất</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Content Area protected by CModuleBoundary -->
      <main class="layout-content relative z-0 flex-1 overflow-y-auto p-4 sm:p-6" :class="{ 'menu-layout-mode p-2 sm:p-4': route.path === '/menu', 'from-menu': route.query.from === 'menu' || isFromMenu }">
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

const isCollapse = ref(false);
const profileModalVisible = ref(false);
const userDropdown = ref<HTMLUListElement | null>(null);
const userDropdownTrigger = ref<HTMLButtonElement | null>(null);

function closeUserDropdown() {
  userDropdown.value?.hidePopover();
}

function positionUserDropdown() {
  const trigger = userDropdownTrigger.value?.getBoundingClientRect();
  if (!trigger || !userDropdown.value) return;
  userDropdown.value.style.top = `${trigger.bottom + 8}px`;
  userDropdown.value.style.right = `${window.innerWidth - trigger.right}px`;
}

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

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
  if (lower.includes('shield') || lower.includes('role')) return 'shield';
  if (lower.includes('users') || lower.includes('user')) return 'users';
  if (lower.includes('grid') || lower.includes('menu')) return 'grid';
  return 'monitor';
}

async function handleUserCommand(cmd: string) {
  closeUserDropdown();
  if (cmd === 'logout') {
    await authStore.logout();
    await router.replace('/auth/login');
  } else if (cmd === 'roles') {
    router.push('/roles');
  } else if (cmd === 'profile') {
    profileModalVisible.value = true;
  }
}
</script>

<style scoped>
/* Top layer prevents view banners from painting over the account menu. */
.user-account-menu {
  position: fixed;
  inset: auto;
  margin: 0;
  max-width: calc(100vw - 16px);
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
  background: #151d2c;
}

.user-account-menu:not(:popover-open) {
  display: none;
}

.layout-aside {
  contain: layout paint;
}

.sidebar-menu-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  contain: content;
}

.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.4);
}

.layout-main-wrapper {
  background-color: #0b0f19;
  background-image:
    radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.05) 0%, transparent 60%),
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
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
