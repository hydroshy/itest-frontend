<template>
  <section class="final-config-page">
    <!-- Nếu ở chế độ Isolate Tab (chỉ mở 1 tab cụ thể, ví dụ từ Menu Launcher) -->
    <div v-if="isIsolatedView" class="isolated-tool-wrapper">
      <div class="isolated-header">
        <button class="btn btn-ghost btn-sm gap-2" @click="goBackToMenu">
          <ArrowLeft class="w-4 h-4" />
          Trở về Menu
        </button>
        <span class="isolated-title">{{ isolatedTitle }}</span>
      </div>

      <!-- Nội dung tương ứng với tab được phân lập -->
      <FinalConfigTool v-if="currentIsolatedTab === 'tool'" />

      <div v-else-if="currentIsolatedTab === 'manager'">
        <div class="card border border-base-content/10 bg-base-100 shadow-sm p-4">
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
        <div class="card border border-base-content/10 bg-base-100 shadow-sm p-4">
          <div class="pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Tạo Final Config</span>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">Sensor connectivity <span class="text-error">*</span></span></label>
                <select v-model="form.connectivity" class="select select-bordered select-sm w-full">
                  <option value="LoRaWAN">LoRaWAN</option>
                  <option value="Sigfox">Sigfox</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">SKU <span class="text-error">*</span></span></label>
                <div class="join w-full">
                  <span class="join-item btn btn-sm btn-neutral no-animation font-mono">{{ skuPrefix }}</span>
                  <input v-model="form.skuSuffix" type="text" class="input input-bordered input-sm join-item flex-1" placeholder="Nhập suffix..." />
                </div>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">LONG_FW (5FXXXX) <span class="text-error">*</span></span></label>
                <input
                  v-model="form.longFw"
                  maxlength="6"
                  @input="normalizeLongFw"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  :class="{ 'input-error': longFwError }"
                  placeholder="5F..."
                />
                <span v-if="longFwError" class="text-error text-xs mt-1">{{ longFwError }}</span>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">SO_NUMBER <span class="text-error">*</span></span></label>
                <input
                  v-model="form.soNumber"
                  placeholder="SO/2026/12345"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  :class="{ 'input-error': soError }"
                />
                <span v-if="soError" class="text-error text-xs mt-1">{{ soError }}</span>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">ITEM_CODE <span class="text-error">*</span></span></label>
                <input v-model="form.itemCode" placeholder="WSLRW-ATH-11" type="text" class="input input-bordered input-sm w-full font-mono" />
              </div>
            </div>
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
      <header class="page-header flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> FINAL CONFIG
          </div>
          <h2 class="text-2xl font-bold tracking-tight">Final Config</h2>
          <p class="text-sm text-base-content/70">Tạo cấu hình cuối từ Memmap Payload đã được kiểm tra.</p>
        </div>
        <button class="btn btn-outline btn-sm gap-2" :disabled="loading" @click="fetchProfiles">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-4 h-4" />
          Làm mới
        </button>
      </header>

      <div v-if="errorMessage" class="alert alert-error text-sm mb-4">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ errorMessage }}</span>
        <button class="btn btn-ghost btn-xs btn-circle" @click="errorMessage = ''">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs tabs-boxed bg-base-200/50 p-1 mb-4 inline-flex">
        <button
          type="button"
          class="tab font-semibold tracking-wide text-xs md:text-sm"
          :class="{ 'tab-active': activeTab === 'manager' }"
          @click="activeTab = 'manager'; handleTabChange('manager')"
        >
          FINAL CONFIG MANAGER
        </button>
        <button
          type="button"
          class="tab font-semibold tracking-wide text-xs md:text-sm"
          :class="{ 'tab-active': activeTab === 'create' }"
          @click="activeTab = 'create'; handleTabChange('create')"
        >
          FINAL CONFIG CREATE
        </button>
        <button
          type="button"
          class="tab font-semibold tracking-wide text-xs md:text-sm"
          :class="{ 'tab-active': activeTab === 'tool' }"
          @click="activeTab = 'tool'; handleTabChange('tool')"
        >
          FINAL CONFIG TOOL
        </button>
      </div>

      <!-- Tab 1: Manager -->
      <div v-if="activeTab === 'manager'">
        <div class="card border border-base-content/10 bg-base-100 shadow-sm p-4">
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
        <div class="card border border-base-content/10 bg-base-100 shadow-sm p-4">
          <div class="pb-3 mb-3 border-b border-base-content/10">
            <span class="font-bold text-base">Tạo Final Config</span>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">Sensor connectivity <span class="text-error">*</span></span></label>
                <select v-model="form.connectivity" class="select select-bordered select-sm w-full">
                  <option value="LoRaWAN">LoRaWAN</option>
                  <option value="Sigfox">Sigfox</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">SKU <span class="text-error">*</span></span></label>
                <div class="join w-full">
                  <span class="join-item btn btn-sm btn-neutral no-animation font-mono">{{ skuPrefix }}</span>
                  <input v-model="form.skuSuffix" type="text" class="input input-bordered input-sm join-item flex-1" placeholder="Nhập suffix..." />
                </div>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">LONG_FW (5FXXXX) <span class="text-error">*</span></span></label>
                <input
                  v-model="form.longFw"
                  maxlength="6"
                  @input="normalizeLongFw"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  :class="{ 'input-error': longFwError }"
                  placeholder="5F..."
                />
                <span v-if="longFwError" class="text-error text-xs mt-1">{{ longFwError }}</span>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">SO_NUMBER <span class="text-error">*</span></span></label>
                <input
                  v-model="form.soNumber"
                  placeholder="SO/2026/12345"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  :class="{ 'input-error': soError }"
                />
                <span v-if="soError" class="text-error text-xs mt-1">{{ soError }}</span>
              </div>
              <div class="form-control">
                <label class="label py-1"><span class="label-text font-semibold">ITEM_CODE <span class="text-error">*</span></span></label>
                <input v-model="form.itemCode" placeholder="WSLRW-ATH-11" type="text" class="input input-bordered input-sm w-full font-mono" />
              </div>
            </div>
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
        <div class="modal-box w-11/12 max-w-5xl border border-base-content/10 bg-base-100">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
            <h3 class="font-bold text-lg">Chi tiết Final Config</h3>
            <button class="btn btn-ghost btn-xs btn-circle" @click="detailVisible = false">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-if="detailLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>
          <div v-else>
            <div v-if="detail" class="details flex flex-wrap gap-4 text-sm font-mono bg-base-200/50 p-3 rounded-lg border border-base-content/10 mb-4">
              <span class="font-bold text-primary">{{ detail.sku }}</span>
              <span>SO: {{ detail.soNumber || detail.so_number }}</span>
              <span>ITEM: {{ detail.itemCode || detail.item_code }}</span>
            </div>
            <div ref="detailTableEl" class="tabulator-host register-table" />
          </div>
          <div class="modal-action">
            <button class="btn btn-sm" @click="detailVisible = false">Đóng</button>
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
import { RefreshCw, ArrowLeft, AlertTriangle, X, Search, Eye, Trash2 } from 'lucide-vue-next';
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
const MEMMAP_API = '/api/plugins/memmap-manager';
const activeTab = ref(route.query.tab === 'tool' ? 'tool' : (route.query.tab === 'create' ? 'create' : 'manager'));
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');
const profiles = ref<Row[]>([]);
const memmapProfiles = ref<Row[]>([]);
const registers = ref<Row[]>([]);
const detail = ref<Row | null>(null);
const detailVisible = ref(false);
const detailLoading = ref(false);

