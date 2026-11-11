import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import LoRaWanChirpStackView from './views/LoRaWanChirpStackView.vue';
import ChirpStackFleetWidget from './widgets/ChirpStackFleetWidget.vue';
import ChirpStackHeaderBadge from './components/ChirpStackHeaderBadge.vue';

export const lorawanChirpStackPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'lorawan-chirpstack',
    name: 'LoRaWAN ChirpStack Network Manager',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý ChirpStack Network Server, Gateway, Device và LoRaWAN telemetry.',
    author: 'ITEST IoT Platform Team',
  },

  async setup(context) {
    context.logger.info('Initializing ChirpStack LoRaWAN frontend plugin');

    context.registerRoute({
      path: '/plugins/lorawan-chirpstack',
      name: 'LoRaWanChirpStack',
      component: LoRaWanChirpStackView,
      meta: {
        title: 'ChirpStack LoRaWAN',
        icon: 'Connection',
        requiresAuth: true,
      },
    });

    context.registerMenu({
      id: 'menu-lorawan-chirpstack',
      title: 'ChirpStack LoRaWAN',
      path: '/plugins/lorawan-chirpstack',
      icon: 'tower-broadcast',
      order: 21,
      children: [
        {
          id: 'chirpstack-menu-servers',
          title: 'SERVERS',
          path: '/plugins/lorawan-chirpstack?tab=servers',
          icon: 'server',
        },
        {
          id: 'chirpstack-menu-tenants',
          title: 'TENANTS',
          path: '/plugins/lorawan-chirpstack?tab=tenants',
          icon: 'building',
        },
        {
          id: 'chirpstack-menu-applications',
          title: 'APPLICATIONS',
          path: '/plugins/lorawan-chirpstack?tab=applications',
          icon: 'cubes',
        },
        {
          id: 'chirpstack-menu-gateways',
          title: 'GATEWAYS',
          path: '/plugins/lorawan-chirpstack?tab=gateways',
          icon: 'tower-broadcast',
        },
        {
          id: 'chirpstack-menu-devices',
          title: 'DEVICES',
          path: '/plugins/lorawan-chirpstack?tab=devices',
          icon: 'microchip',
        },
        {
          id: 'chirpstack-menu-telemetry',
          title: 'TELEMETRY FRAMES',
          path: '/plugins/lorawan-chirpstack?tab=telemetry',
          icon: 'chart-line',
        },
      ],
    });

    context.registerWidget({
      id: 'widget-chirpstack-fleet',
      title: 'ChirpStack LoRaWAN Fleet',
      component: ChirpStackFleetWidget,
      width: 'full',
      order: 11,
    });

    context.registerExtension({
      id: 'ext-chirpstack-header-badge',
      slot: 'header-right',
      component: ChirpStackHeaderBadge,
      order: 6,
    });

    context.logger.info('ChirpStack LoRaWAN frontend plugin initialized');
  },
};

export default lorawanChirpStackPlugin;
