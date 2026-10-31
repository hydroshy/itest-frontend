<template>
  <div class="decoder-view w-full max-w-[1720px] mx-auto p-4 md:p-6 space-y-4">
    <!-- Header -->
    <header class="page-header flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 bg-base-200/60 border border-base-300 rounded-xl backdrop-blur-md shadow-sm mb-4">
      <div class="header-title">
        <div class="eyebrow flex items-center gap-2 text-xs font-mono text-primary font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse" /> DECODER ENGINE
        </div>
        <h2 class="text-xl md:text-2xl font-bold flex items-center gap-2.5 tracking-tight text-white mt-0.5">
          <Cpu class="w-6 h-6 text-primary" />
          <span>Bộ Giải Mã LoRaWAN (Payload Decoder)</span>
        </h2>
        <p class="subtitle text-xs text-base-content/70 mt-1">
          Quản lý script JS giải mã payload chuẩn LoRaWAN, nhận diện tự động theo SKU &amp; LONG_FW từ MemMap.
        </p>
      </div>

      <div class="header-actions flex items-center gap-2 flex-wrap">
        <button
          type="button"
          class="btn btn-primary btn-sm gap-2 shadow-sm"
          @click="openCreateDialog"
        >
          <Plus class="w-4 h-4" />
          Tạo Decoder Mới
        </button>

        <button
          type="button"
          class="btn btn-outline btn-sm gap-2"
          :disabled="loading"
          @click="refreshData"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Làm Mới
        </button>
      </div>
    </header>

    <!-- Main Tabs -->
    <div role="tablist" class="tabs tabs-boxed bg-base-200/60 p-1 mb-4 border border-base-300 rounded-xl flex flex-wrap gap-1">
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'list' }"
        @click="activeTab = 'list'"
      >
        <List class="w-4 h-4" />
        Danh Sách Bộ Giải Mã
      </button>
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'memmap' }"
        @click="activeTab = 'memmap'"
      >
        <Link2 class="w-4 h-4" />
        Khớp Nối Với MemMap
      </button>
      <button
        role="tab"
        type="button"
        class="tab font-semibold transition-all flex items-center gap-2 rounded-lg"
        :class="{ 'tab-active !bg-primary !text-primary-content shadow-sm': activeTab === 'sandbox' }"
        @click="activeTab = 'sandbox'"
      >
        <Terminal class="w-4 h-4" />
        Sandbox Thử Nghiệm Decode
      </button>
    </div>

    <!-- TAB 1: Danh Sách Decoder Scripts -->
    <div v-if="activeTab === 'list'" class="space-y-4">
      <!-- Filter Bar -->
      <div class="card bg-base-200/60 border border-base-content/10 p-4 shadow-sm backdrop-blur-md">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          <div class="form-control md:col-span-5">
            <label class="label py-1"><span class="label-text text-xs font-medium">Tìm kiếm</span></label>
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Tìm theo Tên, SKU, LONG_FW..."
                class="input input-sm input-bordered bg-base-100 pl-9 text-xs w-full"
                @keyup.enter="loadScripts"
              />
            </div>
          </div>

          <div class="form-control md:col-span-3">
            <label class="label py-1"><span class="label-text text-xs font-medium">SKU</span></label>
            <select v-model="filters.sku" class="select select-sm select-bordered bg-base-100 text-xs w-full" @change="loadScripts">
              <option value="">Tất cả SKU</option>
              <option v-for="sku in uniqueSkus" :key="sku" :value="sku">{{ sku }}</option>
            </select>
          </div>

          <div class="form-control md:col-span-2">
            <label class="label py-1"><span class="label-text text-xs font-medium">Trạng thái</span></label>
            <select v-model="filters.isActive" class="select select-sm select-bordered bg-base-100 text-xs w-full" @change="loadScripts">
              <option value="">Tất cả</option>
              <option value="true">Đang kích hoạt</option>
              <option value="false">Tạm ngưng</option>
            </select>
          </div>

          <div class="md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              class="btn btn-primary btn-sm flex-1 gap-1.5"
              :disabled="loading"
              @click="loadScripts"
            >
              <Search class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
              Lọc
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm gap-1"
              @click="resetFilters"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card bg-base-200/50 border border-base-content/10 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm w-full">
            <thead class="bg-base-300/60 font-mono text-xs uppercase text-base-content/70">
              <tr>
                <th class="w-16 text-center">ID</th>
                <th>Tên &amp; Mô Tả Bộ Giải Mã</th>
                <th>SKU &amp; LONG_FW</th>
                <th>Code Preview / Version</th>
                <th class="text-center w-28">Trạng Thái</th>
                <th class="text-right w-44">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && scriptList.length === 0">
                <td colspan="6" class="text-center py-8 text-base-content/50">
                  <span class="loading loading-spinner loading-md text-primary mr-2"></span> Đang tải bộ giải mã...
                </td>
              </tr>
              <tr v-else-if="scriptList.length === 0">
                <td colspan="6" class="text-center py-8 text-base-content/40 font-mono text-sm">
                  Chưa có script giải mã nào. Hãy nhấn "Tạo Decoder Mới"!
                </td>
              </tr>
              <tr v-for="row in scriptList" :key="row.id" class="hover:bg-base-300/30 transition-colors">
                <td class="text-center font-mono text-xs text-base-content/60">{{ row.id }}</td>
                <td>
                  <div class="font-bold text-sm text-base-content flex items-center gap-2">
                    <span>{{ row.name }}</span>
                    <span v-if="row.version" class="badge badge-outline badge-xs font-mono">v{{ row.version }}</span>
                  </div>
                  <div class="text-xs text-base-content/60 mt-0.5 line-clamp-1">{{ row.description || 'Chưa có mô tả' }}</div>
                </td>
                <td>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="badge badge-primary badge-sm font-mono font-semibold">{{ row.sku }}</span>
                    <span class="badge badge-ghost badge-sm font-mono text-base-content/70">{{ row.longFw || 'Mặc định' }}</span>
                  </div>
                </td>
                <td>
                  <code class="bg-base-300/80 px-2 py-1 rounded text-xs font-mono text-cyan-400 block max-w-xs truncate">
                    {{ (row.script || '').substring(0, 45) }}...
                  </code>
                </td>
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-sm"
                    :checked="row.isActive"
                    @change="row.isActive = !row.isActive; toggleScriptStatus(row)"
                  />
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost gap-1 text-primary"
                      title="Chạy thử nghiệm"
                      @click="testInSandbox(row)"
                    >
                      <Play class="w-3.5 h-3.5" />
                      Test
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost gap-1 text-info"
                      title="Chỉnh sửa"
                      @click="openEditDialog(row)"
                    >
                      <Edit class="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost gap-1 text-error"
                      title="Xóa bộ giải mã"
                      @click="confirmDelete(row)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Khớp Nối Với MemMap -->
    <div v-else-if="activeTab === 'memmap'" class="space-y-4">
      <div class="card bg-base-200/60 border border-base-content/10 p-4 shadow-sm backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
            <input
              v-model="memmapSearch"
              type="text"
              placeholder="Tìm theo SKU, Model, LONG_FW..."
              class="input input-sm input-bordered bg-base-100 pl-9 text-xs w-full"
            />
          </div>
          <span class="text-xs text-base-content/60 font-mono">
            Tổng cộng: {{ filteredMemmaps.length }} profile thiết bị
          </span>
        </div>
      </div>

      <div class="card bg-base-200/50 border border-base-content/10 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm w-full">
            <thead class="bg-base-300/60 font-mono text-xs uppercase text-base-content/70">
              <tr>
                <th class="w-20 text-center">Profile ID</th>
                <th>Tên Thiết Bị / Profile</th>
                <th>Mã SKU</th>
                <th>Phiên Bản LONG_FW</th>
                <th class="text-center w-36">Trạng Thái Decoder</th>
                <th class="text-right w-36">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingMemmaps && memmapList.length === 0">
                <td colspan="6" class="text-center py-8 text-base-content/50">
                  <span class="loading loading-spinner loading-md text-primary mr-2"></span> Đang tải dữ liệu MemMap...
                </td>
              </tr>
              <tr v-else-if="filteredMemmaps.length === 0">
                <td colspan="6" class="text-center py-8 text-base-content/40 font-mono text-sm">
                  Không tìm thấy cấu hình MemMap phù hợp
                </td>
              </tr>
              <tr v-for="row in filteredMemmaps" :key="row.id || row.profileId" class="hover:bg-base-300/30 transition-colors">
                <td class="text-center font-mono text-xs text-base-content/60">{{ row.id || row.profileId || '—' }}</td>
                <td>
                  <div class="font-bold text-xs text-base-content">{{ row.modelName || row.name || 'Thiết bị chưa đặt tên' }}</div>
                  <div class="text-[11px] text-base-content/50 font-mono">{{ row.description || '' }}</div>
                </td>
                <td>
                  <span class="badge badge-primary badge-sm font-mono font-bold">{{ row.sku }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-sm font-mono">{{ row.longFw || row.firmwareVersion || 'Tất cả' }}</span>
                </td>
                <td class="text-center">
                  <span
                    class="badge badge-sm font-mono gap-1"
                    :class="row.hasDecoder ? 'badge-success text-success-content' : 'badge-warning text-warning-content'"
                  >
                    <Check v-if="row.hasDecoder" class="w-3 h-3" />
                    <AlertCircle v-else class="w-3 h-3" />
                    {{ row.hasDecoder ? 'Đã có Decoder' : 'Chưa có Decoder' }}
                  </span>
                </td>
                <td class="text-right">
                  <button
                    v-if="!row.hasDecoder"
                    type="button"
                    class="btn btn-xs btn-outline btn-primary gap-1"
                    @click="assignDecoderFromMemmap(row)"
                  >
                    <Plus class="w-3 h-3" />
                    Gán Decoder
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn btn-xs btn-ghost text-success gap-1 font-semibold"
                    @click="goToDecoderOfMemmap(row)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    Xem Decoder
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: Interactive Sandbox (Test Trực Tiếp) -->
    <div v-else-if="activeTab === 'sandbox'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <!-- Cột cấu hình / Script -->
        <div class="lg:col-span-6 card bg-base-200/60 border border-base-content/10 shadow-sm p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
            <span class="font-bold text-sm flex items-center gap-2 text-base-content">
              <FileCode class="w-4 h-4 text-primary" />
              LoRaWAN JavaScript Script
            </span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="btn btn-xs btn-outline"
                @click="loadSampleScript('chirpstack_v4')"
              >
                Mẫu ChirpStack v4
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline"
                @click="loadSampleScript('ttn_v3')"
              >
                Mẫu TTN v3
              </button>
            </div>
          </div>

          <!-- Script Textarea -->
          <div class="form-control">
            <textarea
              v-model="sandboxForm.script"
              rows="12"
              class="textarea textarea-bordered bg-base-300 font-mono text-xs text-base-content leading-relaxed w-full focus:outline-none"
              placeholder="// Nhập hàm decodeUplink(input)..."
            ></textarea>
          </div>

          <!-- Payload & Port Form -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="form-control sm:col-span-2">
              <label class="label py-1"><span class="label-text text-xs font-medium">HEX Payload mẫu:</span></label>
              <input
                v-model="sandboxForm.payload"
                type="text"
                placeholder="09C4138805..."
                class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-medium">fPort:</span></label>
              <input
                v-model.number="sandboxForm.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
              />
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-sm w-full gap-2 mt-2"
            :disabled="runningTest"
            @click="runSandboxDecode"
          >
            <Play class="w-4 h-4" :class="{ 'animate-pulse': runningTest }" />
            Giải Mã Ngay (Execute Sandbox)
          </button>
        </div>

        <!-- Cột kết quả -->
        <div class="lg:col-span-6 card bg-base-200/50 border border-base-content/10 shadow-sm overflow-hidden">
          <div class="p-3 border-b border-base-content/10 flex items-center justify-between text-xs font-semibold text-base-content">
            <div class="flex items-center gap-2 font-mono text-cyan-400">
              <Cpu class="w-4 h-4" />
              <span>KẾT QUẢ GIẢI MÃ (TELEMETRY JSON)</span>
            </div>
            <span v-if="testResult" class="badge badge-success badge-sm font-mono text-success-content">
              SUCCESS
            </span>
            <span v-else-if="testError" class="badge badge-error badge-sm font-mono text-error-content">
              ERROR
            </span>
          </div>

          <!-- Error Alert -->
          <div v-if="testError" class="p-4 bg-error/10 border-b border-error/20 flex items-start gap-3 text-xs text-error">
            <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div class="font-mono">{{ testError }}</div>
          </div>

          <!-- Result Container -->
          <div class="p-4 bg-base-300/80 font-mono text-xs overflow-x-auto min-h-[380px] max-h-[500px] overflow-y-auto">
            <pre class="text-base-content"><code>{{ testResult ? JSON.stringify(testResult, null, 2) : '// Nhấn "Giải Mã Ngay" để xem kết quả phân tích JSON tại đây...' }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOG / MODAL: Thêm / Sửa Decoder Script -->
    <dialog class="modal" :class="{ 'modal-open': editorDialogVisible }">
      <div class="modal-box max-w-4xl bg-base-100 border border-base-content/15 shadow-2xl p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-lg font-bold text-base-content">
            <Cpu class="w-5 h-5 text-primary" />
            <span>{{ isEditing ? 'Chỉnh Sửa Bộ Giải Mã' : 'Tạo Bộ Giải Mã LoRaWAN Mới' }}</span>
          </div>
          <button type="button" class="btn btn-sm btn-ghost btn-circle" @click="editorDialogVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Tên -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-semibold">Tên bộ giải mã <span class="text-error">*</span></span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="VD: WS433-CL - LoRaWAN Soil Moisture Decoder"
              class="input input-sm input-bordered bg-base-100 text-xs w-full"
              required
            />
          </div>

          <!-- SKU & LONG_FW Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">SKU Thiết Bị <span class="text-error">*</span></span></label>
              <input
                v-model="form.sku"
                type="text"
                list="sku-datalist"
                placeholder="Chọn hoặc nhập SKU..."
                class="input input-sm input-bordered bg-base-100 text-xs font-mono w-full"
                required
                @input="handleFormSkuChange"
              />
              <datalist id="sku-datalist">
                <option v-for="sku in memmapSkuOptions" :key="sku" :value="sku" />
              </datalist>
            </div>

            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">LONG_FW <span class="text-error">*</span></span></label>
              <input
                v-model="form.longFw"
                type="text"
                list="longfw-datalist"
                placeholder="Chọn hoặc nhập LONG_FW..."
                class="input input-sm input-bordered bg-base-100 text-xs font-mono w-full"
                required
              />
              <datalist id="longfw-datalist">
                <option v-for="fw in availableFwOptions" :key="fw" :value="fw" />
              </datalist>
            </div>
          </div>

          <!-- Mô tả -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text text-xs font-medium">Mô tả</span></label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Ghi chú về định dạng gói tin hoặc thiết bị..."
              class="textarea textarea-bordered bg-base-100 text-xs w-full"
            ></textarea>
          </div>

          <!-- Script JS Header & Actions -->
          <div class="flex items-center justify-between border-t border-base-content/10 pt-3">
            <span class="font-bold text-xs text-base-content">Nội Dung Script JavaScript: <span class="text-error">*</span></span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn btn-xs btn-ghost text-primary"
                @click="fillFormSampleScript('chirpstack_v4')"
              >
                Template ChirpStack v4
              </button>
              <label class="btn btn-xs btn-outline gap-1 cursor-pointer">
                <Upload class="w-3.5 h-3.5" />
                <span>Upload .js</span>
                <input type="file" class="hidden" accept=".js,.txt" @change="handleFileUpload" />
              </label>
            </div>
          </div>

          <!-- Code Editor -->
          <div class="form-control">
            <textarea
              v-model="form.script"
              rows="10"
              class="textarea textarea-bordered bg-base-300 font-mono text-xs text-base-content leading-relaxed w-full"
              placeholder="// Nhập code JavaScript decode..."
              required
            ></textarea>
          </div>

          <!-- Sample Payload & Port -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div class="form-control sm:col-span-7">
              <label class="label py-1"><span class="label-text text-xs font-medium">Payload HEX Thử Nghiệm:</span></label>
              <input
                v-model="form.samplePayload"
                type="text"
                placeholder="09C4138805..."
                class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
              />
            </div>
            <div class="form-control sm:col-span-2">
              <label class="label py-1"><span class="label-text text-xs font-medium">fPort:</span></label>
              <input
                v-model.number="form.sampleFport"
                type="number"
                min="1"
                max="223"
                class="input input-sm input-bordered bg-base-100 font-mono text-xs w-full"
              />
            </div>
            <div class="sm:col-span-3">
              <button
                type="button"
                class="btn btn-sm btn-outline btn-info w-full gap-1.5"
                :disabled="testingFormScript"
                @click="testCurrentFormScript"
              >
                <Play class="w-3.5 h-3.5" :class="{ 'animate-pulse': testingFormScript }" />
                Chạy Thử Ngay
              </button>
            </div>
          </div>

          <!-- Toggle Kích hoạt -->
          <div class="flex items-center gap-3 pt-2">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="toggle toggle-primary toggle-sm"
              id="script-active-toggle"
            />
            <label for="script-active-toggle" class="text-xs font-semibold cursor-pointer select-none">
              Kích hoạt sử dụng ngay lập tức cho các thiết bị thuộc SKU &amp; LONG_FW này
            </label>
          </div>

          <!-- Modal Action Buttons -->
          <div class="modal-action border-t border-base-content/10 pt-4">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              @click="editorDialogVisible = false"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm gap-2"
              :disabled="submittingForm"
            >
              <span v-if="submittingForm" class="loading loading-spinner loading-xs"></span>
              {{ isEditing ? 'Cập Nhật Bộ Giải Mã' : 'Lưu Bộ Giải Mã' }}
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- MODAL: Test Script Result Details -->
    <dialog class="modal" :class="{ 'modal-open': testModalVisible }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-content/15 shadow-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
          <div class="flex items-center gap-2 font-bold text-sm text-success">
            <Check class="w-4 h-4" />
            <span>Kết Quả Test Script Thành Công</span>
          </div>
          <button type="button" class="btn btn-xs btn-ghost btn-circle" @click="testModalVisible = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 bg-base-300/80 rounded-lg font-mono text-xs overflow-x-auto max-h-[350px] overflow-y-auto">
          <pre class="text-base-content"><code>{{ testModalContent }}</code></pre>
        </div>

        <div class="modal-action pt-2">
          <button type="button" class="btn btn-primary btn-sm" @click="testModalVisible = false">
            Đóng
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Cpu,
  Plus,
  RefreshCw,
  Search,
  RotateCcw,
  Play,
  Edit,
  Trash2,
  List,
  Link2,
  Terminal,
  FileCode,
  Upload,
  Check,
  AlertCircle,
  Eye,
  X,
} from 'lucide-vue-next';
import httpClient from '@/api/httpClient';
import { cyberToast, cyberConfirm } from '@/cyber/hud';

// Mẫu script chuẩn ChirpStack v4
const CHIRPSTACK_V4_SAMPLE = `// Decode uplink function for ChirpStack v4
// Input: bytes (array of numbers), fPort (number)
// Output: decoded object or null
function decodeUplink(input) {
  var bytes = input.bytes;
  var fPort = input.fPort;
  var decoded = {};

  if (fPort === 1) {
    // Example: 2 bytes temperature (int16), 2 bytes humidity (uint16), 1 byte battery
    if (bytes.length >= 5) {
      var rawTemp = (bytes[0] << 8) | bytes[1];
      if (rawTemp > 32767) rawTemp -= 65536;
      decoded.temperature = rawTemp / 100.0; // °C
      
      var rawHum = (bytes[2] << 8) | bytes[3];
      decoded.humidity = rawHum / 100.0;     // %RH
      
      decoded.battery = bytes[4];            // %
    }
  }

  return {
    data: decoded
  };
}`;

const TTN_V3_SAMPLE = `// Decode uplink function for The Things Network (TTN) v3
function decodeUplink(input) {
  var bytes = input.bytes;
  var fPort = input.fPort;
  var data = {};
  var warnings = [];

  switch (fPort) {
    case 1:
      data.raw = bytes.map(function(b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('').toUpperCase();
      break;
    default:
      warnings.push("Unsupported fPort: " + fPort);
  }

  return {
    data: data,
    warnings: warnings
  };
}`;

// Fallback logic
async function requestWithFallback(method: 'get' | 'post' | 'put' | 'delete', path: string, data?: any) {
  try {
    return await (httpClient as any)[method](`/plugins/decoder${path}`, data);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.status === 404) {
      return await (httpClient as any)[method](`/decoder${path}`, data);
    }
    throw err;
  }
}