const form = ref({ connectivity: 'LoRaWAN', skuSuffix: '', longFw: '', soNumber: '', itemCode: '', memmapId: '' });
const profileTableEl = ref<HTMLElement>();
const registerTableEl = ref<HTMLElement>();
const detailTableEl = ref<HTMLElement>();
let profileTable: Tabulator | undefined;
let registerTable: Tabulator | undefined;
let detailTable: Tabulator | undefined;

const skuPrefix = computed(() => form.value.connectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-');
const sku = computed(() => `${skuPrefix.value}${form.value.skuSuffix.trim()}`);
const shortFw = computed(() => /^5F[A-Z0-9]{4}$/.test(form.value.longFw) ? form.value.longFw.charAt(0) : '');
const longFwError = computed(() => form.value.longFw && !/^5F[A-Z0-9]{4}$/.test(form.value.longFw) ? 'LONG_FW phải đúng mẫu 5FXXXX.' : '');
const soError = computed(() => form.value.soNumber && !/^SO\/\d{4}\/\d{5}$/.test(form.value.soNumber) ? 'SO_NUMBER phải đúng mẫu SO/2026/12345.' : '');

const selectedCount = computed(() => registers.value.filter(r => r.selected).length);
const invalidSelectedCount = computed(() => registers.value.filter(r => r.selected && r.configCheck === 'FAIL').length);
const hasInvalidSelected = computed(() => invalidSelectedCount.value > 0);
const invalidSelectedMessage = computed(() => `Có ${invalidSelectedCount.value} register được chọn nhưng cấu hình không hợp lệ.`);

const canCreate = computed(() => Boolean(
  sku.value &&
  shortFw.value &&
  /^SO\/\d{4}\/\d{5}$/.test(form.value.soNumber) &&
  form.value.itemCode.trim() &&
  form.value.memmapId &&
  registers.value.length &&
  selectedCount.value &&
  !hasInvalidSelected.value
));

function val(row: Row | undefined | null, ...keys: string[]) {
  if (!row) return '';
  const hit = keys.map(k => row[k]).find(v => v !== undefined && v !== null && v !== '');
  return hit !== undefined ? hit : '';
}

function normalizeLongFw() {
  form.value.longFw = form.value.longFw.toUpperCase().replace(/\s/g, '');
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
  const selectionColumn = editable ? [{ formatter: 'rowSelection', titleFormatter: 'rowSelection', width: 42, hozAlign: 'center', headerSort: false }] : [];
  return [
    ...selectionColumn,
    { title: 'Dec address', field: 'modbusRegisterDec', width: 105 },
    { title: 'Hex address', field: 'modbusRegisterHex', width: 105 },
    { title: 'Nums Reg', field: 'registerCount', width: 88 },
    { title: 'Description', field: 'description', minWidth: 150, widthGrow: 2 },
    { title: 'Format', field: 'format', width: 90 },
    { title: 'Comment', field: 'comment', minWidth: 125, widthGrow: 1 },
    { title: 'End-user Default', field: 'endUserDefault', minWidth: 130, widthGrow: 1 },
    {
      title: 'Input config',
      field: 'inputConfig',
      minWidth: 130,
      widthGrow: 1,
      editor: editable ? 'input' : false,
      cellEdited: (cell: any) => updateConfig(cell.getRow())
    },
    {
      title: 'Check',
      field: 'configCheck',
      width: 80,
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
      rowSelectionChanged: (selected: any[]) => {
        const selectedRows = new Set(selected.map((row: any) => row.getData()));
        registers.value.forEach(item => {
          item.selected = selectedRows.has(item);
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
    const [finalRows, maps] = await Promise.all([
      request<unknown>(API, '/profiles'),
      request<unknown>(MEMMAP_API, '/profiles')
    ]);
    profiles.value = Array.isArray(finalRows) ? (finalRows as Row[]) : [];
    memmapProfiles.value = Array.isArray(maps) ? (maps as Row[]) : [];
    await nextTick();
    renderProfiles();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Không thể tải dữ liệu Final Config';
  } finally {
    loading.value = false;
  }
}

async function loadMemmap() {
  registers.value = [];
  destroy(registerTable);
  registerTable = undefined;
  if (!form.value.memmapId) return;
  try {
    const source = await request<Row>(MEMMAP_API, `/profiles/${form.value.memmapId}`);
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
    cyberToast.error(e instanceof Error ? e.message : 'Không thể đọc Memmap Payload');
  }
}

function matchMemmap() {
  const longFw = form.value.longFw.trim().toUpperCase();
  if (!sku.value || !/^5F[A-Z0-9]{4}$/.test(longFw)) {
    form.value.memmapId = '';
    registers.value = [];
    destroy(registerTable);
    registerTable = undefined;
    return;
  }
  const match = memmapProfiles.value.find(profile =>
    String(val(profile, 'sku')).trim().toUpperCase() === sku.value.toUpperCase() &&
    String(val(profile, 'longFw', 'long_fw')).trim().toUpperCase() === longFw
  );
  form.value.memmapId = match ? String(match.id) : '';
  if (match) void loadMemmap();
  else {
    registers.value = [];
    destroy(registerTable);
    registerTable = undefined;
  }
}

async function createProfile() {
  if (!canCreate.value) return;
  saving.value = true;
  try {
    const payload = {
      connectivity: form.value.connectivity,
      sku: sku.value,
      longFw: form.value.longFw,
      shortFw: shortFw.value,
      soNumber: form.value.soNumber,
      itemCode: form.value.itemCode.trim(),
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
    cyberToast.error(e instanceof Error ? e.message : 'Không thể tạo Final Config');
  } finally {
    saving.value = false;
  }
}

function resetCreate() {
  form.value = { connectivity: 'LoRaWAN', skuSuffix: '', longFw: '', soNumber: '', itemCode: '', memmapId: '' };
  registers.value = [];
  destroy(registerTable);
  registerTable = undefined;
}

async function viewProfile(id: string) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    detail.value = await request<Row>(API, `/profiles/${id}`);
    await nextTick();
    destroy(detailTable);
    detailTable = undefined;
    if (detailTableEl.value && detail.value) {
      detailTable = new Tabulator(detailTableEl.value, {
        data: detail.value.registers || [],
        layout: 'fitDataStretch',
        height: '430px',
        columns: registerColumns(false) as any
      });
    }
  } catch (e) {
    cyberToast.error(e instanceof Error ? e.message : 'Không thể tải chi tiết');
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
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
watch([sku, () => form.value.longFw, memmapProfiles], matchMemmap);
onMounted(fetchProfiles);
onBeforeUnmount(() => {
  destroy(profileTable);
  destroy(registerTable);
  destroy(detailTable);
});
</script>

<style scoped>
.isolated-tool-wrapper {
  padding: 16px 20px;
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.isolated-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}

.isolated-title {
  font-family: var(--cyber-font-display, 'Rajdhani', sans-serif);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.final-config-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabulator-host {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

:deep(.tabulator) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.tabulator-header) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: currentColor !important;
  font-weight: 600;
}

:deep(.tabulator-row) {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: currentColor !important;
}

:deep(.tabulator-row:hover) {
  background-color: rgba(0, 240, 255, 0.05) !important;
}

:deep(.tabulator-row.tabulator-selected) {
  background-color: rgba(0, 240, 255, 0.1) !important;
}

:deep(.check-pass) {
  color: #67c23a;
  font-weight: bold;
}

:deep(.check-fail) {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.invalid-row) {
  background: rgba(245, 108, 108, 0.12) !important;
}
</style>
