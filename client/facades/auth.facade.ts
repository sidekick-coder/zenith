import type AuthService from '#client/services/auth.service.ts'
import di from '#client/utils/di.ts'

const auth = di.proxy<AuthService>('auth')

export default auth
