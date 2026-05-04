import container from './di.facade.ts'
import AuthService from '#server/services/auth.service.ts'

const auth = container.proxy<AuthService>(AuthService)

export default auth
