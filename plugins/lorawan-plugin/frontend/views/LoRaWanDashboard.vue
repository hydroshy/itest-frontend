<template>
  <div class="lorawan-container">
    <div class="header-section">
      <div>
        <h2 class="title">Hệ thống Giám sát LoRaWAN Gateway</h2>
        <p class="subtitle">Giám sát trạng thái hoạt động, tần số và tải dữ liệu gói tin của trạm thu phát</p>
      </div>
      <el-button type="primary" :icon="Refresh" :loading="loading" @click="fetchData">Làm mới</el-button>
    </div>

    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="info"
      show-icon
      :closable="false"
      class="notice-box"
    />

    <el-row :gutter="16" class="stat-cards">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-title">Tổng số Gateway</span>
            <span class="stat-number">{{ gateways.length }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-title">Gateway Trực tuyến</span>
            <span class="stat-number text-green">{{ onlineCount }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-title">Tổng gói tin nhận (Rx)</span>
            <span class="stat-number text-blue">{{ totalPackets.toLocaleString() }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-header-title">Danh sách trạm Gateway</span>
      </template>

      <el-table
        :data="gateways"
        style="width: 100%"
        v-loading="loading"
        empty-text="Chưa có thiết bị Gateway hoặc chưa kết nối dịch vụ LoRaWAN Backend"
      >
        <el-table-column prop="name" label="Tên Gateway" min-width="180" />
        <el-table-column prop="eui" label="Gateway EUI" min-width="180">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.eui }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="130">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
              {{ row.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="Địa chỉ IP" width="150" />
        <el-table-column prop="rxPackets" label="Gói tin đã nhận" width="160" align="right">
          <template #default="{ row }">
            <span>{{ row.rxPackets.toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { httpClient } from '@/api/client';

interface Gateway {
  id: string;
  name: string;
  eui: string;
  status: 'online' | 'offline';
  ipAddress: string;
  rxPackets: number;
}

const loading = ref(false);
const gateways = ref<Gateway[]>([]);
const errorMessage = ref('');

const onlineCount = computed(() => gateways.value.filter(g => g.status === 'online').length);
const totalPackets = computed(() => gateways.value.reduce((acc, g) => acc + (g.rxPackets || 0), 0));

async function fetchData() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res: any = await httpClient.get('/lorawan/gateways');
    gateways.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (err: any) {
    gateways.value = [];
    errorMessage.value = 'Dịch vụ LoRaWAN Gateway backend chưa sẵn sàng hoặc chưa đăng ký thiết bị.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.lorawan-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.notice-box {
  margin-bottom: 4px;
}

.stat-cards {
  margin-bottom: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-title {
  font-size: 13px;
  color: #6b7280;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }

.table-card {
  border-radius: 8px;
}

.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
</style>
