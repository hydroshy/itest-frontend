import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'tabulator-tables/dist/css/tabulator.min.css';
import './assets/tailwind.css';
import './assets/cyber-theme.css';
import { cyberToast } from './services/cyberToast';

import App from './App.vue';
import { router } from './router';
import { usePluginStore } from './stores/plugin';
import CModuleBoundary from './components/shared/CModuleBoundary.vue';

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  const pinia = createPinia();

  // Register the defensive boundary before any view can render.
  app.component('CModuleBoundary', CModuleBoundary);

  app.config.errorHandler = (err: unknown, _instance, info) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('[GlobalErrorHandler] Uncaught runtime exception:', errorObj, info);
    cyberToast.error(`Lỗi ứng dụng: ${errorObj.message || 'Hệ thống gặp sự cố không mong muốn'}`);
  };

  app.use(pinia);

  // Dynamic plugin routes must exist before Vue Router starts its first navigation.
  // A plugin failure is isolated in the store and never prevents the Shell mounting.
  const pluginStore = usePluginStore();
  console.info('[Bootstrap] Initializing build-time plugins before router installation.');
  await pluginStore.initializePlugins(router);
  console.info('[Bootstrap] Plugin initialization finished.', pluginStore.diagnostics);

  app.use(router);
  await router.isReady();
  app.mount('#app');
  console.info('[Bootstrap] app.mount completed.', {
    route: router.currentRoute.value.fullPath,
    matched: router.currentRoute.value.matched.map((record) => record.name),
  });
}

bootstrap().catch((err: unknown) => {
  console.error('[Bootstrap] Fatal Shell bootstrap failure:', err);
  const target = document.querySelector('#app');
  if (target) {
    target.textContent = 'Không thể khởi tạo giao diện. Vui lòng tải lại trang.';
  }
});
