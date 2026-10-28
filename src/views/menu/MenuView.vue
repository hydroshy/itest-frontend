<template>
  <div class="menu-launcher-container">
    <!-- Pending Role Warning Banner for users without roles -->
    <el-alert
      v-if="!authStore.roles.length"
      type="warning"
      show-icon
      :closable="false"
      class="pending-role-alert"
      title="Tài khoản đang chờ phân quyền"
      description="Tài khoản của bạn đã kích hoạt thành công nhưng chưa được gán vai trò chức năng. Bạn có thể nhấn vào biểu tượng Avatar ở góc phải trên để xem hồ sơ hoặc đổi mật khẩu. Vui lòng liên hệ Quản trị viên để được cấp quyền sử dụng các phân hệ."
    />

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
        @click="navigateTo(card)"
      >
        <div class="card-top">
          <div class="card-icon-box" :style="{ backgroundColor: getIconBg(card) }">
            <CyberIcon
              :name="resolveCyberIconName(card)"
              :size="26"
              :color="getIconColor(card)"
            />
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
    title: 'Memmap Manager',
    description: 'Quản lý danh sách profile bản đồ bộ nhớ thiết bị Modbus và payload IEC485.',
    icon: 'Collection',
    route: '/plugins/memmap-manager?tab=manager',
    pluginId: 'memmap-manager',
    tab: 'manager',
    category: 'plugin',
    order: 7,
  },
  {
    id: 'memmap-payload:upload',
    title: 'Memmap Upload',
    description: 'Tải lên và tiền kiểm tra tệp CSV Memmap Payload trước khi lưu trữ.',
    icon: 'Upload',
    route: '/plugins/memmap-manager?tab=upload',
    pluginId: 'memmap-manager',
    tab: 'upload',
    category: 'plugin',
    order: 8,
  },
  {
    id: 'lorawan-chirpstack:integration',
    title: 'LoRaWAN ChirpStack',
    description: 'Đồng bộ thiết bị và cấu hình kết nối ChirpStack Network Server v4.',
    icon: 'Connection',
    route: '/plugins/lorawan-chirpstack',
    pluginId: 'lorawan-chirpstack',
    category: 'plugin',
    order: 9,
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
    const { triggerTransition } = useCtosTransition();
    triggerTransition(card.title, 'LAUNCH_INTERFACE');
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

function resolveCyberIconName(card: MenuCardItem): string {
  const raw = `${card.id} ${card.icon || ''} ${card.title || ''}`.toLowerCase();
  if (raw.includes('dashboard') || raw.includes('odometer') || raw.includes('databoard')) return 'dashboard';
  if (raw.includes('cpu') || raw.includes('final-config') || raw.includes('chip')) return 'cpu';
  if (raw.includes('trace') || raw.includes('tools') || raw.includes('barcode') || raw.includes('scan')) return 'traceability';
  if (raw.includes('chirp') || raw.includes('lora') || raw.includes('radio') || raw.includes('antenna')) return 'chirpstack';
  if (raw.includes('user')) return 'users';
  if (raw.includes('role') || raw.includes('lock') || raw.includes('shield')) return 'roles';
  if (raw.includes('plugin') || raw.includes('setup')) return 'plugins';
  return 'monitor';
}

function getIconBg(card: MenuCardItem): string {
  if (card.id === 'dashboard') return 'rgba(0, 240, 255, 0.15)';
  if (card.id.includes('final-config')) return 'rgba(0, 255, 159, 0.15)';
  if (card.id.includes('device-traceability')) return 'rgba(245, 158, 11, 0.15)';
  if (card.id.includes('chirpstack')) return 'rgba(168, 85, 247, 0.15)';
  return 'rgba(0, 240, 255, 0.12)';
}

function getIconColor(card: MenuCardItem): string {
  if (card.id === 'dashboard') return 'var(--cyber-cyan, #00f0ff)';
  if (card.id.includes('final-config')) return '#00ff9f';
  if (card.id.includes('device-traceability')) return '#fbbf24';
  if (card.id.includes('chirpstack')) return '#c084fc';
  return 'var(--cyber-cyan, #00f0ff)';
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
  background: var(--owl-bg-card, #0b253e) !important;
  border: 1px solid var(--owl-border, #1d3b5a);
  border-radius: var(--cyber-radius-lg, 12px);
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  padding: 22px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.menu-card:hover {
  border-color: var(--owl-teal, #7fdbca);
  background: var(--owl-bg-card-hover, #0f3152) !important;
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4), 0 0 16px var(--owl-teal-dim, rgba(127, 219, 202, 0.15));
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
  border-radius: var(--cyber-radius, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  border: 1px solid var(--owl-border, #1d3b5a);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2);
}

.menu-card:hover .card-icon-box {
  transform: scale(1.06);
  border-color: var(--owl-teal, #7fdbca);
  box-shadow: 0 0 12px var(--owl-teal-dim, rgba(127, 219, 202, 0.2));
}

.card-tag {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--owl-teal, #7fdbca);
  background: var(--owl-teal-dim, rgba(127, 219, 202, 0.12));
  border: 1px solid rgba(127, 219, 202, 0.25);
  padding: 2px 8px;
  border-radius: var(--cyber-radius-xs, 4px);
  letter-spacing: 0.5px;
}

.card-body {
  flex: 1;
  margin-bottom: 18px;
}

.card-title {
  font-family: var(--cyber-font-display, sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--owl-text-bright, #ffffff);
  margin: 0 0 8px 0;
  letter-spacing: 0.3px;
}

.card-desc {
  font-size: 13px;
  color: var(--owl-text-secondary, #7e97b8);
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
  border-top: 1px solid var(--owl-border, #1d3b5a);
  color: var(--owl-teal, #7fdbca);
  font-family: var(--cyber-font-body, sans-serif);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.menu-card:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
