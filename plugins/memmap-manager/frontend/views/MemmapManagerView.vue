<template>
  <section class="memmap-page">
    <header class="page-header">
      <div><div class="eyebrow"><span class="live-dot" /> MEMMAP PAYLOAD</div><h2>Memmap Payload</h2><p>Quản lý profile và tải lên payload IEC485 có kiểm tra trước khi lưu.</p></div>
      <el-button :loading="loading" :icon="Refresh" @click="fetchProfiles">Làm mới</el-button>
    </header>
    <el-alert v-if="errorMessage" type="error" show-icon class="load-alert" :title="errorMessage" @close="errorMessage = ''" />

    <el-tabs v-model="activeTab" class="payload-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="Memmap Manager" name="manager">
        <el-card shadow="never" class="table-card"><template #header><div class="card-header-flex"><span>Danh sách Memmap Payload</span><el-input v-model="searchQuery" placeholder="Tìm SKU, firmware hoặc profile..." clearable style="width: 300px" /></div></template><div v-loading="loading" ref="profileTableEl" class="tabulator-host profile-table-host" /><p v-if="!loading && !profiles.length" class="empty-text">Chưa có Memmap Payload nào.</p><p class="table-hint">Nhấp chuột phải để xem hoặc xóa profile.</p></el-card>
      </el-tab-pane>

      <el-tab-pane label="Memmap Upload" name="upload">
        <el-card shadow="never" class="upload-card">
          <template #header><span>Tải lên Memmap Payload</span></template>
          <el-form :model="uploadForm" label-position="top" class="upload-form">
            <el-row :gutter="16"><el-col :xs="24" :md="8"><el-form-item label="Sensors Connectivity" required><el-select v-model="uploadForm.connectivity" @change="invalidatePreview"><el-option label="LoRaWAN" value="LoRaWAN" /><el-option label="Sigfox" value="Sigfox" /></el-select></el-form-item></el-col>
              <el-col :xs="24" :md="8"><el-form-item label="SKU" required><el-input v-model.trim="uploadForm.skuSuffix" @input="invalidatePreview"><template #prepend>{{ skuPrefix }}</template></el-input></el-form-item></el-col>
              <el-col :xs="24" :md="4"><el-form-item label="LONG_FW" required :error="longFirmwareError"><el-input v-model="uploadForm.longFw" maxlength="6" @input="normalizeLongFirmware" /></el-form-item></el-col>
              <el-col :xs="24" :md="4"><el-form-item label="SHORT_FW"><el-input :model-value="shortFirmware" disabled placeholder="Tự động" /></el-form-item></el-col></el-row>
            <el-upload class="compact-upload" action="#" :auto-upload="false" :limit="1" accept=".csv" :on-change="handleFileChange" :on-remove="handleFileRemove"><el-button size="small" :icon="Upload">Chọn tệp CSV</el-button><template #tip><div class="el-upload__tip">Định dạng Payload: <strong>IEC485 CSV</strong> · RFC 4180 / Multipart · Validation Decimal + Hex — kiểm tra từng dòng.</div></template></el-upload>
            <div class="upload-actions"><el-button :disabled="!canPreview" :loading="previewLoading" @click="runPreview">Kiểm tra &amp; Preview</el-button><el-button type="primary" :icon="Upload" :disabled="!canUpload" :loading="importing" @click="submitImport">Upload Payload</el-button></div>
          </el-form>
          <el-alert v-if="previewResult && !previewResult.valid" type="error" show-icon :closable="false" title="Payload chưa hợp lệ"><ul class="error-list"><li v-for="(err, idx) in previewResult.errors" :key="idx">{{ (typeof err === 'object' && err) ? ((err as any).message || JSON.stringify(err)) : String(err) }}</li></ul></el-alert>
          <div v-if="previewResult" class="preview-box"><div class="preview-meta"><el-tag :type="previewResult.valid ? 'success' : 'danger'">{{ previewResult.valid ? 'Sẵn sàng Upload' : 'Cần sửa lỗi' }}</el-tag><span><strong>SKU:</strong> {{ sku }}</span><span><strong>LONG_FW:</strong> {{ uploadForm.longFw }}</span><span><strong>SHORT_FW:</strong> {{ shortFirmware }}</span><span><strong>Registers:</strong> {{ previewResult.registers?.length || 0 }}</span><el-tag size="small" :type="previewResult.profile?.decimalCheck === false ? 'danger' : 'success'">DEC: {{ previewResult.profile?.decimalCheck === false ? 'FAIL' : 'PASS' }}</el-tag><el-tag size="small" :type="previewResult.profile?.hexCheck === false ? 'danger' : 'success'">HEX: {{ previewResult.profile?.hexCheck === false ? 'FAIL' : 'PASS' }}</el-tag><el-tag v-if="previewInvalidRowsCount > 0" size="small" type="danger">{{ previewInvalidRowsCount }} dòng lỗi</el-tag><span v-if="currentUsername"><strong>Created by:</strong> {{ currentUsername }}</span></div><div ref="previewTableEl" class="tabulator-host register-table-host" /></div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="detailDialogVisible" :title="`Chi tiết: ${profileLabel(currentProfile) || 'Memmap Payload'}`" width="min(1440px, 97vw)" top="3vh" @opened="renderDetailTable" @closed="destroyDetailTable"><div v-loading="detailLoading"><div v-if="currentProfile" class="profile-detail-header"><span><strong>SKU:</strong> {{ valueOf(currentProfile, 'sku') || '—' }}</span><span><strong>LONG_FW:</strong> {{ valueOf(currentProfile, 'longFw', 'long_fw') || '—' }}</span><span><strong>SHORT_FW:</strong> {{ valueOf(currentProfile, 'shortFw', 'short_fw') || '—' }}</span><span><strong>DEC check:</strong> {{ valueOf(currentProfile, 'decimalCheck', 'decCheck', 'dec_check') ?? '—' }}</span><span><strong>HEX check:</strong> {{ valueOf(currentProfile, 'hexCheck', 'hex_check') ?? '—' }}</span><span><strong>Created by:</strong> {{ valueOf(currentProfile, 'createdBy', 'created_by') || '—' }}</span></div><div ref="detailTableEl" class="tabulator-host register-table-host" /></div><template #footer><el-button @click="detailDialogVisible = false">Đóng</el-button></template></el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Refresh, Upload, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
