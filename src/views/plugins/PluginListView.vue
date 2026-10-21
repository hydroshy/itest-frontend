<template>
  <div class="plugin-list-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Quản lý Plugin Frontend</h2>
        <p class="page-desc">
          Danh sách các plugin được biên dịch tại build-time cùng Frontend Shell
        </p>
      </div>
      <el-tag type="info" size="large">
        SDK v{{ pluginStore.diagnostics.sdkVersion }} | Tự động sinh lúc: {{ formattedDate }}
      </el-tag>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="pluginStore.plugins" style="width: 100%" stripe>
        <el-table-column prop="definition.manifest.id" label="Mã Plugin (ID)" width="180">
          <template #default="{ row }">
            <span class="plugin-id">{{ row.definition.manifest.id }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="definition.manifest.name" label="Tên hiển thị" width="200">
          <template #default="{ row }">
            <strong>{{ row.definition.manifest.name }}</strong>
          </template>
        </el-table-column>

        <el-table-column prop="definition.manifest.version" label="Phiên bản" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ row.definition.manifest.version }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="definition.manifest.description" label="Mô tả">
          <template #default="{ row }">
            {{ row.definition.manifest.description || 'Không có mô tả' }}
          </template>
        </el-table-column>

        <el-table-column label="Trạng thái" width="130">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : row.status === 'disabled' ? 'info' : 'danger'"
              size="small"
            >
              {{ row.status === 'active' ? 'Đang bật' : row.status === 'disabled' ? 'Đã tắt' : 'Lỗi' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="160" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              size="small"
              plain
              @click="togglePlugin(row, false)"
            >
              Vô hiệu hóa
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              plain
              @click="togglePlugin(row, true)"
            >
              Kích hoạt
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePluginStore } from '@/stores/plugin';
import { ElMessage } from 'element-plus';
import type { FrontendPluginInstance } from '@itest/frontend-sdk';

const router = useRouter();
const pluginStore = usePluginStore();

const formattedDate = computed(() => {
  const d = pluginStore.diagnostics.generatedAt;
  return d ? new Date(d).toLocaleString('vi-VN') : 'N/A';
});

async function togglePlugin(plugin: FrontendPluginInstance, enable: boolean) {
  try {
    if (enable) {
      await pluginStore.enablePlugin(plugin.definition.manifest.id, router);
      ElMessage.success(`Đã kích hoạt plugin "${plugin.definition.manifest.name}"`);
    } else {
      await pluginStore.disablePlugin(plugin.definition.manifest.id);
      ElMessage.info(`Đã tắt plugin "${plugin.definition.manifest.name}"`);
    }
  } catch (err: any) {
    ElMessage.error(`Lỗi thay đổi trạng thái: ${err?.message || err}`);
  }
}
</script>

<style scoped>
.plugin-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.table-card {
  border-radius: 8px;
}

.plugin-id {
  font-family: monospace;
  color: #2563eb;
  font-weight: 600;
}
</style>
