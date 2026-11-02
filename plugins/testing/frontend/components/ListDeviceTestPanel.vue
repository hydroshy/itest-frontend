<template>
  <div class="list-device-test-panel space-y-4">
    <!-- Top Filter & Control Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Title & Count -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Layers class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content flex items-center gap-2">
              <span>Danh Sách Thiết Bị Test</span>
              <span class="badge badge-sm badge-primary font-mono text-[11px]">
                {{ totalItems }} thiết bị
              </span>
            </h3>
          </div>
        </div>

        <!-- Controls: Search, Filter, Actions -->
        <div class="flex items-center gap-2 flex-wrap ml-auto">
          <!-- Search box -->
          <div class="relative w-48 sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Tìm Serial, DevEUI, Item..."
              class="input input-sm input-bordered bg-base-100 pl-8 w-full text-xs"
              @keyup.enter="loadDevices(1)"
            />
            <button
              v-if="searchTerm"
              class="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2 text-base-content/50"
              @click="searchTerm = ''; loadDevices(1)"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- User scope filter (Admin can toggle All vs Mine) -->
          <div v-if="isAdmin" class="join join-horizontal">
            <button
              type="button"
              class="btn btn-xs join-item"
              :class="filterMode === 'mine' ? 'btn-primary' : 'btn-outline border-base-300'"
              @click="setFilterMode('mine')"
            >
              <User class="w-3 h-3" />
              Của tôi
            </button>
            <button
              type="button"
              class="btn btn-xs join-item"
              :class="filterMode === 'all' ? 'btn-primary' : 'btn-outline border-base-300'"
              @click="setFilterMode('all')"
            >
              <Shield class="w-3 h-3" />
              Tất cả (Admin)
            </button>
          </div>
          <div v-else class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-base-100/50 border border-base-300 text-xs font-mono">
            <User class="w-3 h-3 text-primary" />
            <span class="text-base-content/70">User:</span>
            <span class="font-semibold text-primary">@{{ currentUsername }}</span>
          </div>

          <!-- Refresh button -->
          <button
            class="btn btn-sm btn-outline border-base-300 gap-1.5"
            :disabled="loading"
            title="Tải lại danh sách"
            @click="loadDevices(currentPage)"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            <span class="hidden sm:inline text-xs">Làm mới</span>
          </button>

          <!-- Create Device CTA Button -->
          <button
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            @click="$emit('switch-tab', 'create-device-testing')"
          >
            <Plus class="w-3.5 h-3.5" />
            <span class="text-xs">Tạo Thiết Bị Mới</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Table Card: Concise 11 Core Fields -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="overflow-x-auto relative min-h-[300px]">
        <!-- Loading Overlay -->
        <div
          v-if="loading"
          class="absolute inset-0 bg-base-100/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 gap-2"
        >
          <span class="loading loading-spinner loading-md text-primary"></span>
          <span class="text-xs font-mono text-base-content/70">Đang tải danh sách thiết bị test...</span>
        </div>

        <table class="table table-sm table-zebra w-full text-xs">
          <thead>
            <tr class="bg-base-200/80 text-base-content/70 text-[11px] uppercase font-semibold">
              <th class="w-10 text-center">#</th>
              <th>Serial Number</th>
              <th>Item Code</th>
              <th>FW Ver</th>
              <th>HW Ver</th>
              <th>DevEUI</th>
              <th>AppEUI</th>
              <th>AppKey</th>
              <th class="text-center">Class</th>
              <th class="text-center">Region</th>
              <th>Created By</th>
              <th class="text-center">Trạng Thái</th>
              <th class="text-center w-24">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty state -->
            <tr v-if="!loading && devices.length === 0">
              <td colspan="13" class="text-center py-12">
                <div class="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-base-content/60">
                  <div class="w-12 h-12 rounded-full bg-base-300/50 flex items-center justify-center text-base-content/40 mb-1">
                    <Radio class="w-6 h-6" />
                  </div>
                  <div class="font-semibold text-sm text-base-content">Chưa có thiết bị test nào</div>
                  <p class="text-xs text-base-content/50 text-center">
                    Không tìm thấy thiết bị nào phù hợp với bộ lọc trong hệ thống.
                  </p>
                  <button
                    class="btn btn-sm btn-primary mt-2 gap-1.5 shadow-sm"
                    @click="$emit('switch-tab', 'create-device-testing')"
                  >
                    <Plus class="w-4 h-4" />
                    Tạo thiết bị test ngay
                  </button>
                </div>
              </td>
            </tr>

            <!-- Device rows -->
            <tr v-for="(dev, idx) in devices" :key="dev.id || dev.registrationCode || idx" class="hover group">
              <!-- # Index -->
              <td class="text-center font-mono text-base-content/40 text-[11px]">
                {{ (currentPage - 1) * pageSize + idx + 1 }}
              </td>

              <!-- 1. Serial Number -->
              <td>
                <div class="font-mono font-bold text-primary flex items-center gap-1.5">
                  <span>{{ dev.serialNumber || '—' }}</span>
                  <button
                    v-if="dev.serialNumber"
                    class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 min-h-0"
                    title="Sao chép Serial"
                    @click="copyText(dev.serialNumber)"
                  >
                    <Copy class="w-3 h-3 text-base-content/60" />
                  </button>
                </div>
                <div v-if="dev.registrationCode" class="text-[10px] font-mono text-base-content/40 truncate max-w-[140px]">
                  {{ dev.registrationCode }}
                </div>
              </td>

              <!-- 2. Item Code -->
              <td>
                <span class="badge badge-sm badge-ghost font-mono text-[11px] border-base-300">
                  {{ dev.itemCode || '—' }}
                </span>
              </td>

              <!-- 3. FW Version (Single column, no 'v' prefix, FW Code hidden) -->
              <td>
                <span class="font-mono text-[11px] font-medium text-base-content/90">
                  {{ cleanVersion(dev.fwVersion) }}
                </span>
              </td>

              <!-- 4. HW Version (no 'v' prefix) -->
              <td>
                <span class="badge badge-sm badge-outline font-mono text-[11px] border-base-300">
                  {{ cleanVersion(dev.hwVersion) }}
                </span>
              </td>

              <!-- 6. DevEUI -->
              <td>
                <div class="font-mono text-[11px] text-sky-400 flex items-center gap-1">
                  <span>{{ formatHex(dev.devEui) }}</span>
                  <button
                    v-if="dev.devEui"
                    class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 min-h-0"
                    title="Sao chép DevEUI"
                    @click="copyText(dev.devEui)"
                  >
                    <Copy class="w-3 h-3 text-base-content/60" />
                  </button>
                </div>
              </td>

              <!-- 7. AppEUI -->
              <td>
                <span class="font-mono text-[10px] text-base-content/70">
                  {{ formatHex(dev.appEui) }}
                </span>
              </td>

              <!-- 8. AppKey (masked with toggle/copy) -->
              <td>
                <div class="font-mono text-[10px] text-base-content/60 flex items-center gap-1">
                  <span v-if="revealedKeys[dev.id]">
                    {{ dev.appKey || '—' }}
                  </span>
                  <span v-else class="tracking-widest">
                    {{ maskKey(dev.appKey) }}
                  </span>
                  <button
                    v-if="dev.appKey"
                    class="btn btn-ghost btn-xs btn-circle p-0 h-4 w-4 min-h-0 text-base-content/40 hover:text-base-content"
                    :title="revealedKeys[dev.id] ? 'Ẩn AppKey' : 'Hiện AppKey'"
                    @click="toggleKey(dev.id)"
                  >
                    <EyeOff v-if="revealedKeys[dev.id]" class="w-3 h-3" />
                    <Eye v-else class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- 9. Class -->
              <td class="text-center">
                <span
                  class="badge badge-sm font-mono text-[10px] font-bold"
                  :class="String(dev.class).toUpperCase().includes('C') ? 'badge-secondary' : 'badge-outline border-primary/40 text-primary'"
                >
                  Class {{ String(dev.class || 'A').toUpperCase().replace('CLASS_', '') }}
                </span>
              </td>

              <!-- 10. Region -->
              <td class="text-center">
                <span class="badge badge-sm badge-info/20 text-info font-mono text-[10px] border border-info/30">
                  {{ dev.region || dev.regionCode || 'AS923-1' }}
                </span>
              </td>

              <!-- 11. Created By -->
              <td>
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                    {{ getInitials(dev.createdBy) }}
                  </div>
                  <span
                    class="font-mono text-[11px]"
                    :class="dev.createdBy === currentUsername ? 'font-bold text-primary' : 'text-base-content/80'"
                  >
                    @{{ dev.createdBy || 'tester' }}
                  </span>
                </div>
              </td>

              <!-- Trạng thái tính toán từ ChirpStack API -->
              <td class="text-center">
                <span
                  v-if="dev.status === 'ONLINE' || dev.status === 'ACTIVE'"
                  class="badge badge-xs badge-success gap-1 text-[10px] py-1 px-1.5"
                  :title="dev.lastSeenAt ? 'ChirpStack: Online (Gói tin gần nhất: ' + formatDate(dev.lastSeenAt) + ')' : 'ChirpStack: Online'"
                >
                  <Check class="w-2.5 h-2.5" /> Online
                </span>
                <span
                  v-else-if="dev.status === 'NEVER_SEEN'"
                  class="badge badge-xs badge-warning gap-1 text-[10px] py-1 px-1.5"
                  title="ChirpStack: Thiết bị đã đăng ký nhưng chưa phát gói tin uplink nào"
                >
                  <Radio class="w-2.5 h-2.5" /> Chưa Uplink
                </span>
                <span
                  v-else-if="dev.status === 'REGISTERED' || dev.status === 'SUCCESS_ATTACH_BATTERY'"
                  class="badge badge-xs badge-info gap-1 text-[10px] py-1 px-1.5"
                  title="Đã đăng ký ChirpStack Network Server"
                >
                  <Check class="w-2.5 h-2.5" /> Đã Đăng Ký
                </span>
                <span
                  v-else-if="dev.status === 'DISABLED'"
                  class="badge badge-xs badge-neutral gap-1 text-[10px] py-1 px-1.5"
                  title="ChirpStack: Thiết bị đang bị vô hiệu hóa"
                >
                  <X class="w-2.5 h-2.5" /> Vô Hiệu
                </span>
                <span
                  v-else
                  class="badge badge-xs badge-error gap-1 text-[10px] py-1 px-1.5"
                  :title="dev.message || 'Không tìm thấy trên Network Server'"
                >
                  <X class="w-2.5 h-2.5" /> {{ dev.status || 'Chưa ĐK' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <!-- Quick inspect button -->
                  <button
                    class="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-primary"
                    title="Xem chi tiết"
                    @click="openDetailModal(dev)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete button (deletes on ChirpStack + local) -->
                  <button
                    class="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error hover:bg-error/10"
                    :disabled="!canDelete(dev)"
                    :title="canDelete(dev) ? 'Xóa thiết bị (xóa cả trên ChirpStack)' : 'Chỉ người tạo hoặc Admin mới có quyền xóa'"
                    @click="promptDelete(dev)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-base-300 text-xs">
        <div class="text-base-content/60 font-mono text-[11px]">
          Hiển thị
          <span class="font-semibold text-base-content">{{ devices.length }}</span> /
          <span class="font-semibold text-base-content">{{ totalItems }}</span> thiết bị
          (Trang {{ currentPage }} / {{ totalPages || 1 }})
        </div>

        <div class="join join-horizontal">
          <button
            class="btn btn-xs join-item"
            :disabled="currentPage <= 1 || loading"
            @click="loadDevices(currentPage - 1)"
          >
            « Trước
          </button>
          <button
            class="btn btn-xs join-item font-mono font-bold"
          >
            {{ currentPage }}
          </button>
          <button
            class="btn btn-xs join-item"
            :disabled="currentPage >= totalPages || loading"
            @click="loadDevices(currentPage + 1)"
          >
            Sau »
          </button>
        </div>
      </div>
    </div>

    <!-- DETAIL INSPECT MODAL -->
    <dialog class="modal" :class="{ 'modal-open': detailModalVisible }">
      <div v-if="selectedDev" class="modal-box w-11/12 max-w-2xl border border-base-300 bg-base-100 p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-base-300">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
              <Radio class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-base text-base-content">
                Chi Tiết Thiết Bị: {{ selectedDev.serialNumber || selectedDev.devEui }}
              </h3>
              <p class="text-xs text-base-content/60 font-mono">
                Mã ĐK: {{ selectedDev.registrationCode || selectedDev.id }}
              </p>
            </div>
          </div>
          <button class="btn btn-ghost btn-xs btn-circle" @click="detailModalVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- 11 Fields Grid Display -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">1. Serial Number</div>
            <div class="font-mono font-bold text-primary mt-0.5 truncate">{{ selectedDev.serialNumber || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">2. Item Code</div>
            <div class="font-mono font-semibold mt-0.5 truncate">{{ selectedDev.itemCode || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">3. FW Version</div>
            <div class="font-mono mt-0.5">{{ cleanVersion(selectedDev.fwVersion) }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">4. HW Version</div>
            <div class="font-mono mt-0.5">{{ cleanVersion(selectedDev.hwVersion) }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">5. FW Code</div>
            <div class="font-mono mt-0.5">{{ selectedDev.fwCode || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">6. DevEUI</div>
            <div class="font-mono text-sky-400 font-semibold mt-0.5 truncate">{{ selectedDev.devEui || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">7. AppEUI</div>
            <div class="font-mono text-base-content/80 mt-0.5 truncate">{{ selectedDev.appEui || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300 col-span-2">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">8. AppKey</div>
            <div class="font-mono text-xs text-base-content/80 mt-0.5 break-all select-all">{{ selectedDev.appKey || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">9. Class</div>
            <div class="font-mono font-bold text-secondary mt-0.5">
              Class {{ String(selectedDev.class || 'A').toUpperCase().replace('CLASS_', '') }}
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">10. Region</div>
            <div class="font-mono font-semibold text-info mt-0.5">{{ selectedDev.region || selectedDev.regionCode || '—' }}</div>
          </div>
          <div class="p-2.5 rounded-lg bg-base-200/60 border border-base-300">
            <div class="text-[10px] text-base-content/50 uppercase font-medium">11. Created By</div>
            <div class="font-mono font-bold text-primary mt-0.5">@{{ selectedDev.createdBy || 'tester' }}</div>
          </div>
        </div>

        <!-- Additional Network Info -->
        <div class="p-3 rounded-lg bg-base-200/40 border border-base-300 space-y-1.5 text-xs font-mono">
          <div class="flex justify-between">
            <span class="text-base-content/60">Application ID:</span>
            <span class="font-bold text-primary">{{ selectedDev.applicationId || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Network Server:</span>
            <span>{{ selectedDev.networkServerName || 'Globiots ChirpStack Server' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Trạng Thái (Network Server):</span>
            <span class="font-bold text-emerald-400">{{ selectedDev.status || '—' }}</span>
          </div>
          <div v-if="selectedDev.lastSeenAt" class="flex justify-between">
            <span class="text-base-content/60">Gói Tin Gần Nhất (Last Seen):</span>
            <span class="text-sky-400">{{ formatDate(selectedDev.lastSeenAt) }}</span>
          </div>
          <div v-if="selectedDev.message" class="flex justify-between">
            <span class="text-base-content/60">Thông Điệp:</span>
            <span class="text-base-content/80">{{ selectedDev.message }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Thời Gian Đăng Ký:</span>
            <span>{{ formatDate(selectedDev.createdAt) }}</span>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-sm btn-outline" @click="detailModalVisible = false">
            Đóng
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="detailModalVisible = false">close</button>
      </form>
    </dialog>

    <!-- SAFE DELETE CONFIRMATION MODAL -->
    <dialog class="modal" :class="{ 'modal-open': deleteModalVisible }">
      <div v-if="devToDelete" class="modal-box border border-error/30 bg-base-100 p-6 space-y-4 max-w-md">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-error/20 text-error flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-base-content">Xác Nhận Xóa Thiết Bị</h3>
            <p class="text-xs text-base-content/70 mt-1">
              Bạn có chắc chắn muốn xóa thiết bị kiểm thử này? Thiết bị sẽ bị xóa vĩnh viễn trên cả hệ thống và ChirpStack Network Server.
            </p>
          </div>
        </div>

        <!-- Target details -->
        <div class="p-3 rounded-lg bg-base-200/60 border border-base-300 text-xs space-y-1 font-mono">
          <div class="flex justify-between">
            <span class="text-base-content/60">Serial Number:</span>
            <span class="font-bold text-primary">{{ devToDelete.serialNumber || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">DevEUI:</span>
            <span class="text-sky-400">{{ devToDelete.devEui || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Người Tạo:</span>
            <span>@{{ devToDelete.createdBy || 'tester' }}</span>
          </div>
        </div>

        <!-- Warning Callout -->
        <div class="alert alert-warning text-xs p-2.5 rounded-lg border-warning/30 flex items-start gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-warning" />
          <span>Hành động này sẽ xóa dữ liệu trên hệ thống và đồng thời gửi yêu cầu hủy đăng ký DevEUI tương ứng trên ChirpStack.</span>
        </div>

        <div class="modal-action flex justify-end gap-2">
          <button class="btn btn-sm btn-ghost" :disabled="deleting" @click="deleteModalVisible = false">
            Hủy Bỏ
          </button>
          <button class="btn btn-sm btn-error gap-1.5 shadow-sm" :disabled="deleting" @click="confirmDelete">
            <span v-if="deleting" class="loading loading-spinner loading-xs"></span>
            <Trash2 v-else class="w-3.5 h-3.5" />
            <span>Xác Nhận Xóa</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button :disabled="deleting" @click="deleteModalVisible = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Layers,
  Search,
  User,
  Shield,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Radio,
  X,
  AlertTriangle,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  (e: 'switch-tab', tabName: string): void;
}>();

const authStore = useAuthStore();

// Current User & Role
const currentUsername = computed(() => {
  return authStore.user?.username || 'tester';
});

const isAdmin = computed(() => {
  const username = (authStore.user?.username || '').toLowerCase();
  if (username === 'admin') return true;
  const userType = String((authStore.user as any)?.userType || '').toUpperCase();
  if (['ADMIN', 'SUPER_ADMIN'].includes(userType)) return true;
  const roles = (authStore.user?.roles || []).map((r: any) => String(r).toUpperCase());
  return roles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(r));
});

// State
const loading = ref(false);
const devices = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1);

const defaultAppId = ref('');
const currentAppId = ref('');
const searchTerm = ref('');
const filterMode = ref<'mine' | 'all'>('mine');

// AppKey visibility toggles
const revealedKeys = ref<Record<string, boolean>>({});

// Modals
const detailModalVisible = ref(false);
const selectedDev = ref<any>(null);

const deleteModalVisible = ref(false);
const devToDelete = ref<any>(null);
const deleting = ref(false);

function setFilterMode(mode: 'mine' | 'all') {
  filterMode.value = mode;
  loadDevices(1);
}

function canDelete(dev: any): boolean {
  if (isAdmin.value) return true;
  if (!dev?.createdBy || dev.createdBy === 'tester') return true;
  return String(dev.createdBy).toLowerCase() === currentUsername.value.toLowerCase();
}

function toggleKey(id: string) {
  revealedKeys.value[id] = !revealedKeys.value[id];
}

function maskKey(key?: string): string {
  if (!key) return '—';
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

function formatHex(str?: string): string {
  if (!str) return '—';
  return str.toUpperCase();
}

function cleanVersion(val?: string | null): string {
  if (!val) return '—';
  return String(val).replace(/^[vV]/, '').trim() || '—';
}

function getInitials(name?: string): string {
  if (!name) return 'T';
  return name.substring(0, 2).toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    cyberToast.success('Đã sao chép: ' + text);
  } catch {
    cyberToast.error('Không thể sao chép');
  }
}

// Fetch Active Default Application
async function fetchDefaultApplication() {
  try {
    const res: any = await httpClient.get('/plugins/testing/default-application');
    if (res?.success && res?.data?.applicationId) {
      defaultAppId.value = res.data.applicationId;
      currentAppId.value = res.data.applicationId;
    }
  } catch (err: any) {
    console.warn('[ListDeviceTestPanel] Could not load default application:', err.message);
  }
}

// Load Devices List
async function loadDevices(page = 1) {
  loading.value = true;
  currentPage.value = page;

  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchTerm.value.trim() || undefined,
      user: currentUsername.value,
      role: isAdmin.value ? 'ADMIN' : 'TESTER',
      isAdmin: isAdmin.value,
    };

    // If Admin and chosen "mine", filter by user
    if (isAdmin.value && filterMode.value === 'mine') {
      params.user = currentUsername.value;
      params.isAdmin = false;
    }

    // Default Application ID filter
    if (currentAppId.value || defaultAppId.value) {
      params.applicationId = currentAppId.value || defaultAppId.value;
    }

    const res: any = await httpClient.get('/plugins/testing/device-registrations', { params });

    if (res?.success) {
      devices.value = Array.isArray(res.data) ? res.data : [];
      totalItems.value = Number(res.total ?? devices.value.length);
      if (res.defaultApplicationId && !defaultAppId.value) {
        defaultAppId.value = res.defaultApplicationId;
        currentAppId.value = res.defaultApplicationId;
      }
    } else {
      devices.value = [];
      totalItems.value = 0;
    }
  } catch (err: any) {
    console.error('[ListDeviceTestPanel] Error loading devices:', err);
    cyberToast.error('Không thể tải danh sách thiết bị test: ' + (err.message || 'Lỗi mạng'));
    devices.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
}

// Open Detail Modal
function openDetailModal(dev: any) {
  selectedDev.value = dev;
  detailModalVisible.value = true;
}

// Delete Prompt & Confirmation
function promptDelete(dev: any) {
  devToDelete.value = dev;
  deleteModalVisible.value = true;
}

async function confirmDelete() {
  if (!devToDelete.value) return;
  deleting.value = true;

  try {
    const id = devToDelete.value.id || devToDelete.value.registrationCode;
    const res: any = await httpClient.delete(`/plugins/testing/device-registrations/${id}`, {
      params: {
        user: currentUsername.value,
        role: isAdmin.value ? 'ADMIN' : 'TESTER',
        isAdmin: isAdmin.value,
      },
    });

    if (res?.success) {
      cyberToast.success(`Đã xóa thiết bị ${devToDelete.value.serialNumber || devToDelete.value.devEui} trên cả hệ thống và ChirpStack`);
      deleteModalVisible.value = false;
      devToDelete.value = null;
      await loadDevices(currentPage.value);
    } else {
      cyberToast.error(res?.message || 'Xóa thiết bị thất bại');
    }
  } catch (err: any) {
    cyberToast.error('Lỗi khi xóa thiết bị: ' + (err.response?.data?.message || err.message));
  } finally {
    deleting.value = false;
  }
}

defineExpose({
  loadDevices,
});

onMounted(async () => {
  await fetchDefaultApplication();
  await loadDevices(1);
});
</script>

<style scoped>
.list-device-test-panel {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
