<template>
  <div class="device-test-batch-panel space-y-4">
    <!-- Top Header Banner -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Boxes class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Parallel Testing</span>
              <span
                class="badge badge-xs font-mono font-bold"
                :class="isTesting ? 'badge-warning animate-pulse' : testFinished ? 'badge-success' : 'badge-ghost'"
              >
                {{ isTesting ? 'TESTING IN PROGRESS' : testFinished ? 'COMPLETED' : 'IDLE / READY' }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-base-content mt-0.5">
              Device Test Batch (Kiểm Thử Hàng Loạt &amp; Đối Chiếu Thiết Bị Chuẩn)
            </h3>
            <p class="text-xs text-base-content/70">
              Chạy song song kịch bản Simulation Flow &amp; tự động đối chiếu thông số với các thiết bị chuẩn (Golden Reference) riêng biệt
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- Step 1: Chọn Cấu Hình Đợt Test (ITEM-CODE & FW_VERSION Tự Động) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            1. Chọn Cấu Hình Đợt Test (Tự Động Theo Test Batch)
          </h4>
        </div>
        <div v-if="selectedBatchConfig" class="text-xs text-base-content/70 font-mono">
          Batch Code: <span class="text-primary font-bold">{{ selectedBatchConfig.batchCode || selectedBatchConfig.batch_code }}</span>
          | Max: <span class="font-bold text-info">{{ selectedBatchConfig.maxDevices || 5 }} thiết bị</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <!-- Choose Test Batch (Primary Selector) - 6 cols -->
        <div class="form-control md:col-span-6">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold text-primary flex items-center gap-1.5">
              <FolderPlus class="w-3.5 h-3.5" />
              Chọn Test Batch <span class="text-error">*</span>
            </span>
            <span v-if="selectedBatchConfig" class="badge badge-xs badge-primary font-mono">Đã chọn</span>
          </label>
          <select
            v-model="selectedBatchId"
            class="select select-sm select-bordered w-full text-xs bg-base-100 font-mono font-bold"
            :disabled="isTesting"
            @change="onBatchSelectChange"
          >
            <option value="">-- Chọn Test Batch để kiểm thử --</option>
            <option v-for="b in savedBatches" :key="b.id" :value="b.id">
              {{ b.batchCode || b.batch_code }} - {{ b.batchName || b.name }} ({{ b.itemCode }} / {{ b.longFw || b.fwVersion }})
            </option>
          </select>
        </div>

        <!-- Auto-selected ITEM-CODE - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold flex items-center gap-1">
              ITEM-CODE
            </span>
            <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Tự động theo batch</span>
          </label>
          <input
            :value="filterItemCode || 'Chưa chọn batch'"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-300/40 border-base-300 font-bold text-base-content cursor-not-allowed select-all"
            title="ITEM-CODE tự động nhận diện từ Test Batch đã chọn"
          />
        </div>

        <!-- Auto-selected FW_VERSION - 3 cols -->
        <div class="form-control md:col-span-3">
          <label class="label py-1">
            <span class="label-text text-xs font-semibold flex items-center gap-1">
              FW_VERSION
            </span>
            <span class="badge badge-xs badge-ghost font-mono text-[10px] text-base-content/60">Tự động theo batch</span>
          </label>
          <input
            :value="filterFwVersion || 'Chưa chọn batch'"
            type="text"
            readonly
            class="input input-sm input-bordered w-full font-mono text-xs uppercase bg-base-300/40 border-base-300 font-bold text-base-content cursor-not-allowed select-all"
            title="FW_VERSION tự động nhận diện từ Test Batch đã chọn"
          />
        </div>
      </div>
    </div>

    <!-- Step 2: Danh Sách Thiết Bị Cần Test (Full-width) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-primary" />
              <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
                2. Thiết Bị Sẵn Sàng Thêm Vào Batch
              </h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-sm badge-neutral font-mono text-[11px]">
                {{ candidateDevices.length }} khả dụng
              </span>
              <button
                class="btn btn-ghost btn-xs btn-circle"
                title="Tải lại danh sách thiết bị testing"
                :disabled="loadingDevices"
                @click="loadAvailableDevices"
              >
                <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loadingDevices }" />
              </button>
            </div>
          </div>

          <!-- Search and filter toggle bar -->
          <div class="space-y-2">
            <div class="relative w-full">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                v-model="searchCandidateText"
                type="text"
                class="input input-xs input-bordered w-full pl-8 font-mono text-[11px]"
                placeholder="Tìm theo Serial, DevEUI, ITEM-CODE..."
              />
            </div>

            <div class="flex items-center justify-between text-[11px] text-base-content/70">
              <label class="cursor-pointer label py-0 px-0 gap-1.5">
                <input
                  v-model="filterOnlyBatchMatches"
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary"
                />
                <span class="label-text text-[11px]">Chỉ khớp ITEM-CODE của batch (<strong class="font-mono text-primary">{{ filterItemCode || 'Tất cả' }}</strong>)</span>
              </label>
              <span class="font-mono text-[10px] text-base-content/50">
                Hiển thị {{ candidateDevices.length }} / {{ allRawCandidateDevices.length }}
              </span>
            </div>
          </div>

          <!-- Candidates Table -->
          <div class="overflow-y-auto max-h-[380px] border border-base-300 rounded-lg">
            <table class="table table-zebra table-xs w-full">
              <thead class="sticky top-0 bg-base-200 z-10 text-[11px] uppercase">
                <tr>
                  <th class="w-8">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary"
                      :checked="isAllCandidatesSelected"
                      :disabled="candidateDevices.length === 0 || isTesting"
                      @change="toggleSelectAllCandidates"
                    />
                  </th>
                  <th>Serial / DevEUI</th>
                  <th>ITEM-CODE</th>
                  <th>FW Ver</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingDevices">
                  <td colspan="5" class="text-center py-6 text-primary text-xs">
                    <span class="loading loading-spinner loading-xs mr-2"></span>
                    Đang tải danh sách thiết bị testing...
                  </td>
                </tr>
                <tr v-else-if="candidateDevices.length === 0">
                  <td colspan="5" class="text-center py-6 text-base-content/50 italic text-xs">
                    {{ allRawCandidateDevices.length === 0 ? 'Chưa có thiết bị nào trong danh sách Testing Device.' : 'Không tìm thấy thiết bị nào khớp bộ lọc tìm kiếm.' }}
                  </td>
                </tr>
                <tr v-for="dev in candidateDevices" :key="dev.id || dev.devEui || dev.serialNumber" class="hover">
                  <td>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-xs checkbox-primary"
                      :checked="isDeviceSelected(dev)"
                      :disabled="isTesting || (!isDeviceSelected(dev) && selectedDevices.length >= maxAllowedDevices)"
                      @change="toggleDeviceSelection(dev)"
                    />
                  </td>
                  <td>
                    <div class="font-mono font-bold text-xs text-primary">{{ dev.serialNumber || dev.serial_number || dev.registrationCode || dev.registration_code || dev.id }}</div>
                    <div class="font-mono text-[10px] text-base-content/60">{{ dev.devEui || dev.dev_eui || '—' }}</div>
                  </td>
                  <td>
                    <span class="badge badge-xs badge-outline font-mono">{{ dev.itemCode || dev.item_code || '—' }}</span>
                  </td>
                  <td>
                    <span class="font-mono text-xs">{{ dev.longFw || dev.long_fw || dev.fwVersion || dev.fw_version || '—' }}</span>
                  </td>
                  <td class="text-right">
                    <button
                      v-if="!isDeviceSelected(dev)"
                      class="btn btn-xs btn-ghost text-primary"
                      :disabled="selectedDevices.length >= maxAllowedDevices || isTesting"
                      @click="addDeviceToBatch(dev)"
                    >
                      + Thêm
                    </button>
                    <span v-else class="text-[10px] text-success font-semibold">Đã thêm</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between text-xs text-base-content/70 pt-1">
            <span>Tối đa cho phép: <strong class="text-white">{{ maxAllowedDevices }}</strong> thiết bị</span>
            <span>Đã chọn: <strong class="text-primary">{{ selectedDevices.length }}</strong> thiết bị</span>
          </div>
        </div>

    <!-- Step 3: BATCH TESTING (Full-width Stacked Below) -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div class="flex items-center gap-2">
          <Play class="w-4 h-4 text-primary" />
          <h4 class="font-bold text-xs uppercase tracking-wider text-base-content">
            3. BATCH TESTING
          </h4>
          <span v-if="selectedBatchConfig" class="badge badge-sm badge-primary font-mono text-[11px]">
            {{ selectedBatchConfig.batchCode || selectedBatchConfig.batch_code }}
          </span>
          <span v-else class="badge badge-sm badge-warning font-mono text-[11px]">
            Chưa chọn Test Batch
          </span>
        </div>
            <div class="flex items-center gap-1.5">
              <button
                v-if="requiresReferenceDevice"
                class="btn btn-xs btn-outline btn-success gap-1"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="autoAssignReferenceDevices"
              >
                <Sparkles class="w-3 h-3" />
                Tự Động Gán Thiết Bị Chuẩn
              </button>
              <button
                class="btn btn-xs btn-ghost text-error"
                :disabled="selectedDevices.length === 0 || isTesting"
                @click="clearSelectedDevices"
              >
                Xóa Hết
              </button>
            </div>
          </div>

      <section class="space-y-3" aria-labelledby="running-batches-title">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 id="running-batches-title" class="font-semibold">Test batch đang chạy của bạn ({{ runningBatches.length }})</h3>
          <button class="btn btn-sm min-h-11" :disabled="loadingRunningBatches" @click="loadRunningBatches">Làm mới danh sách</button>
        </div>
        <p v-if="runningBatchesError" role="alert" class="text-error">{{ runningBatchesError }}</p>
        <p v-else-if="!hasLoadedRunningBatches" role="status">Đang tải test batch...</p>
        <p v-else-if="!runningBatches.length">Bạn chưa có test batch nào đang chạy.</p>
        <div v-if="runningBatches.length" class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1 flex-1 min-w-0">
            <span class="text-sm">Chọn batch để xem thiết bị và đồng hồ</span>
            <select class="select select-bordered min-h-11 w-full" :value="isTesting ? selectedBatchId : ''" @change="selectRunningBatch(($event.target as HTMLSelectElement).value)">
              <option value="" disabled>Chọn test batch đang chạy</option>
              <option v-for="batch in runningBatches" :key="batch.id" :value="batch.id">{{ batch.batch_code || batch.batchCode }} · {{ batch.batch_name || batch.batchName || batch.id }}</option>
            </select>
          </label>
          <button v-if="isTesting" class="btn btn-error min-h-11" :disabled="cancellingBatch" @click="cancelSelectedBatch">{{ cancellingBatch ? 'Đang hủy...' : 'Hủy batch đang xem' }}</button>
        </div>
        <button v-if="isTesting || testFinished" class="btn min-h-11" @click="prepareNewBatch">Chuẩn bị batch khác</button>
      </section>

          <div v-if="requiresReferenceDevice" class="p-2.5 bg-base-100/60 border border-base-300 rounded-lg text-xs text-base-content/80 flex items-start gap-2">
            <Info class="w-4 h-4 text-info shrink-0 mt-0.5" />
            <div>
              <strong>Quy tắc ghép đôi chuẩn:</strong> Khi test cùng lúc nhiều thiết bị (VD: 5 thiết bị), hệ thống yêu cầu gán riêng biệt từng thiết bị chuẩn tương ứng để thu thập và đối chiếu giá trị đo độc lập theo thời gian thực.
            </div>
          </div>

    <!-- Timer belongs to the selected batch monitor. -->
    <div v-if="isTesting || testFinished" class="card bg-base-200/80 border border-primary/40 rounded-xl shadow-md p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- Timer Countdown -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-base-100/90 px-3 py-1.5 rounded-lg border border-base-300">
            <Timer class="w-5 h-5 text-warning animate-spin-slow" />
            <div>
              <div class="text-[10px] font-mono uppercase text-base-content/60">Đếm giờ Simulation Flow</div>
              <div class="text-lg font-mono font-bold tracking-wider text-warning">
                {{ formatCountdown(remainingSeconds) }}
              </div>
            </div>
          </div>

          <!-- Total Duration & Elapsed -->
          <div class="hidden sm:block text-xs font-mono text-base-content/70">
            <div>Tổng thời lượng: <span class="font-bold text-white">{{ totalDurationSeconds }}s</span></div>
            <div>Đã chạy: <span class="font-bold text-primary">{{ elapsedSeconds }}s</span></div>
          </div>
        </div>

        <!-- Simulation Flow Steps Progress -->
        <div class="flex-1 max-w-xl">
          <div class="flex items-center justify-between text-xs font-mono mb-1">
            <span class="text-primary font-bold flex items-center gap-1.5">
              <Cpu class="w-3.5 h-3.5" />
              Flow: {{ currentFlowName }}
            </span>
            <span class="text-base-content/80 font-bold">
              Bước {{ currentStepIndex + 1 }}/{{ flowSteps.length }}: {{ currentStepName }}
            </span>
          </div>
          <progress
            class="progress progress-primary w-full h-2.5 bg-base-300"
            :value="progressPercent"
            max="100"
          ></progress>
        </div>

        <!-- Verdict Summary Badges & Server Timestamps -->
        <div class="flex flex-wrap items-center gap-2">
          <div v-if="batchStartedAt" class="badge badge-ghost gap-1 font-mono text-[11px] py-2 px-2.5">
            <span>Bắt đầu: {{ formatTimestamp(batchStartedAt) }}</span>
          </div>
          <div v-if="testFinished && batchFinishedAt" class="badge badge-ghost gap-1 font-mono text-[11px] py-2 px-2.5">
            <span>Kết thúc: {{ formatTimestamp(batchFinishedAt) }}</span>
          </div>
          <div class="badge badge-success gap-1 font-mono text-xs py-2 px-2.5">
            <CheckCircle2 class="w-3.5 h-3.5" />
            PASS: {{ passCount }}/{{ selectedDevices.length }}
          </div>
          <div v-if="failCount > 0" class="badge badge-error gap-1 font-mono text-xs py-2 px-2.5">
            <AlertCircle class="w-3.5 h-3.5" />
            FAIL: {{ failCount }}/{{ selectedDevices.length }}
          </div>
          <a
            v-if="testFinished"
            class="badge badge-primary gap-1 font-mono text-xs py-2 px-2.5 cursor-pointer hover:badge-secondary transition-colors shadow-sm"
            href="/plugins/device-traceability?tab=devices"
            title="Mở xem dữ liệu đã test trong Device Traceability"
          >
            <span>Đã lưu vào Traceability (Xem ngay)</span>
          </a>
        </div>
      </div>
    </div>

          <!-- Mapped Devices Table -->
          <div class="overflow-x-auto border border-base-300 rounded-lg">
            <table class="table table-zebra table-xs w-full">
              <thead class="bg-base-200 text-[11px] uppercase">
                <tr>
                  <th>#</th>
                  <th>Thiết Bị Cần Test (DUT)</th>
                  <th v-if="requiresReferenceDevice">Thiết Bị Chuẩn Đối Chiếu (Reference Device)</th>
                  <th>Kết Quả Đối Chiếu</th>
                  <th class="text-center">Số Gói</th>
                  <th class="text-right">AVG_CYCLE</th>
                  <th class="text-right">AVG_RSSI</th>
                  <th class="text-right">AVG_SNR</th>
                  <th>Trạng Thái</th>
                  <th class="text-center">Bỏ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="selectedDevices.length === 0">
                  <td :colspan="requiresReferenceDevice ? 10 : 9" class="text-center py-8 text-base-content/50 italic text-xs">
                    Chưa có thiết bị nào trong Test Batch. Hãy chọn từ danh sách bên trên hoặc nhấn "+ Thêm".
                  </td>
                </tr>
                <tr v-for="(item, idx) in selectedDevices" :key="item.device.id" class="hover text-xs">
                  <td class="font-mono text-base-content/60">{{ idx + 1 }}</td>
                  <!-- DUT -->
                  <td>
                    <div class="font-mono font-bold text-primary">{{ item.device.serialNumber || item.device.serial_number }}</div>
                    <div class="font-mono text-[10px] text-base-content/60">{{ item.device.devEui || item.device.dev_eui }}</div>
                    <div class="text-[10px] text-base-content/70">
                      {{ item.device.itemCode }} ({{ item.device.fwVersion }})
                    </div>
                  </td>

                  <!-- Reference Device Picker -->
                  <td v-if="requiresReferenceDevice" class="min-w-[210px]">
                    <div class="space-y-1">
                      <select
                        v-model="item.referenceDeviceId"
                        class="select select-bordered select-xs w-full font-mono text-[11px] bg-base-100"
                        :disabled="isTesting"
                        @change="onReferenceDeviceChange(item)"
                      >
                        <option value="">-- Chọn thiết bị chuẩn --</option>
                        <option v-if="goldenReferenceDevices.length === 0" value="" disabled>
                          (Chưa có thiết bị chuẩn trong hệ thống)
                        </option>
                        <option
                          v-for="refDev in goldenReferenceDevices"
                          :key="refDev.id"
                          :value="refDev.id"
                        >
                          {{ refDev.name }} ({{ refDev.serialNumber }})
                        </option>
                      </select>
                      <div v-if="item.referenceDevice" class="flex items-center gap-1.5 text-[10px] font-mono text-success">
                        <CheckCircle class="w-3 h-3" />
                        <span>Mẫu chuẩn: {{ item.referenceDevice.calibratedDate || '2026-Q4' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Comparison Live Result -->
                  <td class="min-w-[170px]">
                    <div v-if="item.liveComparison" class="space-y-0.5 text-[11px] font-mono">
                      <div class="flex justify-between text-[10px] text-base-content/70 pb-0.5 border-b border-base-300/40">
                        <span>Gói tin:</span>
                        <span class="font-bold text-primary">{{ item.packetsCount ?? 0 }} gói</span>
                      </div>
                      <div v-if="item.liveComparison.dutTemp !== undefined || item.liveComparison.refTemp !== undefined" class="flex justify-between">
                        <span class="text-base-content/60">Nhiệt độ (DUT / Ref):</span>
                        <span :class="item.liveComparison.tempDeltaPass ? 'text-success' : 'text-error font-bold'">
                          <template v-if="item.liveComparison.dutTemp !== undefined">{{ item.liveComparison.dutTemp }}°C</template>
                          <template v-else>--</template>
                          /
                          <template v-if="item.liveComparison.refTemp !== undefined">{{ item.liveComparison.refTemp }}°C</template>
                          <template v-else>--</template>
                          <template v-if="item.liveComparison.tempDelta !== undefined"> (Δ {{ item.liveComparison.tempDelta }}°C)</template>
                        </span>
                      </div>
                      <div v-if="item.liveComparison.dutHum !== undefined || item.liveComparison.refHum !== undefined" class="flex justify-between">
                        <span class="text-base-content/60">Độ ẩm (DUT / Ref):</span>
                        <span :class="item.liveComparison.humDeltaPass ? 'text-success' : 'text-error font-bold'">
                          <template v-if="item.liveComparison.dutHum !== undefined">{{ item.liveComparison.dutHum }}%</template>
                          <template v-else>--</template>
                          /
                          <template v-if="item.liveComparison.refHum !== undefined">{{ item.liveComparison.refHum }}%</template>
                          <template v-else>--</template>
                          <template v-if="item.liveComparison.humDelta !== undefined"> (Δ {{ item.liveComparison.humDelta }}%)</template>
                        </span>
                      </div>
                      <div v-if="item.liveComparison.rssi !== undefined || item.liveComparison.snr !== undefined" class="flex justify-between text-[10px] text-base-content/50">
                        <span>Chất lượng RF:</span>
                        <span>{{ item.liveComparison.rssi !== undefined ? `${item.liveComparison.rssi} dBm` : '--' }} | {{ item.liveComparison.snr !== undefined ? `${item.liveComparison.snr} dB` : '--' }}</span>
                      </div>
                    </div>
                    <div v-else class="space-y-0.5 text-[11px]">
                      <div class="text-base-content/40 italic">
                        {{ isTesting ? 'Đang đọc dữ liệu...' : 'Chờ bắt đầu test' }}
                      </div>
                      <div v-if="item.packetsCount !== undefined && item.packetsCount > 0" class="text-[10px] font-mono text-base-content/60">
                        Đã nhận: <span class="font-bold text-primary">{{ item.packetsCount }} gói</span>
                      </div>
                    </div>
                  </td>

                  <!-- Số Gói Nhận Được -->
                  <td class="text-center font-mono">
                    <span class="badge badge-sm font-bold" :class="(item.packetsCount ?? 0) > 0 ? 'badge-primary' : 'badge-ghost text-base-content/50'">
                      {{ item.packetsCount ?? 0 }}
                    </span>
                  </td>

                  <!-- AVG_CYCLE -->
                  <td class="text-right font-mono">
                    <span v-if="item.avgCycle !== undefined" class="font-semibold text-primary">
                      {{ item.avgCycle.toFixed(1) }} <span class="text-[10px] text-base-content/60 font-normal">phút</span>
                    </span>
                    <span v-else class="text-base-content/40">--</span>
                  </td>

                  <!-- AVG_RSSI -->
                  <td class="text-right font-mono">
                    <span v-if="item.avgRssi !== undefined" class="font-semibold text-base-content">
                      {{ item.avgRssi.toFixed(1) }} <span class="text-[10px] text-base-content/60 font-normal">dBm</span>
                    </span>
                    <span v-else class="text-base-content/40">--</span>
                  </td>

                  <!-- AVG_SNR -->
                  <td class="text-right font-mono">
                    <span v-if="item.avgSnr !== undefined" class="font-semibold text-base-content">
                      {{ item.avgSnr.toFixed(1) }} <span class="text-[10px] text-base-content/60 font-normal">dB</span>
                    </span>
                    <span v-else class="text-base-content/40">--</span>
                  </td>

                  <!-- Status -->
                  <td>
                    <span
                      class="badge badge-xs font-mono font-bold"
                      :class="getItemStatusClass(item.status)"
                    >
                      {{ item.status || 'PENDING' }}
                    </span>
                  </td>

                  <!-- Remove Action -->
                  <td class="text-center">
                    <button
                      class="btn btn-ghost btn-xs btn-circle text-error"
                      :disabled="isTesting"
                      @click="removeDeviceFromBatch(item.device.id)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 3 Footer Action Bar: Start Test Batch & Summary -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-300">
            <div class="flex items-center gap-2 text-xs text-base-content/70">
              <span>Đã chọn: <strong class="text-primary">{{ selectedDevices.length }}</strong> thiết bị</span>
              <span v-if="selectedBatchConfig">| Giới hạn tối đa: <strong class="text-base-content">{{ maxAllowedDevices }}</strong></span>
              <span v-if="!selectedBatchId" class="badge badge-warning badge-xs font-semibold">Chưa chọn Test Batch</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="isTesting"
                class="btn btn-sm btn-error gap-1.5 shadow-sm font-semibold"
                @click="cancelSelectedBatch"
              >
                <Square class="w-4 h-4" />
                Dừng Kiểm Thử
              </button>
              <button
                v-else
                class="btn btn-sm btn-primary gap-1.5 shadow-md px-6 font-bold"
                :disabled="!selectedBatchId || selectedDevices.length === 0"
                :title="!selectedBatchId ? 'Vui lòng chọn Test Batch trước khi bấm bắt đầu' : (selectedDevices.length === 0 ? 'Vui lòng thêm ít nhất 1 thiết bị test' : 'Bắt đầu kiểm thử')"
                @click="startBatchTest"
              >
                <Play class="w-4 h-4" />
                Bắt Đầu Test Batch
              </button>
            </div>
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  Boxes,
  FolderPlus,
  Play,
  Square,
  Timer,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Layers,
  GitCompare,
  Sparkles,
  Info,
  CheckCircle,
  Trash2,
  Search,
} from 'lucide-vue-next';
import { httpClient } from '@/api/httpClient';
import { cyberToast } from '@/services/cyberToast';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
}>();

