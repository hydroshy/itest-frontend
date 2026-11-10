<template>
  <div class="simulation-create-view space-y-4">
    <!-- Header: Unified Simulation Flow & Auto Check -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold tracking-wide uppercase text-base-content">
                CREATE SIMULATION FLOW
              </h2>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1.5 text-base-content/80"
            @click="$emit('switch-tab', 'list-flow-simulation')"
          >
            <List class="w-3.5 h-3.5" />
            <span>Danh Sách Flow</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1"
            @click="resetForm"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Làm Mới
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            :disabled="savingProfile"
            @click="saveSimulationProfile"
          >
            <span v-if="savingProfile" class="loading loading-spinner loading-xs"></span>
            <Save v-else class="w-3.5 h-3.5" />
            Lưu Kịch Bản Unified
          </button>
        </div>
      </div>
    </div>

    <!-- Section 1: Cấu hình Thiết Bị Cần Test (DUT) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-accent font-mono font-bold">1. THIẾT BỊ ĐƯỢC TEST (DUT)</span>
        </div>
        <div v-if="dutFields.length > 0" class="badge badge-sm badge-success font-mono font-bold">
          {{ dutFields.length }} fields giải mã
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <!-- Tên Kịch Bản -->
        <div class="form-control lg:col-span-2">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">PROFILE_NAME</span>
          </label>
          <input
            v-model="profileForm.name"
            type="text"
            class="input input-bordered input-sm w-full text-xs"
            placeholder=""
          />
        </div>

        <!-- ITEM_CODE -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">ITEM_CODE</span>
          </label>
          <input
            v-model="profileForm.itemCode"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder=""
            @input="onDutInputChanged"
          />
        </div>

        <!-- FW_VERSION -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">FW_VERSION</span>
          </label>
          <input
            v-model="profileForm.fwVersion"
            type="text"
            class="input input-bordered input-sm w-full font-mono text-xs uppercase"
            placeholder=""
            @input="onDutInputChanged"
          />
        </div>

        <!-- Sensor connectivity -->
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold">CONNECTIVITY</span>
          </label>
          <select
            v-model="profileForm.sensorConnectivity"
            class="select select-bordered select-sm w-full text-xs font-medium"
          >
            <option value="LoRaWAN">LoRaWAN</option>
            <option value="Sigfox">Sigfox</option>
          </select>
        </div>

        <!-- SIMU ID -->
        <div class="form-control">
          <label class="label py-1 flex items-center justify-between">
            <span class="label-text text-xs font-semibold">SIMU ID</span>
          </label>
          <input
            :value="generatedSimuId"
            type="text"
            readonly
            disabled
            class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold bg-base-300/60 cursor-not-allowed"
            placeholder=""
          />
        </div>
      </div>

      <!-- Action fetch field data cho DUT -->
      <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-sm btn-primary gap-1.5"
          :disabled="loadingDutFields || (!profileForm.itemCode.trim() && !profileForm.fwVersion.trim())"
          @click="fetchDutFields"
        >
          <span v-if="loadingDutFields" class="loading loading-spinner loading-xs"></span>
          <RefreshCw v-else class="w-3.5 h-3.5" />
          <span>{{ loadingDutFields ? 'Đang nạp field data…' : 'Lấy Field Data từ Decoder' }}</span>
        </button>

        <p v-if="dutFieldsError" class="text-error text-xs font-semibold bg-error/10 px-2.5 py-1 rounded">
          {{ dutFieldsError }}
        </p>

        <!-- Preview chip các fields giải mã -->
        <div v-if="dutFields.length > 0" class="flex flex-wrap gap-1 items-center">
          <span class="text-[11px] text-base-content/60 font-semibold mr-1">Fields:</span>
          <span
            v-for="f in dutFields.slice(0, 8)"
            :key="f.name"
            class="badge badge-xs badge-outline font-mono text-[10px]"
          >
            {{ f.name }}<span v-if="f.unit" class="text-primary ml-0.5">({{ f.unit }})</span>
          </span>
          <span v-if="dutFields.length > 8" class="badge badge-xs badge-neutral font-mono text-[9px]">
            +{{ dutFields.length - 8 }} khác
          </span>
        </div>
      </div>
    </div>

    <!-- Section 2: Thiết Bị Tham Chiếu (Reference Devices) & Thiết Bị Mô Phỏng (Simulator) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-warning font-mono font-bold">REF DEVICE</span>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-primary gap-1.5"
          @click="addReferenceDevice"
        >
          <Plus class="w-4 h-4" />
          <span>Thêm Thiết Bị Tham Chiếu</span>
        </button>
      </div>

      <!-- Danh sách Reference Devices -->
      <div v-if="referenceDevices.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
        Không có thiết bị tham chiếu nào.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(refDev, idx) in referenceDevices"
          :key="refDev.id"
          class="p-3 bg-base-100 rounded-lg border border-base-300 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-warning flex items-center gap-1.5 font-mono">
              ⭐ THIẾT BỊ THAM CHIẾU #{{ idx + 1 }}
            </span>
            <div class="flex items-center gap-2">
              <span v-if="refDev.fields?.length" class="badge badge-xs badge-success font-mono">
                {{ refDev.fields.length }} fields
              </span>
              <button
                type="button"
                class="btn btn-xs btn-ghost text-error"
                @click="removeReferenceDevice(idx)"
              >
                <Trash2 class="w-3 h-3 mr-0.5" />
                Xóa
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">REFERENCE_NAME</span>
              </label>
              <input
                v-model="refDev.reference_name"
                type="text"
                class="input input-bordered input-xs w-full text-xs"
                placeholder=""
              />
            </div>
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">ITEM_CODE</span>
              </label>
              <input
                v-model="refDev.item_code"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                placeholder=""
                @input="onRefInputChanged(refDev)"
              />
            </div>
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">FW_VERSION</span>
              </label>
              <input
                v-model="refDev.fw_version"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                placeholder=""
                @input="onRefInputChanged(refDev)"
              />
            </div>
            <div class="form-control flex justify-end pb-0.5">
              <button
                type="button"
                class="btn btn-sm btn-primary w-full gap-1.5"
                :disabled="refDev.loading || (!refDev.item_code.trim() && !refDev.fw_version.trim())"
                @click="fetchRefDeviceFields(refDev)"
              >
                <span v-if="refDev.loading" class="loading loading-spinner loading-xs"></span>
                <span v-else>{{ refDev.fields && refDev.fields.length > 0 ? `${refDev.fields.length} fields` : 'Lấy Field Data' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Thiết bị mô phỏng (Simulator Device - Có thể để trống) -->
      <div class="p-3 bg-base-100/60 rounded-lg border border-base-300">
        <div class="flex items-center justify-between pb-1 mb-1">
          <label class="label cursor-pointer gap-2 p-0">
            <input
              v-model="simulatorEnabled"
              type="checkbox"
              class="checkbox checkbox-xs checkbox-primary"
            />
            <span class="text-xs font-semibold text-base-content/80">Cấu hình Thiết Bị Mô Phỏng (Simulator Device)</span>
          </label>
          <span class="text-[11px] text-base-content/50 italic">Có thể để trống hoặc dùng chung thiết bị vật lý với REF</span>
        </div>

        <div v-if="simulatorEnabled" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">Tên Thiết Bị Mô Phỏng</span>
            </label>
            <input
              v-model="simulatorForm.name"
              type="text"
              class="input input-bordered input-xs w-full text-xs"
              placeholder=""
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5 flex items-center justify-between">
              <span class="label-text text-[11px] font-semibold">ITEM_CODE Mô Phỏng</span>
              <span v-if="simulatorForm.fields.length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                {{ simulatorForm.fields.length }} fields
              </span>
            </label>
            <input
              v-model="simulatorForm.item_code"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs uppercase"
              placeholder=""
              @input="onSimulatorInputChanged"
            />
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">DevEUI / Network ID</span>
            </label>
            <input
              v-model="simulatorForm.dev_eui"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs uppercase"
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Quy Trình Function Blocks (Flow Simulation) -->
    <div class="space-y-2">
      <SimulationFlowBuilder
        v-model="flowBlocks"
        :devices="allSimulationDeviceItems"
        :reference-devices="referenceDevices"
        :dut-name="profileForm.name || profileForm.itemCode || 'DUT'"
      />
    </div>

    <!-- Section 4: Tiêu Chuẩn Auto Check (Gộp cùng Simulation Flow) -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-base-content/10 pb-2">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-success font-mono font-bold">AUTO CHECK</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-primary gap-1.5"
            @click="() => addDutRule()"
          >
            <Plus class="w-4 h-4" />
            <span>Thêm Quy Tắc</span>
          </button>
          <button
            v-if="referenceDevices.length > 0"
            type="button"
            class="btn btn-sm btn-primary gap-1.5"
            @click="() => addComparisonRule()"
          >
            <Plus class="w-4 h-4" />
            <span>So Sánh Tham Chiếu</span>
          </button>
        </div>
      </div>

      <!-- Khung Hiển Thị Các Biến Có Trong Flow Simulation -->
      <div class="p-3 bg-base-100 rounded-xl border border-primary/20 space-y-2">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <Variable class="w-4 h-4 text-primary" />
            <span class="text-xs font-bold uppercase tracking-wide text-primary">
              VARIABLE IN FLOW SIMULATION
            </span>
            <span class="badge badge-xs badge-primary font-mono font-bold">
              {{ simulationVariables.length }} BIẾN
            </span>
          </div>
        </div>

        <!-- Trạng thái chưa có biến -->
        <div
          v-if="simulationVariables.length === 0"
          class="p-2.5 bg-base-200/50 rounded-lg border border-dashed border-base-300 text-xs text-base-content/60 flex items-center gap-2"
        >
          <Info class="w-4 h-4 text-info shrink-0" />
          <span>Chưa có biến nào trong flow.</span>
        </div>

        <!-- Danh sách biến dạng Chips / Cards -->
        <div v-else class="flex flex-wrap gap-1.5">
          <div
            v-for="v in simulationVariables"
            :key="v.name"
            class="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-base-200/90 hover:bg-primary/10 border border-base-300 hover:border-primary/50 rounded-lg transition-all text-xs cursor-pointer shadow-xs"
            title="Nhấn để thêm nhanh quy tắc Auto Check cho biến này"
            @click="addRuleForVariable(v.name)"
          >
            <span class="badge badge-xs font-mono font-bold" :class="getVariableBadgeClass(v.sourceType)">
              {{ v.sourceType.toUpperCase() }}
            </span>
            <span class="font-mono font-bold text-primary group-hover:underline">
              {{ v.name }}
            </span>
            <span class="text-[11px] text-base-content/60">
              ({{ v.details }})
            </span>
            <span class="badge badge-ghost badge-xs text-[10px] text-base-content/50 font-mono">
              {{ v.sourceBlock }}
            </span>
            <Plus class="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <!-- Danh Sách Quy Tắc Kiểm Tra (DUT, REF & Biến Simulation) -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wide text-base-content/70">
          Quy Tắc Đánh Giá
        </h4>

        <div v-if="dutRules.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
          Chưa có quy tắc Auto Check nào. Nhấn "+ Thêm Quy Tắc" hoặc click vào biến simulation ở trên để tạo quy tắc.
        </div>

        <div
          v-for="(rule, rIdx) in dutRules"
          :key="rIdx"
          class="p-3 bg-base-100 rounded-lg border border-base-300 space-y-2"
        >
          <div class="flex items-center justify-between border-b border-base-200 pb-1.5">
            <span class="text-xs font-mono font-bold text-primary">#{{ rIdx + 1 }} {{ rule.function_name }}</span>
            <button
              type="button"
              class="btn btn-xs btn-ghost text-error"
              @click="dutRules.splice(rIdx, 1)"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <!-- Loại Hàm Check -->
            <div class="form-control">
              <label class="label py-0.5">
                <span class="label-text text-[11px] font-semibold">FUNCTION_NAME</span>
              </label>
              <select
                v-model="rule.function_name"
                class="select select-bordered select-xs w-full font-sans text-xs"
              >
                <option value="CHECKVALUE">CHECKVALUE (Ngưỡng Min &lt;= Giá trị &lt;= Max)</option>
                <option value="CHECKCOUNT">CHECKCOUNT (Kiểm tra số lượng gói tin)</option>
                <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW (Counter_End - Counter_Start)</option>
                <option value="AVERAGE">AVERAGE (Hàm tính trung bình độc lập)</option>
              </select>
            </div>

            <!-- Trường Kiểm Tra (Parameter Field / Biến Simulation) -->
            <div class="form-control">
              <label class="label py-0.5 flex justify-between">
                <span class="label-text text-[11px] font-semibold">PARAMETER_NAME</span>
                <span v-if="rule.parameter_name" class="text-[10px] text-primary cursor-pointer hover:underline" @click="rule.parameter_name = ''">Xóa</span>
              </label>
              <input
                v-model="rule.parameter_name"
                :list="'param-datalist-' + rIdx"
                type="text"
                class="input input-bordered input-xs w-full font-mono text-xs text-primary font-semibold"
                placeholder=""
              />
              <datalist :id="'param-datalist-' + rIdx">
                <!-- 1. Biến Simulation Flow -->
                <option v-for="v in simulationVariables" :key="'var-' + v.name" :value="v.name">
                  [Biến Simulation] {{ v.name }} - {{ v.details }}
                </option>
                <!-- 2. DUT Fields (bao gồm decoder fields và RSSI, SNR, FCNT, FREQ của DUT khi đã lấy) -->
                <option v-for="f in dutFieldNames" :key="'dut-' + f" :value="f">
                  [DUT Field] {{ f }}
                </option>
                <!-- 3. Reference Device Fields (bao gồm decoder fields và RSSI, SNR, FCNT, FREQ của từng REF khi đã lấy) -->
                <option v-for="rf in allRefFields" :key="'ref-' + rf.label" :value="rf.fieldName">
                  [{{ rf.refName }}] {{ rf.fieldName }}
                </option>
              </datalist>

              <!-- Mini source tag below input -->
              <div v-if="rule.parameter_name" class="flex items-center gap-1 mt-0.5">
                <span
                  v-if="isSimulationVar(rule.parameter_name)"
                  class="badge badge-xs badge-info font-mono text-[9px] gap-0.5"
                >
                  <Variable class="w-2.5 h-2.5" />
                  Biến Simulation
                </span>
                <span
                  v-else-if="isDutField(rule.parameter_name)"
                  class="badge badge-xs badge-accent font-mono text-[9px] gap-0.5"
                >
                  <Cpu class="w-2.5 h-2.5" />
                  Field DUT
                </span>
                <span
                  v-else-if="isRefField(rule.parameter_name)"
                  class="badge badge-xs badge-warning font-mono text-[9px] gap-0.5"
                >
                  <Cpu class="w-2.5 h-2.5" />
                  Field REF
                </span>
                <span
                  v-else
                  class="badge badge-xs badge-ghost font-mono text-[9px]"
                >
                  Tùy chỉnh
                </span>
              </div>
            </div>

            <!-- Form fields theo loại hàm -->
            <template v-if="rule.function_name === 'CHECKVALUE'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">LOW_THRESHOLD</span>
                </label>
                <input
                  v-model.number="rule.low_threshold"
                  type="number"
                  step="any"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">HIGH_THRESHOLD</span>
                </label>
                <input
                  v-model.number="rule.high_threshold"
                  type="number"
                  step="any"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
              </div>
            </template>

            <template v-else-if="rule.function_name === 'MEASUREMENT_WINDOW'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">WINDOW_ID</span>
                </label>
                <input
                  v-model="rule.measurement_window_id"
                  type="text"
                  class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                  placeholder=""
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">MIN_COUNT</span>
                </label>
                <input
                  v-model.number="rule.min_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
              </div>
            </template>

            <template v-else-if="rule.function_name === 'AVERAGE'">
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">AVERAGE_MODE</span>
                </label>
                <select
                  v-model="rule.average_mode"
                  class="select select-bordered select-xs w-full font-sans text-xs"
                >
                  <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW</option>
                  <option value="SAMPLE_COUNT">SAMPLE_COUNT</option>
                  <option value="TIME_WINDOW">TIME_WINDOW</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">SAMPLE_COUNT / WINDOW_ID</span>
                </label>
                <input
                  v-if="rule.average_mode === 'SAMPLE_COUNT'"
                  v-model.number="rule.sample_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
                <input
                  v-else
                  v-model="rule.measurement_window_id"
                  type="text"
                  class="input input-bordered input-xs w-full font-mono text-xs uppercase"
                  placeholder=""
                />
              </div>
            </template>

            <template v-else>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">MIN_COUNT</span>
                </label>
                <input
                  v-model.number="rule.min_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
              </div>
              <div class="form-control">
                <label class="label py-0.5">
                  <span class="label-text text-[11px] font-semibold">MAX_COUNT</span>
                </label>
                <input
                  v-model.number="rule.max_count"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-full font-mono text-xs"
                  placeholder=""
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- So Sánh Dung Sai DUT vs Reference Devices (Tolerance Comparisons) -->
      <div v-if="referenceDevices.length > 0" class="space-y-2 pt-2 border-t border-base-200">
        <h4 class="text-xs font-bold uppercase tracking-wide text-warning">
          So sánh tham chiếu
        </h4>

        <div v-if="comparisons.length === 0" class="p-3 bg-base-100/60 rounded-lg border border-dashed border-base-300 text-center text-xs text-base-content/50 italic">
          Chưa có quy tắc so sánh tham chiếu. Nhấn "+ So sánh tham chiếu" để thiết lập đối chiếu.
        </div>

        <div
          v-for="(comp, cIdx) in comparisons"
          :key="cIdx"
          class="p-2.5 bg-base-100 rounded-lg border border-base-300 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
        >
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">DUT_FIELD</span>
            </label>
            <input
              v-model="comp.dut_field"
              :list="'comp-dut-list-' + cIdx"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs text-accent font-semibold"
              placeholder=""
            />
            <datalist :id="'comp-dut-list-' + cIdx">
              <option v-for="f in dutFieldNames" :key="'dut-comp-' + f" :value="f">
                [DUT Field] {{ f }}
              </option>
              <option v-for="v in simulationVariables" :key="'var-comp-' + v.name" :value="v.name">
                [Biến Simulation] {{ v.name }} - {{ v.details }}
              </option>
            </datalist>
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">REFERENCE_FIELD</span>
            </label>
            <input
              v-model="comp.reference_field"
              :list="'comp-ref-list-' + cIdx"
              type="text"
              class="input input-bordered input-xs w-full font-mono text-xs text-warning font-semibold"
              placeholder=""
            />
            <datalist :id="'comp-ref-list-' + cIdx">
              <option v-for="rf in allRefFields" :key="'ref-comp-' + rf.label" :value="rf.fieldName">
                [{{ rf.refName }}] {{ rf.fieldName }}
              </option>
              <option v-for="v in simulationVariables" :key="'var-ref-comp-' + v.name" :value="v.name">
                [Biến Simulation] {{ v.name }} - {{ v.details }}
              </option>
            </datalist>
          </div>
          <div class="form-control">
            <label class="label py-0.5">
              <span class="label-text text-[11px] font-semibold">TOLERANCE</span>
            </label>
            <input
              v-model.number="comp.tolerance"
              type="number"
              step="any"
              class="input input-bordered input-xs w-full font-mono text-xs"
              placeholder=""
            />
          </div>
          <div class="flex justify-end pt-4">
            <button
              type="button"
              class="btn btn-xs btn-ghost text-error"
              @click="comparisons.splice(cIdx, 1)"
            >
              <Trash2 class="w-3.5 h-3.5 mr-1" />
              Xóa
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
  Save,
  List,
  RefreshCw,
  Plus,
  Trash2,
  Variable,
  Info,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';
import SimulationFlowBuilder, {
  type FlowBlock,
  type SimulationDeviceItem,
} from './SimulationFlowBuilder.vue';

const emit = defineEmits<{
  (e: 'packet-emitted', packet: any): void;
  (e: 'switch-tab', tab: string, payload?: any): void;
}>();

// DUT Form state
const profileForm = reactive({
  name: '',
  sensorConnectivity: 'LoRaWAN',
  skuSuffix: '',
  fwVersion: '',
  itemCode: '',
});

// Sku prefix reacts to sensor connectivity
const skuPrefix = computed(() => {
  return profileForm.sensorConnectivity === 'Sigfox' ? 'WSSFC-' : 'WSLRW-';
});

const fullSku = computed(() => {
  const suffix = profileForm.skuSuffix.trim();
  return suffix ? `${skuPrefix.value}${suffix}` : '';
});

// SIMU ID auto-generated from ITEM_CODE and FW
const generatedSimuId = computed(() => {
  const item = profileForm.itemCode.trim();
  const fw = profileForm.fwVersion.trim();
  if (!item && !fw) return '';
  if (item && fw) return `SIMU-${item}-${fw}`;
  if (item) return `SIMU-${item}`;
  return `SIMU-${fw}`;
});

// DUT Fields State
const dutFields = ref<Array<{ name: string; label: string; unit?: string }>>([]);
const loadingDutFields = ref(false);
const dutFieldsError = ref('');

async function fetchDutFields() {
  const itemCode = profileForm.itemCode.trim();
  const fwVersion = profileForm.fwVersion.trim();
  if (!itemCode && !fwVersion) return;

  loadingDutFields.value = true;
  dutFieldsError.value = '';
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', {
      params: {
        itemCode,
        fwVersion,
        longFw: fwVersion,
      },
    });
    const payload = res?.data?.fields !== undefined ? res.data : (res?.fields !== undefined ? res : res?.data || {});
    let fields: Array<{ name: string; label: string; unit?: string }> = payload.fields ?? payload.data?.fields ?? [];
    if (Array.isArray(fields) && fields.length > 0) {
      const standardMetrics = [
        { name: 'RSSI', label: 'RSSI (Chỉ số sóng dBm)', unit: 'dBm' },
        { name: 'SNR', label: 'SNR (Tỷ số tín hiệu/nhiễu dB)', unit: 'dB' },
        { name: 'FCNT', label: 'FCNT (Bộ đếm gói uplink)' },
        { name: 'FREQ', label: 'FREQ (Tần số vô tuyến MHz)', unit: 'MHz' },
      ];
      for (const sm of standardMetrics) {
        if (!fields.some((f: any) => (f.name || f).toUpperCase() === sm.name)) {
          fields.push(sm);
        }
      }
      dutFields.value = fields;
      cyberToast.success(`Đã nạp ${fields.length} trường (gồm decoder, RSSI, SNR, FCNT, FREQ) cho DUT`);
    } else {
      dutFields.value = [];
    }
  } catch (err: any) {
    dutFieldsError.value = 'Không thể lấy field data cho DUT từ decoder';
  } finally {
    loadingDutFields.value = false;
  }
}

