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
        id: 'testing:create-device-testing',
        title: 'Create Device Testing',
        description: 'Tạo và khởi chạy phiên kiểm thử thiết bị toàn diện (DUT, Flow simulation & Auto check rules)',
        icon: 'PlusCircle',
        tab: 'create-device-testing',
        route: '/plugins/testing?tab=create-device-testing',
        order: 3,
      },
      {
        id: 'testing:list-device-testing',
        title: 'List Device Testing',
        description: 'Danh sách các thiết bị kiểm thử được tạo ra bởi người dùng trong default application',
        icon: 'List',
        tab: 'list-device-testing',
        route: '/plugins/testing?tab=list-device-testing',
        order: 4,
      },
      {
        id: 'testing:test-batch',
        title: 'Device Test Batch',
        description: 'Kiểm thử hàng loạt thiết bị song song theo Simulation Flow, gán thiết bị chuẩn 1-1 và đếm giờ',
        icon: 'Boxes',
        tab: 'test-batch',
        route: '/plugins/testing?tab=test-batch',
        order: 5,
      },
      {
        id: 'testing:create-test-batch',
        title: 'Create Test Batch',
        description: 'Khởi tạo cấu hình Test Batch bổ trợ với ITEM-CODE, LONG_FW, gán Simulation Flow & Auto Check',
        icon: 'FolderPlus',
        tab: 'create-test-batch',
        route: '/plugins/testing?tab=create-test-batch',
        order: 6,
      },
      {
        id: 'testing:so-test-batch',
        title: 'SO Test Batch',
        description: 'Quản lý liên kết giữa các Test Batch và Sale Order (SO) theo từng ITEM_CODE',
        icon: 'Layers',
        tab: 'so-test-batch',
        route: '/plugins/testing?tab=so-test-batch',
        order: 7,
      },
      {
        id: 'testing:list-flow-simulation',
        title: 'List Flow Simulation',
        description: 'Quản lý danh sách các kịch bản mô phỏng Flow Simulation cho kiểm thử thiết bị',
        icon: 'Layers',
        tab: 'list-flow-simulation',
        route: '/plugins/testing?tab=list-flow-simulation',
        order: 7,
      },
      {
        id: 'testing:list-device-simulation',
        title: 'List Device Simulation',
        description: 'Quản lý danh sách thiết bị kiểm thử được gắn nhãn simulation trong hệ thống',
        icon: 'Radio',
        tab: 'list-device-simulation',
        route: '/plugins/testing?tab=list-device-simulation',
        order: 8,
      },
      {
        id: 'testing:simulation-devices',
        title: 'Thiết Bị Simulation',
        description: 'Quản lý danh sách thiết bị kiểm thử được gắn nhãn simulation trong hệ thống (alias)',
        icon: 'Radio',
        tab: 'simulation-devices',
        route: '/plugins/testing?tab=simulation-devices',
        order: 9,
      },
      {
        id: 'testing:device-simulation',
        title: 'CREATE SIMULATION FLOW',
        description: 'Tạo kịch bản mô phỏng kiểm thử kết hợp Auto Check: Downlink, Delay, Cửa sổ đo, Tính trung bình & Đánh giá chất lượng',
        icon: 'Cpu',
        tab: 'device-simulation',
        route: '/plugins/testing?tab=device-simulation',
        order: 10,
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
        title: 'LORAWAN TESTING',
        icon: 'Odometer',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'testing-menu',
      title: 'LORAWAN TESTING',
      icon: 'tower-broadcast',
      path: '/plugins/testing',
      order: 15,
      children: [
        {
          id: 'testing-menu-device-payload',
          title: 'DEVICE PAYLOAD',
          icon: 'chart-line',
          path: '/plugins/testing?tab=device-payload',
        },
        {
          id: 'testing-menu-create-device-testing',
          title: 'CREATE DEVICE TESTING',
          icon: 'circle-plus',
          path: '/plugins/testing?tab=create-device-testing',
        },
        {
          id: 'testing-menu-list-device-testing',
          title: 'LIST DEVICE TESTING',
          icon: 'list-check',
          path: '/plugins/testing?tab=list-device-testing',
        },
        {
          id: 'testing-menu-list-test-batch',
          title: 'LIST TEST BATCH',
          icon: 'boxes-stacked',
          path: '/plugins/testing?tab=list-test-batch',
        },
        {
          id: 'testing-menu-list-flow-simulation',
          title: 'LIST FLOW SIMULATION',
          icon: 'diagram-project',
          path: '/plugins/testing?tab=list-flow-simulation',
        },
        {
          id: 'testing-menu-list-device-simulation',
          title: 'LIST DEVICE SIMULATION',
          icon: 'microchip',
          path: '/plugins/testing?tab=list-device-simulation',
        },
        {
          id: 'testing-menu-so-test-batch',
          title: 'SO TEST BATCH',
          icon: 'file-invoice',
          path: '/plugins/testing?tab=so-test-batch',
        },
        {
          id: 'testing-menu-create-test-batch',
          title: 'CREATE TEST BATCH',
          icon: 'folder-plus',
          path: '/plugins/testing?tab=create-test-batch',
        },
        {
          id: 'testing-menu-simulation-flow',
          title: 'CREATE SIMULATION FLOW',
          icon: 'wand-magic-sparkles',
          path: '/plugins/testing?tab=device-simulation',
        },
      ],
    });
  },
};

export default testingPlugin;
