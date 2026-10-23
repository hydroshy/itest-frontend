<template>
  <transition name="ctos-fade">
    <div v-if="isTransitioning" class="ctos-glitch-overlay">
      <div class="ctos-scanlines"></div>
      <div class="ctos-vignette"></div>

      <div class="ctos-frame" data-augmented-ui="tl-clip br-clip tr-clip bl-clip border">
        <!-- ctOS Header Banner -->
        <div class="ctos-banner">
          <span class="ctos-tag">[ ctOS v2.0 // DIRECT_NODE_INTERFACE ]</span>
          <span class="ctos-clock">SEC_LEVEL::RESTRICTED</span>
        </div>

        <!-- ASCII Title Art -->
        <pre class="ctos-ascii-art">
 _ _____ _____ ____ _____   ____    ___  
(_) ____|_   _/ ___|_   _| |___ \  / _ \ 
| |  _|   | | \___ \ | |     __) || | | |
| | |___  | |  ___) || |    / __/ | |_| |
|_|_____| |_| |____/ |_|   |_____(_)___/ 
        </pre>

        <!-- Dynamic Node Access Telemetry -->
        <div class="ctos-telemetry">
          <div class="telemetry-row">
            <span class="t-label">TARGET_NODE:</span>
            <span class="t-val glitch-text" :data-text="targetNode">[{{ targetNode }}]</span>
          </div>
          <div class="telemetry-row">
            <span class="t-label">OPERATION:</span>
            <span class="t-status">{{ asciiStatus }}</span>
          </div>

          <div class="glitch-stream">
            <div v-for="(line, idx) in glitchLines" :key="idx" class="stream-line">
              <span class="stream-prefix">&gt;&gt;</span> {{ line }}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="ctos-progress-container">
            <div class="progress-bar-fill"></div>
            <span class="progress-pct">100% READY</span>
          </div>
        </div>

        <!-- Bottom Grid Tickers -->
        <div class="ctos-footer">
          <span>MEM: 0x7FFF8A40</span>
          <span>LINK: ENCRYPTED_TLS</span>
          <span>SYS_LATENCY: 0.12ms</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useCtosTransition } from '@/composables/useCtosTransition';

const { isTransitioning, targetNode, asciiStatus, glitchLines } = useCtosTransition();
</script>

<style scoped>
.ctos-glitch-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(6, 9, 17, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: all;
  user-select: none;
  overflow: hidden;
}

.ctos-scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.45) 50%
  ),
  linear-gradient(
    90deg,
    rgba(255, 0, 0, 0.03),
    rgba(0, 255, 0, 0.01),
    rgba(0, 0, 255, 0.03)
  );
  background-size: 100% 3px, 6px 100%;
  pointer-events: none;
  animation: scanlines-scroll 8s linear infinite;
  opacity: 0.8;
}

@keyframes scanlines-scroll {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 0 100%, 0 0; }
}

.ctos-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.8) 100%);
  pointer-events: none;
}

.ctos-frame {
  --aug-border-all: 2px;
  --aug-border-bg: var(--cyber-cyan, #00f0ff);
  --aug-tl: 18px;
  --aug-br: 18px;
  --aug-tr: 18px;
  --aug-bl: 18px;
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 580px;
  background: rgba(11, 16, 28, 0.94);
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.1);
  padding: 24px 30px;
  display: flex;
  flex-direction: column;
  animation: frame-glitch 0.45s ease-out;
}

@keyframes frame-glitch {
  0% {
    transform: scale(0.97) skewX(-2deg);
    opacity: 0;
    filter: brightness(2) contrast(1.5);
  }
  20% {
    transform: scale(1.02) skewX(2deg);
    opacity: 0.9;
  }
  40% {
    transform: scale(0.99) skewX(-1deg);
    opacity: 1;
  }
  70% {
    transform: scale(1.005) skewX(0.5deg);
  }
  100% {
    transform: scale(1) skewX(0);
    opacity: 1;
    filter: brightness(1) contrast(1);
  }
}

.ctos-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: var(--cyber-cyan, #00f0ff);
  letter-spacing: 1.5px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.35);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.ctos-clock {
  color: #f59e0b;
}

.ctos-ascii-art {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  line-height: 1.15;
  font-weight: 800;
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
  margin: 0 0 16px 0;
  text-align: center;
  user-select: none;
  animation: ascii-flicker 0.4s infinite;
}

@keyframes ascii-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.88; transform: translate(1px, -0.5px); }
  75% { opacity: 0.95; transform: translate(-0.5px, 0.5px); }
}

.ctos-telemetry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--cyber-font-mono, monospace);
}

.telemetry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.t-label {
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 1px;
}

.t-val {
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}

.t-status {
  color: #10b981;
  font-weight: 700;
  letter-spacing: 1px;
  animation: pulse-glow 0.8s infinite alternate;
}

@keyframes pulse-glow {
  from { opacity: 0.7; }
  to { opacity: 1; text-shadow: 0 0 12px #10b981; }
}

.glitch-stream {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-left: 3px solid var(--cyber-cyan, #00f0ff);
  padding: 8px 12px;
  margin: 6px 0;
  font-size: 11px;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stream-prefix {
  color: var(--cyber-cyan, #00f0ff);
  font-weight: 700;
}

.ctos-progress-container {
  position: relative;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.4);
  margin-top: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.3) 0%, rgba(0, 240, 255, 0.9) 100%);
  animation: fill-strip 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}

@keyframes fill-strip {
  0% { width: 0%; }
  60% { width: 85%; }
  100% { width: 100%; }
}

.progress-pct {
  position: relative;
  z-index: 2;
  font-size: 10px;
  font-weight: 800;
  color: #0b101c;
  padding-left: 8px;
  letter-spacing: 1px;
}

.ctos-footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  font-family: var(--cyber-font-mono, monospace);
  font-size: 9.5px;
  color: #64748b;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

/* Vue Transition */
.ctos-fade-enter-active {
  transition: opacity 0.15s ease-out;
}
.ctos-fade-leave-active {
  transition: opacity 0.18s ease-in;
}
.ctos-fade-enter-from,
.ctos-fade-leave-to {
  opacity: 0;
}
</style>
