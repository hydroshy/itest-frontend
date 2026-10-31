<template>
  <div class="launcher-view flex-1 flex flex-col justify-start w-full max-w-[1720px] mx-auto px-4 sm:px-8 xl:px-12 pt-2 sm:pt-4 pb-4 select-none min-h-[calc(100vh-4rem)]">
    <!-- Header Banner: Title, Subtitle, Search & Category Filters -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 mb-3 bg-[#151d2c] border border-white/10 rounded-3xl shadow-none">
      <div>
        <h2 class="text-xl font-bold font-display text-[#f8fafc] tracking-wide flex items-center gap-2.5">
          <CyberIcon name="grid" :size="22" class="text-violet-400" />
          <span>Menu Ứng Dụng & Phân Hệ</span>
        </h2>
        <p class="text-xs sm:text-sm text-[#94a3b8] mt-1">
          Khởi chạy các tiện ích kiểm thử, cấu hình thiết bị và công cụ vận hành hệ thống ITEST
        </p>
      </div>

      <!-- Search & Category Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search bar with refined smooth Memphis style -->
        <div class="relative flex items-center min-w-[200px] max-w-xs group">
          <CyberIcon
            name="search"
            :size="14"
            class="absolute left-3 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm phân hệ..."
            class="w-full h-9 pl-9 pr-8 bg-[#1a2436] hover:bg-[#202c42] focus:bg-[#202c42] text-xs text-slate-200 placeholder:text-slate-400/60 placeholder:italic placeholder:font-light rounded-xl border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 shadow-none transition-all outline-none"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2.5 text-slate-400 hover:text-slate-200 text-xs transition-colors p-0.5 rounded-full"
            title="Xóa tìm kiếm"
          >
            ✕
          </button>
        </div>

        <!-- Category tabs -->
        <div class="join bg-[#1a2436] p-0.5 rounded-xl border border-white/10 shrink-0 shadow-none h-9 items-center flex">
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'all' ? 'bg-violet-600 text-white font-semibold shadow-none border-none' : 'btn-ghost text-slate-400 hover:text-white'"
            @click="setCategory('all')"
          >
            Tất cả
          </button>
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'system' ? 'bg-violet-600 text-white font-semibold shadow-none border-none' : 'btn-ghost text-slate-400 hover:text-white'"
            @click="setCategory('system')"
          >
            Hệ thống
          </button>
          <button
            class="btn btn-xs h-7 min-h-0 join-item rounded-lg transition-all px-3"
            :class="selectedCategory === 'plugin' ? 'bg-violet-600 text-white font-semibold shadow-none border-none' : 'btn-ghost text-slate-400 hover:text-white'"
            @click="setCategory('plugin')"
          >
            Plugin
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area: 2-Row Grid -->
    <div class="flex-1 flex flex-col justify-start w-full pt-1 pb-4 sm:pt-2 sm:pb-6">
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
                class="card bg-[#1a2436] border border-white/10 rounded-2xl p-5 min-h-[180px] flex flex-col justify-between animate-pulse shadow-none"
              >
                <div class="flex items-center justify-between">
                  <div class="w-10 h-10 rounded-xl bg-[#202c42]"></div>
                  <div class="w-16 h-5 rounded-md bg-[#202c42]"></div>
                </div>
                <div class="space-y-2">
                  <div class="w-3/4 h-4 rounded bg-[#202c42]"></div>
                  <div class="w-full h-3 rounded bg-[#202c42]/80"></div>
                </div>
                <div class="w-1/2 h-3 rounded bg-[#202c42]/80 pt-2 border-t border-white/10"></div>
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
                class="card bg-[#1a2436] hover:bg-[#202c42] border border-white/10 hover:border-violet-500/40 rounded-2xl p-5 sm:p-6 shadow-none transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[185px]"
                @click="navigateTo(card)"
                @contextmenu.prevent="handleContextMenu($event, card)"
              >
                <!-- Top Row: Icon + Category Badge -->
                <div class="flex items-center justify-between">
                  <div
                    class="w-11 h-11 rounded-xl bg-[#151d2c] border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-violet-500/40 group-hover:bg-violet-500/15 transition-all duration-200 shadow-none"
                  >
                    <CyberIcon
                      :name="resolveCyberIconName(card)"
                      :size="22"
                      class="text-violet-400 group-hover:text-violet-300 transition-colors"
                    />
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
                      title="Tùy chọn & chi tiết"
                      @click.stop="handleContextMenu($event, card)"
                    >
                      <MoreVertical :size="14" />
                    </button>
                    <span
                      class="badge badge-sm font-mono tracking-wider font-semibold"
                      :class="card.category === 'system' ? 'badge-info badge-outline border-sky-500/30 text-sky-400' : 'badge-ghost border-white/10 text-slate-400'"
                    >
                      {{ card.category === 'system' ? 'SYSTEM' : 'PLUGIN' }}
                    </span>
                  </div>
                </div>

                <!-- Middle Content: Title + Description -->
                <div class="space-y-1.5 my-2">
                  <h3 class="text-sm font-semibold text-slate-100 group-hover:text-violet-300 transition-colors tracking-wide line-clamp-1">
                    {{ card.title }}
                  </h3>
                  <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {{ card.description || 'Truy cập phân hệ chức năng hệ thống.' }}
                  </p>
                </div>

                <!-- Bottom Action Row: Direct Link Indication -->
                <div class="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-violet-400 transition-colors">
                  <span class="tracking-wide text-[11px]">Mở phân hệ</span>
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-base-content/40 group-hover:text-violet-400/80 uppercase font-mono tracking-wider">Khởi chạy</span>
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

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible && contextMenu.card"
        class="fixed z-[9999] min-w-[210px] bg-[#151d2c] border border-white/10 rounded-2xl shadow-none py-1.5 px-1.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
        @click.stop
      >
        <div class="px-3 py-1.5 border-b border-white/10 mb-1">
          <div class="text-xs font-semibold text-slate-100 truncate">{{ contextMenu.card.title }}</div>
          <div class="text-[10px] text-slate-400 truncate font-mono">{{ contextMenu.card.pluginId || contextMenu.card.category }}</div>
        </div>
        <button
          @click="openCardDetails(contextMenu.card)"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-violet-500/15 hover:text-violet-300 rounded-lg transition-colors text-left"
        >
          <Info :size="14" class="text-violet-400" />
          <span>Hiển thị chi tiết</span>
        </button>
        <button
          @click="navigateTo(contextMenu.card); closeContextMenu()"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-lg transition-colors text-left"
        >
          <ExternalLink :size="14" class="text-slate-400" />
          <span>Mở phân hệ</span>
        </button>
        <button
          @click="openInNewTab(contextMenu.card); closeContextMenu()"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 rounded-lg transition-colors text-left"
        >
          <Layers :size="14" class="text-slate-400" />
          <span>Mở trong tab mới</span>
        </button>
      </div>
    </Teleport>

    <!-- Modal Chi Tiết Phân Hệ (Đặc biệt Final Config) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="detailModalVisible && detailCard"
          class="modal modal-open fixed inset-0 z-[9998] flex items-center justify-center p-4"
        >
          <div class="modal-box max-w-2xl bg-[#151d2c] border border-white/10 rounded-3xl shadow-none p-6 text-slate-200 max-h-[85vh] flex flex-col relative z-10">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <CyberIcon :name="resolveCyberIconName(detailCard)" :size="22" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                  {{ detailCard.title }}
                  <span class="badge badge-sm badge-outline font-mono text-[10px] border-white/20 text-slate-300">
                    {{ detailCard.pluginId || detailCard.category }}
                  </span>
                </h3>
                <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">{{ detailCard.description }}</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-slate-100" @click="detailModalVisible = false">✕</button>
          </div>

          <!-- Body -->
          <div class="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div class="p-2.5 rounded-xl bg-[#1a2436] border border-white/10">
                <div class="text-[10px] text-slate-400 uppercase font-mono">Đường dẫn Route</div>
                <div class="font-mono font-semibold text-slate-200 mt-0.5 truncate">{{ detailCard.route || detailCard.path || 'N/A' }}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-[#1a2436] border border-white/10">
                <div class="text-[10px] text-slate-400 uppercase font-mono">Phân loại</div>
                <div class="font-semibold text-slate-200 mt-0.5 capitalize">{{ detailCard.category || 'Plugin' }}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-[#1a2436] border border-white/10">
                <div class="text-[10px] text-slate-400 uppercase font-mono">Trạng thái Adapter</div>
                <div class="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>

            <!-- Specific Detail section for Final Config -->
            <div v-if="detailCard.pluginId === 'final-config' || detailCard.id?.includes('final-config')" class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CyberIcon name="cpu" :size="14" class="text-violet-400" />
                  <span>Danh sách Profile Final Config ({{ finalConfigProfiles.length }})</span>
                </h4>
                <span v-if="detailModalLoading" class="loading loading-spinner loading-xs text-violet-400"></span>
              </div>

              <div v-if="detailModalLoading" class="py-8 text-center text-xs text-slate-400">
                Đang tải dữ liệu cấu hình Final Config...
              </div>

              <div v-else-if="finalConfigProfiles.length === 0" class="py-6 text-center text-xs text-slate-400 bg-[#1a2436]/50 rounded-xl border border-dashed border-white/10">
                Chưa có profile Final Config nào được lưu trong hệ thống.
              </div>

              <div v-else class="border border-white/10 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table class="table table-xs w-full bg-[#1a2436]/60">
                  <thead class="bg-[#1a2436] text-[11px] text-slate-300 sticky top-0">
                    <tr>
                      <th>Mã SO</th>
                      <th>Item Code</th>
                      <th>SKU</th>
                      <th>Kết nối</th>
                      <th>Thanh ghi</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody class="text-xs font-mono">
                    <tr v-for="prof in finalConfigProfiles" :key="prof.id" class="hover:bg-[#202c42] transition-colors">
                      <td class="font-bold text-violet-400">{{ prof.soNumber || '-' }}</td>
                      <td class="text-slate-200">{{ prof.itemCode || '-' }}</td>
                      <td class="text-slate-300">{{ prof.sku || '-' }}</td>
                      <td><span class="badge badge-xs badge-info badge-outline border-sky-500/30 text-sky-400">{{ prof.connectivity || 'RS485' }}</span></td>
                      <td class="text-center font-bold text-amber-400">{{ prof.registersCount || 0 }}</td>
                      <td>
                        <span class="badge badge-xs" :class="prof.status === 'ACTIVE' || prof.status === 'active' ? 'badge-success' : 'badge-ghost'">
                          {{ prof.status || 'Active' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detail for other plugins -->
            <div v-else class="p-4 rounded-xl bg-[#1a2436] border border-white/10 text-xs space-y-2">
              <div class="text-slate-300 font-semibold">Thông tin mô tả:</div>
              <p class="text-slate-400 leading-relaxed">{{ detailCard.description || 'Phân hệ chức năng trong hệ thống ITEST.' }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <button class="btn btn-sm btn-ghost text-xs text-slate-400 hover:text-slate-100" @click="detailModalVisible = false">
              Đóng
            </button>
            <button class="btn btn-sm btn-primary text-xs gap-1.5" @click="navigateTo(detailCard); detailModalVisible = false">
              <ExternalLink :size="13" />
              <span>Đi tới phân hệ này</span>
            </button>
          </div>
        </div>
          <div class="modal-backdrop" @click.stop.prevent></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MoreVertical, Info, ExternalLink, Layers } from 'lucide-vue-next';
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
const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');

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
    id: 'users',
    title: 'Quản lý Người dùng',
    description: 'Quản lý danh sách người dùng, kích hoạt tài khoản và gán vai trò.',
    icon: 'users',
    route: '/users',
    category: 'system',
    order: 2,
  },
  {
    id: 'roles',
    title: 'Quản lý Phân quyền',
    description: 'Thiết lập nhóm vai trò và quyền hạn chi tiết trong hệ thống.',
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
    description: 'Tra cứu dòng đời thiết bị, lịch sử test và trạng thái final config.',
    icon: 'traceability',
    route: '/plugins/device-traceability?tab=devices',
    pluginId: 'device-traceability',
    tab: 'devices',
    category: 'plugin',
    order: 9,
  },
  {
    id: 'memmap-manager:manager',
    title: 'Memmap Manager',
    description: 'Quản lý danh sách profile bản đồ bộ nhớ thiết bị Modbus và payload IEC485.',
    icon: 'memmap',
    route: '/plugins/memmap-manager?tab=manager',
    pluginId: 'memmap-manager',
    tab: 'manager',
    category: 'plugin',
    order: 10,
  },
  {
    id: 'memmap-manager:upload',
    title: 'Import & Validation Memmap',
    description: 'Tải lên bảng thanh ghi Excel/JSON và kiểm thử cú pháp bản đồ bộ nhớ.',
    icon: 'upload',
    route: '/plugins/memmap-manager?tab=upload',
    pluginId: 'memmap-manager',
    tab: 'upload',
    category: 'plugin',
    order: 11,
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
];

const cards = ref<MenuCardItem[]>([...defaultStaticCards]);
const currentPage = ref(1);
const slideDirection = ref<'next' | 'prev'>('next');
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);

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
    const items = Array.isArray(res) ? res : (res?.data || res?.items);
    if (Array.isArray(items) && items.length > 0) {
      cards.value = items.map((item: any) => ({
        ...item,
        path: item.route || item.path,
      }));
      return;
    }
  } catch (err) {
    console.warn('Backend /api/v1/menu/my-cards request failed:', err);
  } finally {
    loading.value = false;
  }

  // Fallback an toàn khi API trả về rỗng hoặc chưa nạp được role
  const userRoles = (authStore.roles || []).map((r: string) => r.toUpperCase());
  const isAdmin =
    userRoles.length === 0 ||
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
        card.id === 'lorawan-chirpstack:integration' ||
        card.id === 'dashboard'
      );
    });
  } else if (userRoles.includes('END_USER')) {
    cards.value = defaultStaticCards.filter((card) => {
      return card.id === 'final-config:tool' || card.id === 'dashboard';
    });
  } else {
    cards.value = [...defaultStaticCards];
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

function resolveCyberIconName(card?: MenuCardItem | null): string {
  if (!card) return 'tools';
  const raw = `${card.id || ''} ${card.icon || ''} ${card.title || ''}`.toLowerCase();
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

// Context menu state
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  card: null as MenuCardItem | null,
});

