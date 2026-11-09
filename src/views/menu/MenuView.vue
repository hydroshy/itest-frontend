<template>
  <div class="launcher-view flex-1 flex flex-col justify-start w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 pt-2 sm:pt-4 pb-4 select-none min-h-[calc(100vh-4rem)]">
    <!-- Main Content Area: 4-Column x 3-Row Grid -->
    <div class="flex-1 flex flex-col justify-start w-full pt-1 pb-4 sm:pt-2 sm:pb-6">
      <div class="w-full min-w-0 overflow-hidden py-1">
        <transition :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
          <!-- Loading Skeleton Grid -->
          <div
            v-if="loading"
            :key="'loading'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
          >
            <div
              v-for="i in cardsPerPage"
              :key="i"
              class="card bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-2xl p-5 min-h-[180px] flex flex-col justify-between animate-pulse"
            >
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-[var(--owl-bg-surface)]"></div>
                <div class="w-16 h-5 rounded-md bg-[var(--owl-bg-surface)]"></div>
              </div>
              <div class="space-y-2">
                <div class="w-3/4 h-4 rounded bg-[var(--owl-bg-surface)]"></div>
                <div class="w-full h-3 rounded bg-[var(--owl-bg-surface)]/80"></div>
              </div>
              <div class="flex justify-end pt-2 border-t border-[var(--owl-border-light)]">
                <div class="w-16 h-3 rounded bg-[var(--owl-bg-surface)]/80"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredCards.length === 0"
            :key="'empty'"
            class="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[var(--owl-bg-surface)] border border-dashed border-[var(--owl-border)] my-6"
          >
            <div class="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-4 text-2xl">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </div>
            <h3 class="text-base font-bold font-display text-[var(--owl-text-primary)]">Không tìm thấy phân hệ phù hợp</h3>
            <p class="text-xs font-semibold text-[var(--owl-text-secondary)] mt-1.5 max-w-sm leading-relaxed">
              Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chuyển sang bộ lọc danh mục khác.
            </p>
            <button
              type="button"
              class="btn btn-sm mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-none font-bold text-xs"
              @click="resetFilters"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          <!-- Cards Grid: 4 Cột 3 Hàng (12 cards) -->
          <div
            v-else
            :key="currentPage"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
          >
            <MenuCardItem
              v-for="card in paginatedCards"
              :key="card.id"
              :card="card"
              @navigate="navigateTo"
              @contextmenu="handleContextMenu"
            />
          </div>
        </transition>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="!loading && totalPages > 1"
      class="flex flex-wrap items-center justify-between gap-4 py-3 px-4 sm:px-6 bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-2xl"
    >
      <div class="text-xs font-semibold text-[var(--owl-text-secondary)]">
        Trang <span class="font-bold text-[var(--owl-text-primary)] font-mono">{{ currentPage }}</span> / {{ totalPages }}
        (Tổng số {{ filteredCards.length }} phân hệ)
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-xs h-8 px-3 rounded-lg bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] text-[var(--owl-text-primary)] border border-[var(--owl-border)] text-xs font-bold"
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-1" />
          Trước
        </button>

        <div class="join bg-[var(--owl-bg-card)] rounded-lg border border-[var(--owl-border)] p-0.5">
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="btn btn-xs join-item w-8 h-7 text-xs font-bold border-none transition-all"
            :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-transparent text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)]'"
            @click="setPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          class="btn btn-xs h-8 px-3 rounded-lg bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] text-[var(--owl-text-primary)] border border-[var(--owl-border)] text-xs font-bold"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          Sau
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="ml-1" />
        </button>
      </div>
    </div>

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible && contextMenu.card"
        class="fixed z-[9999] min-w-[210px] bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-2xl shadow-xl py-1.5 px-1.5 text-[var(--owl-text-primary)] select-none animate-in fade-in zoom-in-95 duration-100"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
        @click.stop
      >
        <div class="px-3 py-1.5 border-b border-[var(--owl-border-light)] mb-1">
          <div class="text-xs font-bold text-[var(--owl-text-primary)] truncate">{{ contextMenu.card.title }}</div>
          <div class="text-[10px] text-[var(--owl-text-muted)] truncate font-mono">{{ contextMenu.card.pluginId || contextMenu.card.category }}</div>
        </div>
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--owl-text-primary)] hover:bg-blue-600/15 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-left"
          @click="openCardDetails(contextMenu.card)"
        >
          <font-awesome-icon :icon="['fas', 'circle-info']" class="text-blue-500" />
          <span>Hiển thị chi tiết</span>
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
          @click="navigateTo(contextMenu.card); closeContextMenu()"
        >
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-[var(--owl-text-muted)]" />
          <span>Mở phân hệ</span>
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--owl-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
          @click="openInNewTab(contextMenu.card); closeContextMenu()"
        >
          <font-awesome-icon :icon="['fas', 'layer-group']" class="text-[var(--owl-text-muted)]" />
          <span>Mở trong tab mới</span>
        </button>
      </div>
    </Teleport>

    <!-- Detail Modal Modular Component -->
    <MenuDetailModal
      :visible="detailModalVisible"
      :card="detailCard"
      :profiles="finalConfigProfiles"
      :loading="detailModalLoading"
      @close="detailModalVisible = false"
      @open="navigateTo(detailCard); detailModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCtosTransition } from '@/composables/useCtosTransition';
