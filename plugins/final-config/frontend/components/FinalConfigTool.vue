<template>
  <div class="final-config-tool">
    <!-- 1. MAIN AUTOMATION & CONFIGURATION CARD -->
    <el-card shadow="never" class="fc-card main-control-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon" :size="20"><Operation /></el-icon>
            <span class="header-title">FINAL CONFIG DEVICE</span>
          </div>
          <div v-if="fcDebugMode" class="header-debug-stats">
            <span class="stat-item"><el-icon><Top /></el-icon> TX: {{ fcSerialStats.txPackets }} ({{ fcFormatBytes(fcSerialStats.txBytes) }})</span>
            <span class="stat-divider">|</span>
            <span class="stat-item"><el-icon><Bottom /></el-icon> RX: {{ fcSerialStats.rxPackets }} ({{ fcFormatBytes(fcSerialStats.rxBytes) }})</span>
            <span class="stat-divider">|</span>
            <span class="stat-item text-danger"><el-icon><WarningFilled /></el-icon> ERR: {{ fcSerialStats.errCount }}</span>
          </div>
        </div>
      </template>

      <!-- 1.1 TOP HORIZONTAL SERIAL PORT BAR -->
      <div class="serial-port-top-bar">
        <div class="port-bar-left">
          <el-button-group class="port-btn-group">
            <el-button type="primary" :icon="Cpu" @click="fcSelectSerialPort" class="btn-uniform">
              Select Port
            </el-button>
            <el-button
              v-if="fcSerialPort && !fcSerialConnected"
              type="success"
              :icon="Link"
              :loading="fcSerialConnecting || fcIsAutoReconnecting"
              @click="fcConnectSerial(fcSerialPort)"
              class="btn-uniform"
            >
              {{ fcIsAutoReconnecting ? 'Reconnecting...' : 'Connect' }}
            </el-button>
            <el-button
              v-if="fcSerialConnected"
              type="danger"
              :icon="SwitchButton"
              @click="fcDisconnectSerial(true)"
              class="btn-uniform"
            >
              Disconnect
            </el-button>
          </el-button-group>

          <!-- Baud Rate -->
          <div class="inline-item baud-item">
            <span class="item-label">Baud:</span>
            <el-select
              v-model="fcSerialConfig.baudRate"
              size="default"
              style="width: 130px;"
              :disabled="fcSerialConnected || fcSerialConnecting || isRunningFinalConfig"
            >
              <el-option :value="9600" label="9600 bps" />
              <el-option :value="19200" label="19200 bps" />
              <el-option :value="38400" label="38400 bps" />
              <el-option :value="57600" label="57600 bps" />
              <el-option :value="115200" label="115200 bps" />
            </el-select>
          </div>

          <!-- DTR / RTS signals (Debug mode or active) -->
          <div v-if="fcDebugMode || fcSerialConnected" class="inline-item signals-item">
            <el-tag
              size="small"
              :type="fcSerialSignals.dtr ? 'success' : 'info'"
              effect="plain"
              class="cursor-pointer signal-tag"
              @click="fcToggleDTR"
            >
              DTR: {{ fcSerialSignals.dtr ? 'ON' : 'OFF' }}
            </el-tag>
            <el-tag
              size="small"
              :type="fcSerialSignals.rts ? 'success' : 'info'"
              effect="plain"
              class="cursor-pointer signal-tag"
              @click="fcToggleRTS"
            >
              RTS: {{ fcSerialSignals.rts ? 'ON' : 'OFF' }}
            </el-tag>
          </div>
        </div>

        <div class="port-bar-right">
          <!-- Port connection info -->
          <el-tag
            :type="fcSerialConnected ? 'success' : 'info'"
            size="default"
            effect="light"
            class="port-status-tag"
          >
            <span class="status-indicator-dot" :class="{ 'connected': fcSerialConnected }"></span>
            {{ fcSerialConnected ? `Connected (${fcSerialPortInfo || 'Serial Port'})` : (fcSerialPort ? 'Selected (Offline)' : 'No Port Selected') }}
          </el-tag>
        </div>
      </div>

      <div class="card-section-divider"></div>

      <!-- 1.2 ACTION CONTROLS & STATUS ROW (UNIFORM SIZING) -->
      <div class="execution-controls-row">
        <div class="controls-left">
          <el-button
            type="primary"
            size="large"
            :icon="VideoPlay"
            :loading="isRunningFinalConfig"
            :disabled="!fcSerialConnected || isRunningFinalConfig"
            @click="startFinalConfig"
            class="btn-uniform-action btn-start"
          >
            {{ isRunningFinalConfig ? 'Running Config...' : 'Start Config' }}
          </el-button>

          <el-button
            type="warning"
            plain
            size="large"
            :icon="RefreshLeft"
            :disabled="isRunningFinalConfig"
            @click="resetFinalConfig"
            class="btn-uniform-action btn-reset"
          >
            Reset Config
          </el-button>

          <el-button
            v-if="isRunningFinalConfig"
            type="danger"
            size="large"
            :icon="CloseBold"
            @click="abortFinalConfig"
            class="btn-uniform-action btn-abort"
          >
            Abort
          </el-button>

          <el-checkbox
            v-model="fcDebugMode"
            label="Debug Mode"
            border
            size="large"
            class="debug-checkbox btn-uniform-action"
          />
        </div>

        <!-- STATUS Tag (Thay thế FINAL VERDICT, màu xám khi chưa chạy) -->
        <div class="status-banner">
          <el-tag
            :type="statusTagType"
            size="large"
            effect="dark"
            class="status-verdict-tag"
            :class="{ 'status-idle-tag': statusDisplayText === 'NONE' }"
          >
            <el-icon v-if="statusDisplayText === 'PASS'"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="statusDisplayText === 'FAIL'"><CircleCloseFilled /></el-icon>
            <el-icon v-else-if="statusDisplayText === 'RUNNING'" class="is-loading"><Loading /></el-icon>
            <el-icon v-else><Clock /></el-icon>
            STATUS: {{ statusDisplayText }}
          </el-tag>
        </div>
      </div>

      <!-- 1.3 CYBER HUD DASHBOARD: TARGET CONFIGURATION (SN / SO) & MICRO-DOTS PROGRESS BAR -->
      <div class="cyber-hud-container">
        <!-- Sci-Fi Corner Brackets -->
        <div class="hud-corner hud-corner-tl"></div>
        <div class="hud-corner hud-corner-tr"></div>
        <div class="hud-corner hud-corner-bl"></div>
        <div class="hud-corner hud-corner-br"></div>

        <!-- Top Header: System Telemetry & Lock Status -->
        <div class="cyber-hud-header">
          <div class="hud-title-wrap">
            <span class="hud-tech-badge">STAGE 2 // LOCKED TARGET</span>
            <span class="hud-title-text">TARGET CONFIGURATION &amp; PIPELINE MONITOR</span>
          </div>
          <div class="hud-status-wrap">
            <div
              class="cyber-lock-chip"
              :class="{ 'is-locked': fcProgress >= 25 || stage2Settled }"
            >
              <span class="lock-beacon-dot"></span>
              <span class="lock-chip-text">
                {{ (fcProgress >= 25 || stage2Settled) ? 'LOCKED VIA SN/SO' : 'STANDBY' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Cyber Data Readout: SERIAL NUMBER & SO NUMBER -->
        <div class="cyber-readout-grid">
          <!-- Parameter 1: SERIAL NUMBER -->
          <div class="cyber-readout-card" :class="{ 'has-value': !!fcSerialNumberInput }">
            <div class="readout-header">
              <span class="readout-tag">PARAM 01</span>
              <span class="readout-label">SERIAL NUMBER:</span>
              <el-icon class="readout-icon"><Cpu /></el-icon>
            </div>
            <div class="readout-display-box">
              <span class="readout-value font-mono">
                {{ fcSerialNumberInput || '--- WAITING HARDWARE AUDIT ---' }}
              </span>
            </div>
          </div>

          <!-- Parameter 2: SO NUMBER -->
          <div class="cyber-readout-card" :class="{ 'has-value': !!fcSelectedSo }">
            <div class="readout-header">
              <span class="readout-tag">PARAM 02</span>
              <span class="readout-label">SO NUMBER:</span>
              <el-icon class="readout-icon"><Document /></el-icon>
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
              <!-- Glowing head pulse beacon & shooting micro-dots emitter -->
              <div class="fill-lead-head" v-if="(fcProgress > 0 || isRunningFinalConfig) && fcProgress < 100">
                <div class="fill-lead-beacon" :class="{ 'is-active-pulse': isRunningFinalConfig }"></div>
                <!-- Micro-dots shooting out from the moving head -->
                <div v-if="isRunningFinalConfig" class="lead-spark-emitter">
                  <span class="spark-dot s-1"></span>
                  <span class="spark-dot s-2"></span>
                  <span class="spark-dot s-3"></span>
                  <span class="spark-dot s-4"></span>
                  <span class="spark-dot s-5"></span>
                  <span class="spark-dot s-6"></span>
                  <span class="spark-dot s-7"></span>
                  <span class="spark-dot s-8"></span>
                  <span class="spark-dot s-9"></span>
                  <span class="spark-dot s-10"></span>
                  <span class="spark-dot s-11"></span>
                  <span class="spark-dot s-12"></span>
                  <span class="spark-dot s-13"></span>
                  <span class="spark-dot s-14"></span>
                  <span class="spark-dot s-15"></span>
                  <span class="spark-dot s-16"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cyber Telemetry Status Line -->
        <div class="cyber-telemetry-row">
          <span class="telemetry-prompt">&gt;_ [SYS_MONITOR]:</span>
          <span class="telemetry-msg font-mono">
            {{ fcStatusMessage || (isRunningFinalConfig ? 'EXECUTING AUTOMATED PIPELINE...' : 'SYSTEM READY // AWAITING COMMAND') }}
          </span>
          <span class="telemetry-cursor">█</span>
        </div>
      </div>
    </el-card>

    <!-- 2. REAL-TIME AUTOMATION STATUS & 4 STAGES (DEBUG MODE ONLY) -->
    <el-card v-if="fcDebugMode" shadow="never" class="fc-card debug-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Clock /></el-icon>
            <span class="header-title">4-STAGE PIPELINE AUDIT DETAILS</span>
          </div>
          <el-tag size="small" type="warning" effect="dark">DEBUG MODE ACTIVE</el-tag>
        </div>
      </template>

      <!-- 4 Stages Boxes Grid -->
      <el-row :gutter="12" class="stages-grid">
        <!-- Stage 1 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stage-card" :class="['status-' + stage1Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 1</span>
              <el-tag size="small" :type="stage1Status === 'PASS' ? 'success' : stage1Status === 'FAIL' ? 'danger' : stage1Status === 'RUNNING' ? 'primary' : 'info'" effect="dark">
                {{ stage1Status }}
              </el-tag>
            </div>
            <div class="stage-title">Hardware Inspection</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">SN:</span> <span class="v">{{ fcHardwareInfo.serialNumber || 'N/A' }}</span></div>
              <div class="stage-item"><span class="k">DevEUI:</span> <span class="v">{{ fcHardwareInfo.devEui || 'N/A' }}</span></div>
              <div class="stage-item"><span class="k">SO Check:</span> <span class="v">{{ fcSoCheckStatus }}</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 2 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stage-card" :class="['status-' + stage2Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 2</span>
              <el-tag size="small" :type="stage2Status === 'PASS' ? 'success' : stage2Status === 'FAIL' ? 'danger' : stage2Status === 'RUNNING' ? 'primary' : 'info'" effect="dark">
                {{ stage2Status }}
              </el-tag>
            </div>
            <div class="stage-title">Target Locking &amp; AppKey</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Locked SN:</span> <span class="v">{{ fcSerialNumberInput || 'Pending' }}</span></div>
              <div class="stage-item"><span class="k">Write Regs:</span> <span class="v">{{ fcWrittenRegsCount }} / {{ fcTotalWriteRegsCount }}</span></div>
              <div class="stage-item"><span class="k">AppKey:</span> <span class="v">{{ fcAppKeyWriteStatus }}</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 3 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stage-card" :class="['status-' + stage3Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 3</span>
              <el-tag size="small" :type="stage3Status === 'PASS' ? 'success' : stage3Status === 'FAIL' ? 'danger' : stage3Status === 'RUNNING' ? 'primary' : 'info'" effect="dark">
                {{ stage3Status }}
              </el-tag>
            </div>
            <div class="stage-title">Read Full Memory Map</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Progress:</span> <span class="v">{{ fcReadBackRegsCount }} / {{ fcTotalMemmapRegsCount }}</span></div>
              <div class="stage-item"><span class="k">Mismatches:</span> <span class="v" :class="{ 'text-danger': fcMismatchCount > 0 }">{{ fcMismatchCount }}</span></div>
              <div class="stage-item"><span class="k">Audit Mode:</span> <span class="v">Batch Modbus</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 4 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stage-card" :class="['status-' + stage4Status.toLowerCase()]">
            <div class="stage-header">
              <span class="stage-idx">STAGE 4</span>
              <el-tag size="small" :type="stage4Status === 'PASS' ? 'success' : stage4Status === 'FAIL' ? 'danger' : stage4Status === 'RUNNING' ? 'primary' : 'info'" effect="dark">
                {{ stage4Status }}
              </el-tag>
            </div>
            <div class="stage-title">Automated QA Verdict</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Verdict:</span> <span class="v">{{ finalVerdict }}</span></div>
              <div class="stage-item"><span class="k">Save DB:</span> <span class="v">{{ fcDbSaved ? 'Saved (Checkpointed)' : 'Pending' }}</span></div>
              <div class="stage-item"><span class="k">Audit Log:</span> <span class="v">183 Registers</span></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. LIVE REGISTER AUDIT GRID (TABULATOR) (DEBUG MODE ONLY) -->
    <el-card v-if="fcDebugMode" shadow="never" class="fc-card debug-card">
      <template #header>
        <div class="audit-toolbar">
          <div class="toolbar-left">
            <div class="toolbar-title">
              <el-icon><Grid /></el-icon>
              <span>LIVE REGISTER AUDIT GRID (183 REGISTERS)</span>
            </div>
            <el-radio-group v-model="auditStatusFilter" size="small">
              <el-radio-button label="ALL">All ({{ fcAuditRegisters.length }})</el-radio-button>
              <el-radio-button label="FAIL">Mismatch ({{ fcMismatchCount }})</el-radio-button>
              <el-radio-button label="PASS">Match ({{ fcAuditRegisters.length - fcMismatchCount }})</el-radio-button>
            </el-radio-group>
          </div>

          <div class="toolbar-right">
            <el-input
              v-model="auditSearchQuery"
              placeholder="Search register / param..."
              size="small"
              clearable
              style="width: 220px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button size="small" :icon="Document" @click="exportAuditCsv">CSV</el-button>
            <el-button size="small" :icon="Document" @click="exportAuditXlsx">Excel</el-button>
          </div>
        </div>
      </template>

      <!-- Tabulator Table Mount Node -->
      <div class="table-container">
        <div id="final-config-device-table" class="tabulator-host"></div>
      </div>
    </el-card>

    <!-- 4. UART LIVE COMMUNICATION LOGS (DEBUG MODE ONLY) -->
    <el-card v-if="fcDebugMode" shadow="never" class="fc-card debug-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Monitor /></el-icon>
            <span class="header-title">UART LIVE COMMUNICATION LOGS</span>
          </div>
          <div class="header-right">
            <el-button size="small" :icon="CopyDocument" @click="fcCopySerialLogs">Copy Logs</el-button>
            <el-button size="small" :icon="Delete" @click="fcClearSerialLogs">Clear</el-button>
          </div>
        </div>
      </template>

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
          <el-tag size="small" :type="log.type === 'tx' ? 'primary' : log.type === 'rx' ? 'success' : log.type === 'err' ? 'danger' : 'info'" effect="dark">
            {{ log.tag }}
          </el-tag>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </el-card>

    <!-- POPUP CẢNH BÁO THIẾT BỊ ĐÃ FINAL CONFIG PASS -->
    <el-dialog
      v-model="alreadyPassedModal"
      title="Device Already Configured"
      width="460px"
      destroy-on-close
    >
      <el-alert
        title="Thiết bị đã hoàn tất Final Config trong hệ thống!"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px;"
      />
      <div v-if="alreadyPassedInfo" class="already-passed-content font-mono">
        <p><strong>Serial Number:</strong> {{ alreadyPassedInfo.serial_number }}</p>
        <p v-if="alreadyPassedInfo.dev_eui"><strong>DevEUI:</strong> {{ alreadyPassedInfo.dev_eui }}</p>
        <p v-if="alreadyPassedInfo.so"><strong>Sales Order:</strong> {{ alreadyPassedInfo.so }}</p>
        <p v-if="alreadyPassedInfo.tested_at"><strong>Passed At:</strong> {{ new Date(alreadyPassedInfo.tested_at).toLocaleString() }}</p>
      </div>
      <template #footer>
        <el-button type="warning" @click="alreadyPassedModal = false">
          Acknowledge &amp; Close
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Operation,
  Top,
  Bottom,
  WarningFilled,
  Tickets,
  CircleCheckFilled,
  Cpu,
  Link,
  SwitchButton,
  CircleCloseFilled,
  Loading,
  VideoPlay,
  RefreshLeft,
  CloseBold,
  Clock,
  Grid,
  Search,
  Document,
  Monitor,
  CopyDocument,
  Delete,
} from '@element-plus/icons-vue';
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

const statusTagType = computed(() => {
  if (statusDisplayText.value === 'PASS') return 'success';
  if (statusDisplayText.value === 'FAIL') return 'danger';
  if (statusDisplayText.value === 'RUNNING') return 'primary';
  return 'info'; // Màu xám cho NONE / IDLE
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
  border: 1px solid var(--el-border-color-light);
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
  color: var(--el-color-primary);
}

.header-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.header-debug-stats {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
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
  color: var(--el-border-color);
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
  height: 36px;
  font-weight: 600;
}

.inline-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.signals-item {
  display: flex;
  gap: 6px;
}

.signal-tag {
  font-family: monospace;
  font-weight: 600;
  user-select: none;
}

.port-bar-right {
  display: flex;
  align-items: center;
}

.port-status-tag {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-info);
  display: inline-block;
  transition: all 0.3s ease;
}

.status-indicator-dot.connected {
  background-color: var(--el-color-success);
  box-shadow: 0 0 6px var(--el-color-success);
}

.card-section-divider {
  height: 1px;
  background-color: var(--el-border-color-lighter);
  margin: 10px 0 16px 0;
}

/* 1.2 ACTION CONTROLS & UNIFORM SIZING */
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
  height: 44px;
  min-width: 140px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.debug-checkbox {
  height: 44px;
  margin-right: 0;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.status-banner {
  display: flex;
  align-items: center;
}

.status-verdict-tag {
  height: 44px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-idle-tag {
  background-color: #64748b !important;
  border-color: #475569 !important;
  color: #f1f5f9 !important;
  box-shadow: none !important;
}

/* 1.3 CYBER HUD DASHBOARD & MICRO-DOTS PROGRESS BAR */
.cyber-hud-container {
  position: relative;
  background: radial-gradient(circle at 50% 0%, #0d1527 0%, #060913 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 16px 18px 14px 18px;
  margin-bottom: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* Sci-Fi Corner Brackets */
.hud-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: #38bdf8;
  border-style: solid;
  pointer-events: none;
  opacity: 0.85;
}
.hud-corner-tl {
  top: 3px;
  left: 3px;
  border-width: 2px 0 0 2px;
}
.hud-corner-tr {
  top: 3px;
  right: 3px;
  border-width: 2px 2px 0 0;
}
.hud-corner-bl {
  bottom: 3px;
  left: 3px;
  border-width: 0 0 2px 2px;
}
.hud-corner-br {
  bottom: 3px;
  right: 3px;
  border-width: 0 2px 2px 0;
}

/* Header */
.cyber-hud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  padding-bottom: 10px;
}

.hud-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hud-tech-badge {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 2px 8px;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 3px;
}

.hud-title-text {
  font-size: 13px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: 0.5px;
}

.hud-status-wrap {
  display: flex;
  align-items: center;
}

.cyber-lock-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  background: rgba(100, 116, 139, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.cyber-lock-chip.is-locked {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #34d399;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}

.lock-beacon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.cyber-lock-chip.is-locked .lock-beacon-dot {
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
  animation: beacon-pulse 1.5s infinite;
}

/* Cyber Data Readout: SERIAL NUMBER & SO NUMBER */
.cyber-readout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 768px) {
  .cyber-readout-grid {
    grid-template-columns: 1fr;
  }
}

.cyber-readout-card {
  background: #090f1e;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 4px;
  padding: 10px 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cyber-readout-card.has-value {
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.08);
}

.readout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.readout-tag {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.readout-label {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
  flex: 1;
  margin-left: 8px;
}

.readout-icon {
  font-size: 14px;
  color: #38bdf8;
}

.readout-display-box {
  background: #040711;
  border: 1px solid #1e293b;
  border-radius: 3px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  min-height: 38px;
}

.readout-value {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

.cyber-readout-card:not(.has-value) .readout-value {
  color: #475569;
  text-shadow: none;
  font-weight: 600;
}

/* Micro-Dots Moving Particle Progress Bar */
.cyber-progress-block {
  margin-bottom: 12px;
}

.progress-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.progress-meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-meta-title {
  font-size: 12px;
  font-weight: 800;
  color: #e2e8f0;
  letter-spacing: 0.5px;
}

.progress-meta-stage {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 6px;
  border-radius: 2px;
  border: 1px solid #334155;
}

.progress-meta-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-meta-verdict {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.progress-meta-verdict.verdict-pass {
  color: #34d399;
  text-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
}

.progress-meta-verdict.verdict-fail {
  color: #f87171;
  text-shadow: 0 0 6px rgba(248, 113, 113, 0.6);
}

.progress-meta-verdict.verdict-running {
  color: #38bdf8;
  text-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
}

.progress-meta-percent {
  font-size: 16px;
  font-weight: 900;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  min-width: 48px;
  text-align: right;
}

/* The Micro-Dots Track */
.cyber-microdots-track {
  position: relative;
  height: 24px;
  background-color: #040711;
  border: 1px solid #1e293b;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7);
}

/* Active progress bar fill */
.cyber-microdots-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 14px rgba(6, 182, 212, 0.5);
  overflow: visible;
}

.cyber-microdots-fill.is-pass {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.6);
}

.cyber-microdots-fill.is-fail {
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
}

/* Moving Head Container */
.fill-lead-head {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 0;
  z-index: 4;
}

/* Glowing head pulse beacon */
.fill-lead-beacon {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px #ffffff, 0 0 14px #38bdf8;
  border-radius: 1px;
}

.fill-lead-beacon.is-active-pulse {
  animation: beacon-shimmer 0.6s ease-in-out infinite alternate;
}

@keyframes beacon-shimmer {
  0% {
    box-shadow: 0 0 6px #ffffff, 0 0 12px #38bdf8;
  }
  100% {
    box-shadow: 0 0 12px #ffffff, 0 0 20px #06b6d4, 0 0 28px #38bdf8;
  }
}

/* Micro-dots particle emitter shooting backward (exhaust spray) from moving head */
.lead-spark-emitter {
  position: absolute;
  top: 50%;
  right: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.spark-dot {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: #f0f9ff;
  box-shadow: 0 0 4px #ffffff, 0 0 8px #38bdf8, 0 0 12px #06b6d4;
  pointer-events: none;
  opacity: 0;
}

/* Backward shooting trajectory animations with diagonal angles */
@keyframes spark-spray-1 {
  0% {
    transform: translate(0, 0) scale(1.4);
    opacity: 1;
  }
  35% {
    opacity: 0.95;
  }
  100% {
    transform: translate(-36px, -4px) scale(0.2);
    opacity: 0;
  }
}

@keyframes spark-spray-2 {
  0% {
    transform: translate(0, 0) scale(1.2);
    opacity: 1;
  }
  35% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-28px, 7px) scale(0.2);
    opacity: 0;
  }
}

@keyframes spark-spray-3 {
  0% {
    transform: translate(0, 0) scale(1.5);
    opacity: 1;
  }
  30% {
    opacity: 0.95;
  }
  100% {
    transform: translate(-52px, -2px) scale(0.15);
    opacity: 0;
  }
}

@keyframes spark-spray-4 {
  0% {
    transform: translate(0, 0) scale(1.3);
    opacity: 1;
  }
  35% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-24px, -8px) scale(0.2);
    opacity: 0;
  }
}

@keyframes spark-spray-5 {
  0% {
    transform: translate(0, 0) scale(1.4);
    opacity: 1;
  }
  35% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-32px, 8px) scale(0.2);
    opacity: 0;
  }
}

@keyframes spark-spray-6 {
  0% {
    transform: translate(0, 0) scale(1.2);
    opacity: 1;
  }
  35% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-42px, 3px) scale(0.2);
    opacity: 0;
  }
}

@keyframes spark-spray-7 {
  0% {
    transform: translate(0, 0) scale(1.6);
    opacity: 1;
  }
  30% {
    opacity: 0.95;
  }
  100% {
    transform: translate(-58px, -6px) scale(0.1);
    opacity: 0;
  }
}

@keyframes spark-spray-8 {
  0% {
    transform: translate(0, 0) scale(1.3);
    opacity: 1;
  }
  35% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-34px, -7px) scale(0.2);
    opacity: 0;
  }
}

