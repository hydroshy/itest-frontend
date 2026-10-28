<template>
  <component
    :is="resolvedIcon"
    :size="numericSize"
    :color="color || 'currentColor'"
    :stroke-width="strokeWidth || 1.8"
    class="cyber-icon"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  LayoutGrid,
  Gauge,
  LayoutDashboard,
  Users,
  User,
  ShieldCheck,
  Shield,
  KeyRound,
  Lock,
  Blocks,
  Puzzle,
  Cpu,
  ScanBarcode,
  Scan,
  Radio,
  Wifi,
  Antenna,
  Database,
  Layers,
  FileText,
  FileCode,
  FolderOpen,
  CirclePlus,
  Plus,
  ListOrdered,
  List,
  Upload,
  Link,
  Network,
  Router,
  CheckCircle2,
  Check,
  RefreshCw,
  Bell,
  Settings,
  Sliders,
  Monitor,
  Terminal,
  Wrench,
  Key,
  LogOut,
  Activity,
  Sparkles,
  Server,
  FlaskConical,
  HelpCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ArrowRight,
  Search,
  Boxes,
  Compass,
} from 'lucide-vue-next';

interface Props {
  name?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  name: 'monitor',
  size: 18,
  color: 'currentColor',
  strokeWidth: 1.8,
});

const numericSize = computed(() => {
  const n = Number(props.size);
  return Number.isFinite(n) ? n : 18;
});

// Comprehensive lookup map for system routes, Element Plus icon names, and plugin categories
const ICON_MAP: Record<string, any> = {
  // Shell System routes
  grid: LayoutGrid,
  menu: LayoutGrid,
  launcher: LayoutGrid,
  'app-center': LayoutGrid,
  Grid: LayoutGrid,

  dashboard: Gauge,
  odometer: Gauge,
  gauge: Gauge,
  databoard: Gauge,
  Odometer: Gauge,
  DataBoard: Gauge,
  Platform: Monitor,

  users: Users,
  user: User,
  User: User,
  avatar: User,

  roles: ShieldCheck,
  role: ShieldCheck,
  shield: Shield,
  'shield-check': ShieldCheck,
  lock: Lock,
  Lock: Lock,
  key: KeyRound,
  Key: KeyRound,

  plugins: Blocks,
  plugin: Blocks,
  setup: Blocks,
  SetUp: Blocks,
  puzzle: Puzzle,
  blocks: Blocks,
  boxes: Boxes,

  // Hardware & Config
  cpu: Cpu,
  Cpu: Cpu,
  chip: Cpu,
  microchip: Cpu,
  'final-config': Cpu,
  config: Cpu,

  // Traceability & Barcode
  traceability: ScanBarcode,
  'device-traceability': ScanBarcode,
  scan: ScanBarcode,
  barcode: ScanBarcode,
  search: Search,
  Search: Search,

  // ChirpStack & IoT Wireless
  chirpstack: Radio,
  'lorawan-chirpstack': Radio,
  radio: Radio,
  lora: Radio,
  antenna: Antenna,
  wifi: Wifi,
  Connection: Radio,
  connection: Radio,
  link: Link,
  Link: Link,

  // Memmap & Databases
  memmap: Layers,
  'memmap-payload': Layers,
  'memmap-manager': Layers,
  collection: Layers,
  Collection: Layers,
  database: Database,
  Database: Database,
  server: Server,
  'dis-manager': Database,

  // Documents & Lists
  document: FileText,
  Document: FileText,
  memo: FileText,
  Memo: FileText,
  'file-text': FileText,
  list: ListOrdered,
  List: ListOrdered,

  // Actions & Controls
  'circle-plus': CirclePlus,
  CirclePlus: CirclePlus,
  plus: Plus,
  Plus: Plus,
  upload: Upload,
  Upload: Upload,
  'folder-opened': FolderOpen,
  FolderOpened: FolderOpen,
  check: CheckCircle2,
  Checked: CheckCircle2,
  refresh: RefreshCw,
  Refresh: RefreshCw,
  bell: Bell,
  Bell: Bell,
  settings: Settings,
  Setting: Settings,
  sliders: Sliders,
  Sliders: Sliders,
  monitor: Monitor,
  Monitor: Monitor,
  terminal: Terminal,
  Terminal: Terminal,
  tools: Wrench,
  Tools: Wrench,
  wrench: Wrench,
  logout: LogOut,
  'log-out': LogOut,
  'arrow-right': ArrowRight,
  ArrowRight: ArrowRight,
  'chevron-right': ChevronRight,
  testing: FlaskConical,
  test: FlaskConical,
  alert: AlertTriangle,
  info: Info,
};

const resolvedIcon = computed(() => {
  if (!props.name) return Monitor;
  if (ICON_MAP[props.name]) return ICON_MAP[props.name];

  const lower = props.name.toLowerCase().trim();
  if (ICON_MAP[lower]) return ICON_MAP[lower];

  // Fuzzy match keywords
  if (lower.includes('dash') || lower.includes('odometer')) return Gauge;
  if (lower.includes('user')) return Users;
  if (lower.includes('role') || lower.includes('lock') || lower.includes('shield')) return ShieldCheck;
  if (lower.includes('plugin') || lower.includes('setup') || lower.includes('block')) return Blocks;
  if (lower.includes('cpu') || lower.includes('config') || lower.includes('chip')) return Cpu;
  if (lower.includes('trace') || lower.includes('scan') || lower.includes('bar')) return ScanBarcode;
  if (lower.includes('chirp') || lower.includes('lora') || lower.includes('radio') || lower.includes('antenna')) return Radio;
  if (lower.includes('memmap') || lower.includes('layer') || lower.includes('collect')) return Layers;
  if (lower.includes('dis') || lower.includes('data') || lower.includes('server')) return Database;
  if (lower.includes('test') || lower.includes('flask')) return FlaskConical;
  if (lower.includes('doc') || lower.includes('memo') || lower.includes('file')) return FileText;
  if (lower.includes('folder')) return FolderOpen;
  if (lower.includes('term') || lower.includes('code')) return Terminal;
  if (lower.includes('tool') || lower.includes('wrench')) return Wrench;
  if (lower.includes('set') || lower.includes('slider')) return Settings;
  if (lower.includes('grid') || lower.includes('menu')) return LayoutGrid;

  return Activity;
});
</script>

<style scoped>
.cyber-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}
</style>
