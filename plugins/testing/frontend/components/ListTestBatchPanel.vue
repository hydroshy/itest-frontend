<template>
  <div class="list-test-batch-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <ListFilter class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">Testing Suite Management</span>
              <span class="badge badge-xs badge-outline font-mono">BATCH HISTORY</span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              LIST TEST BATCH (DANH SÁCH TEST BATCH)
            </h3>
            <p class="text-xs text-base-content/70">
              Tra cứu, theo dõi tiến độ và quản lý lịch sử các đợt kiểm thử hàng loạt (Test Batch)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <div class="relative w-48 sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm mã batch, tên..."
              class="input input-xs input-bordered w-full pl-8 font-mono text-xs bg-base-100"
            />
          </div>
          <button class="btn btn-xs btn-ghost gap-1" @click="loadBatches">
            <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loadingBatches }" />
            <span>Làm Mới</span>
          </button>
          <button class="btn btn-xs btn-primary gap-1" @click="$emit('switch-tab', 'create-test-batch')">
            <FolderPlus class="w-3.5 h-3.5" />
            <span>Tạo Test Batch</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <ListFilter class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            Danh Sách Test Batch Đã Thiết Lập
          </h4>
          <span class="badge badge-sm badge-ghost font-mono">
            {{ filteredBatches.length }} đợt
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-xs w-full">
          <thead>
            <tr class="text-base-content/70 border-b border-base-300">
              <th>Mã Batch</th>
              <th>Tên Đợt Test</th>
              <th>ITEM-CODE</th>
              <th>FW_VERSION</th>
              <th>Số DUTs</th>
              <th>Kịch Bản SIMU</th>
              <th>Tiêu Chí AutoCheck</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th class="text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingBatches">
              <td colspan="10" class="text-center py-6 text-base-content/60">
                <span class="loading loading-spinner loading-sm text-primary"></span>
                <span class="ml-2 font-mono text-xs">Đang tải danh sách batch...</span>
              </td>
            </tr>
            <tr v-else-if="filteredBatches.length === 0">
              <td colspan="10" class="text-center py-6 text-base-content/50 font-mono text-xs">
                Không tìm thấy đợt test batch nào
              </td>
            </tr>
            <tr
              v-else
              v-for="b in filteredBatches"
              :key="b.id"
              class="hover:bg-base-100/50 transition-colors"
            >
              <td class="font-mono font-bold text-primary text-xs">
                {{ b.batchCode || b.code }}
              </td>
              <td class="font-semibold text-xs text-base-content">
                {{ b.batchName || b.name }}
              </td>
              <td class="font-mono text-xs">
                {{ b.itemCode || '—' }}
              </td>
              <td class="font-mono text-xs">
                {{ b.fwVersion || b.longFw || '—' }}
              </td>
              <td class="font-mono text-xs">
                <span class="badge badge-xs badge-neutral font-mono">
                  {{ b.maxDevices || b.deviceCount || 10 }}
                </span>
              </td>
              <td class="text-xs">
                <span class="badge badge-xs badge-ghost font-mono">
                  {{ b.simuName || b.simulationFlow?.name || 'SIMU FLOW' }}
                </span>
              </td>
              <td class="text-xs">
                <span v-if="b.hasAutoCheck || b.autoCheckCriteria || b.autoCheckId" class="badge badge-xs badge-success font-mono font-bold">
                  ✓ AUTO CHECK
                </span>
                <span v-else class="text-base-content/40 text-[11px]">—</span>
              </td>
              <td>
                <span class="badge badge-xs font-mono font-bold" :class="getStatusBadgeClass(b.status)">
                  {{ b.status || 'READY' }}
                </span>
              </td>
              <td class="font-mono text-[11px] text-base-content/60">
                {{ formatDateTime(b.createdAt) }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="btn btn-ghost btn-xs text-primary"
                    title="Chuyển đến màn hình chạy Test Batch"
                    @click="executeBatch(b)"
                  >
                    <Play class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Chạy</span>
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    title="Xóa Batch này"
                    @click="deleteBatch(b)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  ListFilter,
  Search,
  RefreshCw,
  FolderPlus,
  Play,
  Trash2,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { cyberConfirm } from '@/services/cyberConfirm';
import { httpClient } from '@/api/client';

const emit = defineEmits<{
  (e: 'switch-tab', tabName: string): void;
  (e: 'execute-batch', batch: any): void;
}>();

const searchQuery = ref('');
const loadingBatches = ref(false);
const batches = ref<any[]>([]);

const filteredBatches = computed(() => {
  if (!searchQuery.value.trim()) return batches.value;
  const q = searchQuery.value.toLowerCase().trim();
  return batches.value.filter(
    (b) =>
      (b.batchCode && b.batchCode.toLowerCase().includes(q)) ||
      (b.batchName && b.batchName.toLowerCase().includes(q)) ||
      (b.itemCode && b.itemCode.toLowerCase().includes(q))
  );
});

async function loadBatches() {
  loadingBatches.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches');
    const data = Array.isArray(res) ? res : res?.data || [];
    batches.value = data;
  } catch (err: any) {
    cyberToast.error(err?.message || 'Không thể tải danh sách Test Batch');
  } finally {
    loadingBatches.value = false;
  }
}

function getStatusBadgeClass(status?: string): string {
  switch ((status || '').toUpperCase()) {
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'badge-primary';
    case 'PASSED':
    case 'COMPLETED':
      return 'badge-success';
    case 'FAILED':
      return 'badge-error';
    case 'READY':
    default:
      return 'badge-neutral';
  }
}

function formatDateTime(dt?: string): string {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return dt;
  }
}

function executeBatch(batch: any) {
  emit('execute-batch', batch);
  emit('switch-tab', 'test-batch');
}

async function deleteBatch(batch: any) {
  try {
    await cyberConfirm.confirm(
      `Bạn có chắc chắn muốn xóa Test Batch "${batch.batchName || batch.batchCode}"?`,
      'Xác nhận xóa Test Batch',
      { type: 'warning', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' }
    );
    await httpClient.delete(`/plugins/testing/test-batches/${batch.id}`);
    cyberToast.success('Đã xóa Test Batch');
    await loadBatches();
  } catch (err: any) {
    if (err !== 'cancel') {
      cyberToast.error(err?.message || 'Không thể xóa Test Batch');
    }
  }
}

onMounted(() => {
  loadBatches();
});
</script>
