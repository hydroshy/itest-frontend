<template>
  <div class="menu-launcher-container">
    <!-- Header Greeting & Search -->
    <div class="launcher-header">
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm nhanh tính năng, công cụ..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-button :icon="Refresh" circle :loading="loading" @click="fetchMenuCards" title="Làm mới" />
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="category-bar">
      <el-radio-group v-model="selectedCategory" size="default">
        <el-radio-button label="all">Tất cả ({{ filteredCards.length }})</el-radio-button>
        <el-radio-button v-for="cat in categories" :key="cat" :label="cat">
          {{ cat }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- Loading Skeleton -->
    <el-skeleton v-if="loading && cards.length === 0" :rows="6" animated class="loading-skeleton" />

    <!-- Empty State -->
    <el-empty
      v-else-if="filteredCards.length === 0"
      description="Không tìm thấy tính năng nào phù hợp với quyền hạn hoặc từ khóa tìm kiếm."
    />

    <!-- Cards Grid -->
    <div v-else class="cards-grid">
      <div
        v-for="card in filteredCards"
        :key="card.id"
        class="menu-card"
        :class="{ 'card-highlight': card.id === 'dashboard' }"
        data-augmented-ui="tl-clip br-clip border"
        @click="navigateTo(card)"
      >
        <div class="card-top">
          <div class="card-icon-box" :style="{ backgroundColor: getIconBg(card) }">
            <el-icon :size="24" :color="getIconColor(card)">
              <component :is="getIconComponent(card.icon)" />
            </el-icon>
          </div>
          <span v-if="card.category" class="card-tag">{{ card.category }}</span>
        </div>

        <div class="card-body">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-desc">{{ card.description || 'Truy cập tính năng này trong hệ thống.' }}</p>
        </div>

        <div class="card-footer">
          <span class="action-text">Truy cập</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Refresh, ArrowRight } from '@element-plus/icons-vue';
import { httpClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth';

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

const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');
const cards = ref<MenuCardItem[]>([]);

// Fallback static items based on standard requirements
const defaultStaticCards: MenuCardItem[] = [
  {
    id: 'dashboard',
    title: 'Bảng điều khiển',
    description: 'Tổng quan hệ thống, trạng thái dịch vụ và phân quyền quản trị menu.',
    icon: 'Odometer',
    route: '/dashboard',
    category: 'system',
    order: 1,
  },
  {
    id: 'final-config:tool',
    title: 'Final Config Tool',
    description: 'Nạp cấu hình thiết bị tự động qua Web Serial và kiểm thử 4 công đoạn.',
    icon: 'Cpu',
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
    icon: 'Document',
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
    icon: 'CirclePlus',
    route: '/plugins/final-config?tab=create',
    pluginId: 'final-config',
    tab: 'create',
    category: 'plugin',
    order: 4,
  },
  {
    id: 'device-traceability:so',
    title: 'Sales Orders & Work Authorizations',
    description: 'Quản lý cây đơn hàng SO, chỉ thị xuất kho WA và danh sách thiết bị.',
    icon: 'List',
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
    icon: 'SetUp',
    route: '/plugins/device-traceability?tab=devices',
    pluginId: 'device-traceability',
    tab: 'devices',
    category: 'plugin',
    order: 6,
  },
  {
    id: 'memmap-payload:manager',
    title: 'Memmap Profiles',
    description: 'Quản lý template thanh ghi Modbus định hình payload thiết bị.',
    icon: 'Collection',
    route: '/plugins/memmap-payload',
    pluginId: 'memmap-payload',
    category: 'plugin',
    order: 7,
  },
  {
    id: 'lorawan-chirpstack:integration',
    title: 'LoRaWAN ChirpStack',
    description: 'Đồng bộ thiết bị và cấu hình kết nối ChirpStack Network Server v4.',
    icon: 'Connection',
    route: '/plugins/lorawan-chirpstack',
    pluginId: 'lorawan-chirpstack',
    category: 'plugin',
    order: 8,
  },
];

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
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMINISTRATOR');

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
    // Không có role hoặc role không được cấp phép: tuyệt đối không hiển thị card trái phép
    cards.value = [];
  }
}

const categories = computed(() => {
  const set = new Set<string>();
  cards.value.forEach((c) => {
    if (c.category) set.add(c.category);
  });
  return Array.from(set);
});

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

function navigateTo(card: MenuCardItem) {
  const target = card.route || card.path;
  if (target) {
    // Nếu điều hướng vào plugin từ /menu, đánh dấu viewMode=standalone hoặc from=menu
    // để giao diện plugin chạy ở chế độ thao tác trực tiếp (không hiện sidebar)
    if (target.startsWith('/plugins/')) {
      const separator = target.includes('?') ? '&' : '?';
      router.push(`${target}${separator}from=menu`);
    } else {
      router.push(target);
    }
  }
}

function getIconComponent(iconName?: string) {
  if (iconName === 'DataBoard') return 'Odometer';
  return iconName || 'SetUp';
}

function getIconBg(card: MenuCardItem): string {
  if (card.id === 'dashboard') return 'rgba(64, 158, 255, 0.12)';
  if (card.id.includes('final-config')) return 'rgba(103, 194, 58, 0.12)';
  if (card.id.includes('device-traceability')) return 'rgba(230, 162, 60, 0.12)';
  if (card.id.includes('chirpstack')) return 'rgba(142, 68, 173, 0.12)';
  return 'rgba(64, 158, 255, 0.1)';
}

function getIconColor(card: MenuCardItem): string {
  if (card.id === 'dashboard') return '#409EFF';
  if (card.id.includes('final-config')) return '#67C23A';
  if (card.id.includes('device-traceability')) return '#E6A23C';
  if (card.id.includes('chirpstack')) return '#8E44AD';
  return '#409EFF';
}

onMounted(() => {
  fetchMenuCards();
});
</script>

<style scoped>
.menu-launcher-container {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.launcher-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 320px;
}

.category-bar {
  margin-bottom: 24px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.menu-card {
  --aug-border-all: 1px;
  --aug-border-bg: rgba(0, 240, 255, 0.2);
  --aug-tl: 12px;
  --aug-br: 12px;
  background: rgba(13, 20, 36, 0.65) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  padding: 22px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.menu-card:hover {
  --aug-border-bg: #00f0ff;
  background: rgba(18, 27, 48, 0.85) !important;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 18px rgba(0, 240, 255, 0.25);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-card:hover .card-icon-box {
  transform: scale(1.08);
  border-color: rgba(0, 240, 255, 0.4);
}

.card-tag {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--cyber-cyan, #00f0ff);
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.25);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.card-body {
  flex: 1;
  margin-bottom: 18px;
}

.card-title {
  font-family: var(--cyber-font-display, sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.card-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--cyber-cyan, #00f0ff);
  font-family: var(--cyber-font-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.menu-card:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