const authStore = useAuthStore();

const props = defineProps<{
  initialBatchPayload?: any;
}>();

// State filters
const selectedBatchId = ref('');
const filterItemCode = ref('');
const filterFwVersion = ref('');

const loadingDevices = ref(false);
const savedBatches = ref<any[]>([]);
const allRawCandidateDevices = ref<any[]>([]);
const searchCandidateText = ref('');
const filterOnlyBatchMatches = ref(false);

const candidateDevices = computed(() => {
  let list = allRawCandidateDevices.value;
  if (filterOnlyBatchMatches.value) {
    if (filterItemCode.value) {
      list = list.filter((d: any) => {
        const item = (d.itemCode || d.item_code || '').toUpperCase();
        return item.includes(filterItemCode.value.toUpperCase());
      });
    }
    if (filterFwVersion.value) {
      list = list.filter((d: any) => {
        const fw = (d.longFw || d.long_fw || d.fwVersion || d.fw_version || '').replace(/^v/i, '');
        const targetFw = filterFwVersion.value.replace(/^v/i, '');
        return fw.includes(targetFw);
      });
    }
  }
  if (searchCandidateText.value.trim()) {
    const q = searchCandidateText.value.trim().toLowerCase();
    list = list.filter((d: any) => {
      const s = (d.serialNumber || d.serial_number || d.registrationCode || d.registration_code || d.id || '').toLowerCase();
      const eui = (d.devEui || d.dev_eui || '').toLowerCase();
      const itm = (d.itemCode || d.item_code || '').toLowerCase();
      return s.includes(q) || eui.includes(q) || itm.includes(q);
    });
  }
  return list;
});

