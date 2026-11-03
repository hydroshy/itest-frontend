<template>
  <div class="device-auto-check-panel space-y-4">
    <AutoCheckProfilePanel />
  </div>
</template>

<script setup lang="ts">
import AutoCheckProfilePanel from './AutoCheckProfilePanel.vue';

// Preserve no-op handler for any parent calls (e.g. TestingView packet forwarding)
defineExpose({
  handleIncomingPacket: (_packet?: any) => {},
});
</script>