let dutFetchTimeout: any = null;
function onDutInputChanged() {
  clearTimeout(dutFetchTimeout);
  if (profileForm.itemCode.trim() && profileForm.fwVersion.trim()) {
    dutFetchTimeout = setTimeout(() => {
      fetchDutFields();
    }, 600);
  }
}

// Reference Devices State (Multi-reference support)
export interface ReferenceDeviceFormItem {
  id: string;
  reference_name: string;
  item_code: string;
  fw_version: string;
  fields?: Array<{ name: string; label?: string; unit?: string }>;
  loading?: boolean;
}

const referenceDevices = ref<ReferenceDeviceFormItem[]>([]);

function addReferenceDevice() {
  referenceDevices.value.push({
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reference_name: `Reference Device ${referenceDevices.value.length + 1}`,
    item_code: '',
    fw_version: '',
    fields: [],
    loading: false,
  });
}

function removeReferenceDevice(index: number) {
  referenceDevices.value.splice(index, 1);
}

async function fetchRefDeviceFields(refDev: ReferenceDeviceFormItem) {
  const code = refDev.item_code.trim();
  const fw = refDev.fw_version.trim();
  if (!code && !fw) return;

  refDev.loading = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', {
      params: { itemCode: code, fwVersion: fw, longFw: fw },
    });
    const payload = res?.data?.fields !== undefined ? res.data : (res?.fields !== undefined ? res : res?.data || {});
    let fields: Array<{ name: string; label?: string; unit?: string }> = payload.fields ?? payload.data?.fields ?? [];
    if (Array.isArray(fields) && fields.length > 0) {
      const standardMetrics = [
        { name: 'RSSI', label: 'RSSI (Chỉ số sóng dBm)', unit: 'dBm' },
        { name: 'SNR', label: 'SNR (Tỷ số tín hiệu/nhiễu dB)', unit: 'dB' },
        { name: 'FCNT', label: 'FCNT (Bộ đếm gói uplink)' },
        { name: 'FREQ', label: 'FREQ (Tần số vô tuyến MHz)', unit: 'MHz' },
      ];
      for (const sm of standardMetrics) {
        if (!fields.some((f: any) => (f.name || f).toUpperCase() === sm.name)) {
          fields.push(sm);
        }
      }
      refDev.fields = fields;
      cyberToast.success(`Đã nạp ${fields.length} trường (gồm decoder, RSSI, SNR, FCNT, FREQ) cho ${refDev.reference_name || 'thiết bị tham chiếu'}`);
    } else {
      refDev.fields = [];
    }
  } catch {
    cyberToast.warning(`Không tìm thấy decoder cho thiết bị tham chiếu ${code}`);
  } finally {
    refDev.loading = false;
  }
}

