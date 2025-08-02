import type { NavigationGuard } from 'vue-router'
import di from '#app/utils/di.ts'

const setupGuard: NavigationGuard = (to) => {
    if (to.path.startsWith('/admin/setup')) {
        console.log('Setup guard triggered for path:', to.path)
        return true
    }

    const setup = di.get<any>('setup')

    if (!setup?.completed) {
        console.log('Setup not completed, redirecting to setup page')

        return '/admin/setup'
    }
}

export default setupGuard