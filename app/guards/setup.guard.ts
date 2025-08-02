import type { NavigationGuard } from 'vue-router'
import di from '#app/utils/di.ts'

const setupGuard: NavigationGuard = (to) => {
    if (to.path.startsWith('/admin/setup')) {
        return true
    }

    const setup = di.get<any>('setup')

    if (!setup?.completed) {
        return '/admin/setup'
    }
}

export default setupGuard