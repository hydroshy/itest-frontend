/**
 * ITEST Platform - Frontend Plugin SDK Contracts
 * Standard interfaces for Vue 3 modular plugin architecture
 */

export type ComponentType = any; // Vue Component or () => Promise<Component>

export interface FrontendPermissionRequirement {
  permissions: string[];
  matchMode?: 'all' | 'any';
  roles?: string[];
}

export interface FrontendRouteDefinition {
  name: string;
  path: string;
  component: ComponentType;
  meta?: {
    title?: string;
    icon?: string;
    requiresAuth?: boolean;
    permissions?: string[];
    roles?: string[];
    breadcrumb?: string[];
    layout?: 'default' | 'blank' | 'fullscreen';
    hidden?: boolean;
    order?: number;
    pluginId?: string;
  };
  children?: FrontendRouteDefinition[];
}

export interface FrontendMenuDefinition {
  id: string;
  parentId?: string;
  label?: string;
  title?: string; // Standard or alias for label
  icon?: string;
  route?: string; // Target route name or path
  path?: string; // Standard or alias for route
  order?: number;
  permissions?: string[];
  permission?: string;
  capabilities?: string[];
  badge?: string | number;
  pluginId?: string;
  children?: FrontendMenuDefinition[];
}

export interface FrontendWidgetDefinition {
  id: string;
  title: string;
  description?: string;
  component: ComponentType;
  category?: 'telemetry' | 'status' | 'analytics' | 'control' | 'custom';
  defaultSize?: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
  cols?: number;
  width?: string | number; // 'half' | 'third' | 'full' | number
  order?: number;
  permissions?: string[];
  permission?: string;
  configSchema?: Record<string, any>;
  pluginId?: string;
}

export interface FrontendExtensionPoint {
  id: string;
  slot: string; // e.g. 'device-detail-panel', 'top-nav-action', 'dashboard-header', 'header-right'
  component: ComponentType;
  order?: number;
  permissions?: string[];
  props?: Record<string, any>;
  pluginId?: string;
}

export interface FrontendFeatureDefinition {
  id: string; // e.g. 'final-config:tool'
  title: string;
  description?: string;
  icon?: string;
  tab?: string; // Tab identifier inside the view (e.g. 'tool')
  route?: string; // Target route with query, e.g. '/plugins/final-config?tab=tool'
  order?: number;
  permissions?: string[];
  permission?: string;
}

export interface FrontendPluginManifest {
  id: string;
  name: string;
  version: string;
  sdkVersion?: string; // Compatible SDK version range (e.g. "^1.0.0")
  description?: string;
  author?: string;
  icon?: string;
  category?: 'protocol' | 'visualization' | 'analytics' | 'tool' | 'integration' | 'general';
  routes?: FrontendRouteDefinition[];
  menus?: FrontendMenuDefinition[];
  widgets?: FrontendWidgetDefinition[];
  extensions?: FrontendExtensionPoint[];
  features?: FrontendFeatureDefinition[];
  permissions?: string[];
  dependencies?: Record<string, string>;
}

export interface FrontendLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface FrontendEventBus {
  emit<T = any>(event: string, payload?: T): void;
  on<T = any>(event: string, handler: (payload: T) => void): () => void;
  off<T = any>(event: string, handler: (payload: T) => void): void;
  once<T = any>(event: string, handler: (payload: T) => void): void;
}

export interface FrontendApiClient {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
}

export interface FrontendPluginContext {
  manifest: Readonly<FrontendPluginManifest>;
  logger: FrontendLogger;
  eventBus: FrontendEventBus;
  events?: FrontendEventBus;
  api: FrontendApiClient;
  registerRoute(route: FrontendRouteDefinition): void;
  registerMenu(menu: FrontendMenuDefinition): void;
  registerWidget(widget: FrontendWidgetDefinition): void;
  registerExtension(extension: FrontendExtensionPoint): void;
  registerFeature?(feature: FrontendFeatureDefinition): void;
  permissions: {
    hasPermission(permission: string): boolean;
    hasAnyPermission(permissions: string[]): boolean;
    hasRole(role: string): boolean;
  };
  hasPermission?(permission: string): boolean;
  hasRole?(role: string): boolean;
  canAccess?(requirement: FrontendPermissionRequirement): boolean;
}

export type FrontendPluginStatus = 'unregistered' | 'registered' | 'active' | 'error' | 'disabled';

export interface FrontendPluginLifecycle {
  setup?(context: FrontendPluginContext): Promise<void> | void;
  activate?(context: FrontendPluginContext): Promise<void> | void;
  teardown?(context?: FrontendPluginContext): Promise<void> | void;
  deactivate?(): Promise<void> | void;
}

export interface FrontendPluginDefinition extends FrontendPluginLifecycle {
  manifest: FrontendPluginManifest;
}

export interface FrontendPluginInstance {
  id: string;
  manifest: FrontendPluginManifest;
  status: FrontendPluginStatus;
  definition: FrontendPluginDefinition;
  errorMessage?: string;
  error?: Error | null;
  registeredAt?: Date;
  activatedAt?: Date;
}

