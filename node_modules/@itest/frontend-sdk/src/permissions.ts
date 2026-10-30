import { FrontendPermissionRequirement } from './types.js';

export class PermissionHelper {
  static checkPermissions(
    requirement: FrontendPermissionRequirement,
    userPermissions: string[],
    userRoles: string[]
  ): boolean {
    if (userRoles.includes('admin') || userRoles.includes('superadmin')) {
      return true;
    }

    if (requirement.roles && requirement.roles.length > 0) {
      const hasRole = requirement.roles.some((r) => userRoles.includes(r));
      if (!hasRole) return false;
    }

    if (!requirement.permissions || requirement.permissions.length === 0) {
      return true;
    }

    const mode = requirement.matchMode || 'all';
    if (mode === 'all') {
      return requirement.permissions.every((p) => userPermissions.includes(p));
    } else {
      return requirement.permissions.some((p) => userPermissions.includes(p));
    }
  }

  static hasPermission(permission: string, userPermissions: string[], userRoles: string[]): boolean {
    if (userRoles.includes('admin') || userRoles.includes('superadmin')) {
      return true;
    }
    return userPermissions.includes(permission);
  }

  static hasAnyPermission(permissions: string[], userPermissions: string[], userRoles: string[]): boolean {
    if (userRoles.includes('admin') || userRoles.includes('superadmin')) {
      return true;
    }
    return permissions.some((p) => userPermissions.includes(p));
  }

  static hasRole(role: string, userRoles: string[]): boolean {
    return userRoles.includes(role);
  }
}
