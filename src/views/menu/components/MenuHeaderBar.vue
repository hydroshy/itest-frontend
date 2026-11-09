<template>
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 mb-3 bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] rounded-3xl shadow-sm transition-colors duration-250">
    <div class="flex items-center gap-3.5">
      <!-- iTest 2.0 Back Button -->
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[var(--owl-border)] bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] hover:border-blue-500/40 transition-all cursor-pointer shadow-none group"
        title="Quay lại"
        @click="goBack"
      >
        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-xs flex-shrink-0">
          <span class="text-white text-[10px] font-black font-mono tracking-tighter">iT</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-extrabold text-xs tracking-wide text-[var(--owl-text-primary)] font-display group-hover:text-blue-500 transition-colors">iTEST</span>
          <span class="text-blue-500 dark:text-blue-400 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 border border-blue-500/30">2.0</span>
        </div>
      </button>

      <div>
        <h2 class="text-xl font-bold font-display text-[var(--owl-text-primary)] tracking-wide">
          <span>Menu Ứng Dụng & Phân Hệ</span>
        </h2>
        <p class="text-xs sm:text-sm font-semibold text-[var(--owl-text-secondary)] mt-1">
          Khởi chạy các tiện ích kiểm thử, cấu hình thiết bị và công cụ vận hành hệ thống iTEST
        </p>
      </div>
    </div>

    <!-- Search & Category Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search input -->
      <div class="relative flex items-center min-w-[200px] max-w-xs group">
        <font-awesome-icon
          :icon="['fas', 'magnifying-glass']"
          class="absolute left-3.5 text-xs text-[var(--owl-text-muted)] group-focus-within:text-blue-500 transition-colors pointer-events-none"
        />
        <input
          :value="searchQuery"
          type="text"
          placeholder="Tìm kiếm phân hệ..."
          class="w-full h-10 pl-9 pr-8 bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] focus:bg-[var(--owl-bg-card)] text-xs font-semibold text-[var(--owl-text-primary)] placeholder:text-[var(--owl-text-muted)] rounded-xl border border-[var(--owl-border)] focus:border-blue-500 transition-all outline-none"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] p-1 text-xs"
          @click="$emit('update:searchQuery', '')"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <!-- Category Filter Buttons -->
      <div class="join bg-[var(--owl-bg-card)] p-1 rounded-xl border border-[var(--owl-border)]">
        <button
          type="button"
          class="btn btn-xs join-item px-3 h-8 text-xs font-bold rounded-lg border-none transition-all cursor-pointer"
          :class="selectedCategory === 'all'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)]'"
          @click="$emit('update:selectedCategory', 'all')"
        >
          Tất cả ({{ counts.all }})
        </button>
        <button
          type="button"
          class="btn btn-xs join-item px-3 h-8 text-xs font-bold rounded-lg border-none transition-all cursor-pointer"
          :class="selectedCategory === 'system'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)]'"
          @click="$emit('update:selectedCategory', 'system')"
        >
          Hệ thống ({{ counts.system }})
        </button>
        <button
          type="button"
          class="btn btn-xs join-item px-3 h-8 text-xs font-bold rounded-lg border-none transition-all cursor-pointer"
          :class="selectedCategory === 'plugin'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-[var(--owl-text-secondary)] hover:text-[var(--owl-text-primary)]'"
          @click="$emit('update:selectedCategory', 'plugin')"
        >
          Plugin ({{ counts.plugin }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps<{
  searchQuery: string;
  selectedCategory: string;
  counts: { all: number; system: number; plugin: number };
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedCategory', val: string): void;
}>();

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}
</script>
