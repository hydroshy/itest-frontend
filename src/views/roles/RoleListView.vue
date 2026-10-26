<template>
  <div class="roles-management-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Quản lý Phân quyền & Vai trò</h2>
        <p class="page-subtitle">Thiết lập nhóm quyền hạn, vai trò và phạm vi thao tác của người dùng trong hệ thống</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        Thêm vai trò mới
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="roles" v-loading="loading" style="width: 100%" empty-text="Không có vai trò nào">
        <el-table-column prop="code" label="Mã vai trò" width="160">
          <template #default="{ row }">
            <el-tag effect="plain" type="primary">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Tên vai trò" min-width="180">
          <template #default="{ row }">
            <span class="role-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Mô tả" min-width="220" />
        <el-table-column label="Thao tác" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btn-group">
              <el-button
                type="primary"
                size="small"
                class="action-btn wizard-btn"
                @click="openWizard(row)"
              >
                Phân quyền
              </el-button>
              <el-button
                type="info"
                size="small"
                class="action-btn edit-btn"
                :icon="Edit"
                @click="openEditDialog(row)"
              >
                Sửa
              </el-button>
              <el-button
                v-if="row.code !== 'admin'"
                type="danger"
                size="small"
                class="action-btn delete-btn"
                :icon="Delete"
                @click="deleteRole(row)"
              >
                Xóa
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog Thêm/Sửa vai trò -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Chỉnh sửa Vai trò' : 'Thêm Vai trò mới'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="Mã vai trò" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="vd: operator, technician" />
        </el-form-item>
        <el-form-item label="Tên vai trò" prop="name">
          <el-input v-model="form.name" placeholder="vd: Kỹ thuật viên vận hành" />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Mô tả trách nhiệm của vai trò" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? 'Lưu thay đổi' : 'Tạo mới' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Role Wizard Dialog 3 bước -->
    <RoleWizardDialog
      v-model="wizardVisible"
      :role="selectedRoleForWizard"
      @saved="loadRoles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { httpClient } from '@/api/client';
import RoleWizardDialog, { type RoleData } from './RoleWizardDialog.vue';

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module?: string;
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
const availablePermissions = ref<PermissionItem[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');
const formRef = ref<FormInstance>();

const wizardVisible = ref(false);
const selectedRoleForWizard = ref<RoleData | null>(null);

const form = reactive({
  code: '',
  name: '',
  description: '',
});

const formRules: FormRules = {
  code: [{ required: true, message: 'Vui lòng nhập mã vai trò', trigger: 'blur' }],
  name: [{ required: true, message: 'Vui lòng nhập tên vai trò', trigger: 'blur' }],
};

async function loadPermissions() {
  try {
    const res: any = await httpClient.get('/roles/permissions');
    availablePermissions.value = Array.isArray(res) ? res : (res?.data || []);
  } catch {
    availablePermissions.value = [];
  }
}

async function loadRoles() {
  loading.value = true;
  try {
    const res: any = await httpClient.get('/roles');
    roles.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (err: any) {
    ElMessage.error(err?.message || 'Không thể tải danh sách vai trò.');
  } finally {
    loading.value = false;
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
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
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
  });
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

<style scoped>
.roles-management-container {
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
  color: var(--cyber-text-primary, #e2e8f0);
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--cyber-text-secondary, #94a3b8);
  margin: 0;
}

.table-card {
  border-radius: 8px;
  background: var(--cyber-card-bg, #0b1329) !important;
  border: 1px solid var(--cyber-border-color, #1e293b) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
}

.role-name {
  font-weight: 600;
  color: var(--cyber-cyan-neon, #00f0ff) !important;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.25);
  font-family: var(--font-family-mono, monospace);
}

.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.text-muted {
  font-size: 12px;
  color: var(--cyber-text-secondary, #64748b);
}

/* Dark mode table deep enhancements */
:deep(.el-table) {
  --el-table-bg-color: transparent !important;
  --el-table-tr-bg-color: transparent !important;
  --el-table-header-bg-color: rgba(15, 23, 42, 0.75) !important;
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.06) !important;
  --el-table-border-color: var(--cyber-border-color, #1e293b) !important;
  --el-table-text-color: var(--cyber-text-primary, #e2e8f0) !important;
  --el-table-header-text-color: var(--cyber-cyan-neon, #00f0ff) !important;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(15, 23, 42, 0.85) !important;
  color: var(--cyber-cyan-neon, #00f0ff) !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--cyber-border-color, #1e293b) !important;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(30, 41, 59, 0.6) !important;
  color: var(--cyber-text-primary, #e2e8f0) !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(0, 240, 255, 0.08) !important;
}

:deep(.el-card__body) {
  padding: 16px 20px;
}

.action-btn-group {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  font-weight: 600;
  font-size: 12px;
  border-radius: 4px;
  padding: 5px 10px;
  transition: all 0.2s ease;
}

.wizard-btn {
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.12) !important;
}

.wizard-btn:hover {
  background: #38bdf8 !important;
  color: #0f172a !important;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.edit-btn {
  border-color: #64748b !important;
  color: #cbd5e1 !important;
  background: rgba(100, 116, 139, 0.15) !important;
}

.edit-btn:hover {
  background: #475569 !important;
  color: #ffffff !important;
}

.delete-btn {
  border-color: #f43f5e !important;
  color: #f43f5e !important;
  background: rgba(244, 63, 94, 0.12) !important;
}

.delete-btn:hover {
  background: #f43f5e !important;
  color: #ffffff !important;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
}
</style>