const refFetchTimeouts = new Map<string, any>();
function onRefInputChanged(refDev: ReferenceDeviceFormItem) {
  if (refFetchTimeouts.has(refDev.id)) {
    clearTimeout(refFetchTimeouts.get(refDev.id));
  }
  if (refDev.item_code.trim()) {
    const t = setTimeout(() => {
      fetchRefDeviceFields(refDev);
    }, 600);
    refFetchTimeouts.set(refDev.id, t);
  }
}

// Simulator Device State
const simulatorEnabled = ref(false);
const simulatorForm = reactive({
  name: '',
  item_code: '',
  fw_version: '',
  dev_eui: '',
  fields: [] as Array<{ name: string; label?: string; unit?: string }>,
  loading: false,
});

let simuFetchTimeout: any = null;
function onSimulatorInputChanged() {
  clearTimeout(simuFetchTimeout);
  if (simulatorForm.item_code.trim()) {
    simuFetchTimeout = setTimeout(() => {
      fetchSimulatorFields();
    }, 600);
  }
}

async function fetchSimulatorFields() {
  const code = simulatorForm.item_code.trim();
  const fw = simulatorForm.fw_version.trim();
  if (!code && !fw) return;

  simulatorForm.loading = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', {
      params: { itemCode: code, fwVersion: fw, longFw: fw },
    });
    const payload = res?.data?.fields !== undefined ? res.data : (res?.fields !== undefined ? res : res?.data || {});
    let fields: Array<{ name: string; label?: string; unit?: string }> = payload.fields ?? payload.data?.fields ?? [];
    const standardMetrics = [
      { name: 'RSSI', label: 'RSSI (Chỉ số sóng dBm)', unit: 'dBm' },
      { name: 'SNR', label: 'SNR (Tỷ số tín hiệu/nhiễu dB)', unit: 'dB' },
      { name: 'FCNT', label: 'FCNT (Bộ đếm gói uplink)' },
      { name: 'FREQ', label: 'FREQ (Tần số vô tuyến MHz)', unit: 'MHz' },
    ];
    const merged = Array.isArray(fields) ? [...fields] : [];
    for (const sm of standardMetrics) {
      if (!merged.some((f: any) => (f.name || f).toUpperCase() === sm.name)) {
        merged.push(sm);
      }
    }
    simulatorForm.fields = merged;
    cyberToast.success(`Đã tự động nạp ${merged.length} trường cho thiết bị mô phỏng`);
  } catch {
    simulatorForm.fields = [
      { name: 'RSSI', label: 'RSSI (Chỉ số sóng dBm)', unit: 'dBm' },
      { name: 'SNR', label: 'SNR (Tỷ số tín hiệu/nhiễu dB)', unit: 'dB' },
      { name: 'FCNT', label: 'FCNT (Bộ đếm gói uplink)' },
      { name: 'FREQ', label: 'FREQ (Tần số vô tuyến MHz)', unit: 'MHz' },
    ];
  } finally {
    simulatorForm.loading = false;
  }
}

