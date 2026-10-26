import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import DecoderView from './views/DecoderView.vue';

export const decoderPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'decoder',
    name: 'DECODER SYSTEM',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý và thực thi script JS giải mã payload LoRaWAN theo SKU & LONG_FW từ MemMap, tích hợp sandbox kiểm thử',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'decoder:scripts',
        title: 'Bộ Giải Mã Payload',
        description: 'Quản lý các script giải mã LoRaWAN theo SKU và LONG_FW',
        icon: 'Cpu',
        tab: 'list',
        route: '/plugins/decoder?tab=list',
        order: 1,
      },
      {
        id: 'decoder:memmaps',
        title: 'Tra Cứu MemMap',
        description: 'Tra cứu trạng thái cấu hình Decoder cho các SKU & LONG_FW trong MemMap',
        icon: 'Document',
        tab: 'memmaps',
        route: '/plugins/decoder?tab=memmaps',
        order: 2,
      },
      {
        id: 'decoder:sandbox',
        title: 'Sandbox Thử Nghiệm',
        description: 'Môi trường kiểm thử thực thi script giải mã payload và JSON output',
        icon: 'VideoPlay',
        tab: 'sandbox',
        route: '/plugins/decoder?tab=sandbox',
        order: 3,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Decoder System frontend plugin');

    context.registerRoute({
      path: '/plugins/decoder',
      name: 'decoder-plugin',
      component: DecoderView,
      meta: {
        title: 'Bộ Giải Mã (Decoder)',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'decoder-menu',
      title: 'Bộ Giải Mã (Decoder)',
      icon: 'Cpu',
      path: '/plugins/decoder',
      order: 16,
      children: [
        {
          id: 'decoder-menu-scripts',
          title: 'Danh Sách Scripts',
          icon: 'Cpu',
          path: '/plugins/decoder?tab=list',
        },
        {
          id: 'decoder-menu-memmaps',
          title: 'Tra Cứu MemMap',
          icon: 'Document',
          path: '/plugins/decoder?tab=memmaps',
        },
        {
          id: 'decoder-menu-sandbox',
          title: 'Sandbox Thử Nghiệm',
          icon: 'VideoPlay',
          path: '/plugins/decoder?tab=sandbox',
        },
      ],
    });
  },
};

export default decoderPlugin;
