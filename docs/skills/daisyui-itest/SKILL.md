---
name: daisyui-itest
description: Hướng dẫn chuẩn hóa và tăng tốc phát triển giao diện (UI) cho hệ thống itest-frontend (Shell và 8 Plugins) bằng DaisyUI (theme dim) và Tailwind CSS. Bao gồm semantic tokens, component catalog, bảng Tabulator phẳng, layout HUD/Dashboard/CRUD và quy chuẩn triệt tiêu anti-patterns (không neon, không sci-fi rực rỡ).
---

# DaisyUI Cho Hệ Thống iTest Frontend

Hướng dẫn thực chiến chuẩn hóa giao diện cho toàn bộ hệ thống **ITEST** (Vue 3 + Tailwind CSS + DaisyUI theme `dim`).
Mục tiêu: Xây dựng UI nhanh nhất, sạch nhất, nhất quán 100% theo triết lý **Dark Minimalist Tech** (công nghiệp, kỹ thuật chính xác, phẳng, tương phản cao, dịu mắt), loại bỏ hoàn toàn các anti-patterns neon sci-fi chói lóa.

---

## 1. Triết Lý Thiết Kế & Quy Tắc Cốt Lõi (Core Principles)

1. **Semantic over Atomic Utilities**:
   - Dùng class ngữ nghĩa của DaisyUI thay vì ghép hàng chục utility classes Tailwind.
   - Ví dụ: `btn btn-primary btn-sm` thay vì `px-3 py-1.5 bg-[#9fe88d] text-[#1c2128] rounded font-medium shadow ...`.
   - Ví dụ: `badge badge-success badge-sm` thay vì tự viết chip trạng thái thủ công.

2. **Quy Chuẩn Theme `dim` (DaisyUI Dark Minimalist)**:
   - Toàn hệ thống chạy trên theme `dim`: `<html lang="vi" class="dark" data-theme="dim">`.
   - **Tuyệt đối không hardcode mã màu HEX** trong component template hoặc class (`bg-[#20252e]`, `text-[#9fe88d]`).
   - Sử dụng đúng semantic tokens:
     - Nền trang (Canvas): `bg-base-100` (`#20252E` / `var(--owl-bg-canvas)`)
     - Nền khối/sidebar/header (Surface): `bg-base-200` (`#2A303C` / `var(--owl-bg-surface)`)
     - Nền card/panel/modal (Card): `bg-base-300` (`#242933` / `var(--owl-bg-card)`)
     - Viền (Border): `border-base-content/15` (`rgba(178, 204, 214, 0.15)` / `var(--owl-border)`)
     - Chữ chính: `text-base-content` (`#C6D0F5`)
     - Chữ phụ/nhãn: `text-base-content/70` hoặc `text-base-content/50`
     - Màu nhấn chính (Primary): `text-primary` / `bg-primary` (`#9FE88D` - xanh lá pastel dịu)
     - Trạng thái kỹ thuật: `info` (`#28ebff`), `success` (`#62efbd`), `warning` (`#efd057`), `error` (`#ffae9b`).

3. **Loại Bỏ Hoàn Toàn Anti-Patterns (Strictly Forbidden)**:
   - ❌ **Không Neon Glow**: Tuyệt đối không dùng `box-shadow: 0 0 15px rgba(0, 240, 255, 0.8)` hoặc hiệu ứng phát sáng chói mắt.
   - ❌ **Không Augmented UI / Vát góc rách khối**: Cấm dùng `--aug-*` hay các clip-path kiểu cyberpunk. Tất cả card, modal, panel dùng bo góc chuẩn `rounded-xl` hoặc `rounded-lg`.
   - ❌ **Không Scanlines / CRT Flicker / Glitch**: Loại bỏ các overlay trang trí rườm rà gây mỏi mắt người vận hành.
   - ❌ **Không Font chữ Sci-Fi hiển thị**: Dùng font sans-serif hệ thống (`Inter`, `system-ui`) cho text và `font-mono` cho địa chỉ MAC, AppKey, Hex, Regs, Log output.
   - ❌ **Không Inline Styles**: Không viết `style="background: ...; border: ..."` khi đã có token DaisyUI/Tailwind.

