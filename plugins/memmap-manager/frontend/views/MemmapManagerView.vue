<template>
  <section class="memmap-page">
    <header class="page-header">
      <div>
        <div class="eyebrow"><span class="live-dot"></span> MEMMAP MANAGER</div>
        <h2>Memory Map &amp; Profile Manager</h2>
        <p>Quản lý profile và toàn bộ bản ghi IEC485 theo từng hàng dữ liệu.</p>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" :icon="Refresh" @click="fetchProfiles">Làm mới</el-button>
        <el-button type="primary" :icon="Upload" @click="openImportDialog">Import MemMap</el-button>
      </div>
    </header>

    <el-alert v-if="errorMessage" type="error" show-icon class="load-alert" :title="errorMessage" @close="errorMessage = ''" />

    <el-row :gutter="16" class="summary-row">
      <el-col :xs="24" :sm="12" :lg="8"><el-card shadow="never" class="summary-card"><span class="summary-label">Tổng số Profiles</span><strong class="count-value">{{ profiles.length }}</strong><small>Profile đã lưu</small></el-card></el-col>
      <el-col :xs="24" :sm="12" :lg="8"><el-card shadow="never" class="summary-card"><span class="summary-label">Định dạng hỗ trợ</span><strong class="format-value">JSON, CSV</strong><small>RFC 4180 / Multipart</small></el-card></el-col>
      <el-col :xs="24" :sm="12" :lg="8"><el-card shadow="never" class="summary-card"><span class="summary-label">Kiểm tra import</span><strong class="security-value">Decimal + Hex</strong><small>Validate từng hàng</small></el-card></el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <template #header><div class="card-header-flex"><span>Danh sách MemMap Profiles</span><el-input v-model="searchQuery" placeholder="Tìm SKU, firmware hoặc profile..." clearable style="width: 300px" /></div></template>
      <div v-loading="loading" ref="profileTableEl" class="tabulator-host profile-table-host" />
      <p v-if="!loading && !profiles.length" class="empty-text">Chưa có MemMap profile nào.</p>
      <p class="table-hint">Nhấp chuột phải vào profile để xem hoặc xóa.</p>
    </el-card>

    <el-dialog v-model="importDialogVisible" title="Import MemMap Profile" width="min(1240px, 96vw)" top="4vh" @closed="resetImportForm">
      <div class="import-flow">
        <el-upload ref="uploadRef" drag action="#" :auto-upload="false" :limit="1" accept=".json,.csv" :on-change="handleFileChange" :on-remove="handleFileRemove">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon><div class="el-upload__text">Kéo thả tệp vào đây hoặc <em>nhấp để tải lên</em></div>
          <template #tip><div class="el-upload__tip">Hỗ trợ tệp JSON hoặc CSV IEC485. Preview chỉ validate, chưa ghi dữ liệu.</div></template>
        </el-upload>
        <div v-if="selectedFile" class="preview-action-row"><el-button type="info" plain :loading="previewLoading" @click="runPreview">Kiểm tra tệp (Preview)</el-button></div>
        <el-alert v-if="previewResult && !previewResult.valid" type="error" show-icon :closable="false" title="Tệp cấu hình không hợp lệ"><ul class="error-list"><li v-for="(err, idx) in previewResult.errors" :key="idx">{{ err }}</li></ul></el-alert>
        <div v-if="previewResult && previewResult.valid" class="preview-box">
          <div class="preview-meta"><el-tag type="success">Hợp lệ</el-tag><span><strong>Profile:</strong> {{ profileLabel(previewResult.profile) || selectedFile?.name }}</span><span><strong>Số thanh ghi:</strong> {{ previewResult.registers?.length || 0 }}</span></div>
          <div ref="previewTableEl" class="tabulator-host register-table-host" />
        </div>
      </div>
      <template #footer><el-button @click="importDialogVisible = false">Hủy</el-button><el-button type="primary" :disabled="!selectedFile || (previewResult && !previewResult.valid)" :loading="importing" @click="submitImport">Lưu vào Cơ sở dữ liệu</el-button></template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" :title="`Chi tiết: ${profileLabel(currentProfile) || 'MemMap Profile'}`" width="min(1440px, 97vw)" top="3vh" @opened="renderDetailTable" @closed="destroyDetailTable">
      <div v-loading="detailLoading">
        <div v-if="currentProfile" class="profile-detail-header">
          <span><strong>SKU:</strong> {{ valueOf(currentProfile, 'sku') || '—' }}</span><span><strong>LONG_FW:</strong> {{ valueOf(currentProfile, 'longFw', 'long_fw') || '—' }}</span><span><strong>SHORT_FW:</strong> {{ valueOf(currentProfile, 'shortFw', 'short_fw') || '—' }}</span>
          <span><strong>DEC check:</strong> {{ valueOf(currentProfile, 'decCheck', 'dec_check') ?? '—' }}</span><span><strong>HEX check:</strong> {{ valueOf(currentProfile, 'hexCheck', 'hex_check') ?? '—' }}</span><span><strong>Ngày tạo:</strong> {{ formatDate(valueOf(currentProfile, 'dateCreate', 'date_create', 'createdAt')) }}</span><span><strong>Created by:</strong> {{ valueOf(currentProfile, 'createdBy', 'created_by') || '—' }}</span>
        </div>
        <div ref="detailTableEl" class="tabulator-host register-table-host" />
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">Đóng</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { Refresh, Upload, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const API_BASE = '/api/plugins/memmap-manager';
type RecordRow = Record<string, unknown>;
interface PreviewResponse { valid: boolean; profile?: RecordRow; registers?: RecordRow[]; errors?: string[]; }

