import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import DeviceTraceabilityView from './views/DeviceTraceabilityView.vue';

export const deviceTraceabilityPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'device-traceability',
    name: 'DEVICE TRACEABILITY',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý truy xuất nguồn gốc thiết bị, lệnh sản xuất ERP, thông số phần cứng, viễn thông và lịch sử cấu hình kiểm định.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'device-traceability:so',
        title: 'Quản Lý Sale Order (ERP)',
        description: 'Quản lý cây dữ liệu Sale Order, Work Authorization và danh sách thiết bị',
        icon: 'Files',
        tab: 'sale-orders',
        route: '/plugins/device-traceability?tab=so',
        order: 1,
      },
      {
        id: 'device-traceability:devices',
        title: 'Tra Cứu Thiết Bị Kiểm Thử',
        description: 'Tra cứu lịch sử kiểm thử phần cứng, viễn thông và thông số thiết bị',
        icon: 'Checked',
        tab: 'testing-devices',
        route: '/plugins/device-traceability?tab=devices',
        order: 2,
      },
      {
        id: 'device-traceability:config',
        title: 'Tra Cứu Cấu Hình Cuối',
        description: 'Tra cứu lịch sử nạp cấu hình và trạng thái kiểm định thiết bị',
        icon: 'Setting',
        tab: 'config-devices',
        route: '/plugins/device-traceability?tab=config',
        order: 3,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing Device Traceability frontend plugin');

    context.registerRoute({
      path: '/plugins/device-traceability',
      name: 'DeviceTraceability',
      component: DeviceTraceabilityView,
      meta: {
        title: 'DEVICE TRACEABILITY',
        icon: 'Files',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-device-traceability',
      title: 'DEVICE TRACEABILITY',
      path: '/plugins/device-traceability',
      icon: 'Files',
      order: 25,
    });

    context.logger.info('Device Traceability frontend plugin initialized');
  },
};

export default deviceTraceabilityPlugin;
