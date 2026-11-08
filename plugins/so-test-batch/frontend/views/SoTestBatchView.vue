<template>
  <div class="so-test-batch-container w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header Banner theo chuẩn Device Traceability -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm">
      <div class="header-title flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-wide uppercase text-base-content flex items-center gap-2">
            SO TEST BATCH MANAGEMENT
          </h1>
          <p class="text-xs text-base-content/60 font-mono mt-0.5">
            Quản lý và liên kết danh sách Test Batch theo từng Sale Order (SO)
          </p>
        </div>
      </div>

      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          :disabled="loading"
          @click="loadData"
        >
          <RotateCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Làm mới
        </button>
      </div>
    </header>

    <!-- Quick Filter Bar theo chỉ đạo -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl p-3 md:p-4 shadow-sm backdrop-blur-md">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Quick Filters -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-semibold text-base-content/70 mr-1 flex items-center gap-1.5">
            <Filter class="w-3.5 h-3.5 text-primary" /> Lọc nhanh SO:
          </span>

          <div class="join">
            <button
              type="button"
              class="btn btn-xs join-item font-mono"
              :class="batchFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'"
              @click="setBatchFilter('ALL')"
            >
              Tất cả ({{ allCount }})
            </button>
            <button
              type="button"
              class="btn btn-xs join-item font-mono"
              :class="batchFilter === 'HAS_BATCH' ? 'btn-primary' : 'btn-ghost'"
              @click="setBatchFilter('HAS_BATCH')"
            >
              Đã gán Test Batch ({{ hasBatchCount }})
            </button>
            <button
              type="button"
              class="btn btn-xs join-item font-mono"
              :class="batchFilter === 'NO_BATCH' ? 'btn-primary' : 'btn-ghost'"
              @click="setBatchFilter('NO_BATCH')"
            >
              Chưa gán Batch ({{ noBatchCount }})
            </button>
          </div>
        </div>

        <!-- Realtime Search Box -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-64">
            <input
              v-model="searchTerm"
              type="text"
              class="input input-sm input-bordered w-full pr-8 text-xs font-mono"
              placeholder="Tìm theo mã SO, KH, Batch..."
              @input="onSearchInput"
            />
            <Search class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
          </div>
          <button
            v-if="searchTerm"
            type="button"
            class="btn btn-xs btn-circle btn-ghost"
            title="Xóa tìm kiếm"
            @click="searchTerm = ''; onSearchInput()"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Instruction Hint -->
    <div class="flex items-center justify-between text-xs text-base-content/60 px-1 font-mono">
      <div class="flex items-center gap-1.5">
        <MousePointerClick class="w-3.5 h-3.5 text-primary" />
        <span>Mẹo: <strong>Nhấp chuột phải</strong> vào hàng SO để Thêm / Xóa / Xem chi tiết Test Batch.</span>
      </div>
      <div>
        <span>Tổng số: <strong class="text-primary">{{ filteredRows.length }}</strong> Sale Orders</span>
      </div>
    </div>

    <!-- Tabulator Table Card -->
    <div class="card bg-base-100 border border-base-300 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto min-h-[420px] relative">
        <div v-show="loading" class="absolute inset-0 bg-base-100/60 backdrop-blur-xs z-10 flex items-center justify-center">
          <div class="flex items-center gap-2 font-mono text-xs text-primary font-bold">
            <span class="loading loading-spinner loading-sm"></span> Đang tải dữ liệu thực tế từ hệ thống...
          </div>
        </div>
        <div ref="tableRef" class="so-tabulator-table text-xs"></div>
      </div>
    </div>

    <!-- Modals -->
    <AssignTestBatchModal
      :visible="isAssignModalOpen"
      :so-data="selectedRowData"
      @close="isAssignModalOpen = false"
      @success="onModalActionSuccess"
    />

    <UnlinkTestBatchModal
      :visible="isUnlinkModalOpen"
      :so-data="selectedRowData"
      @close="isUnlinkModalOpen = false"
      @success="onModalActionSuccess"
    />

    <ViewTestBatchDetailModal
      :visible="isDetailModalOpen"
      :so-data="selectedRowData"
      @close="isDetailModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
  Layers,
  RotateCcw,
  Filter,
  Search,
  MousePointerClick,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import AssignTestBatchModal from '../components/AssignTestBatchModal.vue';
import UnlinkTestBatchModal from '../components/UnlinkTestBatchModal.vue';
import ViewTestBatchDetailModal from '../components/ViewTestBatchDetailModal.vue';

// State
const loading = ref(false);
const rawData = ref<any[]>([]);
const batchFilter = ref<'ALL' | 'HAS_BATCH' | 'NO_BATCH'>('ALL');
const searchTerm = ref('');