import { httpClient } from '@/api/client';
import MenuCardItem from './components/MenuCardItem.vue';
import MenuDetailModal from './components/MenuDetailModal.vue';

interface MenuCardItemDef {
  id: string;
  title: string;
  description: string;
  icon?: string;
  route?: string;
  path?: string;
  pluginId?: string;
  tab?: string;
  category: 'system' | 'plugin';
  order: number;
}

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedCategory = ref('all');
const loading = ref(false);
const currentPage = ref(1);
const slideDirection = ref<'next' | 'prev'>('next');
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

const defaultStaticCards: MenuCardItemDef[] = [
  {
    id: 'dashboard',
    title: 'Bảng điều khiển',
    description: 'Thống kê tổng quan hệ thống, tiện ích mở rộng và quản trị phân quyền.',
    icon: 'dashboard',
    route: '/dashboard',
    category: 'system',
    order: 1,
  },
  {
    id: 'users',
    title: 'Quản lý Tài khoản',
    description: 'Quản lý người dùng, kích hoạt tài khoản và gán vai trò truy cập.',
    icon: 'users',
    route: '/users',
    category: 'system',
    order: 2,
  },
  {
    id: 'roles',
    title: 'Phân quyền Hệ thống',
    description: 'Thiết lập nhóm vai trò và phân quyền chi tiết cho người dùng.',
    icon: 'roles',
    route: '/roles',
    category: 'system',
    order: 3,
  },
  {
    id: 'plugins',
    title: 'Quản lý Plugin',
    description: 'Xem danh sách plugin đã cài đặt, trạng thái nạp và thông số chẩn đoán.',
    icon: 'plugins',
    route: '/plugins',
    category: 'system',
    order: 4,
  },
  {
    id: 'final-config:tool',
    title: 'Final Config Tool',
    description: 'Nạp cấu hình thiết bị tự động qua Web Serial và kiểm thử 4 công đoạn.',
    icon: 'cpu',
    route: '/plugins/final-config?tab=tool',
    pluginId: 'final-config',
    tab: 'tool',
    category: 'plugin',
    order: 5,
  },
  {
    id: 'final-config:manager',
    title: 'Final Config Manager',
    description: 'Quản lý, tìm kiếm và tra cứu danh sách profile Final Config.',
    icon: 'cpu',
    route: '/plugins/final-config?tab=manager',
    pluginId: 'final-config',
    tab: 'manager',
    category: 'plugin',
    order: 6,
  },
  {
    id: 'final-config:create',
    title: 'Tạo Final Config',
    description: 'Tạo mới cấu hình thiết bị từ Memmap Payload template.',
    icon: 'cpu',
    route: '/plugins/final-config?tab=create',
    pluginId: 'final-config',
    tab: 'create',
    category: 'plugin',
    order: 7,
  },
  {
    id: 'device-traceability:so',
    title: 'Sales Orders & Work Orders',
    description: 'Quản lý cây đơn hàng SO, chỉ thị xuất kho WA và danh sách thiết bị.',
    icon: 'traceability',
    route: '/plugins/device-traceability?tab=so',
    pluginId: 'device-traceability',
    tab: 'so',
    category: 'plugin',
    order: 8,
  },
  {
    id: 'device-traceability:devices',
    title: 'Device Traceability List',
    description: 'Tra cứu danh sách thiết bị, lịch sử kiểm tra và phân bổ đơn hàng.',
    icon: 'traceability',
    route: '/plugins/device-traceability?tab=devices',
    pluginId: 'device-traceability',
    tab: 'devices',
    category: 'plugin',
    order: 9,
  },
  {
    id: 'memmap-payload:main',
    title: 'MEMMAP PAYLOAD',
    description: 'Quản lý danh sách bản đồ bộ nhớ (Memmap) và tải lên bảng thanh ghi thiết bị.',
    icon: 'memmap',
    route: '/plugins/memmap-manager?tab=manager',
    pluginId: 'memmap-manager',
    tab: 'manager',
    category: 'plugin',
    order: 10,
  },
  {
    id: 'decoder:scripts',
    title: 'Bộ giải mã Payload (Decoder)',
    description: 'Quản lý kịch bản giải mã Uplink payload thiết bị IoT, liên kết Item Code và FW Code.',
    icon: 'file-code',
    route: '/plugins/decoder?tab=list',
    pluginId: 'decoder',
    tab: 'list',
    category: 'plugin',
    order: 12,
  },
  {
    id: 'lorawan-chirpstack:integration',
    title: 'ChirpStack Integration',
    description: 'Giám sát trạm Gateway LoRaWAN, thiết bị Node và tích hợp ChirpStack v4.',
    icon: 'chirpstack',
    route: '/plugins/lorawan-chirpstack?tab=integration',
    pluginId: 'lorawan-chirpstack',
    tab: 'integration',
    category: 'plugin',
    order: 13,
  },
  {
    id: 'testing:create-device-testing',
    title: 'Create Device Testing',
    description: 'Tạo mới phiên kiểm thử thiết bị (DUT), gắn kịch bản Flow và kích hoạt Auto Check.',
    icon: 'cpu',
    route: '/plugins/testing?tab=create-device-testing',
    pluginId: 'testing',
    tab: 'create-device-testing',
    category: 'plugin',
    order: 14,
  },
  {
    id: 'testing:device-payload',
    title: 'Device Payload Live Stream',
    description: 'Giám sát trực tiếp dữ liệu thô và payload đã giải mã từ trạm testing.',
    icon: 'activity',
    route: '/plugins/testing?tab=device-payload',
    pluginId: 'testing',
    tab: 'device-payload',
    category: 'plugin',
    order: 15,
  },
  {
    id: 'testing:test-batch',
    title: 'Device Test Batch',
    description: 'Kiểm thử hàng loạt thiết bị LoRaWAN theo Sale Order, giám sát tiến độ và đối soát thiết bị chuẩn.',
    icon: 'boxes',
    route: '/plugins/testing?tab=test-batch',
    pluginId: 'testing',
    tab: 'test-batch',
    category: 'plugin',
    order: 16,
  },
  {
    id: 'testing:create-test-batch',
    title: 'Create Test Batch',
    description: 'Thiết lập cấu hình đợt kiểm thử hàng loạt và gán kịch bản Simulation Flow.',
    icon: 'folder-plus',
    route: '/plugins/testing?tab=create-test-batch',
    pluginId: 'testing',
    tab: 'create-test-batch',
    category: 'plugin',
    order: 17,
  },
  {
    id: 'testing:list-test-batch',
    title: 'LIST TEST BATCH',
    description: 'Tra cứu, theo dõi tiến độ và quản lý lịch sử các đợt kiểm thử hàng loạt.',
    icon: 'list-filter',
    route: '/plugins/testing?tab=list-test-batch',
    pluginId: 'testing',
    tab: 'list-test-batch',
    category: 'plugin',
    order: 18,
  },
];

