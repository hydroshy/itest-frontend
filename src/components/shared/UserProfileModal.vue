<template>
  <el-dialog
    v-model="visible"
    title=""
    width="540px"
    class="cyber-dialog user-profile-dialog"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
  >
    <div class="profile-modal-container" data-augmented-ui="tl-clip br-clip border">
      <!-- Modal Header -->
      <div class="modal-cyber-header">
        <div class="header-tag">
          <span class="pulse-indicator"></span>
          <span class="sys-code">SYS.OPERATOR // IDENTITY PROFILE</span>
        </div>
        <h3 class="header-title">Hồ sơ & Thông tin cá nhân</h3>
        <p class="header-desc">Quản lý định danh tài khoản, thông tin hiển thị và mật khẩu truy cập hệ thống</p>
      </div>

      <!-- Identity Summary Card -->
      <div class="user-summary-card">
        <el-avatar :size="52" class="cyber-avatar">
          {{ userInitial }}
        </el-avatar>
        <div class="summary-details">
          <div class="summary-name">{{ authStore.user?.fullName || authStore.user?.username }}</div>
          <div class="summary-meta">
            <span class="username-tag">@{{ authStore.user?.username }}</span>
            <el-tag
              v-for="role in (authStore.roles.length ? authStore.roles : ['No Role'])"
              :key="role"
              size="small"
              class="cyber-role-tag"
            >
              {{ role }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <el-tabs v-model="activeTab" class="cyber-tabs">
        <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
        <el-tab-pane label="Thông tin cá nhân" name="profile">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            class="cyber-form"
            @submit.prevent="handleUpdateProfile"
          >
            <el-form-item label="Tên tài khoản (Username)">
              <el-input :model-value="authStore.user?.username" disabled class="cyber-input disabled-input">
                <template #prefix>
                  <el-icon><UserFilled /></el-icon>
                </template>
              </el-input>
              <span class="field-hint">Tên đăng nhập do Quản trị viên khởi tạo và không thể tự thay đổi.</span>
            </el-form-item>

            <el-form-item label="Tên hiển thị (Họ và tên)" prop="fullName">
              <el-input
                v-model="profileForm.fullName"
                placeholder="Nhập tên hiển thị của bạn"
                maxlength="100"
                clearable
                class="cyber-input"
              >
                <template #prefix>
                  <el-icon><Avatar /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Địa chỉ Email" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="Nhập email liên hệ (VD: user@company.com)"
                maxlength="150"
                clearable
                class="cyber-input"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-actions">
              <el-button @click="handleClose" class="cyber-btn-cancel">Đóng</el-button>
              <el-button
                type="primary"
                :loading="submittingProfile"
                class="cyber-btn-submit"
                @click="handleUpdateProfile"
              >
                Lưu thay đổi
              </el-button>
            </div>
          </el-form>
        </el-tab-pane>

        <!-- TAB 2: ĐỔI MẬT KHẨU -->
        <el-tab-pane label="Đổi mật khẩu" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
            class="cyber-form"
            @submit.prevent="handleChangePassword"
          >
            <el-form-item label="Mật khẩu hiện tại" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="Nhập mật khẩu hiện tại"
                class="cyber-input"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Mật khẩu mới" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="Tối thiểu 6 ký tự"
                class="cyber-input"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Xác nhận mật khẩu mới" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="Nhập lại mật khẩu mới"
                class="cyber-input"
              >
                <template #prefix>
                  <el-icon><Check /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-actions">
              <el-button @click="handleClose" class="cyber-btn-cancel">Đóng</el-button>
              <el-button
                type="primary"
                :loading="submittingPassword"
                class="cyber-btn-submit"
                @click="handleChangePassword"
              >
                Cập nhật mật khẩu
              </el-button>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { UserFilled, Avatar, Message, Key, Lock, Check } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { httpClient } from '@/api/client';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const authStore = useAuthStore();
const activeTab = ref('profile');

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

// Profile Form
const profileFormRef = ref<FormInstance>();
const submittingProfile = ref(false);
const profileForm = reactive({
  fullName: '',
  email: '',
});

const profileRules: FormRules = {
  fullName: [
    { required: true, message: 'Vui lòng nhập họ và tên hiển thị', trigger: 'blur' },
    { min: 2, max: 100, message: 'Tên hiển thị từ 2 đến 100 ký tự', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: 'Địa chỉ email không đúng định dạng', trigger: 'blur' },
  ],
};

// Password Form
const passwordFormRef = ref<FormInstance>();
const submittingPassword = ref(false);
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('Mật khẩu xác nhận không khớp'));
  } else {
    callback();
  }
};

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    { min: 6, max: 100, message: 'Mật khẩu mới tối thiểu 6 ký tự', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu mới', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

// Reset / Init values when opening
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeTab.value = 'profile';
      profileForm.fullName = authStore.user?.fullName || '';
      profileForm.email = authStore.user?.email || '';
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      profileFormRef.value?.clearValidate();
      passwordFormRef.value?.clearValidate();
    }
  },
  { immediate: true }
);

