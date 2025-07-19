import di from '#app/utils/di.ts'
import type { NavigationGuard } from 'vue-router'

const guestGuard: NavigationGuard = () => {
    const user = di.get<any>('auth:user')

    if (user) {
        return '/admin'
    }
}

export default guestGuard