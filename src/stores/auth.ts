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
  const roles = computed(() => {
    const raw = user.value?.roles || [];
    return raw.map((r: any) => (typeof r === 'object' && r !== null ? (r.name || r.code || r.id) : String(r)));
  });
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
    const res: any = await httpClient.post('/auth/login', credentials);
    const accessToken = res.access_token || res.accessToken || res.token;
    if (!accessToken) {
      throw new Error('Máy chủ không trả về access token hợp lệ.');
    }

    const rawRoles = res.user?.roles || res.roles || (res.role ? [res.role] : ['admin']);
    const normalizedRoles = Array.isArray(rawRoles)
      ? rawRoles.map((r: any) => (typeof r === 'object' && r !== null ? (r.name || r.code || r.id) : String(r)))
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
    if (permissions.value.includes('*') || roles.value.includes('admin')) {
      return true;
    }
    return permissions.value.includes(permission);
  }

  function hasRole(role: string): boolean {
    if (!user.value) return false;
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
    updateUser,
    fetchProfile,
    hasPermission,
    hasRole,
  };
});
