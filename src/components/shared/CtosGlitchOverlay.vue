<template>
  <div v-if="isTransitioning" class="ctos-dissolve-overlay">
    <!-- Radial Exploding White ASCII Dust Particles -->
    <div class="ascii-particle-canvas">
      <span
        v-for="(p, idx) in particles"
        :key="idx"
        class="ascii-particle"
        :style="{
          '--dest-x': p.destX + 'px',
          '--dest-y': p.destY + 'px',
          '--dest-scale': p.destScale,
          fontSize: p.size + 'px',
          animationDelay: p.delay + 'ms',
          animationDuration: p.duration + 'ms',
          opacity: p.opacity
        }"
      >
        {{ p.char }}
      </span>
    </div>

    <!-- Center Glitch Core: Pure White ASCII ITEST 2.0 with Radial Dissolve -->
    <div class="ctos-dissolve-core">
      <div class="ctos-meta-header">
        <span class="pulse-dot"></span>
        <span class="sys-label">ITEST 2.0</span>
        <span class="separator">//</span>
        <span class="node-label">{{ targetNode }}</span>
      </div>

      <!-- Pure White Sharp ASCII Art for ITEST 2.0 -->
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
import { ref, watch } from 'vue';
import { useCtosTransition } from '@/composables/useCtosTransition';

const { isTransitioning, targetNode, asciiStatus } = useCtosTransition();

interface AsciiParticle {
  char: string;
  destX: number;
  destY: number;
  destScale: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

const particles = ref<AsciiParticle[]>([]);
const GLYPHS = '0123456789ABCDEF$#@%*+=-/\\:;<>[]{}ITEST2.0';

function generateParticles() {
  const count = 72; // Dense radial blast
  const list: AsciiParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    // Random angle from 0 to 2*PI (from center outward)
    const angle = Math.random() * Math.PI * 2;
    // Random radius distance between 120px to 520px
    const distance = Math.floor(Math.random() * 400) + 120;
    const destX = Math.round(Math.cos(angle) * distance);
    const destY = Math.round(Math.sin(angle) * distance);

    list.push({
      char: glyph,
      destX,
      destY,
      destScale: +(Math.random() * 0.4 + 0.2).toFixed(2),
      size: Math.floor(Math.random() * 6) + 11, // 11px - 16px
      delay: Math.floor(Math.random() * 90),
      duration: Math.floor(Math.random() * 180) + 380, // 380ms - 560ms
      opacity: +(Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 - 1.0
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
  background: radial-gradient(circle at center, rgba(6, 9, 16, 0.75) 0%, rgba(2, 4, 8, 0.92) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
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

/* ASCII Canvas centered */
.ascii-particle-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* White ASCII Particle bursting from center outward */
.ascii-particle {
  position: absolute;
  top: 0;
  left: 0;
  color: #ffffff;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.85);
  user-select: none;
  transform: translate(0, 0) scale(1);
  animation-name: particle-burst-out;
  animation-timing-function: cubic-bezier(0.1, 0.85, 0.3, 1);
  animation-fill-mode: forwards;
}

@keyframes particle-burst-out {
  0% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
    filter: blur(0px);
  }
  40% {
    opacity: 0.9;
  }
  100% {
    transform: translate(calc(-50% + var(--dest-x)), calc(-50% + var(--dest-y))) scale(var(--dest-scale));
    opacity: 0;
    filter: blur(3px);
  }
}

/* Center Core with Pure White Monochrome Palette */
.ctos-dissolve-core {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  user-select: none;
  animation: core-dissolve 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}

@keyframes core-dissolve {
  0% {
    transform: scale(0.96) translateY(2px);
    opacity: 0;
    letter-spacing: 0.5px;
    filter: blur(4px) brightness(1.8);
  }
  18% {
    transform: scale(1) translateY(0);
    opacity: 1;
    letter-spacing: 1px;
    filter: blur(0px) brightness(1.2);
  }
  60% {
    transform: scale(1.02);
    opacity: 0.95;
    letter-spacing: 2px;
    filter: blur(0.5px);
  }
  100% {
    transform: scale(1.08);
    opacity: 0;
    letter-spacing: 5px;
    filter: blur(6px) brightness(1.5);
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
  letter-spacing: 2px;
  margin-bottom: 8px;
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
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
}

.separator {
  color: rgba(255, 255, 255, 0.4);
}

.node-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
}

/* Pure White ASCII Art */
.ascii-title-white {
  margin: 0 0 10px 0;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  line-height: 1.15;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.95), 0 0 20px rgba(255, 255, 255, 0.5);
  animation: white-flicker 0.22s infinite;
}

@keyframes white-flicker {
  0%, 100% {
    opacity: 1;
    transform: none;
  }
  30% {
    opacity: 0.9;
    transform: translateX(1px);
  }
  70% {
    opacity: 0.95;
    transform: translateX(-1px);
  }
}

/* Status Line */
.ctos-status-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--cyber-font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.8);
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
