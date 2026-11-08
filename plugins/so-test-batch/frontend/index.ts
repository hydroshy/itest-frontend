import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import SoTestBatchView from './views/SoTestBatchView.vue';

export const soTestBatchPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'so-test-batch',
    name: 'SO TEST BATCH',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý liên kết giữa Sale Order và Test Batch, theo dõi và cấu hình Test Batch cho từng SO.',
    author: 'ITEST Platform Team',
    features: [
      {
        id: 'so-test-batch:manage',
        title: 'Quản Lý SO & Test Batch',
        description: 'Liên kết và quản lý cấu hình Test Batch theo từng Sale Order',
        icon: 'Layers',
        tab: 'so-test-batch',
        route: '/plugins/so-test-batch',
        order: 1,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing SO Test Batch frontend plugin');

    context.registerRoute({
      name: 'so-test-batch',
      path: '/plugins/so-test-batch',
      component: SoTestBatchView,
      meta: {
        title: 'SO TEST BATCH',
        icon: 'Layers',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-so-test-batch',
      title: 'SO TEST BATCH',
      path: '/plugins/so-test-batch',
      icon: 'Layers',
      order: 28,
    });

    context.logger.info('SO Test Batch frontend plugin initialized');
  },
};

export default soTestBatchPlugin;
