import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import LoRaWanDashboard from './views/LoRaWanDashboard.vue';
import GatewayStatusWidget from './widgets/GatewayStatusWidget.vue';
import HeaderBadge from './components/HeaderBadge.vue';

export const lorawanPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'lorawan-plugin',
    name: 'LoRaWAN Gateway & Telemetry',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý Gateway LoRaWAN, giám sát tín hiệu SNR/RSSI và dữ liệu cảm biến thời gian thực.',
    author: 'ITEST IoT Platform Team',
  },

  async setup(context) {
    context.logger.info('Initializing LoRaWAN Frontend Plugin...');

    // 1. Register Route under namespace /plugins/lorawan
    context.registerRoute({
      path: '/plugins/lorawan',
      name: 'LoRaWanGateway',
      component: LoRaWanDashboard,
      meta: {
        title: 'Mạng LoRaWAN',
        icon: 'Cpu',
        requiresAuth: true,
      },
    });

    // 2. Register Navigation Menu in Sidebar
    context.registerMenu({
      id: 'menu-lorawan',
      title: 'Mạng LoRaWAN',
      path: '/plugins/lorawan',
      icon: 'Cpu',
      order: 20,
    });

    // 3. Register Dashboard Widget
    context.registerWidget({
      id: 'widget-lorawan-gw',
      title: 'Trạng thái Gateway LoRaWAN',
      component: GatewayStatusWidget,
      width: 'half',
      order: 10,
    });

    // 4. Register Header Extension Point
    context.registerExtension({
      id: 'ext-lorawan-badge',
      slot: 'header-right',
      component: HeaderBadge,
      order: 5,
    });

    context.logger.info('LoRaWAN Frontend Plugin initialized successfully.');
  },

  async teardown(context) {
    context.logger.info('LoRaWAN Frontend Plugin teardown complete.');
  },
};

export default lorawanPlugin;
