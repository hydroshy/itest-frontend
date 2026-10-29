# Bảng Tra Cứu Toàn Diện Component DaisyUI (Theme `dim`)

Tài liệu tra cứu nhanh các class DaisyUI chuẩn hóa cho hệ thống Vue 3 Frontend ITEST (Industrial IoT & Testing Platform).

---

## 1. Nút & Nhóm Nút (Buttons & Button Groups)

### 1.1 Button Cơ Bản
```html
<button class="btn btn-primary btn-sm">Thực thi</button>
<button class="btn btn-secondary btn-sm">Bổ trợ</button>
<button class="btn btn-ghost btn-sm">Trong suốt</button>
<button class="btn btn-outline btn-sm">Viền ngoài</button>
<button class="btn btn-error btn-sm">Xóa / Ngắt</button>
```

### 1.2 Button Kèm Icon
```html
<button class="btn btn-primary btn-sm gap-2">
  <span class="icon-[tabler--device-floppy] w-4 h-4"></span>
  Lưu thông số
</button>
<button class="btn btn-ghost btn-xs btn-square" title="Chỉnh sửa">
  <span class="icon-[tabler--edit] w-3.5 h-3.5"></span>
</button>
```

### 1.3 Nhóm Nút Liền Nhau (`join`)
```html
<div class="join">
  <button class="btn btn-sm join-item btn-active">Tất cả</button>
  <button class="btn btn-sm join-item">Thành công</button>
  <button class="btn btn-sm join-item">Thất bại</button>
</div>
```

---

## 2. Nhập Liệu & Biểu Mẫu (Form Inputs & Controls)

### 2.1 Text Input & Search
```html
<div class="form-control w-full">
  <label class="label py-1">
    <span class="label-text text-xs text-base-content/70">Số Serial Thiết Bị</span>
  </label>
  <input
    type="text"
    placeholder="Nhập serial..."
    class="input input-bordered input-sm bg-base-200 font-mono text-xs w-full focus:border-primary focus:outline-none"
  />
</div>
```

### 2.2 Select Dropdown
```html
<div class="form-control w-full">
  <label class="label py-1">
    <span class="label-text text-xs text-base-content/70">Cổng Serial</span>
  </label>
  <select class="select select-bordered select-sm bg-base-200 text-xs w-full focus:border-primary focus:outline-none">
    <option disabled selected>Chọn COM Port</option>
    <option value="COM1">COM1 - Ch340</option>
    <option value="COM3">COM3 - FTDI USB Serial</option>
  </select>
</div>
```

### 2.3 Checkbox & Toggle Switch
```html
<!-- Checkbox -->
<label class="cursor-pointer label justify-start gap-2 py-1">
  <input type="checkbox" class="checkbox checkbox-primary checkbox-xs rounded" />
  <span class="label-text text-xs text-base-content/80">Tự động kết nối lại khi mất tín hiệu</span>
</label>

<!-- Toggle Switch -->
<label class="cursor-pointer label justify-start gap-2 py-1">
  <input type="checkbox" class="toggle toggle-primary toggle-sm" />
  <span class="label-text text-xs text-base-content/80">Kích hoạt chế độ gỡ lỗi (Debug Mode)</span>
</label>
```

---

## 3. Thẻ, Hộp & Điều Hướng (Cards, Tabs & Steps)

### 3.1 Card Chuẩn
```html
<div class="card bg-base-300 border border-base-content/15 rounded-xl shadow-sm">
  <div class="card-body p-4">
    <div class="flex items-center justify-between border-b border-base-content/10 pb-2 mb-3">
      <h3 class="card-title text-sm font-semibold text-base-content">Cấu hình RF</h3>
      <span class="badge badge-info badge-xs">433 MHz</span>
    </div>
    <!-- Nội dung thẻ -->
  </div>
</div>
```

### 3.2 Tabs Điều Hướng
```html
<div class="tabs tabs-bordered mb-4">
  <button class="tab tab-sm tab-active font-medium">Tổng quan</button>
  <button class="tab tab-sm font-medium">Thanh ghi Modbus</button>
  <button class="tab tab-sm font-medium">Nhật ký Serial</button>
</div>
```

### 3.3 Quy Trình Từng Bước (`steps`)
```html
<ul class="steps steps-horizontal w-full py-2">
  <li class="step step-primary text-xs">Kiểm tra Phần cứng</li>
  <li class="step step-primary text-xs">Ghi AppKey</li>
  <li class="step text-xs">Đọc Thanh ghi</li>
  <li class="step text-xs">Xác thực Cuối</li>
</ul>
```

---

## 4. Trạng Thái, Chỉ Báo & Phản Hồi (Badges, Alerts & Stats)

### 4.1 Badges Trạng Thái
```html
<span class="badge badge-success badge-sm">PASS</span>
<span class="badge badge-error badge-sm">FAIL</span>
<span class="badge badge-warning badge-sm">RUNNING</span>
<span class="badge badge-info badge-sm">CONFIGURING</span>
<span class="badge badge-ghost badge-sm font-mono">IDLE</span>
```

### 4.2 Hộp Thông Báo Kỹ Thuật (`alert`)
```html
<div class="alert alert-warning text-xs p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning-content">
  <span class="icon-[tabler--alert-triangle] w-4 h-4"></span>
  <span>Phát hiện điện áp nguồn tụt dưới ngưỡng cho phép (2.85V < 3.0V).</span>
</div>
```

### 4.3 Khối Chỉ Số Kỹ Thuật (`stats`)
```html
<div class="stats bg-base-300 border border-base-content/15 rounded-xl shadow-sm w-full">
  <div class="stat py-2 px-3">
    <div class="stat-title text-xs text-base-content/60">Tốc độ Baud</div>
    <div class="stat-value text-lg font-mono text-primary">115200</div>
  </div>
  <div class="stat py-2 px-3 border-l border-base-content/10">
    <div class="stat-title text-xs text-base-content/60">Độ trễ phản hồi</div>
    <div class="stat-value text-lg font-mono text-base-content">14ms</div>
  </div>
</div>
```

---

## 5. Modal & Hộp Thoại (Modals & Dropdowns)

### 5.1 Modal Vue 3 Tiêu Chuẩn
```html
<dialog class="modal" :class="{ 'modal-open': showModal }">
  <div class="modal-box bg-base-300 border border-base-content/15 rounded-xl max-w-md p-5">
    <h3 class="font-bold text-base text-base-content mb-3">Xác nhận thao tác</h3>
    <p class="text-sm text-base-content/70 mb-5">Nội dung xác nhận chi tiết...</p>
    <div class="modal-action mt-0 flex justify-end gap-2">
      <button class="btn btn-ghost btn-sm" @click="showModal = false">Đóng</button>
      <button class="btn btn-primary btn-sm" @click="onConfirm">Đồng ý</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop" @click="showModal = false">
    <button>close</button>
  </form>
</dialog>
```

### 5.2 Dropdown Menu Thao Tác Nhanh
```html
<div class="dropdown dropdown-end">
  <button tabindex="0" class="btn btn-ghost btn-xs btn-square">
    <span class="icon-[tabler--dots-vertical] w-4 h-4"></span>
  </button>
  <ul tabindex="0" class="dropdown-content menu z-[1] p-1 shadow-lg bg-base-300 border border-base-content/15 rounded-lg w-40 text-xs">
    <li><a class="hover:bg-base-200">Xuất file CSV</a></li>
    <li><a class="hover:bg-base-200">In phiếu kiểm tra</a></li>
    <li><a class="text-error hover:bg-error/10">Xóa dữ liệu</a></li>
  </ul>
</div>
```
