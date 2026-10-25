import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main-layout',
    component: MainLayout,
    redirect: '/menu',
    children: [
      {
        path: 'menu',
        name: 'MenuLauncher',
        component: () => import('@/views/menu/MenuView.vue'),
        meta: { title: 'Trung tâm Ứng dụng', icon: 'Grid', requiresAuth: true },
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Bảng điều khiển', icon: 'Odometer', requiresAuth: true },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserListView.vue'),
        meta: { title: 'Quản lý Người dùng', icon: 'User', requiresAuth: true },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/roles/RoleListView.vue'),
        meta: { title: 'Quản lý Phân quyền', icon: 'Lock', requiresAuth: true },
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
    meta: { requiresAuth: false },
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

  const isPublicRoute = to.matched.every((record) => record.meta.requiresAuth === false);
  const requiresAuth = !isPublicRoute;

  if (to.name !== 'Login' && requiresAuth && !authStore.isAuthenticated) {
    console.warn('[Router] unauthenticated access, redirecting to login', { target: to.fullPath });
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    // Nếu user có quyền/role thì chuyển về Dashboard, ngược lại về Menu Launcher
    const hasRole = authStore.roles.length > 0;
    return { name: hasRole ? 'Dashboard' : 'MenuLauncher' };
  }

  // Guard Dashboard cho người dùng chưa có role
  if (to.name === 'Dashboard' && authStore.isAuthenticated) {
    const hasRole = authStore.roles.length > 0;
    if (!hasRole) {
      console.warn('[Router] User has no roles, redirecting from Dashboard to MenuLauncher');
      return { name: 'MenuLauncher' };
    }
  }

  return true;
});

import { useCtosTransition } from '@/composables/useCtosTransition';

router.afterEach((to, from) => {
  const title = (to.meta.title as string) || 'iTEST 2.0';
  document.title = 'ITEST 2.0';
  if (from.path && from.path !== to.path) {
    const { triggerTransition } = useCtosTransition();
    triggerTransition(title, 'BREACHING_SECTOR');
  }
});