const tableRef = ref<HTMLDivElement | null>(null);
let tabulatorInstance: Tabulator | null = null;

// Modal States
const isAssignModalOpen = ref(false);
const isUnlinkModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedRowData = ref<any>(null);

// Counts
const allCount = computed(() => rawData.value.length);
const hasBatchCount = computed(() => rawData.value.filter((r) => Array.isArray(r.testBatches) && r.testBatches.length > 0).length);
const noBatchCount = computed(() => rawData.value.filter((r) => !Array.isArray(r.testBatches) || r.testBatches.length === 0).length);

const filteredRows = computed(() => {
  let list = rawData.value;

  if (batchFilter.value === 'HAS_BATCH') {
    list = list.filter((r) => Array.isArray(r.testBatches) && r.testBatches.length > 0);
  } else if (batchFilter.value === 'NO_BATCH') {
    list = list.filter((r) => !Array.isArray(r.testBatches) || r.testBatches.length === 0);
  }

  const term = searchTerm.value.trim().toLowerCase();
  if (term) {
    list = list.filter((r) => {
      const soNum = (r.soNumber || r.code || '').toLowerCase();
      const customer = (r.customerName || '').toLowerCase();
      const batches = Array.isArray(r.testBatches)
        ? r.testBatches.map((b: any) => (b.batchCode || b.batch_code || b.name || '').toLowerCase()).join(' ')
        : '';
      return soNum.includes(term) || customer.includes(term) || batches.includes(term);
    });
  }

  return list;
});

function setBatchFilter(f: 'ALL' | 'HAS_BATCH' | 'NO_BATCH') {
  batchFilter.value = f;
  applyTableData();
}

function onSearchInput() {
  applyTableData();
}

function applyTableData() {
  if (tabulatorInstance) {
    tabulatorInstance.setData(filteredRows.value);
  }
}

async function loadData() {
  loading.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/so-test-batch/sos');
    } catch {
      // Fallback: kết hợp SO từ lookup và test-batches
      const [soRes, batchRes] = await Promise.allSettled([
        httpClient.get('/plugins/testing/lookup/so'),
        httpClient.get('/plugins/testing/test-batches'),
      ]);
      const sos = soRes.status === 'fulfilled' && soRes.value?.data ? (Array.isArray(soRes.value.data) ? soRes.value.data : soRes.value.data?.items || []) : [];
      const batches = batchRes.status === 'fulfilled' && batchRes.value?.data ? (Array.isArray(batchRes.value.data) ? batchRes.value.data : batchRes.value.data?.items || []) : [];

      res = {
        data: sos.map((s: any) => {
          const soNum = (s.soNumber || s.so_number || '').trim();
          const linked = batches.filter((b: any) => (b.soNumber || b.so_number || '').trim() === soNum);
          return {
            id: s.id,
            soNumber: soNum,
            customerName: s.customerName || s.customer_name || '—',
            createdAt: s.createdAt || s.created_at || new Date().toISOString(),
            testBatches: linked.map((b: any) => ({
              id: b.id,
              batchCode: b.batchCode || b.batch_code || b.code,
              batchName: b.name || b.batchName || 'Test Batch',
              itemCode: b.itemCode || b.item_code,
              fwVersion: b.fwVersion || b.fw_version,
              deviceCount: b.maxDevices || b.deviceCount || 0,
              status: b.status,
            })),
          };
        }),
      };
    }

    const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.items) ? res.data.items : []);
    rawData.value = items.map((item: any) => ({
      ...item,
      soNumber: item.soNumber || item.so_number || item.code || '',
      customerName: item.customerName || item.customer_name || '—',
      testBatches: Array.isArray(item.testBatches) ? item.testBatches : (Array.isArray(item.batches) ? item.batches : []),
    }));

    await nextTick();
    applyTableData();
  } catch (err: any) {
    console.error('Error loading SO Test Batch data:', err);
    cyberToast.error('Không thể tải dữ liệu SO Test Batch từ hệ thống');
    rawData.value = [];
    applyTableData();
  } finally {
    loading.value = false;
  }
}