/* Individual particle variations & delays */
.spark-dot.s-1 {
  width: 2.5px;
  height: 2.5px;
  animation: spark-spray-1 0.65s ease-out infinite;
  animation-delay: 0s;
}

.spark-dot.s-2 {
  width: 2px;
  height: 2px;
  animation: spark-spray-2 0.55s ease-out infinite;
  animation-delay: 0.08s;
}

.spark-dot.s-3 {
  width: 3px;
  height: 3px;
  animation: spark-spray-3 0.75s ease-out infinite;
  animation-delay: 0.16s;
}

.spark-dot.s-4 {
  width: 2px;
  height: 2px;
  animation: spark-spray-4 0.6s ease-out infinite;
  animation-delay: 0.24s;
}

.spark-dot.s-5 {
  width: 2.5px;
  height: 2.5px;
  animation: spark-spray-5 0.7s ease-out infinite;
  animation-delay: 0.32s;
}

.spark-dot.s-6 {
  width: 2px;
  height: 2px;
  animation: spark-spray-6 0.5s ease-out infinite;
  animation-delay: 0.4s;
}

.spark-dot.s-7 {
  width: 3px;
  height: 3px;
  animation: spark-spray-7 0.8s ease-out infinite;
  animation-delay: 0.48s;
}

.spark-dot.s-8 {
  width: 2px;
  height: 2px;
  animation: spark-spray-8 0.62s ease-out infinite;
  animation-delay: 0.56s;
}

