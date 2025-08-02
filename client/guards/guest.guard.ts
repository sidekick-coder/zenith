import type { NavigationGuard } from 'vue-router'
import di from '#client/utils/di.ts'

const guestGuard: NavigationGuard = () => {
    const user = di.get<any>('auth:user')

    if (user) {
        return '/admin'
    }
}

export default guestGuard