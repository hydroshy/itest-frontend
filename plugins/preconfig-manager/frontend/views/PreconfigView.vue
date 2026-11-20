<template>
  <section class="preconfig-page w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header banner -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div>
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> PRECONFIG
        </div>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight text-base-content flex items-center gap-2.5 mt-0.5">
          <SlidersHorizontal class="w-6 h-6 text-primary" /> Preconfig Plugin
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">Cấu hình thiết bị trước khi đăng ký &amp; kiểm thử LoRaWAN từ Memmap Payload.</p>
      </div>
      <div class="header-actions flex items-center gap-2">
        <button class="btn btn-outline btn-sm gap-2" :disabled="loading" @click="fetchProfiles">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-4 h-4" />
          Làm mới
        </button>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'manager' }"
        @click="activeTab = 'manager'"
      >
        <Files class="w-4 h-4" />
        PRECONFIG MANAGER
      </button>
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'create' }"
        @click="activeTab = 'create'"
      >
        <Plus class="w-4 h-4" />
        CREATE PRECONFIG
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error text-sm mb-4">
      <AlertTriangle class="w-4 h-4 shrink-0" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button class="btn btn-ghost btn-xs btn-circle" @click="errorMessage = ''">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- TAB 1: PRECONFIG MANAGER -->
    <div v-show="activeTab === 'manager'">
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-base-content/10">
          <span class="font-bold text-base">Danh sách Preconfig Profiles</span>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm SO Number, WA Number, Item Code..."
                class="input input-bordered input-sm pl-9 w-64 md:w-80"
                @input="filterProfiles"
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

    <!-- TAB 2: CREATE PRECONFIG -->
    <div v-show="activeTab === 'create'">
      <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
        <div class="pb-3 mb-3 border-b border-base-content/10">
          <span class="font-bold text-base">Tạo Preconfig Mới</span>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-control">
              <label class="label py-1" for="preconfig-so"><span class="label-text font-semibold">SO_NUMBER *</span></label>
              <select id="preconfig-so" v-model="form.soNumber" class="select select-bordered w-full" :disabled="optionsLoading">
                <option value="">Chọn SO_NUMBER</option>
                <option v-for="so in options.soNumbers" :key="so" :value="so">{{ so }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-1" for="preconfig-wa"><span class="label-text font-semibold">WA_NUMBER *</span></label>
              <select id="preconfig-wa" v-model="form.waNumber" class="select select-bordered w-full" :disabled="!form.soNumber || optionsLoading">
                <option value="">Chọn WA_NUMBER</option>
                <option v-for="wa in options.waNumbers" :key="wa" :value="wa">{{ wa }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-1" for="preconfig-item"><span class="label-text font-semibold">ITEM_CODE *</span></label>
              <select id="preconfig-item" v-model="form.itemCode" class="select select-bordered w-full" :disabled="!form.waNumber || optionsLoading">
                <option value="">Chọn ITEM_CODE</option>
                <option v-for="item in options.itemCodes" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>
          <div v-if="optionsLoading || resolving" role="status" class="text-sm flex items-center gap-2">
            <span class="loading loading-spinner loading-xs text-primary"></span>
            <span>Đang tải dữ liệu cấu hình...</span>
          </div>
          <div v-if="createError" role="alert" class="alert alert-warning text-sm">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{{ createError }}</span>
          </div>
        </div>

        <div v-if="form.memmapId && !registers.length" class="alert alert-warning text-sm mt-4">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span>Memmap Payload không có register hợp lệ.</span>
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
            Tạo Preconfig
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Preconfig Profile -->
    <dialog class="modal" :class="{ 'modal-open': detailVisible }">
      <div class="modal-box w-11/12 max-w-5xl bg-base-200 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <SlidersHorizontal class="w-5 h-5 text-primary" />
            <span>Chi tiết Preconfig Profile: {{ detail?.soNumber }} / {{ detail?.waNumber }}</span>
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="detailVisible = false">✕</button>
        </div>

        <div v-if="detailLoading" class="py-8 flex justify-center">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>
        <div v-else-if="detail" class="space-y-4 py-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-base-100 p-3 rounded-lg border border-base-content/10 text-xs">
            <div><span class="text-base-content/60">SO Number:</span> <strong class="block font-mono">{{ detail.soNumber }}</strong></div>
            <div><span class="text-base-content/60">WA Number:</span> <strong class="block font-mono">{{ detail.waNumber || '—' }}</strong></div>
            <div><span class="text-base-content/60">Item Code:</span> <strong class="block font-mono">{{ detail.itemCode }}</strong></div>
            <div><span class="text-base-content/60">Số Registers:</span> <strong class="block font-mono text-primary">{{ detail.registersCount }}</strong></div>
          </div>
          <div ref="detailTableEl" class="tabulator-host" />
        </div>
        <div class="modal-action">
          <button class="btn btn-sm" @click="detailVisible = false">Đóng</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="detailVisible = false">
        <button>close</button>
      </form>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
  Plus,
  Files,
  AlertTriangle,
  X,
} from 'lucide-vue-next';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { cyberToast } from '@/services/cyberToast';
import { cyberConfirm } from '@/services/cyberConfirm';
import { validateRegisterConfig } from '../utils/validator';

const API = '/api/plugins/preconfig';

interface Row {
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    initialTab?: 'manager' | 'create';
  }>(),
  {
    initialTab: 'manager',
  }
);

