# Hướng Dẫn Dành Cho AI Agent & Lập Trình Viên: Phát Triển Plugin ITEST Full-stack

Tài liệu này là quy chuẩn kỹ thuật bắt buộc để AI Agent hoặc Lập trình viên thiết kế, triển khai và tích hợp một plugin vào hệ sinh thái ITEST (Frontend Shell `itest-frontend` + Backend Core `itest-system`).

---

## 1. Triết Lý Kiến Trúc

1. **Full-stack Single Unit, Independent Build**:
   - Plugin được đóng gói như một đơn vị cài đặt duy nhất trong `itest-plugins/plugins/<plugin-id>`.
   - Backend chạy trên NestJS + TypeORM; Frontend chạy trên Vue 3 + Vite.
   - **Không** yêu cầu plugin tự tạo `createApp()`. Plugin Frontend chia sẻ chung Vue Runtime, Router, Pinia và `@itest/frontend-sdk` của Shell.

2. **Zero Manual Modification (Tự Động Hóa Build-Time)**:
   - Thêm hoặc xóa plugin **tuyệt đối không** chỉnh sửa thủ công vào `App.vue`, `main.ts`, hay `router/index.ts`.
   - Bộ tiền xử lý `scripts/sync-plugins.ts` và `scripts/generate-plugin-registry.ts` sẽ tự động quét, kiểm tra manifest, xác thực tương thích SDK và sinh file cấu hình `src/generated/plugin-registry.ts`.

3. **Phòng Vệ Giao Diện (Defensive Rendering & SOP CModuleBoundary)**:
   - Mọi Widget và Extension Point từ plugin đều được bọc tự động bởi `CModuleBoundary` để cô lập lỗi. Khi một plugin gặp sự cố (render error, crash script), toàn bộ hệ thống Shell, Sidebar navigation và các plugin khác vẫn hoạt động bình thường với nút bấm Retry phục hồi.

---

## 2. Cấu Trúc Thư Mục Chuẩn Của Một Plugin

Một plugin hoàn chỉnh được đặt trong thư mục `itest-plugins/plugins/<plugin-name>`:

```text
lorawan-plugin/
├── plugin.json                       # Manifest đặc tả plugin (Metadata, SDK Version, Quyền)
├── backend/                          # Mã nguồn NestJS Backend
│   ├── index.ts                      # Entrypoint xuất khẩu module NestJS
│   ├── lorawan.controller.ts         # REST API endpoints (/api/lorawan/...)
│   └── lorawan.service.ts            # Xử lý nghiệp vụ, giao tiếp phần cứng
└── frontend/                         # Mã nguồn Vue 3 Frontend
    ├── index.ts                      # Entrypoint xuất khẩu FrontendPluginDefinition
    ├── views/                        # Các trang giao diện chính (Route Views)
    │   └── LoRaWanDashboard.vue
    ├── widgets/                      # Các khối hiển thị trên Dashboard trung tâm
    │   └── GatewayStatusWidget.vue
    └── components/                   # Các thành phần gắn vào Extension Point (Header, Action)
        └── HeaderBadge.vue
```

> **Lưu ý**: Nếu plugin chỉ có backend (không có thư mục `frontend/`), hệ thống build frontend sẽ tự động bỏ qua an toàn, không gây lỗi bundle.

---

## 3. Khai Báo Manifest `plugin.json`

File `plugin.json` định nghĩa danh tính và khả năng của plugin:

```json
{
  "id": "lorawan-plugin",
  "name": "LoRaWAN Gateway & Telemetry",
  "version": "1.0.0",
  "sdkVersion": "^1.0.0",
  "author": "ITEST IoT Team",
  "description": "Quản lý Gateway LoRaWAN, giám sát tín hiệu SNR/RSSI và dữ liệu cảm biến.",
  "category": "protocol",
  "enabledByDefault": true,
  "frontend": {
    "entry": "frontend/index.ts"
  },
  "backend": {
    "entry": "backend/index.ts"
  },
  "permissions": [
    "lorawan:view",
    "lorawan:manage"
  ]
}
```

---

## 4. Triển Khai Frontend Entrypoint (`frontend/index.ts`)

File `frontend/index.ts` phải xuất khẩu một object cài đặt `FrontendPluginDefinition` (hoặc `export default`):

