<template>
  <div class="simulation-flow-builder space-y-4">
    <!-- Flow Header Controls -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-sm tracking-wide">QUY TRÌNH FUNCTION BLOCKS (FLOW SIMULATION)</span>
              <span class="badge badge-sm badge-primary font-mono font-bold">{{ blocks.length }} BLOCKS</span>
              <span class="badge badge-sm badge-outline font-mono">
                <Clock class="w-3 h-3 mr-1" />
                Tổng Thời Lượng: {{ totalDurationSeconds }}s ({{ (totalDurationSeconds / 60).toFixed(1) }} phút)
              </span>
              <span v-if="hasReferenceDevice" class="badge badge-sm badge-warning font-mono font-bold">
                CÓ THIẾT BỊ CHUẨN (REF)
              </span>
              <span v-if="hasMeasurementWindow" class="badge badge-sm badge-info font-mono font-bold">
                CÓ MEASUREMENT WINDOW
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-ghost text-base-content/70"
            @click="showJsonModal = true"
            title="Xem / Chỉnh sửa cấu trúc JSON"
          >
            <Code class="w-3.5 h-3.5 mr-1" />
            JSON
          </button>

          <button
            v-if="blocks.length > 0"
            type="button"
            class="btn btn-sm btn-ghost text-error"
            @click="clearAllBlocks"
            title="Xóa hết các blocks"
          >
            <Trash2 class="w-3.5 h-3.5 mr-1" />
            Xóa Hết
          </button>

          <!-- Add Function Block Dropdown / Quick Buttons -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" role="button" class="btn btn-sm btn-primary gap-1">
              <Plus class="w-4 h-4" />
              <span>+ Thêm Function Block</span>
            </label>
            <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300 text-xs space-y-1">
              <li class="menu-title text-[10px] uppercase font-bold text-primary">Điều Khiển &amp; Thời Gian</li>
              <li><a @click="addBlock('downlink')">📡 Downlink (Gửi lệnh vô tuyến)</a></li>
              <li><a @click="addBlock('clear_downlink')">🧹 Clear Downlink (FlushQueue)</a></li>
              <li><a @click="addBlock('delay')">⏱️ Delay (Chờ thời gian)</a></li>
              <li><a @click="addBlock('wait_until_offset')">🎯 Wait Until Offset (Mốc thời gian)</a></li>
              <li class="menu-title text-[10px] uppercase font-bold text-primary mt-1">Đo Lường &amp; Hiệu Chuẩn</li>
              <li><a @click="addBlock('start_measurement')">🟢 Start Measurement Window</a></li>
              <li><a @click="addBlock('stop_measurement')">🔴 Stop Measurement Window</a></li>
              <li><a @click="addBlock('average')">📊 Average Function (Trung bình)</a></li>
              <li><a @click="addBlock('calculate_linear')">📐 Calculate Linear (y = ax + b)</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="blocks.length === 0"
      class="card bg-base-200/50 border border-dashed border-base-content/20 rounded-box p-8 text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mx-auto text-base-content/50">
        <Layers class="w-6 h-6" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-base-content">Chưa có Function Block nào</h4>
      </div>
      <div class="flex items-center justify-center pt-1">
        <div class="dropdown dropdown-top dropdown-center">
          <label tabindex="0" role="button" class="btn btn-sm btn-primary gap-1">
            <Plus class="w-4 h-4" />
            <span>+ Thêm Function Block</span>
          </label>
          <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300 text-xs space-y-1">
            <li class="menu-title text-[10px] uppercase font-bold text-primary">Điều Khiển &amp; Thời Gian</li>
            <li><a @click="addBlock('downlink')">📡 Downlink (Gửi lệnh vô tuyến)</a></li>
            <li><a @click="addBlock('clear_downlink')">🧹 Clear Downlink (FlushQueue)</a></li>
            <li><a @click="addBlock('delay')">⏱️ Delay (Chờ thời gian)</a></li>
            <li><a @click="addBlock('wait_until_offset')">🎯 Wait Until Offset (Mốc thời gian)</a></li>
            <li class="menu-title text-[10px] uppercase font-bold text-primary mt-1">Đo Lường &amp; Hiệu Chuẩn</li>
            <li><a @click="addBlock('start_measurement')">🟢 Start Measurement Window</a></li>
            <li><a @click="addBlock('stop_measurement')">🔴 Stop Measurement Window</a></li>
            <li><a @click="addBlock('average')">📊 Average Function (Trung bình)</a></li>
            <li><a @click="addBlock('calculate_linear')">📐 Calculate Linear (y = ax + b)</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Sequential Block Chain -->
    <div v-else class="space-y-3">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="relative transition-all"
      >
        <!-- Block Card -->
        <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 hover:border-primary/40 transition-colors">
          <!-- Block Header -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10 gap-2 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge badge-sm font-mono font-bold bg-base-300">
                #{{ index + 1 }}
              </span>

              <span class="badge badge-sm font-bold uppercase tracking-wider" :class="getFunctionBadgeClass(block.functionType)">
                {{ getFunctionLabel(block.functionType) }}
              </span>

              <template v-if="block.targetDevice">
                <span v-if="block.targetDevice === 'DUT'" class="badge badge-sm badge-accent font-mono font-semibold">
                  🎯 DUT (Thiết Bị Cần Test)
                </span>
                <span v-else-if="block.targetDevice === 'REF'" class="badge badge-sm badge-warning font-mono font-semibold">
                  ⭐ REF (Thiết Bị Chuẩn)
                </span>
                <span v-else-if="block.targetDevice === 'SIMU'" class="badge badge-sm badge-info font-mono font-semibold">
                  🤖 SIMU (Thiết Bị Mô Phỏng)
                </span>
              </template>

              <span v-if="block.functionType === 'delay'" class="badge badge-sm badge-outline font-mono">
                ⏱️ Chờ {{ block.delaySeconds || 0 }}s
              </span>
              <span v-else-if="block.functionType === 'wait_until_offset'" class="badge badge-sm badge-outline font-mono">
                🎯 Mốc {{ block.offsetSeconds || 0 }}s
              </span>
              <span v-else-if="block.windowId" class="badge badge-sm badge-ghost font-mono text-[10px]">
                Window: {{ block.windowId }}
              </span>
            </div>

            <!-- Block Header Actions -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === 0"
                @click="moveBlockUp(index)"
                title="Di chuyển lên trên"
              >
                <ArrowUp class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === blocks.length - 1"
                @click="moveBlockDown(index)"
                title="Di chuyển xuống dưới"
              >
                <ArrowDown class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                @click="duplicateBlock(index)"
                title="Nhân bản block"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square text-error hover:bg-error/20"
                @click="removeBlock(index)"
                title="Xóa block này"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Block Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- 1. Chọn Function Type -->
            <div class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Hàm Thực Thi (Function)</span>
              </label>
              <select
                v-model="block.functionType"
                class="select select-bordered select-sm w-full font-sans"
                @change="onFunctionTypeChanged(block)"
              >
                <optgroup label="Điều Khiển &amp; Thời Gian">
                  <option value="downlink">Downlink (Gửi lệnh vô tuyến)</option>
                  <option value="clear_downlink">Clear Downlink (FlushQueue)</option>
                  <option value="delay">Delay (Thời gian chờ kịch bản)</option>
                  <option value="wait_until_offset">Wait Until Offset (Mốc thời gian)</option>
                </optgroup>
                <optgroup label="Đo Lường &amp; Hiệu Chuẩn">
                  <option value="start_measurement">Start Measurement Window</option>
                  <option value="stop_measurement">Stop Measurement Window</option>
                  <option value="average">Average Function (Tính trung bình)</option>
                  <option value="calculate_linear">Calculate Linear (y = ax + b)</option>
                </optgroup>
              </select>
            </div>

            <!-- 2. Thiết bị mục tiêu: DUT / REF / SIMU (Áp dụng cho các block có target) -->
            <div
              v-if="hasDeviceTarget(block.functionType)"
              class="form-control md:col-span-4"
            >
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thiết Bị Mục Tiêu</span>
              </label>
              <select
                v-model="block.targetDevice"
                class="select select-bordered select-sm w-full font-mono text-xs"
                @change="emitUpdate"
              >
                <option value="DUT">🎯 Thiết bị được test (DUT)</option>
                <option value="REF">⭐ Thiết bị chuẩn đối chiếu (REF)</option>
                <option value="SIMU">🤖 Thiết bị mô phỏng (SIMU)</option>
              </select>
            </div>

            <!-- 3. Form fields riêng cho từng loại Block -->

            <!-- BLOCK: DELAY -->
            <div v-if="block.functionType === 'delay'" class="form-control md:col-span-8">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thời Gian Chờ (Delay)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.delaySeconds"
                  type="number"
                  min="1"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder="30"
                  @input="emitUpdate"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Khoảng {{ ((block.delaySeconds || 0) / 60).toFixed(1) }} phút chờ ổn định.
                </span>
              </label>
            </div>

            <!-- BLOCK: WAIT_UNTIL_OFFSET -->
            <div v-if="block.functionType === 'wait_until_offset'" class="form-control md:col-span-8">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Mốc Thời Gian Offset (Từ Bắt Đầu Simulation)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.offsetSeconds"
                  type="number"
                  min="0"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder="120"
                  @input="emitUpdate"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Đợi cho đến phút thứ {{ ((block.offsetSeconds || 0) / 60).toFixed(1) }} tính từ lúc bắt đầu simulation, loại trừ sai lệch do thời gian xử lý step.
                </span>
              </label>
            </div>

            <!-- BLOCK: DOWNLINK -->
            <template v-if="block.functionType === 'downlink'">
              <div class="form-control md:col-span-2">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">FPort</span>
                </label>
                <input
                  v-model.number="block.fPort"
                  type="number"
                  min="1"
                  max="223"
                  class="input input-bordered input-sm w-full font-mono text-xs text-center"
                  placeholder="1"
                  @input="emitUpdate"
                />
              </div>

              <div class="form-control md:col-span-2 flex items-center justify-center pt-5">
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="block.confirmed"
                    type="checkbox"
                    class="checkbox checkbox-xs checkbox-primary"
                    @change="emitUpdate"
                  />
                  <span class="label-text text-xs">Confirmed</span>
                </label>
              </div>

              <div class="form-control md:col-span-12">
                <div class="flex items-center justify-between py-0.5">
                  <label class="label-text text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <span>Downlink Payload (HEX hoặc Dynamic Variable)</span>
                    <span
                      v-if="block.payloadHex && !isDynamicPayload(block.payloadHex)"
                      class="badge badge-xs font-mono"
                      :class="getHexValidation(block.payloadHex).valid ? 'badge-success' : 'badge-error'"
                    >
                      {{ getHexValidation(block.payloadHex).bytes }} bytes
                    </span>
                    <span
                      v-else-if="block.payloadHex && isDynamicPayload(block.payloadHex)"
                      class="badge badge-xs badge-info font-mono"
                    >
                      DYNAMIC VARIABLE
                    </span>
                  </label>
                  <span class="text-[10px] text-base-content/50 font-mono">
                    Hỗ trợ Hex hoặc biến: <code class="text-primary">&#123;&#123;calib_payload_hex&#125;&#125;</code>, <code class="text-primary">&#123;&#123;a&#125;&#125; &#123;&#123;b&#125;&#125;</code>
                  </span>
                </div>
                <input
                  v-model="block.payloadHex"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="VD: 01 02 hoặc {{calib_payload_hex}}"
                  @input="onPayloadInput(block)"
                />
              </div>
            </template>

            <!-- BLOCK: START_MEASUREMENT -->
            <template v-if="block.functionType === 'start_measurement'">
              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Mã Cửa Sổ (Window ID)</span>
                </label>
                <input
                  v-model="block.windowId"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs uppercase"
                  placeholder="VD: WINDOW_0PPM"
                  @input="emitUpdate"
                />
              </div>
              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Trường Đếm (Counter Field)</span>
                </label>
                <input
                  v-model="block.counterField"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="Mặc định: fcnt"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- BLOCK: STOP_MEASUREMENT -->
            <template v-if="block.functionType === 'stop_measurement'">
              <div class="form-control md:col-span-8">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Mã Cửa Sổ Cần Đóng (Window ID)</span>
                </label>
                <input
                  v-model="block.windowId"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs uppercase"
                  placeholder="VD: WINDOW_0PPM"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- BLOCK: AVERAGE -->
            <template v-if="block.functionType === 'average'">
              <div class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Chế Độ Tính Average</span>
                </label>
                <select
                  v-model="block.averageMode"
                  class="select select-bordered select-sm w-full font-sans text-xs"
                  @change="emitUpdate"
                >
                  <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW (Theo Window ID)</option>
                  <option value="SAMPLE_COUNT">SAMPLE_COUNT (Theo N mẫu)</option>
                  <option value="TIME_WINDOW">TIME_WINDOW (Theo khoảng giây)</option>
                </select>
              </div>

              <div class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Trường Metric (Sensor/RF)</span>
                </label>
                <input
                  v-model="block.metric"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="VD: gas_raw, rssi, snr..."
                  @input="emitUpdate"
                />
              </div>

              <div v-if="block.averageMode === 'MEASUREMENT_WINDOW'" class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Thuộc Window ID</span>
                </label>
                <input
                  v-model="block.windowId"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs uppercase"
                  placeholder="VD: WINDOW_0PPM"
                  @input="emitUpdate"
                />
              </div>

              <div v-else-if="block.averageMode === 'SAMPLE_COUNT'" class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Số Mẫu (N)</span>
                </label>
                <input
                  v-model.number="block.sampleCount"
                  type="number"
                  min="1"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="10"
                  @input="emitUpdate"
                />
              </div>

              <div v-else class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Khoảng Giây (Duration)</span>
                </label>
                <input
                  v-model.number="block.delaySeconds"
                  type="number"
                  min="1"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="60"
                  @input="emitUpdate"
                />
              </div>

              <div class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Lưu Vào Biến Output</span>
                </label>
                <input
                  v-model="block.outputVar"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold"
                  placeholder="VD: x1 hoặc raw_avg_0ppm"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- BLOCK: CALCULATE_LINEAR -->
            <template v-if="block.functionType === 'calculate_linear'">
              <div class="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-2 p-2.5 bg-base-100 rounded-lg border border-base-300">
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 1 - Raw x1 (DUT/Biến)</span>
                  </label>
                  <input
                    v-model="block.point1X"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder="VD: {{x1}} hoặc 100"
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 1 - Chuẩn y1 (ppm)</span>
                  </label>
                  <input
                    v-model.number="block.point1Y"
                    type="number"
                    step="any"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder="0"
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 2 - Raw x2 (DUT/Biến)</span>
                  </label>
                  <input
                    v-model="block.point2X"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder="VD: {{x2}} hoặc 500"
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 2 - Chuẩn y2 (ppm)</span>
                  </label>
                  <input
                    v-model.number="block.point2Y"
                    type="number"
                    step="any"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder="20"
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control col-span-2">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Biến Output Hệ Số a (Slope)</span>
                  </label>
                  <input
                    v-model="block.coeffAVar"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs text-primary font-bold"
                    placeholder="a"
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control col-span-2">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Biến Output Hệ Số b (Offset)</span>
                  </label>
                  <input
                    v-model="block.coeffBVar"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs text-secondary font-bold"
                    placeholder="b"
                    @input="emitUpdate"
                  />
                </div>
              </div>
            </template>

            <!-- Description / Ghi chú chung cho block -->
            <div class="form-control md:col-span-12">
              <label class="label py-0.5">
                <span class="label-text text-[11px] text-base-content/60">Ghi Chú Bước</span>
              </label>
              <input
                v-model="block.description"
                type="text"
                class="input input-bordered input-xs w-full text-xs"
                placeholder="Mô tả mục đích của block này..."
                @input="emitUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Preview / Import Modal -->
    <dialog class="modal" :class="{ 'modal-open': showJsonModal }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-content/10 shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <Code class="w-4 h-4 text-primary" />
            Cấu Hình JSON Function Blocks
          </h3>
          <button
            type="button"
            class="btn btn-sm btn-ghost btn-circle"
            @click="showJsonModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-base-content/70">
            Bạn có thể sao chép hoặc dán JSON các function blocks chuẩn để cấu hình nhanh:
          </p>

          <textarea
            v-model="rawJsonInput"
            class="textarea textarea-bordered font-mono text-xs w-full h-64 bg-base-200"
            placeholder="Dán mảng JSON blocks..."
          ></textarea>
        </div>

        <div class="modal-action flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            @click="copyJsonToClipboard"
          >
            <Copy class="w-3.5 h-3.5 mr-1" />
            Sao Chép JSON
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-ghost"
              @click="showJsonModal = false"
            >
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="applyJsonInput"
            >
              Áp Dụng JSON
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="showJsonModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  Code,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';

