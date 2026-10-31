<template>
  <CModuleBoundary module-name="RouterView">
    <router-view />
    <CtosGlitchOverlay />
    <CyberToastContainer />
    <CyberConfirmModal />
  </CModuleBoundary>
</template>

<script setup lang="ts">
import CtosGlitchOverlay from '@/components/shared/CtosGlitchOverlay.vue';
import CyberToastContainer from '@/components/shared/CyberToastContainer.vue';
import CyberConfirmModal from '@/components/shared/CyberConfirmModal.vue';
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: var(--cyber-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
</style>
