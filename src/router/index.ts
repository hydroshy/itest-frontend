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
    console.info('[Router] authenticated user on login route, redirecting to dashboard');
    return { name: 'Dashboard' };
  }

  return true;
});

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'ITEST';
  document.title = `${title} - iTest 2.0`;
});
