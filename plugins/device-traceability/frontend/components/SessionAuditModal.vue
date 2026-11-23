<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-5xl bg-base-100 border border-base-300 shadow-2xl p-6 text-base-content max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-base-300">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <font-awesome-icon :icon="['fas', 'microchip']" class="text-lg" />
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight">Bảng MemMap &amp; Chi Tiết Read-Back</h3>
            <p class="text-xs text-base-content/60">
              S/N: <span class="font-mono font-semibold text-base-content">{{ serialNumber || '—' }}</span>
              <span class="mx-2 text-base-content/30">|</span>
              SO: <span class="font-medium text-base-content">{{ soNumber || '—' }}</span>
              <span class="mx-2 text-base-content/30">|</span>
              Item: <span class="font-medium text-base-content">{{ itemCode || '—' }}</span>
            </p>
          </div>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <!-- Quick Stats Banner -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 py-3">
        <div class="bg-base-200/60 border border-base-300 rounded-lg p-2.5">
          <div class="text-[11px] text-base-content/60 font-medium">Trạng thái Cấu hình</div>
          <div class="text-sm font-bold flex items-center gap-1.5 mt-0.5">
            <span
              class="badge badge-sm font-bold"
              :class="isPass ? 'badge-success text-success-content' : (isFail ? 'badge-error text-error-content' : 'badge-ghost')"
            >
              {{ isPass ? 'CONFIG PASS' : (isFail ? 'CONFIG FAIL' : (device?.configStatus || 'NONE')) }}
            </span>
          </div>
        </div>

        <div class="bg-base-200/60 border border-base-300 rounded-lg p-2.5">
          <div class="text-[11px] text-base-content/60 font-medium">Người Cấu Hình</div>
          <div class="text-sm font-semibold truncate mt-0.5" :title="operator">
            {{ operator || '—' }}
          </div>
        </div>

        <div class="bg-base-200/60 border border-base-300 rounded-lg p-2.5">
          <div class="text-[11px] text-base-content/60 font-medium">AppKey (LoRaWAN)</div>
          <div class="text-xs font-mono font-semibold truncate mt-0.5" :title="appKey">
            {{ appKey || '—' }}
          </div>
        </div>

        <div class="bg-base-200/60 border border-base-300 rounded-lg p-2.5">
          <div class="text-[11px] text-base-content/60 font-medium">Thanh Ghi Đọc Lại</div>
          <div class="text-xs font-mono mt-0.5 flex items-center gap-1">
            <span class="font-bold text-base-content">{{ registerList.length }} regs</span>
            <span v-if="passCount > 0" class="badge badge-xs badge-success text-[10px]">{{ passCount }} PASS</span>
            <span v-if="failCount > 0" class="badge badge-xs badge-error text-[10px]">{{ failCount }} FAIL</span>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2">
        <!-- View mode tabs -->
        <div class="join">
          <button
            class="btn btn-xs join-item"
            :class="viewMode === 'memmap' ? 'btn-primary' : 'btn-ghost border-base-300'"
            @click="viewMode = 'memmap'"
          >
            <font-awesome-icon :icon="['fas', 'table']" class="mr-1" />
            Bảng MemMap ({{ filteredRegisters.length }})
          </button>
          <button
            class="btn btn-xs join-item"
            :class="viewMode === 'json' ? 'btn-primary' : 'btn-ghost border-base-300'"
            @click="viewMode = 'json'"
          >
            <font-awesome-icon :icon="['fas', 'code']" class="mr-1" />
            JSON Thô
          </button>
        </div>

        <!-- Filter & Search (only in memmap mode) -->
        <div v-if="viewMode === 'memmap'" class="flex items-center gap-2">
          <!-- Status filter -->
          <div class="join">
            <button
              class="btn btn-xs join-item"
              :class="statusFilter === 'all' ? 'btn-active btn-neutral' : 'btn-ghost border-base-300'"
              @click="statusFilter = 'all'"
            >
              Tất Cả ({{ registerList.length }})
            </button>
            <button
              class="btn btn-xs join-item text-success"
              :class="statusFilter === 'pass' ? 'btn-success text-success-content' : 'btn-ghost border-base-300'"
              @click="statusFilter = 'pass'"
            >
              PASS ({{ passCount }})
            </button>
            <button
              v-if="failCount > 0"
              class="btn btn-xs join-item text-error"
              :class="statusFilter === 'fail' ? 'btn-error text-error-content' : 'btn-ghost border-base-300'"
              @click="statusFilter = 'fail'"
            >
              FAIL ({{ failCount }})
            </button>
          </div>

          <!-- Search input -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm địa chỉ, tên tham số..."
            class="input input-xs input-bordered bg-base-100 w-44"
          />

          <!-- Export CSV -->
          <button
            class="btn btn-xs btn-outline border-base-300 hover:btn-primary"
            title="Xuất bảng MemMap ra CSV"
            :disabled="!registerList.length"
            @click="exportCsv"
          >
            <font-awesome-icon :icon="['fas', 'file-csv']" class="mr-1 text-success" />
            Xuất CSV
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-auto border border-base-300 rounded-lg min-h-[320px] bg-base-200/30">
        <!-- Loading state -->
        <div v-if="loading" class="h-full flex flex-col items-center justify-center p-8 text-base-content/60">
          <span class="loading loading-spinner loading-md text-primary mb-2"></span>
          <span class="text-xs">Đang tải chi tiết MemMap read-back...</span>
        </div>

        <!-- View mode: MemMap Table -->
        <div v-else-if="viewMode === 'memmap'" class="w-full">
          <table v-if="filteredRegisters.length > 0" class="table table-xs table-pin-rows w-full font-sans">
            <thead>
              <tr class="bg-base-300/80 text-base-content text-[11px] font-semibold uppercase tracking-wider">
                <th class="w-16 text-center">Dec</th>
                <th class="w-20 text-center">Hex</th>
                <th class="min-w-[180px]">Tên Tham Số / Chức Năng</th>
                <th class="w-20 text-center">Định Dạng</th>
                <th class="w-28 text-right font-mono">Giá Trị Ghi</th>
                <th class="w-32 text-right font-mono">Đọc Lại (Read-Back)</th>
                <th class="w-20 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(reg, idx) in filteredRegisters"
                :key="reg.address ?? idx"
                class="hover:bg-base-200/80 transition-colors border-b border-base-300/50"
                :class="reg.status === 'FAIL' ? 'bg-error/10' : ''"
              >
                <td class="font-mono text-center text-xs font-semibold text-base-content/80">
                  {{ reg.address }}
                </td>
                <td class="font-mono text-center text-xs text-primary font-medium">
                  {{ reg.modbus_reg_hex || formatHex(reg.address) }}
                </td>
                <td class="text-xs font-medium text-base-content">
                  {{ reg.parameter_name || ('Thanh ghi ' + reg.address) }}
                </td>
                <td class="font-mono text-center text-[11px] text-base-content/70">
                  {{ reg.format || 'HEX' }}
                </td>
                <td class="font-mono text-right text-xs font-medium text-base-content/80">
                  {{ reg.value_to_write !== undefined && reg.value_to_write !== '' ? reg.value_to_write : '—' }}
                </td>
                <td
                  class="font-mono text-right text-xs font-semibold"
                  :class="reg.status === 'FAIL' ? 'text-error' : (reg.value_read_back ? 'text-success' : 'text-base-content/40')"
                >
                  {{ reg.value_read_back !== undefined && reg.value_read_back !== '' ? reg.value_read_back : '—' }}
                </td>
                <td class="text-center">
                  <span
                    class="badge badge-xs font-bold font-mono text-[10px]"
                    :class="reg.status === 'PASS' ? 'badge-success text-success-content' : (reg.status === 'FAIL' ? 'badge-error text-error-content' : 'badge-ghost')"
                  >
                    {{ reg.status || 'NONE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="h-64 flex flex-col items-center justify-center p-8 text-base-content/60">
            <font-awesome-icon :icon="['fas', 'inbox']" class="text-3xl mb-2 opacity-40" />
            <p class="text-xs font-medium">Không tìm thấy thanh ghi nào phù hợp.</p>
            <p v-if="registerList.length === 0" class="text-[11px] text-base-content/40 mt-1">
              Thiết bị chưa có dữ liệu mảng thanh ghi read-back chi tiết hoặc chưa được cấu hình.
            </p>
          </div>
        </div>

        <!-- View mode: Raw JSON -->
        <div v-else class="p-4 font-mono text-xs overflow-auto max-h-[500px]">
          <pre class="whitespace-pre-wrap break-all select-all">{{ JSON.stringify(rawPayload, null, 2) }}</pre>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="modal-action border-t border-base-300 pt-3 mt-3 flex items-center justify-between">
        <div class="text-xs text-base-content/50">
          Session ID: <span class="font-mono font-medium text-base-content/70">{{ sessionId || 'Chưa liên kết' }}</span>
        </div>
        <button class="btn btn-sm btn-ghost border border-base-300" @click="emit('close')">
          Đóng
        </button>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface RegisterItem {
  address: number;
  modbus_reg_hex?: string;
  parameter_name?: string;
  format?: string;
  value_to_write?: string;
  value_read_back?: string;
  status?: string;
  default_value?: string;
}

const props = defineProps<{
  visible: boolean;
  device?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const loading = ref(false);
const viewMode = ref<'memmap' | 'json'>('memmap');
const statusFilter = ref<'all' | 'pass' | 'fail'>('all');
const searchQuery = ref('');
const fetchedLifecycle = ref<any>(null);

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('itest_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatHex = (addr: number | string | undefined): string => {
  if (addr === undefined || addr === null) return '0x0000';
  const num = Number(addr);
  if (isNaN(num)) return String(addr);
  return '0x' + num.toString(16).padStart(4, '0').toUpperCase();
};

// Fetch full device lifecycle if registers are not present in passed props
const loadDetailedLifecycle = async () => {
  const devId = props.device?.id;
  if (!devId) return;

  // Check if we already have registers in device
  const hasRegs =
    props.device?.auditData?.registers?.length ||
    props.device?.testRawData?.final_config_audit?.registers?.length ||
    props.device?.test_raw_data?.final_config_audit?.registers?.length;

  if (hasRegs) return;

  loading.value = true;
  try {
    const res = await fetch(`/api/plugins/device-traceability/devices/${devId}/lifecycle`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      fetchedLifecycle.value = data;
    }
  } catch (err) {
    console.warn('Could not fetch lifecycle for modal:', err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      statusFilter.value = 'all';
      searchQuery.value = '';
      fetchedLifecycle.value = null;
      loadDetailedLifecycle();
    }
  },
  { immediate: true }
);

const serialNumber = computed(() => {
  return props.device?.serialNumber || props.device?.serial_number || props.device?.code || '';
});

const soNumber = computed(() => {
  return (
    props.device?.soNumber ||
    props.device?.so?.so_number ||
    fetchedLifecycle.value?.so?.soNumber ||
    fetchedLifecycle.value?.so?.so_number ||
    ''
  );
});

const itemCode = computed(() => {
  return props.device?.itemCode || props.device?.item_code || fetchedLifecycle.value?.device?.itemCode || '';
});

const appKey = computed(() => {
  return (
    props.device?.appKey ||
    props.device?.app_key ||
    props.device?.testRawData?.app_key ||
    props.device?.test_raw_data?.app_key ||
    props.device?.auditData?.app_key ||
    fetchedLifecycle.value?.device?.appKey ||
    ''
  );
});

const operator = computed(() => {
  return (
    props.device?.configPerson ||
    props.device?.config_person ||
    props.device?.operator ||
    props.device?.auditData?.operator ||
    fetchedLifecycle.value?.device?.configPerson ||
    fetchedLifecycle.value?.device?.operator ||
    ''
  );
});

const sessionId = computed(() => {
  return (
    props.device?.finalConfigSessionId ||
    props.device?.final_config_session_id ||
    fetchedLifecycle.value?.device?.finalConfigSessionId ||
    fetchedLifecycle.value?.finalConfig?.id ||
    ''
  );
});

const isPass = computed(() => {
  const st = (props.device?.configStatus || props.device?.finalConfigStatus || '').toUpperCase();
  return st === 'CONFIGURED_PASS' || st === 'PASS';
});

const isFail = computed(() => {
  const st = (props.device?.configStatus || props.device?.finalConfigStatus || '').toUpperCase();
  return st === 'CONFIG_FAILED' || st === 'FAIL';
});

// Extract register list from all possible sources
const registerList = computed<RegisterItem[]>(() => {
  const d = props.device || {};
  const lf = fetchedLifecycle.value || {};

  // 1. From device auditData
  if (Array.isArray(d.auditData?.registers) && d.auditData.registers.length > 0) {
    return d.auditData.registers;
  }

  // 2. From device testRawData final_config_audit
  const raw = d.testRawData || d.test_raw_data || lf.device?.testRawData || lf.device?.test_raw_data;
  if (Array.isArray(raw?.final_config_audit?.registers) && raw.final_config_audit.registers.length > 0) {
    return raw.final_config_audit.registers;
  }

  // 3. From session metadata registers
  if (Array.isArray(lf.finalConfig?.metadata?.registers) && lf.finalConfig.metadata.registers.length > 0) {
    return lf.finalConfig.metadata.registers;
  }

  // 4. From executionLogs in lifecycle
  if (Array.isArray(lf.executionLogs) && lf.executionLogs.length > 0) {
    return lf.executionLogs.map((l: any) => ({
      address: l.modbusRegisterDec,
      modbus_reg_hex: l.modbusRegisterHex || formatHex(l.modbusRegisterDec),
      parameter_name: `Reg ${l.modbusRegisterDec}`,
      format: 'HEX',
      value_to_write: l.writtenValue || '',
      value_read_back: l.readValue || '',
      status: l.status || 'PASS',
    }));
  }

  return [];
});

const passCount = computed(() => {
  return registerList.value.filter((r) => String(r.status || '').toUpperCase() === 'PASS').length;
});

const failCount = computed(() => {
  return registerList.value.filter((r) => String(r.status || '').toUpperCase() === 'FAIL').length;
});

const filteredRegisters = computed(() => {
  let list = registerList.value;

  if (statusFilter.value === 'pass') {
    list = list.filter((r) => String(r.status || '').toUpperCase() === 'PASS');
  } else if (statusFilter.value === 'fail') {
    list = list.filter((r) => String(r.status || '').toUpperCase() === 'FAIL');
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((r) => {
      const dec = String(r.address ?? '');
      const hex = (r.modbus_reg_hex || formatHex(r.address)).toLowerCase();
      const name = String(r.parameter_name || '').toLowerCase();
      const readVal = String(r.value_read_back || '').toLowerCase();
      const writeVal = String(r.value_to_write || '').toLowerCase();
      return (
        dec.includes(q) ||
        hex.includes(q) ||
        name.includes(q) ||
        readVal.includes(q) ||
        writeVal.includes(q)
      );
    });
  }

  return list;
});

const rawPayload = computed(() => {
  return fetchedLifecycle.value || props.device?.sessionProfile || props.device?.auditData || props.device || {};
});

const exportCsv = () => {
  if (!registerList.value.length) return;
  const headers = ['Address_Dec', 'Address_Hex', 'Parameter_Name', 'Format', 'Value_To_Write', 'Value_Read_Back', 'Status'];
  const rows = registerList.value.map((r) => [
    r.address,
    r.modbus_reg_hex || formatHex(r.address),
    `"${(r.parameter_name || '').replace(/"/g, '""')}"`,
    r.format || 'HEX',
    `"${(r.value_to_write ?? '').toString().replace(/"/g, '""')}"`,
    `"${(r.value_read_back ?? '').toString().replace(/"/g, '""')}"`,
    r.status || 'NONE',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MemMap_ReadBack_${serialNumber.value || 'device'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
