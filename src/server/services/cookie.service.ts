import type {
    Request, 
    Response,
    CookieOptions
} from 'express'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import Base from '#shared/services/cookie.service.ts'

export default class CookieService extends Base {
    private request: Request
    private response: Response

    constructor(request: Request, response: Response) {
        super({
            cookies: new Map<string, string>(Object.entries(request.cookies)),
            prefix: config.get('cookie.prefix', '')
        })

        this.request = request
        this.response = response
    }

    public set(name: string, value: string) {
        const prefix = this.prefix
        const options = config.get('cookie.options', {})

        const fullName = prefix + name

        const opts: CookieOptions = {
            httpOnly: true,
            ...options
        }

        this.response.cookie(fullName, value, opts)
        
        super.set(fullName, value, options)
    }
}
