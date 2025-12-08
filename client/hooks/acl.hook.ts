import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import di from '#client/utils/di.ts'
import Acl from '#shared/entities/acl.entity.ts'
import config from '#client/facades/config.facade.ts'
import logger from '#client/facades/logger.facade.ts'

export default class AclLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = di.get<Record<string, any>>('state')
        let permissions: any[] = []

        if (state['permissions']) {
            permissions = state['permissions']
        }

        const acl = new Acl({
            permissions: permissions,
            debug: config.get('acl.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'acl' }),
        })

        di.set('acl', acl)
    }
}
