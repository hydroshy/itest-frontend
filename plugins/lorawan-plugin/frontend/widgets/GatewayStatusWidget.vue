<template>
  <div class="gw-widget-content">
    <div class="gw-summary">
      <div class="summary-box">
        <span class="label">Hoạt động</span>
        <span class="val green">2</span>
      </div>
      <div class="summary-box">
        <span class="label">Mất kết nối</span>
        <span class="val gray">0</span>
      </div>
      <div class="summary-box">
        <span class="label">Tỷ lệ SNR TB</span>
        <span class="val blue">+9.4 dB</span>
      </div>
    </div>
    <div class="gw-quick-link">
      <el-button link type="primary" size="small" @click="$router.push('/plugins/lorawan')">
        Xem chi tiết Gateway →
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.gw-widget-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gw-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background-color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
}

.summary-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #6b7280;
}

.val {
  font-size: 18px;
  font-weight: 700;
}

.green { color: #10b981; }
.gray { color: #9ca3af; }
.blue { color: #3b82f6; }

.gw-quick-link {
  text-align: right;
}
</style>