.spark-dot.s-9 {
  width: 2.5px;
  height: 2.5px;
  animation: spark-spray-1 0.68s ease-out infinite;
  animation-delay: 0.12s;
}

.spark-dot.s-10 {
  width: 2px;
  height: 2px;
  animation: spark-spray-3 0.58s ease-out infinite;
  animation-delay: 0.28s;
}

.spark-dot.s-11 {
  width: 3px;
  height: 3px;
  animation: spark-spray-5 0.72s ease-out infinite;
  animation-delay: 0.44s;
}

.spark-dot.s-12 {
  width: 1.5px;
  height: 1.5px;
  animation: spark-spray-7 0.76s ease-out infinite;
  animation-delay: 0.6s;
}

.spark-dot.s-13 {
  width: 2px;
  height: 2px;
  animation: spark-spray-2 0.52s ease-out infinite;
  animation-delay: 0.2s;
}

.spark-dot.s-14 {
  width: 2.5px;
  height: 2.5px;
  animation: spark-spray-4 0.66s ease-out infinite;
  animation-delay: 0.36s;
}

.spark-dot.s-15 {
  width: 2px;
  height: 2px;
  animation: spark-spray-6 0.54s ease-out infinite;
  animation-delay: 0.52s;
}

.spark-dot.s-16 {
  width: 2.5px;
  height: 2.5px;
  animation: spark-spray-8 0.64s ease-out infinite;
  animation-delay: 0.04s;
}

