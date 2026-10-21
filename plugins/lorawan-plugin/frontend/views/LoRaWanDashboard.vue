<template>
  <div class="lorawan-container">
    <div class="header-section">
      <div>
        <h2 class="title">Hệ thống Giám sát LoRaWAN Gateway</h2>
        <p class="subtitle">Giám sát trạng thái hoạt động, tần số và tải dữ liệu gói tin của trạm thu phát</p>
      </div>
      <el-button type="primary" :icon="Refresh" @click="fetchData">Làm mới</el-button>
    </div>

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

      <el-table :data="gateways" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Tên Gateway" min-width="180" />
        <el-table-column prop="eui" label="Gateway EUI" min-width="160">
          <template #default="{ row }">
            <code>{{ row.eui }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="Địa chỉ IP" width="140" />
        <el-table-column prop="status" label="Trạng thái" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
              {{ row.status === 'online' ? 'Online' : 'Offline' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rxPackets" label="Số gói tin Rx" width="130" align="right">
          <template #default="{ row }">
            {{ row.rxPackets.toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';

interface Gateway {
  id: string;
  name: string;
  eui: string;
  status: 'online' | 'offline';
  ipAddress: string;
  rxPackets: number;
}

const loading = ref(false);
const gateways = ref<Gateway[]>([
  {
    id: 'gw-01',
    name: 'Outdoor Gateway 8-CH (Roof A)',
    eui: 'AA555A0000000001',
    status: 'online',
    ipAddress: '192.168.1.150',
    rxPackets: 48920,
  },
  {
    id: 'gw-02',
    name: 'Indoor Gateway 4-CH (Lab B)',
    eui: 'AA555A0000000002',
    status: 'online',
    ipAddress: '192.168.1.151',
    rxPackets: 12430,
  },
]);

const onlineCount = computed(() => gateways.value.filter(g => g.status === 'online').length);
const totalPackets = computed(() => gateways.value.reduce((acc, g) => acc + g.rxPackets, 0));

function fetchData() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 400);
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
  font-weight: 600;
  font-size: 15px;
}
</style>