const API_BASE = '/api/plugins/memmap-manager'; type RecordRow = Record<string, unknown>;
interface PreviewResponse { valid: boolean; profile?: RecordRow; registers?: RecordRow[]; errors?: string[]; }
const route = useRoute();
const authStore = useAuthStore();
const currentUsername = computed(() => authStore.user?.username || (localStorage.getItem('itest_user') ? (() => { try { return JSON.parse(localStorage.getItem('itest_user') || '{}')?.username || ''; } catch { return ''; } })() : ''));
const activeTab = ref(route?.query?.tab === 'upload' ? 'upload' : 'manager'), loading = ref(false), errorMessage = ref(''), profiles = ref<RecordRow[]>([]), searchQuery = ref('');
watch(() => route?.query?.tab, (t) => { if (t === 'upload' || t === 'manager') activeTab.value = t; });
const selectedFile = ref<File | null>(null), previewLoading = ref(false), importing = ref(false), previewResult = ref<PreviewResponse | null>(null);
const uploadForm = ref({ connectivity: 'LoRaWAN', skuSuffix: '', longFw: '' }); const skuPrefix = computed(() => uploadForm.value.connectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-'); const sku = computed(() => `${skuPrefix.value}${uploadForm.value.skuSuffix.trim()}`); const detailDialogVisible = ref(false), detailLoading = ref(false), currentProfile = ref<RecordRow | null>(null);
const profileTableEl = ref<HTMLElement>(), previewTableEl = ref<HTMLElement>(), detailTableEl = ref<HTMLElement>(); let profileTable: Tabulator | undefined, previewTable: Tabulator | undefined, detailTable: Tabulator | undefined;
const longFirmwareValid = computed(() => /^\dF\d{4}$/i.test(uploadForm.value.longFw)); const longFirmwareError = computed(() => uploadForm.value.longFw && !longFirmwareValid.value ? 'LONG_FW phải đúng mẫu XFXXXX (X là các chữ số 0-9).' : ''); const shortFirmware = computed(() => longFirmwareValid.value ? uploadForm.value.longFw.charAt(0) : ''); const canPreview = computed(() => Boolean(uploadForm.value.skuSuffix.trim() && longFirmwareValid.value && selectedFile.value)); const canUpload = computed(() => canPreview.value && previewResult.value?.valid === true && previewInvalidRowsCount.value === 0 && (previewResult.value?.errors?.length ?? 0) === 0);
const previewInvalidRowsCount = computed(() => (previewResult.value?.registers || []).filter((r: RecordRow) => r.decimalValid === false || r.hexValid === false).length);
function valueOf(row: RecordRow | null | undefined, ...keys: string[]) { for (const key of keys) { const v = row?.[key]; if (v !== undefined && v !== null && v !== '') return v; } return undefined; } function validationStatus(row: RecordRow, keys: string[], counterpartKeys: string[]) { const value = valueOf(row, ...keys); if (value === true || value === 'true' || value === 1 || value === '1') return 'PASS'; if (value === false || value === 'false' || value === 0 || value === '0') return 'FAIL'; const rowNumber = valueOf(row, 'rowNumber', 'no', 'No.'); if ((rowNumber === 1 || rowNumber === '1') && valueOf(row, ...counterpartKeys) !== undefined) return 'PASS'; return value === undefined ? '—' : 'FAIL'; } function profileLabel(p?: RecordRow | null) { return String(valueOf(p, 'sku', 'name', 'profileName') || ''); } function formatDate(v?: unknown) { if (!v) return '—'; const date = new Date(String(v)); return Number.isNaN(date.valueOf()) ? String(v) : date.toLocaleString('vi-VN'); } function yesNo(v: unknown) { if (v === true || v === 'true' || v === 1 || v === '1') return '✓'; if (v === false || v === 'false' || v === 0 || v === '0') return '✕'; return v == null || v === '' ? '—' : String(v); }
const registerColumns = [
  { title: 'No.', field: 'rowNumber', width: 72, frozen: true, formatter: (c: any) => valueOf(c.getRow().getData(), 'rowNumber', 'no', 'No.') ?? '—' }, { title: 'Modbus Register (Decimal)', field: 'modbusRegisterDecimal', minWidth: 170, formatter: (c: any) => valueOf(c.getRow().getData(), 'modbusRegisterDecimal', 'modbusRegisterDec', 'modbus_register_dec', 'address') ?? '—' }, { title: 'Modbus Register (Hex)', field: 'modbusRegisterHex', minWidth: 155, formatter: (c: any) => valueOf(c.getRow().getData(), 'modbusRegisterHex', 'modbus_register_hex', 'hex') ?? '—' }, { title: 'Function Code (Read)', field: 'functionCodeRead', minWidth: 140, formatter: (c: any) => valueOf(c.getRow().getData(), 'functionCodeRead', 'fcRead', 'fc_read') ?? '—' }, { title: 'Function Code (Write)', field: 'functionCodeWrite', minWidth: 145, formatter: (c: any) => valueOf(c.getRow().getData(), 'functionCodeWrite', 'fcWrite', 'fc_write', 'accessMode') ?? '—' }, { title: '# of Registers', field: 'registerCount', minWidth: 120, formatter: (c: any) => valueOf(c.getRow().getData(), 'registerCount', 'numRegisters', 'num_registers') ?? '—' }, { title: 'Description', field: 'description', minWidth: 220, formatter: (c: any) => valueOf(c.getRow().getData(), 'description', 'name') ?? '—' }, { title: 'Range', field: 'range', minWidth: 150 }, { title: 'End-user Default', field: 'endUserDefault', minWidth: 145, formatter: (c: any) => valueOf(c.getRow().getData(), 'endUserDefault', 'end_user_default', 'defaultValue') ?? '—' }, { title: 'Format', field: 'format', minWidth: 120, formatter: (c: any) => valueOf(c.getRow().getData(), 'format', 'dataType') ?? '—' }, { title: 'Downlink 5', field: 'downlink5', minWidth: 110, formatter: (c: any) => valueOf(c.getRow().getData(), 'downlink5', 'downlink_5') ?? '—' }, { title: 'In RD1 Template', field: 'inRd1Template', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'inRd1Template', 'in_rd1_template') ?? '—' }, { title: 'Comment', field: 'comment', minWidth: 220 }, { title: 'In Engineering Template', field: 'inEngineeringTemplate', minWidth: 170, formatter: (c: any) => valueOf(c.getRow().getData(), 'inEngineeringTemplate', 'in_engineering_template') ?? '—' }, { title: 'In End-user Template', field: 'inEndUserTemplate', minWidth: 160, formatter: (c: any) => valueOf(c.getRow().getData(), 'inEndUserTemplate', 'in_end_user_template') ?? '—' }, { title: 'In Full Template', field: 'inFullTemplate', minWidth: 140, formatter: (c: any) => valueOf(c.getRow().getData(), 'inFullTemplate', 'in_full_template') ?? '—' }, { title: 'Validate Decimal', field: 'decimalValid', minWidth: 130, formatter: (c: any) => validationStatus(c.getRow().getData(), ['decimalValid', 'valDecOk', 'val_dec_ok'], ['modbusRegisterDecimal', 'modbusRegisterDec', 'modbus_register_dec', 'address', 'modbusRegisterHex', 'modbus_register_hex', 'hex']) }, { title: 'Validate Hex', field: 'hexValid', minWidth: 115, formatter: (c: any) => validationStatus(c.getRow().getData(), ['hexValid', 'valHexOk', 'val_hex_ok'], ['modbusRegisterDecimal', 'modbusRegisterDec', 'modbus_register_dec', 'address', 'modbusRegisterHex', 'modbus_register_hex', 'hex']) },
];
function makeRegisterTable(host: HTMLElement, data: RecordRow[]) { return new Tabulator(host, { data, layout: 'fitDataStretch', responsiveLayout: false, height: '440px', pagination: true, paginationSize: 25, paginationSizeSelector: [25, 50, 100], movableColumns: true, columns: registerColumns as any, rowFormatter: (row: any) => { const d = row.getData(); if (d.decimalValid === false || d.hexValid === false) row.getElement().classList.add('table-row-invalid'); } }); }
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> { const headers = new Headers(options.headers || {}); if (!(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json'); const token = localStorage.getItem('itest_token') || localStorage.getItem('token') || sessionStorage.getItem('token'); if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`); const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers }); if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.message || `Lỗi yêu cầu: ${res.status} ${res.statusText}`); } return res.json(); }
function destroyTable(t?: Tabulator) { t?.destroy(); } function renderProfileTable() { destroyTable(profileTable); if (!profileTableEl.value) return; profileTable = new Tabulator(profileTableEl.value, { data: profiles.value, layout: 'fitColumns', placeholder: 'Chưa có Memmap Payload nào', columns: [{ title: 'SKU / Profile', field: 'sku', minWidth: 220, formatter: (c: any) => profileLabel(c.getRow().getData()) || '—' }, { title: 'LONG_FW', field: 'longFw', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'longFw', 'long_fw') ?? '—' }, { title: 'SHORT_FW', field: 'shortFw', minWidth: 125, formatter: (c: any) => valueOf(c.getRow().getData(), 'shortFw', 'short_fw') ?? '—' }, { title: 'Registers', field: 'registersCount', width: 110, hozAlign: 'right', formatter: (c: any) => String((c.getRow().getData().registers as unknown[] | undefined)?.length ?? valueOf(c.getRow().getData(), 'registersCount', 'registers_count') ?? 0) }, { title: 'Created by', field: 'createdBy', minWidth: 130, formatter: (c: any) => valueOf(c.getRow().getData(), 'createdBy', 'created_by') ?? '—' }, { title: 'Date create', field: 'dateCreate', minWidth: 180, formatter: (c: any) => formatDate(valueOf(c.getRow().getData(), 'dateCreate', 'date_create', 'createdAt')) }], rowContextMenu: [{ label: 'Xem profile', action: (_e: Event, row: any) => viewDetail(String(row.getData().id)) }, { label: 'Xóa profile', action: (_e: Event, row: any) => deleteProfile(row.getData()) }], rowDblClick: (_e: Event, row: any) => viewDetail(String(row.getData().id)) }); applyProfileFilter(); }
function applyProfileFilter() { const q = searchQuery.value.trim().toLowerCase(); if (!profileTable) return; if (!q) profileTable.clearFilter(true); else profileTable.setFilter((row: RecordRow) => JSON.stringify(row).toLowerCase().includes(q)); } async function fetchProfiles() { loading.value = true; errorMessage.value = ''; try { const data = await request<unknown>('/profiles'); profiles.value = Array.isArray(data) ? data as RecordRow[] : []; await nextTick(); renderProfileTable(); } catch (e) { errorMessage.value = e instanceof Error ? e.message : 'Không thể tải danh sách payload'; profiles.value = []; } finally { loading.value = false; } }
async function viewDetail(id: string) { detailDialogVisible.value = true; detailLoading.value = true; currentProfile.value = null; try { currentProfile.value = await request<RecordRow>(`/profiles/${id}`); await nextTick(); renderDetailTable(); } catch (e) { ElMessage.error(e instanceof Error ? e.message : 'Không thể tải profile'); detailDialogVisible.value = false; } finally { detailLoading.value = false; } } function renderDetailTable() { destroyDetailTable(); if (detailTableEl.value) detailTable = makeRegisterTable(detailTableEl.value, (currentProfile.value?.registers as RecordRow[] | undefined) || []); } function destroyDetailTable() { destroyTable(detailTable); detailTable = undefined; }
async function deleteProfile(profile: RecordRow) { try { await ElMessageBox.confirm(`Xóa ${profileLabel(profile) || 'profile này'} và toàn bộ registers? Thao tác không thể hoàn tác.`, 'Xác nhận xóa', { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }); await request(`/profiles/${profile.id}`, { method: 'DELETE' }); ElMessage.success('Đã xóa Memmap Payload'); await fetchProfiles(); } catch (e) { if (e !== 'cancel' && e !== 'close') ElMessage.error(e instanceof Error ? e.message : 'Không thể xóa payload'); } }
function normalizeLongFirmware() { uploadForm.value.longFw = uploadForm.value.longFw.toUpperCase().replace(/\s/g, ''); invalidatePreview(); } function invalidatePreview() { if (previewResult.value) { previewResult.value = null; destroyTable(previewTable); previewTable = undefined; } } function handleFileChange(file: UploadFile) { if (file.raw) { selectedFile.value = file.raw; invalidatePreview(); if (canPreview.value) void runPreview(); } } function handleFileRemove() { selectedFile.value = null; invalidatePreview(); } function appendPayload(form: FormData) { if (!selectedFile.value) return; form.append('file', selectedFile.value); form.append('sku', sku.value); form.append('longFw', uploadForm.value.longFw); form.append('shortFw', shortFirmware.value); const author = currentUsername.value; if (author) form.append('createdBy', author); }
async function runPreview() { if (!canPreview.value) return; previewLoading.value = true; try { const form = new FormData(); appendPayload(form); previewResult.value = await request<PreviewResponse>('/import/preview', { method: 'POST', body: form }); await nextTick(); destroyTable(previewTable); if (previewTableEl.value) previewTable = makeRegisterTable(previewTableEl.value, previewResult.value.registers || []); ElMessage[previewResult.value.valid ? 'success' : 'warning'](previewResult.value.valid ? 'Payload hợp lệ và sẵn sàng Upload' : 'Payload có lỗi'); } catch (e) { previewResult.value = { valid: false, errors: [e instanceof Error ? e.message : 'Lỗi khi preview'] }; } finally { previewLoading.value = false; } }
async function submitImport() { if (!canUpload.value) return; importing.value = true; try { const form = new FormData(); appendPayload(form); await request('/import', { method: 'POST', body: form }); ElMessage.success('Đã upload Memmap Payload'); selectedFile.value = null; previewResult.value = null; activeTab.value = 'manager'; await fetchProfiles(); } catch (e) { ElMessage.error(e instanceof Error ? e.message : 'Không thể upload payload'); } finally { importing.value = false; } } function handleTabChange(tab: string | number) { if (tab === 'manager') fetchProfiles(); }
watch(searchQuery, applyProfileFilter); onMounted(fetchProfiles); onBeforeUnmount(() => { destroyTable(profileTable); destroyTable(previewTable); destroyDetailTable(); });
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
  align-items: flex-start;
  gap: 16px;
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--cyber-cyan, #00f0ff);
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
.summary-row {
  margin-bottom: 16px;
}
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(0, 240, 255, 0.15);
}
.summary-label, .table-hint, .empty-text {
  color: #94a3b8;
  font-size: 12px;
}
.count-value {
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 24px;
  font-weight: 700;
  color: var(--cyber-cyan, #00f0ff);
}
.format-value {
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}
.security-value {
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 20px;
  font-weight: 700;
  color: #a855f7;
}
.card-header-flex, .upload-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.upload-actions {
  justify-content: flex-end;
  margin-top: 16px;
}
.tabulator-host {
  width: 100%;
}
.profile-table-host {
  min-height: 140px;
}
.register-table-host {
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  background: rgba(10, 15, 26, 0.4);
}
.table-hint {
  margin: 10px 0 0;
}
.empty-text {
  text-align: center;
  padding: 28px;
}
.upload-form, .preview-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.preview-box {
  background: rgba(10, 15, 26, 0.7);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
}
.preview-meta, .profile-detail-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  font-size: 13px;
  color: #cbd5e1;
}
.error-list {
  margin: 6px 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: #f87171;
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
:deep(.tabulator .tabulator-row.table-row-invalid .tabulator-cell.tabulator-frozen) {
  background: #2a151b !important;
}
:deep(.tabulator .tabulator-row.table-row-invalid:hover .tabulator-cell.tabulator-frozen) {
  background: #3b1820 !important;
}
@media(max-width:720px) {
  .page-header, .card-header-flex {
    flex-direction: column;
  }
  .upload-actions {
    justify-content: flex-start;
  }
}
</style>
