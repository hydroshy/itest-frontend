<template>
  <section class="memmap-page">
    <header class="page-header">
      <div>
        <div class="eyebrow"><span class="live-dot"></span> MEMMAP MANAGER</div>
        <h2>Memory Map & Profile Manager</h2>
        <p>Quản lý cấu hình bản đồ thanh ghi (Register Map), xem trước và import tệp JSON/CSV vào cơ sở dữ liệu.</p>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" :icon="Refresh" @click="fetchProfiles">Làm mới</el-button>
        <el-button type="primary" :icon="Upload" @click="openImportDialog">Import MemMap</el-button>
      </div>
    </header>

    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="true"
      show-icon
      class="load-alert"
      :title="errorMessage"
      @close="errorMessage = ''"
    />

    <el-row :gutter="16" class="summary-row">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="never" class="summary-card">
          <span class="summary-label">Tổng số Profiles</span>
          <strong class="count-value">{{ profiles.length }}</strong>
          <small>Cấu hình MemMap đã lưu</small>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="never" class="summary-card">
          <span class="summary-label">Định dạng hỗ trợ</span>
          <strong class="format-value">JSON, CSV</strong>
          <small>Multipart file upload</small>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="never" class="summary-card">
          <span class="summary-label">Kiểm tra an toàn</span>
          <strong class="security-value">Atomic Commit</strong>
          <small>Xác thực preview trước khi lưu</small>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header-flex">
          <span>Danh sách MemMap Profiles</span>
          <el-input
            v-model="searchQuery"
            placeholder="Tìm theo tên profile..."
            prefix-icon="Search"
            clearable
            style="width: 260px"
          />
        </div>
      </template>

      <el-table :data="filteredProfiles" v-loading="loading" empty-text="Chưa có MemMap profile nào">
        <el-table-column prop="name" label="Tên Profile" min-width="200">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
            <div v-if="row.description" class="subline">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="sourceFormat" label="Định dạng" width="130">
          <template #default="{ row }">
            <el-tag size="small" :type="row.sourceFormat === 'json' ? 'primary' : 'success'">
              {{ (row.sourceFormat || 'json').toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registersCount" label="Số Register" width="130">
          <template #default="{ row }">
            <span>{{ row.registers ? row.registers.length : (row.registersCount || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Thời gian tạo" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="140" align="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row.id)">Chi tiết</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog Import MemMap -->
    <el-dialog
      v-model="importDialogVisible"
      title="Import MemMap Profile"
      width="min(800px, 92vw)"
      @closed="resetImportForm"
    >
      <div class="import-flow">
        <el-upload
          ref="uploadRef"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          accept=".json,.csv"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            Kéo thả tệp vào đây hoặc <em>nhấp để tải lên</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              Hỗ trợ tệp <code>.json</code> hoặc <code>.csv</code> chứa danh sách bản đồ thanh ghi (Registers).
            </div>
          </template>
        </el-upload>

        <div v-if="selectedFile" class="preview-action-row">
          <el-button type="info" plain :loading="previewLoading" @click="runPreview">
            Kiểm tra tệp (Preview)
          </el-button>
        </div>

        <el-alert
          v-if="previewResult && !previewResult.valid"
          type="error"
          show-icon
          :closable="false"
          title="Tệp cấu hình không hợp lệ"
          class="preview-alert"
        >
          <ul class="error-list">
            <li v-for="(err, idx) in previewResult.errors" :key="idx">{{ err }}</li>
          </ul>
        </el-alert>

        <div v-if="previewResult && previewResult.valid" class="preview-box">
          <div class="preview-meta">
            <el-tag type="success">Hợp lệ</el-tag>
            <span><strong>Profile:</strong> {{ previewResult.profile?.name || selectedFile?.name }}</span>
            <span><strong>Số thanh ghi:</strong> {{ previewResult.registers?.length || 0 }}</span>
          </div>

          <el-table :data="previewResult.registers || []" max-height="260" size="small" border stripe>
            <el-table-column prop="address" label="Address" width="100" />
            <el-table-column prop="name" label="Tên Register" min-width="160" />
            <el-table-column prop="dataType" label="Data Type" width="110" />
            <el-table-column prop="accessMode" label="Access Mode" width="110" />
            <el-table-column prop="scale" label="Scale" width="80" />
            <el-table-column prop="unit" label="Đơn vị" width="80" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">Hủy</el-button>
        <el-button
          type="primary"
          :disabled="!selectedFile || (previewResult && !previewResult.valid)"
          :loading="importing"
          @click="submitImport"
        >
          Lưu vào Cơ sở dữ liệu
        </el-button>
      </template>
    </el-dialog>

    <!-- Dialog Chi tiết Profile -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`Chi tiết: ${currentProfile?.name || 'MemMap Profile'}`"
      width="min(860px, 92vw)"
    >
      <div v-loading="detailLoading">
        <div v-if="currentProfile" class="profile-detail-header">
          <p v-if="currentProfile.description"><strong>Mô tả:</strong> {{ currentProfile.description }}</p>
          <p><strong>Định dạng nguồn:</strong> {{ currentProfile.sourceFormat }}</p>
          <p><strong>Ngày tạo:</strong> {{ formatDate(currentProfile.createdAt) }}</p>
        </div>

        <el-table :data="currentProfile?.registers || []" max-height="400" size="small" border stripe>
          <el-table-column prop="address" label="Address" width="110" sortable />
          <el-table-column prop="name" label="Tên Register" min-width="180" />
          <el-table-column prop="dataType" label="Data Type" width="120" />
          <el-table-column prop="accessMode" label="Access Mode" width="120" />
          <el-table-column prop="scale" label="Scale" width="90" />
          <el-table-column prop="unit" label="Đơn vị" width="90" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Refresh, Upload, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, type UploadFile } from 'element-plus';

const API_BASE = '/api/plugins/memmap-manager';

interface MemmapRegister {
  id?: string;
  name: string;
  address: string | number;
  dataType: string;
  scale?: number;
  unit?: string;
  accessMode?: string;
}

interface MemmapProfile {
  id: string;
  name: string;
  description?: string;
  sourceFormat?: string;
  registersCount?: number;
  registers?: MemmapRegister[];
  createdAt: string;
  updatedAt?: string;
}

interface PreviewResponse {
  valid: boolean;
  profile?: Partial<MemmapProfile>;
  registers?: MemmapRegister[];
  errors?: string[];
}

const loading = ref(false);
const errorMessage = ref('');
const profiles = ref<MemmapProfile[]>([]);
const searchQuery = ref('');

const importDialogVisible = ref(false);
const selectedFile = ref<File | null>(null);
const previewLoading = ref(false);
const importing = ref(false);
const previewResult = ref<PreviewResponse | null>(null);

const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const currentProfile = ref<MemmapProfile | null>(null);

const filteredProfiles = computed(() => {
  if (!searchQuery.value) return profiles.value;
  const q = searchQuery.value.toLowerCase();
  return profiles.value.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)),
  );
});

