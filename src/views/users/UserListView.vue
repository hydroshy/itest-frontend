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
              <th class="py-3.5 px-4 min-w-[170px]">Vai trò (Roles)</th>
              <th class="text-center py-3.5 px-4">Trạng thái</th>
              <th class="py-3.5 px-4">Ngày tạo</th>
              <th class="text-center py-3.5 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10">
                <span class="loading loading-spinner text-blue-500"></span>
                <p class="text-xs text-[var(--owl-text-muted)] mt-2">Đang tải danh sách người dùng...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="7" class="text-center py-10 text-[var(--owl-text-muted)]">
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
              <td class="py-3 px-4">
                <div v-if="row.roles && row.roles.length > 0" class="flex flex-wrap items-center gap-1.5">
                  <button
                    v-for="role in row.roles"
                    :key="role.id"
                    type="button"
                    class="badge badge-sm font-mono font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                    :title="`Xem chi tiết quyền của ${role.name || role.code}`"
                    @click="openPermissionsModal(row)"
                  >
                    {{ role.name || role.code }}
                  </button>
                </div>
                <span v-else class="text-[var(--owl-text-muted)] italic text-[11px]">Chưa gán vai trò</span>
              </td>
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
                    title="Xem chi tiết phân quyền & menu view"
                    @click="openPermissionsModal(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
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

          <div>
            <label class="block text-[var(--owl-text-secondary)] font-medium mb-1.5">Gán Vai trò (Roles)</label>
            <div v-if="availableRoles.length === 0" class="text-xs text-[var(--owl-text-muted)] italic py-2">
              Chưa có vai trò nào trong hệ thống.
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl max-h-36 overflow-y-auto">
              <label
                v-for="role in availableRoles"
                :key="role.id"
                class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs select-none transition-colors"
                :class="{ 'bg-blue-600/10 border border-blue-500/30': form.roleIds.includes(role.id) }"
              >
                <input
                  type="checkbox"
                  :value="role.id"
                  v-model="form.roleIds"
                  class="checkbox checkbox-xs checkbox-primary"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-[var(--owl-text-primary)] truncate">{{ role.name || role.code }}</div>
                  <div class="font-mono text-[10px] text-[var(--owl-text-muted)]">{{ role.code }}</div>
                </div>
              </label>
            </div>
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

    <!-- User Permissions & Menu Views Detail Modal -->
    <Transition name="modal-fade">
      <div v-if="permissionsModalVisible && selectedUser" class="modal modal-open fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="relative z-10 modal-box bg-[var(--owl-bg-surface)] border border-[var(--owl-border)] shadow-xl rounded-3xl max-w-2xl text-[var(--owl-text-primary)] max-h-[85vh] flex flex-col p-6">
          <div class="flex items-center justify-between pb-3 border-b border-[var(--owl-border)] flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 class="font-bold text-base text-[var(--owl-text-primary)]">
                  Chi tiết Phân quyền &amp; Menu View
                </h3>
              </div>
              <p class="text-xs text-[var(--owl-text-secondary)] mt-0.5">
                Tài khoản: <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ selectedUser.username }}</span>
                <span v-if="selectedUser.fullName"> ({{ selectedUser.fullName }})</span>
              </p>
            </div>
            <button class="btn btn-sm btn-circle btn-ghost text-[var(--owl-text-muted)] hover:text-[var(--owl-text-primary)] rounded-xl" @click="permissionsModalVisible = false">✕</button>
          </div>

          <div class="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
            <!-- 1. Assigned Roles -->
            <div>
              <span class="font-bold uppercase tracking-wider text-[11px] text-[var(--owl-text-secondary)]">1. Vai trò đang gán (Roles)</span>
              <div v-if="!selectedUser.roles || selectedUser.roles.length === 0" class="p-3 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl text-[var(--owl-text-muted)] italic mt-1.5">
                Tài khoản này chưa được gán bất kỳ vai trò nào.
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                <div
                  v-for="role in selectedUser.roles"
                  :key="role.id"
                  class="p-2.5 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div class="font-bold text-[var(--owl-text-primary)]">{{ role.name || role.code }}</div>
                    <div class="font-mono text-[10px] text-[var(--owl-text-muted)]">{{ role.code }}</div>
                  </div>
                  <span class="badge badge-sm font-mono bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Gán hoạt động
                  </span>
                </div>
              </div>
            </div>

            <!-- 2. Functional Permissions Granted -->
            <div>
              <div class="flex items-center justify-between">
                <span class="font-bold uppercase tracking-wider text-[11px] text-[var(--owl-text-secondary)]">2. Quyền chức năng API (Permissions)</span>
                <span class="font-mono text-[10px] text-blue-500 font-bold">
                  {{ userFlattenedPermissions.length }} quyền được cấp
                </span>
              </div>
              <div v-if="userFlattenedPermissions.length === 0" class="p-3 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl text-[var(--owl-text-muted)] italic mt-1.5">
                Không có quyền chức năng cụ thể nào được gán trực tiếp.
              </div>
              <div v-else class="max-h-48 overflow-y-auto p-2 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl mt-1.5 space-y-1.5">
                <div
                  v-for="perm in userFlattenedPermissions"
                  :key="perm.id || perm.code"
                  class="flex items-center justify-between p-2 rounded-lg bg-[var(--owl-bg-surface)] border border-[var(--owl-border)]"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ perm.code || perm.name }}</span>
                    <span v-if="perm.module" class="badge badge-xs font-mono bg-black/5 dark:bg-white/5 text-[var(--owl-text-muted)]">{{ perm.module }}</span>
                  </div>
                  <span class="text-[11px] text-[var(--owl-text-secondary)] truncate max-w-[280px]">
                    {{ perm.description || perm.name || '—' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Accessible Menu Views -->
            <div>
              <div class="flex items-center justify-between">
                <span class="font-bold uppercase tracking-wider text-[11px] text-[var(--owl-text-secondary)]">3. Thẻ Menu Views được phép đọc / hiển thị</span>
                <span class="font-mono text-[10px] text-emerald-500 font-bold">
                  {{ userAccessibleMenus.length }} view khả dụng
                </span>
              </div>
              <div v-if="userAccessibleMenus.length === 0" class="p-3 bg-[var(--owl-bg-card)] border border-[var(--owl-border)] rounded-xl text-[var(--owl-text-muted)] italic mt-1.5">
                Chưa có thẻ Menu nào được gán cho vai trò của người dùng này.
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 max-h-48 overflow-y-auto p-1">
                <div
                  v-for="menu in userAccessibleMenus"
                  :key="menu.id"
                  class="p-2.5 bg-[var(--owl-bg-card)] border border-emerald-500/30 rounded-xl flex items-center gap-2.5"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-[var(--owl-text-primary)] truncate">{{ menu.title }}</div>
                    <div class="font-mono text-[10px] text-[var(--owl-text-muted)] truncate">{{ menu.route || menu.path || '—' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-action pt-3 border-t border-[var(--owl-border)] flex-shrink-0">
            <button type="button" class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl border-none px-4" @click="permissionsModalVisible = false">
              Đóng
            </button>
          </div>
        </div>
        <div class="modal-backdrop" @click.stop.prevent="permissionsModalVisible = false"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { cyberToast } from '@/services/cyberToast';
import { cyberConfirm } from '@/services/cyberConfirm';
import { httpClient } from '@/api/client';

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module?: string;
  description?: string;
}

interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: PermissionItem[];
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

interface MenuItem {
  id: string;
  title: string;
  route?: string;
  path?: string;
  icon?: string;
  pluginId?: string;
  category?: string;
}

const loading = ref(false);
const submitting = ref(false);
const users = ref<UserItem[]>([]);
const availableRoles = ref<RoleItem[]>([]);
const allMenuItems = ref<MenuItem[]>([]);
const roleMenuAssignments = ref<Record<string, string[]>>({});

const filters = reactive({
  keyword: '',
  status: undefined as boolean | undefined,
});

const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');

const permissionsModalVisible = ref(false);
const selectedUser = ref<UserItem | null>(null);

const form = reactive({
  username: '',
  fullName: '',
  email: '',
  password: '',
  isActive: true,
  roleIds: [] as string[],
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
      const matchRole = (user.roles || []).some(
        (r) => r.name?.toLowerCase().includes(kw) || r.code?.toLowerCase().includes(kw)
      );
      return matchName || matchFullName || matchEmail || matchRole;
    }
    return true;
  });
});

