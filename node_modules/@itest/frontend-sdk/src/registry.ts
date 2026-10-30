import {
  FrontendPluginDefinition,
  FrontendPluginInstance,
  FrontendPluginLifecycle,
  FrontendRouteDefinition,
  FrontendMenuDefinition,
  FrontendWidgetDefinition,
  FrontendExtensionPoint,
  FrontendEventBus,
  FrontendApiClient,
} from './types.js';
import { DefaultPluginContext } from './context.js';
import { SimpleEventBus } from './events.js';
import { PermissionHelper } from './permissions.js';

export class FrontendPluginRegistry {
  private plugins = new Map<string, FrontendPluginInstance>();
  private contexts = new Map<string, DefaultPluginContext>();

  // Registered artifacts mapped by pluginId
  private pluginRoutes = new Map<string, FrontendRouteDefinition[]>();
  private pluginMenus = new Map<string, FrontendMenuDefinition[]>();
  private pluginWidgets = new Map<string, FrontendWidgetDefinition[]>();
  private pluginExtensions = new Map<string, FrontendExtensionPoint[]>();

  private userPermissionsProvider: () => { permissions: string[]; roles: string[] } = () => ({
    permissions: [],
    roles: [],
  });

  constructor(
    public readonly eventBus: FrontendEventBus = new SimpleEventBus(),
    public readonly api: FrontendApiClient = {
      get: async <T = any>() => ({} as T),
      post: async <T = any>() => ({} as T),
      put: async <T = any>() => ({} as T),
      delete: async <T = any>() => ({} as T),
      patch: async <T = any>() => ({} as T),
    }
  ) {}

  setUserPermissionsProvider(provider: () => { permissions: string[]; roles: string[] }): void {
    this.userPermissionsProvider = provider;
  }

  // Internal calls from DefaultPluginContext
  internalRegisterRoute(pluginId: string, route: FrontendRouteDefinition): void {
    const list = this.pluginRoutes.get(pluginId) || [];
    list.push(route);
    this.pluginRoutes.set(pluginId, list);
  }

  internalRegisterMenu(pluginId: string, menu: FrontendMenuDefinition): void {
    const list = this.pluginMenus.get(pluginId) || [];
    list.push(menu);
    this.pluginMenus.set(pluginId, list);
  }

  internalRegisterWidget(pluginId: string, widget: FrontendWidgetDefinition): void {
    const list = this.pluginWidgets.get(pluginId) || [];
    list.push(widget);
    this.pluginWidgets.set(pluginId, list);
  }

  internalRegisterExtension(pluginId: string, extension: FrontendExtensionPoint): void {
    const list = this.pluginExtensions.get(pluginId) || [];
    list.push(extension);
    this.pluginExtensions.set(pluginId, list);
  }

  /**
   * Register a new plugin definition
   */
  async register(definition: FrontendPluginDefinition): Promise<void> {
    const { manifest } = definition;
    if (this.plugins.has(manifest.id)) {
      console.warn(`[PluginRegistry] Plugin "${manifest.id}" is already registered. Updating definition.`);
    }

    const instance: FrontendPluginInstance = {
      id: manifest.id,
      manifest,
      definition,
      status: 'registered',
      registeredAt: new Date(),
    };

    this.plugins.set(manifest.id, instance);

    const context = new DefaultPluginContext(
      manifest,
      this,
      this.eventBus,
      this.api,
      this.userPermissionsProvider
    );
    this.contexts.set(manifest.id, context);

    // Register static manifest contributions
    if (manifest.routes) {
      manifest.routes.forEach((r) => context.registerRoute(r));
    }
    if (manifest.menus) {
      manifest.menus.forEach((m) => context.registerMenu(m));
    }
    if (manifest.widgets) {
      manifest.widgets.forEach((w) => context.registerWidget(w));
    }
    if (manifest.extensions) {
      manifest.extensions.forEach((e) => context.registerExtension(e));
    }

    this.eventBus.emit('plugin:registered', { pluginId: manifest.id, manifest });
  }

