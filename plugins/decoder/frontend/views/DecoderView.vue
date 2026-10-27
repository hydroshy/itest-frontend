<template>
  <div class="decoder-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon class="mr-2"><Cpu /></el-icon>
          Bộ Giải Mã LoRaWAN (Payload Decoder)
        </h2>
        <span class="subtitle">
          Quản lý script JS giải mã payload chuẩn LoRaWAN, nhận diện tự động theo SKU & LONG_FW từ MemMap
        </span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          Tạo Decoder Mới
        </el-button>
        <el-button :icon="Refresh" @click="refreshData" :loading="loading">
          Làm Mới
        </el-button>
      </div>
    </div>

    <!-- Main Tabs -->
    <el-tabs v-model="activeTab" class="custom-tabs">
      <!-- TAB 1: Danh Sách Decoder Scripts -->
      <el-tab-pane label="Danh Sách Bộ Giải Mã" name="list">
        <el-card shadow="never" class="filter-card mb-3">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8" :md="6">
              <el-input
                v-model="filters.search"
                placeholder="Tìm theo Tên, SKU, LONG_FW..."
                clearable
                :prefix-icon="Search"
                @clear="loadScripts"
                @keyup.enter="loadScripts"
              />
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-select v-model="filters.sku" placeholder="Lọc theo SKU" clearable @change="loadScripts">
                <el-option label="Tất cả SKU" value="" />
                <el-option v-for="sku in uniqueSkus" :key="sku" :label="sku" :value="sku" />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-select v-model="filters.isActive" placeholder="Trạng thái" clearable @change="loadScripts">
                <el-option label="Tất cả" value="" />
                <el-option label="Đang kích hoạt" value="true" />
                <el-option label="Tạm ngưng" value="false" />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <el-button type="primary" :icon="Search" @click="loadScripts">Lọc</el-button>
              <el-button :icon="Refresh" @click="resetFilters">Reset</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="table-card">
          <el-table :data="scriptList" v-loading="loading" stripe border style="width: 100%">
            <el-table-column prop="name" label="Tên Bộ Giải Mã" min-width="180">
              <template #default="{ row }">
                <div class="font-bold text-primary">{{ row.name }}</div>
                <div class="text-xs text-secondary truncate">{{ row.description || 'Chưa có mô tả' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="Nhận Diện SKU & LONG_FW" min-width="240">
              <template #default="{ row }">
                <div class="text-xs">
                  <div><strong>SKU:</strong> <el-tag size="small" type="info">{{ row.sku }}</el-tag></div>
                  <div class="mt-1"><strong>LONG_FW:</strong> <span class="font-mono text-warning">{{ row.longFw || row.long_fw }}</span></div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="protocol" label="Giao Thức" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ (row.protocol || 'lorawan').toUpperCase() }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isActive" label="Kích Hoạt" width="110" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.isActive"
                  :active-value="true"
                  :inactive-value="false"
                  @change="toggleScriptStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="Cập Nhật" width="160">
              <template #default="{ row }">
                <span class="text-xs">{{ formatDateTime(row.updatedAt || row.updated_at) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Thao Tác" width="220" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" :icon="VideoPlay" @click="openTestModal(row)">
                  Test
                </el-button>
                <el-button link type="primary" size="small" :icon="Edit" @click="openEditDialog(row)">
                  Sửa
                </el-button>
                <el-button link type="danger" size="small" :icon="Delete" @click="confirmDelete(row)">
                  Xóa
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- TAB 2: Tra Cứu MemMap & Trạng Thái Decoder -->
      <el-tab-pane label="Tra Cứu MemMap & Decoder" name="memmaps">
        <el-card shadow="never" class="table-card">
          <div class="flex justify-between items-center mb-3">
            <div class="text-sm text-secondary">
              Danh sách SKU và LONG_FW đang có trong hệ thống MemMap. Nhấn "Gán Decoder" để cấu hình bộ giải mã cho sản phẩm.
            </div>
            <el-input
              v-model="memmapSearch"
              placeholder="Tìm theo SKU hoặc LONG_FW..."
              clearable
              :prefix-icon="Search"
              style="width: 250px"
            />
          </div>
          <el-table :data="filteredMemmaps" v-loading="loadingMemmaps" stripe border style="width: 100%">
            <el-table-column prop="sku" label="SKU" min-width="160">
              <template #default="{ row }">
                <span class="font-bold font-mono">{{ row.sku }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="longFw" label="LONG_FW" min-width="200">
              <template #default="{ row }">
                <span class="font-mono text-warning">{{ row.longFw || row.long_fw }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="Tên Profile MemMap" min-width="200">
              <template #default="{ row }">
                {{ row.name || row.profileName || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="Trạng Thái Decoder" width="160" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.hasDecoder" type="success" size="small">Đã có Decoder</el-tag>
                <el-tag v-else type="warning" size="small">Chưa cấu hình</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Hành Động" width="150" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="!row.hasDecoder"
                  type="primary"
                  size="small"
                  plain
                  :icon="Plus"
                  @click="assignDecoderFromMemmap(row)"
                >
                  Gán Decoder
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  link
                  :icon="View"
                  @click="goToDecoderOfMemmap(row)"
                >
                  Xem Decoder
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- TAB 3: Interactive Sandbox (Test Trực Tiếp) -->
      <el-tab-pane label="Sandbox Thử Nghiệm Decode" name="sandbox">
        <el-row :gutter="16">
          <!-- Cột cấu hình / Script -->
          <el-col :xs="24" :lg="12">
            <el-card shadow="never" class="h-full">
              <template #header>
                <div class="flex justify-between items-center">
                  <span class="font-bold flex items-center">
                    <el-icon class="mr-1"><Document /></el-icon>
                    LoRaWAN JavaScript Script
                  </span>
                  <div>
                    <el-button size="small" @click="loadSampleScript('chirpstack_v4')">
                      Mẫu ChirpStack v4
                    </el-button>
                    <el-button size="small" @click="loadSampleScript('ttn_v3')">
                      Mẫu TTN v3
                    </el-button>
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      accept=".js,.txt"
                      :on-change="handleFileUpload"
                      style="display: inline-block; margin-left: 8px"
                    >
                      <el-button size="small" type="info" :icon="Upload">Upload JS</el-button>
                    </el-upload>
                  </div>
                </div>
              </template>

              <el-input
                v-model="sandboxForm.script"
                type="textarea"
                :rows="18"
                class="code-textarea font-mono"
                placeholder="// Viết hoặc dán script JS decode LoRaWAN ở đây...&#10;function decodeUplink(input) {&#10;  var bytes = input.bytes;&#10;  var fPort = input.fPort;&#10;  return { data: { temp: bytes[0] } };&#10;}"
              />

              <div class="mt-3">
                <el-row :gutter="12">
                  <el-col :span="14">
                    <el-form-item label="Payload Input" label-width="110px">
                      <el-input
                        v-model="sandboxForm.payload"
                        placeholder="Ví dụ: 01020304 hoặc Base64..."
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="FPort" label-width="50px">
                      <el-input-number v-model="sandboxForm.fPort" :min="1" :max="223" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-button
                      type="success"
                      :icon="VideoPlay"
                      :loading="runningTest"
                      style="width: 100%"
                      @click="runSandboxTest"
                    >
                      Chạy Test
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>

          <!-- Cột kết quả Decode -->
          <el-col :xs="24" :lg="12">
            <el-card shadow="never" class="h-full">
              <template #header>
                <div class="flex justify-between items-center">
                  <span class="font-bold flex items-center">
                    <el-icon class="mr-1"><DataAnalysis /></el-icon>
                    Kết Quả Giải Mã (JSON Output)
                  </span>
                  <div v-if="testResult">
                    <el-tag v-if="testResult.success" type="success" size="small">
                      Thành Công ({{ testResult.executionTimeMs || 0 }} ms)
                    </el-tag>
                    <el-tag v-else type="danger" size="small">Thất Bại</el-tag>
                  </div>
                </div>
              </template>

              <div v-if="testError" class="test-error-box mb-3">
                <div class="font-bold text-danger">Lỗi Thực Thi / Syntax Error:</div>
                <div class="text-xs font-mono mt-1 whitespace-pre-wrap">{{ testError }}</div>
              </div>

              <div class="result-box font-mono">
                <pre v-if="testResult">{{ JSON.stringify(testResult.data || testResult, null, 2) }}</pre>
                <div v-else class="text-secondary text-center py-5">
                  Nhấn "Chạy Test" để xem kết quả giải mã JSON từ payload.
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- DIALOG: Thêm / Chỉnh Sửa Decoder Script -->
    <el-dialog
      v-model="editorDialogVisible"
      :title="isEditing ? 'Chỉnh Sửa Bộ Giải Mã' : 'Tạo Bộ Giải Mã Mới'"
      width="780px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left">
        <el-form-item label="Tên Bộ Giải Mã" prop="name">
          <el-input v-model="form.name" placeholder="Ví dụ: Decoder Smart Water Meter v1.0..." />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Chọn SKU" prop="sku">
              <el-select
                v-model="form.sku"
                filterable
                placeholder="Chọn hoặc nhập SKU..."
                style="width: 100%"
                @change="handleFormSkuChange"
              >
                <el-option v-for="sku in memmapSkuOptions" :key="sku" :label="sku" :value="sku" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="LONG_FW" prop="longFw">
              <el-select
                v-model="form.longFw"
                filterable
                allow-create
                placeholder="Chọn LONG_FW tương ứng..."
                style="width: 100%"
              >
                <el-option
                  v-for="fw in availableFwOptions"
                  :key="fw"
                  :label="fw"
                  :value="fw"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Mô Tả" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="Ghi chú về định dạng gói tin hoặc thiết bị..." />
        </el-form-item>

        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-sm">Nội Dung Script JavaScript:</span>
          <div>
            <el-button size="small" link type="primary" @click="fillFormSampleScript('chirpstack_v4')">
              Template ChirpStack v4
            </el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".js,.txt"
              :on-change="handleFormFileUpload"
              style="display: inline-block; margin-left: 8px"
            >
              <el-button size="small" :icon="Upload">Upload File .js</el-button>
            </el-upload>
          </div>
        </div>

        <el-form-item prop="script" label-width="0">
          <el-input
            v-model="form.script"
            type="textarea"
            :rows="12"
            class="code-textarea font-mono"
            placeholder="// function decodeUplink(input) { ... }"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Payload Mẫu" prop="samplePayload">
              <el-input v-model="form.samplePayload" placeholder="Hex string (vd: 010203)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="FPort Mẫu" prop="sampleFport">
              <el-input-number v-model="form.sampleFport" :min="1" :max="223" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Kích Hoạt">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editorDialogVisible = false">Hủy</el-button>
        <el-button type="info" :icon="VideoPlay" :loading="testingFormScript" @click="testCurrentFormScript">
          Test Thử Script
        </el-button>
        <el-button type="primary" :loading="submittingForm" @click="submitForm">
          {{ isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Cpu,
  Search,
  Plus,
  Refresh,
  Delete,
  Edit,
  VideoPlay,
  View,
  Document,
  DataAnalysis,
  Upload,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus';
import { httpClient } from '@/api/client';

// Templates
const CHIRPSTACK_V4_SAMPLE = `// ChirpStack v4 decodeUplink standard
function decodeUplink(input) {
  var bytes = input.bytes;
  var fPort = input.fPort;
  var data = {};

  if (bytes.length >= 2) {
    data.temperature = (bytes[0] << 8 | bytes[1]) / 100.0;
  }
  if (bytes.length >= 4) {
    data.humidity = (bytes[2] << 8 | bytes[3]) / 100.0;
  }
  if (bytes.length >= 6) {
    data.battery = bytes[4] * 10;
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}
`;

const TTN_V3_SAMPLE = `// TTN / ChirpStack v3 Decode standard
function Decode(fPort, bytes) {
  var data = {};
  if (bytes.length >= 2) {
    data.raw_value = (bytes[0] << 8) | bytes[1];
  }
  return data;
}
`;

const activeTab = ref('list');
const loading = ref(false);
const scriptList = ref<any[]>([]);

// Filters
const filters = reactive({
  search: '',
  sku: '',
  isActive: '',
});

// Memmaps
const loadingMemmaps = ref(false);
const memmapList = ref<any[]>([]);
const memmapSearch = ref('');

// Sandbox State
const runningTest = ref(false);
const testResult = ref<any>(null);
const testError = ref<string>('');
const sandboxForm = reactive({
  script: CHIRPSTACK_V4_SAMPLE,
  payload: '09C4138805',
  fPort: 1,
});

// Editor Dialog State
const editorDialogVisible = ref(false);
const isEditing = ref(false);
const submittingForm = ref(false);
const testingFormScript = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  sku: '',
  longFw: '',
  description: '',
  script: CHIRPSTACK_V4_SAMPLE,
  samplePayload: '09C4138805',
  sampleFport: 1,
  isActive: true,
});

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên bộ giải mã', trigger: 'blur' }],
  sku: [{ required: true, message: 'Vui lòng chọn hoặc nhập SKU', trigger: 'change' }],
  longFw: [{ required: true, message: 'Vui lòng chọn hoặc nhập LONG_FW', trigger: 'change' }],
  script: [{ required: true, message: 'Vui lòng nhập nội dung script JavaScript', trigger: 'blur' }],
};

// Computed
const uniqueSkus = computed(() => {
  const skus = new Set<string>();
  scriptList.value.forEach((s) => {
    if (s.sku) skus.add(s.sku);
  });
  return Array.from(skus);
});

const memmapSkuOptions = computed(() => {
  const skus = new Set<string>();
  memmapList.value.forEach((m) => {
    if (m.sku) skus.add(m.sku);
  });
  return Array.from(skus);
});

const availableFwOptions = computed(() => {
  if (!form.sku) return [];
  const fws = new Set<string>();
  memmapList.value
    .filter((m) => m.sku === form.sku)
    .forEach((m) => {
      const fw = m.longFw || m.long_fw;
      if (fw) fws.add(fw);
    });
  return Array.from(fws);
});

const filteredMemmaps = computed(() => {
  if (!memmapSearch.value) return memmapList.value;
  const q = memmapSearch.value.toLowerCase();
  return memmapList.value.filter(
    (m) =>
      (m.sku && m.sku.toLowerCase().includes(q)) ||
      ((m.longFw || m.long_fw) && (m.longFw || m.long_fw).toLowerCase().includes(q)) ||
      (m.name && m.name.toLowerCase().includes(q))
  );
});

function formatDateTime(isoStr?: string) {
  if (!isoStr) return '—';
  try {
    return new Date(isoStr).toLocaleString('vi-VN');
  } catch {
    return isoStr;
  }
}

// Refresh Data
function refreshData() {
  loadScripts();
  loadMemmaps();
}

// Helper with fallback for both /plugins/decoder and /plugins/decode
async function requestWithFallback(method: 'get' | 'post' | 'put' | 'delete', path: string, dataOrConfig?: any, config?: any) {
  const decoderPath = `/plugins/decoder${path}`;
  const decodePath = `/plugins/decode${path}`;
  try {
    if (method === 'get' || method === 'delete') {
      return await (httpClient as any)[method](decoderPath, dataOrConfig);
    } else {
      return await (httpClient as any)[method](decoderPath, dataOrConfig, config);
    }
  } catch (err: any) {
    // If 404, fallback to /plugins/decode
    if (err?.response?.status === 404 || err?.status === 404) {
      if (method === 'get' || method === 'delete') {
        return await (httpClient as any)[method](decodePath, dataOrConfig);
      } else {
        return await (httpClient as any)[method](decodePath, dataOrConfig, config);
      }
    }
    throw err;
  }
}

// Load Scripts
async function loadScripts() {
  loading.value = true;
  try {
    const res: any = await requestWithFallback('get', '/scripts', {
      params: {
        search: filters.search || undefined,
        sku: filters.sku || undefined,
        isActive: filters.isActive !== '' ? filters.isActive : undefined,
      },
    });
    scriptList.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error loading decoder scripts:', err);
    ElMessage.error(err?.message || 'Không thể tải danh sách decoder scripts');
  } finally {
    loading.value = false;
  }
}

// Load Memmaps
async function loadMemmaps() {
  loadingMemmaps.value = true;
  try {
    const res: any = await requestWithFallback('get', '/memmaps');
    memmapList.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error loading memmaps:', err);
  } finally {
    loadingMemmaps.value = false;
  }
}

function resetFilters() {
  filters.search = '';
  filters.sku = '';
  filters.isActive = '';
  loadScripts();
}

// Toggle status
async function toggleScriptStatus(row: any) {
  try {
    await requestWithFallback('put', `/scripts/${row.id}`, {
      isActive: row.isActive,
    });
    ElMessage.success(`Đã ${row.isActive ? 'kích hoạt' : 'tạm ngưng'} script thành công`);
  } catch (err: any) {
    row.isActive = !row.isActive;
    ElMessage.error(err?.message || 'Lỗi khi cập nhật trạng thái script');
  }
}

// Delete
async function confirmDelete(row: any) {
  try {
    await ElMessageBox.confirm(`Bạn có chắc muốn xóa bộ giải mã ${row.name} (${row.sku})?`, 'Xác nhận xóa', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    });
    await requestWithFallback('delete', `/scripts/${row.id}`);
    ElMessage.success('Đã xóa bộ giải mã thành công');
    loadScripts();
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || 'Lỗi khi xóa bộ giải mã');
    }
  }
}

// Open Test Modal / Switch Tab
function openTestModal(row: any) {
  sandboxForm.script = row.script;
  sandboxForm.payload = row.samplePayload || '01020304';
  sandboxForm.fPort = row.sampleFport || 1;
  activeTab.value = 'sandbox';
  runSandboxTest();
}

function assignDecoderFromMemmap(memmap: any) {
  isEditing.value = false;
  editingId.value = null;
  form.name = `Decoder cho ${memmap.sku}`;
  form.sku = memmap.sku;
  form.longFw = memmap.longFw || memmap.long_fw || '';
  form.description = `Bộ giải mã tự động cho sản phẩm SKU ${memmap.sku} - FW ${form.longFw}`;
  form.script = CHIRPSTACK_V4_SAMPLE;
  form.samplePayload = '09C4138805';
  form.sampleFport = 1;
  form.isActive = true;
  editorDialogVisible.value = true;
}

function goToDecoderOfMemmap(memmap: any) {
  filters.sku = memmap.sku;
  activeTab.value = 'list';
  loadScripts();
}

// Open Dialogs
function openCreateDialog() {
  isEditing.value = false;
  editingId.value = null;
  form.name = '';
  form.sku = '';
  form.longFw = '';
  form.description = '';
  form.script = CHIRPSTACK_V4_SAMPLE;
  form.samplePayload = '09C4138805';
  form.sampleFport = 1;
  form.isActive = true;
  editorDialogVisible.value = true;
}

function openEditDialog(row: any) {
  isEditing.value = true;
  editingId.value = row.id;
  form.name = row.name;
  form.sku = row.sku;
  form.longFw = row.longFw || row.long_fw;
  form.description = row.description || '';
  form.script = row.script;
  form.samplePayload = row.samplePayload || '';
  form.sampleFport = row.sampleFport || 1;
  form.isActive = row.isActive !== false;
  editorDialogVisible.value = true;
}

function handleFormSkuChange(sku: string) {
  const matching = memmapList.value.filter((m) => m.sku === sku);
  if (matching.length > 0) {
    form.longFw = matching[0].longFw || matching[0].long_fw || '';
  }
}

// File uploads
function handleFileUpload(uploadFile: UploadFile) {
  const file = uploadFile.raw;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    sandboxForm.script = (e.target?.result as string) || '';
    ElMessage.success('Đã tải script JS lên thành công');
  };
  reader.readAsText(file);
}

function handleFormFileUpload(uploadFile: UploadFile) {
  const file = uploadFile.raw;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    form.script = (e.target?.result as string) || '';
    ElMessage.success('Đã nạp script JS vào form');
  };
  reader.readAsText(file);
}

function loadSampleScript(type: 'chirpstack_v4' | 'ttn_v3') {
  if (type === 'chirpstack_v4') {
    sandboxForm.script = CHIRPSTACK_V4_SAMPLE;
  } else {
    sandboxForm.script = TTN_V3_SAMPLE;
  }
}

function fillFormSampleScript(type: 'chirpstack_v4' | 'ttn_v3') {
  if (type === 'chirpstack_v4') {
    form.script = CHIRPSTACK_V4_SAMPLE;
  } else {
    form.script = TTN_V3_SAMPLE;
  }
}

// Run Sandbox Test
async function runSandboxTest() {
  runningTest.value = true;
  testError.value = '';
  testResult.value = null;
  try {
    const res: any = await requestWithFallback('post', '/test', {
      script: sandboxForm.script,
      payload: sandboxForm.payload,
      fPort: sandboxForm.fPort,
    });
    testResult.value = res?.data || res;
  } catch (err: any) {
    testError.value = err?.message || 'Lỗi runtime khi giải mã payload';
  } finally {
    runningTest.value = false;
  }
}

// Test current form script
async function testCurrentFormScript() {
  testingFormScript.value = true;
  try {
    const res: any = await requestWithFallback('post', '/test', {
      script: form.script,
      payload: form.samplePayload || '01020304',
      fPort: form.sampleFport || 1,
    });
    const data = res?.data || res;
    ElMessageBox.alert(
      `<pre style="max-height: 300px; overflow-y: auto;">${JSON.stringify(data, null, 2)}</pre>`,
      'Kết Quả Test Script Thành Công',
      { dangerouslyUseHTMLString: true }
    );
  } catch (err: any) {
    ElMessage.error(err?.message || 'Script phát sinh lỗi');
  } finally {
    testingFormScript.value = false;
  }
}

// Submit Form
async function submitForm() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submittingForm.value = true;
    try {
      if (isEditing.value && editingId.value) {
        await requestWithFallback('put', `/scripts/${editingId.value}`, {
          name: form.name,
          sku: form.sku,
          longFw: form.longFw,
          description: form.description,
          script: form.script,
          samplePayload: form.samplePayload,
          sampleFport: form.sampleFport,
          isActive: form.isActive,
        });
        ElMessage.success('Cập nhật bộ giải mã thành công');
      } else {
        await requestWithFallback('post', '/scripts', {
          name: form.name,
          sku: form.sku,
          longFw: form.longFw,
          description: form.description,
          script: form.script,
          samplePayload: form.samplePayload,
          sampleFport: form.sampleFport,
          isActive: form.isActive,
        });
        ElMessage.success('Tạo bộ giải mã mới thành công');
      }
      editorDialogVisible.value = false;
      refreshData();
    } catch (err: any) {
      console.error('Error submitting decoder script:', err);
      ElMessage.error(err?.message || 'Lỗi khi lưu bộ giải mã');
    } finally {
      submittingForm.value = false;
    }
  });
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.decoder-view {
  padding: 16px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left .title {
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  margin: 0 0 4px 0;
}

.header-left .subtitle {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.custom-tabs {
  background: transparent;
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.code-textarea :deep(textarea) {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  background-color: var(--el-fill-color-darker, #1e1e1e);
  color: #a9b7c6;
  line-height: 1.5;
}

.result-box {
  background-color: var(--el-fill-color-darker, #1e1e1e);
  color: #a9b7c6;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.85rem;
  min-height: 350px;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
}

.test-error-box {
  background-color: rgba(245, 108, 108, 0.1);
  border: 1px solid var(--el-color-danger);
  border-radius: 6px;
  padding: 10px;
}

.font-mono {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
}

.text-primary {
  color: var(--el-color-primary);
}

.text-secondary {
  color: var(--el-text-color-secondary);
}

.text-warning {
  color: var(--el-color-warning);
}

.text-danger {
  color: var(--el-color-danger);
}
</style>