// Flow Blocks state
const flowBlocks = ref<FlowBlock[]>([]);

// Simulation Variables Extraction
export interface SimulationVariableInfo {
  name: string;
  sourceBlock: string;
  sourceType: string;
  blockIndex: number;
  target?: string;
  details?: string;
}

const simulationVariables = computed<SimulationVariableInfo[]>(() => {
  const vars: SimulationVariableInfo[] = [];
  const seen = new Set<string>();

  flowBlocks.value.forEach((b: FlowBlock, idx: number) => {
    const fnType = b.functionType;
    if (fnType === 'average' && b.outputVar && b.outputVar.trim()) {
      const vName = b.outputVar.trim();
      if (!seen.has(vName)) {
        seen.add(vName);
        vars.push({
          name: vName,
          sourceBlock: `Block #${idx + 1}: Average`,
          sourceType: 'average',
          blockIndex: idx + 1,
          target: b.targetDevice || 'DUT',
          details: `Average [${b.averageMode || 'WINDOW'}] của '${b.metric || 'metric'}'`,
        });
      }
    } else if (fnType === 'calculate_linear') {
      if (b.coeffAVar && b.coeffAVar.trim()) {
        const vName = b.coeffAVar.trim();
        if (!seen.has(vName)) {
          seen.add(vName);
          vars.push({
            name: vName,
            sourceBlock: `Block #${idx + 1}: Linear Slope`,
            sourceType: 'calculate_linear',
            blockIndex: idx + 1,
            target: 'SIMU',
            details: `Hệ số góc (Slope) a từ 2 điểm`,
          });
        }
      }
      if (b.coeffBVar && b.coeffBVar.trim()) {
        const vName = b.coeffBVar.trim();
        if (!seen.has(vName)) {
          seen.add(vName);
          vars.push({
            name: vName,
            sourceBlock: `Block #${idx + 1}: Linear Offset`,
            sourceType: 'calculate_linear',
            blockIndex: idx + 1,
            target: 'SIMU',
            details: `Hệ số bù (Offset) b từ 2 điểm`,
          });
        }
      }
    } else if ((fnType === 'start_measurement' || fnType === 'stop_measurement') && b.windowId && b.windowId.trim()) {
      const vName = b.windowId.trim();
      if (!seen.has(vName)) {
        seen.add(vName);
        vars.push({
          name: vName,
          sourceBlock: `Block #${idx + 1}: Measurement Window`,
          sourceType: 'window',
          blockIndex: idx + 1,
          target: b.targetDevice || 'DUT',
          details: `Window ID đo lường đếm gói`,
        });
      }
    } else if (b.outputVar && b.outputVar.trim()) {
      const vName = b.outputVar.trim();
      if (!seen.has(vName)) {
        seen.add(vName);
        vars.push({
          name: vName,
          sourceBlock: `Block #${idx + 1}: ${fnType}`,
          sourceType: fnType,
          blockIndex: idx + 1,
          target: b.targetDevice || 'DUT',
          details: `Output var từ block ${fnType}`,
        });
      }
    }
  });

  return vars;
});

