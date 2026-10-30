<template>
  <section class="memmap-page">
    <header class="page-header">
      <div>
        <div class="eyebrow"><span class="live-dot" /> MEMMAP PAYLOAD</div>
        <h2>Memmap Payload</h2>
        <p>Quản lý profile và tải lên payload IEC485 có kiểm tra trước khi lưu.</p>
      </div>
      <button class="btn btn-sm btn-outline btn-info gap-2" :disabled="loading" @click="fetchProfiles">
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        <span>Làm mới</span>
      </button>
    </header>

    <div v-if="errorMessage" role="alert" class="alert alert-error text-sm flex items-center justify-between py-2.5 shadow-sm">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
      <button class="btn btn-ghost btn-xs btn-circle" @click="errorMessage = ''">✕</button>
    </div>

    <div role="tablist" class="tabs tabs-boxed bg-base-300 p-1 w-fit mb-2">
      <button
        role="tab"
        type="button"
        class="tab text-xs font-semibold tracking-wider transition-all"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow': activeTab === 'manager' }"
        @click="changeTab('manager')"
      >
        Memmap Manager
      </button>
      <button
        role="tab"
        type="button"
        class="tab text-xs font-semibold tracking-wider transition-all"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow': activeTab === 'upload' }"
        @click="changeTab('upload')"
      >
        Memmap Upload
      </button>
    </div>

    <!-- TAB 1: Memmap Manager -->
    <div v-show="activeTab === 'manager'" class="tab-content">
      <div class="card bg-base-200 border border-base-content/10 shadow-sm">
        <div class="card-body p-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-content/10">
            <span class="font-bold text-sm text-base-content">Danh sách Memmap Payload</span>
            <input
              v-model="searchQuery"
              type="text"
              class="input input-sm input-bordered bg-base-100 w-72 text-xs"
              placeholder="Tìm SKU, firmware hoặc profile..."
            />
          </div>
          <div v-show="loading" class="flex items-center justify-center py-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>
          <div ref="profileTableEl" class="tabulator-host profile-table-host mt-2" />
          <p v-if="!loading && !profiles.length" class="empty-text text-center py-6 text-sm text-base-content/50">Chưa có Memmap Payload nào.</p>
          <p class="table-hint text-xs text-base-content/60 mt-2">Nhấp chuột phải để xem hoặc xóa profile.</p>
        </div>
      </div>
    </div>

    <!-- TAB 2: Memmap Upload -->
    <div v-show="activeTab === 'upload'" class="tab-content">
      <div class="card bg-base-200 border border-base-content/10 shadow-sm">
        <div class="card-body p-4">
          <div class="pb-3 border-b border-base-content/10 mb-3">
            <span class="font-bold text-sm text-base-content">Tải lên Memmap Payload</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
            <div class="form-control md:col-span-4">
              <label class="label py-1"><span class="label-text text-xs font-medium">Sensors Connectivity <span class="text-error">*</span></span></label>
              <select v-model="uploadForm.connectivity" class="select select-sm select-bordered bg-base-100 w-full" @change="invalidatePreview">
                <option value="LoRaWAN">LoRaWAN</option>
                <option value="Sigfox">Sigfox</option>
              </select>
            </div>
            <div class="form-control md:col-span-4">
              <label class="label py-1"><span class="label-text text-xs font-medium">SKU ({{ skuPrefix }}) <span class="text-error">*</span></span></label>
              <input
                v-model="uploadForm.skuSuffix"
                type="text"
                class="input input-sm input-bordered bg-base-100 w-full"
                placeholder="Ví dụ: R100"
                @input="invalidatePreview"
              />
            </div>
            <div class="form-control md:col-span-2">
              <label class="label py-1"><span class="label-text text-xs font-medium">LONG_FW <span class="text-error">*</span></span></label>
              <input
                v-model="uploadForm.longFw"
                type="text"
                maxlength="6"
                class="input input-sm input-bordered bg-base-100 w-full"
                :class="{ 'input-error': longFirmwareError }"
                @input="normalizeLongFirmware"
              />
              <span v-if="longFirmwareError" class="text-[11px] text-error mt-1">{{ longFirmwareError }}</span>
            </div>
            <div class="form-control md:col-span-2">
              <label class="label py-1"><span class="label-text text-xs font-medium">SHORT_FW</span></label>
              <input
                :value="shortFirmware"
                disabled
                type="text"
                class="input input-sm input-bordered bg-base-300 text-base-content/70 w-full cursor-not-allowed"
                placeholder="Tự động"
              />
            </div>
          </div>

          <div class="form-control mb-4">
            <div class="flex flex-wrap items-center gap-3">
              <label class="btn btn-sm btn-outline btn-info gap-2 cursor-pointer">
                <Upload class="w-4 h-4" />
                <span>{{ selectedFile ? 'Đổi tệp CSV' : 'Chọn tệp CSV' }}</span>
                <input type="file" accept=".csv" class="hidden" @change="onFileInputChange" />
              </label>
              <span v-if="selectedFile" class="text-xs text-base-content/80 font-mono flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded border border-base-content/10">
                <FileText class="w-3.5 h-3.5 text-info" />
                {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
                <button type="button" class="btn btn-ghost btn-xs btn-circle ml-1" @click="handleFileRemove">✕</button>
              </span>
              <span v-else class="text-xs text-base-content/50">Chưa chọn tệp</span>
            </div>
            <div class="text-[11px] text-base-content/60 mt-1.5">
              Định dạng Payload: <strong class="text-base-content/80">IEC485 CSV</strong> · RFC 4180 / Multipart · Validation Decimal + Hex — kiểm tra từng dòng.
            </div>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <button
              type="button"
              class="btn btn-sm btn-outline btn-secondary gap-2"
              :disabled="!canPreview || previewLoading"
              @click="runPreview"
            >
              <span v-if="previewLoading" class="loading loading-spinner loading-xs"></span>
              Kiểm tra &amp; Preview
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary gap-2"
              :disabled="!canUpload || importing"
              @click="submitImport"
            >
              <span v-if="importing" class="loading loading-spinner loading-xs"></span>
              <Upload v-else class="w-4 h-4" />
              Upload Payload
            </button>
          </div>

          <div v-if="previewResult && !previewResult.valid" role="alert" class="alert alert-error text-xs py-2.5 shadow-sm mb-4">
            <div>
              <span class="font-bold">Payload chưa hợp lệ:</span>
              <ul class="list-disc list-inside mt-1">
                <li v-for="(err, idx) in previewResult.errors" :key="idx">{{ (typeof err === 'object' && err) ? ((err as any).message || JSON.stringify(err)) : String(err) }}</li>
              </ul>
            </div>
          </div>

          <div v-if="previewResult" class="preview-box p-3 bg-base-300/50 rounded-lg border border-base-content/10">
            <div class="flex flex-wrap items-center gap-3 text-xs mb-3">
              <span class="badge" :class="previewResult.valid ? 'badge-success' : 'badge-error'">
                {{ previewResult.valid ? 'Sẵn sàng Upload' : 'Cần sửa lỗi' }}
              </span>
              <span><strong>SKU:</strong> {{ sku }}</span>
              <span><strong>LONG_FW:</strong> {{ uploadForm.longFw }}</span>
              <span><strong>SHORT_FW:</strong> {{ shortFirmware }}</span>
              <span><strong>Registers:</strong> {{ previewResult.registers?.length || 0 }}</span>
              <span class="badge badge-sm" :class="previewResult.profile?.decimalCheck === false ? 'badge-error' : 'badge-success'">
                DEC: {{ previewResult.profile?.decimalCheck === false ? 'FAIL' : 'PASS' }}
              </span>
              <span class="badge badge-sm" :class="previewResult.profile?.hexCheck === false ? 'badge-error' : 'badge-success'">
                HEX: {{ previewResult.profile?.hexCheck === false ? 'FAIL' : 'PASS' }}
              </span>
              <span v-if="previewInvalidRowsCount > 0" class="badge badge-sm badge-error">{{ previewInvalidRowsCount }} dòng lỗi</span>
              <span v-if="currentUsername"><strong>Created by:</strong> {{ currentUsername }}</span>
            </div>
            <div ref="previewTableEl" class="tabulator-host register-table-host" />
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT PROFILE -->
    <dialog class="modal" :class="{ 'modal-open': detailDialogVisible }">
      <div class="modal-box w-11/12 max-w-7xl bg-base-200 border border-base-content/10 shadow-2xl p-6">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10 mb-4">
          <h3 class="font-bold text-base text-base-content">
            Chi tiết: {{ profileLabel(currentProfile) || 'Memmap Payload' }}
          </h3>
          <button type="button" class="btn btn-sm btn-ghost btn-circle" @click="closeDetailDialog">✕</button>
        </div>
        <div v-if="detailLoading" class="flex items-center justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <div v-else>
          <div v-if="currentProfile" class="flex flex-wrap items-center gap-4 text-xs mb-4 bg-base-100 p-3 rounded-lg border border-base-content/10">
            <span><strong>SKU:</strong> {{ valueOf(currentProfile, 'sku') || '—' }}</span>
            <span><strong>LONG_FW:</strong> {{ valueOf(currentProfile, 'longFw', 'long_fw') || '—' }}</span>
            <span><strong>SHORT_FW:</strong> {{ valueOf(currentProfile, 'shortFw', 'short_fw') || '—' }}</span>
            <span><strong>DEC check:</strong> {{ valueOf(currentProfile, 'decimalCheck', 'decCheck', 'dec_check') ?? '—' }}</span>
            <span><strong>HEX check:</strong> {{ valueOf(currentProfile, 'hexCheck', 'hex_check') ?? '—' }}</span>
            <span><strong>Created by:</strong> {{ valueOf(currentProfile, 'createdBy', 'created_by') || '—' }}</span>
          </div>
          <div ref="detailTableEl" class="tabulator-host register-table-host" />
        </div>
        <div class="modal-action mt-6 pt-3 border-t border-base-content/10">
          <button type="button" class="btn btn-sm btn-ghost" @click="closeDetailDialog">Đóng</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="closeDetailDialog">close</button>
      </form>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { RefreshCw, Upload, FileText, AlertTriangle } from 'lucide-vue-next';
import { cyberToast as ElMessage } from '@/services/cyberToast';
import { cyberConfirm as ElMessageBox } from '@/services/cyberConfirm';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const API_BASE = '/api/plugins/memmap-manager';
type RecordRow = Record<string, unknown>;
interface PreviewResponse { valid: boolean; profile?: RecordRow; registers?: RecordRow[]; errors?: string[]; }

const route = useRoute();
const authStore = useAuthStore();
const currentUsername = computed(() => authStore.user?.username || (localStorage.getItem('itest_user') ? (() => { try { return JSON.parse(localStorage.getItem('itest_user') || '{}')?.username || ''; } catch { return ''; } })() : ''));

const activeTab = ref(route?.query?.tab === 'upload' ? 'upload' : 'manager');
const loading = ref(false);
const errorMessage = ref('');
const profiles = ref<RecordRow[]>([]);
const searchQuery = ref('');

watch(() => route?.query?.tab, (t) => {
  if (t === 'upload' || t === 'manager') activeTab.value = t;
});

function changeTab(tab: 'manager' | 'upload') {
  activeTab.value = tab;
  handleTabChange(tab);
}

const selectedFile = ref<File | null>(null);
const previewLoading = ref(false);
const importing = ref(false);
const previewResult = ref<PreviewResponse | null>(null);

const uploadForm = ref({ connectivity: 'LoRaWAN', skuSuffix: '', longFw: '' });
const skuPrefix = computed(() => uploadForm.value.connectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-');
const sku = computed(() => `${skuPrefix.value}${uploadForm.value.skuSuffix.trim()}`);

const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const currentProfile = ref<RecordRow | null>(null);

const profileTableEl = ref<HTMLElement>();
const previewTableEl = ref<HTMLElement>();
const detailTableEl = ref<HTMLElement>();
let profileTable: Tabulator | undefined;
let previewTable: Tabulator | undefined;
let detailTable: Tabulator | undefined;

const longFirmwareValid = computed(() => /^\dF\d{4}$/i.test(uploadForm.value.longFw));
const longFirmwareError = computed(() => uploadForm.value.longFw && !longFirmwareValid.value ? 'LONG_FW phải đúng mẫu XFXXXX (X là các chữ số 0-9).' : '');
const shortFirmware = computed(() => longFirmwareValid.value ? uploadForm.value.longFw.charAt(0) : '');
const canPreview = computed(() => Boolean(uploadForm.value.skuSuffix.trim() && longFirmwareValid.value && selectedFile.value));
const canUpload = computed(() => canPreview.value && previewResult.value?.valid === true && previewInvalidRowsCount.value === 0 && (previewResult.value?.errors?.length ?? 0) === 0);
const previewInvalidRowsCount = computed(() => (previewResult.value?.registers || []).filter((r: RecordRow) => r.decimalValid === false || r.hexValid === false).length);

function valueOf(row: RecordRow | null | undefined, ...keys: string[]) {
  for (const key of keys) {
    const v = row?.[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function profileLabel(p?: RecordRow | null) {
  return String(valueOf(p, 'sku', 'name', 'profileName') || '');
}

function formatDate(v?: unknown) {
  if (!v) return '—';
  const date = new Date(String(v));
  return Number.isNaN(date.valueOf()) ? String(v) : date.toLocaleString('vi-VN');
}

const registerColumns = [
  { title: 'No.', field: 'rowNumber', width: 72, frozen: true, formatter: (c: any) => valueOf(c.getRow().getData(), 'rowNumber', 'no', 'No.') ?? '—' },
  { title: 'Modbus Register (Decimal)', field: 'modbusRegisterDecimal', minWidth: 170, formatter: (c: any) => valueOf(c.getRow().getData(), 'modbusRegisterDecimal', 'modbusRegisterDec', 'modbus_register_dec', 'address') ?? '—' },
  { title: 'Modbus Register (Hex)', field: 'modbusRegisterHex', minWidth: 155, formatter: (c: any) => valueOf(c.getRow().getData(), 'modbusRegisterHex', 'modbus_register_hex', 'hex') ?? '—' },
  { title: 'Function Code (Read)', field: 'functionCodeRead', minWidth: 140, formatter: (c: any) => valueOf(c.getRow().getData(), 'functionCodeRead', 'fcRead', 'fc_read') ?? '—' },
  { title: 'Function Code (Write)', field: 'functionCodeWrite', minWidth: 145, formatter: (c: any) => valueOf(c.getRow().getData(), 'functionCodeWrite', 'fcWrite', 'fc_write', 'accessMode') ?? '—' },
  { title: '# of Registers', field: 'registerCount', minWidth: 120, formatter: (c: any) => valueOf(c.getRow().getData(), 'registerCount', 'numRegisters', 'num_registers') ?? '—' },
  { title: 'Description', field: 'description', minWidth: 220, formatter: (c: any) => valueOf(c.getRow().getData(), 'description', 'name') ?? '—' },
  { title: 'Range', field: 'range', minWidth: 150 },
  { title: 'End-user Default', field: 'endUserDefault', minWidth: 145, formatter: (c: any) => valueOf(c.getRow().getData(), 'endUserDefault', 'end_user_default', 'defaultValue') ?? '—' },
  { title: 'Format', field: 'format', minWidth: 120, formatter: (c: any) => valueOf(c.getRow().getData(), 'format', 'dataType') ?? '—' },
  { title: 'Downlink 5', field: 'downlink5', minWidth: 110, formatter: (c: any) => valueOf(c.getRow().getData(), 'downlink5', 'downlink_5') ?? '—' },
  { title: 'In RD1 Template', field: 'inRd1Template', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'inRd1Template', 'in_rd1_template') ?? '—' },
  { title: 'Comment', field: 'comment', minWidth: 200, formatter: (c: any) => valueOf(c.getRow().getData(), 'comment', 'notes') ?? '—' },
];

function makeRegisterTable(host: HTMLElement, data: RecordRow[]) {
  return new Tabulator(host, {
    data,
    layout: 'fitDataStretch',
    responsiveLayout: false,
    height: '440px',
    pagination: true,
    paginationSize: 25,
    paginationSizeSelector: [25, 50, 100],
    movableColumns: true,
    columns: registerColumns as any,
    rowFormatter: (row: any) => {
      const d = row.getData();
      if (d.decimalValid === false || d.hexValid === false) row.getElement().classList.add('table-row-invalid');
    },
  });
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = localStorage.getItem('itest_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Lỗi yêu cầu: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function destroyTable(t?: Tabulator) {
  t?.destroy();
}

function renderProfileTable() {
  destroyTable(profileTable);
  if (!profileTableEl.value) return;
  profileTable = new Tabulator(profileTableEl.value, {
    data: profiles.value,
    layout: 'fitColumns',
    placeholder: 'Chưa có Memmap Payload nào',
    columns: [
      { title: 'SKU / Profile', field: 'sku', minWidth: 220, formatter: (c: any) => profileLabel(c.getRow().getData()) || '—' },
      { title: 'LONG_FW', field: 'longFw', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'longFw', 'long_fw') ?? '—' },
      { title: 'SHORT_FW', field: 'shortFw', minWidth: 125, formatter: (c: any) => valueOf(c.getRow().getData(), 'shortFw', 'short_fw') ?? '—' },
      { title: 'Registers', field: 'registersCount', width: 110, hozAlign: 'right', formatter: (c: any) => String((c.getRow().getData().registers as unknown[] | undefined)?.length ?? valueOf(c.getRow().getData(), 'registersCount', 'registers_count') ?? 0) },
      { title: 'Created by', field: 'createdBy', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'createdBy', 'created_by') ?? '—' },
      { title: 'Date create', field: 'dateCreate', minWidth: 180, formatter: (c: any) => formatDate(valueOf(c.getRow().getData(), 'dateCreate', 'date_create', 'createdAt')) },
    ],
    rowContextMenu: [
      { label: 'Xem profile', action: (_e: Event, row: any) => viewDetail(String(row.getData().id)) },
      { label: 'Xóa profile', action: (_e: Event, row: any) => deleteProfile(row.getData()) },
    ],
    rowDblClick: (_e: Event, row: any) => viewDetail(String(row.getData().id)),
  });
  applyProfileFilter();
}

function applyProfileFilter() {
  const q = searchQuery.value.trim().toLowerCase();
  if (!profileTable) return;
  if (!q) profileTable.clearFilter(true);
  else profileTable.setFilter((row: RecordRow) => JSON.stringify(row).toLowerCase().includes(q));
}

async function fetchProfiles() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await request<unknown>('/profiles');
    profiles.value = Array.isArray(data) ? (data as RecordRow[]) : [];
    await nextTick();
    renderProfileTable();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Không thể tải danh sách payload';
    profiles.value = [];
  } finally {
    loading.value = false;
  }
}

async function viewDetail(id: string) {
  detailDialogVisible.value = true;
  detailLoading.value = true;
  currentProfile.value = null;
  try {
    currentProfile.value = await request<RecordRow>(`/profiles/${id}`);
    await nextTick();
    renderDetailTable();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'Không thể tải profile');
    detailDialogVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function renderDetailTable() {
  destroyDetailTable();
  if (detailTableEl.value) {
    detailTable = makeRegisterTable(detailTableEl.value, (currentProfile.value?.registers as RecordRow[] | undefined) || []);
  }
}

function destroyDetailTable() {
  destroyTable(detailTable);
  detailTable = undefined;
}

function closeDetailDialog() {
  detailDialogVisible.value = false;
  destroyDetailTable();
}

async function deleteProfile(profile: RecordRow) {
  try {
    await ElMessageBox.confirm(
      `Xóa ${profileLabel(profile) || 'profile này'} và toàn bộ registers? Thao tác không thể hoàn tác.`,
      'Xác nhận xóa',
      { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }
    );
    await request(`/profiles/${profile.id}`, { method: 'DELETE' });
    ElMessage.success('Đã xóa Memmap Payload');
    await fetchProfiles();
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') {
      ElMessage.error(e instanceof Error ? e.message : 'Không thể xóa payload');
    }
  }
}

function normalizeLongFirmware() {
  uploadForm.value.longFw = uploadForm.value.longFw.toUpperCase().replace(/\s/g, '');
  invalidatePreview();
}

function invalidatePreview() {
  if (previewResult.value) {
    previewResult.value = null;
    destroyTable(previewTable);
    previewTable = undefined;
  }
}

function onFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    invalidatePreview();
    if (canPreview.value) void runPreview();
  }
}

