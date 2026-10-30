<template>
  <div class="cs-widget-card flex flex-col gap-3">
    <div class="cs-widget-stats grid grid-cols-4 gap-2 bg-base-200/60 p-3 rounded-lg border border-base-content/10">
      <div class="stat-cell flex flex-col items-center text-center gap-0.5">
        <span class="cell-label text-[11px] text-base-content/60 font-medium">Máy chủ</span>
        <span class="cell-value text-base font-bold font-mono" :class="isOnline ? 'text-success' : 'text-base-content/40'">{{ serverStatusText }}</span>
        <span class="cell-sub text-[10px] text-base-content/50">ChirpStack v4</span>
      </div>
      <div class="stat-cell flex flex-col items-center text-center gap-0.5">
        <span class="cell-label text-[11px] text-base-content/60 font-medium">Gateways</span>
        <span class="cell-value text-base font-bold font-mono text-info">{{ gatewayCount !== null ? gatewayCount : '—' }}</span>
        <span class="cell-sub text-[10px] text-base-content/50">{{ isOnline ? 'Đang hoạt động' : 'Chưa kết nối' }}</span>
      </div>
      <div class="stat-cell flex flex-col items-center text-center gap-0.5">
        <span class="cell-label text-[11px] text-base-content/60 font-medium">Thiết bị</span>
        <span class="cell-value text-base font-bold font-mono text-secondary">{{ deviceCount !== null ? deviceCount : '—' }}</span>
        <span class="cell-sub text-[10px] text-base-content/50">{{ isOnline ? 'Đã đăng ký' : 'Chưa kết nối' }}</span>
      </div>
      <div class="stat-cell flex flex-col items-center text-center gap-0.5">
        <span class="cell-label text-[11px] text-base-content/60 font-medium">Server</span>
        <span class="cell-value text-base font-bold font-mono text-accent">{{ serverCount }}</span>
        <span class="cell-sub text-[10px] text-base-content/50">Đã cấu hình</span>
      </div>
    </div>

    <div class="cs-widget-footer flex justify-between items-center px-1">
      <span class="sync-time text-[11px] text-base-content/50">{{ lastSyncTime }}</span>
      <button
        type="button"
        class="btn btn-link btn-xs text-primary no-underline hover:underline p-0 font-medium"
        @click="$router.push('/plugins/lorawan-chirpstack')"
      >
        Mở Console ChirpStack →
      </button>
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
