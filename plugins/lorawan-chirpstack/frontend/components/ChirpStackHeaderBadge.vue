<template>
  <div class="tooltip tooltip-bottom inline-flex items-center mx-1" :data-tip="tooltipText">
    <button
      type="button"
      class="badge badge-sm gap-1.5 cursor-pointer font-mono text-[11px] font-medium transition-colors hover:brightness-110"
      :class="isOnline ? 'badge-success badge-outline' : 'badge-ghost text-base-content/60'"
      @click="$router.push('/plugins/lorawan-chirpstack')"
    >
      <span
        class="w-1.5 h-1.5 rounded-full inline-block"
        :class="isOnline ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]' : 'bg-slate-400'"
      ></span>
      {{ badgeText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const API_BASE = '/api/plugins/lorawan-chirpstack';
const gatewayCount = ref<number | null>(null);
const deviceCount = ref<number | null>(null);
const isOnline = ref(false);

const badgeText = computed(() => {
  if (gatewayCount.value === null && deviceCount.value === null) {
    return 'ChirpStack';
  }
  return `ChirpStack: ${gatewayCount.value ?? 0} GW | ${deviceCount.value ?? 0} Dev`;
});

const tooltipText = computed(() => {
  if (!isOnline.value) {
    return 'ChirpStack Network Server (Chưa kết nối)';
  }
  return `ChirpStack Online: ${gatewayCount.value ?? 0} Gateway, ${deviceCount.value ?? 0} Thiết bị`;
});

async function fetchStats() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_BASE}/servers`, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const servers = await res.json();
    if (Array.isArray(servers) && servers.length > 0) {
      isOnline.value = servers.some((s: any) => s.status === 'online');
      gatewayCount.value = servers.reduce((acc: number, s: any) => acc + (s.gatewayCount || 0), 0);
      deviceCount.value = servers.reduce((acc: number, s: any) => acc + (s.deviceCount || 0), 0);
    } else {
      isOnline.value = false;
      gatewayCount.value = 0;
      deviceCount.value = 0;
    }
  } catch {
    isOnline.value = false;
  } finally {
    window.clearTimeout(timer);
  }
}

onMounted(() => {
  fetchStats();
});
</script>