function handleFileRemove() {
  selectedFile.value = null;
  invalidatePreview();
}

function appendPayload(form: FormData) {
  if (!selectedFile.value) return;
  form.append('file', selectedFile.value);
  form.append('sku', sku.value);
  form.append('longFw', uploadForm.value.longFw);
  form.append('shortFw', shortFirmware.value);
  const author = currentUsername.value;
  if (author) form.append('createdBy', author);
}

async function runPreview() {
  if (!canPreview.value) return;
  previewLoading.value = true;
  try {
    const form = new FormData();
    appendPayload(form);
    previewResult.value = await request<PreviewResponse>('/import/preview', { method: 'POST', body: form });
    await nextTick();
    destroyTable(previewTable);
    if (previewTableEl.value) {
      previewTable = makeRegisterTable(previewTableEl.value, previewResult.value.registers || []);
    }
    ElMessage[previewResult.value.valid ? 'success' : 'warning'](previewResult.value.valid ? 'Payload hợp lệ và sẵn sàng Upload' : 'Payload có lỗi');
  } catch (e) {
    previewResult.value = { valid: false, errors: [e instanceof Error ? e.message : 'Lỗi khi preview'] };
  } finally {
    previewLoading.value = false;
  }
}

async function submitImport() {
  if (!canUpload.value) return;
  importing.value = true;
  try {
    const form = new FormData();
    appendPayload(form);
    await request('/import', { method: 'POST', body: form });
    ElMessage.success('Đã upload Memmap Payload');
    selectedFile.value = null;
    previewResult.value = null;
    activeTab.value = 'manager';
    await fetchProfiles();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'Không thể upload payload');
  } finally {
    importing.value = false;
  }
}

