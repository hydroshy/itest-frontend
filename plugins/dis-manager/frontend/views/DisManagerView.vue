<template>
  <div class="dis-manager-view p-4">
    <!-- CYBERPUNK HUD HEADER -->
    <div class="cyber-hud-header mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <div
            class="telemetry-beacon"
            :class="{
              'beacon-online': disStatus.connected && !disStatus.isMock,
              'beacon-mock': disStatus.isMock,
              'beacon-offline': !disStatus.connected,
            }"
            title="Trạng thái telemetry beacon"
          >
            <span class="beacon-core"></span>
            <span class="beacon-ring"></span>
          </div>
          <div>
            <div class="hud-watermark">[ NET_NODE // ODOO_GATEWAY v1.0 ]</div>
            <h2 class="title mb-1">
              <el-icon class="mr-2 text-cyan"><Connection /></el-icon>
              DIS (Odoo) Integration Hub
            </h2>
            <p class="subtitle text-muted mb-0">
              Giám sát kết nối DIS API Odoo, kiểm thử truy vấn Sandbox và quản lý đồng bộ Sales Order vào iTest.
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <el-tag
            :type="disStatus.connected ? 'success' : 'danger'"
            effect="dark"
            size="large"
            class="cyber-status-tag"
          >
            <span class="status-indicator"></span>
            {{ disStatus.connected ? 'ONLINE' : 'OFFLINE' }}
          </el-tag>
          <el-tag
            :type="disStatus.isMock ? 'warning' : 'primary'"
            effect="plain"
            size="large"
            class="cyber-mode-tag"
          >
            {{ disStatus.isMock ? 'MOCK MODE' : 'LIVE API' }}
          </el-tag>
          <el-button
            type="primary"
            class="cyber-refresh-btn"
            :icon="Refresh"
            :loading="checkingStatus"
            @click="fetchStatus"
          >
            Làm mới kết nối
          </el-button>
        </div>
      </div>
    </div>

    <!-- MAIN TABS -->
    <el-tabs v-model="activeTab" class="cyber-tabs">
      <!-- TAB 1: DASHBOARD & DIAGNOSTICS -->
      <el-tab-pane label="Chẩn đoán & Cấu hình" name="diagnostics">
        <el-row :gutter="20" class="mb-4">
          <!-- Card 1: Protocol & Host -->
          <el-col :span="8">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <span class="cyber-card-title">
                  <el-icon class="mr-1 text-cyan"><Monitor /></el-icon>
                  Trạng thái kết nối
                </span>
                <span class="cyber-bracket">[01]</span>
              </div>
              <div class="cyber-card-body">
                <div class="status-row mb-3">
                  <span class="text-secondary">Dịch vụ DIS:</span>
                  <el-tag size="small" :type="disStatus.connected ? 'success' : 'danger'">
                    {{ disStatus.connected ? 'Đang hoạt động' : 'Mất kết nối' }}
                  </el-tag>
                </div>
                <div class="status-row mb-3">
                  <span class="text-secondary">Chế độ vận hành:</span>
                  <el-tag size="small" :type="disStatus.isMock ? 'warning' : 'primary'">
                    {{ disStatus.isMock ? 'Dữ liệu Mock' : 'Live Odoo API' }}
                  </el-tag>
                </div>
                <div class="status-row">
                  <span class="text-secondary">Host đích:</span>
                  <code class="cyber-code-sm">{{ disStatus.baseUrl }}</code>
                </div>
              </div>
            </div>
          </el-col>

          <!-- Card 2: Security & Token -->
          <el-col :span="8">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <span class="cyber-card-title">
                  <el-icon class="mr-1 text-cyan"><Setting /></el-icon>
                  Xác thực & Bảo mật
                </span>
                <span class="cyber-bracket">[02]</span>
              </div>
              <div class="cyber-card-body">
                <div class="status-row mb-3">
                  <span class="text-secondary">Trạng thái Token:</span>
                  <div class="d-flex align-items-center gap-1">
                    <el-tag size="small" :type="disStatus.tokenConfigured ? 'success' : 'danger'">
                      {{ disStatus.tokenConfigured ? 'Đã gán biến' : 'Chưa cấu hình' }}
                    </el-tag>
                    <code v-if="disStatus.tokenMasked" class="cyber-code-sm ml-1" title="Token Masked">{{ disStatus.tokenMasked }}</code>
                  </div>
                </div>
                <div class="status-row mb-3">
                  <span class="text-secondary">Chuẩn hóa Auth:</span>
                  <span class="text-cyan text-sm">Bearer (Auto Normalization)</span>
                </div>
                <div class="status-row">
                  <span class="text-secondary">Tên biến:</span>
                  <code class="cyber-code-sm">DIS_SO_TOKEN</code>
                </div>
              </div>
            </div>
          </el-col>

          <!-- Card 3: Network Latency -->
          <el-col :span="8">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <span class="cyber-card-title">
                  <el-icon class="mr-1 text-cyan"><Aim /></el-icon>
                  Độ trễ & Telemetry
                </span>
                <span class="cyber-bracket">[03]</span>
              </div>
              <div class="cyber-card-body">
                <div class="status-row mb-3">
                  <span class="text-secondary">Độ trễ Ping:</span>
                  <span
                    class="latency-badge"
                    :class="{
                      'latency-fast': disStatus.latency != null && disStatus.latency < 100,
                      'latency-medium': disStatus.latency != null && disStatus.latency >= 100 && disStatus.latency < 500,
                      'latency-slow': disStatus.latency != null && disStatus.latency >= 500,
                    }"
                  >
                    {{ disStatus.latency != null ? disStatus.latency + ' ms' : 'Chưa đo' }}
                  </span>
                </div>
                <div class="status-row mb-3">
                  <span class="text-secondary">Đo kiểm trực tiếp:</span>
                  <el-button
                    size="small"
                    type="info"
                    plain
                    :icon="Aim"
                    :loading="pingingApi"
                    @click="pingHealth"
                  >
                    Gửi Ping thử
                  </el-button>
                </div>
                <div class="status-row">
                  <span class="text-secondary">Chu kỳ tự động:</span>
                  <span class="text-muted text-sm">Theo yêu cầu / Khi mở tab</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- DOCKGE ENVIRONMENT MATRIX TERMINAL -->
        <div class="terminal-window">
          <div class="terminal-header">
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="terminal-title">TERMINAL // DOCKGE_ENVIRONMENT_SETUP</span>
            <el-button
              class="terminal-copy-btn"
              size="small"
              :type="copiedEnv ? 'success' : 'primary'"
              :icon="copiedEnv ? Check : CopyDocument"
              @click="copyEnvGuide"
            >
              {{ copiedEnv ? 'Đã sao chép vào Clipboard' : 'Sao chép cấu hình' }}
            </el-button>
          </div>
          <div class="terminal-body">
            <div class="terminal-comment"># Bổ sung các biến môi trường vào container backend itest-system (Dockge / Compose):</div>
            <div class="terminal-code">
              <span class="code-comment"># 1. URL máy chủ DIS Odoo (mặc định https://dis-so.daviteq.com)</span>
              <br />
              <span class="code-var">DIS_SO_BASE_URL</span>=<span class="code-val">https://dis-so.daviteq.com</span>
              <br /><br />
              <span class="code-comment"># 2. Token xác thực (hệ thống tự động chuẩn hóa tiền tố Bearer, nhập chuỗi trần hay chuỗi có Bearer đều hoạt động)</span>
              <br />
              <span class="code-var">DIS_SO_TOKEN</span>=<span class="code-val">your_dis_api_token_here</span>
              <br /><br />
              <span class="code-comment"># 3. Chế độ Mock dữ liệu (false để gọi API Odoo thực tế, true để giả lập mẫu)</span>
              <br />
              <span class="code-var">DIS_MOCK_MODE</span>=<span class="code-val">false</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 2: SALES ORDERS EXPLORER -->
      <el-tab-pane label="Tra cứu & Đồng bộ SO" name="orders">
        <div class="cyber-panel">
          <!-- FILTER TOOLBAR -->
          <div class="filter-toolbar mb-3 p-3">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <el-input-number
                v-model="filterYear"
                :min="2020"
                :max="2035"
                placeholder="Năm (để trống: tất cả)"
                clearable
                style="width: 140px"
              />
              <el-select
                v-model="filterMonth"
                placeholder="Tháng"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="m in 12"
                  :key="m"
                  :label="'Tháng ' + m"
                  :value="m"
                />
              </el-select>
              <el-select
                v-model="filterState"
                placeholder="Trạng thái"
                clearable
                style="width: 150px"
              >
                <el-option label="Tất cả trạng thái" value="" />
                <el-option label="Sale Order" value="sale" />
                <el-option label="Done" value="done" />
                <el-option label="Quotation" value="draft" />
                <el-option label="Cancelled" value="cancel" />
              </el-select>
              <el-input
                v-model="filterQuery"
                placeholder="Tìm mã SO, khách hàng..."
                clearable
                style="width: 240px"
                @keyup.enter="searchOrders"
              />
              <el-button
                type="primary"
                :icon="Search"
                :loading="loadingOrders"
                class="cyber-search-btn"
                @click="searchOrders"
              >
                Tra cứu
              </el-button>
            </div>

            <div>
              <el-button
                type="success"
                :icon="Download"
                :disabled="!selectedOrder"
                :loading="syncingOrder"
                class="cyber-sync-btn"
                @click="syncCurrentOrder"
              >
                Đồng bộ SO vào iTest
              </el-button>
            </div>
          </div>

          <!-- ORDERS & LINES SPLIT -->
          <el-row :gutter="16">
            <!-- Left Pane: Orders Table -->
            <el-col :span="13">
              <div class="table-container-card">
                <div class="table-header-bar">
                  <span class="table-header-title">
                    <el-icon class="mr-1 text-cyan"><List /></el-icon>
                    DANH SÁCH SALES ORDERS ({{ orderList.length }})
                  </span>
                </div>
                <el-table
                  :data="orderList"
                  v-loading="loadingOrders"
                  highlight-current-row
                  border
                  stripe
                  class="cyber-table"
                  style="width: 100%"
                  max-height="520"
                  @current-change="handleOrderSelect"
                >
                  <el-table-column prop="odoo_id" label="ID Odoo" width="90" align="center">
                    <template #default="{ row }">
                      <code class="cyber-code-sm">{{ row.odoo_id || row.id }}</code>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="Mã Đơn (SO)" width="160">
                    <template #default="{ row }">
                      <span class="so-code-highlight">{{ row.number || row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="partner_name" label="Khách hàng" min-width="160" show-overflow-tooltip>
                    <template #default="{ row }">
                      {{ row.customer?.name || row.partner_name || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="date_order" label="Ngày đặt" width="130" align="center">
                    <template #default="{ row }">
                      {{ formatDate(row.order_date || row.date_order) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="amount_total" label="Tổng tiền" width="130" align="right">
                    <template #default="{ row }">
                      <span class="text-amount">{{ formatCurrency(row.amount_total != null ? row.amount_total : (row.amount || '-')) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="state" label="Trạng thái" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getStateTag(row.state?.code || row.state)" size="small" class="cyber-tag-state">
                        {{ row.state?.label || (typeof row.state === 'string' ? row.state : 'N/A') }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>

            <!-- Right Pane: Order Detail & Lines -->
            <el-col :span="11">
              <div class="lines-card-wrapper p-3">
                <div class="lines-header-hud mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="hud-tag">[ TELEMETRY // ORDER_ITEMS ]</span>
                    <span v-if="selectedOrder" class="hud-so-number">{{ selectedOrder.name }}</span>
                  </div>
                  <h4 class="m-0 mt-1">
                    <el-icon class="mr-2 text-cyan"><Document /></el-icon>
                    Chi tiết mặt hàng trong đơn
                  </h4>
                </div>

                <div v-if="!selectedOrder" class="empty-selection-placeholder">
                  <el-icon :size="48" class="text-muted mb-2"><List /></el-icon>
                  <p class="text-muted m-0">Vui lòng bấm chọn 1 dòng Sale Order bên trái để xem các mặt hàng chi tiết.</p>
                </div>

                <div v-else>
                  <!-- Quick Summary Metrics -->
                  <div class="order-summary-grid mb-3">
                    <div class="summary-metric-box">
                      <span class="metric-label">Khách hàng:</span>
                      <strong class="metric-value">{{ selectedOrder.partner_name || 'Khách vãng lai' }}</strong>
                    </div>
                    <div class="summary-metric-box">
                      <span class="metric-label">Tổng giá trị:</span>
                      <strong class="metric-value text-gold">{{ formatCurrency(selectedOrder.amount_total) }}</strong>
                    </div>
                  </div>

                  <el-table
                    :data="orderLineList"
                    v-loading="loadingLines"
                    border
                    size="small"
                    class="cyber-table"
                    style="width: 100%"
                    max-height="400"
                  >
                    <el-table-column prop="product_code" label="Mã SP" width="130" show-overflow-tooltip>
                      <template #default="{ row }">
                        <code class="cyber-code-sm">{{ row.sku || row.product_code || '-' }}</code>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="Tên Mặt Hàng" min-width="150" show-overflow-tooltip>
                      <template #default="{ row }">
                        <span>{{ row.product_name || row.name || '-' }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="product_uom_qty" label="SL" width="60" align="right">
                      <template #default="{ row }">
                        <span class="font-bold text-cyan">{{ row.quantity != null ? row.quantity : (row.product_uom_qty || 0) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="price_unit" label="Đơn giá" width="100" align="right">
                      <template #default="{ row }">
                        {{ formatCurrency(row.price_unit != null ? row.price_unit : row.unit_price) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- TAB 3: API SANDBOX / EXPLORER -->
      <el-tab-pane label="API Sandbox & Truy vấn thử" name="sandbox">
        <div class="cyber-panel p-4">
          <div class="mb-4">
            <h4 class="m-0 mb-1">
              <el-icon class="mr-2 text-cyan"><Cpu /></el-icon>
              DIS API Explorer &amp; Direct Probe
            </h4>
            <p class="text-sm text-muted m-0">
              Gửi yêu cầu kiểm tra trực tiếp tới DIS Endpoint để xem payload JSON raw và đo thời gian phản hồi thực tế.
            </p>
          </div>

          <el-row :gutter="20">
            <!-- Left: Query Form -->
            <el-col :span="10">
              <div class="sandbox-control-card p-3">
                <el-form label-position="top">
                  <el-form-item label="Endpoint thao tác kiểm thử:">
                    <el-select v-model="sandboxAction" style="width: 100%" @change="onSandboxActionChange">
                      <el-option label="GET /api/v1/health (Kiểm tra Server DIS)" value="health" />
                      <el-option label="GET /api/v1/so/search (Tìm kiếm Sales Orders)" value="search" />
                      <el-option label="GET /api/v1/so/{id} (Chi tiết đơn hàng)" value="detail" />
                    </el-select>
                  </el-form-item>

                  <div v-if="sandboxAction === 'search'">
                    <el-form-item label="Năm lọc:">
                      <el-input-number v-model="sandboxParams.year" :min="2020" :max="2035" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="Tháng lọc:">
                      <el-select v-model="sandboxParams.month" clearable style="width: 100%">
                        <el-option v-for="m in 12" :key="m" :label="'Tháng ' + m" :value="m" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="Từ khóa tìm kiếm:">
                      <el-input v-model="sandboxParams.q" placeholder="SO2026..." clearable />
                    </el-form-item>
                  </div>

                  <div v-if="sandboxAction === 'detail'">
                    <el-form-item label="Odoo SO ID hoặc Số ID đơn:">
                      <el-input v-model="sandboxParams.soId" placeholder="1001" clearable />
                    </el-form-item>
                  </div>

                  <div class="mt-4">
                    <el-button
                      type="primary"
                      :icon="Position"
                      :loading="executingSandbox"
                      class="cyber-probe-btn"
                      style="width: 100%"
                      @click="executeSandboxQuery"
                    >
                      Thực thi truy vấn (Execute Probe)
                    </el-button>
                  </div>
                </el-form>
              </div>
            </el-col>

            <!-- Right: Result Terminal Box -->
            <el-col :span="14">
              <div class="sandbox-terminal-box p-3">
                <div class="terminal-meta-bar mb-2 d-flex justify-content-between align-items-center">
                  <span class="text-cyan font-semibold">
                    <el-icon class="mr-1"><Document /></el-icon>
                    RAW JSON TELEMETRY RESPONSE
                  </span>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      v-if="sandboxResponseStatus"
                      class="status-pill"
                      :class="sandboxResponseStatus === 200 ? 'status-ok' : 'status-err'"
                    >
                      HTTP {{ sandboxResponseStatus }}
                    </span>
                    <span
                      v-if="sandboxLatency !== null"
                      class="latency-badge"
                      :class="{
                        'latency-fast': sandboxLatency < 100,
                        'latency-medium': sandboxLatency >= 100 && sandboxLatency < 500,
                        'latency-slow': sandboxLatency >= 500,
                      }"
                    >
                      {{ sandboxLatency }} ms
                    </span>
                  </div>
                </div>
                <div class="json-viewer">
                  <pre><code>{{ sandboxRawResponse || '// Kết quả JSON sẽ xuất hiện tại đây sau khi gửi request...' }}</code></pre>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  Connection,
  Monitor,
  Setting,
  Aim,
  Search,
  Download,
  List,
  Document,
  Cpu,
  Position,
  Refresh,
  CopyDocument,
  Check,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- STATE ---
const activeTab = ref('orders');
const checkingStatus = ref(false);
const pingingApi = ref(false);
const copiedEnv = ref(false);

const disStatus = reactive({
  connected: false,
  isMock: true,
  baseUrl: 'https://dis-so.daviteq.com',
  tokenConfigured: false,
  tokenMasked: '' as string,
  latency: null as number | null,
});

// Orders filter
const filterYear = ref<number | undefined>(undefined);
const filterMonth = ref<number | undefined>(undefined);
const filterState = ref('');
const filterQuery = ref('');
const loadingOrders = ref(false);
const orderList = ref<any[]>([]);

// Order detail & lines
const selectedOrder = ref<any>(null);
const orderLineList = ref<any[]>([]);
const loadingLines = ref(false);
const syncingOrder = ref(false);

// Sandbox State
const sandboxAction = ref('search');
const sandboxParams = reactive({
  year: new Date().getFullYear(),
  month: undefined as number | undefined,
  q: '',
  soId: '1001',
});
const executingSandbox = ref(false);
const sandboxRawResponse = ref('');
const sandboxResponseStatus = ref<number | null>(null);
const sandboxLatency = ref<number | null>(null);

// --- HELPERS ---
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: number | string) => {
  if (val == null) return '-';
  const num = Number(val);
  return isNaN(num) ? String(val) : num.toLocaleString('vi-VN') + ' đ';
};

const getStateTag = (state: string): string => {
  switch (state) {
    case 'sale':
      return 'success';
    case 'done':
      return 'info';
    case 'draft':
      return 'warning';
    case 'cancel':
      return 'danger';
    default:
      return '';
  }
};

const copyEnvGuide = async () => {
  const envContent = `# Cấu hình kết nối DIS API Odoo trong Dockge:
DIS_SO_BASE_URL=https://dis-so.daviteq.com
DIS_SO_TOKEN=your_dis_api_token_here
DIS_MOCK_MODE=false`;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(envContent);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = envContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    copiedEnv.value = true;
    ElMessage.success('Đã sao chép cấu hình mẫu Dockge vào clipboard!');
    setTimeout(() => {
      copiedEnv.value = false;
    }, 2500);
  } catch (err) {
    ElMessage.error('Không thể tự động sao chép: ' + (err as Error).message);
  }
};

// --- METHODS ---
const fetchStatus = async () => {
  checkingStatus.value = true;
  try {
    let res = await fetch('/api/plugins/dis-manager/status', { headers: getAuthHeaders() });
    if (!res.ok) {
      res = await fetch('/api/plugins/device-traceability/dis/status', { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch('/api/dis/status', { headers: getAuthHeaders() });
    }

    if (res.ok) {
      const data = await res.json();
      const disObj = data.dis || {};
      disStatus.connected = typeof data.connected === 'boolean' 
        ? data.connected 
        : (typeof disObj.enabled === 'boolean' ? (disObj.enabled && disObj.tokenConfigured) : data.status === 'online');
      disStatus.isMock = typeof data.isMock === 'boolean' 
        ? data.isMock 
        : (typeof disObj.mockMode === 'boolean' ? disObj.mockMode : false);
      disStatus.baseUrl = data.baseUrl || data.apiUrl || disObj.apiUrl || 'https://dis-so.daviteq.com';
      disStatus.tokenConfigured = typeof data.tokenConfigured === 'boolean' 
        ? data.tokenConfigured 
        : !!disObj.tokenConfigured;
      disStatus.tokenMasked = data.tokenMasked || disObj.tokenMasked || '';
      disStatus.latency = typeof data.latency === 'number' ? data.latency : (typeof disObj.latency === 'number' ? disObj.latency : null);
    } else {
      disStatus.connected = false;
      disStatus.isMock = true;
    }
  } catch (err) {
    console.warn('Lỗi kết nối kiểm tra status DIS:', err);
    disStatus.connected = false;
  } finally {
    checkingStatus.value = false;
  }
};

const pingHealth = async () => {
  pingingApi.value = true;
  try {
    let res = await fetch('/api/plugins/dis-manager/health', { headers: getAuthHeaders() });
    if (!res.ok) {
      res = await fetch('/api/plugins/device-traceability/dis/health', { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch('/api/dis/health', { headers: getAuthHeaders() });
    }

    if (res.ok) {
      const data = await res.json();
      ElMessage.success(data.message || 'Đã kiểm tra ping máy chủ DIS thành công.');
      await fetchStatus();
    } else {
      ElMessage.warning(`API phản hồi HTTP ${res.status}`);
    }
  } catch (err) {
    ElMessage.error('Không thể gửi lệnh Ping tới DIS API.');
  } finally {
    pingingApi.value = false;
  }
};

const searchOrders = async () => {
  loadingOrders.value = true;
  selectedOrder.value = null;
  orderLineList.value = [];
  try {
    const params = new URLSearchParams();
    if (filterYear.value) params.append('year', String(filterYear.value));
    if (filterMonth.value) params.append('month', String(filterMonth.value));
    if (filterState.value) params.append('state', filterState.value);
    if (filterQuery.value) params.append('q', filterQuery.value.trim());

    let res = await fetch(`/api/plugins/dis-manager/orders?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) 
        ? data 
        : (data.items || data.data || (data.result && data.result.items) || []);
      orderList.value = Array.isArray(list) ? list : [];
    } else {
      orderList.value = [];
      ElMessage.warning('Không tải được danh sách đơn hàng từ DIS API.');
    }
  } catch (err) {
    console.error('Lỗi searchOrders:', err);
    orderList.value = [];
    ElMessage.error('Lỗi kết nối khi gọi DIS API.');
  } finally {
    loadingOrders.value = false;
  }
};

const handleOrderSelect = async (row: any) => {
  if (!row) return;
  selectedOrder.value = row;
  orderLineList.value = [];
  loadingLines.value = true;

  const odooId = row.odoo_id || row.id;
  try {
    let res = await fetch(`/api/plugins/dis-manager/orders/${odooId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }

    if (res.ok) {
      const detail = await res.json();
      const lines = detail.lines || detail.order_line || [];
      orderLineList.value = Array.isArray(lines) ? lines : [];
    } else {
      orderLineList.value = [];
    }
  } catch (err) {
    console.error('Lỗi lấy chi tiết đơn hàng:', err);
    orderLineList.value = [];
  } finally {
    loadingLines.value = false;
  }
};

const syncCurrentOrder = async () => {
  if (!selectedOrder.value) return;
  syncingOrder.value = true;
  const odooId = selectedOrder.value.odoo_id || selectedOrder.value.id;

  try {
    let res = await fetch(`/api/plugins/dis-manager/sync/${odooId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ autoCreateWa: true }),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ autoCreateWa: true }),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ autoCreateWa: true }),
      });
    }

    if (res.ok) {
      const result = await res.json();
      ElMessage.success(result.message || `Đã đồng bộ đơn hàng ${selectedOrder.value.name} thành công!`);
    } else {
      const err = await res.json().catch(() => ({}));
      ElMessage.error(err.message || 'Lỗi khi đồng bộ đơn hàng.');
    }
  } catch (err) {
    console.error('Lỗi khi syncCurrentOrder:', err);
    ElMessage.error('Lỗi kết nối khi đồng bộ.');
  } finally {
    syncingOrder.value = false;
  }
};

// Sandbox Methods
const onSandboxActionChange = () => {
  sandboxRawResponse.value = '';
  sandboxResponseStatus.value = null;
  sandboxLatency.value = null;
};

const executeSandboxQuery = async () => {
  executingSandbox.value = true;
  sandboxRawResponse.value = '';
  sandboxResponseStatus.value = null;
  const start = performance.now();

  try {
    let endpoint = '';
    let method = 'GET';
    let body: any = null;

    if (sandboxAction.value === 'health') {
      endpoint = '/api/plugins/dis-manager/status';
    } else if (sandboxAction.value === 'search') {
      const params = new URLSearchParams();
      if (sandboxParams.year) params.append('year', String(sandboxParams.year));
      if (sandboxParams.month) params.append('month', String(sandboxParams.month));
      if (sandboxParams.q) params.append('q', sandboxParams.q.trim());
      endpoint = `/api/plugins/dis-manager/orders?${params.toString()}`;
    } else if (sandboxAction.value === 'detail') {
      endpoint = `/api/plugins/dis-manager/orders/${sandboxParams.soId}`;
    }

    let res = await fetch(endpoint, {
      method,
      headers: getAuthHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // Fallback if dis-manager route not yet active
    if (!res.ok && res.status === 404) {
      if (sandboxAction.value === 'health') {
        res = await fetch('/api/plugins/device-traceability/dis/status', { headers: getAuthHeaders() });
      } else if (sandboxAction.value === 'search') {
        const params = new URLSearchParams();
        if (sandboxParams.year) params.append('year', String(sandboxParams.year));
        if (sandboxParams.month) params.append('month', String(sandboxParams.month));
        if (sandboxParams.q) params.append('q', sandboxParams.q.trim());
        res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, { headers: getAuthHeaders() });
      } else if (sandboxAction.value === 'detail') {
        res = await fetch(`/api/plugins/device-traceability/dis/so/${sandboxParams.soId}`, { headers: getAuthHeaders() });
      }
    }

    const end = performance.now();
    sandboxLatency.value = Math.round(end - start);
    sandboxResponseStatus.value = res.status;

    const data = await res.json();
    sandboxRawResponse.value = JSON.stringify(data, null, 2);
  } catch (err: any) {
    const end = performance.now();
    sandboxLatency.value = Math.round(end - start);
    sandboxResponseStatus.value = 500;
    sandboxRawResponse.value = JSON.stringify({ error: err.message || 'Unknown network error' }, null, 2);
  } finally {
    executingSandbox.value = false;
  }
};

onMounted(async () => {
  await fetchStatus();
  await searchOrders();
});
</script>

<style scoped>
.dis-manager-view {
  min-height: 100%;
}

/* CYBERPUNK HUD HEADER */
.cyber-hud-header {
  background: rgba(15, 20, 34, 0.75);
  border: 1px solid rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.08);
  border-radius: 8px;
  padding: 18px 24px;
  backdrop-filter: blur(8px);
  position: relative;
}

.hud-watermark {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  color: rgba(0, 240, 255, 0.7);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.title {
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  color: #f1f5f9;
}

.subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
}

.text-cyan {
  color: #00f0ff !important;
}

.text-amount {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
  color: #38bdf8;
}

.text-gold {
  color: #facc15 !important;
  text-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
}

/* TELEMETRY BEACON PULSE */
.telemetry-beacon {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.beacon-core {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.beacon-ring {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  animation: beacon-pulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.beacon-online .beacon-core {
  background: #00f0ff;
  box-shadow: 0 0 10px #00f0ff;
}
.beacon-online .beacon-ring {
  border: 2px solid rgba(0, 240, 255, 0.6);
}

.beacon-mock .beacon-core {
  background: #fcee0a;
  box-shadow: 0 0 10px #fcee0a;
}
.beacon-mock .beacon-ring {
  border: 2px solid rgba(252, 238, 10, 0.6);
}

.beacon-offline .beacon-core {
  background: #ef4444;
  box-shadow: 0 0 10px #ef4444;
}
.beacon-offline .beacon-ring {
  border: 2px solid rgba(239, 68, 68, 0.6);
}

@keyframes beacon-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* STATUS TAGS & BUTTONS */
.cyber-status-tag {
  letter-spacing: 0.08em;
  font-weight: 600;
}

.status-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 6px;
}

.cyber-refresh-btn,
.cyber-search-btn,
.cyber-sync-btn,
.cyber-probe-btn {
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* CYBER CARDS (Tab 1) */
.cyber-card {
  background: rgba(20, 27, 45, 0.7);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
  height: 100%;
}

.cyber-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
}

.cyber-bracket {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(0, 240, 255, 0.6);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.cyber-code-sm {
  background: #0f1422;
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.82rem;
  color: #38bdf8;
}

/* LATENCY BADGES */
.latency-badge {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.latency-fast {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.2);
}

.latency-medium {
  background: rgba(0, 240, 255, 0.15);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
}

.latency-slow {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

/* TERMINAL WINDOW FOR DOCKGE */
.terminal-window {
  background: #0a0e17;
  border: 1px solid rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  overflow: hidden;
}

.terminal-header {
  background: #111827;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-red {
  background: #ef4444;
}
.dot-yellow {
  background: #eab308;
}
.dot-green {
  background: #22c55e;
}

.terminal-title {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

.terminal-body {
  padding: 16px 20px;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.86rem;
  line-height: 1.6;
}

.terminal-comment {
  color: #64748b;
  margin-bottom: 8px;
  font-style: italic;
}

.terminal-code {
  color: #e2e8f0;
}

.code-comment {
  color: #64748b;
}

.code-var {
  color: #00f0ff;
  font-weight: 600;
}

.code-val {
  color: #a3e635;
}

/* TAB 2 & 3 PANELS */
.cyber-panel {
  background: rgba(15, 20, 34, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
}

.filter-toolbar {
  background: rgba(20, 27, 45, 0.8);
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.table-container-card {
  background: rgba(20, 27, 45, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.table-header-bar {
  background: #111827;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
}

.table-header-title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #e2e8f0;
  display: flex;
  align-items: center;
}

.so-code-highlight {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 700;
  color: #00f0ff;
  transition: all 0.2s ease;
}

.so-code-highlight:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.8);
}

/* RIGHT PANE: SO DETAIL LINES */
.lines-card-wrapper {
  background: rgba(20, 27, 45, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
  min-height: 520px;
}

.lines-header-hud {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 10px;
}

.hud-tag {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(0, 240, 255, 0.8);
  letter-spacing: 0.12em;
}

.hud-so-number {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 700;
  font-size: 0.95rem;
  color: #facc15;
}

.empty-selection-placeholder {
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.order-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-metric-box {
  background: rgba(15, 20, 34, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.metric-value {
  font-size: 0.95rem;
  color: #f1f5f9;
}

/* TAB 3: SANDBOX */
.sandbox-control-card {
  background: rgba(20, 27, 45, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
}

.sandbox-terminal-box {
  background: #0a0e17;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  min-height: 480px;
}

.terminal-meta-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}

.status-pill {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-ok {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.status-err {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.json-viewer {
  max-height: 420px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: #38bdf8;
  padding: 8px 0;
}

.json-viewer pre {
  margin: 0;
}

.json-viewer code {
  color: #38bdf8;
}

/* UTILITIES */
.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}
</style>
