import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import MemmapManagerView from './views/MemmapManagerView.vue';

export const memmapManagerPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'memmap-manager',
    name: 'MEMMAP PAYLOAD',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý và nhập bản đồ bộ nhớ thiết bị (MemMap) vào cơ sở dữ liệu.',
    author: 'ITEST IoT Platform Team',
  },

  async setup(context) {
    context.logger.info('Initializing MemMap Manager frontend plugin');

    context.registerRoute({
      path: '/plugins/memmap-manager',
      name: 'MemmapManager',
      component: MemmapManagerView,
      meta: {
        title: 'MEMMAP PAYLOAD',
        icon: 'Files',
        requiresAuth: true,
      },
    });

    context.registerRoute({
      path: '/plugins/memmap-payload',
      name: 'MemmapPayloadAlias',
      component: MemmapManagerView,
      meta: {
        title: 'MEMMAP PAYLOAD',
        icon: 'Files',
        requiresAuth: true,
      },
    });

    context.registerRoute({
      path: '/plugins/memmap',
      name: 'MemmapLegacyAlias',
      component: MemmapManagerView,
      meta: {
        title: 'MEMMAP PAYLOAD',
        icon: 'Files',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-memmap-payload',
      title: 'MEMMAP PAYLOAD',
      path: '/plugins/memmap-manager?tab=manager',
      icon: 'Files',
      order: 22,
    });

    context.logger.info('MemMap Manager frontend plugin initialized');
  },
};

export default memmapManagerPlugin;
