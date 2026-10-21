import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { httpClient } from '@/api/client';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  avatar?: string;
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
  const roles = computed(() => user.value?.roles || []);
  const permissions = computed(() => user.value?.permissions || []);

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
    try {
      const res: any = await httpClient.post('/auth/login', credentials);
      // Backend may return { accessToken, user } or { token, user }
      const accessToken = res.accessToken || res.token || 'mock_dev_token';
      const userProfile: UserProfile = res.user || {
        id: res.id || 'usr-1',
        username: credentials.username,
        fullName: res.fullName || credentials.username,
        roles: res.roles || ['admin'],
        permissions: res.permissions || ['*'],
      };

      setAuthData(accessToken, userProfile);
    } catch (err: any) {
      // In dev mode or standalone mock support:
      if (import.meta.env.DEV && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        console.warn('[AuthStore] Backend API offline. Enabling dev mock session.');
        setAuthData('dev_mock_jwt_token', {
          id: 'admin-01',
          username: credentials.username || 'admin',
          fullName: 'System Administrator (Dev)',
          roles: ['admin', 'operator'],
          permissions: ['*'],
        });
        return;
      }
      throw err;
    }
  }

  async function logout(): Promise<void> {
    try {
      if (token.value) {
        await httpClient.post('/auth/logout').catch(() => {});
      }
    } finally {
      clearAuth();
    }
  }

  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*') || roles.value.includes('admin')) return true;
    return permissions.value.includes(permission);
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role);
  }

  return {
    token,
    user,
    isAuthenticated,
    roles,
    permissions,
    login,
    logout,
    setAuthData,
    clearAuth,
    hasPermission,
    hasRole,
  };
});
