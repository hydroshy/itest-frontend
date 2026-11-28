<template>
  <header class="navbar relative shrink-0 h-16 min-h-[4rem] bg-[var(--owl-bg-surface)] backdrop-blur-xl border-b border-[var(--owl-border)] px-4 sm:px-6 justify-between z-40 transition-colors duration-250">
    <!-- Left: Brand / Logo when standalone, or Page Title (bỏ tiêu đề Bảng điều khiển khi ở dashboard) -->
    <div class="flex items-center gap-3 sm:gap-4 shrink-0">
      <!-- Khi KHÔNG có Sidebar (ví dụ ở trang /menu launcher hoặc standalone view): Hiển thị Logo iTest 2.0 hoặc nút Back -->
      <button
        v-if="!showSidebar"
        type="button"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--owl-border)] bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] hover:border-blue-500/40 transition-all cursor-pointer shadow-none group"
        :title="buttonTitle"
        @click="handleBrandClick"
      >
        <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
          <span class="text-white text-[10px] font-black font-mono tracking-tighter">iT</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-extrabold text-xs tracking-wide text-[var(--owl-text-primary)] font-display group-hover:text-blue-500 transition-colors">iTEST</span>
          <span class="text-blue-500 dark:text-blue-400 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 border border-blue-500/30">2.0</span>
        </div>
        <font-awesome-icon
          v-if="route.path !== '/menu'"
          :icon="['fas', 'arrow-left']"
          class="text-xs text-[var(--owl-text-muted)] group-hover:text-blue-500 ml-1 transition-colors"
        />
      </button>

      <!-- Breadcrumb / Page Title: Bỏ tiêu đề khi ở trang /dashboard và /menu -->
      <div v-if="currentRouteTitle && route.path !== '/menu' && route.path !== '/dashboard'" class="flex items-center gap-2">
        <span class="text-sm sm:text-base font-bold text-[var(--owl-text-primary)] tracking-wide font-display">{{ currentRouteTitle }}</span>
        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>
    </div>

    <!-- Center: Portal for View Top Bar actions (e.g. Launcher Search & Filters) -->
    <div id="layout-navbar-center" class="flex-1 flex items-center justify-center px-4 min-w-0 max-w-3xl mx-auto h-full"></div>

    <!-- Right: Actions & User Dropdown -->
    <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
      <!-- User Account Dropdown -->
      <div ref="anchorRef" class="relative inline-block w-64">
        <button
          type="button"
          class="flex items-center gap-2.5 h-9 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--owl-border)] transition-all cursor-pointer bg-[var(--owl-bg-card)] w-full justify-between"
          @click="toggleUserDropdown"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-none">
              {{ userInitial }}
            </div>
            <div class="flex flex-col text-left min-w-0">
              <span class="text-xs font-semibold text-[var(--owl-text-primary)] leading-tight truncate max-w-[150px]">
                {{ authStore.user?.fullName || authStore.user?.username || 'Operator' }}
              </span>
              <span class="text-[10px] text-[var(--owl-text-muted)] font-medium leading-tight capitalize truncate">
                {{ authStore.user?.roles?.[0] || 'Member' }}
              </span>
            </div>
          </div>
          <span class="text-[9px] text-[var(--owl-text-muted)] ml-1 shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }">▼</span>
        </button>

        <!-- Standard Dropdown absolute-positioned aligned to right edge with identical width -->
        <transition name="dropdown-fade">
          <ul
            v-if="isDropdownOpen"
            class="user-account-menu menu p-2 shadow-2xl bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-2xl w-full gap-1 text-xs font-sans absolute right-0 top-full mt-2 z-50"
          >
            <!-- Header info in dropdown -->
            <li class="menu-title px-3 py-2 border-b border-[var(--owl-border-light)] mb-1">
              <span class="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tài khoản cá nhân</span>
              <span class="text-xs text-[var(--owl-text-primary)] font-semibold mt-0.5 truncate">{{ authStore.user?.email || authStore.user?.username }}</span>
            </li>

            <!-- Dashboard for Admin -->
            <li v-if="canAccessAdmin">
              <a
                class="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 text-[var(--owl-text-primary)] font-semibold transition-colors cursor-pointer"
                @click="handleCommand('dashboard')"
              >
                <CyberIcon name="dashboard" :size="16" color="#2563eb" />
                <span class="flex-1">Bảng điều khiển</span>
              </a>
            </li>

            <li>
              <a
                class="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 text-[var(--owl-text-primary)] font-semibold transition-colors cursor-pointer"
                @click="handleCommand('profile')"
              >
                <CyberIcon name="users" :size="16" color="#2563eb" />
                <span class="flex-1">Hồ sơ người dùng</span>
              </a>
            </li>

            <!-- Dark / Light Theme Toggle -->
            <li>
              <a
                class="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 text-[var(--owl-text-primary)] font-semibold transition-colors cursor-pointer"
                @click="toggleTheme"
              >
                <font-awesome-icon
                  :icon="['fas', isDark ? 'sun' : 'moon']"
                  class="text-sm w-4 text-center transition-transform"
                  :class="isDark ? 'text-amber-400' : 'text-blue-600 dark:text-blue-400'"
                />
                <span class="flex-1">Giao diện: {{ isDark ? 'Tối' : 'Sáng' }}</span>
                <span
                  class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
                  :class="isDark ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-blue-500/30 text-blue-600 bg-blue-500/10'"
                >
                  {{ isDark ? 'DARK' : 'LIGHT' }}
                </span>
              </a>
            </li>

            <div class="divider my-1 border-[var(--owl-border-light)]"></div>

            <li>
              <a
                class="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-red-500/15 hover:text-red-500 text-red-500 font-semibold transition-colors cursor-pointer"
                @click="handleCommand('logout')"
              >
                <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" class="text-sm w-4 text-center" />
                <span class="flex-1">Đăng xuất</span>
              </a>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';
import CyberIcon from '@/components/shared/CyberIcon.vue';

const props = defineProps<{
  showSidebar: boolean;
  isCollapse: boolean;
  currentRouteTitle: string;
  canAccessAdmin: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'command', cmd: string): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();
const anchorRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);

function handleClickOutside(event: MouseEvent) {
  if (anchorRef.value && !anchorRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const buttonTitle = computed(() => {
  if (route.path === '/dashboard' || props.showSidebar) {
    return props.isCollapse ? 'Mở rộng sidebar' : 'Thu gọn sidebar';
  }
  return 'Quay về Menu Ứng dụng';
});

function handleBrandClick() {
  if (route.path === '/dashboard' || props.showSidebar) {
    emit('toggleSidebar');
  } else {
    router.push('/menu');
  }
}

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

function toggleUserDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function handleCommand(cmd: string) {
  isDropdownOpen.value = false;
  emit('command', cmd);
}
</script>

<style scoped>
.user-account-menu {
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--owl-border);
  z-index: 100;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