const userFlattenedPermissions = computed(() => {
  if (!selectedUser.value || !selectedUser.value.roles) return [];
  const map = new Map<string, PermissionItem>();
  for (const role of selectedUser.value.roles) {
    if (Array.isArray(role.permissions)) {
      for (const p of role.permissions) {
        const key = p.code || p.id || p.name;
        if (key && !map.has(key)) {
          map.set(key, p);
        }
      }
    }
  }
  return Array.from(map.values());
});

const userAccessibleMenus = computed(() => {
  if (!selectedUser.value || !selectedUser.value.roles) return [];
  const userRoleCodes = selectedUser.value.roles.map((r) => (r.code || '').toUpperCase());

  // Check if admin / super admin
  const isAdmin = userRoleCodes.some((code) => ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(code));
  if (isAdmin) {
    return allMenuItems.value;
  }

  const allowedMenuIds = new Set<string>();
  for (const code of userRoleCodes) {
    const assigned = roleMenuAssignments.value[code] || [];
    for (const id of assigned) {
      allowedMenuIds.add(id);
    }
  }

  return allMenuItems.value.filter((m) => allowedMenuIds.has(m.id));
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
  } catch (err) {
    console.warn('Không thể tải danh sách vai trò:', err);
  }
}

async function loadMenuData() {
  try {
    const [mRes, aRes]: [any, any] = await Promise.all([
      httpClient.get('/menu'),
      httpClient.get('/menu/admin/role-assignments'),
    ]);
    const mList = Array.isArray(mRes) ? mRes : (mRes?.data || mRes?.items || []);
    allMenuItems.value = mList;
    roleMenuAssignments.value = aRes?.data || aRes || {};
  } catch (e) {
    console.warn('Không thể tải dữ liệu menu RBAC:', e);
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
  form.roleIds = [];
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
  form.roleIds = (row.roles || []).map((r) => r.id);
  dialogVisible.value = true;
}

function openPermissionsModal(row: UserItem) {
  selectedUser.value = row;
  permissionsModalVisible.value = true;
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
        roleIds: form.roleIds,
      });
      cyberToast.success('Cập nhật người dùng thành công.');
    } else {
      await httpClient.post('/users', {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        isActive: form.isActive,
        roleIds: form.roleIds,
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
  loadMenuData();
});
</script>
