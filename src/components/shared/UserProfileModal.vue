<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
    <!-- Modal Card Container -->
    <div
      class="relative w-full max-w-lg bg-base-200 border border-base-content/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs font-sans text-base-content"
    >
      <!-- Modal Header -->
      <div class="p-5 pb-3 border-b border-base-content/10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-base-content tracking-wide">
                Hồ sơ &amp; Thông tin cá nhân
              </h3>
              <p class="text-xs text-base-content/60 mt-0.5">
                Quản lý định danh tài khoản, thông tin hiển thị và mật khẩu
              </p>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content hover:bg-base-300"
            @click="handleClose"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Identity Summary Card -->
      <div class="p-5 pb-0">
        <div class="p-3.5 rounded-xl bg-base-300 border border-base-content/10 flex items-center gap-3.5 shadow-inner">
          <div
            class="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-base font-mono flex-shrink-0"
          >
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-base text-base-content truncate">
                {{ authStore.user?.fullName || authStore.user?.username || 'Người dùng' }}
              </span>
              <span class="badge badge-success badge-xs font-mono">HOẠT ĐỘNG</span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs text-base-content/70 flex-wrap">
              <span class="font-mono text-base-content/60">@{{ authStore.user?.username }}</span>
              <span>•</span>
              <span class="badge badge-ghost badge-xs border-base-content/20 font-mono">
                {{ authStore.roles.join(', ') || 'Chưa phân vai trò' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="px-5 pt-3">
        <div class="tabs tabs-bordered">
          <button
            type="button"
            class="tab tab-bordered transition-all"
            :class="activeTab === 'profile' ? 'tab-active font-semibold text-primary !border-primary' : 'text-base-content/70 hover:text-base-content'"
            @click="activeTab = 'profile'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Thông tin cá nhân
          </button>
          <button
            type="button"
            class="tab tab-bordered transition-all"
            :class="activeTab === 'password' ? 'tab-active font-semibold text-primary !border-primary' : 'text-base-content/70 hover:text-base-content'"
            @click="activeTab = 'password'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="p-5 overflow-y-auto max-h-[60vh]">
        <!-- TAB 1: PROFILE INFO -->
        <form v-if="activeTab === 'profile'" @submit.prevent="handleUpdateProfile" class="space-y-4">
          <!-- Username (Readonly) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Tên tài khoản (Username)</span>
              <span class="label-text-alt text-base-content/50 font-mono text-[10px]">Cố định</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                :value="authStore.user?.username || ''"
                disabled
                class="input input-sm w-full pl-9 bg-base-300/60 border border-base-content/15 text-base-content/60 font-mono cursor-not-allowed rounded-lg"
              />
            </div>
          </div>

          <!-- Full Name -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Họ và tên hiển thị <span class="text-error">*</span></span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                v-model="profileForm.fullName"
                type="text"
                placeholder="Nhập họ và tên đầy đủ"
                maxlength="100"
                class="input input-sm w-full pl-9 bg-base-300 border border-base-content/20 text-base-content focus:border-primary focus:outline-none rounded-lg"
              />
            </div>
            <span v-if="profileErrors.fullName" class="text-error text-[11px] mt-1">{{ profileErrors.fullName }}</span>
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Địa chỉ Email</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="profileForm.email"
                type="email"
                placeholder="Nhập email liên hệ (VD: user@company.com)"
                maxlength="150"
                class="input input-sm w-full pl-9 bg-base-300 border border-base-content/20 text-base-content font-mono focus:border-primary focus:outline-none rounded-lg"
              />
            </div>
            <span v-if="profileErrors.email" class="text-error text-[11px] mt-1">{{ profileErrors.email }}</span>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-base-content/10">
            <button
              type="button"
              class="btn btn-sm btn-ghost border border-base-content/20 text-base-content/80 hover:text-base-content hover:bg-base-300"
              @click="handleClose"
            >
              Đóng
            </button>
            <button
              type="submit"
              :disabled="submittingProfile"
              class="btn btn-sm btn-primary"
            >
              <span v-if="submittingProfile" class="loading loading-spinner loading-xs mr-1"></span>
              Lưu thông tin
            </button>
          </div>
        </form>

        <!-- TAB 2: CHANGE PASSWORD -->
        <form v-else-if="activeTab === 'password'" @submit.prevent="handleChangePassword" class="space-y-4">
          <!-- Current Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Mật khẩu hiện tại <span class="text-error">*</span></span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Nhập mật khẩu đang sử dụng"
                class="input input-sm w-full pl-9 bg-base-300 border border-base-content/20 text-base-content font-mono focus:border-primary focus:outline-none rounded-lg"
              />
            </div>
            <span v-if="passwordErrors.currentPassword" class="text-error text-[11px] mt-1">{{ passwordErrors.currentPassword }}</span>
          </div>

          <!-- New Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Mật khẩu mới <span class="text-error">*</span></span>
              <span class="label-text-alt text-base-content/50 text-[10px]">Tối thiểu 6 ký tự</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                class="input input-sm w-full pl-9 bg-base-300 border border-base-content/20 text-base-content font-mono focus:border-primary focus:outline-none rounded-lg"
              />
            </div>
            <span v-if="passwordErrors.newPassword" class="text-error text-[11px] mt-1">{{ passwordErrors.newPassword }}</span>
          </div>

          <!-- Confirm New Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/80">Xác nhận mật khẩu mới <span class="text-error">*</span></span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                class="input input-sm w-full pl-9 bg-base-300 border border-base-content/20 text-base-content font-mono focus:border-primary focus:outline-none rounded-lg"
              />
            </div>
            <span v-if="passwordErrors.confirmPassword" class="text-error text-[11px] mt-1">{{ passwordErrors.confirmPassword }}</span>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-base-content/10">
            <button
              type="button"
              class="btn btn-sm btn-ghost border border-base-content/20 text-base-content/80 hover:text-base-content hover:bg-base-300"
              @click="handleClose"
            >
              Đóng
            </button>
            <button
              type="submit"
              :disabled="submittingPassword"
              class="btn btn-sm btn-primary"
            >
              <span v-if="submittingPassword" class="loading loading-spinner loading-xs mr-1"></span>
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const authStore = useAuthStore();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const activeTab = ref<'profile' | 'password'>('profile');
const submittingProfile = ref(false);
const submittingPassword = ref(false);

const profileForm = reactive({
  fullName: '',
  email: '',
});

const profileErrors = reactive({
  fullName: '',
  email: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const userInitial = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeTab.value = 'profile';
      profileForm.fullName = authStore.user?.fullName || '';
      profileForm.email = authStore.user?.email || '';
      profileErrors.fullName = '';
      profileErrors.email = '';

      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      passwordErrors.currentPassword = '';
      passwordErrors.newPassword = '';
      passwordErrors.confirmPassword = '';
    }
  },
  { immediate: true }
);

function handleClose() {
  visible.value = false;
}

function validateProfile(): boolean {
  profileErrors.fullName = '';
  profileErrors.email = '';
  let valid = true;

  if (!profileForm.fullName.trim()) {
    profileErrors.fullName = 'Vui lòng nhập tên hiển thị';
    valid = false;
  }

  if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
    profileErrors.email = 'Định dạng email không hợp lệ';
    valid = false;
  }

  return valid;
}

function validatePassword(): boolean {
  passwordErrors.currentPassword = '';
  passwordErrors.newPassword = '';
  passwordErrors.confirmPassword = '';
  let valid = true;

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    valid = false;
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    valid = false;
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    valid = false;
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    valid = false;
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    valid = false;
  }

  return valid;
}

async function handleUpdateProfile() {
  if (!validateProfile()) return;
  submittingProfile.value = true;
  try {
    const payload = {
      fullName: profileForm.fullName.trim(),
      email: profileForm.email?.trim() || undefined,
    };
    await httpClient.put('/auth/profile', payload);

    authStore.updateUser({
      fullName: payload.fullName,
      email: payload.email,
    });

    cyberToast.success('Cập nhật thông tin cá nhân thành công!');
    handleClose();
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Cập nhật thất bại';
    cyberToast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  } finally {
    submittingProfile.value = false;
  }
}

async function handleChangePassword() {
  if (!validatePassword()) return;
  submittingPassword.value = true;
  try {
    const payload = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    };
    await httpClient.put('/auth/change-password', payload);

    cyberToast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    handleClose();
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại';
    cyberToast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  } finally {
    submittingPassword.value = false;
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
