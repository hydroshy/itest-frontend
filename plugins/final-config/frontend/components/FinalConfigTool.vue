<template>
  <div class="final-config-tool">
    <!-- 1. MAIN AUTOMATION & CONFIGURATION CARD -->
    <div class="card border border-base-content/10 bg-base-100 shadow-sm p-4 fc-card main-control-card">
      <div class="fc-card-header pb-3 mb-3 border-b border-base-content/10">
        <div class="header-left">
          <Cpu class="w-5 h-5 text-primary header-icon" />
          <span class="header-title">FINAL CONFIG DEVICE</span>
        </div>
        <div v-if="fcDebugMode" class="header-debug-stats">
          <span class="stat-item"><ArrowUp class="w-3.5 h-3.5 inline mr-1" /> TX: {{ fcSerialStats.txPackets }} ({{ fcFormatBytes(fcSerialStats.txBytes) }})</span>
          <span class="stat-divider">|</span>
          <span class="stat-item"><ArrowDown class="w-3.5 h-3.5 inline mr-1" /> RX: {{ fcSerialStats.rxPackets }} ({{ fcFormatBytes(fcSerialStats.rxBytes) }})</span>
          <span class="stat-divider">|</span>
          <span class="stat-item text-error"><AlertTriangle class="w-3.5 h-3.5 inline mr-1" /> ERR: {{ fcSerialStats.errCount }}</span>
        </div>
      </div>

      <!-- 1.1 TOP HORIZONTAL SERIAL PORT BAR -->
      <div class="serial-port-top-bar">
        <div class="port-bar-left">
          <div class="join port-btn-group">
            <button class="btn btn-primary join-item btn-uniform flex items-center gap-2" @click="fcSelectSerialPort">
              <Cpu class="w-4 h-4" />
              Select Port
            </button>
            <button
              v-if="fcSerialPort && !fcSerialConnected"
              class="btn btn-success join-item btn-uniform flex items-center gap-2"
              :disabled="fcSerialConnecting || fcIsAutoReconnecting"
              @click="fcConnectSerial(fcSerialPort)"
            >
              <span v-if="fcSerialConnecting || fcIsAutoReconnecting" class="loading loading-spinner loading-sm"></span>
              <Link v-else class="w-4 h-4" />
              {{ fcIsAutoReconnecting ? 'Reconnecting...' : 'Connect' }}
            </button>
            <button
              v-if="fcSerialConnected"
              class="btn btn-error join-item btn-uniform flex items-center gap-2"
              @click="fcDisconnectSerial(true)"
            >
              <Power class="w-4 h-4" />
              Disconnect
            </button>
          </div>

          <!-- Baud Rate -->
          <div class="inline-item baud-item">
            <span class="item-label">Baud:</span>
            <select
              v-model="fcSerialConfig.baudRate"
              class="select select-bordered select-md w-[130px]"
              :disabled="fcSerialConnected || fcSerialConnecting || isRunningFinalConfig"
            >
              <option :value="9600">9600 bps</option>
              <option :value="19200">19200 bps</option>
              <option :value="38400">38400 bps</option>
              <option :value="57600">57600 bps</option>
              <option :value="115200">115200 bps</option>
              <option :value="921600">921600 bps</option>
            </select>
          </div>

          <!-- DTR & RTS -->
          <div class="inline-item signals-item">
            <span
              class="badge cursor-pointer select-none px-3 py-3"
              :class="fcSerialSignals.dtr ? 'badge-success text-success-content' : 'badge-ghost'"
              @click="fcToggleDTR"
            >
              DTR: {{ fcSerialSignals.dtr ? 'ON' : 'OFF' }}
            </span>
            <span
              class="badge cursor-pointer select-none px-3 py-3"
              :class="fcSerialSignals.rts ? 'badge-success text-success-content' : 'badge-ghost'"
              @click="fcToggleRTS"
            >
              RTS: {{ fcSerialSignals.rts ? 'ON' : 'OFF' }}
            </span>
          </div>
        </div>

        <div class="port-bar-right">
          <!-- Port Status Badge -->
          <div class="badge badge-lg gap-2" :class="fcSerialConnected ? 'badge-success badge-outline' : 'badge-ghost'">
            <span class="w-2 h-2 rounded-full" :class="fcSerialConnected ? 'bg-success animate-pulse' : 'bg-base-content/40'"></span>
            <span>{{ fcSerialConnected ? 'ONLINE' : 'OFFLINE' }}</span>
          </div>
          <!-- Port Info Tooltip / Text -->
          <span v-if="fcSerialPortInfo" class="port-info-badge font-mono">
            {{ fcSerialPortInfo }}
          </span>
        </div>
      </div>

      <div class="card-section-divider"></div>

      <!-- 1.2 ACTION CONTROLS & STATUS ROW (UNIFORM SIZING) -->
      <div class="execution-controls-row">
        <div class="controls-left">
          <button
            class="btn btn-primary btn-uniform-action btn-start flex items-center gap-2"
            :disabled="!fcSerialConnected || isRunningFinalConfig"
            @click="startFinalConfig"
          >
            <span v-if="isRunningFinalConfig" class="loading loading-spinner loading-sm"></span>
            <Play v-else class="w-4 h-4" />
            {{ isRunningFinalConfig ? 'Running Config...' : 'Start Config' }}
          </button>

          <button
            class="btn btn-warning btn-outline btn-uniform-action btn-reset flex items-center gap-2"
            :disabled="isRunningFinalConfig"
            @click="resetFinalConfig"
          >
            <RotateCcw class="w-4 h-4" />
            Reset Config
          </button>

          <button
            v-if="isRunningFinalConfig"
            class="btn btn-error btn-uniform-action btn-abort flex items-center gap-2"
            @click="abortFinalConfig"
          >
            <X class="w-4 h-4" />
            Abort
          </button>

          <label class="label cursor-pointer border border-base-content/20 rounded-lg px-3 py-2 flex items-center gap-2 bg-base-100">
            <input
              type="checkbox"
              v-model="fcDebugMode"
              class="checkbox checkbox-sm checkbox-primary"
            />
            <span class="label-text font-medium">Debug Mode</span>
          </label>
        </div>

        <!-- STATUS Tag (Thay thế FINAL VERDICT, màu xám khi chưa chạy) -->
        <div class="status-banner">
          <span
            class="badge badge-lg font-mono font-bold tracking-wider px-4 py-3"
            :class="{
              'badge-success': statusDisplayText === 'PASS',
              'badge-error': statusDisplayText === 'FAIL',
              'badge-primary': statusDisplayText === 'RUNNING',
              'badge-ghost': statusDisplayText === 'NONE'
            }"
          >
            STATUS: {{ statusDisplayText }}
          </span>
        </div>
      </div>

      <div class="card-section-divider"></div>

      <!-- 1.3 TARGET DEVICE READOUTS & CYBER PROGRESS BAR -->
      <div class="pipeline-center-hub">
        <!-- 2 Readouts: S/N and S/O with Clean Cyber Aesthetic -->
        <div class="cyber-readout-grid">
          <!-- Readout 1: Serial Number (SN) -->
          <div class="cyber-readout-card">
            <div class="readout-card-header">
              <span class="readout-label font-mono">TARGET SERIAL NUMBER</span>
              <span class="badge badge-sm badge-info font-mono">
                {{ fcHardwareInfo.serialNumber ? 'SCANNED' : 'AWAITING' }}
              </span>
            </div>
            <div class="readout-display-box">
              <span class="readout-value font-mono">
                {{ fcHardwareInfo.serialNumber || fcSerialNumberInput || '--- NOT CONNECTED ---' }}
              </span>
            </div>
          </div>

          <!-- Readout 2: Sales Order (SO) -->
          <div class="cyber-readout-card">
            <div class="readout-card-header">
              <span class="readout-label font-mono">TARGET SALES ORDER</span>
              <span class="badge badge-sm badge-success font-mono">
                {{ fcSelectedSo ? 'LOADED' : 'PENDING' }}
              </span>
            </div>
            <div class="readout-display-box">
              <span class="readout-value font-mono">
                {{ fcSelectedSo || '--- NOT ASSIGNED / READY ---' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress Bar with Moving Micro-Dots Particles Animation -->
        <div class="cyber-progress-block">
          <div class="progress-meta-row">
            <div class="progress-meta-left">
              <span class="progress-meta-title">PIPELINE PROGRESS</span>
              <span class="progress-meta-stage font-mono">STAGE {{ currentStage }}/4</span>
            </div>
            <div class="progress-meta-right">
              <span
                class="progress-meta-verdict font-mono"
                :class="'verdict-' + (finalVerdict === 'PASS' ? 'pass' : finalVerdict === 'FAIL' ? 'fail' : 'running')"
              >
                {{ isRunningFinalConfig ? 'EXECUTING PIPELINE' : (finalVerdict || 'SYSTEM IDLE') }}
              </span>
              <span class="progress-meta-percent font-mono">{{ fcProgress }}%</span>
            </div>
          </div>

          <!-- Cyber Micro-Dots Track (Sleek dark slot without static dots) -->
          <div class="cyber-microdots-track">
            <!-- Active progress bar fill -->
            <div
              class="cyber-microdots-fill"
              :class="{
                'is-running': isRunningFinalConfig,
                'is-pass': finalVerdict === 'PASS',
                'is-fail': finalVerdict === 'FAIL'
              }"
              :style="{ width: fcProgress + '%' }"
            >
              <!-- Progress Indicator Head -->
              <div class="fill-lead-head" v-if="(fcProgress > 0 || isRunningFinalConfig) && fcProgress < 100">
                <div class="fill-lead-beacon"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Status Line -->
        <div class="cyber-telemetry-row">
          <span class="telemetry-prompt">Trạng thái:</span>
          <span class="telemetry-msg font-mono">
            {{ fcStatusMessage || (isRunningFinalConfig ? 'Đang thực hiện quy trình tự động...' : 'Hệ thống sẵn sàng') }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. REAL-TIME AUTOMATION STATUS & 4 STAGES (DEBUG MODE ONLY) -->
    <div v-if="fcDebugMode" class="card border border-base-content/10 bg-base-100 shadow-sm p-4 fc-card debug-card">
      <div class="fc-card-header pb-3 mb-3 border-b border-base-content/10">
        <div class="header-left">
          <Clock class="w-5 h-5 text-primary header-icon" />
          <span class="header-title">4-STAGE PIPELINE AUDIT DETAILS</span>
        </div>
        <span class="badge badge-warning badge-sm font-semibold">DEBUG MODE ACTIVE</span>
      </div>

      <!-- 4 Stages Boxes Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stages-grid">
        <!-- Stage 1 -->
        <div>
          <div class="stage-card" :class="['status-' + stage1Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 1</span>
              <span
                class="badge badge-sm font-mono font-semibold"
                :class="stage1Status === 'PASS' ? 'badge-success' : stage1Status === 'FAIL' ? 'badge-error' : stage1Status === 'RUNNING' ? 'badge-primary' : 'badge-ghost'"
              >
                {{ stage1Status }}
              </span>
            </div>
            <div class="stage-title">Hardware Inspection</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">SN:</span> <span class="v">{{ fcHardwareInfo.serialNumber || 'N/A' }}</span></div>
              <div class="stage-item"><span class="k">DevEUI:</span> <span class="v">{{ fcHardwareInfo.devEui || 'N/A' }}</span></div>
              <div class="stage-item"><span class="k">SO Check:</span> <span class="v">{{ fcSoCheckStatus }}</span></div>
            </div>
          </div>
        </div>

        <!-- Stage 2 -->
        <div>
          <div class="stage-card" :class="['status-' + stage2Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 2</span>
              <span
                class="badge badge-sm font-mono font-semibold"
                :class="stage2Status === 'PASS' ? 'badge-success' : stage2Status === 'FAIL' ? 'badge-error' : stage2Status === 'RUNNING' ? 'badge-primary' : 'badge-ghost'"
              >
                {{ stage2Status }}
              </span>
            </div>
            <div class="stage-title">Write AppKey &amp; Config</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">AppKey:</span> <span class="v">{{ fcAppKeyWriteStatus }}</span></div>
              <div class="stage-item"><span class="k">Regs Written:</span> <span class="v">{{ fcWrittenRegsCount }} / {{ fcTotalWriteRegsCount }}</span></div>
              <div class="stage-item"><span class="k">Settled:</span> <span class="v">{{ stage2Settled ? 'Yes (3s)' : 'Waiting' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Stage 3 -->
        <div>
          <div class="stage-card" :class="['status-' + stage3Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 3</span>
              <span
                class="badge badge-sm font-mono font-semibold"
                :class="stage3Status === 'PASS' ? 'badge-success' : stage3Status === 'FAIL' ? 'badge-error' : stage3Status === 'RUNNING' ? 'badge-primary' : 'badge-ghost'"
              >
                {{ stage3Status }}
              </span>
            </div>
            <div class="stage-title">Batch Read Modbus</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Read Back:</span> <span class="v">{{ fcReadBackRegsCount }} / {{ fcTotalMemmapRegsCount }}</span></div>
              <div class="stage-item"><span class="k">Mismatch:</span> <span class="v text-danger font-bold">{{ fcMismatchCount }}</span></div>
              <div class="stage-item"><span class="k">Audit Mode:</span> <span class="v">Batch Modbus</span></div>
            </div>
          </div>
        </div>

        <!-- Stage 4 -->
        <div>
          <div class="stage-card" :class="['status-' + stage4Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 4</span>
              <span
                class="badge badge-sm font-mono font-semibold"
                :class="stage4Status === 'PASS' ? 'badge-success' : stage4Status === 'FAIL' ? 'badge-error' : stage4Status === 'RUNNING' ? 'badge-primary' : 'badge-ghost'"
              >
                {{ stage4Status }}
              </span>
            </div>
            <div class="stage-title">Automated QA Verdict</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Verdict:</span> <span class="v">{{ finalVerdict }}</span></div>
              <div class="stage-item"><span class="k">Save DB:</span> <span class="v">{{ fcDbSaved ? 'Saved (Checkpointed)' : 'Pending' }}</span></div>
              <div class="stage-item"><span class="k">Audit Log:</span> <span class="v">183 Registers</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. LIVE REGISTER AUDIT GRID (TABULATOR) (DEBUG MODE ONLY) -->
    <div v-if="fcDebugMode" class="card border border-base-content/10 bg-base-100 shadow-sm p-4 fc-card debug-card">
      <div class="audit-toolbar pb-3 mb-3 border-b border-base-content/10">
        <div class="toolbar-left">
          <div class="toolbar-title flex items-center gap-2">
            <Sliders class="w-4 h-4 text-primary" />
            <span>LIVE REGISTER AUDIT GRID (183 REGISTERS)</span>
          </div>
          <div class="join">
            <button
              class="btn btn-xs join-item"
              :class="auditStatusFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'"
              @click="auditStatusFilter = 'ALL'"
            >
              All ({{ fcAuditRegisters.length }})
            </button>
            <button
              class="btn btn-xs join-item"
              :class="auditStatusFilter === 'FAIL' ? 'btn-error' : 'btn-ghost'"
              @click="auditStatusFilter = 'FAIL'"
            >
              Mismatch ({{ fcMismatchCount }})
            </button>
            <button
              class="btn btn-xs join-item"
              :class="auditStatusFilter === 'PASS' ? 'btn-success' : 'btn-ghost'"
              @click="auditStatusFilter = 'PASS'"
            >
              Match ({{ fcAuditRegisters.length - fcMismatchCount }})
            </button>
          </div>
        </div>

        <div class="toolbar-right flex items-center gap-2">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              v-model="auditSearchQuery"
              type="text"
              placeholder="Search register / param..."
              class="input input-sm input-bordered pl-8 w-56"
            />
          </div>
          <button class="btn btn-sm btn-outline flex items-center gap-1" @click="exportAuditCsv">
            <FileText class="w-3.5 h-3.5" />
            CSV
          </button>
          <button class="btn btn-sm btn-outline flex items-center gap-1" @click="exportAuditXlsx">
            <FileSpreadsheet class="w-3.5 h-3.5" />
            Excel
          </button>
        </div>
      </div>

      <!-- Tabulator Table Mount Node -->
      <div class="table-container">
        <div id="final-config-device-table" class="tabulator-host"></div>
      </div>
    </div>

    <!-- 4. UART LIVE COMMUNICATION LOGS (DEBUG MODE ONLY) -->
    <div v-if="fcDebugMode" class="card border border-base-content/10 bg-base-100 shadow-sm p-4 fc-card debug-card logs-card">
      <div class="fc-card-header pb-3 mb-3 border-b border-base-content/10">
        <div class="header-left">
          <Terminal class="w-5 h-5 text-primary header-icon" />
          <span class="header-title">UART LIVE COMMUNICATION LOGS</span>
        </div>
        <div class="header-right flex items-center gap-2">
          <button class="btn btn-xs btn-outline flex items-center gap-1" @click="fcCopySerialLogs">
            <Copy class="w-3.5 h-3.5" />
            Copy Logs
          </button>
          <button class="btn btn-xs btn-outline btn-error flex items-center gap-1" @click="fcClearSerialLogs">
            <Trash2 class="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div class="uart-logs-viewer" id="fc-serial-logs-box">
        <div v-if="fcSerialLogs.length === 0" class="empty-logs">
          No UART communication packets recorded yet. Connect to a port and start the pipeline to stream packets.
        </div>
        <div
          v-for="(log, idx) in fcSerialLogs"
          :key="idx"
          class="log-line"
          :class="['log-' + log.type]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span
            class="badge badge-xs font-mono"
            :class="log.type === 'tx' ? 'badge-primary' : log.type === 'rx' ? 'badge-success' : log.type === 'err' ? 'badge-error' : 'badge-ghost'"
          >
            {{ log.tag }}
          </span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- POPUP CẢNH BÁO THIẾT BỊ ĐÃ PASSED TRONG DATABASE -->
    <dialog class="modal" :class="{ 'modal-open': alreadyPassedModal }">
      <div class="modal-box border border-warning/30 bg-base-100">
        <h3 class="font-bold text-lg text-warning flex items-center gap-2">
          <AlertTriangle class="w-5 h-5" />
          Device Already Configured
        </h3>
        <div class="alert alert-warning mt-3 text-sm">
          <AlertTriangle class="w-4 h-4" />
          <span>Thiết bị đã hoàn tất Final Config trong hệ thống!</span>
        </div>
        <div v-if="alreadyPassedInfo" class="already-passed-content font-mono mt-4 space-y-1 text-sm bg-base-200/50 p-3 rounded-lg border border-base-content/10">
          <p><strong>Serial Number:</strong> {{ alreadyPassedInfo.serial_number }}</p>
          <p v-if="alreadyPassedInfo.dev_eui"><strong>DevEUI:</strong> {{ alreadyPassedInfo.dev_eui }}</p>
          <p v-if="alreadyPassedInfo.so"><strong>Sales Order:</strong> {{ alreadyPassedInfo.so }}</p>
          <p v-if="alreadyPassedInfo.tested_at"><strong>Passed At:</strong> {{ new Date(alreadyPassedInfo.tested_at).toLocaleString() }}</p>
        </div>
        <div class="modal-action">
          <button class="btn btn-warning" @click="alreadyPassedModal = false">
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="alreadyPassedModal = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Cpu,
  Link,
  Power,
  Play,
  RotateCcw,
  X,
  AlertTriangle,
  Clock,
  Search,
  FileText,
  FileSpreadsheet,
  Terminal,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sliders,
} from 'lucide-vue-next';
import { useFinalConfigEngine } from '../composables/useFinalConfigEngine';

const {
  fcFormatBytes,
  fcSerialPort,
  fcSerialConnected,
  fcSerialConnecting,
  fcIsAutoReconnecting,
  fcSerialPortInfo,
  fcSerialConfig,
  fcSerialSignals,
  fcSerialStats,
  fcSerialLogs,
  alreadyPassedModal,
  alreadyPassedInfo,
  fcSerialNumberInput,
  fcSelectedSo,
  isRunningFinalConfig,
  fcProgress,
  currentStage,
  fcStatusMessage,
  finalVerdict,
  fcHardwareInfo,
  fcSoCheckStatus,
  stage1Status,
  stage2Status,
  stage3Status,
  stage4Status,
  stage2Settled,
  fcWrittenRegsCount,
  fcTotalWriteRegsCount,
  fcAppKeyWriteStatus,
  fcReadBackRegsCount,
  fcTotalMemmapRegsCount,
  fcMismatchCount,
  fcDbSaved,
  fcAuditRegisters,
  auditSearchQuery,
  auditStatusFilter,
  fcDebugMode,
  startFinalConfig,
  resetFinalConfig,
  abortFinalConfig,
  filteredAuditRegisters,
  exportAuditCsv,
  exportAuditXlsx,
  fcSelectSerialPort,
  fcConnectSerial,
  fcDisconnectSerial,
  fcToggleDTR,
  fcToggleRTS,
  fcCopySerialLogs,
  fcClearSerialLogs,
} = useFinalConfigEngine();

// STATUS label & tag type computation (màu xám khi idle/chưa chạy)
const statusDisplayText = computed(() => {
  if (isRunningFinalConfig.value) return 'RUNNING';
  if (finalVerdict.value === 'PASS') return 'PASS';
  if (finalVerdict.value === 'FAIL') return 'FAIL';
  return 'NONE';
});
</script>

<style scoped>
.final-config-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.fc-card {
  border-radius: 8px;
}

.main-control-card {
  background: var(--el-bg-color-overlay, #ffffff);
  border: 1px solid var(--el-border-color-light, rgba(255, 255, 255, 0.1));
}

.fc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-icon {
  color: hsl(var(--p));
}

.header-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--el-text-color-primary, currentColor);
  letter-spacing: 0.5px;
}

.header-debug-stats {
  font-family: var(--cyber-font-mono);
  font-size: 12px;
  color: var(--el-text-color-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-divider {
  color: var(--el-border-color, rgba(255, 255, 255, 0.15));
}

/* 1.1 TOP HORIZONTAL SERIAL PORT BAR */
.serial-port-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 0 12px 0;
}

.port-bar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.port-btn-group .btn-uniform {
  height: 44px;
  font-weight: 700;
  font-size: 14px;
}

.inline-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-regular, #94a3b8);
}

.signals-item {
  margin-left: 8px;
  gap: 6px;
}

.port-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.port-info-badge {
  font-size: 11px;
  background: var(--el-fill-color-light, rgba(255, 255, 255, 0.05));
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--el-text-color-secondary, #94a3b8);
}

.card-section-divider {
  height: 1px;
  background: var(--el-border-color-lighter, rgba(255, 255, 255, 0.08));
  margin: 8px 0 16px 0;
}

/* 1.2 ACTION CONTROLS & STATUS ROW (UNIFORM SIZING) */
.execution-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.controls-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-uniform-action {
  height: 46px;
  font-size: 15px;
  font-weight: 700;
  padding: 0 24px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.btn-start {
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.35);
}

.btn-abort {
  box-shadow: 0 0 12px rgba(245, 108, 108, 0.35);
}

.status-banner {
  display: flex;
  align-items: center;
}

/* 1.3 PIPELINE CENTER HUB (READOUTS & PROGRESS BAR) */
.pipeline-center-hub {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(10, 15, 26, 0.7);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.03);
}

.cyber-readout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .cyber-readout-grid {
    grid-template-columns: 1fr;
  }
}