// Selected DUTs & Mappings
interface BatchDeviceItem {
  device: any;
  referenceDeviceId: string;
  referenceDevice?: any;
  status: 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL';
  packetsCount?: number;
  avgCycle?: number;
  avgRssi?: number;
  avgSnr?: number;
  liveComparison?: {
    dutTemp?: number;
    refTemp?: number;
    tempDelta?: number;
    tempDeltaPass?: boolean;
    dutHum?: number;
    refHum?: number;
    humDelta?: number;
    humDeltaPass?: boolean;
    rssi?: number;
    snr?: number;
  };
}

const selectedDevices = ref<BatchDeviceItem[]>([]);
const maxAllowedDevices = ref(5);

// Golden Reference Devices pool (loaded dynamically from API)
const goldenReferenceDevices = ref<any[]>([]);

function computeMetricsFromPackets(packets: any[]) {
  if (!Array.isArray(packets) || packets.length === 0) return {};
  const validPackets = [...packets].filter((p) => p && p.created_at);
  validPackets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let avgCycle: number | undefined = undefined;
  if (validPackets.length >= 2) {
    let totalDiffMs = 0;
    for (let i = 1; i < validPackets.length; i++) {
      const prev = new Date(validPackets[i - 1].created_at).getTime();
      const curr = new Date(validPackets[i].created_at).getTime();
      totalDiffMs += Math.max(0, curr - prev);
    }
    const avgMs = totalDiffMs / (validPackets.length - 1);
    avgCycle = Number((avgMs / 60000).toFixed(1));
  }

  const rssiVals = packets.map((p) => parseNumericField(p.rssi)).filter((v): v is number => v !== undefined);
  const avgRssi = rssiVals.length > 0 ? Number((rssiVals.reduce((a, b) => a + b, 0) / rssiVals.length).toFixed(1)) : undefined;

  const snrVals = packets.map((p) => parseNumericField(p.snr)).filter((v): v is number => v !== undefined);
  const avgSnr = snrVals.length > 0 ? Number((snrVals.reduce((a, b) => a + b, 0) / snrVals.length).toFixed(1)) : undefined;

  return { avgCycle, avgRssi, avgSnr };
}