// State
const activeTab = ref<'list' | 'memmap' | 'sandbox'>('list');
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
const editingId = ref<string | null>(null);

// Test Result Modal State
const testModalVisible = ref(false);
const testModalContent = ref('');

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
      const fw = m.longFw || m.firmwareVersion;
      if (fw) fws.add(fw);
    });
  return Array.from(fws);
});

const filteredMemmaps = computed(() => {
  return memmapList.value
    .map((m) => {
      const matchedDecoder = scriptList.value.find(
        (s) => s.sku === m.sku && (!s.longFw || s.longFw === m.longFw || s.longFw === m.firmwareVersion)
      );
      return {
        ...m,
        hasDecoder: !!matchedDecoder,
        decoderId: matchedDecoder?.id,
      };
    })
    .filter((m) => {
      if (!memmapSearch.value) return true;
      const q = memmapSearch.value.toLowerCase();
      const sku = (m.sku || '').toLowerCase();
      const name = (m.modelName || m.name || '').toLowerCase();
      const fw = (m.longFw || m.firmwareVersion || '').toLowerCase();
      return sku.includes(q) || name.includes(q) || fw.includes(q);
    });
});

// Refresh all
async function refreshData() {
  await Promise.all([loadScripts(), loadMemmaps()]);
}

// Load scripts
async function loadScripts() {
  loading.value = true;
  try {
    const res: any = await requestWithFallback('get', '/scripts', {
      params: {
        search: filters.search || undefined,
        sku: filters.sku || undefined,
        isActive: filters.isActive !== '' ? filters.isActive === 'true' : undefined,
      },
    });
    scriptList.value = res?.data || (Array.isArray(res) ? res : []);
  } catch (err: any) {
    console.error('Error loading decoder scripts:', err);
    cyberToast.error(err?.message || 'Không thể tải danh sách decoder scripts');
  } finally {
    loading.value = false;
  }
}

