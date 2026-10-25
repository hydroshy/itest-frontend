<template>
  <svg
    :width="size || 18"
    :height="size || 18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="cyber-icon"
    :style="{ color: color || 'currentColor' }"
  >
    <!-- App Center / Menu / Grid -->
    <g v-if="name === 'grid' || name === 'menu' || name === 'launcher'">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="17.5" r="1" fill="currentColor" />
    </g>

    <!-- Dashboard / Gauge / Monitor -->
    <g v-else-if="name === 'dashboard' || name === 'odometer'">
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
      <path d="M4.5 15.5C3.5 13.5 3.5 10.5 4.8 8.5C6.5 6 9.1 4.5 12 4.5C14.9 4.5 17.5 6 19.2 8.5C20.5 10.5 20.5 13.5 19.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="14" r="2.5" stroke="currentColor" stroke-width="1.6" />
      <path d="M12 11.5L16 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <line x1="12" y1="3" x2="12" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="5.5" y1="6.5" x2="7" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="18.5" y1="6.5" x2="17" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <!-- Users / User Management -->
    <g v-else-if="name === 'users' || name === 'user'">
      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Roles / Security / Shield / Lock -->
    <g v-else-if="name === 'roles' || name === 'lock' || name === 'shield'">
      <path d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Plugins / Module / Setup -->
    <g v-else-if="name === 'plugins' || name === 'setup' || name === 'puzzle'">
      <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6" />
      <path d="M9 2V6M15 2V6M9 18V22M15 18V22M2 9H6M2 15H6M18 9H22M18 15H22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.4" />
    </g>

    <!-- Final Config / Microchip / CPU -->
    <g v-else-if="name === 'cpu' || name === 'final-config' || name === 'chip'">
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" fill="currentColor" fill-opacity="0.1" />
      <path d="M9 2V5M15 2V5M9 19V22M15 19V22M2 9H5M2 15H5M19 9H22M19 15H22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <!-- Traceability / Barcode / Search / Scan -->
    <g v-else-if="name === 'traceability' || name === 'scan' || name === 'barcode' || name === 'tools'">
      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="7" y1="8" x2="7" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <line x1="10" y1="8" x2="10" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      <line x1="14" y1="8" x2="14" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <line x1="17" y1="8" x2="17" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    </g>

    <!-- ChirpStack / LoRa / Radio / Network -->
    <g v-else-if="name === 'chirpstack' || name === 'radio' || name === 'lora' || name === 'network'">
      <path d="M12 18V21M8 21H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <path d="M8.5 10.5C9.4 9.6 10.6 9 12 9C13.4 9 14.6 9.6 15.5 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M5.5 7.5C7.2 5.8 9.5 4.8 12 4.8C14.5 4.8 16.8 5.8 18.5 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M2.5 4.5C5 2 8.3 0.8 12 0.8C15.7 0.8 19 2 21.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <!-- Monitor / Terminal / Device -->
    <g v-else>
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="6" cy="7" r="1" fill="currentColor" />
      <path d="M9 10L11 12L9 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="13" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  size?: number | string;
  color?: string;
}>();
</script>

<style scoped>
.cyber-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.2s ease, filter 0.2s ease;
}
</style>
