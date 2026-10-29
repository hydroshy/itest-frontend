<template>
  <div class="user-management-container p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1d3b5a]/60">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#7fdbca] shadow-[0_0_8px_#7fdbca]"></span>
          <h2 class="text-xl font-bold tracking-wide text-[#d6deeb] uppercase font-mono">Quản lý Người dùng</h2>
        </div>
        <p class="text-xs text-[#5f7e97] mt-1">Quản lý tài khoản truy cập, phân bổ vai trò và trạng thái kích hoạt hệ thống</p>
      </div>
      <button class="btn btn-sm bg-[#7fdbca] hover:bg-[#68cbb9] text-[#011627] font-semibold border-none shadow-[0_0_12px_rgba(127,219,202,0.35)]" @click="openCreateDialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm người dùng
      </button>
    </div>

    <!-- Filters Section (daisyUI Card) -->
    <div class="card bg-[#081d32]/90 border border-[#1d3b5a] shadow-lg rounded-lg p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
          <span class="text-xs font-mono text-[#7fdbca] uppercase">Tìm kiếm:</span>
          <div class="relative flex-1">
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tên đăng nhập, email..."
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none font-mono text-xs pl-8"
              @keyup.enter="loadUsers"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-2.5 top-2 text-[#5f7e97]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-[#7fdbca] uppercase">Trạng thái:</span>
          <select v-model="filters.status" class="select select-sm bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] text-xs">
            <option :value="undefined">Tất cả</option>
            <option :value="true">Hoạt động</option>
            <option :value="false">Khóa</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-outline border-[#7fdbca] text-[#7fdbca] hover:bg-[#7fdbca] hover:text-[#011627]" @click="loadUsers">
            Tìm kiếm
          </button>
          <button class="btn btn-sm btn-ghost text-[#5f7e97] hover:text-[#d6deeb]" @click="resetFilters">
            Đặt lại
          </button>
        </div>
      </div>
    </div>

    <!-- User Table (daisyUI Cyber HUD Table) -->
    <div class="card bg-[#081d32]/95 border border-[#1d3b5a] shadow-xl rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-xs">
          <thead>
            <tr class="bg-[#0b2942]/80 border-b border-[#1d3b5a] text-[#7fdbca] font-mono uppercase tracking-wider">
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
                <span class="loading loading-spinner text-[#7fdbca]"></span>
                <p class="text-xs text-[#5f7e97] mt-2 font-mono">Đang tải danh sách người dùng...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="7" class="text-center py-10 text-[#5f7e97] font-mono">
                Không tìm thấy người dùng nào phù hợp
              </td>
            </tr>
            <tr
              v-else
              v-for="row in filteredUsers"
              :key="row.id"
              class="border-b border-[#1d3b5a]/40 hover:bg-[#0b2942]/40 transition-colors"
            >
              <td>
                <span class="font-mono font-bold text-[#00f0ff]">{{ row.username }}</span>
              </td>
              <td class="text-[#d6deeb]">{{ row.fullName || '—' }}</td>
              <td class="font-mono text-[#d6deeb]/90">{{ row.email || '—' }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="r in row.roles"
                    :key="r.id"
                    class="badge badge-sm bg-[#0b2942] border border-[#1d3b5a] text-[#ecc48d] font-mono text-[10px]"
                  >
                    {{ r.name }}
                  </span>
                  <span v-if="!row.roles || row.roles.length === 0" class="text-[#5f7e97] text-[11px]">Chưa gán</span>
                </div>
              </td>
              <td class="text-center">
                <span
                  class="badge badge-sm font-mono font-medium"
                  :class="row.isActive ? 'badge-success text-[#011627] bg-[#22da6e]' : 'badge-error text-[#d6deeb] bg-[#ef5350]/30 border border-[#ef5350]'"
                >
                  {{ row.isActive ? 'Hoạt động' : 'Khóa' }}
                </span>
              </td>
              <td class="font-mono text-[#5f7e97]">{{ formatDate(row.createdAt) }}</td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="btn btn-xs btn-ghost text-[#7fdbca] hover:bg-[#7fdbca]/20"
                    title="Chỉnh sửa"
                    @click="openEditDialog(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-xs btn-ghost"
                    :class="row.isActive ? 'text-[#ecc48d] hover:bg-[#ecc48d]/20' : 'text-[#22da6e] hover:bg-[#22da6e]/20'"
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
                    class="btn btn-xs btn-ghost text-[#ef5350] hover:bg-[#ef5350]/20"
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

    <!-- Create / Edit User Modal (daisyUI Modal HUD) -->
    <div v-if="dialogVisible" class="modal modal-open">
      <div class="modal-box bg-[#081d32] border border-[#1d3b5a] shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-lg text-[#d6deeb]">
        <div class="flex items-center justify-between pb-3 border-b border-[#1d3b5a]">
          <h3 class="font-mono font-bold text-base text-[#7fdbca] uppercase tracking-wide">
            {{ isEdit ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới' }}
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost text-[#5f7e97] hover:text-[#d6deeb]" @click="dialogVisible = false">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="py-4 space-y-4 text-xs font-mono">
          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Tên đăng nhập <span class="text-[#ef5350]">*</span></label>
            <input
              v-model="form.username"
              type="text"
              :disabled="isEdit"
              placeholder="Nhập tên đăng nhập"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none disabled:bg-[#0b2942]/40"
              required
            />
          </div>

          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Họ và tên</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Email <span class="text-[#ef5350]">*</span></label>
            <input
              v-model="form.email"
              type="email"
              placeholder="user@example.com"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none"
              required
            />
          </div>

          <div v-if="!isEdit">
            <label class="block text-[#5f7e97] uppercase mb-1">Mật khẩu <span class="text-[#ef5350]">*</span></label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Gán vai trò</label>
            <div class="grid grid-cols-2 gap-2 p-2.5 bg-[#011627] border border-[#1d3b5a] rounded max-h-36 overflow-y-auto">
              <label
                v-for="r in availableRoles"
                :key="r.id"
                class="flex items-center gap-2 cursor-pointer hover:text-[#7fdbca]"
              >
                <input
                  type="checkbox"
                  :value="r.id"
                  v-model="form.roleIds"
                  class="checkbox checkbox-xs checkbox-primary border-[#1d3b5a]"
                />
                <span class="text-xs">{{ r.name }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-[#5f7e97] uppercase">Kích hoạt tài khoản</span>
            <input
              type="checkbox"
              v-model="form.isActive"
              class="toggle toggle-sm toggle-success bg-[#011627] border-[#1d3b5a]"
            />
          </div>

          <div class="modal-action pt-4 border-t border-[#1d3b5a]">
            <button type="button" class="btn btn-sm btn-ghost text-[#5f7e97]" @click="dialogVisible = false">Hủy</button>
            <button
              type="submit"
              class="btn btn-sm bg-[#7fdbca] hover:bg-[#68cbb9] text-[#011627] font-semibold border-none"
              :disabled="submitting"
            >
              <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
              {{ isEdit ? 'Lưu thay đổi' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-black/60" @click="dialogVisible = false"></div>
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
