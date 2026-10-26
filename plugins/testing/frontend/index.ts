import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import TestingView from './views/TestingView.vue';

export const testingPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'testing',
    name: 'TESTING SYSTEM',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý thiết bị kiểm thử liên kết Traceability (SO/WA/Item Code), giám sát luồng gói tin Dual Payload (Raw/Decoded JSONB, RF metrics) và phiên test Gateway.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'testing:devices',
        title: 'Thiết Bị Kiểm Thử',
        description: 'Quản lý và đăng ký thiết bị kiểm thử liên kết SO/WA/Item Code từ Traceability',
        icon: 'Cpu',
        tab: 'devices',
        route: '/plugins/testing?tab=devices',
        order: 1,
      },
      {
        id: 'testing:packets',
        title: 'Giám Sát Gói Tin (Packets)',
        description: 'Giám sát trực quan luồng gói tin Dual Payload (Raw HEX/Base64 + Decoded JSONB) và RF info',
        icon: 'Connection',
        tab: 'packets',
        route: '/plugins/testing?tab=packets',
        order: 2,
      },
      {
        id: 'testing:gateway-sessions',
        title: 'Gateway Test Sessions',
        description: 'Lịch sử và tiến trình đo kiểm Gateway kết nối ChirpStack',
        icon: 'Odometer',
        tab: 'gateway-sessions',
        route: '/plugins/testing?tab=gateway-sessions',
        order: 3,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Testing System frontend plugin');

    context.registerRoute({
      path: '/plugins/testing',
      name: 'testing-plugin',
      component: TestingView,
      meta: {
        title: 'Testing System',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'testing-menu',
      title: 'Testing System',
      icon: 'Cpu',
      path: '/plugins/testing',
      order: 15,
      children: [
        {
          id: 'testing-menu-devices',
          title: 'Thiết Bị Kiểm Thử',
          icon: 'List',
          path: '/plugins/testing?tab=devices',
        },
        {
          id: 'testing-menu-packets',
          title: 'Gói Tin (Packets)',
          icon: 'Connection',
          path: '/plugins/testing?tab=packets',
        },
        {
          id: 'testing-menu-gateways',
          title: 'Gateway Sessions',
          icon: 'Odometer',
          path: '/plugins/testing?tab=gateway-sessions',
        },
      ],
    });
  },
};

export default testingPlugin;