function handleClose() {
  visible.value = false;
}

async function handleUpdateProfile() {
  if (!profileFormRef.value) return;
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submittingProfile.value = true;
    try {
      const payload = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email?.trim() || undefined,
      };
      // Call update profile endpoint (supports PUT /api/auth/profile)
      await httpClient.put('/auth/profile', payload);

      // Update Pinia store and local storage
      authStore.updateUser({
        fullName: payload.fullName,
        email: payload.email,
      });

      ElMessage.success('Cập nhật thông tin cá nhân thành công!');
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật thất bại';
      ElMessage.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      submittingProfile.value = false;
    }
  });
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submittingPassword.value = true;
    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      // Call change password endpoint (supports PUT /api/auth/change-password)
      await httpClient.put('/auth/change-password', payload);

      ElMessage.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại';
      ElMessage.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      submittingPassword.value = false;
    }
  });
}
</script>

<style scoped>
:deep(.el-dialog.cyber-dialog) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.el-dialog.cyber-dialog .el-dialog__header) {
  display: none;
}

:deep(.el-dialog.cyber-dialog .el-dialog__body) {
  padding: 0;
}

.profile-modal-container {
  background: #0f172a;
  border: 1px solid rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 240, 255, 0.2);
  padding: 24px;
  color: #e2e8f0;
  position: relative;
  border-radius: 4px;
}

.modal-cyber-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 14px;
}

.header-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
  animation: cyberPulse 2s infinite;
}

@keyframes cyberPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.sys-code {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  color: #00f0ff;
  letter-spacing: 1px;
}

.header-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.header-desc {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.user-summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  margin-bottom: 20px;
}

.cyber-avatar {
  background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
  color: #020617;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}

.summary-details {
  flex: 1;
}

.summary-name {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 4px;
}

.summary-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.username-tag {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 12px;
  color: #38bdf8;
}

.cyber-role-tag {
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #00f0ff;
  font-size: 11px;
}

/* Tabs styling */
:deep(.cyber-tabs .el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.1);
  height: 1px;
}

:deep(.cyber-tabs .el-tabs__item) {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.cyber-tabs .el-tabs__item.is-active) {
  color: #00f0ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

:deep(.cyber-tabs .el-tabs__active-bar) {
  background-color: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
}

/* Form styling */
.cyber-form {
  margin-top: 16px;
}

:deep(.cyber-form .el-form-item__label) {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.field-hint {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

:deep(.cyber-input .el-input__wrapper) {
  background-color: #1e293b !important;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
  border-radius: 4px;
  padding: 4px 12px;
}

:deep(.cyber-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.4) inset !important;
}

:deep(.cyber-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00f0ff inset, 0 0 10px rgba(0, 240, 255, 0.25) !important;
}

:deep(.cyber-input .el-input__inner) {
  color: #f8fafc;
  font-size: 14px;
}

:deep(.disabled-input .el-input__wrapper) {
  background-color: #0b1120 !important;
  opacity: 0.75;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
}

.cyber-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

.cyber-btn-submit {
  background: linear-gradient(135deg, #00f0ff 0%, #0088ff 100%);
  border: none;
  color: #020617;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
  transition: all 0.2s ease;
}

.cyber-btn-submit:hover {
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.6);
  transform: translateY(-1px);
}
</style>