export interface FlowBlock {
  id: string;
  functionType:
    | 'downlink'
    | 'clear_downlink'
    | 'delay'
    | 'wait_until_offset'
    | 'start_measurement'
    | 'stop_measurement'
    | 'average'
    | 'calculate_linear'
    | string;
  targetDevice?: 'DUT' | 'REF' | 'SIMU' | string;
  delaySeconds?: number;
  offsetSeconds?: number;
  windowId?: string;
  counterField?: string;
  metric?: string;
  averageMode?: 'SAMPLE_COUNT' | 'TIME_WINDOW' | 'MEASUREMENT_WINDOW';
  sampleCount?: number;
  outputVar?: string;
  point1X?: string | number;
  point1Y?: string | number;
  point2X?: string | number;
  point2Y?: string | number;
  coeffAVar?: string;
  coeffBVar?: string;
  payloadHex?: string;
  fPort?: number;
  confirmed?: boolean;
  description?: string;
}

export interface SimulationDeviceItem {
  id?: string;
  devEui: string;
  name?: string;
  itemCode?: string;
  status?: string;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: FlowBlock[];
    devices?: SimulationDeviceItem[];
  }>(),
  {
    modelValue: () => [],
    devices: () => [],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FlowBlock[]): void;
}>();

const blocks = ref<FlowBlock[]>([]);
const showJsonModal = ref(false);
const rawJsonInput = ref('');

