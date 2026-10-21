<template>
  <el-tooltip :content="tooltipText" placement="bottom">
    <div class="header-cs-badge" @click="$router.push('/plugins/lorawan-chirpstack')">
      <el-tag :type="tagType" size="small" effect="plain" class="badge-tag">
        <span class="dot" :class="{ 'is-offline': !isOnline }"></span>
        {{ badgeText }}
      </el-tag>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const API_BASE = '/api/plugins/lorawan-chirpstack';
const gatewayCount = ref<number | null>(null);
const deviceCount = ref<number | null>(null);
const isOnline = ref(false);

const tagType = computed(() => (isOnline.value ? 'success' : 'info'));
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

<style scoped>
.header-cs-badge {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin: 0 4px;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  display: inline-block;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.6);
}

.dot.is-offline {
  background-color: #94a3b8;
  box-shadow: none;
}
</style>
