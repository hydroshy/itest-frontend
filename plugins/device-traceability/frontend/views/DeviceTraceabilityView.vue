<template>
  <div class="traceability-container w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Page Header (hiển thị khi không phân lập hoặc isolated view header) -->
    <div v-if="isIsolatedView" class="isolated-header-bar flex flex-wrap items-center justify-between gap-3 p-3 bg-base-200/60 rounded-xl mb-4 border border-base-300 shadow-sm backdrop-blur-md">
      <div class="flex items-center gap-3">
        <button class="btn btn-ghost btn-sm gap-2 text-primary font-medium" @click="goBackToMenu">
          <ArrowLeft class="w-4 h-4" /> Trở về Menu
        </button>
        <div class="divider divider-horizontal my-1 mx-0"></div>
        <span class="isolated-title font-semibold text-base text-base-content">{{ isolatedTitle }}</span>
      </div>
      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button v-if="isSoTreeTab" class="btn btn-warning btn-sm gap-1" @click="openDisSyncDialog">
          <Download class="w-4 h-4" /> Đồng bộ từ DIS (Odoo)
        </button>
        <button v-if="isSoTreeTab" class="btn btn-primary btn-sm gap-1" @click="openCreateSoDialog">
          <Plus class="w-4 h-4" /> Tạo Sale Order Mới
        </button>
        <button v-if="isSoTreeTab" class="btn btn-success btn-sm gap-1" @click="openImportCsvDialog">
          <Upload class="w-4 h-4" /> Import CSV Thiết Bị
        </button>
        <button class="btn btn-outline btn-sm gap-1" @click="refreshActiveTabData">
          <RefreshCw class="w-4 h-4" /> Làm mới dữ liệu
        </button>
      </div>
    </div>

    <header v-else class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div class="header-title">
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> TRACEABILITY MANAGEMENT
        </div>
        <h2 class="text-xl md:text-2xl font-bold flex items-center gap-2.5 tracking-tight text-white mt-0.5">
          <Files class="w-6 h-6 text-primary" />
          <span>Quản Lý Truy Xuất Nguồn Gốc (Traceability)</span>
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">
          Quản lý Sale Order, Work Authorization, Thiết Bị Kiểm Thử &amp; Cấu Hình Cuối
        </p>
      </div>
      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button class="btn btn-warning btn-sm gap-1" @click="openDisSyncDialog">
          <Download class="w-4 h-4" /> Đồng bộ từ DIS (Odoo)
        </button>
        <button class="btn btn-primary btn-sm gap-1" @click="openCreateSoDialog">
          <Plus class="w-4 h-4" /> Tạo Sale Order Mới
        </button>
        <button class="btn btn-success btn-sm gap-1" @click="openImportCsvDialog">
          <Upload class="w-4 h-4" /> Import CSV Thiết Bị
        </button>
        <button class="btn btn-outline btn-sm gap-1" @click="refreshAllData">
          <RefreshCw class="w-4 h-4" /> Làm mới dữ liệu
        </button>
      </div>
    </header>

    <!-- Main Navigation Tabs (Hidden in Isolated View) -->
    <div v-if="!isIsolatedView" role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
      <button
        role="tab"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'sale-orders' || activeTab === 'so-wa' }"
        @click="switchTab('sale-orders')"
      >
        <FolderOpen class="w-4 h-4" />
        SO &rarr; WA (Đơn Hàng &amp; Lệnh SX)
      </button>
      <button
        role="tab"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'so-item-device' }"
        @click="switchTab('so-item-device')"
      >
        <FolderTree class="w-4 h-4" />
        SO &rarr; ITEMCODE &rarr; TESTED DEVICE
      </button>
      <button
        role="tab"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'device-testing' }"
        @click="switchTab('device-testing')"
      >
        <List class="w-4 h-4" />
        DEVICE TESTING LIST (Danh Sách Kiểm Thử)
      </button>
      <button
        role="tab"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'device-final-config' }"
        @click="switchTab('device-final-config')"
      >
        <CheckCircle2 class="w-4 h-4" />
        DEVICE FINAL CONFIG LIST (Cấu Hình Cuối)
      </button>
    </div>

    <!-- Unified Tab Content Panels (v-show preserves Tabulator DOM elements) -->
    <div class="tab-panels space-y-4">
      <!-- TAB 1 & 2: SALE ORDERS & HIERARCHY TREE -->
      <div v-show="isSoTreeTab" class="trace-tab-pane">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-4">
          <div class="filter-bar flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-content/10">
            <div class="filter-left flex flex-wrap items-center gap-2">
              <div class="relative">
                <input
                  v-model="soSearchNumber"
                  type="text"
                  placeholder="Tìm mã SO..."
                  class="h-8 w-48 pl-3 pr-8 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95 text-xs font-mono text-slate-200 placeholder:text-slate-400/50 placeholder:italic placeholder:font-light rounded-lg border border-slate-700/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 shadow-inner transition-all outline-none"
                  @keyup.enter="loadSoTreeData"
                />
                <button
                  v-if="soSearchNumber"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  @click="soSearchNumber = ''; loadSoTreeData()"
                >✕</button>
              </div>
              <div class="relative">
                <input
                  v-model="soSearchCustomer"
                  type="text"
                  placeholder="Tìm tên khách hàng..."
                  class="h-8 w-52 pl-3 pr-8 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95 text-xs text-slate-200 placeholder:text-slate-400/50 placeholder:italic placeholder:font-light rounded-lg border border-slate-700/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 shadow-inner transition-all outline-none"
                  @keyup.enter="loadSoTreeData"
                />
                <button
                  v-if="soSearchCustomer"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  @click="soSearchCustomer = ''; loadSoTreeData()"
                >✕</button>
              </div>
              <button class="btn btn-primary btn-sm gap-1" @click="loadSoTreeData">
                <Search class="w-4 h-4" /> Tìm kiếm
              </button>
              <button class="btn btn-ghost btn-sm text-xs" @click="resetSoFilters">Đặt lại</button>
            </div>
            <div class="filter-right flex flex-wrap items-center gap-2">
              <button class="btn btn-outline btn-sm" @click="expandAllSoTree">Mở rộng tất cả</button>
              <button class="btn btn-outline btn-sm" @click="collapseAllSoTree">Thu gọn tất cả</button>
              <span class="table-guide-hint text-xs text-base-content/60 flex items-center gap-1">
                <Info class="w-4 h-4 text-info" /> Nhấp đúp hoặc chuột phải vào dòng SO để xem chi tiết &amp; danh sách WA
              </span>
            </div>
          </div>

          <div class="table-wrapper relative min-h-[400px]">
            <div ref="soTableRef" class="tabulator-custom-theme"></div>
            <div v-if="soTreeLoading" class="loading-overlay absolute inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center gap-2 z-10">
              <Loader2 class="w-5 h-5 animate-spin text-primary" />
              <span class="text-sm font-medium">Đang tải cây dữ liệu Sale Order...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: DEVICE TESTING LIST -->
      <div v-show="currentDisplayTab === 'device-testing'" class="trace-tab-pane">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-4">
          <div class="filter-bar flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-content/10">
            <div class="filter-left flex flex-wrap items-center gap-2">
              <div class="relative">
                <input
                  v-model="testingSearchSerial"
                  type="text"
                  placeholder="Tìm S/N hoặc DevEUI..."
                  class="h-8 w-48 pl-3 pr-8 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95 text-xs font-mono text-slate-200 placeholder:text-slate-400/50 placeholder:italic placeholder:font-light rounded-lg border border-slate-700/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 shadow-inner transition-all outline-none"
                  @keyup.enter="loadTestingDevices"
                />
                <button
                  v-if="testingSearchSerial"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  @click="testingSearchSerial = ''; loadTestingDevices()"
                >✕</button>
              </div>
              <div class="relative">
                <input
                  v-model="testingSearchSo"
                  type="text"
                  placeholder="Lọc theo Mã SO..."
                  class="h-8 w-44 pl-3 pr-8 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95 text-xs font-mono text-slate-200 placeholder:text-slate-400/50 placeholder:italic placeholder:font-light rounded-lg border border-slate-700/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 shadow-inner transition-all outline-none"
                  @keyup.enter="loadTestingDevices"
                />
                <button
                  v-if="testingSearchSo"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  @click="testingSearchSo = ''; loadTestingDevices()"
                >✕</button>
              </div>
              <select v-model="testingFilterResult" class="select select-bordered select-sm w-36 h-8 min-h-0 bg-slate-900/60 text-xs border-slate-700/60 rounded-lg focus:border-primary/80" @change="loadTestingDevices">
                <option value="">Tất cả kết quả</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="NONE">NONE / PENDING</option>
              </select>
              <button class="btn btn-primary btn-sm gap-1" @click="loadTestingDevices">
                <Search class="w-4 h-4" /> Lọc danh sách
              </button>
              <button class="btn btn-ghost btn-sm text-xs" @click="resetTestingFilters">Đặt lại</button>
            </div>
            <div class="filter-right flex flex-wrap items-center gap-2">
              <button class="btn btn-success btn-sm gap-1" @click="openImportCsvDialog">
                <Upload class="w-4 h-4" /> Import CSV
              </button>
              <button class="btn btn-outline btn-sm gap-1" @click="loadTestingDevices">
                <RefreshCw class="w-4 h-4" /> Làm mới
              </button>
              <span class="table-guide-hint text-xs text-base-content/60 flex items-center gap-1">
                <Info class="w-4 h-4 text-info" /> Chuột phải để đổi trạng thái Test hoặc Xóa thiết bị
              </span>
            </div>
          </div>

          <div class="table-wrapper relative min-h-[400px]">
            <div ref="testingTableRef" class="tabulator-custom-theme"></div>
            <div v-if="testingLoading" class="loading-overlay absolute inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center gap-2 z-10">
              <Loader2 class="w-5 h-5 animate-spin text-primary" />
              <span class="text-sm font-medium">Đang tải danh sách thiết bị kiểm thử...</span>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-content/10 text-xs">
            <div class="text-base-content/70">
              Tổng số: <span class="font-bold text-primary">{{ testingTotal }}</span> bản ghi
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base-content/70">Số dòng:</span>
              <select v-model="testingLimit" class="select select-bordered select-xs" @change="testingPage = 1; loadTestingDevices()">
                <option :value="20">20 / trang</option>
                <option :value="50">50 / trang</option>
                <option :value="100">100 / trang</option>
                <option :value="200">200 / trang</option>
              </select>
              <div class="join">
                <button class="join-item btn btn-xs" :disabled="testingPage <= 1" @click="testingPage--; loadTestingDevices()">«</button>
                <button class="join-item btn btn-xs btn-ghost pointer-events-none">
                  Trang {{ testingPage }} / {{ Math.ceil(testingTotal / testingLimit) || 1 }}
                </button>
                <button class="join-item btn btn-xs" :disabled="testingPage >= (Math.ceil(testingTotal / testingLimit) || 1)" @click="testingPage++; loadTestingDevices()">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: DEVICE FINAL CONFIG LIST -->
      <div v-show="currentDisplayTab === 'device-final-config'" class="trace-tab-pane">
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-4">
          <div class="filter-bar flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-content/10">
            <div class="filter-left flex flex-wrap items-center gap-2">
              <div class="relative">
                <input
                  v-model="configSearchSerial"
                  type="text"
                  placeholder="Tìm S/N hoặc DevEUI..."
                  class="h-8 w-48 pl-3 pr-8 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95 text-xs font-mono text-slate-200 placeholder:text-slate-400/50 placeholder:italic placeholder:font-light rounded-lg border border-slate-700/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 shadow-inner transition-all outline-none"
                  @keyup.enter="loadFinalConfigDevices"
                />
                <button
                  v-if="configSearchSerial"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  @click="configSearchSerial = ''; loadFinalConfigDevices()"
                >✕</button>
              </div>
              <select v-model="configFilterStatus" class="select select-bordered select-sm w-48 h-8 min-h-0 bg-slate-900/60 text-xs border-slate-700/60 rounded-lg focus:border-primary/80" @change="loadFinalConfigDevices">
                <option value="">Tất cả trạng thái</option>
                <option value="CONFIGURED_PASS">CONFIGURED_PASS</option>
                <option value="CONFIG_FAILED">CONFIG_FAILED</option>
                <option value="NONE">UNCONFIGURED / NONE</option>
              </select>
              <button class="btn btn-primary btn-sm gap-1" @click="loadFinalConfigDevices">
                <Search class="w-4 h-4" /> Lọc danh sách
              </button>
              <button class="btn btn-ghost btn-sm text-xs" @click="resetConfigFilters">Đặt lại</button>
            </div>
            <div class="filter-right flex flex-wrap items-center gap-2">
              <button class="btn btn-outline btn-sm gap-1" @click="loadFinalConfigDevices">
                <RefreshCw class="w-4 h-4" /> Làm mới
              </button>
              <span class="table-guide-hint text-xs text-base-content/60 flex items-center gap-1">
                <Info class="w-4 h-4 text-info" /> Chuột phải để xem Session / Đổi trạng thái Config / Xóa
              </span>
            </div>
          </div>

          <div class="table-wrapper relative min-h-[400px]">
            <div ref="configTableRef" class="tabulator-custom-theme"></div>
            <div v-if="configLoading" class="loading-overlay absolute inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center gap-2 z-10">
              <Loader2 class="w-5 h-5 animate-spin text-primary" />
              <span class="text-sm font-medium">Đang tải danh sách thiết bị cấu hình cuối...</span>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-content/10 text-xs">
            <div class="text-base-content/70">
              Tổng số: <span class="font-bold text-primary">{{ configTotal }}</span> bản ghi
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base-content/70">Số dòng:</span>
              <select v-model="configLimit" class="select select-bordered select-xs" @change="configPage = 1; loadFinalConfigDevices()">
                <option :value="20">20 / trang</option>
                <option :value="50">50 / trang</option>
                <option :value="100">100 / trang</option>
                <option :value="200">200 / trang</option>
              </select>
              <div class="join">
                <button class="join-item btn btn-xs" :disabled="configPage <= 1" @click="configPage--; loadFinalConfigDevices()">«</button>
                <button class="join-item btn btn-xs btn-ghost pointer-events-none">
                  Trang {{ configPage }} / {{ Math.ceil(configTotal / configLimit) || 1 }}
                </button>
                <button class="join-item btn btn-xs" :disabled="configPage >= (Math.ceil(configTotal / configLimit) || 1)" @click="configPage++; loadFinalConfigDevices()">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- DIALOG 1: RAW TEST DATA VIEWER -->
    <dialog class="modal" :class="{ 'modal-open': rawTestDialogVisible }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <Info class="w-5 h-5 text-primary" />
            Chi Tiết Dữ Liệu Kiểm Thử Gốc
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="rawTestDialogVisible = false">✕</button>
        </div>
        <div v-if="selectedRawDevice" class="space-y-3">
          <div class="text-sm">
            <span class="font-semibold">Thiết bị:</span> {{ selectedRawDevice.serialNumber || selectedRawDevice.code }}
            <span class="mx-2 text-base-content/40">|</span>
            <span class="font-semibold">DevEUI:</span> {{ selectedRawDevice.devEui || 'N/A' }}
          </div>
          <div class="text-sm">
            <span class="font-semibold">Trạm kiểm thử:</span> {{ selectedRawDevice.testStation || 'N/A' }}
            <span class="mx-2 text-base-content/40">|</span>
            <span class="font-semibold">Người kiểm thử:</span> {{ selectedRawDevice.testPerson || 'N/A' }}
          </div>
          <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
            <pre>{{ JSON.stringify(selectedRawDevice.testRawData || selectedRawDevice, null, 2) }}</pre>
          </div>
        </div>
        <div v-else-if="viewingRawData" class="space-y-3">
          <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
            <pre>{{ JSON.stringify(viewingRawData, null, 2) }}</pre>
          </div>
        </div>
        <div v-else class="text-center py-6 text-base-content/60">
          Không có dữ liệu mở rộng.
        </div>
        <div class="modal-action">
          <button class="btn btn-sm" @click="rawTestDialogVisible = false">Đóng</button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/60" @click="rawTestDialogVisible = false"></div>
    </dialog>

    <!-- DIALOG 2: SESSION AUDIT VIEWER -->
    <dialog class="modal" :class="{ 'modal-open': sessionAuditDialogVisible }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <CheckCircle2 class="w-5 h-5 text-primary" />
            Chi Tiết Final Config Session &amp; Audit
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="sessionAuditDialogVisible = false">✕</button>
        </div>
        <div v-if="selectedSessionDevice" class="space-y-3">
          <div class="text-sm">
            <span class="font-semibold">S/N:</span> {{ selectedSessionDevice.serialNumber || selectedSessionDevice.code }}
            <span class="mx-2 text-base-content/40">|</span>
            <span class="font-semibold">Trạng thái Config:</span>
            <span class="badge badge-sm ml-1" :class="selectedSessionDevice.configStatus === 'CONFIGURED_PASS' ? 'badge-success' : 'badge-error'">
              {{ selectedSessionDevice.configStatus }}
            </span>
          </div>
          <div class="text-sm">
            <span class="font-semibold">Session ID:</span> {{ selectedSessionDevice.finalConfigSessionId || 'Chưa liên kết Session' }}
          </div>
          <div class="bg-base-300/50 p-3 rounded-lg border border-base-300 font-mono text-xs overflow-auto max-h-96">
            <pre>{{ JSON.stringify(selectedSessionDevice.sessionProfile || selectedSessionDevice.auditData || selectedSessionDevice, null, 2) }}</pre>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-sm" @click="sessionAuditDialogVisible = false">Đóng</button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/60" @click="sessionAuditDialogVisible = false"></div>
    </dialog>

    <!-- DIALOG 3: TẠO MỚI SALE ORDER -->
    <dialog class="modal" :class="{ 'modal-open': createSoVisible }">
      <div class="modal-box max-w-md bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <FolderOpen class="w-5 h-5 text-primary" />
            Tạo Mới Đơn Hàng (Sale Order)
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="createSoVisible = false">✕</button>
        </div>
        <form @submit.prevent="submitCreateSo" class="space-y-3">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Mã Sale Order <span class="text-error">*</span></span></label>
            <input v-model="newSoForm.soNumber" type="text" placeholder="Ví dụ: SO-2026-001 hoặc SO/26/001" class="input input-bordered input-sm w-full" required />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Tên Khách Hàng</span></label>
            <input v-model="newSoForm.customerName" type="text" placeholder="Tên khách hàng / Đối tác" class="input input-bordered input-sm w-full" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Ghi Chú</span></label>
            <textarea v-model="newSoForm.notes" rows="3" placeholder="Ghi chú đơn hàng..." class="textarea textarea-bordered textarea-sm w-full"></textarea>
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-ghost btn-sm" @click="createSoVisible = false">Hủy</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="submittingSo">
              <Loader2 v-if="submittingSo" class="w-4 h-4 animate-spin" />
              Tạo Mới
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-black/60" @click="createSoVisible = false"></div>
    </dialog>

    <!-- DIALOG 4: TẠO MỚI WORK AUTHORIZATION (WA) -->
    <dialog class="modal" :class="{ 'modal-open': createWaVisible }">
      <div class="modal-box max-w-lg bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <Ticket class="w-5 h-5 text-primary" />
            Tạo Work Authorization (WA) Thuộc SO
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="createWaVisible = false">✕</button>
        </div>
        <form @submit.prevent="submitCreateWa" class="space-y-3">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Sale Order</span></label>
            <div class="font-bold text-primary text-sm px-1">{{ newWaForm.soNumber }}</div>
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Mã WA (WA/xxxx/xxxxx) <span class="text-error">*</span></span></label>
            <input
              v-model="newWaForm.waNumber"
              type="text"
              placeholder="Ví dụ: WA/2026/00001"
              class="input input-bordered input-sm w-full"
              @blur="formatWaNumberInput"
              required
            />
            <span class="text-xs text-base-content/60 mt-1">Cú pháp bắt buộc theo chuẩn: WA/xxxx/xxxxx</span>
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Item Code / Mã SP</span></label>
            <input v-model="newWaForm.itemCode" type="text" placeholder="Ví dụ: WSLRW-C-RS485-01" class="input input-bordered input-sm w-full" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Số Lượng Kế Hoạch</span></label>
            <input v-model.number="newWaForm.plannedQuantity" type="number" min="1" max="100000" class="input input-bordered input-sm w-full" />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Ghi Chú</span></label>
            <textarea v-model="newWaForm.notes" rows="2" placeholder="Ghi chú lệnh..." class="textarea textarea-bordered textarea-sm w-full"></textarea>
          </div>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-ghost btn-sm" @click="createWaVisible = false">Hủy</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="submittingWa">
              <Loader2 v-if="submittingWa" class="w-4 h-4 animate-spin" />
              Tạo WA
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-black/60" @click="createWaVisible = false"></div>
    </dialog>

    <!-- DIALOG 5: CHI TIẾT SALE ORDER & DANH SÁCH WORK AUTHORIZATIONS (WA) -->
    <dialog class="modal" :class="{ 'modal-open': soDetailVisible }">
      <div class="modal-box max-w-4xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <FolderOpen class="w-5 h-5 text-primary" />
            Chi Tiết Sale Order: {{ selectedSo?.soNumber || '' }}
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="soDetailVisible = false">✕</button>
        </div>
        <div v-if="selectedSo" class="space-y-4">
          <!-- Summary Header -->
          <div class="p-3 bg-base-200/60 border border-base-300 rounded-lg text-xs space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div><span class="text-base-content/70">Mã Đơn Hàng (SO):</span> <strong class="text-primary font-mono text-sm ml-1">{{ selectedSo.soNumber }}</strong></div>
                <div><span class="text-base-content/70">Khách Hàng:</span> <strong class="ml-1">{{ selectedSo.customerName || 'Không có tên' }}</strong></div>
                <div v-if="selectedSo.partnerEmail || selectedSo.partner_email"><span class="text-base-content/70">Email:</span> <span class="font-mono text-primary ml-1">{{ selectedSo.partnerEmail || selectedSo.partner_email }}</span></div>
              </div>
              <div>
                <div><span class="text-base-content/70">Tổng Lệnh WA:</span> <span class="badge badge-warning badge-sm font-semibold ml-1">{{ selectedSo.workAuthorizations?.length || selectedSo.waCount || 0 }} WA</span></div>
                <div><span class="text-base-content/70">Tổng Thiết Bị:</span> <strong class="ml-1">{{ selectedSo.stats?.totalDevices ?? selectedSo.totalDevices ?? 0 }} thiết bị</strong></div>
                <div class="mt-1">
                  <span class="text-base-content/70">Trạng Thái Test:</span>
                  <span class="badge badge-success badge-xs font-bold ml-1">PASS: {{ selectedSo.stats?.testPassCount ?? selectedSo.testPassCount ?? 0 }}</span>
                  <span class="badge badge-info badge-xs font-bold ml-1">Config PASS: {{ selectedSo.stats?.configPassCount ?? selectedSo.configPassCount ?? 0 }}</span>
                </div>
              </div>
            </div>
            <div v-if="selectedSo.notes" class="mt-2 text-xs text-base-content/70 border-t border-base-300 pt-2">
              <strong>Ghi chú / Nguồn:</strong> {{ selectedSo.notes }}
            </div>
          </div>

          <!-- WA Table Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-warning text-sm flex items-center gap-1">
                <Ticket class="w-4 h-4" />
                Danh Sách Lệnh Work Authorization (WA) ({{ selectedSo.workAuthorizations?.length || 0 }} lệnh):
              </span>
              <button class="btn btn-primary btn-xs gap-1" @click="openCreateWaDialog(selectedSo)">
                <Plus class="w-3.5 h-3.5" /> Thêm WA Mới
              </button>
            </div>

            <div class="overflow-x-auto border border-base-300 rounded-lg max-h-72">
              <table class="table table-xs table-zebra w-full">
                <thead>
                  <tr class="bg-base-200">
                    <th class="w-44">Mã Lệnh WA</th>
                    <th>Item Code / Sản Phẩm</th>
                    <th class="text-right w-28">Kế Hoạch</th>
                    <th>Ghi Chú</th>
                    <th class="text-center w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="wa in (selectedSo.workAuthorizations || [])" :key="wa.id">
                    <td><code class="font-bold text-warning font-mono">{{ wa.waNumber }}</code></td>
                    <td><span class="font-bold text-primary">{{ wa.itemCode || '-' }}</span></td>
                    <td class="text-right font-mono">{{ wa.plannedQuantity || 0 }} pcs</td>
                    <td class="text-xs text-base-content/70">{{ wa.notes || '-' }}</td>
                    <td class="text-center">
                      <button class="btn btn-success btn-xs gap-1" @click="openImportCsvForWa(selectedSo.id, wa.id)">
                        <Upload class="w-3 h-3" /> Import CSV
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!selectedSo.workAuthorizations || selectedSo.workAuthorizations.length === 0">
                    <td colspan="5" class="text-center py-4 text-base-content/60">Chưa có lệnh WA nào thuộc SO này.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="soDetailVisible = false">Đóng</button>
          <button class="btn btn-primary btn-sm gap-1" @click="openImportCsvForSo(selectedSo?.id)">
            <Upload class="w-4 h-4" /> Import CSV Cho SO Này
          </button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/60" @click="soDetailVisible = false"></div>
    </dialog>

    <!-- DIALOG 6: IMPORT CSV FILE ĐÃ TEST -->
    <dialog class="modal" :class="{ 'modal-open': importCsvVisible }">
      <div class="modal-box max-w-3xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <Upload class="w-5 h-5 text-primary" />
            Import Danh Sách Thiết Bị Đã Test (CSV)
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="importCsvVisible = false">✕</button>
        </div>

        <div class="alert alert-info py-2.5 px-4 text-xs rounded-lg mb-4 flex items-start gap-2">
          <Info class="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold">Quy định Import Dữ Liệu Kiểm Thử</div>
            <div class="opacity-90">Hệ thống hỗ trợ cấu trúc file CSV kiểm thử phần cứng (ví dụ WSLRW-C-RS485-01_tested.csv). Có thể liên kết trực tiếp vào SO hoặc theo WA (nếu nhập WA hệ thống sẽ tự động gán vào SO tương ứng).</div>
          </div>
        </div>

        <form @submit.prevent="submitCsvImport" class="space-y-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Phương thức gán <span class="text-error">*</span></span></label>
            <div class="join">
              <button
                type="button"
                class="join-item btn btn-sm"
                :class="importAssignMode === 'WA' ? 'btn-primary' : 'btn-ghost border-base-300'"
                @click="importAssignMode = 'WA'"
              >
                Gán theo WA (khuyên dùng)
              </button>
              <button
                type="button"
                class="join-item btn btn-sm"
                :class="importAssignMode === 'SO' ? 'btn-primary' : 'btn-ghost border-base-300'"
                @click="importAssignMode = 'SO'"
              >
                Gán trực tiếp SO
              </button>
            </div>
          </div>

          <!-- WA Mode -->
          <div v-if="importAssignMode === 'WA'" class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Mã WA (WA/xxxx/xxxxx) <span class="text-error">*</span></span></label>
            <select
              v-model="selectedImportWaId"
              class="select select-bordered select-sm w-full"
              @change="handleImportWaChanged(selectedImportWaId)"
            >
              <option value="">-- Chọn hoặc nhập mã WA --</option>
              <option
                v-for="wa in allAvailableWas"
                :key="wa.id"
                :value="wa.id"
              >
                {{ wa.waNumber }} [SO: {{ wa.soNumber || 'N/A' }}] - {{ wa.itemCode || '' }}
              </option>
            </select>
            <div v-if="parsedAutoSo" class="text-xs text-primary mt-1 flex items-center gap-1">
              <Check class="w-3.5 h-3.5" /> Tự động nhận diện Sale Order: <b>{{ parsedAutoSo }}</b>
            </div>
          </div>

          <!-- SO Mode -->
          <div v-if="importAssignMode === 'SO'" class="space-y-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold text-xs">Mã Sale Order (SO) <span class="text-error">*</span></span></label>
              <select
                v-model="selectedImportSoId"
                class="select select-bordered select-sm w-full"
                @change="onImportSoChanged(selectedImportSoId)"
              >
                <option value="">-- Chọn mã SO --</option>
                <option
                  v-for="so in saleOrdersList"
                  :key="so.id"
                  :value="so.id"
                >
                  {{ so.soNumber }} ({{ so.customerName || 'N/A' }})
                </option>
              </select>
            </div>
            <div v-if="selectedImportSoId" class="form-control">
              <label class="label py-1"><span class="label-text font-semibold text-xs">Work Authorization (WA)</span></label>
              <select
                v-model="selectedImportWaId"
                class="select select-bordered select-sm w-full"
              >
                <option value="">-- Chọn WA thuộc SO này (khuyên dùng để liên kết chính xác) --</option>
                <option
                  v-for="wa in availableWasForSelectedSo"
                  :key="wa.id"
                  :value="wa.id"
                >
                  {{ wa.waNumber }} - {{ wa.itemCode || 'Không có Item Code' }} (Kế hoạch: {{ wa.plannedQuantity || 0 }} pcs)
                </option>
              </select>
              <div v-if="availableWasForSelectedSo.length === 0" class="text-xs text-warning mt-1">
                ⚠️ Đơn hàng này chưa có WA. Thiết bị sẽ được gán trực tiếp vào SO.
              </div>
              <div v-else class="text-xs text-info mt-1">
                ℹ️ Đã tìm thấy {{ availableWasForSelectedSo.length }} WA của SO này. Chọn WA giúp liên kết thiết bị theo từng mặt hàng/lệnh sản xuất cụ thể.
              </div>
            </div>
          </div>

          <!-- File upload button -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold text-xs">Chọn File CSV <span class="text-error">*</span></span></label>
            <input
              type="file"
              ref="csvFileInputRef"
              accept=".csv,text/csv"
              class="hidden"
              @change="handleCsvFileSelected"
            />
            <div class="flex items-center gap-3">
              <button type="button" class="btn btn-outline btn-primary btn-sm gap-2" @click="triggerFileInput">
                <Upload class="w-4 h-4" /> Tải File CSV Lên
              </button>
              <span v-if="selectedFileName" class="font-mono font-bold text-xs text-primary">{{ selectedFileName }}</span>
            </div>
          </div>

          <!-- Preview Table -->
          <div v-if="parsedCsvDevices.length > 0" class="mt-4 border border-base-300 rounded-lg p-3 bg-base-200/50 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold">
                Xem trước: <b>{{ parsedCsvDevices.length }}</b> bản ghi thiết bị được đọc từ file
              </span>
              <span class="badge badge-success badge-sm font-bold">
                {{ parsedCsvDevices.filter(d => d.testResult === 'PASS').length }} PASS / {{ parsedCsvDevices.filter(d => d.testResult === 'FAIL').length }} FAIL
              </span>
            </div>

            <div class="overflow-x-auto max-h-48 border border-base-300 rounded">
              <table class="table table-xs table-zebra w-full">
                <thead>
                  <tr class="bg-base-200">
                    <th class="w-36">S/N</th>
                    <th class="w-36">DevEUI</th>
                    <th class="w-24 text-center">Kết Quả</th>
                    <th>Item Code</th>
                    <th class="w-28">Trạm Test</th>
                    <th class="w-36">Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in parsedCsvDevices.slice(0, 5)" :key="idx">
                    <td class="font-mono text-xs font-semibold">{{ row.serialNumber }}</td>
                    <td class="font-mono text-xs text-primary">{{ row.devEui || '-' }}</td>
                    <td class="text-center">
                      <span class="badge badge-xs font-semibold" :class="row.testResult === 'PASS' ? 'badge-success' : 'badge-error'">
                        {{ row.testResult }}
                      </span>
                    </td>
                    <td class="text-xs">{{ row.itemCode || '-' }}</td>
                    <td class="text-xs">{{ row.testStation || '-' }}</td>
                    <td class="text-xs font-mono">{{ row.testedAt || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="parsedCsvDevices.length > 5" class="text-xs text-base-content/60 text-center">
              (Hiển thị 5 / {{ parsedCsvDevices.length }} bản ghi)
            </div>
          </div>

          <div class="modal-action mt-6">
            <button type="button" class="btn btn-ghost btn-sm" @click="importCsvVisible = false">Đóng</button>
            <button
              type="submit"
              class="btn btn-success btn-sm gap-1"
              :disabled="parsedCsvDevices.length === 0 || submittingImport"
            >
              <Loader2 v-if="submittingImport" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              Xác Nhận Import Vào Hệ Thống
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-black/60" @click="importCsvVisible = false"></div>
    </dialog>

    <!-- DIALOG 7: CHI TIẾT & CHỈNH SỬA THÔNG TIN THIẾT BỊ / TEST -->
    <dialog class="modal" :class="{ 'modal-open': editDeviceDialogVisible }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <Info class="w-5 h-5 text-primary" />
            Chi Tiết & Chỉnh Sửa Thông Tin Thiết Bị
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="editDeviceDialogVisible = false">✕</button>
        </div>

        <div v-if="editingDeviceForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Số Serial (S/N):</span></label>
              <input :value="editingDeviceForm.serialNumber" disabled class="input input-bordered input-sm bg-base-200 text-base-content/70 cursor-not-allowed" />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">DevEUI:</span></label>
              <input v-model="editingDeviceForm.devEui" placeholder="Nhập DevEUI (16 hex)" class="input input-bordered input-sm" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Mã Sản Phẩm (Item):</span></label>
              <input v-model="editingDeviceForm.itemCode" placeholder="Mã item..." class="input input-bordered input-sm" />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">SKU:</span></label>
              <input v-model="editingDeviceForm.sku" placeholder="SKU sản phẩm..." class="input input-bordered input-sm" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Kết Quả Test:</span></label>
              <select v-model="editingDeviceForm.testResult" class="select select-bordered select-sm">
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="PENDING">NONE / PENDING</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Trạng Thái Config:</span></label>
              <select v-model="editingDeviceForm.configStatus" class="select select-bordered select-sm">
                <option value="CONFIGURED_PASS">CONFIGURED_PASS (Đã nạp)</option>
                <option value="CONFIG_FAILED">CONFIG_FAILED (Lỗi cấu hình)</option>
                <option value="PENDING">PENDING / UNCONFIGURED</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Trạm Kiểm Thử:</span></label>
              <input v-model="editingDeviceForm.testStation" placeholder="Ví dụ: STATION_01" class="input input-bordered input-sm" />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">Người Kiểm Thử:</span></label>
              <input v-model="editingDeviceForm.testPerson" placeholder="Tên hoặc mã nhân viên..." class="input input-bordered input-sm" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">HW Version:</span></label>
              <input v-model="editingDeviceForm.hwVersion" placeholder="Phiên bản phần cứng..." class="input input-bordered input-sm" />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text font-semibold">FW Version:</span></label>
              <input v-model="editingDeviceForm.fwVersion" placeholder="Phiên bản firmware..." class="input input-bordered input-sm" />
            </div>
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text font-semibold">Dữ Liệu Raw Test (JSON):</span></label>
            <textarea
              v-model="editingDeviceForm.rawJsonText"
              rows="5"
              placeholder="{ ... }"
              class="textarea textarea-bordered font-mono text-xs"
            ></textarea>
          </div>
        </div>

        <div class="modal-action border-t border-base-300 pt-3 mt-4">
          <button class="btn btn-sm btn-ghost" @click="editDeviceDialogVisible = false">Hủy Bỏ</button>
          <button class="btn btn-sm btn-primary" :disabled="savingDeviceDetails" @click="submitEditDeviceDetails">
            <Loader2 v-if="savingDeviceDetails" class="w-4 h-4 animate-spin" />
            Lưu Thay Đổi
          </button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/60" @click="editDeviceDialogVisible = false"></div>
    </dialog>

    <!-- DIALOG 8: TÌM KIẾM & ĐỒNG BỘ SALES ORDER TỪ DIS (ODOO) -->
    <dialog class="modal" :class="{ 'modal-open': disSyncDialogVisible }">
      <div class="modal-box max-w-5xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <RefreshCw class="w-5 h-5 text-primary" />
            Tra Cứu & Đồng Bộ Sales Order Từ DIS (Odoo ERP)
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="disSyncDialogVisible = false">✕</button>
        </div>

        <div class="space-y-4">
          <!-- Status & Mode Notice -->
          <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-base-200/60 rounded-lg border border-base-300 text-sm">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-base-content/80">Trạng thái kết nối DIS API:</span>
              <span v-if="disStatus.connected && !disStatus.isMock" class="badge badge-success badge-sm font-semibold">
                Live Connection (HTTPS)
              </span>
              <span v-else-if="disStatus.isMock" class="badge badge-warning badge-sm font-semibold">
                Mock Mode (Mô phỏng offline)
              </span>
              <span v-else class="badge badge-ghost badge-sm">Chưa kết nối / Đang kiểm tra...</span>
            </div>
            <div class="text-xs text-base-content/60 font-mono">
              <span v-if="disStatus.isMock">
                (Thiếu DIS_SO_TOKEN, đang dùng dữ liệu chuẩn OpenAPI v1.1.0)
              </span>
              <span v-else>
                Base URL: {{ disStatus.baseUrl || 'https://dis-so.daviteq.com' }}
              </span>
            </div>
          </div>

          <!-- Filter bar -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div class="md:col-span-2">
              <input
                v-model.number="disFilterYear"
                type="number"
                min="2020"
                max="2035"
                placeholder="Năm (tất cả)"
                class="input input-bordered input-sm w-full"
              />
            </div>
            <div class="md:col-span-2">
              <select v-model="disFilterMonth" class="select select-bordered select-sm w-full">
                <option :value="undefined">Tất cả tháng</option>
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>
            </div>
            <div class="md:col-span-3">
              <select v-model="disFilterState" class="select select-bordered select-sm w-full">
                <option value="">Tất cả trạng thái</option>
                <option value="sale">Sale Order (Đã duyệt)</option>
                <option value="done">Hoàn tất (Done)</option>
                <option value="draft">Báo giá (Draft)</option>
                <option value="cancel">Đã hủy (Cancel)</option>
              </select>
            </div>
            <div class="md:col-span-4">
              <div class="join w-full">
                <input
                  v-model="disFilterQuery"
                  placeholder="Tìm mã SO (VD: SO26...), khách hàng..."
                  class="input input-bordered input-sm join-item w-full"
                  @keyup.enter="searchDisOrders"
                />
                <button class="btn btn-sm btn-primary join-item" :disabled="loadingDisList" @click="searchDisOrders">
                  <Loader2 v-if="loadingDisList" class="w-4 h-4 animate-spin" />
                  <Search v-else class="w-4 h-4" />
                  Tìm
                </button>
              </div>
            </div>
            <div class="md:col-span-1 flex items-center justify-end">
              <button class="btn btn-sm btn-ghost btn-square" title="Làm mới" :disabled="loadingDisList" @click="searchDisOrders">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loadingDisList }" />
              </button>
            </div>
          </div>

          <!-- Orders Table List -->
          <div class="overflow-x-auto border border-base-300 rounded-lg max-h-60 overflow-y-auto">
            <table class="table table-xs table-pin-rows table-zebra w-full">
              <thead>
                <tr class="bg-base-200">
                  <th class="text-center w-20">ID Odoo</th>
                  <th class="w-40">Mã Đơn Hàng (SO)</th>
                  <th>Khách Hàng</th>
                  <th>Email Khách Hàng</th>
                  <th class="text-center w-36">Ngày Đặt Hàng</th>
                  <th class="text-center w-28">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingDisList">
                  <td colspan="6" class="text-center py-6 text-base-content/60">
                    <div class="flex items-center justify-center gap-2">
                      <Loader2 class="w-5 h-5 animate-spin text-primary" />
                      <span>Đang tải danh sách đơn hàng DIS...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="disOrdersList.length === 0">
                  <td colspan="6" class="text-center py-6 text-base-content/60">
                    Không tìm thấy đơn hàng DIS nào phù hợp.
                  </td>
                </tr>
                <tr
                  v-for="row in disOrdersList"
                  :key="row.odoo_id || row.id"
                  class="cursor-pointer hover:bg-base-200 transition-colors"
                  :class="{ 'bg-primary/20 font-semibold': selectedDisOrder && (selectedDisOrder.odoo_id === row.odoo_id || selectedDisOrder.id === row.id) }"
                  @click="handleDisOrderSelect(row)"
                >
                  <td class="text-center font-mono">{{ row.odoo_id || row.id }}</td>
                  <td class="text-primary font-bold font-mono">{{ row.name }}</td>
                  <td class="truncate max-w-xs">{{ row.partner_name || '-' }}</td>
                  <td class="truncate max-w-xs">{{ row.partner_email || row.email || '-' }}</td>
                  <td class="text-center text-xs text-base-content/70">{{ row.date_order || '-' }}</td>
                  <td class="text-center">
                    <span class="badge badge-sm" :class="getDisStateBadgeClass(row.state)">
                      {{ row.state }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Selected SO Details & Line Items -->
          <div v-if="selectedDisOrder" class="mt-4 pt-4 border-t border-base-300 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-bold text-primary flex items-center gap-2">
                <span>Chi Tiết Đơn Hàng:</span>
                <span class="text-accent">{{ selectedDisOrder.name }}</span>
                <span class="text-base-content/60 font-normal">- {{ selectedDisOrder.partner_name }}</span>
              </div>
              <button
                class="btn btn-sm btn-success text-white"
                :disabled="syncingDisOrder"
                @click="syncSelectedDisOrderToDatabase"
              >
                <Loader2 v-if="syncingDisOrder" class="w-4 h-4 animate-spin" />
                <Check v-else class="w-4 h-4" />
                Đồng Bộ Vào Traceability Database
              </button>
            </div>

            <!-- Work Authorization (WA) on DIS & Fallback Info -->
            <div>
              <div v-if="selectedDisOrderWas.length > 0">
                <div class="font-semibold text-success text-sm flex items-center gap-1 mb-2">
                  <Ticket class="w-4 h-4" />
                  <span>Lệnh Work Authorization (WA) trên DIS ({{ selectedDisOrderWas.length }} lệnh sẵn có):</span>
                </div>
                <div class="overflow-x-auto border border-base-300 rounded-lg max-h-36 overflow-y-auto">
                  <table class="table table-xs table-pin-rows w-full">
                    <thead>
                      <tr class="bg-base-200">
                        <th class="w-44">Mã Lệnh WA</th>
                        <th class="text-center w-40">Trạng Thái Bảo Hành</th>
                        <th>Mặt hàng / Chi tiết Lots</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in selectedDisOrderWas" :key="idx" class="hover:bg-base-200">
                        <td class="font-bold text-warning font-mono">{{ row.wa_code }}</td>
                        <td class="text-center">
                          <span class="badge badge-sm" :class="row.warranty_status === 'under_warranty' ? 'badge-success' : 'badge-ghost'">
                            {{ row.warranty_status || 'Chưa xác định' }}
                          </span>
                        </td>
                        <td class="text-xs">
                          <span v-if="row.lines && row.lines.length > 0">
                            {{ row.lines.map((l: any) => `${l.item_code || l.product_name || 'Item'} (${l.quantity || 1} pcs)`).join(', ') }}
                          </span>
                          <span v-else class="text-base-content/50">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else>
                <div class="alert alert-info py-2 px-3 text-xs rounded-lg">
                  <Info class="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span class="font-bold block">Thông tin Work Authorization (WA) cho Đơn Hàng này:</span>
                    <span>Đơn hàng này trên DIS chưa liên kết lệnh sản xuất/bảo hành (wa: []). Khi bấm 'Đồng Bộ Vào Traceability Database', hệ thống sẽ tự động bóc tách từng dòng sản phẩm (lines) bên dưới để sinh WA tương ứng (định dạng WA/&lt;NĂM&gt;/&lt;MÃ_SO&gt;-&lt;STT&gt;) cho từng mặt hàng để sẵn sàng gán thiết bị tested.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lines in Order -->
            <div>
              <div class="font-semibold text-info text-sm flex items-center gap-1 mb-2">
                <List class="w-4 h-4" />
                <span>Danh sách Mặt hàng / Lines trong Đơn ({{ selectedDisOrderLines.length }} dòng):</span>
              </div>
              <div class="overflow-x-auto border border-base-300 rounded-lg max-h-48 overflow-y-auto">
                <table class="table table-xs table-pin-rows table-zebra w-full">
                  <thead>
                    <tr class="bg-base-200">
                      <th class="text-center w-28">Loại Dòng</th>
                      <th class="w-48">ITEM-CODE (Mã Đặt Hàng)</th>
                      <th>Tên Sản Phẩm / Diễn Giải</th>
                      <th class="text-right w-28">SL Yêu Cầu</th>
                      <th class="text-right w-24">Đã Giao</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingDisDetail">
                      <td colspan="5" class="text-center py-4 text-base-content/60">
                        <div class="flex items-center justify-center gap-2">
                          <Loader2 class="w-4 h-4 animate-spin text-primary" />
                          <span>Đang tải chi tiết dòng đơn hàng...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="selectedDisOrderLines.length === 0">
                      <td colspan="5" class="text-center py-4 text-base-content/60">
                        Không có mặt hàng nào.
                      </td>
                    </tr>
                    <tr v-for="(row, idx) in selectedDisOrderLines" :key="idx" class="hover:bg-base-200">
                      <td class="text-center">
                        <span
                          v-if="row.line_type === 'product' || row.line_type === 'item'"
                          class="badge badge-success badge-sm"
                        >
                          {{ row.line_type === 'item' ? 'Item' : 'Product' }}
                        </span>
                        <span v-else-if="row.line_type === 'section'" class="badge badge-info badge-sm">Section</span>
                        <span v-else class="badge badge-warning badge-sm">{{ row.line_type || 'Note' }}</span>
                      </td>
                      <td class="font-semibold text-primary font-mono text-xs">
                        {{ row.default_code || row.ordering_code || row.sku || row.product_code || '-' }}
                      </td>
                      <td class="text-xs max-w-sm truncate">{{ row.description || row.product_name || row.name || '-' }}</td>
                      <td class="text-right font-mono font-semibold">{{ row.quantity != null ? row.quantity : (row.product_uom_qty ?? 0) }}</td>
                      <td class="text-right font-mono">{{ row.delivered_quantity != null ? row.delivered_quantity : (row.qty_delivered ?? 0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action border-t border-base-300 pt-3 mt-4">
          <button class="btn btn-sm btn-ghost" @click="disSyncDialogVisible = false">Đóng</button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/60" @click="disSyncDialogVisible = false"></div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from '@/services/cyberToast';
import { ElMessageBox } from '@/services/cyberConfirm';
import {
  Files,
  List,
  Plus,
  RefreshCw,
  FolderOpen,
  FolderTree,
  Upload,
  Download,
  CheckCircle2,
  Check,
  Search,
  UploadCloud,
  Eye,
  Info,
  Loader2,
  ArrowLeft,
  Ticket,
} from 'lucide-vue-next';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const route = useRoute();
const router = useRouter();

// Isolated view check: chỉ khi url có ?isolated=true
const isIsolatedView = computed(() => {
  return route.query.isolated === 'true';
});

const resolveTabName = (tab?: any): string => {
  const t = String(tab || '');
  if (t === 'devices' || t === 'testing-devices' || t === 'device-testing') return 'device-testing';
  if (t === 'config' || t === 'config-devices' || t === 'device-final-config') return 'device-final-config';
  if (t === 'so-item-device' || t === 'item-device') return 'so-item-device';
  if (t === 'so-wa' || t === 'sale-orders') return 'sale-orders';
  return 'sale-orders';
};

// Active Tab
const activeTab = ref(resolveTabName(route?.query?.tab));
const normalizedActiveTab = computed(() => activeTab.value);
const currentDisplayTab = normalizedActiveTab;
const isSoTreeTab = computed(() => activeTab.value === 'sale-orders' || activeTab.value === 'so-wa' || activeTab.value === 'so-item-device');

const isolatedTitle = computed(() => {
  if (normalizedActiveTab.value === 'device-testing') return 'Tra Cứu Thiết Bị Kiểm Thử (Testing Devices)';
  if (normalizedActiveTab.value === 'device-final-config') return 'Tra Cứu Cấu Hình Cuối (Final Config Devices)';
  if (normalizedActiveTab.value === 'so-item-device') return 'Cây Phân Cấp SO -> ITEMCODE -> TESTED DEVICE';
  return 'Quản Lý Sale Order & Cây Dữ Liệu (Traceability)';
});

function goBackToMenu() {
  router.push('/menu');
}

watch(() => route?.query?.tab, (newTab) => {
  if (newTab) {
    const resolved = resolveTabName(newTab);
    if (activeTab.value !== resolved) {
      activeTab.value = resolved;
      onTabChange(resolved);
    }
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
const selectedDisOrderWas = ref<any[]>([]);

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
const importAssignMode = ref('WA');
const selectedImportSoId = ref('');
const selectedImportWaId = ref('');
const parsedCsvDevices = ref<any[]>([]);
const soOptions = ref<any[]>([]);
const csvFileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const parsedAutoSo = ref('');
const saleOrdersList = ref<any[]>([]);
const allAvailableWas = ref<any[]>([]);
const availableWasForSelectedSo = ref<any[]>([]);
const viewingRawData = ref<any>(null);

const formatWaNumberInput = () => {
  if (!newWaForm.waNumber) return;
  newWaForm.waNumber = newWaForm.waNumber.trim();
};

const handleImportWaChanged = (waId: string) => {
  const found = allAvailableWas.value.find(w => w.id === waId || w.waNumber === waId);
  if (found) {
    parsedAutoSo.value = found.soNumber || '';
    if (found.soId) {
      selectedImportSoId.value = found.soId;
    }
  } else {
    parsedAutoSo.value = '';
  }
};

const onImportSoChanged = async (soIdVal: string) => {
  selectedImportWaId.value = '';
  if (!soIdVal) {
    availableWasForSelectedSo.value = [];
    return;
  }
  const found = saleOrdersList.value.find((s) => s.id === soIdVal || s.soNumber === soIdVal);
  if (found && Array.isArray(found.workAuthorizations) && found.workAuthorizations.length > 0) {
    availableWasForSelectedSo.value = found.workAuthorizations;
    if (found.workAuthorizations.length === 1) {
      selectedImportWaId.value = found.workAuthorizations[0].id;
    }
    return;
  }
  try {
    const res = await fetch(`/api/plugins/device-traceability/so/${encodeURIComponent(soIdVal)}/wa`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      availableWasForSelectedSo.value = list;
      if (list.length === 1) {
        selectedImportWaId.value = list[0].id;
      }
    } else {
      availableWasForSelectedSo.value = [];
    }
  } catch (err) {
    console.warn('Lỗi tải danh sách WA của SO:', err);
    availableWasForSelectedSo.value = [];
  }
};

const fetchAllWas = async () => {
  try {
    const res = await fetch('/api/plugins/device-traceability/wa?limit=500', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      allAvailableWas.value = Array.isArray(data) ? data : (data.items || data.data || []);
    }
  } catch (err) {
    console.warn('Lỗi tải danh sách WA:', err);
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

const getDisStateBadgeClass = (state: string): string => {
  switch (state) {
    case 'sale':
      return 'badge-success text-success-content';
    case 'done':
      return 'badge-info text-info-content';
    case 'draft':
      return 'badge-warning text-warning-content';
    case 'cancel':
      return 'badge-error text-error-content';
    default:
      return 'badge-ghost';
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
  selectedDisOrderWas.value = [];
  await checkDisStatus();
  await searchDisOrders();
};

const searchDisOrders = async () => {
  loadingDisList.value = true;
  selectedDisOrder.value = null;
  selectedDisOrderLines.value = [];
  selectedDisOrderWas.value = [];
  try {
    const params = new URLSearchParams();
    if (disFilterYear.value) params.append('year', String(disFilterYear.value));
    if (disFilterMonth.value) params.append('month', String(disFilterMonth.value));
    if (disFilterState.value) params.append('state', disFilterState.value);
    if (disFilterQuery.value) params.append('q', disFilterQuery.value.trim());

    let res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/search?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    }
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
    selectedDisOrderWas.value = [];
    return;
  }
  selectedDisOrder.value = row;
  loadingDisDetail.value = true;
  try {
    const odooId = row.odoo_id || row.id;
    let res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/${odooId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}`, {
        headers: getAuthHeaders(),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const detail = data.data || data;
      const email =
        detail.partner_email ||
        detail.partnerEmail ||
        detail.customer_email ||
        detail.customerEmail ||
        detail.email ||
        detail.customer?.email ||
        detail.partner?.email ||
        detail.partner_id?.email ||
        '';
      if (email) {
        row.partner_email = email;
        row.partnerEmail = email;
      }
      selectedDisOrder.value = {
        ...row,
        ...detail,
        partner_email: email || selectedDisOrder.value?.partner_email || '',
        partnerEmail: email || selectedDisOrder.value?.partnerEmail || '',
      };
      const rawLines = detail.lines || detail.items || detail.order_line || [];
      const linesArray = Array.isArray(rawLines) ? rawLines : [];
      // Lọc bỏ line có default_code === 'N/A' hoặc rỗng và map item_code từ default_code
      selectedDisOrderLines.value = linesArray
        .filter((l: any) => {
          const code = String(l.default_code || l.ordering_code || l.sku || '').trim().toUpperCase();
          return code && code !== 'N/A';
        })
        .map((l: any) => ({
          ...l,
          default_code: l.default_code || l.ordering_code || l.sku || '',
          ordering_code: l.default_code || l.ordering_code || l.sku || '',
        }));

      const rawWas = detail.wa || row.wa || [];
      selectedDisOrderWas.value = Array.isArray(rawWas) ? rawWas : [];
    } else {
      selectedDisOrderLines.value = [];
      selectedDisOrderWas.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải chi tiết SO từ DIS:', err);
    selectedDisOrderLines.value = [];
    selectedDisOrderWas.value = [];
  } finally {
    loadingDisDetail.value = false;
  }
};

const syncSelectedDisOrderToDatabase = async () => {
  if (!selectedDisOrder.value) return;
  const odooId = selectedDisOrder.value.odoo_id || selectedDisOrder.value.id;
  syncingDisOrder.value = true;
  try {
    let res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/${odooId}/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        autoCreateWa: true,
      }),
    });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          autoCreateWa: true,
        }),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          autoCreateWa: true,
        }),
      });
    }
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
      const syncedWa = result.syncedWaCount || (Array.isArray(result.workAuthorizations) ? result.workAuthorizations.length : 0);
      ElMessage.success(result.message || `Đồng bộ thành công Sales Order ${selectedDisOrder.value.name} (${syncedWa} lệnh WA)!`);
      disSyncDialogVisible.value = false;
      await loadSoTreeData();
      if (result.so?.id) {
        await viewSoDetail(result.so.id);
      }
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
        title: 'Mã / Phân Cấp Đối Tượng',
        field: 'code',
        widthGrow: 2.4,
        responsive: 0,
        cellClick: (e, cell) => {
          const target = e.target as HTMLElement;
          const rowData = cell.getRow().getData();
          if (target.closest('.badge-so-wa-count') && rowData.type === 'SO' && rowData.id) {
            viewSoDetail(rowData.id);
          }
        },
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = (rowData.type || '').toUpperCase();
          let icon = '📁';
          let badgeClass = 'badge-so';
          let typeLabel = 'SO';
          let label = rowData.code || rowData.soNumber || '';

          if (type === 'SO') {
            const waCount = rowData.waCount ?? (Array.isArray(rowData.workAuthorizations) ? rowData.workAuthorizations.length : (Array.isArray(rowData.was) ? rowData.was.length : 0));
            const waList = Array.isArray(rowData.workAuthorizations) ? rowData.workAuthorizations : (Array.isArray(rowData.was) ? rowData.was : []);
            const waNumbers = waList.map((w: any) => w.waNumber || w.wa_number).filter(Boolean);
            const waTooltip = waNumbers.length > 0 ? `Danh sách WA:\n- ${waNumbers.join('\n- ')}\n(Nhấp đúp hoặc chuột phải để xem chi tiết)` : 'Chưa có lệnh WA';
            const waBadge = `<span class="badge-so-wa-count" title="${waTooltip}">📑 ${waCount} WA</span>`;

            return `<span class="tree-node ${badgeClass}">
              <span class="tree-icon">${icon}</span>
              <span class="tree-type-tag">${typeLabel}</span>
              <strong class="tree-label">${label}</strong>
              ${waBadge}
            </span>`;
          }

          if (type === 'ITEM' || type === 'ITEM_CODE' || type === 'ITEM-CODE' || type === 'SKU' || type === 'PRODUCT') {
            icon = '📦';
            badgeClass = 'badge-item';
            typeLabel = 'ITEM';
            label = rowData.code || rowData.itemCode || rowData.orderingCode || '';
          } else if (type === 'WA') {
            icon = '📑';
            badgeClass = 'badge-wa';
            typeLabel = 'WA';
            label = rowData.code || rowData.waNumber || '';
          } else if (type === 'DEVICE' || type === 'SERIAL_NUMBER' || type === 'SERIAL') {
            icon = '📟';
            badgeClass = 'badge-device';
            typeLabel = 'SN';
            label = rowData.code || rowData.serialNumber || '';
          }

          return `<span class="tree-node ${badgeClass}">
            <span class="tree-icon">${icon}</span>
            <span class="tree-type-tag">${typeLabel}</span>
            <strong class="tree-label">${label}</strong>
          </span>`;
        },
      },
      {
        title: 'Khách Hàng / Diễn Giải / SKU',
        field: 'customerName',
        widthGrow: 2.2,
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = (rowData.type || '').toUpperCase();
          if (type === 'SO') {
            const email = rowData.partnerEmail || rowData.partner_email || rowData.customerEmail || rowData.customer_email || rowData.email || rowData.partner?.email || rowData.customer?.email || '';
            const emailHtml = email ? ` <span class="customer-email-badge" title="Email liên hệ">&lt;${email}&gt;</span>` : '';
            const cust = rowData.customerName || '<span class="text-muted">Không có tên KH</span>';
            return `<div class="customer-cell"><span class="cust-name">${cust}</span>${emailHtml}</div>`;
          }
          if (type === 'ITEM' || type === 'ITEM_CODE' || type === 'ITEM-CODE' || type === 'SKU' || type === 'PRODUCT') {
            const desc = rowData.description || rowData.productName || rowData.itemCode || '-';
            const skuTag = rowData.sku && rowData.sku !== rowData.itemCode ? ` <span class="badge-item-sub">SKU: ${rowData.sku}</span>` : '';
            const waTag = rowData.waNumber ? ` <span class="badge-wa-sm" title="Lệnh WA gắn kèm: ${rowData.waNumber}">WA: ${rowData.waNumber}</span>` : '';
            return `<div class="item-desc-cell"><span class="sku-cell" title="${desc}">${desc}</span>${skuTag}${waTag}</div>`;
          }
          if (type === 'DEVICE' || type === 'SERIAL_NUMBER' || type === 'SERIAL') {
            const waTag = rowData.waNumber || rowData.waCode ? `<span class="badge-wa-sm" title="Work Authorization">WA: ${rowData.waNumber || rowData.waCode}</span>` : '';
            const macTag = rowData.macAddress || rowData.mac ? ` <span class="mono-font text-muted" style="font-size:11px;">[MAC: ${rowData.macAddress || rowData.mac}]</span>` : '';
            return `<div class="device-cell"><span class="sku-cell">${rowData.sku || rowData.itemCode || '-'}</span>${waTag}${macTag}</div>`;
          }
          return '<span class="text-muted">-</span>';
        },
      },
      {
        title: 'SL / DevEUI',
        field: 'plannedQuantity',
        widthGrow: 1.3,
        cellClick: (e, cell) => {
          const target = e.target as HTMLElement;
          const rowData = cell.getRow().getData();
          if (target.closest('.badge-so-wa-pill') && rowData.type === 'SO' && rowData.id) {
            viewSoDetail(rowData.id);
          }
        },
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = (rowData.type || '').toUpperCase();
          if (type === 'SO') {
            const count = rowData.totalDevices != null ? rowData.totalDevices : (rowData.deviceCount ?? rowData.plannedQuantity ?? 0);
            const items = rowData.itemCount != null ? ` (${rowData.itemCount} items)` : '';
            const waCount = rowData.waCount ?? (Array.isArray(rowData.workAuthorizations) ? rowData.workAuthorizations.length : (Array.isArray(rowData.was) ? rowData.was.length : 0));
            return `<div class="d-flex align-items-center gap-1">
              <span class="quantity-badge so">${count} thiết bị${items}</span>
              <span class="badge-so-wa-pill" title="Tổng số lệnh Work Authorization">${waCount} WA</span>
            </div>`;
          }
          if (type === 'ITEM' || type === 'ITEM_CODE' || type === 'ITEM-CODE' || type === 'SKU' || type === 'PRODUCT') {
            const planned = rowData.plannedQuantity ?? rowData.quantity ?? 0;
            const tested = rowData.testedCount ?? rowData.totalDevices ?? (rowData.devices ? rowData.devices.length : 0);
            return `<span class="quantity-badge item" title="Đã có ${tested} / Kế hoạch ${planned}">${tested}/${planned} chiếc</span>`;
          }
          if (type === 'WA') {
            const count = rowData.plannedQuantity ?? rowData.quantity ?? rowData.deviceCount ?? 0;
            return `<span class="quantity-badge wa">${count} chiếc</span>`;
          }
          if (type === 'DEVICE' || type === 'SERIAL_NUMBER' || type === 'SERIAL') {
            return `<span class="mono-font deveui-code">${rowData.devEui || '<span class="text-muted">-</span>'}</span>`;
          }
          return '-';
        },
      },
      {
        title: 'Tiến Độ / Trạng Thái Test',
        field: 'testResult',
        widthGrow: 1.8,
        hozAlign: 'center',
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = (rowData.type || '').toUpperCase();

          if (type === 'ITEM' || type === 'ITEM_CODE' || type === 'ITEM-CODE' || type === 'SKU' || type === 'PRODUCT') {
            const planned = Number(rowData.plannedQuantity ?? rowData.quantity ?? 0);
            const passCount = Number(rowData.passCount != null ? rowData.passCount : (rowData.testPassCount ?? rowData.devicePassCount ?? 0));
            const failCount = Number(rowData.failCount != null ? rowData.failCount : (rowData.testFailCount ?? rowData.deviceFailCount ?? 0));
            const totalTested = Number(rowData.testedCount ?? rowData.totalDevices ?? (passCount + failCount));
            const denom = planned > 0 ? planned : (totalTested > 0 ? totalTested : 1);
            const pct = Math.min(100, Math.round((passCount / denom) * 100));

            return `
              <div class="progress-cell-wrapper" title="PASS: ${passCount} | FAIL: ${failCount} | Kế hoạch: ${planned}">
                <div class="mini-progress-bar">
                  <div class="progress-fill ${pct >= 100 ? 'complete' : ''}" style="width: ${pct}%"></div>
                </div>
                <div class="progress-labels">
                  <span class="pct-text">${pct}%</span>
                  <span class="count-badge pass">PASS: ${passCount}</span>
                  ${failCount > 0 ? `<span class="count-badge fail">FAIL: ${failCount}</span>` : ''}
                </div>
              </div>`;
          }

          if (type === 'SO') {
            const passCount = rowData.passCount != null ? rowData.passCount : (rowData.testPassCount ?? rowData.devicePassCount ?? 0);
            const failCount = rowData.failCount != null ? rowData.failCount : (rowData.testFailCount ?? rowData.deviceFailCount ?? 0);
            const total = rowData.totalDevices ?? (passCount + failCount);
            const pct = total > 0 ? Math.min(100, Math.round((passCount / total) * 100)) : 0;
            return `
              <div class="progress-cell-wrapper" title="Tổng PASS: ${passCount}/${total}">
                <div class="mini-progress-bar">
                  <div class="progress-fill so-fill ${pct >= 100 && total > 0 ? 'complete' : ''}" style="width: ${pct}%"></div>
                </div>
                <div class="progress-labels">
                  <span class="pct-text">${pct}%</span>
                  <span class="count-badge pass">PASS: ${passCount}</span>
                  ${failCount > 0 ? `<span class="count-badge fail">FAIL: ${failCount}</span>` : ''}
                </div>
              </div>`;
          }

          if (type === 'WA') {
            const passCount = rowData.passCount != null ? rowData.passCount : (rowData.testPassCount ?? rowData.devicePassCount ?? 0);
            const failCount = rowData.failCount != null ? rowData.failCount : (rowData.testFailCount ?? rowData.deviceFailCount ?? 0);
            return `<span class="count-badge pass">PASS: ${passCount}</span>${failCount > 0 ? ` <span class="count-badge fail">FAIL: ${failCount}</span>` : ''}`;
          }

          const res = (rowData.testResult || rowData.testStatus || 'NONE').toUpperCase();
          if (res === 'PASS') return '<span class="status-pill pass">PASS</span>';
          if (res === 'FAIL') return '<span class="status-pill fail">FAIL</span>';
          return '<span class="status-pill pending">NONE</span>';
        },
      },
      {
        title: 'Final Config',
        field: 'configStatus',
        widthGrow: 1.3,
        hozAlign: 'center',
        formatter: (cell) => {
          const rowData = cell.getRow().getData();
          const type = (rowData.type || '').toUpperCase();
          if (type === 'SO' || type === 'ITEM' || type === 'ITEM_CODE' || type === 'SKU' || type === 'WA') {
            const cfgPass = rowData.configPassCount != null ? rowData.configPassCount : (rowData.deviceConfigPassCount ?? 0);
            return `<span class="count-badge pass" title="Số lượng thiết bị đã cấu hình đạt">CFG PASS: ${cfgPass}</span>`;
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
      } else if (data.type === 'ITEM' || data.type === 'ITEM_CODE' || data.type === 'SKU') {
        menu.push({
          label: '📥 Import CSV Thiết Bị vào Sản Phẩm này...',
          action: () => {
            openImportCsvForSo(data.soId || data.id);
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
    rowDblClick: (e, row) => {
      const data = row.getData();
      if (data.type === 'SO') {
        viewSoDetail(data.id);
      } else if (data.type === 'DEVICE') {
        openEditDeviceDialog(data);
      }
    },
  });
};

const loadSoTreeData = async () => {
  soTreeLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (soSearchNumber.value.trim()) params.append('soNumber', soSearchNumber.value.trim());
    if (soSearchCustomer.value.trim()) params.append('customerName', soSearchCustomer.value.trim());
    const hierarchy = activeTab.value === 'so-item-device' ? 'item' : 'wa';
    params.append('hierarchy', hierarchy);

    const url = `/api/plugins/device-traceability/so/tree?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const treeData = Array.isArray(data) ? data : (data.data || []);

    if (soTabulator) {
      await soTabulator.setData(treeData);
      soTabulator.redraw(true);
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
      testingTabulator.redraw(true);
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
      configTabulator.redraw(true);
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
    if (tabName === 'sale-orders' || tabName === 'so-item-device') {
      if (!soTabulator) {
        initSoTreeTable();
      } else {
        soTabulator.redraw(true);
      }
      loadSoTreeData();
    } else if (tabName === 'device-testing') {
      if (!testingTabulator) {
        initTestingTable();
      } else {
        testingTabulator.redraw(true);
      }
      loadTestingDevices();
    } else if (tabName === 'device-final-config') {
      if (!configTabulator) {
        initConfigTable();
      } else {
        configTabulator.redraw(true);
      }
      loadFinalConfigDevices();
    }
  });
};

const switchTab = (tabName: string) => {
  activeTab.value = tabName;
  router.replace({ query: { ...route.query, tab: tabName } });
  onTabChange(tabName);
};

const refreshActiveTabData = () => {
  if (activeTab.value === 'sale-orders' || activeTab.value === 'so-item-device') {
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
      itemCode: newWaForm.itemCode ? newWaForm.itemCode.trim() : undefined,
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
      const list = Array.isArray(data) ? data : (data.items || data.data || []);
      soOptions.value = list;
      saleOrdersList.value = list;
    }
  } catch (e) {
    console.warn('Could not fetch SO options', e);
  }
};

const openImportCsvDialog = async () => {
  importAssignMode.value = 'WA';
  selectedImportSoId.value = '';
  selectedImportWaId.value = '';
  availableWasForSelectedSo.value = [];
  parsedCsvDevices.value = [];
  parsedAutoSo.value = '';
  selectedFileName.value = '';
  if (csvFileInputRef.value) {
    csvFileInputRef.value.value = '';
  }
  await Promise.all([fetchSoOptions(), fetchAllWas()]);
  importCsvVisible.value = true;
};

const openImportCsvForSo = async (soId: string) => {
  await openImportCsvDialog();
  importAssignMode.value = 'SO';
  selectedImportSoId.value = soId;
  await onImportSoChanged(soId);
};

const openImportCsvForWa = async (soId: string, waId: string) => {
  await openImportCsvDialog();
  importAssignMode.value = 'WA';
  selectedImportSoId.value = soId;
  selectedImportWaId.value = waId;
  handleImportWaChanged(waId);
};

const onImportModeChange = () => {
  selectedImportSoId.value = '';
  selectedImportWaId.value = '';
  availableWasForSelectedSo.value = [];
  parsedAutoSo.value = '';
};

const onImportSoChange = () => {
  selectedImportWaId.value = '';
  if (selectedImportSoId.value) {
    onImportSoChanged(selectedImportSoId.value);
  }
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

  if (selectedImportWaId.value) {
    const target = selectedImportWaId.value;
    if (target && target.length >= 32) waId = target;
    else if (target) waNumber = target;
  }

  if (selectedImportSoId.value) {
    const target = selectedImportSoId.value;
    if (target && target.length >= 32) soId = target;
    else if (target) soNumber = target;
  }

  if (!soId && !soNumber && parsedAutoSo.value) {
    soNumber = parsedAutoSo.value;
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
    await Promise.allSettled([
      loadSoTreeData(),
      loadTestingDevices(),
      loadFinalConfigDevices(),
      fetchSoOptions(),
      fetchAllWas(),
    ]);
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
  min-height: calc(100vh - 80px);
}

.page-header {
  margin-bottom: 1rem;
}

.isolated-header-bar {
  margin-bottom: 1rem;
}

.isolated-title {
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  color: hsl(var(--bc));
}

.isolated-content-panel {
  border-radius: 12px;
}

.header-title h2 {
  margin: 0;
}

.header-title .subtitle {
  font-size: 13px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.main-tabs {
  border-radius: 12px;
}

.trace-tab-pane {
  display: block;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: hsl(var(--bc) / 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
  background: hsl(var(--b2));
  border: 1px solid hsl(var(--b3));
  padding: 4px 10px;
  border-radius: 4px;
}

.table-wrapper {
  position: relative;
  min-height: 380px;
  border: 1px solid hsl(var(--b3));
  border-radius: 8px;
  overflow: hidden;
  background: hsl(var(--b1));
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(var(--b1) / 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
  color: hsl(var(--bc));
  z-index: 10;
}

.pagination-bar {
  display: flex;
}

.mono-font {
  font-family: var(--cyber-font-mono);
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

.badge-item .tree-type-tag {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}

.badge-wa .tree-type-tag {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.badge-device .tree-type-tag {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.badge-so-sm {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.badge-item-sub {
  background: #fffbe6;
  color: #d48806;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid #ffe58f;
  margin-left: 6px;
}

.badge-wa-sm {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 6px;
}

.badge-so-wa-count {
  background: rgba(230, 162, 60, 0.15);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.4);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: all 0.2s ease;
}

.badge-so-wa-count:hover {
  background: rgba(230, 162, 60, 0.25);
  border-color: #e6a23c;
  transform: translateY(-1px);
}

.badge-so-wa-pill {
  background: #fdf6ec;
  color: #d48806;
  border: 1px solid #f5dab1;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-so-wa-pill:hover {
  background: #faecd8;
  border-color: #e6a23c;
  transform: translateY(-1px);
}

.customer-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.customer-email-badge {
  background: hsl(var(--b2));
  color: hsl(var(--bc));
  border: 1px solid hsl(var(--b3));
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--cyber-font-mono);
}

.deveui-code {
  color: #fa8c16;
  font-weight: 600;
}

.quantity-badge {
  background: #f4f4f5;
  color: #606266;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.quantity-badge.so {
  background: #e6f7ff;
  color: #096dd9;
  border: 1px solid #bae7ff;
}

.quantity-badge.item {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}

.quantity-badge.wa {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.progress-cell-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.mini-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.mini-progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #52c41a 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.mini-progress-bar .progress-fill.complete {
  background: #52c41a;
}

.mini-progress-bar .progress-fill.so-fill {
  background: linear-gradient(90deg, #722ed1 0%, #1890ff 100%);
}

.mini-progress-bar .progress-fill.so-fill.complete {
  background: #52c41a;
}

.progress-labels {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.pct-text {
  font-size: 11px;
  font-weight: bold;
  color: hsl(var(--p));
  min-width: 32px;
}

.count-badge.pass {
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #e1f3d8;
}

.count-badge.fail {
  background: #fef0f0;
  color: #f56c6c;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #fde2e2;
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
  font-family: var(--cyber-font-mono);
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
  background: hsl(var(--b2) / 0.3);
  border: 1px solid hsl(var(--b3));
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

:deep(.tabulator-row .tabulator-cell .tabulator-data-tree-control) {
  border-color: hsl(var(--bc) / 0.3) !important;
  background: hsl(var(--b2)) !important;
}

:deep(.tabulator-row .tabulator-cell .tabulator-data-tree-control:hover) {
  background: hsl(var(--b3)) !important;
}

:deep(.tabulator-row .tabulator-cell .tabulator-data-tree-control .tabulator-data-tree-control-collapse:after),
:deep(.tabulator-row .tabulator-cell .tabulator-data-tree-control .tabulator-data-tree-control-expand),
:deep(.tabulator-row .tabulator-cell .tabulator-data-tree-control .tabulator-data-tree-control-expand:after) {
  background: hsl(var(--bc) / 0.8) !important;
}

:deep(.tabulator-header) {
  background-color: hsl(var(--b2)) !important;
  border-bottom: 1px solid hsl(var(--b3)) !important;
  font-weight: 600;
  color: hsl(var(--bc)) !important;
}

:deep(.tabulator-row) {
  border-bottom: 1px solid hsl(var(--b3) / 0.4);
  background-color: transparent !important;
  color: hsl(var(--bc)) !important;
}

:deep(.tabulator-row:hover) {
  background-color: hsl(var(--b2) / 0.6) !important;
  cursor: pointer;
}

:deep(.tabulator-row.tabulator-tree-level-1) {
  background-color: transparent !important;
}

:deep(.tabulator-row.tabulator-tree-level-2) {
  background-color: transparent !important;
}

:deep(.tabulator-row.tabulator-tree-level-3) {
  background-color: transparent !important;
}
</style>
