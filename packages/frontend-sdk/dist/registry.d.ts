import { FrontendPluginDefinition, FrontendPluginInstance, FrontendRouteDefinition, FrontendMenuDefinition, FrontendWidgetDefinition, FrontendExtensionPoint, FrontendEventBus, FrontendApiClient } from './types.js';
export declare class FrontendPluginRegistry {
    readonly eventBus: FrontendEventBus;
    readonly api: FrontendApiClient;
    private plugins;
    private contexts;
    private pluginRoutes;
    private pluginMenus;
    private pluginWidgets;
    private pluginExtensions;
    private userPermissionsProvider;
    constructor(eventBus?: FrontendEventBus, api?: FrontendApiClient);
    setUserPermissionsProvider(provider: () => {
        permissions: string[];
        roles: string[];
    }): void;
    internalRegisterRoute(pluginId: string, route: FrontendRouteDefinition): void;
    internalRegisterMenu(pluginId: string, menu: FrontendMenuDefinition): void;
    internalRegisterWidget(pluginId: string, widget: FrontendWidgetDefinition): void;
    internalRegisterExtension(pluginId: string, extension: FrontendExtensionPoint): void;
    /**
     * Register a new plugin definition
     */
    register(definition: FrontendPluginDefinition): Promise<void>;
    /**
     * Activate / Enable a registered plugin
     */
    enable(pluginId: string): Promise<void>;
    /**
     * Disable an active plugin
     */
    disable(pluginId: string): Promise<void>;
    /**
     * Unregister plugin completely
     */
    unregister(pluginId: string): Promise<void>;
    getPlugin(pluginId: string): FrontendPluginInstance | undefined;
    listPlugins(): FrontendPluginInstance[];
    /**
     * Get all active routes contributed by plugins
     */
    getRoutes(): FrontendRouteDefinition[];
    /**
     * Get all active menus filtered by user permissions
     */
    getMenus(): FrontendMenuDefinition[];
    /**
     * Get all active dashboard widgets filtered by permissions
     */
    getWidgets(): FrontendWidgetDefinition[];
    /**
     * Get extension points for a given slot
     */
    getExtensionPoints(slotName: string): FrontendExtensionPoint[];
}
//# sourceMappingURL=registry.d.ts.map