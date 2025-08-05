import type { NavigationGuard } from 'vue-router'
import di from '#client/utils/di.ts'

const authGuard: NavigationGuard = (to) => {
    const exclude = ['/auth/login']
    const user = di.get<any>('auth:user')

    if (!user && !exclude.includes(to.path)) {
        return '/auth/login'
    }
}

export default authGuard