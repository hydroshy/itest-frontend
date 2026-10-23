<template>
  <el-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="rules"
    label-position="top"
    size="large"
    @keyup.enter="handleLogin"
  >
    <el-form-item label="Tài khoản" prop="username">
      <el-input
        v-model="loginForm.username"
        placeholder="Tên đăng nhập hoặc email"
        :prefix-icon="User"
        autocomplete="username"
      />
    </el-form-item>

    <el-form-item label="Mật khẩu" prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="Mật khẩu"
        :prefix-icon="Lock"
        show-password
        autocomplete="current-password"
      />
    </el-form-item>

    <div class="form-actions">
      <el-checkbox v-model="rememberMe">Ghi nhớ đăng nhập</el-checkbox>
    </div>

    <el-button
      type="primary"
      class="submit-btn"
      :loading="loading"
      @click="handleLogin"
    >
      Đăng nhập
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { User, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(true);

const loginForm = reactive({
  username: 'admin',
  password: '',
});

const rules: FormRules = {
  username: [{ required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }],
};

async function handleLogin() {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login({
        username: loginForm.username,
        password: loginForm.password,
      });

      ElMessage.success('Đăng nhập thành công');
      const redirect = (route.query.redirect as string) || '/menu';
      router.push(redirect);
    } catch (_err) {
      // Thông báo lỗi cụ thể (như "Invalid username/email or password") đã được httpClient interceptor hiển thị duy nhất 1 lần
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  border-radius: 6px;
  font-weight: 600;
  height: 44px;
}
</style>
