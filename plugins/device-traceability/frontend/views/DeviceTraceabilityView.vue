<template>
  <div class="traceability-container">
    <!-- Page Header (hiển thị khi không phân lập hoặc isolated view header) -->
    <div v-if="isIsolatedView" class="isolated-header-bar">
      <el-button link :icon="ArrowLeft" @click="goBackToMenu">Trở về Menu</el-button>
      <span class="isolated-title">{{ isolatedTitle }}</span>
      <div class="header-actions" style="margin-left: auto;">
        <el-button v-if="normalizedActiveTab === 'sale-orders'" type="warning" :icon="Download" @click="openDisSyncDialog">Đồng bộ từ DIS (Odoo)</el-button>
        <el-button v-if="normalizedActiveTab === 'sale-orders'" type="primary" :icon="Plus" @click="openCreateSoDialog">Tạo Sale Order Mới</el-button>
        <el-button v-if="normalizedActiveTab === 'sale-orders'" type="success" :icon="Upload" @click="openImportCsvDialog">Import CSV Thiết Bị</el-button>
        <el-button :icon="Refresh" @click="refreshActiveTabData">Làm mới dữ liệu</el-button>
      </div>
    </div>

    <div v-else class="page-header">
      <div class="header-title">
        <h2><el-icon><Files /></el-icon> Quản Lý Truy Xuất Nguồn Gốc (Traceability)</h2>
        <span class="subtitle">Quản lý Sale Order, Work Authorization, Thiết Bị Kiểm Thử &amp; Cấu Hình Cuối</span>
      </div>
      <div class="header-actions">
        <el-button type="warning" :icon="Download" @click="openDisSyncDialog">Đồng bộ từ DIS (Odoo)</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateSoDialog">Tạo Sale Order Mới</el-button>
        <el-button type="success" :icon="Upload" @click="openImportCsvDialog">Import CSV Thiết Bị</el-button>
        <el-button :icon="Refresh" @click="refreshAllData">Làm mới dữ liệu</el-button>
      </div>
    </div>

    <!-- Main Navigation Tabs: Ẩn thanh tab khi ở chế độ Isolated View -->
    <div v-if="isIsolatedView" class="isolated-content-panel">
      <!-- TAB 1: SALE ORDERS -->
      <div v-if="normalizedActiveTab === 'sale-orders'" class="tab-content">
        <div class="filter-bar">
          <div class="filter-left">
            <el-input
              v-model="soSearchNumber"
              placeholder="Tìm mã SO..."
              clearable
              style="width: 200px"
              :prefix-icon="Search"
              @clear="loadSoTreeData"
              @keyup.enter="loadSoTreeData"
            />
            <el-input
              v-model="soSearchCustomer"
              placeholder="Tìm tên khách hàng..."
              clearable
              style="width: 220px"
              :prefix-icon="Search"
              @clear="loadSoTreeData"
              @keyup.enter="loadSoTreeData"
            />
            <el-button type="primary" :icon="Search" @click="loadSoTreeData">Tìm kiếm</el-button>
            <el-button @click="resetSoFilters">Đặt lại</el-button>
          </div>
          <div class="filter-right">
            <el-button size="small" @click="expandAllSoTree">Mở rộng tất cả</el-button>
            <el-button size="small" @click="collapseAllSoTree">Thu gọn tất cả</el-button>
            <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Chuột phải vào dòng để mở Menu Thao tác (Tạo WA, Đổi trạng thái, Xóa...)</span>
          </div>
        </div>

        <div class="table-wrapper">
          <div ref="soTableRef" class="tabulator-custom-theme"></div>
          <div v-if="soTreeLoading" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải cây dữ liệu Sale Order...</span>
          </div>
        </div>
      </div>

      <!-- TAB 2: DEVICE TESTING LIST -->
      <div v-else-if="normalizedActiveTab === 'device-testing'" class="tab-content">
        <div class="filter-bar">
          <div class="filter-left">
            <el-input
              v-model="testingSearchSerial"
              placeholder="Tìm S/N hoặc DevEUI..."
              clearable
              style="width: 220px"
              :prefix-icon="Search"
              @clear="loadTestingDevices"
              @keyup.enter="loadTestingDevices"
            />
            <el-input
              v-model="testingSearchSo"
              placeholder="Lọc theo Mã SO..."
              clearable
              style="width: 180px"
              :prefix-icon="Search"
              @clear="loadTestingDevices"
              @keyup.enter="loadTestingDevices"
            />
            <el-select
              v-model="testingFilterResult"
              placeholder="Kết quả Test"
              clearable
              style="width: 150px"
              @change="loadTestingDevices"
            >
              <el-option label="Tất cả kết quả" value="" />
              <el-option label="PASS" value="PASS" />
              <el-option label="FAIL" value="FAIL" />
              <el-option label="NONE / PENDING" value="NONE" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="loadTestingDevices">Lọc danh sách</el-button>
            <el-button @click="resetTestingFilters">Đặt lại</el-button>
          </div>
          <div class="filter-right">
            <el-button :icon="Refresh" size="small" @click="loadTestingDevices">Làm mới</el-button>
            <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Nhấp đúp dòng để xem dữ liệu JSON kiểm thử</span>
          </div>
        </div>

        <div class="table-wrapper">
          <div ref="testingTableRef" class="tabulator-custom-theme"></div>
          <div v-if="testingLoading" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải danh sách thiết bị kiểm thử...</span>
          </div>
        </div>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="testingPage"
            v-model:page-size="testingLimit"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="testingTotal"
            @size-change="loadTestingDevices"
            @current-change="loadTestingDevices"
          />
        </div>
      </div>

      <!-- TAB 3: DEVICE FINAL CONFIG LIST -->
      <div v-else-if="normalizedActiveTab === 'device-final-config'" class="tab-content">
        <div class="filter-bar">
          <div class="filter-left">
            <el-input
              v-model="configSearchSerial"
              placeholder="Tìm S/N hoặc DevEUI..."
              clearable
              style="width: 220px"
              :prefix-icon="Search"
              @clear="loadFinalConfigDevices"
              @keyup.enter="loadFinalConfigDevices"
            />
            <el-select
              v-model="configFilterStatus"
              placeholder="Trạng thái Config"
              clearable
              style="width: 180px"
              @change="loadFinalConfigDevices"
            >
              <el-option label="Tất cả trạng thái" value="" />
              <el-option label="CONFIGURED_PASS" value="CONFIGURED_PASS" />
              <el-option label="CONFIG_FAILED" value="CONFIG_FAILED" />
              <el-option label="UNCONFIGURED / NONE" value="NONE" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="loadFinalConfigDevices">Lọc danh sách</el-button>
            <el-button @click="resetConfigFilters">Đặt lại</el-button>
          </div>
          <div class="filter-right">
            <el-button :icon="Refresh" size="small" @click="loadFinalConfigDevices">Làm mới</el-button>
            <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Chuột phải để xem Session / Đổi trạng thái Config / Xóa</span>
          </div>
        </div>

        <div class="table-wrapper">
          <div ref="configTableRef" class="tabulator-custom-theme"></div>
          <div v-if="configLoading" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải danh sách thiết bị cấu hình cuối...</span>
          </div>
        </div>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="configPage"
            v-model:page-size="configLimit"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="configTotal"
            @size-change="loadFinalConfigDevices"
            @current-change="loadFinalConfigDevices"
          />
        </div>
      </div>
    </div>

    <!-- Chế độ đầy đủ có el-tabs thông thường -->
    <el-tabs v-else v-model="activeTab" type="border-card" class="main-tabs" @tab-change="onTabChange">
      <!-- TAB 1: SALE ORDERS (CÂY DỮ LIỆU SO -> WA -> DEVICE) -->
      <el-tab-pane label="SALE ORDERS (Cây SO -> WA -> Device)" name="sale-orders">
        <div class="tab-content">
          <div class="filter-bar">
            <div class="filter-left">
              <el-input
                v-model="soSearchNumber"
                placeholder="Tìm mã SO..."
                clearable
                style="width: 200px"
                :prefix-icon="Search"
                @clear="loadSoTreeData"
                @keyup.enter="loadSoTreeData"
              />
              <el-input
                v-model="soSearchCustomer"
                placeholder="Tìm tên khách hàng..."
                clearable
                style="width: 220px"
                :prefix-icon="Search"
                @clear="loadSoTreeData"
                @keyup.enter="loadSoTreeData"
              />
              <el-button type="primary" :icon="Search" @click="loadSoTreeData">Tìm kiếm</el-button>
              <el-button @click="resetSoFilters">Đặt lại</el-button>
            </div>
            <div class="filter-right">
              <el-button size="small" @click="expandAllSoTree">Mở rộng tất cả</el-button>
              <el-button size="small" @click="collapseAllSoTree">Thu gọn tất cả</el-button>
              <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Chuột phải vào dòng để mở Menu Thao tác (Tạo WA, Đổi trạng thái, Xóa...)</span>
            </div>
          </div>

          <!-- Tabulator Tree Container -->
          <div class="table-wrapper">
            <div ref="soTableRef" class="tabulator-custom-theme"></div>
            <div v-if="soTreeLoading" class="loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải cây dữ liệu Sale Order...</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 2: DEVICE TESTING LIST -->
      <el-tab-pane label="DEVICE TESTING LIST (Danh Sách Kiểm Thử)" name="device-testing">
        <div class="tab-content">
          <div class="filter-bar">
            <div class="filter-left">
              <el-input
                v-model="testingSearchSerial"
                placeholder="Tìm S/N hoặc DevEUI..."
                clearable
                style="width: 220px"
                :prefix-icon="Search"
                @clear="loadTestingDevices"
                @keyup.enter="loadTestingDevices"
              />
              <el-input
                v-model="testingSearchSo"
                placeholder="Lọc theo Mã SO..."
                clearable
                style="width: 180px"
                :prefix-icon="Search"
                @clear="loadTestingDevices"
                @keyup.enter="loadTestingDevices"
              />
              <el-select
                v-model="testingFilterResult"
                placeholder="Kết quả Test"
                clearable
                style="width: 150px"
                @change="loadTestingDevices"
              >
                <el-option label="Tất cả kết quả" value="" />
                <el-option label="PASS" value="PASS" />
                <el-option label="FAIL" value="FAIL" />
                <el-option label="NONE / PENDING" value="NONE" />
              </el-select>
              <el-button type="primary" :icon="Search" @click="loadTestingDevices">Lọc danh sách</el-button>
              <el-button @click="resetTestingFilters">Đặt lại</el-button>
            </div>
            <div class="filter-right">
              <el-button type="success" :icon="Upload" size="small" @click="openImportCsvDialog">Import CSV</el-button>
              <el-button :icon="Refresh" size="small" @click="loadTestingDevices">Làm mới</el-button>
              <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Chuột phải để đổi trạng thái Test hoặc Xóa thiết bị</span>
            </div>
          </div>

          <!-- Tabulator Testing Container -->
          <div class="table-wrapper">
            <div ref="testingTableRef" class="tabulator-custom-theme"></div>
            <div v-if="testingLoading" class="loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải danh sách thiết bị kiểm thử...</span>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="testingPage"
              v-model:page-size="testingLimit"
              :page-sizes="[20, 50, 100, 200]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="testingTotal"
              @size-change="loadTestingDevices"
              @current-change="loadTestingDevices"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 3: DEVICE FINAL CONFIG LIST -->
      <el-tab-pane label="DEVICE FINAL CONFIG LIST (Cấu Hình Cuối)" name="device-final-config">
        <div class="tab-content">
          <div class="filter-bar">
            <div class="filter-left">
              <el-input
                v-model="configSearchSerial"
                placeholder="Tìm S/N hoặc DevEUI..."
                clearable
                style="width: 220px"
                :prefix-icon="Search"
                @clear="loadFinalConfigDevices"
                @keyup.enter="loadFinalConfigDevices"
              />
              <el-select
                v-model="configFilterStatus"
                placeholder="Trạng thái Config"
                clearable
                style="width: 180px"
                @change="loadFinalConfigDevices"
              >
                <el-option label="Tất cả trạng thái" value="" />
                <el-option label="CONFIGURED_PASS" value="CONFIGURED_PASS" />
                <el-option label="CONFIG_FAILED" value="CONFIG_FAILED" />
                <el-option label="UNCONFIGURED / NONE" value="NONE" />
              </el-select>
              <el-button type="primary" :icon="Search" @click="loadFinalConfigDevices">Lọc danh sách</el-button>
              <el-button @click="resetConfigFilters">Đặt lại</el-button>
            </div>
            <div class="filter-right">
              <el-button :icon="Refresh" size="small" @click="loadFinalConfigDevices">Làm mới</el-button>
              <span class="table-guide-hint"><el-icon><InfoFilled /></el-icon> Chuột phải để xem Session / Đổi trạng thái Config / Xóa</span>
            </div>
          </div>

          <!-- Tabulator Config Container -->
          <div class="table-wrapper">
            <div ref="configTableRef" class="tabulator-custom-theme"></div>
            <div v-if="configLoading" class="loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon> <span>Đang tải danh sách thiết bị cấu hình cuối...</span>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="configPage"
              v-model:page-size="configLimit"
              :page-sizes="[20, 50, 100, 200]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="configTotal"
              @size-change="loadFinalConfigDevices"
              @current-change="loadFinalConfigDevices"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Dialogs: Raw Test Data Viewer, Session Audit Viewer, SO/WA/CSV Dialogs -->
    <el-dialog v-model="rawTestDialogVisible" title="Chi Tiết Dữ Liệu Kiểm Thử Gốc" width="650px">
      <div v-if="selectedRawDevice">
        <p><strong>Thiết bị:</strong> {{ selectedRawDevice.serialNumber || selectedRawDevice.code }} | <strong>DevEUI:</strong> {{ selectedRawDevice.devEui || 'N/A' }}</p>
        <p><strong>Trạm kiểm thử:</strong> {{ selectedRawDevice.testStation || 'N/A' }} | <strong>Người kiểm thử:</strong> {{ selectedRawDevice.testPerson || 'N/A' }}</p>
        <div class="json-code-box">
          <pre>{{ JSON.stringify(selectedRawDevice.testRawData || selectedRawDevice, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="rawTestDialogVisible = false">Đóng</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sessionAuditDialogVisible" title="Chi Tiết Final Config Session &amp; Audit" width="700px">
      <div v-if="selectedSessionDevice">
        <p><strong>S/N:</strong> {{ selectedSessionDevice.serialNumber || selectedSessionDevice.code }} | <strong>Trạng thái Config:</strong> {{ selectedSessionDevice.configStatus }}</p>
        <p><strong>Session ID:</strong> {{ selectedSessionDevice.finalConfigSessionId || 'Chưa liên kết Session' }}</p>
        <div class="json-code-box">
          <pre>{{ JSON.stringify(selectedSessionDevice.sessionProfile || selectedSessionDevice.auditData || selectedSessionDevice, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="sessionAuditDialogVisible = false">Đóng</el-button>
      </template>
    </el-dialog>

<!-- DIALOG: TẠO MỚI SALE ORDER -->
    <el-dialog v-model="createSoVisible" title="Tạo Mới Đơn Hàng (Sale Order)" width="500px">
      <el-form :model="newSoForm" label-width="140px" label-position="left">
        <el-form-item label="Mã Sale Order" required>
          <el-input v-model="newSoForm.soNumber" placeholder="Ví dụ: SO-2026-001 hoặc SO/26/001" />
        </el-form-item>
        <el-form-item label="Tên Khách Hàng">
          <el-input v-model="newSoForm.customerName" placeholder="Tên khách hàng / Đối tác" />
        </el-form-item>
        <el-form-item label="Ghi Chú">
          <el-input v-model="newSoForm.notes" type="textarea" :rows="3" placeholder="Ghi chú đơn hàng..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createSoVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submittingSo" @click="submitCreateSo">Tạo Mới</el-button>
      </template>
    </el-dialog>

    <!-- DIALOG: TẠO MỚI WORK AUTHORIZATION (WA) -->
    <el-dialog v-model="createWaVisible" title="Tạo Work Authorization (WA) Thuộc SO" width="550px">
      <el-form :model="newWaForm" label-width="170px" label-position="left">
        <el-form-item label="Sale Order">
          <span class="font-bold text-primary">{{ newWaForm.soNumber }}</span>
        </el-form-item>
        <el-form-item label="Mã WA (WA/xxxx/xxxxx)" required>
          <el-input
            v-model="newWaForm.waNumber"
            placeholder="Ví dụ: WA/2026/00001"
            @blur="formatWaNumberInput"
          />
          <span class="text-xs text-muted">Cú pháp bắt buộc theo chuẩn: WA/xxxx/xxxxx</span>
        </el-form-item>
        <el-form-item label="Item Code / Mã SP">
          <el-input v-model="newWaForm.itemCode" placeholder="Ví dụ: WSLRW-C-RS485-01" />
        </el-form-item>
        <el-form-item label="Số Lượng Kế Hoạch">
          <el-input-number v-model="newWaForm.plannedQuantity" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="Ghi Chú">
          <el-input v-model="newWaForm.notes" type="textarea" :rows="2" placeholder="Ghi chú lệnh..." />
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

    <!-- DIALOG: CHI TIẾT & CHỈNH SỬA THÔNG TIN THIẾT BỊ / TEST -->
    <el-dialog v-model="editDeviceDialogVisible" title="Chi Tiết & Chỉnh Sửa Thông Tin Thiết Bị" width="680px">
      <el-form v-if="editingDeviceForm" :model="editingDeviceForm" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số Serial (S/N):">
              <el-input :model-value="editingDeviceForm.serialNumber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="DevEUI:">
              <el-input v-model="editingDeviceForm.devEui" placeholder="Nhập DevEUI (16 hex)" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Sản Phẩm (Item):">
              <el-input v-model="editingDeviceForm.itemCode" placeholder="Mã item..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SKU:">
              <el-input v-model="editingDeviceForm.sku" placeholder="SKU sản phẩm..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Kết Quả Test:">
              <el-select v-model="editingDeviceForm.testResult" style="width: 100%">
                <el-option label="PASS" value="PASS" />
                <el-option label="FAIL" value="FAIL" />
                <el-option label="NONE / PENDING" value="PENDING" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng Thái Config:">
              <el-select v-model="editingDeviceForm.configStatus" style="width: 100%">
                <el-option label="CONFIGURED_PASS (Đã nạp)" value="CONFIGURED_PASS" />
                <el-option label="CONFIG_FAILED (Lỗi cấu hình)" value="CONFIG_FAILED" />
                <el-option label="PENDING / UNCONFIGURED" value="PENDING" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Trạm Kiểm Thử:">
              <el-input v-model="editingDeviceForm.testStation" placeholder="Ví dụ: STATION_01" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Người Kiểm Thử:">
              <el-input v-model="editingDeviceForm.testPerson" placeholder="Tên hoặc mã nhân viên..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="HW Version:">
              <el-input v-model="editingDeviceForm.hwVersion" placeholder="Phiên bản phần cứng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="FW Version:">
              <el-input v-model="editingDeviceForm.fwVersion" placeholder="Phiên bản firmware..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Dữ Liệu Raw Test (JSON):">
          <el-input
            v-model="editingDeviceForm.rawJsonText"
            type="textarea"
            :rows="5"
            placeholder="{ ... }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDeviceDialogVisible = false">Hủy Bỏ</el-button>
        <el-button type="primary" :loading="savingDeviceDetails" @click="submitEditDeviceDetails">
          Lưu Thay Đổi
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

    <!-- DIALOG: TÌM KIẾM & ĐỒNG BỘ SALES ORDER TỪ DIS (ODOO) -->
    <el-dialog
      v-model="disSyncDialogVisible"
      title="Đồng Bộ Sales Order từ Hệ Thống DIS (Odoo)"
      width="900px"
      top="5vh"
      destroy-on-close
    >
      <div class="dis-sync-container">
        <!-- Status & Mode Notice -->
        <div class="dis-status-header mb-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="mr-2">Trạng thái kết nối DIS API:</span>
              <el-tag v-if="disStatus.connected && !disStatus.isMock" type="success" effect="dark">
                Live Connection (HTTPS)
              </el-tag>
              <el-tag v-else-if="disStatus.isMock" type="warning" effect="dark">
                Mock Mode (Mô phỏng offline)
              </el-tag>
              <el-tag v-else type="info">Chưa kết nối / Đang kiểm tra...</el-tag>
            </div>
            <div class="text-muted text-sm">
              <span v-if="disStatus.isMock">
                (Thiếu DIS_SO_TOKEN, đang dùng dữ liệu chuẩn OpenAPI v1.1.0)
              </span>
              <span v-else>
                Base URL: {{ disStatus.baseUrl || 'https://dis-so.daviteq.com' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="dis-search-bar mb-3">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input-number
                v-model="disFilterYear"
                :min="2020"
                :max="2035"
                placeholder="Năm (tất cả)"
                clearable
                style="width: 100%"
              />
            </el-col>
            <el-col :span="4">
              <el-select v-model="disFilterMonth" placeholder="Tháng" clearable style="width: 100%">
                <el-option v-for="m in 12" :key="m" :label="`Tháng ${m}`" :value="m" />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select v-model="disFilterState" placeholder="Trạng thái" style="width: 100%">
                <el-option label="Tất cả trạng thái" value="" />
                <el-option label="Sale Order (Đã duyệt)" value="sale" />
                <el-option label="Hoàn tất (Done)" value="done" />
                <el-option label="Báo giá (Draft)" value="draft" />
                <el-option label="Đã hủy (Cancel)" value="cancel" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input
                v-model="disFilterQuery"
                placeholder="Tìm mã SO (VD: SO26...), khách hàng..."
                clearable
                :prefix-icon="Search"
                @keyup.enter="searchDisOrders"
              />
            </el-col>
            <el-col :span="3">
              <el-button type="primary" :icon="Search" :loading="loadingDisList" style="width: 100%" @click="searchDisOrders">
                Tìm
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- Orders Table List -->
        <el-table
          v-loading="loadingDisList"
          :data="disOrdersList"
          height="240px"
          border
          highlight-current-row
          style="width: 100%"
          @current-change="handleDisOrderSelect"
        >
          <el-table-column prop="odoo_id" label="ID Odoo" width="90" align="center" />
          <el-table-column prop="name" label="Mã Đơn Hàng (SO)" width="160" font-weight="bold">
            <template #default="{ row }">
              <span style="color: #00f0ff; font-weight: bold">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="partner_name" label="Khách Hàng" min-width="180" show-overflow-tooltip />
          <el-table-column prop="date_order" label="Ngày Đặt Hàng" width="160" align="center" />
          <el-table-column prop="state" label="Trạng Thái" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="getDisStateTag(row.state)" size="small">
                {{ row.state }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- Selected SO Details & Line Items -->
        <div v-if="selectedDisOrder" class="dis-detail-section mt-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div style="font-weight: 600; color: #00f0ff">
              Chi Tiết Đơn Hàng: {{ selectedDisOrder.name }} - {{ selectedDisOrder.partner_name }}
            </div>
            <div>
              <el-button
                type="success"
                :icon="Check"
                :loading="syncingDisOrder"
                @click="syncSelectedDisOrderToDatabase"
              >
                Đồng Bộ Vào Traceability Database
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loadingDisDetail"
            :data="selectedDisOrderLines"
            height="180px"
            border
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="line_type" label="Loại Dòng" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.line_type === 'product'" type="success" size="small">Product</el-tag>
                <el-tag v-else-if="row.line_type === 'section'" type="info" size="small">Section</el-tag>
                <el-tag v-else type="warning" size="small">{{ row.line_type || 'Note' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sku" label="SKU Sản Phẩm" width="180" show-overflow-tooltip />
            <el-table-column prop="product_name" label="Tên Sản Phẩm / Diễn Giải" min-width="220" show-overflow-tooltip />
            <el-table-column prop="product_uom_qty" label="SL Yêu Cầu" width="110" align="right" />
            <el-table-column prop="qty_delivered" label="Đã Giao" width="90" align="right" />
            <el-table-column prop="price_unit" label="Đơn Giá" width="110" align="right" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="disSyncDialogVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Files,
  List,
  Plus,
  Refresh,
  FolderOpened,
  Upload,
  Download,
  Checked,
  Check,
  Search,
  UploadFilled,
  View,
  InfoFilled,
  Loading,
  ArrowLeft,
} from '@element-plus/icons-vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const route = useRoute();
const router = useRouter();

// Isolated view check: khi url có ?tab=... hoặc ?from=menu hoặc ?isolated=true
const isIsolatedView = computed(() => {
  return !!route.query.tab || route.query.from === 'menu' || route.query.isolated === 'true';
});

const normalizedActiveTab = computed(() => {
  const tab = (route?.query?.tab as string) || activeTab.value;
  if (tab === 'devices' || tab === 'testing-devices' || tab === 'device-testing') return 'device-testing';
  if (tab === 'config' || tab === 'config-devices' || tab === 'device-final-config') return 'device-final-config';
  return 'sale-orders';
});

const isolatedTitle = computed(() => {
  if (normalizedActiveTab.value === 'device-testing') return 'Tra Cứu Thiết Bị Kiểm Thử (Testing Devices)';
  if (normalizedActiveTab.value === 'device-final-config') return 'Tra Cứu Cấu Hình Cuối (Final Config Devices)';
  return 'Quản Lý Sale Order & Cây Dữ Liệu (Traceability)';
});

function goBackToMenu() {
  router.push('/menu');
}

// Active Tab
const activeTab = ref(
  (route?.query?.tab === 'devices' || route?.query?.tab === 'testing-devices' || route?.query?.tab === 'device-testing') ? 'device-testing' :
  (route?.query?.tab === 'config' || route?.query?.tab === 'config-devices' || route?.query?.tab === 'device-final-config') ? 'device-final-config' :
  'sale-orders'
);

watch(() => route?.query?.tab, (newTab) => {
  if (newTab) {
    if (newTab === 'devices' || newTab === 'testing-devices' || newTab === 'device-testing') {
      activeTab.value = 'device-testing';
    } else if (newTab === 'config' || newTab === 'config-devices' || newTab === 'device-final-config') {
      activeTab.value = 'device-final-config';
    } else if (newTab === 'so' || newTab === 'sale-orders') {
      activeTab.value = 'sale-orders';
    } else {
      activeTab.value = newTab as string;
    }
    onTabChange(activeTab.value);
  }
});

// Tabulator Instances & Container Refs
const soTableRef = ref<HTMLElement | null>(null);
const testingTableRef = ref<HTMLElement | null>(null);
const configTableRef = ref<HTMLElement | null>(null);

let soTabulator: Tabulator | null = null;
let testingTabulator: Tabulator | null = null;
let configTabulator: Tabulator | null = null;

// Loading States
const soTreeLoading = ref(false);
const testingLoading = ref(false);
const configLoading = ref(false);

// Filter & Search States
const soSearchNumber = ref('');
const soSearchCustomer = ref('');

const testingSearchSerial = ref('');
const testingSearchSo = ref('');
const testingFilterResult = ref('');
const testingPage = ref(1);
const testingLimit = ref(50);
const testingTotal = ref(0);

const configSearchSerial = ref('');
const configFilterStatus = ref('');
const configPage = ref(1);
const configLimit = ref(50);
const configTotal = ref(0);

// DIS (Odoo) Integration Dialog States
const disSyncDialogVisible = ref(false);
const loadingDisList = ref(false);
const loadingDisDetail = ref(false);
const syncingDisOrder = ref(false);
const disStatus = reactive<{
  connected: boolean;
  isMock: boolean;
  baseUrl: string;
}>({
  connected: false,
  isMock: false,
  baseUrl: '',
});
const disFilterYear = ref<number | undefined>(undefined);
const disFilterMonth = ref<number | undefined>(undefined);
const disFilterState = ref('sale');
const disFilterQuery = ref('');
const disOrdersList = ref<any[]>([]);
const selectedDisOrder = ref<any | null>(null);
const selectedDisOrderLines = ref<any[]>([]);

// Dialog Data States
const editDeviceDialogVisible = ref(false);
const savingDeviceDetails = ref(false);
const editingDeviceForm = reactive<{
  id: string;
  serialNumber: string;
  devEui: string;
  itemCode: string;
  sku: string;
  hwVersion: string;
  fwVersion: string;
  testResult: string;
  configStatus: string;
  testStation: string;
  testPerson: string;
  rawJsonText: string;
}>({
  id: '',
  serialNumber: '',
  devEui: '',
  itemCode: '',
  sku: '',
  hwVersion: '',
  fwVersion: '',
  testResult: 'PENDING',
  configStatus: 'PENDING',
  testStation: '',
  testPerson: '',
  rawJsonText: '',
});

const openEditDeviceDialog = (device: any) => {
  if (!device) return;
  editingDeviceForm.id = device.id || '';
  editingDeviceForm.serialNumber = device.serialNumber || device.serial_number || device.code || '';
  editingDeviceForm.devEui = device.devEui || device.dev_eui || '';
  editingDeviceForm.itemCode = device.itemCode || device.item_code || '';
  editingDeviceForm.sku = device.sku || '';
  editingDeviceForm.hwVersion = device.hwVersion || device.hw_version || '';
  editingDeviceForm.fwVersion = device.fwVersion || device.fw_version || '';
  editingDeviceForm.testResult = (device.testResult || device.test_result || 'PENDING').toUpperCase();
  editingDeviceForm.configStatus = (device.configStatus || device.config_status || 'PENDING').toUpperCase();
  editingDeviceForm.testStation = device.testStation || device.test_station || '';
  editingDeviceForm.testPerson = device.testPerson || device.test_person || '';
  
  const rawData = device.testRawData || device.test_raw_data || null;
  editingDeviceForm.rawJsonText = rawData ? JSON.stringify(rawData, null, 2) : '';
  
  editDeviceDialogVisible.value = true;
};

const submitEditDeviceDetails = async () => {
  if (!editingDeviceForm.id && !editingDeviceForm.serialNumber) {
    ElMessage.warning('Không tìm thấy thông tin định danh thiết bị');
    return;
  }

  let parsedRaw: any = undefined;
  if (editingDeviceForm.rawJsonText.trim()) {
    try {
      parsedRaw = JSON.parse(editingDeviceForm.rawJsonText.trim());
    } catch (e: any) {
      ElMessage.error(`Định dạng JSON Dữ liệu Raw Test không hợp lệ: ${e.message}`);
      return;
    }
  }

  savingDeviceDetails.value = true;
  try {
    const targetKey = editingDeviceForm.id || editingDeviceForm.serialNumber;
    const url = `/api/plugins/device-traceability/devices/${encodeURIComponent(targetKey)}`;
    
    const payload: any = {
      testResult: editingDeviceForm.testResult,
      configStatus: editingDeviceForm.configStatus,
      devEui: editingDeviceForm.devEui,
      itemCode: editingDeviceForm.itemCode,
      sku: editingDeviceForm.sku,
      hwVersion: editingDeviceForm.hwVersion,
      fwVersion: editingDeviceForm.fwVersion,
      testStation: editingDeviceForm.testStation,
      testPerson: editingDeviceForm.testPerson,
    };
    if (parsedRaw !== undefined) {
      payload.testRawData = parsedRaw;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success(`Cập nhật thông tin thiết bị ${editingDeviceForm.serialNumber} thành công!`);
    editDeviceDialogVisible.value = false;
    refreshActiveTabData();
  } catch (err: any) {
    ElMessage.error(`Lỗi cập nhật chi tiết thiết bị: ${err.message}`);
  } finally {
    savingDeviceDetails.value = false;
  }
};

const rawTestDialogVisible = ref(false);
const selectedRawDevice = ref<any>(null);

const sessionAuditDialogVisible = ref(false);
const selectedSessionDevice = ref<any>(null);

// Dialog States from original view
const createSoVisible = ref(false);
const submittingSo = ref(false);
const newSoForm = reactive({
  soNumber: '',
  customerName: '',
  customerCode: '',
  notes: '',
});

const createWaVisible = ref(false);
const submittingWa = ref(false);
const targetSoForWa = ref<any>(null);
const newWaForm = reactive({
  soNumber: '',
  waNumber: '',
  itemCode: '',
  plannedQuantity: 100,
  notes: '',
});

const soDetailVisible = ref(false);
const selectedSo = ref<any>(null);
const loadingSoDetail = ref(false);

const importCsvVisible = ref(false);
const submittingImport = ref(false);
const importAssignMode = ref('NONE');
const selectedImportSoId = ref('');
const selectedImportWaId = ref('');
const parsedCsvDevices = ref<any[]>([]);
const soOptions = ref<any[]>([]);
const csvFileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const parsedAutoSo = ref('');
const saleOrdersList = ref<any[]>([]);
const allAvailableWas = ref<any[]>([]);
const viewingRawData = ref<any>(null);

const formatWaNumberInput = () => {
  if (!newWaForm.waNumber) return;
  newWaForm.waNumber = newWaForm.waNumber.trim();
};

const handleImportWaChanged = (waId: string) => {
  const found = allAvailableWas.value.find(w => w.id === waId || w.waNumber === waId);
  if (found && found.soNumber) {
    parsedAutoSo.value = found.soNumber;
  } else {
    parsedAutoSo.value = '';
  }
};

const triggerFileInput = () => {
  if (csvFileInputRef.value) {
    csvFileInputRef.value.click();
  }
};

const handleCsvFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = (e.target?.result as string) || '';
    processCsvText(text);
  };
  reader.readAsText(file);
};

// Auth Helpers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('itest_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ==========================================
// DIS (ODOO) INTEGRATION METHODS
// ==========================================

const getDisStateTag = (state: string): string => {
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

const checkDisStatus = async () => {
  try {
    let res = await fetch('/api/plugins/device-traceability/dis/status', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch('/api/plugins/dis-manager/status', {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      // Fallback route alias
      res = await fetch('/api/dis/status', {
        headers: getAuthHeaders(),
      });
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
    } else {
      disStatus.connected = false;
      disStatus.isMock = true;
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra DIS API status, fallback sang Mock:', err);
    disStatus.connected = true;
    disStatus.isMock = true;
    disStatus.baseUrl = 'https://dis-so.daviteq.com (Mock Fallback)';
  }
};

const openDisSyncDialog = async () => {
  disSyncDialogVisible.value = true;
  selectedDisOrder.value = null;
  selectedDisOrderLines.value = [];
  await checkDisStatus();
  await searchDisOrders();
};

const searchDisOrders = async () => {
  loadingDisList.value = true;
  selectedDisOrder.value = null;
  selectedDisOrderLines.value = [];
  try {
    const params = new URLSearchParams();
    if (disFilterYear.value) params.append('year', String(disFilterYear.value));
    if (disFilterMonth.value) params.append('month', String(disFilterMonth.value));
    if (disFilterState.value) params.append('state', disFilterState.value);
    if (disFilterQuery.value) params.append('q', disFilterQuery.value.trim());

    let res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/dis/so/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    }

    if (res.ok) {
      const result = await res.json();
      const list = Array.isArray(result)
        ? result
        : (result.items || result.data || (result.result && result.result.items) || []);
      disOrdersList.value = Array.isArray(list) ? list : [];
    } else {
      ElMessage.warning('Không tải được danh sách đơn hàng từ DIS API.');
      disOrdersList.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tìm kiếm DIS Sales Orders:', err);
    ElMessage.error('Lỗi kết nối khi gọi DIS API.');
    disOrdersList.value = [];
  } finally {
    loadingDisList.value = false;
  }
};

const handleDisOrderSelect = async (row: any) => {
  if (!row) {
    selectedDisOrder.value = null;
    selectedDisOrderLines.value = [];
    return;
  }
  selectedDisOrder.value = row;
  loadingDisDetail.value = true;
  try {
    const odooId = row.odoo_id || row.id;
    let res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const detail = data.data || data;
      const rawLines = detail.lines || detail.items || detail.order_line || [];
      selectedDisOrderLines.value = Array.isArray(rawLines) ? rawLines : [];
    } else {
      selectedDisOrderLines.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải chi tiết SO từ DIS:', err);
    selectedDisOrderLines.value = [];
  } finally {
    loadingDisDetail.value = false;
  }
};

const syncSelectedDisOrderToDatabase = async () => {
  if (!selectedDisOrder.value) return;
  const odooId = selectedDisOrder.value.odoo_id || selectedDisOrder.value.id;
  syncingDisOrder.value = true;
  try {
    let res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        autoCreateWa: true,
      }),
    });
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          autoCreateWa: true,
        }),
      });
    }

    if (res.ok) {
      const result = await res.json();
      ElMessage.success(result.message || `Đồng bộ thành công Sales Order ${selectedDisOrder.value.name}!`);
      disSyncDialogVisible.value = false;
      await loadSoTreeData();
    } else {
      const err = await res.json().catch(() => ({}));
      ElMessage.error(err.message || 'Không thể đồng bộ Sales Order từ DIS.');
    }
  } catch (err) {
    console.error('Lỗi khi đồng bộ đơn hàng DIS:', err);
    ElMessage.error('Lỗi mạng khi thực hiện đồng bộ.');
  } finally {
    syncingDisOrder.value = false;
  }
};

// ==========================================
// TAB 1: SALE ORDERS TREE
// ==========================================

const initSoTreeTable = () => {
  if (!soTableRef.value) return;
  if (soTabulator) {
    soTabulator.destroy();
    soTabulator = null;
  }

  soTabulator = new Tabulator(soTableRef.value, {
    data: [],
    dataTree: true,
    dataTreeStartExpanded: true,
    dataTreeChildField: '_children',
    layout: 'fitColumns',
    responsiveLayout: 'collapse',
    placeholder: 'Không có dữ liệu Sale Order',
    columns: [
      {
        title: 'Mã / Đối Tượng',
        field: 'code',
        widthGrow: 2.2,
        responsive: 0,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = rowData.type;
          let icon = '📁';
          let badgeClass = 'badge-so';
          let label = rowData.code || rowData.soNumber || '';

          if (type === 'WA') {
            icon = '📑';
            badgeClass = 'badge-wa';
            label = rowData.code || rowData.waNumber || '';
          } else if (type === 'DEVICE') {
            icon = '📟';
            badgeClass = 'badge-device';
            label = rowData.code || rowData.serialNumber || '';
          }

          return `<span class="tree-node ${badgeClass}">
            <span class="tree-icon">${icon}</span>
            <span class="tree-type-tag">${type}</span>
            <strong class="tree-label">${label}</strong>
          </span>`;
        },
      },
      {
        title: 'Tên Khách Hàng / SKU',
        field: 'customerName',
        widthGrow: 1.8,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.type === 'SO') {
            return rowData.customerName || '<span class="text-muted">-</span>';
          }
          if (rowData.type === 'DEVICE') {
            return `<span class="sku-cell">${rowData.sku || rowData.itemCode || '-'}</span>`;
          }
          return '<span class="text-muted">-</span>';
        },
      },
      {
        title: 'SL Kế Hoạch / DevEUI',
        field: 'plannedQuantity',
        widthGrow: 1.4,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.type === 'SO' || rowData.type === 'WA') {
            const count = rowData.plannedQuantity ?? rowData.deviceCount ?? 0;
            return `<span class="quantity-badge">${count} thiết bị</span>`;
          }
          if (rowData.type === 'DEVICE') {
            return `<span class="mono-font">${rowData.devEui || '-'}</span>`;
          }
          return '-';
        },
      },
      {
        title: 'Trạng Thái Test',
        field: 'testResult',
        widthGrow: 1.2,
        hozAlign: 'center',
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.type === 'SO') {
            return `<span class="count-badge pass">PASS: ${rowData.testPassCount ?? 0}</span>`;
          }
          if (rowData.type === 'WA') {
            return `<span class="count-badge pass">PASS: ${rowData.devicePassCount ?? 0}</span>`;
          }
          const res = (rowData.testResult || rowData.testStatus || 'NONE').toUpperCase();
          if (res === 'PASS') return '<span class="status-pill pass">PASS</span>';
          if (res === 'FAIL') return '<span class="status-pill fail">FAIL</span>';
          return '<span class="status-pill pending">NONE</span>';
        },
      },
      {
        title: 'Trạng Thái Config',
        field: 'configStatus',
        widthGrow: 1.4,
        hozAlign: 'center',
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.type === 'SO') {
            return `<span class="count-badge pass">PASS: ${rowData.configPassCount ?? 0}</span>`;
          }
          if (rowData.type === 'WA') {
            return `<span class="count-badge pass">PASS: ${rowData.deviceConfigPassCount ?? 0}</span>`;
          }
          const res = (rowData.configStatus || rowData.finalConfigStatus || 'NONE').toUpperCase();
          if (res === 'CONFIGURED_PASS' || res === 'PASS') return '<span class="status-pill pass">CONFIG PASS</span>';
          if (res === 'CONFIG_FAILED' || res === 'FAIL') return '<span class="status-pill fail">CONFIG FAIL</span>';
          return '<span class="status-pill pending">UNCONFIG</span>';
        },
      },
      {
        title: 'Thời Gian',
        field: 'createdAt',
        widthGrow: 1.3,
        hozAlign: 'center',
        formatter: (cell) => {
          const d = cell.getValue();
          if (!d) return '<span class="text-muted">-</span>';
          try {
            const dt = new Date(d);
            return dt.toLocaleDateString('vi-VN') + ' ' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          } catch {
            return String(d);
          }
        },
      },
    ],
    rowContextMenu: (e, row) => {
      const data = row.getData();
      const menu: any[] = [];

      if (data.type === 'SO') {
        menu.push({
          label: '➕ Thêm Work Authorization (WA)...',
          action: () => {
            openCreateWaDialog(data);
          },
        });
        menu.push({
          label: '📥 Import CSV Thiết Bị vào SO này...',
          action: () => {
            openImportCsvForSo(data.id);
          },
        });
        menu.push({
          label: '🔍 Xem chi tiết Sale Order...',
          action: () => {
            viewSoDetail(data.id);
          },
        });
      } else if (data.type === 'WA') {
        menu.push({
          label: '📥 Import CSV Thiết Bị vào WA này...',
          action: () => {
            openImportCsvForWa(data.soId, data.id);
          },
        });
      } else if (data.type === 'DEVICE') {
        menu.push({
          label: '✏️ Xem Chi Tiết & Chỉnh Sửa Thông Tin...',
          action: () => {
            openEditDeviceDialog(data);
          },
        });
        menu.push({ separator: true });
        menu.push({
          label: '🧪 Đặt Test Status: PASS',
          action: () => {
            handleUpdateDeviceStatus(data.id, { testResult: 'PASS', status: 'PASS', statusType: 'test_result' });
          },
        });
        menu.push({
          label: '❌ Đặt Test Status: FAIL',
          action: () => {
            handleUpdateDeviceStatus(data.id, { testResult: 'FAIL', status: 'FAIL', statusType: 'test_result' });
          },
        });
        menu.push({
          label: '⚪ Đặt Test Status: NONE',
          action: () => {
            handleUpdateDeviceStatus(data.id, { testResult: 'NONE', status: 'NONE', statusType: 'test_result' });
          },
        });
        menu.push({ separator: true });
        menu.push({
          label: '⚙️ Đặt Final Config: CONFIGURED_PASS',
          action: () => {
            handleUpdateDeviceStatus(data.id, { configStatus: 'CONFIGURED_PASS', status: 'CONFIGURED_PASS', statusType: 'config_status' });
          },
        });
        menu.push({
          label: '⚙️ Đặt Final Config: CONFIG_FAILED',
          action: () => {
            handleUpdateDeviceStatus(data.id, { configStatus: 'CONFIG_FAILED', status: 'CONFIG_FAILED', statusType: 'config_status' });
          },
        });
        menu.push({
          label: '⚙️ Đặt Final Config: UNCONFIGURED (NONE)',
          action: () => {
            handleUpdateDeviceStatus(data.id, { configStatus: 'UNCONFIGURED', status: 'UNCONFIGURED', statusType: 'config_status' });
          },
        });
        menu.push({ separator: true });
        menu.push({
          label: '🗑️ Xóa thiết bị này',
          action: () => {
            handleDeleteDevice(data.id, data.serialNumber || data.code);
          },
        });
      }

      return menu;
    },
  });
};

