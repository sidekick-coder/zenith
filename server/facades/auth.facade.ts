import di from './di.facade.ts'
import AuthService from '#server/services/auth.service.ts'

di.set(AuthService.DI_KEY, new AuthService())

const auth = di.proxy<AuthService>(AuthService.DI_KEY)

export default auth
