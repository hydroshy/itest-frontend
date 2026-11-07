<template>
  <font-awesome-icon
    :icon="resolvedFaIcon"
    :style="iconStyle"
    class="cyber-icon fa-system-icon transition-colors duration-150"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name?: string | [string, string];
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  name: 'desktop',
  size: 18,
  color: 'currentColor',
  strokeWidth: 1.8,
});

const numericSize = computed(() => {
  const n = Number(props.size);
  return Number.isFinite(n) ? n : 18;
});

const iconStyle = computed(() => ({
  fontSize: `${numericSize.value}px`,
  width: `${numericSize.value}px`,
  height: `${numericSize.value}px`,
  color: props.color || 'currentColor',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Comprehensive lookup map matching system routes, Element Plus names, and plugin categories to Font Awesome icons
const FA_MAP: Record<string, [string, string]> = {
  // Shell System routes
  grid: ['fas', 'border-all'],
  menu: ['fas', 'border-all'],
  launcher: ['fas', 'border-all'],
  'app-center': ['fas', 'border-all'],
  Grid: ['fas', 'border-all'],

  dashboard: ['fas', 'gauge-high'],
  odometer: ['fas', 'gauge-high'],
  gauge: ['fas', 'gauge-high'],
  databoard: ['fas', 'gauge-high'],
  Odometer: ['fas', 'gauge-high'],
  DataBoard: ['fas', 'gauge-high'],
  Platform: ['fas', 'desktop'],
  platform: ['fas', 'desktop'],
  monitor: ['fas', 'desktop'],

  users: ['fas', 'users'],
  user: ['fas', 'user'],
  User: ['fas', 'user'],
  avatar: ['fas', 'user'],

  roles: ['fas', 'shield-halved'],
  role: ['fas', 'shield-halved'],
  shield: ['fas', 'shield-halved'],
  'shield-check': ['fas', 'shield-halved'],
  lock: ['fas', 'lock'],
  Lock: ['fas', 'lock'],
  key: ['fas', 'key'],
  Key: ['fas', 'key'],

  plugins: ['fas', 'cubes'],
  plugin: ['fas', 'cubes'],
  setup: ['fas', 'cubes'],
  SetUp: ['fas', 'cubes'],
  puzzle: ['fas', 'puzzle-piece'],
  blocks: ['fas', 'cubes'],
  boxes: ['fas', 'boxes-stacked'],

  // Hardware & Config
  cpu: ['fas', 'microchip'],
  Cpu: ['fas', 'microchip'],
  chip: ['fas', 'microchip'],
  microchip: ['fas', 'microchip'],
  'final-config': ['fas', 'microchip'],
  config: ['fas', 'microchip'],

  // Traceability & Barcode
  traceability: ['fas', 'barcode'],
  'device-traceability': ['fas', 'barcode'],
  scan: ['fas', 'barcode'],
  barcode: ['fas', 'barcode'],
  search: ['fas', 'magnifying-glass'],
  Search: ['fas', 'magnifying-glass'],

  // ChirpStack & IoT Wireless
  chirpstack: ['fas', 'tower-broadcast'],
  'lorawan-chirpstack': ['fas', 'tower-broadcast'],
  radio: ['fas', 'tower-broadcast'],
  lora: ['fas', 'tower-broadcast'],
  antenna: ['fas', 'tower-cell'],
  wifi: ['fas', 'wifi'],
  Connection: ['fas', 'link'],
  connection: ['fas', 'link'],
  link: ['fas', 'link'],
  Link: ['fas', 'link'],

  // Memmap & Databases
  memmap: ['fas', 'layer-group'],
  'memmap-payload': ['fas', 'layer-group'],
  'memmap-manager': ['fas', 'layer-group'],
  collection: ['fas', 'layer-group'],
  Collection: ['fas', 'layer-group'],
  layers: ['fas', 'layer-group'],
  Layers: ['fas', 'layer-group'],
  database: ['fas', 'database'],
  server: ['fas', 'server'],
  document: ['fas', 'file-lines'],
  'file-text': ['fas', 'file-lines'],
  'file-code': ['fas', 'file-code'],
  'folder-opened': ['fas', 'folder-open'],
  'circle-plus': ['fas', 'circle-plus'],
  plus: ['fas', 'plus'],
  list: ['fas', 'list-check'],
  'list-ordered': ['fas', 'list-ol'],
  upload: ['fas', 'cloud-arrow-up'],
  network: ['fas', 'network-wired'],
  router: ['fas', 'network-wired'],

  // Actions & States
  check: ['fas', 'circle-check'],
  'check-circle': ['fas', 'circle-check'],
  'check-circle-2': ['fas', 'circle-check'],
  refresh: ['fas', 'arrows-rotate'],
  'refresh-cw': ['fas', 'arrows-rotate'],
  bell: ['fas', 'bell'],
  settings: ['fas', 'gear'],
  setting: ['fas', 'gear'],
  sliders: ['fas', 'sliders'],
  terminal: ['fas', 'terminal'],
  tools: ['fas', 'wrench'],
  Tools: ['fas', 'wrench'],
  wrench: ['fas', 'wrench'],
  logout: ['fas', 'right-from-bracket'],
  'log-out': ['fas', 'right-from-bracket'],
  activity: ['fas', 'chart-line'],
  sparkles: ['fas', 'wand-magic-sparkles'],
  testing: ['fas', 'flask'],
  test: ['fas', 'flask'],
  alert: ['fas', 'triangle-exclamation'],
  warning: ['fas', 'triangle-exclamation'],
  'alert-triangle': ['fas', 'triangle-exclamation'],
  info: ['fas', 'circle-info'],

  // Theme & Navigation
  sun: ['fas', 'sun'],
  moon: ['fas', 'moon'],
  bars: ['fas', 'bars'],
  'arrow-right': ['fas', 'arrow-right'],
  'arrow-left': ['fas', 'arrow-left'],
  'chevron-right': ['fas', 'chevron-right'],
  'chevron-left': ['fas', 'chevron-left'],
  'chevron-down': ['fas', 'chevron-down'],
  'chevron-up': ['fas', 'chevron-up'],
  xmark: ['fas', 'xmark'],
  close: ['fas', 'xmark'],
};

const resolvedFaIcon = computed<[string, string]>(() => {
  if (Array.isArray(props.name)) {
    return props.name as [string, string];
  }
  if (!props.name) return ['fas', 'desktop'];

  const raw = String(props.name).trim();
  if (FA_MAP[raw]) return FA_MAP[raw];

  const lower = raw.toLowerCase();
  if (FA_MAP[lower]) return FA_MAP[lower];

  // Strip 'fa-' or 'fas fa-' prefixes if present
  let cleanName = lower.replace(/^fa[srbld]?\s+fa-/, '').replace(/^fa-/, '');
  if (FA_MAP[cleanName]) return FA_MAP[cleanName];

  // Fuzzy matches
  if (cleanName.includes('dash') || cleanName.includes('odometer') || cleanName.includes('gauge')) return ['fas', 'gauge-high'];
  if (cleanName.includes('user')) return ['fas', 'user'];
  if (cleanName.includes('role') || cleanName.includes('lock') || cleanName.includes('shield')) return ['fas', 'shield-halved'];
  if (cleanName.includes('plugin') || cleanName.includes('setup') || cleanName.includes('block')) return ['fas', 'cubes'];
  if (cleanName.includes('cpu') || cleanName.includes('config') || cleanName.includes('chip')) return ['fas', 'microchip'];
  if (cleanName.includes('trace') || cleanName.includes('scan') || cleanName.includes('bar')) return ['fas', 'barcode'];
  if (cleanName.includes('chirp') || cleanName.includes('lora') || cleanName.includes('radio') || cleanName.includes('antenna')) return ['fas', 'tower-broadcast'];
  if (cleanName.includes('memmap') || cleanName.includes('layer') || cleanName.includes('collect')) return ['fas', 'layer-group'];
  if (cleanName.includes('data') || cleanName.includes('server')) return ['fas', 'database'];
  if (cleanName.includes('test') || cleanName.includes('flask')) return ['fas', 'flask'];
  if (cleanName.includes('doc') || cleanName.includes('memo') || cleanName.includes('file')) return ['fas', 'file-lines'];
  if (cleanName.includes('sun') || cleanName.includes('light')) return ['fas', 'sun'];
  if (cleanName.includes('moon') || cleanName.includes('dark')) return ['fas', 'moon'];

  // Try direct Font Awesome name if valid kebab-case
  return ['fas', cleanName as any];
});
</script>

<style scoped>
.cyber-icon {
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
