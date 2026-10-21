import { FrontendPermissionRequirement } from './types.js';
export declare class PermissionHelper {
    static checkPermissions(requirement: FrontendPermissionRequirement, userPermissions: string[], userRoles: string[]): boolean;
    static hasPermission(permission: string, userPermissions: string[], userRoles: string[]): boolean;
    static hasAnyPermission(permissions: string[], userPermissions: string[], userRoles: string[]): boolean;
    static hasRole(role: string, userRoles: string[]): boolean;
}
//# sourceMappingURL=permissions.d.ts.map