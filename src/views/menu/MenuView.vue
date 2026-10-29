<template>
  <div class="launcher-view flex-1 flex flex-col justify-between w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 py-3 sm:py-5 select-none min-h-[calc(100vh-4rem)]">
    <!-- Top Bar Portal: Search & Category Filters (Teleported to Navbar) -->
    <Teleport to="#layout-navbar-center" v-if="mounted && hasNavbarPortal">
      <div class="flex items-center gap-3 w-full justify-center max-w-2xl">
        <!-- Search bar with daisyUI input flex alignment -->
        <label class="input input-sm h-9 bg-base-300/80 focus-within:bg-base-300 focus-within:border-primary border border-base-content/15 rounded-xl flex items-center gap-2.5 flex-1 max-w-sm px-3 shadow-inner transition-all">
          <CyberIcon
            name="search"
            :size="15"
            class="text-base-content/50 shrink-0 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm phân hệ..."
            class="grow bg-transparent text-xs text-base-content placeholder:text-base-content/40 focus:outline-none min-w-0"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 text-base-content/40 hover:text-base-content shrink-0"
            title="Xóa tìm kiếm"
          >
            ✕
          </button>
        </label>

        <!-- Category tabs -->
        <div class="join bg-base-300/80 p-0.5 rounded-xl border border-base-content/15 shrink-0 shadow-inner h-9 items-center flex">
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'all' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
            @click="setCategory('all')"
          >
            Tất cả
          </button>
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'system' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
            @click="setCategory('system')"
          >
            Hệ thống
          </button>
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'plugin' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
            @click="setCategory('plugin')"
          >
            Plugin
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Standalone Fallback: Render search & filters inside page if navbar portal is absent -->
    <div
      v-if="mounted && !hasNavbarPortal"
      class="flex flex-wrap items-center justify-between gap-3 mb-4 bg-base-200/60 p-3 rounded-2xl border border-base-content/10 shadow-sm"
    >
      <label class="input input-sm h-9 bg-base-300/80 focus-within:bg-base-300 focus-within:border-primary border border-base-content/15 rounded-xl flex items-center gap-2.5 flex-1 min-w-[220px] max-w-sm px-3 shadow-inner transition-all">
        <CyberIcon
          name="search"
          :size="15"
          class="text-base-content/50 shrink-0 pointer-events-none"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm phân hệ..."
          class="grow bg-transparent text-xs text-base-content placeholder:text-base-content/40 focus:outline-none min-w-0"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 text-base-content/40 hover:text-base-content shrink-0"
        >
          ✕
        </button>
      </label>

      <div class="join bg-base-300/80 p-0.5 rounded-xl border border-base-content/15 shrink-0 shadow-inner h-9 items-center flex">
        <button
          class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
          :class="selectedCategory === 'all' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
          @click="setCategory('all')"
        >
          Tất cả
        </button>
        <button
          class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
          :class="selectedCategory === 'system' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
          @click="setCategory('system')"
        >
          Hệ thống
        </button>
        <button
          class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
          :class="selectedCategory === 'plugin' ? 'btn-primary font-semibold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
          @click="setCategory('plugin')"
        >
          Plugin
        </button>
      </div>
    </div>

    <!-- Main Content Area: 2-Row Grid -->
    <div class="flex-1 flex items-center justify-center my-auto w-full py-4 sm:py-6">
      <!-- Cards Viewport Container (Horizontal Transition between pages) -->
      <div class="w-full min-w-0 overflow-hidden py-1">
          <transition :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
            <!-- Loading Skeleton Grid -->
            <div
              v-if="loading"
              :key="'loading'"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
            >
              <div
                v-for="i in cardsPerPage"
                :key="i"
                class="card bg-base-200 border border-base-content/20 rounded-2xl p-5 min-h-[180px] flex flex-col justify-between animate-pulse"
              >
                <div class="flex items-center justify-between">
                  <div class="w-10 h-10 rounded-xl bg-base-300"></div>
                  <div class="w-16 h-5 rounded-md bg-base-300"></div>
                </div>
                <div class="space-y-2">
                  <div class="w-3/4 h-4 rounded bg-base-300"></div>
                  <div class="w-full h-3 rounded bg-base-300/80"></div>
                </div>
                <div class="w-1/2 h-3 rounded bg-base-300/80 pt-2 border-t border-base-content/15"></div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="filteredCards.length === 0"
              :key="'empty'"
              class="flex flex-col items-center justify-center py-16 text-center w-full"
            >
              <div class="w-14 h-14 rounded-2xl bg-base-300 border border-base-content/10 flex items-center justify-center mb-3 text-base-content/40 shadow-inner">
                <CyberIcon name="search" :size="24" />
              </div>
              <p class="text-sm font-semibold text-base-content">Không tìm thấy phân hệ nào</p>
              <p class="text-xs text-base-content/50 mt-1 max-w-sm">
                Không có thẻ chức năng nào khớp với bộ lọc "{{ searchQuery || selectedCategory }}".
              </p>
              <button
                v-if="searchQuery || selectedCategory !== 'all'"
                @click="resetFilters"
                class="btn btn-primary btn-xs mt-4 rounded-lg font-semibold text-base-100 shadow-sm"
              >
                Xóa bộ lọc
              </button>
            </div>

            <!-- 2-Row Menu Cards Grid -->
            <div
              v-else
              :key="currentPage"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
            >
              <div
                v-for="card in paginatedCards"
                :key="card.id"
                class="card bg-base-200 hover:bg-base-200/90 border border-base-content/25 hover:border-primary/60 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[185px]"
                @click="navigateTo(card)"
              >
                <!-- Top Row: Icon + Category Badge -->
                <div class="flex items-center justify-between">
                  <div
                    class="w-11 h-11 rounded-xl bg-base-300 border border-base-content/15 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200 shadow-inner"
                  >
                    <CyberIcon
                      :name="resolveCyberIconName(card)"
                      :size="22"
                      class="text-primary group-hover:text-primary transition-colors"
                    />
                  </div>
                  <span
                    class="badge badge-sm font-mono tracking-wider font-semibold"
                    :class="card.category === 'system' ? 'badge-info badge-outline' : 'badge-ghost border-base-content/20 text-base-content/70'"
                  >
                    {{ card.category === 'system' ? 'SYSTEM' : 'PLUGIN' }}
                  </span>
                </div>

                <!-- Middle Content: Title + Description -->
                <div class="space-y-1.5 my-2">
                  <h3 class="text-sm font-semibold text-base-content group-hover:text-primary transition-colors tracking-wide line-clamp-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
                    {{ card.description || 'Truy cập phân hệ chức năng hệ thống.' }}
                  </p>
                </div>

                <!-- Bottom Action Row: Direct Link Indication -->
                <div class="pt-3 border-t border-base-content/15 flex items-center justify-between text-xs font-medium text-base-content/60 group-hover:text-primary transition-colors">
                  <span class="tracking-wide text-[11px]">Mở phân hệ</span>
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-base-content/40 group-hover:text-primary/70 uppercase font-mono tracking-wider">Khởi chạy</span>
                    <CyberIcon
                      name="chevron-right"
                      :size="14"
                      class="transform group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </div>
        </transition>
      </div>
    </div>

    <!-- Bottom Pagination Footer: Information & Indicators -->
    <div
      v-if="filteredCards.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-base-content/10 w-full text-xs text-base-content/60 shrink-0"
    >
      <!-- Count summary -->
      <div class="flex items-center gap-2">
        <span>
          Hiển thị
          <span class="font-semibold text-base-content">{{ paginationInfo.start }}</span>
          -
          <span class="font-semibold text-base-content">{{ paginationInfo.end }}</span>
          trong tổng số
          <span class="font-semibold text-base-content">{{ filteredCards.length }}</span>
          phân hệ
        </span>
        <span v-if="totalPages > 1" class="hidden sm:inline text-base-content/30">•</span>
        <span v-if="totalPages > 1" class="hidden sm:inline text-[11px] text-base-content/40">
          (Dùng phím ← / → để chuyển trang nhanh)
        </span>
      </div>

      <!-- Pagination Controls & Indicators -->
      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <button
          class="btn btn-xs btn-ghost gap-1 font-normal text-base-content/70 hover:text-base-content"
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          <CyberIcon name="chevron-left" :size="13" />
          <span>Trước</span>
        </button>

        <!-- Page Number Buttons -->
        <div class="join bg-base-300/80 p-0.5 rounded-lg border border-base-content/15">
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn btn-xs join-item rounded-md transition-all font-mono"
            :class="currentPage === page ? 'btn-primary font-bold text-base-100 shadow-sm' : 'btn-ghost text-base-content/70 hover:text-base-content'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="btn btn-xs btn-ghost gap-1 font-normal text-base-content/70 hover:text-base-content"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          <span>Sau</span>
          <CyberIcon name="chevron-right" :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import CyberIcon from '@/components/shared/CyberIcon.vue';
import { httpClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useCtosTransition } from '@/composables/useCtosTransition';

export interface MenuCardItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  route?: string;
  path?: string;
  pluginId?: string;
  category?: string;
  tab?: string;
  order?: number;
}

const router = useRouter();
const authStore = useAuthStore();

const mounted = ref(false);
const hasNavbarPortal = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');
const cards = ref<MenuCardItem[]>([]);
const currentPage = ref(1);
const slideDirection = ref<'next' | 'prev'>('next');
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);

// Fallback static items based on standard requirements
const defaultStaticCards: MenuCardItem[] = [
  {
    id: 'dashboard',
    title: 'Bảng điều khiển',
    description: 'Tổng quan hệ thống, trạng thái dịch vụ và phân quyền quản trị menu.',
    icon: 'dashboard',
    route: '/dashboard',
    category: 'system',
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
  },
  {
    id: 'device-traceability:devices',
    title: 'Device Traceability List',
    description: 'Tra cứu dòng đời thiết bị, lịch sử test và trạng thái final config.',
    icon: 'traceability',
    route: '/plugins/device-traceability?tab=devices',
    pluginId: 'device-traceability',
    tab: 'devices',
    category: 'plugin',
    order: 6,
  },
  {
    id: 'memmap-payload:manager',
    title: 'Memmap Manager',
    description: 'Quản lý danh sách profile bản đồ bộ nhớ thiết bị Modbus và payload IEC485.',
    icon: 'tools',
    route: '/plugins/memmap-payload?tab=manager',
    pluginId: 'memmap-payload',
    tab: 'manager',
    category: 'plugin',
    order: 7,
  },
  {
    id: 'memmap-payload:upload',
    title: 'Import & Validation Memmap',
    description: 'Tải lên bảng thanh ghi Excel/JSON và kiểm thử cú pháp bản đồ bộ nhớ.',
    icon: 'tools',
    route: '/plugins/memmap-payload?tab=upload',
    pluginId: 'memmap-payload',
    tab: 'upload',
    category: 'plugin',
    order: 8,
  },
  {
    id: 'dis-manager:dashboard',
    title: 'DIS Manager',
    description: 'Bảng điều khiển đồng bộ và quản lý dữ liệu DIS phân tán.',
    icon: 'dashboard',
    route: '/plugins/dis-manager?tab=dashboard',
    pluginId: 'dis-manager',
    tab: 'dashboard',
    category: 'plugin',
    order: 9,
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
    order: 10,
  },
];

