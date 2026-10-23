<template>
  <div v-if="isTransitioning" class="ctos-dissolve-overlay">
    <!-- Matrix of drifting digital dust / ASCII particles -->
    <div class="ascii-particle-cloud">
      <span
        v-for="(p, idx) in particles"
        :key="idx"
        class="ascii-particle"
        :style="{
          left: p.x + '%',
          top: p.y + '%',
          fontSize: p.size + 'px',
          animationDelay: p.delay + 'ms',
          animationDuration: p.duration + 'ms',
          opacity: p.opacity,
          color: p.color
        }"
      >
        {{ p.char }}
      </span>
    </div>

    <!-- Center Glitch Core: Free-floating ASCII Title + Target & Status (NO BOX / NO FRAME) -->
    <div class="ctos-dissolve-core">
      <div class="ctos-meta-header">
        <span class="pulse-dot"></span>
        <span class="sys-label">iTEST 2.0 // SYSTEM_TRANSITION</span>
        <span class="sec-label">STATUS::DISSOLVING</span>
      </div>

      <!-- Crisp Small ASCII Art for iTEST 2.0 -->
      <pre class="ascii-title-small">
 _ _____ _____ ____ _____   ____    ___
(_) ____|_   _/ ___|_   _| |___ \  / _ \
| |  _|   | | \___ \ | |     __) || | | |
| | |___  | |  ___) || |    / __/ | |_| |
|_|_____| |_| |____/ |_|   |_____(_)___/
      </pre>

      <div class="ctos-target-line">
        <span class="prompt-symbol">&gt;&gt;</span>
        <span class="node-name">{{ targetNode }}</span>
        <span class="divider">/</span>
        <span class="status-name">{{ asciiStatus }}</span>
      </div>

      <!-- Quick decoding glitch stream -->
      <div class="ascii-subtext-stream">
        <div v-for="(line, idx) in glitchLines" :key="idx" class="ascii-stream-line">
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCtosTransition } from '@/composables/useCtosTransition';

const { isTransitioning, targetNode, asciiStatus, glitchLines } = useCtosTransition();

interface AsciiParticle {
  char: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
}

const particles = ref<AsciiParticle[]>([]);
const GLYPHS = '0123456789ABCDEF$#@%*+=-/\\:;<>[]{}iTEST2.0';
const COLORS = ['#00f0ff', '#38bdf8', '#00ff66', '#e0f2fe', '#a855f7'];

function generateParticles() {
  const count = 56;
  const list: AsciiParticle[] = [];
  for (let i = 0; i < count; i++) {
    const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    list.push({
      char: glyph,
      x: Math.random() * 96 + 2,
      y: Math.random() * 90 + 5,
      size: Math.floor(Math.random() * 8) + 11, // 11px - 18px
      delay: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 200) + 380, // 380ms - 580ms
      opacity: Math.random() * 0.75 + 0.25,
      color,
    });
  }
  particles.value = list;
}

watch(isTransitioning, (val) => {
  if (val) {
    generateParticles();
  }
});
</script>

<style scoped>
.ctos-dissolve-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(8, 14, 26, 0.7) 0%, rgba(3, 7, 14, 0.88) 100%);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
}

@keyframes overlay-fade {
  0% {
    opacity: 1;
  }
  60% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

/* ASCII Particle Cloud - Floating and dispersing */
.ascii-particle-cloud {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ascii-particle {
  position: absolute;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-weight: 700;
  text-shadow: 0 0 8px currentColor;
  user-select: none;
  animation-name: particle-drift-disperse;
  animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  animation-fill-mode: forwards;
}

@keyframes particle-drift-disperse {
  0% {
    transform: translate(0, 0) scale(1.1);
    opacity: 1;
    filter: blur(0px);
  }
  45% {
    transform: translate(12px, -15px) scale(0.95);
    opacity: 0.85;
  }
  100% {
    transform: translate(28px, -40px) scale(0.3);
    opacity: 0;
    filter: blur(3px);
  }
}

/* Core Container without boxy card borders (Free-floating) */
.ctos-dissolve-core {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  user-select: none;
  animation: core-dissolve 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes core-dissolve {
  0% {
    transform: scale(0.97) translateY(4px);
    opacity: 0;
    letter-spacing: 0px;
    filter: blur(4px) brightness(1.6);
  }
  18% {
    transform: scale(1) translateY(0);
    opacity: 1;
    letter-spacing: 0.5px;
    filter: blur(0px) brightness(1.2);
  }
  60% {
    transform: scale(1.02) translateY(-2px);
    opacity: 0.95;
    letter-spacing: 1.5px;
    filter: blur(0.5px);
  }
  100% {
    transform: scale(1.06) translateY(-8px);
    opacity: 0;
    letter-spacing: 4px;
    filter: blur(6px) brightness(1.4);
  }
}

/* Meta Header */
.ctos-meta-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #00ff66;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff66;
  animation: pulse-dot-glow 0.4s infinite alternate;
}

@keyframes pulse-dot-glow {
  from { opacity: 0.4; }
  to { opacity: 1; transform: scale(1.3); }
}

.sys-label {
  color: #00f0ff;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
}

.sec-label {
  color: #f59e0b;
  font-size: 10px;
}

/* Small ASCII Art */
.ascii-title-small {
  margin: 0 0 10px 0;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  line-height: 1.15;
  font-weight: 800;
  color: #00f0ff;
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.85), 0 0 24px rgba(0, 240, 255, 0.4);
  animation: text-flicker 0.25s infinite;
}

@keyframes text-flicker {
  0%, 100% {
    opacity: 1;
    transform: none;
  }
  33% {
    opacity: 0.88;
    transform: translateX(1px);
  }
  66% {
    opacity: 0.95;
    transform: translateX(-1px);
  }
}

/* Target Line */
.ctos-target-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
}

.prompt-symbol {
  color: #00ff66;
  font-weight: 900;
}

.node-name {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.divider {
  color: rgba(255, 255, 255, 0.35);
}

.status-name {
  color: #38bdf8;
  font-size: 11px;
}

/* Glitch Stream Lines */
.ascii-subtext-stream {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.ascii-stream-line {
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(0, 240, 255, 0.7);
  letter-spacing: 0.8px;
  text-shadow: 0 0 4px rgba(0, 240, 255, 0.4);
}
</style>