// Load Memmaps
async function loadMemmaps() {
  loadingMemmaps.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/memmap-manager/profiles');
    } catch {
      res = await requestWithFallback('get', '/memmaps');
    }
    const rawList = res?.data || (Array.isArray(res) ? res : []);
    memmapList.value = Array.isArray(rawList) ? rawList : [];
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
    cyberToast.success(`Đã ${row.isActive ? 'kích hoạt' : 'tạm ngưng'} script thành công`);
  } catch (err: any) {
    row.isActive = !row.isActive;
    cyberToast.error(err?.message || 'Lỗi khi cập nhật trạng thái script');
  }
}

// Delete
async function confirmDelete(row: any) {
  const confirmed = await cyberConfirm({
    title: 'Xác Nhận Xóa Bộ Giải Mã',
    message: `Bạn có chắc muốn xóa bộ giải mã "${row.name}" (SKU: ${row.sku}) không? Thao tác này không thể hoàn tác.`,
    confirmText: 'Xóa Vĩnh Viễn',
    cancelText: 'Hủy',
    type: 'error',
  });
  if (!confirmed) return;

  try {
    await requestWithFallback('delete', `/scripts/${row.id}`);
    cyberToast.success('Xóa bộ giải mã thành công');
    loadScripts();
  } catch (err: any) {
    cyberToast.error(err?.message || 'Lỗi khi xóa bộ giải mã');
  }
}