// Responsive calculation of cards per page to maintain strictly 2 rows
const cardsPerPage = computed(() => {
  if (windowWidth.value >= 1280) return 8; // 4 columns x 2 rows
  if (windowWidth.value >= 1024) return 6; // 3 columns x 2 rows
  if (windowWidth.value >= 640) return 4;  // 2 columns x 2 rows
  return 4;                               // Mobile 2x2 or 2x1
});

async function fetchMenuCards() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/menu/my-cards');
    const items = res?.data || res?.items || res;
    if (Array.isArray(items)) {
      cards.value = items.map((item: any) => ({
        ...item,
        path: item.route || item.path,
      }));
      return;
    }
  } catch (err) {
    console.warn('Backend /api/menu/my-cards request failed:', err);
  } finally {
    loading.value = false;
  }

  // Fallback phòng vệ (chỉ dùng khi API gặp sự cố mạng hoặc lỗi kết nối)
  const userRoles = authStore.roles.map((r: string) => r.toUpperCase());
  const isAdmin =
    userRoles.includes('ADMIN') ||
    userRoles.includes('SUPER_ADMIN') ||
    userRoles.includes('ADMINISTRATOR');

  if (isAdmin) {
    cards.value = [...defaultStaticCards];
  } else if (userRoles.includes('OPERATOR')) {
    cards.value = defaultStaticCards.filter((card) => {
      return (
        card.id === 'final-config:tool' ||
        card.id === 'device-traceability:devices' ||
        card.id === 'lorawan-chirpstack:integration'
      );
    });
  } else if (userRoles.includes('END_USER')) {
    cards.value = defaultStaticCards.filter((card) => {
      return card.id === 'final-config:tool';
    });
  } else {
    cards.value = [];
  }
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

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCards.value.length / cardsPerPage.value));
});

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage.value;
  return filteredCards.value.slice(start, start + cardsPerPage.value);
});

