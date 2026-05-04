import { container, PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

import emmitter from '#server/facades/emmitter.facade.ts'
import AuthService from '#server/services/auth.service.ts'
import Permission from '#server/entities/permission.entity.ts'

export default class extends LifecycleHook {
    public order = 3

    public async onPageRequest({ cookies, state, request }: PageRequestContextEntity): Promise<void> {
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

        state.set('auth:user', user)

        const permissions = Permission.applyContext(user.permissions, { auth: { user: user }, })
        const metas = await user.$metas.all()

        state.set('permissions', permissions)
        state.set('user:metas', metas)
        state.set('preferences:dark_mode', metas['admin-ui:dark_mode'] ?? false)

    }

    public async register(): Promise<void> {
        const auth = new AuthService()

        container.set(AuthService, auth)

        emmitter.on('page:request:start', ctx => this.onPageRequest(ctx))
    }
}


