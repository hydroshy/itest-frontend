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

      <!-- 1.3 STAGE 2 LOCKED TARGET CONFIGURATION (LUÔN MẶC ĐỊNH HIỆN DƯỚI NÚT START) -->
      <div class="locked-target-container">
        <div class="lock-header">
          <div class="lock-title">
            <el-icon class="text-warning"><Tickets /></el-icon>
            <span>STAGE 2 LOCKED TARGET CONFIGURATION</span>
          </div>
          <el-tag v-if="fcProgress >= 25 || stage2Settled" type="warning" effect="plain" size="small">
            LOCKED VIA SN/SO
          </el-tag>
          <el-tag v-else type="info" effect="plain" size="small">
            TARGET CONFIG STANDBY
          </el-tag>
        </div>

        <el-form label-position="top" inline class="lock-form">
          <el-form-item label="SERIAL NUMBER:">
            <el-input
              :model-value="fcSerialNumberInput"
              readonly
              placeholder="Waiting for hardware audit or input..."
              style="width: 290px;"
              class="target-input mono-font"
            >
              <template #prefix>
                <el-icon><Cpu /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="SO NUMBER:">
            <el-input
              :model-value="fcSelectedSo"
              readonly
              placeholder="Not assigned / Ready"
              style="width: 290px;"
              class="target-input mono-font"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="card-section-divider"></div>

      <!-- 1.4 WATCH DOGS 2 CYBERPUNK ASCII PROGRESS BAR -->
      <div class="wd2-progress-section">
        <div class="wd2-progress-header">
          <div class="wd2-title-block">
            <span class="wd2-tag">PIPELINE PROGRESS</span>
            <span class="wd2-ascii-blocks">{{ wd2AsciiBlocks }}</span>
          </div>
          <div class="wd2-stream-block">
            <span class="wd2-cipher-label">// STREAM:</span>
            <span class="wd2-stream-text" :class="{ 'is-glitching': isRunningFinalConfig }">
              {{ wd2AsciiStream }}
            </span>
            <span class="wd2-hex-chip">{{ wd2RandomCipher }}</span>
          </div>
        </div>

        <!-- Custom Cyberpunk HUD Progress Bar -->
        <div class="wd2-progress-track-wrapper">
          <div class="wd2-progress-track">
            <div
              class="wd2-progress-fill"
              :class="{ 'is-active': isRunningFinalConfig, 'is-pass': finalVerdict === 'PASS', 'is-fail': finalVerdict === 'FAIL' }"
              :style="{ width: fcProgress + '%' }"
            >
              <!-- Moving Scanline Glitch Light -->
              <div class="wd2-glitch-scanner" v-if="isRunningFinalConfig"></div>
            </div>
            <!-- Matrix ASCII character stream floating on progress bar -->
            <div class="wd2-progress-stream-overlay">
              <span class="wd2-marquee-ascii">{{ wd2AsciiStream }} {{ wd2AsciiStream }}</span>
            </div>
          </div>
          <div class="wd2-progress-percentage">
            {{ fcProgress }}%
          </div>
        </div>

        <!-- Terminal Status Message Line -->
        <div class="wd2-terminal-line">
          <span class="terminal-prompt">&gt;_</span>
          <span class="terminal-text">
            {{ fcStatusMessage || (isRunningFinalConfig ? 'EXECUTING AUTOMATED 4-STAGE PIPELINE...' : 'SYSTEM READY // STANDBY') }}
          </span>
          <span class="terminal-cursor" :class="{ 'blink': !isRunningFinalConfig }">_</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

// Watch Dogs 2 / DedSec ASCII Glitch Stream
const asciiGlyphs = '░▒▓█▀▄▌▐01_/<>$#@*!&%?+=~^[]{}|\\;:XYZQWERTY';
const wd2AsciiStream = ref('// STANDBY_AWAITING_TRIGGER //');
const wd2RandomCipher = ref('0x0000');
let wd2Ticker: any = null;

const generateRandomAscii = (len = 32) => {
  let str = '';
  for (let i = 0; i < len; i++) {
    str += asciiGlyphs[Math.floor(Math.random() * asciiGlyphs.length)];
  }
  return str;
};

