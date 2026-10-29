# 4 Mẫu Giao Diện Chuẩn Sẵn Dùng (Production-Ready Templates)

Các mẫu component Vue 3 sẵn sàng copy-paste, được tối ưu hoàn chỉnh cho DaisyUI theme `dim` trong hệ thống ITEST.

---

## Mẫu 1: Bộ Lọc & Bảng Dữ Liệu Quản Lý (CRUD Data Management View)

Mẫu chuẩn áp dụng cho các trang quản trị thiết bị, danh sách cấu hình, lịch sử kiểm tra.

```vue
<template>
  <div class="space-y-4">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-base-200 p-4 rounded-xl border border-base-content/15">
      <div>
        <h2 class="text-lg font-bold text-base-content">Quản lý Lô Thiết Bị</h2>
        <p class="text-xs text-base-content/60">Theo dõi thông số và trạng thái kiểm thử theo thời gian thực</p>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-sm gap-1.5" @click="handleRefresh">
          <span class="icon-[tabler--refresh] w-4 h-4"></span>
          Làm mới
        </button>
        <button class="btn btn-primary btn-sm gap-1.5" @click="handleCreate">
          <span class="icon-[tabler--plus] w-4 h-4"></span>
          Thêm thiết bị mới
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-base-300 p-3 rounded-xl border border-base-content/15">
      <div class="form-control">
        <input
          v-model="filters.keyword"
          type="text"
          placeholder="Tìm theo MAC / IMEI..."
          class="input input-bordered input-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none"
        />
      </div>
      <div class="form-control">
        <select v-model="filters.status" class="select select-bordered select-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none">
          <option value="">Tất cả trạng thái</option>
          <option value="PASS">PASS (Đạt chuẩn)</option>
          <option value="FAIL">FAIL (Lỗi)</option>
          <option value="TESTING">Đang kiểm thử</option>
        </select>
      </div>
      <div class="form-control">
        <select v-model="filters.batch" class="select select-bordered select-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none">
          <option value="">Tất cả lô hàng (SO)</option>
          <option value="SO-202610-01">SO-202610-01</option>
          <option value="SO-202610-02">SO-202610-02</option>
        </select>
      </div>
      <div class="flex items-center justify-end">
        <button class="btn btn-ghost btn-sm text-xs" @click="resetFilters">Đặt lại bộ lọc</button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="overflow-x-auto rounded-xl border border-base-content/15 bg-base-300">
      <table class="table table-sm table-pin-rows">
        <thead>
          <tr class="bg-base-200/80 text-base-content/70 border-b border-base-content/10">
            <th class="w-12 text-center">STT</th>
            <th>Mã Thiết Bị (MAC)</th>
            <th>Loại SKU</th>
            <th>Phiên bản FW</th>
            <th>Thời gian cập nhật</th>
            <th class="text-center">Kết quả</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="item.id" class="hover:bg-base-200/50 border-b border-base-content/5">
            <td class="text-center font-mono text-xs text-base-content/50">{{ idx + 1 }}</td>
            <td class="font-mono text-xs font-semibold text-base-content">{{ item.mac }}</td>
            <td class="text-xs text-base-content/80">{{ item.sku }}</td>
            <td class="font-mono text-xs text-primary">{{ item.fw }}</td>
            <td class="text-xs text-base-content/60">{{ item.updatedAt }}</td>
            <td class="text-center">
              <span class="badge badge-xs font-medium" :class="item.status === 'PASS' ? 'badge-success' : 'badge-error'">
                {{ item.status }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn btn-ghost btn-xs text-primary" @click="handleDetail(item)">Chi tiết</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const filters = reactive({ keyword: '', status: '', batch: '' });
const items = ref([
  { id: 1, mac: '00:1B:44:11:3A:B7', sku: 'GW-LR01-VN', fw: 'v1.4.2', updatedAt: '2026-10-29 14:22', status: 'PASS' },
  { id: 2, mac: '00:1B:44:11:3A:B8', sku: 'GW-LR01-VN', fw: 'v1.4.2', updatedAt: '2026-10-29 14:25', status: 'FAIL' },
]);

function handleRefresh() {}
function handleCreate() {}
function resetFilters() { filters.keyword = ''; filters.status = ''; filters.batch = ''; }
function handleDetail(item: any) {}
</script>
```

---

## Mẫu 2: Bảng Điều Khiển Kiểm Thử Phần Cứng (Hardware Testing HUD)

Mẫu chuẩn áp dụng cho các tool nạp firmware, đo kiểm RF, kiểm tra cổng Serial / Modbus.

