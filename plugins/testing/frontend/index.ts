import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import TestingView from './views/TestingView.vue';

export const testingPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'testing',
    name: 'TESTING',
    version: '1.1.0',
    sdkVersion: '^1.0.0',
    description: 'Hệ thống kiểm thử LoRaWAN toàn diện: Gateway Testing kết nối ChirpStack, Device Simulation giả lập thiết bị (OTAA/ABP, RF params, payload builder) và Device Auto Check kiểm tra tự động kết quả gói tin.',
    author: 'ITEST IoT Platform Team',
    features: [
      {
        id: 'testing:gateway-sessions',
        title: 'Gateway Test Sessions',
        description: 'Lịch sử và tiến trình đo kiểm Gateway kết nối ChirpStack',
        icon: 'Odometer',
        tab: 'gateway-sessions',
        route: '/plugins/testing?tab=gateway-sessions',
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
        id: 'testing:simulation-devices',
        title: 'Thiết Bị Simulation',
        description: 'Quản lý danh sách thiết bị kiểm thử được gắn nhãn simulation trong hệ thống',
        icon: 'Radio',
        tab: 'simulation-devices',
        route: '/plugins/testing?tab=simulation-devices',
        order: 3,
      },
      {
        id: 'testing:device-simulation',
        title: 'Device Simulation',
        description: 'Mô phỏng giả lập hoạt động thiết bị LoRaWAN (OTAA Join, Uplink, Downlink Rx1/Rx2, cảm biến)',
        icon: 'Cpu',
        tab: 'device-simulation',
        route: '/plugins/testing?tab=device-simulation',
        order: 4,
      },
      {
        id: 'testing:device-auto-check',
        title: 'Device Auto Check',
        description: 'Tự động kiểm tra tính hợp lệ của gói tin LoRaWAN, đối soát trường dữ liệu và đánh giá PASS/FAIL',
        icon: 'CheckCircle',
        tab: 'device-auto-check',
        route: '/plugins/testing?tab=device-auto-check',
        order: 5,
      },
    ],
  },

  async setup(context) {
    context.logger.info('Initializing LoRaWAN Testing Suite frontend plugin');

    context.registerRoute({
      path: '/plugins/testing',
      name: 'testing-plugin',
      component: TestingView,
      meta: {
        title: 'LoRaWAN Testing',
        icon: 'Odometer',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'testing-menu',
      title: 'LoRaWAN Testing',
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
        {
          id: 'testing-menu-simulation',
          title: 'Device Simulation',
          icon: 'Cpu',
          path: '/plugins/testing?tab=device-simulation',
        },
        {
          id: 'testing-menu-auto-check',
          title: 'Device Auto Check',
          icon: 'CheckCircle',
          path: '/plugins/testing?tab=device-auto-check',
        },
      ],
    });
  },
};

export default testingPlugin;