const cards = ref<MenuCardItemDef[]>([]);

async function initCardsForUser() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/menu/my-cards');
    const myCards = Array.isArray(res) ? res : (res?.data || res?.items || []);
    if (Array.isArray(myCards) && myCards.length > 0) {
      const seen = new Set<string>();
      const list: MenuCardItemDef[] = [];
      for (const c of myCards) {
        const key = (c.route || c.path || c.id || '').toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            id: c.id,
            title: c.title,
            description: c.description || '',
            icon: c.icon || 'desktop',
            route: c.route || c.path,
            pluginId: c.pluginId,
            tab: c.tab,
            category: c.category || 'plugin',
            order: c.order || 99,
          });
        }
      }
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      cards.value = list;
      return;
    }
  } catch (err) {
    console.warn('Could not fetch /menu/my-cards from backend, using fallback:', err);
  } finally {
    loading.value = false;
  }

  // Fallback to deduplicated defaultStaticCards
  const seen = new Set<string>();
  const list: MenuCardItemDef[] = [];
  for (const c of defaultStaticCards) {
    const key = (c.route || c.path || c.id || '').toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      list.push(c);
    }
  }
  cards.value = list;
}

const filteredCards = computed(() => {
  let list = cards.value;
  if (selectedCategory.value !== 'all') {
    list = list.filter((c) => c.category === selectedCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
    );
  }
  return list;
});

