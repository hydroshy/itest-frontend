import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import type { FrontendApiClient } from '@itest/frontend-sdk';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
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

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || 'Lỗi hệ thống';

    if (status === 401) {
      // Per Team Operating Doctrine: inform user rather than harsh auto-redirect or wipe
      console.warn('[HTTP 401] Phiên làm việc đã hết hạn hoặc chưa đăng nhập');
      ElMessage.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (status === 403) {
      ElMessage.error('Bạn không có quyền thực hiện thao tác này.');
    } else {
      ElMessage.error(message);
    }

    return Promise.reject(error);
  }
);

// Adapter implementing FrontendApiClient for Plugins
export const pluginApiAdapter: FrontendApiClient = {
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    return httpClient.get(url, config) as unknown as T;
  },
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.post(url, data, config) as unknown as T;
  },
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.put(url, data, config) as unknown as T;
  },
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    return httpClient.delete(url, config) as unknown as T;
  },
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return httpClient.patch(url, data, config) as unknown as T;
  },
};
