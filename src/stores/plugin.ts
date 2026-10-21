import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type { Router } from 'vue-router';
import {
  FrontendPluginRegistry,
  SimpleEventBus,
  type FrontendPluginInstance,
  type FrontendMenuDefinition,
  type FrontendWidgetDefinition,
  type FrontendExtensionPoint,
  type FrontendRouteDefinition,
} from '@itest/frontend-sdk';
import { pluginApiAdapter } from '@/api/client';
import { useAuthStore } from './auth';
import { buildTimePlugins, registryDiagnostics } from '@/generated/plugin-registry';

export const usePluginStore = defineStore('plugin', () => {
  const eventBus = new SimpleEventBus();
  const registry = new FrontendPluginRegistry(eventBus, pluginApiAdapter);

  const isInitialized = ref(false);
  let initializationPromise: Promise<void> | null = null;
  const plugins = shallowRef<FrontendPluginInstance[]>([]);
  const dynamicRoutes = shallowRef<FrontendRouteDefinition[]>([]);

  // Wire permissions provider to registry
  const authStore = useAuthStore();
  registry.setUserPermissionsProvider(() => ({
    permissions: authStore.permissions,
    roles: authStore.roles,
  }));

  const activePlugins = computed(() =>
    plugins.value.filter((p) => p.status === 'active')
  );

  const menus = computed<FrontendMenuDefinition[]>(() => {
    return registry.getMenus();
  });

  const widgets = computed<FrontendWidgetDefinition[]>(() => {
    return registry.getWidgets();
  });

  function refreshState() {
    plugins.value = registry.listPlugins();
    dynamicRoutes.value = registry.getRoutes();
  }

  /**
   * Initialize and register all build-time plugins into Shell & Router
   */
  function initializePlugins(router?: Router): Promise<void> {
    if (isInitialized.value) return Promise.resolve();
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
      console.info(`[PluginStore] Initializing ${buildTimePlugins.length} build-time plugin(s)...`);

      for (const entry of buildTimePlugins) {
        try {
          if (!entry.plugin) {
            console.warn(`[PluginStore] Plugin "${entry.id}" has no valid export.`);
            continue;
          }

          await registry.register(entry.plugin);
          if (entry.enabledByDefault !== false) {
            await registry.enable(entry.id);
          }
        } catch (err) {
          // Keep Shell bootstrap alive: one broken plugin is reflected in diagnostics only.
          console.error(`[PluginStore] Error loading plugin "${entry.id}":`, err);
        }
      }

      refreshState();
      if (router) registerDynamicRoutes(router);
      isInitialized.value = true;
      console.info('[PluginStore] Plugin initialization completed.', registryDiagnostics);
    })().finally(() => {
      initializationPromise = null;
    });

    return initializationPromise;
  }

  /**
   * Inject plugin routes into Vue Router under MainLayout
   */
  function registerDynamicRoutes(router: Router): void {
    const routes = registry.getRoutes();

    for (const r of routes) {
      // Clean path ensuring leading slash
      const cleanPath = r.path.startsWith('/') ? r.path : `/${r.path}`;

      // Check if route already exists
      if (!router.hasRoute(r.name)) {
        router.addRoute('main-layout', {
          path: cleanPath.replace(/^\//, ''), // As child route of main-layout
          name: r.name,
          component: r.component,
          meta: {
            title: r.meta?.title || r.name,
            icon: r.meta?.icon,
            requiresAuth: r.meta?.requiresAuth ?? true,
            permissions: r.meta?.permissions,
            roles: r.meta?.roles,
            pluginId: r.meta?.pluginId,
          },
        });
        console.log(`[PluginStore] Registered route: "${r.name}" -> ${cleanPath}`);
      }
    }
  }

  async function enablePlugin(pluginId: string, router?: Router): Promise<void> {
    await registry.enable(pluginId);
    refreshState();
    if (router) {
      registerDynamicRoutes(router);
    }
  }

  async function disablePlugin(pluginId: string): Promise<void> {
    await registry.disable(pluginId);
    refreshState();
  }

  function getExtensionPoints(slotName: string): FrontendExtensionPoint[] {
    return registry.getExtensionPoints(slotName);
  }

  return {
    registry,
    eventBus,
    isInitialized,
    plugins,
    activePlugins,
    menus,
    widgets,
    dynamicRoutes,
    diagnostics: registryDiagnostics,
    initializePlugins,
    registerDynamicRoutes,
    enablePlugin,
    disablePlugin,
    getExtensionPoints,
  };
});
