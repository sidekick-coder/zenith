import { container } from '@sidekick-coder/zenith-kit/client'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import AuthService from '#client/services/auth.service.ts'
import User from '#shared/entities/user.entity.ts'

export default class AuthLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = container.get<Record<string, any>>('state')

        let user = null as User | null

        if (state['auth:user']) {
            user = User.from(state['auth:user'])
        }

        const auth = new AuthService({ user })

        container.set(AuthService, auth)
    }
}