function formatDate(val?: string) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('vi-VN');
  } catch {
    return val;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.message || `Lỗi yêu cầu: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return res.json();
}

async function fetchProfiles() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await request<MemmapProfile[]>('/profiles');
    profiles.value = Array.isArray(data) ? data : [];
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Không thể tải danh sách MemMap profiles';
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
    const data = await request<MemmapProfile>(`/profiles/${id}`);
    currentProfile.value = data;
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : 'Không thể tải thông tin profile');
    detailDialogVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function openImportDialog() {
  resetImportForm();
  importDialogVisible.value = true;
}

function resetImportForm() {
  selectedFile.value = null;
  previewResult.value = null;
  previewLoading.value = false;
  importing.value = false;
}

function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
    previewResult.value = null;
  }
}

function handleFileRemove() {
  selectedFile.value = null;
  previewResult.value = null;
}

async function runPreview() {
  if (!selectedFile.value) return;
  previewLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    const result = await request<PreviewResponse>('/import/preview', {
      method: 'POST',
      body: formData,
    });
    previewResult.value = result;
    if (result.valid) {
      ElMessage.success('Kiểm tra tệp thành công, định dạng hợp lệ');
    } else {
      ElMessage.warning('Tệp có chứa lỗi, vui lòng kiểm tra lại');
    }
  } catch (err) {
    previewResult.value = {
      valid: false,
      errors: [err instanceof Error ? err.message : 'Lỗi khi kiểm tra tệp'],
    };
  } finally {
    previewLoading.value = false;
  }
}

async function submitImport() {
  if (!selectedFile.value) return;
  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    await request('/import', {
      method: 'POST',
      body: formData,
    });
    ElMessage.success('Đã import MemMap Profile thành công');
    importDialogVisible.value = false;
    await fetchProfiles();
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : 'Không thể import MemMap profile');
  } finally {
    importing.value = false;
  }
}

onMounted(() => {
  fetchProfiles();
});
</script>

<style scoped>
.memmap-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #0284c7;
  text-transform: uppercase;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0284c7;
}

.page-header h2 {
  margin: 4px 0;
  font-size: 22px;
  color: #0f172a;
}

.page-header p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.summary-row {
  margin-top: 4px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
}

.count-value {
  font-size: 24px;
  color: #0284c7;
}

.format-value {
  font-size: 20px;
  color: #059669;
}

.security-value {
  font-size: 20px;
  color: #6366f1;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subline {
  font-size: 12px;
  color: #64748b;
}

.import-flow {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-action-row {
  display: flex;
  justify-content: flex-end;
}

.preview-alert {
  margin-top: 8px;
}

.error-list {
  margin: 6px 0 0;
  padding-left: 20px;
  font-size: 13px;
}

.preview-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.profile-detail-header {
  margin-bottom: 16px;
  font-size: 13px;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