const loading = ref(false); const errorMessage = ref(''); const profiles = ref<RecordRow[]>([]); const searchQuery = ref('');
const importDialogVisible = ref(false); const selectedFile = ref<File | null>(null); const previewLoading = ref(false); const importing = ref(false); const previewResult = ref<PreviewResponse | null>(null);
const detailDialogVisible = ref(false); const detailLoading = ref(false); const currentProfile = ref<RecordRow | null>(null);
const profileTableEl = ref<HTMLElement>(); const previewTableEl = ref<HTMLElement>(); const detailTableEl = ref<HTMLElement>();
let profileTable: Tabulator | undefined; let previewTable: Tabulator | undefined; let detailTable: Tabulator | undefined;

function valueOf(row: RecordRow | undefined | null, ...keys: string[]) { for (const key of keys) { const value = row?.[key]; if (value !== undefined && value !== null && value !== '') return value; } return undefined; }
function profileLabel(profile?: RecordRow | null) { return String(valueOf(profile, 'sku', 'name', 'profileName') || ''); }
function formatDate(value?: unknown) { if (!value) return '—'; const date = new Date(String(value)); return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString('vi-VN'); }
function yesNo(value: unknown) { if (value === true || value === 'true' || value === 1 || value === '1') return '✓'; if (value === false || value === 'false' || value === 0 || value === '0') return '✕'; return value == null || value === '' ? '—' : String(value); }