4. **Tối Ưu Kích Thước Cho Hệ Thống Công Nghiệp/IoT (High Density)**:
   - Mặc định ưu tiên size compact: `btn-sm`, `input-sm`, `select-sm`, `table-sm`, `badge-sm`.
   - Dữ liệu hiển thị dày đặc, rõ ràng, dễ thao tác nhanh.

---

## 2. Bảng Tra Cứu Component Tiêu Chuẩn (Component Cheatsheet)

### 2.1 Buttons (`btn`)
```html
<!-- Nút chính (Save, Confirm, Start Test) -->
<button class="btn btn-primary btn-sm">Bắt đầu kiểm thử</button>

<!-- Nút phụ / Thứ cấp (Cancel, Back, Refresh) -->
<button class="btn btn-ghost btn-sm">Làm mới</button>
<button class="btn btn-outline btn-sm">Quay lại</button>

<!-- Nút hành động nguy hiểm (Delete, Force Stop, Reset) -->
<button class="btn btn-error btn-sm">Xóa thiết bị</button>

<!-- Nút với icon -->
<button class="btn btn-primary btn-sm gap-2">
  <span class="icon-[tabler--player-play] w-4 h-4"></span>
  Chạy kiểm tra
</button>

<!-- Loading State -->
<button class="btn btn-primary btn-sm" :disabled="isLoading">
  <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
  {{ isLoading ? 'Đang đọc...' : 'Đọc Modbus' }}
</button>
```

### 2.2 Cards & Containers (`card`)
```html
<!-- Khối thẻ nội dung chuẩn phẳng (Flat Dark Card) -->
<div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm">
  <div class="card-body p-4 sm:p-5">
    <div class="flex items-center justify-between border-b border-base-content/10 pb-3 mb-4">
      <h3 class="card-title text-base font-semibold text-base-content">Thông tin kiểm tra</h3>
      <span class="badge badge-success badge-sm">Sẵn sàng</span>
    </div>
    
    <p class="text-sm text-base-content/70">Nội dung thẻ kỹ thuật ở đây...</p>
  </div>
</div>
```

### 2.3 Status Badges & Dot Indicators
```html
<!-- Badges trạng thái chuẩn -->
<span class="badge badge-success badge-sm">PASS</span>
<span class="badge badge-error badge-sm">FAIL</span>
<span class="badge badge-warning badge-sm">TESTING</span>
<span class="badge badge-info badge-sm">WAITING</span>
<span class="badge badge-ghost badge-sm font-mono">DISCONNECTED</span>

<!-- Dot tĩnh tinh gọn (thay thế pulse rực mắt) -->
<div class="flex items-center gap-2">
  <span class="w-2 h-2 rounded-full bg-success"></span>
  <span class="text-xs text-base-content/80 font-medium">COM3 Đã kết nối</span>
</div>
```

### 2.4 Form Controls & Inputs
```html
<!-- Form Group chuẩn -->
<div class="form-control w-full">
  <label class="label py-1">
    <span class="label-text text-xs font-medium text-base-content/70">Baudrate</span>
  </label>
  <select class="select select-bordered select-sm bg-base-200 w-full focus:border-primary focus:outline-none">
    <option value="9600">9600 bps</option>
    <option value="115200">115200 bps</option>
  </select>
</div>

<!-- Input Text với Prefix/Suffix -->
<div class="form-control w-full">
  <label class="label py-1">
    <span class="label-text text-xs font-medium text-base-content/70">AppKey Hex (32 ký tự)</span>
  </label>
  <input
    type="text"
    placeholder="00112233445566778899AABBCCDDEEFF"
    class="input input-bordered input-sm bg-base-200 font-mono text-xs w-full focus:border-primary focus:outline-none"
  />
</div>
```

### 2.5 KPI Stats Bar (`stats`)
```html
<div class="stats stats-horizontal bg-base-300 border border-base-content/15 rounded-xl shadow-sm w-full">
  <div class="stat py-3 px-4">
    <div class="stat-title text-xs text-base-content/60">Tổng thiết bị</div>
    <div class="stat-value text-xl font-mono text-base-content">1,248</div>
    <div class="stat-desc text-xs text-base-content/50">Lô hàng SO-202610</div>
  </div>
  <div class="stat py-3 px-4 border-l border-base-content/10">
    <div class="stat-title text-xs text-base-content/60">Tỷ lệ Đạt (Yield)</div>
    <div class="stat-value text-xl font-mono text-success">99.4%</div>
    <div class="stat-desc text-xs text-success/80">1,240 / 1,248 PASS</div>
  </div>
  <div class="stat py-3 px-4 border-l border-base-content/10">
    <div class="stat-title text-xs text-base-content/60">Lỗi kiểm tra</div>
    <div class="stat-value text-xl font-mono text-error">8</div>
    <div class="stat-desc text-xs text-error/80">Cần hiệu chuẩn lại</div>
  </div>
</div>
```

