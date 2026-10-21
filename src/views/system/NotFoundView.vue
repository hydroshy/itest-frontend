<template>
  <div class="not-found-container">
    <el-result
      icon="warning"
      title="404"
      sub-title="Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển."
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/dashboard')">
          Về bảng điều khiển
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