// Normalized Field Names for DUT & Reference Devices
const dutFieldNames = computed<string[]>(() => {
  return (dutFields.value || [])
    .map((f: any) => (typeof f === 'string' ? f : (f.name || f.field || '')))
    .filter(Boolean);
});

const allRefFields = computed<Array<{ refName: string; fieldName: string; label: string }>>(() => {
  const result: Array<{ refName: string; fieldName: string; label: string }> = [];
  referenceDevices.value.forEach((r, idx) => {
    const rName = r.reference_name || `REF_${idx + 1}`;
    const fields = (r.fields || []).map((f: any) => (typeof f === 'string' ? f : (f.name || f.field || ''))).filter(Boolean);
    fields.forEach((f: string) => {
      result.push({
        refName: rName,
        fieldName: f,
        label: `${rName} -> ${f}`,
      });
    });
  });

  if (simulatorEnabled.value && simulatorForm.fields && simulatorForm.fields.length > 0) {
    const sName = simulatorForm.name || 'SIMU';
    simulatorForm.fields.forEach((f: any) => {
      const fName = typeof f === 'string' ? f : (f.name || f.field || '');
      if (fName) {
        result.push({
          refName: sName,
          fieldName: fName,
          label: `${sName} -> ${fName}`,
        });
      }
    });
  }

  return result;
});

