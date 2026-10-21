import { FrontendPluginContext, FrontendPluginManifest, FrontendRouteDefinition, FrontendMenuDefinition, FrontendWidgetDefinition, FrontendExtensionPoint, FrontendLogger, FrontendEventBus, FrontendApiClient } from './types.js';
import { FrontendPluginRegistry } from './registry.js';
export declare class DefaultPluginContext implements FrontendPluginContext {
    readonly manifest: FrontendPluginManifest;
    private readonly registry;
    readonly eventBus: FrontendEventBus;
    readonly api: FrontendApiClient;
    private readonly userPermissionsProvider;
    constructor(manifest: FrontendPluginManifest, registry: FrontendPluginRegistry, eventBus: FrontendEventBus, api: FrontendApiClient, userPermissionsProvider: () => {
        permissions: string[];
        roles: string[];
    });
    readonly logger: FrontendLogger;
    registerRoute(route: FrontendRouteDefinition): void;
    registerMenu(menu: FrontendMenuDefinition): void;
    registerWidget(widget: FrontendWidgetDefinition): void;
    registerExtension(extension: FrontendExtensionPoint): void;
    get permissions(): {
        hasPermission: (perm: string) => boolean;
        hasAnyPermission: (perms: string[]) => boolean;
        hasRole: (role: string) => boolean;
    };
}
//# sourceMappingURL=context.d.ts.map