onMounted(() => {
  wd2Ticker = setInterval(() => {
    if (isRunningFinalConfig.value) {
      wd2AsciiStream.value = generateRandomAscii(34);
      wd2RandomCipher.value = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    } else {
      wd2AsciiStream.value = '// SYSTEM_IDLE_STANDBY //';
      wd2RandomCipher.value = '0x0000';
    }
  }, 65);
});

onUnmounted(() => {
  if (wd2Ticker) {
    clearInterval(wd2Ticker);
    wd2Ticker = null;
  }
});

// ASCII Block Representation: [████████░░░░░░░░]
const wd2AsciiBlocks = computed(() => {
  const total = 22;
  const count = Math.min(total, Math.round((fcProgress.value / 100) * total));
  const empty = Math.max(0, total - count);
  const fillChar = isRunningFinalConfig.value ? '█' : '▓';
  return '[' + fillChar.repeat(count) + '░'.repeat(empty) + ']';
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

/* 1.3 STAGE 2 LOCKED TARGET CONFIGURATION */
.locked-target-container {
  background-color: var(--el-fill-color-light, #f8fafc);
  border: 1px solid var(--el-border-color-lighter, #e2e8f0);
  border-left: 4px solid var(--el-color-warning, #e6a23c);
  border-radius: 6px;
  padding: 12px 16px 4px 16px;
  margin-bottom: 12px;
}

.lock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lock-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.lock-form {
  margin-bottom: 0;
}

.lock-form :deep(.el-form-item) {
  margin-bottom: 10px;
  margin-right: 24px;
}

.lock-form :deep(.el-form-item__label) {
  font-weight: 700;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.5px;
  padding-bottom: 2px;
}

.target-input :deep(.el-input__wrapper) {
  background-color: var(--el-bg-color, #ffffff);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

/* 1.4 WATCH DOGS 2 CYBERPUNK ASCII PROGRESS BAR */
.wd2-progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.wd2-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.wd2-title-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wd2-tag {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--el-text-color-regular);
}

.wd2-ascii-blocks {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

.wd2-stream-block {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}

.wd2-cipher-label {
  color: var(--el-text-color-secondary);
  font-weight: 600;
}

.wd2-stream-text {
  color: #06b6d4;
  letter-spacing: 1px;
  max-width: 320px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
}

.wd2-stream-text.is-glitching {
  color: #10b981;
  text-shadow: 0 0 4px #10b981;
  animation: wd2-text-flicker 0.4s infinite alternate;
}

.wd2-hex-chip {
  background: #0f172a;
  color: #38bdf8;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid #1e293b;
}

.wd2-progress-track-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.wd2-progress-track {
  position: relative;
  flex: 1;
  height: 24px;
  background-color: #090d16;
  border: 1px solid #1e293b;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
}

.wd2-progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #0284c7 0%, #06b6d4 70%, #10b981 100%);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.wd2-progress-fill.is-pass {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
}

.wd2-progress-fill.is-fail {
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}

.wd2-glitch-scanner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 100%
  );
  animation: wd2-scanner-move 1.2s infinite ease-in-out;
}

.wd2-progress-stream-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.28;
}

.wd2-marquee-ascii {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  animation: wd2-marquee 10s linear infinite;
}

.wd2-progress-percentage {
  font-family: 'Courier New', Courier, monospace;
  font-size: 15px;
  font-weight: 800;
  color: var(--el-color-primary);
  min-width: 48px;
  text-align: right;
}

.wd2-terminal-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
  padding: 2px 4px;
}

.terminal-prompt {
  color: var(--el-color-primary);
  font-weight: 800;
}

.terminal-text {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.terminal-cursor {
  font-weight: 800;
  color: var(--el-color-primary);
}

.terminal-cursor.blink {
  animation: wd2-cursor-blink 1s infinite;
}

@keyframes wd2-scanner-move {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes wd2-marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

@keyframes wd2-text-flicker {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

@keyframes wd2-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
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
