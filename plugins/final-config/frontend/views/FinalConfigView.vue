<template>
  <section class="final-config-page w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Nếu ở chế độ Isolate Tab (chỉ mở 1 tab cụ thể, ví dụ từ Menu Launcher) -->
    <div v-if="isIsolatedView" class="isolated-tool-wrapper">
      <div class="isolated-header flex items-center gap-3 p-3 bg-base-200/60 rounded-xl mb-4 border border-base-300 shadow-sm backdrop-blur-md">
        <button class="btn btn-ghost btn-sm gap-2 text-primary font-medium" @click="goBackToMenu">
          <ArrowLeft class="w-4 h-4" />
          Trở về Menu
        </button>
        <div class="divider divider-horizontal my-1 mx-0"></div>
        <span class="isolated-title font-semibold text-base text-base-content">{{ isolatedTitle }}</span>
      </div>

      <!-- Nội dung tương ứng với tab được phân lập -->
      <FinalConfigTool v-if="currentIsolatedTab === 'tool'" />

      <div v-else-if="currentIsolatedTab === 'manager'">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Danh sách Final Config</span>
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm SKU, SO Number, Item Code..."
                  class="input input-bordered input-sm pl-9 w-64 md:w-80"
                />
              </div>
              <button class="btn btn-outline btn-sm gap-2" :disabled="loading" @click="fetchProfiles">
                <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                <RefreshCw v-else class="w-4 h-4" />
                Làm mới
              </button>
            </div>
          </div>
          <div class="relative">
            <div v-if="loading" class="absolute inset-0 bg-base-100/60 backdrop-blur-xs flex items-center justify-center z-10">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>
            <div ref="profileTableEl" class="tabulator-host profile-table" />
          </div>
        </div>
      </div>

      <div v-else-if="currentIsolatedTab === 'create'">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
          <div class="pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Tạo Final Config</span>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label py-1" for="final-so"><span class="label-text font-semibold">SO_NUMBER *</span></label>
                <select id="final-so" v-model="form.soNumber" class="select select-bordered w-full" :disabled="optionsLoading">
                  <option value="">Chọn SO_NUMBER</option>
                  <option v-for="so in options.soNumbers" :key="so" :value="so">{{ so }}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1" for="final-wa"><span class="label-text font-semibold">WA_NUMBER *</span></label>
                <select id="final-wa" v-model="form.waNumber" class="select select-bordered w-full" :disabled="!form.soNumber || optionsLoading">
                  <option value="">Chọn WA_NUMBER</option>
                  <option v-for="wa in options.waNumbers" :key="wa" :value="wa">{{ wa }}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1" for="final-item"><span class="label-text font-semibold">ITEM_CODE *</span></label>
                <select id="final-item" v-model="form.itemCode" class="select select-bordered w-full" :disabled="!form.waNumber || optionsLoading">
                  <option value="">Chọn ITEM_CODE</option>
                  <option v-for="item in options.itemCodes" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>
            </div>
            <div v-if="optionsLoading || resolving" role="status" class="text-sm">Đang tải dữ liệu cấu hình...</div>
            <div v-if="createError" role="alert" class="alert alert-warning text-sm">{{ createError }}</div>
          </div>

          <div v-if="form.memmapId && !registers.length" class="alert alert-warning text-sm mt-4">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>Memmap Payload không có register hợp lệ từ địa chỉ 303 trở lên.</span>
          </div>

          <div v-if="registers.length" class="register-heading flex items-center justify-between mt-4 mb-2">
            <span class="text-sm"><strong>{{ selectedCount }}</strong> / {{ registers.length }} registers được chọn</span>
            <span class="badge font-mono" :class="hasInvalidSelected ? 'badge-error' : 'badge-success'">
              {{ hasInvalidSelected ? 'Có cấu hình không hợp lệ' : 'Tất cả cấu hình đã chọn hợp lệ' }}
            </span>
          </div>

          <div v-if="hasInvalidSelected" class="alert alert-warning text-sm my-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{{ invalidSelectedMessage }}</span>
          </div>

          <div ref="registerTableEl" class="tabulator-host register-table mt-3" />

          <div class="actions flex justify-end gap-3 mt-4 pt-3 border-t border-base-content/10">
            <button class="btn btn-sm btn-ghost" :disabled="saving" @click="resetCreate">Hủy</button>
            <button class="btn btn-sm btn-primary" :disabled="!canCreate || saving" @click="createProfile">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              Tạo Final Config
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chế độ đầy đủ với các Tab thông thường -->
    <template v-else>
      <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
        <div>
          <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> FINAL CONFIG
          </div>
          <h2 class="text-xl md:text-2xl font-bold tracking-tight text-base-content flex items-center gap-2.5 mt-0.5">
            <SlidersHorizontal class="w-6 h-6 text-primary" /> Final Config
          </h2>
          <p class="subtitle text-xs text-base-content/70 mt-1">Tạo cấu hình cuối từ Memmap Payload đã được kiểm tra.</p>
        </div>
        <div class="header-actions flex items-center gap-2">
          <button class="btn btn-outline btn-sm gap-2" :disabled="loading" @click="fetchProfiles">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <RefreshCw v-else class="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </header>

      <div v-if="errorMessage" class="alert alert-error text-sm mb-4">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ errorMessage }}</span>
        <button class="btn btn-ghost btn-xs btn-circle" @click="errorMessage = ''">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
        <button
          role="tab"
          type="button"
          class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
          :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'manager' }"
          @click="activeTab = 'manager'; handleTabChange('manager')"
        >
          FINAL CONFIG MANAGER
        </button>
        <button
          role="tab"
          type="button"
          class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
          :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'create' }"
          @click="activeTab = 'create'; handleTabChange('create')"
        >
          FINAL CONFIG CREATE
        </button>
        <button
          role="tab"
          type="button"
          class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
          :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'tool' }"
          @click="activeTab = 'tool'; handleTabChange('tool')"
        >
          FINAL CONFIG TOOL
        </button>
      </div>

      <!-- Tab 1: Manager -->
      <div v-if="activeTab === 'manager'">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Danh sách Final Config</span>
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm SKU, SO Number, Item Code..."
                class="input input-bordered input-sm pl-9 w-64 md:w-80"
              />
            </div>
          </div>
          <div class="relative">
            <div v-if="loading" class="absolute inset-0 bg-base-100/60 backdrop-blur-xs flex items-center justify-center z-10">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>
            <div ref="profileTableEl" class="tabulator-host profile-table" />
          </div>
        </div>
      </div>

      <!-- Tab 2: Create -->
      <div v-else-if="activeTab === 'create'">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
          <div class="pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Tạo Final Config</span>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label py-1" for="final-so"><span class="label-text font-semibold">SO_NUMBER *</span></label>
                <select id="final-so" v-model="form.soNumber" class="select select-bordered w-full" :disabled="optionsLoading">
                  <option value="">Chọn SO_NUMBER</option>
                  <option v-for="so in options.soNumbers" :key="so" :value="so">{{ so }}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1" for="final-wa"><span class="label-text font-semibold">WA_NUMBER *</span></label>
                <select id="final-wa" v-model="form.waNumber" class="select select-bordered w-full" :disabled="!form.soNumber || optionsLoading">
                  <option value="">Chọn WA_NUMBER</option>
                  <option v-for="wa in options.waNumbers" :key="wa" :value="wa">{{ wa }}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1" for="final-item"><span class="label-text font-semibold">ITEM_CODE *</span></label>
                <select id="final-item" v-model="form.itemCode" class="select select-bordered w-full" :disabled="!form.waNumber || optionsLoading">
                  <option value="">Chọn ITEM_CODE</option>
                  <option v-for="item in options.itemCodes" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>
            </div>
            <div v-if="optionsLoading || resolving" role="status" class="text-sm">Đang tải dữ liệu cấu hình...</div>
            <div v-if="createError" role="alert" class="alert alert-warning text-sm">{{ createError }}</div>
          </div>

          <div v-if="form.memmapId && !registers.length" class="alert alert-warning text-sm mt-4">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>Memmap Payload không có register hợp lệ từ địa chỉ 303 trở lên.</span>
          </div>

          <div v-if="registers.length" class="register-heading flex items-center justify-between mt-4 mb-2">
            <span class="text-sm"><strong>{{ selectedCount }}</strong> / {{ registers.length }} registers được chọn</span>
            <span class="badge font-mono" :class="hasInvalidSelected ? 'badge-error' : 'badge-success'">
              {{ hasInvalidSelected ? 'Có cấu hình không hợp lệ' : 'Tất cả cấu hình đã chọn hợp lệ' }}
            </span>
          </div>

          <div v-if="hasInvalidSelected" class="alert alert-warning text-sm my-2">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{{ invalidSelectedMessage }}</span>
          </div>

          <div ref="registerTableEl" class="tabulator-host register-table mt-3" />

          <div class="actions flex justify-end gap-3 mt-4 pt-3 border-t border-base-content/10">
            <button class="btn btn-sm btn-ghost" :disabled="saving" @click="resetCreate">Hủy</button>
            <button class="btn btn-sm btn-primary" :disabled="!canCreate || saving" @click="createProfile">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              Tạo Final Config
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 3: Tool -->
      <div v-else-if="activeTab === 'tool'">
        <FinalConfigTool />
      </div>

      <!-- Modal Chi Tiết Profile -->
      <dialog class="modal" :class="{ 'modal-open': detailVisible }">
        <div class="modal-box w-11/12 max-w-5xl border border-base-content/10 bg-base-100 shadow-xl">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
            <h3 class="font-bold text-lg text-base-content">Chi tiết Final Config</h3>
            <button class="btn btn-ghost btn-xs btn-circle" @click="detailVisible = false">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-if="detailLoading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>
          <div v-show="!detailLoading">
            <div v-if="detail" class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-base-200/60 p-3.5 rounded-lg border border-base-content/10 mb-4 font-mono">
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">SKU</span>
                <span class="font-bold text-sm text-primary">{{ detail.sku || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">SO Number</span>
                <span class="font-medium text-base-content">{{ detail.soNumber || detail.so_number || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Item Code</span>
                <span class="font-medium text-base-content">{{ detail.itemCode || detail.item_code || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Connectivity</span>
                <span class="badge badge-sm badge-outline font-sans">{{ detail.connectivity || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Long FW</span>
                <span class="font-medium text-base-content">{{ detail.longFw || detail.long_fw || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Short FW</span>
                <span class="font-medium text-base-content">{{ detail.shortFw || detail.short_fw || '—' }}</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Số lượng Registers</span>
                <span class="badge badge-sm badge-neutral font-sans">{{ (detail.registers && detail.registers.length) || detail.registersCount || 0 }} registers</span>
              </div>
              <div>
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Ngày tạo</span>
                <span class="text-base-content/80">{{ detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : (detail.created_at ? new Date(detail.created_at).toLocaleString('vi-VN') : '—') }}</span>
              </div>
              <div v-if="detail.notes || detail.description" class="col-span-2 sm:col-span-4 border-t border-base-content/5 pt-2">
                <span class="text-base-content/60 block text-[11px] font-sans font-medium uppercase tracking-wider">Ghi chú</span>
                <span class="text-base-content/80 font-sans">{{ detail.notes || detail.description }}</span>
              </div>
            </div>
            <div ref="detailTableEl" class="tabulator-host register-table min-h-[300px]" />
          </div>
          <div class="modal-action">
            <button class="btn btn-sm btn-ghost" @click="detailVisible = false">Đóng</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="detailVisible = false">
          <button>close</button>
        </form>
      </dialog>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RefreshCw, ArrowLeft, AlertTriangle, X, Search, Eye, Trash2, SlidersHorizontal } from 'lucide-vue-next';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { cyberToast, cyberConfirm } from '@/cyber/hud';
import FinalConfigTool from '../components/FinalConfigTool.vue';
import { validateRegisterConfig } from '../utils/validator';

type Row = Record<string, any>;
const route = useRoute();
const router = useRouter();

// Isolated view check: khi url có ?tab=... hoặc ?from=menu hoặc ?isolate=true
const isIsolatedView = computed(() => {
  return !!route.query.tab || route.query.from === 'menu' || route.query.isolated === 'true';
});

const currentIsolatedTab = computed(() => {
  const tab = route.query.tab as string;
  if (tab === 'tool') return 'tool';
  if (tab === 'create') return 'create';
  if (tab === 'manager' || tab === 'history' || tab === 'batch') return 'manager';
  return 'manager';
});

const isolatedTitle = computed(() => {
  if (currentIsolatedTab.value === 'tool') return 'Final Config Tool';
  if (currentIsolatedTab.value === 'create') return 'Tạo Final Config Mới';
  return 'Quản Lý Final Config';
});

function goBackToMenu() {
  router.push('/menu');
}

const API = '/api/plugins/final-config';
const activeTab = ref(route.query.tab === 'tool' ? 'tool' : (route.query.tab === 'create' ? 'create' : 'manager'));
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');
const profiles = ref<Row[]>([]);
const options = ref<{ soNumbers: string[]; waNumbers: string[]; itemCodes: string[] }>({ soNumbers: [], waNumbers: [], itemCodes: [] });
const optionsLoading = ref(false);
const resolving = ref(false);
const createError = ref('');
let optionsRequest = 0;
let resolveRequest = 0;
const registers = ref<Row[]>([]);
const detail = ref<Row | null>(null);
const detailVisible = ref(false);
const detailLoading = ref(false);

const form = ref({ soNumber: '', waNumber: '', itemCode: '', memmapId: '', connectivity: '' });
const profileTableEl = ref<HTMLElement>();
const registerTableEl = ref<HTMLElement>();
const detailTableEl = ref<HTMLElement>();
let profileTable: Tabulator | undefined;
let registerTable: Tabulator | undefined;
let detailTable: Tabulator | undefined;


const selectedCount = computed(() => registers.value.filter(r => r.selected).length);
const invalidSelectedCount = computed(() => registers.value.filter(r => r.selected && r.configCheck === 'FAIL').length);
const hasInvalidSelected = computed(() => invalidSelectedCount.value > 0);
const invalidSelectedMessage = computed(() => `Có ${invalidSelectedCount.value} register được chọn nhưng cấu hình không hợp lệ.`);

const canCreate = computed(() => Boolean(
  form.value.soNumber &&
  form.value.waNumber &&
  form.value.itemCode &&
  form.value.memmapId &&
  !createError.value &&
  !resolving.value &&
  registers.value.length &&
  selectedCount.value &&
  !hasInvalidSelected.value
));

function val(row: Row | undefined | null, ...keys: string[]) {
  if (!row) return '';
  const hit = keys.map(k => row[k]).find(v => v !== undefined && v !== null && v !== '');
  return hit !== undefined ? hit : '';
}

async function request<T>(base: string, endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = localStorage.getItem('itest_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${base}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Lỗi yêu cầu: ${res.status}`);
  }
  return res.json();
}

function destroy(t?: Tabulator | null) {
  if (t) {
    try {
      t.destroy();
    } catch (e) {
      console.warn('Destroy table error:', e);
    }
  }
}

function profileColumns(withActions = true) {
  const columns: any[] = [
    { title: 'SKU', field: 'sku', minWidth: 170 },
    { title: 'SO Number', field: 'soNumber', minWidth: 150, formatter: (c: any) => val(c.getRow()?.getData(), 'soNumber', 'so_number') || '—' },
    { title: 'Item Code', field: 'itemCode', minWidth: 160, formatter: (c: any) => val(c.getRow()?.getData(), 'itemCode', 'item_code') || '—' },
    { title: 'Connectivity', field: 'connectivity', width: 125 },
    { title: 'LONG_FW', field: 'longFw', width: 115, formatter: (c: any) => val(c.getRow()?.getData(), 'longFw', 'long_fw') || '—' },
    { title: 'Registers', field: 'registersCount', width: 105, formatter: (c: any) => String(val(c.getRow()?.getData(), 'registersCount', 'registers_count') || 0) },
    { title: 'Created by', field: 'createdBy', width: 140, formatter: (c: any) => val(c.getRow()?.getData(), 'createdBy', 'created_by') || '—' }
  ];

  if (withActions) {
    columns.push({
      title: 'Hành động',
      width: 120,
      hozAlign: 'center',
      headerSort: false,
      formatter: () => `<div class="flex items-center justify-center gap-1">
        <button class="btn btn-xs btn-ghost btn-square text-info" title="Xem chi tiết">
          <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
        <button class="btn btn-xs btn-ghost btn-square text-error" title="Xóa">
          <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>`,
      cellClick: (e: any, cell: any) => {
        const target = e.target.closest('button');
        if (!target) return;
        const rowData = cell.getRow().getData();
        if (target.title === 'Xem chi tiết') {
          if (rowData?.id) viewProfile(String(rowData.id));
        } else if (target.title === 'Xóa') {
          if (rowData) removeProfile(rowData);
        }
      }
    });
  }

  return columns;
}

function renderProfiles() {
  destroy(profileTable);
  profileTable = undefined;
  if (!profileTableEl.value) return;
  try {
    profileTable = new Tabulator(profileTableEl.value, {
      data: profiles.value,
      layout: 'fitColumns',
      placeholder: 'Chưa có Final Config nào.',
      columns: profileColumns() as any,
      rowDblClick: (_e: Event, row: any) => {
        const d = row.getData();
        if (d?.id) viewProfile(String(d.id));
      },
      rowContextMenu: [
        {
          label: 'Xem chi tiết',
          action: (_e: Event, row: any) => {
            const d = row.getData();
            if (d?.id) viewProfile(String(d.id));
          }
        },
        {
          label: 'Xóa Final Config',
          action: (_e: Event, row: any) => {
            const d = row.getData();
            if (d) removeProfile(d);
          }
        }
      ]
    });
    profileTable.on('tableBuilt', () => {
      if (searchQuery.value.trim()) filterProfiles();
    });
  } catch (e) {
    console.error('Failed to init profileTable:', e);
  }
}

function registerColumns(editable: boolean) {
  const selectionColumn = editable ? [{
    formatter: 'rowSelection',
    titleFormatter: 'rowSelection',
    width: 45,
    hozAlign: 'center',
    headerSort: false,
    cellClick: (_e: any, cell: any) => {
      cell.getRow().toggleSelect();
    }
  }] : [];
  return [
    ...selectionColumn,
    { title: 'Modbus Register (Decimal)', field: 'modbusRegisterDec', width: 175 },
    { title: 'Modbus Register (Hex)', field: 'modbusRegisterHex', width: 160 },
    { title: '# of Registers', field: 'registerCount', width: 115 },
    { title: 'Description', field: 'description', minWidth: 200, widthGrow: 2 },
    { title: 'Format', field: 'format', width: 100 },
    { title: 'Comment', field: 'comment', minWidth: 140, widthGrow: 1 },
    { title: 'End-user Default', field: 'endUserDefault', minWidth: 140, widthGrow: 1 },
    {
      title: 'Input config',
      field: 'inputConfig',
      minWidth: 140,
      widthGrow: 1,
      editor: editable ? 'input' : false,
      cellEdited: (cell: any) => updateConfig(cell.getRow())
    },
    {
      title: 'Check',
      field: 'configCheck',
      width: 85,
      formatter: (cell: any) => `<span class="check-${cell.getValue() === 'PASS' ? 'pass' : 'fail'}">${cell.getValue()}</span>`
    }
  ] as any[];
}

function renderRegisters() {
  destroy(registerTable);
  registerTable = undefined;
  if (!registerTableEl.value) return;
  try {
    registerTable = new Tabulator(registerTableEl.value, {
      data: registers.value,
      layout: 'fitColumns',
      height: '460px',
      selectableRows: true,
      selectableRowsPersistence: false,
      columns: registerColumns(true) as any,
      rowSelectionChanged: (selectedData: any[]) => {
        const selectedDecs = new Set((selectedData || []).map((d: any) => d?.modbusRegisterDec));
        registers.value.forEach(item => {
          item.selected = selectedDecs.has(item.modbusRegisterDec);
        });
      },
      rowFormatter: (row: any) => {
        const d = row.getData();
        if (d) row.getElement().classList.toggle('invalid-row', d.configCheck === 'FAIL' && d.selected);
      }
    });
    registerTable.on('tableBuilt', () => {
      try {
        registerTable?.getRows().forEach((row: any) => {
          if (row?.getData()?.selected) row.select();
        });
      } catch (e) {}
    });
  } catch (e) {
    console.error('Failed to init registerTable:', e);
  }
}

function updateConfig(row: any) {
  const data = row.getData();
  if (!data) return;
  const inputConfig = String(data.inputConfig ?? '');
  const normalized = String(data.format || '').trim().toLowerCase() === 'hex' ? inputConfig.replace(/\s+/g, '').toUpperCase() : inputConfig.trim();
  const result = validateRegisterConfig(normalized, data.format, Number(data.registerCount));
  row.update({
    inputConfig: normalized,
    configCheck: result.valid ? 'PASS' : 'FAIL',
    configError: result.error || ''
  });
  row.getElement().classList.toggle('invalid-row', Boolean(data.selected) && !result.valid);
}

async function fetchProfiles() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const finalRows = await request<unknown>(API, '/profiles');
    profiles.value = Array.isArray(finalRows) ? (finalRows as Row[]) : [];
    await nextTick();
    renderProfiles();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Không thể tải dữ liệu Final Config';
  } finally {
    loading.value = false;
  }
}

function clearResolved() {
  resolveRequest++;
  resolving.value = false;
  form.value.memmapId = '';
  form.value.connectivity = '';
  registers.value = [];
  destroy(registerTable);
  registerTable = undefined;
}

async function loadOptions() {
  const soNumber = form.value.soNumber;
  const waNumber = form.value.waNumber;
  const requestId = ++optionsRequest;
  optionsLoading.value = true;
  createError.value = '';
  try {
    const params = new URLSearchParams();
    if (soNumber) params.set('soNumber', soNumber);
    if (waNumber) params.set('waNumber', waNumber);
    const data = await request<{ soNumbers: string[]; waNumbers: string[]; itemCodes: string[] }>(API, `/options?${params}`);
    if (requestId !== optionsRequest) return;
    options.value = data;
  } catch (e) {
    if (requestId === optionsRequest) createError.value = e instanceof Error ? e.message : 'Không thể tải SO/WA/ITEM_CODE';
  } finally {
    if (requestId === optionsRequest) optionsLoading.value = false;
  }
}

async function resolveMemmap() {
  clearResolved();
  createError.value = '';
  const { soNumber, waNumber, itemCode } = form.value;
  if (!soNumber || !waNumber || !itemCode) return;
  const requestId = ++resolveRequest;
  resolving.value = true;
  try {
    const params = new URLSearchParams({ soNumber, waNumber, itemCode });
    const source = await request<Row>(API, `/resolve?${params}`);
    if (requestId !== resolveRequest) return;
    form.value.memmapId = String(source.memmapId || '');
    form.value.connectivity = String(source.connectivity || '');
    registers.value = (source.registers || []).map((r: Row, index: number) => {
      const dec = Number(val(r, 'modbusRegisterDecimal', 'modbusRegisterDec', 'modbus_register_dec', 'address'));
      const description = String(val(r, 'description', 'name') || '');
      const format = String(val(r, 'format', 'dataType') || '');
      const sourceDefault = val(r, 'endUserDefault', 'end_user_default', 'defaultValue');
      const inputConfig = '';
      const count = Number(val(r, 'registerCount', 'numRegisters', 'num_registers') || 1);
      const check = validateRegisterConfig(inputConfig, format, count);
      return {
        rowNumber: Number(val(r, 'rowNumber', 'row_number') || index + 1),
        modbusRegisterDec: dec,
        modbusRegisterHex: val(r, 'modbusRegisterHex', 'modbus_register_hex', 'hex') || '',
        registerCount: count,
        description,
        format,
        comment: val(r, 'comment') || '',
        endUserDefault: sourceDefault ?? '',
        inputConfig,
        selected: !/spare/i.test(description),
        configCheck: check.valid ? 'PASS' : 'FAIL',
        configError: check.error || ''
      };
    }).filter(r => Number.isFinite(r.modbusRegisterDec) && r.modbusRegisterDec >= 303).sort((a, b) => a.modbusRegisterDec - b.modbusRegisterDec);
    await nextTick();
    renderRegisters();
  } catch (e) {
    if (requestId === resolveRequest) createError.value = e instanceof Error ? e.message : 'Vui lòng liên hệ ENGINEERING';
  } finally {
    if (requestId === resolveRequest) resolving.value = false;
  }
}

async function createProfile() {
  if (!canCreate.value) return;
  saving.value = true;
  try {
    const payload = {
      connectivity: form.value.connectivity,
      soNumber: form.value.soNumber,
      waNumber: form.value.waNumber,
      itemCode: form.value.itemCode,
      registers: registers.value.map(r => ({
        rowNumber: r.rowNumber,
        modbusRegisterDec: r.modbusRegisterDec,
        modbusRegisterHex: r.modbusRegisterHex,
        registerCount: r.registerCount,
        description: r.description,
        format: r.format,
        comment: r.comment,
        endUserDefault: r.endUserDefault,
        inputConfig: r.inputConfig,
        configCheck: r.configCheck,
        selected: r.selected
      }))
    };
    await request(API, '/profiles', { method: 'POST', body: JSON.stringify(payload) });
    cyberToast.success('Đã tạo Final Config');
    resetCreate();
    activeTab.value = 'manager';
    await fetchProfiles();
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Không thể tạo Final Config';
    cyberToast.error(createError.value);
  } finally {
    saving.value = false;
  }
}

function resetCreate() {
  form.value = { soNumber: '', waNumber: '', itemCode: '', memmapId: '', connectivity: '' };
  createError.value = '';
  clearResolved();
}

async function viewProfile(id: string) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    detail.value = await request<Row>(API, `/profiles/${id}`);
  } catch (e) {
    cyberToast.error(e instanceof Error ? e.message : 'Không thể tải chi tiết');
    detailVisible.value = false;
    return;
  } finally {
    detailLoading.value = false;
  }

  await nextTick();
  destroy(detailTable);
  detailTable = undefined;
  if (detailTableEl.value && detail.value) {
    detailTable = new Tabulator(detailTableEl.value, {
      data: detail.value.registers || [],
      layout: 'fitDataStretch',
      height: '430px',
      placeholder: 'Không có dữ liệu register',
      columns: registerColumns(false) as any
    });
  }
}

async function removeProfile(profile: Row) {
  try {
    const confirmed = await cyberConfirm({
      title: 'Xác nhận xóa',
      message: `Xóa Final Config ${profile.sku}? Thao tác không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'error'
    });
    if (!confirmed) return;
    await request(API, `/profiles/${profile.id}`, { method: 'DELETE' });
    cyberToast.success('Đã xóa Final Config');
    await fetchProfiles();
  } catch (e: any) {
    cyberToast.error(e instanceof Error ? e.message : 'Không thể xóa Final Config');
  }
}

function filterProfiles() {
  const q = searchQuery.value.trim().toLowerCase();
  if (!profileTable) return;
  try {
    if (q) {
      profileTable.setFilter((data: any) => {
        if (!data) return false;
        try {
          return JSON.stringify(data).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    } else {
      profileTable.clearFilter();
    }
  } catch (e) {
    console.warn('Filter error:', e);
  }
}

function handleTabChange(tab: string | number) {
  if (tab === 'manager') void fetchProfiles();
}

watch(searchQuery, filterProfiles);
watch(() => form.value.soNumber, () => {
  form.value.waNumber = '';
  form.value.itemCode = '';
  options.value.waNumbers = [];
  options.value.itemCodes = [];
  clearResolved();
  void loadOptions();
});
watch(() => form.value.waNumber, () => {
  form.value.itemCode = '';
  options.value.itemCodes = [];
  clearResolved();
  if (form.value.soNumber) void loadOptions();
});
watch(() => form.value.itemCode, () => void resolveMemmap());
onMounted(() => {
  void fetchProfiles();
  void loadOptions();
});
onBeforeUnmount(() => {
  destroy(profileTable);
  destroy(registerTable);
  destroy(detailTable);
});
</script>

<style scoped>
.isolated-tool-wrapper {
  padding: 16px 20px;
  background: var(--owl-bg-surface, #1e2430);
  border-radius: 8px;
  border: 1px solid var(--owl-border, rgba(178, 204, 214, 0.12));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.isolated-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--owl-border, rgba(178, 204, 214, 0.1));
}

.isolated-title {
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--owl-text-primary, #f1f5f9);
}

.final-config-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabulator-host {
  border-radius: 6px;
  border: 1px solid var(--owl-border, rgba(178, 204, 214, 0.15));
  overflow: hidden;
}

:deep(.tabulator) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.tabulator-header) {
  background-color: var(--owl-bg-card-hover, rgba(255, 255, 255, 0.04)) !important;
  border-bottom: 1px solid var(--owl-border, rgba(178, 204, 214, 0.15)) !important;
  color: var(--owl-text-primary, #f1f5f9) !important;
  font-weight: 600;
}

:deep(.tabulator-row) {
  background-color: transparent !important;
  border-bottom: 1px solid var(--owl-border-light, rgba(255, 255, 255, 0.05)) !important;
  color: var(--owl-text-primary, #f1f5f9) !important;
}

:deep(.tabulator-row:hover) {
  background-color: var(--owl-bg-card-hover, rgba(255, 255, 255, 0.05)) !important;
}

:deep(.tabulator-row.tabulator-selected) {
  background-color: rgba(59, 130, 246, 0.15) !important;
}

:deep(.check-pass) {
  color: #10b981;
  font-weight: 600;
}

:deep(.check-fail) {
  color: #ef4444;
  font-weight: 600;
}

:deep(.invalid-row) {
  background: rgba(239, 68, 68, 0.12) !important;
}
</style>