/* Telemetry status row */
.cyber-telemetry-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #040711;
  border: 1px solid #1e293b;
  border-radius: 3px;
  padding: 6px 12px;
  overflow: hidden;
}

.telemetry-prompt {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #06b6d4;
  white-space: nowrap;
}

.telemetry-msg {
  font-size: 12px;
  color: #cbd5e1;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.telemetry-cursor {
  font-weight: 800;
  color: #06b6d4;
  animation: beacon-pulse 1s infinite;
}

@keyframes beacon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* 2. DEBUG MODE ONLY SECTIONS */
.debug-card {
  border: 1px dashed var(--el-color-warning-light-3, #f3d19e);
}

.stages-grid {
  margin-top: 4px;
}

.stage-card {
  background: var(--el-fill-color-lighter, #f8fafc);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.3s ease;
}

.stage-card.status-running {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.stage-card.status-pass {
  border-color: var(--el-color-success);
}

.stage-card.status-fail {
  border-color: var(--el-color-danger);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-idx {
  font-size: 11px;
  font-weight: 800;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.5px;
}

.stage-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: monospace;
  font-size: 11px;
}

.stage-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.stage-item .k {
  color: var(--el-text-color-secondary);
}

.stage-item .v {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

/* 3. AUDIT GRID (TABULATOR) */
.audit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.tabulator-host {
  min-height: 380px;
  width: 100%;
}

/* 4. UART LOGS */
.uart-logs-viewer {
  background: var(--el-fill-color-darker, #111827);
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  max-height: 240px;
  overflow-y: auto;
  font-size: 11px;
}

.empty-logs {
  color: #64748b;
  text-align: center;
  padding: 24px;
}

.log-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.5;
}

.log-time {
  color: #64748b;
  white-space: nowrap;
}

.log-msg {
  font-family: monospace;
  word-break: break-all;
}

.cursor-pointer {
  cursor: pointer;
}

.mono-font {
  font-family: 'Courier New', Courier, monospace;
}

.text-danger {
  color: var(--el-color-danger);
}

.text-warning {
  color: var(--el-color-warning);
}
</style>
