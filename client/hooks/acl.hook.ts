import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import di from '#client/utils/di.ts'
import Acl from '#shared/entities/acl.entity.ts'

export default class AclLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const permissions = di.get<any[]>('permissions', [])

        const acl = new Acl(permissions)

        di.set('acl', acl)
    }
}
