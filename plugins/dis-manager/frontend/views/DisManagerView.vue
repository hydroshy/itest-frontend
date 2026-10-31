<template>
  <div class="dis-manager-view w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div class="header-title">
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> DIS ODOO HUB
        </div>
        <h2 class="text-xl md:text-2xl font-bold flex items-center gap-2.5 tracking-tight text-white mt-0.5">
          <Share2 class="w-6 h-6 text-primary" />
          <span>DIS (Odoo) Integration Hub</span>
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">
          Giám sát kết nối DIS API Odoo, kiểm thử truy vấn Sandbox và quản lý đồng bộ Sales Order vào iTest.
        </p>
      </div>

      <div class="header-actions flex items-center gap-2 flex-wrap">
        <span
          class="badge badge-sm sm:badge-md gap-1.5 font-mono text-xs font-semibold"
          :class="disStatus.connected ? 'badge-success text-success-content' : 'badge-error text-error-content'"
        >
          <span class="w-2 h-2 rounded-full bg-current"></span>
          {{ disStatus.connected ? 'ONLINE' : 'OFFLINE' }}
        </span>

        <span
          class="badge badge-sm sm:badge-md badge-outline gap-1 font-mono text-xs font-semibold"
          :class="disStatus.isMock ? 'badge-warning' : 'badge-primary'"
        >
          {{ disStatus.isMock ? 'MOCK MODE' : 'LIVE API' }}
        </span>

        <button
          type="button"
          class="btn btn-primary btn-sm gap-2 shadow-sm"
          :disabled="checkingStatus"
          @click="fetchStatus"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': checkingStatus }" />
          Làm mới kết nối
        </button>
      </div>
    </header>

    <!-- Main Tabs -->
    <div role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'diagnostics' }"
        @click="activeTab = 'diagnostics'"
      >
        <Monitor class="w-4 h-4" />
        Chẩn đoán & Cấu hình
      </button>
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        <List class="w-4 h-4" />
        Tra cứu & Đồng bộ SO
      </button>
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'sandbox' }"
        @click="activeTab = 'sandbox'"
      >
        <Terminal class="w-4 h-4" />
        API Sandbox & Truy vấn thử
      </button>
    </div>

    <!-- TAB 1: DIAGNOSTICS -->
    <div v-if="activeTab === 'diagnostics'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Protocol & Host -->
        <div class="card bg-base-200/60 border border-base-content/10 shadow-sm backdrop-blur-md">
          <div class="card-body p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
              <span class="font-bold text-sm flex items-center gap-2 text-cyan-400">
                <Monitor class="w-4 h-4" />
                Trạng thái kết nối
              </span>
              <span class="text-xs font-mono text-base-content/40">[01]</span>
            </div>
            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-base-content/70">Dịch vụ DIS:</span>
                <span
                  class="badge badge-sm font-mono"
                  :class="disStatus.connected ? 'badge-success text-success-content' : 'badge-error text-error-content'"
                >
                  {{ disStatus.connected ? 'Đang hoạt động' : 'Mất kết nối' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-base-content/70">Chế độ vận hành:</span>
                <span
                  class="badge badge-sm font-mono"
                  :class="disStatus.isMock ? 'badge-warning text-warning-content' : 'badge-primary text-primary-content'"
                >
                  {{ disStatus.isMock ? 'Dữ liệu Mock' : 'Live Odoo API' }}
                </span>
              </div>
              <div class="flex flex-col gap-1 pt-1">
                <span class="text-base-content/70">Host đích:</span>
                <code class="bg-base-300/80 px-2 py-1 rounded text-primary font-mono text-xs break-all">
                  {{ disStatus.baseUrl }}
                </code>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Security & Token -->
        <div class="card bg-base-200/60 border border-base-content/10 shadow-sm backdrop-blur-md">
          <div class="card-body p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
              <span class="font-bold text-sm flex items-center gap-2 text-primary">
                <Settings class="w-4 h-4" />
                Bảo mật & Xác thực
              </span>
              <span class="text-xs font-mono text-base-content/40">[02]</span>
            </div>
            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-base-content/70">DIS Token Header:</span>
                <span
                  class="badge badge-sm font-mono"
                  :class="disStatus.tokenConfigured ? 'badge-success text-success-content' : 'badge-ghost'"
                >
                  {{ disStatus.tokenConfigured ? 'Đã thiết lập' : 'Chưa cấu hình' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-base-content/70">Khóa Bearer:</span>
                <code class="bg-base-300/80 px-2 py-0.5 rounded font-mono text-xs text-base-content/80">
                  {{ disStatus.tokenMasked || '••••••••••••' }}
                </code>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-base-content/70">Cơ chế xác thực:</span>
                <span class="font-mono text-cyan-400">Bearer Token Header</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: Operation & Ping -->
        <div class="card bg-base-200/60 border border-base-content/10 shadow-sm backdrop-blur-md">
          <div class="card-body p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
              <span class="font-bold text-sm flex items-center gap-2 text-emerald-400">
                <Crosshair class="w-4 h-4" />
                Thao tác & Kiểm tra
              </span>
              <span class="text-xs font-mono text-base-content/40">[03]</span>
            </div>
            <div class="space-y-2 pt-1">
              <button
                type="button"
                class="btn btn-sm btn-outline btn-primary w-full gap-2 justify-start"
                :disabled="checkingStatus"
                @click="fetchStatus"
              >
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': checkingStatus }" />
                Kiểm tra Ping Odoo Server
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline w-full gap-2 justify-start"
                @click="copyEnvGuide"
              >
                <Check v-if="copiedEnv" class="w-4 h-4 text-success" />
                <Copy v-else class="w-4 h-4" />
                {{ copiedEnv ? 'Đã sao chép cấu hình!' : 'Sao chép biến môi trường mẫu' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dockge Guide Card -->
      <div class="card bg-base-200/50 border border-base-content/10 shadow-sm">
        <div class="card-body p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
            <div class="flex items-center gap-2 text-sm font-bold text-base-content">
              <Terminal class="w-4 h-4 text-primary" />
              <span>Hướng Dẫn Cấu Hình Biến Môi Trường (Dockge / Docker Compose)</span>
            </div>
            <button
              type="button"
              class="btn btn-xs btn-ghost gap-1 text-primary"
              @click="copyEnvGuide"
            >
              <Copy class="w-3.5 h-3.5" />
              Sao chép
            </button>
          </div>
          <p class="text-xs text-base-content/70 leading-relaxed">
            Để kết nối với máy chủ Odoo API thật hoặc chuyển sang Mock Mode, hãy cấu hình các biến môi trường sau trong stack <code class="font-mono text-primary">iTest Backend</code> trên Dockge hoặc file <code class="font-mono text-primary">.env</code>:
          </p>
          <pre class="bg-base-300/80 p-4 rounded-lg font-mono text-xs text-base-content overflow-x-auto border border-base-content/10"><code># Cấu hình kết nối DIS API Odoo trong Dockge:
DIS_SO_BASE_URL=https://dis-so.daviteq.com
DIS_SO_TOKEN=your_dis_api_token_here
DIS_MOCK_MODE=false</code></pre>
        </div>
      </div>
    </div>

    <!-- TAB 2: ORDERS & SYNC -->
    <div v-else-if="activeTab === 'orders'" class="space-y-4">
      <!-- Filter Toolbar -->
      <div class="card bg-base-200/60 border border-base-content/10 p-4 shadow-sm backdrop-blur-md">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          <div class="form-control md:col-span-2">
            <label class="label py-1"><span class="label-text text-xs font-medium">Năm</span></label>
            <input
              v-model.number="filterYear"
              type="number"
              placeholder="Năm (tất cả)"
              class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
              @keyup.enter="searchOrders"
            />
          </div>

          <div class="form-control md:col-span-2">
            <label class="label py-1"><span class="label-text text-xs font-medium">Tháng</span></label>
            <select v-model.number="filterMonth" class="select select-sm select-bordered bg-base-100 text-xs w-full" @change="searchOrders">
              <option :value="undefined">Tất cả tháng</option>
              <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
            </select>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label py-1"><span class="label-text text-xs font-medium">Trạng thái</span></label>
            <select v-model="filterState" class="select select-sm select-bordered bg-base-100 text-xs w-full" @change="searchOrders">
              <option value="">Tất cả trạng thái</option>
              <option value="sale">Sale Order</option>
              <option value="done">Done</option>
              <option value="draft">Quotation</option>
              <option value="cancel">Cancelled</option>
            </select>
          </div>

          <div class="form-control md:col-span-4">
            <label class="label py-1"><span class="label-text text-xs font-medium">Từ khóa tìm kiếm</span></label>
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
              <input
                v-model="filterQuery"
                type="text"
                placeholder="Tìm mã SO, khách hàng..."
                class="input input-sm input-bordered bg-base-100 pl-9 text-xs w-full"
                @keyup.enter="searchOrders"
              />
            </div>
          </div>

          <div class="md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              class="btn btn-primary btn-sm flex-1 gap-1.5"
              :disabled="loadingOrders"
              @click="searchOrders"
            >
              <Search class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingOrders }" />
              Tìm Kiếm
            </button>
          </div>
        </div>
      </div>

      <!-- Content Split Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <!-- Left Column: Table SO -->
        <div class="lg:col-span-7 card bg-base-200/50 border border-base-content/10 shadow-sm overflow-hidden">
          <div class="p-3 border-b border-base-content/10 flex items-center justify-between text-xs font-semibold text-base-content">
            <div class="flex items-center gap-2">
              <List class="w-4 h-4 text-primary" />
              <span>Danh Sách Sales Order ({{ orderList.length }})</span>
            </div>
            <span class="text-base-content/50 font-normal">Nhấp vào dòng để xem chi tiết</span>
          </div>

          <div class="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table class="table table-zebra table-sm w-full">
              <thead class="bg-base-300/60 font-mono text-xs uppercase text-base-content/70 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th class="w-16 text-center">ID Odoo</th>
                  <th>Mã Đơn (SO)</th>
                  <th>Khách Hàng</th>
                  <th>Ngày Đặt</th>
                  <th class="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingOrders && orderList.length === 0">
                  <td colspan="5" class="text-center py-8 text-base-content/50">
                    <span class="loading loading-spinner loading-md text-primary mr-2"></span> Đang tải đơn hàng...
                  </td>
                </tr>
                <tr v-else-if="orderList.length === 0">
                  <td colspan="5" class="text-center py-8 text-base-content/40 font-mono text-sm">
                    Không tìm thấy đơn hàng nào phù hợp
                  </td>
                </tr>
                <tr
                  v-for="row in orderList"
                  :key="row.odoo_id || row.id"
                  class="cursor-pointer transition-colors hover:bg-base-300/40"
                  :class="{ 'bg-primary/10 border-l-4 border-l-primary': selectedOrder && (selectedOrder.odoo_id === row.odoo_id || selectedOrder.id === row.id) }"
                  @click="selectOrder(row)"
                >
                  <td class="text-center font-mono text-xs text-base-content/60">{{ row.odoo_id || row.id }}</td>
                  <td>
                    <div class="font-mono text-xs font-bold text-primary">{{ row.name }}</div>
                  </td>
                  <td>
                    <div class="text-xs font-medium text-base-content truncate max-w-[180px]">{{ row.partner_name || '—' }}</div>
                    <div class="text-[11px] text-base-content/50 truncate max-w-[180px]">{{ row.partner_email || row.partnerEmail || '' }}</div>
                  </td>
                  <td class="font-mono text-xs text-base-content/60">{{ formatDate(row.date_order) }}</td>
                  <td class="text-center">
                    <span class="badge badge-xs font-mono py-2" :class="getStateBadgeClass(row.state)">
                      {{ row.state || 'N/A' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column: Detail Panel -->
        <div class="lg:col-span-5 card bg-base-200/50 border border-base-content/10 shadow-sm">
          <div v-if="!selectedOrder" class="card-body p-8 text-center text-base-content/40 space-y-2">
            <FileText class="w-12 h-12 mx-auto opacity-30 text-primary" />
            <div class="text-sm font-medium">Chưa chọn đơn hàng</div>
            <div class="text-xs text-base-content/50">Vui lòng chọn một Sales Order ở bảng bên trái để xem chi tiết sản phẩm và Work Authorization.</div>
          </div>

          <div v-else class="card-body p-5 space-y-4">
            <!-- Order Header Info -->
            <div class="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold font-mono text-primary">{{ selectedOrder.name }}</span>
                  <span class="badge badge-sm font-mono" :class="getStateBadgeClass(selectedOrder.state)">
                    {{ selectedOrder.state }}
                  </span>
                </div>
                <div class="text-xs text-base-content/70 mt-1 font-medium">
                  {{ selectedOrder.partner_name || 'Khách hàng ẩn danh' }}
                </div>
                <div v-if="selectedOrder.partner_email || selectedOrder.partnerEmail" class="text-[11px] text-base-content/50 font-mono">
                  {{ selectedOrder.partner_email || selectedOrder.partnerEmail }}
                </div>
              </div>

              <button
                type="button"
                class="btn btn-primary btn-sm gap-2"
                :disabled="syncingOrder"
                @click="syncCurrentOrder"
              >
                <Download class="w-4 h-4" :class="{ 'animate-spin': syncingOrder }" />
                Đồng bộ vào iTest
              </button>
            </div>

            <!-- Detail Sub-Tabs -->
            <div class="tabs tabs-boxed bg-base-300/60 p-1 rounded-lg w-fit">
              <button
                type="button"
                class="tab tab-xs text-xs font-medium gap-1"
                :class="{ 'tab-active': orderDetailTab === 'lines' }"
                @click="orderDetailTab = 'lines'"
              >
                Mặt hàng / Lines ({{ orderLineList.length }})
              </button>
              <button
                type="button"
                class="tab tab-xs text-xs font-medium gap-1"
                :class="{ 'tab-active': orderDetailTab === 'wa' }"
                @click="orderDetailTab = 'wa'"
              >
                Work Authorization ({{ orderWaList.length }})
              </button>
            </div>

            <!-- Lines Tab Table -->
            <div v-if="orderDetailTab === 'lines'" class="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table class="table table-zebra table-xs w-full">
                <thead class="bg-base-300/70 font-mono text-[11px] text-base-content/70 sticky top-0">
                  <tr>
                    <th>ITEM-CODE</th>
                    <th>Tên Mặt Hàng</th>
                    <th class="text-right">SL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingLines">
                    <td colspan="3" class="text-center py-6 text-base-content/50">
                      <span class="loading loading-spinner loading-sm text-primary mr-2"></span> Đang tải mặt hàng...
                    </td>
                  </tr>
                  <tr v-else-if="orderLineList.length === 0">
                    <td colspan="3" class="text-center py-6 text-base-content/40 font-mono">
                      Không có mặt hàng nào
                    </td>
                  </tr>
                  <tr v-for="line in orderLineList" :key="line.id">
                    <td class="font-mono font-bold text-xs text-cyan-400">
                      {{ line.default_code || line.sku || line.product_code || '—' }}
                    </td>
                    <td class="text-xs">
                      {{ line.product_name || line.name || '—' }}
                    </td>
                    <td class="text-right font-mono font-bold text-xs text-primary">
                      {{ line.quantity != null ? line.quantity : (line.product_uom_qty || 0) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- WA Tab Table -->
            <div v-else class="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table class="table table-zebra table-xs w-full">
                <thead class="bg-base-300/70 font-mono text-[11px] text-base-content/70 sticky top-0">
                  <tr>
                    <th>Mã WA</th>
                    <th>Trạng Thái</th>
                    <th>Mặt Hàng / Lines</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="orderWaList.length === 0">
                    <td colspan="3" class="text-center py-6 text-base-content/40 font-mono">
                      Chưa có Work Authorization nào được cấp cho đơn này
                    </td>
                  </tr>
                  <tr v-for="wa in orderWaList" :key="wa.wa_code || wa.id">
                    <td class="font-mono font-bold text-xs text-primary">
                      {{ wa.wa_code || wa.name || wa.code || '—' }}
                    </td>
                    <td>
                      <span class="badge badge-ghost badge-xs font-mono">
                        {{ wa.warranty_status || wa.state || 'active' }}
                      </span>
                    </td>
                    <td class="text-xs text-base-content/70">
                      {{ wa.item_summary || (wa.lines ? wa.lines.length + ' mặt hàng' : '—') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: SANDBOX -->
    <div v-else-if="activeTab === 'sandbox'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <!-- Controls Form -->
        <div class="lg:col-span-5 card bg-base-200/60 border border-base-content/10 shadow-sm p-5 space-y-4">
          <div class="flex items-center gap-2 text-sm font-bold text-base-content border-b border-base-content/10 pb-3">
            <Terminal class="w-4 h-4 text-primary" />
            <span>Tham Số Truy Vấn API Sandbox</span>
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-medium">Endpoint thao tác kiểm thử:</span></label>
            <select v-model="sandboxAction" class="select select-sm select-bordered bg-base-100 text-xs w-full" @change="onSandboxActionChange">
              <option value="health">GET /api/v1/health (Kiểm tra Server DIS)</option>
              <option value="search">GET /api/v1/so/search (Tìm kiếm Sales Orders)</option>
              <option value="detail">GET /api/v1/so/{id} (Chi tiết đơn hàng)</option>
            </select>
          </div>

          <div v-if="sandboxAction === 'search'" class="space-y-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-medium">Năm lọc:</span></label>
              <input v-model.number="sandboxParams.year" type="number" class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full" />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-medium">Tháng lọc:</span></label>
              <select v-model.number="sandboxParams.month" class="select select-sm select-bordered bg-base-100 text-xs w-full">
                <option :value="undefined">Tất cả tháng</option>
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-medium">Từ khóa tìm kiếm:</span></label>
              <input v-model="sandboxParams.q" type="text" placeholder="SO2026..." class="input input-sm input-bordered bg-base-100 text-xs w-full" />
            </div>
          </div>

          <div v-if="sandboxAction === 'detail'" class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-medium">Odoo SO ID hoặc Số ID đơn:</span></label>
            <input v-model="sandboxParams.soId" type="text" placeholder="1001" class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full" />
          </div>

          <button
            type="button"
            class="btn btn-primary btn-sm w-full gap-2 mt-4"
            :disabled="executingSandbox"
            @click="executeSandboxQuery"
          >
            <Send class="w-4 h-4" :class="{ 'animate-pulse': executingSandbox }" />
            Gửi Request Kiểm Thử
          </button>
        </div>

        <!-- JSON Output Panel -->
        <div class="lg:col-span-7 card bg-base-200/50 border border-base-content/10 shadow-sm overflow-hidden">
          <div class="p-3 border-b border-base-content/10 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 font-mono font-bold text-cyan-400">
              <Cpu class="w-4 h-4" />
              <span>RAW JSON TELEMETRY RESPONSE</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="sandboxResponseStatus"
                class="badge badge-sm font-mono"
                :class="sandboxResponseStatus === 200 ? 'badge-success text-success-content' : 'badge-error text-error-content'"
              >
                HTTP {{ sandboxResponseStatus }}
              </span>
              <span
                v-if="sandboxLatency !== null"
                class="badge badge-sm badge-outline font-mono"
                :class="{
                  'badge-success text-success': sandboxLatency < 100,
                  'badge-warning text-warning': sandboxLatency >= 100 && sandboxLatency < 500,
                  'badge-error text-error': sandboxLatency >= 500,
                }"
              >
                {{ sandboxLatency }} ms
              </span>
            </div>
          </div>

          <div class="p-4 bg-base-300/80 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre class="text-base-content"><code>{{ sandboxRawResponse || '// Kết quả JSON sẽ xuất hiện tại đây sau khi gửi request...' }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  Share2,
  Monitor,
  Settings,
  Crosshair,
  Search,
  Download,
  List,
  FileText,
  Cpu,
  Send,
  RefreshCw,
  Copy,
  Check,
  Terminal,
} from 'lucide-vue-next';
import { cyberToast } from '@/cyber/hud';

// Active Tab
const activeTab = ref<'diagnostics' | 'orders' | 'sandbox'>('diagnostics');
const checkingStatus = ref(false);
const copiedEnv = ref(false);

// DIS Status
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

// Order detail & lines & WA
const selectedOrder = ref<any>(null);
const orderDetailTab = ref<'lines' | 'wa'>('lines');
const orderLineList = ref<any[]>([]);
const orderWaList = ref<any[]>([]);
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

// Helpers
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

const getStateBadgeClass = (state: string) => {
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
    cyberToast.success('Đã sao chép cấu hình mẫu Dockge vào clipboard!');
    setTimeout(() => {
      copiedEnv.value = false;
    }, 2500);
  } catch (err: any) {
    cyberToast.error('Không thể tự động sao chép: ' + err.message);
  }
};

// Methods
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
        : (typeof disObj.enabled === 'boolean' ? disObj.enabled : true);
      disStatus.isMock = typeof data.isMock === 'boolean'
        ? data.isMock
        : (typeof disObj.mockMode === 'boolean' ? disObj.mockMode : false);
      disStatus.baseUrl = data.baseUrl || disObj.baseUrl || 'https://dis-so.daviteq.com';
      disStatus.tokenConfigured = typeof data.tokenConfigured === 'boolean'
        ? data.tokenConfigured
        : (typeof disObj.tokenConfigured === 'boolean' ? disObj.tokenConfigured : true);
      disStatus.tokenMasked = data.tokenMasked || disObj.tokenMasked || '';
      disStatus.latency = data.latency ?? null;
      cyberToast.success('Đã cập nhật trạng thái kết nối DIS!');
    } else {
      disStatus.connected = false;
      cyberToast.warning('Không thể kết nối đến DIS API Endpoint.');
    }
  } catch (err) {
    console.error('Lỗi khi fetchStatus:', err);
    disStatus.connected = false;
    cyberToast.error('Lỗi kết nối kiểm tra trạng thái.');
  } finally {
    checkingStatus.value = false;
  }
};

const searchOrders = async () => {
  loadingOrders.value = true;
  selectedOrder.value = null;
  orderLineList.value = [];
  orderWaList.value = [];

  try {
    const params = new URLSearchParams();
    if (filterYear.value) params.append('year', String(filterYear.value));
    if (filterMonth.value) params.append('month', String(filterMonth.value));
    if (filterState.value) params.append('state', filterState.value);
    if (filterQuery.value) params.append('q', filterQuery.value.trim());

    let res = await fetch(`/api/plugins/dis-manager/orders?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/search?${params.toString()}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/search?${params.toString()}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/search?${params.toString()}`, { headers: getAuthHeaders() });
    }

    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.orders || data.items || []);
      orderList.value = rawList.map((item: any) => ({
        ...item,
        partner_email:
          item.partner_email ||
          item.partnerEmail ||
          item.customer_email ||
          item.customerEmail ||
          item.email ||
          item.customer?.email ||
          item.partner?.email ||
          item.partner_id?.email ||
          '',
      }));
    } else {
      orderList.value = [];
      cyberToast.warning('Không tải được danh sách Sales Orders.');
    }
  } catch (err) {
    console.error('Lỗi khi searchOrders:', err);
    orderList.value = [];
    cyberToast.error('Lỗi kết nối khi tải danh sách đơn hàng.');
  } finally {
    loadingOrders.value = false;
  }
};

const selectOrder = async (row: any) => {
  selectedOrder.value = row;
  orderDetailTab.value = 'lines';
  orderLineList.value = [];
  orderWaList.value = [];
  loadingLines.value = true;

  const odooId = row.odoo_id || row.id;
  try {
    let res = await fetch(`/api/plugins/dis-manager/orders/${odooId}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/${odooId}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/${odooId}`, { headers: getAuthHeaders() });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/so/${odooId}`, { headers: getAuthHeaders() });
    }

    if (res.ok) {
      const detail = await res.json();
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
      selectedOrder.value = {
        ...row,
        ...detail,
        partner_email: email || selectedOrder.value?.partner_email || '',
        partnerEmail: email || selectedOrder.value?.partnerEmail || '',
      };
      const rawLines = detail.lines || detail.items || detail.order_line || [];
      const linesArray = Array.isArray(rawLines) ? rawLines : [];
      const rawWas = detail.wa || detail.work_authorizations || detail.workAuthorizations || [];
      orderWaList.value = Array.isArray(rawWas) ? rawWas : [];
      orderLineList.value = linesArray
        .filter((l: any) => {
          const code = String(l.default_code || l.ordering_code || l.sku || l.product?.default_code || '').trim().toUpperCase();
          return code && code !== 'N/A';
        })
        .map((l: any, idx: number) => {
          const itemCode = l.default_code || l.ordering_code || l.sku || l.product?.default_code || '';
          return {
            ...l,
            id: l.id ?? idx + 1,
            default_code: itemCode,
            ordering_code: itemCode,
            sku: itemCode,
            product_name: l.product_name || l.description || l.name || l.product?.name || '',
            quantity: l.product_uom_qty ?? l.quantity ?? 1,
            qty_delivered: l.qty_delivered ?? l.delivered_quantity ?? 0,
            qty_invoiced: l.qty_invoiced ?? l.invoiced_quantity ?? 0,
          };
        });
    } else {
      orderLineList.value = [];
      orderWaList.value = [];
    }
  } catch (err) {
    console.error('Lỗi lấy chi tiết đơn hàng:', err);
    orderLineList.value = [];
    orderWaList.value = [];
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
      res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ autoCreateWa: true }),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/plugins/device-traceability/dis/so/${odooId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ autoCreateWa: true }),
      });
    }
    if (!res.ok) {
      res = await fetch(`/api/dis/sales-orders/${odooId}/sync`, {
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
      cyberToast.success(result.message || `Đã đồng bộ đơn hàng ${selectedOrder.value.name} thành công!`);
    } else {
      const err = await res.json().catch(() => ({}));
      cyberToast.error(err.message || 'Lỗi khi đồng bộ đơn hàng.');
    }
  } catch (err) {
    console.error('Lỗi khi syncCurrentOrder:', err);
    cyberToast.error('Lỗi kết nối khi đồng bộ.');
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

    if (!res.ok && res.status === 404) {
      if (sandboxAction.value === 'health') {
        res = await fetch('/api/plugins/device-traceability/dis/status', { headers: getAuthHeaders() });
      } else if (sandboxAction.value === 'search') {
        const params = new URLSearchParams();
        if (sandboxParams.year) params.append('year', String(sandboxParams.year));
        if (sandboxParams.month) params.append('month', String(sandboxParams.month));
        if (sandboxParams.q) params.append('q', sandboxParams.q.trim());
        res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/search?${params.toString()}`, { headers: getAuthHeaders() });
        if (!res.ok) {
          res = await fetch(`/api/plugins/device-traceability/dis/so/search?${params.toString()}`, { headers: getAuthHeaders() });
        }
      } else if (sandboxAction.value === 'detail') {
        res = await fetch(`/api/plugins/device-traceability/dis/sales-orders/${sandboxParams.soId}`, { headers: getAuthHeaders() });
        if (!res.ok) {
          res = await fetch(`/api/plugins/device-traceability/dis/so/${sandboxParams.soId}`, { headers: getAuthHeaders() });
        }
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
