import { container, AuthService } from '@sidekick-coder/zenith-kit/client'
import { UserEntity, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

export default class AuthLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = container.get<Record<string, any>>('state')

        let user = null as UserEntity | null

        if (state['auth:user']) {
            user = UserEntity.from(state['auth:user'])
        }

        const auth = new AuthService({ user })

        container.set(AuthService, auth)
    }
}