```vue
<template>
  <div class="space-y-4">
    <!-- Real-time HUD Status & Metric Header -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <!-- Port Status Card -->
      <div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm">
        <div class="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <div class="text-xs text-base-content/60 font-medium">Trạng thái Kết nối</div>
            <div class="text-sm font-semibold text-base-content flex items-center gap-2 mt-1">
              <span class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-success' : 'bg-error'"></span>
              {{ isConnected ? 'COM3 (115200 bps)' : 'Chưa kết nối cổng' }}
            </div>
          </div>
          <button class="btn btn-sm" :class="isConnected ? 'btn-ghost text-error' : 'btn-primary'" @click="toggleConnect">
            {{ isConnected ? 'Ngắt kết nối' : 'Kết nối' }}
          </button>
        </div>
      </div>

      <!-- Test Cycle Stats -->
      <div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm lg:col-span-2">
        <div class="card-body p-4 flex flex-row items-center justify-around">
          <div class="text-center">
            <div class="text-xs text-base-content/60">Điện áp đo được</div>
            <div class="text-lg font-mono font-bold text-success mt-0.5">3.28 V</div>
          </div>
          <div class="h-8 w-px bg-base-content/10"></div>
          <div class="text-center">
            <div class="text-xs text-base-content/60">Dòng tiêu thụ</div>
            <div class="text-lg font-mono font-bold text-base-content mt-0.5">24.5 mA</div>
          </div>
          <div class="h-8 w-px bg-base-content/10"></div>
          <div class="text-center">
            <div class="text-xs text-base-content/60">Thời gian chu kỳ</div>
            <div class="text-lg font-mono font-bold text-primary mt-0.5">1.82 s</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stage Progress Steps -->
    <div class="bg-base-300 p-4 rounded-xl border border-base-content/15">
      <ul class="steps steps-horizontal w-full">
        <li class="step step-primary text-xs">Kiểm tra Phần cứng</li>
        <li class="step step-primary text-xs">Ghi AppKey</li>
        <li class="step text-xs">Đọc Thanh ghi</li>
        <li class="step text-xs">Xác thực Cuối</li>
      </ul>
    </div>

    <!-- Live Telemetry / Console Log Output -->
    <div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2.5 bg-base-200/80 border-b border-base-content/10">
        <div class="flex items-center gap-2">
          <span class="icon-[tabler--terminal] w-4 h-4 text-primary"></span>
          <span class="text-xs font-semibold text-base-content">Nhật ký Telemetry Trực tiếp</span>
        </div>
        <button class="btn btn-ghost btn-xs text-xs" @click="clearLogs">Xóa log</button>
      </div>
      <div class="bg-[#1a1f26] p-3 font-mono text-xs text-base-content/80 h-48 overflow-y-auto space-y-1">
        <div v-for="(log, i) in logs" :key="i" class="flex gap-2">
          <span class="text-base-content/40 select-none">[{{ log.time }}]</span>
          <span :class="log.type === 'err' ? 'text-error' : (log.type === 'ok' ? 'text-success' : 'text-base-content/70')">
            {{ log.msg }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isConnected = ref(true);
const logs = ref([
  { time: '14:30:01', type: 'info', msg: 'Đang mở cổng COM3 với baudrate 115200...' },
  { time: '14:30:02', type: 'ok', msg: 'Phát hiện bo mạch STM32WL55. Sẵn sàng nhận lệnh.' },
  { time: '14:30:03', type: 'ok', msg: 'Đọc thanh ghi UID thành công: 0x38472910AF.' },
]);

function toggleConnect() { isConnected.value = !isConnected.value; }
function clearLogs() { logs.value = []; }
</script>
```

---

## Mẫu 3: Form Cấu Hình Phân Nhóm (Settings & Configuration Panel)

```vue
<template>
  <div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm">
    <div class="card-body p-5">
      <!-- Tabs -->
      <div class="tabs tabs-bordered mb-4">
        <button
          v-for="tab in ['Mạng LoRaWAN', 'Thanh Ghi Modbus', 'Tự Động Hóa']"
          :key="tab"
          class="tab tab-sm font-medium"
          :class="{ 'tab-active text-primary': currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Form Fields Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs text-base-content/70 font-medium">Tần số Hoạt động</span>
          </label>
          <select class="select select-bordered select-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none">
            <option>AS923-1 (920-925 MHz)</option>
            <option>EU868 (863-870 MHz)</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label py-1">
            <span class="label-text text-xs text-base-content/70 font-medium">Công suất Phát (TX Power)</span>
          </label>
          <input
            type="number"
            value="14"
            class="input input-bordered input-sm bg-base-200 font-mono text-xs w-full focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <!-- Footer Action -->
      <div class="flex items-center justify-end gap-2 pt-4 mt-6 border-t border-base-content/10">
        <button class="btn btn-ghost btn-sm">Mặc định</button>
        <button class="btn btn-primary btn-sm">Lưu cấu hình</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const currentTab = ref('Mạng LoRaWAN');
</script>
```

---

## Mẫu 4: Modal Hộp Thoại Biểu Mẫu (Standard Modal Form)

```vue
<template>
  <div>
    <button class="btn btn-primary btn-sm" @click="isOpen = true">Mở hộp thoại</button>

    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
      <div class="modal-box bg-base-300 border border-base-content/15 rounded-xl max-w-lg p-5">
        <div class="flex items-center justify-between pb-3 border-b border-base-content/10 mb-4">
          <h3 class="font-bold text-base text-base-content">Thêm Quy Tắc Kiểm Tra</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="isOpen = false">✕</button>
        </div>

        <div class="space-y-3">
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text text-xs font-medium text-base-content/70">Tên thông số kiểm tra</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đo điện áp Pin..."
              class="input input-bordered input-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-medium text-base-content/70">Ngưỡng dưới (Min)</span>
              </label>
              <input type="number" value="3.0" class="input input-bordered input-sm bg-base-200 font-mono text-xs w-full" />
            </div>
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-medium text-base-content/70">Ngưỡng trên (Max)</span>
              </label>
              <input type="number" value="3.6" class="input input-bordered input-sm bg-base-200 font-mono text-xs w-full" />
            </div>
          </div>
        </div>

        <div class="modal-action mt-6 pt-3 border-t border-base-content/10 flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" @click="isOpen = false">Hủy bỏ</button>
          <button class="btn btn-primary btn-sm" @click="handleSave">Lưu quy tắc</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isOpen = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const isOpen = ref(false);
function handleSave() { isOpen.value = false; }
</script>
```
