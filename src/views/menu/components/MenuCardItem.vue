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
  if (card.icon) return card.icon;
  if (card.id?.includes('trace')) return 'barcode';
  if (card.id?.includes('config') || card.id?.includes('cpu')) return 'cpu';
  if (card.id?.includes('chirp') || card.id?.includes('lora')) return 'radio';
  if (card.id?.includes('memmap')) return 'layers';
  if (card.id?.includes('user')) return 'users';
  if (card.id?.includes('role')) return 'shield';
  if (card.id?.includes('dash')) return 'monitor';
  return 'cubes';
}
</script>
