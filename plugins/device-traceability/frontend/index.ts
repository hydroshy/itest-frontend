import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import DeviceTraceabilityView from './views/DeviceTraceabilityView.vue';

export const deviceTraceabilityPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'device-traceability',
    name: 'DEVICE TRACEABILITY',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý truy xuất nguồn gốc thiết bị, lệnh sản xuất ERP, thông số phần cứng, viễn thông và lịch sử cấu hình kiểm định.',
    author: 'ITEST IoT Platform Team',
  },

  async setup(context) {
    context.logger.info('Initializing Device Traceability frontend plugin');

    context.registerRoute({
      path: '/plugins/device-traceability',
      name: 'DeviceTraceability',
      component: DeviceTraceabilityView,
      meta: {
        title: 'DEVICE TRACEABILITY',
        icon: 'Files',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-device-traceability',
      title: 'DEVICE TRACEABILITY',
      path: '/plugins/device-traceability',
      icon: 'Files',
      order: 25,
    });

    context.logger.info('Device Traceability frontend plugin initialized');
  },
};

export default deviceTraceabilityPlugin;
