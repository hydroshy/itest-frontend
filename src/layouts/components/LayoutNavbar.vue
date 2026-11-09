<template>
  <header class="navbar relative shrink-0 h-16 min-h-[4rem] bg-[var(--owl-bg-surface)] backdrop-blur-xl border-b border-[var(--owl-border)] px-4 sm:px-6 justify-between z-10 transition-colors duration-250">
    <!-- Left: Collapse toggle, Brand & Breadcrumb -->
    <div class="flex items-center gap-3 sm:gap-4 shrink-0">
      <button
        v-if="showSidebar"
        class="btn btn-ghost btn-sm btn-square rounded-xl text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--owl-border)]"
        :title="isCollapse ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
        @click="$emit('toggleSidebar')"
      >
        <font-awesome-icon :icon="['fas', isCollapse ? 'bars' : 'bars-staggered']" class="text-sm" />
      </button>

      <!-- Brand / Logo iTest 2.0 with Click to /menu -->
      <button
        type="button"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--owl-border)] bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] hover:border-blue-500/40 transition-all cursor-pointer shadow-none group"
        title="Quay về Menu Ứng dụng"
        @click="goToMenu"
      >
        <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-xs flex-shrink-0">
          <span class="text-white text-[10px] font-black font-mono tracking-tighter">iT</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-extrabold text-xs tracking-wide text-[var(--owl-text-primary)] font-display group-hover:text-blue-500 transition-colors">iTEST</span>
          <span class="text-blue-500 dark:text-blue-400 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 border border-blue-500/30">2.0</span>
        </div>
      </button>

      <!-- Breadcrumb / Page Title -->
      <div class="flex items-center gap-2">
        <span class="text-sm sm:text-base font-bold text-[var(--owl-text-primary)] tracking-wide font-display">{{ currentRouteTitle }}</span>
        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>
    </div>

    <!-- Center: Portal for View Top Bar actions (e.g. Launcher Search & Filters) -->
    <div id="layout-navbar-center" class="flex-1 flex items-center justify-center px-4 min-w-0 max-w-3xl mx-auto h-full"></div>

    <!-- Right: Actions & User Dropdown -->
    <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
      <!-- User Account Dropdown -->
      <div class="relative inline-block">
        <button
          ref="anchorRef"
          type="button"
          class="flex items-center gap-2.5 py-1.5 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--owl-border)] transition-all cursor-pointer bg-[var(--owl-bg-card)]"
          @click="toggleUserDropdown"
        >
          <div class="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold font-mono text-xs shadow-none">
            {{ userInitial }}
          </div>
          <div class="hidden sm:flex flex-col text-left">
            <span class="text-xs font-bold text-[var(--owl-text-primary)] leading-tight truncate max-w-[120px]">
              {{ authStore.user?.fullName || authStore.user?.username || 'Operator' }}
            </span>
            <span class="text-[10px] text-[var(--owl-text-muted)] font-semibold leading-tight capitalize">
              {{ authStore.user?.roles?.[0] || 'Member' }}
            </span>
          </div>
          <span class="text-[10px] text-[var(--owl-text-muted)] ml-0.5">▼</span>
        </button>

        <!-- Native popover escapes dashboard stacking contexts -->
        <ul
          id="user-account-menu"
          ref="userDropdown"
          popover="auto"
          class="user-account-menu menu p-2 shadow-xl bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-2xl w-60 gap-1 text-xs font-sans"
        >
          <!-- Header info in dropdown -->
          <li class="menu-title px-3 py-2 border-b border-[var(--owl-border-light)] mb-1">
            <span class="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tài khoản cá nhân</span>
            <span class="text-xs text-[var(--owl-text-primary)] font-semibold mt-0.5 truncate">{{ authStore.user?.email || authStore.user?.username }}</span>
          </li>

          <!-- Dashboard for Admin (Replaced Phân quyền) -->
          <li v-if="canAccessAdmin">
            <a
              class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 text-[var(--owl-text-primary)] font-semibold transition-colors"
              @click="handleCommand('dashboard')"
            >
              <CyberIcon name="dashboard" :size="16" color="#2563eb" />
              <span class="flex-1">Bảng điều khiển</span>
            </a>
          </li>

          <li>
            <a
              class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 text-[var(--owl-text-primary)] font-semibold transition-colors"
              @click="handleCommand('profile')"
            >
              <CyberIcon name="users" :size="16" color="#2563eb" />
              <span class="flex-1">Hồ sơ người dùng</span>
            </a>
          </li>

          <!-- Dark / Light Theme Toggle brought inside user menu -->
          <li class="px-3 py-1.5 flex items-center justify-between rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span class="flex items-center gap-2.5 font-semibold text-[var(--owl-text-primary)]">
              <CyberIcon name="desktop" :size="16" color="#2563eb" />
              <span>Giao diện</span>
            </span>
            <ThemeToggle />
          </li>

          <div class="divider my-1 border-[var(--owl-border-light)]"></div>

          <li>
            <a
              class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors"
              @click="handleCommand('logout')"
            >
              <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="text-sm" />
              <span class="flex-1">Đăng xuất</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import ThemeToggle from './ThemeToggle.vue';

defineProps<{
  showSidebar: boolean;
  isCollapse: boolean;
  currentRouteTitle: string;
  canAccessAdmin: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'command', cmd: string): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const anchorRef = ref<HTMLButtonElement | null>(null);
const userDropdown = ref<HTMLElement | null>(null);

function goToMenu() {
  router.push('/menu');
}

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

function toggleUserDropdown() {
  const el = userDropdown.value;
  if (!el) return;

  if (el.matches(':popover-open')) {
    el.hidePopover();
    return;
  }

  const anchor = anchorRef.value;
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    const width = 240;
    const top = rect.bottom + 8;
    const left = Math.max(8, rect.right - width);
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }
  el.showPopover();
}

function handleCommand(cmd: string) {
  if (userDropdown.value?.matches(':popover-open')) {
    userDropdown.value.hidePopover();
  }
  emit('command', cmd);
}
</script>

<style scoped>
.user-account-menu {
  position: fixed;
  inset: auto;
  margin: 0;
  max-width: calc(100vw - 16px);
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
}

.user-account-menu:not(:popover-open) {
  display: none;
}
</style>
