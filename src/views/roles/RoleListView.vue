<template>
  <div class="roles-management-container p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1d3b5a]/60">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#7fdbca] shadow-[0_0_8px_#7fdbca]"></span>
          <h2 class="text-xl font-bold tracking-wide text-[#d6deeb] uppercase font-mono">Quản lý Phân quyền & Vai trò</h2>
        </div>
        <p class="text-xs text-[#5f7e97] mt-1">Thiết lập nhóm quyền hạn, vai trò và phạm vi thao tác của người dùng trong hệ thống</p>
      </div>
      <button class="btn btn-sm bg-[#7fdbca] hover:bg-[#68cbb9] text-[#011627] font-semibold border-none shadow-[0_0_12px_rgba(127,219,202,0.35)]" @click="openCreateDialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm vai trò mới
      </button>
    </div>

    <!-- Table Section (daisyUI Card & Table) -->
    <div class="card bg-[#081d32]/95 border border-[#1d3b5a] shadow-xl rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-xs">
          <thead>
            <tr class="bg-[#0b2942]/80 border-b border-[#1d3b5a] text-[#7fdbca] font-mono uppercase tracking-wider">
              <th class="w-44">Mã vai trò</th>
              <th class="min-w-[180px]">Tên vai trò</th>
              <th class="min-w-[240px]">Mô tả</th>
              <th class="text-center w-72">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-10">
                <span class="loading loading-spinner text-[#7fdbca]"></span>
                <p class="text-xs text-[#5f7e97] mt-2 font-mono">Đang tải danh sách vai trò...</p>
              </td>
            </tr>
            <tr v-else-if="roles.length === 0">
              <td colspan="4" class="text-center py-10 text-[#5f7e97] font-mono">
                Không có vai trò nào trong hệ thống
              </td>
            </tr>
            <tr
              v-else
              v-for="row in roles"
              :key="row.id"
              class="border-b border-[#1d3b5a]/40 hover:bg-[#0b2942]/40 transition-colors"
            >
              <td>
                <span class="badge badge-sm bg-[#011627] border border-[#7fdbca]/50 text-[#7fdbca] font-mono font-bold tracking-wide">
                  {{ row.code }}
                </span>
              </td>
              <td>
                <span class="font-bold text-[#d6deeb]">{{ row.name }}</span>
              </td>
              <td class="text-[#5f7e97]">{{ row.description || '—' }}</td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="btn btn-xs bg-[#0b2942] hover:bg-[#1d3b5a] text-[#7fdbca] border border-[#7fdbca]/40 hover:border-[#7fdbca] font-mono shadow-[0_0_8px_rgba(127,219,202,0.2)]"
                    @click="openWizard(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Phân quyền
                  </button>

                  <button
                    class="btn btn-xs btn-ghost text-[#ecc48d] hover:bg-[#ecc48d]/20"
                    title="Chỉnh sửa vai trò"
                    @click="openEditDialog(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Sửa
                  </button>

                  <button
                    v-if="row.code !== 'admin'"
                    class="btn btn-xs btn-ghost text-[#ef5350] hover:bg-[#ef5350]/20"
                    title="Xóa vai trò"
                    @click="deleteRole(row)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog Thêm/Sửa vai trò (daisyUI Modal HUD) -->
    <div v-if="dialogVisible" class="modal modal-open">
      <div class="modal-box bg-[#081d32] border border-[#1d3b5a] shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-md text-[#d6deeb]">
        <div class="flex items-center justify-between pb-3 border-b border-[#1d3b5a]">
          <h3 class="font-mono font-bold text-base text-[#7fdbca] uppercase tracking-wide">
            {{ isEdit ? 'Chỉnh sửa Vai trò' : 'Thêm Vai trò mới' }}
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost text-[#5f7e97] hover:text-[#d6deeb]" @click="dialogVisible = false">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="py-4 space-y-4 text-xs font-mono">
          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Mã vai trò <span class="text-[#ef5350]">*</span></label>
            <input
              v-model="form.code"
              type="text"
              :disabled="isEdit"
              placeholder="vd: operator, technician"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none disabled:bg-[#0b2942]/40"
              required
            />
          </div>

          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Tên vai trò <span class="text-[#ef5350]">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="vd: Kỹ thuật viên vận hành"
              class="input input-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-[#5f7e97] uppercase mb-1">Mô tả</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Mô tả trách nhiệm của vai trò"
              class="textarea textarea-sm w-full bg-[#011627] border-[#1d3b5a] text-[#d6deeb] focus:border-[#7fdbca] focus:outline-none"
            ></textarea>
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

    <!-- Role Wizard Dialog -->
    <RoleWizardDialog
      v-if="selectedRoleForWizard"
      v-model="wizardVisible"
      :role="selectedRoleForWizard"
      @saved="loadRoles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { httpClient } from '@/api/client';
import RoleWizardDialog from './RoleWizardDialog.vue';

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: PermissionItem[];
}

const loading = ref(false);
const submitting = ref(false);
const roles = ref<RoleItem[]>([]);
const allPermissions = ref<PermissionItem[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');

const form = reactive({
  code: '',
  name: '',
  description: '',
});

const wizardVisible = ref(false);
const selectedRoleForWizard = ref<RoleItem | null>(null);

async function loadRoles() {
  loading.value = true;
  try {
    const res = await httpClient.get<RoleItem[]>('/roles');
    roles.value = Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể tải danh sách vai trò.');
  } finally {
    loading.value = false;
  }
}

async function loadPermissions() {
  try {
    const res = await httpClient.get<PermissionItem[]>('/permissions');
    allPermissions.value = Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (err: any) {
    console.warn('Không tải được danh sách quyền:', err);
  }
}

function openCreateDialog() {
  isEdit.value = false;
  editId.value = '';
  form.code = '';
  form.name = '';
  form.description = '';
  dialogVisible.value = true;
}

function openEditDialog(row: RoleItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.code = row.code;
  form.name = row.name;
  form.description = row.description || '';
  dialogVisible.value = true;
}

function openWizard(row: RoleItem) {
  selectedRoleForWizard.value = {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
  };
  wizardVisible.value = true;
}

async function submitForm() {
  if (!form.name || (!isEdit.value && !form.code)) {
    ElMessage.warning('Vui lòng điền các trường bắt buộc.');
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value) {
      await httpClient.patch(`/roles/${editId.value}`, {
        name: form.name,
        description: form.description,
      });
      ElMessage.success('Cập nhật vai trò thành công.');
    } else {
      await httpClient.post('/roles', {
        code: form.code,
        name: form.name,
        description: form.description,
      });
      ElMessage.success('Tạo vai trò thành công.');
    }
    dialogVisible.value = false;
    await loadRoles();
  } catch (err: any) {
    ElMessage.error(err?.message || 'Thao tác không thành công.');
  } finally {
    submitting.value = false;
  }
}

async function deleteRole(row: RoleItem) {
  try {
    await ElMessageBox.confirm(`Bạn có chắc muốn xóa vai trò "${row.name}" (${row.code})?`, 'Xác nhận xóa', {
      type: 'warning',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    await httpClient.delete(`/roles/${row.id}`);
    ElMessage.success('Xóa vai trò thành công.');
    await loadRoles();
  } catch (action) {
    if (action !== 'cancel') {
      ElMessage.error('Không thể xóa vai trò.');
    }
  }
}

onMounted(async () => {
  await Promise.all([loadPermissions(), loadRoles()]);
});
</script>