// Sync with modelValue prop and normalize legacy blocks
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(blocks.value)) {
      const raw = Array.isArray(newVal) ? newVal : [];
      blocks.value = raw.map((b) => normalizeBlock(b));
    }
  },
  { immediate: true, deep: true }
);

function normalizeBlock(b: any): FlowBlock {
  let fnType = b.functionType || b.type || 'downlink';
  if (fnType === 'downlink_hex') fnType = 'downlink';
  if (fnType === 'delay_wait') fnType = 'delay';

  const rawTarget = (b.targetDevice || b.target || 'DUT').toUpperCase();
  const normalizedTarget = rawTarget === 'REF' ? 'REF' : rawTarget === 'SIMU' ? 'SIMU' : 'DUT';

  return {
    id: b.id || `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: fnType,
    targetDevice: hasDeviceTarget(fnType) ? normalizedTarget : undefined,
    delaySeconds: fnType === 'delay' ? (Number(b.delaySeconds) || 30) : undefined,
    offsetSeconds: fnType === 'wait_until_offset' ? (Number(b.offsetSeconds) || 0) : undefined,
    windowId: b.windowId || b.window_id || '',
    counterField: b.counterField || b.counter_field || (fnType === 'start_measurement' ? 'fcnt' : ''),
    metric: b.metric || '',
    averageMode: b.averageMode || b.average_mode || 'MEASUREMENT_WINDOW',
    sampleCount: Number(b.sampleCount || b.sample_count) || undefined,
    outputVar: b.outputVar || b.output_var || '',
    point1X: b.point1X ?? b.point1_x ?? '',
    point1Y: b.point1Y ?? b.point1_y ?? 0,
    point2X: b.point2X ?? b.point2_x ?? '',
    point2Y: b.point2Y ?? b.point2_y ?? 20,
    coeffAVar: b.coeffAVar || b.coeff_a_var || 'a',
    coeffBVar: b.coeffBVar || b.coeff_b_var || 'b',
    payloadHex: fnType === 'downlink' ? (b.payloadHex || b.payload || '') : '',
    fPort: fnType === 'downlink' ? (Number(b.fPort || b.fport) || 1) : undefined,
    confirmed: Boolean(b.confirmed || b.isConfirmed),
    description: b.description || '',
  };
}

function hasDeviceTarget(type: string): boolean {
  return ['downlink', 'clear_downlink', 'start_measurement', 'stop_measurement', 'average'].includes(type);
}

function isDynamicPayload(str: string): boolean {
  return typeof str === 'string' && str.includes('{{') && str.includes('}}');
}

function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(blocks.value)));
}

// Compute total duration of flow (sum of delay blocks or maximum offset)
const totalDurationSeconds = computed(() => {
  let delaySum = 0;
  let maxOffset = 0;
  for (const b of blocks.value) {
    if (b.functionType === 'delay') {
      delaySum += Number(b.delaySeconds) || 0;
    } else if (b.functionType === 'wait_until_offset') {
      const off = Number(b.offsetSeconds) || 0;
      if (off > maxOffset) maxOffset = off;
    }
  }
  return Math.max(delaySum, maxOffset);
});

// Check if flow involves reference device
const hasReferenceDevice = computed(() => {
  return blocks.value.some((b) => b.targetDevice === 'REF');
});

// Check if flow involves measurement window
const hasMeasurementWindow = computed(() => {
  return blocks.value.some((b) => b.functionType === 'start_measurement' || b.functionType === 'average');
});

// Hex validation helper
function getHexValidation(hexStr: string): { valid: boolean; bytes: number } {
  if (!hexStr) return { valid: false, bytes: 0 };
  if (isDynamicPayload(hexStr)) return { valid: true, bytes: 0 };
  const clean = hexStr.replace(/\s+/g, '');
  if (!clean) return { valid: false, bytes: 0 };
  const isHex = /^[0-9A-Fa-f]+$/.test(clean);
  const isEven = clean.length % 2 === 0;
  return {
    valid: isHex && isEven,
    bytes: isEven ? clean.length / 2 : Math.floor(clean.length / 2),
  };
}

function onPayloadInput(block: FlowBlock) {
  if (!block.payloadHex) {
    emitUpdate();
    return;
  }
  if (!isDynamicPayload(block.payloadHex)) {
    const clean = block.payloadHex.replace(/[^0-9A-Fa-f\s]/g, '').toUpperCase();
    block.payloadHex = clean;
  }
  emitUpdate();
}

function onFunctionTypeChanged(block: FlowBlock) {
  if (block.functionType === 'delay') {
    block.delaySeconds = block.delaySeconds || 30;
    block.targetDevice = undefined;
  } else if (block.functionType === 'wait_until_offset') {
    block.offsetSeconds = block.offsetSeconds || 120;
    block.targetDevice = undefined;
  } else if (block.functionType === 'start_measurement') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.windowId = block.windowId || 'WINDOW_01';
    block.counterField = block.counterField || 'fcnt';
  } else if (block.functionType === 'stop_measurement') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.windowId = block.windowId || 'WINDOW_01';
  } else if (block.functionType === 'average') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.averageMode = block.averageMode || 'MEASUREMENT_WINDOW';
    block.metric = block.metric || 'gas_raw';
    block.windowId = block.windowId || 'WINDOW_01';
    block.outputVar = block.outputVar || 'x1';
  } else if (block.functionType === 'calculate_linear') {
    block.targetDevice = undefined;
    block.point1X = block.point1X || '{{x1}}';
    block.point1Y = block.point1Y ?? 0;
    block.point2X = block.point2X || '{{x2}}';
    block.point2Y = block.point2Y ?? 20;
    block.coeffAVar = block.coeffAVar || 'a';
    block.coeffBVar = block.coeffBVar || 'b';
  } else if (block.functionType === 'downlink') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.fPort = block.fPort || 1;
  } else if (block.functionType === 'clear_downlink') {
    block.targetDevice = block.targetDevice || 'DUT';
  }
  emitUpdate();
}

function getFunctionBadgeClass(type: string) {
  switch (type) {
    case 'downlink':
      return 'badge-primary text-primary-content';
    case 'clear_downlink':
      return 'badge-secondary text-secondary-content';
    case 'delay':
      return 'badge-accent text-accent-content';
    case 'wait_until_offset':
      return 'badge-neutral text-neutral-content';
    case 'start_measurement':
      return 'badge-success text-success-content';
    case 'stop_measurement':
      return 'badge-error text-error-content';
    case 'average':
      return 'badge-warning text-warning-content';
    case 'calculate_linear':
      return 'badge-info text-info-content';
    default:
      return 'badge-neutral';
  }
}

function getFunctionLabel(type: string) {
  switch (type) {
    case 'downlink':
      return 'GỬI DOWNLINK';
    case 'clear_downlink':
      return 'CLEAR DOWNLINK (FLUSH)';
    case 'delay':
      return 'DELAY (CHỜ)';
    case 'wait_until_offset':
      return 'WAIT UNTIL OFFSET';
    case 'start_measurement':
      return 'START MEASUREMENT';
    case 'stop_measurement':
      return 'STOP MEASUREMENT';
    case 'average':
      return 'AVERAGE FUNCTION';
    case 'calculate_linear':
      return 'CALCULATE LINEAR (y = ax + b)';
    default:
      return 'FUNCTION';
  }
}

// Block Actions
function addBlock(type: string) {
  const newBlock: FlowBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: type,
    targetDevice: hasDeviceTarget(type) ? 'DUT' : undefined,
    delaySeconds: type === 'delay' ? 30 : undefined,
    offsetSeconds: type === 'wait_until_offset' ? 120 : undefined,
    windowId: ['start_measurement', 'stop_measurement', 'average'].includes(type) ? 'WINDOW_01' : undefined,
    counterField: type === 'start_measurement' ? 'fcnt' : undefined,
    metric: type === 'average' ? 'gas_raw' : undefined,
    averageMode: type === 'average' ? 'MEASUREMENT_WINDOW' : undefined,
    outputVar: type === 'average' ? 'x1' : undefined,
    point1X: type === 'calculate_linear' ? '{{x1}}' : undefined,
    point1Y: type === 'calculate_linear' ? 0 : undefined,
    point2X: type === 'calculate_linear' ? '{{x2}}' : undefined,
    point2Y: type === 'calculate_linear' ? 20 : undefined,
    coeffAVar: type === 'calculate_linear' ? 'a' : undefined,
    coeffBVar: type === 'calculate_linear' ? 'b' : undefined,
    payloadHex: type === 'downlink' ? '01 02' : '',
    fPort: type === 'downlink' ? 1 : undefined,
    confirmed: false,
    description: '',
  };
  blocks.value.push(newBlock);
  emitUpdate();
}

function removeBlock(index: number) {
  blocks.value.splice(index, 1);
  emitUpdate();
}

function duplicateBlock(index: number) {
  const source = blocks.value[index];
  const clone: FlowBlock = {
    ...JSON.parse(JSON.stringify(source)),
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description: source.description ? `${source.description} (Bản sao)` : '',
  };
  blocks.value.splice(index + 1, 0, clone);
  emitUpdate();
  cyberToast.info('Đã nhân bản block thành công');
}

function moveBlockUp(index: number) {
  if (index <= 0) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index - 1, 0, item);
  emitUpdate();
}

function moveBlockDown(index: number) {
  if (index >= blocks.value.length - 1) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index + 1, 0, item);
  emitUpdate();
}

function clearAllBlocks() {
  blocks.value = [];
  emitUpdate();
  cyberToast.info('Đã xóa toàn bộ function blocks');
}

// JSON Modal helpers
watch(showJsonModal, (open) => {
  if (open) {
    rawJsonInput.value = JSON.stringify(blocks.value, null, 2);
  }
});

function copyJsonToClipboard() {
  navigator.clipboard.writeText(rawJsonInput.value);
  cyberToast.success('Đã sao chép JSON vào bộ nhớ đệm');
}

function applyJsonInput() {
  try {
    const parsed = JSON.parse(rawJsonInput.value);
    if (Array.isArray(parsed)) {
      blocks.value = parsed.map((b) => normalizeBlock(b));
      emitUpdate();
      showJsonModal.value = false;
      cyberToast.success('Đã áp dụng cấu hình JSON vào Flow Blocks');
    } else {
      cyberToast.error('Dữ liệu JSON phải là một mảng (array) các blocks');
    }
  } catch {
    cyberToast.error('Cấu trúc JSON không hợp lệ');
  }
}
</script>
