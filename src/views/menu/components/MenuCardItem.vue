<template>
  <div
    class="menu-card bg-[var(--owl-bg-surface)] hover:bg-[var(--owl-bg-card-hover)] border border-[var(--owl-border)] hover:border-blue-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[185px] shadow-sm hover:shadow-md hover:shadow-blue-500/10"
    @click="$emit('navigate', card)"
    @contextmenu.prevent="$emit('contextmenu', $event, card)"
  >
    <!-- Top Row: Icon + Category Badge -->
    <div class="flex items-center justify-between">
      <div
        class="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600/20 group-hover:border-blue-500/40 transition-all duration-200 shadow-none text-lg"
      >
        <CyberIcon :name="resolveIcon(card)" :size="20" />
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-circle text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Tùy chọn & chi tiết"
          @click.stop="$emit('contextmenu', $event, card)"
        >
          <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" class="text-xs" />
        </button>
        <span
          class="badge badge-sm font-mono text-[10px] font-bold border"
          :class="card.category === 'system'
            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'"
        >
          {{ card.category === 'system' ? 'Hệ thống' : 'Plugin' }}
        </span>
      </div>
    </div>

    <!-- Middle: Title & Description -->
    <div class="my-3">
      <h3 class="text-sm font-black font-display text-[var(--owl-text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
        {{ card.title }}
      </h3>
      <p class="text-xs font-semibold text-[var(--owl-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
        {{ card.description || 'Chức năng kiểm thử thiết bị và tiện ích vận hành hệ thống' }}
      </p>
    </div>

    <!-- Bottom Row: Launch Arrow -->
    <div class="pt-2 border-t border-[var(--owl-border-light)] flex items-center justify-end text-[11px] text-[var(--owl-text-muted)]">
      <span class="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform font-bold text-xs flex items-center gap-1.5">
        <span>Truy cập</span>
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-[10px]" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CyberIcon from '@/components/shared/CyberIcon.vue';

const props = defineProps<{
  card: any;
}>();

defineEmits<{
  (e: 'navigate', card: any): void;
  (e: 'contextmenu', ev: MouseEvent, card: any): void;
}>();

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