function parseNumericField(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function buildLiveComparison(comp: any) {
  if (!comp || typeof comp !== 'object') return undefined;
  const dutTemp = parseNumericField(comp.dutTemp ?? comp.dut_temp);
  const refTemp = parseNumericField(comp.refTemp ?? comp.ref_temp);
  const tempDelta = parseNumericField(comp.tempDelta ?? comp.temp_delta);
  const dutHum = parseNumericField(comp.dutHum ?? comp.dut_hum);
  const refHum = parseNumericField(comp.refHum ?? comp.ref_hum);
  const humDelta = parseNumericField(comp.humDelta ?? comp.hum_delta);
  const rssi = parseNumericField(comp.rssi);
  const snr = parseNumericField(comp.snr);

  const hasAnyData =
    dutTemp !== undefined ||
    refTemp !== undefined ||
    dutHum !== undefined ||
    refHum !== undefined ||
    rssi !== undefined ||
    snr !== undefined;

  if (!hasAnyData) return undefined;

  return {
    dutTemp,
    refTemp,
    tempDelta,
    tempDeltaPass: comp.tempDeltaPass ?? comp.temp_pass ?? (comp.tolerance_pass !== false),
    dutHum,
    refHum,
    humDelta,
    humDeltaPass: comp.humDeltaPass ?? comp.hum_pass ?? true,
    rssi,
    snr,
  };
}

const runningBatches = ref<any[]>([]);
const loadingRunningBatches = ref(false);
const hasLoadedRunningBatches = ref(false);
const runningBatchesError = ref('');
const cancellingBatch = ref(false);
let runningBatchesInterval: ReturnType<typeof setInterval>;

async function loadRunningBatches() {
  if (loadingRunningBatches.value) return;
  loadingRunningBatches.value = true;
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches/running');
    const data = res?.data ?? res;
    runningBatches.value = Array.isArray(data) ? data : [];
    hasLoadedRunningBatches.value = true;
    runningBatchesError.value = '';
  } catch {
    runningBatchesError.value = 'Không tải được batch đang chạy. Bấm Làm mới danh sách để thử lại.';
  } finally {
    loadingRunningBatches.value = false;
  }
}

