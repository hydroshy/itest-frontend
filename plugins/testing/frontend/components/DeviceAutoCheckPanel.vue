<template>
  <div class="device-auto-check-panel space-y-4">
    <DeviceSimulationPanel />
  </div>
</template>

<script setup lang="ts">
import DeviceSimulationPanel from './DeviceSimulationPanel.vue';

// Preserve handler for any parent calls (e.g. TestingView packet forwarding)
defineExpose({
  handleIncomingPacket: (_packet?: any) => {},
});
</script>
