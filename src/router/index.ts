import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
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
    // Kept last so runtime plugin routes take precedence after bootstrap registration.
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

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  console.info('[Router] navigation', {
    from: from.fullPath,
    to: to.fullPath,
    matched: to.matched.map((record) => record.name),
  });

  // Plugins are initialized by main.ts before app.use(router); never initialize here.
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true);
  if (requiresAuth && !authStore.isAuthenticated) {
    console.info('[Router] redirect unauthenticated navigation to login.', { to: to.fullPath });
    return { path: '/auth/login', query: { redirect: to.fullPath } };
  }

  if (to.path === '/auth/login' && authStore.isAuthenticated) {
    return { path: '/dashboard' };
  }

  const requiredPermissions = to.meta?.permissions as string[] | undefined;
  if (requiredPermissions?.length && !requiredPermissions.some((permission) => authStore.hasPermission(permission))) {
    console.warn('[Router] access denied.', { path: to.path, requiredPermissions });
    return { path: '/dashboard' };
  }

  return true;
});

router.afterEach((to, from, failure) => {
  console.info('[Router] navigation resolved', {
    from: from.fullPath,
    to: to.fullPath,
    failure: failure ? failure.type : null,
  });
});

export default router;