function prepareNewBatch() {
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  timerInterval = null;
  simulationInterval = null;
  selectedBatchId.value = '';
  selectedDevices.value = [];
  isTesting.value = false;
  testFinished.value = false;
  batchStartedAt.value = '';
  batchFinishedAt.value = '';
  batchVerdict.value = '';
  elapsedSeconds.value = 0;
  currentStepIndex.value = 0;
}

function selectRunningBatch(id: string) {
  if (!id) return;
  prepareNewBatch();
  selectedBatchId.value = id;
  if (selectedBatchConfig.value) onBatchSelectChange();
  else checkAndSyncBatchStatus();
}

async function cancelSelectedBatch() {
  const id = selectedBatchId.value;
  if (!id || !window.confirm('Hủy batch đang xem? Các batch khác vẫn tiếp tục chạy.')) return;
  cancellingBatch.value = true;
  try {
    await httpClient.post(`/plugins/testing/test-batches/${id}/cancel`);
    if (selectedBatchId.value === id) prepareNewBatch();
    await loadRunningBatches();
    cyberToast.success('Đã hủy test batch.');
  } catch (err: any) {
    cyberToast.error(err?.response?.data?.message || 'Không thể hủy test batch.');
  } finally {
    cancellingBatch.value = false;
  }
}

// Testing Execution & Timer State
const isTesting = ref(false);
const testFinished = ref(false);
const totalDurationSeconds = ref(300);
const remainingSeconds = ref(300);
const elapsedSeconds = ref(0);
let timerInterval: any = null;
let simulationInterval: any = null;

const currentFlowName = ref('');
const flowSteps = ref<string[]>([]);
const currentStepIndex = ref(0);

const batchStartedAt = ref<string>('');
const batchFinishedAt = ref<string>('');
const batchVerdict = ref<string>('');

function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

const currentStepName = computed(() => {
  return flowSteps.value[currentStepIndex.value] || 'Hoàn tất kiểm thử';
});

const progressPercent = computed(() => {
  if (totalDurationSeconds.value <= 0) return 100;
  return Math.min(100, Math.round((elapsedSeconds.value / totalDurationSeconds.value) * 100));
});

const passCount = computed(() => selectedDevices.value.filter((d) => d.status === 'PASS').length);
const failCount = computed(() => selectedDevices.value.filter((d) => d.status === 'FAIL').length);

const selectedBatchConfig = computed(() => {
  return savedBatches.value.find((b) => b.id === selectedBatchId.value || b.batchCode === selectedBatchId.value);
});

const requiresReferenceDevice = computed(() => {
  const cfg = selectedBatchConfig.value;
  if (!cfg) return true;
  if (cfg.requires_reference_device === false || cfg.requiresReferenceDevice === false) {
    return false;
  }
  const flow = cfg.simulation_flow || cfg.simulationFlow;
  if (flow) {
    const blocks = Array.isArray(flow.blocks) ? flow.blocks : (Array.isArray(flow) ? flow : []);
    if (blocks.length > 0 && !blocks.some((b: any) =>
      b.type?.includes('ref') || b.type?.includes('compare') ||
      b.name?.toLowerCase().includes('chuẩn') || b.name?.toLowerCase().includes('đối chiếu')
    )) {
      const criteria = cfg.auto_check_criteria || cfg.autoCheckCriteria || {};
      if (criteria.compareWithReference === false) return false;
    }
  }
  return true;
});

// Candidate selection helpers
const isAllCandidatesSelected = computed(() => {
  if (candidateDevices.value.length === 0) return false;
  return candidateDevices.value.every((d) => isDeviceSelected(d));
});

function getDeviceIdentifier(dev: any): string {
  if (!dev) return '';
  return dev.id || dev.devEui || dev.dev_eui || dev.serialNumber || dev.serial_number || dev.registrationCode || dev.registration_code || '';
}

function isDeviceSelected(device: any): boolean {
  const targetId = getDeviceIdentifier(device);
  return selectedDevices.value.some((item) => getDeviceIdentifier(item.device) === targetId);
}

function toggleSelectAllCandidates(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    candidateDevices.value.forEach((d) => {
      if (!isDeviceSelected(d) && selectedDevices.value.length < maxAllowedDevices.value) {
        addDeviceToBatch(d);
      }
    });
  } else {
    selectedDevices.value = [];
  }
}

function toggleDeviceSelection(device: any) {
  if (isDeviceSelected(device)) {
    removeDeviceFromBatch(getDeviceIdentifier(device));
  } else {
    addDeviceToBatch(device);
  }
}

function addDeviceToBatch(device: any) {
  if (selectedDevices.value.length >= maxAllowedDevices.value) {
    cyberToast.warning(`Batch này chỉ cho phép tối đa ${maxAllowedDevices.value} thiết bị cùng lúc!`);
    return;
  }
  // Auto pair with an available golden reference
  const usedRefIds = new Set(selectedDevices.value.map((s) => s.referenceDeviceId));
  const availableRef = goldenReferenceDevices.value.find((r) => !usedRefIds.has(r.id));

  selectedDevices.value.push({
    device,
    referenceDeviceId: availableRef?.id || '',
    referenceDevice: availableRef,
    status: 'PENDING',
  });
  const devLabel = device.serialNumber || device.serial_number || device.devEui || device.dev_eui || 'thiết bị';
  cyberToast.success(`Đã thêm ${devLabel} vào batch`);
}

function removeDeviceFromBatch(deviceId: string) {
  selectedDevices.value = selectedDevices.value.filter((item) => getDeviceIdentifier(item.device) !== deviceId);
}

function clearSelectedDevices() {
  selectedDevices.value = [];
}

function onReferenceDeviceChange(item: BatchDeviceItem) {
  item.referenceDevice = goldenReferenceDevices.value.find((r) => r.id === item.referenceDeviceId);
}

function autoAssignReferenceDevices() {
  if (goldenReferenceDevices.value.length === 0) {
    cyberToast.warning('Chưa có thiết bị chuẩn nào được thiết lập trong hệ thống!');
    return;
  }
  const availableRefs = [...goldenReferenceDevices.value];
  selectedDevices.value.forEach((item, idx) => {
    const refDev = availableRefs[idx % availableRefs.length];
    if (refDev) {
      item.referenceDeviceId = refDev.id;
      item.referenceDevice = refDev;
    }
  });
  cyberToast.success(`Đã tự động gán thiết bị chuẩn cho ${selectedDevices.value.length} thiết bị test`);
}

