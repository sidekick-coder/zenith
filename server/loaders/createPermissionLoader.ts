import { loadHasManyThrough } from '@sidekick-coder/zenith-kit/server'
import type { Permission, PermissionAssignment } from '@sidekick-coder/zenith-kit/shared'
import { defineLoader } from './defineLoader.ts'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'

interface PermissionLoaderOptions {
    idKey?: string
    targetKey?: string
    assignType?: string
}

export async function loadPermissions<T extends Record<string, any>>(entities: T[], options?: PermissionLoaderOptions) {
    return loadHasManyThrough<
        T,
        PermissionAssignment,
        Permission
    >(entities, {
        key: 'permissions',
        pivot: {
            sourceKey: (e: any) => String(e[options?.idKey || 'id']),
            targetKey: 'assignable_id',
            findEntities: async (id) => permissionAssignmentRepository.findMany({
                assignableId: id,
                assignableType: options?.assignType
            }),
        },
        target: {
            sourceKey: 'permission_id',
            targetKey: 'id',
            findEntities: async (id) => permissionRepository.findMany({ id }),
        },
    })
}

export function createPermissionLoader<T extends Record<string, any>>(options?: PermissionLoaderOptions) {
    return defineLoader<T>({ load: (entities) => loadPermissions(entities, options), })
}