### 2.6 Modal Dialog (`dialog.modal`)
```html
<!-- Native Dialog hỗ trợ đóng bằng ESC và backdrop click -->
<dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
  <div class="modal-box bg-base-300 border border-base-content/15 rounded-xl max-w-lg p-5">
    <div class="flex items-center justify-between pb-3 border-b border-base-content/10 mb-4">
      <h3 class="font-bold text-base text-base-content">Xác nhận nạp cấu hình</h3>
      <button class="btn btn-sm btn-circle btn-ghost" @click="isOpen = false">✕</button>
    </div>
    
    <p class="text-sm text-base-content/80 mb-5">
      Bạn có chắc chắn muốn ghi AppKey và khóa thiết bị này không? Hành động này không thể hoàn tác.
    </p>

    <div class="modal-action mt-0 flex justify-end gap-2">
      <button class="btn btn-ghost btn-sm" @click="isOpen = false">Hủy</button>
      <button class="btn btn-primary btn-sm" @click="handleConfirm">Xác nhận ghi</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" @click="isOpen = false">
    <button>close</button>
  </form>
</dialog>
```

---

## 3. Quy Chuẩn Tích Hợp Bảng Dữ Liệu (Tabulator & DaisyUI Table)

### 3.1 Bảng DaisyUI Thuần (`table`)
Dùng cho bảng tĩnh, danh sách ngắn (< 50 dòng) hoặc bảng tóm tắt:
```html
<div class="overflow-x-auto rounded-xl border border-base-content/15 bg-base-300">
  <table class="table table-sm table-pin-rows">
    <thead>
      <tr class="bg-base-200/80 text-base-content/70 border-b border-base-content/10">
        <th class="w-12 text-center">#</th>
        <th>Tên thanh ghi</th>
        <th>Địa chỉ (Hex)</th>
        <th>Giá trị</th>
        <th class="text-right">Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-base-200/50 border-b border-base-content/5">
        <td class="text-center font-mono text-xs">1</td>
        <td class="font-medium text-xs">Firmware Version</td>
        <td class="font-mono text-xs text-base-content/60">0x0010</td>
        <td class="font-mono text-xs text-primary">v2.4.1</td>
        <td class="text-right"><span class="badge badge-success badge-xs">MATCH</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 3.2 Bảng Lớn Tabulator (`.cyber-tabulator`)
Hệ thống đã chuẩn hóa CSS cho `.cyber-tabulator` trong `src/assets/cyber-theme.css`. Khi tạo Tabulator table trong các plugins:
1. Container element: `<div ref="tableEl" class="cyber-tabulator rounded-xl border border-base-content/15 overflow-hidden"></div>`.
2. Header tự động phẳng, nền `#2A303C`, border mảnh `rgba(178, 204, 214, 0.12)`.
3. Row hover nhẹ nhàng, selection nền mờ xanh dịu, không glow.
4. Pagination tích hợp button phẳng, active page dùng `#9FE88D`.

---

## 4. Tài Liệu Tham Chiếu Bổ Sung (References)

- `references/theming-and-tokens.md`: Bảng ánh xạ toàn bộ design tokens CSS variables của theme `dim`, Tailwind mapping, và cấu hình.
- `references/components-cheatsheet.md`: Tra cứu chi tiết toàn bộ class DaisyUI cho Vue 3.
- `references/ui-templates.md`: 4 mẫu giao diện chuẩn thực tế sẵn dùng (Copy-paste):
  1. **CRUD Data View** (Bộ lọc + Action bar + Table + Phân trang)
  2. **Hardware Testing HUD** (Chỉ số thời gian thực + Console log terminal + Nút điều khiển)
  3. **Config & Settings Form** (Tabs + Grid form inputs + Save bar)
  4. **Standard Modal Dialog** (Form pop-up an toàn)
