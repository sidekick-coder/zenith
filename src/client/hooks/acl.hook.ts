import { AclEntity, Permission, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { container, config, logger } from '@sidekick-coder/zenith-kit/client'

export default class AclLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = container.get<Record<string, any>>('state')

        let permissions: Pick<Permission, 'action' | 'subject' | 'name'>[] = []

        if (state['permissions']) {
            permissions = state['permissions']
        }

        const authDisabled = config.get('auth.disabled', false)

        if (authDisabled) {
            permissions.push({
                action: 'manage',
                subject: 'all',
                name: 'Manage All',
            })
        }

        const acl = new AclEntity({
            permissions: permissions as any[],
            debug: config.get('acl.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'acl' }),
        })

        container.set(AclEntity, acl)
        container.set('acl', acl)
    }
}
