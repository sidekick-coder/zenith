import type { NavigationGuard } from 'vue-router'
import di from '#client/utils/di.ts'

export interface AuthGuardOptions {
    redirect: string
    exclude?: string[]
}

export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
    const exclude = options.exclude || ['/admin/auth/login']
    
    return (to) => {
        const user = di.get<any>('auth:user')

        if (!user && !exclude.includes(to.path)) {
            return options.redirect
        }
    }
}

const authGuard = createAuthGuard({ 
    redirect: '/admin/auth/login',
    exclude: ['/admin/auth/login']
})

export default authGuard