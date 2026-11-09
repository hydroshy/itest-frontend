<template>
  <div class="relative overflow-hidden bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors duration-200">
    <!-- Geometric Accents -->
    <div class="hidden xl:block absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden memphis-vector">
      <svg class="w-full h-full opacity-15" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="260" cy="90" r="60" stroke="#2563eb" stroke-width="6" />
        <circle cx="160" cy="40" r="24" fill="#38bdf8" />
        <rect x="200" y="120" width="50" height="20" rx="10" fill="#10b981" />
        <path d="M 120 110 Q 140 90 160 110 T 200 110" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none" />
        <circle cx="90" cy="30" r="3" fill="#cbd5e1" />
        <circle cx="110" cy="30" r="3" fill="#cbd5e1" />
      </svg>
    </div>

    <!-- Left Column: Title & Informative Context -->
    <div class="relative z-10 max-w-2xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-display bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 mb-3">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>iTEST 2.0 // Tổng quan Hệ thống</span>
      </div>
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-black font-display text-[var(--owl-text-primary)] tracking-tight">
        Trung tâm Quản trị & Giám sát Kiểm thử
      </h1>
      <p class="text-xs md:text-sm font-semibold text-[var(--owl-text-secondary)] mt-2 leading-relaxed">
        Nền tảng kiểm chuẩn thiết bị công nghiệp Daviteq. Theo dõi chỉ số vận hành, tiện ích mở rộng và phân quyền ứng dụng thời gian thực.
      </p>

      <!-- User Status Pill -->
      <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--owl-border-light)] text-xs">
        <span class="font-bold text-[var(--owl-text-secondary)]">Tài khoản:</span>
        <span class="font-extrabold text-[var(--owl-text-primary)] font-mono">{{ user?.fullName || user?.username || 'Operator' }}</span>
        <span class="text-[var(--owl-text-muted)]">•</span>
        <span class="font-bold text-[var(--owl-text-secondary)]">Vai trò:</span>
        <span class="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          {{ currentRoleLabel }}
        </span>
        <span class="text-[var(--owl-text-muted)]">•</span>
        <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <font-awesome-icon :icon="['fas', 'circle-check']" class="text-xs" />
          Phiên làm việc an toàn
        </span>
      </div>
    </div>

    <!-- Right Column: Quick Action Controls -->
    <div class="relative z-10 flex flex-wrap lg:flex-col gap-3 w-full lg:w-auto shrink-0">
      <button
        type="button"
        class="btn btn-sm h-11 px-5 rounded-2xl bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer"
        :disabled="refreshing"
        @click="$emit('refresh')"
      >
        <font-awesome-icon :icon="['fas', 'arrows-rotate']" :class="{ 'animate-spin': refreshing }" class="text-blue-500" />
        <span>Làm mới chỉ số</span>
      </button>

      <button
        type="button"
        class="btn btn-sm h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-none font-bold transition-all duration-200 flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
        @click="$emit('launch')"
      >
        <font-awesome-icon :icon="['fas', 'border-all']" class="text-white" />
        <span>Mở Menu Phân Hệ</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  refreshing: boolean;
  currentRoleLabel: string;
  user: any;
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'launch'): void;
}>();
</script>
