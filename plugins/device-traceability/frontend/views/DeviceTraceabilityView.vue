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
            Hệ thống quản lý truy xuất nguồn gốc thiết bị, lệnh sản xuất ERP, thông số phần cứng, viễn thông và lịch sử kiểm định cấu hình.
          </p>
        </div>
      </div>
      <div class="header-right">
        <el-tag effect="dark" type="success" class="header-tag">
          <el-icon><Check /></el-icon> BI Metabase Ready
        </el-tag>
        <el-tag effect="plain" type="info">v1.0.0</el-tag>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <el-tabs v-model="activeTab" class="traceability-tabs" type="border-card">
      <!-- TAB 1: WORK ORDERS -->
      <el-tab-pane name="orders">
        <template #label>
          <span class="tab-label">
            <el-icon><List /></el-icon> Lô Sản Xuất (Work Orders)
          </span>
        </template>

        <div class="tab-toolbar">
          <div class="search-filters">
            <el-input
              v-model="orderSearchQuery"
              placeholder="Tìm theo SO, WA hoặc Item Code..."
              prefix-icon="Search"
              clearable
              style="width: 280px"
              @input="filterOrders"
            />
            <el-select
              v-model="orderConnectivityFilter"
              placeholder="Loại kết nối"
              clearable
              style="width: 160px"
              @change="fetchOrders"
            >
              <el-option label="Tất cả kết nối" value="" />
              <el-option label="LoRaWAN" value="LoRaWAN" />
              <el-option label="Sigfox" value="Sigfox" />
              <el-option label="NB-IoT" value="NB-IoT" />
              <el-option label="Others" value="Others" />
            </el-select>
            <el-button type="primary" plain icon="Refresh" @click="fetchOrders" :loading="loadingOrders">
              Làm mới
            </el-button>
          </div>
          <div class="action-buttons">
            <el-button type="primary" icon="Plus" @click="openCreateOrderDialog">
              Tạo Lô Lệnh Mới
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loadingOrders"
          :data="filteredOrders"
          stripe
          border
          style="width: 100%"
          highlight-current-row
          @current-change="handleOrderSelect"
        >
          <el-table-column prop="soNumber" label="Số SO (Sales Order)" width="160" sortable>
            <template #default="{ row }">
              <span class="font-bold text-primary">{{ row.soNumber || row.so_number }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="waNumber" label="Số WA (Work Auth)" width="160" sortable>
            <template #default="{ row }">
              <span class="font-mono text-dark">{{ row.waNumber || row.wa_number }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="itemCode" label="Mã Sản Phẩm (Item Code)" min-width="180">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.itemCode || row.item_code }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="connectivity" label="Kết Nối" width="130" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getConnectivityTagType(row.connectivity)"
                effect="light"
                class="font-semibold"
              >
                {{ row.connectivity }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalQuantity" label="Kế Hoạch" width="110" align="center">
            <template #default="{ row }">
              <span class="font-bold">{{ row.totalQuantity || row.total_quantity || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Tiến Độ / Đã Nhập" min-width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                  :percentage="calcOrderProgress(row)"
                  :status="calcOrderProgress(row) >= 100 ? 'success' : undefined"
                  :stroke-width="10"
                />
                <span class="progress-text">
                  {{ row.deviceCount || row.device_count || 0 }} / {{ row.totalQuantity || row.total_quantity || 0 }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="Ngày Tạo" width="160" align="center">
            <template #default="{ row }">
              <span class="text-xs text-muted">{{ formatDate(row.createdAt || row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Thao Tác" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                icon="View"
                @click.stop="viewOrderDevices(row)"
              >
                Xem Thiết Bị
              </el-button>
              <el-button
                size="small"
                type="success"
                link
                icon="Upload"
                @click.stop="quickImportForOrder(row)"
              >
                Import
              </el-button>
              <el-popconfirm
                title="Bạn có chắc chắn muốn xóa lô lệnh này?"
                confirm-button-text="Xóa"
                cancel-button-text="Hủy"
                @confirm="deleteOrder(row.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger" link icon="Delete">
                    Xóa
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <!-- Selected Order Devices Drawer / Subtable -->
        <div v-if="selectedOrder" class="order-devices-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Cpu /></el-icon>
              Danh Sách Thiết Bị Lô: <strong>{{ selectedOrder.soNumber || selectedOrder.so_number }}</strong> ({{ selectedOrder.waNumber || selectedOrder.wa_number }}) - {{ selectedOrder.itemCode || selectedOrder.item_code }}
            </div>
            <div class="panel-actions">
              <el-button size="small" type="primary" icon="Plus" @click="quickImportForOrder(selectedOrder)">
                Đăng ký thiết bị vào lô
              </el-button>
              <el-button size="small" icon="Close" @click="selectedOrder = null">
                Đóng
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loadingOrderDevices"
            :data="selectedOrderDevices"
            stripe
            size="small"
            border
            style="width: 100%"
          >
            <el-table-column prop="serialNumber" label="Serial Number (SN)" min-width="180">
              <template #default="{ row }">
                <span class="font-bold text-primary font-mono">{{ row.serialNumber || row.serial_number }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sku" label="SKU" width="140" />
            <el-table-column prop="fwVersion" label="FW Version" width="130">
              <template #default="{ row }">
                <span class="font-mono text-xs">{{ row.fwVersion || row.fw_version }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="hwVersion" label="HW" width="90">
              <template #default="{ row }">
                <span class="font-mono text-xs">{{ row.hwVersion || row.hw_version || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Thông Số Viễn Thông" min-width="220">
              <template #default="{ row }">
                <div v-if="row.devEui || row.dev_eui" class="telecom-badge">
                  <span class="label">DevEUI:</span>
                  <span class="value font-mono">{{ row.devEui || row.dev_eui }}</span>
                </div>
                <div v-if="row.sigfoxId || row.sigfox_id" class="telecom-badge">
                  <span class="label">Sigfox ID:</span>
                  <span class="value font-mono">{{ row.sigfoxId || row.sigfox_id }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="configStatus" label="Final Config" width="140" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="getConfigStatusTagType(row.configStatus || row.config_status)"
                  size="small"
                >
                  {{ row.configStatus || row.config_status || 'PENDING' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Trạng Thái QA" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.status || 'INITIAL' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Tra cứu" width="100" align="center">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  link
                  icon="Search"
                  @click="inspectDevice(row.serialNumber || row.serial_number)"
                >
                  Chi tiết
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- TAB 2: DEVICE LOOKUP & LIFECYCLE -->
      <el-tab-pane name="lookup">
        <template #label>
          <span class="tab-label">
            <el-icon><Search /></el-icon> Tra Cứu Thiết Bị (Device Lookup)
          </span>
        </template>

        <div class="lookup-card">
          <div class="lookup-input-bar">
            <el-input
              v-model="lookupQuery"
              placeholder="Nhập Serial Number, DevEUI (16 hex) hoặc Sigfox ID (8 hex)..."
              size="large"
              clearable
              @keyup.enter="handleDeviceLookup"
            >
              <template #prepend>
                <el-icon><Cpu /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" :loading="loadingLookup" @click="handleDeviceLookup">
                  Tra Cứu Toàn Diện
                </el-button>
              </template>
            </el-input>
          </div>

          <div v-if="deviceLifecycle" class="lifecycle-result">
            <!-- Summary Banner -->
            <div class="device-summary-banner">
              <div class="summary-left">
                <div class="sn-title">
                  <span class="sn-text">{{ deviceLifecycle.serialNumber || deviceLifecycle.serial_number }}</span>
                  <el-tag :type="getConfigStatusTagType(deviceLifecycle.configStatus || deviceLifecycle.config_status)" size="small">
                    {{ deviceLifecycle.configStatus || deviceLifecycle.config_status || 'CHƯA CẤU HÌNH' }}
                  </el-tag>
                  <el-tag effect="plain" size="small">{{ deviceLifecycle.status || 'INITIAL' }}</el-tag>
                </div>
                <div class="sn-sub">
                  SKU: <strong>{{ deviceLifecycle.sku }}</strong> | FW: <strong>{{ deviceLifecycle.fwVersion || deviceLifecycle.fw_version }}</strong> | HW: <strong>{{ deviceLifecycle.hwVersion || deviceLifecycle.hw_version || 'N/A' }}</strong>
                </div>
              </div>
              <div class="summary-right">
                <div class="metric-box">
                  <div class="metric-label">Lệnh Sản Xuất</div>
                  <div class="metric-val text-primary">{{ deviceLifecycle.order?.soNumber || deviceLifecycle.order?.so_number || 'N/A' }}</div>
                </div>
                <div class="metric-box">
                  <div class="metric-label">Work Authorization</div>
                  <div class="metric-val">{{ deviceLifecycle.order?.waNumber || deviceLifecycle.order?.wa_number || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Detailed Grid -->
            <el-row :gutter="16" class="mt-4">
              <!-- ERP & Hardware Card -->
              <el-col :span="8">
                <el-card shadow="hover" header="Thông Tin ERP & Phần Cứng">
                  <div class="detail-list">
                    <div class="detail-item">
                      <span class="label">Sales Order:</span>
                      <span class="val font-bold">{{ deviceLifecycle.order?.soNumber || deviceLifecycle.order?.so_number || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Work Auth:</span>
                      <span class="val">{{ deviceLifecycle.order?.waNumber || deviceLifecycle.order?.wa_number || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Item Code:</span>
                      <span class="val">{{ deviceLifecycle.order?.itemCode || deviceLifecycle.order?.item_code || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Loại Kết Nối:</span>
                      <span class="val">
                        <el-tag size="small" :type="getConnectivityTagType(deviceLifecycle.order?.connectivity)">
                          {{ deviceLifecycle.order?.connectivity || 'LoRaWAN' }}
                        </el-tag>
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Phiên Bản ME:</span>
                      <span class="val font-mono">{{ deviceLifecycle.meVersion || deviceLifecycle.me_version || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Ngày Tạo:</span>
                      <span class="val text-xs text-muted">{{ formatDate(deviceLifecycle.createdAt || deviceLifecycle.created_at) }}</span>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <!-- Telecom & Keys Card -->
              <el-col :span="8">
                <el-card shadow="hover" header="Khóa Viễn Thông (Telecom Credentials)">
                  <div class="detail-list">
                    <div v-if="deviceLifecycle.devEui || deviceLifecycle.dev_eui" class="detail-item">
                      <span class="label">DevEUI:</span>
                      <span class="val font-mono font-bold">{{ deviceLifecycle.devEui || deviceLifecycle.dev_eui }}</span>
                    </div>
                    <div v-if="deviceLifecycle.appEui || deviceLifecycle.app_eui" class="detail-item">
                      <span class="label">AppEUI / JoinEUI:</span>
                      <span class="val font-mono">{{ deviceLifecycle.appEui || deviceLifecycle.app_eui }}</span>
                    </div>
                    <div v-if="deviceLifecycle.appKey || deviceLifecycle.app_key" class="detail-item">
                      <span class="label">AppKey (Root):</span>
                      <span class="val font-mono text-xs">{{ maskKey(deviceLifecycle.appKey || deviceLifecycle.app_key) }}</span>
                    </div>
                    <div v-if="deviceLifecycle.sigfoxId || deviceLifecycle.sigfox_id" class="detail-item">
                      <span class="label">Sigfox ID:</span>
                      <span class="val font-mono font-bold">{{ deviceLifecycle.sigfoxId || deviceLifecycle.sigfox_id }}</span>
                    </div>
                    <div v-if="deviceLifecycle.sigfoxPac || deviceLifecycle.sigfox_pac" class="detail-item">
                      <span class="label">Sigfox PAC:</span>
                      <span class="val font-mono text-xs">{{ maskKey(deviceLifecycle.sigfoxPac || deviceLifecycle.sigfox_pac) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">ChirpStack Sync:</span>
                      <span class="val">
                        <el-tag size="small" :type="deviceLifecycle.chirpstackSynced ? 'success' : 'info'">
                          {{ deviceLifecycle.chirpstackSynced ? 'Đã đồng bộ' : 'Chưa đồng bộ' }}
                        </el-tag>
                      </span>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <!-- Final Config & Audit Card -->
              <el-col :span="8">
                <el-card shadow="hover" header="Lịch Sử Kiểm Định (Final Config Session)">
                  <div v-if="deviceLifecycle.finalConfigSession" class="detail-list">
                    <div class="detail-item">
                      <span class="label">Phiên Kiểm Tra:</span>
                      <span class="val font-mono text-xs">{{ deviceLifecycle.finalConfigSession.id }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Trạng Thái Phiên:</span>
                      <span class="val">
                        <el-tag size="small" :type="getConfigStatusTagType(deviceLifecycle.finalConfigSession.status)">
                          {{ deviceLifecycle.finalConfigSession.status }}
                        </el-tag>
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Kết Quả Bước:</span>
                      <span class="val font-bold">
                        PASS: {{ deviceLifecycle.finalConfigSession.passedSteps ?? deviceLifecycle.finalConfigSession.passed_steps ?? 0 }} /
                        Tổng: {{ deviceLifecycle.finalConfigSession.totalSteps ?? deviceLifecycle.finalConfigSession.total_steps ?? 0 }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Thời Điểm Hoàn Tất:</span>
                      <span class="val text-xs text-muted">
                        {{ formatDate(deviceLifecycle.finalConfigSession.finishedAt || deviceLifecycle.finalConfigSession.finished_at) }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="empty-notice">
                    <el-empty description="Chưa có dữ liệu phiên Final Config nào được liên kết với Serial này." :image-size="60" />
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- Execution Logs Table if available -->
            <div v-if="deviceLifecycle.executionLogs && deviceLifecycle.executionLogs.length > 0" class="mt-4">
              <el-card shadow="hover" header="Chi Tiết Checkpoint Các Thanh Ghi Kiểm Định (Execution Log)">
                <el-table :data="deviceLifecycle.executionLogs" size="small" stripe border>
                  <el-table-column prop="modbusRegisterDec" label="Register (Dec)" width="130" align="center" />
                  <el-table-column prop="modbusRegisterHex" label="Register (Hex)" width="130" align="center" />
                  <el-table-column prop="action" label="Hành Động" width="100" align="center" />
                  <el-table-column prop="status" label="Kết Quả" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.status === 'PASS' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="expectedValue" label="Giá Trị Kỳ Vọng" min-width="140" />
                  <el-table-column prop="readValue" label="Giá Trị Đọc Thực Tế" min-width="140" />
                  <el-table-column prop="rawHex" label="Raw Hex" min-width="150">
                    <template #default="{ row }">
                      <span class="font-mono text-xs">{{ row.rawHex }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="durationMs" label="Thời gian (ms)" width="110" align="right" />
                </el-table>
              </el-card>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 3: BATCH ENROLLMENT / IMPORT -->
      <el-tab-pane name="enrollment">
        <template #label>
          <span class="tab-label">
            <el-icon><Upload /></el-icon> Đăng Ký / Import Thiết Bị (Batch Enrollment)
          </span>
        </template>

        <div class="enrollment-container">
          <el-card shadow="hover" class="box-card">
            <template #header>
              <div class="card-header">
                <span>Nhập Hàng Loạt Thiết Bị Vào Lệnh Sản Xuất</span>
                <el-tag type="info">Hỗ trợ dán bảng từ Excel / TSV / CSV / JSON</el-tag>
              </div>
            </template>

            <el-form label-position="top">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Chọn Lô Lệnh Sản Xuất Đích (Target Order)" required>
                    <el-select
                      v-model="batchForm.orderId"
                      placeholder="Chọn SO / WA..."
                      style="width: 100%"
                      filterable
                      @change="handleBatchOrderChange"
                    >
                      <el-option
                        v-for="ord in ordersList"
                        :key="ord.id"
                        :label="`${ord.soNumber || ord.so_number} - ${ord.waNumber || ord.wa_number} (${ord.itemCode || ord.item_code} | ${ord.connectivity})`"
                        :value="ord.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label="SKU Mặc Định">
                    <el-input v-model="batchForm.defaultSku" placeholder="Ví dụ: WSLRW-ATH" />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label="Firmware Version Mặc Định">
                    <el-input v-model="batchForm.defaultFw" placeholder="Ví dụ: FW_1.0.4" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item
                label="Dữ liệu danh sách thiết bị (Hàng: Serial Number, DevEUI / Sigfox ID, AppKey / Sigfox PAC, SKU, FW)"
                required
              >
                <el-input
                  v-model="batchRawText"
                  type="textarea"
                  :rows="8"
                  placeholder="Dán dữ liệu từ Excel/CSV tại đây. Ví dụ:
SN202610220001	0011223344556677	00112233445566778899AABBCCDDEEFF	WSLRW-ATH	FW_1.0.4
SN202610220002	0011223344556678	00112233445566778899AABBCCDDEEFF	WSLRW-ATH	FW_1.0.4"
                  @input="parseBatchText"
                />
              </el-form-item>

              <div class="batch-preview-header">
                <span class="preview-title">Xem trước danh sách parse được ({{ parsedBatchDevices.length }} thiết bị)</span>
                <el-button size="small" type="primary" plain @click="parseBatchText">
                  Phân tích lại
                </el-button>
              </div>

              <el-table
                v-if="parsedBatchDevices.length > 0"
                :data="parsedBatchDevices"
                stripe
                border
                size="small"
                max-height="300"
                style="width: 100%; margin-top: 8px"
              >
                <el-table-column type="index" width="50" align="center" />
                <el-table-column prop="serialNumber" label="Serial Number" min-width="160">
                  <template #default="{ row }">
                    <span class="font-bold font-mono">{{ row.serialNumber }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="sku" label="SKU" width="130" />
                <el-table-column prop="fwVersion" label="FW Version" width="130" />
                <el-table-column prop="devEui" label="DevEUI / ID" min-width="160" />
                <el-table-column prop="appKey" label="AppKey / PAC" min-width="160">
                  <template #default="{ row }">
                    <span class="font-mono text-xs">{{ maskKey(row.appKey) }}</span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="submit-action-bar mt-4">
                <el-button
                  type="primary"
                  size="large"
                  icon="Check"
                  :disabled="parsedBatchDevices.length === 0 || !batchForm.orderId"
                  :loading="submittingBatch"
                  @click="submitBatchDevices"
                >
                  Xác Nhận Import {{ parsedBatchDevices.length }} Thiết Bị
                </el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- CREATE ORDER DIALOG -->
    <el-dialog
      v-model="createOrderDialogVisible"
      title="Tạo Lô Lệnh Sản Xuất Mới (Work Order)"
      width="560px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="Số Đơn Bán Hàng ERP (SO Number)" required>
          <el-input v-model="newOrderForm.soNumber" placeholder="Ví dụ: SO/2026/01850" />
        </el-form-item>
        <el-form-item label="Số Lệnh Sản Xuất (WA Number)" required>
          <el-input v-model="newOrderForm.waNumber" placeholder="Ví dụ: WA/2026/00412" />
        </el-form-item>
        <el-form-item label="Mã Sản Phẩm ERP (Item Code)" required>
          <el-input v-model="newOrderForm.itemCode" placeholder="Ví dụ: WSLRW-ATH-11" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="Loại Kết Nối Viễn Thông" required>
              <el-select v-model="newOrderForm.connectivity" style="width: 100%">
                <el-option label="LoRaWAN" value="LoRaWAN" />
                <el-option label="Sigfox" value="Sigfox" />
                <el-option label="NB-IoT" value="NB-IoT" />
                <el-option label="Others" value="Others" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số Lượng Kế Hoạch" required>
              <el-input-number v-model="newOrderForm.totalQuantity" :min="1" :max="100000" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Ghi Chú Đơn Hàng">
          <el-input v-model="newOrderForm.notes" type="textarea" :rows="2" placeholder="Ghi chú kỹ thuật..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOrderDialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="creatingOrder" @click="submitCreateOrder">
          Tạo Lệnh
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Files,
  List,
  Search,
  Upload,
  Plus,
  Refresh,
  Check,
  Close,
  Cpu,
  View,
  Delete,
} from '@element-plus/icons-vue';

// -----------------------------------------------------------------------------
// STATE
// -----------------------------------------------------------------------------
const activeTab = ref<'orders' | 'lookup' | 'enrollment'>('orders');

// Orders state
const ordersList = ref<any[]>([]);
const loadingOrders = ref(false);
const orderSearchQuery = ref('');
const orderConnectivityFilter = ref('');
const selectedOrder = ref<any | null>(null);
const selectedOrderDevices = ref<any[]>([]);
const loadingOrderDevices = ref(false);

// Create order dialog
const createOrderDialogVisible = ref(false);
const creatingOrder = ref(false);
const newOrderForm = ref({
  soNumber: '',
  waNumber: '',
  itemCode: '',
  connectivity: 'LoRaWAN',
  totalQuantity: 100,
  notes: '',
});

// Device lookup state
const lookupQuery = ref('');
const loadingLookup = ref(false);
const deviceLifecycle = ref<any | null>(null);

// Batch enrollment state
const batchRawText = ref('');
const batchForm = ref({
  orderId: '',
  defaultSku: '',
  defaultFw: '',
});
const parsedBatchDevices = ref<any[]>([]);
const submittingBatch = ref(false);

// -----------------------------------------------------------------------------
// API CLIENT HELPERS
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
// ORDERS WORKFLOW
// -----------------------------------------------------------------------------
const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    let url = '/api/plugins/device-traceability/orders';
    if (orderConnectivityFilter.value) {
      url += `?connectivity=${encodeURIComponent(orderConnectivityFilter.value)}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      // Fallback mock if backend not yet running in memory
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    ordersList.value = Array.isArray(data) ? data : (data.items || []);
  } catch (err: any) {
    console.warn('Orders API not yet active or error:', err.message);
  } finally {
    loadingOrders.value = false;
  }
};

const filteredOrders = computed(() => {
  const q = orderSearchQuery.value.trim().toLowerCase();
  if (!q) return ordersList.value;
  return ordersList.value.filter((o) => {
    const so = (o.soNumber || o.so_number || '').toLowerCase();
    const wa = (o.waNumber || o.wa_number || '').toLowerCase();
    const item = (o.itemCode || o.item_code || '').toLowerCase();
    return so.includes(q) || wa.includes(q) || item.includes(q);
  });
});

const filterOrders = () => {
  // Triggered by input
};

const handleOrderSelect = async (row: any) => {
  if (!row) return;
  selectedOrder.value = row;
  await fetchOrderDevices(row.id);
};

const viewOrderDevices = async (row: any) => {
  selectedOrder.value = row;
  await fetchOrderDevices(row.id);
};

const fetchOrderDevices = async (orderId: string) => {
  loadingOrderDevices.value = true;
  try {
    const res = await fetch(`/api/plugins/device-traceability/orders/${orderId}/devices`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    selectedOrderDevices.value = Array.isArray(data) ? data : (data.items || []);
  } catch (err: any) {
    console.warn(`Lỗi tải thiết bị cho Order ${orderId}:`, err.message);
    selectedOrderDevices.value = [];
  } finally {
    loadingOrderDevices.value = false;
  }
};

const openCreateOrderDialog = () => {
  newOrderForm.value = {
    soNumber: '',
    waNumber: '',
    itemCode: '',
    connectivity: 'LoRaWAN',
    totalQuantity: 100,
    notes: '',
  };
  createOrderDialogVisible.value = true;
};

const submitCreateOrder = async () => {
  if (!newOrderForm.value.soNumber || !newOrderForm.value.waNumber || !newOrderForm.value.itemCode) {
    ElMessage.warning('Vui lòng điền đầy đủ SO, WA và Item Code.');
    return;
  }
  creatingOrder.value = true;
  try {
    const res = await fetch('/api/plugins/device-traceability/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newOrderForm.value),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    ElMessage.success('Tạo lô lệnh sản xuất thành công!');
    createOrderDialogVisible.value = false;
    await fetchOrders();
  } catch (err: any) {
    ElMessage.error(`Lỗi tạo lô lệnh: ${err.message}`);
  } finally {
    creatingOrder.value = false;
  }
};

const deleteOrder = async (id: string) => {
  try {
    const res = await fetch(`/api/plugins/device-traceability/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ElMessage.success('Đã xóa lô lệnh thành công.');
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = null;
    }
    await fetchOrders();
  } catch (err: any) {
    ElMessage.error(`Lỗi xóa: ${err.message}`);
  }
};

const quickImportForOrder = (order: any) => {
  batchForm.value.orderId = order.id;
  batchForm.value.defaultSku = order.itemCode || order.item_code || '';
  activeTab.value = 'enrollment';
};

// -----------------------------------------------------------------------------
// DEVICE LOOKUP WORKFLOW
// -----------------------------------------------------------------------------
const handleDeviceLookup = async () => {
  const q = lookupQuery.value.trim();
  if (!q) {
    ElMessage.warning('Vui lòng nhập Serial Number, DevEUI hoặc Sigfox ID.');
    return;
  }
  loadingLookup.value = true;
  deviceLifecycle.value = null;
  try {
    let url = `/api/plugins/device-traceability/devices/lookup?serialNumber=${encodeURIComponent(q)}`;
    if (q.length === 16 && /^[0-9a-fA-F]+$/.test(q)) {
      url = `/api/plugins/device-traceability/devices/lookup?devEui=${encodeURIComponent(q)}`;
    } else if (q.length === 8 && /^[0-9a-fA-F]+$/.test(q)) {
      url = `/api/plugins/device-traceability/devices/lookup?sigfoxId=${encodeURIComponent(q)}`;
    }

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      if (res.status === 404) {
        ElMessage.warning(`Không tìm thấy thiết bị nào khớp với [${q}]`);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const device = await res.json();

    // Fetch full lifecycle
    const lifecycleRes = await fetch(`/api/plugins/device-traceability/devices/${device.id}/lifecycle`, {
      headers: getAuthHeaders(),
    });
    if (lifecycleRes.ok) {
      deviceLifecycle.value = await lifecycleRes.json();
    } else {
      deviceLifecycle.value = device;
    }
    ElMessage.success(`Đã tải hồ sơ thiết bị [${device.serialNumber || device.serial_number}]`);
  } catch (err: any) {
    ElMessage.error(`Lỗi tra cứu: ${err.message}`);
  } finally {
    loadingLookup.value = false;
  }
};

const inspectDevice = (serial: string) => {
  lookupQuery.value = serial;
  activeTab.value = 'lookup';
  handleDeviceLookup();
};

// -----------------------------------------------------------------------------
// BATCH ENROLLMENT WORKFLOW
// -----------------------------------------------------------------------------
const handleBatchOrderChange = (orderId: string) => {
  const found = ordersList.value.find((o) => o.id === orderId);
  if (found) {
    batchForm.value.defaultSku = found.itemCode || found.item_code || '';
  }
};

const parseBatchText = () => {
  const text = batchRawText.value.trim();
  if (!text) {
    parsedBatchDevices.value = [];
    return;
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const results: any[] = [];

  for (const line of lines) {
    const parts = line.split(/[\t,;]+/).map((p) => p.trim());
    if (parts.length === 0 || !parts[0]) continue;

    const sn = parts[0];
    const devId = parts[1] || '';
    const key = parts[2] || '';
    const sku = parts[3] || batchForm.value.defaultSku || 'DEFAULT-SKU';
    const fw = parts[4] || batchForm.value.defaultFw || 'FW_1.0.0';

    const devObj: any = {
      serialNumber: sn,
      sku,
      fwVersion: fw,
    };

    // Auto-detect telecom key format
    if (devId.length === 16) {
      devObj.devEui = devId;
      devObj.appKey = key;
    } else if (devId.length === 8) {
      devObj.sigfoxId = devId;
      devObj.sigfoxPac = key;
    }

    results.push(devObj);
  }

  parsedBatchDevices.value = results;
};

const submitBatchDevices = async () => {
  if (!batchForm.value.orderId) {
    ElMessage.warning('Vui lòng chọn lô lệnh đích.');
    return;
  }
  if (parsedBatchDevices.value.length === 0) {
    ElMessage.warning('Không có thiết bị hợp lệ nào để import.');
    return;
  }

  submittingBatch.value = true;
  try {
    const res = await fetch(`/api/plugins/device-traceability/orders/${batchForm.value.orderId}/devices/batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ devices: parsedBatchDevices.value }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    ElMessage.success(`Đã import thành công ${data.count || parsedBatchDevices.value.length} thiết bị vào lô!`);
    batchRawText.value = '';
    parsedBatchDevices.value = [];
    await fetchOrders();
  } catch (err: any) {
    ElMessage.error(`Lỗi import: ${err.message}`);
  } finally {
    submittingBatch.value = false;
  }
};

// -----------------------------------------------------------------------------
// FORMATTERS & HELPERS
// -----------------------------------------------------------------------------
const getConnectivityTagType = (conn?: string) => {
  switch (conn?.toUpperCase()) {
    case 'LORAWAN':
      return 'success';
    case 'SIGFOX':
      return 'warning';
    case 'NB-IOT':
      return 'primary';
    default:
      return 'info';
  }
};

const getConfigStatusTagType = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'CONFIGURED_PASS':
    case 'COMPLETED':
    case 'PASS':
      return 'success';
    case 'CONFIGURED_FAIL':
    case 'FAILED':
    case 'FAIL':
      return 'danger';
    case 'IN_PROGRESS':
    case 'CONFIGURING':
      return 'warning';
    default:
      return 'info';
  }
};

const calcOrderProgress = (row: any) => {
  const total = Number(row.totalQuantity || row.total_quantity || 0);
  const current = Number(row.deviceCount || row.device_count || 0);
  if (total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`;
  } catch {
    return dateStr;
  }
};

const maskKey = (key?: string) => {
  if (!key) return '-';
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.traceability-view {
  padding: 16px;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  min-width: 60px;
}

.order-devices-panel {
  margin-top: 20px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
}

.telecom-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.telecom-badge .label {
  color: #64748b;
}

.lookup-card {
  padding: 8px;
}

.lookup-input-bar {
  max-width: 720px;
  margin: 12px auto 24px auto;
}

.device-summary-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sn-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sn-text {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  color: #1e3a8a;
}

.sn-sub {
  margin-top: 6px;
  font-size: 13px;
  color: #475569;
}

.summary-right {
  display: flex;
  gap: 20px;
}

.metric-box {
  text-align: right;
}

.metric-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.metric-val {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-item .label {
  color: #64748b;
}

.empty-notice {
  padding: 16px 0;
}

.batch-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.submit-action-bar {
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
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
