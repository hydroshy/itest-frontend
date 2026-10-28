<template>
  <div class="auth-layout-container">
    <div class="cyber-grid-overlay"></div>
    <div class="auth-card-wrapper">
      <div class="auth-header">
        <div class="system-code">SYSTEM ACCESS GATEWAY</div>
        <h1 class="auth-title">iTEST 2.0</h1>
        <p class="auth-subtitle">ENTERPRISE IOT & AUTOMATED TESTING SYSTEM</p>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--owl-bg-canvas, #011627);
  background-image:
    radial-gradient(circle at 50% 20%, rgba(127, 219, 202, 0.08) 0%, transparent 60%),
    linear-gradient(rgba(29, 59, 90, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 59, 90, 0.2) 1px, transparent 1px);
  background-size: 100% 100%, 36px 36px, 36px 36px;
  padding: 20px;
  overflow: hidden;
}

.auth-card-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  background: var(--owl-bg-surface, #081d32);
  border: 1px solid var(--owl-border, #1d3b5a);
  border-radius: var(--cyber-radius-xl, 16px);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 24px rgba(127, 219, 202, 0.08);
  padding: 40px 36px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.system-code {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--owl-teal, #7fdbca);
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.auth-title {
  font-family: var(--cyber-font-display, sans-serif);
  font-size: 30px;
  font-weight: 700;
  color: var(--owl-text-bright, #ffffff);
  margin: 0 0 6px 0;
  letter-spacing: 1px;
}

.auth-subtitle {
  font-family: var(--cyber-font-body, sans-serif);
  font-size: 12px;
  font-weight: 500;
  color: var(--owl-text-secondary, #7e97b8);
  margin: 0;
  letter-spacing: 0.5px;
}

/* Deep overrides for login inputs inside auth card */
:deep(.el-form-item__label) {
  color: var(--owl-text-primary, #d6deeb) !important;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

:deep(.el-input__wrapper) {
  background: var(--owl-bg-input, #0b253e) !important;
  border: 1px solid var(--owl-border, #1d3b5a) !important;
  border-radius: var(--cyber-radius-sm, 6px) !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--owl-teal, #7fdbca) !important;
  box-shadow: 0 0 0 2px var(--owl-teal-dim, rgba(127, 219, 202, 0.15)) !important;
}

:deep(.el-input__inner) {
  color: var(--owl-text-bright, #ffffff) !important;
  font-family: var(--cyber-font-body, sans-serif);
}

:deep(.el-checkbox__label) {
  color: var(--owl-text-secondary, #7e97b8) !important;
  font-size: 13px;
}

:deep(.el-button--primary) {
  background: var(--owl-teal, #7fdbca) !important;
  border: none !important;
  color: #011627 !important;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: var(--cyber-radius-sm, 6px) !important;
  box-shadow: 0 4px 14px rgba(127, 219, 202, 0.25) !important;
  transition: all 0.2s ease;
}

:deep(.el-button--primary:hover) {
  background: #9cf0e0 !important;
  box-shadow: 0 6px 20px rgba(127, 219, 202, 0.4) !important;
  transform: translateY(-1px);
}
</style>
