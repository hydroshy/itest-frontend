import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import TestingView from './views/TestingView.vue';

export const testingPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'testing',
    name: 'GATEWAY TESTING',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Hệ thống Gateway Testing chuyên biệt: giám sát luồng gói tin Dual Payload (Raw/Decoded JSONB, RF metrics) từ ChirpStack và quản lý phiên kiểm thử Gateway.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'testing:packets',
        title: 'Giám Sát Gói Tin (Packets)',
        description: 'Giám sát trực quan luồng gói tin Dual Payload (Raw HEX/Base64 + Decoded JSONB) và RF info',
        icon: 'Connection',
        tab: 'packets',
        route: '/plugins/testing?tab=packets',
        order: 1,
      },
      {
        id: 'testing:gateway-sessions',
        title: 'Gateway Test Sessions',
        description: 'Lịch sử và tiến trình đo kiểm Gateway kết nối ChirpStack',
        icon: 'Odometer',
        tab: 'gateway-sessions',
        route: '/plugins/testing?tab=gateway-sessions',
        order: 2,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Gateway Testing frontend plugin');

    context.registerRoute({
      path: '/plugins/testing',
      name: 'testing-plugin',
      component: TestingView,
      meta: {
        title: 'Gateway Testing',
        icon: 'Odometer',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'testing-menu',
      title: 'Gateway Testing',
      icon: 'Odometer',
      path: '/plugins/testing',
      order: 15,
      children: [
        {
          id: 'testing-menu-gateways',
          title: 'Gateway Sessions',
          icon: 'Odometer',
          path: '/plugins/testing?tab=gateway-sessions',
        },
        {
          id: 'testing-menu-packets',
          title: 'Gói Tin (Packets)',
          icon: 'Connection',
          path: '/plugins/testing?tab=packets',
        },
      ],
    });
  },
};

export default testingPlugin;