function onBatchSelectChange() {
  if (selectedBatchConfig.value) {
    const b = selectedBatchConfig.value;
    filterItemCode.value = b.itemCode || b.item_code || '';
    filterFwVersion.value = b.longFw || b.long_fw || b.fwVersion || b.fw_version || '';
    maxAllowedDevices.value = b.maxDevices || b.max_devices || 5;
    totalDurationSeconds.value = b.flowDurationSeconds || b.flow_duration_seconds || 300;
    remainingSeconds.value = totalDurationSeconds.value;
    selectedDevices.value = [];

    // Dynamically bind flow information
    const flow = b.simulationFlow || b.simulation_flow;
    if (flow) {
      currentFlowName.value = flow.profileName || flow.name || flow.simuId || b.batchName || 'Kịch bản kiểm thử';
      if (Array.isArray(flow.flowBlocks) && flow.flowBlocks.length > 0) {
        flowSteps.value = flow.flowBlocks.map((blk: any) => blk.name || blk.type);
      } else if (Array.isArray(flow.blocks) && flow.blocks.length > 0) {
        flowSteps.value = flow.blocks.map((blk: any) => blk.name || blk.type);
      } else if (Array.isArray(flow.steps) && flow.steps.length > 0) {
        flowSteps.value = flow.steps;
      } else {
        flowSteps.value = [
          'Khởi tạo RF & Modulation Parameters',
          'OTAA Join Request',
          'Chu kỳ Uplink Telemetry',
          'Đối chiếu tiêu chuẩn & Xuất kết quả',
        ];
      }
    } else {
      currentFlowName.value = b.batchName || 'Kịch bản kiểm thử';
      flowSteps.value = [
        'Khởi tạo RF & Modulation Parameters',
        'OTAA Join Request',
        'Chu kỳ Uplink Telemetry',
        'Đối chiếu tiêu chuẩn & Xuất kết quả',
      ];
    }

    loadReferenceDevices();
    loadAvailableDevices();
    checkAndSyncBatchStatus();
  }
}

async function checkAndSyncBatchStatus() {
  const id = selectedBatchId.value;
  if (!id) return;
  try {
    const res: any = await httpClient.get(`/plugins/testing/test-batches/${id}/status`);
    if (selectedBatchId.value !== id) return;
    const statusData = res?.data || res;
    if (!statusData) return;

    if (statusData.startedAt) batchStartedAt.value = statusData.startedAt;
    if (statusData.finishedAt) batchFinishedAt.value = statusData.finishedAt;
    if (statusData.verdict) batchVerdict.value = statusData.verdict;

    if (statusData.status === 'RUNNING') {
      isTesting.value = true;
      testFinished.value = false;
      if (typeof statusData.flowDurationSeconds === 'number') {
        totalDurationSeconds.value = statusData.flowDurationSeconds;
      }
      if (typeof statusData.elapsedSeconds === 'number') {
        elapsedSeconds.value = statusData.elapsedSeconds;
      }
      if (typeof statusData.remainingSeconds === 'number') {
        remainingSeconds.value = statusData.remainingSeconds;
      }

      if (Array.isArray(statusData.devices) && statusData.devices.length > 0) {
        selectedDevices.value = statusData.devices.map((d: any) => {
          const metrics = computeMetricsFromPackets(d.dutPackets || d.dut_packets || d.comparisonResult?.dut_packets || []);
          return {
            device: {
              id: d.id || d.serialNumber,
              serialNumber: d.serialNumber,
              devEui: d.devEui,
              itemCode: filterItemCode.value,
              fwVersion: filterFwVersion.value,
            },
            referenceDeviceId: d.referenceSerialNumber || d.referenceDeviceId || '',
            referenceDevice: {
              id: d.referenceSerialNumber || d.referenceDeviceId,
              serialNumber: d.referenceSerialNumber,
              name: d.referenceDeviceName || `Thiết bị chuẩn ${d.referenceSerialNumber || ''}`,
            },
            status: d.verdict || d.status || 'RUNNING',
            packetsCount: d.packetsReceived != null ? d.packetsReceived : (d.packets_received ?? d.dutPackets?.length ?? 0),
            avgCycle: parseNumericField(d.avgCycle ?? d.avg_cycle ?? d.comparisonResult?.avgCycle ?? d.comparisonResult?.avg_cycle ?? metrics.avgCycle),
            avgRssi: parseNumericField(d.avgRssi ?? d.avg_rssi ?? d.comparisonResult?.avgRssi ?? d.comparisonResult?.avg_rssi ?? metrics.avgRssi),
            avgSnr: parseNumericField(d.avgSnr ?? d.avg_snr ?? d.comparisonResult?.avgSnr ?? d.comparisonResult?.avg_snr ?? metrics.avgSnr),
            liveComparison: buildLiveComparison(d.comparisonResult),
          };
        });
      }

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        elapsedSeconds.value++;
        remainingSeconds.value = Math.max(0, totalDurationSeconds.value - elapsedSeconds.value);
        if (flowSteps.value.length > 0 && totalDurationSeconds.value > 0) {
          const stepDuration = totalDurationSeconds.value / flowSteps.value.length;
          currentStepIndex.value = Math.min(
            flowSteps.value.length - 1,
            Math.floor(elapsedSeconds.value / Math.max(1, stepDuration))
          );
        }
        if (remainingSeconds.value <= 0) pollBatchStatus();
      }, 1000);

      clearInterval(simulationInterval);
      simulationInterval = setInterval(() => {
        pollBatchStatus();
      }, 3000);
    } else if (
      statusData.status === 'COMPLETED' ||
      statusData.status === 'FINISHED' ||
      statusData.status === 'PASSED' ||
      statusData.status === 'FAILED' ||
      statusData.status === 'STOPPED'
    ) {
      clearInterval(timerInterval);
      clearInterval(simulationInterval);
      isTesting.value = false;
      testFinished.value = true;
      elapsedSeconds.value = statusData.flowDurationSeconds || totalDurationSeconds.value;
      remainingSeconds.value = 0;

      if (Array.isArray(statusData.devices) && statusData.devices.length > 0) {
        selectedDevices.value = statusData.devices.map((d: any) => {
          const metrics = computeMetricsFromPackets(d.dutPackets || d.dut_packets || d.comparisonResult?.dut_packets || []);
          return {
            device: {
              id: d.id || d.serialNumber,
              serialNumber: d.serialNumber,
              devEui: d.devEui,
              itemCode: filterItemCode.value,
              fwVersion: filterFwVersion.value,
            },
            referenceDeviceId: d.referenceSerialNumber || d.referenceDeviceId || '',
            referenceDevice: {
              id: d.referenceSerialNumber || d.referenceDeviceId,
              serialNumber: d.referenceSerialNumber,
              name: d.referenceDeviceName || `Thiết bị chuẩn ${d.referenceSerialNumber || ''}`,
            },
            status: d.verdict || d.status || 'PASS',
            packetsCount: d.packetsReceived != null ? d.packetsReceived : (d.packets_received ?? d.dutPackets?.length ?? 0),
            avgCycle: parseNumericField(d.avgCycle ?? d.avg_cycle ?? d.comparisonResult?.avgCycle ?? d.comparisonResult?.avg_cycle ?? metrics.avgCycle),
            avgRssi: parseNumericField(d.avgRssi ?? d.avg_rssi ?? d.comparisonResult?.avgRssi ?? d.comparisonResult?.avg_rssi ?? metrics.avgRssi),
            avgSnr: parseNumericField(d.avgSnr ?? d.avg_snr ?? d.comparisonResult?.avgSnr ?? d.comparisonResult?.avg_snr ?? metrics.avgSnr),
            liveComparison: buildLiveComparison(d.comparisonResult),
          };
        });
      }
    } else {
      isTesting.value = false;
      testFinished.value = false;
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error checking batch status:', err.message);
  }
}

