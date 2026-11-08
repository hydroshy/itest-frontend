<template>
  <div class="create-device-test-panel space-y-4">
    <!-- Header Banner -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 md:p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold tracking-wide uppercase text-base-content">
              TẠO THIẾT BỊ TEST (CREATE DEVICE TESTING)
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            @click="resetAll"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Wizard Steps Indicator (Chỉ ghi STEP 1, STEP 2, STEP 3 theo chỉ đạo) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-3">
      <ul class="steps steps-horizontal w-full text-xs font-semibold">
        <li
          class="step font-bold font-mono"
          :class="[
            currentStep >= 1 ? 'step-primary' : '',
            currentStep === 3 ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
          ]"
          @click="goToStep(1)"
        >
          STEP 1
        </li>
        <li
          class="step font-bold font-mono"
          :class="[
            currentStep >= 2 ? 'step-primary' : '',
            currentStep === 3 ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
          ]"
          @click="goToStep(2)"
        >
          STEP 2
        </li>
        <li
          class="step font-bold font-mono"
          :class="[
            currentStep >= 3 ? 'step-primary' : '',
            currentStep === 3 ? 'cursor-default' : 'cursor-pointer'
          ]"
          @click="goToStep(3)"
        >
          STEP 3
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 1: Chọn Connectivity, SO, WA, Network Server                         -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <FileText class="w-4 h-4" />
            <span>STEP 1</span>
          </div>
          <span class="badge badge-sm badge-info font-mono">BẮT BUỘC</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Connectivity -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Chuẩn Kết Nối (Connectivity) *</span>
            </label>
            <input
              type="text"
              class="input input-bordered input-sm w-full bg-base-300 font-bold text-primary text-xs"
              value="LoRaWAN"
              readonly
            />
          </div>

          <!-- Network Server -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">Network Server (ChirpStack) *</span>
              <span class="label-text-alt text-xs font-mono text-success">
                <span v-if="loadingServers" class="loading loading-spinner loading-xs mr-1"></span>
                Online
              </span>
            </label>
            <select
              v-model="step1.serverId"
              class="select select-bordered select-sm w-full text-xs font-mono"
              :disabled="loadingServers"
              @change="onNetworkServerChange"
            >
              <option v-for="ns in networkServers" :key="ns.id" :value="ns.id">
                {{ ns.name || 'ChirpStack' }}
              </option>
            </select>
          </div>

          <!-- Chọn / Nhập SO Number -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">SO Number *</span>
              <span v-if="loadingSos" class="label-text-alt text-xs font-mono text-primary flex items-center gap-1">
                <span class="loading loading-spinner loading-xs"></span> Đang tải SO...
              </span>
            </label>
            <div class="relative">
              <input
                v-model="step1.soNumber"
                type="text"
                class="input input-bordered input-sm w-full text-xs font-mono uppercase pr-8"
                placeholder=""
                :disabled="loadingSos"
                autocomplete="off"
                @focus="onSoFocus"
                @input="onSoInput"
                @blur="onSoBlur"
                @keydown.esc="isSoOpen = false"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-1"
                :disabled="loadingSos"
                @mousedown.prevent="isSoOpen = !isSoOpen"
              >
                <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isSoOpen }" />
              </button>
              <ul
                v-if="isSoOpen"
                class="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-xl p-1 text-xs font-mono"
              >
                <li
                  v-for="so in filteredSos"
                  :key="so.id || so.soNumber"
                  class="px-3 py-1.5 cursor-pointer rounded hover:bg-primary hover:text-primary-content transition-colors"
                  @mousedown.prevent="selectSo(so.soNumber)"
                >
                  {{ so.soNumber }}
                </li>
                <li v-if="filteredSos.length === 0" class="px-3 py-2 text-base-content/50 italic text-center">
                  Không tìm thấy SO phù hợp
                </li>
              </ul>
            </div>
          </div>

          <!-- Chọn / Nhập WA Number -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-semibold">WA Number *</span>
              <span v-if="loadingWas" class="label-text-alt text-xs font-mono text-primary flex items-center gap-1">
                <span class="loading loading-spinner loading-xs"></span> Đang tải WA...
              </span>
            </label>
            <div class="relative">
              <input
                v-model="step1.waNumber"
                type="text"
                class="input input-bordered input-sm w-full text-xs font-mono uppercase pr-8 disabled:bg-base-300/40 disabled:cursor-not-allowed"
                :placeholder="!step1.soNumber ? 'Vui lòng chọn SO trước' : ''"
                :disabled="loadingWas || !step1.soNumber"
                autocomplete="off"
                @focus="onWaFocus"
                @input="onWaInput"
                @blur="onWaBlur"
                @keydown.esc="isWaOpen = false"
              />
              <button
                v-if="step1.soNumber"
                type="button"
                tabindex="-1"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-1"
                :disabled="loadingWas"
                @mousedown.prevent="isWaOpen = !isWaOpen"
              >
                <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isWaOpen }" />
              </button>
              <ul
                v-if="isWaOpen && step1.soNumber"
                class="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-xl p-1 text-xs font-mono"
              >
                <li
                  v-for="wa in filteredWas"
                  :key="wa.id || wa.waNumber"
                  class="px-3 py-1.5 cursor-pointer rounded hover:bg-primary hover:text-primary-content transition-colors"
                  @mousedown.prevent="selectWa(wa.waNumber)"
                >
                  {{ wa.waNumber }}
                </li>
                <li v-if="filteredWas.length === 0" class="px-3 py-2 text-base-content/50 italic text-center">
                  {{ workAssignments.length === 0 ? 'Không có WA cho SO này' : 'Không tìm thấy WA phù hợp' }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Traceability Summary Preview -->
        <div v-if="step1.soNumber && step1.waNumber" class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
          <div class="font-bold text-primary flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4" />
            <span>Đã xác nhận liên kết Testing &amp; Traceability:</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-base-content/80 mt-1">
            <div>SO Number: <span class="font-bold text-base-content">{{ step1.soNumber }}</span></div>
            <div>WA Number: <span class="font-bold text-base-content">{{ step1.waNumber }}</span></div>
            <div>Item Code: <span class="font-bold text-base-content">{{ step1.itemCode || 'Theo Sensor (Bước 2)' }}</span></div>
            <div>Network Server: <span class="font-bold text-base-content">ChirpStack</span></div>
          </div>
        </div>

        <!-- Next Action -->
        <div class="flex justify-end pt-2">
          <button
            type="button"
            class="btn btn-sm btn-primary gap-2"
            :disabled="!step1.soNumber || !step1.waNumber"
            @click="nextToStep2"
          >
            <span>Tiếp Tục: STEP 2</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 2: Serial Tool Đọc Nhanh Thanh Ghi 0..259 theo ATH_TEMPLATE.csv       -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 2" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <Cable class="w-4 h-4" />
            <span>STEP 2</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="badge badge-sm font-mono font-bold"
              :class="serialConnected ? 'badge-success text-success-content' : 'badge-neutral'"
            >
              {{ serialConnected ? 'CONNECTED' : 'DISCONNECTED' }}
            </span>
          </div>
        </div>

        <!-- Serial Controls Toolbar (Flow chuẩn Final Config Tool: Chọn cổng tự động kết nối -> Chờ bấm START) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-base-100 p-4 rounded-lg border border-base-content/10">
          <!-- Chọn cổng COM: Bấm chọn là tự động kết nối ngay -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Cổng Kết Nối (COM Port)</span>
            </label>
            <div class="flex gap-2">
              <button
                v-if="!serialConnected"
                type="button"
                class="btn btn-sm btn-outline btn-primary flex-1 gap-1.5 font-bold"
                @click="selectAndConnectPort"
              >
                <Cable class="w-4 h-4" />
                <span>{{ selectedPortName || 'Chọn Cổng COM' }}</span>
              </button>
              <div v-else class="join w-full">
                <span class="join-item btn btn-sm btn-success no-animation flex-1 text-xs font-mono text-success-content pointer-events-none">
                  ✓ {{ selectedPortName || 'Cổng COM (Đã kết nối)' }}
                </span>
                <button
                  type="button"
                  class="join-item btn btn-sm btn-error text-error-content px-2"
                  title="Ngắt kết nối cổng"
                  @click="disconnectSerialPort"
                >
                  <PowerOff class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Baudrate -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Baudrate</span>
            </label>
            <select
              v-model.number="serialBaudRate"
              class="select select-bordered select-sm w-full font-mono text-xs"
              :disabled="serialConnected"
            >
              <option :value="9600">9600 (Mặc định cảm biến)</option>
              <option :value="19200">19200</option>
              <option :value="115200">115200</option>
            </select>
          </div>

          <!-- Nút START ĐỌC THANH GHI -->
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-xs font-semibold">Thao Tác Đọc</span>
            </label>
            <button
              type="button"
              class="btn btn-sm btn-primary w-full gap-2 font-bold shadow-md"
              :class="{ 'btn-disabled': !serialConnected || readingRegisters }"
              :disabled="!serialConnected || readingRegisters"
              @click="startFastRead0To259"
            >
              <span v-if="readingRegisters" class="loading loading-spinner loading-xs"></span>
              <Play v-else class="w-4 h-4 fill-current" />
              <span>START ĐỌC</span>
            </button>
          </div>
        </div>

        <!-- Reading Progress Indicator -->
        <div v-if="readingRegisters || readCompleted" class="space-y-1 bg-base-100 p-3 rounded-lg border border-base-content/10">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="font-bold flex items-center gap-1.5">
              <span v-if="readingRegisters" class="loading loading-spinner loading-xs text-primary"></span>
              <CheckCircle2 v-else class="w-3.5 h-3.5 text-success" />
              <span>{{ readingStatusText }}</span>
            </span>
            <span class="font-bold text-primary">{{ readProgress }}%</span>
          </div>
          <progress
            class="progress progress-primary w-full h-2"
            :value="readProgress"
            max="100"
          ></progress>
        </div>

        <!-- 12 Extracted Register Parameters Table (ATH_TEMPLATE.csv) - Ẩn mặc định, có nút Debug để xem -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-base-content flex items-center gap-2">
              <Table class="w-4 h-4 text-primary" />
              <span>DỮ LIỆU THANH GHI THIẾT BỊ</span>
            </h3>
            <button
              type="button"
              class="btn btn-xs btn-outline btn-ghost gap-1.5 font-mono text-[11px]"
              @click="showDebugRegisters = !showDebugRegisters"
            >
              <Bug class="w-3.5 h-3.5" />
              <span>{{ showDebugRegisters ? 'Ẩn Debug' : 'Debug' }}</span>
            </button>
          </div>

          <div v-if="showDebugRegisters" class="overflow-x-auto rounded-lg border border-base-content/10 bg-base-100">
            <table class="table table-xs w-full font-mono">
              <thead class="bg-base-200/60 text-[11px] text-base-content/70">
                <tr>
                  <th class="w-8">#</th>
                  <th>Tên Tham Số</th>
                  <th>Thanh Ghi Dec</th>
                  <th>Số Regs</th>
                  <th>Định Dạng</th>
                  <th>Giá Trị Đọc Được</th>
                  <th class="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in extractedRegisters"
                  :key="row.key"
                  class="hover:bg-base-200/40 transition-colors"
                >
                  <td class="text-base-content/40">{{ idx + 1 }}</td>
                  <td class="font-semibold text-base-content">{{ row.label }}</td>
                  <td class="text-primary font-bold">Dec {{ row.regDec }}</td>
                  <td>{{ row.numRegs }}</td>
                  <td><span class="badge badge-xs badge-ghost">{{ row.format }}</span></td>
                  <td class="font-bold" :class="row.value ? 'text-success' : 'text-base-content/40'">
                    {{ row.value || 'Chưa đọc' }}
                  </td>
                  <td class="text-center">
                    <span
                      class="badge badge-xs font-bold"
                      :class="row.value ? 'badge-success text-success-content' : 'badge-ghost'"
                    >
                      {{ row.value ? 'OK' : 'PENDING' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cảnh báo / Danh sách chọn Device Profile nếu không khớp hoặc có nhiều lựa chọn -->
        <div v-if="profileMatchError" class="alert alert-warning text-xs p-3 rounded-lg border border-warning/30 space-y-2">
          <div class="flex items-start gap-2">
            <AlertCircle class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <span class="font-bold uppercase tracking-wider block">Thiết Lập Device Profile:</span>
              <p class="mt-0.5 font-mono text-[11px]">{{ profileMatchError }}</p>
            </div>
          </div>
          <!-- Khi có profile để user chủ động bấm chọn -->
          <div v-if="candidateDeviceProfiles.length > 0" class="mt-2 pt-2 border-t border-warning/20">
            <div class="text-[11px] font-semibold mb-1.5">Vui lòng chọn 1 Device Profile bên dưới để tiếp tục:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="cand in candidateDeviceProfiles"
                :key="cand.id"
                type="button"
                class="btn btn-xs justify-start h-auto py-1.5 px-2.5 font-mono text-left border"
                :class="matchedDeviceProfile?.id === cand.id ? 'btn-primary border-primary' : 'btn-outline border-base-content/20 bg-base-100'"
                @click="selectCandidateProfile(cand)"
              >
                <div class="w-full">
                  <div class="font-bold truncate flex items-center justify-between">
                    <span>{{ cand.name }}</span>
                    <span v-if="cand.supportsClassC" class="badge badge-xs badge-primary ml-1">Class C</span>
                    <span v-else class="badge badge-xs badge-ghost ml-1">Class A</span>
                  </div>
                  <div class="text-[10px] opacity-75 truncate">ID: {{ cand.id }} · Region: {{ cand.region }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5"
            @click="currentStep = 1"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Quay Lại STEP 1</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-2"
            :disabled="!hasRequiredRegisters"
            @click="nextToStep3"
          >
            <span>Tiếp Tục: STEP 3</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- BƯỚC 3: Tự Động Đăng Ký Lên ChirpStack (2 Lần) & Thông Báo Gắn Pin        -->
    <!-- ========================================================================= -->
    <div v-if="currentStep === 3" class="space-y-4">
      <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-base-content/10 pb-3">
          <div class="flex items-center gap-2 text-sm font-bold uppercase text-primary font-mono">
            <Radio class="w-4 h-4" />
            <span>STEP 3</span>
          </div>
        </div>

        <!-- Status Result Alert -->
        <div
          v-if="step3Result.status === 'SUCCESS'"
          class="alert alert-success shadow-lg border border-success/30 text-success-content p-4"
        >
          <div class="flex items-start gap-3 w-full">
            <BatteryCharging class="w-8 h-8 flex-shrink-0 animate-bounce" />
            <div class="flex-1">
              <h3 class="font-black text-base uppercase tracking-wide">
                ĐĂNG KÝ THÀNH CÔNG VUI LÒNG GẮN PIN CẢM BIẾN
              </h3>
              <p class="text-xs opacity-90 mt-1">
                Thiết bị <strong class="underline">{{ registerData.SERIAL_NUMBER || registerData.deviceEUI }}</strong> đã được khởi tạo thành công trên ChirpStack với Device Profile và OTAA Keys. Hãy lắp pin vào thiết bị để cảm biến tiến hành JOIN mạng LoRaWAN!
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="step3Result.status === 'ERROR'"
          class="alert alert-error shadow-lg border border-error/30 text-error-content p-4"
        >
          <div class="flex items-start gap-3 w-full">
            <AlertCircle class="w-8 h-8 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-bold text-base uppercase">ĐĂNG KÝ THIẾT BỊ THẤT BẠI TRÊN HỆ THỐNG</h3>
              <p class="text-xs opacity-90 mt-1 font-mono">
                {{ step3Result.message || 'Lỗi kết nối tới Network Server API hoặc xung đột DevEUI.' }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="step3Result.status === 'PROCESSING'"
          class="alert alert-info shadow-lg border border-info/30 text-info-content p-4"
        >
          <div class="flex items-center gap-3">
            <span class="loading loading-spinner loading-md"></span>
            <div>
              <h3 class="font-bold text-sm uppercase">ĐANG TỰ ĐỘNG THỰC THI 2 BƯỚC ĐĂNG KÝ CHIRPSTACK...</h3>
              <p class="text-xs opacity-90 font-mono mt-0.5">
                1. POST /api/devices (Tạo Device) &rarr; 2. POST /api/devices/{devEui}/keys (Cài đặt OTAA Keys)
              </p>
            </div>
          </div>
        </div>

        <!-- Thông Tin Đăng Ký Thiết Bị (DUT) - Từng ô cho từng field giá trị -->
        <div class="bg-base-200/50 p-4 md:p-5 rounded-lg border border-base-content/10 space-y-3">
          <div class="font-bold text-primary border-b border-base-content/10 pb-2 flex items-center justify-between text-xs uppercase tracking-wider">
            <span class="flex items-center gap-2">
              <Cpu class="w-4 h-4" />
              <span>Thông Tin Đăng Ký Thiết Bị</span>
            </span>
            <span class="badge badge-xs badge-neutral font-mono">10 THAM SỐ SẢN XUẤT</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">Serial Number</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1" :title="registerData.SERIAL_NUMBER">{{ registerData.SERIAL_NUMBER || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">Item Code</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1" :title="registerData.ITEM_CODE || step1.itemCode">{{ registerData.ITEM_CODE || step1.itemCode || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">FW Version</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1">{{ registerData.FW_VERSION || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">HW Version</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1">{{ registerData.HW_VERSION || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">FW Code</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1">{{ registerData.FW_CODE || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">DevEUI</span>
              <strong class="font-mono text-xs text-primary truncate mt-1" :title="registerData.deviceEUI">{{ registerData.deviceEUI || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">AppEUI</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1" :title="registerData['LRW appEUI']">{{ registerData['LRW appEUI'] || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">AppKey</span>
              <strong class="font-mono text-xs text-base-content truncate mt-1" :title="registerData['LRW appKey']">{{ registerData['LRW appKey'] || '—' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">Class</span>
              <strong class="font-mono text-xs text-secondary truncate mt-1">{{ registerData.class || 'A' }}</strong>
            </div>
            <div class="bg-base-100 p-2.5 rounded-lg border border-base-content/10 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] text-base-content/60 font-semibold uppercase tracking-wider">Region</span>
              <strong class="font-mono text-xs text-accent truncate mt-1">{{ registerData['region code'] || '—' }}</strong>
            </div>
          </div>
        </div>

        <!-- Actions (Khóa quay lại Step 1 và Step 2 khi đã ở Step 3) -->
        <div class="flex items-center justify-end pt-2">
          <div class="flex items-center gap-2">
            <button
              v-if="step3Result.status === 'ERROR'"
              type="button"
              class="btn btn-sm btn-warning gap-1.5"
              @click="executeChirpstackRegistration"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Thử Đăng Ký Lại</span>
            </button>

            <button
              v-if="step3Result.status === 'SUCCESS'"
              type="button"
              class="btn btn-sm btn-outline gap-1.5"
              @click="$emit('select-tab', 'list-device-testing')"
            >
              <List class="w-3.5 h-3.5" />
              <span>Xem Danh Sách Thiết Bị</span>
            </button>

            <button
              v-if="step3Result.status === 'SUCCESS'"
              type="button"
              class="btn btn-sm btn-primary gap-1.5"
              @click="finishAndReset"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tạo Thiết Bị Tiếp Theo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Cpu,
  RotateCcw,
  FileText,
  Cable,
  Power,
  PowerOff,
  Zap,
  Table,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Radio,
  BatteryCharging,
  AlertCircle,
  Plus,
  Bug,
  List,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Flow Step State (1, 2, 3)
const currentStep = ref(1);
const showDebugRegisters = ref(false);

// ============================================================================
// BƯỚC 1: SO, WA, Network Server
// ============================================================================
const loadingSos = ref(false);
const loadingWas = ref(false);
const salesOrders = ref<any[]>([]);
const workAssignments = ref<any[]>([]);

const loadingServers = ref(false);
const networkServers = ref<any[]>([]);

const step1 = reactive({
  connectivity: 'LoRaWAN',
  serverId: '',
  serverUrl: '',
  apiToken: '',
  tenantId: '',
  applicationId: '',
  deviceProfileId: '',
  soNumber: '',
  waNumber: '',
  customerName: '',
  itemCode: '',
});

const loadingProfiles = ref(false);
const availableDeviceProfiles = ref<any[]>([]);
const matchedDeviceProfile = ref<any>(null);
const candidateDeviceProfiles = ref<any[]>([]);
const diagnosticProfiles = ref<any[]>([]);
const profileMatchError = ref('');
let profileRequestId = 0;

function onNetworkServerChange() {
  const ns = networkServers.value.find((s) => s.id === step1.serverId);
  if (ns) {
    step1.serverUrl = ns.apiUrl || ns.api_url || '';
    step1.apiToken = ns.apiToken || ns.api_token || '';
    step1.tenantId = ns.tenantId || ns.tenant_id || '';
    step1.applicationId = ns.applicationId || ns.application_id || '';
    step1.deviceProfileId = '';
  }
  // Reset profiles from previous server immediately
  availableDeviceProfiles.value = [];
  matchedDeviceProfile.value = null;
  candidateDeviceProfiles.value = [];
  diagnosticProfiles.value = [];
  profileMatchError.value = '';
  loadDeviceProfiles();
}

async function loadDeviceProfiles() {
  if (!step1.serverId) return;
  const currentReqId = ++profileRequestId;
  const currentServerId = step1.serverId;
  loadingProfiles.value = true;
  profileMatchError.value = '';
  try {
    let list: any[] = [];
    try {
      const res: any = await httpClient.get('/plugins/lorawan-chirpstack/device-profiles', {
        params: {
          serverId: step1.serverId,
          tenantId: step1.tenantId,
        },
      });
      const data = res?.data || res;
      list = Array.isArray(data) ? data : (Array.isArray(data?.result) ? data.result : (data?.deviceProfiles || []));
    } catch (apiErr) {
      console.warn('Backend proxy device-profiles failed, trying direct ChirpStack API...', apiErr);
    }

    // Direct fetch fallback if backend proxy returned empty and we have server credentials
    if (list.length === 0 && step1.serverUrl && step1.apiToken) {
      try {
        const directUrl = step1.serverUrl.replace(/\/+$/, '') + `/api/device-profiles?limit=100${step1.tenantId ? `&tenantId=${encodeURIComponent(step1.tenantId)}` : ''}`;
        const directResp = await fetch(directUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${step1.apiToken}`,
          },
        });
        if (directResp.ok) {
          const directData = await directResp.json();
          list = Array.isArray(directData?.result) ? directData.result : (directData?.deviceProfiles || []);
        }
      } catch (directErr) {
        console.warn('Direct ChirpStack fetch fallback error:', directErr);
      }
    }

    // Discard response if server has changed while request was in-flight
    if (currentReqId !== profileRequestId || step1.serverId !== currentServerId) {
      return;
    }
    availableDeviceProfiles.value = list;
    matchDeviceProfileByRegion();
  } catch (err: any) {
    if (currentReqId !== profileRequestId || step1.serverId !== currentServerId) {
      return;
    }
    console.warn('Failed to load device profiles for ChirpStack:', err);
    availableDeviceProfiles.value = [];
    matchedDeviceProfile.value = null;
    candidateDeviceProfiles.value = [];
    profileMatchError.value = err?.message || 'Lỗi kết nối khi tải danh sách Device Profiles từ ChirpStack';
    step1.deviceProfileId = '';
  } finally {
    if (currentReqId === profileRequestId) {
      loadingProfiles.value = false;
    }
  }
}

function matchDeviceProfileByRegion(): any {
  const rawRegion = (registerData['region code'] || '').trim();
  const rawClass = (registerData.class || 'A').trim();
  matchedDeviceProfile.value = null;
  candidateDeviceProfiles.value = [];
  profileMatchError.value = '';
  step1.deviceProfileId = '';

  if (!rawRegion) {
    // Registers haven't been read yet or region code missing
    return null;
  }

  if (availableDeviceProfiles.value.length === 0) {
    profileMatchError.value = 'Chưa tải được danh sách Device Profile nào từ ChirpStack cho Tenant này.';
    return null;
  }

  // Exact region match or base region match (e.g. AU915-1 matches AU915)
  const normalizeRegion = (val: unknown) => String(val || '').toUpperCase().replace(/[-_\s]/g, '');
  const region = normalizeRegion(rawRegion);
  const classCode = rawClass.toUpperCase().replace(/^CLASS[_\s-]?/, '');
  const isClassB = ['B', '1'].includes(classCode);
  const isClassC = ['C', '2'].includes(classCode);

  const regionMatches = availableDeviceProfiles.value.filter((p: any) => {
    const profileRegion = normalizeRegion(p.region);
    // ChirpStack v4 API already filters profiles by tenantId on server; do not drop when p.tenantId is omitted
    const tenantOk = !p.tenantId || !step1.tenantId ||
      String(p.tenantId).trim().toLowerCase() === String(step1.tenantId).trim().toLowerCase();

    const baseReg = region.replace(/[^A-Z0-9]/g, '');
    const baseProf = profileRegion.replace(/[^A-Z0-9]/g, '');
    const isRegionMatch = profileRegion === region ||
      (baseReg.startsWith('AU915') && baseProf.startsWith('AU915')) ||
      (baseReg.startsWith('AS923') && baseProf.startsWith('AS923')) ||
      (baseReg.startsWith('US915') && baseProf.startsWith('US915')) ||
      (baseReg.startsWith('EU868') && baseProf.startsWith('EU868'));

    return typeof p.id === 'string' && p.id.trim() && region && isRegionMatch && tenantOk;
  });

  const matches = regionMatches.filter((p: any) => {
    const pSupportsB = Boolean(p.supportsClassB === true || p.supportsClassB === 'true' || p.supports_class_b === true);
    const pSupportsC = Boolean(p.supportsClassC === true || p.supportsClassC === 'true' || p.supports_class_c === true);
    // Class A is standard baseline and always supported 100%; Class B and C require capability flags
    return (!isClassB || pSupportsB) && (!isClassC || pSupportsC);
  });

  if (matches.length === 0) {
    if (regionMatches.length > 0) {
      candidateDeviceProfiles.value = regionMatches;
      profileMatchError.value = `Tìm thấy ${regionMatches.length} Profile khớp Region "${rawRegion}", nhưng chưa bật 'Support Class ${rawClass}' trên ChirpStack. Vui lòng bật hỗ trợ trên ChirpStack Console:`;
    } else {
      profileMatchError.value = `Không tìm thấy Device Profile nào khớp chính xác với Region "${rawRegion}" (Class ${rawClass}) trên ChirpStack. Vui lòng tạo Profile tương ứng trên ChirpStack trước khi đăng ký.`;
    }
    return null;
  }

  if (matches.length > 1) {
    candidateDeviceProfiles.value = matches;
    profileMatchError.value = `Tìm thấy ${matches.length} Device Profile cùng khớp với Region "${rawRegion}" và hỗ trợ Class ${rawClass}. Vui lòng chọn cụ thể 1 profile bên dưới:`;
    return null;
  }

  // Exactly 1 unambiguous match
  const selected = matches[0];
  matchedDeviceProfile.value = selected;
  step1.deviceProfileId = selected.id;
  return selected;
}

function selectCandidateProfile(profile: any) {
  matchedDeviceProfile.value = profile;
  step1.deviceProfileId = profile.id;
  profileMatchError.value = '';
}

async function loadNetworkServers() {
  loadingServers.value = true;
  try {
    let res: any;
    try {
      res = await httpClient.get('/plugins/testing/network-servers');
    } catch {
      try {
        res = await httpClient.get('/plugins/lorawan-chirpstack/servers');
      } catch {
        res = await httpClient.get('/lorawan-chirpstack/servers').catch(() => []);
      }
    }
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    if (list.length > 0) {
      networkServers.value = list.map((ns: any) => ({
        id: ns.id,
        name: ns.name,
        apiUrl: ns.apiUrl || ns.api_url || '',
        apiToken: ns.apiToken || ns.api_token || '',
        tenantId: ns.tenantId || ns.tenant_id || '',
        applicationId: ns.applicationId || ns.application_id || '',
        deviceProfileId: '',
      }));
      if (!step1.serverId || !networkServers.value.some((s) => s.id === step1.serverId)) {
        step1.serverId = networkServers.value[0].id;
        onNetworkServerChange();
      }
    } else {
      networkServers.value = [
        {
          id: 'srv-globiots-test',
          name: 'Globiots ChirpStack Test Network Server',
          apiUrl: 'https://chirpstack-test-api.globiots.com',
          apiToken: '',
          tenantId: '52f14fb4-c5a1-4566-9b57-69502b78a9c1',
          applicationId: 'app-iot-monitoring',
          deviceProfileId: '',
        },
      ];
      step1.serverId = 'srv-globiots-test';
      onNetworkServerChange();
    }
  } catch (err) {
    console.warn('Failed to load network servers for testing:', err);
  } finally {
    loadingServers.value = false;
  }
}

function cleanSoNumber(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim().toUpperCase();
  const match = trimmed.match(/SO\/\d+\/\d+/);
  if (match) {
    const parts = match[0].split('/');
    const year = parts[1];
    const seq = parts[2].padStart(5, '0');
    return `SO/${year}/${seq}`;
  }
  return trimmed;
}

function cleanWaNumber(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim().toUpperCase();
  const match = trimmed.match(/WA\/\d+\/\d+/);
  if (match) {
    const parts = match[0].split('/');
    const year = parts[1];
    const seq = parts[2].padStart(5, '0');
    return `WA/${year}/${seq}`;
  }
  return trimmed;
}

const isSoOpen = ref(false);
const isWaOpen = ref(false);

const filteredSos = computed(() => {
  const query = step1.soNumber ? step1.soNumber.trim().toUpperCase() : '';
  if (!query) return salesOrders.value;
  return salesOrders.value.filter((s) =>
    (s.soNumber || '').toUpperCase().includes(query)
  );
});

const filteredWas = computed(() => {
  const query = step1.waNumber ? step1.waNumber.trim().toUpperCase() : '';
  if (!query) return workAssignments.value;
  return workAssignments.value.filter((w) =>
    (w.waNumber || '').toUpperCase().includes(query)
  );
});

function selectSo(soNum: string) {
  step1.soNumber = cleanSoNumber(soNum);
  isSoOpen.value = false;
  onSoChange();
}

function selectWa(waNum: string) {
  step1.waNumber = cleanWaNumber(waNum);
  isWaOpen.value = false;
  onWaChange();
}

function onSoFocus() {
  isSoOpen.value = true;
}

function onSoInput() {
  step1.soNumber = step1.soNumber.toUpperCase();
  isSoOpen.value = true;
}

function onSoBlur() {
  setTimeout(() => {
    isSoOpen.value = false;
  }, 200);
  if (step1.soNumber) {
    step1.soNumber = cleanSoNumber(step1.soNumber);
    onSoChange();
  }
}

function onWaFocus() {
  if (step1.soNumber) {
    isWaOpen.value = true;
  }
}

function onWaInput() {
  step1.waNumber = step1.waNumber.toUpperCase();
  isWaOpen.value = true;
}

function onWaBlur() {
  setTimeout(() => {
    isWaOpen.value = false;
  }, 200);
  if (step1.waNumber) {
    step1.waNumber = cleanWaNumber(step1.waNumber);
    onWaChange();
  }
}

async function loadSalesOrders() {
  loadingSos.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/so');
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    salesOrders.value = items.map((s: any) => ({
      ...s,
      soNumber: cleanSoNumber(s.soNumber || s.so_number),
    }));
  } catch {
    salesOrders.value = [];
  } finally {
    loadingSos.value = false;
  }
}

async function onSoChange() {
  step1.soNumber = cleanSoNumber(step1.soNumber);
  step1.waNumber = '';
  step1.itemCode = '';
  workAssignments.value = [];
  const foundSo = salesOrders.value.find(
    (s) => cleanSoNumber(s.soNumber || s.so_number) === step1.soNumber
  );
  step1.customerName = foundSo?.customerName || foundSo?.customer_name || '';
  if (!step1.soNumber) {
    return;
  }
  loadingWas.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/lookup/wa', {
      params: { soNumber: step1.soNumber },
    });
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    workAssignments.value = items.map((w: any) => ({
      ...w,
      waNumber: cleanWaNumber(w.waNumber || w.wa_number),
      itemCode: w.itemCode || w.item_code || '',
    }));
  } catch {
    workAssignments.value = [];
  } finally {
    loadingWas.value = false;
  }
}

function onWaChange() {
  step1.waNumber = cleanWaNumber(step1.waNumber);
  const wa = workAssignments.value.find((w) => cleanWaNumber(w.waNumber) === step1.waNumber);
  if (wa && wa.itemCode) {
    step1.itemCode = wa.itemCode;
  }
}

function nextToStep2() {
  step1.soNumber = cleanSoNumber(step1.soNumber);
  step1.waNumber = cleanWaNumber(step1.waNumber);
  if (!step1.soNumber || !step1.waNumber) {
    cyberToast.warning('Vui lòng chọn hoặc nhập SO Number và WA Number!');
    return;
  }
  currentStep.value = 2;
}

// ============================================================================
// BƯỚC 2: Serial Tool & Fast Read (0..259 theo ATH_TEMPLATE.csv)
// ============================================================================
const serialConnected = ref(false);
const serialBaudRate = ref(9600);
const selectedPortName = ref('');
const readingRegisters = ref(false);
const readProgress = ref(0);
const readingStatusText = ref('Sẵn sàng');
const readCompleted = ref(false);
let activeSerialPort: any = null;

// Extracted 12 Register fields
const registerData = reactive<Record<string, string>>({
  FW_CODE: '',
  FW_VERSION: '',
  HW_VERSION: '',
  ME_VERSION: '',
  deviceEUI: '',
  'LRW appEUI': '',
  'LRW appKey': '',
  'region code': '',
  class: '',
  'sensor type': '',
  SERIAL_NUMBER: '',
  ITEM_CODE: '',
});

const extractedRegisters = computed(() => [
  { key: 'FW_CODE', label: 'FW_CODE', regDec: 0, numRegs: 5, format: 'string', value: registerData.FW_CODE },
  { key: 'FW_VERSION', label: 'FW_VERSION', regDec: 5, numRegs: 4, format: 'string', value: registerData.FW_VERSION },
  { key: 'HW_VERSION', label: 'HW_VERSION', regDec: 9, numRegs: 2, format: 'string', value: registerData.HW_VERSION },
  { key: 'ME_VERSION', label: 'ME_VERSION', regDec: 15, numRegs: 2, format: 'string', value: registerData.ME_VERSION },
  { key: 'deviceEUI', label: 'deviceEUI', regDec: 27, numRegs: 4, format: 'hex (64-bit)', value: registerData.deviceEUI },
  { key: 'LRW appEUI', label: 'LRW appEUI (joinEui)', regDec: 31, numRegs: 4, format: 'hex (64-bit)', value: registerData['LRW appEUI'] },
  { key: 'LRW appKey', label: 'LRW appKey', regDec: 35, numRegs: 8, format: 'hex (128-bit)', value: registerData['LRW appKey'] },
  { key: 'region code', label: 'region code', regDec: 69, numRegs: 3, format: 'string', value: registerData['region code'] },
  { key: 'class', label: 'class', regDec: 85, numRegs: 1, format: 'string', value: registerData.class },
  { key: 'sensor type', label: 'sensor type', regDec: 103, numRegs: 1, format: 'uint16', value: registerData['sensor type'] },
  { key: 'SERIAL_NUMBER', label: 'SERIAL_NUMBER', regDec: 259, numRegs: 9, format: 'string', value: registerData.SERIAL_NUMBER },
  { key: 'ITEM_CODE', label: 'ITEM_CODE', regDec: 386, numRegs: 14, format: 'string', value: registerData.ITEM_CODE },
]);

const hasRequiredRegisters = computed(() => {
  return (
    !!registerData.deviceEUI &&
    !!registerData['LRW appEUI'] &&
    !!registerData['LRW appKey'] &&
    !!registerData.SERIAL_NUMBER
  );
});

// CRC-16 Modbus
function calcModbusCRC16(buf: Uint8Array | number[]): number {
  let crc = 0xffff;
  for (let pos = 0; pos < buf.length; pos++) {
    crc ^= buf[pos];
    for (let i = 8; i !== 0; i--) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc;
}

function bytesToString(bytes: number[]): string {
  return String.fromCharCode(...bytes.filter((b) => b >= 32 && b <= 126)).trim();
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function selectAndConnectPort() {
  if (!('serial' in navigator)) {
    cyberToast.warning('Trình duyệt không hỗ trợ Web Serial API. Vui lòng dùng Chrome hoặc Edge!');
    return;
  }
  try {
    const port = await (navigator as any).serial.requestPort();
    if (!port) return;
    activeSerialPort = port;
    const info = port.getInfo ? port.getInfo() : {};
    let desc = 'COM Port (USB)';
    if (info.usbVendorId) {
      desc = `USB (VID: 0x${info.usbVendorId.toString(16).toUpperCase()} PID: 0x${(info.usbProductId || 0).toString(16).toUpperCase()})`;
    }
    selectedPortName.value = desc;

    // Tự động kết nối ngay theo đúng flow của Final Config Tool
    await openActivePort();
  } catch (err: any) {
    if (err.name !== 'NotFoundError') {
      cyberToast.error(`Lỗi chọn cổng: ${err.message}`);
    }
  }
}

async function openActivePort() {
  if (!activeSerialPort) return;
  try {
    await activeSerialPort.open({
      baudRate: Number(serialBaudRate.value) || 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 255,
    });
    if (activeSerialPort.setSignals) {
      try {
        await activeSerialPort.setSignals({
          dataTerminalReady: true,
          requestToSend: true,
        });
      } catch (e) {}
    }
    serialConnected.value = true;
    cyberToast.success(`Đã kết nối ${selectedPortName.value || 'cổng COM'} @ ${serialBaudRate.value} bps. Hãy nhấn START để đọc.`);
  } catch (err: any) {
    serialConnected.value = false;
    cyberToast.error(`Không thể kết nối cổng: ${err.message}`);
  }
}

async function disconnectSerialPort() {
  if (activeSerialPort) {
    try {
      await activeSerialPort.close();
    } catch {}
    activeSerialPort = null;
  }
  serialConnected.value = false;
  selectedPortName.value = '';
  cyberToast.info('Đã ngắt kết nối cổng Serial');
}

// Flush UART RX buffer to drain any stray bytes
async function flushUartRxBuffer(flushTimeoutMs = 100) {
  if (!activeSerialPort || !activeSerialPort.readable) return;
  try {
    if (activeSerialPort.setSignals) {
      try {
        await activeSerialPort.setSignals({ requestToSend: false, dataTerminalReady: false });
        await new Promise((r) => setTimeout(r, 5));
        await activeSerialPort.setSignals({ requestToSend: true, dataTerminalReady: true });
      } catch (e) {}
    }
    const reader = activeSerialPort.readable.getReader();
    const startTime = Date.now();
    try {
      while (Date.now() - startTime < flushTimeoutMs) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 25));
        try {
          const res = (await Promise.race([reader.read(), timeoutPromise])) as any;
          if (res?.done) break;
        } catch {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (e) {}
  await new Promise((r) => setTimeout(r, 25));
}

// Low-level Modbus FC 03 read with CRC validation
async function readModbusRaw(
  slave: number,
  fc: number,
  startReg: number,
  numRegs: number,
  timeoutMs = 1200
): Promise<number[]> {
  if (!activeSerialPort || !activeSerialPort.readable || !activeSerialPort.writable) {
    throw new Error('Cổng Serial không khả dụng');
  }

  await flushUartRxBuffer(30);

  const frame = [
    slave & 0xff,
    fc & 0xff,
    (startReg >> 8) & 0xff,
    startReg & 0xff,
    (numRegs >> 8) & 0xff,
    numRegs & 0xff,
  ];
  const crc = calcModbusCRC16(frame);
  frame.push(crc & 0xff, (crc >> 8) & 0xff);

  const writer = activeSerialPort.writable.getWriter();
  try {
    await writer.write(new Uint8Array(frame));
  } finally {
    try { writer.releaseLock(); } catch {}
  }

  const reader = activeSerialPort.readable.getReader();
  const expectedBytes = 3 + numRegs * 2 + 2;
  const rxBuffer: number[] = [];
  const startTime = Date.now();

  try {
    while (rxBuffer.length < expectedBytes && Date.now() - startTime < timeoutMs) {
      const remaining = Math.max(10, timeoutMs - (Date.now() - startTime));
      let timeoutId: any;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), remaining);
      });
      let res: any;
      try {
        res = await Promise.race([reader.read(), timeoutPromise]);
      } finally {
        clearTimeout(timeoutId);
      }
      if (res.done) break;
      if (res.value) {
        rxBuffer.push(...(Array.from(res.value) as number[]));
      }
    }
  } finally {
    try { await reader.cancel(); } catch {}
    try { reader.releaseLock(); } catch {}
  }

  if (rxBuffer.length < 5) {
    throw new Error(`Không có phản hồi từ thiết bị cho thanh ghi ${startReg}`);
  }

  // Find valid Modbus frame header in rxBuffer to strip RS485 line noise bytes
  let validFrame: number[] | null = null;
  const expectedDataLen = numRegs * 2;

  for (let i = 0; i <= rxBuffer.length - expectedBytes; i++) {
    const s = rxBuffer[i];
    const f = rxBuffer[i + 1];
    const b = rxBuffer[i + 2];
    if ((s === slave || s === 0 || s === 1) && f === (fc & 0xff) && b === expectedDataLen) {
      const candidate = rxBuffer.slice(i, i + expectedBytes);
      const calcCrc = calcModbusCRC16(candidate.slice(0, candidate.length - 2));
      const rxCrc = candidate[candidate.length - 2] | (candidate[candidate.length - 1] << 8);
      if (calcCrc === rxCrc) {
        validFrame = candidate;
        break;
      }
    }
  }

  if (!validFrame) {
    // Direct CRC verification on buffer if alignment matches
    if (rxBuffer.length >= expectedBytes) {
      const candidate = rxBuffer.slice(0, expectedBytes);
      const calcCrc = calcModbusCRC16(candidate.slice(0, candidate.length - 2));
      const rxCrc = candidate[candidate.length - 2] | (candidate[candidate.length - 1] << 8);
      if (calcCrc === rxCrc) {
        validFrame = candidate;
      }
    }
  }

  if (!validFrame) {
    throw new Error(`Dữ liệu nhận được không khớp hoặc sai CRC tại thanh ghi ${startReg}`);
  }

  const byteCount = validFrame[2];
  return validFrame.slice(3, 3 + byteCount);
}

// Fast Chunk Read 0..259 & 386 (Safe chunking & Dual Slave 0/1 wake-up probe)
async function startFastRead0To259() {
  if (!serialConnected.value || !activeSerialPort) {
    cyberToast.warning('Vui lòng chọn cổng Serial trước khi đọc!');
    return;
  }

  readingRegisters.value = true;
  readProgress.value = 0;
  readingStatusText.value = 'Đang kích hoạt / đánh thức cảm biến (MCU Wake-up probe)...';

  try {
    // Giai đoạn 0: MCU Wake-up probe (thử cả Slave 0 theo ATH_TEMPLATE.csv và Slave 1 tiêu chuẩn)
    let mcuAwake = false;
    let activeSlave = 0; // Ưu tiên Slave 0 theo ATH_TEMPLATE.csv

    for (let attempt = 1; attempt <= 6; attempt++) {
      // Thử xen kẽ Slave 0 và Slave 1
      const slaveToTry = attempt % 2 === 1 ? 0 : 1;
      try {
        readingStatusText.value = `Đang đánh thức cảm biến (Slave ${slaveToTry}, Lần thử ${attempt}/6)...`;
        const testBytes = await readModbusRaw(slaveToTry, 3, 0, 5, 800);
        if (testBytes && testBytes.length >= 10) {
          mcuAwake = true;
          activeSlave = slaveToTry;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!mcuAwake) {
      // Thử đọc với slave 1 lần cuối trước khi báo lỗi
      try {
        const testBytes = await readModbusRaw(1, 3, 0, 5, 1000);
        if (testBytes && testBytes.length >= 10) {
          mcuAwake = true;
          activeSlave = 1;
        }
      } catch {}
    }

    if (!mcuAwake) {
      throw new Error('Cảm biến không phản hồi sau 6 lần thử. Vui lòng kiểm tra cáp UART/RS485, baudrate (9600/115200) và nguồn cấp cảm biến.');
    }

    const rawMemory = new Map<number, [number, number]>();

    // Giai đoạn 1: Đọc nhanh theo khối an toàn (< 45 regs/khối) với activeSlave đã phát hiện
    readingStatusText.value = `Đang đọc Khối 1: Cấu hình Hardware & Keys (Slave ${activeSlave}, Reg 0..42)...`;
    readProgress.value = 20;
    try {
      const b1 = await readModbusRaw(activeSlave, 3, 0, 43, 1200);
      for (let i = 0; i < 43; i++) {
        rawMemory.set(i, [b1[i * 2], b1[i * 2 + 1]]);
      }
    } catch {
      // Fallback đọc từng dải thanh ghi nếu khối 43 regs bị từ chối
      const bFwCode = await readModbusRaw(activeSlave, 3, 0, 5, 1000);
      for (let i = 0; i < 5; i++) rawMemory.set(i, [bFwCode[i * 2], bFwCode[i * 2 + 1]]);
      const bFwVer = await readModbusRaw(activeSlave, 3, 5, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(5 + i, [bFwVer[i * 2], bFwVer[i * 2 + 1]]);
      const bHwVer = await readModbusRaw(activeSlave, 3, 9, 2, 1000);
      for (let i = 0; i < 2; i++) rawMemory.set(9 + i, [bHwVer[i * 2], bHwVer[i * 2 + 1]]);
      const bMeVer = await readModbusRaw(activeSlave, 3, 15, 2, 1000);
      for (let i = 0; i < 2; i++) rawMemory.set(15 + i, [bMeVer[i * 2], bMeVer[i * 2 + 1]]);
      const bDevEui = await readModbusRaw(activeSlave, 3, 27, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(27 + i, [bDevEui[i * 2], bDevEui[i * 2 + 1]]);
      const bAppEui = await readModbusRaw(activeSlave, 3, 31, 4, 1000);
      for (let i = 0; i < 4; i++) rawMemory.set(31 + i, [bAppEui[i * 2], bAppEui[i * 2 + 1]]);
      const bAppKey = await readModbusRaw(activeSlave, 3, 35, 8, 1000);
      for (let i = 0; i < 8; i++) rawMemory.set(35 + i, [bAppKey[i * 2], bAppKey[i * 2 + 1]]);
    }

    // Khối 2: Reg 69..85 (17 regs = 34 bytes response -> lấy region code, class)
    readingStatusText.value = `Đang đọc Khối 2: LoRaWAN Region & Class (Slave ${activeSlave}, Reg 69..85)...`;
    readProgress.value = 45;
    try {
      const b2 = await readModbusRaw(activeSlave, 3, 69, 17, 1200);
      for (let i = 0; i < 17; i++) {
        rawMemory.set(69 + i, [b2[i * 2], b2[i * 2 + 1]]);
      }
    } catch {
      const bReg = await readModbusRaw(activeSlave, 3, 69, 3, 1000);
      for (let i = 0; i < 3; i++) rawMemory.set(69 + i, [bReg[i * 2], bReg[i * 2 + 1]]);
      const bCls = await readModbusRaw(activeSlave, 3, 85, 1, 1000);
      rawMemory.set(85, [bCls[0], bCls[1]]);
    }

    // Khối 3: Reg 103 (1 reg -> sensor type)
    readingStatusText.value = `Đang đọc Khối 3: Sensor Type (Slave ${activeSlave}, Reg 103)...`;
    readProgress.value = 65;
    try {
      const b3 = await readModbusRaw(activeSlave, 3, 103, 1, 1000);
      rawMemory.set(103, [b3[0], b3[1]]);
    } catch {}

    // Khối 4: Reg 259..267 (9 regs = 18 bytes -> SERIAL_NUMBER)
    readingStatusText.value = `Đang đọc Khối 4: Serial Number (Slave ${activeSlave}, Reg 259)...`;
    readProgress.value = 85;
    try {
      const b4 = await readModbusRaw(activeSlave, 3, 259, 9, 1000);
      for (let i = 0; i < 9; i++) {
        rawMemory.set(259 + i, [b4[i * 2], b4[i * 2 + 1]]);
      }
    } catch {}

    // Khối 5: Reg 386..399 (14 regs = 28 bytes -> ITEM_CODE)
    readingStatusText.value = `Đang đọc Khối 5: Item Code (Slave ${activeSlave}, Reg 386)...`;
    readProgress.value = 95;
    try {
      const b5 = await readModbusRaw(activeSlave, 3, 386, 14, 1000);
      for (let i = 0; i < 14; i++) {
        rawMemory.set(386 + i, [b5[i * 2], b5[i * 2 + 1]]);
      }
    } catch {}

    readProgress.value = 100;

    // Decode to registerData
    decodeRegistersFromMemory(rawMemory);
    readCompleted.value = true;
    readingStatusText.value = 'Đọc thành công thông tin';
    cyberToast.success('Đọc thành công thông tin');

    // Khi start đọc đủ thông tin rồi sẽ tự động chuyển qua step 3
    if (hasRequiredRegisters.value) {
      setTimeout(() => {
        nextToStep3();
      }, 400);
    }
  } catch (err: any) {
    readingStatusText.value = `Lỗi đọc: ${err.message}`;
    cyberToast.error(`Lỗi đọc thanh ghi: ${err.message}`);
  } finally {
    readingRegisters.value = false;
  }
}

function decodeRegistersFromMemory(rawMemory: Map<number, [number, number]>) {
  function getBytes(start: number, count: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < count; i++) {
      const pair = rawMemory.get(start + i);
      if (pair) bytes.push(pair[0], pair[1]);
    }
    return bytes;
  }

  registerData.FW_CODE = bytesToString(getBytes(0, 5));
  registerData.FW_VERSION = bytesToString(getBytes(5, 4));
  registerData.HW_VERSION = bytesToString(getBytes(9, 2));
  registerData.ME_VERSION = bytesToString(getBytes(15, 2));
  registerData.deviceEUI = bytesToHex(getBytes(27, 4));
  registerData['LRW appEUI'] = bytesToHex(getBytes(31, 4));
  registerData['LRW appKey'] = bytesToHex(getBytes(35, 8));
  registerData['region code'] = bytesToString(getBytes(69, 3));
  registerData.class = bytesToString(getBytes(85, 1));
  const stBytes = getBytes(103, 1);
  registerData['sensor type'] = stBytes.length >= 2 ? String((stBytes[0] << 8) | stBytes[1]) : '';
  registerData.SERIAL_NUMBER = bytesToString(getBytes(259, 9));
  registerData.ITEM_CODE = bytesToString(getBytes(386, 14));
  matchDeviceProfileByRegion();
}

function nextToStep3() {
  if (!hasRequiredRegisters.value) {
    cyberToast.warning('Chưa có đủ thông tin DeviceEUI, AppKey, Serial Number!');
    return;
  }
  // Enforce fail-closed check for Device Profile resolution
  if (!matchedDeviceProfile.value?.id) {
    const errorMsg = profileMatchError.value || 'Không có Device Profile ChirpStack hợp lệ khớp với Region này. Chặn đăng ký!';
    cyberToast.error(errorMsg);
    return;
  }
  currentStep.value = 3;
  executeChirpstackRegistration();
}

// ============================================================================
// BƯỚC 3: Tự Động Đăng Ký ChirpStack (2 Lần) & Thông Báo Gắn Pin
// ============================================================================
const step3Result = reactive({
  status: 'IDLE', // 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  message: '',
});

const computedChirpstackPayload = computed(() => {
  const profileId = matchedDeviceProfile.value?.id || '';
  return {
    step1_device: {
      applicationId: step1.applicationId || 'app-iot-monitoring',
      description: 'ITEST 2.0',
      devEui: registerData.deviceEUI,
      deviceProfileId: profileId,
      isDisabled: false,
      joinEui: registerData['LRW appEUI'] || '0000000000000000',
      name: registerData.SERIAL_NUMBER || `DEV-${registerData.deviceEUI}`,
      skipFcntCheck: true,
      variables: {
        soNumber: cleanSoNumber(step1.soNumber),
        waNumber: cleanWaNumber(step1.waNumber),
        itemCode: registerData.ITEM_CODE || step1.itemCode,
        fwCode: registerData.FW_CODE,
        fwVersion: registerData.FW_VERSION,
        hwVersion: registerData.HW_VERSION,
        tenantId: step1.tenantId,
        applicationId: step1.applicationId,
        deviceProfileId: profileId,
        deviceProfileName: matchedDeviceProfile.value?.name,
      },
    },
    step2_deviceKeys: {
      devEui: registerData.deviceEUI,
      nwkKey: registerData['LRW appKey'],
      appKey: registerData['LRW appKey'],
    },
  };
});

async function executeChirpstackRegistration() {
  if (!matchedDeviceProfile.value?.id) {
    step3Result.status = 'ERROR';
    step3Result.message = profileMatchError.value || 'Chặn đăng ký: Không tìm thấy Device Profile tương thích trên ChirpStack!';
    cyberToast.error(step3Result.message);
    return;
  }
  step3Result.status = 'PROCESSING';
  step3Result.message = '';

  const payload = {
    connectivity: 'LoRaWAN',
    soNumber: cleanSoNumber(step1.soNumber),
    waNumber: cleanWaNumber(step1.waNumber),
    serverId: step1.serverId,
    serverUrl: step1.serverUrl,
    apiToken: step1.apiToken,
    tenantId: step1.tenantId,
    applicationId: step1.applicationId,
    deviceProfileId: matchedDeviceProfile.value.id,
    deviceProfileName: matchedDeviceProfile.value.name,
    // Step 2 Registers
    fwCode: registerData.FW_CODE,
    fwVersion: registerData.FW_VERSION,
    hwVersion: registerData.HW_VERSION,
    meVersion: registerData.ME_VERSION,
    devEui: registerData.deviceEUI,
    appEui: registerData['LRW appEUI'],
    appKey: registerData['LRW appKey'],
    regionCode: registerData['region code'],
    classMode: registerData.class,
    sensorType: registerData['sensor type'],
    serialNumber: registerData.SERIAL_NUMBER,
    itemCode: registerData.ITEM_CODE || step1.itemCode,
    createdBy: authStore.user?.username || authStore.user?.email || 'tester',
  };

  try {
    const res: any = await httpClient.post('/plugins/testing/register-device-flow', payload);
    const isSuccess = Boolean(
      res?.success === true ||
      res?.data?.success === true ||
      res?.data?.chirpstackSuccess === true ||
      res?.status === 'SUCCESS_ATTACH_BATTERY' ||
      res?.data?.status === 'SUCCESS_ATTACH_BATTERY'
    );
    let message =
      res?.message ||
      res?.data?.message ||
      res?.data?.error ||
      (isSuccess ? 'Đăng ký Thành công vui lòng gắn pin cảm biến' : 'Lỗi không xác định từ Network Server');

    const warnings: string[] = Array.isArray(res?.warnings) ? res.warnings : (Array.isArray(res?.data?.warnings) ? res.data.warnings : []);
    if (warnings.length > 0) {
      message += ` (Lưu ý: ${warnings.join('; ')})`;
    }

    if (isSuccess) {
      step3Result.status = 'SUCCESS';
      step3Result.message = message;
      cyberToast.success(message);
    } else {
      step3Result.status = 'ERROR';
      step3Result.message = message;
      cyberToast.error(message);
    }
  } catch (err: any) {
    step3Result.status = 'ERROR';
    step3Result.message =
      err?.response?.data?.message || err?.message || 'Lỗi khi gọi API đăng ký ChirpStack';
    cyberToast.error(step3Result.message);
  }
}

function goToStep(step: number) {
  if (currentStep.value === 3 && step < 3) {
    return; // Không thể quay lại step 2 hay step 1 khi đã ở step 3
  }
  if (step === 2 && (!step1.soNumber || !step1.waNumber)) {
    cyberToast.warning('Vui lòng hoàn thành Bước 1 trước!');
    return;
  }
  if (step === 3 && !hasRequiredRegisters.value) {
    cyberToast.warning('Vui lòng hoàn thành Bước 2 (đọc thanh ghi) trước!');
    return;
  }
  currentStep.value = step;
}

function finishAndReset() {
  resetAll();
  currentStep.value = 1;
}

function resetAll() {
  step1.soNumber = '';
  step1.waNumber = '';
  step1.itemCode = '';
  isSoOpen.value = false;
  isWaOpen.value = false;
  workAssignments.value = [];
  registerData.FW_CODE = '';
  registerData.FW_VERSION = '';
  registerData.HW_VERSION = '';
  registerData.ME_VERSION = '';
  registerData.deviceEUI = '';
  registerData['LRW appEUI'] = '';
  registerData['LRW appKey'] = '';
  registerData['region code'] = '';
  registerData.class = '';
  registerData['sensor type'] = '';
  registerData.SERIAL_NUMBER = '';
  registerData.ITEM_CODE = '';
  readCompleted.value = false;
  readProgress.value = 0;
  readingStatusText.value = 'Sẵn sàng';
  step3Result.status = 'IDLE';
  step3Result.message = '';
  cyberToast.info('Đã làm mới form tạo thiết bị');
}

onMounted(() => {
  loadSalesOrders();
  loadNetworkServers();
});
</script>

<style scoped>
.create-device-test-panel {
  animation: fadeIn 0.15s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
