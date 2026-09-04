import { container } from '@sidekick-coder/zenith-kit/server'
import ExpressService from '#server/services/express.service.ts'

const http = container.proxy<ExpressService>(ExpressService)

export default http
