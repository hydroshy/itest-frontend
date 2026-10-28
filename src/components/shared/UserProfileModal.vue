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
    <div class="profile-modal-container">
      <!-- Modal Header -->
      <div class="modal-cyber-header">
        <div class="header-tag">
          <span class="pulse-indicator"></span>
          <span class="sys-code">ACCOUNT PROFILE</span>
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
  background: var(--owl-bg-surface, #081d32);
  border: 1px solid var(--owl-border, #1d3b5a);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  padding: 24px;
  color: var(--owl-text-primary, #d6deeb);
  position: relative;
  border-radius: var(--cyber-radius-lg, 12px);
}

.modal-cyber-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--owl-border, #1d3b5a);
  padding-bottom: 14px;
}

.header-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--owl-teal, #7fdbca);
  box-shadow: 0 0 6px var(--owl-teal, #7fdbca);
}

.sys-code {
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--owl-teal, #7fdbca);
  letter-spacing: 0.8px;
}

.header-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--owl-text-bright, #ffffff);
}

.header-desc {
  margin: 0;
  font-size: 13px;
  color: var(--owl-text-secondary, #7e97b8);
}

.user-summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--owl-bg-card, #0b253e);
  border: 1px solid var(--owl-border, #1d3b5a);
  border-radius: var(--cyber-radius, 8px);
  margin-bottom: 20px;
}

.cyber-avatar {
  background: linear-gradient(135deg, #7fdbca 0%, #57c7b1 100%);
  color: #011627;
  font-weight: 700;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(127, 219, 202, 0.25);
}

.summary-details {
  flex: 1;
}

.summary-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--owl-text-bright, #ffffff);
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
  color: var(--owl-text-muted, #5f7e97);
}

.cyber-role-tag {
  background: var(--owl-teal-dim, rgba(127, 219, 202, 0.12));
  border: 1px solid rgba(127, 219, 202, 0.3);
  color: var(--owl-teal, #7fdbca);
  font-family: var(--cyber-font-mono, monospace);
  font-size: 11px;
}

/* Tabs styling */
:deep(.cyber-tabs .el-tabs__nav-wrap::after) {
  background-color: var(--owl-border, #1d3b5a);
  height: 1px;
}

:deep(.cyber-tabs .el-tabs__item) {
  color: var(--owl-text-secondary, #7e97b8);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.cyber-tabs .el-tabs__item.is-active) {
  color: var(--owl-teal, #7fdbca);
}

:deep(.cyber-tabs .el-tabs__active-bar) {
  background-color: var(--owl-teal, #7fdbca);
}

/* Form styling */
.cyber-form {
  margin-top: 16px;
}

:deep(.cyber-form .el-form-item__label) {
  color: var(--owl-text-primary, #d6deeb);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.field-hint {
  font-size: 11px;
  color: var(--owl-text-muted, #5f7e97);
  margin-top: 4px;
}

:deep(.cyber-input .el-input__wrapper) {
  background-color: var(--owl-bg-input, #0b253e) !important;
  box-shadow: 0 0 0 1px var(--owl-border, #1d3b5a) inset !important;
  border-radius: var(--cyber-radius-sm, 6px);
  padding: 4px 12px;
}

:deep(.cyber-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--owl-border-focus, #7fdbca) inset !important;
}

:deep(.cyber-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--owl-teal, #7fdbca) inset, 0 0 0 3px var(--owl-teal-dim, rgba(127, 219, 202, 0.15)) !important;
}

:deep(.cyber-input .el-input__inner) {
  color: var(--owl-text-bright, #ffffff);
  font-size: 14px;
}

:deep(.disabled-input .el-input__wrapper) {
  background-color: rgba(5, 19, 33, 0.6) !important;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--owl-border, #1d3b5a);
}

.cyber-btn-cancel {
  background: transparent;
  border: 1px solid var(--owl-border, #1d3b5a);
  color: var(--owl-text-secondary, #7e97b8);
  border-radius: var(--cyber-radius-sm, 6px);
}

.cyber-btn-cancel:hover {
  background: var(--owl-bg-card, #0b253e);
  border-color: var(--owl-text-secondary, #7e97b8);
  color: var(--owl-text-bright, #ffffff);
}

.cyber-btn-submit {
  background: var(--owl-teal, #7fdbca);
  border: none;
  color: #011627;
  font-weight: 600;
  border-radius: var(--cyber-radius-sm, 6px);
  box-shadow: 0 2px 8px rgba(127, 219, 202, 0.25);
  transition: all 0.2s ease;
}

.cyber-btn-submit:hover {
  background: #9cf0e0;
  box-shadow: 0 4px 14px rgba(127, 219, 202, 0.4);
  transform: translateY(-1px);
}
</style>
