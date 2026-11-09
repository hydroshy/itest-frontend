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
          id: 'testing-menu-create-device-testing',
          title: 'Create Device Testing',
          icon: 'PlusCircle',
          path: '/plugins/testing?tab=create-device-testing',
        },
        {
          id: 'testing-menu-list-device-testing',
          title: 'List Device Testing',
          icon: 'List',
          path: '/plugins/testing?tab=list-device-testing',
        },
        {
          id: 'testing-menu-test-batch',
          title: 'Device Test Batch',
          icon: 'Boxes',
          path: '/plugins/testing?tab=test-batch',
        },
        {
          id: 'testing-menu-create-test-batch',
          title: 'Create Test Batch',
          icon: 'FolderPlus',
          path: '/plugins/testing?tab=create-test-batch',
        },
        {
          id: 'testing-menu-so-test-batch',
          title: 'SO Test Batch',
          icon: 'Layers',
          path: '/plugins/testing?tab=so-test-batch',
        },
        {
          id: 'testing-menu-list-flow-simulation',
          title: 'List Flow Simulation',
          icon: 'Layers',
          path: '/plugins/testing?tab=list-flow-simulation',
        },
        {
          id: 'testing-menu-list-device-simulation',
          title: 'List Device Simulation',
          icon: 'Radio',
          path: '/plugins/testing?tab=list-device-simulation',
        },
        {
          id: 'testing-menu-simulation',
          title: 'Create Flow Simulation',
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