// Sandbox test
function testInSandbox(row: any) {
  sandboxForm.script = row.script;
  sandboxForm.payload = row.samplePayload || '09C4138805';
  sandboxForm.fPort = row.sampleFport || 1;
  activeTab.value = 'sandbox';
  runSandboxDecode();
}

function loadSampleScript(type: 'chirpstack_v4' | 'ttn_v3') {
  if (type === 'chirpstack_v4') {
    sandboxForm.script = CHIRPSTACK_V4_SAMPLE;
  } else {
    sandboxForm.script = TTN_V3_SAMPLE;
  }
  cyberToast.info('Đã tải mẫu script');
}

async function runSandboxDecode() {
  if (!sandboxForm.script) {
    cyberToast.warning('Vui lòng nhập script để giải mã');
    return;
  }
  runningTest.value = true;
  testResult.value = null;
  testError.value = '';

  try {
    const res: any = await requestWithFallback('post', '/test-run', {
      script: sandboxForm.script,
      payload: sandboxForm.payload,
      fPort: sandboxForm.fPort,
    });
    testResult.value = res?.data || res;
    cyberToast.success('Giải mã thành công!');
  } catch (err: any) {
    testError.value = err?.response?.data?.message || err?.message || 'Lỗi thực thi script';
    cyberToast.error('Giải mã thất bại');
  } finally {
    runningTest.value = false;
  }
}

