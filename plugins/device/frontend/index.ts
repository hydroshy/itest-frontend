import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import DeviceView from './views/DeviceView.vue';

export const devicePlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'device',
    name: 'DEVICE MANAGEMENT',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý danh sách thiết bị IoT, liên kết dữ liệu Traceability (SO/WA/Item Code) và trạng thái hoạt động độc lập.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'device:manage',
        title: 'Thiết Bị (Devices)',
        description: 'Quản lý và đăng ký thiết bị kiểm thử liên kết SO/WA/Item Code từ Traceability',
        icon: 'Cpu',
        route: '/plugins/device',
        order: 1,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Device Management frontend plugin');

    context.registerRoute({
      path: '/plugins/device',
      name: 'device-plugin',
      component: DeviceView,
      meta: {
        title: 'Thiết Bị (Devices)',
        icon: 'Cpu',
        requiresAuth: true,
        permissions: ['device:device:view'],
      },
    });

    context.registerMenu({
      id: 'menu-device',
      title: 'Thiết Bị (Devices)',
      icon: 'Cpu',
      path: '/plugins/device',
      order: 10,
    });

    context.logger.info('Device Management plugin initialized successfully');
  },
};

export default devicePlugin;
