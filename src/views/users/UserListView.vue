<template>
  <div class="user-management-container p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[var(--owl-border)]">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 shadow-none"></span>
          <h2 class="text-xl font-bold tracking-tight text-[var(--owl-text-primary)]">Quản lý Người dùng</h2>
        </div>
        <p class="text-xs text-[var(--owl-text-secondary)] mt-1">Quản lý tài khoản truy cập và trạng thái kích hoạt hệ thống</p>
      </div>
      <button class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold border-none rounded-xl shadow-none px-4" @click="openCreateDialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm người dùng
      </button>
    </div>

    <!-- Filters Section -->
    <div class="card bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] shadow-none rounded-2xl p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
          <span class="text-xs font-medium text-[var(--owl-text-secondary)]">Tìm kiếm:</span>
          <div class="relative flex-1">
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tên đăng nhập, email..."
              class="input input-sm w-full bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] placeholder-[var(--owl-text-muted)] rounded-xl focus:border-blue-500 focus:outline-none text-xs pl-8 transition-colors"
              @keyup.enter="loadUsers"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-2.5 top-2 text-[var(--owl-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-[var(--owl-text-secondary)]">Trạng thái:</span>
          <select v-model="filters.status" class="select select-sm bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] rounded-xl focus:border-blue-500 text-xs">
            <option :value="undefined">Tất cả</option>
            <option :value="true">Hoạt động</option>
            <option :value="false">Khóa</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-sm bg-[var(--owl-bg-card)] hover:bg-[var(--owl-bg-card-hover)] text-[var(--owl-text-primary)] border border-[var(--owl-border)] rounded-xl px-4 transition-colors" @click="loadUsers">
            Tìm kiếm
          </button>
          <button class="btn btn-sm btn-ghost text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] rounded-xl" @click="resetFilters">
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- User Table -->
    <div class="card bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] shadow-none rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full text-xs">
          <thead>
            <tr class="bg-[var(--owl-bg-aside)] border-b border-[var(--owl-border)] text-[var(--owl-text-secondary)] font-medium">
              <th class="py-3.5 px-4">Tên đăng nhập</th>
              <th class="py-3.5 px-4">Họ và tên</th>
              <th class="py-3.5 px-4">Email</th>
              <th class="text-center py-3.5 px-4">Trạng thái</th>
              <th class="py-3.5 px-4">Ngày tạo</th>
              <th class="text-center py-3.5 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10">
                <span class="loading loading-spinner text-blue-500"></span>
                <p class="text-xs text-[var(--owl-text-muted)] mt-2">Đang tải danh sách người dùng...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="text-center py-10 text-[var(--owl-text-muted)]">
                Không tìm thấy người dùng nào phù hợp
              </td>
            </tr>
            <tr
              v-else
              v-for="row in filteredUsers"
              :key="row.id"
              class="border-b border-[var(--owl-border-light)] hover:bg-[var(--owl-bg-card-hover)] transition-colors"
            >
              <td class="py-3 px-4">
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ row.username }}</span>
              </td>
              <td class="text-[var(--owl-text-primary)] font-medium py-3 px-4">{{ row.fullName || '—' }}</td>
              <td class="text-[var(--owl-text-secondary)] py-3 px-4">{{ row.email || '—' }}</td>
              <td class="text-center py-3 px-4">
                <span
                  class="badge badge-sm font-medium rounded-lg"
                  :class="row.isActive ? 'badge-success text-white' : 'badge-ghost text-[var(--owl-text-muted)]'"
                >
                  {{ row.isActive ? 'Hoạt động' : 'Khóa' }}
                </span>
              </td>
              <td class="text-[var(--owl-text-muted)] py-3 px-4">{{ formatDate(row.createdAt) }}</td>
              <td class="text-center py-3 px-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="btn btn-xs btn-ghost text-[var(--owl-text-muted)] hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                    title="Chỉnh sửa"
                    @click="openEditDialog(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-xs btn-ghost rounded-lg"
                    :class="row.isActive ? 'text-[var(--owl-text-muted)] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5' : 'text-[var(--owl-text-muted)] hover:text-emerald-500 hover:bg-black/5 dark:hover:bg-white/5'"
                    :title="row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                    @click="toggleUserStatus(row)"
                  >
                    <svg v-if="row.isActive" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-xs btn-ghost text-[var(--owl-text-muted)] hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                    title="Xóa tài khoản"
                    @click="deleteUser(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit User Modal -->
    <Transition name="modal-fade">
      <div v-if="dialogVisible" class="modal modal-open fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="relative z-10 modal-box bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] shadow-xl rounded-3xl max-w-lg text-[var(--owl-text-primary)]">
        <div class="flex items-center justify-between pb-3 border-b border-[var(--owl-border)]">
          <h3 class="font-bold text-base text-[var(--owl-text-primary)]">
            {{ isEdit ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới' }}
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] rounded-xl" @click="dialogVisible = false">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="py-4 space-y-4 text-xs font-sans">
          <div>
            <label class="block text-[var(--owl-text-secondary)] font-medium mb-1.5">Tên đăng nhập <span class="text-rose-500">*</span></label>
            <input
              v-model="form.username"
              type="text"
              :disabled="isEdit"
              placeholder="Nhập tên đăng nhập"
              class="input input-sm w-full bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] rounded-xl focus:border-blue-500 focus:outline-none disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label class="block text-[var(--owl-text-secondary)] font-medium mb-1.5">Họ và tên</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              class="input input-sm w-full bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[var(--owl-text-secondary)] font-medium mb-1.5">Email <span class="text-rose-500">*</span></label>
            <input
              v-model="form.email"
              type="email"
              placeholder="user@example.com"
              class="input input-sm w-full bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div v-if="!isEdit">
            <label class="block text-[var(--owl-text-secondary)] font-medium mb-1.5">Mật khẩu <span class="text-rose-500">*</span></label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              class="input input-sm w-full bg-[var(--owl-bg-card)] border border-[var(--owl-border)] text-[var(--owl-text-primary)] rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-[var(--owl-text-secondary)] font-medium">Kích hoạt tài khoản</span>
            <input
              type="checkbox"
              v-model="form.isActive"
              class="toggle toggle-sm toggle-success bg-[var(--owl-bg-card)] border-[var(--owl-border)]"
            />
          </div>

          <div class="modal-action pt-4 border-t border-[var(--owl-border)]">
            <button type="button" class="btn btn-sm btn-ghost text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] rounded-xl" @click="dialogVisible = false">Hủy</button>
            <button
              type="submit"
              class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl border-none px-4 shadow-none"
              :disabled="submitting"
            >
              <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
              {{ isEdit ? 'Lưu thay đổi' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
        <div class="modal-backdrop" @click.stop.prevent></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { cyberToast } from '@/services/cyberToast';
import { cyberConfirm } from '@/services/cyberConfirm';
import { httpClient } from '@/api/client';

interface RoleItem {
  id: string;
  code: string;
  name: string;
}

interface UserItem {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  isActive: boolean;
  roles?: RoleItem[];
  createdAt?: string;
}

const loading = ref(false);
const submitting = ref(false);
const users = ref<UserItem[]>([]);

const filters = reactive({
  keyword: '',
  status: undefined as boolean | undefined,
});

const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');

const form = reactive({
  username: '',
  fullName: '',
  email: '',
  password: '',
  isActive: true,
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    if (filters.status !== undefined && user.isActive !== filters.status) {
      return false;
    }
    if (filters.keyword.trim()) {
      const kw = filters.keyword.toLowerCase().trim();
      const matchName = user.username.toLowerCase().includes(kw);
      const matchFullName = user.fullName?.toLowerCase().includes(kw) || false;
      const matchEmail = user.email?.toLowerCase().includes(kw) || false;
      return matchName || matchFullName || matchEmail;
    }
    return true;
  });
});

function formatDate(isoStr?: string): string {
  if (!isoStr) return '--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

async function loadUsers() {
  loading.value = true;
  try {
    const res = await httpClient.get<UserItem[]>('/users');
    users.value = Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (err: any) {
    cyberToast.error(err?.message || 'Không thể tải danh sách người dùng.');
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.status = undefined;
  loadUsers();
}

function openCreateDialog() {
  isEdit.value = false;
  editId.value = '';
  form.username = '';
  form.fullName = '';
  form.email = '';
  form.password = '';
  form.isActive = true;
  dialogVisible.value = true;
}

function openEditDialog(row: UserItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.username = row.username;
  form.fullName = row.fullName || '';
  form.email = row.email || '';
  form.password = '';
  form.isActive = row.isActive;
  dialogVisible.value = true;
}

async function submitForm() {
  if (!form.username || !form.email || (!isEdit.value && !form.password)) {
    cyberToast.warning('Vui lòng điền đầy đủ các thông tin bắt buộc.');
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value) {
      await httpClient.patch(`/users/${editId.value}`, {
        fullName: form.fullName,
        email: form.email,
        isActive: form.isActive,
      });
      cyberToast.success('Cập nhật người dùng thành công.');
    } else {
      await httpClient.post('/users', {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        isActive: form.isActive,
      });
      cyberToast.success('Tạo người dùng mới thành công.');
    }
    dialogVisible.value = false;
    await loadUsers();
  } catch (err: any) {
    cyberToast.error(err?.message || 'Thao tác không thành công.');
  } finally {
    submitting.value = false;
  }
}

async function toggleUserStatus(row: UserItem) {
  try {
    const targetStatus = !row.isActive;
    await httpClient.patch(`/users/${row.id}`, { isActive: targetStatus });
    cyberToast.success(`Đã ${targetStatus ? 'kích hoạt' : 'khóa'} tài khoản ${row.username}.`);
    await loadUsers();
  } catch (err: any) {
    cyberToast.error(err?.message || 'Không thể đổi trạng thái người dùng.');
  }
}

function deleteUser(row: UserItem) {
  cyberConfirm.confirm(
    `Bạn có chắc chắn muốn xóa tài khoản "${row.username}" không?`,
    'Xác nhận xóa tài khoản',
    {
      confirmButtonText: 'Xóa vĩnh viễn',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await httpClient.delete(`/users/${row.id}`);
        cyberToast.success(`Đã xóa người dùng ${row.username}.`);
        await loadUsers();
      } catch (err: any) {
        cyberToast.error(err?.message || 'Không thể xóa người dùng.');
      }
    })
    .catch(() => {});
}

onMounted(() => {
  loadUsers();
});
</script>