  /**
   * Activate / Enable a registered plugin
   */
  async enable(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin "${pluginId}" not found in registry`);
    }

    if (instance.status === 'active') {
      return;
    }

    const context = this.contexts.get(pluginId);
    if (!context) {
      throw new Error(`Plugin context for "${pluginId}" not found`);
    }

    try {
      if (instance.definition.setup) {
        await instance.definition.setup(context);
      }
      instance.status = 'active';
      instance.activatedAt = new Date();
      instance.error = undefined;
      this.eventBus.emit('plugin:enabled', { pluginId });
    } catch (err: any) {
      instance.status = 'error';
      instance.error = err?.message || String(err);
      console.error(`[PluginRegistry] Failed to enable plugin "${pluginId}":`, err);
      throw err;
    }
  }

  /**
   * Disable an active plugin
   */
  async disable(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance || instance.status !== 'active') {
      return;
    }

    const context = this.contexts.get(pluginId);
    if (context && instance.definition.teardown) {
      try {
        await instance.definition.teardown(context);
      } catch (err) {
        console.error(`[PluginRegistry] Teardown error for "${pluginId}":`, err);
      }
    }

    instance.status = 'disabled';
    this.eventBus.emit('plugin:disabled', { pluginId });
  }

  /**
   * Unregister plugin completely
   */
  async unregister(pluginId: string): Promise<void> {
    await this.disable(pluginId);
    this.plugins.delete(pluginId);
    this.contexts.delete(pluginId);
    this.pluginRoutes.delete(pluginId);
    this.pluginMenus.delete(pluginId);
    this.pluginWidgets.delete(pluginId);
    this.pluginExtensions.delete(pluginId);
    this.eventBus.emit('plugin:unregistered', { pluginId });
  }

  getPlugin(pluginId: string): FrontendPluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): FrontendPluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all active routes contributed by plugins
   */
  getRoutes(): FrontendRouteDefinition[] {
    const routes: FrontendRouteDefinition[] = [];
    for (const [pluginId, instance] of this.plugins.entries()) {
      if (instance.status === 'active') {
        const pRoutes = this.pluginRoutes.get(pluginId) || [];
        routes.push(...pRoutes);
      }
    }
    return routes;
  }

  /**
   * Get all active menus filtered by user permissions
   */
  getMenus(): FrontendMenuDefinition[] {
    const menus: FrontendMenuDefinition[] = [];
    const userInfo = this.userPermissionsProvider();

    for (const [pluginId, instance] of this.plugins.entries()) {
      if (instance.status === 'active') {
        const pMenus = this.pluginMenus.get(pluginId) || [];
        for (const menu of pMenus) {
          const required = menu.permissions || (menu.permission ? [menu.permission] : []);
          const allowed = PermissionHelper.checkPermissions(
            { permissions: required },
            userInfo.permissions,
            userInfo.roles
          );
          if (allowed) {
            menus.push(menu);
          }
        }
      }
    }

    return menus.sort((a, b) => (a.order || 100) - (b.order || 100));
  }

  /**
   * Get all active dashboard widgets filtered by permissions
   */
  getWidgets(): FrontendWidgetDefinition[] {
    const widgets: FrontendWidgetDefinition[] = [];
    const userInfo = this.userPermissionsProvider();

    for (const [pluginId, instance] of this.plugins.entries()) {
      if (instance.status === 'active') {
        const pWidgets = this.pluginWidgets.get(pluginId) || [];
        for (const widget of pWidgets) {
          const required = widget.permissions || (widget.permission ? [widget.permission] : []);
          const allowed = PermissionHelper.checkPermissions(
            { permissions: required },
            userInfo.permissions,
            userInfo.roles
          );
          if (allowed) {
            widgets.push(widget);
          }
        }
      }
    }

    return widgets;
  }

  /**
   * Get extension points for a given slot
   */
  getExtensionPoints(slotName: string): FrontendExtensionPoint[] {
    const result: FrontendExtensionPoint[] = [];
    const userInfo = this.userPermissionsProvider();

    for (const [pluginId, instance] of this.plugins.entries()) {
      if (instance.status === 'active') {
        const pExtensions = this.pluginExtensions.get(pluginId) || [];
        for (const ext of pExtensions) {
          if (ext.slot === slotName) {
            const allowed = ext.permissions
              ? PermissionHelper.checkPermissions(
                  { permissions: ext.permissions },
                  userInfo.permissions,
                  userInfo.roles
                )
              : true;
            if (allowed) {
              result.push(ext);
            }
          }
        }
      }
    }

    return result.sort((a, b) => (a.order || 100) - (b.order || 100));
  }
}
