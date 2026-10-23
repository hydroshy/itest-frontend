<template>
  <div class="traceability-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <div class="header-icon-box">
          <el-icon class="icon-brand"><Files /></el-icon>
        </div>
        <div>
          <h2 class="view-title">DEVICE TRACEABILITY</h2>
          <p class="view-subtitle">
            Hệ thống quản lý truy xuất nguồn gốc thiết bị, Sale Orders (SO), Work Authorizations (WA) và kết quả kiểm thử phần cứng.
          </p>
        </div>
      </div>
      <div class="header-right">
        <el-tag effect="dark" type="success" class="header-tag">
          <el-icon><Check /></el-icon> BI Metabase Ready
        </el-tag>
        <el-tag effect="plain" type="info">v2.0.0</el-tag>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <el-tabs v-model="activeTab" class="traceability-tabs" type="border-card">
      <!-- TAB 1: SALE ORDERS (SO & WA) -->
      <el-tab-pane name="sale-orders">
        <template #label>
          <span class="tab-label">
            <el-icon><List /></el-icon> Đơn Hàng (Sale Orders)
          </span>
        </template>

        <div class="tab-toolbar">
          <div class="search-filters">
            <el-input
              v-model="soSearchQuery"
              placeholder="Tìm theo SO hoặc Khách hàng..."
              prefix-icon="Search"
              clearable
              style="width: 280px"
              @input="filterSaleOrders"
            />
            <el-button @click="fetchSaleOrders" :loading="loadingSo">
              <el-icon><Refresh /></el-icon> Làm mới
            </el-button>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="openCreateSoDialog">
              <el-icon><Plus /></el-icon> Tạo Mới Sale Order
            </el-button>
          </div>
        </div>

        <!-- Sale Orders Table -->
        <el-table
          :data="pagedSaleOrders"
          v-loading="loadingSo"
          stripe
          border
          style="width: 100%"
          highlight-current-row
          @current-change="handleSoRowSelect"
        >
          <el-table-column prop="soNumber" label="Mã Sale Order (SO)" width="180">
            <template #default="{ row }">
              <span class="font-bold font-mono text-primary">{{ row.soNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="Khách Hàng" min-width="160">
            <template #default="{ row }">
              {{ row.customerName || 'N/A' }}
            </template>
          </el-table-column>
          <el-table-column label="Số Lượng WA" width="130" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">
                {{ row.workAuthorizations ? row.workAuthorizations.length : (row.waCount || 0) }} WAs
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Tiến Độ Thiết Bị" min-width="220">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                  :percentage="calcSoProgress(row)"
                  :status="calcSoProgress(row) === 100 ? 'success' : undefined"
                  style="flex: 1"
                />
                <span class="progress-text">
                  {{ (row.stats && row.stats.configPassCount) || 0 }}/{{ (row.stats && row.stats.totalDevices) || 0 }} Đạt
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="Ghi Chú" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="Ngày Tạo" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="Thao Tác" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click.stop="openCreateWaDialog(row)">
                <el-icon><Plus /></el-icon> Thêm WA
              </el-button>
              <el-button size="small" type="success" link @click.stop="goToTestingTabWithSo(row)">
                <el-icon><Upload /></el-icon> Import CSV
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Sub-panel: Work Authorizations under selected SO -->
        <div v-if="selectedSo" class="order-devices-panel mt-4">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><FolderOpened /></el-icon>
              Danh sách Work Authorizations (WA) thuộc SO: 
              <span class="text-primary font-mono font-bold">{{ selectedSo.soNumber }}</span>
            </div>
            <div class="panel-actions">
              <el-button size="small" type="primary" @click="openCreateWaDialog(selectedSo)">
                <el-icon><Plus /></el-icon> Tạo WA Mới
              </el-button>
              <el-button size="small" @click="fetchSoDetail(selectedSo.id)">
                <el-icon><Refresh /></el-icon> Cập nhật
              </el-button>
            </div>
          </div>

          <el-table
            :data="selectedSo.workAuthorizations || []"
            v-loading="loadingSoDetail"
            size="small"
            border
            style="width: 100%"
          >
            <el-table-column prop="waNumber" label="Mã WA (WA/xxxx/xxxxx)" width="220">
              <template #default="{ row }">
                <el-tag type="warning" effect="plain" class="font-mono font-bold">{{ row.waNumber }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="itemCode" label="Item Code" min-width="180">
              <template #default="{ row }">
                <span class="font-mono">{{ row.itemCode || 'Chưa gán' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="plannedQuantity" label="SL Kế Hoạch" width="120" align="center">
              <template #default="{ row }">
                {{ row.plannedQuantity || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="Ghi Chú" min-width="180" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="Ngày Tạo" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="Thao Tác" width="160" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="goToTestingTabWithWa(selectedSo, row)">
                  <el-icon><Upload /></el-icon> Import Thiết Bị
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- TAB 2: DEVICE TESTING LIST & CSV IMPORT -->
      <el-tab-pane name="device-testing">
        <template #label>
          <span class="tab-label">
            <el-icon><Checked /></el-icon> Danh Sách Thiết Bị Đã Test (Device Testing List)
          </span>
        </template>

        <div class="tab-toolbar">
          <div class="search-filters">
            <el-select
              v-model="filterTestingSoId"
              placeholder="Lọc theo Sale Order (SO)"
              clearable
              filterable
              style="width: 220px"
              @change="fetchDevices"
            >
              <el-option
                v-for="so in saleOrdersList"
                :key="so.id"
                :label="`${so.soNumber} (${so.customerName || 'N/A'})`"
                :value="so.id"
              />
            </el-select>

            <el-select
              v-model="filterTestingWaId"
              placeholder="Lọc theo WA"
              clearable
              filterable
              style="width: 220px"
              @change="fetchDevices"
            >
              <el-option
                v-for="wa in availableWas"
                :key="wa.id"
                :label="`${wa.waNumber} (${wa.itemCode || 'N/A'})`"
                :value="wa.id"
              />
            </el-select>

            <el-input
              v-model="searchDeviceSerial"
              placeholder="Tìm theo Serial Number..."
              prefix-icon="Search"
              clearable
              style="width: 200px"
              @input="fetchDevices"
            />

            <el-select
              v-model="filterTestResult"
              placeholder="Kết quả test"
              clearable
              style="width: 140px"
              @change="fetchDevices"
            >
              <el-option label="PASS" value="PASS" />
              <el-option label="FAIL" value="FAIL" />
              <el-option label="PENDING" value="PENDING" />
            </el-select>

            <el-button @click="fetchDevices" :loading="loadingDevices">
              <el-icon><Refresh /></el-icon> Làm mới
            </el-button>
          </div>

          <div class="action-buttons">
            <el-button type="success" @click="openImportCsvDialog">
              <el-icon><Upload /></el-icon> Import File CSV Đã Test
            </el-button>
          </div>
        </div>

        <!-- Devices List Table -->
        <el-table
          :data="devicesList"
          v-loading="loadingDevices"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="serialNumber" label="Serial Number (S/N)" width="200" fixed>
            <template #default="{ row }">
              <span class="font-bold font-mono text-primary">{{ row.serialNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Gắn vào SO / WA" width="240">
            <template #default="{ row }">
              <div>
                <span class="text-xs text-muted">SO: </span>
                <span class="font-mono font-bold">{{ row.so?.so_number || row.soNumber || 'N/A' }}</span>
              </div>
              <div v-if="row.wa?.wa_number || row.waNumber">
                <span class="text-xs text-muted">WA: </span>
                <el-tag size="small" type="warning" effect="plain" class="font-mono">
                  {{ row.wa?.wa_number || row.waNumber }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="devEui" label="DevEUI / MAC" width="180">
            <template #default="{ row }">
              <span class="font-mono">{{ row.devEui || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="itemCode" label="Item Code / SKU" width="180">
            <template #default="{ row }">
              <span>{{ row.itemCode || row.sku || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="testResult" label="Kết Quả Test" width="130" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.testResult === 'PASS' ? 'success' : row.testResult === 'FAIL' ? 'danger' : 'info'"
                effect="dark"
                class="font-bold"
              >
                {{ row.testResult || 'PENDING' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="configStatus" label="Final Config" width="160" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getConfigStatusTagType(row.configStatus)"
                effect="plain"
              >
                {{ row.configStatus || 'PENDING' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="testStation" label="Trạm Test" width="120" />
          <el-table-column prop="testPerson" label="Kỹ Thuật Viên" width="130" />
          <el-table-column prop="testedAt" label="Thời Gian Test" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.testedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="Chi Tiết Test" min-width="120" align="center">
            <template #default="{ row }">
              <el-button size="small" type="info" link @click="showRawTestDialog(row)">
                <el-icon><View /></el-icon> Xem Raw Data
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-wrapper mt-4">
          <el-pagination
            v-model:current-page="devicePage"
            v-model:page-size="deviceLimit"
            :total="deviceTotal"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchDevices"
            @current-change="fetchDevices"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- DIALOG: TẠO MỚI SALE ORDER -->
    <el-dialog v-model="createSoVisible" title="Tạo Mới Đơn Hàng (Sale Order)" width="500px">
      <el-form :model="createSoForm" label-width="140px" label-position="left">
        <el-form-item label="Mã Sale Order" required>
          <el-input v-model="createSoForm.soNumber" placeholder="Ví dụ: SO-2026-001 hoặc SO/26/001" />
        </el-form-item>
        <el-form-item label="Tên Khách Hàng">
          <el-input v-model="createSoForm.customerName" placeholder="Tên khách hàng / Đối tác" />
        </el-form-item>
        <el-form-item label="Ghi Chú">
          <el-input v-model="createSoForm.notes" type="textarea" :rows="3" placeholder="Ghi chú đơn hàng..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createSoVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submittingSo" @click="submitCreateSo">Tạo Mới</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: TẠO MỚI WORK AUTHORIZATION (WA) -->
    <el-dialog v-model="createWaVisible" title="Tạo Work Authorization (WA) Thuộc SO" width="550px">
      <el-form :model="createWaForm" label-width="170px" label-position="left">
        <el-form-item label="Sale Order">
          <span class="font-bold text-primary">{{ createWaForm.soNumber }}</span>
        </el-form-item>
        <el-form-item label="Mã WA (WA/xxxx/xxxxx)" required>
          <el-input
            v-model="createWaForm.waNumber"
            placeholder="Ví dụ: WA/2026/00001"
            @blur="formatWaNumberInput"
          />
          <span class="text-xs text-muted">Cú pháp bắt buộc theo chuẩn: WA/xxxx/xxxxx</span>
        </el-form-item>
        <el-form-item label="Item Code / Mã SP">
          <el-input v-model="createWaForm.itemCode" placeholder="Ví dụ: WSLRW-C-RS485-01" />
        </el-form-item>
        <el-form-item label="Số Lượng Kế Hoạch">
          <el-input-number v-model="createWaForm.plannedQuantity" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="Ghi Chú">
          <el-input v-model="createWaForm.notes" type="textarea" :rows="2" placeholder="Ghi chú lệnh..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createWaVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submittingWa" @click="submitCreateWa">Tạo WA</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: IMPORT CSV FILE ĐÃ TEST -->
    <el-dialog v-model="importCsvVisible" title="Import Danh Sách Thiết Bị Đã Test (CSV)" width="780px">
      <div class="import-stepper">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="Quy định Import Dữ Liệu Kiểm Thử"
          description="Hệ thống hỗ trợ cấu trúc file CSV kiểm thử phần cứng (ví dụ WSLRW-C-RS485-01_tested.csv). Có thể liên kết trực tiếp vào SO hoặc theo WA (nếu nhập WA hệ thống sẽ tự động gán vào SO tương ứng)."
          class="mb-4"
        />

        <el-form label-width="160px" label-position="left" class="mt-4">
          <el-form-item label="Phương thức gán" required>
            <el-radio-group v-model="importAssignMode">
              <el-radio-button label="WA">Gán theo WA (khuyên dùng)</el-radio-button>
              <el-radio-button label="SO">Gán trực tiếp SO</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="importAssignMode === 'WA'" label="Mã WA (WA/xxxx/xxxxx)" required>
            <el-select
              v-model="selectedImportWaId"
              placeholder="Chọn hoặc nhập mã WA..."
              filterable
              allow-create
              default-first-option
              style="width: 100%"
              @change="handleImportWaChanged"
            >
              <el-option
                v-for="wa in allAvailableWas"
                :key="wa.id"
                :label="`${wa.waNumber} [SO: ${wa.soNumber || 'N/A'}] - ${wa.itemCode || ''}`"
                :value="wa.id"
              />
            </el-select>
            <span v-if="parsedAutoSo" class="text-xs text-primary mt-1">
              ✓ Tự động nhận diện Sale Order: <b>{{ parsedAutoSo }}</b>
            </span>
          </el-form-item>

          <el-form-item v-if="importAssignMode === 'SO'" label="Mã Sale Order (SO)" required>
            <el-select
              v-model="selectedImportSoId"
              placeholder="Chọn hoặc nhập mã SO..."
              filterable
              allow-create
              default-first-option
              style="width: 100%"
            >
              <el-option
                v-for="so in saleOrdersList"
                :key="so.id"
                :label="`${so.soNumber} (${so.customerName || 'N/A'})`"
                :value="so.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Chọn File CSV" required>
            <input
              type="file"
              ref="csvFileInputRef"
              accept=".csv,text/csv"
              class="hidden-file-input"
              @change="handleCsvFileSelected"
            />
            <el-button type="primary" plain @click="triggerFileInput">
              <el-icon><UploadFilled /></el-icon> Tải File CSV Lên
            </el-button>
            <span v-if="selectedFileName" class="ml-3 font-mono font-bold">{{ selectedFileName }}</span>
          </el-form-item>
        </el-form>

        <!-- Preview Table -->
        <div v-if="parsedCsvDevices.length > 0" class="csv-preview mt-4">
          <div class="panel-header">
            <span class="preview-title">
              Xem trước: <b>{{ parsedCsvDevices.length }}</b> bản ghi thiết bị được đọc từ file
            </span>
            <el-tag type="success">
              {{ parsedCsvDevices.filter(d => d.testResult === 'PASS').length }} PASS / {{ parsedCsvDevices.filter(d => d.testResult === 'FAIL').length }} FAIL
            </el-tag>
          </div>

          <el-table :data="parsedCsvDevices.slice(0, 5)" size="small" border style="width: 100%">
            <el-table-column prop="serialNumber" label="S/N" width="160" />
            <el-table-column prop="devEui" label="DevEUI" width="160" />
            <el-table-column prop="testResult" label="Kết Quả" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.testResult === 'PASS' ? 'success' : 'danger'">
                  {{ row.testResult }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="itemCode" label="Item Code" min-width="140" />
            <el-table-column prop="testStation" label="Trạm Test" width="100" />
            <el-table-column prop="testedAt" label="Thời Gian" width="150" />
          </el-table>
          <div v-if="parsedCsvDevices.length > 5" class="text-xs text-muted mt-1 text-center">
            (Hiển thị 5 / {{ parsedCsvDevices.length }} bản ghi)
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importCsvVisible = false">Đóng</el-button>
        <el-button
          type="success"
          :disabled="parsedCsvDevices.length === 0"
          :loading="submittingImport"
          @click="submitCsvImport"
        >
          Xác Nhận Import Vào Hệ Thống
        </el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: RAW TEST DATA VIEWER -->
    <el-dialog v-model="rawTestDialogVisible" title="Chi Tiết Dữ Liệu Kiểm Thử (Raw Test Data)" width="600px">
      <pre v-if="viewingRawData" class="raw-data-box">{{ JSON.stringify(viewingRawData, null, 2) }}</pre>
      <div v-else class="text-muted text-center py-4">Không có dữ liệu mở rộng.</div>
      <template #footer>
        <el-button @click="rawTestDialogVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Files,
  List,
  Plus,
  Refresh,
  FolderOpened,
  Upload,
  Checked,
  Check,
  Search,
  UploadFilled,
  View,
} from '@element-plus/icons-vue';

// -----------------------------------------------------------------------------
// STATE DECLARATION
// -----------------------------------------------------------------------------
const activeTab = ref<'sale-orders' | 'device-testing'>('sale-orders');

// Sale Orders state
const saleOrdersList = ref<any[]>([]);
const loadingSo = ref(false);
const soSearchQuery = ref('');
const selectedSo = ref<any | null>(null);
const loadingSoDetail = ref(false);

// Create SO Dialog
const createSoVisible = ref(false);
const submittingSo = ref(false);
const createSoForm = ref({
  soNumber: '',
  customerName: '',
  notes: '',
});

// Create WA Dialog
const createWaVisible = ref(false);
const submittingWa = ref(false);
const createWaForm = ref({
  soId: '',
  soNumber: '',
  waNumber: '',
  itemCode: '',
  plannedQuantity: 100,
  notes: '',
});

// Device Testing state
const devicesList = ref<any[]>([]);
const loadingDevices = ref(false);
const searchDeviceSerial = ref('');
const filterTestingSoId = ref('');
const filterTestingWaId = ref('');
const filterTestResult = ref('');
const devicePage = ref(1);
const deviceLimit = ref(50);
const deviceTotal = ref(0);

// CSV Import state
const importCsvVisible = ref(false);
const importAssignMode = ref<'WA' | 'SO'>('WA');
const selectedImportWaId = ref('');
const selectedImportSoId = ref('');
const parsedAutoSo = ref('');
const csvFileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const parsedCsvDevices = ref<any[]>([]);
const submittingImport = ref(false);

// Raw Test Data modal
const rawTestDialogVisible = ref(false);
const viewingRawData = ref<any | null>(null);

// -----------------------------------------------------------------------------
// AUTH HELPER
// -----------------------------------------------------------------------------
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token =
    localStorage.getItem('itest_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// -----------------------------------------------------------------------------
// COMPUTED
// -----------------------------------------------------------------------------
const pagedSaleOrders = computed(() => {
  if (!Array.isArray(saleOrdersList.value)) return [];
  const q = soSearchQuery.value.trim().toLowerCase();
  if (!q) return saleOrdersList.value;
  return saleOrdersList.value.filter(
    (so) =>
      so.soNumber?.toLowerCase().includes(q) ||
      so.customerName?.toLowerCase().includes(q) ||
      so.notes?.toLowerCase().includes(q),
  );
});

const allAvailableWas = computed(() => {
  const list: any[] = [];
  if (Array.isArray(saleOrdersList.value)) {
    saleOrdersList.value.forEach((so) => {
      if (so.workAuthorizations && Array.isArray(so.workAuthorizations)) {
        so.workAuthorizations.forEach((wa: any) => {
          list.push({
            ...wa,
            soNumber: so.soNumber,
            soId: so.id,
          });
        });
      }
    });
  }
  return list;
});

const availableWas = computed(() => {
  if (!filterTestingSoId.value) return allAvailableWas.value;
  if (!Array.isArray(saleOrdersList.value)) return [];
  const targetSo = saleOrdersList.value.find((s) => s.id === filterTestingSoId.value);
  if (!targetSo || !targetSo.workAuthorizations) return [];
  return targetSo.workAuthorizations;
});

// -----------------------------------------------------------------------------
// SALE ORDERS LOGIC
// -----------------------------------------------------------------------------
const fetchSaleOrders = async () => {
  loadingSo.value = true;
  try {
    const res = await fetch('/api/plugins/device-traceability/so?limit=100', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    saleOrdersList.value = Array.isArray(data) ? data : (data.data || data.items || []);
    if (selectedSo.value && Array.isArray(saleOrdersList.value)) {
      const updated = saleOrdersList.value.find((s) => s.id === selectedSo.value.id);
      if (updated) selectedSo.value = updated;
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi tải danh sách Sale Orders: ${err.message}`);
  } finally {
    loadingSo.value = false;
  }
};

const filterSaleOrders = () => {
  // Handled by computed pagedSaleOrders
};

const handleSoRowSelect = async (row: any) => {
  if (!row) {
    selectedSo.value = null;
    return;
  }
  selectedSo.value = row;
  await fetchSoDetail(row.id);
};

const fetchSoDetail = async (soId: string) => {
  loadingSoDetail.value = true;
  try {
    const res = await fetch(`/api/plugins/device-traceability/so/${soId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const detail = await res.json();
    selectedSo.value = detail;
    // Update item in list
    if (Array.isArray(saleOrdersList.value)) {
      const idx = saleOrdersList.value.findIndex((s) => s.id === soId);
      if (idx !== -1) {
        saleOrdersList.value[idx] = detail;
      }
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi tải chi tiết SO: ${err.message}`);
  } finally {
    loadingSoDetail.value = false;
  }
};

const openCreateSoDialog = () => {
  createSoForm.value = {
    soNumber: '',
    customerName: '',
    notes: '',
  };
  createSoVisible.value = true;
};

const submitCreateSo = async () => {
  if (!createSoForm.value.soNumber.trim()) {
    ElMessage.warning('Vui lòng nhập Mã Sale Order (SO Number).');
    return;
  }

  submittingSo.value = true;
  try {
    const res = await fetch('/api/plugins/device-traceability/so', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        soNumber: createSoForm.value.soNumber.trim(),
        customerName: createSoForm.value.customerName.trim() || undefined,
        notes: createSoForm.value.notes.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success('Tạo Sale Order thành công!');
    createSoVisible.value = false;
    await fetchSaleOrders();
  } catch (err: any) {
    ElMessage.error(`Lỗi tạo SO: ${err.message}`);
  } finally {
    submittingSo.value = false;
  }
};

const openCreateWaDialog = (so: any) => {
  createWaForm.value = {
    soId: so.id,
    soNumber: so.soNumber,
    waNumber: '',
    itemCode: '',
    plannedQuantity: 100,
    notes: '',
  };
  createWaVisible.value = true;
};

const formatWaNumberInput = () => {
  let val = createWaForm.value.waNumber.trim();
  if (val && !val.toUpperCase().startsWith('WA/')) {
    // Auto-prefix if user just entered numbers or date
    const parts = val.split('/');
    if (parts.length === 2) {
      val = `WA/${parts[0]}/${parts[1]}`;
    }
  }
  createWaForm.value.waNumber = val;
};

const submitCreateWa = async () => {
  const wa = createWaForm.value.waNumber.trim();
  if (!wa) {
    ElMessage.warning('Vui lòng nhập Mã WA.');
    return;
  }
  // Validate syntax WA/xxxx/xxxxx
  const waRegex = /^WA\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/;
  if (!waRegex.test(wa)) {
    ElMessage.warning('Mã WA không đúng định dạng. Cú pháp bắt buộc: WA/xxxx/xxxxx (Ví dụ: WA/2026/00001)');
    return;
  }

  submittingWa.value = true;
  try {
    const res = await fetch(`/api/plugins/device-traceability/so/${createWaForm.value.soId}/wa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        soId: createWaForm.value.soId,
        waNumber: wa,
        itemCode: createWaForm.value.itemCode.trim() || undefined,
        plannedQuantity: Number(createWaForm.value.plannedQuantity) || 0,
        notes: createWaForm.value.notes.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success(`Tạo WA [${wa}] thành công!`);
    createWaVisible.value = false;
    await fetchSoDetail(createWaForm.value.soId);
  } catch (err: any) {
    ElMessage.error(`Lỗi tạo WA: ${err.message}`);
  } finally {
    submittingWa.value = false;
  }
};

const goToTestingTabWithSo = (so: any) => {
  filterTestingSoId.value = so.id;
  filterTestingWaId.value = '';
  activeTab.value = 'device-testing';
  fetchDevices();
};

const goToTestingTabWithWa = (so: any, wa: any) => {
  filterTestingSoId.value = so.id;
  filterTestingWaId.value = wa.id;
  activeTab.value = 'device-testing';
  fetchDevices();
};

// -----------------------------------------------------------------------------
// DEVICES & TESTING LOGIC
// -----------------------------------------------------------------------------
const fetchDevices = async () => {
  loadingDevices.value = true;
  try {
    const params = new URLSearchParams({
      page: String(devicePage.value),
      limit: String(deviceLimit.value),
    });
    if (filterTestingSoId.value) params.append('soId', filterTestingSoId.value);
    if (filterTestingWaId.value) params.append('waId', filterTestingWaId.value);
    if (searchDeviceSerial.value.trim()) params.append('serialNumber', searchDeviceSerial.value.trim());
    if (filterTestResult.value) params.append('testResult', filterTestResult.value);

    const res = await fetch(`/api/plugins/device-traceability/devices?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    devicesList.value = Array.isArray(data) ? data : (data.data || data.items || []);
    deviceTotal.value = data.meta?.total ?? data.total ?? devicesList.value.length;
  } catch (err: any) {
    ElMessage.error(`Lỗi tải danh sách thiết bị: ${err.message}`);
  } finally {
    loadingDevices.value = false;
  }
};

const showRawTestDialog = (row: any) => {
  viewingRawData.value = row.testRawData || null;
  rawTestDialogVisible.value = true;
};

// -----------------------------------------------------------------------------
// CSV IMPORT LOGIC (WSLRW-C-RS485-01_tested.csv)
// -----------------------------------------------------------------------------
const openImportCsvDialog = () => {
  importAssignMode.value = 'WA';
  selectedImportWaId.value = filterTestingWaId.value || '';
  selectedImportSoId.value = filterTestingSoId.value || '';
  parsedAutoSo.value = '';
  selectedFileName.value = '';
  parsedCsvDevices.value = [];
  if (selectedImportWaId.value) {
    handleImportWaChanged(selectedImportWaId.value);
  }
  importCsvVisible.value = true;
};

const handleImportWaChanged = (val: string) => {
  const match = allAvailableWas.value.find((w) => w.id === val || w.waNumber === val);
  if (match) {
    parsedAutoSo.value = match.soNumber || '';
  } else {
    parsedAutoSo.value = '';
  }
};

const triggerFileInput = () => {
  if (csvFileInputRef.value) {
    csvFileInputRef.value.value = '';
    csvFileInputRef.value.click();
  }
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
};

const handleCsvFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = (event.target?.result as string) || '';
      processCsvText(text);
    } catch (err: any) {
      ElMessage.error(`Lỗi đọc file CSV: ${err.message}`);
    }
  };
  reader.readAsText(file);
};

const processCsvText = (csvText: string) => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    ElMessage.warning('File CSV không có dữ liệu hợp lệ.');
    return;
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const parsedItems: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] ? values[idx].trim() : '';
    });

    const serialNumber = rowObj['serial_number'] || rowObj['serialNumber'] || rowObj['S/N'] || '';
    if (!serialNumber) continue;

    const devEui = rowObj['dev_eui'] || rowObj['device_key'] || rowObj['devEui'] || '';
    const rawResult = (rowObj['result'] || rowObj['testResult'] || '').toUpperCase();
    let testResult = 'PENDING';
    if (rawResult === 'PASS' || rawResult === 'PASSED') testResult = 'PASS';
    else if (rawResult === 'FAIL' || rawResult === 'FAILED') testResult = 'FAIL';

    parsedItems.push({
      serialNumber,
      devEui,
      testResult,
      itemCode: rowObj['item_code'] || rowObj['itemCode'] || rowObj['sku'] || '',
      hwVersion: rowObj['hw_ver'] || rowObj['hw_version'] || '',
      fwVersion: rowObj['fw_ver'] || rowObj['fw_version'] || '',
      testId: rowObj['test_id'] || '',
      testStation: rowObj['test_station'] || '',
      testPerson: rowObj['test_person'] || '',
      testedAt: rowObj['time_finish'] || rowObj['testedAt'] || '',
      testRawData: rowObj,
    });
  }

  parsedCsvDevices.value = parsedItems;
  ElMessage.success(`Đã phân tích ${parsedItems.length} thiết bị từ CSV.`);
};

const submitCsvImport = async () => {
  if (parsedCsvDevices.value.length === 0) {
    ElMessage.warning('Không có bản ghi thiết bị nào để import.');
    return;
  }

  let waId: string | undefined = undefined;
  let waNumber: string | undefined = undefined;
  let soId: string | undefined = undefined;
  let soNumber: string | undefined = undefined;

  if (importAssignMode.value === 'WA') {
    const target = selectedImportWaId.value.trim();
    if (!target) {
      ElMessage.warning('Vui lòng chọn hoặc nhập Mã WA.');
      return;
    }
    const match = allAvailableWas.value.find((w) => w.id === target || w.waNumber === target);
    if (match) {
      waId = match.id;
      waNumber = match.waNumber;
    } else {
      waNumber = target;
    }
  } else {
    const target = selectedImportSoId.value.trim();
    if (!target) {
      ElMessage.warning('Vui lòng chọn hoặc nhập Mã SO.');
      return;
    }
    const match = saleOrdersList.value.find((s) => s.id === target || s.soNumber === target);
    if (match) {
      soId = match.id;
      soNumber = match.soNumber;
    } else {
      soNumber = target;
    }
  }

  submittingImport.value = true;
  try {
    const payload = {
      waId,
      waNumber,
      soId,
      soNumber,
      devices: parsedCsvDevices.value,
    };

    const res = await fetch('/api/plugins/device-traceability/devices/import-csv', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const resData = await res.json();
    ElMessage.success(
      `Đã import thành công: ${resData.importedCount ?? resData.totalImported ?? parsedCsvDevices.value.length} thiết bị (PASS: ${resData.passCount ?? 0}, FAIL: ${resData.failCount ?? 0})!`,
    );

    importCsvVisible.value = false;
    parsedCsvDevices.value = [];
    selectedFileName.value = '';

    // Refresh views
    await fetchDevices();
    await fetchSaleOrders();
  } catch (err: any) {
    ElMessage.error(`Lỗi import kết quả test: ${err.message}`);
  } finally {
    submittingImport.value = false;
  }
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const formatDateTime = (val?: string | Date) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString('vi-VN', { hour12: false });
  } catch {
    return String(val);
  }
};

const calcSoProgress = (row: any) => {
  const total = Number((row.stats && row.stats.totalDevices) || row.totalDevices || 0);
  if (!total) return 0;
  const pass = Number((row.stats && row.stats.configPassCount) || row.configPassCount || 0);
  return Math.min(100, Math.round((pass / total) * 100));
};

const getConfigStatusTagType = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'CONFIGURED_PASS':
    case 'COMPLETED':
      return 'success';
    case 'CONFIGURED_FAIL':
    case 'FAILED':
      return 'danger';
    case 'IN_PROGRESS':
      return 'warning';
    default:
      return 'info';
  }
};

// -----------------------------------------------------------------------------
// LIFECYCLE
// -----------------------------------------------------------------------------
onMounted(async () => {
  await fetchSaleOrders();
  await fetchDevices();
});
</script>

<style scoped>
.traceability-view {
  padding: 20px;
  background: #f8fafc;
  min-height: calc(100vh - 64px);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-brand {
  font-size: 24px;
  color: #2563eb;
}

.view-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.view-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #64748b;
  min-width: 70px;
}

.order-devices-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hidden-file-input {
  display: none;
}

.csv-preview {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 12px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.raw-data-box {
  background: #0f172a;
  color: #38bdf8;
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.mt-1 {
  margin-top: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-3 {
  margin-left: 12px;
}

.font-bold {
  font-weight: 700;
}

.font-mono {
  font-family: monospace;
}

.text-primary {
  color: #2563eb;
}

.text-muted {
  color: #94a3b8;
}

.text-xs {
  font-size: 12px;
}
</style>
