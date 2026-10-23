import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import FinalConfigView from './views/FinalConfigView.vue';

export const finalConfigPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'final-config',
    name: 'FINAL CONFIG',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý và tạo cấu hình cuối (Final Config) từ Memmap Payload.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'final-config:tool',
        title: 'Final Config Tool',
        description: 'Công cụ nạp cấu hình cuối, ghi AppKey và kiểm tra Modbus cho thiết bị IoT',
        icon: 'Cpu',
        tab: 'tool',
        route: '/plugins/final-config?tab=tool',
        order: 1,
      },
      {
        id: 'final-config:manager',
        title: 'Quản Lý Final Config',
        description: 'Xem danh sách và chi tiết các cấu hình Final Config đã lưu',
        icon: 'Files',
        tab: 'manager',
        route: '/plugins/final-config?tab=manager',
        order: 2,
      },
      {
        id: 'final-config:create',
        title: 'Tạo Final Config Mới',
        description: 'Tạo cấu hình cuối mới từ Memmap Payload đã được kiểm tra',
        icon: 'Plus',
        tab: 'create',
        route: '/plugins/final-config?tab=create',
        order: 3,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Final Config frontend plugin');

    context.registerRoute({
      path: '/plugins/final-config',
      name: 'FinalConfig',
      component: FinalConfigView,
      meta: {
        title: 'FINAL CONFIG',
        icon: 'Setting',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-final-config',
      title: 'FINAL CONFIG',
      path: '/plugins/final-config',
      icon: 'Setting',
      order: 23,
    });

    context.logger.info('Final Config frontend plugin initialized');
  },
};

export default finalConfigPlugin;
