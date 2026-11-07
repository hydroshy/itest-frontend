<template>
  <aside
    class="layout-aside flex flex-col flex-shrink-0 border-r transition-[width] duration-300 ease-in-out select-none z-20 overflow-hidden will-change-[width]"
    :class="[
      isCollapse ? 'w-16' : 'w-64',
      'bg-[var(--owl-bg-aside)] border-[var(--owl-border)]'
    ]"
  >
    <!-- Logo Box -->
    <div class="logo-box h-16 flex items-center justify-center gap-3 border-b border-[var(--owl-border)] bg-[var(--owl-bg-aside)] flex-shrink-0 overflow-hidden px-4">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
        <span class="text-white text-xs font-black font-mono tracking-tighter">iT</span>
      </div>
      <div
        class="flex flex-col truncate transition-opacity duration-200"
        :class="isCollapse ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100'"
      >
        <div class="flex items-center gap-1.5">
          <span class="font-extrabold text-sm tracking-wide text-[var(--owl-text-primary)] font-display">iTEST</span>
          <span class="text-blue-500 dark:text-blue-400 font-mono text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 border border-blue-500/30">2.0</span>
        </div>
        <span class="text-[10px] text-[var(--owl-text-muted)] font-medium tracking-tight">Industrial Test Suite</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-menu-wrapper flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
      <ul class="menu menu-compact w-full p-0 gap-1.5 font-sans">
        <!-- Core Menu Group -->
        <li>
          <a
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide"
            :class="activeRoute === '/menu'
              ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
            @click="router.push('/menu')"
          >
            <CyberIcon name="grid" :size="18" :color="activeRoute === '/menu' ? '#2563eb' : 'currentColor'" />
            <span v-show="!isCollapse" class="truncate">Launcher</span>
          </a>
        </li>

        <li v-if="canAccessDashboard">
          <a
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide"
            :class="activeRoute === '/dashboard'
              ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
            @click="router.push('/dashboard')"
          >
            <CyberIcon name="monitor" :size="18" :color="activeRoute === '/dashboard' ? '#2563eb' : 'currentColor'" />
            <span v-show="!isCollapse" class="truncate">Dashboard</span>
          </a>
        </li>

        <!-- System Administration Group (ADMIN / SUPER_ADMIN) -->
        <template v-if="canAccessAdmin">
          <li v-show="!isCollapse" class="menu-title px-3 pt-4 pb-1 text-[11px] font-bold text-[var(--owl-text-muted)] uppercase tracking-wider">
            Quản trị hệ thống
          </li>
          <div v-show="isCollapse" class="divider my-1 border-[var(--owl-border-light)]"></div>

          <li>
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide"
              :class="activeRoute === '/users'
                ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
              :title="isCollapse ? 'Tài khoản người dùng' : undefined"
              @click="router.push('/users')"
            >
              <CyberIcon name="users" :size="18" :color="activeRoute === '/users' ? '#2563eb' : 'currentColor'" />
              <span v-show="!isCollapse" class="truncate">Người dùng</span>
            </a>
          </li>

          <li>
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide"
              :class="activeRoute === '/roles'
                ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
              :title="isCollapse ? 'Phân quyền vai trò' : undefined"
              @click="router.push('/roles')"
            >
              <CyberIcon name="shield" :size="18" :color="activeRoute === '/roles' ? '#2563eb' : 'currentColor'" />
              <span v-show="!isCollapse" class="truncate">Phân quyền</span>
            </a>
          </li>

          <li>
            <a
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide"
              :class="activeRoute === '/plugins'
                ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
              :title="isCollapse ? 'Trung tâm Plugin' : undefined"
              @click="router.push('/plugins')"
            >
              <CyberIcon name="cpu" :size="18" :color="activeRoute === '/plugins' ? '#2563eb' : 'currentColor'" />
              <span v-show="!isCollapse" class="truncate">Quản lý Plugin</span>
            </a>
          </li>
        </template>

        <!-- Dynamic Plugin Navigation Items -->
        <template v-if="filteredPluginMenus.length > 0">
          <li v-show="!isCollapse" class="menu-title px-3 pt-4 pb-1 text-[11px] font-bold text-[var(--owl-text-muted)] uppercase tracking-wider">
            Chức năng nghiệp vụ
          </li>
          <div v-show="isCollapse" class="divider my-1 border-[var(--owl-border-light)]"></div>

          <template v-for="menu in filteredPluginMenus" :key="menu.id">
            <!-- Nested submenus -->
            <li v-if="menu.children && menu.children.length > 0">
              <details v-if="!isCollapse" :open="activeRoute.startsWith(menu.path)">
                <summary class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5">
                  <div class="flex items-center gap-3 min-w-0">
                    <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" class="flex-shrink-0" />
                    <span class="truncate">{{ menu.title }}</span>
                  </div>
                </summary>
                <ul class="pl-4 mt-1 space-y-1">
                  <li v-for="sub in menu.children" :key="sub.id">
                    <a
                      class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs"
                      :class="activeRoute === sub.path
                        ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
                      @click="router.push(sub.path)"
                    >
                      <CyberIcon v-if="sub.icon" :name="resolveCyberIconName(sub.icon)" :size="14" :color="activeRoute === sub.path ? '#2563eb' : 'currentColor'" class="flex-shrink-0" />
                      <span class="truncate">{{ sub.title }}</span>
                    </a>
                  </li>
                </ul>
              </details>
              <!-- Collapsed submenus -->
              <a
                v-else
                class="flex items-center justify-center px-3 py-2.5 rounded-xl transition-colors duration-150"
                :class="activeRoute.startsWith(menu.path)
                  ? 'active bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
                :title="menu.title"
                @click="router.push(menu.children[0]?.path || menu.path)"
              >
                <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" :color="activeRoute.startsWith(menu.path) ? '#2563eb' : 'currentColor'" class="flex-shrink-0" />
              </a>
            </li>

            <!-- Single plugin item -->
            <li v-else>
              <a
                class="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-xs"
                :class="activeRoute === menu.path
                  ? 'active font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'font-semibold text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'"
                :title="isCollapse ? menu.title : undefined"
                @click="router.push(menu.path)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <CyberIcon :name="resolveCyberIconName(menu.icon)" :size="18" :color="activeRoute === menu.path ? '#2563eb' : 'currentColor'" class="flex-shrink-0" />
                  <span v-show="!isCollapse" class="truncate">{{ menu.title }}</span>
                </div>
                <span
                  v-if="menu.badge && !isCollapse"
                  class="badge badge-sm badge-outline text-[10px] font-mono border-blue-500/40 text-blue-600 dark:text-blue-400"
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CyberIcon from '@/components/shared/CyberIcon.vue';

defineProps<{
  isCollapse: boolean;
  activeRoute: string;
  canAccessDashboard: boolean;
  canAccessAdmin: boolean;
  filteredPluginMenus: any[];
}>();

const router = useRouter();

function resolveCyberIconName(iconName?: string): string {
  if (!iconName) return 'monitor';
  return iconName;
}
</script>

<style scoped>
.layout-aside {
  contain: layout paint;
}

.sidebar-menu-wrapper {
  scrollbar-width: thin;
  scrollbar-color: var(--owl-border) transparent;
  contain: content;
}

.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background: var(--owl-border);
  border-radius: 9999px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--owl-teal);
}
</style>