const registerColumns = [
  { title: 'No.', field: 'no', width: 72, frozen: true, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'no', 'No.') ?? '—' },
  { title: 'Modbus Register (Decimal)', field: 'modbusRegisterDec', minWidth: 170, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'modbusRegisterDec', 'modbus_register_dec', 'address') ?? '—' },
  { title: 'Modbus Register (Hex)', field: 'modbusRegisterHex', minWidth: 155, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'modbusRegisterHex', 'modbus_register_hex', 'hex') ?? '—' },
  { title: 'Function Code (Read)', field: 'fcRead', minWidth: 140, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'fcRead', 'fc_read') ?? '—' },
  { title: 'Function Code (Write)', field: 'fcWrite', minWidth: 145, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'fcWrite', 'fc_write', 'accessMode') ?? '—' },
  { title: '# of Registers', field: 'numRegisters', minWidth: 120, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'numRegisters', 'num_registers') ?? '—' },
  { title: 'Description', field: 'description', minWidth: 220, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'description', 'name') ?? '—' },
  { title: 'Range', field: 'range', minWidth: 150 }, { title: 'End-user Default', field: 'endUserDefault', minWidth: 145, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'endUserDefault', 'end_user_default', 'defaultValue') ?? '—' },
  { title: 'Format', field: 'format', minWidth: 120, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'format', 'dataType') ?? '—' }, { title: 'Downlink 5', field: 'downlink5', minWidth: 110, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'downlink5', 'downlink_5') ?? '—' },
  { title: 'In RD1 Template', field: 'inRd1Template', minWidth: 130, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'inRd1Template', 'in_rd1_template') ?? '—' }, { title: 'Comment', field: 'comment', minWidth: 220 },
  { title: 'In Engineering Template', field: 'inEngineeringTemplate', minWidth: 170, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'inEngineeringTemplate', 'in_engineering_template') ?? '—' }, { title: 'In End-user Template', field: 'inEndUserTemplate', minWidth: 160, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'inEndUserTemplate', 'in_end_user_template') ?? '—' }, { title: 'In Full Template', field: 'inFullTemplate', minWidth: 140, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'inFullTemplate', 'in_full_template') ?? '—' },
  { title: 'Validate Decimal', field: 'valDecOk', minWidth: 130, frozen: true, formatter: (cell: any) => yesNo(valueOf(cell.getRow().getData(), 'valDecOk', 'val_dec_ok', 'decimalValid')) }, { title: 'Validate Hex', field: 'valHexOk', minWidth: 115, frozen: true, formatter: (cell: any) => yesNo(valueOf(cell.getRow().getData(), 'valHexOk', 'val_hex_ok', 'hexValid')) },
];
function makeRegisterTable(host: HTMLElement, data: RecordRow[]) { return new Tabulator(host, { data, layout: 'fitDataStretch', responsiveLayout: false, height: '440px', pagination: true, paginationSize: 25, paginationSizeSelector: [25, 50, 100], movableColumns: true, columns: registerColumns as any }); }

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> { const headers = new Headers(options.headers || {}); if (!(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json'); const token = localStorage.getItem('token') || sessionStorage.getItem('token'); if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`); const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers }); if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.message || `Lỗi yêu cầu: ${res.status} ${res.statusText}`); } return res.json(); }
function destroyTable(table?: Tabulator) { table?.destroy(); }
function renderProfileTable() { destroyTable(profileTable); if (!profileTableEl.value) return; profileTable = new Tabulator(profileTableEl.value, { data: profiles.value, layout: 'fitColumns', placeholder: 'Chưa có MemMap profile nào', columns: [ { title: 'SKU / Profile', field: 'sku', minWidth: 220, formatter: (cell: any) => profileLabel(cell.getRow().getData()) || '—' }, { title: 'LONG_FW', field: 'longFw', minWidth: 130, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'longFw', 'long_fw') ?? '—' }, { title: 'SHORT_FW', field: 'shortFw', minWidth: 125, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'shortFw', 'short_fw') ?? '—' }, { title: 'Registers', field: 'registersCount', width: 110, hozAlign: 'right', formatter: (cell: any) => { const row = cell.getRow().getData(); return String((row.registers as unknown[] | undefined)?.length ?? valueOf(row, 'registersCount', 'registers_count') ?? 0); } }, { title: 'Created by', field: 'createdBy', minWidth: 130, formatter: (cell: any) => valueOf(cell.getRow().getData(), 'createdBy', 'created_by') ?? '—' }, { title: 'Date create', field: 'dateCreate', minWidth: 180, formatter: (cell: any) => formatDate(valueOf(cell.getRow().getData(), 'dateCreate', 'date_create', 'createdAt')) } ], rowContextMenu: [ { label: 'Xem profile', action: (_e: Event, row: any) => viewDetail(String(row.getData().id)) }, { label: 'Xóa profile', action: (_e: Event, row: any) => deleteProfile(row.getData()) } ], rowDblClick: (_e: Event, row: any) => viewDetail(String(row.getData().id)) }); applyProfileFilter(); }
function applyProfileFilter() { const query = searchQuery.value.trim().toLowerCase(); if (!profileTable) return; if (!query) { profileTable.clearFilter(true); return; } profileTable.setFilter((row: RecordRow) => JSON.stringify(row).toLowerCase().includes(query)); }
async function fetchProfiles() { loading.value = true; errorMessage.value = ''; try { const data = await request<unknown>('/profiles'); profiles.value = Array.isArray(data) ? data as RecordRow[] : []; await nextTick(); renderProfileTable(); } catch (err) { errorMessage.value = err instanceof Error ? err.message : 'Không thể tải danh sách MemMap profiles'; profiles.value = []; } finally { loading.value = false; } }
async function viewDetail(id: string) { detailDialogVisible.value = true; detailLoading.value = true; currentProfile.value = null; try { currentProfile.value = await request<RecordRow>(`/profiles/${id}`); await nextTick(); renderDetailTable(); } catch (err) { ElMessage.error(err instanceof Error ? err.message : 'Không thể tải thông tin profile'); detailDialogVisible.value = false; } finally { detailLoading.value = false; } }
function renderDetailTable() { destroyDetailTable(); if (detailTableEl.value) detailTable = makeRegisterTable(detailTableEl.value, (currentProfile.value?.registers as RecordRow[] | undefined) || []); }
function destroyDetailTable() { destroyTable(detailTable); detailTable = undefined; }
async function deleteProfile(profile: RecordRow) { const label = profileLabel(profile) || 'profile này'; try { await ElMessageBox.confirm(`Xóa ${label} và toàn bộ registers liên kết? Thao tác này không thể hoàn tác.`, 'Xác nhận xóa', { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }); await request(`/profiles/${profile.id}`, { method: 'DELETE' }); ElMessage.success('Đã xóa MemMap profile'); await fetchProfiles(); } catch (err) { if (err !== 'cancel' && err !== 'close') ElMessage.error(err instanceof Error ? err.message : 'Không thể xóa profile'); } }
function openImportDialog() { resetImportForm(); importDialogVisible.value = true; } function resetImportForm() { selectedFile.value = null; previewResult.value = null; previewLoading.value = false; importing.value = false; destroyTable(previewTable); previewTable = undefined; }
function handleFileChange(file: UploadFile) { if (file.raw) { selectedFile.value = file.raw; previewResult.value = null; } } function handleFileRemove() { selectedFile.value = null; previewResult.value = null; }
async function runPreview() { if (!selectedFile.value) return; previewLoading.value = true; try { const form = new FormData(); form.append('file', selectedFile.value); previewResult.value = await request<PreviewResponse>('/import/preview', { method: 'POST', body: form }); await nextTick(); destroyTable(previewTable); if (previewResult.value.valid && previewTableEl.value) previewTable = makeRegisterTable(previewTableEl.value, previewResult.value.registers || []); ElMessage[previewResult.value.valid ? 'success' : 'warning'](previewResult.value.valid ? 'Kiểm tra tệp thành công' : 'Tệp có chứa lỗi'); } catch (err) { previewResult.value = { valid: false, errors: [err instanceof Error ? err.message : 'Lỗi khi kiểm tra tệp'] }; } finally { previewLoading.value = false; } }
async function submitImport() { if (!selectedFile.value) return; importing.value = true; try { const form = new FormData(); form.append('file', selectedFile.value); await request('/import', { method: 'POST', body: form }); ElMessage.success('Đã import MemMap Profile thành công'); importDialogVisible.value = false; await fetchProfiles(); } catch (err) { ElMessage.error(err instanceof Error ? err.message : 'Không thể import MemMap profile'); } finally { importing.value = false; } }
watch(searchQuery, applyProfileFilter); onMounted(fetchProfiles); onBeforeUnmount(() => { destroyTable(profileTable); destroyTable(previewTable); destroyDetailTable(); });
</script>

<style scoped>
.memmap-page { display: flex; flex-direction: column; gap: 16px; } .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; } .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #0284c7; } .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #0284c7; } .page-header h2 { margin: 4px 0; font-size: 22px; color: #0f172a; } .page-header p { margin: 0; font-size: 13px; color: #64748b; } .header-actions, .preview-action-row { display: flex; gap: 8px; } .preview-action-row { justify-content: flex-end; } .summary-card { display: flex; flex-direction: column; gap: 4px; padding: 12px; } .summary-label, .subline, .table-hint, .empty-text { color: #64748b; font-size: 12px; } .count-value { font-size: 24px; color: #0284c7; } .format-value { font-size: 20px; color: #059669; } .security-value { font-size: 20px; color: #6366f1; } .card-header-flex { display: flex; justify-content: space-between; align-items: center; gap: 12px; } .tabulator-host { width: 100%; } .profile-table-host { min-height: 140px; } .register-table-host { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 6px; } .table-hint { margin: 10px 0 0; } .empty-text { text-align: center; padding: 28px; } .import-flow, .preview-box { display: flex; flex-direction: column; gap: 14px; } .preview-box { background: #f8fafc; padding: 12px; border-radius: 6px; } .preview-meta, .profile-detail-header { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; font-size: 13px; color: #334155; } .error-list { margin: 6px 0 0; padding-left: 20px; font-size: 13px; } :deep(.tabulator) { font-size: 12px; border-color: #dbe4ef; } :deep(.tabulator .tabulator-header) { background: #f1f5f9; color: #0f172a; } :deep(.tabulator .tabulator-row.tabulator-row-even) { background: #f8fafc; } @media (max-width: 720px) { .page-header, .card-header-flex { flex-direction: column; } .header-actions { width: 100%; } }
</style>