function isSimulationVar(name: string): boolean {
  if (!name) return false;
  return simulationVariables.value.some((v) => v.name.toLowerCase() === name.trim().toLowerCase());
}

function isDutField(name: string): boolean {
  if (!name) return false;
  return dutFieldNames.value.some((f) => f.toLowerCase() === name.trim().toLowerCase());
}

function isRefField(name: string): boolean {
  if (!name) return false;
  return allRefFields.value.some((rf) => rf.fieldName.toLowerCase() === name.trim().toLowerCase());
}

function getVariableBadgeClass(type: string): string {
  switch (type) {
    case 'average':
      return 'badge-primary text-primary-content';
    case 'calculate_linear':
      return 'badge-secondary text-secondary-content';
    case 'window':
      return 'badge-info text-info-content';
    default:
      return 'badge-accent text-accent-content';
  }
}

// DUT AutoCheck Rules State
export interface AutoCheckRuleItem {
  function_name: string;
  parameter_name: string;
  low_threshold?: number;
  high_threshold?: number;
  min_count?: number;
  max_count?: number;
  measurement_window_id?: string;
  average_mode?: string;
  sample_count?: number;
}

const dutRules = ref<AutoCheckRuleItem[]>([]);

function addDutRule(defaultParam?: string | Event) {
  const param = typeof defaultParam === 'string' ? defaultParam : '';
  const initialParam = param
    || (simulationVariables.value.length > 0 ? simulationVariables.value[0].name : '')
    || (dutFieldNames.value.length > 0 ? dutFieldNames.value[0] : '');

  dutRules.value.push({
    function_name: 'CHECKVALUE',
    parameter_name: initialParam,
    low_threshold: 0,
    high_threshold: 100,
    min_count: 1,
    max_count: 100,
  });
}

