# Cấu Hình DaisyUI Theme & Design Tokens Chuẩn (Theme `dim`)

Hướng dẫn chuẩn hóa theme Dark Minimalist Tech và Design Tokens ngữ nghĩa trong toàn bộ hệ thống ITEST (`itest-frontend` và các plugins).

---

## 1. Bản Đồ Ánh Xạ Design Tokens (Semantic Tokens)

Toàn bộ hệ thống chạy trên theme `dim` của DaisyUI: `<html lang="vi" class="dark" data-theme="dim">`.
Không bao giờ hardcode mã màu HEX trực tiếp trong template. Sử dụng các tokens sau:

| Tên Token DaisyUI | Giá Trị HEX (Theme `dim`) | Biến Hệ Thống (`cyber-theme.css`) | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| `base-100` | `#20252E` | `--owl-bg-canvas` | Nền canvas chính (background toàn màn hình trang) |
| `base-200` | `#2A303C` | `--owl-bg-surface` | Nền khối cấp 1 (Header, Sidebar, Filter bar, Container) |
| `base-300` | `#242933` | `--owl-bg-card` | Nền khối con cấp 2 (Card, Panel, Modal box, Dropdown menu) |
| `base-content` | `#C6D0F5` | `--owl-text-primary` | Màu chữ chính, tiêu đề, nội dung quan trọng |
| `base-content/70`| `rgba(198, 208, 245, 0.7)` | `--owl-text-secondary` | Chữ phụ, nhãn (label), mô tả ngắn |
| `base-content/40`| `rgba(198, 208, 245, 0.4)` | `--owl-text-muted` | Chữ mờ, placeholder, ghi chú kỹ thuật phụ |
| `border-base-content/15` | `rgba(178, 204, 214, 0.15)` | `--owl-border` | Viền ngăn cách tiêu chuẩn (hairline border) |
| `primary` | `#9FE88D` | `--owl-primary` | Màu nhấn thương hiệu (nút chính, active state, checkbox) |
| `info` | `#28ebff` | `--owl-info` | Trạng thái kỹ thuật, telemetry, port kết nối |
| `success` | `#62efbd` | `--owl-success` | Trạng thái PASS, thành công, thiết bị online |
| `warning` | `#efd057` | `--owl-warning` | Cảnh báo, tiến trình đang chạy, pending |
| `error` | `#ffae9b` | `--owl-error` | Lỗi kiểm tra, FAIL, ngắt kết nối, nút xóa |

---

## 2. Cấu Hình Tailwind CSS Chuẩn (`tailwind.config.js`)

Cấu hình mẫu trong `itest-frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./plugins/**/*.{vue,js,ts,jsx,tsx}",
    "../itest-plugins/**/*.{vue,js,ts,jsx,tsx}"
  ],
  darkMode: ['class', '[data-theme="dim"]'],
  theme: {
    extend: {
      colors: {
        'owl-bg-canvas': 'var(--owl-bg-canvas)',
        'owl-bg-surface': 'var(--owl-bg-surface)',
        'owl-bg-card': 'var(--owl-bg-card)',
        'owl-border': 'var(--owl-border)',
        'owl-primary': 'var(--owl-primary)',
        'owl-text-primary': 'var(--owl-text-primary)',
        'owl-text-secondary': 'var(--owl-text-secondary)',
        'owl-text-muted': 'var(--owl-text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["dim", "dark", "night"],
    darkTheme: "dim",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
}
```

---

## 3. Quy Tắc Sử Dụng Lớp Nền Phân Cấp (Background Layering Rules)

Để giao diện có chiều sâu kỹ thuật nhưng không bị rối mắt:
1. **Lớp 0 (Canvas)**: Luôn là `bg-base-100` (`#20252E`). Nền phẳng hoàn toàn, không gradient neon, không grid pattern mắt cáo.
2. **Lớp 1 (Surface Containers)**: Sidebar, Header, hoặc khung bao lớn ngoài cùng dùng `bg-base-200` (`#2A303C`).
3. **Lớp 2 (Cards & Data Panels)**: Thẻ nội dung, hộp thông số, modal dialog dùng `bg-base-300` (`#242933`) kèm viền mỏng `border border-base-content/15` và bo góc `rounded-xl`.
4. **Lớp 3 (Inputs & Nested Blocks)**: Ô nhập liệu (Input, Select, Textarea) đặt bên trong Card dùng `bg-base-200` để tạo độ trũng tự nhiên, viền `border border-base-content/20`, focus viền `focus:border-primary`.

---

## 4. Chuyển Đổi Từ Sci-Fi Cũ Sang Dark Minimalist Tech

| Kiểu Cũ (Sci-Fi Cyberpunk - Cấm Dùng) | Kiểu Mới Chuẩn Hóa (Minimalist DaisyUI `dim`) |
| :--- | :--- |
| `box-shadow: 0 0 15px rgba(0,240,255,0.7)` | `shadow-sm` hoặc không dùng shadow, chỉ dùng viền hairline |
| Vát góc `data-augmented-ui="tl-clip tr-clip"` | Bo góc chuẩn `rounded-xl` hoặc `rounded-lg` |
| Font `font-['Orbitron']`, `font-['Blender_Pro']` | `font-sans` cho giao diện; `font-mono` cho số liệu hex/data |
| Nút gradient neon chói `bg-gradient-to-r from-cyan-500 to-blue-500` | Nút solid phẳng `btn btn-primary btn-sm` (màu `#9FE88D` chữ `#1c2128`) |
| Nhấp nháy `animate-pulse` rực sáng | Dot chỉ báo tĩnh `w-2 h-2 rounded-full bg-success` |
| Bảng nền đen viền xanh điện | Bảng `.cyber-tabulator` nền `#242933`, header `#2A303C`, viền `#B2CCD61F` |
