import di from './di.facade.ts'
import AuthService from '#server/services/auth.service.ts'

di.set(AuthService, new AuthService())

const auth = di.proxy<AuthService>(AuthService)

export default auth