```typescript
import type { FrontendPluginDefinition } from '@itest/frontend-sdk';
import LoRaWanDashboard from './views/LoRaWanDashboard.vue';
import GatewayStatusWidget from './widgets/GatewayStatusWidget.vue';
import HeaderBadge from './components/HeaderBadge.vue';

export const lorawanPlugin: FrontendPluginDefinition = {
  manifest: {
    id: 'lorawan-plugin',
    name: 'LoRaWAN Gateway & Telemetry',
    version: '1.0.0',
    sdkVersion: '^1.0.0',
    description: 'Quản lý Gateway LoRaWAN',
    author: 'ITEST Team',
  },

  async setup(context) {
    context.logger.info('Initializing LoRaWAN Frontend Plugin...');

    // 1. Đăng ký Vue Route (Tự động inject vào router dưới namespace /plugins/<name>)
    context.registerRoute({
      path: '/plugins/lorawan',
      name: 'LoRaWanGateway',
      component: LoRaWanDashboard,
      meta: {
        title: 'Mạng LoRaWAN',
        icon: 'Cpu',
        requiresAuth: true,
        permissions: ['lorawan:view'],
      },
    });

    // 2. Đăng ký Menu trên Sidebar bên trái
    context.registerMenu({
      id: 'menu-lorawan',
      title: 'Mạng LoRaWAN',
      path: '/plugins/lorawan',
      icon: 'Cpu',
      order: 20,
      permissions: ['lorawan:view'],
    });

    // 3. Đăng ký Widget gắn vào Dashboard View
    context.registerWidget({
      id: 'widget-lorawan-gw',
      title: 'Trạng thái Gateway LoRaWAN',
      component: GatewayStatusWidget,
      width: 'half', // 'half' (12 cols) hoặc 'third' (8 cols) hoặc 'full' (24 cols)
      order: 10,
    });

    // 4. Đăng ký Extension Point (vị trí: header-right, footer, ...)
    context.registerExtension({
      id: 'ext-lorawan-badge',
      slot: 'header-right',
      component: HeaderBadge,
      order: 5,
    });

    context.logger.info('LoRaWAN Frontend Plugin initialized successfully.');
  },

  async teardown(context) {
    context?.logger.info('LoRaWAN Frontend Plugin cleaned up.');
  },
};

export default lorawanPlugin;
```

---

## 5. Sử Dụng Frontend Plugin Context (`context`)

Context cung cấp các API chuẩn an toàn cho plugin:

| Thuộc tính / Phương thức | Mô tả |
| :--- | :--- |
| `context.logger` | Bộ ghi log có tiền tố namespace `[Plugin:<id>]` (`info`, `warn`, `error`, `debug`). |
| `context.api` | HTTP Client chuẩn (Axios) tự động đính kèm Bearer Token và xử lý mã lỗi 401. |
| `context.eventBus` | Kênh truyền thông tin Pub/Sub liên module (`emit`, `on`, `off`, `once`). |
| `context.permissions` | Kiểm tra quyền hạn người dùng hiện tại (`hasPermission`, `hasAnyPermission`, `hasRole`). |
| `context.registerRoute()` | Đăng ký route động vào Vue Router. |
| `context.registerMenu()` | Đăng ký mục điều hướng vào Sidebar. |
| `context.registerWidget()` | Đăng ký widget thẻ trực quan hóa vào Dashboard. |
| `context.registerExtension()` | Cắm component vào các Extension Slot trên layout. |

---

## 6. Quy Trình Đồng Bộ & Build Khi Thêm Plugin Mới

Khi AI Agent hoặc Developer thêm mới một plugin vào `itest-plugins/plugins/`:

```bash
# 1. Chuyển vào thư mục itest-frontend
cd itest-frontend

# 2. Chạy lệnh đồng bộ plugin & tự động sinh registry
pnpm run plugins:update

# 3. Chạy môi trường phát triển (HMR)
pnpm run dev

# 4. Hoặc biên dịch bản build đóng gói Production
pnpm run build
```

Hệ thống sẽ:
1. Phát hiện thư mục `frontend/` trong plugin mới.
2. Sao chép an toàn vào `itest-frontend/plugins/<plugin-id>`.
3. Kiểm tra tính tương thích của `sdkVersion`.
4. Sinh mã nguồn TypeScript `src/generated/plugin-registry.ts`.
5. Tự động liên kết vào Vue Router, Sidebar và Dashboard mà không cần bất kỳ sự can thiệp thủ công nào vào mã nguồn lõi.
