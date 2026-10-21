import {
  FrontendPluginContext,
  FrontendPluginManifest,
  FrontendRouteDefinition,
  FrontendMenuDefinition,
  FrontendWidgetDefinition,
  FrontendExtensionPoint,
  FrontendLogger,
  FrontendEventBus,
  FrontendApiClient,
} from './types.js';
import { FrontendPluginRegistry } from './registry.js';
import { PermissionHelper } from './permissions.js';

export class DefaultPluginContext implements FrontendPluginContext {
  constructor(
    public readonly manifest: FrontendPluginManifest,
    private readonly registry: FrontendPluginRegistry,
    public readonly eventBus: FrontendEventBus,
    public readonly api: FrontendApiClient,
    private readonly userPermissionsProvider: () => { permissions: string[]; roles: string[] }
  ) {}

  public readonly logger: FrontendLogger = {
    debug: (msg, ...args) => console.debug(`[Plugin:${this.manifest.id}]`, msg, ...args),
    info: (msg, ...args) => console.info(`[Plugin:${this.manifest.id}]`, msg, ...args),
    warn: (msg, ...args) => console.warn(`[Plugin:${this.manifest.id}]`, msg, ...args),
    error: (msg, ...args) => console.error(`[Plugin:${this.manifest.id}]`, msg, ...args),
  };

  registerRoute(route: FrontendRouteDefinition): void {
    const enriched: FrontendRouteDefinition = {
      ...route,
      meta: {
        ...route.meta,
        pluginId: this.manifest.id,
      },
    };
    this.registry.internalRegisterRoute(this.manifest.id, enriched);
  }

  registerMenu(menu: FrontendMenuDefinition): void {
    const enriched: FrontendMenuDefinition = {
      ...menu,
      pluginId: this.manifest.id,
    };
    this.registry.internalRegisterMenu(this.manifest.id, enriched);
  }

  registerWidget(widget: FrontendWidgetDefinition): void {
    const enriched: FrontendWidgetDefinition = {
      ...widget,
      pluginId: this.manifest.id,
    };
    this.registry.internalRegisterWidget(this.manifest.id, enriched);
  }

  registerExtension(extension: FrontendExtensionPoint): void {
    const enriched: FrontendExtensionPoint = {
      ...extension,
      pluginId: this.manifest.id,
    };
    this.registry.internalRegisterExtension(this.manifest.id, enriched);
  }

  get permissions() {
    return {
      hasPermission: (perm: string) => {
        const u = this.userPermissionsProvider();
        return PermissionHelper.hasPermission(perm, u.permissions, u.roles);
      },
      hasAnyPermission: (perms: string[]) => {
        const u = this.userPermissionsProvider();
        return PermissionHelper.hasAnyPermission(perms, u.permissions, u.roles);
      },
      hasRole: (role: string) => {
        const u = this.userPermissionsProvider();
        return PermissionHelper.hasRole(role, u.roles);
      },
    };
  }
}
