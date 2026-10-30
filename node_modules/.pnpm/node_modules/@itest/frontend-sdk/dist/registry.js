import { DefaultPluginContext } from './context.js';
import { SimpleEventBus } from './events.js';
import { PermissionHelper } from './permissions.js';
export class FrontendPluginRegistry {
    eventBus;
    api;
    plugins = new Map();
    contexts = new Map();
    // Registered artifacts mapped by pluginId
    pluginRoutes = new Map();
    pluginMenus = new Map();
    pluginWidgets = new Map();
    pluginExtensions = new Map();
    userPermissionsProvider = () => ({
        permissions: [],
        roles: [],
    });
    constructor(eventBus = new SimpleEventBus(), api = {
        get: async () => ({}),
        post: async () => ({}),
        put: async () => ({}),
        delete: async () => ({}),
        patch: async () => ({}),
    }) {
        this.eventBus = eventBus;
        this.api = api;
    }
    setUserPermissionsProvider(provider) {
        this.userPermissionsProvider = provider;
    }
    // Internal calls from DefaultPluginContext
    internalRegisterRoute(pluginId, route) {
        const list = this.pluginRoutes.get(pluginId) || [];
        list.push(route);
        this.pluginRoutes.set(pluginId, list);
    }
    internalRegisterMenu(pluginId, menu) {
        const list = this.pluginMenus.get(pluginId) || [];
        list.push(menu);
        this.pluginMenus.set(pluginId, list);
    }
    internalRegisterWidget(pluginId, widget) {
        const list = this.pluginWidgets.get(pluginId) || [];
        list.push(widget);
        this.pluginWidgets.set(pluginId, list);
    }
    internalRegisterExtension(pluginId, extension) {
        const list = this.pluginExtensions.get(pluginId) || [];
        list.push(extension);
        this.pluginExtensions.set(pluginId, list);
    }
    /**
     * Register a new plugin definition
     */
    async register(definition) {
        const { manifest } = definition;
        if (this.plugins.has(manifest.id)) {
            console.warn(`[PluginRegistry] Plugin "${manifest.id}" is already registered. Updating definition.`);
        }
        const instance = {
            id: manifest.id,
            manifest,
            definition,
            status: 'registered',
            registeredAt: new Date(),
        };
        this.plugins.set(manifest.id, instance);
        const context = new DefaultPluginContext(manifest, this, this.eventBus, this.api, this.userPermissionsProvider);
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
    async enable(pluginId) {
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
        }
        catch (err) {
            instance.status = 'error';
            instance.error = err?.message || String(err);
            console.error(`[PluginRegistry] Failed to enable plugin "${pluginId}":`, err);
            throw err;
        }
    }
    /**
     * Disable an active plugin
     */
    async disable(pluginId) {
        const instance = this.plugins.get(pluginId);
        if (!instance || instance.status !== 'active') {
            return;
        }
        const context = this.contexts.get(pluginId);
        if (context && instance.definition.teardown) {
            try {
                await instance.definition.teardown(context);
            }
            catch (err) {
                console.error(`[PluginRegistry] Teardown error for "${pluginId}":`, err);
            }
        }
        instance.status = 'disabled';
        this.eventBus.emit('plugin:disabled', { pluginId });
    }
    /**
     * Unregister plugin completely
     */
    async unregister(pluginId) {
        await this.disable(pluginId);
        this.plugins.delete(pluginId);
        this.contexts.delete(pluginId);
        this.pluginRoutes.delete(pluginId);
        this.pluginMenus.delete(pluginId);
        this.pluginWidgets.delete(pluginId);
        this.pluginExtensions.delete(pluginId);
        this.eventBus.emit('plugin:unregistered', { pluginId });
    }
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    listPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get all active routes contributed by plugins
     */
    getRoutes() {
        const routes = [];
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
    getMenus() {
        const menus = [];
        const userInfo = this.userPermissionsProvider();
        for (const [pluginId, instance] of this.plugins.entries()) {
            if (instance.status === 'active') {
                const pMenus = this.pluginMenus.get(pluginId) || [];
                for (const menu of pMenus) {
                    const required = menu.permissions || (menu.permission ? [menu.permission] : []);
                    const allowed = PermissionHelper.checkPermissions({ permissions: required }, userInfo.permissions, userInfo.roles);
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
    getWidgets() {
        const widgets = [];
        const userInfo = this.userPermissionsProvider();
        for (const [pluginId, instance] of this.plugins.entries()) {
            if (instance.status === 'active') {
                const pWidgets = this.pluginWidgets.get(pluginId) || [];
                for (const widget of pWidgets) {
                    const required = widget.permissions || (widget.permission ? [widget.permission] : []);
                    const allowed = PermissionHelper.checkPermissions({ permissions: required }, userInfo.permissions, userInfo.roles);
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
    getExtensionPoints(slotName) {
        const result = [];
        const userInfo = this.userPermissionsProvider();
        for (const [pluginId, instance] of this.plugins.entries()) {
            if (instance.status === 'active') {
                const pExtensions = this.pluginExtensions.get(pluginId) || [];
                for (const ext of pExtensions) {
                    if (ext.slot === slotName) {
                        const allowed = ext.permissions
                            ? PermissionHelper.checkPermissions({ permissions: ext.permissions }, userInfo.permissions, userInfo.roles)
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
//# sourceMappingURL=registry.js.map