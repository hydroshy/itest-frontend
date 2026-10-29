<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isTransitioning" class="progress-bar-container">
        <div class="progress-bar-line"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCtosTransition } from '@/composables/useCtosTransition';

const { isTransitioning } = useCtosTransition();
</script>

<style scoped>
.progress-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
  overflow: hidden;
}

.progress-bar-line {
  height: 100%;
  background: var(--owl-primary, #9FE88D);
  animation: progress-slide 0.45s ease-out forwards;
}

@keyframes progress-slide {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  40% {
    width: 65%;
  }
  80% {
    width: 90%;
  }
  100% {
    width: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
