<template>
  <div class="min-h-[75vh] flex items-center justify-center p-6 font-sans">
    <div class="card bg-[#151d2c] border border-white/10 max-w-md w-full p-8 text-center rounded-2xl">
      <div class="text-6xl font-black text-amber-400 tracking-widest mb-2 font-display">
        404
      </div>
      <div class="text-lg font-bold text-slate-100 uppercase tracking-wider mb-2 font-display">
        KHÔNG TÌM THẤY TRANG
      </div>
      <p class="text-sm text-slate-400 mb-6">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div class="flex justify-center">
        <button
          type="button"
          class="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white font-semibold border-none px-6 rounded-lg transition-colors"
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
