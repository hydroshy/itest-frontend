import axios, { type AxiosInstance } from 'axios';
import { cyberToast } from '@/services/cyberToast';
import type { FrontendApiClient } from '@itest/frontend-sdk';

function resolveBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach Bearer token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('itest_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirectingToLogin = false;

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const responseData = error?.response?.data;
    const backendMessage = responseData?.message;

    // Is this an authentication attempt (login or logout)?
    const isLoginRequest = url.includes('/auth/login');
    const isLogoutRequest = url.includes('/auth/logout');

    if (isLogoutRequest) {
      // Logout requests should fail silently on network or 404/500 errors to allow client-side cleanup
      return Promise.resolve({ success: true });
    }

    if (status === 401) {
      if (isLoginRequest) {
        // Explicitly handle invalid login credentials without "session expired" warning
        const message = typeof backendMessage === 'string'
          ? (backendMessage === 'Invalid credentials' ? 'Tài khoản hoặc mật khẩu không chính xác.' : backendMessage)
          : 'Tài khoản hoặc mật khẩu không chính xác.';
        cyberToast.error(message);
      } else {
        // Authenticated request failed with 401: session truly expired
        console.warn('[HTTP 401] Phiên làm việc đã hết hạn hoặc chưa đăng nhập:', url);
        
        // Clear stored session and tokens
        localStorage.removeItem('itest_token');
        localStorage.removeItem('itest_user');
        sessionStorage.clear();
        document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          cyberToast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

          const currentPath = window.location.pathname + window.location.search;
          const hasRedirect = currentPath && currentPath !== '/' && !currentPath.includes('/login');
          const redirectQuery = hasRedirect ? `?redirect=${encodeURIComponent(currentPath)}` : '';

          // 1. Immediately reset Pinia auth store so reactive UI hides protected content
          import('@/stores/auth').then(({ useAuthStore }) => {
            try {
              const authStore = useAuthStore();
              authStore.clearAuth();
            } catch {}
          }).catch(() => {});

          // 2. Immediately route to Login via Vue Router if ready
          import('@/router').then(({ router }) => {
            if (router.currentRoute.value.name !== 'Login') {
              router.push({
                name: 'Login',
                query: hasRedirect ? { redirect: currentPath } : {},
              }).catch(() => {
                window.location.href = `/auth/login${redirectQuery}`;
              });
            }
          }).catch(() => {
            window.location.href = `/auth/login${redirectQuery}`;
          });

          // 3. Guaranteed fallback redirect
          setTimeout(() => {
            if (!window.location.pathname.includes('/auth/login') && !window.location.pathname.includes('/login')) {
              window.location.href = `/auth/login${redirectQuery}`;
            } else {
              isRedirectingToLogin = false;
            }
          }, 350);
        }
      }
    } else if (status === 403) {
      cyberToast.error('Bạn không có quyền thực hiện thao tác này.');
    } else if (status === 404) {
      // 404 handled specifically or surfaced cleanly
      const message = typeof backendMessage === 'string' ? backendMessage : 'Tài nguyên không tồn tại (404).';
      if (!isLoginRequest) {
        cyberToast.error(message);
      }
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      cyberToast.error('Không thể kết nối đến máy chủ backend (ERR_CONNECTION_REFUSED hoặc sai địa chỉ).');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      cyberToast.error('Yêu cầu tới máy chủ backend bị quá thời gian chờ (Timeout 10s).');
    } else if (!isLoginRequest) {
      const message = typeof backendMessage === 'string'
        ? backendMessage
        : (error.message || 'Lỗi hệ thống');
      cyberToast.error(message);
    }

    return Promise.reject(error);
  }
);

// Adapter implementing FrontendApiClient for Plugins
export const pluginApiAdapter: FrontendApiClient = {
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    return httpClient.get(url, config) as Promise<T>;
  },
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.post(url, data, config) as Promise<T>;
  },
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.put(url, data, config) as Promise<T>;
  },
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.patch(url, data, config) as Promise<T>;
  },
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    return httpClient.delete(url, config) as Promise<T>;
  },
};
