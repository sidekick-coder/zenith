import type {
    Request, 
    Response,
    CookieOptions
} from 'express'
import Base from '#shared/services/cookie.service.ts'
import config from '#server/facades/config.facade.ts'

export default class CookieService extends Base {
    private request: Request
    private response: Response

    constructor(request: Request, response: Response) {
        super(request.cookies)

        this.request = request
        this.response = response
    }

    public set(_name: string, value: string) {
        const prefix = config.get('cookie.prefix', '')
        const options = config.get('cookie.options', {})

        const name = prefix + _name

        const opts: CookieOptions = {
            httpOnly: true,
            ...options
        }

        this.response.cookie(name, value, opts)
    }

    public get(name: string, defaultValue: string | null = null): string | null {
        const prefix = config.get('cookie.prefix', '')
        const fullName = prefix + name

        return super.get(fullName, defaultValue)
    }
}