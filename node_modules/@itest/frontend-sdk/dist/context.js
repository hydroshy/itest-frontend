import { PermissionHelper } from './permissions.js';
export class DefaultPluginContext {
    manifest;
    registry;
    eventBus;
    api;
    userPermissionsProvider;
    constructor(manifest, registry, eventBus, api, userPermissionsProvider) {
        this.manifest = manifest;
        this.registry = registry;
        this.eventBus = eventBus;
        this.api = api;
        this.userPermissionsProvider = userPermissionsProvider;
    }
    logger = {
        debug: (msg, ...args) => console.debug(`[Plugin:${this.manifest.id}]`, msg, ...args),
        info: (msg, ...args) => console.info(`[Plugin:${this.manifest.id}]`, msg, ...args),
        warn: (msg, ...args) => console.warn(`[Plugin:${this.manifest.id}]`, msg, ...args),
        error: (msg, ...args) => console.error(`[Plugin:${this.manifest.id}]`, msg, ...args),
    };
    registerRoute(route) {
        const enriched = {
            ...route,
            meta: {
                ...route.meta,
                pluginId: this.manifest.id,
            },
        };
        this.registry.internalRegisterRoute(this.manifest.id, enriched);
    }
    registerMenu(menu) {
        const enriched = {
            ...menu,
            pluginId: this.manifest.id,
        };
        this.registry.internalRegisterMenu(this.manifest.id, enriched);
    }
    registerWidget(widget) {
        const enriched = {
            ...widget,
            pluginId: this.manifest.id,
        };
        this.registry.internalRegisterWidget(this.manifest.id, enriched);
    }
    registerExtension(extension) {
        const enriched = {
            ...extension,
            pluginId: this.manifest.id,
        };
        this.registry.internalRegisterExtension(this.manifest.id, enriched);
    }
    get permissions() {
        return {
            hasPermission: (perm) => {
                const u = this.userPermissionsProvider();
                return PermissionHelper.hasPermission(perm, u.permissions, u.roles);
            },
            hasAnyPermission: (perms) => {
                const u = this.userPermissionsProvider();
                return PermissionHelper.hasAnyPermission(perms, u.permissions, u.roles);
            },
            hasRole: (role) => {
                const u = this.userPermissionsProvider();
                return PermissionHelper.hasRole(role, u.roles);
            },
        };
    }
}
//# sourceMappingURL=context.js.map