function handleTabChange(tab: string | number) {
  if (tab === 'manager') fetchProfiles();
}

watch(searchQuery, applyProfileFilter);
onMounted(fetchProfiles);
onBeforeUnmount(() => {
  destroyTable(profileTable);
  destroyTable(previewTable);
  destroyDetailTable();
});
</script>

<style scoped>
.memmap-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: transparent;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--cyber-cyan, #00f0ff);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyber-cyan, #00f0ff);
  box-shadow: 0 0 8px var(--cyber-cyan, #00f0ff);
}
.page-header h2 {
  margin: 4px 0;
  font-family: var(--cyber-font-display, 'Rajdhani', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #f1f5f9;
}
.page-header p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}
.tabulator-host {
  width: 100%;
}
.profile-table-host {
  min-height: 140px;
}
.register-table-host {
  min-height: 240px;
}
:deep(.tabulator) {
  font-size: 12px;
  border-color: rgba(0, 240, 255, 0.2);
  background-color: transparent !important;
}
:deep(.tabulator .tabulator-header) {
  background: rgba(8, 12, 20, 0.85) !important;
  color: var(--cyber-cyan, #00f0ff) !important;
  border-bottom: 2px solid rgba(0, 240, 255, 0.3) !important;
}
:deep(.tabulator .tabulator-row) {
  background: transparent !important;
  color: #cbd5e1 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}
:deep(.tabulator .tabulator-row.tabulator-row-even) {
  background: rgba(0, 240, 255, 0.02) !important;
}
:deep(.tabulator .tabulator-row:hover) {
  background-color: rgba(0, 240, 255, 0.08) !important;
}
:deep(.tabulator .tabulator-row.table-row-invalid) {
  background-color: rgba(239, 68, 68, 0.2) !important;
  color: #fca5a5 !important;
}
:deep(.tabulator .tabulator-row.table-row-invalid:hover) {
  background-color: rgba(239, 68, 68, 0.3) !important;
}
:deep(.tabulator .tabulator-header .tabulator-col.tabulator-frozen) {
  background: #0d1527 !important;
}
:deep(.tabulator .tabulator-row .tabulator-cell.tabulator-frozen) {
  background: #0d1527 !important;
}
:deep(.tabulator .tabulator-row.tabulator-row-even .tabulator-cell.tabulator-frozen) {
  background: #0b1120 !important;
}
:deep(.tabulator .tabulator-row:hover .tabulator-cell.tabulator-frozen) {
  background: #162238 !important;
}
:deep(.tabulator .tabulator-cell) {
  border-right-color: rgba(255, 255, 255, 0.06) !important;
}
:deep(.tabulator .tabulator-footer) {
  background: rgba(8, 12, 20, 0.85) !important;
  border-top: 1px solid rgba(0, 240, 255, 0.2) !important;
  color: #94a3b8 !important;
}
:deep(.tabulator-page) {
  background: rgba(13, 20, 36, 0.8) !important;
  border-color: rgba(0, 240, 255, 0.2) !important;
  color: #cbd5e1 !important;
}
:deep(.tabulator-page.active) {
  background: var(--cyber-cyan, #00f0ff) !important;
  color: #0b1120 !important;
}
</style>
