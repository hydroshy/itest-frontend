<template>
  <div class="final-config-tool">
    <!-- 1. TOP HEADER & UART CONTROL CARD -->
    <el-card shadow="never" class="fc-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon" :size="20"><Operation /></el-icon>
            <span class="header-title">FINAL CONFIG DEVICE - EXECUTION ENGINE</span>
            <el-tag size="small" type="primary" effect="plain">WEB SERIAL API</el-tag>
            <el-tag size="small" type="success" effect="plain">4-STAGE AUTOMATION</el-tag>
            <el-tag size="small" type="warning" effect="plain">PRODUCTION QA</el-tag>
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

      <!-- Serial & Execution Controls -->
      <div class="uart-controls-row">
        <!-- Serial Connection Group -->
        <div class="control-group">
          <el-button-group>
            <el-button type="primary" :icon="Cpu" @click="fcSelectSerialPort">
              Select Port
            </el-button>
            <el-button
              v-if="fcSerialPort && !fcSerialConnected"
              type="success"
              :icon="Link"
              :loading="fcSerialConnecting || fcIsAutoReconnecting"
              @click="fcConnectSerial(fcSerialPort)"
            >
              {{ fcIsAutoReconnecting ? 'Reconnecting...' : 'Connect' }}
            </el-button>
            <el-button
              v-if="fcSerialConnected"
              type="danger"
              :icon="SwitchButton"
              @click="fcDisconnectSerial(true)"
            >
              Disconnect
            </el-button>
          </el-button-group>

          <!-- Baud Rate -->
          <div class="inline-item">
            <span class="item-label">Baud:</span>
            <el-select
              v-model="fcSerialConfig.baudRate"
              size="default"
              style="width: 120px;"
              :disabled="fcSerialConnected || fcSerialConnecting || isRunningFinalConfig"
            >
              <el-option :value="9600" label="9600 bps" />
              <el-option :value="19200" label="19200 bps" />
              <el-option :value="38400" label="38400 bps" />
              <el-option :value="57600" label="57600 bps" />
              <el-option :value="115200" label="115200 bps" />
            </el-select>
          </div>

          <!-- DTR / RTS signals -->
          <div class="inline-item">
            <el-button
              size="small"
              :type="fcSerialSignals.dtr ? 'primary' : 'info'"
              :plain="!fcSerialSignals.dtr"
              :disabled="!fcSerialConnected"
              @click="fcToggleDTR"
            >
              DTR: {{ fcSerialSignals.dtr ? '1' : '0' }}
            </el-button>
            <el-button
              size="small"
              :type="fcSerialSignals.rts ? 'primary' : 'info'"
              :plain="!fcSerialSignals.rts"
              :disabled="!fcSerialConnected"
              @click="fcToggleRTS"
            >
              RTS: {{ fcSerialSignals.rts ? '1' : '0' }}
            </el-button>
          </div>

          <!-- Port status tag -->
          <el-tag
            :type="fcSerialConnected ? 'success' : (fcIsAutoReconnecting ? 'warning' : (fcSerialPort ? 'primary' : 'info'))"
            effect="dark"
            class="port-status-tag"
          >
            {{ fcSerialPortInfo || 'No Port Selected' }}
            {{ fcSerialConnected ? '(Connected)' : (fcIsAutoReconnecting ? '(Reconnecting...)' : (fcSerialPort ? '(Ready)' : '')) }}
          </el-tag>
        </div>

        <!-- Action Buttons & Verdict Banner -->
        <div class="action-group">
          <el-button
            type="primary"
            size="large"
            :icon="isRunningFinalConfig ? Loading : VideoPlay"
            :loading="isRunningFinalConfig"
            :disabled="!fcSerialConnected || isRunningFinalConfig || finalVerdict === 'FAIL'"
            @click="startFinalConfig"
          >
            {{ isRunningFinalConfig ? 'EXECUTING...' : 'START' }}
          </el-button>

          <el-button
            size="large"
            :icon="RefreshLeft"
            :disabled="isRunningFinalConfig"
            @click="resetFinalConfig"
          >
            Reset
          </el-button>

          <el-button
            v-if="isRunningFinalConfig"
            type="danger"
            size="large"
            :icon="CloseBold"
            @click="abortFinalConfig"
          >
            Abort
          </el-button>

          <el-checkbox v-model="fcDebugMode" label="Debug Mode" border />

          <!-- Final Verdict Status -->
          <div v-if="finalVerdict" class="verdict-banner">
            <el-tag
              :type="finalVerdict === 'PASS' ? 'success' : 'danger'"
              size="large"
              effect="dark"
              class="verdict-tag"
            >
              <el-icon><CircleCheckFilled v-if="finalVerdict === 'PASS'" /><CircleCloseFilled v-else /></el-icon>
              FINAL VERDICT: {{ finalVerdict }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 2. STAGE 2 LOCK OVERVIEW (WHEN S2 ACTIVE) -->
    <el-card v-if="fcProgress >= 25" shadow="never" class="fc-card lock-card">
      <template #header>
        <div class="lock-header">
          <div class="lock-title">
            <el-icon class="text-warning"><Tickets /></el-icon>
            <span>STAGE 2 LOCKED TARGET CONFIGURATION</span>
          </div>
          <el-tag type="warning" effect="plain">LOCKED VIA SN/SO</el-tag>
        </div>
      </template>

      <el-form label-position="top" inline class="lock-form">
        <el-form-item label="Locked Serial Number (SN:259):">
          <el-input :model-value="fcSerialNumberInput" readonly style="width: 280px;" />
        </el-form-item>
        <el-form-item label="Sales Order Target:">
          <el-input :model-value="fcSelectedSo" readonly style="width: 280px;" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 3. REAL-TIME AUTOMATION STATUS & 4 STAGES -->
    <el-card shadow="never" class="fc-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Clock /></el-icon>
            <span class="header-title">REAL-TIME AUTOMATION STATUS</span>
          </div>
          <div class="header-status-message font-mono">
            {{ fcStatusMessage || (isRunningFinalConfig ? 'Processing 4-stage automated Final Config pipeline...' : 'System ready for automated operation.') }}
          </div>
        </div>
      </template>

      <!-- Progress bar -->
      <div class="progress-section">
        <div class="progress-label">
          <span>PIPELINE PROGRESS</span>
          <span class="progress-val">{{ fcProgress }}%</span>
        </div>
        <el-progress
          :percentage="fcProgress"
          :stroke-width="16"
          :status="finalVerdict === 'FAIL' ? 'exception' : (finalVerdict === 'PASS' ? 'success' : '')"
          :striped="isRunningFinalConfig"
          :striped-flow="isRunningFinalConfig"
        />
      </div>

      <!-- 4 Stages Grid -->
      <el-row :gutter="16" class="stages-row">
        <!-- Stage 1 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stage-box" :class="{ 'stage-active': currentStage === 1, 'stage-done': currentStage > 1 }">
            <div class="stage-box-header">
              <span class="stage-code">STAGE 1 (0-25%)</span>
              <el-tag size="small" :type="stage1Status === 'PASS' ? 'success' : (stage1Status === 'FAIL' ? 'danger' : (stage1Status === 'RUNNING' ? 'primary' : 'info'))">
                {{ stage1Status }}
              </el-tag>
            </div>
            <div class="stage-title">Hardware ID & SO Check</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">SN (259):</span> <span class="v">{{ fcHardwareInfo.serialNumber || '-' }}</span></div>
              <div class="stage-item"><span class="k">DevEUI (27):</span> <span class="v text-primary">{{ fcHardwareInfo.devEui || '-' }}</span></div>
              <div class="stage-item"><span class="k">FW (5) / Type (103):</span> <span class="v">{{ fcHardwareInfo.firmwareVersion || '-' }} / {{ fcHardwareInfo.sensorType || '-' }}</span></div>
              <div class="stage-item"><span class="k">HW (9):</span> <span class="v">{{ fcHardwareInfo.hwVersion || '-' }}</span></div>
              <div class="stage-item"><span class="k">Item Code (386):</span> <span class="v">{{ fcHardwareInfo.itemCode || '-' }}</span></div>
              <div class="stage-item"><span class="k">SO Check:</span> <span class="v text-warning">{{ fcSoCheckStatus }}</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 2 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stage-box" :class="{ 'stage-active': currentStage === 2, 'stage-done': currentStage > 2 }">
            <div class="stage-box-header">
              <span class="stage-code">STAGE 2 (25-50%)</span>
              <el-tag size="small" :type="stage2Status === 'PASS' ? 'success' : (stage2Status === 'FAIL' ? 'danger' : (stage2Status === 'RUNNING' ? 'primary' : 'info'))">
                {{ stage2Status }}
              </el-tag>
            </div>
            <div class="stage-title">Write Preset & AppKey</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Preset Regs (>=303):</span> <span class="v">{{ fcWrittenRegsCount }} / {{ fcTotalWriteRegsCount }} written</span></div>
              <div class="stage-item"><span class="k">LoRa AppKey (274):</span> <span class="v text-primary">{{ fcAppKeyWriteStatus }} (8 words)</span></div>
              <div class="stage-item"><span class="k">Write Method:</span> <span class="v text-primary">Modbus FC 16</span></div>
              <div class="stage-item"><span class="k">EEPROM Settle:</span> <span class="v">{{ stage2Settled ? '300ms OK' : 'Waiting' }}</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 3 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stage-box" :class="{ 'stage-active': currentStage === 3, 'stage-done': currentStage > 3 }">
            <div class="stage-box-header">
              <span class="stage-code">STAGE 3 (50-75%)</span>
              <el-tag size="small" :type="stage3Status === 'PASS' ? 'success' : (stage3Status === 'FAIL' ? 'danger' : (stage3Status === 'RUNNING' ? 'primary' : 'info'))">
                {{ stage3Status }}
              </el-tag>
            </div>
            <div class="stage-title">Read Full Memory Map</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Read Registers:</span> <span class="v">{{ fcReadBackRegsCount }} / {{ fcTotalMemmapRegsCount }}</span></div>
              <div class="stage-item"><span class="k">Polling Function:</span> <span class="v text-primary">Modbus FC 03 Chunk</span></div>
              <div class="stage-item"><span class="k">Snapshot Memory:</span> <span class="v">{{ stage3Status === 'PASS' ? 'Captured' : 'Pending' }}</span></div>
              <div class="stage-item"><span class="k">Auto-Reconnect:</span> <span class="v text-success">Guard Active</span></div>
            </div>
          </div>
        </el-col>

        <!-- Stage 4 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stage-box" :class="{ 'stage-active': currentStage === 4, 'stage-done': stage4Status === 'PASS' }">
            <div class="stage-box-header">
              <span class="stage-code">STAGE 4 (75-100%)</span>
              <el-tag size="small" :type="stage4Status === 'PASS' ? 'success' : (stage4Status === 'FAIL' ? 'danger' : (stage4Status === 'RUNNING' ? 'primary' : 'info'))">
                {{ stage4Status }}
              </el-tag>
            </div>
            <div class="stage-title">Automated QA Verdict</div>
            <div class="stage-details">
              <div class="stage-item"><span class="k">Compared Regs:</span> <span class="v">{{ fcAuditRegisters.length }} regs</span></div>
              <div class="stage-item"><span class="k">Mismatch Count:</span> <span class="v" :class="fcMismatchCount > 0 ? 'text-danger' : 'text-success'">{{ fcMismatchCount }}</span></div>
              <div class="stage-item"><span class="k">DB Persistence:</span> <span class="v text-primary">{{ fcDbSaved ? 'Saved (audit)' : 'Pending' }}</span></div>
              <div class="stage-item"><span class="k">PostgreSQL Target:</span> <span class="v">final_config_sn / regs</span></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. LIVE REGISTER AUDIT GRID (TABULATOR) -->
    <el-card shadow="never" class="fc-card">
      <template #header>
        <div class="audit-toolbar">
          <div class="toolbar-left">
            <div class="toolbar-title">
              <el-icon class="header-icon"><Grid /></el-icon>
              <span>LIVE REGISTER AUDIT GRID</span>
            </div>
            <el-tag size="small" type="info">{{ filteredAuditRegisters.length }} of {{ fcAuditRegisters.length }} Registers</el-tag>

            <!-- Filter radio buttons -->
            <el-radio-group v-model="auditStatusFilter" size="small">
              <el-radio-button label="ALL" value="ALL" />
              <el-radio-button label="PASS" value="PASS" />
              <el-radio-button label="FAIL" value="FAIL" />
              <el-radio-button label="NONE" value="NONE" />
            </el-radio-group>
          </div>

          <div class="toolbar-right">
            <el-input
              v-model="auditSearchQuery"
              placeholder="Search register..."
              :prefix-icon="Search"
              clearable
              style="width: 200px;"
            />
            <el-button :icon="Document" @click="exportAuditCsv">CSV</el-button>
            <el-button :icon="Document" @click="exportAuditXlsx">Excel</el-button>
          </div>
        </div>
      </template>

      <!-- Tabulator Mount Element -->
      <div class="table-container">
        <div id="final-config-device-table" class="tabulator-host"></div>
      </div>
    </el-card>

    <!-- 5. HARDWARE UART COMMUNICATION LOGS (DEBUG MODE ONLY) -->
    <el-card v-show="fcDebugMode" shadow="never" class="fc-card">
      <template #header>
        <div class="fc-card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Monitor /></el-icon>
            <span class="header-title">HARDWARE UART COMMUNICATION LOGS</span>
          </div>
          <div class="header-right">
            <el-button size="small" :icon="CopyDocument" @click="fcCopySerialLogs">Copy</el-button>
            <el-button size="small" :icon="Delete" @click="fcClearSerialLogs">Clear</el-button>
          </div>
        </div>
      </template>

      <div class="uart-logs-viewer font-mono">
        <div v-if="fcSerialLogs.length === 0" class="empty-logs">
          No UART communication packets recorded yet.
        </div>
        <div v-for="(log, idx) in fcSerialLogs" :key="idx" class="log-line">
          <span class="log-time">{{ log.time }}</span>
          <el-tag
            size="small"
            class="log-tag"
            :type="log.tag === 'TX' ? 'primary' : (log.tag === 'RX' ? 'success' : (log.tag === 'ERR' ? 'danger' : 'warning'))"
          >
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
          Acknowledge & Close
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
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
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-transform: uppercase;
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

.uart-controls-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.inline-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.port-status-tag {
  font-family: monospace;
}

.action-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.verdict-banner {
  margin-left: auto;
}

.verdict-tag {
  font-weight: 700;
  letter-spacing: 1px;
}

.lock-card {
  border-left: 4px solid var(--el-color-warning);
}

.lock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lock-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
}

.lock-form {
  margin-bottom: 0;
}

.header-status-message {
  font-size: 12px;
  color: var(--el-color-primary);
}

.progress-section {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.progress-val {
  font-family: monospace;
  color: var(--el-color-primary);
}

.stages-row {
  margin-top: 12px;
}

.stage-box {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 14px;
  min-height: 180px;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.stage-box.stage-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
  background: var(--el-color-primary-light-9);
}

.stage-box.stage-done {
  border-color: var(--el-color-success-light-5);
}

.stage-box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stage-code {
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
}

.stage-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  word-break: break-all;
}

.already-passed-content p {
  margin: 6px 0;
  font-size: 12px;
}

.text-primary {
  color: var(--el-color-primary) !important;
}

.text-success {
  color: var(--el-color-success) !important;
}

.text-warning {
  color: var(--el-color-warning) !important;
}

.text-danger {
  color: var(--el-color-danger) !important;
}

.font-mono {
  font-family: monospace;
}
</style>
