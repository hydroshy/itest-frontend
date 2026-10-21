<template>
  <div class="user-management-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Quản lý Người dùng</h2>
        <p class="page-subtitle">Quản lý tài khoản truy cập, phân bổ vai trò và trạng thái kích hoạt hệ thống</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        Thêm người dùng
      </el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="Tìm kiếm">
          <el-input
            v-model="filters.keyword"
            placeholder="Tên đăng nhập, email..."
            clearable
            :prefix-icon="Search"
            @keyup.enter="loadUsers"
          />
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-select v-model="filters.status" placeholder="Tất cả" clearable style="width: 140px">
            <el-option label="Hoạt động" :value="true" />
            <el-option label="Khóa" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">Tìm kiếm</el-button>
          <el-button @click="resetFilters">Đặt lại</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredUsers" v-loading="loading" style="width: 100%" empty-text="Không có người dùng nào">
        <el-table-column prop="username" label="Tên đăng nhập" min-width="140">
          <template #default="{ row }">
            <span class="font-medium">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fullName" label="Họ và tên" min-width="160" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="roles" label="Vai trò" min-width="180">
          <template #default="{ row }">
            <div class="role-tags">
              <el-tag
                v-for="role in (row.roles || [])"
                :key="role.id || role.code || role"
                size="small"
                type="info"
              >
                {{ role.name || role.code || role }}
              </el-tag>
              <span v-if="!row.roles || row.roles.length === 0" class="text-muted">Chưa gán</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? 'Hoạt động' : 'Đã khóa' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :icon="Edit" @click="openEditDialog(row)">
              Sửa
            </el-button>
            <el-button
              link
              :type="row.isActive ? 'warning' : 'success'"
              size="small"
              :icon="row.isActive ? Lock : Unlock"
              @click="toggleUserStatus(row)"
            >
              {{ row.isActive ? 'Khóa' : 'Mở' }}
            </el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="deleteUser(row)">
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="Tên đăng nhập" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="vd: admin, operator" />
        </el-form-item>
        <el-form-item label="Họ và tên" prop="fullName">
          <el-input v-model="form.fullName" placeholder="Nhập họ và tên đầy đủ" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="example@itest.local" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Mật khẩu" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="Tối thiểu 6 ký tự" />
        </el-form-item>
        <el-form-item label="Vai trò" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="Chọn vai trò gán cho tài khoản" style="width: 100%">
            <el-option
              v-for="r in availableRoles"
              :key="r.id"
              :label="r.name"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Trạng thái" prop="isActive">
          <el-switch v-model="form.isActive" active-text="Hoạt động" inactive-text="Khóa" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? 'Lưu thay đổi' : 'Tạo mới' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Plus, Search, Edit, Delete, Lock, Unlock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
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
const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  fullName: '',
  email: '',
  password: '',
  roleIds: [] as string[],
  isActive: true,
});

const formRules: FormRules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không đúng định dạng', trigger: 'blur' },
  ],
  password: [{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự', trigger: 'blur' }],
};

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    if (filters.status !== undefined && u.isActive !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const matchUsername = u.username.toLowerCase().includes(kw);
      const matchEmail = u.email?.toLowerCase().includes(kw) || false;
      const matchName = u.fullName?.toLowerCase().includes(kw) || false;
      return matchUsername || matchEmail || matchName;
    }
    return true;
  });
});

async function loadRoles() {
  try {
    const res: any = await httpClient.get('/roles');
    availableRoles.value = Array.isArray(res) ? res : (res?.data || []);
  } catch {
    availableRoles.value = [];
  }
}

async function loadUsers() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/users');
    users.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể tải danh sách người dùng.');
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
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (isEdit.value) {
        await httpClient.patch(`/users/${editId.value}`, {
          fullName: form.fullName,
          email: form.email,
          roleIds: form.roleIds,
          isActive: form.isActive,
        });
        ElMessage.success('Cập nhật người dùng thành công.');
      } else {
        await httpClient.post('/users', {
          username: form.username,
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          roleIds: form.roleIds,
          isActive: form.isActive,
        });
        ElMessage.success('Tạo người dùng mới thành công.');
      }
      dialogVisible.value = false;
      await loadUsers();
    } catch (err: any) {
      ElMessage.error(err?.message || 'Thao tác không thành công.');
    } finally {
      submitting.value = false;
    }
  });
}

async function toggleUserStatus(row: UserItem) {
  try {
    const targetStatus = !row.isActive;
    await httpClient.patch(`/users/${row.id}`, { isActive: targetStatus });
    ElMessage.success(`Đã ${targetStatus ? 'kích hoạt' : 'khóa'} tài khoản ${row.username}.`);
    await loadUsers();
  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể thay đổi trạng thái.');
  }
}

async function deleteUser(row: UserItem) {
  try {
    await ElMessageBox.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${row.username}"?`, 'Xác nhận xóa', {
      type: 'warning',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    await httpClient.delete(`/users/${row.id}`);
    ElMessage.success('Xóa người dùng thành công.');
    await loadUsers();
  } catch (action) {
    if (action !== 'cancel') {
      ElMessage.error('Không thể xóa người dùng.');
    }
  }
}

onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()]);
});
</script>

<style scoped>
.user-management-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.filter-card {
  border-radius: 8px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-card {
  border-radius: 8px;
}

.font-medium {
  font-weight: 600;
  color: #1f2937;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.text-muted {
  font-size: 12px;
  color: #9ca3af;
}
</style>