const loadSoTreeData = async () => {
  soTreeLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (soSearchNumber.value.trim()) params.append('soNumber', soSearchNumber.value.trim());
    if (soSearchCustomer.value.trim()) params.append('customerName', soSearchCustomer.value.trim());

    const url = `/api/plugins/device-traceability/so/tree?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const treeData = Array.isArray(data) ? data : (data.data || []);

    if (soTabulator) {
      await soTabulator.setData(treeData);
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi tải cây dữ liệu Sale Order: ${err.message}`);
  } finally {
    soTreeLoading.value = false;
  }
};

const resetSoFilters = () => {
  soSearchNumber.value = '';
  soSearchCustomer.value = '';
  loadSoTreeData();
};

const expandAllSoTree = () => {
  if (!soTabulator) return;
  const rows = soTabulator.getRows();
  rows.forEach((r) => {
    if (r.treeExpand) r.treeExpand();
  });
};

const collapseAllSoTree = () => {
  if (!soTabulator) return;
  const rows = soTabulator.getRows();
  rows.forEach((r) => {
    if (r.treeCollapse) r.treeCollapse();
  });
};

// ==========================================
// TAB 2: DEVICE TESTING LIST
// ==========================================

const initTestingTable = () => {
  if (!testingTableRef.value) return;
  if (testingTabulator) {
    testingTabulator.destroy();
    testingTabulator = null;
  }

  testingTabulator = new Tabulator(testingTableRef.value, {
    data: [],
    layout: 'fitColumns',
    responsiveLayout: 'collapse',
    placeholder: 'Không có dữ liệu thiết bị kiểm thử',
    columns: [
      {
        title: 'Serial Number (S/N)',
        field: 'serialNumber',
        widthGrow: 1.8,
        responsive: 0,
        formatter: (cell) => `<strong class="mono-font serial-text">${cell.getValue() || '-'}</strong>`,
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 1.8,
        formatter: (cell) => `<span class="mono-font">${cell.getValue() || '-'}</span>`,
      },
      {
        title: 'Mã SO',
        field: 'soNumber',
        widthGrow: 1.2,
        formatter: (cell) => {
          const row = cell.getRow().getData();
          const num = row.soNumber || (row.so ? row.so.so_number : '-');
          return `<span class="badge-so-sm">${num}</span>`;
        },
      },
      {
        title: 'Mã WA',
        field: 'waNumber',
        widthGrow: 1.2,
        formatter: (cell) => {
          const row = cell.getRow().getData();
          const num = row.waNumber || (row.wa ? row.wa.wa_number : '-');
          return num && num !== '-' ? `<span class="badge-wa-sm">${num}</span>` : '<span class="text-muted">-</span>';
        },
      },
      {
        title: 'SKU / Item Code',
        field: 'sku',
        widthGrow: 1.4,
        formatter: (cell) => cell.getValue() || cell.getRow().getData().itemCode || '<span class="text-muted">-</span>',
      },
      {
        title: 'HW / FW',
        field: 'hwVersion',
        widthGrow: 1.2,
        formatter: (cell) => {
          const row = cell.getRow().getData();
          return `${row.hwVersion || '-'}/${row.fwVersion || '-'}`;
        },
      },
      {
        title: 'Kết Quả Test',
        field: 'testResult',
        widthGrow: 1.2,
        hozAlign: 'center',
        formatter: (cell) => {
          const val = (cell.getValue() || 'NONE').toUpperCase();
          if (val === 'PASS') return '<span class="status-pill pass">PASS</span>';
          if (val === 'FAIL') return '<span class="status-pill fail">FAIL</span>';
          return '<span class="status-pill pending">NONE</span>';
        },
      },
      {
        title: 'Trạm Test / KTV',
        field: 'testStation',
        widthGrow: 1.4,
        formatter: (cell) => {
          const row = cell.getRow().getData();
          return `${row.testStation || '-'} (${row.testPerson || '-'})`;
        },
      },
      {
        title: 'Thời Gian Test',
        field: 'testedAt',
        widthGrow: 1.4,
        hozAlign: 'center',
        formatter: (cell) => {
          const d = cell.getValue() || cell.getRow().getData().createdAt;
          if (!d) return '<span class="text-muted">-</span>';
          try {
            const dt = new Date(d);
            return dt.toLocaleDateString('vi-VN') + ' ' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          } catch {
            return String(d);
          }
        },
      },
    ],
    rowContextMenu: (e, row) => {
      const data = row.getData();
      return [
        {
          label: '✏️ Xem Chi Tiết & Chỉnh Sửa Thông Tin...',
          action: () => openEditDeviceDialog(data),
        },
        { separator: true },
        {
          label: '🧪 Đặt Test Status: PASS',
          action: () => handleUpdateDeviceStatus(data.id, { testResult: 'PASS', status: 'PASS', statusType: 'test_result' }),
        },
        {
          label: '❌ Đặt Test Status: FAIL',
          action: () => handleUpdateDeviceStatus(data.id, { testResult: 'FAIL', status: 'FAIL', statusType: 'test_result' }),
        },
        {
          label: '⚪ Đặt Test Status: NONE',
          action: () => handleUpdateDeviceStatus(data.id, { testResult: 'NONE', status: 'NONE', statusType: 'test_result' }),
        },
        { separator: true },
        {
          label: '📋 Xem Dữ Liệu Raw Test...',
          action: () => {
            selectedRawDevice.value = data;
            rawTestDialogVisible.value = true;
          },
        },
        { separator: true },
        {
          label: '🗑️ Xóa Thiết Bị Này',
          action: () => handleDeleteDevice(data.id, data.serialNumber),
        },
      ];
    },
  });
};

