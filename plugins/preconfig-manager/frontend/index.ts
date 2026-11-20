import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import PreconfigView from './views/PreconfigView.vue';

export const preconfigPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'preconfig-manager',
    name: 'PRECONFIG MANAGER',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý và tạo cấu hình Preconfig.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'preconfig:create',
        title: 'Tạo Preconfig Mới',
        description: 'Tạo cấu hình Preconfig mới từ Memmap Payload',
        icon: 'Plus',
        tab: 'create',
        route: '/plugins/preconfig-manager?tab=create',
        order: 1,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Preconfig frontend plugin');

    context.registerRoute({
      path: '/plugins/preconfig-manager',
      name: 'PreconfigManager',
      component: PreconfigView,
      meta: {
        title: 'PRECONFIG MANAGER',
        icon: 'Setting',
        requiresAuth: true,
      },
    });

    context.logger.info('Preconfig frontend plugin initialized');
  },
};

export default preconfigPlugin;
