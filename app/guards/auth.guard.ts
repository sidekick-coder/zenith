import type { NavigationGuard } from 'vue-router'
import di from '#app/utils/di.ts'

const authGuard: NavigationGuard = (to) => {
    const exclude = ['/admin/auth/login']
    const user = di.get<any>('auth:user')

    if (!user && !exclude.includes(to.path)) {
        return '/admin/auth/login'
    }
}

export default authGuard