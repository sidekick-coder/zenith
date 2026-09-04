import { AclEntity } from '@sidekick-coder/zenith-kit/shared'
import { container } from '@sidekick-coder/zenith-kit/client'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import config from '#client/facades/config.facade.ts'
import logger from '#client/facades/logger.facade.ts'

export default class AclLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = container.get<Record<string, any>>('state')

        let permissions: any[] = []

        if (state['permissions']) {
            permissions = state['permissions']
        }

        const acl = new AclEntity({
            permissions: permissions,
            debug: config.get('acl.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'acl' }),
        })

        container.set(AclEntity, acl)
        container.set('acl', acl)
    }
}
