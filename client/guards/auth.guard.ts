import type { NavigationGuard } from 'vue-router'
import auth from '#client/facades/auth.facade.ts'

export interface AuthGuardOptions {
    redirect: string
    exclude?: string[]
}

export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
    const exclude = options.exclude || ['/admin/auth/login', '/admin/auth/register']
    
    return (to) => {
        if (!auth.user && !exclude.includes(to.path)) {
            return options.redirect
        }
    }
}

const authGuard = createAuthGuard({ 
    redirect: '/admin/auth/login',
})

export default authGuard