function addRuleForVariable(varName: string) {
  dutRules.value.push({
    function_name: 'CHECKVALUE',
    parameter_name: varName,
    low_threshold: 0,
    high_threshold: 100,
    min_count: 1,
    max_count: 100,
  });
  cyberToast.info(`Đã thêm quy tắc kiểm tra cho biến '${varName}'`);
}

// Tolerance Comparisons State
export interface ToleranceComparisonItem {
  dut_field: string;
  reference_field: string;
  tolerance: number;
}

const comparisons = ref<ToleranceComparisonItem[]>([]);

function addComparisonRule() {
  const dutParam = dutFieldNames.value.length > 0 ? dutFieldNames.value[0] : (simulationVariables.value[0]?.name || '');
  const refParam = allRefFields.value.length > 0 ? allRefFields.value[0].fieldName : '';

  comparisons.value.push({
    dut_field: dutParam,
    reference_field: refParam,
    tolerance: 5,
  });
}

function resetForm() {
  profileForm.name = '';
  profileForm.sensorConnectivity = 'LoRaWAN';
  profileForm.skuSuffix = '';
  profileForm.fwVersion = '';
  profileForm.itemCode = '';
  dutFields.value = [];
  referenceDevices.value = [];
  simulatorEnabled.value = false;
  simulatorForm.name = '';
  simulatorForm.item_code = '';
  simulatorForm.dev_eui = '';
  flowBlocks.value = [];
  dutRules.value = [];
  comparisons.value = [];
  cyberToast.info('Đã làm mới form');
}

