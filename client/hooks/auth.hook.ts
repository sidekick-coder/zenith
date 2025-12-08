import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import di from '#client/utils/di.ts'
import AuthService from '#client/services/auth.service.ts'
import User from '#shared/entities/user.entity.ts'

export default class AuthLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const state = di.get<Record<string, any>>('state')

        let user = null as User | null

        if (state['auth:user']) {
            user = User.from(state['auth:user'])
        }

        const auth = new AuthService({ user })

        di.set('auth', auth)
    }
}
