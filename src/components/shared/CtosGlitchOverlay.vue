<template>
  <div v-if="isTransitioning" class="ctos-dissolve-overlay">
    <!-- Background CRT scanlines & subtle vignette -->
    <div class="ctos-scanlines"></div>

    <!-- CENTER: DedSec Iconic Hacker Glitch (Skull + Glitching Telemetry Matrix) -->
    <div class="dedsec-center-stage">
      <div class="dedsec-skull-wrapper">
        <pre class="dedsec-skull-ascii">
       ______
    .-"      "-.
   /   (X)  (X)   \
  |   .--------.   |
  |  /  \/\/\/\ \  |
   \/  \________/ \/
    '.__________.'
        </pre>
      </div>

      <div class="dedsec-title-matrix">
        <span class="dedsec-tag">[ D E D S E C ]</span>
      </div>

      <div class="dedsec-telemetry-stream">
        <span class="stream-line">{{ glitchLine1 }}</span>
        <span class="stream-line highlight">{{ glitchLine2 }}</span>
      </div>
    </div>

    <!-- BOTTOM-RIGHT: Compact & Crisp ITEST 2.0 Terminal HUD -->
    <div class="ctos-bottom-right-hud">
      <div class="ctos-meta-header">
        <span class="pulse-dot"></span>
        <span class="sys-label">ITEST 2.0</span>
        <span class="separator">//</span>
        <span class="node-label">{{ targetNode }}</span>
      </div>

      <pre class="ascii-title-white">
 ___ _____ _____ ____ _____   ____     ___  
|_ _|_   _| ____/ ___|_   _| |___ \   / _ \ 
 | |  | | |  _| \___ \ | |     __) | | | | |
 | |  | | | |___ ___) || |    / __/ _| |_| |
|___| |_| |_____|____/ |_|   |_____(_)\___/ 
      </pre>

      <div class="ctos-status-line">
        <span class="prefix">&gt;&gt;</span>
        <span class="status-text">{{ asciiStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useCtosTransition } from '@/composables/useCtosTransition';

const { isTransitioning, targetNode, asciiStatus } = useCtosTransition();

const glitchLine1 = ref('SEC_OVERRIDE // 0xDEADBEEF');
const glitchLine2 = ref('JOIN_THE_RESISTANCE');

const TELEMETRY_POOL = [
  'SEC_OVERRIDE // 0xDEADBEEF',
  'SYSTEM_BREACH :: ACCESS_GRANTED',
  'ctOS_KERNEL // ROOT_PRIVILEGES_ACQUIRED',
  'JOIN_THE_RESISTANCE // DEDSEC_OP',
  'BYPASS_SECURITY_FIREWALL [OK]',
  'NODE_INJECT // MEMORY_EXPLOIT_OK',
  '0x7FFD49A0 // PACKET_INJECTION_ACTIVE',
  'DECRYPT_STREAM >> 100% VERIFIED',
  'ANONYMOUS_ROUTING >> ESTABLISHED'
];

let streamInterval: any = null;

function startGlitchStream() {
  if (streamInterval) clearInterval(streamInterval);
  let count = 0;
  streamInterval = setInterval(() => {
    glitchLine1.value = TELEMETRY_POOL[Math.floor(Math.random() * TELEMETRY_POOL.length)];
    glitchLine2.value = TELEMETRY_POOL[Math.floor(Math.random() * TELEMETRY_POOL.length)];
    count++;
    if (count > 6) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
  }, 75);
}

watch(isTransitioning, (val) => {
  if (val) {
    startGlitchStream();
  } else {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
  }
});

onUnmounted(() => {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }
});
</script>

<style scoped>
.ctos-dissolve-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(6, 10, 18, 0.7) 0%, rgba(2, 4, 8, 0.82) 100%);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-fade 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
}

@keyframes overlay-fade {
  0% {
    opacity: 1;
  }
  65% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

/* Scanlines overlay */
.ctos-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(255, 255, 255, 0.02) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.6;
}

/* =========================================
   CENTER: DedSec Skull & Glitch Matrix
========================================= */
.dedsec-center-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  user-select: none;
  animation: dedsec-anim 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}

@keyframes dedsec-anim {
  0% {
    transform: scale(0.92);
    opacity: 0;
    filter: blur(4px) brightness(1.6);
  }
  15% {
    transform: scale(1.03);
    opacity: 1;
    filter: blur(0px) brightness(1.2);
  }
  35% {
    transform: scale(0.98) translateX(2px);
  }
  65% {
    transform: scale(1);
    opacity: 0.95;
    filter: blur(0px);
  }
  100% {
    transform: scale(1.04) translateY(-4px);
    opacity: 0;
    filter: blur(5px) brightness(1.4);
  }
}

/* Skull ASCII */
.dedsec-skull-wrapper {
  position: relative;
}

.dedsec-skull-ascii {
  margin: 0;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.15;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.95), 0 0 20px rgba(255, 255, 255, 0.5);
  animation: dedsec-glitch-flicker 0.25s infinite steps(2);
}

@keyframes dedsec-glitch-flicker {
  0%, 100% {
    transform: none;
    opacity: 1;
  }
  25% {
    transform: translateX(-2px) skewX(2deg);
    opacity: 0.9;
  }
  50% {
    transform: translateX(2px) skewX(-2deg);
    opacity: 0.95;
  }
  75% {
    transform: translateY(1px);
    opacity: 0.85;
  }
}

/* DedSec Tag */
.dedsec-title-matrix {
  margin-top: 10px;
}

.dedsec-tag {
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

/* Telemetry lines under DedSec */
.dedsec-telemetry-stream {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.8);
}

.stream-line.highlight {
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.7);
}

/* =========================================
   BOTTOM RIGHT: Watermark ITEST 2.0 HUD
========================================= */
.ctos-bottom-right-hud {
  position: absolute;
  bottom: 24px;
  right: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  user-select: none;
  animation: hud-dissolve 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}

@keyframes hud-dissolve {
  0% {
    transform: translateY(4px);
    opacity: 0;
  }
  20% {
    transform: translateY(0);
    opacity: 0.95;
  }
  70% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(-4px);
    opacity: 0;
    filter: blur(3px);
  }
}

.ctos-meta-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
  color: #ffffff;
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 8px #ffffff;
  animation: pulse-dot-glow 0.35s infinite alternate;
}

@keyframes pulse-dot-glow {
  from { opacity: 0.4; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.3); }
}

.sys-label {
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

.separator {
  color: rgba(255, 255, 255, 0.4);
}

.node-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
}

/* Pure White ASCII Art for ITEST 2.0 (Watermark size) */
.ascii-title-white {
  margin: 0 0 4px 0;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  line-height: 1.15;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

/* Status Line */
.ctos-status-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.75);
}

.prefix {
  color: #ffffff;
  font-weight: 900;
}

.status-text {
  color: #ffffff;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.7);
}
</style>