const loadTestingDevices = async () => {
  testingLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(testingPage.value),
      limit: String(testingLimit.value),
    });

    if (testingSearchSerial.value.trim()) params.append('serialNumber', testingSearchSerial.value.trim());
    if (testingSearchSo.value.trim()) params.append('soNumber', testingSearchSo.value.trim());
    if (testingFilterResult.value) params.append('testResult', testingFilterResult.value);

    const res = await fetch(`/api/plugins/device-traceability/devices?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    const items = Array.isArray(result) ? result : (result.data || result.items || []);
    testingTotal.value = result.total ?? result.count ?? items.length;

    if (testingTabulator) {
      await testingTabulator.setData(items);
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi tải danh sách kiểm thử: ${err.message}`);
  } finally {
    testingLoading.value = false;
  }
};

const resetTestingFilters = () => {
  testingSearchSerial.value = '';
  testingSearchSo.value = '';
  testingFilterResult.value = '';
  testingPage.value = 1;
  loadTestingDevices();
};

// ==========================================
// TAB 3: DEVICE FINAL CONFIG LIST
// ==========================================

const initConfigTable = () => {
  if (!configTableRef.value) return;
  if (configTabulator) {
    configTabulator.destroy();
    configTabulator = null;
  }

  configTabulator = new Tabulator(configTableRef.value, {
    data: [],
    layout: 'fitColumns',
    responsiveLayout: 'collapse',
    placeholder: 'Không có dữ liệu thiết bị cấu hình cuối',
    columns: [
      {
        title: 'Serial Number (S/N)',
        field: 'serialNumber',
        widthGrow: 1.8,
        responsive: 0,
        formatter: (cell) => `<strong class="mono-font serial-text">${cell.getValue() || '-'}</strong>`,
      },
      {
        title: 'DevEUI',
        field: 'devEui',
        widthGrow: 1.8,
        formatter: (cell) => `<span class="mono-font">${cell.getValue() || '-'}</span>`,
      },
      {
        title: 'SKU / Model',
        field: 'sku',
        widthGrow: 1.5,
        formatter: (cell) => cell.getValue() || cell.getRow().getData().itemCode || '<span class="text-muted">-</span>',
      },
      {
        title: 'Trạng Thái Cấu Hình',
        field: 'configStatus',
        widthGrow: 1.6,
        hozAlign: 'center',
        formatter: (cell) => {
          const val = (cell.getValue() || 'UNCONFIGURED').toUpperCase();
          if (val === 'CONFIGURED_PASS' || val === 'PASS') return '<span class="status-pill pass">CONFIG PASS</span>';
          if (val === 'CONFIG_FAILED' || val === 'FAIL') return '<span class="status-pill fail">CONFIG FAIL</span>';
          return '<span class="status-pill pending">UNCONFIG</span>';
        },
      },
      {
        title: 'Final Config Session ID',
        field: 'finalConfigSessionId',
        widthGrow: 2.0,
        formatter: (cell) => {
          const val = cell.getValue();
          return val ? `<span class="mono-font session-id-text">${val}</span>` : '<span class="text-muted">Chưa gắn session</span>';
        },
      },
      {
        title: 'Thời Gian Cập Nhật',
        field: 'updatedAt',
        widthGrow: 1.4,
        hozAlign: 'center',
        formatter: (cell) => {
          const d = cell.getValue() || cell.getRow().getData().createdAt;
          if (!d) return '<span class="text-muted">-</span>';
          try {
            const dt = new Date(d);
            return dt.toLocaleDateString('vi-VN') + ' ' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          } catch {
            return String(d);
          }
        },
      },
    ],
    rowContextMenu: (e, row) => {
      const data = row.getData();
      return [
        {
          label: '✏️ Xem Chi Tiết & Chỉnh Sửa Thông Tin...',
          action: () => openEditDeviceDialog(data),
        },
        { separator: true },
        {
          label: '⚙️ Đặt Config Status: CONFIGURED_PASS',
          action: () => handleUpdateDeviceStatus(data.id, { configStatus: 'CONFIGURED_PASS', status: 'CONFIGURED_PASS', statusType: 'config_status' }),
        },
        {
          label: '⚙️ Đặt Config Status: CONFIG_FAILED',
          action: () => handleUpdateDeviceStatus(data.id, { configStatus: 'CONFIG_FAILED', status: 'CONFIG_FAILED', statusType: 'config_status' }),
        },
        {
          label: '⚙️ Đặt Config Status: UNCONFIGURED (NONE)',
          action: () => handleUpdateDeviceStatus(data.id, { configStatus: 'UNCONFIGURED', status: 'UNCONFIGURED', statusType: 'config_status' }),
        },
        { separator: true },
        {
          label: '📊 Xem Chi Tiết Session & Audit...',
          action: () => {
            selectedSessionDevice.value = data;
            sessionAuditDialogVisible.value = true;
          },
        },
        { separator: true },
        {
          label: '🗑️ Xóa Thiết Bị Này',
          action: () => handleDeleteDevice(data.id, data.serialNumber),
        },
      ];
    },
  });
};