function initTabulator() {
  if (!tableRef.value) return;

  tabulatorInstance = new Tabulator(tableRef.value, {
    data: filteredRows.value,
    layout: 'fitColumns',
    responsiveLayout: 'collapse',
    placeholder: 'Không có dữ liệu Sale Order',
    rowContextMenu: (e: MouseEvent, row: any) => {
      const data = row.getData();
      selectedRowData.value = data;
      const batches = Array.isArray(data.testBatches) ? data.testBatches : [];

      return [
        {
          label: `<span class="flex items-center gap-2 text-primary font-bold">➕ Gán Test Batch vào SO này...</span>`,
          action: () => {
            isAssignModalOpen.value = true;
          },
        },
        {
          label: `<span class="flex items-center gap-2 text-error font-bold ${batches.length === 0 ? 'opacity-40 pointer-events-none' : ''}">🗑️ Xóa Test Batch khỏi SO...</span>`,
          disabled: batches.length === 0,
          action: () => {
            if (batches.length > 0) isUnlinkModalOpen.value = true;
          },
        },
        { separator: true },
        {
          label: `<span class="flex items-center gap-2 text-info font-medium">🔍 Xem chi tiết cấu hình Test Batch...</span>`,
          action: () => {
            isDetailModalOpen.value = true;
          },
        },
      ];
    },
    columns: [
      {
        title: 'STT',
        formatter: 'rownum',
        width: 60,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
      },
      {
        title: 'Mã Sale Order (SO Number)',
        field: 'soNumber',
        widthGrow: 1.8,
        headerSort: true,
        formatter: (cell) => {
          const val = cell.getValue();
          return `<div class="font-mono font-bold text-xs text-primary flex items-center gap-1.5">
            <span class="badge badge-primary badge-xs font-mono">SO</span>
            <span>${val || '—'}</span>
          </div>`;
        },
      },
      {
        title: 'Khách Hàng',
        field: 'customerName',
        widthGrow: 2,
        headerSort: true,
        formatter: (cell) => {
          const val = cell.getValue();
          return `<span class="text-xs font-medium text-base-content">${val || '—'}</span>`;
        },
      },
      {
        title: 'Danh Sách Test Batch Đã Gán',
        field: 'testBatches',
        widthGrow: 3.5,
        headerSort: false,
        formatter: (cell) => {
          const batches = cell.getValue();
          if (!Array.isArray(batches) || batches.length === 0) {
            return `<span class="text-base-content/40 italic font-mono text-[11px]">Chưa gán Test Batch</span>`;
          }
          const tags = batches
            .map(
              (b: any) =>
                `<span class="badge badge-sm badge-outline badge-primary font-mono text-[11px] font-bold" title="${b.batchName || b.name || ''}">
                  ${b.batchCode || b.batch_code || b.code}
                </span>`
            )
            .join(' ');
          return `<div class="flex items-center gap-1.5 flex-wrap py-0.5">${tags}</div>`;
        },
      },
      {
        title: 'SL Batch',
        field: 'testBatches',
        width: 100,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const batches = cell.getValue();
          const count = Array.isArray(batches) ? batches.length : 0;
          return `<span class="badge badge-sm ${count > 0 ? 'badge-primary' : 'badge-ghost'} font-mono font-bold">${count}</span>`;
        },
      },
      {
        title: 'Ngày Tạo',
        field: 'createdAt',
        width: 130,
        hozAlign: 'center',
        headerHozAlign: 'center',
        formatter: (cell) => {
          const val = cell.getValue();
          if (!val) return '<span class="text-base-content/40 font-mono">—</span>';
          try {
            const date = new Date(val);
            return `<span class="font-mono text-[11px] text-base-content/70">${date.toLocaleDateString('vi-VN')}</span>`;
          } catch {
            return `<span class="font-mono text-[11px] text-base-content/70">${val}</span>`;
          }
        },
      },
      {
        title: 'Thao Tác Nhanh',
        width: 140,
        hozAlign: 'center',
        headerHozAlign: 'center',
        headerSort: false,
        formatter: () => {
          return `<div class="flex items-center justify-center gap-1">
            <button class="btn btn-xs btn-primary btn-assign-batch" title="Gán Test Batch">➕ Gán</button>
            <button class="btn btn-xs btn-ghost btn-view-batch" title="Xem chi tiết">👁️</button>
          </div>`;
        },
        cellClick: (e, cell) => {
          const target = e.target as HTMLElement;
          const data = cell.getRow().getData();
          selectedRowData.value = data;

          if (target.closest('.btn-assign-batch')) {
            isAssignModalOpen.value = true;
          } else if (target.closest('.btn-view-batch')) {
            isDetailModalOpen.value = true;
          }
        },
      },
    ],
  });
}

function onModalActionSuccess() {
  loadData();
}

onMounted(() => {
  initTabulator();
  loadData();
});

onBeforeUnmount(() => {
  if (tabulatorInstance) {
    tabulatorInstance.destroy();
    tabulatorInstance = null;
  }
});
</script>

<style scoped>
.so-test-batch-container {
  animation: fadeIn 0.15s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