function handleContextMenu(e: MouseEvent, card: MenuCardItem) {
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

function openInNewTab(card: MenuCardItem | null) {
  if (!card) return;
  const target = card.route || card.path;
  if (target) {
    const url = router.resolve(target).href;
    window.open(url, '_blank');
  }
}

// Detail modal state
const detailModalVisible = ref(false);
const detailModalLoading = ref(false);
const detailCard = ref<MenuCardItem | null>(null);
const finalConfigStatus = ref<any>(null);
const finalConfigProfiles = ref<any[]>([]);

async function openCardDetails(card: MenuCardItem | null) {
  if (!card) return;
  detailCard.value = card;
  detailModalVisible.value = true;
  closeContextMenu();

  finalConfigProfiles.value = [];
  finalConfigStatus.value = null;

  if (card.pluginId === 'final-config' || card.id?.includes('final-config')) {
    detailModalLoading.value = true;
    try {
      const [statusRes, profilesRes] = await Promise.allSettled([
        httpClient.get('/plugins/final-config/status'),
        httpClient.get('/plugins/final-config/profiles'),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        finalConfigStatus.value = statusRes.value;
      }
      if (profilesRes.status === 'fulfilled' && profilesRes.value) {
        const raw = profilesRes.value;
        finalConfigProfiles.value = Array.isArray(raw) ? raw : (raw.data || []);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết final config:', err);
    } finally {
      detailModalLoading.value = false;
    }
  }
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
  fetchMenuCards();
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('click', closeContextMenu);
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