async function loadSavedBatches() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches');
    const items = res?.data?.items || res?.data || res?.items || (Array.isArray(res) ? res : []);
    savedBatches.value = Array.isArray(items) ? items : [];
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error loading batches from API:', err.message);
    savedBatches.value = [];
  }

  // Tự động lựa chọn cấu hình FW_VERSION và ITEM_CODE theo Test Batch
  if (selectedBatchId.value) {
    onBatchSelectChange();
  } else if (savedBatches.value.length > 0) {
    selectedBatchId.value = savedBatches.value[0].id || savedBatches.value[0].batchCode;
    onBatchSelectChange();
  }
}

async function loadReferenceDevices() {
  try {
    const res: any = await httpClient.get('/plugins/testing/test-batches/reference-devices', {
      params: { itemCode: filterItemCode.value || undefined },
    });
    const items = res?.data?.items || res?.data || res?.items || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) {
      goldenReferenceDevices.value = items.map((r: any) => ({
        id: r.id || r.serialNumber || r.serial_number,
        name: r.name || `Thiết bị chuẩn ${r.serialNumber || r.serial_number || ''}`,
        serialNumber: r.serialNumber || r.serial_number || '',
        devEui: r.devEui || r.dev_eui || '',
        calibratedDate: r.calibratedAt || r.calibrated_at || '',
        baseTemp: r.nominalValues?.temperature ?? r.baseTemp ?? 25.0,
        baseHum: r.nominalValues?.humidity ?? r.baseHum ?? 50.0,
      }));
    } else {
      goldenReferenceDevices.value = [];
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error loading reference devices from API:', err.message);
    goldenReferenceDevices.value = [];
  }
}

async function loadAvailableDevices() {
  loadingDevices.value = true;
  try {
    let devices: any[] = [];
    // 1. Try dedicated endpoint first (queries v_list_device_testing / device_test_registrations)
    try {
      const res: any = await httpClient.get('/plugins/testing/test-batches/available-devices', {
        params: {
          itemCode: filterItemCode.value || undefined,
          fwVersion: filterFwVersion.value || undefined,
          isAdmin: true,
          limit: 100,
        },
      });
      const raw1 = res?.data;
      devices = Array.isArray(raw1?.items) ? raw1.items : (Array.isArray(raw1?.data) ? raw1.data : (Array.isArray(raw1) ? raw1 : []));
    } catch {}

    // 2. Query device-registrations with isAdmin=true to get full list if empty
    if (!Array.isArray(devices) || devices.length === 0) {
      try {
        const res2: any = await httpClient.get('/plugins/testing/device-registrations', {
          params: { isAdmin: true, limit: 100 },
        });
        const raw2 = res2?.data;
        devices = Array.isArray(raw2?.items) ? raw2.items : (Array.isArray(raw2?.data) ? raw2.data : (Array.isArray(raw2) ? raw2 : []));
      } catch {}
    }

    allRawCandidateDevices.value = devices;
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Error loading available devices:', err.message);
    allRawCandidateDevices.value = [];
  } finally {
    loadingDevices.value = false;
  }
}

// Timer & Simulation Execution
async function startBatchTest() {
  const id = selectedBatchId.value;
  if (!selectedBatchId.value) {
    cyberToast.warning('Vui lòng chọn Test Batch trước khi bấm bắt đầu!');
    return;
  }
  if (selectedDevices.value.length === 0) {
    cyberToast.warning('Vui lòng chọn ít nhất 1 thiết bị để test!');
    return;
  }

  // Check if reference devices are mapped only if flow requires it
  if (requiresReferenceDevice.value) {
    const unmapped = selectedDevices.value.filter((d) => !d.referenceDeviceId);
    if (unmapped.length > 0 && goldenReferenceDevices.value.length > 0) {
      autoAssignReferenceDevices();
    }
  }

  isTesting.value = true;
  testFinished.value = false;
  remainingSeconds.value = totalDurationSeconds.value;
  elapsedSeconds.value = 0;
  currentStepIndex.value = 0;

  selectedDevices.value.forEach((d) => {
    d.status = 'RUNNING';
    d.liveComparison = undefined;
  });

  // Call backend start API if batch is selected
  if (selectedBatchId.value) {
    const testerName = authStore.user?.fullName || authStore.user?.username || 'Tester';
    const startPayload = {
      testerName,
      testPerson: testerName,
      testedBy: testerName,
      soNumber: selectedBatchConfig.value?.soNumber || selectedBatchConfig.value?.so_number,
      waNumber: selectedBatchConfig.value?.waNumber || selectedBatchConfig.value?.wa_number,
      requiresReferenceDevice: requiresReferenceDevice.value,
      devices: selectedDevices.value.map((item) => ({
        serialNumber: item.device.serialNumber || item.device.serial_number,
        devEui: item.device.devEui || item.device.dev_eui,
        itemCode: item.device.itemCode || item.device.item_code,
        fwVersion: item.device.fwVersion || item.device.fw_version,
        soNumber: item.device.soNumber || item.device.so_number || selectedBatchConfig.value?.soNumber || selectedBatchConfig.value?.so_number,
        waNumber: item.device.waNumber || item.device.wa_number || selectedBatchConfig.value?.waNumber || selectedBatchConfig.value?.wa_number,
        referenceDeviceId: item.referenceDeviceId || null,
        referenceSerialNumber: item.referenceDevice?.serialNumber || null,
        referenceDevEui: item.referenceDevice?.devEui || null,
        referenceDeviceName: item.referenceDevice?.name || null,
      })),
    };
    try {
      const res: any = await httpClient.post(`/plugins/testing/test-batches/${id}/start`, startPayload);
      await loadRunningBatches();
      if (selectedBatchId.value !== id) return;
      const data = res?.data || res;
      batchStartedAt.value = data.startedAt || '';
    } catch (err: any) {
      if (selectedBatchId.value !== id) return;
      cyberToast.error(err?.response?.data?.message || 'Không thể bắt đầu Test Batch');
      isTesting.value = false;
      selectedDevices.value.forEach((d) => { d.status = 'PENDING'; });
      return;
    }
  }

  cyberToast.success(`Bắt đầu chạy Test Batch với ${selectedDevices.value.length} thiết bị song song`);

  // Start countdown timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
    remainingSeconds.value = Math.max(0, totalDurationSeconds.value - elapsedSeconds.value);

    // Update flow steps based on elapsed progress
    if (flowSteps.value.length > 0 && totalDurationSeconds.value > 0) {
      const stepDuration = totalDurationSeconds.value / flowSteps.value.length;
      currentStepIndex.value = Math.min(
        flowSteps.value.length - 1,
        Math.floor(elapsedSeconds.value / Math.max(1, stepDuration))
      );
    }

    if (remainingSeconds.value <= 0) pollBatchStatus();
  }, 1000);

  // Periodic real telemetry polling from backend status
  clearInterval(simulationInterval);
  pollBatchStatus();
  simulationInterval = setInterval(() => {
    pollBatchStatus();
  }, 3000);
}