const cardsPerPage = computed(() => {
  // 4 cột x 3 hàng = 12 cards cho màn hình desktop
  if (windowWidth.value >= 1024) return 12;
  if (windowWidth.value >= 768) return 9;
  if (windowWidth.value >= 640) return 6;
  return 4;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCards.value.length / cardsPerPage.value));
});

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage.value;
  return filteredCards.value.slice(start, start + cardsPerPage.value);
});

const categoryCounts = computed(() => {
  const all = cards.value.length;
  const system = cards.value.filter((c) => c.category === 'system').length;
  const plugin = cards.value.filter((c) => c.category === 'plugin').length;
  return { all, system, plugin };
});

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  currentPage.value = 1;
}

function setPage(page: number) {
  slideDirection.value = page > currentPage.value ? 'next' : 'prev';
  currentPage.value = page;
}

function prevPage() {
  if (currentPage.value > 1) {
    slideDirection.value = 'prev';
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    slideDirection.value = 'next';
    currentPage.value++;
  }
}

function navigateTo(card: MenuCardItemDef | null) {
  if (!card) return;
  const target = card.route || card.path;
  if (target) {
    const { triggerTransition } = useCtosTransition();
    triggerTransition(card.title, 'LAUNCH_INTERFACE');
    if (target.startsWith('/plugins/')) {
      const separator = target.includes('?') ? '&' : '?';
      router.push(`${target}${separator}from=menu`);
    } else {
      router.push(target);
    }
  }
}

function openInNewTab(card: MenuCardItemDef | null) {
  if (!card) return;
  const target = card.route || card.path;
  if (target) {
    const separator = target.includes('?') ? '&' : '?';
    const url = router.resolve(target.startsWith('/plugins/') ? `${target}${separator}from=menu` : target).href;
    window.open(url, '_blank');
  }
}

// Context Menu
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  card: null as MenuCardItemDef | null,
});

function handleContextMenu(e: MouseEvent, card: MenuCardItemDef) {
  const menuWidth = 220;
  const menuHeight = 160;
  let posX = e.clientX;
  let posY = e.clientY;

  if (posX + menuWidth > window.innerWidth) {
    posX = Math.max(10, window.innerWidth - menuWidth - 10);
  }
  if (posY + menuHeight > window.innerHeight) {
    posY = Math.max(10, window.innerHeight - menuHeight - 10);
  }

  contextMenu.value = {
    visible: true,
    x: posX,
    y: posY,
    card,
  };
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

// Detail Modal
const detailModalVisible = ref(false);
const detailModalLoading = ref(false);
const detailCard = ref<MenuCardItemDef | null>(null);
const finalConfigProfiles = ref<any[]>([]);

async function openCardDetails(card: MenuCardItemDef | null) {
  if (!card) return;
  detailCard.value = card;
  detailModalVisible.value = true;
  closeContextMenu();

  if (card.pluginId === 'final-config' || card.id?.includes('final-config')) {
    detailModalLoading.value = true;
    try {
      const res: any = await httpClient.get('/plugins/final-config/profiles');
      const data = res?.data || res;
      finalConfigProfiles.value = Array.isArray(data) ? data : (data?.data || []);
    } catch {
      finalConfigProfiles.value = [];
    } finally {
      detailModalLoading.value = false;
    }
  }
}

function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  initCardsForUser();
  window.addEventListener('resize', handleResize);
  window.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('click', closeContextMenu);
});
</script>

<style scoped>
.launcher-view {
  font-family: var(--cyber-font-body);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
