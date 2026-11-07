<template>
  <dialog class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box max-w-5xl bg-base-100 border border-base-300">
      <div class="flex items-center justify-between pb-3 border-b border-base-300 mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" class="text-primary text-base" />
          Tra Cứu &amp; Đồng Bộ Sales Order Từ DIS (Odoo ERP)
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Status & Mode Notice -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-base-200/60 rounded-lg border border-base-300 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-base-content/80">Trạng thái kết nối DIS API:</span>
            <span v-if="disStatus.connected && !disStatus.isMock" class="badge badge-success badge-sm font-semibold">
              Live Connection (HTTPS)
            </span>
            <span v-else-if="disStatus.isMock" class="badge badge-warning badge-sm font-semibold">
              Mock Mode (Mô phỏng offline)
            </span>
            <span v-else class="badge badge-ghost badge-sm">Chưa kết nối / Đang kiểm tra...</span>
          </div>
          <div class="text-xs text-base-content/60 font-mono">
            <span v-if="disStatus.isMock">
              (Thiếu DIS_SO_TOKEN, đang dùng dữ liệu chuẩn OpenAPI v1.1.0)
            </span>
            <span v-else>
              Base URL: {{ disStatus.baseUrl || 'https://dis-so.daviteq.com' }}
            </span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div class="md:col-span-2">
            <input
              v-model.number="filterYear"
              type="number"
              min="2020"
              max="2035"
              placeholder="Năm (tất cả)"
              class="input input-bordered input-sm w-full font-medium"
            />
          </div>
          <div class="md:col-span-2">
            <select v-model="filterMonth" class="select select-bordered select-sm w-full font-medium">
              <option :value="undefined">Tất cả tháng</option>
              <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
            </select>
          </div>
          <div class="md:col-span-3">
            <select v-model="filterState" class="select select-bordered select-sm w-full font-medium">
              <option value="">Tất cả trạng thái</option>
              <option value="sale">Sale Order (Đã duyệt)</option>
              <option value="done">Hoàn tất (Done)</option>
              <option value="draft">Báo giá (Draft)</option>
              <option value="cancel">Đã hủy (Cancel)</option>
            </select>
          </div>
          <div class="md:col-span-4">
            <div class="join w-full">
              <input
                v-model="filterQuery"
                placeholder="Tìm mã SO (VD: SO26...), khách hàng..."
                class="input input-bordered input-sm join-item w-full font-medium"
                @keyup.enter="handleSearch"
              />
              <button class="btn btn-sm btn-primary join-item" :disabled="loading" @click="handleSearch">
                <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                <font-awesome-icon v-else :icon="['fas', 'magnifying-glass']" />
                Tìm
              </button>
            </div>
          </div>
          <div class="md:col-span-1 flex items-center justify-end">
            <button class="btn btn-sm btn-ghost btn-square" title="Làm mới" :disabled="loading" @click="handleSearch">
              <font-awesome-icon :icon="['fas', 'arrows-rotate']" :class="{ 'animate-spin': loading }" />
            </button>
          </div>
        </div>

        <!-- Orders Table List -->
        <div class="overflow-x-auto border border-base-300 rounded-lg max-h-60 overflow-y-auto">
          <table class="table table-xs table-pin-rows table-zebra w-full font-medium">
            <thead>
              <tr class="bg-base-200">
                <th class="text-center w-20">ID Odoo</th>
                <th class="w-40">Mã Đơn Hàng (SO)</th>
                <th>Khách Hàng</th>
                <th>Email Khách Hàng</th>
                <th class="text-center w-36">Ngày Đặt Hàng</th>
                <th class="text-center w-28">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-6 text-base-content/60">
                  <div class="flex items-center justify-center gap-2">
                    <span class="loading loading-spinner loading-sm text-primary"></span>
                    <span>Đang tải danh sách đơn hàng DIS...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="ordersList.length === 0">
                <td colspan="6" class="text-center py-6 text-base-content/60">
                  Không tìm thấy đơn hàng DIS nào phù hợp.
                </td>
              </tr>
              <tr
                v-for="row in ordersList"
                :key="row.odoo_id || row.id"
                class="cursor-pointer hover:bg-base-200 transition-colors"
                :class="{ 'bg-primary/20 font-semibold': selectedOrder && (selectedOrder.odoo_id === row.odoo_id || selectedOrder.id === row.id) }"
                @click="emit('selectOrder', row)"
              >
                <td class="text-center font-mono">{{ row.odoo_id || row.id }}</td>
                <td class="text-primary font-bold font-mono">{{ row.name }}</td>
                <td class="truncate max-w-xs">{{ row.partner_name || '-' }}</td>
                <td class="truncate max-w-xs">{{ row.partner_email || row.email || '-' }}</td>
                <td class="text-center text-xs text-base-content/70">{{ row.date_order || '-' }}</td>
                <td class="text-center">
                  <span class="badge badge-sm" :class="getStateBadgeClass(row.state)">
                    {{ row.state }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Selected SO Details & Line Items -->
        <div v-if="selectedOrder" class="mt-4 pt-4 border-t border-base-300 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-bold text-primary flex items-center gap-2">
              <span>Chi Tiết Đơn Hàng:</span>
              <span class="text-accent">{{ selectedOrder.name }}</span>
              <span class="text-base-content/60 font-normal">- {{ selectedOrder.partner_name }}</span>
            </div>
            <button
              class="btn btn-sm btn-success text-white font-semibold gap-1"
              :disabled="syncing"
              @click="emit('syncOrder', selectedOrder)"
            >
              <span v-if="syncing" class="loading loading-spinner loading-xs"></span>
              <font-awesome-icon v-else :icon="['fas', 'check']" />
              Đồng Bộ Vào Traceability Database
            </button>
          </div>

          <!-- Work Authorization (WA) on DIS & Fallback Info -->
          <div>
            <div v-if="orderWas.length > 0">
              <div class="font-semibold text-success text-sm flex items-center gap-1 mb-2">
                <font-awesome-icon :icon="['fas', 'ticket']" class="text-xs" />
                <span>Lệnh Work Authorization (WA) trên DIS ({{ orderWas.length }} lệnh sẵn có):</span>
              </div>
              <div class="overflow-x-auto border border-base-300 rounded-lg max-h-36 overflow-y-auto">
                <table class="table table-xs table-pin-rows w-full font-medium">
                  <thead>
                    <tr class="bg-base-200">
                      <th class="w-40">Mã Lệnh WA</th>
                      <th>Mã Sản Phẩm (Item)</th>
                      <th class="text-right w-24">Số Lượng</th>
                      <th class="text-center w-24">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="wa in orderWas" :key="wa.wa_number || wa.id">
                      <td class="font-bold text-warning font-mono">{{ wa.wa_number || wa.name }}</td>
                      <td class="font-bold text-primary">{{ wa.item_code || wa.product_code || '-' }}</td>
                      <td class="text-right font-mono">{{ wa.quantity || wa.product_uom_qty || 0 }}</td>
                      <td class="text-center"><span class="badge badge-success badge-xs">{{ wa.state || 'active' }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- DIS Fallback Mode Alert -->
            <div v-else class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1">
              <div class="font-bold text-warning flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
                <span>Đơn hàng chưa có lệnh WA độc lập trên DIS</span>
              </div>
              <p class="text-base-content/80">
                DIS chưa trả về danh sách Work Authorization (WA) riêng cho đơn hàng này. Khi nhấn Đồng Bộ, iTest sẽ tự động trích xuất các dòng sản phẩm (Line Items) thành từng lệnh WA chuẩn (định dạng WA/Năm/STT) để phục vụ việc gắn thiết bị kiểm thử.
              </p>
            </div>
          </div>

          <!-- Order Line Items -->
          <div>
            <div class="font-semibold text-xs text-base-content/70 mb-1 flex items-center justify-between">
              <span>Các dòng mặt hàng thuộc SO ({{ orderLines.length }} sản phẩm):</span>
              <span class="text-xs text-primary font-mono">Tổng tiền: {{ Number(selectedOrder.amount_total || 0).toLocaleString('vi-VN') }} {{ selectedOrder.currency_name || 'VND' }}</span>
            </div>
            <div class="overflow-x-auto border border-base-300 rounded-lg max-h-44 overflow-y-auto">
              <table class="table table-xs table-zebra w-full font-medium">
                <thead>
                  <tr class="bg-base-200">
                    <th class="w-12 text-center">#</th>
                    <th class="w-36">Mã Sản Phẩm</th>
                    <th>Tên Sản Phẩm / Mô Tả</th>
                    <th class="text-right w-24">Số Lượng</th>
                    <th class="text-right w-28">Đơn Giá</th>
                    <th class="text-right w-32">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="orderLines.length === 0">
                    <td colspan="6" class="text-center py-4 text-base-content/60">Không có dòng sản phẩm nào.</td>
                  </tr>
                  <tr v-for="(line, idx) in orderLines" :key="line.id || idx">
                    <td class="text-center text-xs text-base-content/60">{{ idx + 1 }}</td>
                    <td class="font-bold text-primary font-mono">{{ line.product_code || line.product_default_code || line.product_id?.[1] || '-' }}</td>
                    <td class="truncate max-w-sm">{{ line.name || line.product_name || '-' }}</td>
                    <td class="text-right font-mono font-semibold">{{ line.product_uom_qty || line.quantity || 0 }} {{ line.product_uom?.[1] || line.uom || '' }}</td>
                    <td class="text-right font-mono text-xs">{{ Number(line.price_unit || 0).toLocaleString('vi-VN') }}</td>
                    <td class="text-right font-mono font-semibold text-xs">{{ Number(line.price_subtotal || 0).toLocaleString('vi-VN') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-sm btn-ghost" @click="emit('close')">Đóng</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60" @click="emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  visible: boolean;
  disStatus: {
    connected: boolean;
    isMock: boolean;
    baseUrl?: string;
  };
  ordersList: any[];
  orderLines: any[];
  orderWas: any[];
  selectedOrder?: any;
  loading?: boolean;
  syncing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'search', filter: { year?: number; month?: number; state?: string; query?: string }): void;
  (e: 'selectOrder', order: any): void;
  (e: 'syncOrder', order: any): void;
}>();

const filterYear = ref<number | undefined>(undefined);
const filterMonth = ref<number | undefined>(undefined);
const filterState = ref('');
const filterQuery = ref('');

const handleSearch = () => {
  emit('search', {
    year: filterYear.value,
    month: filterMonth.value,
    state: filterState.value,
    query: filterQuery.value,
  });
};

const getStateBadgeClass = (state: string) => {
  switch (state) {
    case 'sale':
      return 'badge-success text-white font-semibold';
    case 'done':
      return 'badge-info text-white font-semibold';
    case 'draft':
      return 'badge-warning font-semibold';
    case 'cancel':
      return 'badge-error text-white font-semibold';
    default:
      return 'badge-ghost';
  }
};
</script>