async function pollBatchStatus() {
  const id = selectedBatchId.value;
  if (!id) return;
  try {
    const res: any = await httpClient.get(`/plugins/testing/test-batches/${id}/status`);
    if (selectedBatchId.value !== id) return;
    const statusData = res?.data || res;
    if (!statusData) return;

    if (typeof statusData.elapsedSeconds === 'number') {
      elapsedSeconds.value = statusData.elapsedSeconds;
    }
    if (typeof statusData.remainingSeconds === 'number') {
      remainingSeconds.value = statusData.remainingSeconds;
    }
    if (flowSteps.value.length > 0 && totalDurationSeconds.value > 0) {
      const stepDuration = totalDurationSeconds.value / flowSteps.value.length;
      currentStepIndex.value = Math.min(
        flowSteps.value.length - 1,
        Math.floor(elapsedSeconds.value / Math.max(1, stepDuration))
      );
    }

    const devStatuses = statusData.devices || statusData.items || [];
    selectedDevices.value.forEach((item) => {
      const serial = item.device.serialNumber || item.device.serial_number;
      const eui = item.device.devEui || item.device.dev_eui;
      const matched = devStatuses.find(
        (d: any) => (d.serialNumber && d.serialNumber === serial) || (d.devEui && d.devEui === eui)
      );
      if (matched) {
        if (matched.status || matched.verdict) {
          item.status = matched.verdict || matched.status;
        }
        if (matched.packetsReceived != null) {
          item.packetsCount = matched.packetsReceived;
        } else if (matched.packets_received != null) {
          item.packetsCount = matched.packets_received;
        } else if (Array.isArray(matched.dutPackets)) {
          item.packetsCount = matched.dutPackets.length;
        }
        const metrics = computeMetricsFromPackets(matched.dutPackets || matched.dut_packets || matched.comparisonResult?.dut_packets || []);
        item.avgCycle = parseNumericField(matched.avgCycle ?? matched.avg_cycle ?? matched.comparisonResult?.avgCycle ?? matched.comparisonResult?.avg_cycle ?? metrics.avgCycle);
        item.avgRssi = parseNumericField(matched.avgRssi ?? matched.avg_rssi ?? matched.comparisonResult?.avgRssi ?? matched.comparisonResult?.avg_rssi ?? metrics.avgRssi);
        item.avgSnr = parseNumericField(matched.avgSnr ?? matched.avg_snr ?? matched.comparisonResult?.avgSnr ?? matched.comparisonResult?.avg_snr ?? metrics.avgSnr);
        if (matched.comparisonResult) {
          item.liveComparison = buildLiveComparison(matched.comparisonResult);
        }
      }
    });

    if (
      statusData.status === 'COMPLETED' ||
      statusData.status === 'FINISHED' ||
      statusData.status === 'PASSED' ||
      statusData.status === 'FAILED' ||
      statusData.status === 'STOPPED'
    ) {
      finishBatchTest();
    }
  } catch (err: any) {
    console.debug('[DeviceTestBatchPanel] Poll status error:', err.message);
  }
}

async function finishBatchTest() {
  const id = selectedBatchId.value;
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
  isTesting.value = false;
  testFinished.value = true;

  if (selectedBatchId.value) {
    try {
      const res: any = await httpClient.get(`/plugins/testing/test-batches/${id}/status`);
      if (selectedBatchId.value !== id) return;
      const statusData = res?.data || res;
      if (statusData) {
        if (statusData.startedAt) batchStartedAt.value = statusData.startedAt;
        if (statusData.finishedAt) batchFinishedAt.value = statusData.finishedAt;
        if (statusData.verdict) batchVerdict.value = statusData.verdict;
        if (Array.isArray(statusData.devices) && statusData.devices.length > 0) {
          statusData.devices.forEach((dev: any) => {
            const item = selectedDevices.value.find(
              (s) =>
                (s.device.serialNumber && s.device.serialNumber === dev.serialNumber) ||
                (s.device.devEui && s.device.devEui === dev.devEui)
            );
            if (item) {
              item.status = dev.verdict || dev.status || item.status;
              if (dev.packetsReceived != null) {
                item.packetsCount = dev.packetsReceived;
              } else if (dev.packets_received != null) {
                item.packetsCount = dev.packets_received;
              } else if (Array.isArray(dev.dutPackets)) {
                item.packetsCount = dev.dutPackets.length;
              }
              const metrics = computeMetricsFromPackets(dev.dutPackets || dev.dut_packets || dev.comparisonResult?.dut_packets || []);
              item.avgCycle = parseNumericField(dev.avgCycle ?? dev.avg_cycle ?? dev.comparisonResult?.avgCycle ?? dev.comparisonResult?.avg_cycle ?? metrics.avgCycle);
              item.avgRssi = parseNumericField(dev.avgRssi ?? dev.avg_rssi ?? dev.comparisonResult?.avgRssi ?? dev.comparisonResult?.avg_rssi ?? metrics.avgRssi);
              item.avgSnr = parseNumericField(dev.avgSnr ?? dev.avg_snr ?? dev.comparisonResult?.avgSnr ?? dev.comparisonResult?.avg_snr ?? metrics.avgSnr);
              if (dev.comparisonResult) {
                item.liveComparison = buildLiveComparison(dev.comparisonResult);
              }
            }
          });
        }
      }
    } catch (err: any) {
      console.debug('[DeviceTestBatchPanel] Finish status sync note:', err.message);
    }
  }

  cyberToast.success(`Hoàn thành Test Batch! Đạt ${passCount.value}/${selectedDevices.value.length} thiết bị.`);
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getItemStatusClass(status?: string) {
  switch (status) {
    case 'PASS':
      return 'badge-success text-success-content';
    case 'FAIL':
      return 'badge-error text-error-content';
    case 'RUNNING':
      return 'badge-warning text-warning-content animate-pulse';
    default:
      return 'badge-ghost';
  }
}

onMounted(() => {
  loadSavedBatches();
  loadRunningBatches();
  runningBatchesInterval = setInterval(loadRunningBatches, 5000);
  loadReferenceDevices();
  loadAvailableDevices();

  // If passed initialBatchPayload from Create Batch
  if (props.initialBatchPayload) {
    const p = props.initialBatchPayload;
    if (p.itemCode) filterItemCode.value = p.itemCode;
    if (p.fwVersion) filterFwVersion.value = p.fwVersion;
    if (p.batchId) selectedBatchId.value = p.batchId;
    if (p.maxDevices) maxAllowedDevices.value = p.maxDevices;
    if (p.flowDurationSeconds) {
      totalDurationSeconds.value = p.flowDurationSeconds;
      remainingSeconds.value = p.flowDurationSeconds;
    }
  }
});

onUnmounted(() => {
  clearInterval(runningBatchesInterval);
  clearInterval(timerInterval);
  clearInterval(simulationInterval);
});
</script>