// Simulation devices for target dropdown
const simulationDevices = ref<any[]>([]);
const simulationDeviceItems = computed<SimulationDeviceItem[]>(() => {
  return simulationDevices.value.map((d) => ({
    id: d.id,
    devEui: d.devEui || d.dev_eui || '',
    name: d.name || d.device_name || '',
    itemCode: d.itemCode || d.item_code || '',
    status: d.status || '',
  }));
});

const allSimulationDeviceItems = computed<SimulationDeviceItem[]>(() => {
  const list = [...simulationDeviceItems.value];
  if (simulatorEnabled.value && simulatorForm.name.trim()) {
    list.unshift({
      devEui: simulatorForm.dev_eui || '',
      name: simulatorForm.name.trim(),
      itemCode: simulatorForm.item_code,
    });
  }
  return list;
});

async function fetchSimulationDevices() {
  try {
    const res: any = await httpClient
      .get('/plugins/testing/simulation/devices')
      .catch(() => httpClient.get('/plugins/testing/simulation-devices'));
    const items = res?.data?.items || res?.data || res?.items || [];
    simulationDevices.value = Array.isArray(items) ? items : [];
  } catch {
    simulationDevices.value = [];
  }
}

// Save Unified Profile
const savingProfile = ref(false);

async function saveSimulationProfile() {
  if (!profileForm.itemCode.trim() && !profileForm.name.trim()) {
    cyberToast.warning('Vui lòng nhập ITEM_CODE hoặc Tên Kịch Bản!');
    return;
  }

  savingProfile.value = true;
  const simuId = generatedSimuId.value || `SIMU-${Date.now()}`;
  const profileName = profileForm.name.trim() || simuId;

  const autoCheckCriteriaPayload = {
    dut: {
      item_code: profileForm.itemCode,
      fw_version: profileForm.fwVersion,
      fields: dutFields.value.map((f) => f.name),
      function_rules: dutRules.value,
    },
    reference_devices: referenceDevices.value.map((r) => ({
      reference_name: r.reference_name,
      item_code: r.item_code,
      fw_version: r.fw_version,
      fields: (r.fields || []).map((f) => f.name),
    })),
    comparisons: comparisons.value,
  };

  const payload = {
    name: profileName,
    profileName: profileName,
    simuId,
    sensorConnectivity: profileForm.sensorConnectivity,
    sku: fullSku.value,
    longFw: profileForm.fwVersion,
    fwVersion: profileForm.fwVersion,
    itemCode: profileForm.itemCode,
    flowBlocks: flowBlocks.value,
    referenceDevices: referenceDevices.value.map((r) => ({
      reference_name: r.reference_name,
      item_code: r.item_code,
      fw_version: r.fw_version,
    })),
    simulatorDevice: simulatorEnabled.value && simulatorForm.item_code ? simulatorForm : null,
    autoCheckCriteria: autoCheckCriteriaPayload,
  };

  try {
    await httpClient.post('/plugins/testing/simulation/profiles', payload);
    cyberToast.success('Đã lưu kịch bản Unified Simulation & Auto Check thành công!');
    emit('switch-tab', 'list-flow-simulation');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu kịch bản';
    cyberToast.error(msg);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(() => {
  fetchSimulationDevices();
});
</script>
