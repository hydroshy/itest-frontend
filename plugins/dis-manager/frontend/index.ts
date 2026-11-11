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
        permissions: ['dis:orders:read', 'dis:connection:manage', 'dis:sync:execute'],
      },
    });

    context.registerMenu({
      id: 'menu-dis-manager',
      title: 'DIS Odoo Integration',
      path: '/plugins/dis-manager',
      icon: 'network-wired',
      order: 25,
      permissions: ['dis:orders:read', 'dis:connection:manage', 'dis:sync:execute'],
      children: [
        {
          id: 'dis-menu-diagnostics',
          title: 'KIỂM TRA KẾT NỐI',
          icon: 'link',
          path: '/plugins/dis-manager?tab=diagnostics',
          permissions: ['dis:connection:manage'],
        },
        {
          id: 'dis-menu-orders',
          title: 'SALES ORDERS (DIS ODOO)',
          icon: 'list-check',
          path: '/plugins/dis-manager?tab=orders',
          permissions: ['dis:orders:read'],
        },
        {
          id: 'dis-menu-sandbox',
          title: 'SANDBOX THỬ NGHIỆM',
          icon: 'flask',
          path: '/plugins/dis-manager?tab=sandbox',
          permissions: ['dis:connection:manage'],
        },
      ],
    });

    context.logger.info('DIS Manager frontend plugin initialized');
  },
};

export default disManagerPlugin;
