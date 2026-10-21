import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus, { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router';
import CModuleBoundary from './components/shared/CModuleBoundary.vue';

const app = createApp(App);

// 1. Register global defense component per SOP Frontend-Shell-Co-lap-Loi-Render
app.component('CModuleBoundary', CModuleBoundary);

// 2. Register all Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 3. Global Error Handler per SOP Frontend-Shell-Co-lap-Loi-Render
app.config.errorHandler = (err: unknown, instance, info) => {
  const errorObj = err instanceof Error ? err : new Error(String(err));
  console.error('[GlobalErrorHandler] Uncaught runtime exception:', errorObj, info);

  // Surface message without breaking navigation
  ElMessage({
    type: 'error',
    message: `Lỗi ứng dụng: ${errorObj.message || 'Hệ thống gặp sự cố không mong muốn'}`,
    duration: 5000,
  });
};

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');
