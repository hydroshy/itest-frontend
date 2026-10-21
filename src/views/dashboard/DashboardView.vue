<template>
  <div class="dashboard-container">
    <!-- Summary Metrics -->
    <el-row :gutter="20" class="metric-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Trạng thái Shell</span>
              <span class="metric-value status-online">Hoạt động</span>
            </div>
            <div class="metric-icon-box bg-blue">
              <el-icon><Platform /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Plugins đã nạp</span>
              <span class="metric-value">{{ pluginStore.plugins.length }}</span>
            </div>
            <div class="metric-icon-box bg-green">
              <el-icon><SetUp /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">Mô-đun kích hoạt</span>
              <span class="metric-value">{{ pluginStore.activePlugins.length }}</span>
            </div>
            <div class="metric-icon-box bg-orange">
              <el-icon><Connection /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-content">
            <div class="metric-info">
              <span class="metric-label">SDK Version</span>
              <span class="metric-value">v{{ pluginStore.diagnostics.sdkVersion }}</span>
            </div>
            <div class="metric-icon-box bg-purple">
              <el-icon><Cpu /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Plugin Widgets Section -->
    <div class="section-header">
      <h2 class="section-title">Tiện ích Bảng điều khiển (Plugin Widgets)</h2>
    </div>

    <el-row v-if="pluginStore.widgets.length > 0" :gutter="20">
      <el-col
        v-for="widget in pluginStore.widgets"
        :key="widget.id"
        :xs="24"
        :sm="widget.width === 'half' ? 12 : 24"
        :md="widget.width === 'third' ? 8 : widget.width === 'half' ? 12 : 24"
        class="widget-col"
      >
        <el-card shadow="hover" class="widget-card">
          <template #header>
            <div class="widget-header">
              <span class="widget-title">{{ widget.title }}</span>
            </div>
          </template>
          <CModuleBoundary :module-name="`Widget: ${widget.title}`">
            <component :is="widget.component" />
          </CModuleBoundary>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-else
      description="Chưa có tiện ích nào được cung cấp bởi plugin hiện tại"
      :image-size="100"
    />
  </div>
</template>

<script setup lang="ts">
import { usePluginStore } from '@/stores/plugin';
import { Platform, SetUp, Connection, Cpu } from '@element-plus/icons-vue';

const pluginStore = usePluginStore();
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-row {
  margin-bottom: 8px;
}

.metric-card {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.metric-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.status-online {
  color: #10b981;
}

.metric-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-blue { background-color: #ebf5ff; color: #3b82f6; }
.bg-green { background-color: #ecfdf5; color: #10b981; }
.bg-orange { background-color: #fff7ed; color: #f97316; }
.bg-purple { background-color: #f5f3ff; color: #8b5cf6; }

.section-header {
  margin-top: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.widget-col {
  margin-bottom: 20px;
}

.widget-card {
  border-radius: 8px;
  min-height: 200px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-title {
  font-weight: 600;
  font-size: 15px;
}
</style>
