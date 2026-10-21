<template>
  <div class="cs-widget-card">
    <div class="cs-widget-stats">
      <div class="stat-cell">
        <span class="cell-label">Máy chủ</span>
        <span class="cell-value" :class="isOnline ? 'text-green' : 'text-gray'">{{ serverStatusText }}</span>
        <span class="cell-sub">ChirpStack v4</span>
      </div>
      <div class="stat-cell">
        <span class="cell-label">Gateways</span>
        <span class="cell-value text-blue">{{ gatewayCount !== null ? gatewayCount : '—' }}</span>
        <span class="cell-sub">{{ isOnline ? 'Đang hoạt động' : 'Chưa kết nối' }}</span>
      </div>
      <div class="stat-cell">
        <span class="cell-label">Thiết bị</span>
        <span class="cell-value text-purple">{{ deviceCount !== null ? deviceCount : '—' }}</span>
        <span class="cell-sub">{{ isOnline ? 'Đã đăng ký' : 'Chưa kết nối' }}</span>
      </div>
      <div class="stat-cell">
        <span class="cell-label">Server</span>
        <span class="cell-value text-teal">{{ serverCount }}</span>
        <span class="cell-sub">Đã cấu hình</span>
      </div>
    </div>

    <div class="cs-widget-footer">
      <span class="sync-time">{{ lastSyncTime }}</span>
      <el-button link type="primary" size="small" @click="$router.push('/plugins/lorawan-chirpstack')">
        Mở Console ChirpStack →
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const API_BASE = '/api/plugins/lorawan-chirpstack';
const serverCount = ref(0);
const gatewayCount = ref<number | null>(null);
const deviceCount = ref<number | null>(null);
const isOnline = ref(false);
const lastSyncTime = ref('');

const serverStatusText = computed(() => {
  if (serverCount.value === 0) return 'Chưa có';
  return isOnline.value ? 'Online' : 'Offline';
});

async function fetchStats() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_BASE}/servers`, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const servers = await res.json();
    if (Array.isArray(servers)) {
      serverCount.value = servers.length;
      isOnline.value = servers.some((s: any) => s.status === 'online');
      gatewayCount.value = servers.reduce((acc: number, s: any) => acc + (s.gatewayCount || 0), 0);
      deviceCount.value = servers.reduce((acc: number, s: any) => acc + (s.deviceCount || 0), 0);
      lastSyncTime.value = `Cập nhật: ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    }
  } catch {
    isOnline.value = false;
    lastSyncTime.value = 'Chưa thể kết nối backend';
  } finally {
    window.clearTimeout(timer);
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.cs-widget-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cs-widget-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
}

.cell-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.cell-value {
  font-size: 17px;
  font-weight: 700;
}

.cell-sub {
  font-size: 10px;
  color: #94a3b8;
}

.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }
.text-purple { color: #8b5cf6; }
.text-teal { color: #0d9488; }
.text-gray { color: #94a3b8; }

.cs-widget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.sync-time {
  font-size: 11px;
  color: #94a3b8;
}
</style>