const paginationInfo = computed(() => {
  if (filteredCards.value.length === 0) {
    return { start: 0, end: 0 };
  }
  const start = (currentPage.value - 1) * cardsPerPage.value + 1;
  const end = Math.min(currentPage.value * cardsPerPage.value, filteredCards.value.length);
  return { start, end };
});

function setCategory(category: string) {
  selectedCategory.value = category;
  currentPage.value = 1;
}

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  currentPage.value = 1;
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

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    slideDirection.value = page > currentPage.value ? 'next' : 'prev';
    currentPage.value = page;
  }
}

// Reset page to 1 when filters or screen width change
watch([searchQuery, selectedCategory, cardsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
});

function navigateTo(card: MenuCardItem) {
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

function resolveCyberIconName(card: MenuCardItem): string {
  const raw = `${card.id} ${card.icon || ''} ${card.title || ''}`.toLowerCase();
  if (raw.includes('dashboard') || raw.includes('odometer') || raw.includes('databoard')) return 'dashboard';
  if (raw.includes('cpu') || raw.includes('final-config') || raw.includes('chip')) return 'cpu';
  if (raw.includes('trace') || raw.includes('tools') || raw.includes('barcode') || raw.includes('scan') || raw.includes('so')) return 'traceability';
  if (raw.includes('chirp') || raw.includes('lora') || raw.includes('radio') || raw.includes('antenna')) return 'chirpstack';
  if (raw.includes('user')) return 'users';
  if (raw.includes('role') || raw.includes('lock') || raw.includes('shield')) return 'roles';
  if (raw.includes('plugin') || raw.includes('setup')) return 'plugins';
  return 'tools';
}

function handleResize() {
  windowWidth.value = window.innerWidth;
}

function handleKeyDown(e: KeyboardEvent) {
  // Ignore keyboard shortcuts if user is typing in an input
  const activeTag = (document.activeElement?.tagName || '').toLowerCase();
  if (activeTag === 'input' || activeTag === 'textarea') {
    return;
  }
  if (e.key === 'ArrowLeft') {
    prevPage();
  } else if (e.key === 'ArrowRight') {
    nextPage();
  }
}

onMounted(() => {
  mounted.value = true;
  hasNavbarPortal.value = !!document.getElementById('layout-navbar-center');
  fetchMenuCards();
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Slide horizontal page transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