const activeTab = ref<'manager' | 'create'>(props.initialTab);

watch(() => props.initialTab, (newTab) => {
  if (newTab) activeTab.value = newTab;
});
const loading = ref(false);
const saving = ref(false);
const optionsLoading = ref(false);
const resolving = ref(false);
const errorMessage = ref('');
const createError = ref('');
const searchQuery = ref('');

const profiles = ref<Row[]>([]);
const registers = ref<Row[]>([]);
const options = ref<{ soNumbers: string[]; waNumbers: string[]; itemCodes: string[] }>({
  soNumbers: [],
  waNumbers: [],
  itemCodes: [],
});

const form = ref({
  soNumber: '',
  waNumber: '',
  itemCode: '',
  memmapId: '',
  connectivity: 'LoRaWAN',
});

const profileTableEl = ref<HTMLElement | null>(null);
const registerTableEl = ref<HTMLElement | null>(null);
const detailTableEl = ref<HTMLElement | null>(null);
let profileTable: Tabulator | undefined;
let registerTable: Tabulator | undefined;
let detailTable: Tabulator | undefined;

let optionsRequest = 0;
let resolveRequest = 0;

const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref<Row | null>(null);

const selectedCount = ref(0);

const invalidSelected = computed(() =>
  registers.value.filter(r => r.selected && r.configCheck === 'FAIL')
);

const hasInvalidSelected = computed(() => invalidSelected.value.length > 0);

const invalidSelectedMessage = computed(() => {
  if (!hasInvalidSelected.value) return '';
  const first = invalidSelected.value[0];
  return `Thanh ghi Dec ${first.modbusRegisterDec}: ${first.configError || 'Giá trị cấu hình không hợp lệ'}`;
});

const canCreate = computed(() => (
  form.value.soNumber &&
  form.value.waNumber &&
  form.value.itemCode &&
  form.value.memmapId &&
  !createError.value &&
  !resolving.value &&
  registers.value.length &&
  selectedCount.value > 0 &&
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

function profileColumns() {
  return [
    { title: 'SO Number', field: 'soNumber', minWidth: 160 },
    { title: 'WA Number', field: 'waNumber', minWidth: 150 },
    { title: 'Item Code', field: 'itemCode', minWidth: 160 },
    { title: 'Connectivity', field: 'connectivity', width: 125 },
    { title: 'Registers', field: 'registersCount', width: 105 },
    { title: 'Created at', field: 'createdAt', minWidth: 150 },
    {
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
    }
  ];
}

function renderProfiles() {
  destroy(profileTable);
  profileTable = undefined;
  if (!profileTableEl.value) return;
  try {
    profileTable = new Tabulator(profileTableEl.value, {
      data: profiles.value,
      layout: 'fitColumns',
      placeholder: 'Chưa có Preconfig profile nào.',
      columns: profileColumns() as any,
      rowDblClick: (_e: Event, row: any) => {
        const d = row.getData();
        if (d?.id) viewProfile(String(d.id));
      },
    });
  } catch (e) {
    console.error('Failed to init profileTable:', e);
  }
}

function filterProfiles() {
  if (!profileTable) return;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) {
    profileTable.clearFilter();
    return;
  }
  profileTable.setFilter([
    [
      { field: 'soNumber', type: 'like', value: q },
      { field: 'waNumber', type: 'like', value: q },
      { field: 'itemCode', type: 'like', value: q },
    ]
  ]);
}

function registerColumns(editable: boolean) {
  const selectionColumn = editable ? [{
    formatter: 'rowSelection',
    titleFormatter: 'rowSelection',
    width: 45,
    hozAlign: 'center',
    headerSort: false,
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
      formatter: (cell: any) => `<span class="badge badge-xs font-mono font-bold ${cell.getValue() === 'PASS' ? 'badge-success text-success-content' : 'badge-error text-error-content'}">${cell.getValue()}</span>`
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
    });
    registerTable.on('rowSelectionChanged', (selectedData: any[]) => {
      selectedCount.value = (selectedData || []).length;
      const selectedDecs = new Set((selectedData || []).map((d: any) => d?.modbusRegisterDec));
      registers.value.forEach(item => {
        item.selected = selectedDecs.has(item.modbusRegisterDec);
      });
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
}

async function fetchProfiles() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const rows = await request<Row[]>(API, '/profiles');
    profiles.value = Array.isArray(rows) ? rows : [];
    await nextTick();
    renderProfiles();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Không thể tải dữ liệu Preconfig Profiles';
  } finally {
    loading.value = false;
  }
}

function clearResolved() {
  resolveRequest++;
  resolving.value = false;
  form.value.memmapId = '';
  registers.value = [];
  selectedCount.value = 0;
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
    form.value.connectivity = String(source.connectivity || 'LoRaWAN');
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
        selected: false,
        configCheck: check.valid ? 'PASS' : 'FAIL',
        configError: check.error || ''
      };
    }).sort((a, b) => a.modbusRegisterDec - b.modbusRegisterDec);
    await nextTick();
    renderRegisters();
  } catch (e) {
    if (requestId === resolveRequest) createError.value = e instanceof Error ? e.message : 'Vui lòng liên hệ ENGINEERING';
  } finally {
    if (requestId === resolveRequest) resolving.value = false;
  }
}

