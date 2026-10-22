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
