import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePluginStore } from '@/stores/plugin';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main-layout',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Bảng điều khiển', icon: 'Odometer', requiresAuth: true },
      },
      {
        path: 'plugins',
        name: 'Plugins',
        component: () => import('@/views/plugins/PluginListView.vue'),
        meta: { title: 'Quản lý Plugin', icon: 'SetUp', requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Đăng nhập', requiresAuth: false },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/system/NotFoundView.vue'),
    meta: { title: 'Trang không tồn tại', requiresAuth: false },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const pluginStore = usePluginStore();

  // Lazy initialize plugins and dynamic routes on first route transition
  if (!pluginStore.isInitialized) {
    try {
      await pluginStore.initializePlugins(router);
      // If navigating to a dynamically added route, redirect to self to resolve
      if (to.matched.length === 0) {
        return next({ ...to, replace: true });
      }
    } catch (e) {
      console.error('[Router] Error initializing plugin routes:', e);
    }
  }

  // Check auth requirement
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth !== false);
  if (requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }

  // Already logged in trying to visit login
  if (to.path === '/auth/login' && authStore.isAuthenticated) {
    return next({ path: '/dashboard' });
  }

  // Permission check
  const requiredPermissions = to.meta?.permissions as string[] | undefined;
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAny = requiredPermissions.some((perm) => authStore.hasPermission(perm));
    if (!hasAny) {
      console.warn(`[Router] Access denied to "${to.path}". Required permissions:`, requiredPermissions);
      return next({ path: '/dashboard' });
    }
  }

  next();
});

router.afterEach((to) => {
  const title = (to.meta?.title as string) || 'ITEST Platform';
  document.title = `${title} | ITEST`;
});

export default router;