async function createProfile() {
  const selectedRows = (registerTable && registerTable.getSelectedData)
    ? registerTable.getSelectedData()
    : registers.value.filter(r => r.selected === true);

  if (selectedRows.length === 0) {
    cyberToast.warning('Vui lòng tích chọn ít nhất 1 thanh ghi cần cấu hình!');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      connectivity: form.value.connectivity,
      soNumber: form.value.soNumber,
      waNumber: form.value.waNumber,
      itemCode: form.value.itemCode,
      registers: selectedRows.map((r: any, idx: number) => ({
        rowNumber: idx + 1,
        modbusRegisterDec: r.modbusRegisterDec,
        modbusRegisterHex: r.modbusRegisterHex,
        registerCount: r.registerCount,
        description: r.description,
        format: r.format,
        comment: r.comment,
        endUserDefault: r.endUserDefault,
        inputConfig: r.inputConfig || r.endUserDefault,
        configCheck: r.configCheck || 'PASS',
        selected: true
      }))
    };
    await request(API, '/profiles', { method: 'POST', body: JSON.stringify(payload) });
    cyberToast.success(`Đã tạo Preconfig Profile thành công (${selectedRows.length} thanh ghi được chọn)`);
    resetCreate();
    activeTab.value = 'manager';
    await fetchProfiles();
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Không thể tạo Preconfig Profile';
    cyberToast.error(createError.value);
  } finally {
    saving.value = false;
  }
}

function resetCreate() {
  form.value = { soNumber: '', waNumber: '', itemCode: '', memmapId: '', connectivity: 'LoRaWAN' };
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
      layout: 'fitColumns',
      height: '430px',
      placeholder: 'Không có dữ liệu register',
      columns: registerColumns(false) as any
    });
  }
}

async function removeProfile(row: Row) {
  const confirmed = await cyberConfirm(`Bạn có chắc chắn muốn xóa Preconfig Profile cho SO "${row.soNumber}"?`);
  if (!confirmed) return;
  try {
    await request(API, `/profiles/${row.id}`, { method: 'DELETE' });
    cyberToast.success('Đã xóa Preconfig Profile');
    await fetchProfiles();
  } catch (e) {
    cyberToast.error(e instanceof Error ? e.message : 'Không thể xóa Preconfig Profile');
  }
}

watch(() => form.value.soNumber, () => {
  form.value.waNumber = '';
  form.value.itemCode = '';
  clearResolved();
  loadOptions();
});

watch(() => form.value.waNumber, () => {
  form.value.itemCode = '';
  clearResolved();
  loadOptions();
});

watch(() => form.value.itemCode, () => {
  if (form.value.itemCode) {
    resolveMemmap();
  } else {
    clearResolved();
  }
});

watch(activeTab, (tab) => {
  if (tab === 'manager') {
    nextTick(() => renderProfiles());
  } else if (tab === 'create') {
    loadOptions();
    nextTick(() => renderRegisters());
  }
});

onMounted(() => {
  fetchProfiles();
  loadOptions();
});

onUnmounted(() => {
  destroy(profileTable);
  destroy(registerTable);
  destroy(detailTable);
});
</script>
