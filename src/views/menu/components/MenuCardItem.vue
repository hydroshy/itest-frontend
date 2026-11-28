<template>
  <div
    class="menu-card bg-[var(--owl-bg-surface)] hover:bg-[var(--owl-bg-card-hover)] border border-[var(--owl-border)] hover:border-blue-500/50 rounded-2xl p-3 sm:p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden h-full w-full max-w-[360px] max-h-[150px] mx-auto shadow-sm hover:shadow-md hover:shadow-blue-500/10"
    @click="$emit('navigate', card)"
    @contextmenu.prevent="$emit('contextmenu', $event, card)"
  >
    <!-- Centered Clean Icon (Kích thước thanh thoát) -->
    <div
      class="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600/20 group-hover:border-blue-500/40 transition-all duration-200 shadow-none text-xl mb-2.5 shrink-0"
    >
      <CyberIcon :name="resolveIcon(card)" :size="20" />
    </div>

    <!-- Main Title: Capitalized First Letter / Title Case, Clean & Minimal -->
    <h3 class="text-xs sm:text-sm font-semibold font-display text-[var(--owl-text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2 px-2 leading-snug">
      {{ formattedTitle }}
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CyberIcon from '@/components/shared/CyberIcon.vue';

const props = defineProps<{
  card: any;
}>();

defineEmits<{
  (e: 'navigate', card: any): void;
  (e: 'contextmenu', ev: MouseEvent, card: any): void;
}>();

/**
 * Format string: Capitalize first letter of each word (Title Case)
 * and normalize ALL-CAPS words (e.g. "DECODER" -> "Decoder", "SO TEST BATCH" -> "So Test Batch")
 */
function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => {
      // Keep special acronyms readable if needed, or capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

const formattedTitle = computed(() => {
  const raw = props.card?.title || '';
  // Check if string is predominantly uppercase or needs capitalization normalization
  const hasMultipleUpper = (raw.match(/[A-Z]/g) || []).length > 3;
  if (hasMultipleUpper) {
    return toTitleCase(raw);
  }
  // Otherwise ensure at least first letter is capitalized
  return raw.charAt(0).toUpperCase() + raw.slice(1);
});

function resolveIcon(card: any): string {
  const icon = card.icon;
  const id = (card.id || '').toLowerCase();
  const title = (card.title || '').toLowerCase();
  const route = (card.route || '').toLowerCase();

  // Ưu tiên các icon đặc thù cho từng plugin và tính năng nghiệp vụ
  if (id.includes('device:manage') || route.includes('/plugins/device') || title.includes('thiết bị (devices)')) return 'microchip';
  if (id.includes('decoder') || title.includes('decoder')) return 'file-code';
  if (id.includes('dis') || route.includes('dis-manager')) return 'truck-ramp-box';
  if (id.includes('payload') || title.includes('payload')) return 'chart-line';
  if (id.includes('create-device') || title.includes('create device')) return 'circle-plus';
  if (id.includes('list-device-testing') || title.includes('list device testing')) return 'list-check';
  if (id.includes('list-device-simulation') || title.includes('list device simulation')) return 'microchip';
  if (id.includes('list-flow') || title.includes('list flow')) return 'diagram-project';
  if (id.includes('device-simulation') || title.includes('simulation flow')) return 'wand-magic-sparkles';
  if (id.includes('create-test-batch') || title.includes('create test batch')) return 'folder-plus';
  if (id.includes('list-test-batch') || title.includes('list test batch')) return 'boxes-stacked';
  if (id.includes('so-test-batch') || title.includes('so test batch')) return 'file-invoice';
  if (id.includes('gateway-test-batch') || title.includes('gateway test batch')) return 'boxes-stacked';
  if (id.includes('create-gateway') || title.includes('create gateway')) return 'circle-plus';
  if (id.includes('list-gateway') || title.includes('list gateway')) return 'list-check';
  if (id.includes('test-batch') || title.includes('test batch')) return 'boxes-stacked';
  if (id.includes('gateway') || title.includes('gateway')) return 'tower-broadcast';
  if (id.includes('packet') || title.includes('packet')) return 'satellite-dish';

  if (icon && icon !== 'desktop' && icon !== 'monitor' && icon !== 'Platform' && icon !== 'platform') {
    return icon;
  }

  if (id.includes('trace')) return 'barcode';
  if (id.includes('config')) return 'sliders';
  if (id.includes('chirp') || id.includes('lora')) return 'tower-broadcast';
  if (id.includes('memmap')) return 'layer-group';
  if (id.includes('user')) return 'users';
  if (id.includes('role')) return 'shield';
  if (id.includes('dash')) return 'dashboard';
  if (id.includes('plugin')) return 'plugins';

  return 'cubes';
}
</script>