.cyber-readout-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.readout-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.readout-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--owl-text-muted, #94a3b8);
}

.readout-display-box {
  background: var(--owl-bg-surface, #1e2430);
  border: 1px solid var(--owl-border, rgba(178, 204, 214, 0.15));
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.readout-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--owl-text-bright, #ffffff);
  letter-spacing: 2px;
}

/* CYBER PROGRESS BLOCK */
.cyber-progress-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.progress-meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-meta-title {
  font-weight: 700;
  letter-spacing: 1px;
  color: #94a3b8;
}

.progress-meta-stage {
  color: hsl(var(--p));
  font-weight: 600;
}

.progress-meta-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-meta-verdict {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.verdict-running {
  color: hsl(var(--in));
}

.verdict-pass {
  color: #10b981;
}

.verdict-fail {
  color: #ef4444;
}

.progress-meta-percent {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

/* CYBER MICRO-DOTS TRACK */
.cyber-microdots-track {
  position: relative;
  height: 14px;
  background: var(--owl-bg-surface, #1e2430);
  border: 1px solid var(--owl-border, rgba(178, 204, 214, 0.2));
  border-radius: 7px;
  overflow: visible;
}

.cyber-microdots-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: hsl(var(--p));
  border-radius: 6px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cyber-microdots-fill.is-running {
  background: hsl(var(--in));
}

.cyber-microdots-fill.is-pass {
  background: #10b981;
}

.cyber-microdots-fill.is-fail {
  background: #ef4444;
}

.fill-lead-head {
  position: absolute;
  right: -6px;
  top: -2px;
  bottom: -2px;
  width: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fill-lead-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  animation: beacon-pulse 1s infinite alternate;
}

@keyframes beacon-pulse {
  from { transform: scale(0.8); opacity: 0.8; }
  to { transform: scale(1.3); opacity: 1; }
}

.cyber-telemetry-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding-top: 4px;
}

.telemetry-prompt {
  color: #94a3b8;
  font-weight: 600;
}

.telemetry-msg {
  color: #38bdf8;
}

/* 2. REAL-TIME AUTOMATION STATUS & 4 STAGES */
.debug-card {
  background: var(--el-bg-color-overlay, #ffffff);
  border: 1px solid var(--el-border-color-light, rgba(255, 255, 255, 0.1));
}

.stage-card {
  border: 1px solid var(--el-border-color, rgba(255, 255, 255, 0.15));
  border-radius: 6px;
  padding: 12px;
  background: var(--el-fill-color-blank, rgba(255, 255, 255, 0.02));
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
}

.stage-card.status-pass {
  border-color: rgba(103, 194, 58, 0.6);
  background: rgba(103, 194, 58, 0.05);
}

.stage-card.status-fail {
  border-color: rgba(245, 108, 108, 0.6);
  background: rgba(245, 108, 108, 0.05);
}

.stage-card.status-running {
  border-color: rgba(0, 240, 255, 0.6);
  background: rgba(0, 240, 255, 0.05);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-idx {
  font-family: var(--cyber-font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary, #94a3b8);
}

.stage-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary, currentColor);
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-family: var(--cyber-font-mono);
  color: var(--el-text-color-regular, #94a3b8);
}

.stage-item {
  display: flex;
  justify-content: space-between;
}

.stage-item .k {
  color: var(--el-text-color-secondary, #94a3b8);
}

.stage-item .v {
  font-weight: 600;
}

/* 3. AUDIT GRID TOOLBAR & TABULATOR HOST */
.audit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-container {
  width: 100%;
  margin-top: 12px;
}

.tabulator-host {
  width: 100%;
}

/* 4. UART LOGS VIEWER */
.uart-logs-viewer {
  height: 220px;
  overflow-y: auto;
  background: #050b14;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--cyber-font-mono);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-logs {
  color: #64748b;
  font-style: italic;
  padding: 20px 0;
  text-align: center;
}

.log-line {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.log-time {
  color: #64748b;
  font-size: 11px;
}

.log-msg {
  color: #cbd5e1;
  word-break: break-all;
}

.log-tx .log-msg {
  color: #38bdf8;
}

.log-rx .log-msg {
  color: #4ade80;
}

.log-err .log-msg {
  color: #f87171;
}

.text-danger {
  color: #f56c6c;
}
</style>
