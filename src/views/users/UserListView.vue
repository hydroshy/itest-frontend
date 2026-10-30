<template>
  <div class="user-management-container p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
          <h2 class="text-xl font-semibold tracking-tight text-white">Quản lý Người dùng</h2>
        </div>
        <p class="text-xs text-slate-400 mt-1">Quản lý tài khoản truy cập, phân bổ vai trò và trạng thái kích hoạt hệ thống</p>
      </div>
      <button class="btn btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium border-none rounded-xl shadow-sm px-4" @click="openCreateDialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm người dùng
      </button>
    </div>

    <!-- Filters Section -->
    <div class="card bg-slate-900/70 border border-slate-800/80 shadow-md rounded-2xl p-4 backdrop-blur-md">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
          <span class="text-xs font-medium text-slate-400">Tìm kiếm:</span>
          <div class="relative flex-1">
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tên đăng nhập, email..."
              class="input input-sm w-full bg-slate-950/70 border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:outline-none text-xs pl-8 transition-colors"
              @keyup.enter="loadUsers"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-2.5 top-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-slate-400">Trạng thái:</span>
          <select v-model="filters.status" class="select select-sm bg-slate-950/70 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 text-xs">
            <option :value="undefined">Tất cả</option>
            <option :value="true">Hoạt động</option>
            <option :value="false">Khóa</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border-none rounded-xl px-4 transition-colors" @click="loadUsers">
            Tìm kiếm
          </button>
          <button class="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-xl" @click="resetFilters">
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- User Table -->
    <div class="card bg-slate-900/70 border border-slate-800/80 shadow-md rounded-2xl overflow-hidden backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="table w-full text-xs">
          <thead>
            <tr class="bg-slate-950/50 border-b border-slate-800 text-slate-400 font-medium">
              <th>Tên đăng nhập</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th class="text-center">Trạng thái</th>
              <th>Ngày tạo</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10">
                <span class="loading loading-spinner text-cyan-400"></span>
                <p class="text-xs text-slate-400 mt-2">Đang tải danh sách người dùng...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="7" class="text-center py-10 text-slate-500">
                Không tìm thấy người dùng nào phù hợp
              </td>
            </tr>
            <tr
              v-else
              v-for="row in filteredUsers"
              :key="row.id"
              class="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
            >
              <td>
                <span class="font-medium text-cyan-400">{{ row.username }}</span>
              </td>
              <td class="text-slate-200">{{ row.fullName || '—' }}</td>
              <td class="text-slate-400">{{ row.email || '—' }}</td>
              <td>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="r in row.roles"
                    :key="r.id"
                    class="badge badge-sm bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded-lg text-[11px]"
                  >
                    {{ r.name }}
                  </span>
                  <span v-if="!row.roles || row.roles.length === 0" class="text-slate-500 text-[11px]">Chưa gán</span>
                </div>
              </td>
              <td class="text-center">
                <span
                  class="badge badge-sm font-medium rounded-lg"
                  :class="row.isActive ? 'badge-success text-emerald-950 bg-emerald-400' : 'badge-error text-rose-300 bg-rose-500/20 border border-rose-500/30'"
                >
                  {{ row.isActive ? 'Hoạt động' : 'Khóa' }}
                </span>
              </td>
              <td class="text-slate-400">{{ formatDate(row.createdAt) }}</td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="btn btn-xs btn-ghost text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                    title="Chỉnh sửa"
                    @click="openEditDialog(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-xs btn-ghost rounded-lg"
                    :class="row.isActive ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'"
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
                    class="btn btn-xs btn-ghost text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
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
    <div v-if="dialogVisible" class="modal modal-open backdrop-blur-md">
      <div class="modal-box bg-slate-900/95 border border-slate-700/60 shadow-2xl rounded-2xl max-w-lg text-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="font-semibold text-base text-white">
            {{ isEdit ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới' }}
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white rounded-xl" @click="dialogVisible = false">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="py-4 space-y-4 text-xs font-sans">
          <div>
            <label class="block text-slate-400 font-medium mb-1.5">Tên đăng nhập <span class="text-rose-400">*</span></label>
            <input
              v-model="form.username"
              type="text"
              :disabled="isEdit"
              placeholder="Nhập tên đăng nhập"
              class="input input-sm w-full bg-slate-950/70 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none disabled:bg-slate-800/40"
              required
            />
          </div>

          <div>
            <label class="block text-slate-400 font-medium mb-1.5">Họ và tên</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              class="input input-sm w-full bg-slate-950/70 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-medium mb-1.5">Email <span class="text-rose-400">*</span></label>
            <input
              v-model="form.email"
              type="email"
              placeholder="user@example.com"
              class="input input-sm w-full bg-slate-950/70 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div v-if="!isEdit">
            <label class="block text-slate-400 font-medium mb-1.5">Mật khẩu <span class="text-rose-400">*</span></label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              class="input input-sm w-full bg-slate-950/70 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-slate-400 font-medium mb-1.5">Gán vai trò</label>
            <div class="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl max-h-36 overflow-y-auto">
              <label
                v-for="r in availableRoles"
                :key="r.id"
                class="flex items-center gap-2 cursor-pointer hover:text-white"
              >
                <input
                  type="checkbox"
                  :value="r.id"
                  v-model="form.roleIds"
                  class="checkbox checkbox-xs checkbox-primary border-slate-700 rounded"
                />
                <span class="text-xs text-slate-300">{{ r.name }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-slate-400 font-medium">Kích hoạt tài khoản</span>
            <input
              type="checkbox"
              v-model="form.isActive"
              class="toggle toggle-sm toggle-success bg-slate-950/80 border-slate-700"
            />
          </div>

          <div class="modal-action pt-4 border-t border-slate-800">
            <button type="button" class="btn btn-sm btn-ghost text-slate-400 hover:text-white rounded-xl" @click="dialogVisible = false">Hủy</button>
            <button
              type="submit"
              class="btn btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-xl border-none px-4"
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
const availableRoles = ref<RoleItem[]>([]);

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
  roleIds: [] as string[],
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

async function loadRoles() {
  try {
    const res = await httpClient.get<RoleItem[]>('/roles');
    availableRoles.value = Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (err: any) {
    console.warn('Không tải được danh sách vai trò:', err);
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
  form.roleIds = [];
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
  form.roleIds = (row.roles || []).map((r) => r.id);
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
        roleIds: form.roleIds,
        isActive: form.isActive,
      });
      cyberToast.success('Cập nhật người dùng thành công.');
    } else {
      await httpClient.post('/users', {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        roleIds: form.roleIds,
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
  loadRoles();
});
</script>
