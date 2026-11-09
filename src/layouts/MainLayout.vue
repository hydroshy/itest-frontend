<template>
  <div class="layout-container flex h-screen w-screen overflow-hidden bg-[var(--owl-bg-canvas)] text-[var(--owl-text-primary)] transition-colors duration-250">
    <!-- Sidebar Modular Component (Ẩn khi ở /menu hoặc launcher mode) -->
    <LayoutSidebar
      v-if="showSidebar"
      :is-collapse="isCollapse"
      :active-route="activeRoute"
      :can-access-dashboard="canAccessDashboard"
      :can-access-admin="canAccessAdmin"
      :filtered-plugin-menus="filteredPluginMenus"
    />

    <!-- Main Content Wrapper -->
    <div class="layout-main-wrapper flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-[var(--owl-bg-canvas)]">
      <!-- Navbar Modular Component -->
      <LayoutNavbar
        :show-sidebar="showSidebar"
        :is-collapse="isCollapse"
        :current-route-title="currentRouteTitle"
        :can-access-admin="canAccessAdmin"
        @toggle-sidebar="toggleSidebar"
        @command="handleUserCommand"
      />

      <!-- Content Area protected by CModuleBoundary -->
      <main
        class="layout-content relative flex-1 overflow-y-auto p-4 sm:p-6"
        :class="{
          'menu-layout-mode p-2 sm:p-4': route.path === '/menu',
          'from-menu': route.query.from === 'menu' || isFromMenu
        }"
      >
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
import CModuleBoundary from '@/components/shared/CModuleBoundary.vue';
import UserProfileModal from '@/components/shared/UserProfileModal.vue';
import LayoutSidebar from './components/LayoutSidebar.vue';
import LayoutNavbar from './components/LayoutNavbar.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const pluginStore = usePluginStore();

const isCollapse = ref(false);
const profileModalVisible = ref(false);

const activeRoute = computed(() => route.path);

const isFromMenu = computed(() => {
  return route.query.from === 'menu' || Boolean((route.meta as Record<string, unknown>)?.isFromMenu);
});

const showSidebar = computed(() => {
  return route.path !== '/menu' && !isFromMenu.value;
});

const currentRouteTitle = computed(() => {
  if (isFromMenu.value && route.query.tab) {
    const tab = String(route.query.tab);
    const tabMap: Record<string, string> = {
      'test-batch': 'Device Test Batch',
      'device-test-batch': 'Device Test Batch',
      'create-test-batch': 'Create Test Batch',
      'list-test-batch': 'LIST TEST BATCH',
      'device-payload': 'Device Payload Live Stream',
      'tool': 'Final Config Tool',
      'manager': 'Final Config Manager',
      'create': 'Tạo Final Config',
      'so': 'Sales Orders & Work Orders',
      'devices': 'Device Traceability List',
      'scripts': 'Payload Decoder Scripts',
      'network': 'ChirpStack Network Server',
      'memmaps': 'Bản Đồ Memmap Payload',
      'rules': 'Auto Check Rules Engine',
    };
    if (tabMap[tab]) {
      return tabMap[tab];
    }
  }

  if (route.meta?.title) {
    const t = String(route.meta.title);
    if (t === 'LoRaWAN Testing') {
      return 'Device Testing';
    }
    return t;
  }
  return 'Hệ Thống Kiểm Thử iTEST';
});

const canAccessDashboard = computed(() => {
  return authStore.isAdmin || authStore.roles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'TESTER', 'VIEWER', 'OPERATOR', 'END_USER'].includes(r));
});

const canAccessAdmin = computed(() => {
  return authStore.isAdmin || authStore.roles.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
});

const filteredPluginMenus = computed(() => {
  return (pluginStore.menus || []).map((m: any) => ({
    ...m,
    title: m.title || m.label || m.id,
    path: m.path || m.route || '',
  }));
});

function toggleSidebar() {
  isCollapse.value = !isCollapse.value;
}

async function handleUserCommand(cmd: string) {
  if (cmd === 'logout') {
    await authStore.logout();
    await router.replace('/auth/login');
  } else if (cmd === 'dashboard') {
    router.push('/dashboard');
  } else if (cmd === 'roles') {
    router.push('/roles');
  } else if (cmd === 'profile') {
    profileModalVisible.value = true;
  }
}
</script>

<style scoped>
.layout-container {
  font-family: var(--cyber-font-body);
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
