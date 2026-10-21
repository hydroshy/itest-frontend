<template>
  <div class="gw-widget-content">
    <div class="gw-summary">
      <div class="summary-box">
        <span class="label">Hoạt động</span>
        <span class="val green">{{ onlineCount }}</span>
      </div>
      <div class="summary-box">
        <span class="label">Ngoại tuyến</span>
        <span class="val gray">{{ offlineCount }}</span>
      </div>
      <div class="summary-box">
        <span class="label">Tổng thiết bị</span>
        <span class="val blue">{{ totalCount }}</span>
      </div>
    </div>
    <div class="gw-quick-link">
      <el-button link type="primary" size="small" @click="$router.push('/plugins/lorawan')">
        Xem chi tiết Gateway →
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { httpClient } from '@/api/client';

const $router = useRouter();
const onlineCount = ref(0);
const offlineCount = ref(0);
const totalCount = ref(0);

onMounted(async () => {
  try {
    const res: any = await httpClient.get('/lorawan/gateways');
    const list = Array.isArray(res) ? res : (res?.data || []);
    totalCount.value = list.length;
    onlineCount.value = list.filter((item: any) => item.status === 'online').length;
    offlineCount.value = totalCount.value - onlineCount.value;
  } catch {
    onlineCount.value = 0;
    offlineCount.value = 0;
    totalCount.value = 0;
  }
});
</script>

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
  display: flex;
  justify-content: flex-end;
}
</style>
