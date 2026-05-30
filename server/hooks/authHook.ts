import { container, PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

import emmitter from '#server/facades/emmitter.facade.ts'
import AuthService from '#server/services/auth.service.ts'
import Permission from '#server/entities/permission.entity.ts'
import UserMeta from '#server/entities/userMeta.entity.ts'
import { loadPermissions } from '#server/loaders/createPermissionLoader.ts'

export default class extends LifecycleHook {
    public order = 3

    public async onPageRequest(ctx: PageRequestContextEntity): Promise<void> {
        const { request, cookies } = ctx

        const auth = container.get<AuthService>(AuthService)

        const token = cookies.get('Authorization', '')
            || request.headers['authorization'] as string
            || ''

        if (!token) {
            return
        }

        const user = await auth.authenticate(token)

        if (!user) {
            return
        }

        await loadPermissions(user, {
            assignableType: 'user',
            assignableId: e => String(e.id),
        })

        ctx.setState('auth:user', user)

        const permissions = Permission.applyContext(user.permissions, { auth: { user: user }, })

        const metasRows = await UserMeta.list({ where: eb => eb('user_id', '=', user.id) })

        const metas = Object.fromEntries(metasRows.map(m => [m.name, m.value]))

        ctx.setState('permissions', permissions)
        ctx.setState('user:metas', metas)
        ctx.setState('preferences:dark_mode', metas['admin-ui:dark_mode'] ?? false)
    }

    public async register(): Promise<void> {
        const auth = new AuthService()

        container.set(AuthService, auth)

        emmitter.on('page:request:start', ctx => this.onPageRequest(ctx))
    }
}


