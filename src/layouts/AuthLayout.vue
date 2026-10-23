<template>
  <div class="auth-layout-container">
    <div class="cyber-grid-overlay"></div>
    <div class="cyber-scanline"></div>
    <div class="auth-card-wrapper" data-augmented-ui="tl-clip br-clip border">
      <div class="auth-header">
        <div class="system-code">SEC://SYS_AUTH_GATE_2.0</div>
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
  background-color: #060911;
  background-image:
    radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.08) 0%, transparent 60%),
    linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 36px 36px, 36px 36px;
  padding: 20px;
  overflow: hidden;
}

.cyber-scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.6;
}

.auth-card-wrapper {
  --aug-border-all: 1px;
  --aug-border-bg: rgba(0, 240, 255, 0.4);
  --aug-tl: 14px;
  --aug-br: 14px;
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  background: rgba(11, 16, 28, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15);
  padding: 40px 36px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.system-code {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--cyber-cyan, #00f0ff);
  letter-spacing: 2px;
  margin-bottom: 8px;
  opacity: 0.85;
}

.auth-title {
  font-family: var(--cyber-font-display, sans-serif);
  font-size: 32px;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 6px 0;
  letter-spacing: 1.5px;
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
}

.auth-subtitle {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  letter-spacing: 0.8px;
}

/* Deep overrides for login inputs inside auth card */
:deep(.el-form-item__label) {
  color: #cbd5e1 !important;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
}

:deep(.el-input__wrapper) {
  background: rgba(13, 20, 36, 0.7) !important;
  border: 1px solid rgba(0, 240, 255, 0.25) !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--cyber-cyan, #00f0ff) !important;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  color: #f1f5f9 !important;
  font-family: var(--cyber-font-mono, monospace);
}

:deep(.el-checkbox__label) {
  color: #94a3b8 !important;
  font-size: 12.5px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.9) 0%, rgba(2, 132, 199, 0.9) 100%) !important;
  border: 1px solid var(--cyber-cyan, #00f0ff) !important;
  color: #0b101c !important;
  font-family: var(--cyber-font-display, sans-serif);
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.35) !important;
  transition: all 0.2s ease;
}

:deep(.el-button--primary:hover) {
  background: #00f0ff !important;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.6) !important;
  transform: translateY(-1px);
}
</style>