// Memmap Link Actions
function assignDecoderFromMemmap(row: any) {
  isEditing.value = false;
  editingId.value = null;
  form.name = `Decoder cho ${row.modelName || row.name || row.sku}`;
  form.sku = row.sku || '';
  form.longFw = row.longFw || row.firmwareVersion || '';
  form.description = `Tự động tạo từ cấu hình MemMap: ${row.modelName || row.name || ''}`;
  form.script = CHIRPSTACK_V4_SAMPLE;
  form.samplePayload = '09C4138805';
  form.sampleFport = 1;
  form.isActive = true;
  editorDialogVisible.value = true;
}

function goToDecoderOfMemmap(row: any) {
  if (row.decoderId) {
    activeTab.value = 'list';
    filters.sku = row.sku;
    loadScripts();
  }
}

// Editor Dialog
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
  form.longFw = row.longFw || '';
  form.description = row.description || '';
  form.script = row.script;
  form.samplePayload = row.samplePayload || '09C4138805';
  form.sampleFport = row.sampleFport || 1;
  form.isActive = row.isActive;
  editorDialogVisible.value = true;
}

function handleFormSkuChange() {
  if (availableFwOptions.value.length > 0 && !form.longFw) {
    form.longFw = availableFwOptions.value[0];
  }
}

