<template>
  <div class="min-h-[75vh] flex items-center justify-center p-6 font-sans">
    <div class="card bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] max-w-md w-full p-8 text-center rounded-2xl shadow-sm">
      <div class="text-6xl font-black text-amber-500 tracking-widest mb-2 font-display">
        404
      </div>
      <div class="text-lg font-bold text-[var(--owl-text-primary)] uppercase tracking-wider mb-2 font-display">
        KHÔNG TÌM THẤY TRANG
      </div>
      <p class="text-sm text-[var(--owl-text-secondary)] mb-6">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div class="flex justify-center">
        <button
          type="button"
          class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold border-none px-6 rounded-xl transition-colors"
          @click="$router.push('/dashboard')"
        >
          Về bảng điều khiển
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
