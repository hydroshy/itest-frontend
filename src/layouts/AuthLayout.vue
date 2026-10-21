<template>
  <div class="auth-layout-container">
    <div class="auth-card-wrapper">
      <div class="auth-header">
        <h1 class="auth-title">ITEST Platform</h1>
        <p class="auth-subtitle">Enterprise IoT & Automated Testing System</p>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 20px;
}

.auth-card-wrapper {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  padding: 36px 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-title {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}
</style>
