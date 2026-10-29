<template>
  <div class="min-h-[75vh] flex items-center justify-center p-6 font-sans">
    <div class="card bg-[#081d32] border border-[#1d3b5a] shadow-[0_0_30px_rgba(0,240,255,0.15)] max-w-md w-full p-8 text-center backdrop-blur-md">
      <div class="text-6xl font-black text-[#ecc48d] tracking-widest drop-shadow-[0_0_15px_rgba(236,196,141,0.5)] mb-2">
        404
      </div>
      <div class="text-lg font-bold text-[#ffffff] uppercase tracking-wider mb-2">
        KHÔNG TÌM THẤY TRANG
      </div>
      <p class="text-sm text-[#94a3b8] mb-6">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div class="flex justify-center">
        <button
          type="button"
          class="btn btn-sm bg-[#00f0ff] hover:bg-[#00b4d8] text-[#011627] font-bold border-none shadow-[0_0_15px_rgba(0,240,255,0.4)] px-6"
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
