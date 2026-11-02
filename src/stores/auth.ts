import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { httpClient } from '@/api/client';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  userType?: string;
  roles: string[];
  permissions: string[];
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('itest_token'));
  const user = ref<UserProfile | null>(null);

  // Restore cached user info if available
  const cachedUser = localStorage.getItem('itest_user');
  if (cachedUser) {
    try {
      user.value = JSON.parse(cachedUser);
    } catch {
      localStorage.removeItem('itest_user');
    }
  }

  const isAuthenticated = computed(() => !!token.value);
  const roles = computed(() => {
    const raw = user.value?.roles || [];
    return raw.map((r: any) => (typeof r === 'object' && r !== null ? (r.code || r.name || r.id) : String(r)));
  });
  const permissions = computed(() => user.value?.permissions || []);

  const isAdmin = computed(() => {
    if (!user.value) return false;
    const username = (user.value.username || '').toLowerCase();
    if (username === 'admin') return true;
    const userType = String((user.value as any).userType || '').toUpperCase();
    if (userType === 'ADMIN' || userType === 'SUPER_ADMIN') return true;
    return roles.value.some((r: string) => {
      const upper = String(r).toUpperCase().trim();
      return (
        upper === 'ADMIN' ||
        upper === 'SUPER_ADMIN' ||
        upper === 'ADMINISTRATOR' ||
        upper === 'SUPER ADMIN' ||
        upper === 'QUẢN TRỊ VIÊN' ||
        upper === 'QUẢN TRỊ TỐI CAO'
      );
    });
  });

  const canAccessDashboard = computed(() => {
    if (!user.value) return false;
    if (isAdmin.value) return true;
    const upperRoles = roles.value.map((r: string) => String(r).toUpperCase().trim());
    if (
      upperRoles.includes('ADMIN') ||
      upperRoles.includes('SUPER_ADMIN') ||
      upperRoles.includes('ADMINISTRATOR') ||
      upperRoles.includes('SUB_ADMIN') ||
      upperRoles.includes('SUB-ADMIN') ||
      upperRoles.includes('OPERATOR') ||
      upperRoles.includes('QUẢN TRỊ VIÊN') ||
      upperRoles.includes('QUẢN TRỊ TỐI CAO') ||
      upperRoles.includes('KỸ THUẬT VIÊN VẬN HÀNH') ||
      upperRoles.includes('KỸ THUẬT VIÊN')
    ) {
      return true;
    }
    return hasPermission('dashboard:view');
  });

  function setAuthData(newToken: string, newUser: UserProfile) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('itest_token', newToken);
    localStorage.setItem('itest_user', JSON.stringify(newUser));
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('itest_token');
    localStorage.removeItem('itest_user');
  }

  async function login(credentials: { username: string; password: string }): Promise<void> {
    const res: any = await httpClient.post('/auth/login', credentials);
    const accessToken = res.access_token || res.accessToken || res.token;
    if (!accessToken) {
      throw new Error('Máy chủ không trả về access token hợp lệ.');
    }

    const rawRoles = res.user?.roles || res.roles || (res.role ? [res.role] : ['ADMIN']);
    const normalizedRoles = Array.isArray(rawRoles)
      ? rawRoles.map((r: any) => (typeof r === 'object' && r !== null ? (r.code || r.name || r.id) : String(r)))
      : [String(rawRoles)];

    const userProfile: UserProfile = res.user
      ? {
          ...res.user,
          roles: normalizedRoles,
          permissions: Array.isArray(res.user.permissions)
            ? res.user.permissions
            : (Array.isArray(res.permissions) ? res.permissions : ['*']),
        }
      : {
          id: res.id || 'usr-current',
          username: res.username || credentials.username,
          email: res.email || `${credentials.username}@itest.local`,
          fullName: res.fullName || res.name || credentials.username,
          roles: normalizedRoles,
          permissions: Array.isArray(res.permissions) ? res.permissions : ['*'],
        };

    setAuthData(accessToken, userProfile);
  }

  function updateUser(partial: Partial<UserProfile>) {
    if (!user.value) return;
    user.value = { ...user.value, ...partial };
    localStorage.setItem('itest_user', JSON.stringify(user.value));
  }

  async function fetchProfile(): Promise<void> {
    try {
      const res: any = await httpClient.get('/auth/profile');
      const profileData = res?.data || res;
      if (profileData && user.value) {
        updateUser({
          fullName: profileData.fullName || user.value.fullName,
          email: profileData.email || user.value.email,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch profile', e);
    }
  }

  async function logout(): Promise<void> {
    try {
      // Send logout to backend. If backend returns 404/redirect/error, client state still clears cleanly.
      await httpClient.post('/auth/logout').catch(() => {});
    } finally {
      clearAuth();
      // Clear legacy cookie if present
      document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  function hasPermission(permission: string): boolean {
    if (!user.value) return false;
    if (permissions.value.includes('*') || isAdmin.value) {
      return true;
    }
    const perms = permissions.value;
    if (perms.includes(permission)) return true;
    if (
      (permission === 'dashboard:view' || permission === 'menu:dashboard:view') &&
      (perms.includes('dashboard:view') || perms.includes('menu:dashboard:view'))
    ) {
      return true;
    }
    return false;
  }

  function hasRole(role: string): boolean {
    if (!user.value) return false;
    const target = role.toUpperCase().trim();
    if (target === 'ADMIN' && isAdmin.value) return true;
    return roles.value.some((r: string) => String(r).toUpperCase().trim() === target);
  }

  return {
    token,
    user,
    isAuthenticated,
    roles,
    permissions,
    isAdmin,
    canAccessDashboard,
    login,
    logout,
    updateUser,
    fetchProfile,
    hasPermission,
    hasRole,
  };
});