function fillFormSampleScript(type: 'chirpstack_v4') {
  if (type === 'chirpstack_v4') {
    form.script = CHIRPSTACK_V4_SAMPLE;
    cyberToast.info('Đã tải mẫu ChirpStack v4 vào trình soạn thảo');
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.name.endsWith('.js') && !file.name.endsWith('.txt')) {
    cyberToast.error('Chỉ hỗ trợ file JavaScript (.js) hoặc Text (.txt)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      form.script = content;
      cyberToast.success(`Đã đọc nội dung file ${file.name}`);
    }
  };
  reader.readAsText(file);
  target.value = '';
}

async function testCurrentFormScript() {
  if (!form.script) {
    cyberToast.warning('Vui lòng nhập nội dung script trước khi test');
    return;
  }
  testingFormScript.value = true;
  try {
    const res: any = await requestWithFallback('post', '/test-run', {
      script: form.script,
      payload: form.samplePayload || '09C4138805',
      fPort: form.sampleFport || 1,
    });
    const data = res?.data || res;
    testModalContent.value = JSON.stringify(data, null, 2);
    testModalVisible.value = true;
  } catch (err: any) {
    cyberToast.error(err?.message || 'Script phát sinh lỗi');
  } finally {
    testingFormScript.value = false;
  }
}

// Submit Form
async function submitForm() {
  if (!form.name || !form.sku || !form.longFw || !form.script) {
    cyberToast.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
    return;
  }

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
      cyberToast.success('Cập nhật bộ giải mã thành công');
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
      cyberToast.success('Tạo bộ giải mã mới thành công');
    }
    editorDialogVisible.value = false;
    refreshData();
  } catch (err: any) {
    console.error('Error submitting decoder script:', err);
    cyberToast.error(err?.message || 'Lỗi khi lưu bộ giải mã');
  } finally {
    submittingForm.value = false;
  }
}

onMounted(() => {
  refreshData();
});
</script>
