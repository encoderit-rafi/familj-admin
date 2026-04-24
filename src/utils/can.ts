import {useCurrentUser} from "../hooks/useCurrentUser.tsx";

/**
 * Check single permission
 * usage: const can = useCan(); can('update_category')
 */
export default function useCan() {
    const currentUser = useCurrentUser();
    const permissions = currentUser?.permissions || {};

    return (permissionKey: string) => !!permissions[permissionKey];
}

/**
 * Check if user has *any* of the given permissions
 * usage: const canAny = useCanAny(); canAny(['read_Post', 'update_Post'])
 */
export function useCanAny() {
    const currentUser = useCurrentUser();
    const permissions = currentUser?.permissions || {};

    return (keys: string[]) => keys.some((key) => !!permissions[key]);
}

/**
 * Group permissions by module
 * usage: const { canCreate, canUpdate } = useCanModule('category')
 */
export function useCanModule(module: string) {
    const currentUser = useCurrentUser();
    const permissions = currentUser?.permissions || {};

    const prefix = module.toLowerCase();

    return {
        canCreate: !!permissions[`${prefix}_create`],
        canRead: !!permissions[`${prefix}_read`],
        canUpdate: !!permissions[`${prefix}_update`],
        canDelete: !!permissions[`${prefix}_delete`],
    };
}

export function useHasRole(role: string) {
    const currentUser = useCurrentUser();
    const roles = currentUser?.roles || [];

    return roles.includes(role);
}