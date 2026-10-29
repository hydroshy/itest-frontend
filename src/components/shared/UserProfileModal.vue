<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
    <!-- Modal Card Container -->
    <div
      class="relative w-full max-w-lg bg-[#081d32]/95 border border-[#1d3b5a] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden text-xs font-sans text-[#d6deeb]"
    >
      <!-- Cyber Top Ambient Glow line -->
      <div class="h-1 w-full bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>

      <!-- Close Button (Top Right) -->
      <button
        type="button"
        class="absolute top-4 right-4 text-[#5f7e97] hover:text-[#00f0ff] p-1.5 rounded-lg hover:bg-[#0b2942] transition-colors"
        @click="handleClose"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="p-5 pb-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-block w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
          <span class="font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">ACCOUNT PROFILE</span>
        </div>
        <h3 class="text-base font-bold text-[#d6deeb] uppercase font-mono tracking-wide">
          Hồ sơ &amp; Thông tin cá nhân
        </h3>
        <p class="text-[11px] text-[#5f7e97] mt-0.5">
          Quản lý định danh tài khoản, thông tin hiển thị và mật khẩu truy cập hệ thống
        </p>
      </div>

      <!-- Identity Summary Card -->
      <div class="mx-5 p-3.5 bg-[#051321] border border-[#1d3b5a] rounded-lg flex items-center gap-3.5 shadow-inner">
        <div class="w-12 h-12 rounded-full bg-[#00f0ff] text-[#051321] font-black border-2 border-[#7fdbca] shadow-[0_0_10px_rgba(0,240,255,0.6)] flex items-center justify-center text-sm font-mono flex-shrink-0 select-none">
          {{ userInitial }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-[#d6deeb] truncate">
            {{ authStore.user?.fullName || authStore.user?.username }}
          </div>
          <div class="flex flex-wrap items-center gap-1.5 mt-1">
            <span class="font-mono text-[11px] text-[#7fdbca]">@{{ authStore.user?.username }}</span>
            <span
              v-for="role in (authStore.roles.length ? authStore.roles : ['No Role'])"
              :key="role"
              class="badge badge-xs bg-[#0b2942] border border-[#1d3b5a] text-[#00f0ff] font-mono text-[10px] px-2 py-0.5"
            >
              {{ role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation (DaisyUI Tabs) -->
      <div class="flex border-b border-[#1d3b5a] px-5 mt-4">
        <button
          type="button"
          class="pb-2.5 px-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all border-b-2"
          :class="activeTab === 'profile'
            ? 'border-[#00f0ff] text-[#00f0ff] shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
            : 'border-transparent text-[#5f7e97] hover:text-[#d6deeb]'"
          @click="activeTab = 'profile'"
        >
          Thông tin cá nhân
        </button>
        <button
          type="button"
          class="pb-2.5 px-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all border-b-2"
          :class="activeTab === 'password'
            ? 'border-[#00f0ff] text-[#00f0ff] shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
            : 'border-transparent text-[#5f7e97] hover:text-[#d6deeb]'"
          @click="activeTab = 'password'"
        >
          Đổi mật khẩu
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-5 overflow-y-auto max-h-[60vh]">
        <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
        <form v-show="activeTab === 'profile'" @submit.prevent="handleUpdateProfile" class="space-y-4">
          <!-- Username (Readonly) -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Tên tài khoản (Username)</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                :value="authStore.user?.username"
                disabled
                class="input input-sm w-full pl-9 bg-[#051321] border-[#1d3b5a] text-[#5f7e97] font-mono cursor-not-allowed select-none"
              />
            </div>
            <span class="text-[10px] text-[#5f7e97] mt-1">Tên đăng nhập do Quản trị viên khởi tạo và không thể tự thay đổi.</span>
          </div>

          <!-- Full name -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Tên hiển thị (Họ và tên) *</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                v-model="profileForm.fullName"
                type="text"
                placeholder="Nhập tên hiển thị của bạn"
                maxlength="100"
                class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
            <span v-if="profileErrors.fullName" class="text-[10px] text-[#ef5350] mt-1">{{ profileErrors.fullName }}</span>
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Địa chỉ Email</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="profileForm.email"
                type="email"
                placeholder="Nhập email liên hệ (VD: user@company.com)"
                maxlength="150"
                class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
            <span v-if="profileErrors.email" class="text-[10px] text-[#ef5350] mt-1">{{ profileErrors.email }}</span>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#1d3b5a]/60">
            <button
              type="button"
              class="btn btn-sm btn-ghost border border-[#1d3b5a] text-[#5f7e97] hover:text-[#d6deeb] hover:bg-[#0b2942]"
              @click="handleClose"
            >
              Đóng
            </button>
            <button
              type="submit"
              :disabled="submittingProfile"
              class="btn btn-sm bg-[#00f0ff] hover:bg-[#00d2e0] text-[#011627] font-bold border-none shadow-[0_0_12px_rgba(0,240,255,0.35)]"
            >
              <span v-if="submittingProfile" class="loading loading-spinner loading-xs mr-1"></span>
              Lưu thay đổi
            </button>
          </div>
        </form>

        <!-- TAB 2: ĐỔI MẬT KHẨU -->
        <form v-show="activeTab === 'password'" @submit.prevent="handleChangePassword" class="space-y-4">
          <!-- Password security tip -->
          <div class="p-3 bg-[#0b2942]/60 border border-[#1d3b5a] rounded-lg flex items-start gap-2.5">
            <span class="text-[#ecc48d] mt-0.5">ℹ</span>
            <div class="text-[11px] text-[#ecc48d]/90 leading-relaxed">
              Mật khẩu mới yêu cầu tối thiểu 6 ký tự. Sau khi đổi mật khẩu thành công, phiên làm việc hiện tại tiếp tục được duy trì.
            </div>
          </div>

          <!-- Current Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Mật khẩu hiện tại *</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
            <span v-if="passwordErrors.currentPassword" class="text-[10px] text-[#ef5350] mt-1">{{ passwordErrors.currentPassword }}</span>
          </div>

          <!-- New Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Mật khẩu mới *</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
            <span v-if="passwordErrors.newPassword" class="text-[10px] text-[#ef5350] mt-1">{{ passwordErrors.newPassword }}</span>
          </div>

          <!-- Confirm Password -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-[11px] font-mono uppercase text-[#7fdbca]">Xác nhận mật khẩu mới *</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5f7e97]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                class="input input-sm w-full pl-9 bg-[#011627] border-[#1d3b5a] text-[#d6deeb] font-mono focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
            <span v-if="passwordErrors.confirmPassword" class="text-[10px] text-[#ef5350] mt-1">{{ passwordErrors.confirmPassword }}</span>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#1d3b5a]/60">
            <button
              type="button"
              class="btn btn-sm btn-ghost border border-[#1d3b5a] text-[#5f7e97] hover:text-[#d6deeb] hover:bg-[#0b2942]"
              @click="handleClose"
            >
              Đóng
            </button>
            <button
              type="submit"
              :disabled="submittingPassword"
              class="btn btn-sm bg-[#00f0ff] hover:bg-[#00d2e0] text-[#011627] font-bold border-none shadow-[0_0_12px_rgba(0,240,255,0.35)]"
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

// Reset / Init values when opening
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
