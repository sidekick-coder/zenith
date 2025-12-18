import type AuthService from '#client/services/auth.service.ts'
import di from '#client/utils/di.ts'

const auth = di.proxy<AuthService>('auth')

if (import.meta.env.DEV && !import.meta.env.SSR) {
    (window as any).auth = auth
}


export default auth
