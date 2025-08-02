import type { NavigationGuard } from 'vue-router'
import di from '#client/utils/di.ts'

const setupGuard: NavigationGuard = (to) => {
    const setup = di.get<any>('setup')

    const completed = setup?.database && setup?.user

    if (completed && to.path.startsWith('/admin/setup')) {
        return '/'
    }

    if (completed) {
        return true
    }

    if (!to.path.startsWith('/admin/setup')) {
        return '/admin/setup'
    }

    if (to.path === '/admin/setup') {
        return true
    }

    if (!setup?.database && to.path !== '/admin/setup/database') {
        return '/admin/setup/database'
    }
    
    if (!setup?.user && to.path !== '/admin/setup/user') {
        return '/admin/setup/user'
    }
}

export default setupGuard