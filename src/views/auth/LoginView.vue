<template>
  <form class="flex flex-col gap-4 font-sans text-left" @submit.prevent="handleLogin">
    <!-- Username -->
    <div class="form-control w-full">
      <label class="label py-1">
        <span class="label-text text-xs uppercase tracking-wider font-semibold text-[#7fdbca]">Tài khoản</span>
      </label>
      <div class="relative">
        <input
          v-model="loginForm.username"
          type="text"
          placeholder="Tên đăng nhập hoặc email"
          autocomplete="username"
          required
          class="input input-bordered w-full bg-[#051321] border-[#1d3b5a] text-[#ffffff] focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm pl-10"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#7fdbca]/70 select-none">
          👤
        </span>
      </div>
    </div>

    <!-- Password -->
    <div class="form-control w-full">
      <label class="label py-1">
        <span class="label-text text-xs uppercase tracking-wider font-semibold text-[#7fdbca]">Mật khẩu</span>
      </label>
      <div class="relative">
        <input
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Mật khẩu"
          autocomplete="current-password"
          required
          class="input input-bordered w-full bg-[#051321] border-[#1d3b5a] text-[#ffffff] focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm pl-10 pr-10"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#7fdbca]/70 select-none">
          🔒
        </span>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? 'Ẩn' : 'Hiện' }}
        </button>
      </div>
    </div>

    <!-- Remember me -->
    <div class="flex items-center justify-between py-1">
      <label class="label cursor-pointer gap-2 p-0">
        <input
          v-model="rememberMe"
          type="checkbox"
          class="checkbox checkbox-xs checkbox-primary border-[#1d3b5a] checked:bg-[#00f0ff] checked:border-[#00f0ff]"
        />
        <span class="label-text text-xs text-[#94a3b8]">Ghi nhớ đăng nhập</span>
      </label>
    </div>

    <!-- Submit button -->
    <button
      type="submit"
      class="btn w-full bg-[#00f0ff] hover:bg-[#00b4d8] text-[#011627] font-bold border-none shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all mt-2 h-11"
      :disabled="loading"
    >
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>Đăng nhập</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { cyberToast } from '@/services/cyberToast';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const rememberMe = ref(true);
const showPassword = ref(false);

const loginForm = reactive({
  username: 'admin',
  password: '',
});

async function handleLogin() {
  if (!loginForm.username.trim() || !loginForm.password) {
    cyberToast.warning('Vui lòng nhập tài khoản và mật khẩu');
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      username: loginForm.username.trim(),
      password: loginForm.password,
    });

    cyberToast.success('Đăng nhập thành công');
    const redirect = (route.query.redirect as string) || '/menu';
    router.push(redirect);
  } catch (_err) {
    // Interceptor hiển thị lỗi cụ thể
  } finally {
    loading.value = false;
  }
}
</script>