const loadFinalConfigDevices = async () => {
  configLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(configPage.value),
      limit: String(configLimit.value),
    });

    if (configSearchSerial.value.trim()) params.append('serialNumber', configSearchSerial.value.trim());
    if (configFilterStatus.value) params.append('configStatus', configFilterStatus.value);

    const res = await fetch(`/api/plugins/device-traceability/final-config-devices?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    const items = Array.isArray(result) ? result : (result.data || result.items || []);
    configTotal.value = result.total ?? result.count ?? items.length;

    if (configTabulator) {
      await configTabulator.setData(items);
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi tải danh sách cấu hình cuối: ${err.message}`);
  } finally {
    configLoading.value = false;
  }
};

const resetConfigFilters = () => {
  configSearchSerial.value = '';
  configFilterStatus.value = '';
  configPage.value = 1;
  loadFinalConfigDevices();
};

// ==========================================
// SHARED DEVICE MUTATION ACTIONS
// ==========================================

const handleUpdateDeviceStatus = async (
  deviceId: string,
  updates: { testResult?: string; configStatus?: string; status?: string; statusType?: string }
) => {
  try {
    const res = await fetch(`/api/plugins/device-traceability/devices/${deviceId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success('Cập nhật trạng thái thiết bị thành công!');
    refreshActiveTabData();
  } catch (err: any) {
    ElMessage.error(`Lỗi cập nhật trạng thái: ${err.message}`);
  }
};

const handleDeleteDevice = async (deviceId: string, identifier: string) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa thiết bị "${identifier}" không? Thao tác này không thể hoàn tác.`,
      'Xác nhận xóa thiết bị',
      {
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy bỏ',
        type: 'warning',
      }
    );

    const res = await fetch(`/api/plugins/device-traceability/devices/${deviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success(`Đã xóa thiết bị ${identifier} thành công.`);
    refreshActiveTabData();
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(`Lỗi khi xóa thiết bị: ${err.message}`);
    }
  }
};

// ==========================================
// TAB CHANGE & REFRESH LOGIC
// ==========================================

const onTabChange = (tabName: any) => {
  nextTick(() => {
    if (tabName === 'sale-orders') {
      if (!soTabulator) initSoTreeTable();
      loadSoTreeData();
    } else if (tabName === 'device-testing') {
      if (!testingTabulator) initTestingTable();
      loadTestingDevices();
    } else if (tabName === 'device-final-config') {
      if (!configTabulator) initConfigTable();
      loadFinalConfigDevices();
    }
  });
};

const refreshActiveTabData = () => {
  if (activeTab.value === 'sale-orders') {
    loadSoTreeData();
  } else if (activeTab.value === 'device-testing') {
    loadTestingDevices();
  } else if (activeTab.value === 'device-final-config') {
    loadFinalConfigDevices();
  }
};

const refreshAllData = () => {
  loadSoTreeData();
  if (testingTabulator) loadTestingDevices();
  if (configTabulator) loadFinalConfigDevices();
  ElMessage.info('Đang làm mới dữ liệu...');
};

// ==========================================
// SO / WA / CSV IMPORT LOGIC (FROM BACKUP)
// ==========================================

const openCreateSoDialog = () => {
  newSoForm.soNumber = '';
  newSoForm.customerName = '';
  newSoForm.customerCode = '';
  newSoForm.notes = '';
  createSoVisible.value = true;
};

const submitCreateSo = async () => {
  if (!newSoForm.soNumber.trim()) {
    ElMessage.warning('Vui lòng nhập Mã Sale Order');
    return;
  }
  submittingSo.value = true;
  try {
    const res = await fetch('/api/plugins/device-traceability/so', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newSoForm),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    ElMessage.success('Tạo Sale Order thành công');
    createSoVisible.value = false;
    loadSoTreeData();
  } catch (err: any) {
    ElMessage.error(`Lỗi khi tạo SO: ${err.message}`);
  } finally {
    submittingSo.value = false;
  }
};

const openCreateWaDialog = (so: any) => {
  targetSoForWa.value = so;
  newWaForm.soNumber = so?.soNumber || '';
  newWaForm.waNumber = '';
  newWaForm.itemCode = '';
  newWaForm.plannedQuantity = 100;
  newWaForm.notes = '';
  createWaVisible.value = true;
};

const submitCreateWa = async () => {
  if (!newWaForm.waNumber.trim()) {
    ElMessage.warning('Vui lòng nhập Mã Work Authorization (WA)');
    return;
  }
  if (!targetSoForWa.value?.id) {
    ElMessage.error('Không tìm thấy thông tin Sale Order đích');
    return;
  }

  submittingWa.value = true;
  try {
    const targetSoId = targetSoForWa.value.id;
    const payload = {
      waNumber: newWaForm.waNumber,
      plannedQuantity: newWaForm.plannedQuantity,
      notes: newWaForm.notes,
      soId: targetSoId,
    };

    const res = await fetch(`/api/plugins/device-traceability/so/${targetSoId}/wa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    ElMessage.success('Tạo Work Authorization thành công');
    createWaVisible.value = false;
    loadSoTreeData();
  } catch (err: any) {
    ElMessage.error(`Lỗi khi tạo WA: ${err.message}`);
  } finally {
    submittingWa.value = false;
  }
};

const viewSoDetail = async (soId: string) => {
  loadingSoDetail.value = true;
  soDetailVisible.value = true;
  selectedSo.value = null;

  try {
    const res = await fetch(`/api/plugins/device-traceability/so/${soId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    selectedSo.value = await res.json();
  } catch (err: any) {
    ElMessage.error(`Lỗi tải chi tiết SO: ${err.message}`);
    soDetailVisible.value = false;
  } finally {
    loadingSoDetail.value = false;
  }
};

const fetchSoOptions = async () => {
  try {
    const res = await fetch('/api/plugins/device-traceability/so?limit=100', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      soOptions.value = Array.isArray(data) ? data : (data.items || data.data || []);
    }
  } catch (e) {
    console.warn('Could not fetch SO options', e);
  }
};

const openImportCsvDialog = async () => {
  importAssignMode.value = 'NONE';
  selectedImportSoId.value = '';
  selectedImportWaId.value = '';
  parsedCsvDevices.value = [];
  await fetchSoOptions();
  importCsvVisible.value = true;
};

const openImportCsvForSo = async (soId: string) => {
  await openImportCsvDialog();
  importAssignMode.value = 'SO';
  selectedImportSoId.value = soId;
};

const openImportCsvForWa = async (soId: string, waId: string) => {
  await openImportCsvDialog();
  importAssignMode.value = 'WA';
  selectedImportSoId.value = soId;
  selectedImportWaId.value = waId;
};

const onImportModeChange = () => {
  selectedImportSoId.value = '';
  selectedImportWaId.value = '';
};

const onImportSoChange = () => {
  selectedImportWaId.value = '';
};

const getSelectedSoWas = () => {
  if (!selectedImportSoId.value) return [];
  const so = soOptions.value.find((s) => s.id === selectedImportSoId.value || s.soNumber === selectedImportSoId.value);
  return so?.workAuthorizations || [];
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
};

const handleCsvFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      processCsvText(text);
    }
  };
  reader.readAsText(file, 'UTF-8');
  return false;
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
    const target = selectedImportWaId.value;
    if (target && target.length >= 32) waId = target;
    else if (target) waNumber = target;
  } else if (importAssignMode.value === 'SO') {
    const target = selectedImportSoId.value;
    if (target && target.length >= 32) soId = target;
    else if (target) soNumber = target;
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
      `Đã import thành công: ${resData.importedCount ?? resData.totalImported ?? parsedCsvDevices.value.length} thiết bị (PASS: ${resData.passCount ?? 0}, FAIL: ${resData.failCount ?? 0})!`
    );

    importCsvVisible.value = false;
    refreshActiveTabData();
  } catch (err: any) {
    ElMessage.error(`Import thất bại: ${err.message}`);
  } finally {
    submittingImport.value = false;
  }
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    onTabChange(normalizedActiveTab.value);
  });
});

onBeforeUnmount(() => {
  if (soTabulator) {
    soTabulator.destroy();
    soTabulator = null;
  }
  if (testingTabulator) {
    testingTabulator.destroy();
    testingTabulator = null;
  }
  if (configTabulator) {
    configTabulator.destroy();
    configTabulator = null;
  }
});
</script>

<style scoped>
.traceability-container {
  padding: 20px;
  background-color: transparent;
  min-height: calc(100vh - 80px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.isolated-header-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.isolated-title {
  font-family: var(--cyber-font-display, 'Rajdhani', sans-serif);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: var(--cyber-cyan, #00f0ff);
}

.isolated-content-panel {
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(0, 240, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.header-title h2 {
  margin: 0;
  font-family: var(--cyber-font-display, 'Rajdhani', sans-serif);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title .subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  display: inline-block;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-tabs {
  background: rgba(13, 20, 36, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.tab-content {
  padding: 12px 0 0 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-guide-hint {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 4px 10px;
  border-radius: 4px;
}

.table-wrapper {
  position: relative;
  min-height: 380px;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(10, 15, 26, 0.4);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 15, 26, 0.85);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
  color: var(--cyber-cyan, #00f0ff);
  z-index: 10;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.mono-font {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.serial-text {
  color: #409eff;
}

.session-id-text {
  color: #67c23a;
  font-size: 12px;
}

.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tree-type-tag {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.badge-so .tree-type-tag {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.badge-wa .tree-type-tag {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.badge-device .tree-type-tag {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.badge-so-sm {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.badge-wa-sm {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.quantity-badge {
  background: #f4f4f5;
  color: #606266;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.count-badge.pass {
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e1f3d8;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.status-pill.pass {
  background: #67c23a;
  color: #ffffff;
}

.status-pill.fail {
  background: #f56c6c;
  color: #ffffff;
}

.status-pill.pending {
  background: #909399;
  color: #ffffff;
}

.sku-cell {
  color: #303133;
  font-weight: 500;
}

.text-muted {
  color: #c0c4cc;
}

.json-code-box {
  background: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 6px;
  max-height: 380px;
  overflow-y: auto;
  font-family: Consolas, monospace;
  font-size: 12px;
  margin-top: 10px;
}

/* DIS Integration Modal Styles */
.dis-sync-container {
  padding: 4px;
}

.dis-status-header {
  background: rgba(255, 255, 255, 0.04);
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dis-search-bar {
  background: rgba(255, 255, 255, 0.02);
  padding: 10px;
  border-radius: 6px;
}

.dis-detail-section {
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 6px;
  padding: 12px;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mt-3 {
  margin-top: 12px;
}

.mr-2 {
  margin-right: 8px;
}

.text-sm {
  font-size: 12px;
}

/* Custom Tabulator Table Styling */
:deep(.tabulator) {
  border: none;
  font-size: 13px;
  background-color: transparent;
}

:deep(.tabulator-header) {
  background-color: rgba(8, 12, 20, 0.85) !important;
  border-bottom: 2px solid rgba(0, 240, 255, 0.3) !important;
  font-weight: 600;
  color: var(--cyber-cyan, #00f0ff) !important;
}

:deep(.tabulator-row) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background-color: transparent !important;
  color: #cbd5e1 !important;
}

:deep(.tabulator-row:hover) {
  background-color: rgba(0, 240, 255, 0.08) !important;
  cursor: pointer;
}

:deep(.tabulator-row.tabulator-tree-level-1) {
  background-color: rgba(0, 240, 255, 0.02) !important;
}

:deep(.tabulator-row.tabulator-tree-level-2) {
  background-color: rgba(0, 240, 255, 0.04) !important;
}
</style>
