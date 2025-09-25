import type {
    Request, 
    Response 
} from 'express'
import BaseCookieService from '#shared/services/cookie.service'

export default class CookieService extends BaseCookieService {
    private cookies: Record<string, string> = {}
    public request: Request
    private response: Response

    constructor(request: Request, response: Response) {
        super(request.cookies)

        this.request = request
        this.response = response
    }

    public set(_name: string, _value: string) {
        const opts: CookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            ...options
        }

        this.response.cookie(_name, _value, opts)
    }
}