import type { NavigationGuard } from 'vue-router'
import di from '#app/utils/di.ts'

const setupGuard: NavigationGuard = (to) => {
    const setup = di.get<any>('setup')

    if (!setup?.completed && !to.path.startsWith('/admin/setup')) {
        return '/admin/setup'
    }

    if (to.path === '/admin/setup') {
        return true
    }

    if (setup?.database && to.path === '/admin/setup/database') {
        return '/admin/setup/user'
    }
}

export default setupGuard