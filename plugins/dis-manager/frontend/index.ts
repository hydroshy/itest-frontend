import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import DisManagerView from './views/DisManagerView.vue';

export const disManagerPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'dis-manager',
    name: 'DIS Odoo Integration',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản trị kết nối DIS API (Odoo), kiểm thử API Sandbox và đồng bộ Sales Orders vào iTest.',
    author: 'ITEST IoT Platform Team',
  },

  async setup(context) {
    context.logger.info('Initializing DIS Manager frontend plugin');

    context.registerRoute({
      path: '/plugins/dis-manager',
      name: 'DisManager',
      component: DisManagerView,
      meta: {
        title: 'DIS Odoo Integration',
        icon: 'Connection',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-dis-manager',
      title: 'DIS Odoo Integration',
      path: '/plugins/dis-manager',
      icon: 'Connection',
      order: 25,
    });

    context.logger.info('DIS Manager frontend plugin initialized');
  },
};

export default disManagerPlugin;
